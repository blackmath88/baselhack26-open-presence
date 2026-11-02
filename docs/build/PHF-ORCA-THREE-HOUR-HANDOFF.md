# Claude → Orca: three-hour Commons edge delivery

Status: user requested handoff; run NOT launched here. Start the three-hour clock when Claude begins execution, not at document creation.
Repository: blackmath88/baselhack26-open-presence
Branch: feat/commons-edge-runtime
Baseline main: 564f1d492a94deb23fd5d6407007df45f0a5772d

## Outcome

Finish and review the existing Commons Worker/D1 implementation so the public core can function with the NUC off. Primary acceptance: two independently issued contributors submit, reply and rediscover; identities, visibility, receipts and data survive runtime restart. Preserve the Cisco UI, current Commons domain service, source evidence, existing static story and selected lowercase e character.

This is implementation and verification work, not another architecture report. Continue from the checkpoint; do not rebuild the existing adapter from scratch without evidence that it is wrong.

## Authority and bounds

- Total elapsed budget: three hours, including setup, retries, review and integration. Stop earlier if complete.
- Maximum two concurrent workers. Use distinct worktrees and explicit owned paths. No recursive delegation.
- Claude coordinates through actual Orca runtime state. Load installed orchestrate-work and route-orca-work, then Orca's own orchestration guide. Discover supported commands rather than inventing CLI verbs.
- Consider suitable configured local/Mistral routes first, within existing spend authority; subscription-backed Codex/Claude for difficult concurrency/security work and review when justified. No new paid API spend, hosting subscription or automatic upgrade. Record requested/effective route separately.
- Verify enforced worker timeouts, credential isolation and settlement before unattended dispatch. A prompt saying “three hours” is not a supervisor.
- Commit and push coherent work; create/update a draft PR. Do not merge or deploy during this run. Prepare a deployment-ready result and exact operator commands. Do not modify Cloudflare accounts, expose credentials or alter unrelated running work.
- Do not start a fallback while the original worker may still be live. Preserve live ownership in the ledger.

## Orient first (0–15 minutes)

Read AGENTS.md, current project knowledge/snapshot, this handoff and docs/build/PHF-EDGE-RUNTIME.md. Fetch current main/PRs. Preserve any newer work; inspect differences rather than assuming this checkpoint is current main.

The hosted knowledge was successfully read during this checkpoint: resolved_commit 564f1d492a94deb23fd5d6407007df45f0a5772d, complete=true, selected/read sources 15/15, diagnostics empty. The checked-in context packet cp_7cdc6f026054f6d6650d202f is older (cutoff 93a5445150d0); treat it as historical orientation.

Create a compact run ledger with start/deadline, exact base SHA, packets, ownership, observed routes, attempts, results and unset deployment prerequisites. Check any existing Orca/Weavr governed state before dispatching overlapping work.

## What is implemented at the checkpoint

- Separate worker/edge/index.ts and wrangler.edge.jsonc; inherited Worker unchanged.
- D1 optimistic transaction adapter: revision CHECK guard aborts the whole SQL batch on conflict, replays pure callbacks, persists events/metadata/receipts atomically.
- Temporary whole-document representation capped at 1 MiB. It is a bounded parity implementation, not a scalable final schema.
- Current Commons service + existing HTTP routes; moderation-aware inherited reads. Legacy mutation routes are blocked.
- Anonymous read-only principal; random expiring, revocable contributor access codes stored as SHA-256 hashes in D1. These are reusable bearer credentials, not single-use invitations. Ordinary contributors lack review scope.
- Same-origin hosted sign-in UI; credentials in sessionStorage; local prototype UI still available in non-edge builds.
- Request body bound, daily mutation budgets, default-off write switch; public destination preview.
- No external inference, ATProto publication or remote MCP in this edge slice. HTTP API is available to clients. Existing local transports remain unchanged.
- Operator credential generator writes only ignored owner-only files.
- Deployment guide and CI bundle check.

## Evidence already observed

