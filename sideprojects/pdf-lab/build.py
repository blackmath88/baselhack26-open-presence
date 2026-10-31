#!/usr/bin/env python3
"""Deterministic, deliberately readable PDF exhibits. Python standard library only."""
from pathlib import Path
import hashlib, json, random
ROOT=Path(__file__).parent
OUT=ROOT/'output/pdf'

def literal(s): return '('+s.replace('\\','\\\\').replace('(','\\(').replace(')','\\)')+')'
class PDF:
    def __init__(self): self.objects=[]
    def add(self,s): self.objects.append(s); return len(self.objects)
    def stream(self,s,extra=''): return self.add(f'<< /Length {len(s.encode("ascii"))} {extra} >>\nstream\n{s}\nendstream')
    def finish(self):
        b=b'%PDF-1.4\n% PDF LAB - authored ASCII specimen\n'; offsets=[0]
        for i,s in enumerate(self.objects,1):
            offsets.append(len(b)); b+=f'{i} 0 obj\n{s}\nendobj\n'.encode('ascii')
        x=len(b); b+=f'xref\n0 {len(offsets)}\n0000000000 65535 f \n'.encode()
        b+=''.join(f'{o:010d} 00000 n \n' for o in offsets[1:]).encode()
        return b+f'trailer\n<< /Size {len(offsets)} /Root 1 0 R >>\nstartxref\n{x}\n%%EOF\n'.encode()

def text(x,y,s,size=12): return f'BT /H {size} Tf 1 0 0 1 {x} {y} Tm {literal(s)} Tj ET\n'
def shell():
    p=PDF();p.add('');p.add('<< /Type /Pages /Kids [3 0 R] /Count 1 >>');p.add('');p.add('<< /Type /Font /Subtype /Type1 /BaseFont /Helvetica >>'); return p

def maze():
    n=18;r=random.Random(2210); seen={(0,0)};stack=[(0,0)];edges=set()
    while stack:
        x,y=stack[-1]; choices=[(a,b) for a,b in [(x+1,y),(x-1,y),(x,y+1),(x,y-1)] if 0<=a<n and 0<=b<n and (a,b) not in seen]
        if not choices: stack.pop();continue
        v=r.choice(choices); edges.add(frozenset(((x,y),v)));seen.add(v);stack.append(v)
    ops=['0.96 0.975 1 rg 0 0 900 900 re f','0.10 0.18 0.30 RG 4 w 1 J']
    for y in range(n):
        for x in range(n):
            X=x*50;Y=y*50
            if x==0 and y!=0: ops.append(f'{X} {Y} m {X} {Y+50} l S')
            if y==0: ops.append(f'{X} {Y} m {X+50} {Y} l S')
            if x==n-1:
                if y!=n-1:ops.append(f'{X+50} {Y} m {X+50} {Y+50} l S')
            elif frozenset(((x,y),(x+1,y))) not in edges:ops.append(f'{X+50} {Y} m {X+50} {Y+50} l S')
            if y==n-1 or frozenset(((x,y),(x,y+1))) not in edges:ops.append(f'{X} {Y+50} m {X+50} {Y+50} l S')
    ops+=['0.15 0.4 0.95 rg 12 12 26 26 re f','0.95 0.25 0.35 rg 862 862 26 26 re f']
    return '\n'.join(ops)

def picture(kind='letter',mapping='A'):
    p=shell(); drawing=maze()
    glyph=p.stream('900 0 d0\n'+drawing)
    cmap=p.stream('/CIDInit /ProcSet findresource begin\n12 dict begin\nbegincmap\n/CIDSystemInfo << /Registry (Adobe) /Ordering (UCS) /Supplement 0 >> def\n/CMapName /Lab def\n/CMapType 2 def\n1 begincodespacerange\n<00> <FF>\nendcodespacerange\n1 beginbfchar\n<41> <'+mapping.encode('utf-16-be').hex().upper()+'>\nendbfchar\nendcmap\nCMapName currentdict /CMap defineresource pop\nend\nend')
    font=p.add(f'<< /Type /Font /Subtype /Type3 /FontBBox [0 0 900 900] /FontMatrix [.001 0 0 .001 0 0] /CharProcs << /maze {glyph} 0 R >> /Encoding << /Type /Encoding /Differences [65 /maze] >> /FirstChar 65 /LastChar 65 /Widths [900] /Resources << >> /ToUnicode {cmap} 0 R >>')
    content='0.10 0.18 0.30 rg\n'+text(48,741,'PDF LAB / 01',11)+text(48,697,'This picture is one letter.',29)+text(48,665,'Find the way through. Then select the picture and copy it.',12)
    content+=('q .54 0 0 .54 54 128 cm\n'+drawing+'\nQ\n') if kind=='control' else 'BT /G 540 Tf 1 0 0 1 54 128 Tm (A) Tj ET\n'
    content+=text(48,88,'A picture to your eyes. A character to the extractor.',12)+text(48,64,'Reveal: inspect /CharProcs. The maze is the glyph drawing procedure.',10)
    stream=p.stream(content)
    p.objects[0]='<< /Type /Catalog /Pages 2 0 R >>'
    p.objects[2]=f'<< /Type /Page /Parent 2 0 R /MediaBox [0 0 612 792] /Resources << /Font << /H 4 0 R /G {font} 0 R >> >> /Contents {stream} 0 R >>'
    return p.finish()

