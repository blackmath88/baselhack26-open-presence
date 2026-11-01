# Commons experience — Phase 0: baseline and first visual checkpoint

1 November 2026 · Claude (assistant, `kind: assistant`) · Self-verified, **not reviewed**. Stops here for human review.
Brief: [COMMONS-CLAUDE-CODEX-HANDOFF.md](../build/COMMONS-CLAUDE-CODEX-HANDOFF.md), Phase 0 of
[COMMONS-EXPERIENCE-BUILD-PLAN.md](../build/COMMONS-EXPERIENCE-BUILD-PLAN.md).

## Base and scope
- Base: `main` at `9e864a5f012856546f10ce8303487390c93d5fcb` (contains PR #33). Branch `feat/commons-cisco-phase0`, own worktree.
- Delivered: verified baseline of `apps/commons`, one Cisco Cloud Control-inspired visual layer applied to the real
  search → result → record → passage journey, before/after evidence, and a TanStack evaluation.
- Not done (by design): Phase 1+ structure (back-to-results, page headers, match explanations), framework migration,
  backend, corpus, contracts, routes.

## What exists today (reusable, unchanged)
| Area | Current implementation |
| --- | --- |
| Shell | React 19 + Vite 7 SPA, hash routes (`src/commons/client/router.ts`): `#/search?q=`, `#/problems/<id>`, `#/contributions/<id>`, `#/threads/<id>`, `#/repo[/path][?object=]`. Reload/back work. |
| Find | `CommonsFinder`: records searched in the browser over the committed record-only index (BM25-style, lexical); contributions searched on the server. Applies-to / When / Limit, one quoted line with author, "Why it matched", community line, coverage line. |
| Inspect | `ProblemPanel` + `Record`: kicker states agent-written/unreviewed; facts; each passage separates **Original words · source author** (quote, author, date, object, GitHub permalink) from **Agent interpretation · not reviewed**. |
| Contribute / reply / rediscover | `Composer` (preview → submit to local shared room), `ContributionCard`, `ThreadView`, `RepoNavigator`; idempotent submission (`command-id`), moderation, ATProto publication (not configured by default → reports "not configured"). |
| Entrances | Browser search, repository, direct links, CLI (`npm run commons`), MCP (`/mcp`, `npm run mcp`). |
| Service | Node HTTP API (`server/http`), prototype session auth, JSON room file; corpus of 18 records over a pinned snapshot of `wesbos/photo-frame-dashboard`. |
| Room workbench | State / Map / Timeline / Curation behind a toggle; untouched. |

## Trace: "My Mac cannot see my frame" (real, unmodified data)
`#/search?q=My%20Mac%20cannot%20see%20my%20frame` → 8 record hits. Top hit **usb-c-no-data**, "The frame shows no USB
data, or no power, on the computer" (Applies to PF1007L, DPF ZC002 (Frameo), other USB-C-only frames; When T3 USB data
test · any host). Second: the U-Boot disk-vanishing record (macOS automount). Opening the top hit, passage **e1**:
> Original words · source author — “A USB-C to USB-C cable gave unit C **no power and no data**.” — author unknown ·
> `doc/docs/pf1007l-start-here.md` · original ↗ (full conversation not stored here)
>
> Agent interpretation · agent record writer · not reviewed — “The frame appears to lack the USB-C CC pull-downs, so use a
> USB-A to USB-C data cable.”

Observed gaps for later phases (not fixed here): the record page does not carry the query, so there is no "back to
results" with your situation (Phase 1); "Why it matched" is a real but raw field-token dump such as
`aliases: see (writer-added vocabulary); quote: mac; …` (clamped to one line now; a readable rendering of the actual match
basis is Phase 2); the top hit matches mostly on vocabulary aliases, which a newcomer cannot judge today.

