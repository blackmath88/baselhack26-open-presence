# Claude build plan — many entrances, one Commons

31 October 2026 · Authorized planning handoff; execution starts when this is handed to Claude

Read [the specification](../architecture/MULTI-ENTRY-COMMONS.md) and [the launch prompt](CLAUDE-MULTI-ENTRY-PROMPT.md).

## Outcome

A person enters through repository navigation, an agent enters through MCP, another person contributes through CLI or a community link. They encounter the same problems and attributable conversation. An ATProto round-trip demonstrates that author-owned contributions can enter and leave this app without losing identity, references or context.

Achim is away and wants building, not a succession of testing requests. Continue autonomously through reversible implementation choices; report progress in the repo. Do not wait for a visual-design decision. Required engineering verification still runs, but avoid repeated broad review cycles without new evidence. No deployment or public-account posting is authorized by this planning handoff.

## Baseline and integration

1. Read live knowledge.json and snapshot.json; record cutoff, completeness, diagnostics and age. Read live PR #8 and #4 heads rather than treating old packets as current.
2. Inspect current AGENTS.md, BUILD-STATUS.md, DEMO.md and existing contracts. Start from the actual Commons implementation, inspected here at `e24838f`, not old main lacking apps/commons.
3. If #8 remains open, create `feat/commons-multi-entry` from its latest verified head and open a stacked draft PR targeting `feat/commons-brainstorm-integration`. If #8 is merged, branch from current main. Document dependency and retarget when it lands. Do not force-push or merge someone else's ongoing branch silently.
4. Capture exact input commits and existing checks. Resolve final #8 findings as a bounded prerequisite if still present; do not restart the entire historical review sequence.
5. New spec is the continuation scope. Preserve original corpus IDs, attribution, local-only auth boundary and draft safety. Do not modify Wes's repo, Postack, Observstory or Knowledge Lab in this slice.

## Milestones, in priority order

| Gate | Deliverable | Visible proof |
| --- | --- | --- |
| M0 | Frozen compatible records, operation schemas, migration and adapter map | Same IDs and actor semantics across every entrance |
| M1 | Commons service parity through HTTP, CLI and MCP | MCP finds a problem; CLI contributes; UI sees it once |
| M2 | Repo navigator, deep links, thread/reply view and contribution search | Start from repo OR search OR direct link, keep the same context |
| M3 | AT Lexicons, persistent outbox, publisher, reader and reconciliation | Actual isolated PDS write/read survives timeout/retry without duplication |
| M4 | Two-author participation and rebuildable discovery | A publishes, B replies, fresh index reconstructs both and source links |
| M5 | Integrated delivery and concise evidence | Runnable demo, precise supported/blocked matrix, draft PR |

Finish M1 and a thin M2 early; then prioritize M3/M4 over visual polish. Don't spend the entire session building a new layout. If a provider environment blocks M3, complete all independent code and document the exact command/configuration needed to activate it.

## Work packets and ownership

Use existing Orca workflow if available. At most two workers concurrently, isolated worktrees; coordinator owns integration, shared contracts, dependency/lockfile changes, migrations, auth wiring and final demo. If dispatch is unavailable, implement sequentially without waiting for fleet repair. This plan authorizes parallel implementation when Claude executes it; it does not claim any worker has been dispatched.

### Coordinator — M0 and integration

- Inventory operations currently split between CommonsReader, CommonsService and upstream tools. Extend existing services; avoid duplicate CRUD stacks.
- Freeze runtime-validated schemas and error codes, stable references and capability matrix. Define migration of old contributions lacking new fields.
- Keep browser drafts browser-local; add explicit shared/public states.
- Add a durable publication outbox and idempotency contract; one authoritative transaction boundary.
- Define path ownership before dispatch. Worker suggestions to shared contracts return to coordinator.

### Packet A — common operations and agent entrances

Paths: `server/commons/` query adapters, new `scripts/commons/` CLI, Commons-specific MCP registration and focused adapter tests. Coordinator owns container/service wiring and shared files in `server/mcp/` if another worker needs them.

- Search/get/context/browse/thread/prepare/submit operations; include new eligible contributions in discovery.
- CLI commands: `commons search`, `browse`, `inspect`, `context`, `draft`, `submit`; JSON output and useful exit status.
- Add corresponding Commons MCP tools through the existing single registration factory. One operation result schema, text fallback plus structuredContent.
- Preserve actor resolution, command ID collision rejection and review transaction safety across transports.
- Context returns sources, revisions, coverage, limitations and attributed interpretations, not an invented authoritative answer.

