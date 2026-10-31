# Build plan — It looked fine on my computer.

Planning baseline · 31 October 2026 · Not implemented

## Outcome and boundaries

Build a short, memorable, evidence-backed PDF history for a curious non-specialist and a hackathon audience. Readers should understand the dependency problem, the page representation, the adoption barrier and who gained economic value. Finish with a clearly labelled question about context in agent-mediated discovery.

Deliver one standalone offline HTML file in this module. Keep the explainer independently usable; its closing project bridge can link back to Open Presence without requiring it to run. No backend, RAG, accounts, paid inference, federation, automatic publishing or video pipeline is needed.

## Narrative contract

| Dimension | Contract |
| --- | --- |
| Intent | Make PDF's original job and economic adoption understandable through one travelling document. |
| Transformation | A document whose appearance depends on its receiving environment becomes an explicitly packaged page representation; adoption then depends on the receiving workflow. |
| Narrative relation | Follow, inspect, compare and return. |
| Progression | Native scroll selects deterministic states; anchors and keyboard navigation provide alternative entry points. No wheel interception, scroll snapping or timed advancement. |
| Scene model | Six flowing acts, with a bounded shared document stage where space permits. Small screens use static figures in normal reading order. |
| Primary operations | Mutate the same document's state; reframe it as dependencies, distribution and value. |
| Continuity | Same synthetic service manual, title, diagram and marked paragraph. Preserve identity through changes of representation. |
| Zoom | Semantic/narrative reframing into objects and economic relationships; optical zoom is not needed. |
| State/scene boundary | Font substitution and page assembly are states inside a stable scene. A move from page mechanics to organisational distribution is a scene change. |
| Mobile | Recompose into readable inline figures; no miniature desktop, overlap or sticky panel taller than the viewport. |
| Reduced motion | Static before/after states with the same explanations and controls; no scrubbed interpolation or smooth scrolling. |
| Failure modes | No JS, no network, local file opening, short viewport, reverse scroll, anchor entry, resized window and print remain coherent. |

## Storyboard and state sequence

| Act | States / explanatory transformation | Continuity and scene boundary | Evidence needed |
| --- | --- | --- | --- |
| 1. It looked fine on my computer. | Show a composed manual on sender A. Move to recipient B. Remove an illustrative font dependency; paragraph width and pagination change. Compare both results. | Manual and marked paragraph persist. Start with a familiar failure, not a title screen that delays the story. | Native document dependency evidence. Label the example a simulation; do not assert all native files behaved this way. |
| 2. Send the paper. | Offer native file, paper/fax and image/print-output alternatives. Show what each preserves and which tasks it introduces. | Same manual crosses different distribution paths. Change to a distribution scene, retaining manual identity. | Camelot problem statement and contemporary workflow sources. No invented costs or modem timings. |
| 3. Pack the page. | First show print output as a useful starting point. Open the page into positioned text, vectors, image and font resources. Assemble a page representation; choose a page through an index. Compare rendered output on A and B. | Semantic reframe from visible page to included resources, then return. Several states, one technical act. | Camelot and PDF reference, with version-aware explanations. Fonts may be absent; page access is not a claim of instant network loading. |
| 4. Who can open it? | Portable file reaches a recipient who needs compatible reading software. Contrast the initial receiving hurdle with free-reader distribution once the dates/prices are verified. | File identity survives; environment changes. Retro dialogs must explain a real adoption barrier. | Original prices, 1994 free-reader chronology and sources distinguishing contemporary evidence from recollection. Omit exact price if unresolved. |
| 5. Who pays—and why? | One master reaches many recipients. Reveal separate beneficiary layers: recipient, organisation, Adobe and complementary ecosystem. Paid creation/workflow sits beside free reading. | Reframe the manual as a distribution workflow. Economic relationships replace page internals. | Attributed customer cases; separate general workflow savings from PDF-only claims and Acrobat revenue from company revenue. |
| 6. The page arrived intact. | Return to the recognisable page. Compare appearance with reading order, version and missing context. Optional final state replaces the manual with a proposed contribution record. | Return closes the document loop. Explicit handoff into a new, hypothetical object; do not imply a live capability. | Reading-order/structure sources; project claims clearly labelled proposals. Closing question: “What should arrive with an answer?” |

Target a focused 4–6 minute reading path. Extra history, later PDF profiles and detailed evidence belong in expandable notes or the source desk. PDF/A and PDF/X must not crowd out the original problem and business story.

## Small interactions

Required vertical-slice experiment: a native button toggles an illustrative font substitution; static before/after figures explain the same result. Preserve the selected state across nearby scrolling; resetting is explicit. This models dependency/pagination, not an actual PDF renderer.

Optional after the story works:
- A visual-versus-structured reading-order comparison, explicitly not a screen-reader certification.
- A dependency inspection panel distinguishing renderability, source availability and context completeness.

Do not build a fake operating system. Window chrome is an explanatory frame; decorative menus should not masquerade as functioning controls.

## Visual study brief — not yet selected

Explore three comparable treatments of the SAME act-1 and act-3 content:

1. **Acrobat workbench, approximately 1993–1995:** compact document windows, page tools, application/file association, restrained system palette.
2. **Office desktop, approximately 1998–2001:** grey bevels, navy title bars, font/print dialogs, installer and reader friction.
3. **Cross-platform exchange desk:** visibly different sender/recipient environments around one manual; show compatibility without claiming a pixel-perfect historic OS reconstruction.

