# Commons experience blueprint

1 November 2026 · Author: Perplexity (assistant) · Status: proposal for human review; no implementation or usability-test claim.

## 1. Context and product thesis

Read HUMAN-SIGNAL-CONCEPT.md and VALUE-AND-UX.md first. This document extends the current Photo Frame Commons / Human Signal direction; it does not replace either document, rename the product, or revive the historical business-presence scenario.

Product: help people find situated experience, judge its applicability and leave a small, attributable contribution for the next person.

Primary situation: someone brings an everyday problem, recognises a similar account, inspects conditions and differences, decides what to investigate and shares what they learn. The captured photo-frame community is the bounded demonstration, not a general-web search claim.

Material: original passages, reported conditions and outcomes, source identities, interpretations, conversations, corrections and selectively shared observations. Actions: find, inspect, compare, question, explore privately, preview, contribute and rediscover.

Thesis: this should feel like following a useful conversation with the evidence still attached, because people need to recognise their situation, judge differences and continue without losing context.

Non-goals: truth scores, manufactured consensus, compulsory architecture lessons, automatic private-chat ingestion, an obligatory graph, public deployment or a backend rewrite.

Most consequential unknown: can a newcomer choose a sensible next step and explain what the system did and did not establish without first learning the internal model?

## 2. Requirements, evidence and proposal status

User requirements from the 1 November design conversation:
- Cisco Cloud Control is the visual look-and-feel north star throughout, not one optional aesthetic among several.
- Clean, modern, transparent; the app works while educating and revealing relevant architecture.
- Transformer Explainer is a particularly liked interaction/build reference.
- Preserve the concept and references and prepare a phased Claude/Codex handoff in this repository.
- Consider the user's TanStack practice, without assuming a migration is already agreed.

Assistant proposal: guided investigation as the default, a living case when reading, and an inspectable knowledge instrument on demand. Exact layouts, tokens, module names and phase boundaries below remain proposals. This file is not an Observstory human review.

Research status: references were inspected through original documentation/repository descriptions, not interactively tested. Existing interface observations in the conversation were code-level, not a running-browser test. Revalidate current code before implementation.

## 3. Chosen interaction direction and alternatives

Recommended: experience-first guided investigation. The user's situation anchors discovery, reading, comparison and contribution. Explain the mechanism at the moment someone asks why or encounters a consequence.

Alternative A: living casebook, centred on an evolving question and its attempts/corrections. Strong for collective sensemaking, potentially too much history for a quick arrival.

Alternative B: open knowledge instrument, centred on source-to-record-to-result transformation. Strong for teaching, potentially a technical prerequisite before receiving value.

Use the casebook within an account; expose the instrument as contextual depth. Do not put three equal applications on the landing screen.

Three depths of one object:
1. Use: experience, conditions, passages and replies.
2. Understand: why this matched, what is interpreted, what sharing means.
3. Inspect: actual records, relationship origin, revisions and processing evidence.

RegExr supplies linked input/result/explanation; Diffusion Explainer supplies readable process depth; OpenRefine supplies preview and reversible exploration; Speedscope supplies selected-object context; Transformer Explainer supplies coordinated levels. These are interaction references. Cisco Cloud Control remains the visual north star. See COMMONS-REFERENCE-ATLAS.md.

## 4. Storyboard and layout

Use the real existing example: 'My Mac cannot see my frame'. Select actual captured records and verbatim passages from the corpus; never invent source quotations or outcomes.

### A. Arrive

Visible: a quiet page, product promise, situation field, example entry and actual corpus coverage. Primary: Find experiences. Secondary: Try example, browse, How this works.

    Commons                                      How this works
    Find experience that fits your situation.
    [What are you trying to do, and what happened?            ]
    [Find experiences]   Try example   Browse captured community
    Coverage and limitations

Action: enter a situation. Change: query and results. Stable: question, coverage and route context. System knows only entered information and captured corpus; device identity and diagnosis remain unknown. Preserve current auth boundaries; do not silently make authenticated reads public. If the prototype needs participant selection, explain it plainly at the actual gate rather than pretending it is production identity.

### B. Recognise

Visible: readable accounts, original wording where captured, conditions, why relevant, important difference/unknown, attribution and source. Primary: Inspect. Secondary: Compare, Why this matched.

    Your situation [Edit]
    Experience / original excerpt
    Why it may fit | What differs or remains unknown
    [Inspect] [Compare] [Why this matched]

Action: inspect match explanation. Change: inline trace from entered words to recorded matching basis. Stable: selected result and situation. System knows retrieval output, not whether the advice will work. If ranking has no per-result explanation, say it is unavailable; do not generate a post-hoc explanation and present it as the actual algorithm.

### C. Inspect

Visible: reported account, source/author/date, conditions, attempted steps, reported outcome, exact evidence, limitations and subsequent conversation. Primary: follow evidence or choose a relevant next action. Secondary: compare, reply, add observation, inspect assembly.

    Back to results                   Your situation remains available
    EXPERIENCE / author / source / date
    Reported account and exact passages
    Conditions | attempts | outcome | unknowns
    Replies and qualifications
    [Compare] [Add what you learned]
    How this reached you [expand]
    Source -> captured evidence -> interpretation -> result

Action: select passage or lineage stage. Change: contextual detail alongside the reading surface on wide screens or inline on narrow ones. Stable: account, situation and selection. System knows captured evidence and declared origins; absent conversation or historical content stays absent. No decorative complete pipeline where traces are missing.

### D. Compare

