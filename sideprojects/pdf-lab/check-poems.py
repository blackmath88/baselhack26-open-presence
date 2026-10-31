#!/usr/bin/env python3
"""Focused A01 observations; uses the cabinet's bounded child-process policy."""
import hashlib
import json
from pathlib import Path
import resource
import subprocess
import sys
import tempfile
import zlib
import fitz
from PIL import Image
from pypdf import PdfReader
import poems
from build import shell

ROOT = Path(__file__).resolve().parent
OUT = ROOT/'output/pdf'
E = ROOT/'evidence'

def limits():
    for key, value in [(resource.RLIMIT_AS, 768*1024**2), (resource.RLIMIT_CPU, 8), (resource.RLIMIT_FSIZE, 4*1024**2)]:
        resource.setrlimit(key, (value, value))

def run(cmd):
    with tempfile.TemporaryFile() as out, tempfile.TemporaryFile() as err:
        p = subprocess.run(cmd, stdout=out, stderr=err, timeout=10, preexec_fn=limits)
        out.seek(0); err.seek(0)
        result = {'command': cmd, 'exit_code': p.returncode, 'stdout': out.read(4*1024**2).decode(errors='replace'), 'stderr': err.read(4*1024**2).decode(errors='replace')}
        assert p.returncode == 0, result
        return result

def sha(data): return hashlib.sha256(data).hexdigest()
def normalized(s): return ' '.join(s.split())

def worker(path, png):
    doc = fitz.open(path)
    pix = doc[0].get_pixmap()
    pix.save(png)
    print(json.dumps({'text': doc[0].get_text(), 'pixels_sha256': sha(pix.samples), 'width':pix.width, 'height':pix.height}))

if len(sys.argv) > 1 and sys.argv[1] == '--worker':
    limits(); worker(*sys.argv[2:]); sys.exit()
if len(sys.argv) > 1 and sys.argv[1] == '--poppler':
    print(json.dumps(run(['pdftotext', sys.argv[2], '-']))); sys.exit()

poems.write()
first = poems.generate()
assert first == poems.generate(), 'nondeterministic recipe'
# Assert that every object other than ToUnicode is byte-identical.
a = PdfReader(OUT/'01-poem-visible.pdf'); b = PdfReader(OUT/'01-poem-other.pdf')
font = a.pages[0]['/Resources']['/Font']['/G'].get_object()
assert font['/Subtype'] == '/Type3' and len(font['/CharProcs']) == 4
cmap_id = font.raw_get('/ToUnicode').idnum
import re
objects = [re.findall(rb'(?m)^(\d+) 0 obj\n(.*?)\nendobj', data, re.S) for data in (first['01-poem-visible.pdf'], first['01-poem-other.pdf'])]
assert len(objects[0]) == len(objects[1]) == a.trailer['/Size'] - 1
for (number, left), (other_number, right) in zip(*objects):
    assert number == other_number
    if int(number) != cmap_id:
        assert left == right, f'object {number!r} changed'

