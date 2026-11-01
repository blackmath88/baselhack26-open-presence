/**
 * Hash routes: every entrance has a URL that survives reload and the back
 * button, with no server routing. `#/problems/<id>`, `#/contributions/<id>`,
 * `#/threads/<id>`, `#/repo[/path][?object=issue/99]`, `#/search?q=…`.
 * A problem reached from search carries the situation (`#/problems/<id>?q=…`), and the way back
 * names the result it came from (`#/search?q=…&selected=<id>`). Up to two records chosen for comparison ride
 * along as `&compare=a,b`; the comparison itself is `#/compare?a=…&b=…[&q=…]`.
 */
import { useEffect, useState } from 'react'

export type Route =
  | { view: 'home' }
  | { view: 'search'; query: string; selected?: string; compare?: string[] }
  | { view: 'compare'; a: string; b: string; query?: string }
  | { view: 'repo'; path: string; object?: string; type?: 'issue' | 'pull' | 'discussion' }
  | { view: 'problem'; problemId: string; query?: string; trace?: string; stage?: string }
  | { view: 'contribution'; contributionId: string }
  | { view: 'thread'; contributionId: string }

export function parseRoute(hash: string): Route {
  const raw = hash.replace(/^#/, '')
  const [pathPart, queryPart = ''] = raw.split('?')
  const params = new URLSearchParams(queryPart)
  const segments = pathPart.split('/').filter(Boolean).map(decodeURIComponent)
  const [head, ...rest] = segments
  if (head === 'search') {
    const compare = [...new Set((params.get('compare') ?? '').split(',').map((c) => c.trim()).filter(Boolean))].slice(0, 2)
    return { view: 'search', query: params.get('q') ?? '', ...(params.get('selected') ? { selected: params.get('selected')! } : {}), ...(compare.length ? { compare } : {}) }
  }
  if (head === 'compare' && params.get('a') && params.get('b') && params.get('a') !== params.get('b')) {
    return { view: 'compare', a: params.get('a')!, b: params.get('b')!, ...(params.get('q')?.trim() ? { query: params.get('q')!.trim() } : {}) }
  }
  if (head === 'repo') {
    const type = params.get('type')
    return { view: 'repo', path: rest.join('/'), ...(params.get('object') ? { object: params.get('object')! } : {}), ...(type === 'issue' || type === 'pull' || type === 'discussion' ? { type } : {}) }
  }
  if (head === 'problems' && rest[0]) {
    const trace = params.get('trace')?.trim()
    return { view: 'problem', problemId: rest[0], ...(params.get('q')?.trim() ? { query: params.get('q')!.trim() } : {}), ...(trace ? { trace, ...(params.get('stage') ? { stage: params.get('stage')! } : {}) } : {}) }
  }
  if (head === 'contributions' && rest[0]) return { view: 'contribution', contributionId: rest[0] }
  if (head === 'threads' && rest[0]) return { view: 'thread', contributionId: rest[0] }
  return { view: 'home' }
}

export function navigate(hash: string): void {
  if (location.hash === hash) return
  location.hash = hash
}

/** True once the hash changed inside this page load, i.e. the person navigated rather than opened a link. */
export const navigation = { inApp: false }

export function useRoute(): Route {
  const [route, setRoute] = useState<Route>(() => parseRoute(location.hash))
  useEffect(() => {
    const onChange = () => { navigation.inApp = true; setRoute(parseRoute(location.hash)) }
    window.addEventListener('hashchange', onChange)
    return () => window.removeEventListener('hashchange', onChange)
  }, [])
  return route
}
