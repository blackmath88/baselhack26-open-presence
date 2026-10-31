/**
 * Node HTTP subrouter. Returns true when handled; coordinator calls before its 404.
 * There is deliberately no import endpoint: the pinned corpus is imported only by trusted
 * startup code, so a participant cannot introduce records under Postack source provenance.
 */
import type { IncomingMessage, ServerResponse } from 'node:http'
import type { ReviewCommand, SubmitContributionCommand } from '../../src/commons/contracts.js'
import { resolveActor, type TokenVerifier } from '../auth/actor-context.js'
import { invalid, isDomainError } from '../domain/errors.js'
import type { CommonsService } from './service.js'

export interface CommonsRouteDeps { commons: CommonsService; auth: TokenVerifier }
const CORS = {
  'access-control-allow-origin': '*',
  'access-control-allow-methods': 'GET,POST,OPTIONS',
  'access-control-allow-headers': 'content-type,authorization',
}
async function readJson(req: IncomingMessage): Promise<Record<string, unknown>> {
  const chunks: Buffer[] = []
  let bytes = 0
  for await (const chunk of req) {
    const buffer = Buffer.from(chunk)
    bytes += buffer.length
    if (bytes > 16 * 1024 * 1024) throw invalid('Request body is too large.')
    chunks.push(buffer)
  }
  let value: unknown
  try { value = JSON.parse(Buffer.concat(chunks).toString('utf8')) } catch { throw invalid('Request body is not valid JSON.') }
  if (!value || typeof value !== 'object' || Array.isArray(value)) throw invalid('Request body must be an object.')
  return value as Record<string, unknown>
}
function send(res: ServerResponse, status: number, body: unknown) {
  res.writeHead(status, { 'content-type': 'application/json; charset=utf-8', ...CORS })
  res.end(JSON.stringify(body))
}
export function commonsRoutes(deps: CommonsRouteDeps): (req: IncomingMessage, res: ServerResponse) => Promise<boolean> {
  return async (req, res) => {
    const path = new URL(req.url ?? '/', 'http://localhost').pathname
    if (!path.startsWith('/api/commons/')) return false
    try {
      if (req.method === 'OPTIONS') { res.writeHead(204, CORS); res.end(); return true }
      const actor = await resolveActor(deps.auth, req.headers.authorization)
      const room = /^\/api\/commons\/rooms\/([^/]+)$/.exec(path)
      if (req.method === 'GET' && room) send(res, 200, await deps.commons.getRoom(actor, decodeURIComponent(room[1])))
      else if (req.method === 'POST' && path === '/api/commons/contributions') {
        const body = await readJson(req)
        send(res, 201, await deps.commons.submitContribution(actor, body as unknown as SubmitContributionCommand))
      } else if (req.method === 'POST' && path === '/api/commons/reviews') {
        const body = await readJson(req)
        send(res, 200, await deps.commons.review(actor, body as unknown as ReviewCommand))
      } else send(res, 404, { error: 'not_found', message: 'Unknown Commons route.' })
    } catch (error) {
      if (isDomainError(error)) {
        const statuses = { invalid: 422, conflict: 409, forbidden: 403, not_found: 404, unauthorized: 401 }
        send(res, statuses[error.code], { error: error.code, message: error.message, detail: error.detail })
      } else send(res, 500, { error: 'internal_error', message: 'Unexpected server error.' })
    }
    return true
  }
}
