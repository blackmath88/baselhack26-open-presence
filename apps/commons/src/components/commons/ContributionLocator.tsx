/** Resolves a contribution deep link to its problem before rendering the problem view around it. */
import { useEffect, useState } from 'react'
import { commonsApi } from '../../commons/client/api'

export function ContributionLocator({ token, contributionId, children }: { token: string; contributionId: string; children: (problemId: string) => React.ReactNode }) {
  const [problemId, setProblemId] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)
  useEffect(() => {
    setProblemId(null)
    commonsApi.contribution(token, contributionId).then((c) => setProblemId(c.problemId), (e) => setError(e instanceof Error ? e.message : 'Contribution not found.'))
  }, [token, contributionId])
  if (error) return <div className="banner error" role="alert">{error} <span className="commons-limit">({contributionId})</span></div>
  if (!problemId) return <div className="empty-state">Locating contribution…</div>
  return <>{children(problemId)}</>
}
