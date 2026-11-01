import { useEffect, useRef, useState } from 'react'
import { EPixelSprite, type EPose } from './EPixelSprite'
import './e-opening.css'

export const E_OPENING_MS = 7600
export function openingFrame(elapsed: number) {
  const time = Math.max(0, Number.isFinite(elapsed) ? elapsed : 0)
  return {
    stage: time < 1300 ? 'crisp' : time < 2900 ? 'inhale' : time < 4700 ? 'exhale' : time < E_OPENING_MS ? 'melt' : 'leisure',
    progress: Math.max(0, Math.min(1, (time - 2900) / 4700)),
    smoking: time >= 1300,
    smoke: time >= 2900 && time < E_OPENING_MS,
  }
}

export function EOpening({ paused = false, reducedMotion = false, visible = true, pose = 'idle', size = 160 }: {
  paused?: boolean; reducedMotion?: boolean; visible?: boolean; pose?: EPose; size?: number
}) {
  const [elapsed, setElapsed] = useState(0)
  const clock = useRef(0)
  const [run, setRun] = useState(0)
  useEffect(() => {
    if (paused || reducedMotion || !visible || elapsed >= E_OPENING_MS) return
    let request = 0
    let previous: number | undefined
    const tick = (now: number) => {
      if (previous !== undefined) clock.current = Math.min(E_OPENING_MS, clock.current + Math.min(now - previous, 100))
      previous = now
      setElapsed(clock.current)
      if (clock.current < E_OPENING_MS) request = requestAnimationFrame(tick)
    }
    request = requestAnimationFrame(tick)
    return () => cancelAnimationFrame(request)
    // Elapsed belongs to the clock, not the effect lifecycle; pause resumes the same clock.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [paused, reducedMotion, visible, run])
  const frame = openingFrame(reducedMotion ? E_OPENING_MS : elapsed)
  return <div className={`e-opening ${paused || !visible ? 'is-paused' : ''}`} data-stage={frame.stage}>
    <EPixelSprite size={size} progress={frame.progress} smoking={frame.smoking} smoke={frame.smoke && !reducedMotion} pose={pose} />
    <span className="e-opening-caption">{frame.stage === 'crisp' ? 'just a little e.' : frame.stage === 'inhale' ? 'one moment…' : frame.stage === 'exhale' ? '…and exhale.' : frame.stage === 'melt' ? 'there goes the brand discipline.' : 'leisure mode.'}</span>
    <button type="button" className="e-opening-replay" onClick={() => { clock.current = 0; setElapsed(0); setRun(n => n + 1) }} disabled={reducedMotion || paused} aria-label="Replay e opening">Replay ↺</button>
  </div>
}
