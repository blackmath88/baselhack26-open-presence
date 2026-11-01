import type { IncomingMessage, ServerResponse } from 'node:http'
import { createApi } from '../../server/http/api.js'
import { isDomainError } from '../../server/domain/errors.js'
import { buildEdgeServices } from './services.js'
import type { Database } from './d1-repository.js'
import { createEdgeAuth } from './auth.js'
export interface EdgeEnv { DB: Database; ASSETS: { fetch(req: Request): Promise<Response> }; WRITES_ENABLED?: string }
const json = (status: number, body: unknown) => new Response(JSON.stringify(body), { status, headers: { 'content-type': 'application/json', 'cache-control': 'no-store' } })
async function bodyBytes(request: Request) {
  const reader = request.body?.getReader()
  const parts: Uint8Array[] = []; let length = 0
  if (reader) while (true) {
    const { value, done } = await reader.read(); if (done) break
    length += value.length
    if (length > 32768) { await reader.cancel(); throw new Error('body_limit') }
    parts.push(value)
  }
  return Buffer.concat(parts)
}
const runtimes = new WeakMap<Database, ReturnType<typeof buildEdgeServices>>()
export default { async fetch(request: Request, env: EdgeEnv): Promise<Response> {
  const url = new URL(request.url); const path = url.pathname
  if (!path.startsWith('/api/') && path !== '/health' && !path.startsWith('/mcp')) return env.ASSETS.fetch(request)
  try {
    if (path.startsWith('/mcp')) return json(501, { error: 'not_available', message: 'Use the Commons HTTP API; remote MCP is not enabled in this release.' })
    if (!['GET', 'POST'].includes(request.method)) return json(405, { error: 'method_not_allowed' })
    const auth = createEdgeAuth(env.DB)
    const bytes = request.method === 'POST' ? await bodyBytes(request) : Buffer.alloc(0)
    if (request.method === 'POST' && request.headers.get('origin') && request.headers.get('origin') !== url.origin) return json(403, { error: 'origin_rejected' })
    if (path === '/api/participants') return json(200, { participants: [], mode: 'edge' })
    if (path === '/api/auth/session' && request.method === 'POST') {
      const body = JSON.parse(bytes.toString()) as { accessCode?: unknown }
      if (typeof body.accessCode !== 'string') return json(401, { error: 'unauthorized', message: 'Enter your issued contributor access code.' })
      const actor = await auth.verify(body.accessCode)
      return json(200, { token: body.accessCode, actor })
    }
    const authorization = request.headers.get('authorization') ?? (request.method === 'GET' ? 'Bearer public' : '')
    if (request.method === 'POST') {
      if (env.WRITES_ENABLED !== 'true') return json(503, { error: 'writes_disabled', message: 'Sharing is temporarily disabled. Keep your draft.' })
      // No inherited mutation route can bypass the current Commons service.
      if (!['/api/commons/contributions', '/api/commons/contributions/prepare', '/api/commons/reviews', '/api/commons/moderation'].includes(path)) return json(404, { error: 'not_found' })
      const actor = await auth.verify(authorization.replace(/^Bearer /i, ''))
      if (!actor.scopes.includes('memory:contribute')) return json(403, { error: 'forbidden', message: 'A contributor access code is required to share.' })
      // Durable limits; failed commands also consume budget. Limits bound abuse, not billing.
      const day = new Date().toISOString().slice(0, 10)
      for (const [bucket, limit] of [[`global:${day}`, 1000], [`${actor.actorId}:${day}`, 100]] as const) {
        const row = await env.DB.prepare('INSERT INTO write_budgets (bucket, used) VALUES (?, 1) ON CONFLICT(bucket) DO UPDATE SET used = used + 1 WHERE used < ? RETURNING used').bind(bucket, limit).first<{ used: number }>()
        if (!row) return json(429, { error: 'write_budget', message: 'Daily sharing limit reached. Keep your draft.' })
      }
    }
    let runtime = runtimes.get(env.DB)
    if (!runtime) { runtime = buildEdgeServices(env.DB, url.origin); runtimes.set(env.DB, runtime); void runtime.catch(() => runtimes.delete(env.DB)) }
    const services = await runtime
    // Thin streaming-compatible bridge reuses the existing validated HTTP routes.
    const req = { url: url.pathname + url.search, method: request.method, headers: { authorization, host: url.host }, async *[Symbol.asyncIterator]() { if (bytes.length) yield bytes } } as IncomingMessage
    let status = 200; let payload = ''; const headers: Record<string, string> = { 'cache-control': 'no-store' }
    const res = { writeHead(code: number, values: Record<string, string>) { status = code; for (const [key, value] of Object.entries(values)) if (!key.startsWith('access-control-')) headers[key] = value }, end(value?: string) { payload = value ?? '' } } as unknown as ServerResponse
    await createApi(services, { enablePrototypeAuth: false })(req, res)
    if (path === '/api/commons/contributions/prepare' && status === 200) {
      const preview = JSON.parse(payload)
      if (preview.destination) preview.destination.visibility = 'public on this Commons website; not posted to GitHub or ATProto'
      payload = JSON.stringify(preview)
    }
    return new Response(payload, { status, headers })
  } catch (error) {
    if (isDomainError(error)) return json(error.code === 'unauthorized' ? 401 : 403, { error: error.code, message: error.message })
    if (error instanceof SyntaxError) return json(400, { error: 'invalid_json' })
    if (String(error).includes('body_limit')) return json(413, { error: 'body_too_large' })
    return json(503, { error: 'service_unavailable', message: 'The shared service is unavailable. Keep your draft and retry.' })
  }
} }