def machine():
    p=shell(); fields=[]
    js=(ROOT/'machine.js').read_text()
    action=p.add('<< /S /JavaScript /JS '+literal(js)+' >>')
    def field(name,rect,value='',button=None,hidden=False):
        x,y,w,h=rect
        appearance=p.stream(f'0.94 0.96 1 rg 0 0 {w} {h} re f\n0.1 0.18 0.3 rg\n'+text(8,h/2-4,value,12),f'/Type /XObject /Subtype /Form /BBox [0 0 {w} {h}] /Resources << /Font << /H 4 0 R >> >>')
        ft='/Btn /Ff 65536' if button else '/Tx'
        flags=2 if hidden else 4
        a=(' /A << /S /JavaScript /JS '+literal(button)+' >>') if button else ''
        obj=p.add(f'<< /Type /Annot /Subtype /Widget /FT {ft} /T {literal(name)} /Rect [{x} {y} {x+w} {y+h}] /P 3 0 R /F {flags} /V {literal(value)} /DA (/H 12 Tf 0.1 0.18 0.3 rg) /AP << /N {appearance} 0 R >>{a} >>'); fields.append(obj)
    field('key',(48,530,350,35),'')
    field('unlock',(412,530,150,35),'Enter',"labUnlock(this);")
    field('state',(48,447,514,40),'LOCKED - enter the word that names the other side of a stage.')
    field('memory',(48,370,514,40),'',hidden=True)
    field('step',(48,300,150,38),'Step','labStep(this);',True)
    field('run',(230,300,150,38),'Run','labRun(this);',True)
    field('reset',(412,300,150,38),'Reset','labReset(this);',True)
    content='0.10 0.18 0.30 rg\n'+text(48,741,'PDF LAB / 02',11)+text(48,697,'An ordinary instruction sheet.',28)+text(48,660,'Some documents have another side. Find the entrance.',12)+text(48,585,'ACCESS PHRASE',10)+text(48,505,'STATE / PROGRAM COUNTER',10)+text(48,423,'MEMORY / EIGHT CELLS',10)+text(48,244,'PROGRAM: LOAD 1 / DRAW / ADD 1 / DRAW / REPEAT / HALT',11)+text(48,210,'The machine fills eight cells, one instruction at a time.',11)+text(48,175,'If buttons do nothing, this viewer may not support PDF JavaScript.',10)+text(48,149,'Reverse-engineer: inspect the document JavaScript and field actions.',10)+text(48,72,'No network. No host access. An intentionally authored secret interface.',10)
    s=p.stream(content); refs=' '.join(f'{i} 0 R' for i in fields)
    p.objects[0]=f'<< /Type /Catalog /Pages 2 0 R /Names << /JavaScript << /Names [(Lab) {action} 0 R] >> >> /AcroForm << /Fields [{refs}] /DR << /Font << /H 4 0 R >> >> /DA (/H 12 Tf 0 g) /NeedAppearances true >> >>'
    p.objects[2]=f'<< /Type /Page /Parent 2 0 R /MediaBox [0 0 612 792] /Resources << /Font << /H 4 0 R >> >> /Contents {s} 0 R /Annots [{refs}] >>'
    return p.finish()

def build():
    OUT.mkdir(parents=True,exist_ok=True)
    files={'01-one-letter.pdf':picture(),'01-alternate-reading.pdf':picture(mapping='LOST'),'01-direct-drawing.pdf':picture('control'),'02-backstage.pdf':machine()}
    base=picture(); files['03-baseline.pdf']=base
    import re
    files['03-wrong-xref.pdf']=re.sub(rb'(startxref\n)(\d+)',lambda m:m[1]+b'1'.rjust(len(m[2]),b'0'),base)
    files['03-wrong-length.pdf']=re.sub(rb'/Length (\d+)',lambda m:b'/Length '+b'1'.rjust(len(m[1]),b'0'),base,count=1)
    # Genuine incremental update replacing the catalog; then deliberately truncate its trailer.
    prev=int(re.search(rb'startxref\n(\d+)',base).group(1)); offset=len(base)
    update=b'1 0 obj\n<< /Type /Catalog /Pages 2 0 R /LabNote (unfinished update) >>\nendobj\n'
    tail=f'xref\n1 1\n{offset:010d} 00000 n \ntrailer\n<< /Size 10 /Root 1 0 R /Prev {prev} >>\nstartxref\n{offset+len(update)}\n%%EOF\n'.encode()
    files['03-truncated-update.pdf']=base+update+tail[:tail.index(b'/Root')+5]
    manifest=[]
    for name,data in files.items():
        (OUT/name).write_bytes(data);manifest.append({'file':name,'sha256':hashlib.sha256(data).hexdigest(),'bytes':len(data)})
    (OUT/'manifest.json').write_text(json.dumps(manifest,indent=2)+'\n')
    print(json.dumps(manifest,indent=2))
if __name__=='__main__':build()
