/**
 * Node HTTP subrouter for the Commons. Returns true when handled; the main API
 * calls it before its own 404. Every route resolves the actor from the bearer
 * token and calls exactly one service operation; the same operations serve the
 * CLI and MCP. There is deliberately no import endpoint: the pinned corpus is
 * imported only by trusted startup code.
 */
import { parseOperation } from './operation-schemas.js'
import type { IncomingMessage, ServerResponse } from 'node:http'
import type { ReviewCommand } from '../../src/commons/contracts.js'
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
    if (bytes > 1024 * 1024) throw invalid('Request body is too large.')
    chunks.push(buffer)
  }
  if (bytes === 0) return {}
  let value: unknown
  try { value = JSON.parse(Buffer.concat(chunks).toString('utf8')) } catch { throw invalid('Request body is not valid JSON.') }
  if (!value || typeof value !== 'object' || Array.isArray(value)) throw invalid('Request body must be an object.')
  return value as Record<string, unknown>
}
function send(res: ServerResponse, status: number, body: unknown) {
  res.writeHead(status, { 'content-type': 'application/json; charset=utf-8', ...CORS })
  res.end(JSON.stringify(body))
}
const num = (value: string | null): number | undefined => (value === null ? undefined : Number(value))

export function commonsRoutes(deps: CommonsRouteDeps): (req: IncomingMessage, res: ServerResponse) => Promise<boolean> {
  return async (req, res) => {
    const url = new URL(req.url ?? '/', 'http://localhost')
    const path = url.pathname
    if (!path.startsWith('/api/commons/')) return false
    const q = url.searchParams
    try {
      if (req.method === 'OPTIONS') { res.writeHead(204, CORS); res.end(); return true }
      const actor = await resolveActor(deps.auth, req.headers.authorization)
      const get = req.method === 'GET'
      const post = req.method === 'POST'
      const seg = path.slice('/api/commons/'.length).split('/').map(decodeURIComponent)
      const [head, id, tail] = seg
      if (get && head === 'status' && !id) send(res, 200, await deps.commons.status(actor))
      else if (get && head === 'search' && !id) send(res, 200, await deps.commons.search(actor, {
        query: q.get('q') ?? '', ...(num(q.get('limit')) !== undefined ? { limit: num(q.get('limit'))! } : {}),
        ...(q.get('include') ? { include: q.get('include')!.split(',') as Array<'problems' | 'contributions'> } : {}),
      }))
      else if (get && head === 'repository') send(res, 200, await deps.commons.browseRepository(actor, {
        ...(seg.length > 1 ? { path: seg.slice(1).join('/') } : q.get('path') ? { path: q.get('path')! } : {}),
        ...(q.get('object') ? { object: q.get('object')! } : {}),
        ...(q.get('type') ? { type: q.get('type') as 'issue' | 'pull' | 'discussion' } : {}),
        ...(q.get('cursor') ? { cursor: q.get('cursor')! } : {}),
        ...(num(q.get('limit')) !== undefined ? { limit: num(q.get('limit'))! } : {}),
        ...(q.has('linked') ? { linkedOnly: q.get('linked') === 'true' ? true : q.get('linked') === 'false' ? false : q.get('linked') as unknown as boolean } : {}),
      }))
      else if (get && head === 'problems' && !id) send(res, 200, { problems: await deps.commons.listProblems(actor) })
      else if (get && head === 'problems' && id && !tail) send(res, 200, await deps.commons.getProblem(actor, id))
      else if (get && head === 'contributions' && id && !tail) send(res, 200, await deps.commons.getContribution(actor, id))
      else if (get && head === 'contributions' && id && tail === 'thread') send(res, 200, await deps.commons.getThread(actor, id))
      else if (get && head === 'contributions' && id && tail === 'publication') send(res, 200, await deps.commons.getPublication(actor, id))
      else if (get && head === 'context' && !id) send(res, 200, await deps.commons.getContext(actor, {
        ...(q.get('problemId') ? { problemId: q.get('problemId')! } : {}),
        ...(q.get('contributionId') ? { contributionId: q.get('contributionId')! } : {}),
        ...(num(q.get('budget')) !== undefined ? { budget: num(q.get('budget'))! } : {}),
      }))
      else if (get && head === 'rooms' && id && !tail) send(res, 200, await deps.commons.getRoom(actor, id))
      else if (post && head === 'contributions' && id === 'prepare') send(res, 200, await deps.commons.prepareContribution(actor, await readJson(req)))
      else if (post && head === 'contributions' && !id) {
        const result = await deps.commons.submitContribution(actor, await readJson(req))
        send(res, result.replayed ? 200 : 201, result)
      } else if (post && head === 'reviews' && !id) send(res, 200, await deps.commons.review(actor, (await readJson(req)) as unknown as ReviewCommand))
      else if (post && head === 'moderation' && !id) send(res, 200, await deps.commons.moderate(actor, parseOperation('moderate', await readJson(req)) as never))
      else if (post && head === 'publications' && id === 'prepare') send(res, 200, await deps.commons.preparePublication(actor, parseOperation('prepare_publication', await readJson(req)) as never))
      else if (post && head === 'publications' && id === 'retry') send(res, 200, await deps.commons.retryPublications(actor))
      else if (post && head === 'publications' && !id) {
        const result = await deps.commons.publishContribution(actor, parseOperation('publish_contribution', await readJson(req)) as never)
        send(res, result.receipt.status === 'published' ? 200 : 202, result)
      } else if (post && head === 'sync' && !id) send(res, 200, await deps.commons.syncAuthor(actor, parseOperation('sync_author', await readJson(req)) as never))
      else if (post && head === 'resolve' && !id) send(res, 200, await deps.commons.resolveExternal(actor, parseOperation('resolve_external', await readJson(req)) as never))
      else send(res, 404, { error: 'not_found', message: 'Unknown Commons route.' })
    } catch (error) {
      if (isDomainError(error)) {
        const statuses = { invalid: 422, conflict: 409, forbidden: 403, not_found: 404, unauthorized: 401 }
        send(res, statuses[error.code], { error: error.code, message: error.message, detail: error.detail })
      } else {
        console.error('[commons] unhandled route error:', error)
        send(res, 500, { error: 'internal_error', message: 'Unexpected server error.' })
      }
    }
    return true
  }
}
