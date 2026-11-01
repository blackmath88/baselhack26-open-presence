import { describe, expect, it } from 'vitest'
import { INITIAL_E_STATE, reduceE, resolveMissionIndex } from '../src/components/e-behaviour'
import { E_POSES } from '../src/components/EPixelSprite'

describe('E pixel companion', () => {
  it('defines stable visible poses', () => {
    expect(E_POSES).toContain('blink')
    expect(E_POSES).toContain('surprised')
    expect(E_POSES).toContain('sleep')
  })
  it('changes expression on an ambient cue without creating a mission', () => {
    expect(reduceE(INITIAL_E_STATE, { type: 'IDLE_CUE', cue: 'blink' })).toMatchObject({ pose: 'blink', missionId: null })
  })
  it('shows and returns from the selected side mission', () => {
    const noticed = reduceE(INITIAL_E_STATE, { type: 'NOTICE_MISSION', missionId: 'pdf-lab' })
    expect(noticed).toMatchObject({ pose: 'surprised', missionId: 'pdf-lab' })
    expect(reduceE(noticed, { type: 'RETURN' })).toMatchObject({ pose: 'idle', missionId: null })
  })
  it('suspends automatic cues when paused or dismissed', () => {
    const paused = reduceE(INITIAL_E_STATE, { type: 'PAUSE' })
    expect(reduceE(paused, { type: 'IDLE_CUE', cue: 'sleep' })).toEqual(paused)
    const dismissed = reduceE(paused, { type: 'DISMISS' })
    expect(reduceE(dismissed, { type: 'NOTICE_MISSION', missionId: 'pdf-history' })).toEqual(dismissed)
    expect(reduceE(dismissed, { type: 'RESTORE' }).dismissed).toBe(false)
  })
  it('ignores idle cues in presentation mode', () => {
    const presented = reduceE(INITIAL_E_STATE, { type: 'SET_MODE', mode: 'presentation' })
    expect(reduceE(presented, { type: 'IDLE_CUE', cue: 'look-left' })).toEqual(presented)
  })
  it('normalizes bad mission indices', () => {
    expect(resolveMissionIndex(-1, 2)).toBe(1)
    expect(resolveMissionIndex(Number.NaN, 2)).toBe(0)
    expect(resolveMissionIndex(5.8, 2)).toBe(1)
    expect(resolveMissionIndex(4, 0)).toBe(0)
  })
})
