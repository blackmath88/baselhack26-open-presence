/** The searched situation and the way back, kept on screen in every record and comparison state. */
import { ArrowLeft } from 'lucide-react'
import { appLinks } from '../../commons/contracts'

export function SituationBar({ query }: { query?: string | undefined }) {
  return (
    <nav className="cx-context" aria-label="Where you are">
      <a className="cx-back" href={appLinks.search(query ?? '')}><ArrowLeft size={14} aria-hidden="true" /> {query ? 'Back to results' : 'Search'}</a>
      {query && (
        <span className="cx-situation">
          <span className="cx-situation-k">Your situation</span> <q>{query}</q>
        </span>
      )}
      <span className="cx-context-note">The Commons knows only what you typed — not your device, cable or setup.</span>
    </nav>
  )
}
