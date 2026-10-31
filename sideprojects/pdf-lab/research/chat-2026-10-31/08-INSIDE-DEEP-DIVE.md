# PDF LAB inside: make the document explain its machinery

Research date: 31 October 2026. Author: Perplexity; kind: assistant. Edited, source-linked Markdown edition of the inside-track answer. This preserves substantive findings, source pins, experiments and handoff; it is not verbatim. Citation tokens are replaced with source links. Companion: [Outside deep dive](07-OUTSIDE-DEEP-DIVE.md).

Provenance: no repository changes or native engine builds were made during the research. A local 835-byte fixture and companion generator/manifest/annotation files were generated in that earlier response. The original local files are not included in this Markdown-only commit, and their temporary availability must not be assumed. The measured results below describe that prior execution, not a fresh rerun or committed fixture. A byte map and content stream alone are not a complete runnable file.

## Verdict

The next direction is a microscope for existing strange documents, not another feature catalogue:

Select a mark -> drawing operation -> resource -> object -> bytes -> two implementations.

This is not naturally one-to-one: engines decode, optimise, combine, substitute and cache. Expose those transformations rather than invent a tidy correspondence.

Labels: D documented; R source-reported; M-repo repository measurement not rerun; M-here original response's actual execution; P proposal/inference; ? unresolved.

## 1. Current cabinet and access

Browser retrieval of both supplied GitHub URLs failed; connector access worked. AGENTS.md, RUNNING.md, WEIRD-MACHINES.md and the preserved inward dossier were read.

[RUNNING](../../RUNNING.md), inspected blob 260ecd4fad26bd32923e5cde2704c90a08b62710, reports nine exhibit families and 23 PDFs. [WEIRD-MACHINES](../../WEIRD-MACHINES.md), inspected blob a9c06a327dcb6b7e4b35ac70e5407bbca84c4e6e, records a Type 3 alternate reading, bounded repair examples, an unresolved layer-policy discrepancy and a functioning Type 4 colour program. Its bitmap simulator is a browser simulation, not running inside the PDF. Live form events/selection/save-reopen remain unqualified. These are M-repo, not independently reproduced results.

Recommended sequence: trace existing Type 3 artwork; reduce layer discrepancy; expose colour-function evaluation; then broaden structural mutations. Do not restart the generator.

## 2. The internal stack

```text
physical bytes / objects / streams / xrefs / revisions
  -> resolved catalog/page/resource/annotation graph
  -> decoded page instructions
  -> fonts, images, colour, optional-content and form interpreters
  -> engine IR: operators/page objects/caches
  -> pixels, characters, selection, interaction and rewritten output
```

