/**
 * Contributions citing a source object: the path back from evidence and from
 * the repository to what people added, and how far each conversation went.
 * Shared by the problem record (per evidence item) and the repository navigator.
 */
import { appLinks } from '../../commons/contracts'
import { actorLabel } from './ContributionCard'

export type Citing = {
  contributionId: string; problemId: string; kind: string; actor: Parameters<typeof actorLabel>[0]; entrance: string
  cited: string[]; excerpt: string; createdAt: string; link: string
  replies: number; participants: string[]; lastActivityAt: string; otherProblem?: boolean
}

const conversation = (c: Citing) => c.replies === 0
  ? 'no replies yet'
  : `${c.replies} repl${c.replies === 1 ? 'y' : 'ies'} · ${c.participants.length} ${c.participants.length === 1 ? 'person' : 'people'} · last ${c.lastActivityAt.slice(0, 10)}`

export function CitingList({ contributions, label = 'Contributions citing this' }: { contributions: Citing[]; label?: string }) {
  if (!contributions.length) return null
  return (
    <ul className="commons-citing" aria-label={label}>
      {contributions.map((c) => (
        <li key={c.contributionId}>
          <a href={c.link}>{c.kind} by {actorLabel(c.actor)}</a>
          <span className="commons-limit"> · via {c.entrance} · {c.createdAt.slice(0, 10)} · cites {c.cited.join(', ')}</span>
          {c.otherProblem
            ? <span className="commons-limit"> · in another problem: <a href={appLinks.problem(c.problemId)}>{c.problemId}</a></span>
            : <span className="commons-limit"> · problem {c.problemId}</span>}
          <div className="commons-limit">“{c.excerpt}” — {c.replies > 0 ? <a href={appLinks.thread(c.contributionId)}>{conversation(c)}</a> : conversation(c)}</div>
        </li>
      ))}
    </ul>
  )
}

export const citingCount = (n: number) => (n ? <span className="badge" title="community contributions citing this">{n} contribution{n === 1 ? '' : 's'}</span> : null)
