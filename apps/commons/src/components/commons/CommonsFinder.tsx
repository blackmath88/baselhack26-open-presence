import { EDGE_MODE } from '../../lib/api'
/**
 * Search entrance. Problem records are searched in the browser over the
 * committed record-only index (offline, deterministic); new contributions are
 * searched on the server, where they live. Selecting a result navigates to
 * its deep link, so the URL always says where you are.
 */
import { useEffect, useMemo, useRef, useState } from 'react'
import { Search } from 'lucide-react'
import type { CommonsReader } from '../../commons/contracts'
import { appLinks } from '../../commons/contracts'
import { commonsApi, type SearchResponse } from '../../commons/client/api'
import { navigate } from '../../commons/client/router'
import { MatchSummary } from './MatchSummary'
import { actorLabel } from './ContributionCard'

const EXAMPLE = 'My Mac cannot see my frame'

export function CommonsFinder({ reader, token, query, selected, compare = [] }: { reader: CommonsReader; token: string; query: string; selected?: string; compare?: string[] }) {
  const [input, setInput] = useState(query)
  const [server, setServer] = useState<SearchResponse | null>(null)
  const [serverError, setServerError] = useState<string | null>(null)
  useEffect(() => { setInput(query) }, [query])
  const hits = useMemo(() => (query ? reader.search(query, 8) : []), [reader, query])
  // Returning from a record: bring the result you came from back into view and give it focus.
  const selectedRef = useRef<HTMLAnchorElement>(null)
  useEffect(() => {
    selectedRef.current?.scrollIntoView({ block: 'center' })
    selectedRef.current?.focus({ preventScroll: true })
  }, [selected, query])
  useEffect(() => {
    if (!query) { setServer(null); return }
    let cancelled = false
    commonsApi.search(token, query, 10).then((r) => { if (!cancelled) { setServer(r); setServerError(null) } }, (e) => { if (!cancelled) { setServer(null); setServerError(e instanceof Error ? e.message : 'Contribution search unavailable.') } })
    return () => { cancelled = true }
  }, [token, query])
  // Records chosen for comparison live in the URL; choosing replaces the history entry rather than adding one.
  const choose = (next: string[]) => location.replace(appLinks.search(query, undefined, next))
  const toggle = (id: string) => choose(compare.includes(id) ? compare.filter((c) => c !== id) : [...compare, id].slice(0, 2))
  const title = (id: string) => reader.problem(id)?.title ?? id
  const examples = [EXAMPLE, 'backup disk disappears on my Mac', 'frame stuck on its boot animation']
  return (
    <section className="commons-finder" aria-label="Find a photo-frame experience">
      <form className="commons-search" role="search" onSubmit={(e) => { e.preventDefault(); navigate(appLinks.search(input.trim())) }}>
        <label htmlFor="commons-q" className="phf-search-label">What happened with your photo frame?</label>
        <div className="commons-search-row">
          <input id="commons-q" value={input} placeholder={EXAMPLE} onChange={(e) => setInput(e.target.value)} autoComplete="off" />
          <button className="button primary" type="submit"><Search size={15} /> Search</button>
        </div>
        <div className="phf-examples" aria-label="Example questions">
          {examples.map((q) => <a key={q} className="phf-example" href={appLinks.search(q)}>{q}</a>)}
        </div>
        <p className="commons-limit">
          Photo Frame Commons: agent-written records over a pinned public snapshot of wesbos/photo-frame-dashboard, plus what participants and opted-in ATProto authors contributed here. Not live, not reviewed by a person. Ranking is lexical, not confidence.
        </p>
      </form>
      {query && hits.length === 0 && (!server || server.contributions.length === 0) && (
        <div className="phf-empty">
          <p><strong>No record or contribution matches “{query}”.</strong></p>
          <p className="commons-limit">Try the device or the symptom in other words, or browse the <a href={appLinks.repository()}>repository entrance</a>.</p>
        </div>
      )}
      {hits.length > 0 && (
        <>
          <h3 className="phf-section-title">Accounts that may apply <span className="commons-limit">· {hits.length} problem record{hits.length === 1 ? '' : 's'}</span></h3>
          <ol className="commons-hits">
            {hits.map((h) => {
              const p = reader.problem(h.problemId)
              const quoted = p?.evidence.find((e) => e.quote)
              return (
                <li key={h.problemId} className={`phf-hit-row${compare.includes(h.problemId) ? ' chosen' : ''}`}>
                  <a className={`commons-hit phf-result${h.problemId === selected ? ' selected' : ''}`} href={appLinks.problem(h.problemId, query)}
                    {...(h.problemId === selected ? { ref: selectedRef, 'aria-current': 'true' as const } : {})}>
                    <span className="phf-result-head">
                      <strong>{p?.title ?? h.problemId}</strong>
                      {h.nearMatch && <span className="badge conflict">near-match: conditions differ</span>}
                    </span>
                    {p && (
                      <span className="phf-applies">
                        <span><span className="phf-applies-k">Applies to</span> {p.device.join(', ') || 'device not stated'}</span>
                        <span><span className="phf-applies-k">When</span> {p.environment.slice(0, 3).join(' · ') || 'conditions not stated'}</span>
                        {p.statusNote && <span><span className="phf-applies-k">Limit</span> {p.statusNote}</span>}
                      </span>
                    )}
                    {quoted?.quote && (
                      <span className="phf-result-quote">“{quoted.quote.length > 160 ? `${quoted.quote.slice(0, 157)}…` : quoted.quote}” <span className="commons-limit">— {quoted.source.author === 'unknown' ? 'author unknown' : `@${quoted.source.author}`}, {quoted.source.objectId}</span></span>
                    )}
                    <span className="commons-why">Why it matched: <MatchSummary query={query} hit={h} /></span>
                    <CommunityLine summary={server?.problems.find((s) => s.problemId === h.problemId)?.community} />
                  </a>
                  <div className="phf-hit-actions">
                    <button type="button" className="button cc-compare-toggle" aria-pressed={compare.includes(h.problemId)}
                      disabled={!compare.includes(h.problemId) && compare.length >= 2} onClick={() => toggle(h.problemId)}>
                      {compare.includes(h.problemId) ? `Chosen to compare (${compare.indexOf(h.problemId) === 0 ? 'A' : 'B'})` : 'Compare'}
                    </button>
                    <details className="cc-trace">
                      <summary>Match trace</summary>
                      <p className="commons-limit">{h.explanation}</p>
                    </details>
                  </div>
                </li>
              )
            })}
          </ol>
          {compare.length > 0 && (
            <div className="cc-compare-bar" role="region" aria-label="Comparison">
              <span className="cc-label">Compare</span>
              <span className="cc-compare-chosen">{compare.map((id, i) => <span key={id}><span className="badge">{i ? 'B' : 'A'}</span> {title(id)}</span>)}</span>
              {compare.length === 2 ? (
                <a className="button primary" href={appLinks.compare(compare[0]!, compare[1]!, query)}>Compare these two</a>
              ) : <span className="commons-limit">Choose one more result.</span>}
              <button type="button" className="button" onClick={() => choose([])}>Clear</button>
            </div>
          )}
        </>
      )}
      {server && server.contributions.length > 0 && (
        <>
          <h3 className="phf-section-title">What people added <span className="commons-limit">· {server.contributions.length} contribution{server.contributions.length === 1 ? '' : 's'}</span></h3>
          <ol className="commons-hits">
            {server.contributions.map((h) => (
              <li key={h.contributionId}>
                <a className="commons-hit phf-result" href={appLinks.contribution(h.contributionId)}>
                  <span className="phf-result-head">
                    <strong>{h.summary.kind} by {actorLabel(h.summary.actor)}</strong>
                    <span className="badge">{h.summary.origin === 'atproto' ? 'ATProto' : EDGE_MODE ? 'Public on this Commons' : h.summary.publication}</span>
                    <span className="badge">via {h.summary.entrance}</span>
                  </span>
                  <span>{h.summary.excerpt}</span>
                  <span className="commons-limit">
                    {h.summary.sourceRefs.length ? <>cites {h.summary.sourceRefs.map((r) => r.author === 'unknown' ? r.objectId : `${r.objectId} (source author @${r.author})`).join(', ')}</> : 'cites no source'}
                  </span>
                  <span className="commons-why">{h.explanation} · problem {h.problemId}</span>
                </a>
              </li>
            ))}
          </ol>
        </>
      )}
      {server && (
        <p className="commons-limit">
          Coverage: {server.coverage.records} records from the snapshot of {server.coverage.snapshotAt.slice(0, 10)}, {server.coverage.contributions} contributions
          {server.coverage.lastSync.length ? `, synced authors: ${server.coverage.lastSync.map((s) => `${s.did.slice(0, 20)}… (${s.status})`).join(', ')}` : ', no ATProto author synced'}.
        </p>
      )}
      {serverError && <p className="banner error" role="alert">Contribution search is unavailable: {serverError}. Problem records above are searched in this browser.</p>}
    </section>
  )
}

type Community = NonNullable<Awaited<ReturnType<typeof commonsApi.search>>['problems'][number]['community']>
/** People's activity around a record, so a search result says whether anyone has been here. */
function CommunityLine({ summary }: { summary: Community | undefined }) {
  if (!summary) return null
  if (!summary.contributions && !summary.replies && !summary.citingFromOtherProblems) return <span className="commons-limit">No community contributions yet.</span>
  const parts = [
    `${summary.contributions} experience${summary.contributions === 1 ? '' : 's'}`,
    ...(summary.replies ? [`${summary.replies} repl${summary.replies === 1 ? 'y' : 'ies'}`] : []),
    ...(summary.participants.length ? [`from ${summary.participants.join(', ')}`] : []),
    ...(summary.latestAt ? [`last ${summary.latestAt.slice(0, 10)}`] : []),
    ...(summary.citingFromOtherProblems ? [`${summary.citingFromOtherProblems} more from other problems citing the same sources`] : []),
  ]
  return <span className="commons-limit">Community: {parts.join(' · ')}</span>
}
