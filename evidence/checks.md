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
