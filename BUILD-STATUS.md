# BUILD-STATUS — Photo Frame Commons (br-ai-nstorm integration)

Branch `feat/commons-brainstorm-integration` · Batch 1 budget 14:20–14:50 CET 2026-10-31 (30 min, enforced).

## Milestones
- [x] G0 baseline: br-ai-nstorm @a96c2db imported to apps/commons; `npm ci` + 120/120 upstream tests pass.
- [x] Contracts frozen: `apps/commons/src/commons/contracts.ts`; origins in THIRD_PARTY.md.
- [x] G1/G2 Packet A (Orca, codex) — 8734be4/e8bc1e4, merged f8dca26. Pinned manifest byte-identical, record-only index reproduces, Mac query + near-match.
- [x] G3/G4 Packet B (Orca, codex) — 8cc10fd/12955b5, merged 03ee04d. Transactional commands, durable idempotency, conflict-safe review, immutable sources.
- [x] C wiring (coordinator, not a worker) — finder/draft/submit in existing UI; API + boot import wiring (ca75ffd).
- [~] G5 partial — phone width OK, React-escaped source text + GitHub-only links; keyboard-only and backend-down states not exercised.
- [ ] G6 / Packet D independent review — not started (self-review only).

## Worker ownership
| Packet | Owner | Paths |
| --- | --- | --- |
| A (settled: succeeded, released) | Orca run_8ef2e94f3363 · task_9603e7aa7b03 · dispatch ctx_78ad9139333e · requested agent codex · worktree ~/orca/workspaces/…/commons-packet-a | corpus/, scripts/corpus/, src/commons/source/, src/commons/retrieval/, test/corpus/ |
| B (settled: succeeded, released) | Orca task_3315c2257e8d · dispatch ctx_27572260aaef (retry of ctx_633c09e3638b) · requested agent codex · worktree …/commons-packet-b | server/commons/, server/application/, server/persistence/, server/test/commons/ |

## Checks
See evidence/checks.md (136 tests, typecheck, index:check, build, e2e smoke, browser check).
Observed routes: A worker self-reported Codex GPT-6.1-Sol default; B reported Codex harness (see evidence/orca/B-report.md). Requested: codex for both.

## Blockers / incidents
- B first attempt (agent claude, ctx_633c09e3638b) failed at agent_readiness: Claude TUI stopped at its Bypass-Permissions consent prompt. Coordinator did not accept it; released (already_released) and retried B on codex.

## Current state / next action
Batch 1 closed at the 30-min budget. No workers live (Orca run run_8ef2e94f3363: 0 reclaimable).
Next exact action: start batch 2 with Packet D independent review of the PR head commit (separate route, read-only scratch output), then keyboard + backend-unavailable UI checks and an in-UI review of a proposed connection.
