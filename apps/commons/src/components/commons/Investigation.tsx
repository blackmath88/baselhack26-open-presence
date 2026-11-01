/**
 * The searcher's context on a record: the way back to the results they came from, the situation
 * they typed, and what the search actually established about this record — why it may fit (from
 * the hit's real match basis), what may differ (reported conditions, near-match), and what the
 * Commons cannot know. Rendered before the record loads, so loading and errors keep the context.
 */
import { ArrowLeft } from 'lucide-react'
import type { CommonsReader, SearchHit } from '../../commons/contracts'
import { appLinks } from '../../commons/contracts'
import { FIELD_LABEL, matchBasis, type TermMatch } from '../../commons/client/matchBasis'

/** Where a word matched in the record's own fields; the writer's added vocabulary is named separately. */
const where = (t: TermMatch) => {
  const own = t.fields.filter((f) => f !== 'aliases').map((f) => FIELD_LABEL[f]).join(', ')
  return t.fields.includes('aliases') ? `${own} · also ${FIELD_LABEL.aliases}` : own
}

export function findHit(reader: CommonsReader, query: string, problemId: string): SearchHit | undefined {
  return reader.search(query, 20).find((h) => h.problemId === problemId)
}

export function Investigation({ reader, problemId, query }: { reader: CommonsReader; problemId: string; query?: string }) {
  const problem = reader.problem(problemId)
  const hit = query ? findHit(reader, query, problemId) : undefined
  const basis = query && hit ? matchBasis(query, hit) : undefined
  return (
    <div className="cc-investigation">
      <nav className="cc-crumbs" aria-label="Breadcrumb">
        {query ? (
          <a href={appLinks.search(query, problemId)}><ArrowLeft size={14} aria-hidden="true" /> Results for “{query}”</a>
        ) : (
          <a href={appLinks.search('')}><ArrowLeft size={14} aria-hidden="true" /> Search</a>
        )}
      </nav>
      {query && (
        <section className="cc-situation" aria-labelledby="cc-situation-title">
          <div className="cc-situation-head">
            <h2 id="cc-situation-title" className="cc-label">Your situation</h2>
            <q className="cc-situation-text">{query}</q>
            <a className="cc-edit" href={appLinks.search(query)}>Edit</a>
          </div>
          {basis && hit ? (
            <div className="cc-fit">
              <div>
                <h3>Why it may fit</h3>
                <dl className="cc-terms">
                  {basis.yourWords.map((t) => <div key={t.term}><dt>“{t.term}”</dt><dd>{where(t)}</dd></div>)}
                  {basis.onlyWriterVocabulary.map((t) => <div key={t.term}><dt>“{t.term}”</dt><dd>only the {FIELD_LABEL.aliases}, not the source</dd></div>)}
                  {basis.addedBySearch.length > 0 && (
                    <div><dt>added</dt><dd>the search added {basis.addedBySearch.map((t) => `“${t.term}”`).join(', ')} to your words</dd></div>
                  )}
                </dl>
                <p className="commons-limit">Your words, and where they matched. Ranked {hit.rank} by lexical field matches, not by confidence.</p>
              </div>
              <div>
                <h3>What may differ</h3>
                {hit.nearMatch ? (
                  <p className="cc-warn"><strong>Near-match.</strong> The reported conditions ({problem?.environment.join('; ')}) name a different platform from your situation. This is not evidence of a fix for your setup.</p>
                ) : (
                  <p>Reported conditions: {problem?.environment.join(' · ') || 'not stated'}. Compare them, and “Applies to”, with your setup.</p>
                )}
              </div>
              <div>
                <h3>Not known here</h3>
                <p>The Commons has only the words you typed. Your frame model, computer, cable and what you already tried are unknown to it.</p>
                {basis.unmatched.length > 0 && <p className="commons-limit">Your words that matched nothing in this record: {basis.unmatched.map((w) => `“${w}”`).join(', ')}.</p>}
              </div>
            </div>
          ) : (
            <p className="commons-limit">This record is not among the search results for your situation; it was reached by a link or another entrance.</p>
          )}
        </section>
      )}
    </div>
  )
}
