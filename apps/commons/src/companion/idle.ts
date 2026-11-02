import type { EPose } from '../components/EPixelSprite'

export const E_IDLE_CYCLE_MS = 24000
export const E_IDLE_CUES: readonly { at: number; duration: number; pose: EPose }[] = [
  { at: 1800, duration: 160, pose: 'blink' },
  { at: 2150, duration: 180, pose: 'blink' },
  { at: 7600, duration: 850, pose: 'cough' },
  { at: 11000, duration: 5200, pose: 'exhale' },
  { at: 19000, duration: 1100, pose: 'look-left' },
]

/** Sparse cue boundaries only: CSS runs the body/smoke frames, never a React frame loop. */
export function startIdleCycle(emit: (pose: EPose) => void, active: () => boolean = () => true): () => void {
  const timers = new Set<ReturnType<typeof setTimeout>>()
  let stopped = false
  const after = (delay: number, action: () => void) => {
    const timer = setTimeout(() => { timers.delete(timer); if (!stopped) action() }, delay)
    timers.add(timer)
  }
  const cycle = () => {
    for (const cue of E_IDLE_CUES) {
      after(cue.at, () => { if (active()) emit(cue.pose) })
      after(cue.at + cue.duration, () => emit('idle'))
    }
    after(E_IDLE_CYCLE_MS, cycle)
  }
  cycle()
  return () => { stopped = true; timers.forEach(clearTimeout); timers.clear() }
}
