# PDF LAB
31 October 2026 · BaselHack side project · working cabinet 002

**How far can you bend a document before it becomes something else?**

A cabinet of strange PDFs: pictures made from letters, secret interfaces, visible computers, multiple file identities and readers repairing the same broken bytes.

## Current direction
Achim redirected PDF LAB on 31 October towards format bending, reverse engineering and playful format abuse. **Artefacts onstage, evidence backstage.** Start with [the format-bending brief](FORMAT-BENDING.md) and [current build plan](PLAN.md).

Proposed opening: **B01 This picture is one letter → B02 The backstage machine → B03 What did the reader repair?** These replace the earlier extraction-first sequence. The cabinet now has six exhibit families and thirteen PDFs: the one-letter maze, backstage prototype, repair bench, real PDF/ZIP polyglot, recoverable revision mystery and print-mode reveal. B02 still awaits live interactive-viewer qualification. Exact exhibit choices remain proposals.

The following evidence model and P-series are retained as supporting research, not the primary experience. The earlier [research prompt](RESEARCH-PROMPT.md) and [review](RESEARCH-REVIEW-2026-10-31.md) reflect the foundational forensic framing; use FORMAT-BENDING.md for current creative priorities.

## Open the working cabinet

**New:** [one file, two identities](output/pdf/04-two-identities.pdf) · [who killed object 17?](output/pdf/05-object-17.pdf) · [print me to ruin the puzzle](output/pdf/06-print-to-reveal.pdf).

The gallery now has actual rendered comparisons and a live byte inspector. `python3 lab.py bend --seed 17 --word RABBIT` creates your own glyph-maze variant. See [cabinet 002 measurements](evidence/cabinet-results.json).

- [First PDF: this picture is one letter](output/pdf/01-one-letter.pdf)
- [Alternate extraction: same picture, LOST](output/pdf/01-alternate-reading.pdf)
- [Local gallery](index.html) — serve this folder locally; see [run instructions and measured limits](RUNNING.md).
- [Raw evidence](evidence/results.json) and [generator](build.py).

## Status and agreed scope
Achim explicitly requested housing this project in a subfolder of the hackathon repository, with concept, build plan and research/sparring prompt, before moving it to a separate repository after the hackathon. That location and later separation are agreed; the technical choices and experiment ordering below are proposals. Implementation and measured results are documented in [RUNNING.md](RUNNING.md); no separate repository has been created.

- [Build plan](PLAN.md)
- [Research review and corrections — 31 October](RESEARCH-REVIEW-2026-10-31.md)
- [Perplexity research and sparring prompt](RESEARCH-PROMPT.md)

