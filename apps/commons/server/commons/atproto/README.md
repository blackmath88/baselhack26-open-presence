# Commons ATProto adapter (Packet B)

Implements `contract.ts` with the official `@atproto/api`, `@atproto/lexicon`,
`@atproto/syntax` and `@atproto/identity` packages. The Commons service uses
only the contract; this directory owns record shape, validation, sessions,
publishing and bounded reading.

## Namespace and NSID ownership

Records are `test.openpresence.commons.contribution` with shared definitions in
`test.openpresence.commons.defs` (`lexicons/test/openpresence/commons/*.json`,
schema version 1). The authority `test.openpresence.commons` corresponds to the
domain `commons.openpresence.test`; `.test` is a reserved TLD (RFC 2606), so this
namespace **cannot be owned by anyone** and is explicitly development-only.

Before any production publication:

1. Choose a domain the project controls (e.g. `commons.<owned-domain>`), confirm DNS control.
2. Set `COMMONS_ATPROTO_NAMESPACE=<reversed domain>` (e.g. `org.example.commons`); the adapter
   re-namespaces the committed Lexicon documents at load time (`renamespace()` in `index.ts`).
3. Publish the Lexicon documents under that authority per the ATProto Lexicon resolution guidance.
4. Re-run `server/test/atproto` with the production namespace set.

Records in a different namespace are **not** parsed as contributions (`parseRecord` rejects
any other `$type`), so a namespace change is a hard cut, not a migration.

## What the adapter guarantees

- `buildRecord`: deterministic; validated against the Lexicon; `digest` = sha256 of canonical
  JSON (sorted keys, no `undefined`). The digest is the content binding for intents and receipts.
- `parseRecord`: never throws; Lexicon validation plus hard caps (`LIMITS`: 32 kB text, 4 kB
  circumstances, 50 source refs, 64 kB record); unknown `kind`/`assistance` values are rejected
  even though the Lexicon uses `knownValues`. Strong refs become `{kind:'atproto', uri, cid}`.
- `publisher.reconcileOrCreate`: **read first** (`getRecord` at the allocated `rkey`), then
  `createRecord` at exactly that key. Identical record found → `existing`; different record found
  → `conflict` (never overwritten); any transport error → `unreachable`. A timeout after the
  server committed is therefore recovered on retry with the same key and no duplicate
  (covered by `roundtrip.test.ts`). The caller must persist the `rkey` before the first attempt.
- `reader`: DID/handle resolution via `@atproto/identity` against the configured PLC directory;
  handles that do not resolve via DNS/HTTP are tried through `com.atproto.identity.resolveHandle`
  on allowlisted PDSs only. A DID whose document points at a PDS outside `allowedPds` is
  `refused`, not fetched. `getRecord` refuses collections other than ours. `listRecords` caps the
  page size at 100. **A cursor on a page is not proof of more records: the PDS returns a cursor on
  the last page too; the end of a scan is an empty page.** `missing` means the PDS answered
  `RecordNotFound`; `unreachable` means no trustworthy answer — never treat it as deletion.
- `sessions`: credential sessions for configured development accounts only; `describe()` names
  configured participant ids and never credentials or handles.

## Configuration (coordinator exposes as environment)

| Env | Meaning |
| --- | --- |
| `COMMONS_ATPROTO_NAMESPACE` | NSID authority; default `test.openpresence.commons` (dev-only). |
| `COMMONS_ATPROTO_ALLOWED_PDS` | Comma-separated PDS origins the app may contact. Empty = no network at all. |
| `COMMONS_PLC_URL` | PLC directory for `did:plc`. Unset = `did:plc` identities are refused (no silent fallback to the public directory). |
| `COMMONS_ATPROTO_ACCOUNTS` | JSON `{ "<actorId>": { "service", "identifier", "password" } }` — disposable development accounts mapped to local participants. Never a caller input. |

`tools/local-pds` prints a ready-to-paste set of these for an isolated network.

## Verified vs not verified

Verified (this repository, `npx vitest run server/test/atproto`):

- Lexicon documents parse; build/digest determinism; bounded parsing and refusals (offline).
- Against a **real, isolated** `@atproto/pds@0.5.52` + in-memory PLC started in-process:
  create → existing on retry; simulated lost acknowledgement recovered without duplicate;
  conflict on a differing record at the same key; a second account's reply with a strongRef
  parent; `getRecord`/`listRecords`/pagination; handle and DID resolution; allowlist refusal;
  unreachable vs missing; deletion reads as `missing`.

Not verified, and not claimed:

- Any public PDS, bsky.social, relay/firehose, or cross-PDS federation.
- Appearance of these custom records in any Bluesky client or feed (they will not appear; they are
  not `app.bsky.*` posts).
- OAuth sign-in for real users.

## OAuth activation checklist (real users)

The credential provider exists only for disposable local accounts. For a real person:

1. Add `@atproto/oauth-client-node` and implement a second `AtprotoSessionProvider` whose
   `sessionFor(actorId)` returns the stored OAuth session for that participant (restore via the
   client's session store; never accept a DID from the request).
2. Host client metadata at a public HTTPS URL (`client_id` = that URL) with `redirect_uris`,
   `scope` (at least `atproto` plus the repo write scope for the contribution collection),
   `grant_types` `authorization_code` + `refresh_token`, `dpop_bound_access_tokens: true`.
3. Add the callback route, a persistent state/session store, and a per-participant "connect
   account" action in the UI; show the connected handle/DID in the publication preview.
4. Decide namespace ownership (above) before the first real publication.
5. Keep `COMMONS_ATPROTO_ALLOWED_PDS` explicit; real users' PDSs must be added deliberately, or
   the allowlist policy relaxed consciously (and documented) for public operation.