runs = {}
with tempfile.TemporaryDirectory() as tmp:
    tmp = Path(tmp)
    for name in ('visible', 'other', 'direct'):
        pdf = OUT/f'01-poem-{name}.pdf'
        mupdf = run([sys.executable, str(Path(__file__).resolve()), '--worker', str(pdf), str(tmp/f'{name}.png')])
        mupdf['observation'] = json.loads(mupdf['stdout'])
        poppler = run(['pdftotext', '-layout', str(pdf), '-'])
        render = run(['pdftoppm', '-r', '72', '-singlefile', str(pdf), str(tmp/name)])
        render['pixels_sha256'] = sha((tmp/f'{name}.ppm').read_bytes())
        expected = poems.OTHER if name == 'other' else poems.VISIBLE
        for line in expected:
            assert normalized(line) in normalized(mupdf['observation']['text']), (name, mupdf)
            assert normalized(line) in normalized(poppler['stdout']), (name, poppler)
        if name == 'other':
            assert poems.VISIBLE[0] not in mupdf['observation']['text']
            assert poems.VISIBLE[0] not in poppler['stdout']
        runs[name] = {'sha256':sha(pdf.read_bytes()), 'mupdf':mupdf, 'poppler':poppler, 'poppler_render':render}
        Image.open(tmp/f'{name}.png').save(E/'previews'/f'01-poem-{name}.webp', lossless=True)
    for engine, key in [('mupdf', 'observation'), ('poppler_render', None)]:
        hashes = [runs[n][engine][key]['pixels_sha256'] if key else runs[n][engine]['pixels_sha256'] for n in ('visible', 'other')]
        assert len(set(hashes)) == 1, (engine, hashes)
    # Raster-only control, built from the measured MuPDF rendering. No font/text objects.
    im = Image.open(tmp/'visible.png').convert('RGB')
    p = shell()
    # Existing ASCII PDF writer: ASCIIHexDecode wraps Flate-compressed RGB samples.
    image = p.stream(zlib.compress(im.tobytes()).hex()+'>', f'/Type /XObject /Subtype /Image /Width {im.width} /Height {im.height} /ColorSpace /DeviceRGB /BitsPerComponent 8 /Filter [/ASCIIHexDecode /FlateDecode]')
    content = p.stream('q 612 0 0 792 0 0 cm /I Do Q')
    p.objects[0] = '<< /Type /Catalog /Pages 2 0 R >>'
    p.objects[2] = f'<< /Type /Page /Parent 2 0 R /MediaBox [0 0 612 792] /Resources << /XObject << /I {image} 0 R >> >> /Contents {content} 0 R >>'
    raster = OUT/'01-poem-raster.pdf'; raster.write_bytes(p.finish())
    m = run([sys.executable, str(Path(__file__).resolve()), '--worker', str(raster), str(tmp/'raster.png')])
    pop = run(['pdftotext', str(raster), '-'])
    assert not json.loads(m['stdout'])['text'].strip() and not pop['stdout'].strip()
    assert json.loads(m['stdout'])['pixels_sha256'] == runs['visible']['mupdf']['observation']['pixels_sha256']
    runs['raster'] = {'sha256':sha(raster.read_bytes()), 'mupdf':m, 'poppler':pop}

result = {'versions': {'python':sys.version.split()[0], 'pymupdf':fitz.VersionBind, 'mupdf':fitz.VersionFitz, 'poppler':run(['pdftotext','-v'])['stderr'].splitlines()[0]},
    'limits': {'wall_seconds':10,'cpu_seconds':8,'memory_MiB':768,'output_MiB':4},
    'checks': {'deterministic':True,'only_mapping_object_changes':True,'same_pixels_within_both_engines':True,'both_poems_extracted_in_both_engines':True,'direct_drawing_pixel_identity':{engine:runs['visible'][engine]['observation']['pixels_sha256']==runs['direct'][engine]['observation']['pixels_sha256'] if engine=='mupdf' else runs['visible'][engine]['pixels_sha256']==runs['direct'][engine]['pixels_sha256'] for engine in ('mupdf','poppler_render')},'raster_empty_extraction':True,'raster_mupdf_pixel_identity':True},
    'not_run':['native viewer copy/paste','OCR','print/rewrite survival','browser end-to-end interaction (separate test-poems-browser.js evidence)'], 'runs':runs}
manifest = [{'file':f'01-poem-{name}.pdf','sha256':row['sha256'],'bytes':(OUT/f'01-poem-{name}.pdf').stat().st_size} for name,row in runs.items()]
(OUT/'poems-manifest.json').write_text(json.dumps(manifest,indent=2)+'\n')
base_manifest = json.loads((OUT/'manifest.json').read_text())
base_manifest = [row for row in base_manifest if row['file'] not in {r['file'] for r in manifest}]
(OUT/'manifest.json').write_text(json.dumps(base_manifest+manifest,indent=2)+'\n')
(E/'poems-results.json').write_text(json.dumps(result, indent=2)+'\n')
print('A01: mapping-only difference; two-engine pixel identity and paired extraction passed; raster extraction empty.')