PDF LAB is a sibling concept to [XL LAB](https://github.com/blackmath88/xl-lab), adapting its evidence-first forensic learning approach. It is independent of the Photo Frame Commons build and optional PDF-history narrative. It creates no new weekend delivery commitment.

## The question
What does a PDF contain, what do people see, what do different programs interpret, and what survives when it travels?

A PDF feels like a stable page. Its internal document structure can also represent forms, annotations, attachments, metadata and revision chains. The same artifact can be consumed as rendered pixels, extracted text, structured objects or an input to an agent.

The useful comparison is between these representations. Differences can be intentional, unsupported features, accessibility defects, extraction mistakes or security-relevant ambiguities. A difference alone is not a vulnerability.

## Two equal tracks
### MAKE IT WEIRD
Explore PDF as an interactive medium: a calculator, branching reader, layered diagram, portable evidence bundle or document with its own source material. Measure viewer support rather than assuming that an Acrobat capability is universal.

### BREAK IT SAFELY
Use synthetic, owned specimens to inspect presentation/extraction divergence, incomplete redaction, residual revisions, attachment discoverability, transformation loss and signature interpretation. Use harmless local markers for active-content tests; no weaponized payloads, external targets or attempts to evade enterprise controls.

## Evidence model
Keep these layers separate:
- VISIBLE: rendered page and human observations.
- STRUCTURE: objects, streams, attachments, metadata and revisions actually found.
- EXTRACTION: text, order, tables or other representations returned by a named tool.
- BEHAVIOR: observed interaction or execution in a named environment.
- CONTROL: warnings, permissions, blocked actions and sanitization.
- INTERPRETATION: explanation, uncertainty and alternative hypotheses.

A model may explain evidence, but never replace it. A signed document is not proof that its statements are true. An unchanged hash establishes byte identity, not identical interpretation.

## Supporting workbench mechanics
Question → specimen → prediction → instrument → observation → comparison → explanation → next question.

Five connected surfaces:
1. Evidence tray: immutable original, hash, source, licence, parent specimen and construction recipe.
2. Microscope: PDF object graph, page content, text mappings and raw output, with progressive disclosure.
3. Instruments: each tool's version, configuration, scope, limits and possible side effects.
4. Comparison table: page image beside extracted text and structural evidence; disagreements remain visible.
5. Notebook: questions, predictions, observed facts, hypotheses, conclusions and reproducibility notes.

Explore, guided learning and case investigation can share the same underlying records. Teaching mode asks for a prediction before revealing evidence. Design should be clean and precise: cool white, restrained colour, strong typography, no fictional hacker cockpit or unsupported threat score.

## Supporting P-series specimen families
| ID | Question | Track |
| --- | --- | --- |
| P000 | Do rendering and extraction agree on a simple baseline? | Baseline |
| P001 | Can visually equivalent pages yield materially different extracted text? | Compare |
| P002 | Is covered text actually removed? Compare overlay, unapplied redaction and applied redaction. | Inspect |
| P003 | What earlier objects survive an incremental update? | Inspect |
| P004 | What survives save-as, export, flattening and print-to-PDF? | Transform |
| P005 | Which form calculations and interactions work in each viewer? | Create |
| P006 | Can readers discover and extract an attached source/evidence bundle? | Create |
| P007 | How do reading order, tags and OCR affect the meaning recovered? | Compare |
| P008 | What do signatures validate, and how are permitted later changes displayed? | Inspect |
| P009 | Does an agent answer differently from the PDF, page image and extracted text? | Compare |

P001 should use a clearly documented synthetic discrepancy, not masquerade as an accidental reader vulnerability. Separate representation mismatch from instruction-following/prompt injection.

## Connection to the Adobe exploration
The research question becomes tangible: **when information passes from a human-readable document to an agent, what survives, and what are we trusting?**

PDF is an investigative object and historical reference, not a proposed replacement protocol for the web. Any lesson transferred to provenance, human signals or portable knowledge must state the limits of the analogy. PDF preserved form; it did not guarantee truth.

## Research basis and limits
Read in the originating session:
- [XL LAB README](https://github.com/blackmath88/xl-lab/blob/main/README.md)
- [XL LAB experience](https://github.com/blackmath88/xl-lab/blob/main/docs/lab-experience.md)
- [XL LAB consumer comparisons](https://github.com/blackmath88/xl-lab/blob/main/docs/consumer-differential-lab.md)

Primary-source leads located in that session (verify details during research):
- [PDF Association: Files inside PDF](https://pdfa.org/files-inside-pdf/) — embedded content and incremental updates.
- [PDF Association glossary](https://pdfa.org/glossary-of-pdf-terms/) — annotation and document terminology.
- [Adobe: JavaScript in Acrobat](https://helpx.adobe.com/acrobat/using/add-debug-javascript.html) — runtime capabilities.
- [PDF Association: AI and PDF](https://pdfa.org/faq-ai-and-pdf/) — ingestion considerations.
- [PDF Insecurity](https://www.pdf-insecurity.org/) — primary security-research lead; historical findings must not be presented as current unpatched behaviour.

Current measurements are bounded to the engines and checks in RUNNING.md. Interactive PDF-viewer compatibility remains unqualified.

## Repository handoff
- Finding: XL LAB's specimen/instrument/notebook and consumer-comparison model transfers well to a PDF laboratory.
- Agreed: incubate in this subfolder; separate repository after the hackathon.
- Current user direction: format bending and creative reverse engineering; strange artefacts lead.
- Proposed: B01 Type 3 illustration, B02 backstage machine, B03 bounded repair bench. Earlier P-series remains supporting research.
- Open: exact generators/parsers, viewer access, first creative specimen, future repository name and licence.
- Affected documents: this README, PLAN.md, RESEARCH-PROMPT.md and the root navigation link.
- Current-state boundary: source tree inspected at 70d1cfb07647a08756e53fbaef9098700087bd18, complete Git tree listing; source knowledge manifest and coordination declarations read. Published data/knowledge.json and data/snapshot.json could not be fetched. Generated snapshot completeness and diagnostics remain unverified.

