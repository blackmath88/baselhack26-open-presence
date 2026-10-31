# Third-party and reused material

| Component | Origin | Pinned commit | Author(s) observed | Licence |
| --- | --- | --- | --- | --- |
| `apps/commons/` (app, server, UI) | github.com/blackmath88/br-ai-nstorm | `a96c2dbb6fb6caf9cbf648107827fec88e3c0961` | Achim Imboden (20 commits), Claude (7), blackmath88 (1) | No licence file at that commit. Reused by the same owner (blackmath88); no licence is asserted here. |
| `apps/commons/corpus/` manifest, records, corrections, retrieval | github.com/blackmath88/postack-underflow | corpus `4231630efb42726f856827c5756278af1584b988`, index `9fffa36e04edc7fd76aaa82f36c5f1ef12cea5bf` | Achim Imboden; problem records `agent:claude-opus-5-5`, not reviewed by a person | No licence file at those commits. Same owner. |
| Quoted excerpts inside records | github.com/wesbos/photo-frame-dashboard issues/PRs/discussions at `0bff55ef3fb2a3bfdab05bc8e3bd0c9d69f63189` | — | Individual comment authors named per evidence item | Their own; short excerpts with author + permalink. No blanket licence claimed; full text is not committed. |

## Added by the multi-entry slice (2026-10-31)
- `@atproto/api`, `@atproto/lexicon`, `@atproto/syntax`, `@atproto/identity`, `@atproto/common-web` (apps/commons dependencies): official ATProto client, Lexicon validation, identifier syntax, identity resolution and TID generation. MIT/Apache-2.0 dual-licensed by Bluesky Social PBC.
- `apps/commons/tools/local-pds` (dev-only, separate package): `@atproto/pds`, `@did-plc/server`, `@did-plc/lib`, `@atproto/crypto` to run an isolated PDS and PLC directory in-process for development accounts. The setup mirrors `@atproto/dev-env`'s test harness. Nothing from it is served publicly.
- `apps/commons/lexicons/test/openpresence/commons/*.json`: original Lexicon documents written for this repository in a development-only namespace (`.test` is a reserved TLD; no NSID authority is claimed).
