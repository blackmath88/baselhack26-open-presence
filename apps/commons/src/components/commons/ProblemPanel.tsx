/**
 * The problem as a projection: the imported record (quotes vs record-writer
 * reading) and the attributed conversation around it, with reply, correction
 * and publication actions. Reached from search, repository, deep link or a tab.
 */
import { useCallback, useEffect, useState } from 'react'
import { CheckCircle2 } from 'lucide-react'
import { journey } from '../../commons/client/journey'
import type { CommonsContribution, CommonsReader, ModeratedContribution } from '../../commons/contracts'
import { isModerated } from '../../commons/contracts'
import { appLinks } from '../../commons/contracts'
import { commonsApi, type ProblemView } from '../../commons/client/api'
import { Record, type Trace } from './Record'
import { ContributionCard, actorLabel } from './ContributionCard'
import { Composer, type Relation } from './Composer'
import { ThreadView } from './ThreadView'
import { Investigation, findHit } from './Investigation'
import { ApiError } from '../../lib/api'
import { navigation } from '../../commons/client/router'

export function ProblemPanel({ token, problemId, query, trace, reader, actorId, actorName, canReview, focus, mode, onSubmitted }: {
  token: string
  problemId: string
  /** The situation typed in search, when the record was reached from results. */
  query?: string
  /** The passage whose lineage is open (from the URL). */
  trace?: Trace
  reader: CommonsReader
  actorId: string | null
  actorName?: string
  canReview: boolean
  /** Contribution to highlight (deep link) and, in thread mode, to open as a conversation. */
  focus?: string
  mode: 'problem' | 'thread'
  onSubmitted: (roomId: string) => void
}) {
  const [view, setView] = useState<ProblemView | null>(null)
  const [error, setError] = useState<{ message: string; notFound: boolean } | null>(null)
  const [version, setVersion] = useState(0)
  const [composer, setComposer] = useState<{ relation: Relation; parent?: { id: string; label: string } } | null>(null)
  const [citing, setCiting] = useState<string | undefined>(undefined)
  const [recorded, setRecorded] = useState<{ id: string; relation: Relation; replayed: boolean } | null>(null)
  const openComposer = () => requestAnimationFrame(() => document.getElementById('phf-composer')?.scrollIntoView({ block: 'start', behavior: matchMedia('(prefers-reduced-motion: reduce)').matches ? 'auto' : 'smooth' }))
  const load = useCallback(() => {
    commonsApi.problem(token, problemId).then((v) => { setView(v); setError(null) }, (e) => setError({ message: e instanceof Error ? e.message : 'Could not load the problem.', notFound: e instanceof ApiError && e.status === 404 }))
  }, [token, problemId])
  useEffect(() => { load() }, [load, version])
  useEffect(() => {
    if (focus && view) document.getElementById(`c-${focus}`)?.scrollIntoView({ block: 'center' })
  }, [focus, view])
  // A record opens at its top, not at the scroll position of the results it was reached from.
  useEffect(() => { if (!focus) window.scrollTo(0, 0) }, [problemId, focus])
  // Arriving from a result link (which unmounts with the results): put keyboard and screen-reader focus on the record.
  // Not on a fresh load or deep link, where the browser's own starting point is right.
  const loaded = Boolean(view)
  useEffect(() => {
    if (loaded && !focus && navigation.inApp && (!document.activeElement || document.activeElement === document.body)) document.getElementById('commons-record-title')?.focus({ preventScroll: true })
  }, [loaded, focus])
  const matchHit = query ? findHit(reader, query, problemId) : undefined
  const context = mode === 'problem' && !focus ? <Investigation reader={reader} problemId={problemId} query={query} /> : null
  if (error) return (
    <div className="commons-problem">
      {context}
      <div className="banner error cc-state" role="alert">
        {error.notFound ? <>There is no problem record <code>{problemId}</code> in this Commons.</> : <>The record could not be loaded: {error.message}</>}
        {!error.notFound && <button className="button" onClick={() => { setError(null); load() }}>Try again</button>}
      </div>
    </div>
  )
  if (!view) return <div className="commons-problem">{context}<div className="empty-state" role="status">Loading the record…</div></div>
  const label = (c: CommonsContribution) => `${c.kind} by ${actorLabel(c.actor)}`
  const reply = (c: CommonsContribution) => { setRecorded(null); setComposer({ relation: 'reply', parent: { id: c.id, label: label(c) } }); openComposer() }
  const correct = (c: CommonsContribution) => { setRecorded(null); setComposer({ relation: 'correction', parent: { id: c.id, label: label(c) } }); openComposer() }
  const refresh = () => setVersion((v) => v + 1)
  return (
    <div className="commons-problem">
      {context}
      <div className="commons-detail">
        <div>
          <Record problem={view.problem} citations={view.evidenceCitations} shared={view.sharedSources}
            {...(trace ? { trace } : {})} {...(query ? { query } : {})} {...(matchHit ? { matchHit } : {})}
            onTrace={(t) => location.replace(appLinks.problem(problemId, query, t ?? undefined))} onCite={(id) => { journey.mark('inspect'); setComposer(null); setRecorded(null); setCiting(id); openComposer() }} />
          <section aria-label="Conversation" className="commons-conversation">
            <h3>
              Experiences and conversation · {view.contributions.length}
              {view.moderatedCount > 0 && <span className="commons-limit"> · {view.moderatedCount} withheld</span>}
              {view.publication.published > 0 && <span className="commons-limit"> · {view.publication.published} published to ATProto</span>}
            </h3>
            {mode === 'thread' && focus ? (
              <ThreadView token={token} contributionId={focus} actorId={actorId} canReview={canReview} onReply={reply} onCorrect={correct} version={version} />
            ) : view.contributions.length === 0 ? (
              <p className="commons-limit">No participant or external contribution yet. The record above is agent-written and unreviewed.</p>
            ) : (
              view.contributions.map((c) => (
                <ContributionCard key={c.id} c={c} token={token} actorId={actorId} canReview={canReview} onReply={reply} onCorrect={correct} onChanged={refresh} highlight={c.id === focus} />
              ))
            )}
            {mode === 'thread' && <p><a href={appLinks.problem(problemId)}>All contributions to this problem</a></p>}
          </section>
        </div>
        <div id="phf-composer" className="phf-composer-col">
          {recorded && <Recorded token={token} id={recorded.id} replayed={recorded.replayed} relation={recorded.relation} problemId={problemId} />}
          {composer ? (
            <Composer key={`${composer.relation}:${composer.parent?.id ?? ''}`} token={token} actorName={actorName} {...(query ? { query } : {})} problem={view} relation={composer.relation} parent={composer.parent ?? null}
              onSubmitted={(r) => { setRecorded({ id: r.contributionId, relation: composer.relation, replayed: r.replayed }); setComposer(null); refresh(); openComposer(); onSubmitted(r.problemId) }} onCancel={() => setComposer(null)} />
          ) : (
            <Composer key={`root:${citing ?? ''}`} token={token} actorName={actorName} {...(query ? { query } : {})} problem={view} relation="root" {...(citing ? { focusEvidence: citing } : {})} onSubmitted={(r) => { setRecorded({ id: r.contributionId, relation: 'root', replayed: r.replayed }); setCiting(undefined); refresh(); openComposer(); onSubmitted(r.problemId) }} />
          )}
          <p className="commons-limit">
            Deep links: <a href={appLinks.problem(problemId)}>this problem</a> · <a href={appLinks.repository()}>repository</a>. Room version {view.version}.
          </p>
        </div>
      </div>
    </div>
  )
}

