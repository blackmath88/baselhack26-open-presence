# Moderation read boundary and integration hygiene

31 October 2026 · Codex · coordinator self-review, not an independent review or human acceptance record

## Integration

Achim authorized repository hygiene and merging what is ready. Merged #4 (memory write-back), #9 (multi-entry specification), #8 (base Commons application), #6 (PDF narrative) and #12 (Observatory workspace integration) into main. #13 publication repairs merged into #11's integration branch. Retargeted #11 from its merged dependency to main. Used merge commits, preserving the stacked history. Proposals stay unreviewed; a Git merge does not accept their content.

Main incorporated for local combined checks: `9ba90708c4cec4e3c5d21b00cfb39a7c09f8ce2c`. Commons integration base: `dacc9741877040836d103992e8861c36f29ae167`. No upstream repository changed, no public ATProto account activated, and Commons has no public deployment. Existing repository Pages workflows run on authorized main merges.

## Repaired blocker

The previous takeover reproduced hidden text returned by `commons.getRoom` and `/api/problems/:id`, although newer Commons views redacted it. Legacy MCP and orchestration readers used the same unfiltered services.

Added one moderation-aware, read-only repository projection for inherited problem/curation/orchestration reads. Room/history uses the same filter. Withheld contributions and dependent proposal/review/relation events are omitted from normal reader projections, preventing their labels/reasons from repeating hidden text. The transitive filter considers the complete log before selecting a room, so cross-room references use the same withheld identity set.

Command services and stored events remain unchanged. Unhide/unblock restores visibility. The read adapter refuses append calls; it is not a command repository or a mechanism for deleting evidence.

## Evidence

Four regression cases (hidden, blocked author, deleted remote record, invalid remote record) failed on the original implementation. They now exercise:

- Legacy HTTP state, compact state, events, updates, own contributions, curation and orchestration context.
- Commons room and history.
- Legacy MCP state, overview, own contributions, updates, contribution context and selected contributions.
- Dependent proposal and rejection reasons containing the distinctive withheld marker.
- Original storage still contains the marker; local unhide/unblock restores it in read projections.

Combined verification: 188 tests across 17 files with real isolated-PDS suites installed; typecheck; record-only index reproduction; production build; both local-server smoke scripts. An additional final test/typecheck run covers the complete-log filtering refinement. Existing bundle-size warning remains. No fresh browser walkthrough.

## Limits and next work

This closes the reproduced legacy read leak; it is not a complete privacy/security audit. Independently authored quotations are not automatically censored by string matching. Historical source text, publications already on another server and network writes already in flight are not deleted by local moderation. Receipt replay and concurrent sync semantics remain review targets from the prior takeover.

Continue functional development from consolidated main after the repair and #11 are integrated. Existing UI remains the starting point. Production identity, owned ATProto namespace, public hosting and activation remain separate work; existing local-PDS tests do not establish public federation.
