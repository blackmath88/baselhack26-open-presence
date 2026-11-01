# Experiment cards and evidence contracts

31 October 2026 · Perplexity, assistant · Proposed queue, not a new measured release. Existing cabinet results take precedence for what already ran. Do not allocate conflicting B/P/A identifiers without checking the current plan.

## The notebook contract

Keep specimen, experiment, run, observation and interpretation separate. Add purpose (reading, accessibility, search, interaction, preservation), raw/normalised outputs, normalisation rules, engine family, wrapper/build/configuration, object/page/region anchors and interaction sequence. Statuses: not-run, observed, unsupported, blocked, error. Unknown is not a pass.

### A transition is a first-class record

```yaml
schema: pdf-lab.transition/proposal-v1
id: example-not-an-observation
status: not-run
question: What travels through this route?
inputs:
  - specimen_id: example
    sha256: null
action: upload-preview-comment-download
consumer:
  product: null
  product_version: null
  engine_family: unknown
  engine_version: unknown
  wrapper: null
  build_flags: []
  operating_system: null
  configuration: {}
  account_alias: owned-test-account
  permissions: unknown
  service_version: undisclosed
outputs: []
external_state_changes: []
representations_observed: []
network_evidence: []
information_preserved: []
information_added: []
information_lost: []
evidence_refs: []
hypotheses: []
unknowns: []
privacy_redactions: []
```

No account secrets belong in this record. Output entries should carry hashes, media type, derivation and location. External state entries should distinguish observed state from inferred storage architecture. This schema is a discussion draft, not an implemented contract.

## Foundational five: retain as calibration

### Baseline
Question: do known text, number and page geometry survive rendering/extraction? Construction: tiny deterministic page. Controls: regenerated equivalent and known expected strings. Instruments: structure inspector, two engine families, optional OCR. Hypothesis: text agrees modulo declared whitespace differences. Falsifier: missing/reordered/changed content. Demo: calibrates noise before the strange exhibits.

### Visually equivalent, different reading
Question: what do ActualText, ToUnicode and visibility changes do? Construction: one mechanism per variant; legitimate alternate text beside deliberately contradictory mapping. Controls: ordinary mapping, same-renderer pixel diff, raster/OCR reference. Instruments: at least two extractors/renderers. Hypothesis: selected variant changes extraction without changing the local render. Falsifier: visible change or absent intended extraction; preserve engine disagreement. Demo: two intentional readings. Later add invisible, white-on-white, box-boundary and OCG variants.

### Redaction
Question: is covered content removed? Construction: owned marker under overlay, unapplied annotation, applied redaction, then saved variants with explicit cleanup settings. Controls: original and genuinely absent marker. Instruments: structure, extraction, render, image/attachment/metadata checks as appropriate. Hypothesis: coverage retains recoverable source content; exposure varies by consumer. Falsifier: responsible objects absent where predicted, or recovery found after claimed removal. Demo: distinguish hidden, removed and sanitised. Absence in one extractor is not proof of removal.

### Revisions
Question: what survives append versus rewrite/cleanup? Construction: known earlier file plus incremental changes and separate rewrite modes. Controls: generator-preserved revision originals. Instruments: xref/trailer-chain inspection and revision rendering. Hypothesis: append preserves earlier bytes; cleanup behaviour depends on operation. Falsifier: editor rewrites instead of appending or output differs from intended chain. Demo: historical room/object recovered. Never blindly split every %%EOF.

### Creative interaction
Question: does a small form machine compute and persist state? Construction: original calculator or register machine, explicit static fallback. Controls: no-script form and expected arithmetic. Instruments: actual named viewers, action log, saved/reopened file. Hypothesis: a specified runtime supports the required subset. Falsifier: wrong arithmetic, blocked event or lost persistence. Demo: supported computation is not sandbox escape.

## Inward experiments

### Follow one mark
Question: can we explain a visible mark end to end? Build: minimal Type 3 glyph or ordinary path. Controls: one operator/resource changed at a time. Instruments: object graph, decoded stream, PDF.js trace and PDFium fixture. Hypothesis: the trace identifies the responsible object/resource/operator. Falsifier: unexplained mark or inconsistent mapping. Demo: click picture -> inspect bytes -> see rendering step.

### Three overlays
Question: are pixels, selection and hit targets aligned? Build: synthetic page with distinct text mapping and annotation region. Controls: ordinary aligned page. Instruments: PDF.js canvas/text/annotation layers, extraction and named viewer. Hypothesis: intended mismatch is observable independently in each layer. Falsifier: layer not exposed or mismatch not reproduced. Demo: show the three representations separately.

### The repair map
Question: what does a reader reconstruct? Build: tiny file with one changed xref, length, duplicate definition or truncated update per case. Controls: valid parent and unchanged rerun. Instruments: resource-bounded offline engines and output comparison. Hypothesis: write a specific per-mutation expectation before running. Falsifier: another result. Demo: minimise interesting differences to explanatory specimens. A timeout/crash is a robustness result, not exploitability proof.

## Outward experiments

### Same file, different doorway
Question: do local viewer, browser, storage preview and Teams integration expose the same features? Build: owned feature page plus annotation and attachment. Controls: same input hash and a plain page. Instruments: route log, screenshots, downloads and structural checks. Hypothesis: differences track the configured consumer, not the host brand alone. Falsifier: measured output contradicts a specific capability prediction. Demo: explicit unknown cells and derivative lineage.

### The conversation that did not travel
Question: where do comments live? Build: local embedded comment plus service-added comment. Controls: uncommented source and offline opening. Instruments: several download routes, annotation inspection, hosted review state. Hypothesis: at least one route may separate conversation state from downloaded bytes; do not assume which. Falsifier: all tested comments consistently embedded, or service state differs from expectation. Demo: compare file and service ledgers.

### Who added the words?
Question: is OCR transient or saved? Build: owned image-only page confirmed to lack text objects. Controls: born-digital text and an intentionally OCR-layered copy. Instruments: OCR-enabled viewer, local extraction before/after, downloaded hashes and structure. Hypothesis: searchability can arise without native text in the original. Falsifier: original already had text or viewer does not OCR. Demo: distinguish file state from augmented view.

### Can see it, cannot cite it
Question: how do text, image and hybrid model paths differ? Build: native label, outlined label, scanned label and small diagram. Controls: explicit text-only/image-only inputs and correct expected answer. Instruments: exact prompts, provider/model identifiers when available, repeated runs and returned citations. Hypothesis: answer/citation/localisation performance differs by supplied representation. Falsifier: no repeatable difference under stated conditions. Demo: separate ingestion, recognition, reasoning and citation—not prompt injection.

## Creative expansion shelf

Refer to existing ALTERNATE-READINGS.md for full cards. Additional proposals: layer lock; PDF/ZIP chameleon; revision mystery; self-contained source workshop; owned animation; page-state dungeon; hashquine display; interactive geometry with poster fallback. Every card needs a question, construction, controls, instruments, hypothesis, falsifier and demo value before execution.

## Minimal architecture

Local CLI and immutable artefact store first; static report second. Reuse qpdf/pikepdf for structure, existing render/extract engines, PDF.js for inspectable layers and PDFium's template machinery for fixtures. Keep an instrument registry and transition ledger. Do not write a new renderer, crypto library, universal sanitizer or cloud upload service. Keep custom-reader and active-content runs separate and disposable. Shared XL/PDF infrastructure remains deferred.
