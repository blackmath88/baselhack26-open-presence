// Local-only acceptance test against the pinned Wrangler bundle and real workerd/D1.
// From the repository root: node apps/commons/scripts/edge/runtime-smoke.mjs
import assert from 'node:assert/strict'
import { randomBytes, createHash } from 'node:crypto'
import { mkdtemp, readFile, readdir, rm } from 'node:fs/promises'
import { tmpdir } from 'node:os'
import { dirname, join, resolve } from 'node:path'
import { fileURLToPath } from 'node:url'
import { spawn } from 'node:child_process'
import { Miniflare, Log, LogLevel } from 'miniflare'
import { compatibilityDate as supportedCompatibilityDate } from 'workerd'

const root = resolve(dirname(fileURLToPath(import.meta.url)), '../..')
const temporary = await mkdtemp(join(tmpdir(), 'commons-edge-smoke-'))
const bundle = join(temporary, 'bundle')
const persistence = join(temporary, 'd1')
// Pinned workerd 1.20251011.0 accepts dates through 2025-10-11.
const compatibilityDate = '2025-10-11'
const timings = []
let mf, db, origin, runtimePid
const run = (command, args) => new Promise((resolveRun, reject) => {
  const child = spawn(command, args, { cwd: root, stdio: 'inherit', env: {
    ...process.env, CI: 'true', WRANGLER_SEND_METRICS: 'false', npm_config_registry: 'http://127.0.0.1:9',
  } })
  child.once('error', reject)
  child.once('exit', code => code === 0 ? resolveRun() : reject(new Error(`${command} exited ${code}`)))
})

