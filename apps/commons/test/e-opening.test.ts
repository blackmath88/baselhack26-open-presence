import { describe, expect, it } from 'vitest'
import { E_OPENING_MS, openingFrame } from '../src/components/EOpening'

describe('lowercase e opening clock', () => {
  it('keeps the logo crisp before the joint arrives, then exhales before changing shape', () => {
    expect(openingFrame(0)).toMatchObject({ stage: 'crisp', progress: 0, smoking: false, smoke: false })
    expect(openingFrame(1300)).toMatchObject({ stage: 'inhale', smoking: true, smoke: false })
    expect(openingFrame(2900)).toMatchObject({ stage: 'exhale', progress: 0, smoke: true })
    expect(openingFrame(4700).progress).toBeGreaterThan(0)
    expect(openingFrame(E_OPENING_MS)).toMatchObject({ stage: 'leisure', progress: 1, smoking: true, smoke: false })
  })
  it('settles permanently without looping and bounds invalid clock input', () => {
    expect(openingFrame(E_OPENING_MS * 100)).toEqual(openingFrame(E_OPENING_MS))
    expect(openingFrame(-50)).toEqual(openingFrame(0))
    expect(openingFrame(Number.NaN)).toEqual(openingFrame(0))
  })
})
