/**
 * The problem as a projection: the imported record (quotes vs record-writer
 * reading) and the attributed conversation around it, with reply, correction
 * and publication actions. Reached from search, repository, deep link or a tab.
 */
import { useCallback, useEffect, useState } from 'react'
import type { CommonsContribution } from '../../commons/contracts'
import { appLinks } from '../../commons/contracts'
import { commonsApi, type ProblemView } from '../../commons/client/api'
import { Record } from './Record'
import { ContributionCard, actorLabel } from './ContributionCard'
import { Composer, type Relation } from './Composer'
import { ThreadView } from './ThreadView'

export function ProblemPanel({ token, problemId, actorId, canReview, focus, mode, onSubmitted }: {
  token: string
  problemId: string
  actorId: string | null
  canReview: boolean
  /** Contribution to highlight (deep link) and, in thread mode, to open as a conversation. */
  focus?: string
  mode: 'problem' | 'thread'
  onSubmitted: (roomId: string) => void
}) {
  const [view, setView] = useState<ProblemView | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [version, setVersion] = useState(0)
  const [composer, setComposer] = useState<{ relation: Relation; parent?: { id: string; label: string } } | null>(null)
  const load = useCallback(() => {
    commonsApi.problem(token, problemId).then((v) => { setView(v); setError(null) }, (e) => setError(e instanceof Error ? e.message : 'Could not load the problem.'))
  }, [token, problemId])
  useEffect(() => { load() }, [load, version])
  useEffect(() => {
    if (focus && view) document.getElementById(`c-${focus}`)?.scrollIntoView({ block: 'center' })
  }, [focus, view])
  if (error) return <div className="banner error" role="alert">{error}</div>
  if (!view) return <div className="empty-state">Loading problem…</div>
  const label = (c: CommonsContribution) => `${c.kind} by ${actorLabel(c.actor)}`
  const reply = (c: CommonsContribution) => setComposer({ relation: 'reply', parent: { id: c.id, label: label(c) } })
  const correct = (c: CommonsContribution) => setComposer({ relation: 'correction', parent: { id: c.id, label: label(c) } })
  const refresh = () => setVersion((v) => v + 1)
  return (
    <div className="commons-problem">
      <div className="commons-detail">
        <div>
          <Record problem={view.problem} citations={view.evidenceCitations} />
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
        <div>
          {composer ? (
            <Composer key={`${composer.relation}:${composer.parent?.id ?? ''}`} token={token} problem={view} relation={composer.relation} parent={composer.parent ?? null}
              onSubmitted={(r) => { setComposer(null); refresh(); onSubmitted(r.problemId) }} onCancel={() => setComposer(null)} />
          ) : (
            <Composer key="root" token={token} problem={view} relation="root" onSubmitted={(r) => { refresh(); onSubmitted(r.problemId) }} />
          )}
          <p className="commons-limit">
            Deep links: <a href={appLinks.problem(problemId)}>this problem</a> · <a href={appLinks.repository()}>repository</a>. Room version {view.version}.
          </p>
        </div>
      </div>
    </div>
  )
}