For each, provide a rendered static study, type/colour/spacing tokens, an annotated interaction state and a short account of what the UI teaches. Seek dated manuals/screenshots to inform period details; record source, date, rights and whether a visual is recreated or historical. Original CSS/SVG approximations are the default.

Assess legibility at phone size, explanatory clarity, historical fit, implementation cost and whether quirks carry meaning. Document a recommendation in DESIGN.md. A user visual preference can steer the selection; evidence repair and the neutral semantic skeleton can proceed independently.

Useful quirks: missing-font dialog, file-open association, page thumbnail rail, print preview versus editable source, a reader installation step. Each must explain a named dependency or workflow. Avoid meaningless progress bars, compulsory sounds, cursor trails, fake errors, CRT effects and decorative neon.

The proposed 1998 shell is presentational, not a claim that a 1991 event happened inside that UI. Date the historical content separately. Use modern contrast, touch targets and focus visibility even when they depart from period accuracy.

## Evidence and source model

Keep the imported report unchanged below its import note. Use research/CLAIMS.md as the working verification queue. Before a factual claim enters public copy:

1. Open the original cited source.
2. Record title, publisher, date, URL, exact page/section and access date.
3. Check what it supports and what it does not.
4. Mark the claim verified, qualified, omitted or unresolved.
5. Cite beside the relevant scene and include it in the full source desk.

Future sources.json should use stable IDs, not the report's inconsistent numbers:
- sources: id, title, organisation/author, published date, URL, locator, accessed date, source type, limitations;
- claims: id, text, scene, source IDs, status, qualification;
- illustrations: id, scene, invented assumptions and historical basis.

Schema is for authored content and validation, not a reason to generate all HTML from JSON. Leave no placeholder citations in the rendered story.

## Implementation approach

Start with semantic sections, real headings, figures, captions, native buttons, source notes and links. All prose and required before/after views exist in HTML. Source notes remain accessible without JS.

Embed CSS, JS and original SVG in index.html. Use system fonts. Build no runtime dependency on sources.json; it remains an auditable companion. No library/build tool is needed for six acts.

Progressive enhancement selects an active act/state through IntersectionObserver and a bounded scroll-position mapping if interpolation earns its place. Render from current position so reverse scrolling, resizing and deep linking are deterministic. Use scheduled requestAnimationFrame only for pending updates, not an idle perpetual loop. Avoid cloned IDs and duplicate keyboard focus targets in the shared stage.

Use a bounded sticky stage only on sufficiently wide AND tall screens. On narrow/short screens, reduced motion, no JS and print, use normal flow with static representations. Choose breakpoints from actual content fit, not nostalgia or copied device assumptions.

## Milestones and concrete handoffs

| Milestone | Work | Done when |
| --- | --- | --- |
| M0 — evidence baseline | Import report, document decisions, make claim queue. | This planning module is committed; no implementation is claimed. |
| M1 — source repair and script | Verify core qualitative claims; validate or omit numeric claims; write concise six-act copy. | Each factual scene has a traceable claim/source entry; unknowns are visible in notes. |
| M2 — visual studies | Produce the three same-content studies; compare and recommend. | DESIGN.md records the selected working direction, tokens, dated references and remaining choices. |
| M3 — vertical slice | Implement acts 1 and 3 with the persistent manual and font experiment. | Native scroll, keyboard, reverse scroll, mobile, no JS and reduced motion all preserve the explanation. |
| M4 — complete standalone story | Add remaining acts, business diagram, source desk and optional detachable closing bridge. | index.html works from a local file without network; all six acts and evidence are readable. |
| M5 — QA and handoff | Check visuals, interaction and claims; document remaining limitations. | Acceptance list below has evidence; README states actual status and how to open the file. |

M1 and M2 can progress independently. Do not polish the full animation before validating the vertical slice. No time estimates or deadlines are commitments; preserve the core hackathon pilot.

## Acceptance and QA

- At 390, 768 and 1440 CSS px, and a short landscape viewport: no clipped prose, covered controls, accidental horizontal overflow or illegible miniaturised UI.
- Native keyboard focus, tab order, buttons and anchors work; state changes do not steal focus.
- Scroll forward/backward, jump to each anchor and resize: same position produces the same narrative state.
- Reduced motion retains before/after meaning; no JS still displays the complete argument and evidence.
- Open index.html locally with network disabled: rendering and interactions require no remote fonts, scripts, assets or APIs. External source links remain labelled links.
- Print preserves copy, figures and source references.
- Compare every headline date, price, statistic and attribution against sources.json; vendor claims and illustrative diagrams remain labelled.
- Check inline JS syntax, unique IDs, local anchors and source/claim references. Record browser/viewport coverage and screenshots. Do not claim browser QA unless actually performed.
- Retain all existing pilot documents and behaviour; this module does not require changes to the site's main experience.

## Scope cuts

First omit exact launch pricing and savings metrics if unverified. Then omit extra experiments and detailed standards chronology. Keep the document journey, receiving friction and economic mechanism.

Must not become: an Adobe tribute, a claim that PDF solved truth, a universal history of all digital documents, a desktop emulator, a simulated benchmark, an argument that ATProto guarantees preservation, or a dependency that blocks the main pilot.

## Builder entry point

Read README.md, PROCESS.md, research/CLAIMS.md and this plan; inspect the linked Scrollies examples and licences; check the current repo instructions and uncommitted work. Implement M1/M2 outputs before extending the vertical slice. Report actual validation, source gaps and changed files. Do not publish as an incidental step.
