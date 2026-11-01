"""Cabinet 002: exact-byte polyglot, real revision history, print-dependent art.
All content is synthetic. No network requests, external actions or executable payloads.
"""
import io, re, zipfile, hashlib, random
from build import ROOT, shell, text, maze

INK='0.08 0.14 0.24'
BLUE='0.12 0.34 0.91'
RED='0.94 0.20 0.31'
def stream_value(s): return f'<< /Length {len(s.encode("ascii"))} >>\nstream\n{s}\nendstream'
def setup(p,content,extra='',resources=''):
    c=p.stream(content)
    p.objects[0]='<< /Type /Catalog /Pages 2 0 R >>'
    p.objects[2]=f'<< /Type /Page /Parent 2 0 R /MediaBox [0 0 612 792] /Resources << /Font << /H 4 0 R >> {resources} >> /Contents {c} 0 R {extra} >>'
    return p.finish()
def heading(n,title,subtitle):
    return INK+' rg\n'+text(48,741,'PDF LAB / '+n,11)+text(48,697,title,30)+text(48,663,subtitle,12)
def card(y,kicker,title,lines):
    s=f'0.95 0.97 1 rg 48 {y} 516 126 re f\n'+BLUE+' rg\n'+text(68,y+99,kicker,10)+INK+' rg\n'+text(68,y+67,title,20)
    for i,line in enumerate(lines):s+=text(68,y+41-i*17,line,11)
    return s

def polyglot():
    p=shell()
    s=heading('04','I have another identity.','The file you are reading is also a ZIP archive.')
    s+=card(476,'INTERPRETER 01 / PDF','A document.', ['This page is the public face. Your PDF reader follows','cross-references to assemble the page you see.'])
    s+=card(316,'INTERPRETER 02 / ZIP','An evidence bag.', ['Open the exact same bytes with an archive reader.','Inside: a message, a recipe and the construction source.'])
    s+=BLUE+' rg\n'+text(48,260,'No attachment button. No second download.',18)+INK+' rg\n'
    s+=text(48,223,'Try: python3 -m zipfile -l 04-two-identities.pdf',12)
    s+=text(48,195,'Copy or rename it to .zip if your archive tool needs an extension.',11)
    s+=text(48,146,'The interesting question is which reader tolerates which boundaries.',11)
    s+=text(48,72,'Compatibility exhibit. Standards conformance is not claimed.',10)
    base=setup(p,s); offset=int(re.search(rb'startxref\n(\d+)\n%%EOF\n$',base)[1])
    buffer=io.BytesIO();buffer.write(base)
    # The ZIP lives after PDF EOF. ZIP offsets are absolute to the entire file.
    # A final PDF locator in the ZIP comment lets PDF readers find their xref.
    payloads={
        'READ-ME.txt':b'YOU FOUND THE OTHER READER.\nSame bytes, two interpretations.\nThis is a ZIP, not a PDF embedded-file attachment.\n',
        'RECIPE.txt':b'1. Write a complete PDF.\n2. Append an uncompressed ZIP with absolute offsets.\n3. Put the original PDF startxref and EOF in the ZIP comment.\n4. Test both consumers on the exact same bytes.\n',
        'source/exhibits.py':(ROOT/'exhibits.py').read_bytes(),
        'source/build.py':(ROOT/'build.py').read_bytes(),
        'source/weird.py':(ROOT/'weird.py').read_bytes(),
        'source/machine.js':(ROOT/'machine.js').read_bytes(),
    }
    with zipfile.ZipFile(buffer,'w',compression=zipfile.ZIP_STORED) as z:
        for name,data in payloads.items():
            item=zipfile.ZipInfo(name,date_time=(2026,10,31,12,0,0));item.create_system=3;item.external_attr=0o100644<<16
            z.writestr(item,data)
        z.comment=f'\nstartxref\n{offset}\n%%EOF\n'.encode()
    return buffer.getvalue()