### Packet B — ATProto adapter and ingestion

Paths: `lexicons/`, `server/commons/atproto/`, `test/atproto/`, local PDS fixture/setup scripts. Coordinator owns package dependencies and outbox storage integration.

- Implement schema validation and official SDK adapter. Records include problem/source references, assistance disclosure and reply/correction links.
- Supply an isolated local PDS setup when supported; disposable development accounts only. No production accounts or public writes.
- Build publisher/reconciliation and bounded DID/URI ingestion with pagination checkpoints, revision updates and deletion/unavailability distinction.
- Prove two accounts and fresh-index discovery, not only a mocked createRecord response.
- Keep transport receipt state independent of local contribution state; don't mark queued items published.
- Document NSID ownership and OAuth activation prerequisites without blocking local development.

### Coordinator / next packet — M2 experience wiring

Paths: existing Commons React components, router/client state, contribution/thread projections.

- Repo view for the bounded source corpus: files/threads → related problems → original source. Do not imply it is a full live GitHub browser.
- Search and repo view are equal entrances. Direct URLs to problems and contributions work after reload; browser back restores location.
- Show voices, conditions, failed attempts, corrections and related problems. Keep current Map/Timeline available without forcing a tab sequence.
- Add reply/correction composer and precise local/public destination preview.
- Publication state is visible: local, queued, published, failed/retryable, stale/unavailable. Auth and missing-provider UI are actionable.
- Use existing visual language initially. Translate technical ranking into readable match conditions; keep detailed evidence expandable.

## Required verification — bounded and meaningful

Run existing app gates once after integration, then rerun affected checks only when changes justify it. Add application CI; the Observatory workflow alone does not test the app.

1. Migration preserves old room state/IDs. Existing submit/review concurrency invariants still pass.
2. Cross-interface round-trip: repo UI → MCP inspection → CLI submit → UI reply → search through MCP. A unique phrase in the new contribution must be found with author and source refs.
3. Same actor+command retry yields one contribution; different payload with same key conflicts. Cannot forge publisher/participant in input.
4. Publication timeout after remote success recovers same URI, no duplicate. Payload/account changes require new preview. Restart retains pending outbox work.
5. Remote reingestion and self-echo deduplicate; edited record advances version; incomplete pagination/unreachable PDS does not erase records.
6. Two development identities publish/reply, then a fresh read model reconstructs their thread. Verify source identities differ from contribution authors.
7. Hide/block policy affects UI/search/context/MCP consistently. Invalid record and unresolved reference are visible bounded states, not trusted content.
8. One narrow browser check: repo/deep-link/search navigation, retained draft on failure, phone-width reading and keyboard access. No broad screenshot campaign.

If PDS cannot run, keep offline contract tests and report M3/M4 blocked by environment. Never label fixtures “federation verified”. If live credentials are unavailable, continue the local implementation and give one concise activation checklist at the end.

## Delivery and reporting

Update `BUILD-STATUS.md` after each milestone with commit, implemented behaviour, evidence and next action. Keep local development data/secrets out of Git. Update `DEMO.md` with exact commands and three entry scenarios. Add `docs/architecture/MULTI-ENTRY-IMPLEMENTATION.md` explaining actual choices and deviations from the spec.

Final report: working paths; exact heads; checks run; blocked paths; remaining activation needs. Maintain a matrix for UI/CLI/MCP/ATProto: implemented, verified, unavailable. Leave a concrete draft PR; do not deploy or publish to a real person's account.

Suggested delivery sequence: M0 → A/B in parallel → integrate A and thin M2 → integrate B and M4 → M5. Keep a working checkpoint at each gate. Architecture refinements are allowed when they make this loop smaller, provided the multi-entry and attribution guarantees remain.

## Decisions carried forward and still open

Agreed direction: multiple entrances, shared community context, ATProto part of the architecture, build forward with limited user involvement.

Proposed defaults: retain existing local app/services; develop ATProto against an isolated PDS; bounded author discovery; prototype namespace until ownership verified; no paid inference; optional graph visuals.

Activation questions, not reasons to stop building: production namespace/domain, real account/provider setup, public hosting and moderation ownership. Do not invent user answers.
