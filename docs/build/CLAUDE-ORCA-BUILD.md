# Build plan — br-ai-nstorm with real Photo Frame Commons data

31 October 2026 · Execution brief for Claude coordinating parallel agents through Orca

## Authority and outcome

Achim requested building the agreed discovery / shared-thinking / contribution loop using the existing Wes Bos photo-frame corpus, treating br-ai-nstorm as the furthest-developed starting point and postponing UI design exploration. He requested a repository build plan executable by Claude with parallel Orca agents.

This document prepares that work; it does not claim workers are running. Preserve upstream repositories and other active branches. Build on an isolated Open Presence implementation branch and finish with a reviewable draft PR. Do not merge or deploy under this brief.

**Finish line:** a runnable local application using br-ai-nstorm's existing State / Map / Timeline / Curation foundations, connected to real captured photo-frame records. A person can find an experience, inspect evidence and differences, draft an observation privately, explicitly submit it to a local shared room, and see it from a second browser session and after server restart.

A room submission is shared with that local service, not a GitHub post or federated publication. Imported reports must never appear as live participation in this room.

## Orientation and evidence

Read first:
- [Current concept](../../HUMAN-SIGNAL-CONCEPT.md)
- [Agreed value and proposed UX](../product/VALUE-AND-UX.md)
- [Earlier architecture proposal](../architecture/PROPOSED-SHARED-MEMORY.md)
- [Project plan](../../HACKATHON-PLAN.md)
- Latest knowledge.json and snapshot.json from the project's Pages data directory.

Before this plan, both exports resolved to `e8678ce8f1d3145d3372b39a209cedc683821b64`; knowledge was complete with no diagnostics and activity had no degraded sources. Open Presence main was documentation/modules only, with no pilot application. Refresh before execution; inspect AGENTS.md, dirty trees, branches and active workers. Never reset unrelated work.

Pinned reuse inputs:
- br-ai-nstorm: `a96c2dbb6fb6caf9cbf648107827fec88e3c0961`.
- Postack corpus: `4231630efb42726f856827c5756278af1584b988`, branch `pilot/commons-a-corpus`.
- Postack index: `9fffa36e04edc7fd76aaa82f36c5f1ef12cea5bf`, branch `pilot/commons-b-index`.
- Underlying Wes Bos file revision: `0bff55ef3fb2a3bfdab05bc8e3bd0c9d69f63189`; mutable thread capture dated 29 October.

Inspect these commits before reuse. Record licences/notices and actual file origins in THIRD_PARTY.md; do not invent a blanket licence over other authors' text. If reuse rights for a particular component cannot be established, isolate that item and continue unaffected work; report it explicitly.

Postack already contains the corpus manifest, snapshot script, 18 agent-written unreviewed problem records, corrections, record model and retrieval code. Do not recapture the corpus or rewrite retrieval from scratch. Read COMMONS-CORPUS.md and COMMONS-INDEX.md at those commits.

## Implementation choice and boundaries

Use a self-contained `apps/commons/` Node/TypeScript application inside Open Presence. Reuse br-ai-nstorm's existing React frontend and domain/application/persistence code as a pinned, attributed starting point, pruning only unrelated fixtures or runtime adapters. Keep its architecture boundaries intact. The coordinator owns bootstrap and dependencies.

Initial runtime: local Node backend and existing local persistence, deterministic curation, no paid model calls. Start with existing UI and minimal source/search additions. Do not rebuild the experience as an essay, a new dashboard or a static-only contribution mockup.

Retain the HTTP/service boundary, server-resolved participant identity, qualified provenance, review queue and event-derived State / Map / Timeline. Local development participants must be clearly identified as demo sessions; do not expose this auth publicly.

Defer Cloudflare deployment, Durable Objects integration, production auth, external account writes and ATProto. These are future delivery choices, not prerequisites. Keep Knowledge Lab as an optional consumer/export target, with no runtime changes or model runs in this slice.

## Freeze the contracts before parallel work

Coordinator creates the runnable upstream-based skeleton, then commits the shared contracts and fixtures. Workers consume the exact same bootstrap commit.

