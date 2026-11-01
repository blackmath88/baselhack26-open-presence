/**
 * Two accounts side by side, aligned by what each record reports. The
 * comparison is a projection over the imported records (read in the browser
 * from the committed corpus); it names identical entries, shared words,
 * differences and what is not recorded. It never infers a shared cause or
 * which fix applies to the reader.
 */
import type { CommonsReader, ImportedProblem, SearchHit } from '../../commons/contracts'
import { appLinks } from '../../commons/contracts'
import { COMPARE_FIELDS, compareAccounts, type CompareField } from '../../commons/client/compare'
import { compareSituation, evidenceRefs } from '../../commons/client/situation'
import { navigate } from '../../commons/client/router'
import { SituationBar } from './SituationBar'
import { WhyMatched } from './WhyMatched'

const SIDE = ['A', 'B'] as const

export function CompareView({ reader, ids, query }: { reader: CommonsReader; ids: string[]; query?: string | undefined }) {
  const hits = query ? reader.search(query, 20) : []
  const records = ids.map((id) => ({ id, problem: reader.problem(id) }))
  const found = records.filter((r): r is { id: string; problem: ImportedProblem } => !!r.problem)
  // Candidates for adding or swapping: this situation's results when there is one, otherwise every record.
  const candidates: Array<{ id: string; title: string }> = (hits.length ? hits.map((h) => h.problemId) : reader.problems().map((p) => p.postackId))
    .map((id) => ({ id, title: reader.problem(id)?.title ?? id }))
  const go = (next: string[]) => navigate(appLinks.compare(next, query))
  const hitFor = (id: string): SearchHit | undefined => hits.find((h) => h.problemId === id)
  const comparison = found.length === 2 ? compareAccounts(found[0]!.problem, found[1]!.problem) : null

  return (
    <div className="commons-problem cx-compare">
      <SituationBar query={query} />
      <section className="commons-record" aria-labelledby="cx-compare-title">
        <div className="cx-record-status"><span className="cx-type">Comparison</span><span className="cx-status neutral">from the records only</span></div>
        <h2 id="cx-compare-title">Compare accounts</h2>
        <p className="phf-voices">
          Aligned by what each record reports. Similar symptoms do not show a shared cause, and neither record knows your frame.
          Open an account to read its original passages.
        </p>

        <div className="cx-compare-heads">
          {SIDE.map((side, i) => {
            const r = records[i]
            const others = candidates.filter((c) => !ids.includes(c.id))
            return (
              <div key={side} className="cx-compare-head" aria-label={`Account ${side}`}>
                <span className="cx-side">{side}</span>
                {r?.problem ? (
                  <>
                    <a className="cx-compare-title" href={appLinks.problem(r.id, query)}>{r.problem.title}</a>
                    <span className={`cx-status ${r.problem.provenance.review === 'unreviewed' ? 'warn' : 'ok'}`}>
                      {r.problem.provenance.review === 'unreviewed' ? 'Agent-written · not reviewed' : 'Reviewed'}
                    </span>
                    {hitFor(r.id)?.nearMatch && <span className="cx-status warn">Near match · conditions differ</span>}
                    {query && !hitFor(r.id) && <span className="cx-meta">Not among the results for your situation.</span>}
                  </>
                ) : r ? (
                  <p className="cx-state" role="status">No record called “{r.id}” in this Commons.</p>
                ) : (
                  <p className="cx-meta">No account chosen yet.</p>
                )}
                <div className="cx-compare-actions">
                  <label className="cx-pick">
                    <span>{r ? `Swap ${side} for` : `Choose account ${side}`}</span>
                    <select value="" onChange={(e) => { if (!e.target.value) return; const next = [...ids]; next[i] = e.target.value; go(next.filter(Boolean)) }}>
                      <option value="">{others.length ? 'Select…' : 'No other accounts'}</option>
                      {others.map((c) => <option key={c.id} value={c.id}>{c.title}</option>)}
                    </select>
                  </label>
                  {r && <a className="button" href={appLinks.compare(ids.filter((_, k) => k !== i), query)}>Remove {side}</a>}
                </div>
              </div>
            )
          })}
        </div>

        {found.length === 2 && comparison && (
          <>
            <Summary a={found[0]!.problem} b={found[1]!.problem} comparison={comparison} />
            <table className="cx-compare-table">
              <caption className="cx-sr">What each account reports, aligned by field</caption>
              <thead>
                <tr><th scope="col"><span className="cx-sr">Field</span></th>{found.map((r, i) => <th key={r.id} scope="col">{SIDE[i]} · {r.problem.title}</th>)}</tr>
              </thead>
              <tbody>
                {COMPARE_FIELDS.map(({ field, label }) => {
                  const fc = comparison.fields.find((f) => f.field === field)!
                  return (
                    <tr key={field}>
                      <th scope="row">{label}</th>
                      {found.map((r, i) => (
                        <td key={r.id} data-side={`${SIDE[i]} · ${label}`}>
                          <Cell entries={r.problem[field]} identical={fc.identical} field={field} query={query} problem={r.problem} />
                        </td>
                      ))}
                    </tr>
                  )
                })}
                <tr>
                  <th scope="row">Limit</th>
                  {found.map((r, i) => <td key={r.id} data-side={`${SIDE[i]} · Limit`}>{r.problem.statusNote ?? <span className="cx-unknown">Not recorded</span>}</td>)}
                </tr>
                <tr>
                  <th scope="row">Corrections</th>
                  {found.map((r, i) => (
                    <td key={r.id} data-side={`${SIDE[i]} · Corrections`}>
                      {r.problem.corrections.length
                        ? <ul>{r.problem.corrections.map((c) => <li key={c.id}>{c.note} <span className="cx-meta">({c.evidenceIds.map((id, k) => <span key={id}>{k ? ', ' : ''}<a href={appLinks.passage(r.id, id, query)}>{id}</a></span>)})</span></li>)}</ul>
                        : <span className="cx-meta">None recorded</span>}
                    </td>
                  ))}
                </tr>
                <tr>
                  <th scope="row">Evidence</th>
                  {found.map((r, i) => (
                    <td key={r.id} data-side={`${SIDE[i]} · Evidence`}>
                      <ul className="cx-compare-passages">
                        {r.problem.evidence.map((e) => (
                          <li key={e.id}>
                            <a href={appLinks.passage(r.id, e.id, query)}><span className="cx-pi-id">{e.id}</span> {e.role}</a>{' '}
                            <span className="cx-meta">{e.source.author === 'unknown' ? e.source.objectId : `@${e.source.author} · ${e.source.objectId}`}</span>
                          </li>
                        ))}
                      </ul>
                    </td>
                  ))}
                </tr>
                {query && (
                  <tr>
                    <th scope="row">Why it matched</th>
                    {found.map((r, i) => {
                      const hit = hitFor(r.id)
                      return <td key={r.id} data-side={`${SIDE[i]} · Why it matched`}>{hit ? <WhyMatched hit={hit} /> : <span className="cx-meta">Not among the results, so no match explanation.</span>}</td>
                    })}
                  </tr>
                )}
              </tbody>
            </table>
          </>
        )}
        {found.length < 2 && records.length === 2 && <p className="cx-meta">Choose another account to compare.</p>}
      </section>
    </div>
  )
}

