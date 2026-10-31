/** A conversation: replies and corrections as a tree, both voices kept. */
import { useCallback, useEffect, useState } from 'react'
import type { CommonsContribution } from '../../commons/contracts'
import { appLinks } from '../../commons/contracts'
import { commonsApi, type ThreadView as Thread } from '../../commons/client/api'
import { ContributionCard, actorLabel } from './ContributionCard'

type Node = Thread['root']

export function ThreadView({ token, contributionId, actorId, canReview, onReply, onCorrect, version }: {
  token: string
  contributionId: string
  actorId: string | null
  canReview: boolean
  onReply: (c: CommonsContribution) => void
  onCorrect: (c: CommonsContribution) => void
  version: number
}) {
  const [thread, setThread] = useState<Thread | null>(null)
  const [error, setError] = useState<string | null>(null)
  const load = useCallback(() => {
    commonsApi.thread(token, contributionId).then((t) => { setThread(t); setError(null) }, (e) => setError(e instanceof Error ? e.message : 'Could not load the thread.'))
  }, [token, contributionId])
  useEffect(() => { load() }, [load, version])
  if (error) return <div className="banner error" role="alert">{error}</div>
  if (!thread) return <div className="empty-state">Loading thread…</div>
  const render = (node: Node, depth: number): React.ReactNode => (
    <div key={node.contribution.id} className="commons-thread-node" style={{ marginLeft: Math.min(depth, 4) * 16 }}>
      <ContributionCard c={node.contribution} token={token} actorId={actorId} canReview={canReview} onReply={onReply} onCorrect={onCorrect} onChanged={load} highlight={node.contribution.id === contributionId} />
      {node.corrections.map((n) => render(n, depth + 1))}
      {node.replies.map((n) => render(n, depth + 1))}
    </div>
  )
  return (
    <section className="commons-thread" aria-label="Conversation">
      <div className="section-kicker">
        Conversation · {thread.participants.length} voice{thread.participants.length === 1 ? '' : 's'}: {thread.participants.map((p) => actorLabel({ id: p, kind: p.startsWith('did:') ? 'atproto' : 'participant' })).join(', ')} ·{' '}
        <a href={appLinks.problem(thread.problemId)}>problem {thread.problemId}</a>
      </div>
      {render(thread.root, 0)}
    </section>
  )
}
