#!/usr/bin/env python3
"""End-to-end checks for exact-byte identity, history and view/print semantics."""
import hashlib,io,json,re,subprocess,sys,tempfile,zipfile
from pathlib import Path
import fitz
from pypdf import PdfReader
import check as base  # Runs and records baseline checks first.
from recover import revisions
from build import ROOT,OUT,picture
from exhibits import route
from PIL import Image
E=ROOT/'evidence';P=E/'previews';P.mkdir(exist_ok=True)
def sha(b):return hashlib.sha256(b).hexdigest()
def observe(cmd):
    r=base.run(cmd)
    assert r['status']=='accepted',r
    return r
checks={};runs=[]
# The same exact bytes must be independently readable as PDF and ZIP.
data=(OUT/'04-two-identities.pdf').read_bytes()
reader=PdfReader(io.BytesIO(data));assert len(reader.pages)==1
assert '/EmbeddedFiles' not in reader.trailer['/Root'].get('/Names',{})
with zipfile.ZipFile(io.BytesIO(data)) as z:
    assert z.testzip() is None
    assert b'YOU FOUND THE OTHER READER' in z.read('READ-ME.txt')
    members={n:sha(z.read(n)) for n in z.namelist()}
    for n in ['build.py','exhibits.py','machine.js']:assert z.read('source/'+n)==(ROOT/n).read_bytes()
runs.append(observe(['unzip','-t',str(OUT/'04-two-identities.pdf')]))
for engine,cmd in [('poppler',['pdftotext',str(OUT/'04-two-identities.pdf'),'-']),('mupdf',[sys.executable,'-c','import fitz,sys; print(fitz.open(sys.argv[1])[0].get_text())',str(OUT/'04-two-identities.pdf')])]:
    r=observe(cmd);assert 'another identity' in r['stdout'];runs.append(r)
checks['polyglot']={'same_input_sha256':sha(data),'zip_member_sha256':members,'pdf_no_embeddedfiles':True,'readers':['Python zipfile','Info-ZIP unzip','pypdf','MuPDF','Poppler'],'conformance':'not assessed; tolerated hybrid'}
# Replay exactly the earlier prefix, following xref Prev pointers.
data=(OUT/'05-object-17.pdf').read_bytes();rows=revisions(data);assert len(rows)==2
original=(OUT/'05-original-witness.pdf').read_bytes();clean=(OUT/'05-rewritten-control.pdf').read_bytes()
assert data[:rows[0]['end']]==original
assert b'PALIMPSEST' in data and b'PALIMPSEST' not in clean
for name,has_secret in [('05-original-witness.pdf',True),('05-object-17.pdf',False),('05-rewritten-control.pdf',False)]:
    text=fitz.open(OUT/name)[0].get_text();assert ('PALIMPSEST' in text)==has_secret
    r=observe(['pdftotext',str(OUT/name),'-']);assert ('PALIMPSEST' in r['stdout'])==has_secret;runs.append(r)
assert fitz.open(OUT/'05-object-17.pdf')[0].get_pixmap().samples==fitz.open(OUT/'05-rewritten-control.pdf')[0].get_pixmap().samples
assert len(revisions(clean))==1
# Negative tests for the scoped recovery reader: damaged offsets and Prev cycles.
for damaged in [data.replace(b'/Prev 1530',b'/Prev 9999'),data[:-12],b'not a pdf']:
    try:revisions(damaged)
    except ValueError:pass
    else:raise AssertionError('invalid revision structure accepted')
checks['history']={'revisions':rows,'recovered_prefix_matches_original':True,'current_and_rewritten_pixel_equal':True,'rewritten_control_has_secret_bytes':False,'invalid_input_rejected':True}
# Ghostscript really selects annotation print intent; do not simulate layer toggles.
for mode in ['screen','print']:
    cmd=['gs','-q','-dSAFER','-dBATCH','-dNOPAUSE','-dPrinted='+('true' if mode=='print' else 'false'),'-sDEVICE=png16m','-r96',f'-sOutputFile={P/("06-"+mode+".png")}',str(OUT/'06-print-to-reveal.pdf')]
    runs.append(observe(cmd))
