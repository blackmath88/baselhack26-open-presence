# Research review — 31 October 2026

## Provenance and status
This is a selected synthesis and critical review of the research response supplied by Achim in chat on 31 October, following the PDF LAB Perplexity prompt. It is not a verbatim archive, a reproduction of experiments or a verification of every reference in that response.

Source repository inspected at 220dd956cbc83ba59f7c6db458e3f53435ac8e65; recursive tree listing was complete. The published knowledge and snapshot endpoints again failed. The previously read source knowledge manifest remains unchanged; generated completeness and diagnostics could not be checked. No experiments ran in this review.

Labels: **documented** = checked in a primary source; **source-reported** = authors' result, not independently reproduced here; **proposal** = recommended design; **unverified** = not established by this review.

## Verdict
The strongest direction is an evidence-backed learning workbench where people can make, inspect and compare PDFs. Its value does not depend on claiming a novel detection technique.

The incoming report improves the experiment roadmap but over-expands the first build. Seven constructions across six parsers plus OCR should be a staged matrix, not the entry requirement. Preserve creative exploration as an equal purpose: a playable interaction belongs early, not only after a security benchmark is complete.

Proposed first audience: curious technical makers and agent-workflow builders who want to understand how documents behave. This is a default for implementation planning, not an agreed exclusive market.

