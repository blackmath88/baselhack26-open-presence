# Workbench Batch B — handoff
1 November 2026 · Claude (assistant) · Phase 3 “Bend” of [WORKBENCH-BUILD.md](../WORKBENCH-BUILD.md), following the
Batch B packet in [BATCH-A.md](BATCH-A.md). Not reviewed by a person.

## Base
Stacked on `feat/pdf-workbench-batch-a` at `f8d65b3` (PR #29, open). Branch `feat/pdf-workbench-batch-b`.
Only `sideprojects/pdf-lab/workbench/**` and one proposal file changed. Legacy `poems.js`, `lab.py`, fixtures and evidence
are untouched (`git status` outside `workbench/` clean after every check).

## What works
From any line's inspector, **Rewrite this line…** opens the authoring panel with the current mapping prefilled and that
line focused. **Build my PDF**:
1. fetches the served parent PDF and checks its SHA-256 against the inventory (mismatch → nothing is written);
2. rewrites only the ToUnicode object with the ported writer;
3. parses the new bytes back (drawn lines, mapping, placements) and diffs objects against the parent;
4. shows the result under **Yours**: a lineage strip (original → recipe → your file, with hashes and “not measured”), the
   stage with your reading revealed, an inspector whose engine row says *not measured*, a text view that says there is
   no extraction and how to measure it, and a compare table (drawn / original map / your map);
5. offers **Download your PDF** and **Recipe** (`pdf-lab.two-poems.mapping-recipe` v1: parent path/hash/bytes, lines,
   writer and parity reference, output hash/bytes).
The URL holds `mine` (the four lines) and `from` (parent), so reload, back/forward and shared links rebuild the same bytes.
**Open a recipe…** reads a workbench recipe or a `lab.py poem` JSON from disk (never sent anywhere), rebuilds it, and
the lineage says whether the rebuild matches the recipe's recorded hash.

## Why a port instead of importing poems.js
`poems.js` is a classic script used by `index.html` (global, `<script defer>`) and by `test-poems.js` (`require`). Making it
importable as an ES module would change how the legacy page and its test load it. Instead the workbench carries a typed
port and `test/writer.test.ts` holds it byte-identical to `poems.js` on the canonical lines from both mapped parents and
on 40 varied inputs (including `( ) \\ < > %` characters), rejects the same invalid inputs, and matches `lab.py poem` for custom lines.
If the writer ever changes, the parity test fails until both agree.

## Checks run
| Check | Result |
| --- | --- |
| `npm run typecheck` | pass |
| `npm test` — 21 tests (13 Batch A + 8 new: legacy parity ×4, Python CLI parity (ran, not skipped), recipe round-trip, parent-hash refusal, future schema / bad lines / unrelated JSON) | 21/21 |
| `npm run build` | pass |
| `node scripts/smoke.mjs` — 11 checks incl. new: variant deep link renders and builds client-side; invalid variant line falls back to the original | 11/11 |
| Browser, dev and production: inspector → Rewrite line 2 (focus lands in line 2's input) → Build → lineage shows object 9 only; reload rebuilds hash `f5d4c428…`; imported recipe with a wrong hash → mismatch shown; real `lab.py poem` recipe (temporary output) → “Rebuilt bytes match”; variant inspector keyboard focus | pass |
| Independent check of the browser's output (outside the app): regenerated with legacy `poems.js` → same SHA-256 `f5d4c428…`; `pdftotext -layout` 26.08.0 and MuPDF 1.26.11 (PyMuPDF 1.26.6) on that file both return “Paper boats remember the rain.” | pass |
| Screenshots 1440 / 768 / 390 (`evidence/batch-b/`) inspected | no overflow; lineage stacks on phones |
The independent extraction above is my manual evidence for this handoff. The app does not show it and still labels
visitor files *not measured*, because it measured nothing.

## Limits
- Narrow writer only: four printable-ASCII lines, 1–32 characters, the A01 fixture.
- No rendering or extraction of new files in the workbench (phase 4).
- Recipes are not persisted beyond the URL and the downloaded JSON; no account, server or upload.
- The stage shows the parent's recorded render for your file; that is justified only by the object diff.

## Next packet — phase 4 (bounded live measurement)
1. A loopback-only local runner (`127.0.0.1`, origin/host checked, POST with CSRF-safe token) exposing two allowlisted
   operations: `mupdf-text-render` and `pdftotext-layout`, argv arrays only, the existing limits (10 s wall, 8 s CPU,
   768 MiB, 4 MiB output), isolated temp directory, network disabled, process-group kill on timeout.
2. Input: a variant's bytes plus its recipe; the runner re-hashes before running and records `Run` objects with
   `origin: 'live'`, exact versions from the tools themselves, stdout/stderr, exit code and limits.
3. The workbench replaces “not measured” with those runs only when the runner is reachable and the hash matches;
   otherwise unchanged. Pixel comparison against the parent's recorded MuPDF hash shows whether the picture truly held.
4. Tests: runner refuses foreign origins, oversize input, unknown operations; timeouts kill the process group; a
   recorded and a live run are never merged into one row.
