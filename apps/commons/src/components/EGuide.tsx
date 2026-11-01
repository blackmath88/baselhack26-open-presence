/**
 * E — the dopey letter-E guide for the presentation.
 *
 * A red "E" mascot in the spirit of the Adobe brand mark (plain geometry, no
 * trademark assets) that tags along on screen. It greets the visitor and, being
 * easily sidetracked, drifts into the side missions (PDF Lab, PDF history) and
 * brings the visitor back.
 */
import { useEffect, useMemo, useState } from 'react'

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
    href: 'https://github.com/blackmath88/baselhack26-open-presence/tree/main/sideprojects/pdf-lab',
    label: 'Open PDF Lab',
  },
  {
    id: 'pdf-history',
    title: 'PDF history',
    blurb: 'The optional story of one recognisable page travelling between software and people.',
    href: 'https://github.com/blackmath88/baselhack26-open-presence/tree/main/modules/pdf-history',
    label: 'Open PDF history',
  },
]

const GREETINGS = [
  'Hi! I\u2019m E. I\u2019ll take you around \u2014 mind the side doors, I get distracted easily.',
  'E here. Main stage this way! \u2026Wait, was that a side mission over there?',
  'Hello! Follow the big E. If I wander off, that\u2019s just me being dopey.',
]

const SIDETRACK_LINES = [
  'Ooh — a side build! This one\u2019s about bending documents until they confess.',
  'Hold on, hold on — over here there\u2019s a whole cabinet of weird PDFs. Worth it.',
  'I was supposed to show you the main thing, but look: side mission!',
]

const RETURN_LINES = [
  'Okay, back on track! Where were we\u2026 right, the Commons.',
  'Sorry, sorry — easily sidetracked, me. Main stage again!',
]

export function pickLine(lines: string[], seed: number): string {
  return lines[Math.abs(seed) % lines.length]
}

export function EMark({ size = 34 }: { size?: number }) {
  return (
    <svg
      className="e-guide-mark"
      width={size}
      height={size}
      viewBox="0 0 64 64"
      role="img"
      aria-label="E, the guide"
    >
      <path
        d="M14 6h36v12H28v10h18v12H28v12h22v12H14z"
        fill="#fa0f00"
        stroke="#c40c00"
        strokeWidth="2"
        strokeLinejoin="round"
      />
      <circle cx="24" cy="22" r="3.2" fill="#fff" />
      <circle cx="24" cy="43" r="3.2" fill="#fff" />
    </svg>
  )
}

export function EGuide({ missionIndex = 0 }: { missionIndex?: number }) {
  const [phase, setPhase] = useState<'greeting' | 'sidetrack' | 'return'>('greeting')
  const [tick, setTick] = useState(0)
  const mission = SIDE_MISSIONS[missionIndex % SIDE_MISSIONS.length]

  useEffect(() => {
    const id = window.setInterval(() => setTick((t) => t + 1), 14000)
    return () => window.clearInterval(id)
  }, [])

  useEffect(() => {
    if (tick === 0) return
    setPhase((p) => (p === 'greeting' ? 'sidetrack' : p === 'sidetrack' ? 'return' : 'greeting'))
  }, [tick])

  const line = useMemo(() => {
    if (phase === 'greeting') return pickLine(GREETINGS, tick)
    if (phase === 'sidetrack') return pickLine(SIDETRACK_LINES, tick)
    return pickLine(RETURN_LINES, tick)
  }, [phase, tick])

  return (
    <aside className={`e-guide e-guide-${phase}`} aria-live="polite">
      <EMark />
      <div className="e-guide-text">
        <strong>E says</strong>
        <p>{line}</p>
        {phase === 'sidetrack' && (
          <a className="e-guide-link" href={mission.href} target="_blank" rel="noreferrer">
            {mission.label}: {mission.title} — {mission.blurb}
          </a>
        )}
      </div>
      <div className="e-guide-dots" aria-hidden="true">
        {(['greeting', 'sidetrack', 'return'] as const).map((p) => (
          <span key={p} className={p === phase ? 'dot active' : 'dot'} />
        ))}
      </div>
    </aside>
  )
}