Visible: two selected accounts aligned by conditions, attempts, outcome and limitations, plus reachable original passages. Primary: inspect the difference that could change the next step. Secondary: swap/remove account or return. Stable: query and selected accounts. Unknown fields read Unknown, not inferred compatibility. Do not infer a shared cause from similar symptoms.

### E. Contribute

Visible: free-text observation and contextual relationship. Primary: Preview. Secondary: cancel without losing draft, inspect selected source. Preview shows exact outgoing text, attribution, assistance declaration, relation, destination, visibility and what remains private.

    What did you learn? [your words]
    Connected to [account / passage]
    [Preview]
    Exact outgoing content / author / destination / visibility
    [Back to editing] [Actual save or submit action]

Action: explicitly approve actual save/submit. Change: backend-confirmed state or explicit failure. Stable: edited words and selected context. System knows the destination response; it must not equate a local draft, shared-room submission and external publication. Reuse currently supported capabilities before adding any new destination.

### F. Rediscover

Visible: the saved/submitted contribution with real status, attribution and link back to its context. Primary: open it through supported discovery. Stable: canonical identity. A second participant's successful discovery demonstrates a shared loop; the author's local rediscovery alone does not establish community value.

## 5. Interaction and state requirements

- Store shareable query/account/selection context in URLs where existing contracts support it. Browser back, reload and copied links must preserve meaningful context. Unsaved private text must not leak into URLs.
- Loading retains the situation and prior usable context with an explicit pending state. Guard against stale search responses.
- Empty results disclose coverage and allow editing/browsing; no synthetic account fallback.
- Errors preserve draft and context and offer safe retry. Prevent accidental duplicate submission; verify existing idempotency behaviour before adding a contract.
- Partial captures distinguish uncaptured, unavailable, stale and unknown. Unsupported actions explain the boundary without fake success.
- Keyboard: labelled inputs; visible focus; logical order; Enter submits search where appropriate; disclosures are buttons; Escape closes temporary detail and restores focus. All hover information is also focus/click accessible.
- Use semantic headings, quotation/source distinctions, textual status in addition to colour, adequate contrast and touch targets. Respect reduced motion. Avoid inaccessible diagram-only explanations.
- Narrow screens use one reading flow; compare stacks with repeated labels; contextual inspectors become inline sections or accessible dialogs. No horizontal page scroll at 360 CSS px.

## 6. Visual principles: Cisco Cloud Control north star

Interpret the user's chosen reference as disciplined operational clarity: restrained shell, clear surface hierarchy, precise selection/status, readable detail and generous but purposeful spacing. This is a product-specific interpretation, not a claim to Cisco's private styles or exact tokens. The exact preferred Cisco screen/theme still needs a screenshot or accessible reference capture.

Proposed starting tokens for visual review, not reverse-engineered Cisco values:
- Light canvas #F5F7FA; surface #FFFFFF; subtle surface #EEF2F6; text #17212B; secondary text #526170; divider #D7DEE6; active accent #146BD1; focus #005FCC.
- Semantic starting colours: success #18734A, warning #8A5700, error #B42318. Always pair with text/icon; verify contrast in real combinations before release.
- Spacing scale 4/8/12/16/24/32/48 px; controls approximately 40-44 px high; surface radii 8-12 px. Body 16/24 px; compact metadata no smaller than 13/18 px as a default; heading 28-32 px. Use existing suitable font assets or system sans, not a new font download requirement.
- Opaque reading surfaces; translucency only where hierarchy remains clear. Transparency primarily means inspectable information and consequences, not glass everywhere.
- Fine dividers and low elevation. Avoid nested card grids, arbitrary gradients, oversized pills and floating windows. Use elevation for temporary detail, not every paragraph.
- Active selection combines accent, outline and clear label. Focus remains distinguishable from selection. Status must not resemble an action.
- Motion 120-180 ms as a provisional range; only reveal continuity or consequence, never imply work that did not happen. Reduced motion removes nonessential transitions.

Review one real result, detail, comparison and contribution preview against the chosen Cisco reference. No generic SaaS dashboard, Cisco branding copy or transplant of infrastructure navigation. Keep evidence and limitations prominent, not tiny decorative metadata.

## 7. Architecture, roadmap and handoff

See ../build/COMMONS-EXPERIENCE-BUILD-PLAN.md and ../build/COMMONS-CLAUDE-CODEX-HANDOFF.md. Preserve existing service/corpus/contracts; verify branch state before modifying code. No package or starter compatibility is established by this blueprint.

## 8. Open questions and risks

- Exact Cisco screenshot/theme; the visual north star is confirmed, exact tokens are proposed.
- Actual TanStack starter location, versions and migration value; development-practice is a method, not evidence of a ready app starter.
- Which retrieval explanations and lineage steps are really available?
- Which current shared/publication destinations are exercised and appropriate?
- Does progressive disclosure hide crucial limitations? Test recognition, difference, source/interpretation distinction and privacy understanding.
- Does the educational layer help the decision, or become a distracting demonstration? Compare with a simpler account view.
- Backend and graph runtime state require direct verification. No federation, hosting or community-impact claim follows from a merge.

## 9. Source and decision basis

Internal: HUMAN-SIGNAL-CONCEPT.md; docs/product/VALUE-AND-UX.md; AGENTS.md; .observstory/knowledge.json; apps/commons/src/App.tsx; apps/commons/src/components/commons/CommonsHub.tsx and ProblemPanel.tsx; apps/commons/src/styles.css, as inspected during this conversation. These observations must be rechecked at implementation time.

External evidence and review limitations are recorded in COMMONS-REFERENCE-ATLAS.md. User direction is recorded from the 1 November design conversation, not represented as a formal repository review. Accepted decisions, proposals, implemented behaviour and tested results must remain separate.
