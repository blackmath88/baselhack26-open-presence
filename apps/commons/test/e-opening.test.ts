import { describe, expect, it } from 'vitest'
import { E_OPENING_MS, E_WORDMARK_MS, openingFrame, wordmarkFrame } from '../src/components/EOpening'

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


describe('wordmark-to-character film', () => {
  it('turns e and exhales before the other letters disappear', () => {
    expect(wordmarkFrame(0)).toMatchObject({ stage: 'wordmark', turn: 0, departure: 0, progress: 0, smoking: false })
    expect(wordmarkFrame(2700).turn).toBeCloseTo(.5)
    expect(wordmarkFrame(3600)).toMatchObject({ stage: 'inhale', turn: 1, departure: 0, smoking: true })
    expect(wordmarkFrame(4600)).toMatchObject({ stage: 'exhale', smoke: true, departure: 0 })
    expect(wordmarkFrame(7600).departure).toBeCloseTo(.5)
    expect(wordmarkFrame(8600)).toMatchObject({ departure: 1, centre: 0 })
  })
  it('ends with the same transformed e alone and does not loop', () => {
    expect(wordmarkFrame(E_WORDMARK_MS)).toMatchObject({ stage: 'leisure', progress: 1, departure: 1, centre: 1, turn: 1, smoke: false })
    expect(wordmarkFrame(E_WORDMARK_MS * 2)).toEqual(wordmarkFrame(E_WORDMARK_MS))
    expect(wordmarkFrame(Number.NaN)).toEqual(wordmarkFrame(0))
  })
})
