#!/usr/bin/env python3
"""Small local controls for the cabinet. No server or network needed."""
import argparse,hashlib,json,sys
from pathlib import Path
import build
from recover import revisions

def main():
    ap=argparse.ArgumentParser(description=__doc__);sub=ap.add_subparsers(dest='cmd',required=True)
    sub.add_parser('build')
    sub.add_parser('poems', help='Generate only the two-poem increment')
    q=sub.add_parser('poem', help='Bend the four extracted lines, keeping all shapes fixed')
    q.add_argument('--lines', nargs=4, required=True, metavar='LINE')
    q.add_argument('--out', type=Path, default=Path('output/bends/poem.pdf'))
    b=sub.add_parser('bend',help='Make a new maze glyph and extraction mapping');b.add_argument('--seed',type=int,default=2210);b.add_argument('--word',default='LOST');b.add_argument('--out',type=Path,default=Path('output/bends/maze.pdf'))
    r=sub.add_parser('history',help='Show xref-linked revisions of the lab mystery');r.add_argument('pdf',type=Path)
    i=sub.add_parser('inspect',help='Inspect structure without executing actions');i.add_argument('pdf',type=Path)
    args=ap.parse_args()
    if args.cmd=='build':build.build();return
    if args.cmd=='poems':
        from poems import write
        write();return
    if args.cmd=='poem':
        from poems import poem, VISIBLE
        try:data=poem(replacement=args.lines)
        except ValueError as e:ap.error(str(e))
        args.out.parent.mkdir(parents=True,exist_ok=True);args.out.write_bytes(data)
        args.out.with_suffix('.json').write_text(json.dumps({'generator':'poems.poem','visible':VISIBLE,'mapping':args.lines,'sha256':hashlib.sha256(data).hexdigest()},indent=2)+'\n')
        return
    if args.cmd=='bend':
        if not 1<=len(args.word)<=32 or any(ord(c)<32 for c in args.word):ap.error('word must be 1-32 printable characters')
        data=build.picture(mapping=args.word,seed=args.seed);args.out.parent.mkdir(parents=True,exist_ok=True);args.out.write_bytes(data)
        record={'seed':args.seed,'mapping':args.word,'sha256':hashlib.sha256(data).hexdigest(),'generator':'build.picture','bytes':len(data)}
        args.out.with_suffix('.json').write_text(json.dumps(record,indent=2)+'\n');print(json.dumps(record,indent=2));return
    data=args.pdf.read_bytes()
    if len(data)>2*1024*1024:ap.error('Teaching tools accept at most 2 MiB')
    if args.cmd=='history':print(json.dumps(revisions(data),indent=2));return
    from pypdf import PdfReader
    import io,zipfile
    r=PdfReader(io.BytesIO(data));root=r.trailer['/Root']
    fonts=[]
    for p in r.pages:
        for key,value in p.get('/Resources',{}).get('/Font',{}).items():
            f=value.get_object();fonts.append({'name':key,'subtype':str(f.get('/Subtype')),'glyphs':list(f.get('/CharProcs',{}))})
    print(json.dumps({'sha256':hashlib.sha256(data).hexdigest(),'bytes':len(data),'pages':len(r.pages),'fonts':fonts,'fields':list((r.get_fields() or {}).keys()),'is_zip':zipfile.is_zipfile(io.BytesIO(data)),'catalog_keys':list(root.keys()),'has_previous_revision':'/Prev' in r.trailer},indent=2))
if __name__=='__main__':main()
