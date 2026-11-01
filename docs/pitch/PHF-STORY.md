# .phf — portable human format
## trust in ai driven webspace

1 November 2026 · Presentation direction agreed by Achim; script and timings proposed by ChatGPT / Codex.

## What is agreed
- Name: **.phf [portable human format]**.
- Subtitle: **trust in ai driven webspace**.
- Three parts, in this order: the past (PDF), the future (.phf), the present (Observatory).
- The middle part is the longest: it explains the concept and demonstrates the actual build.
- Check that the implementation earns the story. Do not present the narrative as proof of a finished product.

This updates the earlier naming deferral and optional presentation framing. It does not rename repositories, packages or schemas. Photo Frame Commons remains the implementation/demo case. Existing concept and historical decisions remain available.

## The thread
**What should survive the journey—from a person, through a file or an agent, to another person?**

Looking forward often means looking back. There is a reason it is called Back to the Future.
A small pixel DeLorean can introduce the journey; it should be a brief visual cue, not the subject of the pitch.

Suggested allocation: 20% past / 65% future and working demo / 15% present.
For a five-minute slot: 1:00 / 3:15 / 0:45. The actual allotted pitch duration remains unconfirmed here.

## Part 1 — The past: what did we expect to arrive?
**Question:** When I send you a PDF, what am I trusting?

A document travels from one person to another, from software to software, from screen to paper.
We expect to recognise what arrives. That familiar expectation gives us an opening into trust.

Show one PDF Lab experiment: the same visible page, a different extracted reading.
Prefer the paired poems; label the actual engines/results rather than implying every reader behaves identically.
Let the audience see the discrepancy before explaining it.

PDF helped preserve appearance. The format itself does not certify authorship or truth.
Our lab asks what survives—and what changes—when another interpreter reads the file.

**Transition:** “If an agent becomes the next reader, what else needs to arrive intact?”

Use [PDF Lab](../../sideprojects/pdf-lab/README.md). Keep the wider history and cabinet as optional exploration after the pitch.

## Part 2 — The future: .phf
**Question:** Five years from now, how will we recognise the human experience behind an answer?

### The hypothesis
In an AI-driven web, producing an answer may become easier while judging its origins remains difficult.
A person who actually tried something, met a limitation, disagreed or changed their mind may offer something especially valuable.

This is our hypothesis, not a measured prediction. Human-written does not mean true.
AI assistance does not erase an authentic experience. Preserve both the contribution and the declaration of how it was prepared.

### Begin with a situation
“My Mac cannot see my photo frame.”

A polished answer might say “try a hub.” A useful account also tells us:
which device, under which conditions, what failed, what the person observed, and who later qualified it.

Those details help us judge whether the advice applies. The surrounding conversation is part of the knowledge.

### What .phf means in this prototype
The joke on Portable Document Format becomes a design question:
can human context travel with knowledge across interfaces?

The current contribution model carries a voice, attributed participant, circumstances, source references,
exact evidence passages, time, assistance declaration, and links to replies or corrections.
People can arrive from repository navigation, search, direct links, CLI or MCP.
The entrances meet in one shared Commons.

.phf is the project's name and a proposal for portable human context.
It is not an implemented .phf file extension, an established standard, a humanity detector or a truth certificate.
The implementation currently uses Commons JSON contracts and experimental ATProto lexicons.

### Main demonstration — one observation makes the whole journey
1. **Find.** Search “My Mac cannot see my frame.” Show a relevant account and one applicability limit.
2. **Inspect.** Open the source passage. Distinguish the original contributor from the agent-written, unreviewed problem record. Show a source link and conditions.
3. **Respond.** Select “Respond to this passage.” Add a clearly labelled demonstration observation using a prototype participant. Include circumstances and an honest assistance declaration.
4. **Choose what leaves.** Preview the exact content, cited passage and destination. Submit to the local shared room. No whole private chat is uploaded.
5. **Meet another person.** Switch prototype participants; add a question or correction. The original contribution remains inspectable.
6. **Rediscover elsewhere.** Find that contribution through the CLI or MCP and the cited repository object. Show author, source and conversation connection surviving the change of entrance.

The demonstration text is staged input, not a newly reproduced hardware finding.
Use the existing [DEMO.md](../../DEMO.md) commands and tested record IDs during rehearsal.
If demonstrating MCP through a real agent, rehearse that connected client separately; the existence of an MCP server does not prove an agent session is ready.

### The strongest portability beat
If the isolated development PDS is running and rehearsed:
publish the selected observation and another participant's reply; rebuild the thread in a fresh app instance.
Show that source references and the versioned reply relationship survive.
Say explicitly: “This is an isolated development network.”

If it is not ready, show the existing round-trip evidence as recorded evidence and state the limit.
Do not call cross-interface access alone proof of portability between independently hosted services.

### Why this belongs in the Adobe challenge
The post-website question is also a question of representation:
when another party's agent speaks about a creator, business or community, can people still reach the source,
inspect its conditions and contribute a correction?

Our actual demonstration uses photo-frame community knowledge. It does not implement a hotel booking flow
or demonstrate adoption by businesses. The transfer to creators and businesses is the proposed future application.
Confirm the fit with the challenge's judging expectations; do not invent organiser endorsement.

### What the audience should remember
**“The answer travels. The human context comes with it.”**

The practical value is finding experience that fits, understanding its limits, and leaving something useful for the next person.
A format can support that loop. It cannot create community participation or trust by itself.

## Part 3 — The present: where that future gets built
**Question:** Where do we stand when we look backwards and imagine forwards?

Now. This is where we create the knowledge, practices and software that shape what comes next.

Show Observatory briefly: one project question or concept, its source evidence, and its history or declared status.
Explain how it helps humans and AI inspect the work they are doing together: intentions, proposals, decisions and evidence.

Observatory is a bridge between human and AI cognition and collaboration in repositories.
It is a related application of the same concern; it is not the Commons product backend or proof that agents share a human understanding.
The current selected manifest lacks implementation records, so do not promise a complete build-progress view.

**Closing:** “We looked back at what a document carries. We explored what an answer should carry.
And we built a way to keep our own collaboration inspectable while we work on that future.”

## Delivery priorities
1. Rehearse the complete middle journey on the actual demo host and device.
2. Make .phf visible in the presentation and user-facing entry point; keep technical identifiers stable.
3. Put source, participant, assistance, circumstances and correction relationships in the audience's line of sight.
4. Rehearse the isolated portability demonstration, or label recorded evidence clearly.
5. Keep PDF and Observatory concise. Extra cabinet experiments and architecture stay available for questions.

See [build-fit review](../reports/PHF-STORY-BUILD-FIT-2026-11-01.md) for evidence and limits.
