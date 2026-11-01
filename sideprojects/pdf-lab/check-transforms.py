#!/usr/bin/env python3
"""A01 transformation notebook: inspect existing owned poems, clone, rewrite, compare.

No source fixture rebuild. The four derived PDFs live outside the cabinet manifest.
Run from the existing check environment: python3 check-transforms.py
"""
from pathlib import Path
import hashlib
import json
import os
import resource
import subprocess
import sys
import tempfile
import fitz
from PIL import Image, ImageChops
from pypdf import PdfReader, PdfWriter
import pypdf
from poems import VISIBLE, OTHER

ROOT = Path(__file__).resolve().parent
CHECKPOINT = os.environ.get('PDF_LAB_CHECKPOINT')
E = ROOT/'evidence'
OUT = ROOT/'output/transforms'
PREVIEWS = E/'previews'

def checkpoint():
    from datetime import datetime
    from zoneinfo import ZoneInfo
    now = datetime.now(ZoneInfo('Europe/Zurich'))
    if CHECKPOINT and (Path(CHECKPOINT).exists() or (now.date().isoformat() == '2026-10-31' and now.time().isoformat() >= '22:45')):
        raise SystemExit('Checkpoint: no new transformation work opened.')

def limits():
    for key, value in [(resource.RLIMIT_AS, 768*1024**2), (resource.RLIMIT_CPU, 8), (resource.RLIMIT_FSIZE, 4*1024**2)]:
        resource.setrlimit(key, (value, value))

def run(cmd):
    with tempfile.TemporaryFile() as stdout, tempfile.TemporaryFile() as stderr:
        try:
            p = subprocess.run(cmd, stdout=stdout, stderr=stderr, timeout=10, preexec_fn=limits,
                               env={**os.environ, 'SOURCE_DATE_EPOCH':'1793473800'})
            state = 'accepted' if p.returncode == 0 else 'error'
            code = p.returncode
        except subprocess.TimeoutExpired:
            state, code = 'timeout', None
        stdout.seek(0); stderr.seek(0)
        result = {'command':cmd, 'state':state, 'exit_code':code,
                  'stdout':stdout.read(4*1024**2).decode(errors='replace'),
                  'stderr':stderr.read(4*1024**2).decode(errors='replace')}
        assert state == 'accepted', result
        return result

def sha(data): return hashlib.sha256(data).hexdigest()
def describe(text):
    # Keep exact raw text elsewhere. These booleans test full lines, not reading order.
    clean = ' '.join(text.split())
    return {'visible_lines':sum(line in clean for line in VISIBLE),
            'other_lines':sum(line in clean for line in OTHER),
            'empty':not text.strip()}

def structure(path):
    reader = PdfReader(path)
    page = reader.pages[0]
    fonts = []
    for key, ref in page.get('/Resources', {}).get('/Font', {}).items():
        f = ref.get_object()
        info = {'key':key, 'subtype':str(f.get('/Subtype')), 'has_tounicode':'/ToUnicode' in f,
                'glyph_count':len(f.get('/CharProcs', {}))}
        if '/ToUnicode' in f:
            mapping = f['/ToUnicode'].get_object().get_data()
            assert len(mapping) < 8192
            info['tounicode_sha256'] = sha(mapping)
            info['tounicode_stream'] = mapping.decode('ascii')
        fonts.append(info)
    return {'pages':len(reader.pages), 'fonts':fonts, 'has_annotations':bool(page.get('/Annots')),
            'has_open_action':'/OpenAction' in reader.trailer['/Root']}

def worker(path, png):
    d = fitz.open(path); pix = d[0].get_pixmap()
    pix.save(png)
    print(json.dumps({'text':d[0].get_text(), 'pixels_sha256':sha(pix.samples),
                      'width':pix.width,'height':pix.height,'repaired':d.is_repaired}))

def clone(source, output):
    writer = PdfWriter(clone_from=source)
    writer.write(output)

if __name__ == '__main__' and len(sys.argv) > 1:
    limits()
    if sys.argv[1] == '--worker': worker(*sys.argv[2:])
    elif sys.argv[1] == '--clone': clone(*sys.argv[2:])
    else: raise SystemExit('Unknown worker mode')
    sys.exit()


