# Commons Phase 0 — baseline and first visual checkpoint

1 November 2026 · Claude Code (assistant) · Coordinator self-check, not an independent review or human acceptance.
Brief: [COMMONS-CLAUDE-CODEX-HANDOFF.md](../build/COMMONS-CLAUDE-CODEX-HANDOFF.md) (PR #33). Phase 0 only; stop for human review.

## Scope delivered
One real journey, "My Mac cannot see my frame", restyled with a provisional Cisco Cloud Control-inspired token layer:
the search results and the record page they lead to. Nothing else changed visually. The room workbench (state, map,
timeline, curation), the composer, the repository entrance, the backend, the corpus and the CLI/MCP/HTTP contracts
are all untouched.

| Before → after | What changed |
|---|---|
| Results were separate cards with a two-line "Why it matched" that you could read in full only by hovering with a mouse | One list surface with fine dividers, labelled facts (applies to / when / limit), the original quote with its own label and author. **Why it matched** is now a real disclosure button (keyboard and touch), built from the ranking's structured output (`SearchHit.matches`: field, stemmed term, writer-added flag), followed by the rest of the recorded explanation verbatim. |
| The record page did not know which situation led there | A context bar with **Back to results**, **Your situation "…"** and a plain statement that the Commons knows only what you typed. Carried by an optional `?q=` on record links. |
| The record's status line was one uppercase kicker, so its statuses looked like decoration | Separate status labels (`documented`, `Agent-written · not reviewed by a person` in warning colour). They have square corners and no hover state, so they can't be mistaken for buttons. |
| "Respond to this passage" was a solid primary button on every passage | Secondary (outlined): reading comes first. The search button stays primary. |

## The traced journey (real corpus, nothing invented)
Searching "My Mac cannot see my frame" returns 8 problem records from the pinned snapshot. The top one is `usb-c-no-data`,
"The frame shows no USB data, or no power, on the computer". Passages: e3 @jethrojones "Update: it was the cable."
(issue 12 comment); e5 @mikestecker "…USB-C to USB-C cable direct to the Mac gave no power and no USB data at all"
(issue/38); e2, the maintainer's correction "a reliable starting point, rather than proof". The query is
expanded with `macos, usb, disk, data`, and every explanation says so. No hit is a near-match for this query.

## Contract changes
- `appLinks.problem(problemId, query?)`: the optional second argument appends `?q=`. All existing callers (server
  projections, publication URLs, MCP links) are unchanged and still produce `#/problems/<id>`.
- `Route` `problem` gets an optional `query`. Old deep links parse exactly as before (`test/client/router.test.ts`).
- `scripts/smoke/browser.mjs`: two selectors now compare the link path without `?q=`. The assertion is otherwise the same.

## Tokens (provisional, our values, not Cisco's)
From blueprint §6: canvas `#F5F7FA`, surface `#FFF`, subtle `#EEF2F6`, text `#17212B`, secondary `#526170`,
divider `#D7DEE6`, accent `#146BD1`, focus `#005FCC`, warning `#8A5700`, success `#18734A`; spacing 4–48 px;
radii 4/8/12 px; motion 150 ms (off under reduced motion). File: `apps/commons/src/commons-tokens.css`, scoped to
`.commons-hub`.

**Open:** the in-repo PDF workbench uses a different "Cisco-inspired" accent, teal `#087E8B`
(`sideprojects/pdf-lab/WORKBENCH-BUILD.md`). I chose blueprint blue for Commons provisionally. One shared accent
needs a human decision, ideally against an actual Cisco Cloud Control screenshot (none was available here).

## Checks (Node 22.23.4, npm 10.9.9, Chromium 1243 via Playwright)
| Check | Baseline `b265422` | After |
|---|---|---|
| `npm run typecheck` | pass | pass |
| `npm test` | 19 files, 197 pass | 20 files, 199 pass (+2 router) |
| `npm run index:check` | byte-identical | byte-identical |
| `npx vite build` | pass (chunk-size warning) | pass (same warning) |
| `scripts/smoke/e2e.sh` | pass | pass |
| `scripts/smoke/multi-entry.sh` | pass | pass |
| `scripts/smoke/browser.sh` | PASS | PASS (`evidence/commons-phase0-20261101/browser-smoke-after.txt`) |

Journey checks in `capture-after.cjs`, both 1440×1000 and 360×800 (the narrow pass runs with `prefers-reduced-motion: reduce`):
- Typing the situation and pressing Enter shows results. On a result link, Tab reaches **Why it matched** and Enter
  sets `aria-expanded=true`. The focus ring is a 2 px `#005FCC` outline.
- Record URL `#/problems/usb-c-no-data?q=…`. Reload keeps the situation. **Back to results** returns to the
  same 8 hits, and two browser-back steps do too. An old link without `q` shows "Search" and no situation.
- No horizontal scroll (scrollWidth equals innerWidth at 360 px). No page JavaScript errors.
- Rendered contrast measured from computed styles on their actual backgrounds: body and titles 15.6–16.3:1; secondary
  text 5.9–6.4:1; links and disclosure 7.45:1; status labels 5.5–5.7:1; primary button 5.18:1. All pass WCAG AA for
  normal text.

## Not verified / limitations
- **Two test suites didn't really run.** The two ATProto test suites "pass" by returning early because `tools/local-pds` isn't installed,
  so roughly 9 of the counted tests checked nothing. This applies to both columns above.
- **Not checked:** screen readers, touch devices, browsers other than Chromium, Windows high-contrast mode, and the deployed
  Cloudflare Worker.
- **Raw Markdown in quotes.** Some captured quotes contain Markdown (`**no power and no data**`), shown verbatim as before.
  Whether to render emphasis in source quotes is a product decision about verbatim fidelity.
- **The `see` search word.** "see" is a search word the record writer added for `usb-c-no-data`, so it shows up under
  "search words — added by the record writer". That is accurate, and shows the writer's vocabulary is now visible to
  readers.
- **No Cisco reference.** No Cisco Cloud Control screen was inspected. Visual fidelity to it is not established.
- **The development-practice starter wasn't inspected.** `blackmath88/development-practice` couldn't be read from this session (private, and the request to attach it
  was declined), so the "actual starter" is unknown.

## TanStack assessment
The only TanStack app I could inspect is `sideprojects/pdf-lab/workbench`: TanStack Start 1.169.4, Router
1.170.46, Vite 8, React 19.3. Commons runs on Vite 7 and React 19.1, with a hash router and a Cloudflare Worker that serves the SPA plus
`/api` and `/mcp`. Its links and back behaviour already pass in the browser. **Recommendation: keep the current stack for Phase 1.** If you want
alignment, a later bounded step would move only the client routes to TanStack Router (with no server rendering and no
server functions), after the starter itself has been inspected.

## Next bounded slice (proposal)
Phase 1 per the build plan: search → account → passage/source → back, carrying the situation into the record page's
passages. Also deal with the Markdown-in-quote question and pick one accent. Waits for human review of these screens.
