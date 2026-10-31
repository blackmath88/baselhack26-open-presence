# DEMO — Photo Frame Commons on br-ai-nstorm (local only)

Local shared room for the find → inspect → contribute → rediscover loop over the pinned
Wes Bos photo-frame corpus. Prototype demo sign-in; **never expose this server publicly.**

## Install and run
```bash
cd apps/commons
npm ci
npm run dev:server      # API on 127.0.0.1:8787 (HOST=... to change); first boot imports 18 records (idempotent later)
npm run dev             # UI on :5173 (proxies /api to :8787), in a second terminal
```
Room data: `apps/commons/server/data/memory.json` (gitignored; override with `BRAINSTORM_DATA_FILE`).
Browser drafts: `localStorage["commons.drafts.v1"]` only.
If you ran a build before batch 2 (commit e50dc2c or earlier), delete `apps/commons/server/data/memory.json` once: imported evidence was then stored with a kind the State view could not show.

## Checks
```bash
cd apps/commons
npm run typecheck
npm test                # server + corpus tests
npm run index:check     # rebuilds the record-only index, byte-compares, no cache/network
bash scripts/smoke/e2e.sh   # real server on :8799 with temp data: submit, retry, 2nd session, restart, concurrent review
```

## Two-session demonstration
1. Window A: pick a demo participant (e.g. Kai). The finder is open at the top.
2. Search `My Mac cannot see my frame` → open "The frame shows no USB data…". Read evidence: quote vs
   record-writer reading, original author, permalink, "full conversation not stored here".
3. Type an observation, **Save draft**, reload the page — the draft comes back (browser-only).
4. **Preview submission** shows exact content and destination (`commons:<id>`, local room, not GitHub).
   **Submit to shared room** opens the room's existing State / Map / Timeline / Curation views.
5. Window B (private window, another participant, e.g. Lea): open the same problem tab — the contribution is
   there, attributed to Kai, `preparedBy: browser-draft`, linked to the source refs.
   Near-match: search `backup disk disappears on my Mac` — the Windows/WSL record is flagged "near-match" and sorted last.
   Correction: "The frame shows no USB data…" lists a real correction under "Corrections and different outcomes".
6. Curation: imported relations show as proposals by `postack-agent` with no score; accepting keeps
   "proposed by postack-agent · reviewed by <you>" and the original reason in history.
   Reviews of imported rooms (UI, `/api/curation/...`, `/api/commons/reviews`) all go through one serialized,
   idempotent command: concurrent accept/reject → one success, one 409.
7. Stop and restart `npm run dev:server`: state is rediscovered; reimport appends 0 events.

## Real limitations
- Problem records are agent-written (`agent:claude-opus-5-5`) and not reviewed by a person; marked in the UI.
- Full source text is not committed; evidence shows short excerpts + permalink only.
- Search explanations are verbose BM25F field lists; ranking is not a confidence score.
- Stop the API while a draft is pending: submit fails with a clear message and the draft stays.
- Prototype tokens are in-memory: after a server restart, browsers must pick a participant again.
- Cross-room relation proposals (record → record) are listed in Curation; the Map view draws only same-room edges.
- The UI cannot yet tell a replayed (idempotent) submit from a first submit; the server never duplicates either way.
- The pinned corpus is imported only at server start; there is no HTTP import endpoint.
- `npm audit`: 10 inherited advisories (MCP SDK, vite, zod, vitest, hono) not yet upgraded; server is loopback-only.
- JSON log is replaced atomically but not fsync'd: a power loss can drop the latest write.
- Cloudflare worker/Durable Object path has no Commons service (`services.commons` absent there).
