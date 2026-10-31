# Packet E — independent exact-commit re-review

Target and observed HEAD: **33b97fcc4a78ab0e575664deacd2e12a50448931** (verified before and after execution). Review performed 2026-10-31, beginning 14:57 CET; report written before the 15:16 CET deadline. Working tree remained clean; no repository files were edited, committed, or pushed. The expressly permitted `npm ci` installed dependencies; all review scripts, data, logs, and this report are in `/home/nuc/projects/op-commons-review-3/`.

Observed harness: **Codex in Orca, local execution host, agentIdentity `codex`, terminal preview `GPT-6.1-Sol default`**, obtained from `orca terminal show` for this dispatched terminal (saved in `observed-harness.json`). This is observed runtime/UI metadata, not an independently attested provider model identifier. No delegation, paid model calls, external posts, or use of ports 8787/5173 occurred. Scratch servers used 8798; the authorized smoke used 8799; both ports were empty after testing.

**Outstanding findings: 1 BLOCKER, 3 SHOULD-FIX, 2 NOTE.** Review completed successfully; the application does **not** satisfy G4 globally. The HTTP repair is real, but the same-process MCP writer remains outside its transaction boundary.

## Disposition of Packet D findings

Paths below are relative to `apps/commons/` unless otherwise stated.

| Prior finding | Disposition | Evidence and reproduction |
| --- | --- | --- |
| B1 — contradictory reviews | **PARTIAL** | `server/http/api.ts:229–232` now delegates Commons rooms to `commons.review`, whose complete validation/append is transactional (`server/commons/service.ts:80–95`). Twelve fresh real-JSON legacy-HTTP-accept versus Commons-HTTP-reject trials each produced **200/409**, one persisted decision; D's adapted script also passed across nine rooms. However, MCP still directly invokes outer `services.curation.accept/reject` (`server/mcp/register-tools.ts:343–345`): **8/12** fresh real-JSON MCP-vs-MCP trials returned two successful contradictory decisions and persisted both. See E-B1. |
| S1 — imported evidence missing in State | **PARTIAL** | Fresh imports use `evidence` (`server/commons/import.ts:68`); actual StateView SSR rendered **10 cards for 10 contributions**. Existing JSON stores are not migrated: the same importer skips matching source metadata (`:54–57`), and StateView still excludes `observation` (`src/components/StateView.tsx:10,93`). Import with the real old importer from 2624045, then reimport with the reviewed importer: **0 appended migration events, 10 observation contributions, 0 cards**. See E-S1. |
| S2 — prototype auth binds all interfaces | **FIXED** | `server/http/server.ts:18,44` defaults to `127.0.0.1` and passes the host to listen. Started the actual reviewed server with HOST unset, scratch data, PORT=8798, and API key/model unset; `ss` showed **127.0.0.1:8798**, with prototype auth on. `bind.log`, `bind-socket.txt`. Explicit HOST opt-in remains possible. |
| S3 — participant import of forged Postack provenance | **FIXED at the exposed HTTP boundary** | `server/commons/routes.ts:43–51` contains no import branch; authenticated POST `/api/commons/import` returned **404**. Startup uses the pinned corpus importer (`server/http/server.ts:27–29`). The updated HTTP test also asserts 404 and imports through trusted test setup. The internal `commons.importProblems` method remains ordinarily scope-authorized (`service.ts:42–46`), so it must remain internal; no remaining HTTP/MCP call site exposing that method was found. |
| S4 — reviewed edge loses qualified provenance | **PARTIAL** | Reviewed history now includes proposer and reason (`src/components/CurationPanel.tsx:186–189`); actual component SSR retained `postack-agent`, so the core lost-proposer defect is fixed. The UI still loads generic state/curation (`src/state/useRoom.ts:112–125`), not Commons-enriched origin/evidence (`server/commons/service.ts:116–121`). Reviewed history has no evidence refs/links, and Map still reduces links to endpoints/kind (`src/components/MapView.tsx:65–67`). See E-S2. |

