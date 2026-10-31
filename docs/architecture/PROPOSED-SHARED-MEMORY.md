# Proposed architecture — source-grounded discovery and shared problem memory

31 October 2026

**Status: proposal for architecture sparring, not an accepted ADR or implementation claim.**
Achim authorized recording this proposal and requesting review. That authorization does not approve every architectural choice below.

## Purpose and scope

Build the Photo Frame Commons journey in Open Presence: find an applicable experience, inspect the original conversation and its limits, explore attributable connections, and return a selected observation through a reviewable local draft.

First question: **“My Mac cannot see my frame.”**

The [current concept](../../HUMAN-SIGNAL-CONCEPT.md) and [hackathon plan](../../HACKATHON-PLAN.md) remain the scope references. Hotel/booking scenarios remain superseded. Adobe/PDF remains an optional narrative.

Only Open Presence and Knowledge Lab are weekend delivery destinations. Postack, br-ai-nstorm and Observstory are upstream references/reuse sources; this proposal does not authorize modifying them.

## Proposed ownership

| Component | Owns | Boundary |
| --- | --- | --- |
| GitHub source adapter and snapshot contract (new glue) | Captured original text, individual authors, source IDs, permalinks, revisions/retrieval times and coverage | Imports do not endorse statements. Imported material is not editable community memory. |
| Postack-derived retrieval | Rebuildable deterministic index, ranking and match explanations | Similar words or symptoms do not establish equivalent hardware, applicability or truth. |
| br-ai-nstorm-derived domain/application model | New contributions, qualified attribution, proposed/reviewed relations, conflicts and event history | AI may propose; review rules determine accepted interpretations. Acceptance does not certify factual truth. |
| Durable Object persistence adapter | Durable event storage and coordinated transactional appends | Storage/runtime mechanism; domain meaning, review and permissions remain in application rules. |
| Knowledge Lab / LightRAG | Derived entities, passage-grounded links and experimental retrieval | Extracted relationships are model assertions, distinct from source links and participant judgements. |
| Observstory | Repository activity evidence and explicitly selected project-knowledge exports | Does not own community contributions or replace the problem-memory model. |
| Open Presence interface | Find → inspect → connect → draft → rediscover | Must work from a deterministic snapshot when Knowledge Lab is unavailable. |

Sources retain what was said. The contribution event log retains what participants added and how interpretations changed. Indexes and extracted graphs are derived and rebuildable.

## Durable Objects: role and current evidence

br-ai-nstorm's Cloudflare deployment documentation describes an existing SQLite-backed Durable Object event-log adapter behind the same `EventRepository.append()` / `read()` boundary used by its domain/application services.

The documented implementation uses one event-log object. **One Durable Object per problem is a possible future design, not an existing capability verified for this pilot.**

For this pilot, the initial proposal is to assess and reuse the existing persistence adapter before introducing additional actor types. A future problem object could coordinate contribution submissions, relation proposals, review outcomes and reads of changes since a prior event. Additional lifecycle actors, alarms, retries or budgets require a concrete use case.

Durable Objects supply addressable state and storage. They do not automatically provide append-only semantics, provenance, deduplication, authorization, human review or exactly-once external effects: those require application code and tests. Asynchronous operations can interleave; “single-threaded” is not a substitute for transactional append and concurrency analysis.

The documentation is evidence of an upstream implementation, not evidence that a live deployment is currently healthy. Inspect current source, configuration and tests before copying. Preserve a local runtime path; Cloudflare deployment is not required for the first integrated journey.

## Source and history contract to agree

Keep stable logical identities distinct from observed versions:

- Source identity: repository plus source kind and original object/comment ID.
- Observed version: file commit/blob or captured mutable content with retrieval time and content digest.
- Attribution: original author when known, separate from importer, AI preparer, submitter and reviewer.
- Coverage: pagination, comments/reviews fetched, unavailable content and omissions.
- Passage reference: original permalink plus snapshot-local anchor.
- Relation: endpoints, kind, origin (source-declared, deterministic, editorial or model-proposed), proposer, review status and supporting passage.
- Event: stable event ID, actor, time, object ID, event type, payload, and causation/correlation where applicable.

Do not treat a source URL or digest as preservation of historical content. Retain deliberate captured versions if historical inspection is required. Define edit, deletion, withdrawal and stale-source behavior explicitly.

Source evolution and participant interpretation are separate histories. A source edit must not silently rewrite a prior interpretation or remove a reviewed event. Current state and timeline should be projections of recorded events, with superseded material visibly distinguishable.

