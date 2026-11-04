"""Run a blinded native-text vs OCR study against an existing loopback Ollama."""
import argparse
import json
import random
import re
import urllib.request
from pathlib import Path

parser = argparse.ArgumentParser()
parser.add_argument("model")
parser.add_argument("--repeats", type=int, default=20)
parser.add_argument("--out", type=Path, required=True)
args = parser.parse_args()
assert args.repeats > 0
args.out.mkdir()  # Refuse to overwrite an existing study.
fixtures = json.loads(Path("evidence.json").read_text())
question = "What are the cancellation terms and what fee would I pay?"
def post(route, body):
    data = json.dumps(body).encode()
    req = urllib.request.Request("http://127.0.0.1:11434/api/"+route, data=data,
                                 headers={"Content-Type":"application/json"})
    with urllib.request.urlopen(req, timeout=180) as res:
        return json.load(res)
meta = post("show",{"model":args.model})
(args.out/"model.json").write_text(json.dumps(meta,indent=2))
schedule = [(route,name,seed) for route in ("native","ocr") for name in fixtures
            for seed in range(args.repeats)]
random.Random(80).shuffle(schedule)
for idx,(route,name,seed) in enumerate(schedule):
    source = fixtures[name][route]
    body = {"model":args.model,"stream":False,"options":{"temperature":0.7,"seed":seed},
            "messages":[{"role":"user","content":question+"\n\nDocument excerpt:\n"+source}]}
    record = dict(route=route,condition=name,seed=seed,request=body)
    if source:
        response = post("chat",body)
        answer = response["message"]["content"]
        record.update(response=response, amount_mentioned=bool(re.search(
            r"\b(?:CHF\s*80(?:\.00)?|80\s*(?:CHF|Swiss francs))\b",answer,re.I)),
            fee_reported=None, status="needs blinded semantic review")
    else:
        record.update(status="no extracted text",fee_reported=None)
    (args.out/f"{idx:04d}.json").write_text(json.dumps(record,indent=2))