- Typecheck and edge Vite production build passed before the final Wrangler dependency addition.
- Wrangler 4.45.0 dry-run bundled successfully: approximately 1,308 KiB uncompressed / 253 KiB gzip.
- Five new tests passed using real SQLite SQL plus current Commons service: duplicate commands, independent concurrent writes, rollback, credential revocation/permissions, two identities over HTTP → reply → public rediscovery → reconstructed service.
- Full suite: 229 passed, one failed (230 total). Existing ATProto test “resolves handles and DIDs through the PLC directory and refuses PDSs outside the allowlist” timed out at five seconds. Focused rerun: eight passed, same one timed out. Do not hide it, casually raise its timeout, or claim it is unrelated without baseline reproduction.
- Local D1 migration succeeded through Wrangler.
- `wrangler dev` fails on this managed host during OS network-interface enumeration (`uv_interface_addresses`, getLocalHosts). Explicit --ip did not fix it.
- Direct Miniflare/workerd successfully started the bundle when given an explicit modulesRoot matching the bundle directory. `/health` returned 200 (prototypeAuth=false, no curator); anonymous `/api/commons/search?q=Mac` returned 200 with real corpus results.
- Full two-user write flow has NOT yet been tested inside workerd; only SQLite-backed HTTP tests covered it.
- No public deployment, external two-device test, hosted browser walkthrough, or free-tier CPU validation.
- CLOUDFLARE_API_TOKEN / CLOUDFLARE_ACCOUNT_ID / CF_API_TOKEN were not configured here. This does not establish the NUC's account state.
- Wrangler was added as an exact dev dependency at the pause checkpoint; package-lock changed. Do a fresh-checkout validation.

## Work packets (15–115 minutes)

### A: persistence and actual Worker runtime (highest priority)
Owned paths: apps/commons/worker/edge/**, apps/commons/server/test/commons/edge.test.ts, new edge runtime tests/scripts. Coordinator owns lockfile/config changes.

- Review CHECK-guard atomicity, bounded retries, ambiguous commit handling, callback side effects, no-op reads and capacity limits.
- Exercise real D1 via Miniflare/workerd: concurrent identical commands, changed command ID payload conflict, distinct simultaneous commands, failed commit rollback, source import concurrency and restart persistence.
- Inspect actual CPU/memory costs at baseline and bounded growth; report measurements, not presumed free-tier compliance.
- Either keep the bounded adapter with justified limitations or make a focused correction. Do not initiate an unbounded schema rewrite.
- Build a reproducible runtime smoke command that can run in CI. Use installed pinned Wrangler/Miniflare, explicit modulesRoot, isolated temporary storage and cleanup.
- Review privilege/visibility enforcement on all exposed routes. Ensure the edge API cannot fall through to legacy writes.

### B: hosted UX and identity (parallel)
Owned paths: apps/commons/src/** except e companion/art, apps/commons/scripts/edge/issue-contributor.mjs, focused UI tests.

- Test two browser profiles, read-only entrance, sign-in, expiry/revocation, switching back to public, reload, error recovery and drafts.
- Ensure no participant picker or guessed local service URL appears in edge mode. Local mode must retain its existing behavior.
- Confirm public destination and authorship labels throughout cards/previews, not only the prepare response.
- Avoid displaying unavailable legacy workbench/publication actions as working features. Do not redesign the approved product.
- Verify failed submission never clears a draft or shows shared success.
- Do not create a new identity provider or expose contributor codes through logs/screenshots.

## Integration and independent review (115–155 minutes)

Coordinator owns package manifests/lockfiles, Wrangler config, CI, docs and integration.

- Reconcile supported runtime compatibility date with pinned Wrangler/workerd: config currently says 2026-09-07; successful direct test used 2025-10-08. Resolve this mismatch explicitly before claiming runtime parity.
- Reproduce the ATProto timeout on main in isolation. Fix only if scoped and understood; otherwise record exact baseline failure and keep the PR draft.
- Run required combined gates, edge bundle and runtime smoke, then browser journey. CI's edge build runs after legacy browser smoke to avoid changing the frontend mode underneath that check.
- Obtain independent review of the exact integrated commit, especially transaction and identity boundaries, using an enforced read-only isolated route. Label self-review accurately if such a route is unavailable.
- Inspect diffs and source attribution. Return findings through .observstory/proposals/; do not fabricate human reviews.

## Final 25 minutes: fixes and handoff (155–180)

Allow one bounded correction pass, rerun affected checks, push and update the draft PR. At deadline stop/settle all workers, record any possibly-live attempts, and leave a clean resumable checkout.

Deliver exact commit/PR, observed routes, tests with failures/skips, browser evidence, bounded-runtime measurements, remaining deployment prerequisites, next operator commands and explicit status: implemented / locally tested / live verified. Never imply that public hosting or a three-hour monitor exists without evidence.

## Exclusions

No Observatory database migration, new PDF execution service, paid hosting, model inference dependency, new federation protocol, repo-wide rename, mascot redesign, automatic merge or deployment. Static PDF/Observatory surfaces continue unchanged. Finish the real Commons journey before expanding scope.