## Verified outstanding defects

### E-B1 — BLOCKER: MCP still permits contradictory successful reviews in Commons rooms

This is an unclosed portion of B1, not a newly introduced MCP implementation. The batch-2 claim that the race is fixed globally is too broad.

`server/container.ts:74–80` builds the generic services against the outer repository. `server/mcp/register-tools.ts:343–345` still calls that generic curation service; `ToolServices` does not even include Commons (`:89`). `server/application/curation-service.ts:42–44,106,123–134` reads/validates and later appends in separate repository operations. The JSON queue (`server/persistence/json-repository.ts:46–65`) serializes individual outer operations, so two complete generic reviews can both validate pending state before either append.

**Transport-level reproduction:** `races.mts` starts an actual HTTP+MCP server on loopback 8798, with a separate fresh real JSON repository for each trial, imports the actual pinned records, resolves Kai/Lea sessions, connects real SDK Clients using StreamableHTTPClientTransport, and concurrently calls `review_curation_proposal` accept/reject on `commons:emmc-not-exposed:relation:0`. No repository mocks, injected barriers, or forced scheduler hooks are used. **Eight of twelve trials returned `tool-success/tool-success`** and persisted `RelationAccepted` followed by `RelationRejected`; final proposal was **rejected with one canonical relation still present**. See `races-v2.json`, mode `same-mcp` (for example i=0 and i=8), plus its individual `v2-same-mcp-*.json` event documents.

For comparison, the required legacy HTTP accept versus Commons HTTP reject race was repeated **12 times with fresh repositories**, always **200/409**, with one decision. The adapted D reproduction exercised another nine imported rooms with the same 200/409 result. The MCP accept versus Commons reject trial produced a tool error plus Commons 200 in all twelve attempts; that specific scheduling did not reproduce a mixed-transport double success. MCP-vs-MCP alone proves the remaining global defect.

The initial raw MCP probe was rejected at protocol validation because its modern envelope was incomplete; those runs are in `races.json`/`races.log` and are **not evidence of application behavior**. `races-v2.json` uses real SDK protocol negotiation and is the authoritative run.

**Repair:** put every local write path against Commons rooms behind the same complete command transaction, preferably at the shared application-service boundary so transport adapters cannot diverge. Preserve explicit conflicts and persisted command receipts for MCP too. Add real-JSON cross-transport and MCP-vs-MCP acceptance coverage.

### E-S1 — SHOULD-FIX: S1 remains for durable stores created before batch 2

Fresh-install behavior is corrected, but upgrading the existing app with its existing data keeps the original blank State panel.

`server/commons/import.ts:54–57` immediately skips unchanged imported source records. Changing event generation at `:68` only affects first import. No projection normalization or migration for stored `observation` contributions was added; StateView recognizes only its fixed ORDER (`src/components/StateView.tsx:10,93`).

**Verified upgrade reproduction:** `old-import.ts` is the actual importer extracted with `git show 2624045:apps/commons/server/commons/import.ts`, with only imports redirected to the reviewed modules. `migration.mts` creates a real JSON store with that importer (111 import events), invokes the current importer with the same pinned source records (0 appended events), projects the result, and server-renders the actual current StateView. Result: **10 active imported contributions, kind observation, 0 cards**. `upgrade-results.json`, `migration.log`, `upgrade-events.json` preserve the evidence. Fresh-store SSR separately shows ten evidence cards in `render.log`/`state-render.html`.

**Repair:** provide a documented, source-preserving migration or backward-compatible projection/rendering rule for old imported kinds. Retain submitted room history and source immutability; deleting the data store would lose participant work.

### E-S2 — SHOULD-FIX: S4 still omits edge evidence from the review experience

The new proposer/reviewer line and descriptive reason successfully preserve visible machine authorship in reviewed rows. The full frozen contract also requires graph edges to expose origin and evidence.

