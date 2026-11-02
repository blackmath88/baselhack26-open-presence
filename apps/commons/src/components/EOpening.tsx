import { useEffect, useRef, useState, type ReactNode } from 'react'
import { EPixelSprite, E_GLYPH_PATH, type EPose } from './EPixelSprite'
import './e-opening.css'

export const E_OPENING_MS = 7600
export const E_WORDMARK_MS = 14200
const clamp = (value: number) => Math.max(0, Math.min(1, value))
const ease = (value: number) => { const t = clamp(value); return t * t * (3 - 2 * t) }

export function wordmarkFrame(elapsed: number) {
  const time = Math.max(0, Number.isFinite(elapsed) ? elapsed : 0)
  return {
    stage: time < 700 ? 'wordmark' : time < 1700 ? 'space' : time < 2500 ? 'dobe' : time < 3300 ? 'morph' : time < 4100 ? 'dope' : time < 4700 ? 'lowercase' : time < 5400 ? 'phrase' : time < 6100 ? 'turn' : time < 6800 ? 'inhale' : time < 10000 ? 'exhale' : time < 12900 ? 'fold' : time < E_WORDMARK_MS ? 'become' : 'leisure',
    phrase: time < 1700 ? 'Adobe' : time < 3300 ? 'A dobe e' : time < 4700 ? 'A dope e' : 'a dope e',
    spacing: ease((time - 700) / 1000),
    echo: ease((time - 1200) / 500),
    bToP: ease((time - 2500) / 800),
    lowercase: ease((time - 4100) / 600),
    turn: ease((time - 5400) / 700),
    progress: ease((time - 6800) / 7400),
    departure: ease((time - 10000) / 2900),
    centre: ease((time - 12900) / 1300),
    smoking: time >= 6100,
    smoke: time >= 6800 && time < 12900,
    cloud: clamp((time - 6800) / 6100),
    time,
  }
}

/** A broad, lumpy white exhale; every puff is driven by the scene clock. */
function ESmokeCloud({ progress }: { progress: number }) {
  return <g className="e-bubble-cloud" aria-hidden="true">{Array.from({ length: 8 }, (_, index) => {
    const age = clamp(progress * 1.7 - index * .105)
    const opacity = ease(age / .12) * (1 - ease((age - .65) / .35))
    const x = 706 - age * (540 + index * 13)
    const y = 109 - Math.sin(age * Math.PI) * (35 + index * 7)
    const scale = .22 + age * 1.6
    return <g key={index} opacity={opacity} transform={`translate(${x} ${y}) scale(${scale})`} fill="#fff" stroke="#d9e3ee" strokeWidth=".7">
      <path d="M-34 8C-52 5-50-14-35-18C-37-35-15-43-4-30C6-49 34-40 34-23C54-22 60-1 44 9C47 27 23 34 11 24C-4 39-27 29-27 17C-33 20-39 16-34 8Z" />
      <circle cx="-51" cy="26" r="5" /><circle cx="-65" cy="7" r="3" /><circle cx="38" cy="-43" r="4" />
    </g>
  })}</g>
}

