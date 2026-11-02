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
  it('holds each wordplay step in order before the smoke and fold', () => {
    expect(wordmarkFrame(0)).toMatchObject({ stage: 'wordmark', phrase: 'Adobe', spacing: 0, echo: 0, bToP: 0, progress: 0 })
    expect(wordmarkFrame(3400)).toMatchObject({ stage: 'dobe', phrase: 'A dobe e', spacing: 1, echo: 1, bToP: 0 })
    expect(wordmarkFrame(6500)).toMatchObject({ stage: 'dope', phrase: 'A dope e', bToP: 1, lowercase: 0 })
    expect(wordmarkFrame(9300)).toMatchObject({ stage: 'phrase', phrase: 'a dope e', lowercase: 1, departure: 0 })
    expect(wordmarkFrame(12100)).toMatchObject({ stage: 'inhale', turn: 1, smoking: true, smoke: false })
    expect(wordmarkFrame(13300)).toMatchObject({ stage: 'exhale', smoke: true, progress: 0, departure: 0 })
    expect(wordmarkFrame(15900)).toMatchObject({ stage: 'fold', centre: 0 })
    expect(wordmarkFrame(19400)).toMatchObject({ departure: 1, centre: 0 })
  })
  it('ends with the selected e alone and does not loop', () => {
    expect(wordmarkFrame(E_WORDMARK_MS)).toMatchObject({ stage: 'leisure', progress: 1, departure: 1, centre: 1, turn: 1, bToP: 1, lowercase: 1, smoke: false })
    expect(wordmarkFrame(E_WORDMARK_MS * 2)).toMatchObject({ stage: 'leisure', progress: 1, departure: 1, centre: 1, smoke: false })
    expect(wordmarkFrame(Number.NaN)).toEqual(wordmarkFrame(0))
  })
})
