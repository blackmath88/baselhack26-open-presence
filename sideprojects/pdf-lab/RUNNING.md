# Working cabinet 003
31 October 2026. Nine exhibit families, 23 generated PDFs, a local cabinet with live byte inspection, deterministic recipes and recorded observations.

## A01 — two poems, one visible page

A01 adds four specimens to the existing cabinet (27 PDFs total). Open `index.html#poems` for the actual-file selector, mapping reveal and browser control that builds a downloadable PDF from four custom lines. [Recipe and measured limitations](TWO-POEMS.md).

```sh
python3 lab.py poems
python3 check-poems.py
node test-poems.js
```

This focused route preserves the earlier 23 artifacts. MuPDF 1.26.11 and Poppler 26.08.0 render the two mapped versions identically within each engine and extract the intended different strings. Poppler joins/reorders mapped lines; lineation and native copy/paste remain unqualified. Raster extraction is empty in both engines. A real Chromium workbench smoke downloaded a custom PDF and verified its extraction in both engines and pixel identity in MuPDF. See `evidence/poems-results.json` and `evidence/poems-browser-results.json`. No deployment implied.

## A01 — which poem survives a new file?

```sh
python3 check-transforms.py
```

This reads the current A01 fixtures without rebuilding them. Four clone/rewrite derivatives, their own manifest, raw extraction and pixel differences form the [transformation notebook](TRANSFORMATION-NOTEBOOK.md). A pypdf clone preserves the readings and pixels. Ghostscript 10.08.0 pdfwrite collapses both different maps to the same output bytes: both extractors return A–D instead of verse. Poppler pixels remain equal; MuPDF changes 3,043 pixels at 72 dpi. The gallery's `#poem-journey` control selects actual artifacts and measured renders/difference masks, then reveals extraction. Physical printing and native viewer copy/paste remain unrun.

## A01 — minimized mapping loss

```sh
python3 minimize-mapping.py
```

[One glyph, three maps](MAPPING-MINIMAL.md) reduces the rewrite observation to seven-object PDFs. Ghostscript 10.08.0 preserves the A and nonidentity Z controls, while SEA becomes A in both extractors. Raw source/output CMaps and two-engine render measurements are recorded separately; six small experimental PDFs live in `output/mapping-minimal/`. Existing cabinet and transformation artifacts are unchanged. Open the minimization drawer in `#poem-journey`. This is a bounded observation, not a universal mapping-length rule or bug verdict.

## Start here
From `sideprojects/pdf-lab`:

```sh
python3 lab.py build
python3 -m http.server 8080 --bind 127.0.0.1
```

Open http://127.0.0.1:8080. The actual PDFs are in `output/pdf/`. Previews are labelled renderings; the gallery does not pretend to emulate PDF form interaction. All specimens are owned, synthetic and local. No hosting or account setup is needed.

Generation uses Python's standard library only. `04-two-identities.pdf` additionally carries a real ZIP archive. Its source members are part of its construction, so source changes intentionally change its hash. No network requests, executable payloads or external actions are embedded.

## Bend the first exhibit
```sh
python3 lab.py bend --seed 17 --word RABBIT
python3 lab.py inspect output/bends/maze.pdf
```

The seed changes the maze geometry; the word changes the glyph's Unicode mapping. A JSON sidecar records the parameters and hash. The original cabinet specimens stay unchanged.

## Inspect and recover
```sh
python3 lab.py inspect output/pdf/04-two-identities.pdf
python3 -m zipfile -l output/pdf/04-two-identities.pdf
python3 lab.py history output/pdf/05-object-17.pdf
python3 recover.py output/pdf/05-object-17.pdf --out recovered
```

`inspect` uses pypdf and does not execute actions. `recover.py` follows validated classic xref tables and `/Prev` links. It supports these authored fixtures, not arbitrary PDF grammar or xref streams. It rejects inconsistent offsets, cycles, unsupported trailers and oversized inputs. It does not split blindly at every EOF marker.