## Sources checked and useful transfers
| Primary source | Date / scope | What was checked | Transfer |
| --- | --- | --- | --- |
| [PDF Tetris](https://github.com/ThomasRinsma/pdftris) | README links to January 2025 account | Author reports PDFium and PDF.js support; uses form fields and text-field input | Creative reference and compatibility specimen; current installed viewers still need tests |
| [PDF Doom](https://github.com/ThomasRinsma/pdfdoom) | Repository README accessed 31 Oct 2026 | Author restricts support to PDFium and documents emscripten/JS embedding and WAD input | Demonstrates runtime potential; linking is enough until dependency and asset permissions are checked |
| [PhantomLint](https://arxiv.org/html/2508.17884v1) | v1, 25 Aug 2025 | Hidden-prompt analysis combines suspicious-text detection with regional OCR consistency; PDF preprocessing exposes hidden/offpage content | Prior art for comparison, not proof of PDF LAB novelty or a universal hidden-text detector |
| [Story Beyond the Eye](https://arxiv.org/abs/2206.02285) | 2022 preprint; PETS 2023 DOI | Authors report information leakage from character positioning even after underlying text is removed | Distinguish direct content recovery from residual inference; current products remain untested |
| [PyMuPDF document API](https://pymupdf.readthedocs.io/en/latest/document.html) | Live documentation accessed 31 Oct 2026 | Incremental save and garbage collection are separate options; removal of unused objects requires appropriate settings | Test save modes explicitly; never label an arbitrary full rewrite sanitized |
| [PyMuPDF redaction API](https://pymupdf.readthedocs.io/en/latest/page.html) | Live documentation accessed 31 Oct 2026 | Applying annotations and physically removing content require the appropriate operation and save options | Separate overlay, unapplied annotation, applied redaction and final saved artifact |
| [PDF 2.0 syntax errata](https://pdf-issues.pdfa.org/32000-2-2020/clause07.html) | ISO 32000-2:2020 errata | Cross-reference sections and Prev links are part of revision structure | Use structural revision boundaries, not blind string splitting |
| [qpdf project](https://qpdf.sourceforge.io/) | Project overview | Structural transformation role; no rendering or text extraction; Apache-2.0 stated | Keep structural inspection separate from extraction |
| [PDFium licence](https://pdfium.googlesource.com/pdfium/+/main/LICENSE) | Live source accessed 31 Oct 2026 | File contains BSD-style terms and Apache-2.0 text | Pin exact distribution and inspect bundled notices; no blanket legal conclusion |

The supplied report's precise latest-version numbers, complete licence table, tool maintenance claims, compatibility matrix and all 152 bibliography entries were not independently audited. A large bibliography is not a verified claim ledger. A link to an old version's documentation does not establish the current release.

## Corrections before implementation
1. **Remove the novelty claim.** The report calls the evidence model new without substantiating that claim. Explain usefulness; do not assert that the literature lacks comparable workflows.
2. **Do not require a new vulnerability.** Reproducing known format behaviour has educational value even if nothing is exploitable. Current-version retesting is useful but not the lab's sole justification.
3. **Count implementations carefully.** Multiple wrappers around one engine are correlated. Record engine family, wrapper, version, configuration and preprocessing. Different engines can still share dependencies and assumptions; independence is not a binary guarantee.
4. **Preserve legitimate alternatives.** ActualText, logical reading order and OCR can serve different reader needs. Every comparison needs a purpose and an explicit semantic expectation. Accessibility-supporting alternate text must not automatically become a security warning.
5. **OCR is an observation, not ground truth.** Test resolution, language and layout; preserve errors. PhantomLint itself reports OCR-related false positives and notes cases where OCR distinguishes low-contrast text better than people.
6. **Correct the redaction hypothesis.** “Leaks in every extractor” is too strong. Overlay and unapplied annotations leave underlying content in the construction; each consumer may expose or suppress it. Marker searches can miss encoded text. Test structural recovery as well as extraction. Keep direct recoverability separate from statistical inference from layout.
7. **Correct the revision recipe.** A full save does not universally remove unreachable content. Compare append, rewrite without cleanup and rewrite with explicit cleanup. Preserve original revisions as known generator outputs. For reconstruction, validate xref/trailer chains and candidate revision boundaries; do not blindly split every occurrence of %%EOF.
8. **Do not generalize game compatibility.** A working game demonstrates the API subset and event paths it exercises, not all form calculation scripts. Test calculation, interaction, save persistence and fallback independently.
9. **Separate pipeline stages.** Rendered appearance, extracted representation, model reasoning and instruction-following are different observations. Text-only and image-only controls help; they do not reveal the private ingestion internals of a hosted upload.
10. **Keep claims time-bound.** Historical security findings are not current product vulnerabilities. A failed reproduction can mean changed software, different conditions, an invalid specimen or instrumentation error; distinguish these before concluding “fixed.”

## Revised staged experiments — proposal
| Stage | Specimens | Instruments | Evidence needed |
| --- | --- | --- | --- |
| A: calibration | P000 plain sentence, number and known rendering | Two extraction engines; a renderer; structural inspector | Exact inputs/outputs, engine versions, baseline differences |
| B: smallest useful differential | P001a legitimate ActualText control; P001b deliberately contradictory alternate text | Same instruments; one OCR engine as additional evidence | Raw and normalized text, localized comparison, same-renderer image diff, declared semantic purpose |
| C: creative counterpart | P005 small unit converter with visible formula and static example | Two available interactive viewers, manual observations acceptable | Action sequence, result, warnings, saved/reopened state and fallback |
| D: broaden mechanisms | ToUnicode remap, invisible text, white-on-white, CropBox/MediaBox and OCG variants | Add engines one at a time when they answer a question | One mechanism changed per specimen; explicit not-run cells |
| E: trust cases | P002 redaction and P003 revisions | Structural inspection plus extraction/rendering as appropriate | Saved artifacts, cleanup parameters, recovery limits and negative results |

These are design proposals, not observed outcomes. An extractor ignoring ActualText is a recorded result, not permission to fabricate a divergent output.

Two core parsers plus one OCR engine are sufficient to begin. Six parsers and a second OCR engine are expansion options. Validate any chosen implementation's distribution terms before packaging it.

## Architecture changes
Keep the existing specimen/run/notebook design. Add:
- comparison purpose: reading, accessibility, search, extraction, interaction or preservation;
- semantic expectation and rationale, separate from actual output;
- engine_family plus wrapper/version/build/configuration;
- derivation manifest for every preprocessing step;
- original output alongside normalization rules and normalized output;
- page/object/region evidence anchors;
- source-reported versus locally observed status;
- interaction event sequence, initial state and saved-file hash for creative runs.

The report should answer “what changed, where and under which conditions?” A matrix is one navigation view; it is not the complete learning experience.

## What remains open
- Select and pin available tools after checking the implementation environment.
- Choose unit converter versus a minimal game as the first creative specimen.
- Verify historical recipes and obtain clear fixture/code reuse permissions.
- Inspect the remaining primary sources if they become implementation dependencies.
- Record future local observations separately from this literature review.
- Keep signatures, hosted agent adapters and shared XL/PDF infrastructure later.

## Repository handoff
**New finding:** the creative precedents and OCR-comparison prior art are concrete; the reviewed report contains useful leads and several overclaims.
**Existing agreed decisions:** incubate under sideprojects/pdf-lab; extract after the hackathon; retain creative and investigative tracks.
**New proposals:** staged matrix, early creative counterpart, explicit comparison purpose and stricter revision/redaction methodology.
**No new user decision inferred:** audience, tools and stage ordering remain proposed.
**Affected documents:** this review, README.md navigation and PLAN.md refinement.
**Implementation status:** documentation only, no specimens generated, viewers tested or compatibility results measured.
