# PDF LAB — format-bending direction
31 October 2026 · current creative direction; exhibits proposed, unbuilt

## The turn
Achim explicitly redirected the project towards: how far can we bend the format until it breaks, reverse engineering, secret interfaces and playful format abuse.

**What is the most unreasonable thing we can make these bytes do—and which interpreter's assumptions make it possible?**

The experience is a cabinet of strange documents. Encounter an artefact, play with it, discover the mechanism, change it and push its limits. Evidence discipline supports the experience backstage.

This direction takes precedence over the earlier extraction-first opening and calculator-first creative milestone. The earlier research remains useful technical background. It does not constrain the lab to compliance, forensics, agent ingestion or discovering novel vulnerabilities.

## Opening exhibition
### B01 — This picture is one letter
Build an original illustration as the drawing procedure for a Type 3 glyph. The visible picture, character code, Unicode mapping, selection geometry and extracted text become separate things to investigate.

First target: one glyph invocation draws a small maze or map. A separate control draws the same geometry directly on a page. Test selection and extraction without promising uniform reader behaviour. Add a second variant changing only the Unicode mapping.

Then explore inherited colour/graphics state where permitted, repeated glyphs, transformations, printing and flattening. Inspect relevant Type 3 restrictions before constructing each variant. No JavaScript is needed for the core.

The reveal should show the actual glyph content stream alongside the picture. “One letter” describes the page's authored content mechanism, not the total bytes or all metadata in the document.

Acceptance: reproducible PDF, rendered artwork, structural evidence that the artwork comes from the glyph, extraction observations from available engines and one transformation result. Missing or surprising selection behaviour is a finding, not a failed exhibit.

### B02 — The document has a backstage
An apparently ordinary diagram or manual conceals a deliberately authored local interface. A phrase in a field reveals a tiny inspectable machine: registers, memory, instructions, step and reset. Its program changes a pattern on the page.

The puzzle must have two paths: discover through interaction, or inspect objects to understand the trigger. The source is available after the reveal. This is an intentional secret interface, not authentication or host access.

Start with a tiny bounded toy instruction set rather than porting Linux. Describe it as a machine, not an operating system. Saving/reopening state is a later measured capability; if unsupported, show a state export/reset path honestly.

Acceptance: unlock, step through a short program, inspect changing state and reset in at least one named viewer. Other viewers get an honest compatibility record and a visible static explanation.

### B03 — What did the reader repair?
Start with a tiny known-good fixture and mutate exactly one structural property. Compare acceptance, rejection, explicit repair, divergent rendering/extraction, timeout and crash.

Initial families: cross-reference offset, stream length and truncated final update. Later: duplicate definitions in controlled revision contexts, unusual page geometry and unreachable objects. Not every family is necessarily malformed; state the intended rule or ambiguity.

The goal is a small explanatory specimen. Preserve the original and mutation recipe, then minimise interesting differences while retaining the observed behaviour. Do not promise that readers will disagree: agreement or uniform rejection is also a result.

A reader opening a malformed file is not by itself proof of a particular repair algorithm. Label repair as observed when diagnostics or other direct evidence establish it; otherwise label the explanation inferred.

Acceptance: baseline plus three one-variable mutations; raw logs from two engine families; output artefacts; a minimized interesting case if one is found, otherwise a clear negative-result notebook.

## Next cabinet drawers
| Exhibit | Experience | Mechanism to investigate |
| --- | --- | --- |
| Choose your interpreter | One exact file opens as a picture-document and as an archive revealing its recipe | Harmless PDF/archive polyglot; distinguish standards conformance from parser tolerance |
| Please print this to destroy it | Screen maze, printed map, extracted story | Deliberate changes across navigation, optional content, fields and transformation; measured per reader |
| Who killed object 17? | A document mystery solved by following references and recovering prior states | Reachability, streams, object streams and revisions |
| A computer you can read | Visible machine state becomes both interface and explanation | Form events and supported JavaScript; future extension of B02 |

For the polyglot, hashes must establish exact-byte identity across interpreters. A PDF containing an attachment is a different construction and should be labelled accordingly. For the print exhibit, measure actual print settings/output; do not assume all viewers honour view/print state distinctions.

## What counts as breaking?
- Specification gymnastics: unusual but allowed.
- Compatibility failure: feature support differs.
- Parser disagreement: structural interpretations differ.
- Robustness failure: bounded execution hangs or crashes.
- Trust-boundary failure: demonstrated crossing of a permission or isolation boundary.

These labels require evidence. An emulator using supported scripting is not a sandbox escape; a crash is not code execution; an authored secret mode is not a vulnerability.

## Interface direction
Lead with each strange PDF and a short provocation. Offer Play / Reveal / Bend / Inspect as progressive actions, not a mandatory four-panel dashboard. Byte offsets, object references, diagnostics and comparisons belong in the reveal.

Keep the original PDF downloadable and the construction recipe local to its exhibit. Native viewer behaviour matters; a screenshot or HTML imitation must not stand in for a working PDF. A gallery can arrive after the first artefact works.

## Research anchors and evidence limits
- [PDF Association: Inline images and Type 3 fonts](https://pdfa.org/inline-images-and-type-3-fonts/) and [PDF text specification errata](https://pdf-issues.pdfa.org/32000-2-2020/clause09.html): primary technical starting points for B01; verify permitted operators and font resources during implementation.
- [linuxpdf](https://github.com/ading2210/linuxpdf/blob/main/README.md): author describes TinyEMU RISC-V compiled to asm.js, with field-based output. Checked README, not executed. A precedent for computation, not a requirement to reproduce Linux.
- [Corkami: Abusing File Formats](https://github.com/corkami/docs/blob/master/AbusingFileFormats/README.md): historical format interpretation and polyglot research. Current compatibility must be tested; its older support claims are not adopted as present facts.
- [PDF graphics specification errata](https://pdf-issues.pdfa.org/32000-2-2020/clause08.html): follow-up for optional-content and graphics behaviour.
- [Earlier reviewed research](RESEARCH-REVIEW-2026-10-31.md): extraction, redaction and revision methodology remain relevant.

The user's new supplied research proposes these directions; no exhibit has been reproduced here. No claim of novelty or confirmed parser defect.

## Working boundaries
Use authored tiny specimens and local disposable reader processes, with explicit time/memory/output limits and network disabled for mutation or active-content runs. Parser failure analysis stays focused on explanation and reproducibility. No decompression bombs, weaponized payloads, sandbox escapes or third-party targets are needed for these exhibits.

## Handoff
- Agreed direction: more format bending, creative reverse engineering and playful secret interfaces; artefacts lead.
- Proposed first implementation: B01, then B02 and a bounded B03 bench.
- Superseded: extraction matrix as the required opening, generic calculator as the creative destination, dashboard-first framing.
- Preserved: immutable specimens, independent observations, sources, versions and explanation.
- Open: exact artwork, toy instruction set, installed viewers and any observed parser disagreements.
- Scope: documentation update inside the existing side project; separate repo still deferred until after the hackathon.
- State check: repository inspected at 0281da86fd4c07739d1dea2800ce514b29b7c094, complete tree. Published knowledge/snapshot fetch failed again; generated completeness/diagnostics remain unverified.