## Visual checkpoint
Sources for the direction: blueprint §6 tokens, and the design contract in
[blackmath88/start-kit `docs/DESIGN.md`](https://github.com/blackmath88/start-kit/blob/main/docs/DESIGN.md) (written from
the owner's "Cisco Cloud Control: Design Teardown"). **No Cisco screenshot, asset, font or measured token was available
or used**; all values are proposed starting tokens.

Changes (`apps/commons`):
- `src/styles/cloud-control.css` (new): one scoped layer under `:root[data-look="cloud"]`. Light tokens from the blueprint
  (canvas #F5F7FA, surface #FFF, text #17212B / #526170, border #D7DEE6, accent #146BD1, focus #005FCC); dark tokens from
  the Start Kit (canvas #0D1218 … accent #86AAFF). Spacing 4–48, radii 6/8/12, controls 40–44 px, body 16/24, metadata
  ≥ 13 px, page headings 28/36, motion 150 ms (removed under reduced motion).
  Hierarchy: compact full-width header (identity left, Presentation and Voice right); entrances as a tab bar under it;
  presenter guide demoted to a quiet strip; the situation question as the page heading; results as one divided inventory
  panel with accent selection/focus instead of stacked cards; evidence labels in sentence case, original words on a
  solid rule, agent interpretation on a dashed subtle surface.
- `src/main.tsx`: review switches read from the query string, never stored — `?look=classic` restores the previous look,
  `?theme=dark` previews the dark palette. Default is the new light look.
- `src/App.tsx`: entrance tabs now render before the presenter guide (DOM order = visual order, so keyboard order stays
  logical). No other component, route, contract or behaviour change.
- `scripts/smoke/browser.mjs`: one assertion waited for nothing and failed 1 of 3 runs; it now uses the script's own
  `until()` (same condition, fails on timeout).

Evidence in [`evidence/commons-phase-0/`](../../evidence/commons-phase-0/): `before-*` (main), `after-*` (this branch,
light), `dark-*`, at 1440×1000 and 390×844; `checks-*.json` from `capture.cjs` (Playwright + system Chromium).

## Checks (actual results)
| Command (in `apps/commons`) | main `9e864a5` | this branch |
| --- | --- | --- |
| `npm run typecheck` | pass | pass |
| `npm test` (local PDS installed, 0 skipped) | 197/197 | 197/197 |
| `npm run index:check` | byte-identical | not affected (no corpus/index change) |
| `npx vite build` | pass (chunk-size warning) | pass (same warning) |
| `bash scripts/smoke/e2e.sh` | pass | not rerun (no server change) |
| `bash scripts/smoke/multi-entry.sh` | pass, **with a caveat below** | not rerun (no server/CLI change) |
| `bash scripts/smoke/browser.sh` | pass | 1 fail of 3 before the wait fix; 3/3 pass after |
| `capture.cjs` journey checks | 11/12 | 11/12 light, 11/12 dark, 11/12 classic |

`capture.cjs` checks: real search returns records; Tab moves to a visibly focused control (2 px #005FCC); passage keeps
original/agent labels and the GitHub source link; reload keeps the record route; no horizontal scroll at 360 px on search
and record; reduced motion zeroes transitions. The one failing check in every run, including main: Chromium's automatic
`/favicon.ico` request returns 404 (`index.html` declares no icon). Pre-existing, cosmetic, left alone.

Measured text contrast (WCAG ratio, computed in the page against the rendered background), light / dark:
body heading 15.2–16.3 / 15.1–16.6; secondary text 13 px 5.9–6.4 / 9.2–10.1; primary button 5.2 (white on #146BD1) / 8.2;
badge 5.7 / 8.2; quote 16.3 / 15.1; agent interpretation 14.5 / 13.5; voice tag 6.4 / 9.2. All ≥ 4.5:1 at the sizes used.
Previous look for reference: secondary 5.8, badge 5.8 at 11 px.

Multi-entry caveat: its "unreachable server → exit code" step printed `exit 0` because an unrelated Commons server from
another worktree was listening on 127.0.0.1:8797 on this machine. Run directly against a free port, the CLI exits **6**
as documented. The smoke assumes 8797 is free; it should pick a guaranteed-closed port (not changed here).

Not verified: screen reader pass; Safari/Firefox; the full contribute → reply → rediscover journey visually in the new
look (covered functionally by the browser smoke, which now runs in the new look by default); room workbench and
repository views were not reviewed visually (they inherit the tokens through the existing variables); dark theme
outside the find/inspect journey.

## TanStack evaluation
- `blackmath88/development-practice` points to **Start Kit** for reusable implementation.
  [`blackmath88/start-kit`](https://github.com/blackmath88/start-kit) states: "build brief ready; application not
  implemented" — there is no runnable starter, package.json or lockfile to migrate onto. Its useful part today is the
  design contract, used above.
- The one real TanStack app in this repo is `sideprojects/pdf-lab/workbench` (TanStack Start 1.169.4, Router 1.170.46,
  React 19.3.1, Vite 8.3.5). It is a static/client app with file routes and validated search params, no auth or API.
- Commons constraints: Vite 7 + React 19.1 SPA; hash routes; a separate Node API (`/api`, `/mcp`) with prototype session
  tokens in `localStorage`; Cloudflare Worker variant for upstream. Adopting TanStack **Start** would bring SSR/server
  functions that duplicate the existing API and auth boundary, plus a Vite major upgrade.

Recommendation: **retain the current shell for Phase 1.** If typed, validated URL state (query, selected record/passage,
compare set) becomes painful in Phase 1–2, adopt **TanStack Router only** (client-side, hash history) as a bounded
change, keeping the Node API as is. Revisit Start only after Start Kit exists and a server-rendering need appears.
Decision belongs to the owner.

## Open decisions for review
1. Direction: is this light interpretation the right Cloud Control reading, or should Commons default to dark (as the
   Start Kit palette implies)? A real Cisco screenshot/theme would let tokens be judged against the reference.
2. Header at 390 px wraps the Voice control to a second row; acceptable, or collapse Voice into a menu?
3. Keep the `?look=classic` switch until review ends, then delete the classic overrides?
4. TanStack: agree to "retain now, Router-only later if needed"?

## Next bounded slice (Phase 1, after approval)
Situation → real search → account → passage/source → **back to results with the query intact**: carry the query in the
record route (or history state), add a page header/breadcrumb on the record, render status (documented, agent-written,
not reviewed) as labelled badges, and add loading/empty/error states to the record. Browser test for search → record →
source → back, reload/deep link, keyboard-only and 360 px.

No merge, deployment, public write, Observstory proposal or review record was made.
