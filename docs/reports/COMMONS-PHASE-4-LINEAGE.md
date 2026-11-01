# Commons experience — Phase 4: inspect the mechanism on real material

1 November 2026 · Claude (assistant, `kind: assistant`) · Self-verified, **not reviewed**. Stops here for human review.
Plan: Phase 4 of [COMMONS-EXPERIENCE-BUILD-PLAN.md](../build/COMMONS-EXPERIENCE-BUILD-PLAN.md). Owner said "go on" after
Phase 3 ([report](COMMONS-PHASE-3-CONTRIBUTE.md)). Branch `feat/commons-phase-4-lineage`, stacked on
`feat/commons-phase-3-contribute` (PR #45, open), which is based on `main` 564f1d4.

## What the Commons actually holds, and what it does not
Before building, the available trace data was checked in the code and corpus:
- **Snapshot manifest** (`corpus/snapshots/001/manifest.json`): repository, revision and date, capture time, capture
  method, exclusions. Per thread or comment: author, creation time, permalink, sha256 of the object text. Per
  document: path, sha256 and URL, **but no author or authoring time**.
- **Source reference per passage**: object id, permalink, locator only for document line ranges, digest of the whole
  object, availability (`unavailable`: full text is not stored).
- **Record provenance**: record writer `agent:claude-opus-5-5`, unreviewed, Postack origin commit; per passage a role
  label, a short quote and the writer's reading.
- **Search**: the record-only index uses title, symptoms, aliases, device, environment and quotes. Readings are not
  indexed. A hit carries the matched terms per field.
- **Room projection** for contributions: entrance, declared assistance, actor, room, time, revision, citations,
  reply/correction references, ATProto origin and publication receipt.

Not held, and so never shown as known: document authors and times, passage locations inside comments and issues, the
full source text (so a quote cannot be re-checked here), whether a source changed after capture, and whether a declared
assistance level is true.

## Capability delivered
**How this reached you, per passage.** Every evidence passage on a record has **How this reached you**. It opens five
stages for that passage:
1. **Original source**: repository, object, author and time when recorded, a link to the original.
2. **Captured**: snapshot id and date, repository state, capture method, passage location when recorded, and the
   text fingerprint, labelled as covering the whole object and not the passage.
3. **Interpreted**: the record writer (named as not the source author), review state, the role label as the writer's,
   origin commit, the quote kept and the reading.
4. **In the record**: the record, the corrections and relations this passage supports (with their origin), and search:
   the quote is indexed, the reading is not. With a situation, it says whether this quote's words matched it, taken
   from the actual hit.
5. **Since, in this room**: contributions citing this exact passage or its whole source, each linked.

Each stage says **recorded**, **partly recorded** or **not recorded** in words, and lists what is **not known here**.
The two stages where "not recorded" would misread use their own words: **Since** shows "none yet" or "N contributions",
and **Published** shows "not published" or the receipt status. Nothing is filled in to complete the chain.

**How this got here, per contribution.** Every contribution card has **How this got here**:
- **Written**: entrance, and how it was prepared, marked as the author's unverified declaration.
- **Recorded here**: room, who it speaks as, time, revision. For contributions read from ATProto: the source
  repository and retrieval time.
- **Responds to**: cited passages, which link to that passage's trace on the record; cited sources; replies,
  corrections and supersessions.
- **Published**: "not published" (a separate step), or the receipt status. A queued receipt is not called published.

**Depth without losing the place.**
- One stage at a time, or **Show all stages as text**.
- The open passage, the stage and the situation live in the URL (`?q=…&trace=e3&stage=capture`), so they survive
  reload and can be shared. A shared trace link opens scrolled to its passage.
- Closing the trace keeps the situation.
- The step row is a list of buttons with text labels and `aria-current`, and the all-stages view is plain text. No
  diagram is needed to read it.

## Reused and changed contracts
- Reused: manifest and source resolution (`src/commons/source`), record provenance, `RECORD_WEIGHTS`, tokenizer,
  `SearchHit.matches`, evidence citations from the problem view, contribution projection, `Investigation.findHit`.
- `appLinks.problem(id, query?, trace?)` gains an optional trace; links without one are byte-identical to before. The
  router parses `trace` and `stage`, and ignores a stage without a passage.
- No server, corpus, index, API or CLI change. No new trace fields were added: everything shown already existed.

## Changed files (`apps/commons`)
- New: `src/commons/client/lineage.ts` (pure stage builders), `src/components/commons/Lineage.tsx`,
  `test/client/lineage.test.ts` (12 tests, against the real corpus).
- Changed: `contracts.ts`, `router.ts`, `Record.tsx`, `ProblemPanel.tsx`, `CommonsHub.tsx`, `ContributionCard.tsx`,
  `styles.css`, `styles/cloud-control.css`.

## Checks (actual results, branch head)
| Check | Result |
| --- | --- |
| `npm run typecheck` | pass |
| `npm test` | 242/242 (26 files) |
| `npm run index:check` | byte-identical |
| `npx vite build` | pass (existing chunk-size warning) |
| `bash scripts/smoke/browser.sh` | 3/3 pass |
| `bash scripts/smoke/e2e.sh`, `multi-entry.sh` | pass |
| `evidence/commons-phase-4/walkthrough.txt` (Playwright, 1440 and 390 px) | 35/35 |
| Phase 1, 2, 3 walkthroughs (regression) | 26/26, 35/35, 34/34 |
| `evidence/commons-phase-4/contrast-scan.txt` (one stage, all stages, contribution; dark and light) | 0 failures in the new views; 2 in dark from the existing "e" guide (below) |

The walkthrough checks, at both widths:
- opening a trace by keyboard puts the passage and situation in the URL, with `aria-expanded`;
- the source stage names the recorded author and links only to GitHub;
- the capture stage states the fingerprint scope and what is not known;
- a stage chosen by keyboard is marked current;
- reload keeps passage, stage and situation, and a shared trace link opens at its passage;
- all five stages read as text, and each shows facts or says what is not known;
- the record stage says whether the quote matched;
- a document passage says its author is not recorded;
- closing keeps the situation;
- a contribution's lineage shows entrance, room, responses and publication;
- its cited passage opens that passage's trace, whose "since" stage lists it as citing that exact passage;
- no horizontal scroll and no page errors.

The setup step adds one contribution to the temporary dev room, labelled "[Demo, staged]", so an exact-passage citation
exists to follow. It is not presented as community activity.

Contrast note: in dark, `e-pixel-name` (2.82:1) and `e-pixel-discover` (2.63:1) are below 4.5:1. They belong to the
"e" guide merged in #41 (`src/components/EGuide.tsx`, `e-pixel.css`), which this branch does not change. AGENTS.md
asks that the character's appearance be preserved, so it is reported rather than restyled here.

Not verified:
- screen reader announcement of stage changes (the detail region is `aria-live="polite"`);
- Safari and Firefox.

## Known limitations and trade-offs
- The trace opens inline under its passage at every width. The blueprint suggests alongside the reading on wide
  screens, but the right column holds the composer; moving it was out of scope.
- Opening a trace and changing stage replace the history entry, so the back button leaves the record rather than
  stepping through stages. This is deliberate, to avoid piling up entries, but it is a choice to review.
- A contribution's lineage stage is not kept in the URL; it is local to the card.
- "For your words" uses the hit's matched terms that occur in this quote. A term that also appears in another quote of
  the same record counts for both.
- The lineage stops at what the snapshot captured. No live check against GitHub is made.

## Next bounded slice (Phase 5, after review)
Validate and deepen: observed exploratory sessions with real people on the find → judge → contribute → rediscover loop,
recording where they hesitate, and targeted fixes. This needs willing participants and is not something an assistant
can complete alone.

No merge, deployment, public write, ATProto publication or review record was made.
