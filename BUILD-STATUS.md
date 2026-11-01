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

Turn 5 (20:44–): reusable cross-entrance browser smoke, `apps/commons/scripts/smoke/browser.sh` + `browser.mjs`. It drives the system Chromium over the DevTools protocol with Node's built-in WebSocket; there are no new dependencies or downloads, and everything binds to 127.0.0.1. It asserts the chain: Kai's CLI attempt citing `issue/148` appears in Lea's browser Repository view with author and entrance → following it opens the problem with the card → Lea replies in the browser → Lea responds to passage e2 → the CLI as Kai sees the browser reply in the thread, the passage citation under e2 only, and search with Lea · browser · refs. Passing run: `evidence/browser-smoke-cross-entrance-20261031.txt`. One focused repair: a case-sensitive text check (the CSS-uppercased kicker). No product code changed this turn.

Idle gap: the supervisor capped every lane at five turns. Commons turn 5 ended at 20:46 and the lane resumed at 22:18 (runtime `events.jsonl`: commons-6 launch 21:18:09Z). Nothing ran on Commons in between.

Turn 6 (22:18–): search → problem rediscovery. Problem hits from search (HTTP/CLI/MCP `commons_search`, browser) carry `community`: own experiences, replies, participant names, last activity, and visible contributions in other problems citing the same sources. The browser shows it under each hit. `browser.sh` gained a search step. Checks on this head: typecheck; 192 tests; index byte-identical; build; e2e.sh; multi-entry.sh; browser.sh PASS (`evidence/browser-smoke-cross-entrance-20261031.txt`). Pin PR #19 moved to producer `f0cbde8` with local consumer verification.

CI: the Commons app workflow now runs `browser.sh`. Run 41243526771 on `b69cc7d` succeeded, and the browser step actually ran on the runner's Chrome (`PASS browser smoke` in the log; it did not skip).

Turn 6, final increment (22:29–22:32): `getProblem` returns `sharedSources`, the other problem records whose evidence cites the same issue or doc, each with the count of contributions there. It is derived and labelled 'not a reviewed relationship'. The browser shows it as **Shares cited sources with**, the record is asserted unchanged, and `browser.sh` checks the section. Checks: typecheck; 193 tests; index byte-identical; build; e2e.sh; multi-entry.sh; browser.sh PASS.

## NUC continuation — adapter consistency and moderation repair (2026-10-31)

Starting base: PR #11 head `dacc9741877040836d103992e8861c36f29ae167`, including PR #13's publication destination/retry repairs. This differs from the takeover document's `0175fa9`; the original M0–M5 build is preserved. Continuation branch: `blackmath88/commons-adapter-consistency`, stacked on `feat/commons-multi-entry` (PR #11), PR #11 is now based on main after its earlier dependencies were integrated by the separate session.

Ownership checked before edits: Claude's original checkout was clean at `0175fa9`; its multi-entry transcript ended at a usage limit. Orca reported no attached or unverifiable terminals for that checkout or its packet worktrees. Claude processes in the parent clones directory were preserved; its existing Vite preview on :5173 was left running. Work took place in a separate Orca-created continuation worktree, directly in foreground Codex, with no workers dispatched and no paid API calls.

Repairs and consistency:
- Reproduced legacy room/body leakage with a failing regression before the repair. Ordinary legacy problem, history, compact overview, update, curation and orchestration reads now fold a moderation-filtered event view. Commons room reads use the same filter. Hidden/blocked/deleted/invalid contributions and dependent proposal/edge/evaluation events are omitted; persisted events remain intact. Submission replay refuses a saved outcome that references withheld objects. Moderation command replay remains idempotent.
- MCP discovery uses the same runtime operation schemas enforced by the Commons service. HTTP rejects invalid JSON types instead of silently converting them; numeric/enumeration bounds apply to HTTP/CLI as well as MCP. Preview retains its existing `ok:false` validation response; invalid commands use domain `invalid` (HTTP 422, CLI exit 2; MCP uses its protocol's error result).
- Session attribution remains authoritative; untrusted extra identity fields are stripped before receipt hashing. Operation names, tool names, room/contribution identifiers and underlying log are preserved. Existing valid durable command receipts are retained.

PR #14 landed concurrently at `86ec1a9` after this work began; its complete-log moderation reader is preserved as the single shared reader, with this continuation adding schema validation and receipt replay protection. Local integration resolves the overlap without merging any remote PR.

Validation and exact handoff: `evidence/CODEX-NUC-ADAPTER-CONSISTENCY.md`. No public account writes, remote PR merge, deployment, OAuth, namespace activation or original-build restart. Remaining review is bounded independent review of this continuation; activation/product follow-ups above remain separate.

Final combined checkpoint after preserving PR #14: typecheck, **18 files / 192 tests** (isolated PDS executed), index reproduction, production build and both local-server smoke scripts pass. Draft continuation: PR #15. Existing chunk-size warning remains; independent review is still outstanding.
