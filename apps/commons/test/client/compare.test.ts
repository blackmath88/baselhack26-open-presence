import { describe, expect, it } from 'vitest'
import { compareAccounts } from '../../src/commons/client/compare'
import { parseRoute } from '../../src/commons/client/router'
import { appLinks } from '../../src/commons/contracts'
import { commonsReader } from '../../src/commons/reader'

const a = commonsReader.problem('reset-after-uboot')!
const b = commonsReader.problem('ums-drops-during-backup')!

describe('compareAccounts (records only, no inferred cause)', () => {
  const c = compareAccounts(a, b)
  const field = (f: string) => c.fields.find((x) => x.field === f)!
  it('names entries recorded identically in both', () => {
    expect(field('device').identical).toEqual(['PF1007L (Allwinner A33)'])
    expect(field('environment').identical).toEqual(['Route U'])
  })
  it('keeps what only one record reports', () => {
    expect(field('environment').onlyA).toEqual(['macOS automount'])
    expect(field('outcomes').onlyA).toHaveLength(1)
    expect(field('outcomes').onlyB).toHaveLength(3)
    expect(field('outcomes').identical).toEqual([])
  })
  it('reports shared words separately from identical entries', () => {
    expect(field('symptoms').identical).toEqual([])
    expect(field('symptoms').sharedWords).toEqual(expect.arrayContaining(['disk', 'disappears']))
    expect(field('outcomes').sharedWords).toEqual([])
  })
  it('names sources both records cite', () => {
    expect(c.sharedSources).toEqual(['doc/docs/pf1007l-start-here.md'])
  })
  it('marks a field neither record states as missing', () => {
    const empty = { ...b, outcomes: [] }
    expect(compareAccounts(a, empty).fields.find((x) => x.field === 'outcomes')!.missing).toEqual(['b'])
  })
})

describe('compare links', () => {
  it('round-trips ids and situation, keeps at most two unique ids', () => {
    expect(parseRoute(appLinks.compare(['reset-after-uboot', 'ums-drops-during-backup'], 'My Mac'))).toEqual({ view: 'compare', ids: ['reset-after-uboot', 'ums-drops-during-backup'], query: 'My Mac' })
    expect(parseRoute('#/compare?ids=x,x,y,z')).toEqual({ view: 'compare', ids: ['x', 'y'] })
    expect(parseRoute('#/compare')).toEqual({ view: 'compare', ids: [] })
  })
})
