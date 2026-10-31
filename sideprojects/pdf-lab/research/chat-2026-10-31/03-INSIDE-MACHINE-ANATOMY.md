# Inside: machine anatomy

31 October 2026 · Perplexity, assistant · Research synthesis and proposed investigation track.

## Not one executable language

PDF is a specified representation, not one implementation or CPU instruction set. Separate: (1) file bytes and syntax; (2) content operators and specialised interpreters; (3) the host code implementing them; (4) native machine code reached through debugging or disassembly. Original PostScript ancestry does not make an ordinary PDF page an unrestricted PostScript program.

[Parsing PDF's dialects](https://pdfa.org/parsing-pdfs-dialects/) explains differences between body syntax, content streams, object streams and cross-reference streams. [PDF 2.0 syntax errata](https://pdf-issues.pdfa.org/32000-2-2020/clause07.html) is a primary specification aid.

## The stack to learn

1. Bytes: header, object definitions, stream encodings, cross-references, trailers and revision links.
2. Object graph: booleans, numbers, strings, names, arrays, dictionaries, streams, null and indirect references; some entities also have specialised placement/syntax rules.
3. Document model: catalog, page tree, resources, annotations, form fields, structure tree, metadata, embedded files and signatures.
4. Page description: operands and operators, graphics state, transforms, paths, clipping, painting, text placement and resource invocation.
5. Subsystems: fonts and Unicode mapping; image codecs; colour/shading; transparency; optional content; form/script events.
6. Outputs: pixels, positioned characters, selectable text, logical extraction, interactions and rewritten files.

A content stream is not the entire PDF. A decompressed stream is not the recovered original authoring document. Tags and ActualText may intentionally support readings different from raw drawing order.

## Three particularly creative primitives

- Type 3 glyphs contain PDF graphics programs: [text specification errata](https://pdf-issues.pdfa.org/32000-2-2020/clause09.html), [graphics errata](https://pdf-issues.pdfa.org/32000-2-2020/clause08.html), [PDF Association discussion](https://pdfa.org/inline-images-and-type-3-fonts/). Build an illustration painted as a glyph; inspect mapping, geometry and extraction independently.
- Type 4 calculator functions provide a restricted PostScript subset for function evaluation: [syntax/function errata](https://pdf-issues.pdfa.org/32000-2-2020/clause07.html). Do not call this general PostScript or a general-purpose VM. Exact operator/iteration constraints must be checked before promising a fractal.
- Optional-content membership dictionaries express visibility relationships: [Adobe OCMD API](https://opensource.adobe.com/dc-acrobat-sdk-docs/pdflsdk/apireference/PD_Layer/PDOCMD.html), [OCG API](https://opensource.adobe.com/dc-acrobat-sdk-docs/pdflsdk/apireference/PD_Layer/PDOCG.html). A layer lock is a logic-composition idea; current support is engine-specific. Consult existing WEIRD-MACHINES measurements rather than treating this as unbuilt.

## PDF.js source walkthrough

[Source](https://github.com/mozilla/pdf.js) and [repository architecture](https://github.com/mozilla/pdf.js/blob/master/AGENTS.md). These are live branch links; pin a commit before tracing.

- src/core/: parsing, fonts, image decoding, colour, operators and document processing.
- src/display/: public rendering API, canvas, text/annotation layers and communication.
- src/scripting_api/: PDF scripting environment and exposed APIs.
- web/: viewer shell, navigation, search, attachments and controls.

Proposed trace: one known object -> decoded content -> operator list -> resource resolution -> canvas output. Separately trace positioned text into the selection layer and annotations into interactive elements. Log identifiers at each stage. A screenshot cannot establish those layers are identical.

## PDFium source and fixture path

[Official repository and build guide](https://pdfium.googlesource.com/pdfium/). Source describes a C++ build using Chromium tooling, GN/Ninja, optional V8/JavaScript and XFA features, and a pdfium_test executable. Record build flags, not only a package version. A wrapper and its underlying engine are separate identity fields.

The repository's test machinery includes hand-editable .in templates, fixup_pdf_template.py, JavaScript tests, pixel tests and corpus tests. Inspect current paths at a pinned revision. Use this to construct a matching minimal fixture without manually maintaining all byte offsets. Do not import arbitrary corpus files without checking their purpose and redistribution terms.

## Is extracting/decompiling to code easier and faster?

Often, direct parsing is the right first path for born-digital text: it can recover characters, positions and structure without rasterising everything. But faster is an empirical question: measure CPU time, wall time, memory and fidelity on a specified corpus. It is not universal.

Use the right word:

- Parsing: read syntax and build objects.
- Decoding: reverse stream compression or encoding.
- Disassembly/trace: inspect operators and resources.
- Extraction: recover text, geometry, images or tags.
- Decompilation: attempt a higher-level program/source representation; the original Word/LaTeX/source usually cannot be recovered exactly from a PDF.
- Rendering: evaluate page appearance into pixels.
- OCR: recognise text from pixels.
- Multimodal interpretation: model inference using images and/or extracted information; not necessarily a separate OCR engine.

A sensible lab pipeline exposes structure + extracted text + a rendered reference. Rendering resolves glyph appearance, clipping and compositing that text extraction cannot. Scanned pages require visual recognition to recover text; unreliable mappings and complex layout can make a hybrid route preferable. These are design reasons to compare paths, not benchmark results.

## Deliverables and acceptance, proposed

- Annotated minimal PDF, with offsets and source recipe.
- Object/reference graph with revision and reachability labels.
- Drawing-operator trace linked to page regions.
- Canvas/text/annotation comparison with independently visible layers.
- Source-level PDF.js walkthrough at a pinned commit.
- Matching PDFium fixture, build configuration and raw outputs.

Acceptance: a visitor can follow one visible mark to the responsible objects/operators and explain why an extracted character may differ. No vulnerability or native disassembly is required to satisfy this milestone. Native debugging can follow once the semantic trace is understood.
