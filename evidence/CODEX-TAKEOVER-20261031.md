# Codex takeover — 31 October 2026

## Scope and state

Continued Claude's PR #11 at `0175fa9a4be592b75a3d6c4f1bff1532d9437200`, stacked on PR #8. This is direct execution in ChatGPT's cloud workspace, not execution on the NUC or through Orca. The existing handoff reports its worker settled; this session did not dispatch any workers or inspect live NUC/Orca process state.

Hosted knowledge and snapshot referenced `1f59670815cd8d0dd01f15f1979f39a57e627c40`. Knowledge was complete with empty diagnostics; activity was degraded by PR #8's 100-file collection cap. Inspected the implementation branch directly rather than inferring it from main.

## Repairs

Implementation commit: `09d7b95278faba4c9f7f0b5cc67d3b24c2e0e609`.

1. Reproduced preview-account drift: prepare a publication for account A, restart with the actor mapped to account B, then publish the persisted intent. Original code wrote into B's repository despite the preview naming A. The outbox now checks the persisted DID/service, and passes that destination to the actual adapter, which independently checks the session before record I/O. A failed destination check preserves the queue/key and reports an error.
2. Reproduced moderation bypass on retries: a failed publication, subsequently hidden or author-blocked, was still drained. Queue selection now checks the current projection and skips withheld entries. Unblocking can resume reconciliation with the same record key. This does not retract a record already written remotely, nor guarantee cancellation of a network operation already in flight.
3. Queue selection checks current revision/payload against the preview before dispatch. Session/transport exceptions become failed receipts instead of abandoning the remaining batch. These defensive branches were inspected; the dedicated regression assertions target items 1 and 2.

Both service regressions failed on the original code before the repairs and pass afterwards. An additional real-PDS adapter regression checks wrong DID and service with no record created.

## Verification

Environment: Node 24.22.1. Installed application dependencies and the isolated PDS tooling. No public accounts or paid model calls.

- `npm run typecheck`: pass.
- `npm test`: 16 files, 184 tests pass. Local PDS tooling installed; both isolated-PDS suites executed, rather than taking their missing-tooling early return.
- `npm run index:check`: record-only index reproduced byte-for-byte.
- `npm run build`: pass; existing large-bundle warning remains.
- `bash scripts/smoke/multi-entry.sh`: pass, including real local-server search, repository navigation, submit/replay/conflict, second-author reply, context, moderation, restart and no-account publication behavior.
- `git diff --check`: pass.

One initial real-PDS run timed out in the multi-request second-author case at the test framework's default 5-second deadline, shorter than the adapter's 8-second request timeout. That case now has an explicit 20-second integration-test deadline. Assertions remain unchanged; the combined rerun passed.

No browser walkthrough rerun. No independent review of these repairs; this is coordinator self-review. No merge, deployment or public federation acceptance.

## Reproduced unresolved blocker — legacy moderation leakage

Using the real service/HTTP harness, import fixtures, submit a distinctive marker as Kai, then hide it as Lea:

```json
{"commonsViewRedacted":true,"roomViewLeaksBody":true,"legacyHttpLeaksBody":true}
```

`commons.getContribution` redacts it, but `commons.getRoom` and `GET /api/problems/commons%3Aemmc-not-exposed` still contain the marker in contribution/history data. `getRoom` reads raw projected history; legacy services bypass the Commons moderation projection. The modern route tests therefore do not establish moderation across every read entrance.

Next repair: implement a shared moderation-aware read boundary for room state/history and legacy HTTP/MCP/orchestration reads; verify hidden, blocked, deleted and invalid records do not leak text, labels or derived context through alternate entrances. Preserve the underlying event log for accountable history while restricting what normal readers receive. Do not merely hide the text in React.

Other follow-up inspection: receipt/command replay responses, concurrent sync/resolve, external records changing problem identity, and context-budget accounting. These are inspection targets, not confirmed defects in this report.

## Handoff

Implemented and tested: publication destination/mode revalidation repairs above. Still blocked: consistent moderation on legacy read paths. Existing multi-entry/ATProto build remains on its stacked branches. Do not activate public accounts or describe moderation as complete on the strength of current tests.
