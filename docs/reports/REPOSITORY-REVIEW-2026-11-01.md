# Repository review — 1 November 2026
Author: ChatGPT / Codex (assistant). Scope: yesterday's Open Presence, Observatory and Knowledge Lab work. Merge and branch cleanup explicitly requested by Achim in this conversation. Checks below are coordinator/self-review, not an independent review or human acceptance of the project proposals.

## Result
**13 of yesterday's PRs merged (10 implementation/fix PRs and 3 execution handoffs), 36 merged branches deleted, four fresh local app screenshots captured.**

| Repository | Merged PRs | Branches deleted | Kept |
|---|---|---:|---|
| blackmath88/baselhack26-open-presence | #15, #16, #17, #18, #19 | 17 | main |
| blackmath88/observstory | #20, #23, #24, #25, #26 | 12 | main; design/observatory-pixel-studies; docs/project-knowledge-concept; feat/system-map-v0 |
| blackmath88/baselhack26-knowledge-lab | #1, #3, #4 | 7 | main |

The report/handoff PR itself is additional to these 13. Unmerged study/planning branches were preserved. Branch deletion checked current exact heads, open PR dependencies, and either Git ancestry or an exact head of a PR already squash-merged to main. One-shot cleanup workflows are removed after completion.

## What is on main

### Photo Frame Commons — Open Presence / apps/commons
Search, repository navigation, browser, CLI and MCP share the contribution model. Repository objects now expose the contributions that cite them. People can respond to an exact evidence passage, follow replies and rediscover contributions across entrances, with source author, participant, assistance and origin distinctions. Search shows community activity; problems expose other problems sharing cited sources without calling those reviewed relationships.
Shared operation validation and moderation-safe command replay are integrated. Submission receipts cannot reveal content after it has been withheld.

### PDF Lab — Open Presence / sideprojects/pdf-lab
Cabinet 003 + A01 contains 27 source specimens plus four transformation derivatives, with an additional mapping-minimal experiment directory. The two-poem artwork preserves visible shapes while changing extracted text; browser controls can write an alternate PDF. The transformation notebook presents actual recorded clone/rewrite/raster outcomes, character maps, hashes and render differences. Engine-specific and untested outcomes stay labelled.
The fresh local check reconfirms the paired poems' mapping-only change, two-engine pixel identity and different extraction, plus browser-writer byte identity and bounded inputs.

### Observatory — Observstory producer / Open Presence consumer
The static TanStack workspace, cool grey/white styling, workstreams, category filters, shared search, board, truthful timeline and evidence drawer are on main. The drawer includes membership, published relationships and source/provenance qualification. Open Presence pins producer ae4f814f331566aa7dd2befa97d774ec194a3f5d, now contained in the producer main branch.
The screenshot uses real published project data. It visibly reports differing captured source revisions; this was preserved rather than disguised as an atomic snapshot. The selected manifest currently contains no implementation-kind records, even though implementation exists in the repository. Curating that manifest is a remaining product-data task.

### Project Memory — Knowledge Lab host / Observstory contract
Versioned history, exact-revision context, CLI, read-only MCP and loopback page are on main. Replay is scoped to the selected ancestry. Backup manifests and restore checks verify the captured ledger and referenced source/snapshot/context bytes. Context receipt and issuance operations commit atomically.
For the screenshot, a new local ledger ingested the real Open Presence origin/main Git history: 63 snapshots and 56 change events. No semantic model calls or paid indexing were used. This demonstrates the current code locally; it is not evidence that the NUC's installed services were upgraded.

## Integration repairs made today
- Retargeted stacked UI PRs to main in dependency order, bringing the frontend foundation with them.
- Integrated Commons #18 with #15; shared schemas explicitly retain evidenceIds and entrance. Preserved idempotency across transport changes and moderation withholding.
- Reconciled the two ADR-038 additions: frontend remains ADR-038, Project Memory becomes ADR-039; updated primary references and the stale frontend-plan wording.
- Preserved newer main-only PDF research while integrating the older Commons continuation.
- Retained the latest tested producer pin and the old System Map draft; no unrelated experiment was merged.

## Validation
- Observstory combined Python suite: **165 passed**.
- Observatory frontend: typecheck and lint pass; **43 unit tests passed, 1 optional live test skipped**.
- Commons combined check: typecheck passed; **196 tests passed initially, one handle-resolution test exceeded its default 5-second timeout**. A focused rerun of the complete nine-test PDS suite passed with a 20-second test timeout; assertions were unchanged. Record index reproduces byte-for-byte; production build and extended live-server multi-entry smoke pass. Existing bundle-size warning remains.
- PDF: node test-poems.js and python3 check-poems.py pass in the current local environment.
- Memory: **32 focused Project Memory tests passed** against the integrated producer. Full Knowledge Lab GitHub CI passes after integration.
- Four freshly served pages captured in Chromium 153 at 1440 × 1000; **zero page JavaScript errors**. These are desktop checks, not a new screen-reader/touch/cross-browser qualification.
- A broader local bridge run was interrupted during an external tokenizer asset load. Automatic review initially rejected unexplained egress. Source inspection identifies a fixed, hash-verified public tokenizer GET, and the tests select offline fake models; no private prompt upload or model call was established. That expanded local run is not counted as passed; focused changed-code checks and full repository CI provide the acceptance evidence.
- Current hosted knowledge was successfully fetched through the local HTTP client after the search reader failed: complete=true, diagnostics=[], resolved commit bde528896394e330e6600eae3109a5cb55c472ce. The snapshot/workspace capture had a different source revision; the UI explicitly warns about it. Event data retains the earlier midnight timetable warning.

## Screens
Fresh files: commons.png, pdf-lab.png, observatory.png, memory.png, plus apps-overview.png. Each is a local rendering of actual app code. Commons uses a fictional prototype participant and the real pinned public corpus. Project Memory uses a new local history ledger, not the private NUC ledger. The separate self-contained HTML overview embeds all four full-resolution screens.

## Still open
- Observatory #17 (System Map v0) remains draft and outside yesterday's integration.
- Preserve the unmerged pixel study and project-knowledge concept branches.
- Verify/upgrade the actual NUC memory services with backup and a real consumer read against the installed producer; no host access was available for that here.
- Public ATProto account/OAuth/namespace/federation, production Commons authentication and public deployment remain separate work.
- Add explicit implementation/current-work records to the selected project knowledge if the workspace should display completed and remaining build work.

## Selected handoff
Findings: yesterday's delivered code is now on main in all three repositories; UI and memory integration conflicts are resolved; branch cleanup is complete for merged work; local screens render without JavaScript errors.
User decision: perform merges, PR cleanup and branch deletion and provide an overview plus screens.
No new product architecture or proposal acceptance was recorded.
Next concrete action: review the screens, then verify the NUC installation and improve selected project metadata rather than rebuilding the same components.

## Sources
- https://github.com/blackmath88/baselhack26-open-presence/pull/15
- https://github.com/blackmath88/baselhack26-open-presence/pull/17
- https://github.com/blackmath88/baselhack26-open-presence/pull/18
- https://github.com/blackmath88/baselhack26-open-presence/pull/19
- https://github.com/blackmath88/observstory/pull/20
- https://github.com/blackmath88/observstory/pull/23
- https://github.com/blackmath88/observstory/pull/24
- https://github.com/blackmath88/observstory/pull/26
- https://github.com/blackmath88/baselhack26-knowledge-lab/pull/1
- https://github.com/blackmath88/baselhack26-knowledge-lab/pull/4
