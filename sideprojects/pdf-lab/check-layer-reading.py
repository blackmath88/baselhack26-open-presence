"""Probe an authored layer gate with a harmless word. Run from any directory."""
from hashlib import sha256
import json
from pathlib import Path
import subprocess
import tempfile
from unittest.mock import patch

import fitz
from PIL import Image, ImageChops
import weird

original_setup = weird.setup
def add_marker(pdf, content, **kwargs):
    paint = "48 360 516 140 re f EMC"
    if content.count(paint) != 1:
        raise ValueError("Expected one conditional painted rectangle")
    marked = paint.replace(" EMC", " 0 0 0 rg BT /H 30 Tf 1 0 0 1 100 450 Tm (LANTERN) Tj ET EMC")
    return original_setup(pdf, content.replace(paint, marked), **kwargs)

def observe(root, state):
    pdf = root / "gate.pdf"
    with patch.object(weird, "setup", add_marker):
        pdf.write_bytes(weird.lock(state))
    with fitz.open(pdf) as doc:
        doc[0].get_pixmap(matrix=fitz.Matrix(2, 2)).save(root / "mupdf.png")
    subprocess.run(["pdftoppm", "-r", "144", "-png", "-singlefile", str(pdf), str(root / "poppler")], check=True, timeout=15)
    observations = {}
    for engine in ("mupdf", "poppler"):
        with Image.open(root / (engine + ".png")) as page:
            crop = page.convert("RGB").crop((190, 620, 550, 705))
        crop.save(root / "crop.png")
        result = subprocess.run(["tesseract", str(root / "crop.png"), "stdout", "--psm", "7"], capture_output=True, text=True, check=True, timeout=15)
        red, green, blue = crop.split()
        brightest_channel = ImageChops.lighter(red, ImageChops.lighter(green, blue))
        observations[engine] = dict(
            ocr=result.stdout.strip(),
            dark_pixels=sum(brightest_channel.histogram()[:80]),
            crop_sha256=sha256(crop.tobytes()).hexdigest(),
        )
    return dict(state=f"{state:03b}", pdf_sha256=sha256(pdf.read_bytes()).hexdigest(), observations=observations)

if __name__ == "__main__":
    with tempfile.TemporaryDirectory() as tmp:
        rows = [observe(Path(tmp), state) for state in (0, 5)]
    versions = dict(mupdf=fitz.VersionFitz, poppler=subprocess.run(["pdftoppm","-v"],capture_output=True,text=True,check=True).stderr.splitlines()[0], tesseract=subprocess.check_output(["tesseract","--version"],text=True).splitlines()[0])
    print(json.dumps(dict(versions=versions, dpi=144, crop=[190,620,550,705], rows=rows), indent=2))
