/// <reference path="../vite-env.d.ts" />
/** E — an persistent lowercase character in the Commons shell.
 * The Adobe -> "a dope E" pun is narrative; the approved logo-derived appearance is preserved.
 * Behaviour is event-driven; ambient motion never changes navigation or focus.
 */
import { EPixelSprite } from './EPixelSprite'
import { ECompanion } from '../companion/ECompanion'

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

/** Compatibility wrapper: e is persistent; closing the panel never removes the character. */
export function EGuide({ missionIndex = 0, surface = 'commons' }: { missionIndex?: number; surface?: 'auto' | 'commons' }) {
  return <ECompanion missionIndex={missionIndex} surface={surface} />
}