The gallery's byte inspector fetches the actual file and shows a SHA-256, hex/ASCII window, current xref, old/new object 17 and ZIP marker. It is a navigation aid, not a validator. Serve the folder over localhost: direct file:// access commonly blocks fetch.

## Reproduce the evidence
Verification environment: Python 3.12.14, PyMuPDF 1.26.6, pypdf 6.10.0, Pillow 12.3.0, Poppler 24.02.0 and Ghostscript 10.02.1. Info-ZIP tests the archive; Node tests the machine and byte-inspector logic. Python dependencies are pinned in `requirements-check.txt`; obtain Poppler, Ghostscript and unzip through the platform package manager.

```sh
python3 check-cabinet.py
node test-machine.js
node test-cabinet.js
```

The cabinet runner includes the original `check.py` checks. It builds twice for reproducibility, tests actual render/extraction semantics, verifies archive integrity, reconstructs the prior revision, exercises malformed-input rejection and records print-mode output. `check.py` can still run alone without Ghostscript/Pillow. Gallery previews are generated by `check-cabinet.py` and committed as WebP; the full PNGs are intermediates.

The POSIX runner limits each child to 10 seconds wall time, 8 seconds CPU, 768 MiB address space and 2 MiB file output. Both mutated-PDF extraction and rendering run in child processes. This is a controlled fixture runner, not an arbitrary-upload security sandbox. Use disposable offline environments for active viewer tests.

## What is implemented and observed
| Exhibit | Artifact | Observation | Remaining boundary |
| --- | --- | --- | --- |
| 01 One letter | Original, alternate reading, direct-drawing control | Pixel-identical in two engines; different extraction; one Type 3 CharProc draws the maze | Interactive selection untested |
| 02 Backstage | AcroForm/JavaScript toy machine | Canonical fields, appearances and logic checks pass | Live viewer events and save/reopen unqualified |
| 03 Repair bench | Baseline plus xref, length and truncation mutations | All render identically to baseline within each tested engine; diagnostics differ | No crash, divergent picture or exploit demonstrated |
| 04 Two identities | One PDF/ZIP polyglot | Same hash read as PDF and archive; source members and CRCs verified | Tolerated hybrid; universal or strict conformance not claimed |
| 05 Missing object | Incremental-history mystery, original and rewrite control | `/Prev` recovery is byte-identical to original; current extraction omits witness; witness bytes remain in incremental file | Recovery tool intentionally supports a narrow grammar |
| 06 Print trap | Print-only route annotation | Ghostscript screen vs print changes maze solution visibility; header/footer stay identical | Physical printer and other viewers' print modes untested |

### One letter
The seeded maze is one Type 3 glyph invocation; the PDF also has normal title/caption text. Mapping A to LOST changes extracted text while preserving pixels. The direct-drawing control exercises the same geometry outside the font. Inspect `/CharProcs`, `/ToUnicode` and the page content stream.

### Backstage
Enter `backstage` and press the page's Enter button. Step alternates LOAD/ADD and DRAW operations; Run is bounded; Reset clears eight memory cells. JavaScript logic is tested in Node with a mock document API. There is no installed interactive PDF viewer in this environment; rendering or logic checks are not live-viewer qualification. The PDFium library available here has no V8 support, so it cannot establish JavaScript compatibility. A full pixel-machine expansion is still open.

### Reader repair
Xref and stream-length substitutions preserve byte widths, isolating the intended defect. MuPDF reported xref repair and a length warning; Poppler's extractor emitted no diagnostics. The truncated final update was accepted without warnings. Within each engine, all mutation render hashes equal its baseline hash. Different diagnostics alone do not establish different recovery algorithms.

### Polyglot
An uncompressed ZIP follows the PDF. Its offsets are absolute to the complete file. The ZIP comment contains the final PDF startxref/EOF pointing back to the original cross-reference table. The exact input bytes pass Python zipfile and Info-ZIP integrity checks and are readable by pypdf, MuPDF and Poppler. It contains no `/EmbeddedFiles` entry. Opening it as an archive is a second interpretation, not clicking a PDF attachment.

