# Commons edge runtime — bounded first release

Status: implemented on a feature branch; public deployment is not established by this document.
Baseline: `564f1d492a94deb23fd5d6407007df45f0a5772d`.

## Goal and scope

With the NUC off, two separately issued contributors can submit, reply and rediscover through the same public Commons service. The existing local Node application remains available. This release adds a distinct Worker entrypoint/configuration; it does not deploy the inherited Worker as if it were current Commons.

- Frontend and HTTP API share one Worker origin.
- D1 stores events, metadata, command receipts, hashed contributor credentials and daily write budgets.
- Anonymous reads use a server-defined read-only principal.
- Contributors receive random, expiring, individually revocable bearer access codes. These are reusable credentials, **not single-use invitations or verified human identities**. Browser credentials live in sessionStorage, not persistent localStorage; keep this origin free of untrusted scripts.
- No inference provider, R2, KV, Durable Object or NUC dependency.
- ATProto publication and remote MCP are explicitly unavailable in this release. The current Commons HTTP API remains available to other clients. The inherited room-workbench mutations are not exposed; its UI toggle is hidden in edge builds.
- PDF browser migration and Observatory annotations are follow-up work. Existing static publication remains unchanged.

## Transaction decision

D1 is used with optimistic concurrency. A callback operates on a versioned snapshot. One SQL batch inserts a CHECK-constrained revision guard, updates the document, and removes the guard. A stale guard throws and rolls back the **entire batch**. Only that named constraint is retried. Validation, events, metadata and durable command receipts are recomputed on conflict; callbacks must not perform external side effects.

This is deliberately a bounded compatibility adapter, **not the final scalable schema**: the full document is capped at 1 MiB. Reads still reconstruct domain projections. The existing corpus fits in tests, but free-plan CPU at realistic history sizes is not established. Before growth, replace the snapshot with normalized event/metadata/projection tables while retaining command semantics. Do not raise the cap instead of measuring and migrating.

Read-only callbacks return their consistent snapshot without writing. Eight write attempts bound contention. Network/unknown commit failures are not blindly retried; clients should retry the same command ID so receipts resolve ambiguous outcomes.

## Local setup

From `apps/commons`, Node 22.13+ or 24:

```bash
npm ci
npm run build:edge
npx wrangler@4.45.0 d1 migrations apply phf-commons --local --config wrangler.edge.jsonc
node scripts/edge/issue-contributor.mjs alice Alice
```

The issuance tool writes a `.sql` file and an owner-only `.code` file in ignored `.edge-credentials/`. Apply the printed SQL path locally:

```bash
npx wrangler@4.45.0 d1 execute phf-commons --local --config wrangler.edge.jsonc --file .edge-credentials/ACTUAL_FILE.sql
npx wrangler@4.45.0 dev --config wrangler.edge.jsonc --var WRITES_ENABLED:true
```

Open the local URL; public reading works without a credential. Enter the code to contribute. Generate Bob separately with a different slug and code. Never paste credentials into a repository, logs or issue.

## Deployment (requires the user's Cloudflare account)

1. Authenticate Wrangler to the intended account, inspect the account, and stay on the free plan. This work does not authorize a paid upgrade.
2. Create D1: `npx wrangler@4.45.0 d1 create phf-commons`.
3. Replace `REPLACE_WITH_CREATED_DATABASE_ID` in `wrangler.edge.jsonc` with the returned ID.
4. Apply `d1 migrations apply phf-commons --remote --config wrangler.edge.jsonc`.
5. Issue two contributor codes and apply their SQL using `d1 execute ... --remote --file ...`.
6. Build with `npm run build:edge`, then deploy using `npx wrangler@4.45.0 deploy --config wrangler.edge.jsonc`. Writes default to disabled.
7. Verify anonymous source inspection; set `WRITES_ENABLED` to `true` and deploy when ready for the two-person demonstration.
8. Verify contribution, reply, public rediscovery, forbidden review by ordinary contributors, expiry/revocation and persistence after redeploy. Test with NUC off and two independent browser profiles.
9. Only after verifying the actual URL, configure the story destination (`site/destinations.mjs` / existing publication overrides). Do not replace its access explanation with an unverified URL.

Revoke a person with `UPDATE contributor_tokens SET revoked = 1 WHERE actor_id = 'person:alice';` using authenticated Wrangler D1 access. Ordinary credentials never receive review scope. An operator can explicitly assign `can_review = 1` to a separate moderator credential. `WRITES_ENABLED=false` disables contribution/review/moderation routes. The sign-in endpoint cannot mint credentials.

Daily limits: 100 mutation requests per contributor and 1,000 globally; failed/preview requests count. Request bodies are streamed with a 32 KiB cap. Budgets do not constitute a billing cap. Credentials expire in 1–30 days. Historical budget rows can be removed by the operator; contributions are retained until deliberate moderation/export/reset. No automatic destructive reset is implemented.

## Evidence and limitations

- Local SQLite tests exercise the exact migration and SQL batch, real Commons validation, duplicate/concurrent writes, rollback, identity/revocation and two-user HTTP reply/rediscovery after service reconstruction.
- Typecheck and the edge frontend build must pass. Wrangler dry-run must bundle the Worker.
- These tests do not establish production D1 latency/CPU, deployed browser behavior, or Cloudflare account access.
- There is no completed public two-device demonstration until deployment evidence is recorded.

Reference research: user-provided architecture review, inspected baseline `564f1d4`; D1 transactional batch documentation: https://developers.cloudflare.com/d1/worker-api/d1-database/ .
