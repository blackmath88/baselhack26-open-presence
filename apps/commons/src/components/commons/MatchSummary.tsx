/** One readable line from a hit's actual match basis: your words found, writer vocabulary, search-added, not found. */
import type { SearchHit } from '../../commons/contracts'
import { matchBasis } from '../../commons/client/matchBasis'

const quoted = (terms: string[]) => terms.map((t) => `“${t}”`).join(', ')

export function MatchSummary({ query, hit }: { query: string; hit: SearchHit }) {
  const b = matchBasis(query, hit)
  const parts = [
    b.yourWords.length > 0 && <span key="y">Your words found: <b>{quoted(b.yourWords.map((t) => t.word))}</b></span>,
    b.onlyWriterVocabulary.length > 0 && <span key="w">only in the record writer’s vocabulary: {quoted(b.onlyWriterVocabulary.map((t) => t.word))}</span>,
    b.addedBySearch.length > 0 && <span key="a">added by the search: {quoted(b.addedBySearch.map((t) => t.word))}</span>,
    b.unmatched.length > 0 && <span key="n">not found: {quoted(b.unmatched)}</span>,
  ].filter(Boolean)
  return (
    <span className="cc-match-summary">
      {parts.flatMap((p, i) => (i ? [<span key={`s${i}`} aria-hidden="true"> · </span>, p] : [p]))}
      {hit.nearMatch && <span className="cc-warn"> · near-match: a different platform from yours</span>}
    </span>
  )
}
