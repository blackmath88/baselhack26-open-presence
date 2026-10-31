# Claude handoff — PDF reassurance, human signals and the travelling manual

Requested by Achim · 31 October 2026 · Execute in the VS Code agent

## Mission

Continue the existing PDF-history explainer in this repository. Achim likes edition 01. Preserve its narrative and retro document-workbench direction; extend it to explain **the reassurance we associate with PDF**, then use that impulse to introduce today's questions about human signals and information provenance.

This is a bounded implementation task for the receiving Claude agent. The handoff-creation pass does not modify HTML. Work from the current repository state, preserve unrelated changes and follow applicable repo instructions. Use a feature branch such as `feat/pdf-history-reassurance`; complete and test the work, then open a reviewable PR. Do not deploy, publish to accounts or rename the project.

## Read first

- `modules/pdf-history/README.md`
- `modules/pdf-history/index.html`
- `modules/pdf-history/DESIGN.md`
- `modules/pdf-history/PLAN.md`
- `modules/pdf-history/PROCESS.md`
- `modules/pdf-history/sources.json`
- `modules/pdf-history/research/CLAIMS.md`
- `HUMAN-SIGNAL-CONCEPT.md` and the root README

Read the linked Scrollies narrative contract and field-manual principles if needed. Inspect the existing implementation, not just its plan. It is a working single-file explainer with six acts, original UI illustrations, two experiments, reversible desktop scroll states and accessible static fallbacks.

## The new insight — preserve Achim's intent

Achim's reflection, paraphrased:

> What do we feel towards a PDF? I trust that the information sent is the information received. It is a familiar, widely usable standard: a vehicle from one place to another, person to person and person to paper through a printer. We even put signatures on it. What comparable reassurance do we need today? My concern is the genuineness of human signals online and the provenance of information: the Google problem and the LLM-chat problem.

The emotional bridge is central, not an extra technical footnote. Readers should recognise the feeling of receiving a stable, familiar object before we ask what needs reassurance now.

Treat this as Achim's design hypothesis and situated experience, not a researched finding that all people trust PDFs or that PDF guarantees authenticity.

## 1. Show the reassurance, not just the compatibility mechanism

Add a short, memorable beat after the technical/adoption/business explanation and before the present-day bridge. It can be a state within an existing act; do not add a long new chapter merely to accommodate more text.

Possible copy direction, to refine:

- “I know what I’m receiving.”
- “The page they sent. The page I open. The page I print.”
- “A familiar vehicle for information.”
- “The reassurance is that something recognisable survives the journey.”

Visually follow the SAME manual through sender → receiver → printer/paper. Preserve the document title, revision, diagram, marked paragraph and page numbers so continuity is visible. The model is selected page fidelity and interoperable receiving, conditional on file/resources/software, not byte identity between a digital file and a printed sheet.

Give the standard/familiarity idea human meaning: less negotiation about how to receive the document. Distinguish this interpretation from a measured public-trust claim. Do not invent survey percentages or use “universal” as an absolute compatibility guarantee.

Keep the core historical story usable without the optional Open Presence bridge.

## 2. Make the illustrated manual actually become two pages

This request concerns the **illustrated field manual inside the story**, not splitting the HTML explainer into two routes or files.

The current substituted-font state lengthens the page and changes a page-count label. Make the consequence tangible: page 1 overflows into a visible page 2 or a clear two-page spread/thumbnail view. Move a real sentence/marked paragraph onto the second sheet rather than showing only “continued” text.

- Original state: compact, intact one-page document.
- Substitution state: changed wrapping and content carried onto page 2.
- Preserve all content across the comparison; identify where the overflow went.
- Restore state: paragraph and page count return.
- A small two-page layout or page selector must remain readable on a phone.
- Keep HTML self-contained; do not create a second website page.
- If the visual makes the manual look taller instead of paginated, the change is incomplete.

Preserve the document's identity across the later PDF representation. Explain that PDF settles pagination rather than magically undoing an author's already-made layout choices.

## 3. Show characters that fail to arrive

Add a short meaningful specimen, for example:
`Grüsse aus Basel — ä ö ü / ß / € / →`

Use it to show a labelled missing-glyph/encoding failure alongside the layout change. In the broken simulation, selected visible characters can become outlined missing-glyph boxes. In the intact state, the original characters return.

Technical honesty matters:
- Do not claim Courier or a whole modern font inherently lacks umlauts; actual font fallback can preserve them.
- Distinguish substitution/reflow from missing glyphs and encoding/mapping errors.
- Explicitly label the effect an illustrative simulation. Do not depend on the viewer's real system missing a font.
- Keep the original string available as semantic text/caption for assistive technology; decorative damaged glyphs should not produce gibberish to a screen reader.
- A PDF is not automatically immune to missing resources or broken text extraction.
- Do not swap in a remote font or external dependency.

The reader should feel that losing a small character can change information, rather than treating it as a decorative glitch.

## 4. Acknowledge signatures without conflating kinds of trust

Add a small present-day beat: we now routinely receive important documents as PDFs and may sign them. Use a labelled illustrative signature field/stamp, not a real person's signature.

Separate the concepts in plain language:

