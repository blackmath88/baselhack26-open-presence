import { describe, it, expect } from 'vitest'
import { createCommonsReader } from '../../src/commons/retrieval'
import { matchBasis } from '../../src/commons/client/matchBasis'
import { parseRoute } from '../../src/commons/client/router'
import { appLinks } from '../../src/commons/contracts'

const reader = createCommonsReader()
const Q = 'My Mac cannot see my frame'

describe('find → inspect route context', () => {
  it('a problem link carries the situation and parses back to it', () => {
    const link = appLinks.problem('usb-c-no-data', Q)
    expect(parseRoute(link)).toEqual({ view: 'problem', problemId: 'usb-c-no-data', query: Q })
  })
  it('without a situation the problem link stays canonical', () => {
    expect(appLinks.problem('usb-c-no-data')).toBe('#/problems/usb-c-no-data')
    expect(parseRoute('#/problems/usb-c-no-data?q=%20%20')).toEqual({ view: 'problem', problemId: 'usb-c-no-data' })
  })
  it('the way back names the result it came from', () => {
    expect(parseRoute(appLinks.search(Q, 'usb-c-no-data'))).toEqual({ view: 'search', query: Q, selected: 'usb-c-no-data' })
    expect(parseRoute(appLinks.search(Q))).toEqual({ view: 'search', query: Q })
  })
  it('keeps characters that would break a naive hash parser', () => {
    const q = 'frame? & "boot" #loop'
    expect(parseRoute(appLinks.problem('x', q))).toEqual({ view: 'problem', problemId: 'x', query: q })
  })
})

describe('match basis is a regrouping of the actual hit', () => {
  const hit = reader.search(Q)[0]!
  const basis = matchBasis(Q, hit)
  it('uses the real top hit', () => expect(hit.problemId).toBe('usb-c-no-data'))
  it('separates the searcher’s own words, writer vocabulary and search-added words', () => {
    expect(basis.yourWords.map((t) => t.term)).toEqual(expect.arrayContaining(['mac', 'frame']))
    expect(basis.yourWords.find((t) => t.term === 'mac')!.fields).toEqual(['quote'])
    expect(basis.onlyWriterVocabulary.map((t) => t.term)).toEqual(['see'])
    expect(basis.addedBySearch.map((t) => t.term)).toEqual(expect.arrayContaining(['usb', 'data']))
    expect(basis.unmatched).toEqual(['cannot'])
  })
  it('shows words as written, not as indexed', () => {
    const q2 = 'My Mac cannot see my frame'
    const h2 = reader.search(q2, 8).find((h) => h.problemId === 'reset-after-uboot')!
    const added = matchBasis(q2, h2).addedBySearch.find((t) => t.term === 'maco')
    expect(added?.word).toBe('macOS')
    expect(matchBasis(q2, h2).yourWords.find((t) => t.term === 'frame')?.word).toBe('frame')
  })
  it('every listed field comes from the hit, and every hit match is listed', () => {
    const listed = [...basis.yourWords, ...basis.onlyWriterVocabulary, ...basis.addedBySearch]
      .flatMap((t) => t.fields.map((f) => `${t.term}:${f}`)).sort()
    const actual = [...new Set(hit.matches.map((m) => `${m.term}:${m.field}`))].sort()
    expect(listed).toEqual(actual)
  })
})

describe('a near-match keeps its difference visible', () => {
  const q = 'backup disk disappears on my Mac'
  const hit = reader.search(q, 8).find((h) => h.problemId === 'wsl-usbipd-ums')!
  it('is flagged by the reader and lists the platform word as unmatched', () => {
    expect(hit.nearMatch).toBe(true)
    expect(matchBasis(q, hit).unmatched).toContain('Mac')
  })
})
