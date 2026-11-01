# .phf sprint — stream A: core experience
1 November 2026 · Claude (assistant), session A · Status: **finished**, PR open, not merged.

## Base and head
- Base: `docs/phf-three-part-story` at `9b37df773e258900aa67750fb07251a97fdcdb55` (main `4c998e9` does not contain the plan).
- Branch: `feat/phf-core-demo`. UI commit `7d16803e6b04945f7e4dc627fb316809bcf9d880`; this report is the following commit.
- Clock: started 09:55, UI committed 10:08, handoff ~10:12 (local time). No slippage.

## Files changed (all within A's owned paths)
- `apps/commons/index.html` — title `.phf · Photo Frame Commons`, cool theme colour.
- `apps/commons/src/App.tsx` — .phf frame; legacy room views collapsed into a "Room workbench" toggle.
- `apps/commons/src/components/phf/PhfShell.tsx` (new) — header with **Presentation** link and **Voice** switch,
  entry state, service-unavailable state, journey guide, entrance tabs.
- `apps/commons/src/commons/client/journey.ts` (new) — presenter guide state in `localStorage["phf.journey.v1"]`
  (browser-only; never canonical) and the presentation URL.
- `apps/commons/src/components/commons/{CommonsFinder,CommonsHub,Record,Composer,ProblemPanel}.tsx`, `src/styles.css`,
  `src/vite-env.d.ts`, `README.md` (short .phf note on top).
- `apps/commons/scripts/smoke/browser.mjs` — one assertion adapted to the new passage block; new .phf checks.
No server contract, package/lockfile, corpus, root doc or other module changed.

## Observable behavior
1. **Entry.** “My Mac cannot see my frame.” with the dataset line *Photo Frame Commons · a real-source demonstration
   of .phf* and prototype participants. If the API is down: “The Commons service is not reachable.” with run commands
   and a way back to the presentation (checked against a dead backend).
2. **Find.** Large search field, three example queries. Each record hit shows **Applies to** (device), **When**
   (reported conditions), **Limit** (status note), one quoted source line with its author, why it matched (clamped),
   and community activity. Contribution hits show author, entrance and cited sources.
3. **Inspect.** The record names its two voices. Each evidence passage shows **Original words · source author** (quote,
   author, date, object, link to the original) separately from **Agent interpretation · agent:… · not reviewed**.
4. **Contribute.** **Respond to this passage** opens the composer with fields named for voice, source passage,
   what happened, circumstances, kind, how it was prepared and destination. **Preview what leaves** shows the server's
   exact record; **Submit to shared room** writes it to the local room. A panel then links the conversation and
   permalink and suggests the next step.
5. **Reply.** **Voice** in the header switches participant without leaving the page; the guide links the followed
   observation's thread. Replies and corrections attach without changing the original.
6. **Rediscover.** The guide links the cited repository object (documents by path, threads by id) and a search for
   the observation's words; both show the same observation with author, passage and conversation size.
The presenter guide (Find → Inspect → Contribute → Reply → Rediscover) is a hint bar, not activity data; **Reset guide**
clears only this browser's guide state. No content is seeded; demo text is typed by the presenter and should be
labelled as staged (the rehearsal used “[Demo, staged] …”).

## Checks run (this worktree, local)
| Check | Result |
| --- | --- |
| `npm run build` (typecheck app/server/worker + vite build) | pass (chunk-size warning only) |
| `npx vitest run` | first run: 1 failed / 196 passed (failure not captured, not reproduced); rerun: **197/197 passed**. `tools/local-pds` not installed here, so the PDS round-trip coverage was not exercised beyond what the suite ran. |
| `npm run index:check` | pass, byte-for-byte |
| `bash scripts/smoke/browser.sh` (Chromium, temp data, :8796/:5196) | **PASS** — CLI → browser repository → reply → passage response → search community line → .phf name → applicability → reload persistence → source/agent separation → journey guide → phone 375px with no horizontal scroll → CLI rediscovers browser contributions |
| Manual walkthrough (built-in browser, 1280px and 375px) | Kai searched the demo question against the real server, responded to passage e1 of `usb-c-no-data`, previewed, submitted, reloaded (still there), switched to Lea, replied in the thread, rediscovered it under `docs/pf1007l-start-here.md` in the repository view (“1 reply · 2 people”) and through search. |
| Keyboard | All controls are native links/buttons/inputs with visible focus; the journey was driven by focus + Enter/Tab in part. A full keyboard-only pass was not recorded. |
Not run: `scripts/smoke/e2e.sh`, `scripts/smoke/multi-entry.sh` (server-side; not touched), live MCP client, ATProto/PDS.

## Demo URL and start
```bash
cd apps/commons && npm ci
npm run dev:server     # API :8787
npm run dev            # UI :5173 → http://<demo-host>:5173/#/search?q=My%20Mac%20cannot%20see%20my%20frame
```
Back link defaults to `http://<same host>:8001/`; set `VITE_PHF_PRESENTATION_URL` for another presentation URL.
For a phone on the network, run Vite with `--host` (not done or verified here).

## Evidence
Smoke screenshots were written outside the repository (not committed): repository view, passage preview,
search, phone problem view. The PR description carries the textual smoke log.

## Limitations
- Prototype tokens are in memory: after an API restart, choose a participant again.
- “replies to contrib_…” still shows the parent id rather than the parent author.
- The guide's "done" marks are per browser and are not evidence of anything in the room.
- Example queries are fixed strings chosen to return real records; they are not usage data.
- Upstream names (br-ai-nstorm, Open Presence) remain in the footer, the workbench and technical identifiers.
