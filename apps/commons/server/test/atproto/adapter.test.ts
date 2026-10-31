/** Offline adapter checks: Lexicon validity, deterministic build/digest, bounded parsing, refusals. No network. */
import { describe, expect, it } from 'vitest'
import { createHash } from 'node:crypto'
import { parseLexiconDoc } from '@atproto/lexicon'
import defs from '../../../lexicons/test/openpresence/commons/defs.json' with { type: 'json' }
import contributionDoc from '../../../lexicons/test/openpresence/commons/contribution.json' with { type: 'json' }
import { canonicalJson, createAtprotoAdapter, DEFAULT_NAMESPACE, LIMITS, nextTid } from '../../commons/atproto/index.js'
import { buildInput, contribution } from './fixtures.js'

const adapter = () => createAtprotoAdapter({ allowedPds: ['http://localhost:2583'], accounts: {}, appId: 'open-presence-commons-test' })

describe('Lexicons', () => {
  it('commits valid Lexicon documents in the development namespace', () => {
    for (const doc of [defs, contributionDoc]) expect(() => parseLexiconDoc(doc)).not.toThrow()
    expect(contributionDoc.id).toBe(`${DEFAULT_NAMESPACE}.contribution`)
    expect(defs.description).toMatch(/reserved/)
  })
})

describe('buildRecord', () => {
  it('is deterministic and binds the digest to canonical JSON', () => {
    const a = adapter(), b = adapter()
    const first = a.buildRecord(buildInput()), second = b.buildRecord(buildInput())
    expect(first).toEqual(second)
    expect(first.collection).toBe(`${DEFAULT_NAMESPACE}.contribution`)
    expect(first.digest).toBe(createHash('sha256').update(canonicalJson(first.record)).digest('hex'))
    expect(first.record).toMatchObject({ $type: first.collection, kind: 'observation', origin: { app: 'open-presence-commons-test', localId: 'contrib_000042', revision: 1 } })
    expect(first.record.parent).toBeUndefined()
  })
  it('changes the digest when text, revision or references change', () => {
    const a = adapter()
    const base = a.buildRecord(buildInput()).digest
    expect(a.buildRecord(buildInput({ contribution: contribution({ text: 'different' }) })).digest).not.toBe(base)
    expect(a.buildRecord(buildInput({ contribution: contribution({ revision: 2 }) })).digest).not.toBe(base)
    const withParent = a.buildRecord(buildInput({ resolved: { parent: { uri: 'at://did:plc:abc/test.openpresence.commons.contribution/3abc', cid: 'bafyreigdyrzt5sfp7udm7hu76uh7y26nf3efuylqabf3oclgtqy55fbzdi' } } }))
    expect(withParent.digest).not.toBe(base)
    expect(withParent.record.parent).toEqual({ uri: 'at://did:plc:abc/test.openpresence.commons.contribution/3abc', cid: 'bafyreigdyrzt5sfp7udm7hu76uh7y26nf3efuylqabf3oclgtqy55fbzdi' })
  })
  it('refuses to build an invalid record', () => {
    expect(() => adapter().buildRecord(buildInput({ contribution: contribution({ text: '' }) }))).toThrow()
    expect(() => adapter().buildRecord(buildInput({ contribution: contribution({ createdAt: 'yesterday' }) }))).toThrow()
  })
  it('supports a configured namespace end to end', () => {
    const custom = createAtprotoAdapter({ namespace: 'test.other.commons', allowedPds: [], accounts: {}, appId: 'x' })
    const built = custom.buildRecord(buildInput())
    expect(built.collection).toBe('test.other.commons.contribution')
    expect(custom.parseRecord(built.record)).toMatchObject({ ok: true })
    expect(adapter().parseRecord(built.record)).toMatchObject({ ok: false })
  })
})

