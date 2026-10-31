# BUILD-STATUS — Multi-entry Commons (continuation of PR #8)

Branch `feat/commons-multi-entry`, based on `feat/commons-brainstorm-integration` @ `e24838f` (PR #8, still open when this started) · 2026-10-31, 16:08–18:10 CET · single Claude session as coordinator, one forked worker for Packet B (ATProto adapter + local PDS), sequential otherwise. Orca was not used for this slice.

Specification: `docs/architecture/MULTI-ENTRY-COMMONS.md` · plan: `docs/build/MULTI-ENTRY-BUILD.md` · what was built: `docs/architecture/MULTI-ENTRY-IMPLEMENTATION.md` · how to run: `DEMO.md`.

## Baseline
- Inputs: main `58b9942`, PR #8 head `e24838f` (149/149 tests, typecheck, index check, build, e2e smoke reproduced locally before any change), planning PR #9 branch `docs/multi-entry-commons-plan` @ `ce32208`.
- Environment: Node 26.8.1, npm 11.19; Docker socket not accessible, so the isolated PDS runs in-process (`tools/local-pds`), not in a container.

## Milestones
| Gate | State | Commit | Evidence |
| --- | --- | --- | --- |
| M0 frozen compatible contracts, migration, adapter map | done | 674b508 | `src/commons/contracts.ts`; migration test "reads a first-slice store without new fields" |
| M1 service parity HTTP / CLI / MCP | done | 674b508 | `multi-entry.test.ts` "finds the same problem from MCP, contributes over HTTP, replies over MCP…"; `evidence/cli-smoke-multi-entry.txt` |
| M2 repository navigator, deep links, thread view, contribution search, composer, publication state in UI | done | this branch head | browser pass `evidence/browser-check-multi-entry.txt`; `multi-entry.test.ts` "walks the pinned snapshot…" |
| M3 Lexicons, durable outbox, publisher, reader, reconciliation | done | 674b508 | `server/test/atproto/*` (20) and `multi-entry.test.ts` M3 block: timeout-after-write recovery with the same key, restart retention, changed payload refused |
| M4 two-author participation, fresh-index reconstruction | done against the isolated PDS | 674b508 | `two-author-roundtrip.test.ts` (real in-process PDS, not skipped): A publishes, B replies with URI+CID, fresh app rebuilds the thread, upstream edit → revision 2, deletion → unavailable |
| M5 integrated delivery, evidence, draft PR | done | branch head | this file, `DEMO.md`, `evidence/`, CI workflow `.github/workflows/commons-app.yml`, stacked draft PR |

## Capability matrix (implemented / verified / unavailable)
| Capability | UI | CLI | MCP | ATProto |
| --- | --- | --- | --- | --- |
| Search records + contributions, with match reasons | implemented, browser-checked | verified (smoke) | verified (test) | — |
| Repository navigation (snapshot metadata → cited problems) | implemented, browser-checked | verified (smoke) | verified (test) | — |
| Problem / contribution / thread deep links | implemented, browser-checked (reload + back) | verified (smoke) | verified (test) | — |
| Agent context packet (budget, omissions, freshness) | — | verified (smoke) | verified (test) | — |
| Prepare (no write) and idempotent submit with replay flag | implemented, browser-checked | verified (smoke: replay 200, changed → 409/exit 3) | verified (test) | — |
| Reply / correction keeping both voices | implemented, browser-checked | verified (smoke) | verified (test) | — |
| Local moderation across every projection | hide/unhide buttons, implemented | verified (smoke) | verified (test) | — |
| Publication preview → explicit publish → receipt | implemented, browser-checked against the isolated PDS | `publish [--yes]` implemented; no-account path verified (exit 4) | verified (fake + real PDS tests) | verified against isolated PDS only |
| Author sync / resolve URI / self-echo dedupe / edit versions / deletion as unavailability | status surfaced | `sync`, `resolve` implemented | verified (test) | verified against isolated PDS only |
| Public account, OAuth sign-in, owned NSID, federation beyond the allowlist | unavailable | unavailable | unavailable | unavailable — activation checklist in `apps/commons/server/commons/atproto/README.md` |

## Checks on the branch head
- `npm run typecheck` (app + server + worker): pass.
- `npm test`: 16 files, 181 tests pass (149 prior + 12 adapter + 8 adapter round trip + 11 multi-entry + 1 two-author round trip). Both PDS suites ran for real (not skipped) because `tools/local-pds` is installed.
- `npm run index:check`: byte-identical. `npx vite build`: pass (chunk-size warning only).
- `bash scripts/smoke/e2e.sh`: first-slice smoke still passes. `bash scripts/smoke/multi-entry.sh`: see `evidence/cli-smoke-multi-entry.txt`.
- Live run with the isolated PDS configured: `evidence/atproto-live-check.txt` (both records on the PDS, the reply carrying a strong reference to the first).
- Browser (built-in, one narrow pass): `evidence/browser-check-multi-entry.txt`.

## Worker ownership
| Packet | Owner | Paths |
| --- | --- | --- |
| Coordinator (M0, A, M2, integration, docs) | this session | contracts, `server/commons/{service,queries,projection,search,repository-view,publication,ingestion,routes,import,null-atproto}.ts`, `server/mcp/commons-tools.ts`, `scripts/commons/cli.ts`, `src/**`, docs, CI |
| B (settled: finished, result integrated) | forked worker, same model | `lexicons/`, `server/commons/atproto/{index.ts,README.md}`, `server/test/atproto/`, `tools/local-pds/`, `scripts/atproto/` |

## Blockers / incidents
- None blocking. Docker unavailable → in-process PDS instead (works on Node 26 with prebuilt better-sqlite3).
- Two concurrent shell writes raced on the working directory once; redone with absolute paths. No data affected.

## Not done / open
- No independent review of this slice yet (coordinator-verified only). PR #8's own open review notes stand.
- UI: no report flow or moderation audit view; Map view still draws same-room edges only; the Commons section is above the room views, not a redesign.
- A shared zod schema per operation across all three adapters would replace today's validator-in-service plus zod-in-MCP.
- OAuth, public namespace, public hosting and moderation ownership remain activation questions, not reasons to stop (see `DEMO.md` → Real limitations).

## Current state / next action
Draft PR opened against `feat/commons-brainstorm-integration` (retarget to `main` when PR #8 lands). Next exact action: an independent bounded review of this head (publication/ingestion state machines, moderation leakage, CLI exit codes), then the activation checklist if a real account and namespace are provided.


## Codex integration continuation — 31 October

Publication fixes from PR #13 are integrated. The reproduced legacy room/HTTP/MCP moderation read leak is repaired in the accompanying change; normal read projections omit withheld content and dependent reasons while retaining the original event log. Combined local checks against current main: 188 tests, typecheck, index reproduction, build and both server smoke scripts pass. See `evidence/MODERATION-READS-20261031.md`. These are coordinator checks, not independent review or public activation. Earlier milestone and test counts above are historical evidence.


## NUC window continuation — 31 October, 20:10–23:00 (Claude Code coordinator)

Branch `blackmath88/nuc-20261031-commons` from main `b1af012`. Weakest link found in the repository → problem → evidence → contribution → reply → rediscovery path: a contribution's source refs never led back from the repository. Browsing `issue/99` showed only problem records, never what people added about it; search could not find a contribution by the object it cited; nothing said which entrance carried a contribution.

Changed: contributions carry a declared `entrance` (`browser`/`cli`/`mcp`/`http`, `atproto` for ingested, `unknown` for older records; excluded from the idempotency hash, so a retry through another entrance replays). Repository navigation (HTTP/CLI/MCP/UI) lists visible contributions citing each doc, thread and comment, with author, entrance and cited objects; linked-only thread lists include contribution-cited threads. Contribution search indexes cited object ids and source authors (`source` field) and returns source refs + entrance in every summary. Moderation removes citations from the navigator. Imported records are unchanged (asserted).

Checks at this head: typecheck; 18 files / 189 tests, including both isolated-PDS suites run for real after `tools/local-pds` install (the two-author test now also asserts a fresh instance rediscovers Alice's record from the cited thread, entrance `atproto`); index byte-identical; Vite build (chunk warning only); `e2e.sh` and the extended `multi-entry.sh` (`evidence/cli-smoke-rediscovery-20261031.txt`). Browser: one headless Chromium pass (desktop width) shows the citing contribution on `#/repo?object=issue/99` and entrance/cited source in search (`evidence/browser-check-rediscovery-20261031.txt`, `evidence/browser-rediscovery-issue-99.png`); phone width and keyboard pass not run. Self-reviewed only. Separate from draft #15 (adapter schemas), which touches the same adapter files; expect a small rebase.

Turn 2 (20:27–): problem → evidence → contribution → reply. `getProblem` (HTTP/CLI `inspect`/MCP/UI) returns `evidenceCitations`: per evidence item, the visible contributions citing its source object — from this problem and, flagged `otherProblem`, from other problems citing the same issue/doc (real data: `issue/148`, `issue/38` and the start-here doc are shared). Each citing contribution (here and in the navigator) carries reply count, participants and last activity over replies and corrections. Context packets add `citedBy` per evidence item. The record UI shows a collapsed "N contributions cite this source" per evidence item, without repeating it for further passages of the same object. Checks: typecheck; 190 tests; index byte-identical; build; e2e.sh; multi-entry.sh (updated evidence); browser pass with real shared `issue/148` (`evidence/browser-check-evidence-citations-20261031.txt` + PNG).

Turn 3 (20:35–): passage citations and participant names. Contributions may cite exact evidence passages (`evidenceIds`, CLI `--evidence`, MCP schema field); prepare validates them against the record and adds their source objects to `sourceRefs`; `evidenceCitations` attaches a passage citation only to that passage (object-level citations and other problems unchanged). The server stores the submitting participant's resolved display name with the submission, so HTTP/CLI/MCP/UI show "Kai" instead of `person:kai` (DIDs keep their handles). `sourceRefs` may be omitted when `evidenceIds` are given. Checks: typecheck; 191 tests; index byte-identical; build; e2e.sh; multi-entry.sh (passage step); browser pass `evidence/browser-check-passage-citation-20261031.txt`. Browser composer still selects whole objects.

Turn 4 (20:40–): the browser composer cites passages. Evidence items offer **Respond to this passage**, which opens the composer focused on that passage (quote shown, textarea focused). Sources list their passages as checkboxes. Drafts keep `evidenceIds`, and un-citing a source un-cites its passages. The preview names the exact passages. A CDP-driven browser round trip (click → type → Preview → Submit) put Mara's contribution under e2 only, and a CLI search as Kai rediscovered it as `Mara · browser · doc/…` (`evidence/browser-check-respond-to-passage-20261031.txt`). Phone width (390px) inspected visually. Checks: typecheck; 191 tests; index byte-identical; build. Server code was unchanged this turn, so the server smokes were not rerun.
