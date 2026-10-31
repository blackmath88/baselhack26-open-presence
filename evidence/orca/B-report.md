# Packet B — shared memory

Implementation commit: `8cc10fd372b861cbf297cb584207547f8b509019` (parent of the report-only delivery commit).
Bootstrap: `94fec5d12326aaf9e8d237049eb058a46ef2fd97`.
Completed 31 October 2026, before the 14:46 CET deadline.

## Delivered

- One transactional JSON event repository, retaining existing event/projection/policy code. Validation, staged service appends, source-reference metadata and durable command receipts commit together by atomic document replacement; failed work rolls back. Ordinary appends share the same file queue.
- The file queue is shared across repository instances in one Node process and reloads the document to avoid stale-instance overwrites. This local backend does not implement multi-process or distributed locking; run one server process per data file.
- Idempotent Postack import maps frozen IDs, stores deep-cloned source records separately in metadata, and creates imported contributions containing references rather than quoted source text. Events use actual import time. Identical reimports add zero events. Changed records fail explicitly rather than silently overwriting source revisions.
- Imported relations are pending proposals attributed to `postack-agent`, with explicit origin, original relation vocabulary and evidence IDs in room readback. Source assertions also remain pending, with `source-assertion` origin; no correction fabricates a ConflictAccepted event.
- Contribution/review commands reuse existing application services. Receipt hashes include command type, complete input and resolved actor identity. Identical retries return their stored outcome; changed inputs or participants conflict. Contradictory review commands serialize and the loser receives a conflict. Existing independent review policy remains effective.
- Room readback includes canonical projection, event history, event-count version, source record, edge origin/evidence and submission source references/circumstances.

## Coordinator integration

`createCommonsService({ repository, clock? })` from `server/commons/service.ts` accepts the transactional repository returned by `createJsonRepository({file})` or `createMemoryRepository()`.

Methods:

- `importProblems(actor: ActorContext, problems: ImportedProblem[])`
- `submitContribution(actor: ActorContext, command: SubmitContributionCommand)` — `problemId` is the original Postack ID.
- `review(actor: ActorContext, command: ReviewCommand)` — discovers its room from the unique proposal ID; optional expectedVersion is the current room event count.
- `getRoom(actor: ActorContext, id: string)` — accepts mapped room ID or original Postack ID.

`commonsRoutes({commons: service, auth: TokenVerifier})` from `server/commons/routes.ts` returns `(req: IncomingMessage, res: ServerResponse) => Promise<boolean>`. Call before the existing API fallback; stop routing when true. It handles OPTIONS and authenticated GET `/api/commons/rooms/:id`, POST `/api/commons/contributions`, POST `/api/commons/reviews`, POST `/api/commons/import` with body `{problems: ImportedProblem[]}`. Uses the existing bearer-token resolution boundary and domain-error HTTP vocabulary. JSON body limit is 16 MiB. No changes made to server/http, container.ts, domain, frontend or frozen contracts.

Coordinator still needs to instantiate this service, wire the subrouter, and supply Packet A records. The adapter imports frozen types only, with no compile-time dependency on Packet A retrieval.

## Changed paths and origins

| Changed path (repo relative) | Origin |
| --- | --- |
| apps/commons/server/persistence/json-repository.ts | Adapted existing bootstrap port of br-ai-nstorm `a96c2dbb6fb6caf9cbf648107827fec88e3c0961:server/persistence/json-repository.ts`; transactional implementation authored in this packet. |
| apps/commons/server/persistence/repository.ts | Extended existing bootstrap port of br-ai-nstorm `a96c2dbb6fb6caf9cbf648107827fec88e3c0961:server/persistence/repository.ts`. |
| apps/commons/server/commons/import.ts | New adapter authored in this packet; imports contracts and reuses existing event constructor. |
| apps/commons/server/commons/service.ts | New adapter authored in this packet; invokes existing contribution-service, curation-service and domain projection/policy. |
| apps/commons/server/commons/routes.ts | New Node HTTP subrouter authored in this packet following br-ai-nstorm `a96c2dbb6fb6caf9cbf648107827fec88e3c0961:server/http/api.ts` style and existing auth boundary. |
| apps/commons/server/test/commons/commons.test.ts | New tests authored in this packet. |
| apps/commons/server/test/commons/real-records.json | Adapted two actual records (`emmc-not-exposed`, `gadget-error-71`) from Postack `9fffa36e04edc7fd76aaa82f36c5f1ef12cea5bf:corpus/commons/problems.json`, read through local git show. Source revision `0bff55ef3fb2a3bfdab05bc8e3bd0c9d69f63189`, record writer `agent:claude-opus-5-5`, unreviewed. |
| evidence/orca/B-report.md | New packet report. |

