import { describe, expect, it } from 'vitest'
import { parseRoute } from '../../src/commons/client/router'
import { appLinks } from '../../src/commons/contracts'

describe('problem links carry the searched situation', () => {
  it('round-trips the query through the problem link', () => {
    const q = 'My Mac cannot see my frame & more?'
    expect(parseRoute(appLinks.problem('usb-c-no-data', q))).toEqual({ view: 'problem', problemId: 'usb-c-no-data', query: q })
  })
  it('keeps old problem links unchanged', () => {
    expect(appLinks.problem('usb-c-no-data')).toBe('#/problems/usb-c-no-data')
    expect(parseRoute('#/problems/usb-c-no-data')).toEqual({ view: 'problem', problemId: 'usb-c-no-data' })
  })
})

describe('passage links', () => {
  it('carries situation and passage, and parses back', () => {
    expect(parseRoute(appLinks.passage('usb-c-no-data', 'e3', 'My Mac'))).toEqual({ view: 'problem', problemId: 'usb-c-no-data', query: 'My Mac', passage: 'e3' })
    expect(parseRoute(appLinks.passage('usb-c-no-data', 'c-cable-qualified:qualifies'))).toEqual({ view: 'problem', problemId: 'usb-c-no-data', passage: 'c-cable-qualified:qualifies' })
  })
})
