# NUC adapter consistency checkpoint — 31 October 2026

## Base, ownership and scope

Fetched `docs/multi-entry-commons-plan` and read `docs/build/CODEX-NUC-TAKEOVER.md`. The initial GitHub PR #11 snapshot named `0175fa9a4be592b75a3d6c4f1bff1532d9437200`, but the Git fetch discovered the newer head `dacc9741877040836d103992e8861c36f29ae167`: PR #13's publication destination/retry repairs were already merged into PR #11. Started from **dacc974**, preserving those repairs and the original M0–M5 build. Continuation head branch: `blackmath88/commons-adapter-consistency`, targeting `feat/commons-multi-entry` (PR #11), now targeting main after the separate integration session merged the earlier dependencies. The implementation head is the commit carrying this evidence; the exact pushed SHA is recorded in the delivery message/PR.

Before editing: inspected Claude's checkout and registered worktrees, process working directories, Orca workspace liveness, and the tail of the multi-entry Claude transcript. Original checkout `/home/nuc/baselhack26-clones/blackmath88__baselhack26-open-presence` was clean at `0175fa9`. The transcript ended with the usage-limit stop and PR #11 delivery. Orca reported zero attached and zero unverifiable terminals in that checkout and packet A/B/D/E/F worktrees. Claude processes remained in the parent clones directory; no process was killed or messaged. Its existing Vite preview (PID 4095405, :5173) was preserved. A separate Orca-managed worktree was created for this continuation; no workers were launched. Work ran directly in foreground Codex on the NUC. No applicable local AGENTS.md was found in the checkout/ancestor paths inspected.

## Focused inspection and repair

Read BUILD-STATUS, DEMO, implementation notes, the newer takeover evidence and publication/ingestion, projection, HTTP/MCP/CLI paths. PR #13 already repaired preview-account drift and queued-publication revalidation. Its documented legacy moderation blocker reproduced in a new regression before changes: a hidden contribution's distinctive body still appeared in `getRoom` despite modern `getContribution` redacting it.

