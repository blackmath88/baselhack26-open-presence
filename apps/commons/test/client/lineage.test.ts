import { describe, expect, it } from 'vitest'
import { createCommonsReader } from '../../src/commons/retrieval'
import { contributionLineage, passageLineage } from '../../src/commons/client/lineage'
import { parseRoute } from '../../src/commons/client/router'
import { appLinks, type CommonsContribution } from '../../src/commons/contracts'

const reader = createCommonsReader()
const Q = 'My Mac cannot see my frame'
const usb = reader.problem('usb-c-no-data')!
const stage = (stages: ReturnType<typeof passageLineage>, key: string) => stages!.find((s) => s.key === key)!

describe('passage lineage', () => {
  it('has the five stages in order and none for an unknown passage', () => {
    expect(passageLineage(usb, 'e1')!.map((s) => s.key)).toEqual(['source', 'capture', 'interpretation', 'record', 'since'])
    expect(passageLineage(usb, 'nope')).toBeUndefined()
  })

  it('says a document has no recorded author or time instead of filling one in', () => {
    const src = stage(passageLineage(usb, 'e1'), 'source')
    expect(src.state).toBe('partial')
    expect(src.facts.some((f) => f.k === 'Written by')).toBe(false)
    expect(src.unknown.join(' ')).toMatch(/Author: not recorded/)
  })

  it('shows a comment author and time when the snapshot recorded them', () => {
    const e = usb.evidence.find((x) => x.source.objectId.startsWith('comment/') && x.source.author !== 'unknown')!
    const src = stage(passageLineage(usb, e.id), 'source')
    expect(src.state).toBe('recorded')
    expect(src.facts.find((f) => f.k === 'Written by')!.v).toBe(`@${e.source.author}`)
  })

  it('names the capture, says the fingerprint covers the whole object, and that the quote cannot be re-checked here', () => {
    const cap = stage(passageLineage(usb, 'e1'), 'capture')
    expect(cap.facts.find((f) => f.k === 'Snapshot')!.v).toMatch(/^commons-001@/)
    expect(cap.facts.find((f) => f.k === 'Text fingerprint at capture')!.v).toMatch(/whole document, not the passage/)
    expect(cap.unknown.join(' ')).toMatch(/cannot re-check the quote/)
  })

  it('keeps the record writer separate from the source author', () => {
    const i = stage(passageLineage(usb, 'e1'), 'interpretation')
    expect(i.facts.find((f) => f.k === 'Written by')!.v).toMatch(/record writer, not the source author/)
    expect(i.facts.find((f) => f.k === 'Review')!.v).toBe('not reviewed by a person')
  })

  it('says whether the quote matched the situation, from the actual hit', () => {
    const hit = reader.search(Q, 20).find((h) => h.problemId === 'usb-c-no-data')!
    const rec = usb.evidence.map((e) => stage(passageLineage(usb, e.id, { hit, query: Q }), 'record').facts.find((f) => f.k === 'For your words')!.v)
    const quoteTerms = hit.matches.filter((m) => m.field === 'quote').length
    expect(rec.some((v) => v.startsWith('this quote matched'))).toBe(quoteTerms > 0)
    expect(rec.every((v) => /^this quote (matched|did not contribute)/.test(v))).toBe(true)
  })

  it('lists contributions since, telling an exact passage citation from a whole-source one', () => {
    const since = stage(passageLineage(usb, 'e1', { citing: [
      { contributionId: 'contrib_a', kind: 'observation', author: 'Lea', createdAt: '2026-11-01T10:00:00Z', exact: true },
      { contributionId: 'contrib_b', kind: 'question', author: 'Kai', createdAt: '2026-11-01T11:00:00Z', exact: false },
    ] }), 'since')
    expect(since.facts.map((f) => f.k)).toEqual(['Cites this passage', 'Cites its whole source'])
    expect(stage(passageLineage(usb, 'e1'), 'since').state).toBe('absent')
  })
})

const contribution = (extra: Partial<CommonsContribution> = {}): CommonsContribution => ({
  id: 'contrib_x', revision: 1, problemId: 'usb-c-no-data', roomId: 'commons:usb-c-no-data', kind: 'observation', text: 't',
  sourceRefs: [usb.evidence[0]!.source], actor: { id: 'person:lea', displayName: 'Lea', kind: 'participant' }, submittedBy: 'person:lea',
  assistance: { declared: 'none' }, createdAt: '2026-11-01T10:00:00.000Z', origin: { kind: 'local' }, entrance: 'browser',
  evidenceIds: ['e1'], publication: null, links: { app: '#/contributions/contrib_x' }, ...extra,
})

describe('contribution lineage', () => {
  it('says an unpublished contribution is not published, and that assistance is declared', () => {
    const l = contributionLineage(contribution())
    expect(l.find((s) => s.key === 'published')!.state).toBe('absent')
    expect(l.find((s) => s.key === 'published')!.unknown[0]).toMatch(/Not published/)
    expect(l.find((s) => s.key === 'written')!.unknown[0]).toMatch(/declaration/)
  })

  it('links a cited passage to its trace on the record', () => {
    const r = contributionLineage(contribution()).find((s) => s.key === 'responds')!
    expect(r.facts[0]).toMatchObject({ k: 'Cites passage', href: '#/problems/usb-c-no-data?trace=e1' })
  })

  it('does not call a queued publication published', () => {
    const p = contributionLineage(contribution({ publication: { intentId: 'i', contributionId: 'contrib_x', revision: 1, status: 'queued', did: 'did:plc:x', collection: 'c', rkey: 'r', payloadDigest: 'd', attempts: 0 } as CommonsContribution['publication'] })).find((s) => s.key === 'published')!
    expect(p.state).toBe('partial')
    expect(p.unknown[0]).toMatch(/Not confirmed as published/)
  })
})

describe('trace routes', () => {
  it('round-trips an open trace with situation and stage', () => {
    expect(parseRoute(appLinks.problem('usb-c-no-data', Q, { passage: 'e2', stage: 'capture' }))).toEqual({ view: 'problem', problemId: 'usb-c-no-data', query: Q, trace: 'e2', stage: 'capture' })
  })
  it('keeps the canonical link unchanged without a trace, and ignores a stage without a passage', () => {
    expect(appLinks.problem('usb-c-no-data', Q)).toBe(`#/problems/usb-c-no-data?q=${encodeURIComponent(Q)}`)
    expect(parseRoute('#/problems/usb-c-no-data?stage=capture')).toEqual({ view: 'problem', problemId: 'usb-c-no-data' })
  })
})
