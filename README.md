# Open Presence — working name
BaselHack 2026 · Updated 31 October 2026

**Make the conversation around knowledge discoverable and participatory, even when agents are how we reach it.**

Start with [the current concept](HUMAN-SIGNAL-CONCEPT.md).

## Hackathon project management
- [Project and time plan](HACKATHON-PLAN.md) — milestones, acceptance criteria, Saturday/Sunday targets and scope cuts.
- [Observstory dashboard and guide](OBSERVSTORY.md) — evidence-backed activity, overlaps and check-ins.
- [Latest dashboard runs](https://github.com/blackmath88/baselhack26-open-presence/actions/workflows/observstory.yml) — download the dashboard and repository-growth replay. Pages deployment is prepared; see the guide for activation.

Suggested schedule times are planning targets; the official submission deadline is not yet established.

## What we are building
A real **Photo Frame Commons** pilot around [wesbos/photo-frame-dashboard](https://github.com/wesbos/photo-frame-dashboard): find a relevant experience, inspect its circumstances and original conversation, explore connections, and contribute a short observation back through a reviewable local draft.

The value includes the paratext: questions, failed attempts, versions, screenshots, disagreement, corrections and follow-ups. An answer should retain the context that lets a person judge whether it applies.

Two connected questions:
- **Discovery:** how do people and agents find situated experience without losing its context?
- **Community:** how do private AI-assisted investigations become small, useful contributions to shared knowledge?

Authentic means attributable and inspectable here, not certified true or necessarily written without AI.

## Our two repos for these two days
| Repository | Focus |
| --- | --- |
| **This repository** | The photo-frame pilot, discovery/community experience and optional Adobe story |
| **[Knowledge Lab](https://github.com/blackmath88/baselhack26-knowledge-lab)** | Build and explore a graph for fun; investigate extraction, relationships and retrieval with LightRAG |

The graph is part of the exploration. Its connections must lead back to evidence and disclose how they were proposed. A simpler local index keeps the pilot usable independently of the lab service.

[Postack Underflow](https://github.com/blackmath88/postack-underflow) and [br-ai-nstorm](https://github.com/blackmath88/br-ai-nstorm) are prior work and reuse sources, not extra weekend delivery repos. **Build the new pilot here**, superseding the earlier suggestion to put it in Postack. Wes's repository stays the external source.

## First experience
**“My Mac cannot see my frame.”**

Find relevant accounts → inspect hardware and circumstances → follow original contributions → explore source-declared and proposed connections → draft a follow-up → preview its effect.

Start with a bounded real corpus and source links. Preserve individual authorship. A short “still fails on this version” should not need to become a polished AI summary.

br-ai-nstorm supplies shared sensemaking concepts; ATProto is the candidate portable record layer. Live federation is not an existing capability of this pilot.

## Adobe is an optional narrative

[PDF history scrolly module](modules/pdf-history/README.md) — original research, editorial provenance, claim-verification queue and [six-act build plan](modules/pdf-history/PLAN.md). [Edition 01](modules/pdf-history/index.html) is implemented as one offline HTML file; [design and browser checks](modules/pdf-history/DESIGN.md) document the working retro direction and limitations.
**“PDF helped us preserve a document when it travelled. What should we preserve when an answer travels through AI?”**

The concept and tool must stand without this framing. Photoshop can introduce the familiar experience; photo-frame contributions are the actual case. PDF preserved form, not truth.

A future name may be a PDF wordplay. Naming and repository renaming are deferred.

## Status and working boundaries
This update is documentation only; no running pilot or federation is claimed. Inspect current code and Knowledge Lab's active branch/runtime before implementation or integration.

Use source snapshots, explicit attribution, reviewable interpretations and labelled local drafts. Do not publish to participant accounts, modify upstream repositories, ingest private chats or deploy as an incidental part of the prototype. Record licences and source revisions before reuse.

The [earlier business-presence brief](EARLIER-BUSINESS-PRESENCE.md) is preserved for history. Its hotel/booking scenario is not the current build direction. The [official Adobe challenge](https://www.baselhack.ch/challenges/the-post-website-business) remains a presentation constraint to clarify independently of this experiment's purpose.
