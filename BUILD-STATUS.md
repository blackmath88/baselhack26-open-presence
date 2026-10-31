# BUILD-STATUS — Photo Frame Commons (br-ai-nstorm integration)

Branch `feat/commons-brainstorm-integration` · Batch 1 budget 14:20–14:50 CET 2026-10-31 (30 min, enforced).

## Milestones
- [x] G0 baseline: br-ai-nstorm @a96c2db imported to apps/commons; `npm ci` + 120/120 upstream tests pass.
- [x] Contracts frozen: `apps/commons/src/commons/contracts.ts`; origins in THIRD_PARTY.md.
- [ ] Packet A corpus+search · [ ] Packet B shared memory · [ ] C wiring · [ ] D review

## Worker ownership
| Packet | Owner | Paths |
| --- | --- | --- |
| A | Orca run_8ef2e94f3363 · task_9603e7aa7b03 · dispatch ctx_78ad9139333e · requested agent codex · worktree ~/orca/workspaces/…/commons-packet-a | corpus/, scripts/corpus/, src/commons/source/, src/commons/retrieval/, test/corpus/ |
| B | Orca task_3315c2257e8d · dispatch ctx_27572260aaef (retry of ctx_633c09e3638b) · requested agent codex · worktree …/commons-packet-b | server/commons/, server/application/, server/persistence/, server/test/commons/ |

## Checks
- upstream vitest: 120 passed (14:21)

## Blockers / incidents
- B first attempt (agent claude, ctx_633c09e3638b) failed at agent_readiness: Claude TUI stopped at its Bypass-Permissions consent prompt. Coordinator did not accept it; released (already_released) and retried B on codex.

## Current coordinator work
- Packet C wiring in coordinator: src/components/commons/CommonsFinder.tsx, src/commons/client/{drafts,api}.ts, App.tsx Find panel, useRoom.openProblem.
