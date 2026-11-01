#!/usr/bin/env python3
"""One Type 3 glyph, no nested text: A / Z / SEA mappings through pdfwrite.

Reuse the notebook's bounded instruments; do not regenerate existing specimens.
"""
import importlib.util
import json
from pathlib import Path
import sys
import tempfile
from PIL import Image, ImageChops
from build import PDF

ROOT = Path(__file__).resolve().parent
spec = importlib.util.spec_from_file_location('notebook', ROOT/'check-transforms.py')
bench = importlib.util.module_from_spec(spec)
spec.loader.exec_module(bench)
OUT = ROOT/'output/mapping-minimal'
CASES = {'identity':'A', 'single':'Z', 'multiple':'SEA'}
DRAWING = '1000 0 d0\n0.1 0.55 0.6 rg 100 100 800 800 re f\n1 0.6 0.2 RG 35 w 150 150 m 850 850 l S'

def specimen(mapping):
    p = PDF()
    p.add('<< /Type /Catalog /Pages 2 0 R >>')
    p.add('<< /Type /Pages /Kids [3 0 R] /Count 1 >>')
    p.add('')
    glyph = p.stream(DRAWING)
    cmap = p.stream('/CIDInit /ProcSet findresource begin\n12 dict begin\nbegincmap\n'
        '/CIDSystemInfo << /Registry (Adobe) /Ordering (UCS) /Supplement 0 >> def\n'
        '/CMapName /Minimal def\n/CMapType 2 def\n1 begincodespacerange\n<00> <FF>\nendcodespacerange\n'
        '1 beginbfchar\n<41> <'+mapping.encode('utf-16-be').hex().upper()+'>\nendbfchar\nendcmap\n'
        'CMapName currentdict /CMap defineresource pop\nend\nend')
    font = p.add(f'<< /Type /Font /Subtype /Type3 /FontBBox [0 0 1000 1000] '
        f'/FontMatrix [.001 0 0 .001 0 0] /CharProcs << /mark {glyph} 0 R >> '
        '/Encoding << /Type /Encoding /Differences [65 /mark] >> /FirstChar 65 /LastChar 65 /Widths [1000] '
        f'/Resources << >> /ToUnicode {cmap} 0 R >>')
    content = p.stream('BT /G 160 Tf 1 0 0 1 20 20 Tm <41> Tj ET')
    p.objects[2] = f'<< /Type /Page /Parent 2 0 R /MediaBox [0 0 200 200] '
    p.objects[2] += f'/Resources << /Font << /G {font} 0 R >> >> /Contents {content} 0 R >>'
    return p.finish()

