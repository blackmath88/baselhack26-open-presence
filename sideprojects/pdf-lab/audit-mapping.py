#!/usr/bin/env python3
"""Offline static-source audit against existing minimized measurements; no PDF runs.

Download the four pinned upstream files separately, then pass --source-dir.
This does not trace or attest the installed binary's execution path.
"""
import argparse
import hashlib
import json
from pathlib import Path
import re

ROOT = Path(__file__).resolve().parent
REVISION = '05631c2cba4e578fdd6bd25cae6f0939436de848'
SOURCES = {
    'pdf/pdf_font3.c': ('4956cb69af72b7fc177384503e9cc8696cf43dc12df3ba146b6877415d3230a5', [140,157]),
    'pdf/pdf_font.c': ('454fe1a098debe96a044bd1b6a5e1baa4726c4935a807b1826aeb64e782041db', [2036,2245]),
    'devices/vector/gdevpdte.c': ('d072783e12e0373ef049b345cf194027f1696129fec921efa4f40dd0f7ea69d7', [319,443]),
    'devices/vector/gdevpdtw.c': ('be2dc3666d2d5034634366098e3793d47986eff62e1f9eb291db70f2d65ac87f', [580,634]),
}

def sha(data): return hashlib.sha256(data).hexdigest()

def main():
    ap = argparse.ArgumentParser(description=__doc__)
    ap.add_argument('--source-dir', required=True, type=Path)
    args = ap.parse_args()
    records = []
    for path,(expected, lines) in SOURCES.items():
        data = (args.source_dir/Path(path).name).read_bytes()
        assert sha(data) == expected, f'Pinned source mismatch: {path}'
        records.append({'path':path,'sha256':expected,'lines':lines,
            'url':f'https://github.com/ArtifexSoftware/ghostpdl/blob/{REVISION}/{path}#L{lines[0]}-L{lines[1]}'})
    measured = json.loads((ROOT/'evidence/mapping-minimal.json').read_text())
    assert [(r['case'],r['mapping']) for r in measured['rows']] == [('identity','A'),('single','Z'),('multiple','SEA')]
    rows = []
    for row in measured['rows']:
        for state, observation in row['states'].items():
            assert sha((ROOT/observation['file']).read_bytes()) == observation['sha256']
        source_map = row['states']['source']['structure']['fonts'][0]['tounicode_stream']
        destination = bytes.fromhex(re.search(r'<41>\s*<([0-9A-Fa-f]+)>',source_map)[1])
        assert destination.decode('utf-16-be') == row['mapping']
        # Static inference limited to these BMP mappings and this simple-font branch.
        decoder_bytes = min(len(destination),4)
        expected_entry = decoder_bytes <= 2
        output_map = row['states']['rewrite']['structure']['fonts'][0]['tounicode_stream']
        observed_entries = sum(int(n) for n in re.findall(r'(\d+)\s+beginbf(?:char|range)',output_map))
        assert bool(observed_entries) == expected_entry
        rows.append({'case':row['case'],'mapping':row['mapping'],'input_utf16be_bytes':len(destination),
            'inferred_reader_return_bytes':decoder_bytes,'inferred_writer_accepts_entry':expected_entry,
            'observed_output_map_entries':observed_entries,
            'observed_mupdf_text':row['states']['rewrite']['mupdf']['observation']['text'].strip(),
            'observed_poppler_text':row['states']['rewrite']['poppler']['stdout'].strip()})
    result = {'kind':'static-source-inference-matched-to-observation','date':'2026-10-31',
        'source_tag':'ghostpdl-10.08.0','source_commit':REVISION,'sources':records,
        'installed_binary_sha256':sha(Path('/usr/bin/gs').read_bytes()),
        'installed_package_observed':'Arch ghostscript 10.08.0-1',
        'binary_source_relationship':'version-matched; no rebuild/debug trace/build attestation',
        'measurement_basis':{'file':'evidence/mapping-minimal.json','sha256':sha((ROOT/'evidence/mapping-minimal.json').read_bytes())},
        'interpretation':'The Type3 decode callback reaches the reader; its four-byte ceiling precedes a simple-font writer gate that adds entries only for decoded byte length <= 2. This static path fits these three measured cases.',
        'inference_scope':'A, Z, SEA BMP destination strings; simple font with Encoding; no universal Unicode-character-count rule',
        'checks':{'pinned_source_hashes':True,'existing_artifact_hashes':True,'static_gate_matches_all_three_measured_map_entry_counts':True},
        'reference':{'url':'https://opensource.adobe.com/dc-acrobat-sdk-docs/pdfstandards/pdfreference1.4.pdf#page=389',
            'section':'5.9, printed pages 369–371','finding':'ToUnicode supports a character code mapping to a sequence of Unicode values; this does not adjudicate the entire fixture or rewrite conformance.'},
        'rows':rows,'not_run':['instrumented Ghostscript trace','source rebuild','other versions or encodings','whole-document conformance validation']}
    import os
    checkpoint = os.environ.get('PDF_LAB_CHECKPOINT')
    if checkpoint and Path(checkpoint).exists():raise SystemExit('Checkpoint: no new audit output')
    (ROOT/'evidence/mapping-source-audit.json').write_text(json.dumps(result,indent=2)+'\n')
    print(json.dumps({'checks':result['checks'],'rows':rows},indent=2))

if __name__ == '__main__': main()
