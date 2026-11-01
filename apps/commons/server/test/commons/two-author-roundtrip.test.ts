/**
 * M3/M4 against an ISOLATED local PDS (tools/local-pds): two development
 * accounts, two app instances. App A: Kai publishes, Lea replies with a
 * versioned reference. App B (fresh, never published) ingests both authors and
 * reconstructs the thread with DIDs, CIDs and source refs intact. Skips
 * visibly when the tooling is not installed. This is not public federation.
 */
import { afterAll, beforeAll, describe, expect, it } from 'vitest'
import type { CommonsContribution, ImportedProblem } from '../../../src/commons/contracts.js'
import fixtures from './real-records.json'
import { createAtprotoAdapter } from '../../commons/atproto/index.js'
import type { AtprotoAdapter } from '../../commons/atproto/contract.js'
import { createCommonsImporter } from '../../commons/import.js'
import { createCommonsService } from '../../commons/service.js'
import { createMemoryRepository } from '../../persistence/json-repository.js'
import { DEFAULT_SCOPES, type ActorContext } from '../../auth/actor-context.js'

interface LocalNetwork { pdsUrl: string; plcUrl: string; createAccount(handle: string, password: string): Promise<{ did: string; handle: string }>; close(): Promise<void> }
const sources = fixtures as ImportedProblem[]
const PROBLEM = 'emmc-not-exposed'
const kai: ActorContext = { actorId: 'person:kai', displayName: 'Kai', scopes: DEFAULT_SCOPES }
const lea: ActorContext = { actorId: 'person:lea', displayName: 'Lea', scopes: DEFAULT_SCOPES }
const clock = (() => { let t = Date.parse('2026-10-31T17:00:00.000Z'); return { now: () => new Date((t += 1000)).toISOString() } })()
let network: LocalNetwork | undefined
let skipReason = ''
let alice: { did: string; handle: string }
let bob: { did: string; handle: string }
let adapterA: AtprotoAdapter
let adapterB: AtprotoAdapter

beforeAll(async () => {
  const modulePath = new URL('../../../tools/local-pds/start.mjs', import.meta.url).href
  try {
    const mod = (await import(/* @vite-ignore */ modulePath)) as { startLocalPds: () => Promise<LocalNetwork> }
    network = await mod.startLocalPds()
  } catch (error) {
    skipReason = `local PDS tooling not installed (cd tools/local-pds && npm install): ${error instanceof Error ? error.message.split('\n')[0] : String(error)}`
    return
  }
  alice = await network.createAccount('alice.test', 'alice-dev-pass')
  bob = await network.createAccount('bob.test', 'bob-dev-pass')
  const base = { allowedPds: [network.pdsUrl], plcUrl: network.plcUrl, appId: 'open-presence-commons-test', timeoutMs: 8000 }
  adapterA = createAtprotoAdapter({ ...base, accounts: {
    'person:kai': { service: network.pdsUrl, identifier: alice.handle, password: 'alice-dev-pass' },
    'person:lea': { service: network.pdsUrl, identifier: bob.handle, password: 'bob-dev-pass' },
  } })
  adapterB = createAtprotoAdapter({ ...base, accounts: {} })
}, 60_000)
afterAll(async () => { await network?.close() })
const guard = () => { if (!network) { console.warn(`[two-author round-trip] SKIPPED: ${skipReason}`); return true } return false }

async function app(adapter: AtprotoAdapter) {
  const repository = createMemoryRepository()
  const service = createCommonsService({ repository, clock, atproto: adapter, appUrl: 'http://localhost:5173', appId: 'open-presence-commons-test' })
  await createCommonsImporter(repository, clock)(sources)
  return service
}

