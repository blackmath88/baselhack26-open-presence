import { describe, expect, it } from 'vitest'
import { compareSituation, evidenceRefs } from '../../src/commons/client/situation'
import { commonsReader } from '../../src/commons/reader'

describe('compareSituation (word comparison, not compatibility)', () => {
  it('marks recorded conditions the reader did not state', () => {
    const p = commonsReader.problem('usb-c-no-data')!
    const checks = compareSituation('My Mac cannot see my frame', p)
    const pf = checks.find((c) => c.label === 'PF1007L')!
    expect(pf.yourWords).toEqual([])
    expect(pf.expandedWords).toEqual([])
    // "T3 USB data test" shares only words added by the explicit query expansion.
    const usb = checks.find((c) => c.label === 'T3 USB data test')!
    expect(usb.yourWords).toEqual([])
    expect(usb.expandedWords).toEqual(['usb', 'data'])
  })
  it('separates typed words from expanded ones', () => {
    const p = commonsReader.problem('reset-after-uboot')!
    const mac = compareSituation('My Mac cannot see my frame', p).find((c) => /macOS/.test(c.label))!
    expect(mac.yourWords).toEqual([])
    expect(mac.expandedWords).toEqual(['macos'])
    expect(compareSituation('macOS automount fails', p).find((c) => /macOS/.test(c.label))!.yourWords).toEqual(['macOS', 'automount'])
  })
})

describe('evidenceRefs', () => {
  it('links only evidence ids the record has', () => {
    const parts = evidenceRefs('reports: e3: worked, e4: worked, e9: unknown', ['e3', 'e4'])
    expect(parts.filter((p) => p.evidenceId).map((p) => p.evidenceId)).toEqual(['e3', 'e4'])
    expect(parts.map((p) => p.text).join('')).toBe('reports: e3: worked, e4: worked, e9: unknown')
  })
})
