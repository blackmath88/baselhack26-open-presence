# Alternate readings, playback and experimental interpreters

Added 31 October 2026 from Achim's supplied research report. This is an addition to the workbench plan, not a new measured cabinet release. Cabinet 003 remains nine exhibit families and 23 generated PDFs.

The [original supplied report](research/2026-10-31-alternate-readings-supplied.txt) is preserved verbatim, including its caveats and full bibliography. Its first-person research claims belong to the report's author. The sources below were not independently rerun or reverified during this import. Licence and compatibility statements are source-reported leads, not clearance to redistribute code or binaries.

## The creative direction

Make a document with several intentional readings, then give visitors the tools to discover how each reading is produced. Expand the cabinet in three directions:

- **Alternate readings:** visible composition, extracted message and recoverable embedded material.
- **Playback:** a constrained document runtime becomes a demo platform.
- **Experimental interpreters:** a named custom reader activates another representation while ordinary readers retain a useful fallback.

The editorial rule to adopt: **a lab report should contain a working instance of the feature it explains wherever practical.** A font report yields an alternate reading; a revision report retains an earlier draft; an attachment report carries its source. Always identify which representation is authoritative for which purpose. The existing revision mystery and PDF/ZIP exhibit are starting points, not evidence that these new techniques have been reproduced.

## Prior-work leads

All descriptions in this table are attributed to the supplied report. “Unknown” means not established here.

