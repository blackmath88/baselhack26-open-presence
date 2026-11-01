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

## How it is built
- `scripts/ingest.mjs` — deterministic, read-only: copies an allowlist (the four poem PDFs, their previews, two
  evidence reports, legacy previews) to `public/lab/`, hashes every PDF in `output/pdf/` against both manifests, and
  writes `src/generated/lab-data.json`. Both outputs are gitignored. No timestamps; source commit recorded.
- `src/domain/` — record types (artefact, instrument, run, evidence reference, selection, correspondence) and runtime
  checks. No React, no filesystem.
- `src/adapters/` — `labData` (inventory and integrity), `poemsResults` (recorded runs, per-instrument versions, stale
  inputs), `poemsTransforms` (stored source renders only), `twoPoemFixture` (static parse of the fixture bytes; rejects
  any structure it was not written for).
- `src/features/twoPoems/` — the model that composes adapters into selections, and the stage, inspector and views.
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
- Only A01 has an adapter. New authoring links to the legacy cabinet's working “Bend your own four lines” form.