Minimum contract:
- SourceRef: snapshot ID, original object/comment ID, permalink, original author or explicit unknown, source time, retrieval time, digest, passage locator and availability/coverage.
- ImportedProblem: original Postack ID, original record interpretation/provenance, original evidence references, reported conditions/outcomes and relation origin.
- Room mapping: deterministic imported IDs and explicit mapping to problem spaces/contribution IDs; preserve source evidence separately from room events.
- Draft: selected text and optional circumstances stored only in the current browser, separately from canonical room state.
- Submitted contribution: server-resolved submitting participant, separate authoredBy/preparedBy, selected source/problem references, review state and command ID.
- Read interface: deterministic search hits with match explanations, source lookup and room projection/history.
- Graph edges expose origin and evidence. Machine proposals must not be rendered as accepted participant relationships.

Use original source timestamps on source records. Record import time as import time; do not backdate room events to pretend participants joined this room in the past. Keep Postack-generated interpretation attributed to the agent, not to quoted source authors.

Do not force the Markdown adoption importer to impersonate a GitHub-thread adapter. Build a dedicated idempotent corpus adapter using the real source identities.

## Parallel work packets

At most **two workers active at once**, each in a separate worktree. Coordinator retains integration, shared contracts, app shell, package manifests, lockfiles, configuration and cross-cutting documentation.

| Packet | Dependencies | Writable paths under apps/commons/ | Result |
| --- | --- | --- | --- |
| A — corpus + search | Bootstrap contract | corpus/, scripts/corpus/, src/commons/source/, src/commons/retrieval/, test/corpus/ | Pinned corpus, evidence resolution and reproducible record-only search |
| B — shared memory | Bootstrap contract | server/commons/, server/application/, server/persistence/, server/test/commons/ | Idempotent import/commands, source-to-room bridge, durable contribution and review behavior |
| C — experience wiring | A + B integrated contract | src/components/commons/, src/commons/client/, test/ui/ | Find → inspect → compare → draft → submit → rediscover, using existing room views |
| D — independent verification | Exact integrated commit | Separate scratch review artifacts only; no product writes | Scope/security/provenance review and acceptance evidence |

Phase 1: A and B run in parallel. Coordinator prepares integration harness and demo instructions without touching worker paths.
Phase 2: coordinator integrates A/B and resolves shared boundaries; C then wires the user journey. Coordinator may implement C directly if dispatch overhead adds no value.
Phase 3: verify combined app and review exact commit with D. No worker recursively delegates. Ownership changes require observed settlement, not merely a missing status.

### A — corpus and retrieval details

Port manifest byte-identically as snapshot 001 and preserve its original format and lineage. Put supplemental mapping outside that manifest. Port records/corrections and minimal retrieval modules with origin commits.

Full source cache is not committed. Build a **record-only index** from committed inputs for the offline app; the upstream combined raw-thread index requires the cache and cannot satisfy cache-free reproduction. Expose unavailable full conversation honestly and link to the original.

Retain individual evidence authors and short original excerpts, distinguish quote from writer's interpretation, mark all unreviewed agent records accordingly. No image attachments or source text are fabricated. No generic 25-word rule is treated as legal permission.

Cover Mac USB records and a Windows/WSL near-match. Prefer explanatory field matches over invented match percentages. Record evidence gaps, including excluded inline reviews. Changed digest means changed captured text; absence from a later capture alone does not prove deletion.

### B — shared memory details

Reuse event/projection/policy code; add the bounded photo-frame adapter rather than a second memory engine. Reimport unchanged input must not duplicate displayed contributions or raw import events. Demonstrate source records remain immutable through room edits.

Review suspected check-then-act and retry defects identified in the architecture sparring. They are code-reading hypotheses, not reproduced bugs. For this local backend, ensure command validation and append use one serialized critical section or optimistic expected-version append. Apply that guarantee to contribution, review and import commands that depend on current state. A raw append mutex alone is insufficient.

Use a persisted command/idempotency key so retries do not create a fresh contribution. Same key with different input must be rejected. Duplicate identical review retry returns the prior outcome; incompatible concurrent accept/reject yields one success and one explicit conflict, never silent last-write-wins acceptance.