- `server/commons/read-view.ts` (preserved from concurrent PR #14): filter withheld contribution events and the transitive set of dependent proposals/edges/evaluations before ordinary legacy projections run. Wire problem reads, curation listing and orchestration context through a read-only repository view; apply the same filter inside Commons room reads. Keep raw events, command validation and optimistic room version intact. Hidden/blocked records restore after unhide/unblock. Deleted/invalid remote records and derived proposal reasons remain withheld.
- Check saved command outcomes against current withheld object IDs before replaying body-bearing outcomes. Moderation receipts stay replayable; a withheld submission cannot return its pre-moderation saved body.
- `operation-schemas.ts`: share operation shapes between the service boundary and all 16 existing MCP tools. Keep operation/tool names and opaque IDs unchanged. Enforce numeric, enum, field type and length bounds at the service; preserve contribution previews' existing `ok:false` validation shape and domain errors for writes.
- HTTP now rejects wrong JSON types rather than coercing IDs into strings or silently dropping malformed fields. It rejects invalid search includes, repository types/booleans and numeric bounds. CLI rejects malformed/non-finite numeric flags with exit 2 and invalid draft files as usage errors. Session actor remains authoritative; extra identity fields cannot become authors and are stripped before new receipt hashes.

Changed paths are confined to `apps/commons` service/adapters/tests, BUILD-STATUS.md, DEMO.md, implementation notes and this evidence. No other branches/repositories were changed. No merge, deployment or public-account write. No paid API calls. Smoke environments explicitly removed API credentials and ATProto account/follow configuration.

## Concurrent base update

While this draft was created, PR #14 landed on PR #11 at `86ec1a95abff46081ea63907197277543bae3c40`, independently repairing the same legacy read blocker. The separate integration session also reports merging #8 and retargeting #11 to main. Fetched that checkpoint and integrated it locally into this continuation, preserving every upstream file including its tests/evidence and repository-hygiene proposal. Resolved the overlap by using **PR #14's complete-log read-view as the single ordinary read boundary**, rather than retaining parallel readers. `read-boundary.ts` now only guards saved receipts using the same filtered object set. Added `fromProposalId` to the dependency keys. No remote PR was merged by this session, and no branch was force-pushed.

## Validation

Environment: Node 26.8.1. Ran npm ci in both apps/commons and tools/local-pds, isolated from Claude's existing dependencies and data.

- `npm run typecheck`: pass (app/server/worker).
- `npm test`: **17 files / 188 tests pass** before concurrent-base integration; both isolated-PDS suites executed with tooling installed, no SKIPPED warning. Includes PR #13's publication regressions and the two-author fresh-index round trip.
- Four new focused regression cases: hidden/blocked data through direct reads, legacy HTTP/MCP, context and replay; malformed types/bounds/enums through service/HTTP/MCP and actual CLI subprocess exit 2; contribution field limits, forged authors and cross-operation command collisions; deleted/invalid remote bodies and dependent proposal reasons, preserving raw history.
- `npm run index:check`: byte-identical record-only index.
- `npx vite build`: pass; existing >500 kB chunk warning remains.
- `bash scripts/smoke/multi-entry.sh`: pass with actual local server, submit/replay/conflict, second-author reply, search/context, no-account publication, moderation, restart and unreachable-server exits.
- `bash scripts/smoke/e2e.sh`: pass on rerun: submit 201, replay 200, changed content 409, second session sees one contribution, restart persists it, unchanged import adds zero events, concurrent review returns 200/409. The first attempt exhausted its short startup wait while combined gates ran concurrently, then failed before auth. Its server log subsequently showed startup succeeded; serial rerun completed.
- After the final validation-only schema adjustment (retain opaque input spelling rather than trim before receipt hashing), reran typecheck and focused Commons suites.
- `git diff --check`: pass. Final original checkout remains clean at `0175fa9`; :5173 preview remains running; smoke servers on :8798/:8799 stopped.

No new browser walkthrough. These are foreground Codex checks, not an independent reviewer sign-off.

Combined checks after integration are recorded below.

## Handoff / next action

Review the stacked draft's read-boundary behavior and schema changes. The bounded repair/adapter slice stops here. Public OAuth, owned NSID, public hosting, report/audit UX and cross-room map work remain separate. Known inspection targets from the prior handoff (concurrent sync/resolve, changes to remote problem identity, exact context-budget accounting) were not expanded into another repair loop. Local moderation does not retract already published remote records or promise cancellation of in-flight network writes.

## Captured application-suite output

```text
> br-ai-nstorm@0.4.0 test
> vitest run


 RUN  v4.1.12 /home/nuc/orca/workspaces/blackmath88__baselhack26-open-presence/commons-adapter-consistency/apps/commons


 Test Files  17 passed (17)
      Tests  188 passed (188)
   Start at  19:28:52
   Duration  54.97s (transform 5.91s, setup 0ms, import 78.53s, tests 64.31s, environment 21ms)
```

## Final combined gates after PR #14 integration

- `npm run typecheck`: pass.
- `npm test`: **18 files / 192 tests pass**, 39.01 s; real isolated-PDS suites executed. One Node `TimeoutNegativeWarning` appeared, without test failures.
- `npm run index:check`: record-only index reproduced byte-for-byte.
- `npx vite build`: pass, unchanged large-chunk warning.
- Both `scripts/smoke/multi-entry.sh` and `scripts/smoke/e2e.sh`: pass on the combined tree; restart persistence, receipt replay/conflict, concurrent review and no-account behavior retained.
- `git diff --check`: pass. Separate PR #14 tests, evidence and proposal retained. No smoke server left running.

Draft delivery: https://github.com/blackmath88/baselhack26-open-presence/pull/15 . Starting implementation commit `6923639c1b3b17c22834a39c915615dd776e02f9`; final integration head is the merge commit containing this combined-gates section, with base `86ec1a95abff46081ea63907197277543bae3c40`. Exact final SHA is recorded in PR #15 and the delivery message. No remote PR merge, force-push, public activation or deployment was performed.