The enriched API has `origin` and `evidenceIds` (`server/commons/service.ts:116–121`), but the mounted room UI still reads the generic state and generic curation list (`src/state/useRoom.ts:112–125`; `server/http/api.ts:151–170`). Reviewed rows render status, endpoint labels, proposer, reviewer, and prose reason only (`src/components/CurationPanel.tsx:179–190`). There is no supporting-evidence ID/link or source-assertion metadata in those rows. Map ignores cross-room endpoints entirely and reduces retained relations to source/target/kind (`src/components/MapView.tsx:65–67`).

**Verified component-level evidence:** adapted `render.mts` renders an accepted imported proposal's actual CurationPanel; `curation-render.html` now includes `proposed by postack-agent` and the original imported reason, but no evidence links. Source evidence is still available separately in Finder/Commons room data; the deficiency is its absence from the accepted-edge review context, not source deletion or automatic machine acceptance. No full-browser visual verification was performed by this reviewer.

**Repair:** use the enriched read contract and present the relation's evidence/source refs in pending and reviewed views, while retaining the now-correct proposer/reviewer distinction.

### E-S3 — SHOULD-FIX: batch-2 legacy review bridge silently discards rejection reason and changed-input retry semantics

This is a verified regression in the new branch. `server/http/api.ts:225` parses reason, but `:232` constructs only `{ commandId, proposalId, decision }`. `server/commons/service.ts:94` also omits reason when calling reject. The non-Commons legacy branch still forwards it (`server/http/api.ts:237–240`). The ReviewCommand contract currently lacks a reason field (`src/commons/contracts.ts`, ReviewCommand).

**HTTP reproduction:** reject imported relation 1 with `reason: "My explicit rejection rationale"`; response is 200 but persisted `RelationRejected.payload` contains only proposalId. Retry the same route/participant with `reason: "Changed rationale"`; response is another 200 replay identical to the first. `reason-results.json` contains both responses and the persisted event. The default deterministic key is unchanged and the discarded reason never enters the command hash, so changed caller input is silently treated as an identical retry.

Default `review:${proposalId}:${decision}:${actor.actorId}` is otherwise reasonable for immutable one-shot proposals: it separates actors/decisions and replays identical accepted/rejected clicks. Current result shape is also compatible with the room hook (see checks below); the defect is loss of supported caller input, not a response-envelope mismatch.

**Repair:** carry reason through the validated review contract, receipt hash, and curation rejection event. An identical retry should replay; a changed reason under the same command key should explicitly conflict rather than disappear.

## Notes, code-reading hypotheses, and limits

### E-N1 — NOTE: other state-dependent writers still use the outer repository

**Verified by code reading, consequences not reproduced here:** HTTP orchestration mutation calls `services.orchestration.setMode` directly (`server/http/api.ts:184–192`); that service reads mode then appends later (`server/application/orchestration-service.ts:140–166`). MCP contribution submission likewise calls outer `services.contributions.add` (`server/mcp/register-tools.ts:306–316`). These paths remain callable with `commons:*` IDs and are not brought into the Commons critical section by the new HTTP review/add branches. Possible stale mode transitions or stale proposal candidate selection are hypotheses, distinct from the reproduced MCP review corruption above.

`addToRoom` serializes its complete operation but has no command receipt (`server/commons/service.ts:102–105`); the generic Add-a-thought client/route still has no idempotency-key contract. Batch 2 should not be described as making every contribution path retry-safe. Duplicate free-form POST consequences were not separately reproduced and are not counted as another blocker.

### E-N2 — NOTE: inherited operational limitations remain

Code still writes then renames without file/directory fsync (`server/persistence/json-repository.ts:53–55`); no power-loss durability experiment was performed. The single-process restriction remains documented in that module. D's dependency audit reported 10 vulnerabilities, but this review installed with `--no-audit` to avoid a separate network audit; the old count was **not independently refreshed** and application exploitability was not established. Neither point was introduced by batch 2.

