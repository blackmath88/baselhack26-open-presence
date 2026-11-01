# .phf — story/build fit
1 November 2026 · ChatGPT / Codex, assistant · Source review, not a fresh runtime acceptance test.

## Verdict
The existing Commons implementation substantially fits the .phf concept: attributed, contextual contributions
can be inspected, amended by replies/corrections and rediscovered through different entrances.
The main remaining question is whether the running demo makes that mechanism clear.
The build does not establish verified humanity, factual truth, public federation or a new .phf file format.

## Evidence boundary
Reviewed repository main resolved to `4c998e90408100de4b04c8af83b0024d9f3c0162`; recursive tree returned `truncated: false`.
The required hosted knowledge.json and snapshot.json URLs were attempted but were inaccessible through the web reader.
Neither exists at data/ on repository main. Their current resolved commits, completeness and diagnostics could not be verified.
Read .observstory/knowledge.json and both committed context packets instead.
Both packets cut off at 93a5445150d05b3626507f8ef5868d13d62d57ef, older than reviewed main.
They report coverage.complete=true for their selected historical scope; that is not current project completeness.
Their historical current-direction selection is concept-human-signal. Current source files were checked separately.
The 1 November integration report is prior recorded test evidence, not tests rerun in this pass.

## Fit matrix
| Story promise | Source evidence | Assessment and limit |
| --- | --- | --- |
| A familiar document can communicate different readings | PDF Lab source/output tree and integration review | Implemented experiments; use engine-labelled results. No new PDF execution here. |
| Inspect the person and circumstances behind an account | Commons contracts.ts, Record.tsx | Source author, participant and agent interpretation are distinct; imported problem records are agent-written and unreviewed. |
| Select an observation without exposing a private conversation | Composer.tsx | Browser draft, exact preview, assistance declaration, circumstances and passage selection are implemented. No automatic chat extraction demonstrated. |
| Replies and disagreement remain inspectable | Composer.tsx; Commons contribution parent/contradicts/supersedes contracts | Reply/correction relationships exist; not a claim of community consensus. |
| Browser, repository and agent entrances share contributions | cross-entrance-rediscovery.test.ts; DEMO.md | Tests exercise MCP submission and HTTP/repository rediscovery, exact passages and moderation. Live agent-client session not checked. |
| Contributions can leave one app and be reconstructed elsewhere | two-author-roundtrip.test.ts | Real isolated-PDS integration test covers two authors, a fresh app, URI/CID references, edits and deletion. Tooling-dependent; no new execution here, no public federation. |
| Human and AI work is inspectable over time | OBSERVSTORY.md and integration review | Static frontend and memory contracts are reported integrated. Installed NUC services unverified; current selected manifest lacks implementation-kind records. |
| .phf is a visible product and portable format | README, package.json, contracts.ts | Branding still Commons/br-ai-nstorm/Open Presence. No .phf file serialization or standard established. |

## Prior validation
[Integration review](REPOSITORY-REVIEW-2026-11-01.md) reports Commons typecheck/build/index/smoke success,
196 initial passing tests plus a handle-resolution timeout; the nine-test PDS suite passed on a longer-timeout rerun.
It also records browser screenshots without JavaScript errors and focused PDF checks.
These are dated reported results, not a new all-green run.

## Proposed next slice, in order
- P0: start the actual demo host, verify browser access from the presenting device, and rehearse find → inspect → preview → submit → reply → rediscover. Record host, revision, commands, pass/fail and limits.
- P0: keep the distinction visible between real upstream source material and staged prototype participants/contributions.
- P1: update presentation and user-facing entry labels to .phf, preserving repository/package/API identifiers.
- P1: rehearse a live MCP client if it is part of the pitch. Otherwise show working CLI access and label MCP as implemented but not exercised in that rehearsal.
- P1: run the isolated two-author/fresh-instance portability test with tooling installed; a skip is not success. Show the actual portability beat or describe it as recorded evidence.
- P2: add explicit implementation evidence to Observatory's selected knowledge so the closing screen can connect concept to build.
- Later: production identity/authentication, owned ATProto namespace, public federation and deployment. These are outside this documentation change.

Do not rebuild the product around a claim of AI-free or verified-human content. The present mechanism preserves
declarations, origins and contestable context; that is the credible pitch.

## Selected repository handoff
**New findings:** current source and tests support most of the proposed middle journey; runtime readiness remains unverified.
**Explicitly agreed:** .phf [portable human format]; subtitle “trust in ai driven webspace”; past → future → present; middle longest.
**Proposed:** 20/65/15 allocation, one contribution through multiple entrances, optional isolated-PDS portability beat, rehearsal priorities above.
**Open:** pitch duration, available demo host/device access, connected agent client, live portability readiness, challenge fit and minimal UI rebranding.
**Affected:** README.md; HUMAN-SIGNAL-CONCEPT.md; DEMO.md; docs/pitch/PHF-STORY.md; this review; proposal handoff.
No remote service, UI code, external account or upstream community was changed.

## Sources
All local source review refers to [reviewed commit](https://github.com/blackmath88/baselhack26-open-presence/tree/4c998e90408100de4b04c8af83b0024d9f3c0162).
- [Concept](../../HUMAN-SIGNAL-CONCEPT.md), [demo](../../DEMO.md), [integration review](REPOSITORY-REVIEW-2026-11-01.md)
- [Contracts](../../apps/commons/src/commons/contracts.ts)
- [Source inspection](../../apps/commons/src/components/commons/Record.tsx)
- [Contribution composer](../../apps/commons/src/components/commons/Composer.tsx)
- [Cross-entrance tests](../../apps/commons/server/test/commons/cross-entrance-rediscovery.test.ts)
- [Two-author portability test](../../apps/commons/server/test/commons/two-author-roundtrip.test.ts)
- [Project knowledge manifest](../../.observstory/knowledge.json)
- [Historical packet](../memory/context/cp_7cdc6f026054f6d6650d202f.json)
- Required hosted sources attempted: https://blackmath88.github.io/baselhack26-open-presence/data/knowledge.json and https://blackmath88.github.io/baselhack26-open-presence/data/snapshot.json
