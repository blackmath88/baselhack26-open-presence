# DEMO — Photo Frame Commons on br-ai-nstorm (local only)

Local shared room for the find → inspect → contribute → rediscover loop over the pinned
Wes Bos photo-frame corpus. Prototype demo sign-in; **never expose this server publicly.**

## Install and run
```bash
cd apps/commons
npm ci
npm run dev:server      # API on :8787; first boot imports 18 records (idempotent on later boots)
npm run dev             # UI on :5173 (proxies /api to :8787), in a second terminal
```
Room data: `apps/commons/server/data/memory.json` (gitignored; override with `BRAINSTORM_DATA_FILE`).
Browser drafts: `localStorage["commons.drafts.v1"]` only.

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
6. Curation: imported relations show as unreviewed proposals by `postack-agent`; a participant can accept/reject.
7. Stop and restart `npm run dev:server`: state is rediscovered; reimport appends 0 events.

## Real limitations
- Problem records are agent-written (`agent:claude-opus-5-5`) and not reviewed by a person; marked in the UI.
- Full source text is not committed; evidence shows short excerpts + permalink only.
- Search explanations are verbose BM25F field lists; ranking is not a confidence score.
- Prototype tokens are in-memory: after a server restart, browsers must pick a participant again.
- Cross-room relation proposals (record → record) are listed in Curation; the Map view draws only same-room edges.
- The UI cannot yet tell a replayed (idempotent) submit from a first submit; the server never duplicates either way.
- Cloudflare worker/Durable Object path has no Commons service (`services.commons` absent there).
