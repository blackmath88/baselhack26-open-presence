# Where did the page go? — mobile reflow
3 November 2026 · ChatGPT / Codex (assistant)

Status: Achim requested adding this experiment to the PDF Lab plan. The design and checks below are proposed; no new specimen, mobile-viewer result or application feature is delivered by this document.

## Question
Can the same PDF remain understandable when a fixed page becomes a flowing mobile reading experience?

Extend “one file, many interpreters” with an everyday use case: reading comfortably on a phone. Compare the original page, mobile reflow and extracted text. Investigate preservation of relationships as well as presence of words.

## Source-reported capability
Adobe documents Liquid Mode in Acrobat mobile as reflowing supported content for phones and tablets, with adjustable text size and spacing, leaving the original document unchanged:
- https://helpx.adobe.com/uk/acrobat/mobile/view-manage-files/liquid-mode.html
- https://helpx.adobe.com/acrobat/mobile/get-started/technical-requirements.html

Adobe lists potential incompatibilities including files over 10 MB or 200 pages, scans, presentation-derived PDFs, protected files and complex layouts with dense tables/images. These are vendor-reported boundaries, not results measured by this Lab. Verify current requirements when running the experiment.

Liquid Mode is a reader capability, not a universal alternate mobile layout embedded in every PDF. Distinguish reader-generated reconstruction from an explicitly tagged reading order. The user's impression that this has not reached everyday practice is an adoption hypothesis; no adoption figures were established.

## Visitor journey
1. Encounter a small original two-column article at phone width.
2. Predict where its sidebar, figure caption and footnote will appear in a flowing view.
3. Compare the same file across the three views below.
4. Select a passage and inspect its reading order and relationships.
5. Download the unchanged original and open it in a named supported mobile reader.
6. Keep the observation, including successful preservation, unsupported cases and uncertainty.

| View | Investigate | Evidence boundary |
| --- | --- | --- |
| Original page | Columns, grouping, caption proximity and footnote placement | Name renderer/version; a screenshot is a recorded rendering |
| Mobile reflow | Sequence, headings, sidebar placement, caption and footnote association | Actual reader observation with app/version/device/settings; otherwise not_run |
| Extracted text / agent input | Surviving words, order and relationships | Named extractor/version/settings; extracted text alone is not an agent test |

## Specimens and controls
Create an owned short article with stable passage identifiers, two columns, a sidebar, one captioned image, a small table and a footnote. Retain its authoring source and intended reading order as an authored reference, not universal ground truth.

Start with one simple article and add one complication at a time. Compare a correctly tagged version with a visually equivalent untagged control only after verifying their construction. Record hashes and measure visual equivalence; do not assume it. A raster control may investigate unsupported/scanned content, but is optional.

Existing Type 3 poems may later serve as a deliberately unusual stress case. Do not make their custom glyph mappings the baseline for ordinary mobile readability.

## Implementation fit and sequence
- Extend the existing specimen → instrument → run → observation contracts in WORKBENCH-BUILD.md; retain immutable originals and source/hash lineage.
- First slice: curated downloadable specimen, original rendering, real extracted text and a concise external mobile-reading protocol.
- Integrate recorded comparisons into the existing comparison stage when evidence exists. A real Liquid Mode run may require manual external observation; no embedded Adobe engine or API integration is assumed.
- Any HTML reflow teaching view must say “teaching simulation” and name its transformation. It must not be labelled Liquid Mode or counted as a mobile reader result.
- Mobile-friendly Lab navigation and reflow of the PDF itself are separate acceptance items.
- Do not block the existing creative roadmap or introduce uploads, cloud processing or a new runtime dependency for this planning addition.

## Acceptance checks
- All three views identify the same input hash; derivatives receive separate identities.
- Original bytes remain unchanged before and after the viewing experiment.
- Record reader/app version, OS/device, settings, date, eligibility outcome and evidence capture. Missing information remains unknown.
- Record headings, column sequence, sidebar, caption, table and footnote separately as preserved, changed, ambiguous or unavailable, with supporting evidence.
- Unsupported, blocked, error and not_run states stay distinct from observed disagreement.
- Preserve raw extraction and reader screenshots alongside the interpretation; do not infer reflow results from desktop extraction.
- A successful result is as publishable as a failure. Do not manufacture semantic loss or generalise from one reader/file.
- For the Lab UI, check 390px layout, keyboard navigation and readable comparison labels. These checks do not qualify an external mobile PDF reader.

## Selected repository handoff
- New finding: vendor-documented mobile reflow provides an everyday complement to interpreter-divergence experiments.
- Explicitly agreed: add this exploration to the PDF Lab plan.
- Proposed: the journey, owned specimen/control family, staged integration and acceptance checks above.
- Open: which mobile reader/device is available; exact tagging tool; actual compatibility and adoption evidence.
- Affected: MOBILE-REFLOW.md, PLAN.md, README.md and the assistant proposal.
- Source state: inspected main `1077ce95e761cd39684d95da296306d9e0178c3e`; published knowledge `ks_fbfae21de280190867c2` resolves to the same commit, complete=true (15/15 sources, no failures), diagnostics=[]; activity snapshot generated 2026-11-03T07:15:03Z has matching trigger SHA. Its schema has no top-level completeness claim. Both committed context packets have older cutoff `93a5445150d05b3626507f8ef5868d13d62d57ef`; current source files take precedence.
