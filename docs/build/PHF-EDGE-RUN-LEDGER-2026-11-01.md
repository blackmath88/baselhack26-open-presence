# Run ledger — Commons edge three-hour delivery (2026-11-01)

Coordinator: Claude Code (assistant), supervising through Orca 1.4.230 (`orca-ide`), Run `run_621187696b2d`.
Start 22:44 CET · hard deadline 01:44 CET · branch `feat/commons-edge-runtime` · checkpoint `473adcf` · main `564f1d4` (branch contains main).

## Routes

| Packet | Requested | Effective | Dispatch | Outcome |
|---|---|---|---|---|
| A — workerd persistence | Codex | Codex (`gpt-6-astra`), worktree `pr48-edge-a` | `ctx_dc3cdbd75702` | succeeded; `a2fa8a9`, `589677a` → integrated as `bf4adad`, `9eb68b4` |
| B — hosted UX/identity | Claude | Claude did not start: it stopped at its Bypass Permissions acceptance prompt, which the coordinator did not accept on the user's behalf. `ctx_31979c40349e` released. | — | — |
| B retry | Codex | Codex, same worktree `pr48-edge-b` | `ctx_89675f052d74` | succeeded; `0ff56b4` → integrated |
| R — independent review | Codex | Codex, worktree `pr48-review` at `80377a5`; read-only by instruction, then checked afterwards with `git status` | `ctx_9693d58714f2` | see PR #48 |

Local/Mistral: Mistral Vibe is configured locally (`mistral-large-4-0-3`), but it isn't an Orca agent id, and opencode lists no Mistral model, so Orca couldn't supervise it. No new paid spend. At most two workers ran concurrently. Orca enforces no wall-clock worker timeout: the deadline was in each spec, and the coordinator owned stop/release. All dispatches were settled and released.

## Coordinator results

- Fresh `npm ci` (offline cache) succeeds. npm reports that it skipped the install scripts for workerd/esbuild, but the `@cloudflare/workerd-linux-64` binary is present and every runtime check used it.
- Compatibility date: pinned workerd `1.20251011.0` supports dates up to `2025-10-11`. `wrangler.edge.jsonc` changed from `2026-09-07` to `2025-10-11`. The inherited `wrangler.jsonc` is unchanged.
- ATProto timeout: `server/test/atproto/roundtrip.test.ts` passes 9/9 in isolation, twice on main and twice on the branch. In concurrent full-suite runs under worker load, a *different* 5 s test timed out: `adapter-consistency.test.ts > rejects malformed operation inputs…`. It failed identically on main (224/225) and on the branch (229/230). Both are pre-existing, load-sensitive 5 s timeouts. They are not caused by this branch, and their timeouts were not raised.
- `npm run smoke:edge` passed in the integration worktree (in addition to A's two passing runs).
- Hosted browser journey on real workerd (`EDGE_HARNESS=workerd node test/client/edge-ux.mjs`): 36/36 PASS, including after-restart rediscovery. The SQLite harness variant also passes 36/36.
- `npm run typecheck` passes. Client and edge vitest: 37/37.

## Not done / prerequisites

- No Cloudflare deployment, D1 creation, account inspection or public two-device test. `CLOUDFLARE_API_TOKEN`/`CLOUDFLARE_ACCOUNT_ID` are not configured in this environment.
- Free-plan CPU compliance has not been measured on Cloudflare. Local measurements are whole-process CPU.
- Capacity: 83–84 contributions in the smoke workload. This is a demonstration-scale limit until storage is normalised.
- `scripts/smoke/multi-entry.sh` passes, but its "unreachable server" step is not meaningful here: an unrelated process holds 127.0.0.1:8797.

## Independent review (Codex, read-only, `80377a5`) and correction pass

1. MAJOR: an exhausted contributor drained the global write budget. **Fixed:** the actor bucket is now charged first. Regression added to `smoke:edge`.
2. MAJOR: a delayed session bootstrap could undo a sign-out or a newer login. **Fixed:** an auth generation is shared by bootstrap and sign-in. Browser regression `delayed bootstrap cannot undo sign-out` added; it was confirmed to fail without the fix.
3. MINOR: capacity overflow returned a generic 500. **Fixed:** it now returns a typed 409 `conflict` with `reason: capacity`.

After the fixes: full `npx vitest run` 244/244 (26 files) when the machine is not loaded by workers; typecheck passes; 37/37 client and edge tests; `smoke:edge` PASS; browser journey 37/37 on workerd and 37/37 on SQLite; local browser smoke PASS.
