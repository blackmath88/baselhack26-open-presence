/**
 * Hash routes: every entrance has a URL that survives reload and the back
 * button, with no server routing. `#/problems/<id>`, `#/contributions/<id>`,
 * `#/threads/<id>`, `#/repo[/path][?object=issue/99]`, `#/search?q=…`.
 */
import { useEffect, useState } from 'react'

export type Route =
  | { view: 'home' }
  | { view: 'search'; query: string }
  | { view: 'repo'; path: string; object?: string; type?: 'issue' | 'pull' | 'discussion' }
  | { view: 'problem'; problemId: string }
  | { view: 'contribution'; contributionId: string }
  | { view: 'thread'; contributionId: string }

export function parseRoute(hash: string): Route {
  const raw = hash.replace(/^#/, '')
  const [pathPart, queryPart = ''] = raw.split('?')
  const params = new URLSearchParams(queryPart)
  const segments = pathPart.split('/').filter(Boolean).map(decodeURIComponent)
  const [head, ...rest] = segments
  if (head === 'search') return { view: 'search', query: params.get('q') ?? '' }
  if (head === 'repo') {
    const type = params.get('type')
    return { view: 'repo', path: rest.join('/'), ...(params.get('object') ? { object: params.get('object')! } : {}), ...(type === 'issue' || type === 'pull' || type === 'discussion' ? { type } : {}) }
  }
  if (head === 'problems' && rest[0]) return { view: 'problem', problemId: rest[0] }
  if (head === 'contributions' && rest[0]) return { view: 'contribution', contributionId: rest[0] }
  if (head === 'threads' && rest[0]) return { view: 'thread', contributionId: rest[0] }
  return { view: 'home' }
}

export function navigate(hash: string): void {
  if (location.hash === hash) return
  location.hash = hash
}

export function useRoute(): Route {
  const [route, setRoute] = useState<Route>(() => parseRoute(location.hash))
  useEffect(() => {
    const onChange = () => setRoute(parseRoute(location.hash))
    window.addEventListener('hashchange', onChange)
    return () => window.removeEventListener('hashchange', onChange)
  }, [])
  return route
}
