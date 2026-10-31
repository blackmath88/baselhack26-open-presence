/**
 * Commons backend client: submit a selected draft to the local shared room and
 * review a proposed connection. The participant is resolved by the server from
 * the bearer token; the body never names who is submitting.
 */
import { ApiError } from '../../lib/api'
import type { ReviewCommand, SubmitContributionCommand } from '../contracts'

const BASE = import.meta.env.VITE_API_BASE ?? ''

async function post<T>(path: string, token: string, body: unknown): Promise<T> {
  let response: Response
  try {
    response = await fetch(`${BASE}${path}`, {
      method: 'POST',
      headers: { 'content-type': 'application/json', authorization: `Bearer ${token}` },
      body: JSON.stringify(body),
    })
  } catch {
    throw new ApiError(0, 'network_error', 'Could not reach the local shared room. Your draft is still saved in this browser.')
  }
  const text = await response.text()
  let payload: Record<string, unknown> = {}
  try {
    payload = text ? (JSON.parse(text) as Record<string, unknown>) : {}
  } catch {
    // Not our API's JSON: typically the dev proxy answering for a stopped backend.
  }
  if (!response.ok && response.status >= 500 && payload.error === undefined) {
    throw new ApiError(response.status, 'network_error', `The local shared room did not answer (HTTP ${response.status}). Your draft is still saved in this browser.`)
  }
  if (!response.ok) {
    throw new ApiError(response.status, String(payload.error ?? 'error'), String(payload.message ?? response.statusText), payload.detail)
  }
  return payload as T
}

export const commonsApi = {
  submit: (token: string, command: SubmitContributionCommand) =>
    post<{ problemId: string; contributionId: string; replayed?: boolean }>('/api/commons/contributions', token, command),
  review: (token: string, command: ReviewCommand) => post<Record<string, unknown>>('/api/commons/reviews', token, command),
}
