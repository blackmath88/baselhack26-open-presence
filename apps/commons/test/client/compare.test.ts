import { describe, it, expect } from 'vitest'
import { createCommonsReader } from '../../src/commons/retrieval'
import { compareRecords } from '../../src/commons/client/comparison'
import { parseRoute } from '../../src/commons/client/router'
import { appLinks } from '../../src/commons/contracts'

const reader = createCommonsReader()
const Q = 'My Mac cannot see my frame'
const p = (id: string) => reader.problem(id)!

describe('compare routes', () => {
  it('round-trips a comparison with the situation', () => {
    expect(parseRoute(appLinks.compare('reset-after-uboot', 'ums-drops-during-backup', Q)))
      .toEqual({ view: 'compare', a: 'reset-after-uboot', b: 'ums-drops-during-backup', query: Q })
  })
  it('rejects comparing a record with itself or with nothing', () => {
    expect(parseRoute('#/compare?a=x&b=x').view).toBe('home')
    expect(parseRoute('#/compare?a=x').view).toBe('home')
  })
  it('keeps at most two distinct chosen records on the results', () => {
    expect(parseRoute(appLinks.search(Q, undefined, ['a', 'b']))).toEqual({ view: 'search', query: Q, compare: ['a', 'b'] })
    expect(parseRoute('#/search?q=x&compare=a,a,b,c')).toEqual({ view: 'search', query: 'x', compare: ['a', 'b'] })
  })
})

describe('two real accounts with a similar symptom', () => {
  const c = compareRecords(p('reset-after-uboot'), p('ums-drops-during-backup'))
  const row = (f: string) => c.rows.find((r) => r.field === f)!
  it('names what both state', () => {
    expect(c.shared).toEqual(['device', 'environment'])
    expect(row('environment').common).toEqual(['Route U'])
    expect(row('environment').commonB).toEqual(['Route U'])
  })
  it('names what both state differently', () => expect(c.differs).toEqual(['symptoms', 'outcomes']))
  it('carries the relationship each record declares, with its origin', () => {
    expect(c.declared.map((d) => [d.from, d.origin])).toEqual([['a', 'source'], ['b', 'postack-agent']])
  })
  it('never matches status or corrections, and marks what is not stated', () => {
    expect(row('status').common).toEqual([])
    expect(row('corrections').missing).toEqual({ a: true, b: true })
  })
  it('is symmetric', () => {
    const r = compareRecords(p('ums-drops-during-backup'), p('reset-after-uboot'))
    expect(r.shared).toEqual(c.shared)
    expect(r.differs).toEqual(c.differs)
  })
})

describe('every record pair in the corpus', () => {
  it('only reports items that appear verbatim in its own record', () => {
    const all = reader.problems()
    for (const a of all) for (const b of all) {
      if (a === b) continue
      for (const r of compareRecords(a, b).rows) {
        for (const x of r.common) expect(r.a).toContain(x)
        for (const y of r.commonB) expect(r.b).toContain(y)
      }
    }
  })
})
