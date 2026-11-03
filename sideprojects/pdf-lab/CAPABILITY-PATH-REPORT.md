# Creative PDF capability path · 2026-11-03

Implemented by Codex (`kind: assistant`) on `feat/pdf-lab-capability-path`, inspected head `458bf107f0b7f073b174d2d1b39b4097287ee9d7` (main `1077ce9` plus #54). Context packet `cp_7cdc6f026054f6d6650d202f`, cutoff `93a5445150d0`, is an ancestor but predates the implementation; current source was checked. The current Commons concept remains authoritative. No accepted decisions or review records changed.

## Working path

`capability-path/capabilities.json` is the shared versioned declaration, including project shape, parameter schema, limits, capability version, adapter identity and the existing but unexposed generator inventory. Its supported example is `capability-path/examples/two-poems.json`; it validates and renders unchanged. Validation rejects unknown fields, versions, IDs, instruments, duplicate inspections, non-ASCII/empty/long lines and oversized requests with field, allowed value and suggested fix.

The compiler calls the unchanged legacy `poems.js` writer against the hash-checked authored fixture. Exactly four printable ASCII lines of 1–32 characters change ToUnicode; all drawn shapes remain fixed. Tests compare the result byte-for-byte with both the unchanged Workbench TypeScript writer and `lab.py poem`. No new PDF engine or frontend migration. The existing browser Workbench retains its current recipe/UI and recorded-evidence semantics; opening project/v1 in that UI is pending.

Each render creates an isolated UUID directory, PDF, original request, evidence JSON and successful measured previews. The returned manifest records absolute paths, media types, sizes and SHA-256, parent hash and generator-source hash. Retrieval accepts only manifest artifact IDs, reads the actual bytes, verifies size/hash, and returns base64 bytes plus the file path. Tests reject traversal, unknown artifacts, tampering and symlinks; interrupted output removes the incomplete render. Rendering and inspection statuses are separate: a generated PDF never implies a successful measurement.

The inspector uses the lab's existing local `check-poems.py` approach/settings: bounded Python child, Poppler `pdftotext -layout` and a 72-dpi first-page render; optional PyMuPDF `get_text`/`get_pixmap`. It does not import the historical test runner, which would regenerate fixtures. Current versions, argv, raw text/stderr, exit codes and source hash are recorded per run. Poppler 26.08.0 measured the example; PyMuPDF is absent and is `not_run`. Native viewer interaction, physical printing and other readers remain untested. Visual review of the generated PNG found the original four-line drawn poem intact and legible; extracted text contains the four requested replacements.

## Demo (from sideprojects/pdf-lab)

```sh
node capability-path/cli.mjs get_capabilities
node capability-path/cli.mjs get_example > /tmp/pdf-project.json
node capability-path/cli.mjs validate_project /tmp/pdf-project.json
node capability-path/cli.mjs render_project /tmp/pdf-project.json > /tmp/pdf-render.json
python3 - <<'PY'
import json
m = json.load(open('/tmp/pdf-render.json'))
json.dump({'renderId': m['renderId'], 'artifactId': 'poem.pdf'}, open('/tmp/pdf-retrieve.json', 'w'))
PY
node capability-path/cli.mjs retrieve_artifact /tmp/pdf-retrieve.json > /tmp/pdf-bytes.json
python3 - <<'PY'
import base64, hashlib, json
from pathlib import Path
r = json.load(open('/tmp/pdf-bytes.json'))
b = base64.b64decode(r['data'], validate=True)
assert b == Path(r['path']).read_bytes()
assert len(b) == r['size'] and hashlib.sha256(b).hexdigest() == r['sha256']
Path('/tmp/retrieved-poem.pdf').write_bytes(b)
print(r['path'], r['sha256'], r['size'])
PY
```

Example PDF: **3125 bytes**, SHA-256 `decf9c66b5082de09674ffbed6c41b0d4bd2707ac08b03cebae72b6ea4ec2753`. The inspected run manifest and raw evidence are retained in `evidence/capability-path/demo-{manifest,inspection}.json`; their `/tmp` locations describe this run, not portable links or promised retention. Re-running reproduces the PDF hash. Generated binary artifacts remain outside Git.

## Local MCP

The installed Commons SDK is `@modelcontextprotocol/server` **2.4.0**. `sdk.mjs` resolves that existing installation explicitly; no dependency was added or installed. Launch with:

```sh
node capability-path/stdio.mjs
```

Only local stdio is exposed: `get_capabilities`, `get_example`, `validate_project`, `render_project`, `retrieve_artifact`. CLI and MCP call the same service, validator and writer. Project arguments are the project object itself. Retrieval returns base64 bytes inside a JSON text result. No remote endpoint/publication, model API or credential is used. The Python protocol smoke initializes MCP `2025-03-26`, lists/calls all five tools, reads the real PDF bytes back, and checks a rejected render. This is a local protocol-client test, **not** a ChatGPT or Claude client qualification.

## Checks and results

- `cd sideprojects/pdf-lab/workbench && npm run typecheck && npm test`: production build and strict TypeScript pass; **27 tests pass, 1 pre-existing test skipped (28 total)**. Ingest reports 40 artifacts, zero hash mismatches/problems.
- `node apps/commons/scripts/smoke/devtools-ready.test.mjs`: 3 tests pass using fetch fixtures.
- `bash -n apps/commons/scripts/smoke/browser.sh`: passes.
- `node sideprojects/pdf-lab/test-poems.js`: canonical identity, xref, mapping-only changes and input limits pass.
- `node sideprojects/pdf-lab/test-cabinet.js`: byte-inspector compatibility passes.
- CLI unchanged-example render and actual retrieval: pass; Poppler measured, MuPDF not_run.
- `git diff --check`: passes. All changes are within the two allowed path prefixes.

Sandbox detail: Node 26.8.1 `spawnSync` reported EPERM, including the old test's Python availability probe. The new bounded runner uses asynchronous child execution, which works for Python and Poppler. The pre-existing Python test therefore skips here, while the new asynchronous Python compatibility test passes. An initial Node SDK-client stdio test failed because child Node asynchronous stdio did not produce/consume data in this sandbox; even a minimal spawned Node stdout reproduction failed. A Python subprocess using OS pipes successfully runs the real SDK server and verifies the same five-tool round trip. No failed attempt is represented as a passing client test. Ingest's source revision is `unknown` here because its existing synchronous Git probe is also restricted; no inventory data is fabricated.

## Boundaries and next step

One capability is intentionally supported; maze/layers and other specimens are inventoried but not advertised as callable. Per service: one concurrent render, 16 KiB request, 2 MiB artifact, 8 MiB total artifacts, 100 stored entries; child limits 10 seconds wall, 8 seconds CPU, 768 MiB address space, 2 MiB file. Store defaults to `/tmp/pdf-lab-capability-<uid>` or operator-configured `PDF_LAB_ARTIFACT_ROOT`; remove old UUID directories locally when full. It is a trusted single-operator local store, not a multi-process quota/locking service or arbitrary-upload sandbox. Retention is manual; do not run multiple writers against one store. Inspector subprocesses never accept arbitrary PDFs or executable request content. No automatic installation, deployment or network isolation claim.

The Commons diagnosis is in `evidence/COMMONS-BROWSER-SMOKE-DIAGNOSIS-2026-11-03.md`. Full Chrome smoke and CI remain unverified, and the prior failed gate remains failed.

The assistant proposal is staged at `evidence/capability-path-proposal-20261103.json` because `.observstory/proposals/` is outside this packet's writable scope. Coordinator next: run the acceptance command outside the sandbox, review only scoped changes, submit the staged proposal through the authorized Observstory PR workflow, and commit if checks pass. Human review alone accepts it. No commit, branch change or PR was made by this worker.
