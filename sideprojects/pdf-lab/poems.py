"""A01: original paired poems carried by four Type 3 line glyphs.

The glyph programs use the existing Helvetica resource to draw the visible poem.
Only ToUnicode changes between the two mapped specimens. No ActualText overlay.
"""
from pathlib import Path
import hashlib
import json
from build import shell, text, OUT

VISIBLE = (
    'I leave a lamp beside the rain.',
    'The window gathers little seas.',
    'A moth rehearses being flame.',
    'Dark gives each wing a name.',
)
OTHER = (
    'I keep a tide beneath my tongue.',
    'The silence carries paper boats.',
    'A word slips free before a song.',
    'The shore was listening so long.',
)

def poem(reading='other', replacement=None):
    if reading not in ('visible', 'other', 'direct'):
        raise ValueError('unknown reading')
    lines = replacement if replacement is not None else (OTHER if reading == 'other' else VISIBLE)
    if len(lines) != 4 or any(not 1 <= len(s) <= 32 or any(ord(c) < 32 or ord(c) > 126 for c in s) for s in lines):
        raise ValueError('mapping needs four lines of 1-32 printable ASCII characters')
    p = shell()
    glyphs = [p.stream('500 0 d0\n' + text(0, 0, line, 22)) for line in VISIBLE]
    pairs = '\n'.join(f'<{65+i:02X}> <{line.encode("utf-16-be").hex().upper()}>' for i, line in enumerate(lines))
    cmap = p.stream('/CIDInit /ProcSet findresource begin\n12 dict begin\nbegincmap\n'
        '/CIDSystemInfo << /Registry (Adobe) /Ordering (UCS) /Supplement 0 >> def\n'
        '/CMapName /TwoPoems def\n/CMapType 2 def\n1 begincodespacerange\n<00> <FF>\nendcodespacerange\n'
        f'4 beginbfchar\n{pairs}\nendbfchar\nendcmap\nCMapName currentdict /CMap defineresource pop\nend\nend')
    procs = ' '.join(f'/line{i} {obj} 0 R' for i, obj in enumerate(glyphs))
    # FontMatrix=identity: the glyph coordinates are page points, invoked at size 1.
    font = p.add(f'<< /Type /Font /Subtype /Type3 /FontBBox [0 -8 500 30] /FontMatrix [1 0 0 1 0 0] '
        f'/CharProcs << {procs} >> /Encoding << /Type /Encoding /Differences [65 /line0 /line1 /line2 /line3] >> '
        f'/FirstChar 65 /LastChar 68 /Widths [500 500 500 500] '
        f'/Resources << /Font << /H 4 0 R >> >> /ToUnicode {cmap} 0 R >>')
    content = '0.08 0.13 0.22 rg\n' + text(48, 741, 'PDF LAB / A01 - TWO POEMS', 11)
    content += text(48, 690, 'A lamp beside the rain', 28)
    content += text(48, 656, 'Read with your eyes. Then select the four lines and copy.', 11)
    for i, line in enumerate(VISIBLE):
        y = 540 - 58*i
        content += text(48, y, line, 22) if reading == 'direct' else f'BT /G 1 Tf 1 0 0 1 48 {y} Tm <{65+i:02X}> Tj ET\n'
    content += text(48, 190, 'The shapes hold one poem. The character map can hold another.', 11)
    content += text(48, 166, 'A mapping experiment, not encryption. Both readings are in the source.', 10)
    content += text(48, 72, 'Original poems / PDF LAB / 2026 - inspect /CharProcs and /ToUnicode.', 10)
    stream = p.stream(content)
    p.objects[0] = '<< /Type /Catalog /Pages 2 0 R >>'
    p.objects[2] = f'<< /Type /Page /Parent 2 0 R /MediaBox [0 0 612 792] /Resources << /Font << /H 4 0 R /G {font} 0 R >> >> /Contents {stream} 0 R >>'
    return p.finish()

def generate():
    return {f'01-poem-{name}.pdf': poem(name) for name in ('visible', 'other', 'direct')}

def write():
    OUT.mkdir(parents=True, exist_ok=True)
    records = []
    for name, data in generate().items():
        (OUT/name).write_bytes(data)
        records.append({'file': name, 'sha256': hashlib.sha256(data).hexdigest(), 'bytes': len(data)})
    (OUT/'poems-manifest.json').write_text(json.dumps(records, indent=2)+'\n')
    print(json.dumps(records, indent=2))

if __name__ == '__main__':
    write()
