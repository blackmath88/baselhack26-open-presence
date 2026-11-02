/**
 * Commons backend client: the browser's entrance to the same operations the
 * CLI and MCP use. The participant is resolved by the server from the bearer
 * token; no body ever names who is acting.
 */
import { ApiError, EDGE_MODE } from '../../lib/api'
import type { CommonsContribution, ModeratedContribution, ReviewCommand, SubmitContributionCommandV2 } from '../contracts'
import type { ContextPacket, PreparedContribution, ProblemView, SearchResponse, ThreadView } from '../../../server/commons/queries'
import type { CommonsService } from '../../../server/commons/service'
import type { PreparePublicationResult } from '../../../server/commons/publication'

export type { ContextPacket, PreparedContribution, ProblemView, SearchResponse, ThreadView, PreparePublicationResult }
export type RepoView = Awaited<ReturnType<CommonsService['browseRepository']>>
export type CommonsStatus = Awaited<ReturnType<CommonsService['status']>>
export type PublicationView = Awaited<ReturnType<CommonsService['getPublication']>>
export type PublishResult = Awaited<ReturnType<CommonsService['publishContribution']>>
export type SubmitResult = Awaited<ReturnType<CommonsService['submitContribution']>>

const BASE = EDGE_MODE ? '' : import.meta.env.VITE_API_BASE ?? ''

async function request<T>(method: 'GET' | 'POST', path: string, token: string, body?: unknown): Promise<T> {
  let response: Response
  try {
    response = await fetch(`${BASE}${path}`, {
      method,
      headers: { ...(body === undefined ? {} : { 'content-type': 'application/json' }), authorization: `Bearer ${token}` },
      ...(body === undefined ? {} : { body: JSON.stringify(body) }),
    })
  } catch {
    throw new ApiError(0, 'network_error', `Could not reach ${EDGE_MODE ? 'the Commons service' : 'the local shared room'}. Your draft stays in this browser.`)
  }
  const text = await response.text()
  let payload: Record<string, unknown> = {}
  try {
    payload = text ? (JSON.parse(text) as Record<string, unknown>) : {}
  } catch {
    // Not our API's JSON: typically the dev proxy answering for a stopped backend.
  }
  if (!response.ok && response.status >= 500 && payload.error === undefined) {
    throw new ApiError(response.status, 'network_error', `The ${EDGE_MODE ? 'Commons service' : 'local shared room'} did not answer (HTTP ${response.status}). Your draft stays in this browser.`)
  }
  if (!response.ok) {
    throw new ApiError(response.status, String(payload.error ?? 'error'), String(payload.message ?? response.statusText), payload.detail)
  }
  return payload as T
}
const enc = encodeURIComponent

export const commonsApi = {
  submit: (token: string, command: SubmitContributionCommandV2) => request<SubmitResult>('POST', '/api/commons/contributions', token, command),
  prepare: (token: string, draft: Record<string, unknown>) => request<PreparedContribution>('POST', '/api/commons/contributions/prepare', token, draft),
  review: (token: string, command: ReviewCommand) => request<Record<string, unknown>>('POST', '/api/commons/reviews', token, command),
  search: (token: string, query: string, limit = 10) => request<SearchResponse>('GET', `/api/commons/search?q=${enc(query)}&limit=${limit}`, token),
  repository: (token: string, options: { path?: string; object?: string; type?: string; cursor?: string; linked?: boolean } = {}) => {
    const q = new URLSearchParams()
    if (options.path) q.set('path', options.path)
    if (options.object) q.set('object', options.object)
    if (options.type) q.set('type', options.type)
    if (options.cursor) q.set('cursor', options.cursor)
    if (options.linked) q.set('linked', '1')
    const s = q.toString()
    return request<RepoView>('GET', `/api/commons/repository${s ? `?${s}` : ''}`, token)
  },
  problem: (token: string, problemId: string) => request<ProblemView>('GET', `/api/commons/problems/${enc(problemId)}`, token),
  contribution: (token: string, id: string) => request<(CommonsContribution | ModeratedContribution) & { problemTitle?: string }>('GET', `/api/commons/contributions/${enc(id)}`, token),
  thread: (token: string, id: string) => request<ThreadView>('GET', `/api/commons/contributions/${enc(id)}/thread`, token),
  context: (token: string, target: { problemId?: string; contributionId?: string }, budget?: number) => {
    const q = new URLSearchParams()
    if (target.problemId) q.set('problemId', target.problemId)
    if (target.contributionId) q.set('contributionId', target.contributionId)
    if (budget) q.set('budget', String(budget))
    return request<ContextPacket>('GET', `/api/commons/context?${q.toString()}`, token)
  },
  status: (token: string) => request<CommonsStatus>('GET', '/api/commons/status', token),
  publication: (token: string, id: string) => request<PublicationView>('GET', `/api/commons/contributions/${enc(id)}/publication`, token),
  preparePublication: (token: string, contributionId: string) => request<PreparePublicationResult>('POST', '/api/commons/publications/prepare', token, { contributionId }),
  publish: (token: string, intentId: string) => request<PublishResult>('POST', '/api/commons/publications', token, { intentId }),
  retryPublications: (token: string) => request<{ attempted: number }>('POST', '/api/commons/publications/retry', token, {}),
  moderate: (token: string, body: { commandId: string; action: 'hide' | 'unhide' | 'block' | 'unblock'; contributionId?: string; authorId?: string; reason?: string }) => request<Record<string, unknown>>('POST', '/api/commons/moderation', token, body),
  sync: (token: string, did: string) => request<Record<string, unknown>>('POST', '/api/commons/sync', token, { did }),
  resolve: (token: string, uri: string) => request<Record<string, unknown>>('POST', '/api/commons/resolve', token, { uri }),
}
