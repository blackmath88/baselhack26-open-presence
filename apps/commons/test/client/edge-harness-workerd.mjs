/** Browser harness over the real Worker bundle in workerd with persisted D1 (same IPC protocol as edge-harness.ts).
 * Run by edge-ux.mjs with EDGE_HARNESS=workerd; no credential is written to disk, argv, URLs or stdout.
 * Toggling writes and `restart` dispose the runtime and start a new one on the same D1 directory. */
import { mkdtemp, readFile, rm } from 'node:fs/promises'
import { tmpdir } from 'node:os'
import { extname, join, resolve } from 'node:path'
import { spawnSync } from 'node:child_process'
import { createHash } from 'node:crypto'
import { Miniflare, Log, LogLevel } from 'miniflare'

const root = resolve(import.meta.dirname, '../..')
const dist = join(root, 'dist')
const temporary = await mkdtemp(join(tmpdir(), 'commons-edge-ux-'))
const bundle = join(temporary, 'bundle')
const built = spawnSync(process.execPath, [join(root, 'node_modules/wrangler/bin/wrangler.js'), 'deploy', '--dry-run', '--config', 'wrangler.edge.jsonc', '--outdir', bundle],
  { cwd: root, stdio: 'ignore', env: { ...process.env, CI: 'true', WRANGLER_SEND_METRICS: 'false' } })
if (built.status !== 0) throw new Error('Worker bundle failed')

const types = { '.html': 'text/html', '.js': 'text/javascript', '.css': 'text/css', '.svg': 'image/svg+xml' }
async function asset(request) {
  const path = decodeURIComponent(new URL(request.url).pathname)
  const file = resolve(dist, `.${path === '/' ? '/index.html' : path}`)
  if (!file.startsWith(dist + '/')) return new Response('', { status: 404 })
  try { return new Response(await readFile(file), { headers: { 'content-type': types[extname(file)] ?? 'application/octet-stream' } }) }
  catch { return new Response('', { status: 404 }) }
}
let mf, db, port = 0, writes = 'true'
async function start() {
  mf = new Miniflare({
    host: '127.0.0.1', port, cf: false,
    modules: true, modulesRoot: bundle, scriptPath: join(bundle, 'index.js'),
    compatibilityDate: '2025-10-11', compatibilityFlags: ['nodejs_compat'],
    d1Databases: { DB: 'commons-edge-ux' }, d1Persist: join(temporary, 'd1'),
    bindings: { WRITES_ENABLED: writes }, serviceBindings: { ASSETS: asset },
    outboundService: () => { throw new Error('Harness forbids outbound network access') },
    log: new Log(LogLevel.NONE),
  })
  port = Number(new URL((await mf.ready).origin).port)
  db = await mf.getD1Database('DB')
}
async function restart() { await mf.dispose(); await start() }
const actor = name => `person:${name.toLowerCase()}`

process.on('message', async message => {
  try {
    if (message.action === 'start') {
      await start()
      await db.exec((await readFile(join(root, 'worker/edge/migrations/0001_commons.sql'), 'utf8')).replace(/\n(?!CREATE|INSERT)/g, ' '))
      for (const identity of message.identities ?? []) {
        await db.prepare('INSERT INTO contributor_tokens (token_hash, actor_id, display_name, expires_at) VALUES (?, ?, ?, ?)')
          .bind(createHash('sha256').update(identity.code).digest('hex'), actor(identity.name), identity.name, '2099-01-01T00:00:00.000Z').run()
      }
      return process.send?.({ id: message.id, port })
    }
    if (message.action === 'revoke') await db.prepare('UPDATE contributor_tokens SET revoked = 1 WHERE actor_id = ?').bind(actor(message.name)).run()
    if (message.action === 'expire') await db.prepare("UPDATE contributor_tokens SET expires_at = '2000-01-01T00:00:00.000Z' WHERE actor_id = ?").bind(actor(message.name)).run()
    if (message.action === 'writes') { writes = message.enabled ? 'true' : 'false'; await restart() }
    if (message.action === 'restart') await restart()
    process.send?.({ id: message.id, ok: true })
  } catch { process.send?.({ id: message.id, error: 'Harness control failed' }) }
})
process.on('disconnect', async () => { try { await mf?.dispose() } finally { await rm(temporary, { recursive: true, force: true }); process.exit(0) } })