/** Words to search for to find a contribution again: its first few, without a leading [tag]. */
export const rediscoveryWords = (text: string) => text.trim().replace(/^\[[^\]]*\]\s*/, '').split(/\s+/).slice(0, 6).join(' ')

/**
 * After a submission: what the room itself now holds (read back from the server, not echoed
 * from the form), who can see it, and the ways to find it again from each entrance.
 */
function Recorded({ token, id, replayed, relation, problemId }: { token: string; id: string; replayed: boolean; relation: Relation; problemId: string }) {
  const [held, setHeld] = useState<CommonsContribution | ModeratedContribution | null>(null)
  const [readError, setReadError] = useState<string | null>(null)
  useEffect(() => {
    commonsApi.contribution(token, id).then(setHeld, (e) => setReadError(e instanceof Error ? e.message : 'could not read it back'))
  }, [token, id])
  const c = held && !isModerated(held) ? held : null
  return (
    <section className="phf-recorded" aria-labelledby="cc-recorded-title">
      <p id="cc-recorded-title" role="status"><CheckCircle2 size={16} aria-hidden="true" /> <strong>{replayed ? 'Already recorded earlier; no duplicate was created.' : relation === 'root' ? 'Recorded in the local shared room.' : 'Added to the conversation. The original stays as it was.'}</strong></p>
      {readError && <p className="banner error">Recorded, but reading it back failed: {readError}. Its permalink below still works.</p>}
      {held && isModerated(held) && <p className="cc-warn">The room holds it but withholds it ({held.reason}); others will not see it.</p>}
      {!held && !readError && <p className="commons-limit" role="status">Reading it back from the room…</p>}
      {c && (
        <dl className="cc-kv" aria-label="What the room holds">
          <dt>Recorded as</dt><dd><code>{c.id}</code> · revision {c.revision} · {new Date(c.createdAt).toLocaleString()}</dd>
          <dt>Speaks as</dt><dd>{actorLabel(c.actor)} <span className="commons-limit">({c.actor.kind}, confirmed by the server)</span></dd>
          <dt>Words</dt><dd>{c.text}</dd>
          <dt>Cites</dt><dd>{c.sourceRefs.map((r) => r.objectId).join(', ') || 'nothing'}{c.evidenceIds?.length ? ` · passages ${c.evidenceIds.join(', ')}` : ''}</dd>
          <dt>Who can see it</dt><dd>Participants who sign in to this room, through the app, the repository view, the CLI and MCP. {c.publication ? `Publication: ${c.publication.status}.` : 'Not published to ATProto.'}</dd>
        </dl>
      )}
      <p className="phf-kicker">Find it again</p>
      <div className="commons-actions">
        {c && <a className="button" href={appLinks.search(rediscoveryWords(c.text))}>Search for “{rediscoveryWords(c.text)}”</a>}
        <a className="button" href={appLinks.thread(id)}>Open the conversation</a>
        <a className="button" href={appLinks.contribution(id)}>Permalink</a>
        {relation === 'root' && <a className="button" href={appLinks.problem(problemId)}>Back to the record</a>}
      </div>
      <p className="commons-limit">From a terminal: <code>npm run commons -- inspect {id}</code></p>
      {relation === 'root' && <p className="commons-limit">Next: switch <strong>Voice</strong> at the top to another participant and reply or correct.</p>}
    </section>
  )
}
