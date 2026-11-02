import { useEffect, useRef, useState } from 'react'
import { EPixelSprite, type EPose } from './EPixelSprite'
import './e-opening.css'

export const E_OPENING_MS = 7600
export const E_WORDMARK_MS = 11600
const clamp = (value: number) => Math.max(0, Math.min(1, value))
const ease = (value: number) => { const t = clamp(value); return t * t * (3 - 2 * t) }

export function wordmarkFrame(elapsed: number) {
  const time = Math.max(0, Number.isFinite(elapsed) ? elapsed : 0)
  return {
    stage: time < 1800 ? 'wordmark' : time < 3600 ? 'turn' : time < 4600 ? 'inhale' : time < 6600 ? 'exhale' : time < 8600 ? 'disappear' : time < E_WORDMARK_MS ? 'become' : 'leisure',
    turn: ease((time - 1800) / 1800),
    progress: ease((time - 4600) / 7000),
    departure: ease((time - 6600) / 2000),
    centre: ease((time - 8600) / 3000),
    smoking: time >= 3600,
    smoke: time >= 4600 && time < 10000,
  }
}

/** Authored bold letterforms; the e is the production character, not a second drawing. */
export function EWordmarkScene({ elapsed, size = 740, reducedMotion = false, pose = 'idle' }: { elapsed: number; size?: number; reducedMotion?: boolean; pose?: EPose }) {
  const frame = wordmarkFrame(reducedMotion ? E_WORDMARK_MS : elapsed)
  // Turn edge-on and back to face the viewer; never mirror the readable lowercase glyph.
  const facing = .12 + .88 * Math.abs(Math.cos(frame.turn * Math.PI))
  return <svg className="e-wordmark-scene" viewBox="0 0 520 220" width={size} height={size * 220 / 520} role="img" aria-label="An Adobe-like wordmark becomes a dope e: e turns, exhales smoke and relaxes as the other letters disappear.">
    <g fill="#ee0d00" opacity={1 - frame.departure} transform={`translate(${-frame.departure * 24} ${-frame.departure * 12})`}>
      <g transform="translate(25 62)">
        <path d="M0 85L32 3H55L88 85H61L45 38L35 64H49L57 85Z" />
        <path fillRule="evenodd" transform="translate(94)" d="M55 0H80V85H58V79Q49 88 35 88C11 88 0 72 0 53C0 31 14 20 35 20Q47 20 55 25ZM55 43Q47 36 39 38C19 40 19 69 39 70Q49 71 55 65Z" />
        <path fillRule="evenodd" transform="translate(184)" d="M39 20C66 20 78 35 78 54S65 88 39 88S0 74 0 54S13 20 39 20ZM39 38C20 38 20 70 39 70S58 38 39 38Z" />
        <path fillRule="evenodd" transform="translate(271)" d="M0 0H25V26Q36 19 47 20C69 20 80 35 80 54S68 88 45 88Q32 88 23 80V85H0ZM25 43V65Q33 72 42 70C60 67 60 41 42 38Q32 36 25 43Z" />
      </g>
    </g>
    <g transform={`translate(${-frame.centre * 165} 0)`}>
      <g transform={`translate(425 0) scale(${facing} 1) translate(-425 0)`}>
        <g transform={`translate(0 ${22 * (1 - frame.progress)}) scale(1 ${.88 + .12 * frame.progress})`}>
        <svg x="375" y="36" width="124" height="130" overflow="visible">
          <EPixelSprite size={124} progress={frame.progress} smoking={frame.smoking} smoke={frame.smoke && !reducedMotion} pose={pose} />
        </svg>
        </g>
      </g>
    </g>
  </svg>
}
export function openingFrame(elapsed: number) {
  const time = Math.max(0, Number.isFinite(elapsed) ? elapsed : 0)
  return {
    stage: time < 1300 ? 'crisp' : time < 2900 ? 'inhale' : time < 4700 ? 'exhale' : time < E_OPENING_MS ? 'melt' : 'leisure',
    progress: Math.max(0, Math.min(1, (time - 2900) / 4700)),
    smoking: time >= 1300,
    smoke: time >= 2900 && time < E_OPENING_MS,
  }
}

export function EOpening({ paused = false, reducedMotion = false, visible = true, pose = 'idle', size = 160, variant = 'character' }: {
  paused?: boolean; reducedMotion?: boolean; visible?: boolean; pose?: EPose; size?: number; variant?: 'character' | 'wordmark'
}) {
  const duration = variant === 'wordmark' ? E_WORDMARK_MS : E_OPENING_MS
  const [elapsed, setElapsed] = useState(0)
  const clock = useRef(0)
  const [run, setRun] = useState(0)
  useEffect(() => {
    if (paused || reducedMotion || !visible || elapsed >= duration) return
    let request = 0
    let previous: number | undefined
    const tick = (now: number) => {
      if (previous !== undefined) clock.current = Math.min(duration, clock.current + Math.min(now - previous, 100))
      previous = now
      setElapsed(clock.current)
      if (clock.current < duration) request = requestAnimationFrame(tick)
    }
    request = requestAnimationFrame(tick)
    return () => cancelAnimationFrame(request)
    // Elapsed belongs to the clock, not the effect lifecycle; pause resumes the same clock.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [paused, reducedMotion, visible, run, duration])
  const frame = openingFrame(reducedMotion ? E_OPENING_MS : elapsed)
  const word = wordmarkFrame(reducedMotion ? E_WORDMARK_MS : elapsed)
  const stage = variant === 'wordmark' ? word.stage : frame.stage
  return <div className={`e-opening ${paused || !visible ? 'is-paused' : ''}`} data-stage={stage}>
    {variant === 'wordmark' ? <EWordmarkScene elapsed={elapsed} size={size} reducedMotion={reducedMotion} pose={pose} /> : <EPixelSprite size={size} progress={frame.progress} smoking={frame.smoking} smoke={frame.smoke && !reducedMotion} pose={pose} />}
    <span className="e-opening-caption">{variant === 'wordmark' ? ({ wordmark: 'everybody knows the word.', turn: 'one letter has other plans.', inhale: 'one moment…', exhale: '…and exhale.', disappear: 'the rest can go.', become: 'a little less corporate.', leisure: 'a dope e.' }[word.stage]) : frame.stage === 'crisp' ? 'just a little e.' : frame.stage === 'inhale' ? 'one moment…' : frame.stage === 'exhale' ? '…and exhale.' : frame.stage === 'melt' ? 'there goes the brand discipline.' : 'leisure mode.'}</span>
    <button type="button" className="e-opening-replay" onClick={() => { clock.current = 0; setElapsed(0); setRun(n => n + 1) }} disabled={reducedMotion || paused} aria-label="Replay e opening">Replay ↺</button>
  </div>
}
