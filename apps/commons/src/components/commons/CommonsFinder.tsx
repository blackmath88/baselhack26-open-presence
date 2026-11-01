/**
 * Search entrance. Problem records are searched in the browser over the
 * committed record-only index (offline, deterministic); new contributions are
 * searched on the server, where they live. Selecting a result navigates to
 * its deep link, so the URL always says where you are.
 */
import { useEffect, useMemo, useState } from 'react'
import { Search } from 'lucide-react'
import type { CommonsReader } from '../../commons/contracts'
import { appLinks } from '../../commons/contracts'
import { commonsApi, type SearchResponse } from '../../commons/client/api'
import { navigate } from '../../commons/client/router'
import { actorLabel } from './ContributionCard'

const EXAMPLE = 'My Mac cannot see my frame'

export function CommonsFinder({ reader, token, query }: { reader: CommonsReader; token: string; query: string }) {
  const [input, setInput] = useState(query)
  const [server, setServer] = useState<SearchResponse | null>(null)
  const [serverError, setServerError] = useState<string | null>(null)
  useEffect(() => { setInput(query) }, [query])
  const hits = useMemo(() => (query ? reader.search(query, 8) : []), [reader, query])
  useEffect(() => {
    if (!query) { setServer(null); return }
    let cancelled = false
    commonsApi.search(token, query, 10).then((r) => { if (!cancelled) { setServer(r); setServerError(null) } }, (e) => { if (!cancelled) { setServer(null); setServerError(e instanceof Error ? e.message : 'Contribution search unavailable.') } })
    return () => { cancelled = true }
  }, [token, query])
  return (
    <section className="commons-finder" aria-label="Find a photo-frame experience">
      <form className="commons-search" role="search" onSubmit={(e) => { e.preventDefault(); navigate(appLinks.search(input.trim())) }}>
        <label htmlFor="commons-q" className="section-kicker">Find an experience in the Photo Frame Commons</label>
        <div className="commons-search-row">
          <input id="commons-q" value={input} placeholder={EXAMPLE} onChange={(e) => setInput(e.target.value)} />
          <button className="button" type="submit"><Search size={15} /> Search</button>
        </div>
        <p className="commons-limit">
          Searches agent-written records over a pinned public snapshot of wesbos/photo-frame-dashboard, plus what participants and opted-in ATProto authors contributed here. Not live, not reviewed by a person. Ranking is lexical, not confidence.
        </p>
      </form>
      {query && hits.length === 0 && (!server || server.contributions.length === 0) && <p>No record or contribution matches “{query}”.</p>}
      {hits.length > 0 && (
        <>
          <h3>Problem records</h3>
          <ol className="commons-hits">
            {hits.map((h) => {
              const p = reader.problem(h.problemId)
              return (
                <li key={h.problemId}>
                  <a className="commons-hit" href={appLinks.problem(h.problemId)}>
                    <strong>{p?.title ?? h.problemId}</strong>
                    {h.nearMatch && <span className="badge conflict">near-match</span>}
                    <span className="commons-why">{h.explanation}</span>
                    <CommunityLine summary={server?.problems.find((s) => s.problemId === h.problemId)?.community} />
                  </a>
                </li>
              )
            })}
          </ol>
        </>
      )}
      {server && server.contributions.length > 0 && (
        <>
          <h3>Contributions</h3>
          <ol className="commons-hits">
            {server.contributions.map((h) => (
              <li key={h.contributionId}>
                <a className="commons-hit" href={appLinks.contribution(h.contributionId)}>
                  <strong>{h.summary.kind} by {actorLabel(h.summary.actor)}</strong>
                  <span className="badge">{h.summary.origin === 'atproto' ? 'ATProto' : h.summary.publication}</span>
                  <span>{h.summary.excerpt}</span>
                  <span className="commons-limit">
                    entered via {h.summary.entrance}
                    {h.summary.sourceRefs.length ? <> · cites {h.summary.sourceRefs.map((r) => r.author === 'unknown' ? r.objectId : `${r.objectId} (source author @${r.author})`).join(', ')}</> : ' · cites no source'}
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
      {serverError && <p className="commons-limit">Contribution search: {serverError}</p>}
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
