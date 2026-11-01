/**
 * The .phf demo journey: find → inspect → contribute → reply → rediscover.
 *
 * A presenter guide only. It remembers, in this browser, which steps were
 * reached and which contribution the journey is following. It never holds
 * canonical data: every step still reads and writes through the server, and
 * clearing it changes nothing in the shared room.
 */
import { useEffect, useState } from 'react'

export const JOURNEY_STEPS = ['find', 'inspect', 'contribute', 'reply', 'rediscover'] as const
export type JourneyStep = (typeof JOURNEY_STEPS)[number]

export interface Journey {
  done: JourneyStep[]
  /** The contribution the journey follows (the staged observation), its problem and cited source object. */
  followed?: { contributionId: string; problemId: string; author: string; excerpt: string; cites: string[] }
}

const KEY = 'phf.journey.v1'
const EVENT = 'phf-journey'

function read(): Journey {
  try {
    const raw = localStorage.getItem(KEY)
    return raw ? (JSON.parse(raw) as Journey) : { done: [] }
  } catch {
    return { done: [] }
  }
}

function write(next: Journey): void {
  try { localStorage.setItem(KEY, JSON.stringify(next)) } catch { /* guide only; nothing is lost */ }
  window.dispatchEvent(new Event(EVENT))
}

export const journey = {
  read,
  mark(step: JourneyStep) {
    const current = read()
    if (!current.done.includes(step)) write({ ...current, done: [...current.done, step] })
  },
  follow(followed: NonNullable<Journey['followed']>) {
    const current = read()
    write({ done: [...new Set<JourneyStep>([...current.done, 'find', 'inspect', 'contribute'])], followed })
  },
  reset() { write({ done: [] }) },
}

export function useJourney(): Journey {
  const [state, setState] = useState<Journey>(read)
  useEffect(() => {
    const onChange = () => setState(read())
    window.addEventListener(EVENT, onChange)
    window.addEventListener('storage', onChange)
    return () => { window.removeEventListener(EVENT, onChange); window.removeEventListener('storage', onChange) }
  }, [])
  return state
}

/**
 * Where "back to the presentation" goes. Defaults to the presentation shell on
 * port 8001 of whichever host serves this page, so a phone pointed at the demo
 * host is not sent to its own localhost. `VITE_PHF_PRESENTATION_URL` overrides.
 */
export function presentationUrl(): string {
  const configured = import.meta.env.VITE_PHF_PRESENTATION_URL
  return configured || `${location.protocol}//${location.hostname}:8001/`
}