// Per-process CPU fallback: sum scheduled CPU nanoseconds across workerd threads.
// This includes D1 and runtime overhead, not Cloudflare isolate CPU/billing time.
// Linux schedstat has finer resolution than /proc stat's clock ticks.
async function cpuNs() {
  if (!runtimePid) return null
  const tasks = await readdir(`/proc/${runtimePid}/task`)
  const values = await Promise.all(tasks.map(async tid => {
    try { return BigInt((await readFile(`/proc/${runtimePid}/task/${tid}/schedstat`, 'utf8')).split(' ')[0]) }
    catch (error) { if (error.code === 'ENOENT') return 0n; throw error }
  }))
  return values.reduce((a, b) => a + b, 0n)
}
async function rssKiB() {
  if (!runtimePid) return null
  const status = await readFile(`/proc/${runtimePid}/status`, 'utf8')
  return Number(/^VmRSS:\s+(\d+)/m.exec(status)[1])
}
async function start() {
  mf = new Miniflare({
    host: '127.0.0.1', port: 0, cf: false,
    modules: true, modulesRoot: bundle, scriptPath: join(bundle, 'index.js'),
    compatibilityDate, compatibilityFlags: ['nodejs_compat'],
    d1Databases: { DB: 'commons-smoke' }, d1Persist: persistence,
    bindings: { WRITES_ENABLED: 'true' },
    serviceBindings: { ASSETS: () => new Response('smoke asset') },
    outboundService: () => { throw new Error('Smoke forbids outbound network access') },
    log: new Log(LogLevel.WARN),
  })
  origin = (await mf.ready).origin
  db = await mf.getD1Database('DB')
  runtimePid = undefined
  if (process.platform === 'linux') {
    const children = (await readFile(`/proc/${process.pid}/task/${process.pid}/children`, 'utf8')).trim().split(/\s+/).filter(Boolean)
    for (const pid of children) {
      if ((await readFile(`/proc/${pid}/comm`, 'utf8')).trim() === 'workerd') runtimePid = pid
    }
    assert.ok(runtimePid, 'must measure the actual workerd child process')
  }
}
async function call(path, { code, body, status = 200, label } = {}) {
  const before = label ? await cpuNs() : null
  const start = performance.now()
  const response = await fetch(`${origin}${path}`, {
    method: body === undefined ? 'GET' : 'POST',
    headers: { ...(code ? { authorization: `Bearer ${code}` } : {}), ...(body === undefined ? {} : { 'content-type': 'application/json' }) },
    ...(body === undefined ? {} : { body: JSON.stringify(body) }), signal: AbortSignal.timeout(30_000),
  })
  const text = await response.text()
  const wallMs = performance.now() - start
  const after = label ? await cpuNs() : null
  if (label) timings.push({ label, status: response.status, wallMs: +wallMs.toFixed(3), workerdProcessCpuMs: before === null ? null : +(Number(after - before) / 1e6).toFixed(3) })
  // Never include request headers or credential-bearing session response in failures.
  assert.ok((Array.isArray(status) ? status : [status]).includes(response.status), `${path}: expected ${status}, received ${response.status}`)
  return JSON.parse(text)
}
const state = () => db.prepare('SELECT revision, document, length(CAST(document AS BLOB)) AS bytes FROM commons_state WHERE id = 1').first()
const hash = code => createHash('sha256').update(code).digest('hex')
const alice = randomBytes(32).toString('base64url'), bob = randomBytes(32).toString('base64url')
async function issue(slug, code) {
  // Same random 32-byte bearer/SHA-256 storage scheme as issue-contributor.mjs.
  await db.prepare('INSERT INTO contributor_tokens (token_hash,actor_id,display_name,expires_at) VALUES (?,?,?,?)')
    .bind(hash(code), `person:${slug}`, slug === 'alice' ? 'Alice' : 'Bob', new Date(Date.now() + 86400000).toISOString()).run()
}
const submitPath = '/api/commons/contributions'
try {
  assert.equal(supportedCompatibilityDate, compatibilityDate, 'update the smoke deliberately when upgrading workerd')
  await run('npm', ['run', 'build:edge'])
  await run(process.execPath, [join(root, 'node_modules/wrangler/bin/wrangler.js'), 'deploy', '--dry-run', '--config', 'wrangler.edge.jsonc', '--outdir', bundle])
  await start()
  const migration = await readFile(join(root, 'worker/edge/migrations/0001_commons.sql'), 'utf8')
  // D1 exec accepts one SQL statement per line; use batch for multiline migration.
  await db.batch(migration.split(';').map(sql => sql.trim()).filter(Boolean).map(sql => db.prepare(sql)))
  await issue('alice', alice); await issue('bob', bob)
  // Concurrent first reads exercise source import across requests.
  const initial = await Promise.all(Array.from({ length: 4 }, () => call('/api/commons/problems')))
  assert.ok(initial[0].problems.length)
  const problemId = initial[0].problems[0].problemId
  const command = { commandId: 'alice-first', problemId, text: 'Runtime lighthouse Alice experience', assistance: 'none', circumstances: 'USB on macOS' }
  const baseline = await state()
  const baselineRssKiB = await rssKiB()
  await call('/api/commons/search?q=Mac', { label: 'baseline search' })
  assert.deepEqual(await state(), baseline, 'read-only search must not rewrite D1')
  const preview = await call(`${submitPath}/prepare`, { code: alice, body: command })
  assert.match(preview.destination.visibility, /public on this Commons website/)
  const a = await call(submitPath, { code: alice, body: command, status: 201, label: 'baseline contribute' })
  const replyCommand = { ...command, commandId: 'bob-reply', text: 'Runtime lighthouse Bob reply', parentId: a.contribution.id }
  const b = await call(submitPath, { code: bob, body: replyCommand, status: 201 })
  const verifyPublic = async () => {
    const results = await call('/api/commons/search?q=lighthouse')
    for (const [id, actorId, name] of [[a.contribution.id, 'person:alice', 'Alice'], [b.contribution.id, 'person:bob', 'Bob']]) {
      assert.ok(JSON.stringify(results).includes(id), 'anonymous search rediscovers contribution')
      const entry = await call(`${submitPath}/${encodeURIComponent(id)}`)
      assert.equal(entry.actor.id, actorId); assert.equal(entry.actor.displayName, name)
      assert.equal(entry.moderated, undefined); assert.equal(entry.origin.kind, 'local')
    }
    const thread = await call(`${submitPath}/${encodeURIComponent(a.contribution.id)}/thread`)
    assert.ok(JSON.stringify(thread).includes(b.contribution.id))
  }
  await verifyPublic()
  await call('/api/commons/reviews', { code: bob, body: { commandId: 'denied', proposalId: 'none', decision: 'accept' }, status: 403 })
  const beforeLegacy = await state()
  for (const path of ['/api/imports', '/api/imports/preview', '/api/problems', '/api/problems/x/contributions', '/api/problems/x/orchestration', '/api/curation/x/accept', '/api/commons/publications', '/api/commons/publications/prepare', '/api/commons/publications/retry', '/api/commons/sync', '/api/commons/resolve']) {
    await call(path, { code: alice, body: {}, status: 404 })
  }
  assert.deepEqual(await state(), beforeLegacy, 'blocked legacy routes do not write Commons state')
  await call(submitPath, { body: command, status: 401 })
  await call(submitPath, { code: 'public', body: command, status: 403 })
  await db.prepare('UPDATE contributor_tokens SET revoked = 1 WHERE token_hash = ?').bind(hash(bob)).run()
  await call('/api/auth/session', { body: { accessCode: bob }, status: 401 })
  await call(submitPath, { code: bob, body: replyCommand, status: 401 })
  await db.prepare("UPDATE contributor_tokens SET revoked = 0, expires_at = '2000-01-01T00:00:00.000Z' WHERE token_hash = ?").bind(hash(bob)).run()
  await call('/api/auth/session', { body: { accessCode: bob }, status: 401 })
  await call(submitPath, { code: bob, body: replyCommand, status: 401 })
  await db.prepare('UPDATE contributor_tokens SET expires_at = ? WHERE token_hash = ?').bind(new Date(Date.now() + 86400000).toISOString(), hash(bob)).run()

  const duplicate = { ...command, commandId: 'concurrent-identical', text: 'Concurrent identical experience' }
  const duplicateResponses = await Promise.all(Array.from({ length: 4 }, async () => {
    const response = await fetch(`${origin}${submitPath}`, { method: 'POST', headers: { authorization: `Bearer ${alice}`, 'content-type': 'application/json' }, body: JSON.stringify(duplicate), signal: AbortSignal.timeout(30_000) })
    assert.ok([200, 201].includes(response.status), `duplicate request: ${response.status}`)
    return response.json()
  }))
  assert.equal(duplicateResponses.filter(r => !r.replayed).length, 1)
  assert.equal(new Set(duplicateResponses.map(r => r.contribution.id)).size, 1)
  await call(submitPath, { code: alice, body: { ...duplicate, text: 'changed payload' }, status: 409 })
  const distinct = await Promise.all(Array.from({ length: 6 }, (_, n) => call(submitPath, { code: alice, body: { ...command, commandId: `parallel-${n}`, text: `Parallel unique experience ${n}` }, status: 201 })))
  assert.equal(new Set(distinct.map(r => r.contribution.id)).size, 6)
  let document = JSON.parse((await state()).document)
  for (const result of distinct) assert.equal(document.events.filter(e => e.eventType === 'ContributionAdded' && e.objectId === result.contribution.id).length, 1)

  // Failure AFTER the document update, at the final batch statement, must roll it all back.
  await db.prepare("CREATE TRIGGER smoke_commit_failure BEFORE DELETE ON commons_commit_guard BEGIN SELECT RAISE(ABORT, 'smoke_forced_commit_failure'); END").run()
  const beforeFailure = await state()
  const failedCommand = { ...command, commandId: 'forced-failure', text: 'Must not be committed' }
  await call(submitPath, { code: alice, body: failedCommand, status: 500 })
  assert.deepEqual(await state(), beforeFailure)
  assert.equal((await db.prepare('SELECT count(*) AS n FROM commons_commit_guard').first()).n, 0)
  await db.prepare('DROP TRIGGER smoke_commit_failure').run()
  await call(submitPath, { code: alice, body: failedCommand, status: 201 })

  // An exhausted contributor is refused before the global bucket is charged, so others keep sharing.
  {
    const day = new Date().toISOString().slice(0, 10)
    await db.prepare('DELETE FROM write_budgets').run()
    await db.prepare('INSERT INTO write_budgets (bucket, used) VALUES (?, 100)').bind(`person:alice:${day}`).run()
    for (let i = 0; i < 3; i++) await call(submitPath, { code: alice, body: { ...command, commandId: `exhausted-${i}` }, status: 429 })
    assert.equal(await db.prepare('SELECT used FROM write_budgets WHERE bucket = ?').bind(`global:${day}`).first('used'), null, 'refused actor must not charge the global bucket')
    await call(submitPath, { code: bob, body: { ...command, commandId: 'after-exhausted-alice', text: 'Bob still shares while Alice is limited' }, status: 201 })
    await db.prepare('DELETE FROM write_budgets').run()
  }
  // Grow to exact contribution counts. Reset only the isolated fixture's budgets
  // between requests so the 100/day contributor limit is not confused with capacity.
  const sizes = [{ contributions: 0, documentBytes: baseline.bytes, workerdProcessRssKiB: baselineRssKiB }]
  let capacity = null
  let count = Object.keys(JSON.parse((await state()).document).metadata.commons.submissions).length
  for (const target of [50, 200]) {
    while (count < target) {
      await db.prepare('DELETE FROM write_budgets').run()
      const beforeGrowth = await state()
      const growth = await call(submitPath, { code: count % 2 ? alice : bob, body: { ...command, commandId: `growth-${count}`, text: `Growth measurement observation ${count}` }, status: [201, 409], ...(count === target - 1 ? { label: `contribution ${target}` } : {}) })
      if (growth.error) {
        assert.equal(growth.error, 'conflict'); assert.equal(growth.detail?.reason, 'capacity')
        assert.deepEqual(await state(), beforeGrowth, 'capacity rejection preserves the entire document')
        assert.ok(beforeGrowth.bytes > 1024 * 1024 - 4096, 'failure is at the document capacity boundary')
        capacity = { acceptedContributions: count, documentBytes: beforeGrowth.bytes, nextContributionStatus: 409, unavailableTarget: target }
        break
      }
      count++
    }
    sizes.push({ contributions: count, documentBytes: (await state()).bytes, workerdProcessRssKiB: await rssKiB() })
    await call('/api/commons/search?q=lighthouse', { label: `after ${count} search` })
    // Replay measures a mutation request without changing the target population.
    await call(submitPath, { code: alice, body: command, label: `after ${count} replay` })
    if (capacity) break
  }
  const beforeRestart = await state()
  const identities = (await db.prepare('SELECT actor_id,display_name,expires_at,revoked,can_review FROM contributor_tokens ORDER BY actor_id').all()).results
  await mf.dispose(); mf = undefined
  await start()
  assert.deepEqual(await state(), beforeRestart, 'new runtime loads the same persisted document')
  assert.deepEqual((await db.prepare('SELECT actor_id,display_name,expires_at,revoked,can_review FROM contributor_tokens ORDER BY actor_id').all()).results, identities)
  await verifyPublic()
  const replay = await call(submitPath, { code: alice, body: command })
  assert.equal(replay.replayed, true); assert.equal(replay.contribution.id, a.contribution.id)
  const bobReplay = await call(submitPath, { code: bob, body: replyCommand })
  assert.equal(bobReplay.replayed, true); assert.equal(bobReplay.contribution.id, b.contribution.id)
  assert.deepEqual(await state(), beforeRestart, 'startup import and receipt replays are no-op writes')
  console.log(JSON.stringify({ result: 'PASS', compatibilityDate, cpuScope: runtimePid ? 'Linux /proc workerd all-thread scheduled CPU (includes D1/runtime; not isolate CPU)' : 'CPU unavailable on this platform', sizes, capacity, timings }, null, 2))
} finally {
  try { await mf?.dispose() } finally { await rm(temporary, { recursive: true, force: true }) }
}
