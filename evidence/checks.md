# Observed checks — batch 1 (2026-10-31)
Run in apps/commons on the commit this file is committed in.
- `npm run typecheck` (app+server+worker): pass
- `npx vitest run`: 10 files, 136 tests pass (120 upstream + 7 corpus + 9 commons server)
- `npm run index:check`: "Record-only index reproduced byte-for-byte" (no cache, no network)
- `npx vite build`: pass (chunk-size warning only)
- `bash scripts/smoke/e2e.sh`: see e2e-smoke.txt — submit 201; identical retry no duplicate; altered retry 409; 2nd session sees it; verified process stop + restart keeps it; reimport 0 events; concurrent accept/reject -> one 200, one 409
- Browser: see browser-check.txt
- G6 independent review: NOT done. All verification above is coordinator self-review. Packet D pending.
