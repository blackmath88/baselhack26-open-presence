#!/usr/bin/env python3
"""Recover this lab's classic-xref revisions using /Prev; never split on %%EOF.
Strictly a bounded teaching reader for these fixtures, not a general PDF parser.
Rejects xref streams, cycles, malformed entries and unrecognised trailers.
"""
import argparse,hashlib,json,re
from pathlib import Path
MAX_BYTES=2*1024*1024

def revisions(data):
    if len(data)>MAX_BYTES:raise ValueError('Teaching reader input limit: 2 MiB')
    final=re.search(rb'startxref\s+(\d+)\s+%%EOF\s*$',data)
    if not final:raise ValueError('No complete final revision locator')
    x=int(final[1]);seen=set();result=[]
    while True:
        if x in seen or len(seen)>=32:raise ValueError('Cycle or too many revisions')
        seen.add(x)
        if data[x:x+5]!=b'xref\n':raise ValueError('Only classic xref tables are supported')
        pos=x+5;entries={}
        while not data[pos:].startswith(b'trailer\n'):
            m=re.match(rb'(\d+) (\d+)\n',data[pos:])
            if not m:raise ValueError('Malformed xref subsection')
            first,count=map(int,m.groups());pos+=m.end()
            if count>10000:raise ValueError('Too many entries')
            for i in range(count):
                e=re.match(rb'(\d{10}) (\d{5}) ([nf]) \n',data[pos:])
                if not e:raise ValueError('Malformed xref entry')
                offset,generation=int(e[1]),int(e[2]);pos+=e.end()
                if e[3]==b'n':
                    header=f'{first+i} {generation} obj\n'.encode()
                    if data[offset:offset+len(header)]!=header:raise ValueError('Object offset/header mismatch')
                    entries[str(first+i)]=offset
        # Restrict trailer grammar to these authored flat dictionaries.
        m=re.match(rb'trailer\n<< /Size (\d+) /Root 1 0 R(?: /Prev (\d+))? >>\nstartxref\n(\d+)\n%%EOF\n',data[pos:])
        if not m or int(m[3])!=x:raise ValueError('Unsupported trailer or locator mismatch')
        end=pos+m.end();prefix=data[:end]
        result.append({'xref':x,'end':end,'object_offsets':entries,'sha256':hashlib.sha256(prefix).hexdigest()})
        if m[2] is None:break
        prev=int(m[2])
        if prev>=x:raise ValueError('Prev must point backwards')
        x=prev
    return list(reversed(result))

def main():
    ap=argparse.ArgumentParser(description=__doc__);ap.add_argument('pdf',type=Path);ap.add_argument('--out',type=Path,default=Path('recovered'));args=ap.parse_args()
    data=args.pdf.read_bytes();rows=revisions(data);args.out.mkdir(parents=True,exist_ok=True)
    for i,row in enumerate(rows,1):(args.out/f'revision-{i}.pdf').write_bytes(data[:row['end']])
    (args.out/'revisions.json').write_text(json.dumps(rows,indent=2)+'\n');print(json.dumps(rows,indent=2))
if __name__=='__main__':main()