describe('two authors through a real isolated PDS, rebuilt by a fresh index', () => {
  it('A publishes, B replies with a versioned reference, a fresh app ingests both and reconstructs the thread', async () => {
    if (guard()) return
    const ref = sources[0].evidence[0].source.objectId
    const appA = await app(adapterA)
    // Kai (alice.test) publishes an observation.
    const kaiLocal = await appA.submitContribution(kai, { commandId: 'rt-1', problemId: PROBLEM, text: 'Real PDS round trip: amber-kestrel-9034 my unit needed the 12 MHz build', kind: 'outcome', sourceRefs: [ref] })
    const preparedA = await appA.preparePublication(kai, { contributionId: kaiLocal.contributionId })
    if (!preparedA.ready) throw new Error(`not ready: ${JSON.stringify(preparedA)}`)
    expect(preparedA.destination.did).toBe(alice.did)
    const publishedA = await appA.publishContribution(kai, { intentId: preparedA.intent.intentId })
    expect(publishedA.receipt).toMatchObject({ status: 'published', did: alice.did, rkey: preparedA.intent.rkey })
    expect(publishedA.receipt.uri).toBe(`at://${alice.did}/${preparedA.intent.collection}/${preparedA.intent.rkey}`)
    expect(publishedA.receipt.cid).toMatch(/^b[a-z2-7]{20,}$/)
    // Publishing again at the same key is a replay; a second drain finds the record existing. Exactly one record on the PDS.
    expect((await appA.publishContribution(kai, { intentId: preparedA.intent.intentId })).receipt.status).toBe('published')
    const listed = await adapterB.reader.listRecords(alice.did, adapterA.namespace.contributionCollection)
    expect(listed.status === 'page' && listed.page.records).toHaveLength(1)
    // Lea (bob.test) replies locally to Kai's contribution and publishes; the record carries a strongRef to Kai's URI+CID.
    const leaLocal = await appA.submitContribution(lea, { commandId: 'rt-2', problemId: PROBLEM, text: 'Reply over ATProto: which boot hash did your unit report?', kind: 'question', parentId: kaiLocal.contributionId, sourceRefs: [] })
    const preparedB = await appA.preparePublication(lea, { contributionId: leaLocal.contributionId })
    if (!preparedB.ready) throw new Error(`not ready: ${JSON.stringify(preparedB)}`)
    expect(preparedB.warnings).toEqual([])
    expect(preparedB.preview.parent).toEqual({ uri: publishedA.receipt.uri, cid: publishedA.receipt.cid })
    const publishedB = await appA.publishContribution(lea, { intentId: preparedB.intent.intentId })
    expect(publishedB.receipt).toMatchObject({ status: 'published', did: bob.did })
    // App A syncing its own authors creates no echoes.
    expect((await appA.syncAuthor(kai, { did: alice.did })).outcomes.created).toBe(0)
    expect((await appA.syncAuthor(kai, { did: bob.handle })).outcomes.created).toBe(0)
    expect((await appA.getProblem(kai, PROBLEM)).contributions).toHaveLength(2)

    // App B: a fresh index that never saw either submission.
    const appB = await app(adapterB)
    expect((await appB.getProblem(kai, PROBLEM)).contributions).toHaveLength(0)
    const syncA = await appB.syncAuthor(kai, { did: alice.did })
    expect(syncA).toMatchObject({ status: 'complete', records: 1, outcomes: { created: 1 }, handle: alice.handle })
    const syncB = await appB.syncAuthor(kai, { did: bob.did })
    expect(syncB).toMatchObject({ status: 'complete', records: 1, outcomes: { created: 1 } })
    const view = await appB.getProblem(kai, PROBLEM)
    expect(view.contributions).toHaveLength(2)
    const byAuthor = new Map(view.contributions.map(c => [(c as CommonsContribution).actor.id, c as CommonsContribution]))
    const fromAlice = byAuthor.get(alice.did)!
    const fromBob = byAuthor.get(bob.did)!
    expect(fromAlice).toMatchObject({ kind: 'outcome', revision: 1, actor: { kind: 'atproto', displayName: alice.handle }, origin: { kind: 'atproto', uri: publishedA.receipt.uri, cid: publishedA.receipt.cid, did: alice.did, availability: 'available' } })
    expect(fromAlice.text).toContain('amber-kestrel-9034')
    // Source identities (GitHub authors in the pinned snapshot) differ from contribution authors (DIDs).
    expect(fromAlice.sourceRefs.map(s => s.objectId)).toEqual([ref])
    expect(fromAlice.sourceRefs[0].author).not.toBe(alice.did)
    // The fresh instance labels both as arriving over ATProto and rediscovers Alice's record from the cited source object.
    expect([fromAlice.entrance, fromBob.entrance]).toEqual(['atproto', 'atproto'])
    const browsed = await appB.browseRepository(kai, { object: ref })
    expect(browsed.view === 'thread' && browsed.thread.contributions.map(c => [c.actor.id, c.entrance])).toEqual([[alice.did, 'atproto']])
    expect(fromBob.parent).toEqual({ kind: 'atproto', uri: publishedA.receipt.uri, cid: publishedA.receipt.cid })
    const thread = await appB.getThread(kai, fromBob.id)
    expect(thread.root.contribution.id).toBe(fromAlice.id)
    expect(thread.root.replies.map(r => (r.contribution as CommonsContribution).actor.id)).toEqual([bob.did])
    expect(thread.participants.sort()).toEqual([alice.did, bob.did].sort())
    // Discoverable in the fresh app from the search entrance, with the right author.
    const found = await appB.search(kai, { query: 'amber-kestrel-9034' })
    expect(found.contributions[0]?.summary.actor.id).toBe(alice.did)
    // Context from the fresh app names the ATProto origin and the sync freshness.
    const context = await appB.getContext(kai, { contributionId: fromBob.id })
    expect(context.contributions.map(c => c.origin)).toEqual(['atproto', 'atproto'])
    expect(context.freshness.lastSync.map(s => s.did).sort()).toEqual([alice.did, bob.did].sort())
    // Alice edits upstream: the same contribution advances to revision 2 in app B, no new participant.
    const session = await adapterA.sessions.sessionFor('person:kai')
    expect(session?.did).toBe(alice.did)
    const { AtpAgent } = await import('@atproto/api')
    const agent = new AtpAgent({ service: network!.pdsUrl })
    await agent.login({ identifier: alice.handle, password: 'alice-dev-pass' })
    const current = await agent.com.atproto.repo.getRecord({ repo: alice.did, collection: preparedA.intent.collection, rkey: preparedA.intent.rkey })
    await agent.com.atproto.repo.putRecord({ repo: alice.did, collection: preparedA.intent.collection, rkey: preparedA.intent.rkey, record: { ...(current.data.value as Record<string, unknown>), text: 'Edited upstream: amber-kestrel-9034 and it also needed START STOP' }, validate: false })
    expect((await appB.syncAuthor(kai, { did: alice.did })).outcomes.updated).toBe(1)
    const edited = (await appB.getContribution(kai, fromAlice.id)) as CommonsContribution
    expect(edited.revision).toBe(2)
    expect(edited.text).toContain('Edited upstream')
    expect((await appB.getProblem(kai, PROBLEM)).contributions).toHaveLength(2)
    // App A sees its own record edited remotely as a new version of Kai's contribution.
    expect((await appA.syncAuthor(kai, { did: alice.did })).outcomes['self-updated']).toBe(1)
    expect(((await appA.getContribution(kai, kaiLocal.contributionId)) as CommonsContribution).revision).toBe(2)
    // Bob deletes his reply: app B marks it unavailable after a complete scan; Alice's record stays.
    await (async () => { const b = new AtpAgent({ service: network!.pdsUrl }); await b.login({ identifier: bob.handle, password: 'bob-dev-pass' }); await b.com.atproto.repo.deleteRecord({ repo: bob.did, collection: preparedB.intent.collection, rkey: preparedB.intent.rkey }) })()
    expect((await appB.syncAuthor(kai, { did: bob.did })).deleted).toBe(1)
    const after = await appB.getProblem(kai, PROBLEM)
    expect(after.contributions.find(c => c.id === fromBob.id)).toMatchObject({ moderated: true, reason: 'deleted' })
    expect(after.contributions.find(c => c.id === fromAlice.id)).toMatchObject({ revision: 2 })
  }, 60_000)
})