def main():
    checkpoint()
    OUT.mkdir(exist_ok=True)
    before = {p.name:sha(p.read_bytes()) for p in (ROOT/'output/pdf').glob('*.pdf')}
    versions = {'python':sys.version.split()[0], 'pypdf':pypdf.__version__,
                'pymupdf':fitz.VersionBind, 'mupdf':fitz.VersionFitz,
                'poppler':run(['pdftotext','-v'])['stderr'].splitlines()[0],
                'ghostscript':run(['gs','--version'])['stdout'].strip()}
    rows = []
    worker_script = str(Path(__file__).resolve())
    with tempfile.TemporaryDirectory() as temp:
        temp = Path(temp)
        for reading in ('visible', 'other'):
            source = ROOT/f'output/pdf/01-poem-{reading}.pdf'
            for operation in ('source', 'clone', 'rewrite', 'raster'):
                checkpoint()
                result = {'reading':reading,'operation':operation, 'parent_file':str(source.relative_to(ROOT)),
                          'parent_sha256':sha(source.read_bytes()), 'recipe_runs':[]}
                if operation == 'source':
                    path = source
                elif operation == 'raster':
                    # Same pixel source for both original readings, proven in the A01 runs.
                    path = ROOT/'output/pdf/01-poem-raster.pdf'
                    result['recipe_note'] = 'Reused existing A01 MuPDF 72 dpi RGB raster control; no OCR.'
                else:
                    path = OUT/f'poem-{reading}-{operation}.pdf'
                    def command(output):
                        if operation == 'clone':
                            return [sys.executable, worker_script,'--clone',str(source),str(output)]
                        return ['gs','-q','-dSAFER','-dBATCH','-dNOPAUSE','-sDEVICE=pdfwrite',
                                '-dCompatibilityLevel=1.7','-dAutoRotatePages=/None',
                                '-dOmitInfoDate=true','-dOmitID=true',f'-sOutputFile={output}',str(source)]
                    result['recipe_runs'].append(run(command(path)))
                    checkpoint()
                    repeat = temp/'repeat.pdf'
                    result['recipe_runs'].append(run(command(repeat)))
                    result['deterministic_in_run'] = path.read_bytes() == repeat.read_bytes()
                assert path.stat().st_size <= 2*1024**2
                result.update({'file':str(path.relative_to(ROOT)), 'sha256':sha(path.read_bytes()),
                               'bytes':path.stat().st_size, 'structure':structure(path)})
                tag = f'01-poem-{reading}-{operation}'
                m = run([sys.executable,worker_script,'--worker',str(path),str(temp/'mupdf.png')])
                m['observation'] = json.loads(m['stdout']); m['reading'] = describe(m['observation']['text'])
                p = run(['pdftotext','-layout',str(path),'-']); p['reading'] = describe(p['stdout'])
                pr = run(['pdftoppm','-r','72','-singlefile',str(path),str(temp/'poppler')])
                images = {'mupdf':Image.open(temp/'mupdf.png').convert('RGB'),
                          'poppler':Image.open(temp/'poppler.ppm').convert('RGB')}
                comparisons = {}
                for engine, image in images.items():
                    checkpoint()
                    image.save(PREVIEWS/f'{tag}-{engine}.webp',lossless=True)
                    base_key = (reading,engine)
                    if operation == 'source':
                        baseline[base_key] = image.copy()
                    base = baseline[base_key]
                    if base.size != image.size:
                        comparisons[engine] = {'same_dimensions':False}
                        continue
                    diff = ImageChops.difference(base,image)
                    # Pixel mask measures RGB sample change, with no perceptual tolerance.
                    changed = sum(any(pixel) for pixel in diff.get_flattened_data())
                    absolute = sum(sum(pixel) for pixel in diff.get_flattened_data())
                    comparisons[engine] = {'same_dimensions':True,'changed_pixels':changed,
                        'total_pixels':image.width*image.height,'mean_absolute_channel_error':absolute/(image.width*image.height*3),
                        'pixels_sha256':sha(image.tobytes()),'source_pixels_sha256':sha(base.tobytes())}
                    # Don't lose single-channel 1-unit changes to RGB->L rounding.
                    bands = [band.point(lambda value:255 if value else 0) for band in diff.split()]
                    mask = ImageChops.lighter(ImageChops.lighter(bands[0],bands[1]),bands[2])
                    heat = Image.new('RGB',image.size,'white'); heat.paste((220,30,85),(0,0,image.width,image.height),mask)
                    checkpoint()
                    heat.save(PREVIEWS/f'{tag}-{engine}-difference.webp',lossless=True)
                result['engines'] = {'mupdf':m,'poppler':p}
                result['poppler_render'] = pr
                result['render_comparison'] = comparisons
                result['preview_prefix'] = f'evidence/previews/{tag}'
                rows.append(result)
    assert before == {p.name:sha(p.read_bytes()) for p in (ROOT/'output/pdf').glob('*.pdf')}, 'Source cabinet modified'
    checkpoint()
    results = {'kind':'local-transformation-observations','date':'2026-10-31','versions':versions,
               'limits':{'wall_seconds':10,'cpu_seconds':8,'memory_MiB':768,'output_MiB':4},
               'settings':{'raster_dpi':72,'SOURCE_DATE_EPOCH':'1793473800','difference':'any RGB channel differs; no tolerance'},
               'checks':{'all_27_source_artifacts_preserved':True},
               'pair_output_byte_identity':{operation:(ROOT/next(r['file'] for r in rows if r['operation']==operation and r['reading']=='visible')).read_bytes()==(ROOT/next(r['file'] for r in rows if r['operation']==operation and r['reading']=='other')).read_bytes() for operation in ('source','clone','rewrite','raster')},
               'not_run':['native viewer copy/paste','physical printing','OCR','other rewrite tools/settings'], 'rows':rows}
    (E/'poems-transforms.json').write_text(json.dumps(results,indent=2)+'\n')
    checkpoint()
    (OUT/'manifest.json').write_text(json.dumps([{'file':r['file'],'parent_sha256':r['parent_sha256'],
        'sha256':r['sha256'],'bytes':r['bytes'],'operation':r['operation']} for r in rows if r['operation'] in ('clone','rewrite')],indent=2)+'\n')
    for row in rows:
        print(row['reading'],row['operation'],{engine:r['reading'] for engine,r in row['engines'].items()},
              {engine:r['changed_pixels'] for engine,r in row['render_comparison'].items()},
              'deterministic',row.get('deterministic_in_run','n/a'))
    print('Notebook complete; source cabinet unchanged. Observations do not assume semantic preservation.')

baseline = {}
if __name__ == '__main__': main()
