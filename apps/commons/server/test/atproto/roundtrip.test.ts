/**
 * Round-trip against an ISOLATED local PDS (tools/local-pds), started in-process.
 * This verifies the adapter against a real PDS implementation; it does not verify
 * public federation. If the tooling is not installed the suite skips visibly.
 */
import { afterAll, beforeAll, describe, expect, it } from 'vitest'
import { AtpAgent } from '@atproto/api'
import { createAtprotoAdapter, nextTid } from '../../commons/atproto/index.js'
import type { AtprotoAdapter } from '../../commons/atproto/contract.js'
import { buildInput, contribution } from './fixtures.js'

interface LocalNetwork {
  pdsUrl: string
  plcUrl: string
  createAccount(handle: string, password: string): Promise<{ did: string; handle: string }>
  close(): Promise<void>
}

let network: LocalNetwork | undefined
let skipReason = ''
let alice: { did: string; handle: string }
let bob: { did: string; handle: string }
let adapter: AtprotoAdapter
const PASS = { alice: 'alice-dev-pass', bob: 'bob-dev-pass' }

beforeAll(async () => {
  const modulePath = new URL('../../../tools/local-pds/start.mjs', import.meta.url).href
  let start: ((opts?: Record<string, unknown>) => Promise<LocalNetwork>) | undefined
  try {
    const mod = (await import(/* @vite-ignore */ modulePath)) as { startLocalPds: typeof start }
    start = mod.startLocalPds
  } catch (error) {
    skipReason = `local PDS tooling not installed (run: cd tools/local-pds && npm install): ${error instanceof Error ? error.message.split('\n')[0] : String(error)}`
    return
  }
  network = await start!()
  alice = await network.createAccount('alice.test', PASS.alice)
  bob = await network.createAccount('bob.test', PASS.bob)
  adapter = createAtprotoAdapter({
    allowedPds: [network.pdsUrl], plcUrl: network.plcUrl, appId: 'open-presence-commons-test', timeoutMs: 8000,
    accounts: {
      'person:kai': { service: network.pdsUrl, identifier: alice.handle, password: PASS.alice },
      'person:lea': { service: network.pdsUrl, identifier: bob.handle, password: PASS.bob },
    },
  })
}, 60_000)

afterAll(async () => { await network?.close() })

const guard = () => { if (!network) { console.warn(`[atproto round-trip] SKIPPED: ${skipReason}`); return true } return false }

