#!/usr/bin/env python3
"""Bounded local observations. Requires PyMuPDF and Poppler; does not execute PDF JS."""
from pathlib import Path
import hashlib,json,subprocess,sys,tempfile,resource
import fitz
from pypdf import PdfReader
import build
ROOT=Path(__file__).parent; OUT=ROOT/'output/pdf'; E=ROOT/'evidence';E.mkdir(exist_ok=True)
def limits():
    resource.setrlimit(resource.RLIMIT_AS,(768*1024**2,768*1024**2))
    resource.setrlimit(resource.RLIMIT_CPU,(8,8))
    resource.setrlimit(resource.RLIMIT_FSIZE,(2*1024**2,2*1024**2))
def run(cmd):
    with tempfile.TemporaryFile() as out,tempfile.TemporaryFile() as err:
        try:
            p=subprocess.run(cmd,stdout=out,stderr=err,timeout=10,preexec_fn=limits)
            status='accepted' if p.returncode==0 else 'error'
            code=p.returncode
        except subprocess.TimeoutExpired:status='timeout';code=None
        out.seek(0);err.seek(0)
        return {'status':status,'exit_code':code,'stdout':out.read(2*1024**2).decode(errors='replace'),'stderr':err.read(2*1024**2).decode(errors='replace')}
before={p.name:p.read_bytes() for p in OUT.glob('*.pdf')};build.build()
assert before=={p.name:p.read_bytes() for p in OUT.glob('*.pdf')},'generation must be deterministic'
observations=[]
worker="import fitz,sys,json; d=fitz.open(sys.argv[1]); t=''.join(p.get_text() for p in d); print(json.dumps({'text':t,'repaired':d.is_repaired,'warnings':fitz.TOOLS.mupdf_warnings()}))"
for p in sorted(OUT.glob('*.pdf')):
    row={'file':p.name,'sha256':hashlib.sha256(p.read_bytes()).hexdigest(),'poppler':run(['pdftotext',str(p),'-']),'mupdf':run([sys.executable,'-c',worker,str(p)])};observations.append(row)
# Type3 font mechanism, equal render, alternate extraction, direct-drawing control.
a=fitz.open(OUT/'01-one-letter.pdf');b=fitz.open(OUT/'01-alternate-reading.pdf');c=fitz.open(OUT/'01-direct-drawing.pdf')
assert a[0].get_pixmap().samples==b[0].get_pixmap().samples
assert a[0].get_pixmap().samples==c[0].get_pixmap().samples
assert '\nA\n' in a[0].get_text();assert 'LOST' in b[0].get_text()
r=PdfReader(OUT/'01-one-letter.pdf'); font=r.pages[0]['/Resources']['/Font']['/G'].get_object()
assert font['/Subtype']=='/Type3' and len(font['/CharProcs'])==1
r=PdfReader(OUT/'02-backstage.pdf'); assert len(r.get_fields())==7
assert len(r.pages[0]['/Annots'])==7
for obj in r.pages[0]['/Annots']:assert obj.get_object()['/AP']['/N'].get_object().get_data()
# Render using Poppler too, comparing independently generated files.
with tempfile.TemporaryDirectory() as t:
    for i,name in enumerate(['01-one-letter.pdf','01-alternate-reading.pdf','01-direct-drawing.pdf']):
        result=run(['pdftoppm','-r','72','-singlefile',str(OUT/name),str(Path(t)/str(i))]); assert result['exit_code']==0,result
    assert (Path(t)/'0.ppm').read_bytes()==(Path(t)/'1.ppm').read_bytes()==(Path(t)/'2.ppm').read_bytes()
for name in ['01-one-letter','02-backstage']:
    d=fitz.open(OUT/(name+'.pdf'));d[0].get_pixmap().save(str(E/(name+'.png')))
result={'versions':{'python':sys.version.split()[0],'mupdf_binding':fitz.VersionBind,'poppler':run(['pdftotext','-v'])['stderr'].splitlines()[0]},'limits':{'seconds':10,'cpu_seconds':8,'memory_MiB':768,'output_MiB':2},'checks':{'deterministic_generation':True,'type3_structure':True,'pixel_identity_in_mupdf_and_poppler':True,'alternate_extraction':True,'canonical_form_tree_and_appearances':True},'interactive_pdf_viewer':'not-run: no interactive PDF viewer in this environment','runs':observations}
(E/'results.json').write_text(json.dumps(result,indent=2)+'\n');print('All structural, rendering and regeneration checks passed.')