def mystery():
    p=shell()
    while len(p.objects)<16:p.add('null')
    original=heading('05','Object 17 was here.','A witness statement, before the amendment.')
    original+=card(465,'WITNESS / ORIGINAL STATEMENT','The room was never empty.', ['I left through the east door at 17:17.','The word I left behind was PALIMPSEST.'])
    original+=INK+' rg\n'+text(48,372,'Object number: 17. Generation: 0. This is a content stream.',12)
    original+=text(48,337,'A later revision can change the current meaning of this reference.',11)
    original+=text(48,72,'This statement is synthetic. The revision mechanism is real.',10)
    p.stream(original);assert len(p.objects)==17
    p.objects[0]='<< /Type /Catalog /Pages 2 0 R >>'
    p.objects[2]='<< /Type /Page /Parent 2 0 R /MediaBox [0 0 612 792] /Resources << /Font << /H 4 0 R >> >> /Contents 17 0 R >>'
    initial=p.finish();prev=int(re.search(rb'startxref\n(\d+)\n%%EOF\n$',initial)[1])
    current=heading('05','Who killed object 17?','A document can forget without losing its memory.')
    current+=card(465,'CURRENT STATEMENT / AMENDED','There was nobody here.', ['The current cross-reference points to this replacement.','The earlier statement has disappeared from the page.'])
    current+=INK+' rg\n'+text(48,370,'Your case: recover the witness and explain the disappearance.',13)
    for i,line in enumerate(['01   Find the final startxref offset.','02   Read its trailer. Follow /Prev.','03   Recover the earlier complete revision.','04   Compare object 17 in both revisions.']):current+=text(48,320-i*31,line,12)
    current+=text(48,148,'Win condition: explain what changed, with byte offsets as evidence.',11)
    current+=text(48,72,'Hint: saving an update can append new objects while retaining old bytes.',10)
    replacement=stream_value(current);offset=len(initial)
    body=f'17 0 obj\n{replacement}\nendobj\n'.encode()
    tail=f'xref\n17 1\n{offset:010d} 00000 n \ntrailer\n<< /Size 18 /Root 1 0 R /Prev {prev} >>\nstartxref\n{offset+len(body)}\n%%EOF\n'.encode()
    amended=initial+body+tail
    p.objects[16]=replacement;rewritten=p.finish()
    return {'05-object-17.pdf':amended,'05-original-witness.pdf':initial,'05-rewritten-control.pdf':rewritten}

def route():
    # Reproduce build.maze's seeded DFS, then find its unique path.
    n=18;r=random.Random(2210);seen={(0,0)};stack=[(0,0)];adj={(x,y):[] for x in range(n) for y in range(n)}
    while stack:
        x,y=stack[-1];choices=[(a,b) for a,b in [(x+1,y),(x-1,y),(x,y+1),(x,y-1)] if 0<=a<n and 0<=b<n and (a,b) not in seen]
        if not choices:stack.pop();continue
        v=r.choice(choices);adj[(x,y)].append(v);adj[v].append((x,y));seen.add(v);stack.append(v)
    queue=[(0,0)];parent={(0,0):None}
    for u in queue:
        for v in adj[u]:
            if v not in parent:parent[v]=u;queue.append(v)
    path=[];v=(17,17)
    while v is not None:path.append(v);v=parent[v]
    path.reverse()
    return path

def print_maze():
    p=shell()
    s=heading('06','Print me to ruin the puzzle.','On screen: find the path. In print mode: the answer appears.')
    s+='q .54 0 0 .54 54 128 cm\n'+maze()+'\nQ\n'
    s+=INK+' rg\n'+text(48,87,'A print-only annotation carries the solution. It is not absent from the file.',11)
    s+=text(48,64,'Reader and print settings matter. Tested print-mode renders are in the cabinet.',10)
    path=route();line=RED+' RG 6 w 1 J 1 j\n'
    for i,(x,y) in enumerate(path):line+=f'{(x*50+25)*.54:.2f} {(y*50+25)*.54:.2f} '+('m' if i==0 else 'l')+'\n'
    line+='S\n'
    app=p.stream(line,'/Type /XObject /Subtype /Form /BBox [0 0 486 486] /Resources << >>')
    # Print=4, NoView=32: visible to print, hidden on screen. No JavaScript.
    annot=p.add(f'<< /Type /Annot /Subtype /Stamp /Rect [54 128 540 614] /P 3 0 R /F 36 /NM (print-solution) /Contents (The unique route through the maze.) /AP << /N {app} 0 R >> >>')
    return setup(p,s,extra=f'/Annots [{annot} 0 R]')

def generate():
    files={'04-two-identities.pdf':polyglot(),**mystery(),'06-print-to-reveal.pdf':print_maze()}
    return files
