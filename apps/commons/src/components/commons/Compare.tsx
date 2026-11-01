/**
 * Two imported records side by side, aligned by what each states. The summary names what is
 * stated in both, what both state differently, what is not stated or not knowable, and any
 * relationship a record itself declares. Each side links to its record and original sources, and
 * either side can be changed or removed without losing the other.
 */
import { ArrowLeft, ExternalLink } from 'lucide-react'
import type { CommonsReader, ImportedProblem } from '../../commons/contracts'
import { appLinks } from '../../commons/contracts'
import { navigate } from '../../commons/client/router'
import { COMPARE_LABEL, compareRecords, type CompareRow } from '../../commons/client/comparison'
import { findHit } from './Investigation'
import { MatchSummary } from './MatchSummary'

const safeHref = (url: string) => (/^https:\/\/github\.com\//.test(url) ? url : undefined)

function Items({ values, common, missing }: { values: string[]; common: string[]; missing: boolean }) {
  if (missing) return <em className="cc-not-stated">Not stated</em>
  return (
    <ul className="cc-items">
      {values.map((v) => <li key={v}>{v}{common.includes(v) && <span className="cc-in-both">in both</span>}</li>)}
    </ul>
  )
}

/** Each original source object once, linked to the public host. */
function Sources({ p }: { p: ImportedProblem }) {
  const seen = new Map<string, string | undefined>()
  for (const e of p.evidence) if (!seen.has(e.source.objectId)) seen.set(e.source.objectId, safeHref(e.source.permalink))
  const roles = new Map<string, number>()
  for (const e of p.evidence) roles.set(e.role, (roles.get(e.role) ?? 0) + 1)
  return (
    <>
      <p>{p.evidence.length} passage{p.evidence.length === 1 ? '' : 's'}: {[...roles].map(([r, n]) => `${n} ${r}`).join(', ')}</p>
      <ul className="cc-items">
        {[...seen].slice(0, 4).map(([id, href]) => (
          <li key={id}>{href ? <a href={href} target="_blank" rel="noreferrer noopener">{id} <ExternalLink size={12} aria-hidden="true" /><span className="sr-only"> (opens the original)</span></a> : id}</li>
        ))}
        {seen.size > 4 && <li className="commons-limit">and {seen.size - 4} more on the record</li>}
      </ul>
    </>
  )
}

function Chooser({ reader, query, self, other, side }: { reader: CommonsReader; query?: string; self: string; other: string; side: 'A' | 'B' }) {
  const options = (query ? reader.search(query, 8).map((h) => reader.problem(h.problemId)!) : [...reader.problems()].sort((x, y) => x.title.localeCompare(y.title)))
    .filter((p) => p && p.postackId !== other)
  return (
    <label className="cc-chooser">
      <span>Change {side}</span>
      <select value={self} onChange={(e) => navigate(side === 'A' ? appLinks.compare(e.target.value, other, query) : appLinks.compare(other, e.target.value, query))}>
        {!options.some((p) => p.postackId === self) && <option value={self}>{reader.problem(self)?.title ?? self}</option>}
        {options.map((p) => <option key={p.postackId} value={p.postackId}>{p.title}</option>)}
      </select>
    </label>
  )
}

export function Compare({ reader, a, b, query }: { reader: CommonsReader; a: string; b: string; query?: string }) {
  const pa = reader.problem(a), pb = reader.problem(b)
  const back = query
    ? <a href={appLinks.search(query, undefined, [a, b])}><ArrowLeft size={14} aria-hidden="true" /> Results for “{query}”</a>
    : <a href={appLinks.search('')}><ArrowLeft size={14} aria-hidden="true" /> Search</a>
  if (!pa || !pb) {
    return (
      <div className="cc-investigation">
        <nav className="cc-crumbs" aria-label="Breadcrumb">{back}</nav>
        <div className="banner error cc-state" role="alert">
          There is no problem record <code>{!pa ? a : b}</code> in this Commons, so there is nothing to compare it with.
        </div>
      </div>
    )
  }
  const c = compareRecords(pa, pb)
  const row = (f: CompareRow['field']) => c.rows.find((r) => r.field === f)!
  const sides = [{ key: 'A', p: pa, other: b }, { key: 'B', p: pb, other: a }] as const
  const removeHref = (keep: string) => (query ? appLinks.search(query, undefined, [keep]) : appLinks.problem(keep))
  const hits = query ? { a: findHit(reader, query, a), b: findHit(reader, query, b) } : undefined
  return (
    <section className="cc-compare" aria-labelledby="cc-compare-title">
      <nav className="cc-crumbs" aria-label="Breadcrumb">{back}</nav>
      <h1 id="cc-compare-title" className="cc-page-title" tabIndex={-1}>Compare two accounts</h1>
      <p className="commons-limit">Aligned from what each record states. Similar symptoms do not establish a shared cause or a shared fix.</p>

      <div className="cc-situation cc-compare-summary" aria-label="What this comparison shows">
        <div className="cc-fit">
          <div>
            <h3>Stated in both</h3>
            {c.shared.length ? (
              <ul>{c.shared.map((f) => <li key={f}><b>{COMPARE_LABEL[f]}:</b> {row(f).common.join(' · ')}</li>)}</ul>
            ) : <p>No item is stated in both records.</p>}
          </div>
          <div>
            <h3>Stated differently</h3>
            {c.differs.length ? (
              <p>Both records state {c.differs.map((f) => COMPARE_LABEL[f].toLowerCase()).join(', ')}, with nothing in common.</p>
            ) : <p>No field is stated in both with different content.</p>}
            {hits && (hits.a?.nearMatch || hits.b?.nearMatch) && (
              <p className="cc-warn"><strong>Near-match:</strong> {[hits.a?.nearMatch && 'A', hits.b?.nearMatch && 'B'].filter(Boolean).join(' and ')} reports a different platform from your situation.</p>
            )}
            {c.declared.map((d, i) => (
              <p key={i} className="commons-limit">{d.from === 'a' ? 'A' : 'B'} says: {d.relation} ({d.origin === 'source' ? 'stated in the source' : 'proposed by the record writer, unreviewed'})</p>
            ))}
          </div>
          <div>
            <h3>Not known here</h3>
            <p>Whether either account applies to your setup: the Commons has only {query ? 'the words you typed' : 'these two records'}.</p>
            {c.rows.filter((r) => r.missing.a !== r.missing.b).map((r) => (
              <p key={r.field} className="commons-limit">{COMPARE_LABEL[r.field]}: not stated in {r.missing.a ? 'A' : 'B'}.</p>
            ))}
          </div>
        </div>
      </div>

      <table className="cc-compare-table">
        <caption className="sr-only">Two records aligned by field</caption>
        <thead>
          <tr>
            <td />
            {sides.map(({ key, p, other }) => (
              <th key={key} scope="col">
                <span className="badge">{key}</span>
                <a className="cc-compare-name" href={appLinks.problem(p.postackId, query)}>{p.title}</a>
                <span className="cc-compare-actions">
                  <Chooser reader={reader} query={query} self={p.postackId} other={other} side={key} />
                  <a href={removeHref(other)}>Remove {key}</a>
                </span>
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {hits && (
            <tr>
              <th scope="row">Fit to your words</th>
              {sides.map(({ key, p }) => {
                const h = key === 'A' ? hits.a : hits.b
                return <td key={key} data-side={key}>{h ? <MatchSummary query={query!} hit={h} /> : <em className="cc-not-stated">Not among the results for your words</em>}</td>
              })}
            </tr>
          )}
          {c.rows.map((r) => (
            <tr key={r.field}>
              <th scope="row">{COMPARE_LABEL[r.field]}</th>
              <td data-side="A"><Items values={r.a} common={r.common} missing={r.missing.a} /></td>
              <td data-side="B"><Items values={r.b} common={r.commonB} missing={r.missing.b} /></td>
            </tr>
          ))}
          <tr>
            <th scope="row">Evidence and originals</th>
            {sides.map(({ key, p }) => <td key={key} data-side={key}><Sources p={p} /><a href={appLinks.problem(p.postackId, query)}>Read the passages</a></td>)}
          </tr>
          <tr>
            <th scope="row">Who wrote this record</th>
            {sides.map(({ key, p }) => (
              <td key={key} data-side={key}>{p.provenance.review === 'unreviewed' ? 'Agent-written, not reviewed by a person' : 'Reviewed'} · {p.provenance.authoredBy}</td>
            ))}
          </tr>
        </tbody>
      </table>
    </section>
  )
}
