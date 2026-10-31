/**
 * In-memory stand-in for an ATProto PDS, used to test the Commons service's
 * outbox and ingestion semantics deterministically. Record building and
 * parsing are the REAL adapter's; only sessions, transport and storage are
 * faked. This is adapter-level verification, not federation.
 */
import { createHash } from 'node:crypto'
import type { AtprotoAdapter, ListResult, RemoteRecord } from '../../commons/atproto/contract.js'
import { canonicalJson, createAtprotoAdapter } from '../../commons/atproto/index.js'

export interface FakeAccount { did: string; handle: string }

export function createFakeAtproto(options: { appId: string; accounts?: Record<string, FakeAccount>; identities?: FakeAccount[] }) {
  const real = createAtprotoAdapter({ allowedPds: [], accounts: {}, appId: options.appId })
  const accounts = options.accounts ?? {}
  const identities = new Map<string, FakeAccount>()
  for (const a of [...Object.values(accounts), ...(options.identities ?? [])]) identities.set(a.did, a)
  const store = new Map<string, RemoteRecord>()
  const faults = { timeoutAfterWrite: 0, listUnreachable: false, getUnreachable: false }
  const service = 'http://fake-pds.test'
  // A syntactically valid CIDv1 (dag-cbor, sha2-256) over the canonical JSON, so strong refs built from it validate.
  const B32 = 'abcdefghijklmnopqrstuvwxyz234567'
  const base32 = (bytes: Uint8Array) => { let bits = 0, value = 0, out = ''; for (const b of bytes) { value = (value << 8) | b; bits += 8; while (bits >= 5) { out += B32[(value >>> (bits - 5)) & 31]; bits -= 5 } } if (bits > 0) out += B32[(value << (5 - bits)) & 31]; return out }
  const cidOf = (value: unknown) => `b${base32(Buffer.concat([Buffer.from([0x01, 0x71, 0x12, 0x20]), createHash('sha256').update(canonicalJson(value)).digest()]))}`
  const calls: string[] = []

  const adapter: AtprotoAdapter = {
    namespace: real.namespace,
    buildRecord: input => real.buildRecord(input),
    parseRecord: value => real.parseRecord(value),
    sessions: {
      sessionFor: async actorId => (accounts[actorId] ? { did: accounts[actorId].did, handle: accounts[actorId].handle, service } : undefined),
      describe: () => ({ mode: 'credentials', configured: Object.keys(accounts), note: 'fake in-memory PDS for tests' }),
    },
    publisher: {
      async reconcileOrCreate(request) {
        calls.push(`publish:${request.rkey}`)
        const account = accounts[request.actorId]
        if (!account) return { outcome: 'unreachable', error: `no connected account for ${request.actorId}` }
        const uri = `at://${account.did}/${request.collection}/${request.rkey}`
        const existing = store.get(uri)
        if (existing) {
          return canonicalJson(existing.value) === canonicalJson(request.record)
            ? { outcome: 'existing', uri, cid: existing.cid, did: account.did }
            : { outcome: 'conflict', uri, cid: existing.cid, did: account.did }
        }
        const record: RemoteRecord = { uri, cid: cidOf(request.record), did: account.did, collection: request.collection, rkey: request.rkey, value: structuredClone(request.record) }
        store.set(uri, record)
        if (faults.timeoutAfterWrite > 0) { faults.timeoutAfterWrite -= 1; return { outcome: 'unreachable', error: 'simulated timeout after the write reached the PDS' } }
        return { outcome: 'created', uri, cid: record.cid, did: account.did }
      },
    },
    reader: {
      async resolveIdentity(didOrHandle) {
        const found = identities.get(didOrHandle) ?? [...identities.values()].find(a => a.handle === didOrHandle)
        return found ? { did: found.did, handle: found.handle, pdsEndpoint: service } : { refused: `unknown identity ${didOrHandle} (fake directory)` }
      },
      async getRecord(uri) {
        calls.push(`get:${uri}`)
        if (faults.getUnreachable) return { status: 'unreachable', error: 'simulated network failure' }
        const record = store.get(uri)
        const handle = record ? identities.get(record.did)?.handle : undefined
        return record ? { status: 'found', record: structuredClone(record), pdsEndpoint: service, ...(handle ? { handle } : {}) } : { status: 'missing', pdsEndpoint: service }
      },
      async listRecords(did, collection, cursor, limit = 50): Promise<ListResult> {
        calls.push(`list:${did}:${cursor ?? ''}`)
        if (faults.listUnreachable) return { status: 'unreachable', error: 'simulated network failure during listing' }
        const all = [...store.values()].filter(r => r.did === did && r.collection === collection).sort((a, b) => a.rkey.localeCompare(b.rkey))
        const start = cursor ? all.findIndex(r => r.rkey === cursor) + 1 : 0
        const page = all.slice(start, start + limit)
        // Like the real PDS: a cursor comes back with every non-empty page; the end is an empty page.
        const handle = identities.get(did)?.handle
        return { status: 'page', page: { records: structuredClone(page), ...(page.length ? { cursor: page[page.length - 1].rkey } : {}) }, pdsEndpoint: service, ...(handle ? { handle } : {}) }
      },
    },
    describe: () => ({ namespace: real.namespace.authority, allowedPds: [service], sessions: { mode: 'credentials', configured: Object.keys(accounts), note: 'fake' } }),
  }

  return {
    adapter, store, faults, calls, service,
    /** Simulates another author's publication without going through the service. */
    put(account: FakeAccount, rkey: string, value: Record<string, unknown>) {
      identities.set(account.did, account)
      const uri = `at://${account.did}/${real.namespace.contributionCollection}/${rkey}`
      const record: RemoteRecord = { uri, cid: cidOf(value), did: account.did, collection: real.namespace.contributionCollection, rkey, value: structuredClone(value) }
      store.set(uri, record)
      return record
    },
    delete(uri: string) { store.delete(uri) },
    count(did: string) { return [...store.values()].filter(r => r.did === did).length },
  }
}
