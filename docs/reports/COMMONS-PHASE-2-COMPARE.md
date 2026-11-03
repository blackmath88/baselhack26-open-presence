# Commons experience — Phase 2: understand a consequential difference

1 November 2026 · Claude (assistant, `kind: assistant`) · Self-verified, **not reviewed**. Stops here for human review.
Plan: Phase 2 of [COMMONS-EXPERIENCE-BUILD-PLAN.md](../build/COMMONS-EXPERIENCE-BUILD-PLAN.md). Owner said "go" after
Phase 1 ([report](COMMONS-PHASE-1-FIND-INSPECT.md)). Branch `feat/commons-phase-2-compare`, stacked on
`feat/commons-phase-1-find-inspect` (PR #36) ← `feat/commons-cisco-phase0` (PR #35).

## Capability delivered
**Compare two actual accounts.** From the results, choose two with **Compare**, or follow **Compare with “…”** on a
record. The comparison page aligns what each record states:
- applies to, reported conditions, symptoms, reported outcomes (with each record's scope and which reports said it
  worked), status and limit, corrections;
- evidence passages by role, with links to the originals on GitHub;
- who wrote the record;
- with a situation, how each fits your words.

Above the table, three answers:
- **Stated in both**: items with the same wording in both records (equal or contained, e.g. "PF1007L" in
  "PF1007L (Allwinner A33)").
- **Stated differently**: fields both records state with nothing in common. Also the near-match warning, and any
  relationship a record itself declares about the other, labelled by origin (stated in the source, or proposed by the
  record writer and unreviewed).
- **Not known here**: whether either applies to your setup, and fields one record does not state.

Unstated fields read **Not stated**; nothing is inferred. The page says "Similar symptoms do not establish a shared cause
or a shared fix".

Verified example, the Mac query's results #2 and #3:
- Both state PF1007L (Allwinner A33) and Route U.
- Both state symptoms and outcomes with nothing in common.
- Record A's own source says "the maintainer separates resets with and without ums".

That is the "similar symptom, different next step" the plan asks to make visible.

**Readable match line in the results.** "Why it matched" now reads, for example: *Your words found: “Mac”, “frame” · only in the
record writer’s vocabulary: “see” · added by the search: “data”, “usb” · not found: “cannot”*. A near-match is marked. The
raw retrieval explanation stays one click away under **Match trace**. Words are shown as written ("macOS"), not as
indexed ("maco").

**Selection behaviour.**
- The two chosen records live in the URL (`&compare=a,b`), so the choice survives reload. Choosing replaces the
  history entry instead of piling up entries.
- A third choice is disabled until one is removed.
- On the comparison, either side can be changed from a list of the same results, or removed. Removing returns to
  the results with the other still chosen.
- The breadcrumb returns to the results with both still chosen, and browser back works.
- A missing record in a comparison is stated, with the way back.

## Reused and changed contracts
- Reused: reader, `ImportedProblem` fields, `SearchHit.matches`/`nearMatch`, record `related` with origin, Phase 1 context.
- `appLinks.search(query, selected?, compare?)` and new `appLinks.compare(a, b, query?)`; router views `search.compare`
  (max two distinct) and `compare` (a ≠ b). Optional parameters, so existing links are unchanged.
- `matchBasis` terms now carry `word` (the written form) next to `term` (indexed form).
- No server, corpus, index or API change.

## Changed files (`apps/commons`)
- New: `src/commons/client/comparison.ts` (pure alignment), `src/components/commons/Compare.tsx`,
  `src/components/commons/MatchSummary.tsx`, `test/client/compare.test.ts` (9 tests).
- Changed: `contracts.ts`, `router.ts`, `matchBasis.ts`, `CommonsFinder.tsx` (match line, Compare toggles, comparison bar, trace),
  `CommonsHub.tsx`, `Investigation.tsx` (compare link, written words), `PhfShell.tsx` (compare = Search tab, Inspect
  step), `styles.css`, `styles/cloud-control.css`, `test/client/find-inspect.test.ts` (+1), `scripts/smoke/browser.mjs`
  (step 0b).

## Checks (actual results)
| Check | Result |
| --- | --- |
| `npm run typecheck` | pass |
| `npm test` | 215/215 (21 files; 18 client tests in total) |
| `npm run index:check` | byte-identical |
| `npx vite build` | pass (existing chunk-size warning) |
| `bash scripts/smoke/browser.sh` | 3/3 pass; new step 0b chooses two results, opens the comparison, checks the three answers and originals on both sides |
| `bash scripts/smoke/e2e.sh`, `multi-entry.sh` | pass (multi-entry with the known port-8797 caveat) |
| `evidence/commons-phase-2/walkthrough.txt` (Playwright, 1440 and 390 px) | 34/34 at Phase 2; 35/35 re-run in Phase 3 after the stale-response check gained a server-checked precondition (see the Phase 3 report) |
| Phase 1 walkthrough (regression) | 26/26 |
| `evidence/commons-phase-2/contrast-scan.txt` (compare, chosen results, missing record, record with compare link; dark and light) | 0 text elements below 4.5:1 |

The walkthrough checks:
- the readable match line, and that the raw trace is reachable;
- choosing two results by keyboard, with the choice in the URL; the third choice is disabled; reload keeps the choice;
- opening the comparison by keyboard;
- one shared circumstance, one difference and one unknown;
- declared relationships labelled by origin; "Not stated" fields;
- original sources reachable from both sides;
- no horizontal scroll;
- changing B keeps A; removing A keeps B chosen; browser back returns to the comparison;
- a record offers a comparison with the top result;
- a missing record is stated; no page errors;
- stale responses. The test delays the older query's server response so it arrives after the newer query, and checks
  that it does not replace the newer results. A control run shows the older query does produce visible contributions
  when not delayed.

Not verified:
- screen reader reading of the stacked table on phones (narrow layout uses `display: block` on table elements, which
  can drop table semantics in some browsers; each value keeps its A/B label);
- Safari and Firefox.

## Known limitations
- "Stated in both" uses wording overlap, which is deliberately conservative: equivalent facts worded differently are not
  merged, and "macOS automount" vs "macOS, Linux, Windows hosts" does not count as common.
- Comparison covers imported problem records, not participant contributions.
- The Change list offers the same results (or all 18 records when there is no situation).

## Next bounded slice (Phase 3, after review)
Contribute and rediscover: write a small observation tied to a record or passage, preview the exact disclosure, submit to
the existing shared room, and find it again with honest visibility. Reuses the existing composer, validation and
submission; focus on clearer destination/preview and draft/error behaviour.

No merge, deployment, public write, Observstory proposal or review record was made.
