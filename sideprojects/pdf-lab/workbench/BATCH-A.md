# Workbench Batch A — handoff
1 November 2026 · Claude (assistant) · Implementation of [WORKBENCH-BUILD.md](../WORKBENCH-BUILD.md) phases 0–2,
following [CLAUDE-WORKBENCH.md](../CLAUDE-WORKBENCH.md). Not reviewed by a person.

## Base and head
- Base: main `4c998e90408100de4b04c8af83b0024d9f3c0162` (unchanged since the blueprint) plus the blueprint branch
  `docs/pdf-workbench-build-blueprint` (PR #27) merged in at `768e8c5`, since PR #27 is not merged yet.
- Branch `feat/pdf-workbench-batch-a`; implementation commit `b857c7b`; this report and the proposal are the next commit.
- Hosted knowledge (retried): reachable; `resolved_commit` 4c998e9, `complete: true`, `diagnostics: []`, generated
  2026-11-01T08:03:02Z. Hosted snapshot reachable, generated 2026-11-01T08:02:46Z. The PDF records it selects
  (module-pdf-history, research-pdf-history-*) predate the workbench; nothing there changes this batch.
- Concurrent work: PR #24 (PDF Lab guided opening) adds `opening.*` files beside the cabinet; this branch touches none
  of them. PR #26 is research only.

## Changed paths
Only `sideprojects/pdf-lab/workbench/**` and `.observstory/proposals/pdf-workbench-batch-a-2026-11-01.json`.
No generator, PDF, evidence, legacy page, Commons, Observatory or presentation file changed; `git status` outside
`workbench/` was clean after every check, and the four poem PDFs still hash to their manifest values.

## What works
A newcomer can open the cabinet, open A01, read the page, press **Reveal the other reading**, select any line by
mouse, touch or keyboard, read what the file says it means and what MuPDF and Poppler returned, follow each link to
the named evidence (file path + JSON pointer, source commit), switch between the alternate, visible, direct-text and
raster files, compare files and renderers, and download the exact original (optionally re-hashing it in the browser)
without losing their place. Every state is a URL; reload, back and forward restore it.

| State | Recorded or live | Source |
| --- | --- | --- |
| Page images | recorded MuPDF 1.26.11 renders, 72 dpi | evidence/previews/01-poem-*.webp |
| Extracted text | recorded MuPDF (PyMuPDF 1.26.6) and pdftotext 26.08.0 `-layout` | evidence/poems-results.json `/runs/*` |
| Drawn line, mapping, placement, FontBBox | parsed live in the browser from the ingested fixture bytes | output/pdf/01-poem-{visible,other,direct}.pdf |
| Pixel equality between files | recorded checks | poems-results.json `/checks` |
| Renderer comparison | recorded MuPDF and Poppler renders of the unchanged files | evidence/poems-transforms.json `/rows/*` (source rows only) |
| File hash check | live, Web Crypto, in the browser | served bytes vs inventory |
| Native copy/paste, OCR, print | **unknown**: not run (report `not_run`) | — |

## Checks run
| Command | Result |
| --- | --- |
| `npm run typecheck` (strict, `noUncheckedIndexedAccess`) | pass |
| `npm test` — 13 adapter contract tests: valid records, missing/corrupt report, unsupported schema, hash mismatch, duplicate inventory, malformed hash, missing version stays null, stale input, codespace vs bfchar, direct control, unsupported structure | 13/13 pass |
| `npm run build` | pass |
| `node scripts/smoke.mjs` (production server): server-rendered cabinet, deep link with selected line, raster deep link, invalid params fallback, unknown specimen (404 + legacy link), all 17 published assets byte-identical to the inventory, unpublished PDFs not served, path traversal refused, POST refused | 9/9 ok |
| `node test-poems.js`, `node test-cabinet.js` (legacy, parent folder) | both exit 0 |
| Browser, production build at 1440: cabinet → specimen → line 4 → Extracted text → back restores line 4; keyboard Enter on a line guide moves focus to the inspector heading, Escape returns focus to that guide; Verify bytes matched; legacy link resolves to :8000; no console errors; all requests 200 | pass |
| Screenshots at 1440 / 768 / 390 inspected (in `evidence/batch-a/`) | two defects found and fixed: reveal chips covered the verse at phone width (now a list under the page, chips only on a wide stage); inspector came after the authoring card on phones (now directly after the stage) |
Two real bugs were found by these checks and fixed: the ToUnicode parser read the codespace range as a mapping, and
the router keeps raw search values under validated ones, so an invalid `?reading=` crashed rendering.
Not run: test-poems-browser.js (needs Playwright via NODE_PATH; the browser writer was not touched), Python
checkers/regenerators (by design), a screen reader pass, prefers-reduced-motion emulation (the only motion is a
hover transition gated by `prefers-reduced-motion: no-preference`; scrolling is instant).

## Decisions taken in this batch (routine, recorded here)
- TypeScript 5.9.3 rather than 7.0; no UI component library; no PDF.js (recorded renders only).
- Generated data is bundled as JSON (~88 KB) rather than fetched, so server rendering and deep links work without
  a data API; assets are served from `public/lab/` copies, never from the parent folder.
- Line regions use the declared FontBBox from the file; the raster control gets an explicitly authored guide.
- `CorrespondenceKind` adds `parsed` (static parse of file bytes) beside the blueprint's authored/measured/inferred/
  unknown, so a byte-level fact is not presented as an engine measurement.
- No feature registry yet: with one supported specimen it would be an empty abstraction. Add it with the second.

## Limits and unknowns
See README “Limits”. In short: no live engine, upload or authoring; guides are not native selection; pdftoppm version
unknown; raster preview reused from the visible file; only A01 inspectable; legacy cabinet must be served separately.

## Next packet — Batch B (narrow real authoring)
1. Move `poems.js`'s mapping writer behind a pure module the workbench can import without DOM globals; keep the
   legacy page's API and `test-poems.js` byte-parity test unchanged.
2. Add `Recipe` (schemaVersion 1: parent artefact sha256, four lines, writer version) and `Variant` (output sha256,
   parent, recipe) to `src/domain`, with validation and tests for the existing 4×1–32 printable-ASCII guard.
3. “Make variant” in the inspector: edit the selected line (others prefilled from the current map), build in the
   browser, show the new file on the same stage with the parent's render labelled “drawn pixels unchanged by
   construction; not re-rendered”, and mark every engine row **not measured**.
4. Download the variant and its recipe JSON; reopening a recipe re-derives the same hash or reports a mismatch.
5. Lineage strip: original → variant with both hashes. No server, upload or command runner.
6. Checks: parity with `poems.py` for the canonical lines, invalid input rejected, recipe round-trip, 1440/768/390
   walkthrough. Phase 4 (bounded live MuPDF/Poppler jobs) stays separate.
