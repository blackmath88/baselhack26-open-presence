# Commons experience — Phase 1: find and inspect, end to end

1 November 2026 · Claude (assistant, `kind: assistant`) · Self-verified, **not reviewed**. Stops here for human review.
Plan: Phase 1 of [COMMONS-EXPERIENCE-BUILD-PLAN.md](../build/COMMONS-EXPERIENCE-BUILD-PLAN.md). Owner said "continue" after
Phase 0 ([PHASE-0 report](COMMONS-PHASE-0-BASELINE.md)); branch `feat/commons-phase-1-find-inspect` is stacked on
`feat/commons-cisco-phase0` (PR #35).

## Capability delivered
Type the real situation → recognise an account → see why it may fit, what may differ and what is unknown → read the
passage and follow the original → go back to the same results, with the result you came from selected. Reload, browser
back and copied links keep that context.

On the record page, above the record:
- **Breadcrumb** "← Results for “My Mac cannot see my frame”" (or "← Search" without a situation).
- **Your situation** with Edit.
- **Why it may fit**: a regrouping of the hit's actual `SearchHit.matches` against the typed words:
  - each of your words and the fields it matched;
  - a word that matched only the record writer's added vocabulary is shown as such ("see");
  - words the search itself added ("data", "usb") are named.
- **Rank** with "not by confidence".
- **What may differ**: reported conditions, or the reader's own near-match flag with an explicit "not evidence of a fix for
  your setup" (verified on the built-in example "backup disk disappears on my Mac" → the Windows/WSL record).
- **Not known here**: the Commons has only your words; frame model, computer, cable and prior attempts are unknown; your
  words that matched nothing are listed.
- Record status as labelled badges: Problem record · documented · *Agent-written · not reviewed by a person*.
- States: loading keeps the context; a missing record says so (no pointless retry); other errors keep the context and offer
  **Try again**.
- Focus moves to the record heading after in-app navigation (not on fresh loads); the record opens at its top; going back
  focuses and scrolls to the result you came from.

Nothing is inferred beyond what retrieval returned. If the record is not among the results for your words, the panel says
so instead of explaining it.

## Reused and changed contracts
- Reused unchanged: reader/BM25F retrieval, `SearchHit`, corpus, server API, record/evidence components, auth gate.
- `appLinks.problem(id, query?)` and `appLinks.search(query, selected?)`: the new parameters are optional. Without them
  a link is byte-identical to before, so server outputs (search/problem links, publication URLs) are unchanged.
- Router: `#/problems/<id>?q=…` and `#/search?q=…&selected=<id>`; blank `q` is ignored. Private draft text never
  enters the URL; only the search words, which were already in the search URL.
- Result links now carry `?q=`. One existing smoke assertion compared the full href and now compares the path only.

## Changed files (`apps/commons`)
- `src/commons/contracts.ts`, `src/commons/client/router.ts`: optional context in links/routes; in-app navigation flag.
- `src/commons/client/matchBasis.ts` (new): pure regrouping of a hit's matches.
- `src/components/commons/Investigation.tsx` (new): breadcrumb, situation, fit/differ/unknown.
- `src/components/commons/ProblemPanel.tsx`: context in all states, not-found/error/retry, focus and scroll.
- `src/components/commons/Record.tsx`: status badges, focusable heading.
- `src/components/commons/CommonsFinder.tsx`, `CommonsHub.tsx`: links with the situation, selected result on return.
- `src/styles.css` (layout, works in `?look=classic`), `src/styles/cloud-control.css` (look).
- `test/client/find-inspect.test.ts` (new, 8 tests), `scripts/smoke/browser.mjs` (new step 0; one href comparison).

## Checks (actual results)
| Check | Result |
| --- | --- |
| `npm run typecheck` | pass |
| `npm test` | 205/205 (197 existing + 8 new) |
| `npm run index:check` | byte-identical |
| `npx vite build` | pass (existing chunk-size warning) |
| `bash scripts/smoke/browser.sh` | 3/3 pass, plus 2/2 after the last change. The new step is find → record with situation and fit/differ/unknown → breadcrumb back re-selects the result. |
| `bash scripts/smoke/e2e.sh` | pass |
| `bash scripts/smoke/multi-entry.sh` | pass, with the Phase 0 caveat: port 8797 is occupied on this machine |
| `evidence/commons-phase-1/walkthrough.txt` (Playwright, keyboard only, 1440 and 390 px) | 26/26 |
| `evidence/commons-phase-1/contrast-scan.txt` (situation, near-match, not-found, back-selected; dark and light) | 0 text elements below 4.5:1 |
| Phase 0 journey capture on this branch | 11/12; the pre-existing favicon 404 is unchanged |

The walkthrough checks:
- keyboard type + Enter + Tab + Enter opens the record;
- the result link carries the situation, and focus lands on the record heading;
- the breadcrumb and situation are correct, with fit/differ/unknown present;
- status badges;
- the original source opens GitHub in a new tab with `noopener`;
- no horizontal scroll;
- reload keeps the record and situation;
- the breadcrumb back keeps the query and focuses the selected result, and browser back returns to the results;
- a missing record gives a clear state with the way back and no retry;
- a canonical deep link shows no invented situation;
- no page errors.

Evidence screenshots: `p1-record-*`, `p1-back-*`, `p1-nearmatch-wide`, `p1-notfound-wide`.

Not verified: screen reader announcement of the focus move; Safari/Firefox; a slow-network loading state (loading is a
simple status line that keeps the context; not throttled in a test).

## Known limitations
- The result list still shows the raw "Why it matched" token line; the readable version appears on the record. Bringing a
  one-line readable summary into the list is a small Phase 2 candidate.
- "Ranked N" is the record-hit rank among the reader's top 20 for those words.
- Contribution deep links (`#/contributions/…`, `#/threads/…`) don't show the search context; they weren't reached from search.

## Next bounded slice (Phase 2, after review)
Compare two actual accounts side by side (conditions, attempts, outcome, limits; unknown stays "Unknown"), reachable
from results and from a near-match, with the readable match basis in the result list too.

No merge, deployment, public write, Observstory proposal or review record was made.
