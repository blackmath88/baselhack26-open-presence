// Local-only hosted-mode preview: the built frontend and the edge Worker in real workerd with persisted D1.
// Use where `wrangler dev` cannot start (e.g. uv_interface_addresses failures). Never exposes credentials.
// From apps/commons, after `npm run build:edge`:
//   node scripts/edge/serve-local.mjs [port=8798]
// Contributor codes come from `node scripts/edge/issue-contributor.mjs <slug> <name>`; their .sql files in
// ignored .edge-credentials/ are applied on start. D1 state persists in ignored .edge-local/ across restarts.
import { mkdtemp, readFile, readdir } from 'node:fs/promises'
import { tmpdir } from 'node:os'
import { extname, join, normalize, resolve } from 'node:path'
import { spawnSync } from 'node:child_process'
import { Miniflare, Log, LogLevel } from 'miniflare'

const root = resolve(import.meta.dirname, '../..')
const port = Number(process.argv[2] ?? 8798)
const dist = join(root, 'dist')
const bundle = await mkdtemp(join(tmpdir(), 'commons-edge-serve-'))
const built = spawnSync(process.execPath, [join(root, 'node_modules/wrangler/bin/wrangler.js'), 'deploy', '--dry-run', '--config', 'wrangler.edge.jsonc', '--outdir', bundle],
  { cwd: root, stdio: 'inherit', env: { ...process.env, CI: 'true', WRANGLER_SEND_METRICS: 'false' } })
if (built.status !== 0) process.exit(built.status ?? 1)

const types = { '.html': 'text/html; charset=utf-8', '.js': 'text/javascript', '.css': 'text/css', '.svg': 'image/svg+xml', '.json': 'application/json', '.png': 'image/png', '.woff2': 'font/woff2' }
async function asset(request) {
  const path = normalize(decodeURIComponent(new URL(request.url).pathname)).replace(/^(\.\.[/\\])+/, '')
  for (const candidate of [join(dist, path), join(dist, 'index.html')]) {
    try { return new Response(await readFile(candidate), { headers: { 'content-type': types[extname(candidate)] ?? 'application/octet-stream' } }) }
    catch { /* single-page-application fallback */ }
  }
  return new Response('Not found', { status: 404 })
}

const mf = new Miniflare({
  host: '127.0.0.1', port, cf: false,
  modules: true, modulesRoot: bundle, scriptPath: join(bundle, 'index.js'),
  compatibilityDate: '2025-10-11', compatibilityFlags: ['nodejs_compat'],
  d1Databases: { DB: 'phf-commons' }, d1Persist: join(root, '.edge-local/d1'),
  bindings: { WRITES_ENABLED: 'true' }, serviceBindings: { ASSETS: asset },
  log: new Log(LogLevel.WARN),
})
const db = await mf.getD1Database('DB')
if (!(await db.prepare("SELECT name FROM sqlite_master WHERE name = 'commons_state'").first())) {
  await db.exec((await readFile(join(root, 'worker/edge/migrations/0001_commons.sql'), 'utf8')).replace(/\n(?!CREATE|INSERT)/g, ' '))
}
let applied = 0
for (const file of (await readdir(join(root, '.edge-credentials')).catch(() => [])).filter(name => name.endsWith('.sql'))) {
  const sql = (await readFile(join(root, '.edge-credentials', file), 'utf8')).replace(/^INSERT INTO/, 'INSERT OR IGNORE INTO')
  await db.exec(sql.trim()); applied++
}
console.log(`Commons edge preview: ${(await mf.ready).origin} (writes enabled, ${applied} credential file(s) applied, D1 in .edge-local/)`)
for (const signal of ['SIGINT', 'SIGTERM']) process.once(signal, () => mf.dispose().then(() => process.exit(0)))