describe('parseRecord', () => {
  const a = adapter()
  const good = () => a.buildRecord(buildInput({ contribution: contribution({ assistance: { declared: 'ai-drafted', preparedBy: 'ai:test' }, observedAt: '2026-10-30T10:00:00.000Z' }) })).record
  it('accepts a built record and preserves every field', () => {
    const result = a.parseRecord(good())
    expect(result.ok).toBe(true)
    if (!result.ok) return
    expect(result.value).toMatchObject({
      kind: 'observation', circumstances: 'macOS 15, USB-C cable', observedAt: '2026-10-30T10:00:00.000Z',
      problem: { localId: 'usb-c-no-data', repository: 'wesbos/photo-frame-dashboard' },
      sourceRefs: [{ objectId: 'issue/62', digest: 'abc123' }],
      assistance: { declared: 'ai-drafted', preparedBy: 'ai:test' },
      origin: { app: 'open-presence-commons-test', localId: 'contrib_000042', revision: 1 },
    })
    expect(result.value.parent).toBeUndefined()
  })
  it('maps strong references to atproto refs', () => {
    const rec = { ...good(), parent: { uri: 'at://did:plc:abc/test.openpresence.commons.contribution/3abc', cid: 'bafyreigdyrzt5sfp7udm7hu76uh7y26nf3efuylqabf3oclgtqy55fbzdi' } }
    const result = a.parseRecord(rec)
    expect(result).toMatchObject({ ok: true, value: { parent: { kind: 'atproto', uri: 'at://did:plc:abc/test.openpresence.commons.contribution/3abc' } } })
  })
  it('rejects wrong $type, missing fields, unknown kinds and oversize bodies without throwing', () => {
    expect(a.parseRecord({ ...good(), $type: 'app.bsky.feed.post' })).toMatchObject({ ok: false, reason: expect.stringMatching(/\$type/) })
    expect(a.parseRecord({ ...good(), problem: undefined })).toMatchObject({ ok: false })
    expect(a.parseRecord({ ...good(), kind: 'rant' })).toMatchObject({ ok: false, reason: expect.stringMatching(/kind/) })
    expect(a.parseRecord({ ...good(), assistance: { declared: 'maybe' } })).toMatchObject({ ok: false })
    expect(a.parseRecord({ ...good(), text: 'x'.repeat(LIMITS.textBytes + 1) })).toMatchObject({ ok: false })
    expect(a.parseRecord({ ...good(), sourceRefs: Array.from({ length: LIMITS.sourceRefs + 1 }, () => ({ objectId: 'issue/1', permalink: 'https://github.com/x/y/issues/1' })) })).toMatchObject({ ok: false })
    expect(a.parseRecord({ ...good(), parent: { uri: 'not a uri', cid: 'nope' } })).toMatchObject({ ok: false })
    expect(a.parseRecord('string')).toMatchObject({ ok: false })
    expect(a.parseRecord(null)).toMatchObject({ ok: false })
  })
})

describe('record keys', () => {
  it('generates 13-character, strictly increasing TIDs', () => {
    const keys = Array.from({ length: 50 }, nextTid)
    for (const k of keys) expect(k).toMatch(/^[234567a-z]{13}$/)
    expect([...keys].sort()).toEqual(keys)
    expect(new Set(keys).size).toBe(keys.length)
  })
})

describe('refusals without network', () => {
  it('refuses bad identifiers, foreign collections and unresolvable did:plc without a directory', async () => {
    const a = adapter()
    expect(await a.reader.resolveIdentity('not an identifier!')).toMatchObject({ refused: expect.any(String) })
    expect(await a.reader.resolveIdentity('did:plc:oavdsa27i5yqfvkhbmtj7bu5')).toMatchObject({ refused: expect.stringMatching(/PLC/) })
    expect(await a.reader.resolveIdentity('did:key:zQ3sh')).toMatchObject({ refused: expect.any(String) })
    expect(await a.reader.getRecord('https://example.com/not-at')).toMatchObject({ status: 'refused' })
    expect(await a.reader.getRecord('at://did:plc:abc/app.bsky.feed.post/3abc')).toMatchObject({ status: 'refused', reason: expect.stringMatching(/Collection/) })
    expect(await a.reader.listRecords('did:plc:abc', 'app.bsky.feed.post')).toMatchObject({ status: 'refused' })
    expect(await a.publisher.reconcileOrCreate({ actorId: 'person:nobody', collection: a.namespace.contributionCollection, rkey: nextTid(), record: {}, digest: 'x' }))
      .toMatchObject({ outcome: 'unreachable', error: expect.stringMatching(/no connected account/) })
  })
  it('describes activation state without secrets', () => {
    expect(adapter().describe()).toMatchObject({ namespace: DEFAULT_NAMESPACE, allowedPds: ['http://localhost:2583'], sessions: { mode: 'none', configured: [] } })
    const withAccount = createAtprotoAdapter({ allowedPds: ['http://localhost:2583'], accounts: { 'person:kai': { service: 'http://localhost:2583', identifier: 'alice.test', password: 'secret-pass' } }, appId: 'x' })
    const described = JSON.stringify(withAccount.describe())
    expect(described).toContain('person:kai')
    expect(described).not.toContain('secret-pass')
    expect(described).not.toContain('alice.test')
  })
  it('refuses a configured account whose service is outside the allowlist', async () => {
    const a = createAtprotoAdapter({ allowedPds: ['http://localhost:2583'], accounts: { 'person:kai': { service: 'http://evil.localhost:9999', identifier: 'a', password: 'b' } }, appId: 'x' })
    expect(await a.publisher.reconcileOrCreate({ actorId: 'person:kai', collection: a.namespace.contributionCollection, rkey: nextTid(), record: {}, digest: 'x' }))
      .toMatchObject({ outcome: 'unreachable', error: expect.stringMatching(/allowlist/) })
  })
})
