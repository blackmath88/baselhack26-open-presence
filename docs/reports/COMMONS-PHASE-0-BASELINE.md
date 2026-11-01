# Commons experience — Phase 0: baseline and first visual checkpoint

1 November 2026 · Claude (assistant, `kind: assistant`) · Self-verified, **not reviewed**. Stops here for human review.
Status update: owner chose dark default and delegated TanStack (decided below).
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
Reference: Cisco's public Cloud Control documentation screenshots, with approximate colour samples, recorded in
[COMMONS-CISCO-REFERENCE.md](../product/COMMONS-CISCO-REFERENCE.md). The images are linked, not committed (public repo,
Cisco's copyright). Also used: the blueprint §6 and the Start Kit design contract. No Cisco logo, icon, font or
product name is used; values are an interpretation, not Cisco's tokens.

Owner decision (1 November): **dark is the default.**

Changes (`apps/commons`):
- `src/styles/cloud-control.css` (new): one layer scoped to `:root[data-look="cloud"]`.
  - Dark tokens sampled from the reference: canvas #0C1117 with a faint violet lower-edge glow, raised panels #181D23,
    selected segment #31343B, borders #2B3038/#393B48, field border #707682, accent #729CEE.
  - Light counterpart from the blueprint. Spacing 4–48, radii 6/8/12, controls 40–52 px, body 16/24, metadata ≥ 13 px,
    motion 150 ms (removed under reduced motion).
  - Hierarchy: compact header on the canvas; entrances as outlined pills, the current one with the reference's
    blue-to-violet edge; presenter guide as the reference's segmented control; the situation question as the page
    heading; a prompt-style search field; outlined-accent primary actions; results as one raised panel with divided
    rows instead of stacked cards; evidence labels in sentence case, original words on a solid rule, agent
    interpretation on a dashed subtle surface.
  - Repository, thread, contribution preview, entry and room workbench are made legible on the same tokens; they are
    not redesigned.
- `src/main.tsx`: review switches read from the query string, never stored — `?theme=light` for the light counterpart,
  `?look=classic` for the previous look.
- `src/App.tsx`: entrance tabs render before the presenter guide (DOM order = visual order for keyboard users). No other
  component, route, contract or behaviour change.
- `scripts/smoke/browser.mjs`: one assertion waited for nothing and failed 1 of 3 runs; it now uses the script's own
  `until()` (same condition, fails on timeout).

Evidence in [`evidence/commons-phase-0/`](../../evidence/commons-phase-0/):
- `before-*`: main.
- `dark-*`: default, covering search, record, passage, focus, entry, repository, thread, preview and workbench.
- `light-*`: search and record, wide (1440) and narrow (390).
- `checks-*.json`: from `capture.cjs`.
- `contrast-scan-*.json`: from `tour.cjs`. Both scripts use Playwright with the system Chromium.

## Checks (actual results)
| Command (in `apps/commons`) | main `9e864a5` | this branch |
| --- | --- | --- |
| `npm run typecheck` | pass | pass |
| `npm test` (local PDS installed, 0 skipped) | 197/197 | 197/197 |
| `npm run index:check` | byte-identical | not affected (no corpus/index change) |
| `npx vite build` | pass (chunk-size warning) | pass (same warning) |
| `bash scripts/smoke/e2e.sh` | pass | not rerun (no server change) |
| `bash scripts/smoke/multi-entry.sh` | pass, **with a caveat below** | not rerun (no server/CLI change) |
| `bash scripts/smoke/browser.sh` | pass | 1 fail of 3 before the wait fix; 3/3 pass after; pass again on the dark default |
| `capture.cjs` journey checks | 11/12 | 11/12 dark, 11/12 light, 11/12 classic |
| `tour.cjs` full-page contrast scan (< 4.5:1) | — | 0 elements in entry, repository, thread, preview, workbench, dark and light |

`capture.cjs` checks:
- real search returns records;
- Tab moves to a visibly focused control (2 px focus ring);
- the passage keeps its original/agent labels and the GitHub source link;
- reload keeps the record route;
- no horizontal scroll at 360 px on search and record;
- reduced motion zeroes transitions.

The one failing check in every run, including main, is Chromium's automatic `/favicon.ico` request returning 404
(`index.html` declares no icon). It's cosmetic and left alone.

`tour.cjs` measures every visible text element against its rendered background. The first dark run found 16 elements
below 4.5:1, all workbench and thread labels with hard-coded greys; they were fixed by mapping them to the secondary
text token. Journey ratios, dark:
- headings 15.1–16.6
- secondary text 9.2–10.1
- outlined primary 8.2–9.5
- quotes 15.1
- agent interpretation 13.5

Multi-entry caveat: its "unreachable server → exit code" step printed `exit 0` because an unrelated Commons server from
another worktree was listening on 127.0.0.1:8797 on this machine. Run directly against a free port, the CLI exits **6**
as documented. The smoke assumes 8797 is free; it should pick a guaranteed-closed port (not changed here).

Not verified:
- a screen reader pass;
- Safari and Firefox;
- the map view's SVG in dark;
- the workbench's kind-colour dots are faint on dark tints (cosmetic).

## TanStack decision
Owner delegated the decision. **Decision: keep the current Vite + React shell; no TanStack migration now.**
- `blackmath88/development-practice` points to **Start Kit** for reusable implementation.
  [`blackmath88/start-kit`](https://github.com/blackmath88/start-kit) says "build brief ready; application not
  implemented": there is no runnable starter, package.json or lockfile to adopt.
- The one real TanStack app here, `sideprojects/pdf-lab/workbench` (Start 1.169.4, Router 1.170.46, Vite 8), is a
  static/client app without auth or API.
- Commons has a separate Node API (`/api`, `/mcp`), prototype session tokens and a CLI/MCP contract. TanStack **Start**
  would add SSR/server functions that duplicate that boundary, and a Vite major upgrade, for no user-visible gain in
  Phase 1.

Trigger to revisit: if Phase 1–2 URL state (query, selected record/passage, compare set) outgrows the small hash router,
adopt **TanStack Router alone** (client-side, hash history), keeping the Node API unchanged. That would be its own
reviewed change.

## Remaining open points
1. Header at 390 px wraps the Voice control to a second row; acceptable, or collapse Voice into a menu?
2. Keep the `?look=classic` switch until review ends, then delete it and the classic overrides?

## Next bounded slice (Phase 1, after approval)
Situation → real search → account → passage/source → **back to results with the query intact**: carry the query in the
record route (or history state), add a page header/breadcrumb on the record, render status (documented, agent-written,
not reviewed) as labelled badges, and add loading/empty/error states to the record. Browser test for search → record →
source → back, reload/deep link, keyboard-only and 360 px.

No merge, deployment, public write, Observstory proposal or review record was made.
