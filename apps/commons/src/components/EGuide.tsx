/** E — an original pixel-art, optional character in the Commons shell.
 * The Adobe -> "a dope E" pun is narrative; no third-party brand assets are used.
 * Behaviour is event-driven; ambient motion never changes navigation or focus.
 */
import { useEffect, useReducer, useState } from 'react'
import { EPixelSprite, type EPose } from './EPixelSprite'
import { EOpening } from './EOpening'
import { INITIAL_E_STATE, reduceE, resolveMissionIndex } from './e-behaviour'
import './e-pixel.css'

export type SideMission = {
  id: string
  title: string
  blurb: string
  href: string
  label: string
}
export const SIDE_MISSIONS: SideMission[] = [
  {
    id: 'pdf-lab',
    title: 'PDF Lab',
    blurb: 'A cabinet of strange PDFs — one-letter mazes, hidden machines, two identities in one file.',
    href: import.meta.env.VITE_PHF_PDF_URL || 'https://blackmath88.github.io/baselhack26-open-presence/pdf-lab/',
    label: 'Open PDF Lab',
  },
  {
    id: 'pdf-history',
    title: 'PDF history',
    blurb: 'The optional story of a recognisable document travelling between people and software.',
    href: import.meta.env.VITE_PHF_HISTORY_URL || 'https://blackmath88.github.io/baselhack26-open-presence/pdf-history/',
    label: 'Open PDF history',
  },
]

export function pickLine(lines: string[], seed: number): string {
  return lines[Math.abs(Math.trunc(seed)) % lines.length]
}

/** Compatibility for existing imports, with the original pixel face. */
export function EMark({ size = 34 }: { size?: number }) {
  return <EPixelSprite size={size} />
}

const IDLE_CUES: readonly ('blink' | 'look-left' | 'look-right' | 'sleep')[] =
  ['blink', 'look-right', 'blink', 'look-left', 'sleep']

export function EGuide({ missionIndex = 0 }: { missionIndex?: number }) {
  const [state, dispatch] = useReducer(reduceE, INITIAL_E_STATE)
  const [cueIndex, setCueIndex] = useState(0)
  const [reduceMotion, setReduceMotion] = useState(() => typeof window === 'undefined' || window.matchMedia('(prefers-reduced-motion: reduce)').matches)
  const [visible, setVisible] = useState(true)
  const mission = SIDE_MISSIONS[resolveMissionIndex(missionIndex, SIDE_MISSIONS.length)]
  const activeMission = SIDE_MISSIONS.find((item) => item.id === state.missionId)

  useEffect(() => {
    const query = window.matchMedia('(prefers-reduced-motion: reduce)')
    const update = () => setReduceMotion(query.matches)
    update()
    query.addEventListener('change', update)
    return () => query.removeEventListener('change', update)
  }, [])

  useEffect(() => {
    const update = () => setVisible(!document.hidden)
    document.addEventListener('visibilitychange', update)
    update()
    return () => document.removeEventListener('visibilitychange', update)
  }, [])

  useEffect(() => {
    if (state.paused || state.dismissed || state.mode !== 'ambient' || state.missionId || reduceMotion || !visible) return
    const timer = window.setTimeout(() => {
      dispatch({ type: 'IDLE_CUE', cue: IDLE_CUES[cueIndex % IDLE_CUES.length] })
      setCueIndex((n) => n + 1)
    }, 8500)
    return () => window.clearTimeout(timer)
  }, [cueIndex, reduceMotion, visible, state.paused, state.dismissed, state.mode, state.missionId])

  useEffect(() => {
    if (state.pose === 'idle' || state.missionId || state.paused || state.dismissed || reduceMotion || !visible) return
    const timer = window.setTimeout(() => dispatch({ type: 'RETURN' }), state.pose === 'sleep' ? 2600 : 700)
    return () => window.clearTimeout(timer)
  }, [state.pose, state.missionId, state.paused, state.dismissed, reduceMotion, visible])

  if (state.dismissed) {
    return <div className="e-pixel-restore"><button type="button" onClick={() => dispatch({ type: 'RESTORE' })}>Bring E back</button></div>
  }

  const pose: EPose = reduceMotion || state.paused || !visible ? 'idle' : state.pose

  return (
    <aside className="e-pixel-guide" aria-label="E, the optional dopey guide">
      <div className="e-pixel-character">
        <EOpening pose={pose} size={144} paused={state.paused} reducedMotion={reduceMotion} visible={visible} />
        <span className="e-pixel-name">a dope e</span>
      </div>
      <div className="e-pixel-content">
        <p className="e-pixel-intro"><strong>hey. i'm e.</strong> i was going to show you something. wait… what was it?</p>
        {activeMission ? (
          <div className="e-pixel-mission">
            <strong>Oh! A side mission: {activeMission.title}</strong>
            <p>{activeMission.blurb}</p>
            <a href={activeMission.href} target="_blank" rel="noreferrer">{activeMission.label}</a>
            <button type="button" onClick={() => dispatch({ type: 'RETURN' })}>Back to the main story</button>
          </div>
        ) : (
          <button type="button" className="e-pixel-discover" onClick={() => dispatch({ type: 'NOTICE_MISSION', missionId: mission.id })}>
            E spotted a side mission…
          </button>
        )}
      </div>
      <div className="e-pixel-controls">
        <button type="button" onClick={() => dispatch({ type: state.paused ? 'RESUME' : 'PAUSE' })} aria-label={state.paused ? 'Resume E animation' : 'Pause E animation'}>
          {state.paused ? 'Resume' : 'Pause'}
        </button>
        <button type="button" onClick={() => dispatch({ type: 'DISMISS' })} aria-label="Hide E">Hide</button>
      </div>
    </aside>
  )
}
