# PDF LAB — build the strange objects first
31 October 2026 · current roadmap; first implementation delivered

Read [the format-bending brief](FORMAT-BENDING.md). Achim's latest direction prioritises demoscene-like artefacts, reverse engineering and playful format limits. This plan replaces the previous extraction-first sequence. Historical methodology remains in [the research review](RESEARCH-REVIEW-2026-10-31.md) and Git history.

## Added exploration track — 31 October 2026

Read [Alternate readings, playback and experimental interpreters](ALTERNATE-READINGS.md). Promote the two-poem font-mapping artwork first, extending the existing glyph bench. Prepare owned 3D geometry and a named custom-reader experiment next; keep PRC and V3D distinct. Add channel-survival and encryption/concealment comparisons after implementation inspection, and an owned-animation demo after identifying the playback mechanism. Six experiment cards define controls, falsifiers and acceptance boundaries.

Editorial principle: reports should contain the feature they explain where practical. Reuse manifests and measured outputs for a transformation notebook. The supplied research is preserved verbatim; its compatibility/licence claims are leads awaiting independent verification. No new specimens or viewer support are claimed by this documentation addition.

## Implementation checkpoint

**A01 transformation notebook delivered:** object-clone versus Ghostscript pdfwrite now has parent/output hashes, two-engine extraction, measured pixel differences and an actual-file reveal control. pypdf preserves the readings; Ghostscript 10.08.0 collapses both maps to byte-identical A–D outputs while Poppler pixels remain unchanged. See [TRANSFORMATION-NOTEBOOK.md](TRANSFORMATION-NOTEBOOK.md); no physical print or native copy/paste support is implied.

**A01 delivered:** two original poems share the same visible Type 3 line glyphs, with mapping-only extraction differences measured in MuPDF and Poppler. Four fixtures include ordinary mapping, alternate mapping, direct text and raster controls. The browser can construct a real custom-mapped PDF; a desktop/mobile smoke checks the downloaded bytes. Poppler lineation/order differs; native copy/paste, OCR and transformations remain unrun. See [TWO-POEMS.md](TWO-POEMS.md). Earlier cabinet milestones remain available.


**Cabinet 003 delivered:** eight static layer-lock states, a three-engine comparison with observed MuPDF disagreement, an interactive Boolean bitmap half-adder, and a Type 4 colour-program PDF. Nine exhibit families, 23 PDFs. Next: minimise the OCMD discrepancy and add a single-coordinate stack trace to the colour exhibit. Hashquines and symbol-substitution scans are specified, not reproduced; see [WEIRD-MACHINES.md](WEIRD-MACHINES.md).

**Cabinet 002 delivered:** PDF/ZIP polyglot, incremental-revision mystery with xref-based recovery, print-intent reveal, parameterised maze CLI and byte inspector. Thirteen PDFs are generated. Print behaviour is observed in Ghostscript; the archive and recovered revision are independently checked. B03 now includes bounded render comparisons with no visual divergence found. [Current handoff](RUNNING.md) records exact observations and remaining gaps.

See [RUNNING.md](RUNNING.md) for reproduction and limits. B01 is implemented with two-engine render equality and extraction checks. B02 has generated fields/actions and tested logic, but live viewer qualification remains pending. B03 extraction runs are recorded; no divergent rendering or minimized failure is claimed. The initial eight PDFs remain in the expanded cabinet. Remaining acceptance items below stay open.

## 1. Deliver B01: this picture is one letter
Inspect applicable repository instructions and locally available tools. Select a small generator capable of exposing exact PDF objects; pin versions and review licences. Verify Type 3 font requirements in primary documentation.

Build a simple original maze/map drawn inside a single Type 3 glyph, plus a direct-page-drawing control. Keep the generator readable. Produce the PDF, source recipe, object inventory, render and extraction observations. Add a mapping-only variant, then one export/print/flattening observation if the relevant environment is available.

Done means:
- the PDF renders recognisable artwork;
- inspection proves the glyph mechanism;
- a reader can discover what selection/extraction does;
- the notebook links to actual output and names the viewers/parsers;
- a local rerun regenerates it or explains nondeterministic metadata.

Do not gate B01 on a generic plugin system, six parsers, OCR or a complete gallery. A baseline belongs inside this work, not as a separate product milestone.

## 2. Deliver B02: the backstage machine
Build a small document with a deliberately hidden interface, accessible by an authored field trigger and discoverable through object inspection. Reveal a toy machine with visible registers, memory and program listing.

Implement step/reset first, then bounded run. Choose a tiny instruction set and include a short drawing program. Keep the initial machine entirely within the supported PDF form/JavaScript environment of a named reader. No external calls or host execution.

Done means: opening scene, trigger, state changes, inspectable program and reset all work in one recorded viewer. Record a second viewer if available. Test save/reopen separately; do not promise persistence before observing it. Give unsupported viewers a static explanation.

## 3. Deliver B03: the repair bench
Generate a small known-good PDF. Derive three fixtures changing one property each: xref offset, stream length, final-update truncation. Preserve originals and record intended validity/rule.

Run two independently implemented engine families offline in disposable processes with explicit size/time/memory/output limits. Capture:
- accept/reject and exit status;
- diagnostics, including reported repairs;
- render/extraction differences;
- timeout or crash separately from semantic disagreement.

Minimise a reproducible interesting case if found. Re-run after minimisation to verify the same observation. If no differences emerge, publish the negative result and choose another bounded mutation. Do not fabricate a “reader disagreement” exhibit.

## 4. Present the cabinet
Only after working PDFs exist, make a local gallery over their files and observations:
- encounter the artefact;
- play or predict;
- reveal its mechanism;
- bend one parameter;
- inspect evidence.

Each card includes actual compatibility results, original PDF, source and regeneration command. Previews must be labelled as renderings, not live PDF interaction. Avoid simulated results or a wall of metadata.

## 5. Expansion status
Implemented in cabinet 002: harmless PDF/archive polyglot, print-transformation composition and revision-history mystery. Next work is viewer qualification and deeper variants. Preserve exact byte identity for polyglots; distinguish an attachment from a second file-format interpretation. Revision reconstruction follows validated structural boundaries, never blind %%EOF splitting. Full saves are not assumed to remove residual content.

Extraction, redaction and agent-ingestion comparisons remain supporting drawers. Signatures, broad fuzzing and shared XL/PDF infrastructure come later when they serve a concrete exhibit.

## Minimal shared evidence
Specimen: id, source, licence, hash, parent hash, recipe and intended mechanism.
Run: input hash, engine family, wrapper/version/settings, environment, limits, exit state and output paths/hashes.
Observation: visible effect, structure, extraction or interaction, linked to evidence.
Interpretation: hypothesis, mechanism, uncertainty, expected falsifier and classification.
Transformation: original and derived hashes, command/settings and losses observed.

Keep raw and normalized results separate. Use not-run, observed, unsupported, blocked and error states. OCR, if added, is another instrument, not truth. Different wrappers of one engine are correlated observations.

## Implementation handoff
Work inside sideprojects/pdf-lab. Begin with B01 and deliver a real PDF with a clear reveal before expanding abstractions. Reuse mature tools, check their actual capabilities and report failures honestly. No AI service, external deployment or new repository is required.

The creative direction is user-requested; exact design, tools and ordering are proposed implementation choices. No existing experiment result is claimed by this plan.

## After the hackathon
Extract this self-contained folder into a separately requested repo, retain provenance/history and a pointer here, verify fresh-clone reproduction and update canonical links. Shared infrastructure with XL LAB should follow demonstrated reuse.

