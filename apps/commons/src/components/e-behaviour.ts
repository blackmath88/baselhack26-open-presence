import type { EPose } from './EPixelSprite'

export type EMode = 'ambient' | 'presentation'
export type EAction =
  | { type: 'IDLE_CUE'; cue: 'blink' | 'look-left' | 'look-right' | 'sleep' }
  | { type: 'NOTICE_MISSION'; missionId: string }
  | { type: 'RETURN' }
  | { type: 'PAUSE' }
  | { type: 'RESUME' }
  | { type: 'DISMISS' }
  | { type: 'RESTORE' }
  | { type: 'SET_MODE'; mode: EMode }

export type EState = {
  pose: EPose
  missionId: string | null
  paused: boolean
  dismissed: boolean
  mode: EMode
}

export const INITIAL_E_STATE: EState = {
  pose: 'idle', missionId: null, paused: false, dismissed: false, mode: 'ambient',
}

/** Pure transitions: presentation mode cannot be interrupted by ambient idle cues. */
export function reduceE(state: EState, action: EAction): EState {
  if (action.type === 'DISMISS') return { ...state, dismissed: true, missionId: null }
  if (action.type === 'RESTORE') return { ...state, dismissed: false, paused: false, pose: 'idle' }
  if (action.type === 'PAUSE') return { ...state, paused: true, pose: 'idle' }
  if (action.type === 'RESUME') return { ...state, paused: false }
  if (action.type === 'SET_MODE') return { ...state, mode: action.mode, pose: 'idle', missionId: null }
  if (state.dismissed || state.paused) return state
  if (action.type === 'IDLE_CUE') {
    if (state.mode !== 'ambient' || state.missionId) return state
    return { ...state, pose: action.cue }
  }
  if (action.type === 'NOTICE_MISSION') return { ...state, pose: 'surprised', missionId: action.missionId }
  if (action.type === 'RETURN') return { ...state, pose: 'idle', missionId: null }
  return state
}

export function resolveMissionIndex(index: number, length: number): number {
  if (length <= 0 || !Number.isFinite(index)) return 0
  return ((Math.trunc(index) % length) + length) % length
}
