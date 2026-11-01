# Multi-entry Commons — what was actually built

31 October 2026 · Branch `feat/commons-multi-entry` (stacked on PR #8, `e24838f`) · Implements [MULTI-ENTRY-COMMONS.md](MULTI-ENTRY-COMMONS.md) per [MULTI-ENTRY-BUILD.md](../build/MULTI-ENTRY-BUILD.md)

This note records the choices made while building, where they deviate from the specification, and what is verified versus merely present. Status and evidence are in `BUILD-STATUS.md`; commands in `DEMO.md`.

## Shape

One application service (`apps/commons/server/commons/service.ts`) owns every Commons operation. Three adapters call it and nothing else:

| Entrance | Adapter | Notes |
| --- | --- | --- |
| UI | `src/components/commons/*` over `src/commons/client/api.ts` | Hash routes `#/search`, `#/repo`, `#/problems/:id`, `#/contributions/:id`, `#/threads/:id` survive reload and back |
| CLI | `scripts/commons/cli.ts` (`npm run commons -- …`) | An HTTP client of the running server, so it shares services, identity and data; JSON out, exit codes 0/2/3/4/5/6 |
| MCP | `server/mcp/commons-tools.ts`, registered by the single factory in `register-tools.ts` | Same tools on stdio and HTTP; `structuredContent` + text; in-band errors |
| HTTP | `server/commons/routes.ts` | `/api/commons/{search,repository,problems,contributions,context,publications,sync,resolve,moderation,status}` |

Reads fold the event log plus adapter metadata into one projection (`projection.ts` → `CommonsContribution`), so no entrance can show a different author, revision, origin or moderation state than another. Writes keep the first slice's serialized transaction and durable command receipts; a replayed command now says `replayed: true`.

## Contracts (M0)

`src/commons/contracts.ts` is extended compatibly: discriminated references (`local` / `source` / `atproto`), Commons kinds (`question | observation | attempt | outcome | correction`), assistance declarations (`none | ai-assisted | ai-drafted`, a declaration, never detection), `PublicationIntent`, `PublicationReceipt`, `ExternalOrigin`, `CommonsContribution`, `ModeratedContribution`, `SubmitContributionCommandV2`, and `appLinks`. Persisted metadata gains `publications`, `intents`, `outbox`, `external`, `sync`, `moderation` and a `schemaVersion`; `commonsMetadata()` migrates older stores forward on read. Imported problem IDs and room IDs are unchanged.

Commons kinds are stored as the room ontology's nearest kind (`observation → claim`, `attempt → approach`, `outcome → evidence`, `correction → contradiction`) so the existing State/Map/Timeline views keep working; the Commons kind itself lives in metadata and is what every entrance shows.

## Deviations and defaults

- **Runtime validation**: `server/commons/operation-schemas.ts` defines the operation input shapes shared by service validation and MCP discovery. HTTP preserves JSON types until validation; the CLI calls the same HTTP service and rejects non-finite numeric flags locally. Contribution previews combine these shape checks with problem/reference validation and keep the existing `ok:false` response. Invalid submitted operations use domain `invalid` / HTTP 422 / CLI exit 2; MCP also has SDK input-validation errors in its standard protocol envelope. ATProto records remain validated against the committed Lexicons.
- **Search**: imported problem records are searched with the pinned record-only BM25F index (browser and server); new contributions are indexed server-side per request with the same tokenizer. Results carry match reasons and a coverage note; ranking is explicitly not confidence.
- **Repository navigation** is over the pinned manifest only (paths, hashes, authors, times, thread/comment ids) and links each node to the problems whose evidence cites it. It is not a live GitHub browser and says so. Doc citations in the two syntaxes present in the data (`doc/<path>#L…` and Postack's bare path) are both resolved.
- **Rediscovery from the repository** (NUC window, 31 October): the navigator joins visible contributions' source refs to docs, threads and comments (`contributionCitationIndex`), so what people added comes back to whoever browses the cited object from any entrance. Each contribution carries an adapter-declared `entrance`; it is transport metadata outside the idempotency hash, not a detection and not authorization. Problem views add `evidenceCitations` (per evidence item, including contributions from other problems citing the same object) and every citing entry carries reply count, participants and last activity (`replyStats`). Optional `evidenceIds` cite exact passages; a participant's server-resolved display name is stored with the submission (`authorName`) and projected as `actor.displayName`.
- **Context packets** are deterministic and budgeted; the targeted contribution is always included (truncated if needed); omissions, freshness and limitations are listed. They are not answers.
- **Moderation**: `hide/unhide` a contribution and `block/unblock` an author, local only, applied in the projection, so UI, search, context, HTTP and MCP all return the same minimal `ModeratedContribution` without the body. Report flows and an audit view are not built.
- **ATProto namespace**: `test.openpresence.commons` by default. `.test` is a reserved TLD, so this explicitly claims no owned authority; `COMMONS_ATPROTO_NAMESPACE` overrides it once an owned NSID domain is verified. Records: `<ns>.contribution` with `<ns>.defs`.
- **Publication**: `preparePublication` resolves the session first (network), then in a transaction builds the record, validates it against the Lexicon, allocates the TID record key and persists an intent bound to payload digest, account, revision and a 15-minute expiry. `publishContribution` re-derives the digest, refuses a changed payload or revision, writes a `queued` receipt and the outbox entry, then drains. The publisher calls `getRecord(rkey)` before `createRecord(rkey)`, so a retry after a lost acknowledgement finds the existing record instead of creating a second one. Receipts are independent of contribution state: queued is never shown as published. A confirmed receipt also registers the record as an observation of its own contribution, so later syncs do not echo it.
- **Ingestion**: `syncAuthor` pages `listRecords` with persisted progress; the scan is complete only when the PDS returns an empty page; deletion is inferred only from a complete scan; an unreachable PDS marks records stale, never deleted. `resolveExternal` fetches one `at://` URI. An unknown problem reference is kept as an unresolved observation, never merged by similarity. An invalid record is kept as a bounded `invalid` state. Ingested records become room events attributed to the DID (`provenance.source = 'atproto'`, a new `ContributionSource`), with CID, handle and retrieval time in the projection; a remote edit is a `ContributionEdited` on the same contribution (revision +1).
- **Identity**: local actors come from the prototype bearer-token issuer, unchanged. ATProto sessions come from server configuration (`COMMONS_ATPROTO_ACCOUNTS`, disposable development accounts, app-password style login through `@atproto/api`). Real-user OAuth through `@atproto/oauth-client-node` is documented as an activation step in `server/commons/atproto/README.md`, not implemented as a flow. A caller can never supply a DID as authorization.
- **Local PDS**: `tools/local-pds` boots `@atproto/pds` and a `@did-plc/server` in-process (sqlite in temp dirs, `.test` handles). Docker is not required and was not available in the build environment. This is an isolated development network, not public federation, and the tests say so when they skip.
- **Worker/Cloudflare path** still has no Commons service; Commons tools register only where the service exists.

## Verified vs present

Verified by automated tests (181 passing on the branch head; see `evidence/checks.md`): migration of a first-slice store; MCP find → HTTP/CLI submit → MCP reply → thread → search → context on one service; same key replay and conflict; forged author ignored; repository root/doc/thread navigation with citations; moderation across projections; publication idempotency, timeout-after-write recovery with the same key, restart retention, changed-payload refusal; ingestion dedupe/versioning/unresolved/invalid/partial/deletion; and the two-author round trip against the real isolated PDS, including a fresh index reconstructing the thread, an upstream edit arriving as a new revision, and a deletion arriving as unavailability.

Present but not verified beyond manual checks: UI flows (one browser pass, see `evidence/browser-check-multi-entry.txt`); the CLI (smoke script `scripts/smoke/multi-entry.sh`).

Not built or not verified: public federation, OAuth sign-in, production namespace ownership, Bluesky visibility (custom records do not appear in Bluesky feeds), report/audit moderation flows, Map view edges across rooms, Cloudflare Commons.


## NUC continuation on PR #11

`blackmath88/commons-adapter-consistency` begins at `dacc974` (PR #13's publication repairs already integrated into PR #11). A reproduced moderation leak in legacy room/history reads is repaired at a shared complete-log read boundary (`server/commons/read-view.ts`, preserved from concurrently integrated PR #14 at `86ec1a9`; replay guard in `read-boundary.ts`). Ordinary problem and curation readers receive a read-only repository view filtered before projection; orchestration context uses that same view. Command validation and durable storage retain raw events. Commons `getRoom` filters history/state within one transaction, keeping its raw event-count version for optimistic review. The filter closes over dependent object IDs so proposal reasons, accepted edges and evaluations cannot reintroduce a withheld body's derived text. Replay checks saved outcomes against current withheld object IDs; it preserves moderation-command retries while refusing stale body-bearing submission/review outcomes.

Focused regressions cover hidden and blocked bodies across direct services, HTTP, legacy MCP and orchestration, restoration and unchanged storage; deleted/invalid ingested bodies with dependent proposal reasons; malformed numeric/enumeration/JSON shapes; CLI exit 2; spoofed authors and command collisions. Existing publication intent/destination/retry and two-author PDS tests remain part of the application suite. This is foreground Codex verification on the NUC, with no additional workers or independent review. No browser walkthrough was repeated.