def main():
    bench.checkpoint(); OUT.mkdir(exist_ok=True)
    preserved = {str(p.relative_to(ROOT)):bench.sha(p.read_bytes())
        for folder in ('output/pdf','output/transforms') for p in (ROOT/folder).glob('*.pdf')}
    versions = {'ghostscript':bench.run(['gs','--version'])['stdout'].strip(),
                'mupdf':bench.fitz.VersionFitz, 'pymupdf':bench.fitz.VersionBind,
                'poppler':bench.run(['pdftotext','-v'])['stderr'].splitlines()[0]}
    rows = []
    with tempfile.TemporaryDirectory() as temp:
        temp = Path(temp)
        for case, mapping in CASES.items():
            bench.checkpoint()
            source = OUT/f'{case}-source.pdf'; source.write_bytes(specimen(mapping))
            assert source.read_bytes() == specimen(mapping)
            rewritten = OUT/f'{case}-rewrite.pdf'
            command = ['gs','-q','-dSAFER','-dBATCH','-dNOPAUSE','-sDEVICE=pdfwrite',
                '-dCompatibilityLevel=1.7','-dAutoRotatePages=/None','-dOmitInfoDate=true','-dOmitID=true',
                f'-sOutputFile={rewritten}',str(source)]
            bench.checkpoint(); rewrite_run = bench.run(command)
            row = {'case':case,'mapping':mapping,'source_sha256':bench.sha(source.read_bytes()),
                   'rewrite_run':rewrite_run,'states':{}}
            bases = {}
            for state, path in [('source',source),('rewrite',rewritten)]:
                structure = bench.structure(path)
                assert structure['pages']==1 and len(structure['fonts'])==1
                if state=='source':assert structure['fonts'][0]['glyph_count']==1
                m = bench.run([sys.executable,str(ROOT/'check-transforms.py'),'--worker',str(path),str(temp/'m.png')])
                m['observation'] = json.loads(m['stdout'])
                pop = bench.run(['pdftotext','-layout',str(path),'-'])
                render = bench.run(['pdftoppm','-r','72','-singlefile',str(path),str(temp/'p')])
                observations = {}
                for engine, image in [('mupdf',Image.open(temp/'m.png').convert('RGB')),
                                      ('poppler',Image.open(temp/'p.ppm').convert('RGB'))]:
                    if state=='source':bases[engine]=image.copy()
                    assert image.size==bases[engine].size==(200,200)
                    diff = ImageChops.difference(bases[engine],image)
                    observations[engine] = {'pixels_sha256':bench.sha(image.tobytes()),
                        'changed_pixels':sum(any(pixel) for pixel in diff.get_flattened_data()),'total_pixels':40000,
                        'max_channel_error':max(high for low,high in diff.getextrema()),
                        'mean_absolute_channel_error':sum(sum(pixel) for pixel in diff.get_flattened_data())/120000}
                    bench.checkpoint()
                    image.save(ROOT/f'evidence/previews/minimal-{case}-{state}-{engine}.webp',lossless=True)
                row['states'][state] = {'file':str(path.relative_to(ROOT)),'bytes':path.stat().st_size,
                    'sha256':bench.sha(path.read_bytes()),'structure':structure,'mupdf':m,'poppler':pop,
                    'poppler_render':render,'render_observations':observations}
                if state=='source':
                    assert m['observation']['text'].strip()==mapping
                    assert pop['stdout'].strip()==mapping
            rows.append(row)
    source_bytes = [specimen(mapping) for mapping in CASES.values()]
    # Only object 5 (CMap) can differ among authored source objects.
    import re
    objects = [re.findall(rb'(?m)^(\d+) 0 obj\n(.*?)\nendobj', data, re.S) for data in source_bytes]
    assert all(len(group)==7 for group in objects)
    for i in range(7):
        if i != 4:assert len({group[i][1] for group in objects})==1
    assert preserved=={str(p.relative_to(ROOT)):bench.sha(p.read_bytes())
        for folder in ('output/pdf','output/transforms') for p in (ROOT/folder).glob('*.pdf')}
    result = {'kind':'minimized-mapping-observation','date':'2026-10-31','versions':versions,
        'limits':{'wall_seconds':10,'cpu_seconds':8,'memory_MiB':768,'output_MiB':4},
        'settings':{'dpi':72,'SOURCE_DATE_EPOCH':'1793473800','source_code':'41','glyph_name':'mark'},
        'checks':{'existing_31_pdfs_preserved':True,'source_only_cmap_object_changes':True,'source_extraction_matches_both_engines':True},
        'rewrite_all_byte_identical':len({(OUT/f'{case}-rewrite.pdf').read_bytes() for case in CASES})==1,
        'rows':rows,'not_run':['other Ghostscript versions/settings','spec conformance adjudication','native viewer copy/paste']}
    bench.checkpoint()
    (ROOT/'evidence/mapping-minimal.json').write_text(json.dumps(result,indent=2)+'\n')
    bench.checkpoint()
    (OUT/'manifest.json').write_text(json.dumps([{'case':r['case'],'mapping':r['mapping'],'source_sha256':r['source_sha256'],
        **{s:r['states'][s]['sha256'] for s in ('source','rewrite')}} for r in rows],indent=2)+'\n')
    for row in rows:
        print(row['case'],row['mapping'],{s:{'mupdf':r['mupdf']['observation']['text'].strip(),
            'poppler':r['poppler']['stdout'].strip(),'pixels':r['render_observations']} for s,r in row['states'].items()})
    print('All rewrites byte-identical:',result['rewrite_all_byte_identical'])

if __name__=='__main__': main()
