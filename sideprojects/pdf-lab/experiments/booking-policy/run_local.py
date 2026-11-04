"""Run a blinded native-text vs OCR study against an existing loopback Ollama."""
import argparse
import base64
import json
import random
import re
import urllib.request
from pathlib import Path

parser = argparse.ArgumentParser()
parser.add_argument("model")
parser.add_argument("--repeats", type=int, default=20)
parser.add_argument("--out", type=Path, required=True)
parser.add_argument("--routes", nargs="+", choices=("native", "ocr", "image", "combined"), default=["native", "ocr"])
parser.add_argument("--prepare-only", action="store_true", help="Save exact requests without contacting a model")
args = parser.parse_args()
if args.repeats < 1:
    parser.error("--repeats must be positive")
args.out.mkdir()  # Refuse to overwrite an existing study.
root = Path(__file__).resolve().parent
fixtures = json.loads((root / "evidence.json").read_text())
question = "What are the cancellation terms and what fee would I pay?"
def post(route, body):
    data = json.dumps(body).encode()
    req = urllib.request.Request("http://127.0.0.1:11434/api/"+route, data=data,
                                 headers={"Content-Type":"application/json"})
    with urllib.request.urlopen(req, timeout=180) as res:
        return json.load(res)
if not args.prepare_only:
    meta = post("show",{"model":args.model})
    (args.out/"model.json").write_text(json.dumps(meta,indent=2))
schedule = [(route,name,seed) for route in dict.fromkeys(args.routes) for name in fixtures
            for seed in range(args.repeats)]
random.Random(80).shuffle(schedule)
for idx,(route,name,seed) in enumerate(schedule):
    source = fixtures[name]["native" if route=="combined" else route] if route!="image" else ""
    message = {"role":"user","content":question}
    if source:
        message["content"] += "\n\nDocument excerpt:\n"+source
    if route in ("image","combined"):
        message["images"] = [base64.b64encode((root / f"{name}.png").read_bytes()).decode("ascii")]
    body = {"model":args.model,"stream":False,"options":{"temperature":0.7,"seed":seed},
            "messages":[message]}
    record = dict(route=route,condition=name,seed=seed,request=body)
    if not source and "images" not in message:
        record.update(status="no extracted text", fee_reported=None)
    elif args.prepare_only:
        record.update(status="prepared only", fee_reported=None)
    else:
        response = post("chat",body)
        answer = response["message"]["content"]
        record.update(response=response, amount_mentioned=bool(re.search(
            r"\b(?:CHF\s*80(?:\.00)?|80\s*(?:CHF|Swiss francs))\b",answer,re.I)),
            fee_reported=None, status="needs blinded semantic review")
    (args.out/f"{idx:04d}.json").write_text(json.dumps(record,indent=2))