## First integrated slice

1. Capture a bounded public GitHub corpus for the Mac/frame question, including relevant thread/review context and a misleading near-match.
2. Adapt Postack retrieval to the corpus, preserving source and passage IDs.
3. Build an inspector showing original voices, hardware/conditions, failed attempts, unknowns and the match explanation.
4. Add local contribution draft/preview, persistence, removal and rediscovery. Distinguish local-only drafts from shared events.
5. Connect the contribution/history model. If a shared room is introduced, inspect authentication and review policy first; upstream demo identities are not production authentication.
6. Add Knowledge Lab as an optional consumer of the same bounded export. Each visible graph edge must lead to its supporting passage and disclose its origin.

Do not force every draft into a remote shared room. Resolve how local drafts become shared contributions before implementing writes.

## Review questions for Claude

Act as an architecture sparring partner. Challenge this proposal rather than implementing it immediately.

1. Is the separation between original source snapshots, contribution memory and derived indexes sound? Where could competing sources of truth emerge?
2. What can actually be reused from Postack and br-ai-nstorm without importing their entire products? Inspect code, dependencies, licences and revisions.
3. Does the existing global event-log Durable Object fit the weekend slice? What concrete requirement would justify per-problem partitioning?
4. Are append transactions, deduplication, retries and event ordering correct under concurrent clients? Which guarantees exist, and which need tests?
5. How should GitHub comments/reviews map into source records without replacing individual authorship with repository attribution? The current Markdown adoption importer is not a GitHub-thread adapter.
6. Can a short observation remain in its author's voice while relations/classifications remain separately reviewable? Does the upstream “another participant reviews” rule fit a single-person/local pilot?
7. How are source changes, stale captures, deletion and unavailable evidence represented in current and historical views?
8. Can both the search index and LightRAG graph be regenerated from recorded inputs without losing contributions, decisions or attribution?
9. What is the smallest integrated implementation, and what should be cut? Avoid making graph availability, live federation or deployment prerequisites.
10. What useful mechanism does a Durable Object add now beyond storage? If no live lifecycle needs it yet, say so.

Return: a verdict, evidence-backed corrections, a revised ownership/data-flow proposal, key failure cases, and one bounded next implementation slice. Separate inspected facts, inferences, proposals and questions requiring Achim's decision. Do not mark the architecture accepted on the basis of the review.

## Evidence and references

Project state read before this write:

- Project Knowledge: https://blackmath88.github.io/baselhack26-open-presence/data/knowledge.json
- Activity snapshot: https://blackmath88.github.io/baselhack26-open-presence/data/snapshot.json
- Both referenced `e5844b51c87c51ed91319d771d73d73c9d5d1a1f`. Knowledge was complete (12/12 selected sources), diagnostics empty; activity reported no degraded sources. These artifacts describe their captured revision, not subsequent commits.

Upstream references inspected during the discussion (mutable main links; pin exact revisions before reuse):

- Postack retrieval implementation: https://github.com/blackmath88/postack-underflow/blob/main/src/lib/retrieval.ts
- Postack record model: https://github.com/blackmath88/postack-underflow/blob/main/src/lib/records.ts
- br-ai-nstorm model and capabilities: https://github.com/blackmath88/br-ai-nstorm/blob/main/README.md
- br-ai-nstorm adoption boundary: https://github.com/blackmath88/br-ai-nstorm/blob/main/docs/ADOPTION.md
- Durable Object adapter documentation: https://github.com/blackmath88/br-ai-nstorm/blob/main/docs/architecture/CLOUDFLARE_DEMO.md
- Knowledge Lab: https://github.com/blackmath88/baselhack26-knowledge-lab
- Observstory: https://github.com/blackmath88/observstory
- Cloudflare Durable Objects: https://developers.cloudflare.com/durable-objects/concepts/what-are-durable-objects/

## Repository handoff

New finding: upstream br-ai-nstorm documents Durable Object event-log persistence; Postack has deterministic retrieval code.
Proposal: combine source snapshots, Postack retrieval and br-ai-nstorm contribution/history semantics, with optional Knowledge Lab retrieval and Observstory evidence.
Explicitly agreed: record this structure as a proposal and open an architecture-sparring issue.
Still open: reuse/licence feasibility, runtime readiness, persistence partitioning, draft-to-shared transition and review policy.
Affected document: this proposal. Current concept, plan and declared decisions remain unchanged.
No private transcript or unrelated personal context is included.