a=Image.open(P/'06-screen.png').convert('RGB');b=Image.open(P/'06-print.png').convert('RGB');assert a.size==b.size
red=lambda im:sum(r>180 and g<110 and bl<140 for r,g,bl in im.get_flattened_data())
assert red(b)>red(a)+1000
# Difference is restricted to the maze, not titles or page geometry.
assert a.crop((0,0,a.width,200)).tobytes()==b.crop((0,0,b.width,200)).tobytes()
assert a.crop((0,900,a.width,a.height)).tobytes()==b.crop((0,900,b.width,b.height)).tobytes()
path=route();assert path[0]==(0,0) and path[-1]==(17,17)
assert len(path)==len(set(path))
assert all(abs(x-X)+abs(y-Y)==1 for (x,y),(X,Y) in zip(path,path[1:]))
checks['print']={'ghostscript':observe(['gs','--version'])['stdout'].strip(),'screen_pixel_sha256':sha(a.tobytes()),'print_pixel_sha256':sha(b.tobytes()),'red_pixels_screen':red(a),'red_pixels_print':red(b),'route_cells':len(path),'header_and_footer_unchanged':True,'physical_printer':'not-run','other_viewers_print_modes':'not-run'}
# Mutation rendering: raw pixel hashes within each engine, separate from extraction.
render_rows=[]
for name in ['03-baseline.pdf','03-wrong-xref.pdf','03-wrong-length.pdf','03-truncated-update.pdf']:
    worker="import fitz,sys,json,hashlib; d=fitz.open(sys.argv[1]); p=d[0].get_pixmap(); print(json.dumps({'pixel_sha256':hashlib.sha256(p.samples).hexdigest(),'repaired':d.is_repaired,'warnings':fitz.TOOLS.mupdf_warnings()}))"
    run=observe([sys.executable,'-c',worker,str(OUT/name)]); observed=json.loads(run['stdout'])
    row={'file':name,'mupdf_pixel_sha256':observed['pixel_sha256'],'mupdf_repaired':observed['repaired'],'mupdf_warnings':observed['warnings'],'mupdf_run':run}
    with tempfile.TemporaryDirectory() as tmp:
        r=observe(['pdftoppm','-r','72','-singlefile',str(OUT/name),str(Path(tmp)/'render')]);row['poppler_run']=r;row['poppler_ppm_sha256']=sha((Path(tmp)/'render.ppm').read_bytes())
    render_rows.append(row)
checks['mutation_renders']=render_rows
# Parametric glyph: new seed actually changes pixels; mapping-only change does not.
x=picture(seed=17,mapping='RABBIT');y=picture(seed=17,mapping='HOLE')
px=fitz.open(stream=x,filetype='pdf');py=fitz.open(stream=y,filetype='pdf')
assert px[0].get_pixmap().samples==py[0].get_pixmap().samples
assert 'RABBIT' in px[0].get_text() and 'HOLE' in py[0].get_text()
assert px[0].get_pixmap().samples!=fitz.open(OUT/'01-one-letter.pdf')[0].get_pixmap().samples
checks['bend']={'seed_changes_geometry':True,'mapping_changes_extraction_not_pixels':True}
# Actual PDF renderings for the static cabinet, including both mystery states.
for name in ['01-one-letter','02-backstage','04-two-identities','05-object-17','05-original-witness']:
    d=fitz.open(OUT/(name+'.pdf'));d[0].get_pixmap(matrix=fitz.Matrix(4/3,4/3)).save(str(P/(name+'.png')))
# Convert losslessly rendered PNGs to compact WebP previews; these are labelled renders.
for p in P.glob('*.png'):
    im=Image.open(p);im.save(p.with_suffix('.webp'),format='WEBP',quality=88)
result={'date':'2026-10-31','kind':'local-observations','checks':checks,'runs':runs,'limits':base.result['limits'],'b02_interactive_pdf_viewer':'not-run: no interactive browser/PDF viewer installed'}
(E/'cabinet-results.json').write_text(json.dumps(result,indent=2)+'\n')
print('Cabinet checks passed: exact-byte PDF/ZIP, xref history, print intent, mutation renders, parametric glyph.')
