# Workbench phase 4 — bounded live measurement, handoff
1 November 2026 · Claude (assistant) · Phase 4 “Compare” of [WORKBENCH-BUILD.md](../WORKBENCH-BUILD.md), first slice,
following the packet in [BATCH-B.md](BATCH-B.md). Not reviewed by a person.

## Base
Stacked on `feat/pdf-workbench-batch-b` (PR #30, open), itself on PR #29. Branch `feat/pdf-workbench-phase-4`.
Only `sideprojects/pdf-lab/workbench/**` and one proposal changed; legacy files untouched.

## What works
- `npm run runner` starts a loopback-only service (`127.0.0.1:3110`) that measures one file per request with three fixed
  operations, the same commands the recorded evidence used:
  `check-poems.py --worker` (MuPDF text + 72 dpi pixel hash), `pdftotext -layout`, `pdftoppm -r 72 -singlefile` (PPM bytes hash).
- On a file made in the browser, **Measure with local engines** sends only that PDF with its SHA-256. The panel answers two
  questions: *did your reading arrive?* (each engine, 4 lines) and *did the picture hold?* (your live pixels vs the
  original's recorded pixels, same engine). Inspector, lineage, download label, text view and stage caption switch from
  *not measured* to *live · time*, with exact versions the tools reported. Recorded and live runs are separate rows.
- Without the runner, the panel says it is unreachable and how to start it; **Check again** recovers without a reload.

## Boundaries (enforced, and reported with each result)
| Concern | What the runner does |
| --- | --- |
| Who can call | Host must be `127.0.0.1:<port>` or `localhost:<port>` (DNS rebinding); Origin must be allowlisted; a custom `x-pdf-lab-runner` header and `application/pdf` type force a CORS preflight, so cross-site forms cannot trigger it |
| What it accepts | Body ≤ 16 KiB whose SHA-256 equals `x-expect-sha256`; only the two-poem fixture family (header, `/TwoPoems` map, objects 1–11); refuses actions or embedded files |
| What it runs | Three argv arrays fixed in code; no shell, no path or operation from the request |
| Limits | 10 s wall (whole process group killed), 8 s CPU, 768 MiB address space, 4 MiB file size (`prlimit`), 4 MiB captured output; one job at a time (429) |
| Network | Empty network namespace (`unshare -rn`) when the host supports it; otherwise the response says “not isolated” |
| Files | Fresh temp directory per job, deleted afterwards; temp paths shown as `$JOB` |

## Checks run
| Check | Result |
| --- | --- |
| `npm run typecheck` | pass |
| `npm test` — 30 tests (21 earlier + 9 runner: process-group kill at wall limit, output cap, no network, origin, Host, header/type/hash/oversize/unknown endpoint, non-fixture and `/OpenAction` refusal, real measurement, mismatched response rejected) | 30/30, none skipped |
| `npm run build`, `node scripts/smoke.mjs` | pass, 11/11 |
| `node test-poems.js`, `node test-cabinet.js` | pass |
| Browser (dev, 1440 and 375): build variant → Measure → 4/4 lines in MuPDF 1.26.11 and pdftotext 26.08.0; MuPDF pixels `0868696d…` and pdftoppm 26.08.0 PPM `7b340b09…` identical to the original's recorded hashes; inspector/lineage/caption update; runner stopped → unreachable state; restarted → Check again → measured; no horizontal overflow at 375 | pass |
Screenshots: `evidence/phase-4/`. The only browser console entries were the network log of the refused health probe while
the runner was deliberately stopped.

A new fact: the recorded report had no version for `pdftoppm`; the live runner reports Poppler pdftoppm **26.08.0**.
That applies to live runs only; recorded runs stay “version not recorded”.

## Limits
- One fixture family; not a general “bring your own PDF” service (phase 5 needs import, quarantine and a reviewed policy).
- Live results live in the page only; there is no persistence or export of runs yet (phase 6).
- The runner needs a Python with PyMuPDF and Pillow (`PDF_CHECK_PYTHON`); without it MuPDF is reported unavailable.
- Pixel comparison is exact-hash only, within one engine; no visual difference image for live runs yet.

## Next packet
1. Export a measurement bundle: recipe + variant hash + live runs (raw stdout/stderr, versions, limits, isolation),
   versioned, re-openable with hash verification (phase 6 groundwork).
2. Live difference images when pixels differ (reuse check-transforms' any-channel mask), shown beside the stored ones.
3. Run the same measurement over the recorded originals and show “recorded then / live now” drift per engine.
