# Packet A — corpus + record-only search

Implementation commit: `8734be44c13b1f54f14ba25098f5a3537eb3cb6c` on `blackmath88/commons-packet-a`, based on bootstrap `94fec5d12326aaf9e8d237049eb058a46ef2fd97`.
This report is delivered in the following report-only commit; cherry-pick both commits (or the branch range from bootstrap). Work completed 2026-10-31 before the 14:46 CET deadline.

## Delivered behavior

`src/commons/retrieval/index.ts` exports `createCommonsReader(): CommonsReader`; `src/commons/source/index.ts` exports `resolveSource`, `sourceById`, `importedProblems`, and static manifest/record/correction data. Both Node/tsx and Vite can load the JSON imports; Node/tsx execution and application TypeScript checking were observed. No frozen contract or root config was changed.

The three pinned inputs are byte-identical to upstream. The deterministic record-only index uses committed inputs only and carries their SHA-256 hashes; its builder/checker never reads a cache or network. Search explains matched fields and terms, marks aliases as writer vocabulary, and explicitly describes query vocabulary expansion (`mac`/`macos`; `usb`, `disk`, `data` for a frame visibility question). Platform mismatches sort after other hits and are flagged; the default 20-result limit includes the Windows/WSL near match. No invented percentages are returned.

The query `My Mac cannot see my frame` ranks `usb-c-no-data` first, followed by `reset-after-uboot` and `ums-drops-during-backup`; `wsl-usbipd-ums` is present and `nearMatch: true`. Every original evidence ref and both sides of each correction resolve. All 18 records retain `agent:claude-opus-5-5` provenance and `review: unreviewed`. Original quotes remain separate from the writer's interpretation. Correction previews are not applied to source or record status. Original raw indexing decisions/uncertainties remain in the byte-identical records and exported record data.

Full source text is not committed, so every reference reports `availability: unavailable` with coverage notes. Thread/comment authors and source times come from the manifest; document authors and source times are explicitly unknown/null because the manifest does not record them. Document revision is not misrepresented as individual authoring time. Digests, retrieval time, original links and document passage locators are preserved. Absence is never represented as deletion. No source-cache quote verification was possible; tests verify preservation of upstream quotes, not their independent truth.

## Changed paths and origins

All paths below are relative to `apps/commons/` except this report. No other paths changed.

| Local path | Origin |
| --- | --- |
| `corpus/snapshots/001/manifest.json` | Byte-identical `4231630efb42726f856827c5756278af1584b988:corpus/commons/manifest.json` |
| `corpus/records/problems.json` | Byte-identical `9fffa36e04edc7fd76aaa82f36c5f1ef12cea5bf:corpus/commons/problems.json` |
| `corpus/records/corrections.json` | Byte-identical `9fffa36e04edc7fd76aaa82f36c5f1ef12cea5bf:corpus/commons/corrections.json` |
| `corpus/ORIGIN.md` | New integration attribution, input hashes, provenance and rights notes |
| `corpus/index/record-index.json` | Generated from the three pinned inputs by the new record-only builder |
| `scripts/corpus/build-index.mjs` | Adapted from `9fffa36e04edc7fd76aaa82f36c5f1ef12cea5bf:scripts/commons/build-index.mjs`; raw-thread/cache dependency removed |
| `scripts/corpus/check-index.mjs` | New byte comparison entry point |
| `src/commons/retrieval/bm25.ts` | Ported `9fffa36e04edc7fd76aaa82f36c5f1ef12cea5bf:src/lib/retrieval.ts`; evaluation helpers omitted |
| `src/commons/retrieval/records.ts` | Adapted field projection from `9fffa36e04edc7fd76aaa82f36c5f1ef12cea5bf:src/lib/records.ts` and Commons weights from `src/commons/model.ts` at the same commit; restricted to contract-explainable fields |
| `src/commons/retrieval/index.ts` | New frozen-contract reader adapter and transparent query expansion/platform comparison |
| `src/commons/source/index.ts` | New frozen-contract source and record adapter |
| `test/corpus/reader.test.ts` | New integration tests; no upstream test copied |
| `test/corpus/vitest.corpus.ts` | New isolated test runner config under the test allowlist; existing root Vitest config untouched |
| `evidence/orca/A-report.md` (repo root) | This new report |

