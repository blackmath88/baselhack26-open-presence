/**
 * The problem as a projection: the imported record (quotes vs record-writer
 * reading) and the attributed conversation around it, with reply, correction
 * and publication actions. Reached from search, repository, deep link or a tab.
 */
import { useCallback, useEffect, useRef, useState } from 'react'
import { CheckCircle2 } from 'lucide-react'
import { journey } from '../../commons/client/journey'
import type { CommonsContribution, SearchHit } from '../../commons/contracts'
import { ApiError } from '../../lib/api'
import { appLinks } from '../../commons/contracts'
import { commonsApi, type ProblemView } from '../../commons/client/api'
import { Record } from './Record'
import { ContributionCard, actorLabel } from './ContributionCard'
import { Composer, type Relation } from './Composer'
import { ThreadView } from './ThreadView'
import { SituationBar } from './SituationBar'

export function ProblemPanel({ token, problemId, query, hit, passage, actorId, actorName, canReview, focus, mode, onSubmitted }: {
  token: string
  problemId: string
  /** The situation searched for, when the record was opened from search results. */
  query?: string
  /** This record's own search hit for `query`, when it is among the results. */
  hit?: SearchHit | undefined
  /** Evidence passage selected through the URL. */
  passage?: string
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
  const [recorded, setRecorded] = useState<{ id: string; relation: Relation } | null>(null)
  const openComposer = () => requestAnimationFrame(() => document.getElementById('phf-composer')?.scrollIntoView({ block: 'start', behavior: matchMedia('(prefers-reduced-motion: reduce)').matches ? 'auto' : 'smooth' }))
  // Each request is tagged; a response that arrives after a newer request (or after leaving) is dropped.
  const latest = useRef(0)
  useEffect(() => () => { latest.current = -1 }, [])
  const load = useCallback(() => {
    const ticket = ++latest.current
    commonsApi.problem(token, problemId).then(
      (v) => { if (latest.current === ticket) { setView(v); setError(null) } },
      (e) => {
        if (latest.current !== ticket) return
        setError({ message: e instanceof Error ? e.message : 'Could not load the problem.', notFound: e instanceof ApiError && e.status === 404 })
      },
    )
  }, [token, problemId])
  useEffect(() => { load() }, [load, version])
  useEffect(() => {
    if (focus && view) document.getElementById(`c-${focus}`)?.scrollIntoView({ block: 'center' })
  }, [focus, view])
  const context = <SituationBar query={query} />
  // The situation and the way back stay on screen in every state.
  if (error && !view) return (
    <div className="commons-problem">
      {context}
      <div className="cx-state" role="alert">
        {error.notFound ? (
          <>
            <p><strong>No record called “{problemId}” in this Commons.</strong></p>
            <p className="commons-limit">The link may be mistyped, or the record is not in the pinned snapshot. Nothing is shown rather than something guessed.</p>
          </>
        ) : (
          <>
            <p><strong>The record could not be loaded.</strong></p>
            <p className="commons-limit">{error.message}</p>
            <button type="button" className="button" onClick={() => { setError(null); load() }}>Try again</button>
          </>
        )}
      </div>
    </div>
  )
  if (!view) return (
    <div className="commons-problem" aria-busy="true">
      {context}
      <div className="cx-state" role="status">Loading the record…</div>
    </div>
  )
  const label = (c: CommonsContribution) => `${c.kind} by ${actorLabel(c.actor)}`
  const reply = (c: CommonsContribution) => { setRecorded(null); setComposer({ relation: 'reply', parent: { id: c.id, label: label(c) } }); openComposer() }
  const correct = (c: CommonsContribution) => { setRecorded(null); setComposer({ relation: 'correction', parent: { id: c.id, label: label(c) } }); openComposer() }
  const refresh = () => setVersion((v) => v + 1)
  return (
    <div className="commons-problem">
      {context}
      {error && <div className="banner error" role="alert">Could not refresh: {error.message} What you see is the last loaded version.</div>}
      <div className="commons-detail">
        <div>
          <Record problem={view.problem} {...(hit ? { hit } : {})} {...(query ? { query } : {})} {...(passage ? { passage } : {})} citations={view.evidenceCitations} shared={view.sharedSources} onCite={(id) => { journey.mark('inspect'); setComposer(null); setRecorded(null); setCiting(id); openComposer() }} />
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
          {recorded && <Recorded id={recorded.id} relation={recorded.relation} problemId={problemId} />}
          {composer ? (
            <Composer key={`${composer.relation}:${composer.parent?.id ?? ''}`} token={token} actorName={actorName} problem={view} relation={composer.relation} parent={composer.parent ?? null}
              onSubmitted={(r) => { setRecorded({ id: r.contributionId, relation: composer.relation }); setComposer(null); refresh(); openComposer(); onSubmitted(r.problemId) }} onCancel={() => setComposer(null)} />
          ) : (
            <Composer key={`root:${citing ?? ''}`} token={token} actorName={actorName} problem={view} relation="root" {...(citing ? { focusEvidence: citing } : {})} onSubmitted={(r) => { setRecorded({ id: r.contributionId, relation: 'root' }); setCiting(undefined); refresh(); openComposer(); onSubmitted(r.problemId) }} />
          )}
          <p className="commons-limit">
            Deep links: <a href={appLinks.problem(problemId)}>this problem</a> · <a href={appLinks.repository()}>repository</a>. Room version {view.version}.
          </p>
        </div>
      </div>
    </div>
  )
}

/** After a submission: where it now lives and the next moves of the journey. */
function Recorded({ id, relation, problemId }: { id: string; relation: Relation; problemId: string }) {
  return (
    <div className="phf-recorded" role="status">
      <p><CheckCircle2 size={16} /> <strong>{relation === 'root' ? 'Recorded in the local shared room.' : 'Added to the conversation. The original stays as it was.'}</strong></p>
      <p className="commons-limit">It survives reload and is reachable by its own link from any entrance.</p>
      <div className="commons-actions">
        <a className="button" href={appLinks.thread(id)}>Open the conversation</a>
        <a className="button" href={appLinks.contribution(id)}>Permalink</a>
        {relation === 'root' && <a className="button" href={appLinks.problem(problemId)}>Back to the record</a>}
      </div>
      {relation === 'root' && <p className="commons-limit">Next: switch <strong>Voice</strong> at the top to another participant and reply or correct.</p>}
    </div>
  )
}
