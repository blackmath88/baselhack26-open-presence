/**
 * One place that turns the route into a Commons view. Search, repository and
 * direct links are equal entrances; each keeps the selected problem and
 * contribution in the URL, so reload and back work everywhere.
 */
import type { CommonsReader } from '../../commons/contracts'
import type { Route } from '../../commons/client/router'
import { CommonsFinder } from './CommonsFinder'
import { RepoNavigator } from './RepoNavigator'
import { ProblemPanel } from './ProblemPanel'
import { ContributionLocator } from './ContributionLocator'

export function CommonsHub({ route, token, actorId, actorName, canReview, reader, onSubmitted }: {
  route: Route
  token: string
  actorId: string | null
  actorName?: string
  canReview: boolean
  reader: CommonsReader
  onSubmitted: (roomId: string) => void
}) {
  return (
    <div className="commons-hub">
      {(route.view === 'home' || route.view === 'search') && <CommonsFinder reader={reader} token={token} query={route.view === 'search' ? route.query : ''} />}
      {route.view === 'repo' && <RepoNavigator token={token} path={route.path} {...(route.object ? { object: route.object } : {})} {...(route.type ? { type: route.type } : {})} />}
      {route.view === 'problem' && <ProblemPanel key={route.problemId} token={token} problemId={route.problemId} actorId={actorId} actorName={actorName} canReview={canReview} mode="problem" onSubmitted={onSubmitted} />}
      {(route.view === 'contribution' || route.view === 'thread') && (
        <ContributionLocator token={token} contributionId={route.contributionId}>
          {(problemId) => <ProblemPanel key={`${route.view}:${route.contributionId}`} token={token} problemId={problemId} actorId={actorId} actorName={actorName} canReview={canReview} focus={route.contributionId} mode={route.view === 'thread' ? 'thread' : 'problem'} onSubmitted={onSubmitted} />}
        </ContributionLocator>
      )}
    </div>
  )
}
