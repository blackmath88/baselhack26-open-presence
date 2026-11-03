"""Owned generated fixture only. Same limits/settings as check-poems.py; no imports with build side effects."""
import json
import resource
import subprocess
import sys
from pathlib import Path

for key, value in [(resource.RLIMIT_AS, 768*1024**2), (resource.RLIMIT_CPU, 8), (resource.RLIMIT_FSIZE, 2*1024**2)]:
    resource.setrlimit(key, (value, value))
engine, pdf, preview = sys.argv[1:]
if engine == 'poppler':
    version = subprocess.run(['pdftotext', '-v'], capture_output=True, text=True, timeout=2)
    render_version = subprocess.run(['pdftoppm', '-v'], capture_output=True, text=True, timeout=2)
    commands = [['pdftotext', '-layout', pdf, '-'], ['pdftoppm', '-r', '72', '-f', '1', '-l', '1', '-singlefile', '-png', pdf, preview[:-4]]]
    runs = []
    for command in commands:
        p = subprocess.run(command, capture_output=True, text=True, timeout=4)
        runs.append(dict(command=command, exit_code=p.returncode, stdout=p.stdout, stderr=p.stderr))
    print(json.dumps(dict(status='measured' if all(r['exit_code'] == 0 for r in runs) else 'failed', version=(version.stdout+version.stderr).strip(), render_version=(render_version.stdout+render_version.stderr).strip(), runs=runs)))
elif engine == 'mupdf':
    try:
        import fitz
    except ImportError:
        print(json.dumps(dict(status='not_run', reason='PyMuPDF unavailable in python3; install separately to enable this instrument.')))
        sys.exit(0)
    with fitz.open(pdf) as doc:
        pix = doc[0].get_pixmap()
        pix.save(preview)
        print(json.dumps(dict(status='measured', version=dict(pymupdf=fitz.VersionBind, mupdf=fitz.VersionFitz), settings='page 1, default 72 dpi, get_text()', text=doc[0].get_text(), width=pix.width, height=pix.height)))
else:
    raise ValueError('Unsupported instrument')
