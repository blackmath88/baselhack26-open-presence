# PDF LAB — build the strange objects first
31 October 2026 · current plan; implementation not started

Read [the format-bending brief](FORMAT-BENDING.md). Achim's latest direction prioritises demoscene-like artefacts, reverse engineering and playful format limits. This plan replaces the previous extraction-first sequence. Historical methodology remains in [the research review](RESEARCH-REVIEW-2026-10-31.md) and Git history.

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

## 5. Expand
Next candidates: harmless PDF/archive polyglot, print-transformation composition, revision-history mystery. Preserve exact byte identity for polyglots; distinguish an attachment from a second file-format interpretation. Revision reconstruction follows validated structural boundaries, never blind %%EOF splitting. Full saves are not assumed to remove residual content.

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
