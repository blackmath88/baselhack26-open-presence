# commons-local-pds

A disposable, isolated ATProto network for developing and testing the Commons
ATProto adapter: an in-memory `did:plc` directory and one PDS backed by sqlite
in a temp directory. Accounts created here are throwaway development
identities (`*.test` handles).

```bash
cd apps/commons/tools/local-pds
npm install            # builds better-sqlite3 (allowScripts covers it)
npm start              # prints COMMONS_PDS_URL, COMMONS_PLC_URL, two dev accounts
```

Paste the printed `COMMONS_*` lines into the environment of `npm run dev:server`
to connect two prototype participants to two local accounts.

What this is **not**:

- not a public PDS and not reachable from outside this machine unless you bind it so;
- not federation: nothing here proves interoperability with bsky.social or any other PDS;
- not a persistent account: the data directory is deleted when the process exits.

Pinned: `@atproto/pds@0.5.52`, following the recipe of `@atproto/dev-env`'s `TestPds`/`TestPlc`.