The local upstream was accessed only with `git -C /home/nuc/projects/postack-underflow show <commit>:<path>`. Read-only research inputs also included the pinned `docs/research/COMMONS-CORPUS.md`, `docs/research/COMMONS-INDEX.md`, `scripts/commons/check-records.mjs`, and `src/commons/model.ts`; these were not copied wholesale.

Verified SHA-256 values (Python compared complete bytes to each `git show` output, 3 passed / 0 failed):

- Manifest: `a34914f68f90114e922543a60b4ce24a8050fe7fd6b8bc1844390cd49dd2a0a5`
- Problems: `50cb8f8d5aa7d1aec41ffbde49eac87af84fe3396fc68116e62a9582a1bd2f2c`
- Corrections: `67b82ddbe273a57c9bc4afae53b63eb8f0b0cb572ce87b560b22c4201ed1d737`

## Commands and observed checks

Working directory for commands below: `apps/commons/` unless stated otherwise. Commands use installed local dependencies; no network fetch except `npm ci`, and no paid API/model calls.

| Exact command | Result |
| --- | --- |
| `npm ci` | PASS, exit 0; 186 packages installed. Installer reported 10 existing dependency vulnerabilities (4 moderate, 6 high); no dependency changes were authorized or made. |
| `node scripts/corpus/build-index.mjs` (invoked from repo root as `node apps/commons/scripts/corpus/build-index.mjs`) | PASS, exit 0, generated committed index |
| `node scripts/corpus/check-index.mjs` | PASS twice standalone, exit 0; also exercised by each corpus test run |
| `npx vitest run test/corpus --config test/corpus/vitest.corpus.ts` | PASS on all three runs: 1 file, 7 tests passed / 0 failed each (21 test executions total); final run 14:28 CET |
| `npx tsc --noEmit -p tsconfig.app.json` | First run FAIL, 1 new error: JSON widened `system` string incompatible with `Index`; one focused type-narrowing repair. Both subsequent runs PASS, 0 errors. |
| `npx tsc --noEmit -p tsconfig.server.json` | PASS, 0 errors |
| `npx vitest run test/corpus` | FAIL, exit 1, 0 tests discovered because frozen root include only covers `server/test/**/*.test.ts` |
| `npx vitest run test/corpus --dir .` | FAIL, exit 1, 0 tests discovered; `--dir` does not override root include |
| `npx tsx -e 'import {createCommonsReader} from "./src/commons/retrieval/index.ts"; const r=createCommonsReader(); console.log(r.problems().length, r.search("My Mac cannot see my frame",30).map(h=>[h.problemId,h.nearMatch]));'` | PASS, 18 records and expected ranking/near matches |
| `git diff --cached --check` (repo root) | Final PASS; initial whitespace-only failure (extra final blank line in ported BM25) corrected |

Seven tests cover exact manifest hash; cache-free index reproduction; Mac ranking plus Windows/WSL condition difference; alias labels; every evidence ref's author/permalink/digest/availability; quote/interpretation separation, correction evidence, unreviewed provenance and defensive copies; and query/limit behavior.

Two exploratory `npx tsx -e` probes failed before the successful probe: the first followed an incorrectly rooted shell file-write command (no files changed), and the second exposed an overlong relative JSON import path. Paths were corrected before the test suite. One Orca status attempt used unsupported `--type progress`, was rejected without sending, then was sent successfully with `--type status`. All setup/inspection commands otherwise succeeded; no failures are hidden by the final passing results.

## Remaining integration work

Coordinator must include `test/corpus/**/*.test.ts` in the owned root `vitest.config.ts` for the exact plain acceptance command. Until then, the explicit allowlisted config command above runs all seven tests. The `--dir .` fallback suggested in the task cannot override that include setting; both observed failures were reported to the coordinator through Orca status. Frozen configs, contracts, package files, App and docs were untouched.

No UI wiring, room writes, raw-text cache, recapture, deployment, push or merge was performed. Consumer imports should use the exported reader and preserve availability/review notes. Independent review and combined app verification remain coordinator work.

## Observed harness

`orca terminal show --terminal term_854dc656-cbf8-474a-97eb-a701dc8ef064 --json` reported `agentIdentity: codex`, `executionHostId: local`, branch `refs/heads/blackmath88/commons-packet-a`, and terminal preview `GPT-6.1-Sol default`. This is observed Orca/CLI route readback, not independent verification of a backend model identifier. Tools exposed the Codex harness; no recursive delegation or external model call was used. Runtime Node was `v26.8.1`, Vitest `v4.1.11`.