### Missing object
Object 17 is first the witness's page stream. An incremental update replaces its definition. The original stream remains in the earlier prefix; its recovered hash matches `05-original-witness.pdf`. The rewrite control serializes only current objects: same current pixels, no witness marker in its bytes. The deliberately constructed rewrite does not imply that all applications' Save As operations erase history.

### Print trap
A Stamp annotation contains the solved route with flags Print + NoView. Ghostscript 10.02.1 at 96 dpi produces 400 red pixels in screen mode and 41,542 in print mode; the title/footer pixels remain identical. These are renderer print-intent observations, not physical-printer measurements. The route is present in the file even when hidden.

## Evidence and provenance
- `evidence/results.json`: versions, input hashes, commands, extraction output and diagnostics.
- `evidence/cabinet-results.json`: polyglot member hashes, revision offsets, render hashes, print-mode checks and limits.
- `output/pdf/manifest.json`: hashes and sizes for all thirteen PDFs.
- `exhibits.py`: all three new mechanisms; `build.py`: base PDF writer and first cabinet.
- `recover.py`: scoped xref reader; `lab.py`: bend/inspect/history CLI.
- `cabinet.js`: actual-byte viewer and rendered-view switches; pure byte helpers have Node tests.

Primary references: [Corkami format abuse](https://github.com/corkami/docs/blob/master/AbusingFileFormats/README.md), [PDF syntax and revision errata](https://pdf-issues.pdfa.org/32000-2-2020/clause07.html), [Ghostscript print settings](https://ghostscript.readthedocs.io/en/latest/Use.html#dprinted-dprinted-false). These are references, not claims that the implementation is novel. No third-party code or artwork was copied into the specimens.

## Handoff
Completed: three new real mechanisms, parametric glyph generation, history recovery, byte inspection, seven rendered previews and expanded tests. Existing generated artifacts remain available. The main application and hosting configuration were not changed.

Open: live B02 viewer qualification, physical print comparison, broader archive/viewer compatibility and any actually divergent parser specimen. The cabinet is a local/repo deliverable, not a newly published site. No separate repository was created.

Source tree inspected at fc3e143374d40cc4ac1e47cc06429e697e934bb9, listing complete. Published knowledge/snapshot endpoints again failed; generated completeness and diagnostics could not be verified. Source knowledge manifest was read earlier and its blob was unchanged. No AGENTS.md appeared in the inspected tree.


## Cabinet 003 — layer logic, bitmap computation and colour code

```sh
python3 -m pip install -r requirements-check.txt
python3 build.py
python3 check-weird.py
node test-weird.js
```

Poppler is also required on PATH. `check-weird.py` records all eight default layer states in MuPDF, Poppler and PDFium, and evaluates six colour-function samples per engine. Browser rendering and actual layer-panel interaction remain untested. The gallery uses actual recorded renders; its bitmap circuit is a separate browser simulation. No interactive browser was available for end-to-end UI testing in this environment.

Measured on 2026-10-31: Poppler 24.02.0 and PDFium 156.0.8076.0 match all lock indicators; MuPDF 1.26.11 through PyMuPDF 1.26.6 differs on the gate, AllOn and AnyOff. Cause unassigned. The colour formula passes sampled comparisons in all three engines. The five-NAND half-adder passes 327,680 bitmap-pair tests against independent XOR/AND expectations. See `evidence/weird-results.json` and `WEIRD-MACHINES.md` for exact scope and falsifiers.

New source: `weird.py`, `weird.js`, `check-weird.py`, `test-weird.js`. Build remains standard-library-only. Verification adds pinned pypdfium2. New reports do not assert current vulnerabilities or reproduce any codec exploit. Hashquine and scan-substitution work is queued with explicit controls, not presented as measured.

Review sequence: inspect PDF object structure, render all fixture states in independent processes, compare sampled panels, visually inspect representative PDFs, run existing cabinet tests and verify local links. The GitHub Pages knowledge/snapshot endpoints were unavailable during this session; the previously read source project knowledge was retained. Changes remain scoped to the optional `sideprojects/pdf-lab` project.
