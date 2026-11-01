# Commons experience — Phase 3: contribute and rediscover

1 November 2026 · Claude (assistant, `kind: assistant`) · Self-verified, **not reviewed**. Stops here for human review.
Plan: Phase 3 of [COMMONS-EXPERIENCE-BUILD-PLAN.md](../build/COMMONS-EXPERIENCE-BUILD-PLAN.md). Owner said "go" after
Phase 2 ([report](COMMONS-PHASE-2-COMPARE.md)). Branch `feat/commons-phase-3-contribute`, based on `main` at 564f1d4
(after the owner merged PRs #35, #36 and #37, plus #43 and #44).

## What already worked, and was kept
The composer, private browser drafts, server-side `prepare`, validation, permissions, moderation, the shared-room submit
with draft-id idempotency, reply/correction/passage responses and the "Recorded" panel all existed before this phase.
None of it was reimplemented. No server, corpus, index, API or CLI change.

## Capability delivered
**Review before submitting.** "Preview what leaves" now opens a review step built from the server's prepared command:
- where it goes: the local shared room, its room id, and that ATProto publication is a separate later step;
- who it speaks as (the server records the signed-in participant);
- the exact words, circumstances, kind and how it was prepared;
- what it cites, with exact passages and their roles;
- what it responds to, for replies and corrections;
- **what stays in this browser**: your search words (when you came from a search), your other drafts, history and chat.
  Search words and other drafts are listed only after checking that the outgoing body does not contain them. If you
  typed your search words into the draft yourself, the review does not claim they stay private.

**The request is the preview.** Submit sends the server's prepared command unchanged, with the draft id as
idempotency key and `entrance: browser` (the same pattern the CLI already uses). Before, the browser rebuilt the body
from form state. If the draft changes after a preview, the preview is marked stale and submit is disabled until it is
previewed again. Before, the preview silently disappeared.

**Failure keeps the text.**
- A network failure keeps the text and offers **Try again** with the same draft id, so a retry cannot duplicate.
- A rejection by the room (4xx) keeps the text, shows the room's reason and offers no blind retry.
- A conflict (the same draft was already recorded with other words, for example after a lost response) is explained
  in plain words.

**The confirmation is read back from the room.** After submit, the panel fetches the contribution from the server
instead of echoing the form: id, revision and time, who it speaks as (confirmed by the server), words, citations,
who can see it, and publication status. A withheld contribution or a failed read-back is stated. "Already recorded
earlier; no duplicate was created" appears on a replay. The duplicate "Recorded…" banner in the composer was removed.

**Find it again.** The confirmation offers a search for its first words, the conversation, the permalink, the record,
and the terminal command `npm run commons -- inspect <id>`.

## Changed files
- New: `apps/commons/src/commons/client/outgoing.ts` (outgoing body and "stays in this browser" list),
  `apps/commons/test/client/contribute.test.ts` (5 tests).
- Changed: `Composer.tsx` (review step, stale preview, submit sends the previewed command, retry, error wording),
  `ProblemPanel.tsx` (passes the situation, read-back confirmation, rediscovery links, `rediscoveryWords`),
  `styles.css`, `styles/cloud-control.css`.
- `scripts/smoke/browser.mjs`: two assertions follow the new preview wording ("reply to …", "exact passage …"); the
  checks themselves are unchanged.
- Evidence: `evidence/commons-phase-3/`. Phase 2 regression evidence updated (below).

## Checks (actual results, branch head rebased on main 564f1d4)
| Check | Result |
| --- | --- |
| `npm run typecheck` | pass |
| `npm test` | 230/230 (25 files, including the tests main gained from #43) |
| `npm run index:check` | byte-identical |
| `npx vite build` | pass (existing chunk-size warning) |
| `bash scripts/smoke/browser.sh` | 3/3 pass |
| `bash scripts/smoke/e2e.sh`, `multi-entry.sh` | pass (multi-entry with the known port-8797 caveat) |
| `evidence/commons-phase-3/walkthrough.txt` (Playwright, 1440 and 390 px, local dev room) | 34/34 |
| `evidence/commons-phase-3/cli-rediscovery.txt` | Kai's CLI `inspect` returns Lea's contribution, entrance browser, unpublished |
| `evidence/commons-phase-3/contrast-scan.txt` (review, stale review, confirmation; dark and light) | 0 text elements below 4.5:1 |
| Phase 1 walkthrough (regression) | 26/26 |
| Phase 2 walkthrough (regression) | 35/35, see note |

The walkthrough checks, at both widths:
- the review names destination, voice and exact words, and says the search words and another draft stay here;
- a changed draft marks the preview stale and blocks submit; undoing the change makes it current;
- a 403 from the room keeps the text, shows the reason, offers no retry;
- an aborted request keeps the text; **the intercepted request body equals the previewed command** field for field and
  contains neither the search words nor the other draft;
- Try again (by keyboard) reuses the same draft id; the server holds exactly one contribution with those words;
- the confirmation is read back (server-confirmed actor, not published);
- the submitted draft is removed from the browser, the other draft is kept;
- "Search for …" finds it; no horizontal scroll; no page errors;
- a second participant (Kai, separate session) finds it by search and opens its permalink, attributed to Lea.

Note on the Phase 2 regression: its stale-response check used the query "zzqx nothing here" as a newer query with no
contributions. Contributions created in the dev room during this phase made that query match people's text, so the
check failed on data, not on behaviour. The check now uses a nonsense-only query and first verifies against the
server that it has no contributions; it passes. Script and output in `evidence/commons-phase-2/`.

Not verified:
- screen reader announcement of the review and confirmation;
- Safari and Firefox;
- a real shared deployment: "second participant" means a second signed-in session against the same local server.

## Known limitations
- Destination is the local shared room only. ATProto publication stays the separate existing step; no public write
  was made.
- "Stays in this browser" lists what the Commons itself holds locally. It cannot know about anything outside the app.
- Rediscovery search uses the first six words; a contribution with very common opening words may rank below others.
- The 409 explanation covers the case where an earlier attempt was recorded and the draft then changed; the user must
  remove the draft to start again. There is no "show me the earlier one" link yet.
- The review lives in the composer column; on wide screens it is long. A side-by-side "draft | what leaves" layout was
  not tried.

## Next bounded slice (Phase 4, after review)
Inspect the mechanism on real material: follow an account from source to captured passage to interpretation, and a
contribution to its actual destination, with every stage pointing at real evidence or saying "not recorded".

No merge, deployment, public write, ATProto publication or review record was made. The dev room used for these checks
is a temporary file outside the repository.