| Lead | Reported mechanism / material | What to inspect next | Status and reuse boundary |
|---|---|---|---|
| [thoppe/PDF_steganography](https://github.com/thoppe/PDF_steganography) | Font mapping reveals another message through copy/paste; source, example, Makefile and traditional font tools | Trace glyph, character code and recovered character through `example.tex`, `replace_sub.py`, `sub_cipher.py` and Makefile | Historical; current builds/viewers unknown; no licence evident to report author |
| [ncanceill/pdf_hide](https://github.com/ncanceill/pdf_hide) | Research prototype with samples/tests; Python 3 and qpdf for compressed PDFs | Read actual encoding/decoding code before naming its carrier; document exact transformation sensitivity | December 2012 research origin and GPLv3+ reported; mechanism still unverified |
| [aagallag/PDFStego](https://github.com/aagallag/PDFStego) | PoDoFo C++; AES-128-GCM ciphertext encoded as Base64 and embedded; extraction may expose it | Identify carrier, authenticated-encryption parameters and extraction behaviour | 2016 / GPLv3+ reported; current compatibility unknown |
| [esdmr/badpdf](https://github.com/esdmr/badpdf) | Bad Apple playback in JavaScript-enabled PDF viewers | Establish display primitive, frame representation, scheduler and frame-data cost from source | Report author could not fetch full repo; detailed mechanism and licence unknown |
| [Asymptote](https://github.com/vectorgraphics/asymptote) and [interactive example](https://www.pakin.org/~scott/asymptote_export/blender_asymptote.pdf) | Embedded PRC geometry with static poster fallback | Trace owned geometry through generator, embedded object, poster and supported reader | Historical compatibility statement; current reader behaviour unknown |
| [pdfv3dReader](https://github.com/vectorgraphics/pdfv3dReader) | Dedicated V3D-aware reader using PDF.js | Locate format detection, model extraction and display integration; pin viewer separately from PDF engine | Custom-reader functionality; do not infer ordinary viewer support |
| [Okular-v3d-Plugins](https://github.com/vectorgraphics/Okular-v3d-Plugins) | V3D integration with a Poppler-based PDF plugin; version-matching and prerendering reported | Trace rich-media bytes to model coordinates, compositor and interaction | Significant build burden; defer from first-demo path |
| [PoC\|\|GTFO 0x04](https://archive.org/details/pocorgtfo04) | Format-craft publication with PDF/ZIP and encrypted-volume techniques | Read relevant original articles; distinguish attachment semantics from a dual-format archive | Archaeology lead; use owned text archives, not legacy volume tooling |

Supporting source leads: [Asymptote tutorial](https://asymptote.sourceforge.io/asymptote_tutorial.pdf), [author's 2026 presentation](https://www.math.ualberta.ca/~bowman/talks/tug26.pdf). PRC and V3D must remain distinct representations in the notebook. The long supplied bibliography includes unrelated search hits; preservation does not promote those hits to evidence.

## Proposed build queue

### A01 — Copy the poem to read the other poem

- **Question:** can both the rendered and extracted readings be coherent original works?
- **Build:** extend the existing glyph/mapping bench with two owned poems. Inspect the historical font approach before choosing a carrier; label a ToUnicode or ActualText remix by its actual mechanism rather than claiming it reproduces that project.
- **Controls:** ordinary mapping, same rendered glyphs with alternate mapping, and raster-only output. Keep text changes independent of layout changes.
- **Instruments:** at least two independent extractors and renderers; manual copy/paste with reader/version recorded; OCR of the raster control.
- **Hypothesis:** the mapping variant changes extraction while leaving pixels unchanged within each renderer. Rewrite and print survival remain separate questions.
- **Falsifier:** changed pixels, missing alternate reading, or divergent extractor results. Preserve differences rather than normalising them away.
- **Demo:** read, copy, reveal the map, then transform it and see which poem survives.
- **Acceptance:** both original poems, inspectable mapping, reproducible recipe and consumer matrix. This extends exhibit 01; it need not become another font tool.

### A02 — The document has a cellar

- **Question:** which representational freedoms carry an owned message, and which transformations destroy it?
- **Build:** first inspect `pdf_hide` source and name its exact channel. Use a small owned phrase and record the encode/decode path. Compare with a clearly documented synthetic carrier if the historical tool cannot be built.
- **Controls:** unmodified source, no-payload encoded file, identity pass, and a known payload. Keep secret-recovery checks separate from visual-change checks.
- **Transformations:** structure rewrite, font substitution, rasterisation, OCR reconstruction and print-to-PDF. Name the actual tool and settings; do not treat these as interchangeable operations.
- **Hypothesis/falsifier:** survival depends on the carrier; write a specific prediction only after inspecting it. Recovery failure or unexpected visible change rejects that prediction.
- **Demo:** a survival table with independent columns for recoverable payload, rendered difference and extraction difference. Unrun transformations remain unknown.

### A03 — The second letter is hidden, not undiscoverable

- **Question:** can visitors distinguish concealment, discoverability and confidentiality?
- **Build:** use two owned letters; inspect PDFStego rather than implementing new cryptography. If the artwork publishes a key, explicitly present confidentiality as intentionally surrendered.
- **Controls:** plaintext carrier, ciphertext carrier, correct key, wrong key and modified ciphertext. Verify authenticated-decryption failure with the chosen implementation.
- **Hypothesis:** ordinary extraction can disclose the carrier without recovering plaintext without the key. This is a tool-specific test, not a claim of steganographic undetectability.
- **Falsifier:** extraction misses the carrier, the reader visibly paints it, or the encryption implementation fails its authentication controls.
- **Demo:** three separate answers: can I see it, can I find it, can I read it? Do not present an intentional alternate interface as device access.

### A04 — Ten seconds of owned motion

- **Question:** how much animation can this particular PDF runtime sustain?
- **Build:** inspect Bad Apple's implementation, then generate original abstract frames. Do not redistribute its media by default. Identify whether the mechanism is fields, drawing operations, media annotations or something else before naming the exhibit.
- **Controls:** one static frame, stepped playback, timed playback and a known frame counter. Include a useful static fallback.
- **Instruments:** named viewer/product/engine versions, observed load time and elapsed playback, frame count, file-size split between logic and data. A JavaScript unit test is not viewer playback evidence.
- **Hypothesis/falsifier:** a specific tested viewer advances all frames in order within a stated timing budget. Stalls, dropped frames, wrong order or timing failure reject it.
- **Demo:** same authored sequence in multiple viewers, including explicit unsupported results.

### A05 — Blueprint becomes sculpture

- **Question:** what information exists in the model but not the poster, and vice versa?
- **Build:** generate one owned geometric object with an interior feature and labelled faces. Start with PRC/Asymptote as a bounded investigation, then separately evaluate V3D. Retain source geometry and a useful static poster.
- **Controls:** poster-only PDF, model-bearing PDF and the original model. Check scale, labels and hidden surfaces against source geometry.
- **Instruments:** a qualified supported reader plus ordinary readers, attachment/annotation inspection and a print/raster pass. Record version and any opt-in required for 3D.
- **Hypothesis/falsifier:** a named reader exposes model rotation while fallback readers retain the poster. Missing geometry, misleading poster or lost fallback rejects the intended experience.
- **Demo:** rotate the blueprint to find something the flat page could never show. Rotation is not established until observed in the actual product.

### A06 — Name your interpreter

- **Question:** can the same document support a useful ordinary reading and an explicitly custom experience?
- **Build:** inspect `pdfv3dReader` and trace one owned model from embedded object to pixels. Name the custom reader, its version, underlying PDF engine and model interpreter separately. Keep execution local and the asset set bounded.
- **Controls:** ordinary reader, custom reader, absent model and malformed/unsupported model with a readable fallback/error. A custom view must not silently replace the poster without indicating the active representation.
- **Hypothesis/falsifier:** both experiences work as labelled; loss of ordinary readability or unsupported-model handling rejects the design.
- **Demo:** switch interpreters and inspect which bytes each consumed. Defer Okular plugin surgery until this smaller trace works.

## Priority and completion boundary

Build A01 first: it reuses a working mechanism and adds a stronger artistic object. Prepare A05 and A06 as the next medium expansion, with source inspection and toolchain qualification before implementation. A02/A03 are contrasting channel studies. A04 waits for source inspection. This ordering is a proposal, not a claim that any new specimen already runs.

The shared workbench addition should be a **transformation notebook**: specimen hash → named operation and settings → output hash → consumer outputs → recovery result. Reuse the existing manifests and evidence store. Each row keeps visual fidelity, extraction, payload recovery and confidentiality distinct. Do not collapse them into one survival score.