function Cell({ entries, identical, field, query, problem }: { entries: string[]; identical: string[]; field: CompareField; query: string | undefined; problem: ImportedProblem }) {
  if (!entries.length) return <span className="cx-unknown">Not recorded</span>
  const situation = query && (field === 'device' || field === 'environment') ? compareSituation(query, problem) : []
  return (
    <ul>
      {entries.map((e) => {
        const s = situation.find((c) => c.label === e)
        return (
          <li key={e}>
            {field === 'outcomes'
              ? evidenceRefs(e, problem.evidence.map((x) => x.id)).map((part, k) => part.evidenceId ? <a key={k} href={appLinks.passage(problem.postackId, part.evidenceId, query)}>{part.text}</a> : <span key={k}>{part.text}</span>)
              : e}
            {identical.includes(e) && <> <span className="cx-status neutral">in both</span></>}
            {s && <span className="cx-meta"> — {s.yourWords.length ? `your words: ${s.yourWords.join(', ')}` : s.expandedWords.length ? `via ${s.expandedWords.join(', ')}, added by search` : 'not stated by you'}</span>}
          </li>
        )
      })}
    </ul>
  )
}

/** One matching circumstance, the differences and the unknowns, each from the records' own fields. */
function Summary({ a, b, comparison }: { a: ImportedProblem; b: ImportedProblem; comparison: ReturnType<typeof compareAccounts> }) {
  const same = comparison.fields.filter((f) => f.identical.length)
  const words = comparison.fields.filter((f) => f.sharedWords.length)
  const differs = comparison.fields.filter((f) => f.onlyA.length || f.onlyB.length)
  const missing = comparison.fields.filter((f) => f.missing.length)
  return (
    <section className="cx-fit" aria-labelledby="cx-compare-summary">
      <h3 id="cx-compare-summary">What this comparison shows</h3>
      <p className="cx-meta">Exact entries and shared words from the two records. It does not decide which account fits you.</p>
      <div className="cx-fit-cols">
        <div className="cx-fit-col">
          <h4>In both records</h4>
          <ul>
            {same.map((f) => <li key={f.field}><span className="cx-fit-k">{f.label}</span><span>{f.identical.join(' · ')}</span></li>)}
            {words.map((f) => <li key={`w-${f.field}`}><span className="cx-fit-k">{f.label}</span><span>both use the words {f.sharedWords.map((w) => <code key={w} className="cx-term">{w}</code>)} <span className="cx-meta">(the same words, not the same claim)</span></span></li>)}
            {comparison.sharedSources.length > 0 && <li><span className="cx-fit-k">Sources</span><span>both cite {comparison.sharedSources.join(', ')}</span></li>}
            {!same.length && !words.length && !comparison.sharedSources.length && <li><span className="cx-fit-k">Nothing</span><span>No identical entry, shared word or shared source.</span></li>}
          </ul>
        </div>
        <div className="cx-fit-col">
          <h4>Where they differ or are unknown</h4>
          <ul>
            {differs.map((f) => (
              <li key={f.field}><span className="cx-fit-k">{f.label}</span><span>A records {f.onlyA.length} entr{f.onlyA.length === 1 ? 'y' : 'ies'} B does not; B records {f.onlyB.length} A does not.</span></li>
            ))}
            {missing.map((f) => (
              <li key={`m-${f.field}`}><span className="cx-fit-k">{f.label}</span><span>Not recorded for {f.missing.map((s) => (s === 'a' ? `A (${a.title})` : `B (${b.title})`)).join(' and ')}.</span></li>
            ))}
            <li><span className="cx-fit-k">Unknown</span><span>Which account, if either, applies to your frame. The Commons only has your words.</span></li>
          </ul>
        </div>
      </div>
    </section>
  )
}
