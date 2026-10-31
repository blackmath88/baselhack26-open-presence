# DEMO — Photo Frame Commons, many entrances (local only)

One shared Commons over the pinned Wes Bos photo-frame corpus, entered through **search**, the **repository
snapshot**, **direct links**, the **CLI** or **MCP**, and connected to **ATProto** for author-owned publication and
ingestion. Prototype demo sign-in; **never expose this server publicly.** Integrated on `main` through PR #11, including publication and moderation-read repairs (#13/#14).

## Install and run
```bash
cd apps/commons
npm ci
npm run dev:server      # API + MCP on 127.0.0.1:8787; first boot imports 18 records (idempotent later)
npm run dev             # UI on :5173 (proxies /api and /mcp to :8787), in a second terminal
```
Room data: `apps/commons/server/data/memory.json` (gitignored; override with `BRAINSTORM_DATA_FILE`).
Browser drafts: `localStorage["commons.drafts.v1"]` only.

### Optional: isolated ATProto network (disposable accounts, not public)
```bash
cd apps/commons/tools/local-pds && npm ci && cd ../..
npm run pds:dev         # boots a PDS + PLC in-process, creates alice.test / bob.test, prints COMMONS_* lines
```
Start the API with the printed variables so Kai publishes as `alice.test` and Lea as `bob.test`:
```bash
COMMONS_ATPROTO_ALLOWED_PDS=http://localhost:<pds-port> COMMONS_PLC_URL=http://localhost:<plc-port> \
COMMONS_ATPROTO_ACCOUNTS='{"person:kai":{"service":"http://localhost:<pds-port>","identifier":"alice.test","password":"alice-dev-pass"},"person:lea":{"service":"http://localhost:<pds-port>","identifier":"bob.test","password":"bob-dev-pass"}}' \
npm run dev:server
```
Without these variables every publication and sync operation reports "not configured" instead of pretending.
Other knobs: `COMMONS_ATPROTO_NAMESPACE` (default `test.openpresence.commons`, development-only),
`COMMONS_ATPROTO_FOLLOW` (comma-separated DIDs/handles synced at boot), `COMMONS_APP_URL` (links inside published records).

## Checks
```bash
cd apps/commons
npm run typecheck
npm test                         # 191 tests; the PDS round-trip suites skip visibly if tools/local-pds is not installed
npm run index:check              # record-only index reproduces byte for byte
npx vite build
bash scripts/smoke/e2e.sh        # first-slice smoke (submit, retry, restart, concurrent review)
bash scripts/smoke/multi-entry.sh # CLI entrance against a real server: search, browse, draft, submit, reply, thread, repository rediscovery, context, moderation, status
bash scripts/smoke/browser.sh     # CLI → browser → CLI: repository view, reply and passage response in Chromium, rediscovered by the CLI (needs Chromium; skips without)
```