/** Authored letterforms and a real b→p stem morph; e remains the production character. */
export function EWordmarkScene({ elapsed, size = 740, reducedMotion = false, pose = 'idle' }: { elapsed: number; size?: number; reducedMotion?: boolean; pose?: EPose }) {
  const f = wordmarkFrame(reducedMotion ? E_WORDMARK_MS : elapsed)
  const facing = .12 + .88 * Math.abs(Math.cos(f.turn * Math.PI))
  const positions = [155 - f.spacing * 120, 249 - f.spacing * 59, 339 - f.spacing * 62, 426 - f.spacing * 62, 510 - f.spacing * 59]
  const eX = 510 + f.spacing * 100 - f.centre * 280
  const fold = (index: number) => ease((f.time - 10000 - index * 180) / 2180)
  const letter = (index: number, content: ReactNode, opacity = 1) => {
    const t = fold(index)
    const travel = ease(t / .75)
    const x = positions[index] + (620 - positions[index]) * travel
    return <g key={index} opacity={opacity * (1 - ease((t - .88) / .12))} transform={`translate(${x} ${62 - travel * 16}) translate(40 50) rotate(${(index % 2 ? -65 : 65) * t}) skewX(${t * 22}) scale(${Math.max(.001, 1 - t)} ${1 - t * .8}) translate(-40 -50)`}>{content}</g>
  }
  const stemTop = f.bToP * 20
  const stemBottom = 85 + f.bToP * 25
  return <svg className="e-wordmark-scene" viewBox="0 0 760 265" width={size} height={size * 265 / 760} role="img" aria-label="Adobe becomes A dobe e, then A dope e, then a dope e. The other letters fold into e in a cloud of white smoke.">
    <rect width="760" height="265" rx="14" fill={`rgb(${26 + f.centre * 220},${33 + f.centre * 216},${52 + f.centre * 200})`} />
    <g fill="#ee0d00">
      {letter(0, <>
        <path opacity={1 - f.lowercase} d="M0 85L32 3H55L88 85H61L45 38L35 64H49L57 85Z" />
        <path opacity={f.lowercase} fillRule="evenodd" d="M55 20H80V85H58V79Q49 88 35 88C11 88 0 72 0 53C0 31 14 20 35 20Q47 20 55 25ZM55 43Q47 36 39 38C19 40 19 69 39 70Q49 71 55 65Z" />
      </>)}
      {letter(1, <path fillRule="evenodd" d="M55 0H80V85H58V79Q49 88 35 88C11 88 0 72 0 53C0 31 14 20 35 20Q47 20 55 25ZM55 43Q47 36 39 38C19 40 19 69 39 70Q49 71 55 65Z" />)}
      {letter(2, <path fillRule="evenodd" d="M39 20C66 20 78 35 78 54S65 88 39 88S0 74 0 54S13 20 39 20ZM39 38C20 38 20 70 39 70S58 38 39 38Z" />)}
      {letter(3, <path className="e-b-to-p" fillRule="evenodd" d={`M0 ${stemTop}H25V26Q36 19 47 20C69 20 80 35 80 54S68 88 45 88Q32 88 23 80V${stemBottom}H0ZM25 43V65Q33 72 42 70C60 67 60 41 42 38Q32 36 25 43Z`} />)}
      {letter(4, <path transform="translate(0 14) scale(.87)" fillRule="evenodd" d={E_GLYPH_PATH} />, f.echo)}
    </g>
    {f.smoke && !reducedMotion && <ESmokeCloud progress={f.cloud} />}
    <g transform={`translate(${eX + 50} 0) scale(${facing} 1) translate(-50 0)`}>
      <g transform={`translate(50 110) scale(${1 + f.centre * .45}) translate(-50 -110)`}>
      <g transform={`translate(0 ${22 * (1 - f.progress)}) scale(1 ${.88 + .12 * f.progress})`}>
        <svg y="36" width="124" height="130" overflow="visible">
          <EPixelSprite size={124} progress={f.progress} smoking={f.smoking} smoke={false} pose={pose} />
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
    <span className="e-opening-caption">{variant === 'wordmark' ? (word.stage === 'leisure' ? 'a dope e. — all of it, in one e.' : word.phrase) : frame.stage === 'crisp' ? 'just a little e.' : frame.stage === 'inhale' ? 'one moment…' : frame.stage === 'exhale' ? '…and exhale.' : frame.stage === 'melt' ? 'there goes the brand discipline.' : 'leisure mode.'}</span>
    <button type="button" className="e-opening-replay" onClick={() => { clock.current = 0; setElapsed(0); setRun(n => n + 1) }} disabled={reducedMotion || paused} aria-label="Replay e opening">Replay ↺</button>
  </div>
}
