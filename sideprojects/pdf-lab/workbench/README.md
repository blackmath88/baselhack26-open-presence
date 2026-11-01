# PDF LAB · Workbench

A document-centred workbench around the real PDF LAB specimens and their recorded evidence.
Batch A of [WORKBENCH-BUILD.md](../WORKBENCH-BUILD.md): consolidate (phase 0), encounter (phase 1) and
inspect (phase 2), with a stored reading comparison. The [legacy cabinet](../index.html) stays the working
fallback for every exhibit; removing this folder leaves it untouched.

## Run
```sh
cd sideprojects/pdf-lab/workbench
npm ci
npm run dev            # ingest, then Vite dev server on http://127.0.0.1:3100/
```
Production build and preview:
```sh
npm run build          # ingest, then vite build → dist/
npm start              # node scripts/serve.mjs → http://127.0.0.1:3100/ (HOST/PORT to override)
node scripts/smoke.mjs # production smoke on :3199 (needs a build)
```
Optional live measurement (phase 4), on the same computer as the browser:
```sh
PDF_CHECK_PYTHON=/path/to/python-with-pymupdf-and-pillow npm run runner   # http://127.0.0.1:3110/
```
It accepts requests only from the workbench origins in `RUNNER_ALLOW_ORIGINS` (default `http://127.0.0.1:3100,http://localhost:3100`).

Checks: `npm run typecheck` (strict TypeScript) and `npm test` (adapter contract tests).
Existing legacy tests still run from the parent folder: `node test-poems.js`, `node test-cabinet.js`.

Links to the legacy cabinet go to port 8000 on the same host (the .phf demo contract), or to
`VITE_LEGACY_CABINET_URL` if set at build time. Serve it with `python3 -m http.server 8000 --bind 127.0.0.1`
from `sideprojects/pdf-lab`.

Open directly: `/specimens/a01-two-poems?reading=other&line=2&reveal=true` (also `view=text|compare`,
`reading=visible|direct|raster`). Invalid values fall back to the default view.

## What it does
- **Cabinet:** A01 Two poems as the fully supported specimen, with its real recorded render. Every other
  legacy exhibit appears with its recorded preview (where the cabinet has one) and opens in the legacy cabinet.
- **Encounter:** “Two readings. One picture.” on the recorded MuPDF render, with one reveal action that shows what
  each line's character map says.
- **Inspect:** four line guides (buttons, keyboard and touch). Selecting one opens an inspector: what you see, what
  the file says it means, what MuPDF and Poppler returned, and a chain of how each link is known
  (*parsed from the file*, *recorded run*, *authored guide*, *unknown*), with evidence paths and JSON pointers.
- **Extracted text / Compare:** recorded MuPDF and `pdftotext -layout` output with the selected line marked; the
  visible-mapping and alternate files side by side (identical pixels, different reading); stored MuPDF and
  Poppler renders of the same file.
- **Original:** download the exact PDF without leaving the page; optionally verify its SHA-256 in the browser.
- **Write your own (Batch B):** change what the character map says while the drawn poem stays fixed. The browser
  checks the parent's hash, rewrites only the ToUnicode object, and shows the new file on the same stage with a
  lineage (original → recipe → your file), the objects that changed, its own inspector and downloads for the PDF and a
  versioned recipe. The URL carries the four lines, so reload or a shared link rebuilds identical bytes. **Open a
  recipe…** reads a workbench recipe or a `lab.py poem` JSON locally and reports whether the rebuild matches its hash.
  Your file is labelled *not measured* until you measure it.
- **Measure your file (phase 4):** with the local runner started, **Measure with local engines** sends your PDF (only that)
  to this computer's runner. It runs MuPDF (check-poems.py worker), `pdftotext -layout` and `pdftoppm -r 72` with the lab's
  limits and no network, then shows whether all four of your lines came back and whether your pixels are identical to the
  original's recorded render in each engine. Live runs are labelled *live* with their time and exact tool versions, and are
  shown beside recorded ones, never merged. They are not saved.

## How it is built
- `scripts/ingest.mjs` — deterministic, read-only: copies an allowlist (the four poem PDFs, their previews, two
  evidence reports, legacy previews) to `public/lab/`, hashes every PDF in `output/pdf/` against both manifests, and
  writes `src/generated/lab-data.json`. Both outputs are gitignored. No timestamps; source commit recorded.
- `src/domain/` — record types (artefact, instrument, run, evidence reference, selection, correspondence) and runtime
  checks. No React, no filesystem.
- `src/adapters/` — `mappingWriter` (ported writer), `recipe` (make/read/rebuild recipes), `labData` (inventory and integrity), `poemsResults` (recorded runs, per-instrument versions, stale
  inputs), `poemsTransforms` (stored source renders only), `twoPoemFixture` (static parse of the fixture bytes; rejects
  any structure it was not written for).
- `src/features/twoPoems/` — the model that composes adapters into selections, and the stage, inspector and views.
- `runner/` — the optional loopback measurement runner (`server.mjs`) and its bounded process launcher (`bounded.mjs`).
- `src/routes/` — TanStack Start file routes: `/` and `/specimens/$specimenId` with validated search params.

Pinned: TanStack Start 1.169.4, Router 1.170.46, React 19.3.1, Vite 8.3.5, TypeScript 5.9.3 (strict), Vitest 5.0.5.
TypeScript 7 (the new native compiler) was available; 5.9 was chosen as the established compiler line for this first batch.

## Limits
- All engine output is **recorded** (evidence/poems-results.json, poems-transforms.json). Nothing runs an engine here.
- Line boxes are guides: the glyph's placement plus the font's declared FontBBox, parsed from the file — not measured
  ink and not native PDF text selection. The raster control has no such data, so its boxes are workbench guides.
- The raster control has no stored preview of its own; the stage shows the visible-mapping render its pixels came from.
- Poppler `pdftoppm`'s version is not in the report and is shown as unknown.
- Native viewer copy/paste, OCR and print survival were not run (the report's `not_run`).
- Only A01 has an adapter.
- Authoring is the lab's narrow writer: four printable-ASCII lines of 1–32 characters, on the two-poem fixture only.
  `src/adapters/mappingWriter.ts` is a port of `poems.js` `bend()`; `test/writer.test.ts` holds it byte-identical to the
  legacy writer (40 inputs) and to `lab.py poem` (when Python is available). The legacy files are unchanged.
- Without the runner, a file you make is never rendered or extracted here. The stage shows the original's recorded render, which is valid
  only because the object diff shows the character map is the sole change.