| Reassurance | What it concerns |
| --- | --- |
| Familiar rendering/format | Can I receive and inspect the document as intended? |
| Provenance | Where did this version come from, and who is associated with it? |
| Integrity | Has the relevant signed content changed? |
| Identity/authorship | Who is the asserted author/signer, and how is that identity established? |
| Truth/applicability | Is the information correct and relevant to my situation? |

A drawn or pasted signature image is not a cryptographic digital signature. Cryptographic validation depends on the signing mechanism, certificate/trust context, software and handling of later changes. It does not prove all statements in a document true. Never imply every PDF is signed, immutable, authentic or legally equivalent in all jurisdictions.

Research the exact signature wording in primary Adobe/standards documentation before publishing the claim. This is a communication/history task, not legal advice or a signature-engine implementation. No legal-effect assertions or live signing workflow are needed. Record the new source and caveats in sources.json.

## 5. Add a short problem teaser for today

Sharpen the closing question:

**“If PDF reassured us that the page could travel, what needs to survive when information travels through search and AI?”**

Then introduce two concrete experiences. Label them as our observations/hypotheses to investigate.

**The search / Google experience**
A person searches for a specific problem and recognises their situation in a thread: hardware, version, screenshots, failed attempts, dates, disagreement and follow-ups. The useful human signal is not merely an answer or a top-ranked result; its surrounding context helps the person judge relevance. Ask what makes that signal findable and inspectable through intermediaries. Do not claim Google is universally useless or that every visible contribution is human/authentic.

**The LLM-chat experience**
An answer can reach us quickly while the original conversations, contributors and disagreements are harder to inspect. Separately, a useful investigation made with an agent can stay inside a private chat instead of becoming an attributable public contribution. These are TWO gaps: context arriving with an answer, and a path for new experience to return to shared knowledge.

Bring the two together around **genuine human signals and inspectable provenance**. “Human” is not a synonym for correct; “AI-assisted” is not a synonym for fake. Keep authorship, declared AI involvement where relevant, evidence and interpretation distinguishable. Do not promise that any format can prove humanness.

The ending should feel like an invitation into our experiment, not a claim of a solved problem. Retain the actual photo-frame pilot and its “My Mac cannot see my frame” scenario. ATProto remains a candidate portable record layer; it does not itself guarantee truth, human identity, retention, discovery, moderation or community.

Target a short closing passage and 2 concise visual examples. Avoid doubling the explainer's reading time. Make extra distinctions available in source/limits notes where appropriate.

## Interaction and visual constraints

Preserve the warm-paper / ink / red / mint / blue-title-bar direction. Let period UI quirks explain information loss and reassurance: a missing-font dialog, literal pagination, missing-glyph boxes, receiving software, print preview and a modern signature contrast.

Keep at most two primary narrative operations: mutate the manual's state and reframe what has to travel. Define state/scene boundaries and continuity before adding motion.

- Native scrolling; deterministic forward/reverse progression.
- Existing manual controls retain precedence over automatic scroll states.
- No timed typewriter queues, fake download speed, scroll hijacking or decorative OS emulation.
- Mobile and short viewports recompose into normal flow.
- Reduced motion preserves the complete before/after argument without requiring animation.
- No JavaScript retains readable story, character specimens, pagination explanation and sources.
- Keep all runtime CSS/JS/SVG embedded in index.html; no fonts/libraries/APIs loaded over the network.

## Deliverables

1. Updated standalone `modules/pdf-history/index.html`.
2. Updated source/claim ledger; verify new factual wording and leave unverified research untouched.
3. DESIGN.md records edition-02 changes, narrative reasoning, actual checks and limits.
4. PROCESS.md records this new editorial step and clearly attributes reassurance/human-signal framing to Achim.
5. Module README reflects actual implemented status.
6. A concise PR description and issue reference. Do not modify the core pilot or original supplied research report as incidental cleanup.

## Acceptance checklist

- [ ] Receiving a PDF conveys the intended emotional reassurance before the contemporary question appears.
- [ ] The same manual visibly travels between people/devices and print, with continuity markers.
- [ ] Font substitution creates a genuinely visible second illustrated page; restoration returns the content.
- [ ] Selected umlauts/symbols visibly fail in a labelled simulation and return in the intact state.
- [ ] Captions distinguish glyph/encoding issues from layout reflow; semantic text remains accessible.
- [ ] Signature visual separates familiar format, provenance/integrity and truth; new factual claims have primary sources.
- [ ] Search and LLM-chat teasers include both inspectable context and contributions trapped in private chats.
- [ ] Framing stays a user perspective/hypothesis, not an unsupported diagnosis of all search/AI.
- [ ] Offline single-file opening, keyboard, internal anchors, reverse scroll and manual overrides work.
- [ ] Browser QA at 390/768/1440 and a short viewport: no overflow, dialog collisions, disappearing content or unreadable two-page miniatures.
- [ ] Reduced motion, no JavaScript and print remain coherent; record tests actually run.
- [ ] No deployment or upstream publishing; hand back the PR/commit and remaining limitations.

## Completion report

Lead with what the reader now understands and sees. Link the PR/commit, name changed files, summarise meaningful checks and disclose untested browsers or source uncertainties. Do not call a render test an accessibility certification. Do not request further permission for ordinary implementation or reversible fixes within this task.