## Three entrances, one Commons
**1. Repository → problem → contribution (UI).** Sign in as Kai. Click **Repository**: the pinned snapshot of
`wesbos/photo-frame-dashboard` at `0bff55ef3fb2` with what it covers and excludes. Open `docs/pf1007l-start-here.md`
or the thread `issue/148`: each lists the problem records that cite it. Follow one to `#/problems/<id>`: the
agent-written record (quotes vs. the record writer's reading, original authors, permalinks) and the conversation.
Write an experience → **Preview** (the server says exactly what will be recorded and where: local room, not GitHub,
not ATProto) → **Submit to shared room**. Reload: the URL still opens the same problem.

**2. Agent → MCP, person → CLI.** Point an MCP client at `http://localhost:8787/mcp` with a session token
(or run `BRAINSTORM_PARTICIPANT=Kai npm run mcp`). Tools: `commons_search`, `commons_browse_repository`,
`commons_get_problem`, `commons_get_contribution`, `commons_get_thread`, `commons_get_context`,
`commons_prepare_contribution`, `commons_submit_contribution`, `commons_moderate`, `commons_prepare_publication`,
`commons_publish_contribution`, `commons_get_publication`, `commons_sync_author`, `commons_resolve_external`,
`commons_status`. From a terminal, the same operations:
```bash
cd apps/commons && export BRAINSTORM_PARTICIPANT=Lea
npm run commons -- search "backup disk disappears on my Mac"
npm run commons -- browse --object issue/99
npm run commons -- inspect emmc-not-exposed
npm run commons -- draft --problem emmc-not-exposed --text "..." --kind attempt --ref issue/99     # validates, writes nothing
npm run commons -- submit --problem emmc-not-exposed --text "..." --kind attempt --ref issue/99 --command-id my-key-1
npm run commons -- submit ... --command-id my-key-1      # same key, same content → replayed, no duplicate; changed content → exit 3
npm run commons -- thread <contributionId> · context <id> --budget 4000 · status
```
Exit codes: 0 ok · 2 validation · 3 conflict · 4 forbidden/not ready · 5 not found · 6 server unreachable.
The contribution made here appears once in the UI (State view and Commons card), attributed to the session's
participant, and `commons_search` finds its distinctive words with author and source refs.

**Rediscovery from the repository.** Every contribution records the entrance that carried it (`browser`, `cli`,
`mcp`, `http`; ingested records are `atproto`; older records `unknown`) — declared by the adapter, never detected,
never authorization. A contribution's source refs feed back into the repository navigator: after
`submit … --ref issue/99`, `npm run commons -- browse --object issue/99` (and `commons_browse_repository`, and the
**Repository** view in the browser) lists it under the thread — and under the exact comment if it cited one — with
author, entrance and cited objects. `--threads issue --linked` now includes threads cited only by contributions.
Searching the cited object id (`npm run commons -- search issue/99`) finds it through a `source` match, and the
result shows source refs (permalink, original author) and entrance. The problem record closes the same loop from the other side: each
evidence item lists the contributions citing its source object (including those made in *other* problems whose
evidence cites the same issue or doc, flagged "in another problem"), with entrance and how far the conversation went
("1 reply · 2 people", linking to the thread). `inspect <problem>` / `commons_get_problem` return this as
`evidenceCitations`, and context packets list `citedBy` per evidence item. To cite one exact passage rather than the
whole source object, pass evidence ids (`submit … --evidence e2`, MCP/HTTP `evidenceIds`); the passage's object joins
`sourceRefs` and the citation attaches to that passage only. Participants appear under the display name the server
resolved at submission ("Kai"), on every entrance. In the browser, every evidence item has **Respond to this passage**:
the composer opens with that passage selected (passages are listed under each source and can be toggled), the
preview states the exact passages, and after submitting the citation appears under that passage only. Hidden or blocked contributions disappear from
the navigator like everywhere else; imported records are never changed. See
`evidence/cli-smoke-rediscovery-20261031.txt`, `evidence/browser-check-evidence-citations-20261031.txt` and `server/test/commons/cross-entrance-rediscovery.test.ts`.

**3. Community link and ATProto.** Any contribution has `#/contributions/<id>` and `#/threads/<id>`; opening one
restores the problem, highlights the contribution and shows the conversation with both voices. **Reply** and
**Correct** attach to a parent without touching it. With the isolated PDS configured, a participant's own card offers
**Publish publicly…**: preview the exact record and destination account, then **Publish exactly this record**. The
receipt moves `queued → published` with the `at://` URI and CID; a failed attempt is retryable and never duplicates.
Lea's reply publishes with a strong reference (URI + CID) to Kai's record. A second, fresh app instance can
`commons_sync_author alice.test` / `bob.test` and rebuild the same thread from the two repositories alone
(`server/test/commons/two-author-roundtrip.test.ts` does exactly this; `evidence/atproto-live-check.txt` shows the
records on the PDS).

## Real limitations
- Problem records are agent-written (`agent:claude-opus-5-5`) and not reviewed by a person; marked everywhere.
- Full source text is not committed; evidence shows short excerpts + permalink; the repository view is snapshot
  metadata, not a live GitHub browser.
- Ranking is lexical (BM25F) over records and contributions; not a confidence score.
- ATProto here is an **isolated development network** (`tools/local-pds`), a development-only namespace
  (`test.openpresence.commons`) and credential sessions for disposable accounts. No public account, no OAuth sign-in,
  no production NSID, no Bluesky feed visibility. Activation steps: `apps/commons/server/commons/atproto/README.md`.
- Publication receipts are transport state: `queued`/`failed` is not published. A `conflict` (different record at the
  key) is reported, never overwritten.
- Ingestion is bounded to allowlisted PDS endpoints and opted-in authors; completeness is never claimed beyond them.
- Moderation is local hide/unhide and block/unblock; it affects every projection here and nothing elsewhere.
- Prototype tokens are in-memory: after a server restart, browsers must pick a participant again.
- The Map view draws only same-room edges; the Cloudflare worker path has no Commons service; the JSON log is not fsync'd.
