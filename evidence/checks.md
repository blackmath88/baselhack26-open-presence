# Observed checks — batch 1 (2026-10-31)
Run in apps/commons on the commit this file is committed in.
- `npm run typecheck` (app+server+worker): pass
- `npx vitest run`: 10 files, 136 tests pass (120 upstream + 7 corpus + 9 commons server)
- `npm run index:check`: "Record-only index reproduced byte-for-byte" (no cache, no network)
- `npx vite build`: pass (chunk-size warning only)
- `bash scripts/smoke/e2e.sh`: see e2e-smoke.txt — submit 201; identical retry no duplicate; altered retry 409; 2nd session sees it; verified process stop + restart keeps it; reimport 0 events; concurrent accept/reject -> one 200, one 409
- Browser: see browser-check.txt
- G6 independent review: NOT done. All verification above is coordinator self-review. Packet D pending.

# Batch 2 (2026-10-31 14:46–15:16 CET)
Independent review: Orca packet D (codex, dispatch ctx_0699618af237) on exact commit 2624045 → evidence/review/D-report-2624045.md.
Findings and disposition:
- B1 BLOCKER legacy review route races Commons review → FIXED (e50dc2c + batch-2 commit): commons:* reviews and free-form room contributions run inside the serialized Commons transaction. Regression tests in server/test/commons/legacy-route.test.ts fail on 2624045 and pass now (incl. D's exact legacy-accept vs commons-reject case).
- S1 imported evidence invisible in State → FIXED: imported kind is `evidence`; browser shows "EVIDENCE · 10"; test asserts.
- S2 prototype auth on all interfaces → FIXED: binds 127.0.0.1 unless HOST is set; `ss` shows 127.0.0.1:8787.
- S3 participant can import forged provenance → FIXED: HTTP import endpoint removed (404, tested); corpus import only at startup.
- S4 accepted edge loses machine origin → FIXED in Curation history (proposer + reason shown; browser-verified). Map still shows no cross-room edges.
- N1 no fsync → documented limitation. N2 npm audit (10 inherited) → triaged, not upgraded; documented.
Coordinator checks after repairs: typecheck pass; vitest 11 files / 140 tests; index:check byte-identical; vite build pass; e2e smoke pass (e2e-smoke.txt).
Browser (built-in, coordinator): keyboard-only sign-in → search → open record works (native buttons/inputs, Enter submits); backend stopped → clear "server did not answer" message, no fallback seed room, failed submit keeps draft; restart → draft restored and submitted; `<img onerror>` draft rendered as text, no element injected; in-UI accept of imported proposal works.
G6: independent review done on 2624045; the repairs since then are coordinator self-review only (not re-reviewed independently).

# Batch 3 (2026-10-31 14:56–15:26 CET)
Independent re-review: Orca packet E (codex, dispatch ctx_4daa68ab44fa) on exact commit 33b97fc → evidence/review/E-report-33b97fc.md. Verdicts: S2/S3 FIXED; B1, S1, S4 PARTIAL; new E-S3. Dispositions after batch 3:
- E-B1 BLOCKER MCP review_curation_proposal bypassed the transaction → FIXED in 6b616fa at the composition root (all transports). E's own real HTTP+MCP race script, rerun on 6b616fa: same-mcp 12/12 single decision (was 8/12 double on 33b97fc); mixed-http 12/12 and mixed-mcp-http 12/12 single (evidence/review/E/races-v3-after-6b616fa.json vs races-v2.json). Regression test server/test/commons/mcp-route.test.ts fails without the fix (2 decisions) and passes with it.
- E-S1 old stores keep 'observation' → FIXED: projection reads imported 'observation' as 'evidence' without rewriting events; test + browser on the real pre-batch-2 data file ("EVIDENCE · 10").
- E-S2 edge evidence missing in review → FIXED: Commons-room curation list carries origin + evidence (source objectId/permalink); pending and reviewed cards show "origin: … · evidence: issue/99" (browser-verified).
- E-S3 rejection reason dropped / changed-reason retry replayed → FIXED: ReviewCommand.reason flows to RelationRejected; same key + different reason → 409 (test).
- E-N1 orchestration setMode and generic Add-a-thought have no command receipt → NOTE kept (contributions to commons rooms are serialized via addToRoom but not idempotent; setMode remains check-then-append).
- E-N2 / N2 dependency audit → FIXED in 6a99383: npm audit 10 → 0 (npm audit fix + @modelcontextprotocol/node 2.1.2), clean npm ci, all gates pass.
Gates on batch-3 head: typecheck pass; vitest 12 files / 144 tests; index:check byte-identical; vite build pass; e2e smoke pass.
G6: batch-3 repairs (after 33b97fc) are coordinator-verified only; no independent re-review of them yet.

# Batch 4 (2026-10-31 15:09–15:39 CET)
Independent re-review: Orca packet F (codex, dispatch ctx_1226a456928c) on exact commit 8fa3b48 → evidence/review/F-report-8fa3b48.md.
F verdict: E-B1, E-S1, E-S2, E-S3 all FIXED (36/36 fresh real-JSON races, one persisted decision each: MCP-vs-MCP, MCP-vs-HTTP, legacy-vs-Commons); 0 BLOCKER, 1 SHOULD-FIX, 3 NOTE. npm ci / npm audit: 0 vulnerabilities.
Dispositions:
- F-S1 review wrapper ignored the named room (MCP could review another room's proposal) → FIXED: ReviewCommand.problemId is validated against the proposal's room inside the transaction; MCP, legacy HTTP bridge pass it. Test fails on 15ea5f3, passes now.
- F-N1 back-compat rule applied to any 'observation' → FIXED: only events by repo:postack-underflow. Test.
- F-N2 reason policy differed per transport → FIXED: one policy in the Commons review (trim, blank = absent, ≤1000 chars) before the receipt hash. Test (blank MCP reason).
- F-N3 enriched curation GET reads the room twice → NOTE kept (no latency issue observed).
Also in batch 4 (coordinator, before F's result): idempotency key for Add-a-thought in commons rooms (test fails on 8fa3b48, passes now; browser: receipt stored for a UI post); orchestration mode changes on commons rooms serialized (defensive — invariant test does not reproduce a race on the earlier code).
Gates on batch-4 head after clean npm ci: 0 vulnerabilities; typecheck pass; vitest 12 files / 149 tests; index:check byte-identical; vite build pass; e2e smoke pass. Browser: Add-a-thought and Curation reject in an imported room work.
G6: batch-4 changes after 8fa3b48 are coordinator-verified only.