describe('isolated PDS round-trip', () => {
  let aliceUri = ''
  let aliceCid = ''
  const aliceRkey = nextTid()

  it('refuses a preview for a different account or service before creating a record', async () => {
    if (guard()) return
    const built = adapter.buildRecord(buildInput())
    const rkey = nextTid()
    const request = { actorId: 'person:kai', collection: built.collection, rkey, record: built.record, digest: built.digest }
    expect(await adapter.publisher.reconcileOrCreate({ ...request, expectedSession: { did: bob.did, service: network!.pdsUrl } }))
      .toMatchObject({ outcome: 'unreachable', error: expect.stringMatching(/account.*changed/i) })
    expect(await adapter.publisher.reconcileOrCreate({ ...request, expectedSession: { did: alice.did, service: 'http://different.test' } }))
      .toMatchObject({ outcome: 'unreachable', error: expect.stringMatching(/account.*changed/i) })
    expect(await adapter.reader.getRecord(`at://${alice.did}/${built.collection}/${rkey}`)).toMatchObject({ status: 'missing' })
  }, 20_000)

  it('publishes once and reconciles a repeat at the same key as existing', async () => {
    if (guard()) return
    const built = adapter.buildRecord(buildInput())
    const request = { actorId: 'person:kai', collection: built.collection, rkey: aliceRkey, record: built.record, digest: built.digest }
    const first = await adapter.publisher.reconcileOrCreate(request)
    expect(first).toMatchObject({ outcome: 'created', did: alice.did })
    if (first.outcome !== 'created') return
    aliceUri = first.uri; aliceCid = first.cid
    expect(aliceUri).toBe(`at://${alice.did}/${built.collection}/${aliceRkey}`)
    const again = await adapter.publisher.reconcileOrCreate(request)
    expect(again).toEqual({ outcome: 'existing', uri: aliceUri, cid: aliceCid, did: alice.did })
  })

  it('a timeout after a successful create is recovered on retry with the same key and no duplicate', async () => {
    if (guard()) return
    const fault = { armed: false, fired: 0 }
    const faultyFetch: typeof fetch = async (input, init) => {
      const response = await fetch(input, init)
      const url = typeof input === 'string' ? input : input instanceof URL ? input.href : input.url
      if (fault.armed && url.includes('com.atproto.repo.createRecord')) { fault.fired++; throw new Error('simulated timeout after the server committed') }
      return response
    }
    const faulty = createAtprotoAdapter({
      allowedPds: [network!.pdsUrl], plcUrl: network!.plcUrl, appId: 'open-presence-commons-test', fetch: faultyFetch,
      accounts: { 'person:kai': { service: network!.pdsUrl, identifier: alice.handle, password: PASS.alice } },
    })
    const built = faulty.buildRecord(buildInput({ contribution: contribution({ id: 'contrib_000043', text: 'Second observation, lost acknowledgement test.' }) }))
    const rkey = nextTid()
    const request = { actorId: 'person:kai', collection: built.collection, rkey, record: built.record, digest: built.digest }
    fault.armed = true
    const lost = await faulty.publisher.reconcileOrCreate(request)
    expect(lost).toMatchObject({ outcome: 'unreachable', error: expect.stringMatching(/simulated timeout/) })
    expect(fault.fired).toBe(1)
    fault.armed = false
    const retried = await faulty.publisher.reconcileOrCreate(request)
    expect(retried).toMatchObject({ outcome: 'existing', uri: `at://${alice.did}/${built.collection}/${rkey}` })
    const listed = await adapter.reader.listRecords(alice.did, built.collection)
    expect(listed.status).toBe('page')
    if (listed.status !== 'page') return
    expect(listed.page.records.filter(r => r.rkey === rkey)).toHaveLength(1)
    expect(listed.page.records).toHaveLength(2)
  })

  it('never overwrites: a different record at the same key is a conflict', async () => {
    if (guard()) return
    const built = adapter.buildRecord(buildInput({ contribution: contribution({ text: 'Edited locally after publication.' }) }))
    const result = await adapter.publisher.reconcileOrCreate({ actorId: 'person:kai', collection: built.collection, rkey: aliceRkey, record: built.record, digest: built.digest })
    expect(result).toMatchObject({ outcome: 'conflict', uri: aliceUri, cid: aliceCid })
  })

  it('a second author replies with a versioned reference and both are readable and parseable', async () => {
    if (guard()) return
    const reply = contribution({ id: 'contrib_000050', kind: 'correction', text: 'On my unit the no-HS patch did not help; the 12 MHz build did.', actor: { id: 'person:lea', displayName: 'Lea', kind: 'participant' }, submittedBy: 'person:lea' })
    const built = adapter.buildRecord(buildInput({ contribution: reply, resolved: { parent: { uri: aliceUri, cid: aliceCid } } }))
    const rkey = nextTid()
    const published = await adapter.publisher.reconcileOrCreate({ actorId: 'person:lea', collection: built.collection, rkey, record: built.record, digest: built.digest })
    expect(published).toMatchObject({ outcome: 'created', did: bob.did })

    const fetchedA = await adapter.reader.getRecord(aliceUri)
    expect(fetchedA).toMatchObject({ status: 'found', handle: alice.handle, record: { uri: aliceUri, cid: aliceCid, did: alice.did } })
    const fetchedB = await adapter.reader.getRecord(`at://${bob.handle}/${built.collection}/${rkey}`)
    expect(fetchedB).toMatchObject({ status: 'found', record: { did: bob.did, rkey } })
    if (fetchedB.status !== 'found') return
    const parsed = adapter.parseRecord(fetchedB.record.value)
    expect(parsed).toMatchObject({ ok: true, value: { kind: 'correction', parent: { kind: 'atproto', uri: aliceUri, cid: aliceCid }, origin: { localId: 'contrib_000050' } } })

    const listedB = await adapter.reader.listRecords(bob.did, built.collection, undefined, 10)
    expect(listedB).toMatchObject({ status: 'page', handle: bob.handle })
    if (listedB.status !== 'page') return
    expect(listedB.page.records.map(r => r.rkey)).toEqual([rkey])
    // The PDS may return a cursor on the last page; the end of a scan is an EMPTY page, not a missing cursor.
    if (listedB.page.cursor) {
      const tail = await adapter.reader.listRecords(bob.did, built.collection, listedB.page.cursor, 10)
      expect(tail).toMatchObject({ status: 'page', page: { records: [] } })
    }
  }, 20_000)

  it('paginates listRecords with a cursor', async () => {
    if (guard()) return
    const collection = adapter.namespace.contributionCollection
    const page1 = await adapter.reader.listRecords(alice.did, collection, undefined, 1)
    expect(page1).toMatchObject({ status: 'page' })
    if (page1.status !== 'page') return
    expect(page1.page.records).toHaveLength(1)
    expect(page1.page.cursor).toBeTruthy()
    const page2 = await adapter.reader.listRecords(alice.did, collection, page1.page.cursor, 1)
    if (page2.status !== 'page') throw new Error(JSON.stringify(page2))
    expect(page2.page.records).toHaveLength(1)
    expect(page2.page.records[0].rkey).not.toBe(page1.page.records[0].rkey)
  })

  it('resolves handles and DIDs through the PLC directory and refuses PDSs outside the allowlist', async () => {
    if (guard()) return
    expect(await adapter.reader.resolveIdentity(alice.handle)).toEqual({ did: alice.did, handle: alice.handle, pdsEndpoint: network!.pdsUrl })
    expect(await adapter.reader.resolveIdentity(bob.did)).toEqual({ did: bob.did, handle: bob.handle, pdsEndpoint: network!.pdsUrl })
    const closed = createAtprotoAdapter({ allowedPds: [], plcUrl: network!.plcUrl, accounts: {}, appId: 'x' })
    expect(await closed.reader.resolveIdentity(alice.did)).toMatchObject({ refused: expect.stringMatching(/allowlist/) })
    expect(await closed.reader.getRecord(aliceUri)).toMatchObject({ status: 'refused' })
    expect(await closed.reader.listRecords(alice.did, adapter.namespace.contributionCollection)).toMatchObject({ status: 'refused' })
    const session = await adapter.sessions.sessionFor('person:kai')
    expect(session).toEqual({ did: alice.did, handle: alice.handle, service: network!.pdsUrl })
    expect(await adapter.sessions.sessionFor('person:mara')).toBeUndefined()
  })

  it('reports an unreachable PDS as unreachable, not as missing', async () => {
    if (guard()) return
    const dead = createAtprotoAdapter({ allowedPds: ['http://127.0.0.1:1'], plcUrl: network!.plcUrl, accounts: {}, appId: 'x', timeoutMs: 2000 })
    // alice's PDS is not allowlisted here, so identity resolution refuses before any record fetch.
    expect(await dead.reader.getRecord(aliceUri)).toMatchObject({ status: 'refused' })
    const unreachable = createAtprotoAdapter({ allowedPds: [network!.pdsUrl], plcUrl: 'http://127.0.0.1:1', accounts: {}, appId: 'x', timeoutMs: 2000 })
    expect(await unreachable.reader.getRecord(aliceUri)).toMatchObject({ status: 'unreachable' })
  })

  it('a deleted record reads as missing, and the author’s other records stay', async () => {
    if (guard()) return
    const agent = new AtpAgent({ service: network!.pdsUrl })
    await agent.login({ identifier: alice.handle, password: PASS.alice })
    await agent.com.atproto.repo.deleteRecord({ repo: alice.did, collection: adapter.namespace.contributionCollection, rkey: aliceRkey })
    expect(await adapter.reader.getRecord(aliceUri)).toMatchObject({ status: 'missing', pdsEndpoint: network!.pdsUrl })
    const listed = await adapter.reader.listRecords(alice.did, adapter.namespace.contributionCollection)
    if (listed.status !== 'page') throw new Error(JSON.stringify(listed))
    expect(listed.page.records.map(r => r.rkey)).not.toContain(aliceRkey)
    expect(listed.page.records).toHaveLength(1)
  })
})
