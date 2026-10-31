# Corpus origin

Upstream repository: read-only local clone `/home/nuc/projects/postack-underflow`.
All three input files below are byte-identical ports, including whitespace.

| Local file | Upstream commit | Upstream path | SHA-256 |
| --- | --- | --- | --- |
| `snapshots/001/manifest.json` | `4231630efb42726f856827c5756278af1584b988` | `corpus/commons/manifest.json` | `a34914f68f90114e922543a60b4ce24a8050fe7fd6b8bc1844390cd49dd2a0a5` |
| `records/problems.json` | `9fffa36e04edc7fd76aaa82f36c5f1ef12cea5bf` | `corpus/commons/problems.json` | `50cb8f8d5aa7d1aec41ffbde49eac87af84fe3396fc68116e62a9582a1bd2f2c` |
| `records/corrections.json` | `9fffa36e04edc7fd76aaa82f36c5f1ef12cea5bf` | `corpus/commons/corrections.json` | `67b82ddbe273a57c9bc4afae53b63eb8f0b0cb572ce87b560b22c4201ed1d737` |

The records and correction interpretations are agent-written by `agent:claude-opus-5-5` and **unreviewed** by a person. Aliases are writer-added vocabulary. Quotes and interpretation stay separate. Source text belongs to its original authors; the upstream repository's MIT label does not grant a blanket licence over thread text. Full conversations, attachments and cache files are not committed.

`index/record-index.json` is generated locally from these committed inputs with `node scripts/corpus/build-index.mjs`; verify with `node scripts/corpus/check-index.mjs`. Its input hashes cover all three files. Only title, symptoms, aliases, device, environment and verbatim record excerpts are indexed; no raw thread index or external cache is used. Query-side vocabulary expansion and mismatched platform conditions are explicitly explained.

Code origins: `src/commons/retrieval/bm25.ts` ports upstream `src/lib/retrieval.ts` at `9fffa36e04edc7fd76aaa82f36c5f1ef12cea5bf`, omitting evaluation metrics. `records.ts` adapts `src/lib/records.ts` field projection and `src/commons/model.ts` Commons weights at that commit. `scripts/corpus/build-index.mjs` adapts `scripts/commons/build-index.mjs` at that commit to remove the raw-thread/cache requirement. Other adapter and test files are new integration code.
