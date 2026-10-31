"""Measure saved default layer configurations, not interactive viewer toggles."""
import hashlib,json,subprocess,sys,tempfile,resource
from pathlib import Path
from PIL import Image
from pypdf import PdfReader
import fitz
import pypdfium2 as pdfium
ROOT=Path(__file__).resolve().parent;OUT=ROOT/'output/pdf';E=ROOT/'evidence';P=E/'previews'
def limits():
    resource.setrlimit(resource.RLIMIT_AS,(768*1024**2,768*1024**2))
    resource.setrlimit(resource.RLIMIT_CPU,(8,8))
    resource.setrlimit(resource.RLIMIT_FSIZE,(4*1024**2,4*1024**2))
def run(cmd):
    r=subprocess.run(cmd,capture_output=True,text=True,timeout=10,preexec_fn=limits)
    assert r.returncode==0,(cmd,r.stderr)
    return r
points=[(60,590),(236,590),(412,590),(60,480)]+[(60+i*132,273) for i in range(4)]
rows=[];streams=[]
worker='import fitz,sys; d=fitz.open(sys.argv[1]); d[0].get_pixmap().save(sys.argv[2])'
with tempfile.TemporaryDirectory() as temp:
    for state in range(8):
        path=OUT/f'07-layer-lock-{state:03b}.pdf';reader=PdfReader(path)
        streams.append(reader.pages[0].get_contents().get_data())
        a,b,c=[bool(state & m) for m in (4,2,1)]
        expected=[a,b,c,a and not b and c,any((a,b,c)),all((a,b,c)),not all((a,b,c)),not any((a,b,c))]
        row={'state':f'{state:03b}','sha256':hashlib.sha256(path.read_bytes()).hexdigest(),'expected':dict(zip(['A','B','C','gate','AnyOn','AllOn','AnyOff','AllOff'],expected)),'engines':{}}
        for engine in ('mupdf','poppler','pdfium'):
            dest=Path(temp)/f'{engine}-{state}'
            cmd=([sys.executable,'-c',worker,str(path),str(dest)+'.png'] if engine=='mupdf' else ['pdftoppm','-r','72','-png','-singlefile',str(path),str(dest)])
            if engine=='pdfium':cmd=[sys.executable,'-c','import pypdfium2 as p,sys; d=p.PdfDocument(sys.argv[1]); d[0].render().to_pil().save(sys.argv[2])',str(path),str(dest)+'.png']
            result=run(cmd);im=Image.open(str(dest)+'.png').convert('RGB')
            rgb=[im.getpixel((x,792-y)) for x,y in points]
            observed=[g>r+60 and g>b+25 for r,g,b in rgb]
            row['engines'][engine]={'observed':dict(zip(row['expected'],observed)),'matches_expected':observed==expected,'sample_rgb':rgb,'pixel_sha256':hashlib.sha256(im.tobytes()).hexdigest(),'stderr':result.stderr,'command':cmd}
            im.save(P/f'07-{engine}-{state:03b}.webp',quality=88)
        rows.append(row)
assert len(set(streams))==1,'Only default states may vary across lock fixtures'
d=fitz.open(OUT/'08-bitmap-machine.pdf');d[0].get_pixmap().save(str(P/'08-bitmap-machine.png'))
Image.open(P/'08-bitmap-machine.png').save(P/'08-bitmap-machine.webp',quality=88)
report={'date':'2026-10-31','scope':'Saved default configurations; no interactive viewer qualification','versions':{'PyMuPDF':fitz.VersionBind,'MuPDF':fitz.VersionFitz,'PDFium':str(pdfium.PDFIUM_INFO),'pypdfium2':str(pdfium.PYPDFIUM_INFO),'Poppler':subprocess.run(['pdftoppm','-v'],capture_output=True,text=True).stderr.strip()},'checks':{'identical_page_streams':True},'rows':rows}
(E/'weird-results.json').write_text(json.dumps(report,indent=2)+'\n')
print(json.dumps({r['state']:{e:v['matches_expected'] for e,v in r['engines'].items()} for r in rows},indent=2))
# Independently evaluate selected interior colour samples, allowing raster sampling.
import math
colour=[]
path=OUT/'09-colour-program.pdf'
reader=PdfReader(path);sh=reader.pages[0]['/Resources']['/Shading']['/Wave'].get_object()
assert sh['/Function']['/FunctionType']==4 and sh['/ShadingType']==1
with tempfile.TemporaryDirectory() as temp:
    for engine in ('mupdf','poppler','pdfium'):
        dest=Path(temp)/engine
        if engine=='mupdf':cmd=[sys.executable,'-c',worker,str(path),str(dest)+'.png']
        elif engine=='poppler':cmd=['pdftoppm','-r','72','-png','-singlefile',str(path),str(dest)]
        else:cmd=[sys.executable,'-c','import pypdfium2 as p,sys; d=p.PdfDocument(sys.argv[1]); d[0].render().to_pil().save(sys.argv[2])',str(path),str(dest)+'.png']
        result=run(cmd);im=Image.open(str(dest)+'.png').convert('RGB');samples=[]
        for px,py in [(71,201),(122,252),(189,313),(251,394),(322,450),(415,532)]:
            x=(px+.5-48)/516;y=(py-.5-176)/430
            v=(math.sin(math.radians(2160*x))*math.cos(math.radians(1440*y))+1)/2
            expected=[v,1-v,.35];rgb=im.getpixel((px,792-py));err=max(abs(rgb[i]/255-expected[i]) for i in range(3))
            samples.append({'point':[px,py],'rgb':rgb,'expected_rgb_unit':expected,'max_channel_error':err})
        im.save(P/f'09-{engine}.webp',quality=88)
        colour.append({'engine':engine,'samples':samples,'within_0_15_tolerance':all(v['max_channel_error']<=.15 for v in samples),'pixel_sha256':hashlib.sha256(im.tobytes()).hexdigest(),'stderr':result.stderr,'command':cmd})
report['colour_program']={'sha256':hashlib.sha256(path.read_bytes()).hexdigest(),'function_type':4,'shading_type':1,'runs':colour,'note':'Six interior samples at 72dpi; tolerance is an experiment threshold, not conformance certification.'}
(E/'weird-results.json').write_text(json.dumps(report,indent=2)+'\n')
print('Colour samples:',[(r['engine'],r['within_0_15_tolerance'],max(s['max_channel_error'] for s in r['samples'])) for r in colour])
