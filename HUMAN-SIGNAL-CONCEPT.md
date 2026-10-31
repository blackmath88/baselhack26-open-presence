# Human Signal — discovery and community
31 October 2026 · Working concept · Name provisional

## Current decision
Build a real Photo Frame Commons experiment around [wesbos/photo-frame-dashboard](https://github.com/wesbos/photo-frame-dashboard). The purpose is discoverable experience and shared sensemaking in an agent-mediated web. It must make sense with or without the Adobe/PDF narrative.

For these two days, the active repositories are:
- **This repository, baselhack26-open-presence:** the experience, public-source pilot, community model, and optional Adobe presentation.
- **[baselhack26-knowledge-lab](https://github.com/blackmath88/baselhack26-knowledge-lab):** the parallel graph/retrieval learning experiment. Build and explore a graph for fun; investigate what it reveals and what its extraction loses.

Postack Underflow and br-ai-nstorm supply research and reusable mechanisms. They are not additional weekend delivery destinations. This supersedes the earlier suggestion to implement the pilot inside Postack at /commons/. Wes's repository remains an external source, not a repository we modify.

A future name may play on PDF. Do not rename either repository or settle the expansion yet. “Human Signal” and “Photo Frame Commons” are working labels, not final brands.

## The value we deliver

**Find experience that fits your situation. Understand its limits. Leave something useful for the next person.**

We help people judge whether someone else's experience applies to their situation, and make their own discoveries available to others. The intended benefit is less repeated investigation and more usable shared experience; it remains to be tested.

Three agreed use cases:
1. **Has someone encountered my situation?** Find a relevant account and see why it matches.
2. **Does this advice still apply?** Inspect conditions, disagreement and later corrections before choosing a next step.
3. **We learned something others could use.** Turn a selected observation into a small, attributable contribution.

The photo-frame corpus is the demonstration case. The value is independent of a particular repository. A local draft demonstrates contribution preparation and personal rediscovery; community value requires another person to discover and use a shared contribution.

See [Value and UX](docs/product/VALUE-AND-UX.md) for proposed interface wording, visible evidence and demo checkpoints. The value framing and use cases were explicitly agreed by Achim; the interface details remain proposals.

## Begin with the experience
You search a few words about a Photoshop problem, find a Reddit thread, and recognise: “Yes, exactly my situation.” Or you land on a relevant Stack Overflow discussion about an Adobe development problem.

What helps is more than an answer. Someone asks which version; another describes a failed attempt; a screenshot reveals a difference; a later reply corrects the advice. You use those surroundings to judge applicability and trust.

We call this **paratext**: the questions, original wording, dates, versions, failed attempts, screenshots, disagreements, corrections and follow-ups surrounding a solution.

An agent can bring information directly to you, which is useful. But its synthesis can make the path harder to inspect. What was actually observed? Which exception disappeared? Whose interpretation connected these sources? The person may become dependent on one intermediary's judgement.

Then you solve something with your own AI. The new observation may remain in a private chat. The answer arrived, but your experience did not travel back.

These are experiences and hypotheses to investigate. They do not establish that Google is universally useless, that every AI answer hides its sources, or that public knowledge is inevitably declining. Platforms may close or restrict access; self-hosting alone does not guarantee availability either.

## Two questions, connected but distinct
**Discovery:** How can people and agents find situated experience and inspect enough context to judge it for themselves?

**Community:** How do people continue interacting and contributing when agents mediate much of the web?

A useful result may be an unresolved conversation. A useful contribution may be “same here,” “what version?”, “still fails,” a screenshot, or a correction. Preserve that voice. Do not require people to produce a polished article or complete a formal evidence form before participating.

We are exploring the future with AI as part of it. AI may help translate, find, connect and organise. Its interpretations should remain distinguishable and contestable.

“Authentic” here means attributable contributions with inspectable context and history. It does not mean certified true, proven human, or written without AI. Identity, authority, provenance, evidence, applicability and permission are separate matters.

## The real case: Photo Frame Commons
Wes's repository already contains contributions from people working with agents. It is therefore an opportunity to investigate a functioning feedback loop, not a prop for an inevitable-decline story.

Start with the question: **“My Mac cannot see my frame.”**

Candidate public contributions inspected on 31 October:
- [PR #268](https://github.com/wesbos/photo-frame-dashboard/pull/268): a report about Mac USB connection and external power on a particular Frameo unit.
- [PR #264](https://github.com/wesbos/photo-frame-dashboard/pull/264): a report that a hub resolved enumeration for a different device.
- [PR #256](https://github.com/wesbos/photo-frame-dashboard/pull/256): a second device report qualifying an existing guide, with failed attempts and differing conditions.
- [PR #262](https://github.com/wesbos/photo-frame-dashboard/pull/262): the contributor explicitly separates personal background from AI-assisted investigation and writing.

These are source-reported observations, not independently reproduced findings. Do not treat related symptoms as equivalent fixes, PR inclusion as endorsement, or closure/merge as proof. Fetch complete relevant threads and reviews before claiming to represent the conversation.

The source README already warns that the same retail name can cover different hardware. Applicability is a central part of the knowledge, not an optional footnote.

## First working journey
1. **Recognise:** search or browse by a practical problem.
2. **Inspect:** see relevant accounts with hardware, version, date, source, authors and limitations. Explain the match and expose near-matches.
3. **Connect:** explore questions, approaches, evidence and disagreements in a thread or graph, keeping original contributions reachable.
4. **Explore privately:** take a bounded selection into work with your own AI; no requirement to expose the private conversation.
5. **Contribute:** draft a short observation, inspect exactly what would leave the private workspace, and preview how it connects.
6. **Rediscover:** a reviewed local contribution or classification correction changes the local view/index while the original source remains unchanged.

Initial contributions can remain local drafts with explicit status. No synthetic comment is presented as real community activity. Public posting is a separate integration and authorization step.

A source inspector and coherent journey matter more than broad crawling or many disconnected sketches.

## Roles of the underlying ideas
### Postack: finding and questioning the index
Reuse the problem framing and inspectable retrieval approach. Keep source records separate from classification claims. “These belong together” is an attributable interpretation. Preserve unknowns, unmatched material and correction history.

Potential code references are the deterministic retrieval engine, connection contracts and local correction preview. Assess actual dependencies and licences before copying. Do not import the entire essay or sixty laboratory sketches as the product.

### br-ai-nstorm: working through a problem together
Use its semantic model: questions, approaches, evidence, assumptions, contradictions and synthesis. Maps and timelines are views of that material.

Its Open Cognitive Bubbles idea supplies the bridge between private AI-assisted exploration and bounded, reviewable shared contributions. AI may propose structure; it must not silently rewrite collective memory.

The adoption documentation describes a deterministic Markdown importer and line-anchored references. It does not directly ingest GitHub discussion threads. Its repository attribution cannot substitute for individual comment authorship. The pilot needs an adapter preserving source IDs, author logins, permalinks, timestamps and relationships. Unknown authorship stays unknown.

### ATProto: a portability experiment
Explore independently held contributions and shared record schemas, with multiple interfaces interpreting them. Self-hosting is an option, not a prerequisite for every participant.

Begin with public read-only integration where relevant and clearly labelled fixtures for missing semantics. Do not imply custom schemas are established standards or that federation is already implemented.

Preserve AT URIs and observed CIDs where available. Account signatures are not proof of humanity or truth. Edits, deletion, stale caches and unavailable sources need explicit behaviour; version references do not preserve historical content by themselves.

Community moderation, governance and participation cannot be supplied by a format alone.

## The two-repository weekend
| Repository | Weekend purpose | Boundary |
| --- | --- | --- |
| Open Presence (provisional name) | A working experience around real photo-frame knowledge: discover, inspect, connect, challenge and contribute locally | Owns the pilot's interpretation and interaction, not the external community's source material |
| Knowledge Lab | Playful graph/RAG exploration: inspect extracted entities, links, passages and retrieval behaviour | A learning backend/experiment; extracted relationships are assertions, not verified social relationships |

Knowledge Lab's main README specifies LightRAG. This concept does not replace its engine, restart services, expand its allowlist, authorize paid runs or claim its runtime is ready. Check its current implementation branch and operational state before integration.

Use a small shared source manifest/export contract if useful: source URL, repository/revision or retrieval time, author when known, original passage, record ID, and relationship origin. Keep implementation independent enough that the human-facing pilot can run from a deterministic local snapshot when the graph service is unavailable.

The graph is a deliberate exploration, not decoration that must prove better retrieval. It can reveal unexpected connections, misleading similarities, omissions and disagreement. Every edge should disclose whether it comes from an explicit source link, deterministic rule, editorial interpretation or model proposal.

A Knowledge Lab entity co-occurrence is not automatically a community relationship. Source statements, extracted entities and participant judgements need separate types and labels.

## What we want to learn
Compare ordinary repository navigation with our pilot on a small set of real questions:
- Can someone find an applicable account?
- Can they explain why a similar account does not apply?
- Can they distinguish an observed result, a source claim and our interpretation?
- Can they reach the original conversation and identify what remains unknown?
- Can they draft a useful follow-up without losing their own voice or exposing unrelated private context?

For the graph: does it reveal a useful relationship, or merely create an appealing but misleading picture? Compare with the simpler index; record failures.

A small test may demonstrate a discovery mechanism. Community value requires people using it over time. Do not call the theory proven because a graph renders or a demo succeeds.

## Optional Adobe/PDF narrative
**“PDF helped us preserve a document when it travelled. What should we preserve when an answer travels through AI?”**

Five movements:
1. A document travels between systems. PDF preserves its intended form.
2. A person finds a public discussion and recognises their own problem.
3. An AI brings an answer, but context can disappear and new discoveries can remain private.
4. Portable contributions retain people, circumstances, evidence and disagreement.
5. A selected observation returns to shared knowledge and becomes someone else's starting point.

PDF means Portable Document Format. Adobe launched PDF and Acrobat in 1993; its original promise was reliable document fidelity, not certified truth. Signatures add integrity and signer-authentication mechanisms, not factual correctness.

Adobe's free Reader/paid tools history is a supporting business analogy, not the core user journey. Content Credentials is a relevant provenance reference; no C2PA integration or replacement is implied.

Photoshop is a recognisable narrative example. The actual pilot uses photo-frame contributions. The earlier hotel/booking and fictional repair-workshop ideas are superseded as build scenarios.

The existing challenge material emphasised local-business presence. Our broader framing does not establish organiser acceptance; keep that question separate from the independent value of the experiment. The implementation must remain understandable without Adobe branding.

## Delivery boundaries and next work
- Ingest a bounded, reproducible public-source snapshot with documented coverage and omissions.
- Preserve original material separately from generated descriptions, relationships and local drafts.
- Review licences and attribution; retain source revisions for reused code.
- Keep the two active repositories as the weekend work destinations.
- Do not modify Wes's repository, Postack or br-ai-nstorm as part of this concept update.
- No automatic outreach, account writes, production deployment or private-session ingestion.
- No truth score, manufactured consensus or fictional testimonials.
- Name, final stack and public presentation can follow the working experiment.

Status: concept update only. This document does not claim a running Photo Frame Commons implementation or live ATProto federation.

## Sources
Historical and technical sources checked during the discussion on 31 October 2026:
- Adobe, Acrobat's 25th anniversary: https://blog.adobe.com/en/publish/2018/06/14/evolution-digital-document-celebrating-adobe-acrobats-25th-anniversary
- Interview with John Warnock and Bob Wulff, including Reader becoming free in 1994: https://knowledge.wharton.upenn.edu/article/adobe-acrobat-at-20-successes-second-guesses-and-a-few-miscues/
- PDF Association, PDF specification and ISO history: https://pdfa.org/about-us/the-portable-document-format/
- Adobe Reader/product model: https://www.adobe.com/products/reader/faq.html
- Adobe signature validation: https://helpx.adobe.com/acrobat/desktop/e-sign-documents/manage-digital-signatures/validate-digital-sign.html
- Adobe Content Credentials: https://helpx.adobe.com/creative-cloud/apps/adobe-content-authenticity/content-credentials/view-content-credentials.html
- AT Protocol overview: https://atproto.com/guides/overview
- Postack concept: https://github.com/blackmath88/postack-underflow/blob/main/docs/CONCEPT-2026-10-28.md
- Postack protocol research (contains explicitly marked proposals and untested inferences): https://github.com/blackmath88/postack-underflow/blob/main/docs/research/ATPROTO-COMMUNITY.md
- Adobe challenge reference from the existing repository brief: https://www.baselhack.ch/challenges/the-post-website-business

Historical sources support the history, not our forecasts. Human-signal value, participation benefits and business viability are hypotheses to test.