## Checks and regression audit

- **Typecheck PASS:** `npm run typecheck`; `typecheck.log`.
- **Tests PASS:** `npx vitest run`, **11 files / 140 tests**; `vitest.log`. New legacy-route tests use memory persistence, and their repeated mixed-route loop reuses two already-reviewed proposals (`server/test/commons/legacy-route.test.ts:71–80`), so later iterations do not exercise fresh conflicts. The independent JSON trials above strengthen that evidence and expose the missing transport coverage.
- **Index PASS:** `npm run index:check`, byte-identical record-only index, no source cache.
- **Smoke PASS:** authorized `bash scripts/smoke/e2e.sh` with TMPDIR confined to scratch and model variables unset; `e2e.log`: submit 201, identical retry 201 with one contribution, changed input 409, second session sees server-resolved author/browser preparation, actual stop/restart preserves contribution, reimport 0 events, review 200/409. Both server processes were stopped.
- **UI result shape checked:** accepted legacy Commons review returns `{ proposal, relation }`, rejected returns `{ proposal }`, the unchanged curation-service result. `src/lib/api.ts:151–156` expects exactly that family; `src/state/useRoom.ts:263–274` reads optional `conflict` and reloads. No response shape regression found. `addToRoom` returns `{ contribution, proposals, curator, dropped }`, matching `useRoom`'s add handling; successful HTTP add returned 201 and those keys.
- **addToRoom authorization/validation checked:** `add-check.mts` uses real JSON storage and the real service. Valid human contribution succeeded with author person:kai; read-only scope and nonhuman actor were forbidden; unknown room was not_found; observation kind and blank content were invalid. HTTP checks resolve actor from bearer before calling this service. The service directly assumes a typed input object; the HTTP adapter validates problemId/content before invocation. No new missing-scope or unknown-room acceptance defect found.
- **Import removal/tests checked:** authenticated import route returns 404, and the prior HTTP test now expects 404 and uses the trusted importer for fixture setup (`server/test/commons/commons.test.ts:159–166`); full suite passes. Removing the route did not leave the old 200 assertion behind.
- **HOST checked:** default loopback binding was measured on the actual startup entrypoint, not inferred from source. Explicit non-loopback HOST remains operator opt-in; it was not exercised.
- **Rendering checked:** actual StateView and CurationPanel SSR, including source-like markup escaping. No full-browser responsive/keyboard/backend-unavailable rerun by Packet E; coordinator browser claims remain coordinator evidence.
- **Scope preserved:** no new network requests beyond permitted dependency installation and loopback tests; no API/model calls, deployment, commits, or public artifacts. Final git status was clean and HEAD stayed pinned.

## Reproduction entrypoints

From `apps/commons/`, using the installed dependencies:

```sh
node --import tsx /home/nuc/projects/op-commons-review-3/races.mts
node --import tsx /home/nuc/projects/op-commons-review-3/reproduce.mts
TSX_TSCONFIG_PATH=tsconfig.app.json node --import tsx /home/nuc/projects/op-commons-review-3/render.mts
TSX_TSCONFIG_PATH=tsconfig.app.json node --import tsx /home/nuc/projects/op-commons-review-3/migration.mts
node --import tsx /home/nuc/projects/op-commons-review-3/add-check.mts
```

The scripts use fixed scratch JSON filenames; for a fresh rerun, use a new scratch filename/prefix or remove only those scratch data files first. Existing results are preserved alongside the scripts. `races-v2.json` is the authoritative transport race evidence; the earlier protocol-invalid `races.json` is explicitly excluded.

Review complete. Before claiming all D findings closed, close the shared MCP transaction gap, handle existing-store S1 compatibility, finish edge evidence presentation, and preserve rejection rationale in the review command.
