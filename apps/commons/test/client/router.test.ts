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
