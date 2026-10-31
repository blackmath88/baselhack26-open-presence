# PDF LAB — proposed build plan
31 October 2026 · implementation not started

## Outcome
A person can choose a PDF experiment, predict what a reader will see, compare actual representations and inspect evidence explaining a discrepancy. The first demo must work locally without an LLM or a proprietary viewer.

## 1. Research and choose instruments
Use [the research prompt](RESEARCH-PROMPT.md). Produce a claim ledger with source, date/version, evidence category and remaining uncertainty. Evaluate existing tools before writing wrappers.

Candidate instruments, not selected dependencies:
- qpdf or pikepdf for structure and transformations;
- Poppler for rendering/text extraction;
- MuPDF/PyMuPDF as a second implementation;
- PDF.js as a browser viewer;
- veraPDF for applicable conformance questions;
- Acrobat and macOS Preview as manual observation environments;
- OCR as an explicitly separate representation;
- signature validation tooling only when the signature specimen is in scope.

Verify licences, maintained versions, actual feature support and installation constraints. Wrappers that share an underlying engine do not count as independent parsers. Do not imply that structural validation proves security or correct semantics.

Deliverable: tool decision record, pinned versions and the first three specimen recipes.

## 2. Build the reproducible evidence core
Keep all code, inputs and documentation inside this folder. Use a small local CLI first; implementation language follows tool choice.

Proposed commands:
- generate: construct deterministic fixtures where feasible;
- inspect: collect static structure and extracted text;
- render: create page images using a named renderer;
- compare: assemble aligned evidence without deciding which representation is authoritative;
- report: write machine-readable results and a human-readable notebook.

Data contracts:
- Specimen: id, file path, SHA-256, source/licence, parent hash, recipe, intended properties and feature flags.
- Experiment: question, prediction, procedure, specimen hashes, environment and falsifier.
- Run: instrument/version/configuration, input hash, timestamps, exit status and output hashes.
- Observation: statement, evidence references, page/object/region if known, author and observation type.
- Interpretation: conclusion, supporting observations, alternatives, limits and status.

Use explicit statuses: not-run, observed, unsupported, blocked, error. Unknown is not a pass. Output disagreement must retain both results.

Acceptance: regenerate or explain nondeterministic bytes; verify inputs are unchanged; capture failures and unsupported cases without fabricating observations.

## 3. Deliver the first experiment
P000 baseline: a simple page with known text and a numeric value.
P001 variant: a synthetic page designed to retain the same visible content while changing a machine-readable representation.

Show:
- both page renders;
- extracted text from two independently implemented engines where available;
- the structural change responsible;
- exact viewer/parser versions;
- a short explanation with limits.

For visual equivalence, compare the pair with the same pinned renderer and record the image diff; repeat with another renderer if available. Do not infer universal pixel identity from one rendering. If the intended discrepancy does not reproduce, preserve that negative result.

Acceptance: a newcomer can identify the disagreement and locate its evidence. No AI is needed to demonstrate the representation mismatch.

## 4. Add one trust case and one creative case
P002: synthetic sensitive marker; compare a black overlay, unapplied redaction and applied redaction. Inspect text, images, annotations, attachments and relevant revisions. Bound any claim of removal to the tests performed; checking one extractor is insufficient.

P005: a local form calculator with documented fallback. Compare interaction in available viewers. Record arithmetic, persistence after saving and unsupported behaviour separately. Network submission is out of scope.

Acceptance: demonstrate one format affordance and one trust boundary. Avoid making the whole lab a catalogue of alarming files.

## 5. Add the visual workbench
Build a local UI over actual run artifacts:
- left: specimen and experiment selection;
- centre: page, extraction and structure comparison;
- detail: instrument settings and evidence links;
- notebook: prediction, observation, interpretation and next question.

Keep raw outputs accessible and link findings to specific pages/objects where possible. Do not hide disagreements inside a single AI summary. No public upload service, deployment or hosted scanner is required.

Acceptance: baseline and P001 end-to-end; keyboard access; readable narrow layout; no fake results. Cached runs must be labelled with input hash and environment.

## 6. Later experiments
Revisions, transformations, attachments, accessibility and signature interpretation follow the core. Agent comparisons are optional adapters:
- preserve exact prompt, supplied representation, provider/model/version where available, settings and output;
- distinguish extraction from reasoning and instruction-following;
- repeat stochastic runs and avoid inferring a hidden ingestion pipeline from answers alone.

Active-content experiments run separately in disposable environments with resource limits and network disabled by default. Use harmless owned fixtures. Never execute uploaded files merely to inspect them.

## Scope cuts
If time is short, deliver CLI + generated evidence report + P000/P001.
Then add P002 and P005.
Defer shared framework extraction, cloud accounts, federation, broad fuzzing, exploit development and remote execution infrastructure.

## Post-hackathon extraction
1. Review licences and ensure every required input and script is local to this folder.
2. Create the separate repo at the explicitly requested later step; do not auto-create it now.
3. Move the folder as the new root, retaining attribution and useful history.
4. Replace parent-repository links with canonical URLs.
5. Add standalone setup/CI and verify a fresh clone can reproduce the first experiment.
6. Leave a short pointer here and update the project knowledge declarations when appropriate.
7. Consider shared XL/PDF infrastructure only after both demonstrate a real common need.

## Handoff for an implementing agent
Read README.md and this plan. Inspect applicable repository instructions. Implement only within sideprojects/pdf-lab unless integration is explicitly required. Start with the evidence contracts and P000/P001. Research and choose tools with a short rationale; no API key or AI service is required. Report what ran, what failed, what remains untested and the next bounded slice. Documentation proposals are not evidence of working software.