[Parsing PDF dialects](https://pdfa.org/parsing-pdfs-dialects/) distinguishes body, content-stream, object-stream and cross-reference-stream contexts. [Syntax errata](https://pdf-issues.pdfa.org/32000-2-2020/clause07.html) provides specification corrections, not a replacement for the entire standard.

| Structure | Responsibility | Misconception |
|---|---|---|
| Indirect object | Object/generation identity | Number is not byte offset |
| Stream | Bytes plus length/filter/purpose dictionary | Not every stream is an image or drawing program |
| Xref table | Identity -> file location | Not the semantic graph |
| Object stream | Packs eligible objects | Object may lack a visible numbered obj token |
| Xref stream | Encoded xref records | Not an object stream |
| Trailer/root | Locates catalog/file information | First physical object need not be root |
| Incremental update | New definitions/xref appended | Current rendering omits history |
| Resources | Local names resolve to assets | /F1 is not globally unique |

P: show physical storage, current semantic graph and historical graph separately. Reachability is not visibility. Page Parent and destination back-references are ordinary graph cycles, not recursive computation.

## 3. The locally generated calibration fixture

M-here in the original response: 835-byte PDF 1.4; one page; clipped rectangle; TRACE text; one invisible-border in-document link; no JS or network.

SHA-256: f53451d8b864e5e01a0c08e7f01e9d62313ad4da810fa5e2c11073a60acf06da.

Executed checks: byte/stream assertions passed; strict pypdf 5.4.0 parse passed; pypdf and pdfplumber 0.11.6 extracted TRACE; one annotation. PDF.js/PDFium, rendering, clicking and conformance validation were not run. pdfplumber logged missing CropBox and defaulted to MediaBox. Unembedded standard Helvetica was used; identical host glyph pixels are not promised. Do not relabel this PDF 1.4 example as PDF 2.0 without reviewing font requirements. [Text specification](https://pdf-issues.pdfa.org/32000-2-2020/clause09.html).

Exact 107-byte content stream from offset 290:

```text
q
1 0 0 1 20 30 cm
0 0 100 40 re W n
0.1 0.6 0.8 rg
0 0 120 50 re f
Q
BT
/F1 14 Tf
20 100 Td
(TRACE) Tj
ET
```

```text
trailer.Root -> 1 Catalog -> 2 Pages -> 3 Page
3.Parent -> 2
3.Contents -> 4 Stream
3.Resources.Font.F1 -> 5 Font
3.Annots[0] -> 6 Link
6.destination -> 3
```

| Object | Zero-based offset | Role |
|---|---:|---|
| 1 0 | 9 | Catalog |
| 2 0 | 58 | Pages |
| 3 0 | 115 | Page/resources |
| 4 0 | 257 | Content |
| 5 0 | 414 | Font |
| 6 0 | 511 | Link |
| xref | 632 | Location records |

Annotation rectangle: [15 90 100 120]; local GoTo destination same page /Fit; no external request.

Analytic operator trace, not a renderer log:

| Instruction | Meaning |
|---|---|
| q | Save graphics state |
| cm | Translate geometry (20,30) |
| first re | Construct rectangle |
| W n | Apply clip/end path, no paint |
| rg | Nonstroking RGB colour |
| second re f | Fill larger rectangle through clip |
| Q | Restore graphics state |
| BT | Begin text |
| /F1 14 Tf | Resolve font; size 14 |
| 20 100 Td | Baseline position |
| (TRACE) Tj | Show mapped character codes |
| ET | End text |

Expected visible clip: [20,30,120,70]. Glyph pixels, selection and link target are independent paths. [Graphics](https://pdf-issues.pdfa.org/32000-2-2020/clause08.html), [text](https://pdf-issues.pdfa.org/32000-2-2020/clause09.html).

## 4. Several kinds of programmability

| Component | Mechanism | Reveal |
|---|---|---|
| Dictionaries | Declarative structure | References/inheritance |
| Content | Ordered graphics instructions | State before/after |
| Type 3 | Nested PDF graphics program | Text invoking complex paint |
| ToUnicode | Character-code mapping | Extraction != glyph appearance |
| ActualText | Replacement text | Legitimate semantics vs contradiction |
| Image/filter | Encoded samples/decoder | Bytes -> samples -> appearance |
| Colour spaces | Sample interpretation | Numbers require context |
| Shading | Restricted function evaluation | Inputs/stack/colour output |
| Optional content | Visibility configuration/logic | Stored != currently painted |
| Script/forms | Host runtime/API/events | Capability/permission/persistence |

Type 3 supports graphics with restrictions; recursive glyph descriptions are not a first experiment. [Text rules](https://pdf-issues.pdfa.org/32000-2-2020/clause09.html).

P: resource shadowing artwork: two Form XObjects both call /F1 but bind different local fonts. Teach scope through a picture. P: tiling patterns as tiny reusable scenes; start non-overlapping because neighbouring-cell painting order is implementation-dependent. P: independently inspect colour image and soft mask, then compose them. These mechanisms distinguish extracted assets from final appearance. [Graphics rules](https://pdf-issues.pdfa.org/32000-2-2020/clause08.html).

## 5. Pinned source walkthroughs

Source-reading anchors, not latest-release claims or matches to installed cabinet binaries:

- PDF.js [b7338b8dd4dcc609120601d9bcc4ec0d4c93f7e2](https://github.com/mozilla/pdf.js/commit/b7338b8dd4dcc609120601d9bcc4ec0d4c93f7e2), 20 September 2026.
- PDFium [eced332c93d1e9bcb8e3684352342e55eb2676b3](https://github.com/chromium/pdfium/commit/eced332c93d1e9bcb8e3684352342e55eb2676b3), 24 March 2026.

Some Google-hosted fetches failed; GitHub mirror allowed PDFium interface/template inspection. Inspection was partial, not a complete implementation audit.

### PDF.js

Paths relative to pinned snapshot:

| Stage | Entry points | Capture |
|---|---|---|
| Syntax/references | src/core/parser.js, xref.js | Objects, offsets, resolution |
| Page/resources | document.js, Page.getOperatorList | Stream sequence/resources |
| Evaluation | evaluator.js, PartialEvaluator.getOperatorList | Operation/operands |
| IR | operator_list.js, addOp/getIR/flush | fnArray, argsArray, dependencies/chunks |
| Paint | src/display/canvas.js execution path | Device state/operations |
| Text | Page.extractTextContent/evaluator path | Characters/transforms/grouping |
| Interaction | Text/annotation layers and viewer builders | DOM rectangles/events |

[Document source](https://github.com/mozilla/pdf.js/blob/b7338b8dd4dcc609120601d9bcc4ec0d4c93f7e2/src/core/document.js), [operator-list source](https://github.com/mozilla/pdf.js/blob/b7338b8dd4dcc609120601d9bcc4ec0d4c93f7e2/src/core/operator_list.js), [evaluator tests](https://github.com/mozilla/pdf.js/blob/b7338b8dd4dcc609120601d9bcc4ec0d4c93f7e2/test/unit/evaluator_spec.js).

Inspected operator-list implementation groups repeated images, combines some text sequences and folds some transforms. One source operation can expand; several can collapse. Public output does not automatically retain decoded-stream offsets. IR dump is not faithful source disassembly.

P: retain authored stream/object/decoded byte ranges; engine IR/resource/paint events; explicit one-to-many/many-to-one correspondence. Capture before optimisation for tiny owned fixtures; do not disable normal optimisations and mislabel the result normal viewer behaviour.

### PDFium

[Parser interface](https://github.com/chromium/pdfium/blob/eced332c93d1e9bcb8e3684352342e55eb2676b3/core/fpdfapi/page/cpdf_streamcontentparser.h) exposes Parse, OnOperator, Handle_ConcatMatrix, Handle_Rectangle, Handle_Clip, Handle_FillPath, Handle_SetFont, Handle_ShowText, AddPathObject, AddTextObject and FindResourceObj.

[Rendering interface](https://github.com/chromium/pdfium/blob/eced332c93d1e9bcb8e3684352342e55eb2676b3/core/fpdfapi/render/cpdf_renderstatus.h) exposes RenderObjectList, RenderSingleObject, ProcessClipPath, ProcessPath, ProcessText, ProcessType3Text, ProcessImage, ProcessForm and ProcessTransparency.

Trace decoded content -> handlers -> stateful page objects -> render dispatch -> graphics device. Text extraction uses a separate API path, FPDFText_LoadPage/CPDF_TextPage, not OCR of the bitmap. [Text API](https://pdfium.googlesource.com/pdfium/+/main/public/fpdf_text.h).

Record engine/wrapper commit, compiler, build mode, V8/XFA flags, graphics backend, fonts, OS and architecture. Wrappers are not independent engines. Public API is the supported embedding surface; internal classes can change. [Build documentation](https://pdfium.googlesource.com/pdfium/).

## 6. Matching fixture strategy

[fixup_pdf_template.py](https://github.com/chromium/pdfium/blob/eced332c93d1e9bcb8e3684352342e55eb2676b3/testing/tools/fixup_pdf_template.py) supports header, object, streamlen, xref, trailer and startxref markers.

P: preserve geometry, content, resources and annotation; substitute template headers/length/xref markers; generate PDF; compare decoded instructions and references; render/extract under pinned build. Do not require byte identity with a different-header/newline fixture. This tool fixes bookkeeping, not conformance.

## 7. Canvas, selection and annotation layers

PDF.js has existing independent HTML layer construction in its [test driver](https://github.com/mozilla/pdf.js/blob/master/test/driver.js). Reuse it; pin before implementation.

| View | Shows | Not a guarantee |
|---|---|---|
| Canvas | Painted pixels | Text originated from pixels |
| Text | Positioned spans/strings | Exact glyph outlines |
| Annotation | Targets/widgets/destinations | Every appearance is HTML |
| Combined | Registered layers | One pixel uniquely identifies one operation |

Annotation appearances can be painted as well as represented by HTML interaction. Match viewport, rotation, zoom, device-pixel ratio, font readiness, OCG state and annotation policy. Outline transparent selection/target rectangles. Start with calibration fixture, then Type 3 maze.

## 8. Extraction versus rendering benchmark

Parsing yields objects; decoding yields stream bytes; disassembly yields operators; extraction yields text/positions/assets; rendering yields evaluated appearance; OCR recognises pixels; multimodal interpretation reasons over supplied evidence. Decompilation attempts higher-level reconstruction. Original Word/LaTeX source is generally not uniquely recoverable.

P: compare native extraction, render+OCR, and structure+text+render on four owned classes: ordinary text, scan, contradictory glyph mapping, diagram with transforms/clips. Predeclare visible words versus encoded logical text versus geometry/accessibility/appearance goals. Measure end-to-end and stage time, peak memory, size and task-specific accuracy. Control caches, process startup, fonts, DPI, OCR language and builds. Four fixtures are not a universal benchmark. A fast wrong reading is not equivalent to a correct visual reading.

## 9. Prior work and duplication challenge

| Source | Entry point | Terms/limit |
|---|---|---|
| [PDFSyntax](https://github.com/desgeeko/pdfsyntax) | browse/disasm/get_object/revisions | MIT; beta/incomplete; live branch unpinned |
| [pdfnaut](https://github.com/aescarias/pdfnaut) | content_stream iteration, examples/tests | Apache-2.0; Python >=3.10; limited compliant-document testing reported |
| [MuPDF trace](https://mupdf.readthedocs.io/en/latest/tools/mutool-trace.html) | XML device calls | Retrieved page labelled 1.26.11; not authored-byte provenance; review AGPL/commercial terms |
| [PDF.js tests](https://github.com/mozilla/pdf.js/blob/b7338b8dd4dcc609120601d9bcc4ec0d4c93f7e2/test/unit/evaluator_spec.js) | Minimal evaluator fixtures | Apache-2.0 plus per-fixture/dependency notices |
| [PDFium source](https://pdfium.googlesource.com/pdfium/) | Templates and native stage interfaces | BSD-style plus third-party notices; build burden |
| [Specification errata](https://pdf-issues.pdfa.org/32000-2-2020/clause09.html) | Type 3/resources/text examples | Complements full standard |
| [Corkami](https://github.com/corkami/docs/blob/master/AbusingFileFormats/README.md) | Handcrafted format anatomy | Historical support/assets need qualification |
| [PDFGitPolyglot](https://github.com/ESultanik/PDFGitPolyglot) | make_polyglot.sh/offset tools | 2017, patched Git/Python 2-era archaeology |
| [Undying Dusk](https://github.com/Lucas-C/undying-dusk) | gen_pdf.py/pdf_game | 2020–2021 page-state architecture; old viewer table |
| [pmdb](https://ctan.org/pkg/pmdb), [FitR](https://ctan.org/pkg/fitr) | Source selection/spatial navigation | Historical viewer/setup/LPPL constraints |

PDFSyntax already supplies linked structural navigation. MuPDF already supplies device traces. Our contribution should connect authored bytes, interpretation and visible artefact, not duplicate mature tools.

## 10. Five experiment cards

### I01 — Follow one mark

Question: trace one rectangle/glyph across engines? Build: minimal fixture, then existing Type 3. Controls: direct-path equivalent, one operator/resource changed. Instruments: byte map, decoded trace, PDF.js pre/post-IR, PDFium parser/page/render breakpoints. Hypothesis: an explicit operation/resource chain explains each selected authored mark. Falsifier: unexplained output or optimisation refutes claimed one-to-one map. Demo: artwork reveals construction. Limits: one page <=100 KiB, bounded trace, initial 10-second run.

### I02 — One word, three geometries

Question: pixels, selection and click regions? Build: TRACE fixture, then alternate-mapped glyph. Controls: aligned version, annotation absent, text layer hidden. Instruments: canvas, strings, DOM/PDF rectangles. Hypothesis: each follows independent geometry/mapping. Falsifier: viewport error or absent mismatch. Demo: three toggles expose the illusion. Limits: one page, no scripts/external links, bounded captures.

### I03 — Interrogate the layer lock

Question: explain recorded disagreement? Build: reduce to one OCMD/rectangle; vary policy/expression/reference representation separately. Controls: direct OCG, always-visible, each policy, no-expression/no-fallback. Instruments: structure, independent Boolean table, recorded builds plus separately identified alternate version. Hypothesis: small valid distinction explains repeatable outcome. Falsifier: disappears, invalid fixture or nonrepeatable result. Demo: real disagreement with unknown cause. Limits: eight tiny states; 10-second wall/8-second CPU/768 MiB and capped outputs. Validate semantics before declaring a bug.

### I04 — Colour stack

Question: explain one procedural-image coordinate? Build: existing Type 4 and a stepper for exact used subset. Controls: independent formula, constant swatches, interior samples. Instruments: stream, checked evaluator, numeric colours and rendered samples. Hypothesis: evaluator and formula agree within declared experimental raster tolerance. Falsifier: stack/order/arity or sampled mismatch. Demo: point to a colour and watch calculation. Limits: tiny fixed program, no added recursion/loops, <=64 teaching-stack items and bounded samples. At x=0,y=0 the existing analytic formula predicts (0.5,0.5,0.35); this is not a new renderer measurement. Label our simulator separately from engine execution.

### I05 — What did the reader repair?

Question: which tiny defects yield acceptance/repair/rejection/different interpretation? Build: existing baseline, one xref/length/final-update mutation at a time. Controls: untouched, regenerated valid and known revision. Instruments: raw output/diagnostics, status/resources, objects/text/pixels. Hypothesis: specific prediction per mutation. Falsifier: any other result, including silent acceptance. Demo: explain known facts, not invented recovery algorithms. Limits: fixed list, <=64 KiB, offline subprocess, 10-second wall/8-second CPU/768 MiB, output/page/dimension/decoded-data caps.

Labels: accepted; accepted-with-diagnostics; repaired-if-established; different-interpretation; rejected; timeout; crash; instrumentation-error. Diagnostics alone do not establish repair algorithms. Crash does not prove exploitability.

## 11. Scope challenge

Abandon: new general parser; universal pixel-to-byte promise; binary independence claims; valid/invalid/dangerous ladder; unrestricted PostScript framing.

Defer: proprietary disassembly, recursive stress, more ports, collision generation, broad fuzzing, 3D integration, general Type 4 implementation and universal speed claims.

Investigate: source provenance before optimisation; reuse PDFSyntax; minimal valid OCMD discrepancy; font/coordinate confounders; trace capture without changing ordinary rendering.

First complete result must be small enough to understand every object.

## Agent-ready handoff

```text
Read current guidance and measurements. No accepted-plan overwrite.
Objective: existing Type 3 mark -> instruction -> resource -> bytes -> engines.
PDF.js source anchor: b7338b8dd4dcc609120601d9bcc4ec0d4c93f7e2.
PDFium source anchor: eced332c93d1e9bcb8e3684352342e55eb2676b3.
These are reading pins, not latest versions or installed-binary matches.
Recover/recreate calibration fixture explicitly; this Markdown commit
contains no original generated PDF, generator or companion attachments.
Preserve hashes; expose objects/decoded content; capture operators before
and after optimisation; trace native parser/page/render stages.
Show canvas/text/annotations independently. Export raw evidence.
Physical bytes != current graph; reachability != visibility;
Unicode != glyph; IR != source disassembly; device trace != provenance.
Simulation != PDF execution; library render != viewer qualification.
Reuse PDFSyntax, MuPDF trace and PDFium templates; no new general parser.
Acceptance: explain this mark's instruction/resource and different
selection/click paths. Next reduce existing layer discrepancy.
Owned synthetic files, offline limits; no exploits/callbacks/escape.
No universal novelty, performance or compatibility claims.
```