Keep existing independent-review policy for participant AI proposals. Demo sessions can exercise it; imported machine-proposed edges remain visibly unreviewed. A source correction may be displayed as a source assertion without manufacturing a room ConflictAccepted event.

### C — experience details

Reuse existing room navigation and views. Add only enough UI to:
1. Search “My Mac cannot see my frame.”
2. Open a relevant record, supporting evidence, original author/permalink, circumstances, limits and interpretation status.
3. Explain a near-match and inspect a real correction/different outcome.
4. Draft in the browser, reload, remove, and preview exact content/destination.
5. Explicitly submit selected content to the local room; a second session sees the contribution and source connection.
6. Follow its provenance and event history; independently review a proposed connection.
7. Restart backend and rediscover the accepted/pending state without data loss.

Never substitute a fallback seed room when backend fails. A saved local draft remains separate from a failed shared submission. Show persistence and network failures honestly. No private chat ingestion.

## Orca execution method

Apply orchestrate-work and route-orca-work when available. Load the actual installed Orca orchestration guide before dispatch. Resolve the documented executable from the environment and run its `skills get orchestration`; discover supported flags instead of inventing worker/DAG commands.

Inspect actual routes, active/possibly-live workers and authority. Consider suitable configured local/Mistral routes before frontier workers; use Claude/Codex where capability warrants it. Do not add API spend or provision credentials. Record requested and observed model/harness/host separately; unknown stays unknown.

Use default **30-minute bounded execution batches**, not an invented event deadline or a promise the whole build finishes in 30 minutes. Supervisor must enforce worker timeout and expose settlement. At expiry checkpoint, stop and observe settlement. Resume later as a new explicit batch; do not silently reset timers. One focused repair per packet within its original deadline. Max two active/possibly-live workers across retries.

If Orca cannot dispatch safely, report the exact blocker and continue foreground coordinator work on unreserved paths. Native subagents are not Orca workers. Never claim hard enforcement from prompt wording alone.

Each packet receives exact bootstrap/base commit, task, allowlisted paths including tests, acceptance commands, deadline, no-recursive-delegation rule and return format. Return commit, changed paths, checks, failures, origin attribution, route readback and settlement evidence.

## Integration gates

G0: upstream baseline runs locally; pinned origins recorded; contracts frozen.
G1: record-only index reproduces byte-for-byte without cache/network; import is idempotent.
G2: real record → original evidence/author/limitations; Mac query and explicit near-match.
G3: selected contribution reaches shared local memory and second session; reload/restart persists it.
G4: repeated submission does not duplicate; concurrent contradictory reviews cannot both succeed; source records remain unchanged.
G5: keyboard and phone/desktop checks; source unavailable and backend unavailable states; no injected source HTML executes.
G6: independent exact-commit review where a qualified route exists; otherwise label coordinator verification self-review and leave independent review pending.

Bootstrap should expose `typecheck`, `test`, `build`, `index:check` and `dev` scripts, adapting existing upstream scripts instead of claiming commands already exist. Run meaningful focused tests plus combined gates. No model calls required for acceptance.

## Delivery

Coordinator writes DEMO.md with exact install/start/test commands, local data location, two-session demonstration and real limitations. Record observed checks and exact tested commit in evidence/. Exclude runtime data, credentials and caches from Git.

Finish on `feat/commons-brainstorm-integration` or an equivalent isolated branch with a draft PR. Include implemented/tested/unverified states, unresolved workers, failures and next actions. Preserve docs/modules and active Observstory writeback branches.

This plan changes the earlier static-only recommendation: build a functioning **local shared room** from the br-ai-nstorm foundation. It does not approve public deployment or universal platform scope.

## Repository handoff

Agreed direction: build with existing Wes Bos data; start from br-ai-nstorm; defer UI design; prepare parallel Orca execution.
Implementation choices proposed here: isolated apps/commons/ layout, local shared room, packet boundaries and staged gates.
Open: code reuse/licence details after inspection, actual Orca readiness and whether Knowledge Lab later consumes full text or selected passages.
Sources: pinned upstream commits above; current concept/value brief; architecture sparring findings previously supplied by Achim.
