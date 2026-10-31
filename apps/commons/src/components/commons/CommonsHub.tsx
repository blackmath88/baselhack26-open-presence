/**
 * One place that turns the route into a Commons view. Search, repository and
 * direct links are equal entrances; each keeps the selected problem and
 * contribution in the URL, so reload and back work everywhere.
 */
import { FolderGit2, Search } from 'lucide-react'
import type { CommonsReader } from '../../commons/contracts'
import { appLinks } from '../../commons/contracts'
import type { Route } from '../../commons/client/router'
import { CommonsFinder } from './CommonsFinder'
import { RepoNavigator } from './RepoNavigator'
import { ProblemPanel } from './ProblemPanel'
import { ContributionLocator } from './ContributionLocator'

export function CommonsHub({ route, token, actorId, canReview, reader, onSubmitted }: {
  route: Route
  token: string
  actorId: string | null
  canReview: boolean
  reader: CommonsReader
  onSubmitted: (roomId: string) => void
}) {
  return (
    <div className="commons-hub">
      <nav className="commons-entrances" aria-label="Entrances">
        <a className={`button ${route.view === 'home' || route.view === 'search' ? 'active' : ''}`} href={appLinks.search('')}><Search size={14} /> Search</a>
        <a className={`button ${route.view === 'repo' ? 'active' : ''}`} href={appLinks.repository()}><FolderGit2 size={14} /> Repository</a>
        {route.view === 'problem' && <span className="commons-limit">Problem · {route.problemId}</span>}
        {(route.view === 'contribution' || route.view === 'thread') && <span className="commons-limit">{route.view === 'thread' ? 'Thread' : 'Contribution'} · {route.contributionId}</span>}
      </nav>
      {(route.view === 'home' || route.view === 'search') && <CommonsFinder reader={reader} token={token} query={route.view === 'search' ? route.query : ''} />}
      {route.view === 'repo' && <RepoNavigator token={token} path={route.path} {...(route.object ? { object: route.object } : {})} {...(route.type ? { type: route.type } : {})} />}
      {route.view === 'problem' && <ProblemPanel key={route.problemId} token={token} problemId={route.problemId} actorId={actorId} canReview={canReview} mode="problem" onSubmitted={onSubmitted} />}
      {(route.view === 'contribution' || route.view === 'thread') && (
        <ContributionLocator token={token} contributionId={route.contributionId}>
          {(problemId) => <ProblemPanel key={`${route.view}:${route.contributionId}`} token={token} problemId={problemId} actorId={actorId} canReview={canReview} focus={route.contributionId} mode={route.view === 'thread' ? 'thread' : 'problem'} onSubmitted={onSubmitted} />}
        </ContributionLocator>
      )}
    </div>
  )
}