Fixture transformation maps reference IDs/permalinks and copies actual quoted excerpts/interpretations; it explicitly leaves unresolved source authors as `unknown`, timestamps/digests null, and labels coverage as record-only/cache-only. Those fields are test limitations, not invented source metadata. Outcomes derive from actual approach labels/scopes. The fixture is not a replacement for Packet A's full provenance resolution. A final evidence review corrected fixture permalink repository casing/name to the actual `wesbos/photo-frame-dashboard` from existing THIRD_PARTY.md, followed by both acceptance checks.

Existing THIRD_PARTY.md records no upstream licence file for the same-owner application and Postack inputs, and no blanket licence over quoted authors' words. No full source text/cache was ported; only the two-record fixture with its existing bounded evidence excerpts. Documentation/licensing edits remain coordinator-owned.

## Commands and results

All app commands ran from `apps/commons/`.

1. `npm ci` — PASS, 186 packages installed; npm reported 10 audit vulnerabilities (4 moderate, 6 high) and an esbuild install-script advisory. No dependency files changed and no audit fix attempted.
2. `npx vitest run server/test` — initial PASS: 9 files, 129 tests passed, 0 failed (120 existing + 9 new).
3. `npx tsc --noEmit -p tsconfig.server.json` — initial FAIL: 2 TS2571 errors in new HTTP tests, response JSON typed unknown; 0 product errors reported.
4. Single focused repair: explicit response types at the two test assertions.
5. `npx vitest run server/test` — PASS after repair: 9 files, 129 passed, 0 failed.
6. `npx tsc --noEmit -p tsconfig.server.json` — PASS after repair, exit 0.
7. Following fixture permalink evidence correction, `npx vitest run server/test` — final PASS: 9 files, 129 passed, 0 failed.
8. `npx tsc --noEmit -p tsconfig.server.json` — final PASS, exit 0.
9. `git diff --check` — PASS, no whitespace errors.

Origin reads: `git -C /home/nuc/projects/postack-underflow show 9fffa36e:corpus/commons/problems.json`, `git ... show 9fffa36e:docs/research/COMMONS-CORPUS.md`, `git ... show 9fffa36e:docs/research/COMMONS-INDEX.md` — PASS, local read-only. An initial attempt at `git ... show 9fffa36e:COMMONS-CORPUS.md` failed because the document is under docs/research; corrected by local ls-tree discovery. One orchestration status send initially used unsupported type `message`, was rejected, and was resent successfully using supported `status`. Neither affected repository checks.

Tests exercise immutable sources, stable deterministic mapping, source text separation, no backdating, zero-event reimport, concurrent same-key submissions, changed-key conflict, server attribution, independent AI review, Promise.allSettled contradictory reviews, stale versions, durable retry after restart, cross-instance serialization, failed-command rollback, and all four HTTP routes.

## Model / harness and constraints

Observed harness: Codex agent in an Orca-dispatched worker terminal, using functions.exec/exec_command tools. Developer context identifies the agent as Codex based on GPT-6; the exact provider runtime model identifier is not exposed to this worker and is therefore unknown, rather than inferred from requested routing. Host/worktree observed directly at `/home/nuc/orca/workspaces/blackmath88__baselhack26-open-presence/commons-packet-b`.

No delegation, paid API/model calls, network fetch beyond authorized npm ci, push, merge, branch switching, or writes outside allowlisted paths. HTTP tests use only in-process localhost servers. Remaining work is coordinator wiring and integrated UI verification; packet acceptance checks pass.
