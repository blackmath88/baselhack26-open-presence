/** Browser-only harness: real edge HTTP adapter + SQL, production frontend, ephemeral identities.
 * Run by edge-ux.mjs over IPC; no credential is written to disk, argv, URLs or stdout. */
import { DatabaseSync } from 'node:sqlite'
import { createServer } from 'node:http'
import { readFileSync } from 'node:fs'
import { resolve, extname } from 'node:path'
import edge from '../../worker/edge/index.js'
import { tokenHash } from '../../worker/edge/auth.js'
import type { Database, Statement } from '../../worker/edge/d1-repository.js'

const sqlite = new DatabaseSync(':memory:')
sqlite.exec(readFileSync(new URL('../../worker/edge/migrations/0001_commons.sql', import.meta.url), 'utf8'))
const statement = (sql: string, values: unknown[] = []): Statement & { execute(): unknown } => ({
  bind: (...next) => statement(sql, next),
  async first<T>() { return (sqlite.prepare(sql).get(...values as never[]) ?? null) as T | null },
  async run() { return sqlite.prepare(sql).run(...values as never[]) },
  execute() { return sqlite.prepare(sql).run(...values as never[]) },
})
const db: Database = { prepare: statement, async batch(statements) {
  sqlite.exec('BEGIN')
  try { for (const s of statements) (s as ReturnType<typeof statement>).execute(); sqlite.exec('COMMIT') }
  catch (error) { sqlite.exec('ROLLBACK'); throw error }
} }
const root = resolve('dist')
const env = { DB: db, WRITES_ENABLED: 'true', ASSETS: { async fetch(request: Request) {
  const path = decodeURIComponent(new URL(request.url).pathname)
  const file = resolve(root, `.${path === '/' ? '/index.html' : path}`)
  if (!file.startsWith(root + '/')) return new Response('', { status: 404 })
  try {
    const type = { '.html': 'text/html', '.js': 'text/javascript', '.css': 'text/css', '.svg': 'image/svg+xml' }[extname(file)] ?? 'application/octet-stream'
    return new Response(readFileSync(file), { headers: { 'content-type': type } })
  } catch { return new Response('', { status: 404 }) }
} } }
const server = createServer(async (req, res) => {
  try {
    const parts: Buffer[] = []
    for await (const part of req) parts.push(Buffer.from(part))
    const body = Buffer.concat(parts)
    const headers = new Headers()
    for (const [name, value] of Object.entries(req.headers)) if (value) headers.set(name, Array.isArray(value) ? value.join(', ') : value)
    const response = await edge.fetch(new Request(`http://${req.headers.host}${req.url}`, {
      method: req.method, headers, ...(body.length ? { body } : {}),
    }), env)
    res.writeHead(response.status, Object.fromEntries(response.headers))
    res.end(Buffer.from(await response.arrayBuffer()))
  } catch { res.writeHead(500); res.end('Harness error') }
})
process.on('message', async (message: { id: number; action: string; identities?: { name: string; code: string }[]; name?: string; enabled?: boolean }) => {
  try {
    if (message.action === 'start') {
      for (const identity of message.identities ?? []) sqlite.prepare('INSERT INTO contributor_tokens (token_hash, actor_id, display_name, expires_at) VALUES (?, ?, ?, ?)').run(await tokenHash(identity.code), `person:${identity.name.toLowerCase()}`, identity.name, '2099-01-01T00:00:00.000Z')
      server.listen(0, '127.0.0.1', () => {
        const address = server.address()
        process.send?.({ id: message.id, port: typeof address === 'object' && address ? address.port : null })
      })
      return
    }
    if (message.action === 'revoke') sqlite.prepare('UPDATE contributor_tokens SET revoked = 1 WHERE actor_id = ?').run(`person:${message.name?.toLowerCase()}`)
    if (message.action === 'expire') sqlite.prepare("UPDATE contributor_tokens SET expires_at = '2000-01-01T00:00:00.000Z' WHERE actor_id = ?").run(`person:${message.name?.toLowerCase()}`)
    if (message.action === 'writes') env.WRITES_ENABLED = message.enabled ? 'true' : 'false'
    process.send?.({ id: message.id, ok: true })
  } catch { process.send?.({ id: message.id, error: 'Harness control failed' }) }
})
process.on('disconnect', () => { server.close(); sqlite.close() })
