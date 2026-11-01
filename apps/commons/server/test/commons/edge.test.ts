import { describe, it, expect } from 'vitest'
import { DatabaseSync } from 'node:sqlite'
import { readFileSync } from 'node:fs'
import { createD1Repository, type Database, type Statement } from '../../../worker/edge/d1-repository.js'
import { createCommonsService } from '../../commons/service.js'
import { createEdgeAuth, tokenHash } from '../../../worker/edge/auth.js'
import edge from '../../../worker/edge/index.js'
import { importedProblems } from '../../../src/commons/source/index.js'
import fixtures from './real-records.json'
import type { ImportedProblem } from '../../../src/commons/contracts.js'
import { DEFAULT_SCOPES } from '../../auth/actor-context.js'

// Execute the exact migration and prepared SQL against SQLite, not a fake CAS.
function database() {
  const sqlite = new DatabaseSync(':memory:')
  sqlite.exec(readFileSync(new URL('../../../worker/edge/migrations/0001_commons.sql', import.meta.url), 'utf8'))
  const statement = (sql: string, values: unknown[] = []): Statement & { execute(): unknown } => ({
    bind: (...next) => statement(sql, next),
    async first<T>() { return (sqlite.prepare(sql).get(...values as never[]) ?? null) as T | null },
    async run() { return sqlite.prepare(sql).run(...values as never[]) },
    execute() { return sqlite.prepare(sql).run(...values as never[]) },
  })
  const db: Database = { prepare: statement, async batch(statements) {
    sqlite.exec('BEGIN')
    try { for (const s of statements) (s as ReturnType<typeof statement>).execute(); sqlite.exec('COMMIT') }
    catch (e) { sqlite.exec('ROLLBACK'); throw e }
  } }
  return { db, sqlite }
}
const actor = { actorId: 'person:alice', displayName: 'Alice', scopes: DEFAULT_SCOPES }
const sources = fixtures as ImportedProblem[]
const submission = { commandId: 'edge-1', problemId: sources[0].postackId, text: 'Edge rediscovery lighthouse', sourceRefs: [sources[0].evidence[0].source.objectId], preparedBy: 'browser-draft', circumstances: 'macOS' }
describe('D1 command parity', () => {
  it('retries concurrent identical commands and rejects reused IDs with changed content', async () => {
    const { db } = database()
    const a = createCommonsService({ repository: createD1Repository(db) })
    const b = createCommonsService({ repository: createD1Repository(db) })
    await a.importProblems(actor, sources)
    const results = await Promise.all([a.submitContribution(actor, submission), b.submitContribution(actor, submission)])
    expect(results.map(r => r.replayed).sort()).toEqual([false, true])
    expect(results[0].contribution.id).toBe(results[1].contribution.id)
    await expect(b.submitContribution(actor, { ...submission, text: 'changed' })).rejects.toMatchObject({ code: 'conflict' })
  })
  it('preserves independent simultaneous writes, rollback and restart state', async () => {
    const { db } = database()
    const a = createD1Repository(db), b = createD1Repository(db)
    await Promise.all([a.transaction(async tx => { tx.metadata.a = 1 }), b.transaction(async tx => { tx.metadata.b = 2 })])
    await expect(a.transaction(async tx => { tx.metadata.a = 99; throw new Error('abort') })).rejects.toThrow('abort')
    expect(await createD1Repository(db).transaction(async tx => tx.metadata)).toEqual({ a: 1, b: 2 })
  })
  it('rolls back the entire SQL batch on a stale guard', async () => {
    const { db, sqlite } = database()
    await expect(db.batch([
      db.prepare("UPDATE commons_state SET document = 'corrupt' WHERE id = 1"),
      db.prepare("INSERT INTO commons_commit_guard VALUES ('stale', 0)"),
    ])).rejects.toThrow('commons_revision_matches')
    expect(sqlite.prepare('SELECT document FROM commons_state').get()?.document).toBe('{"events":[],"metadata":{}}')
  })
  it('validates issued identity, expiry and revocation; public reads cannot write', async () => {
    const { db, sqlite } = database(); const code = 'a'.repeat(48)
    sqlite.prepare('INSERT INTO contributor_tokens (token_hash,actor_id,display_name,expires_at) VALUES (?,?,?,?)').run(await tokenHash(code), 'person:alice', 'Alice', '2099-01-01T00:00:00.000Z')
    const auth = createEdgeAuth(db)
    expect((await auth.verify(code)).scopes).toEqual(['memory:read', 'memory:contribute'])
    expect((await auth.verify('public')).scopes).toEqual(['memory:read'])
    sqlite.exec('UPDATE contributor_tokens SET revoked = 1')
    await expect(auth.verify(code)).rejects.toMatchObject({ code: 'unauthorized' })
    const env = { DB: db, ASSETS: { fetch: async () => new Response('asset') }, WRITES_ENABLED: 'true' }
    const request = (path: string, body: object, token = 'public') => new Request(`https://commons.test${path}`, { method: 'POST', headers: { authorization: `Bearer ${token}` }, body: JSON.stringify(body) })
    expect((await edge.fetch(request('/api/auth/session', { participantId: 'person:alice' }), env)).status).toBe(401)
    expect((await edge.fetch(request('/api/commons/contributions', submission), env)).status).toBe(403)
    expect((await edge.fetch(request('/api/imports', {}), env)).status).toBe(404)
  })
  it('runs two issued identities through HTTP submit, reply, public rediscovery and restart', async () => {
    const { db, sqlite } = database()
    const alice = 'a'.repeat(48), bob = 'b'.repeat(48)
    for (const [name, code] of [['alice', alice], ['bob', bob]]) {
      sqlite.prepare('INSERT INTO contributor_tokens (token_hash,actor_id,display_name,expires_at) VALUES (?,?,?,?)').run(await tokenHash(code), `person:${name}`, name, '2099-01-01T00:00:00.000Z')
    }
    const env = { DB: db, ASSETS: { fetch: async () => new Response('asset') }, WRITES_ENABLED: 'true' }
    const call = (path: string, token: string, body?: object) => edge.fetch(new Request(`https://commons.test${path}`, {
      method: body ? 'POST' : 'GET', headers: { authorization: `Bearer ${token}` }, ...(body ? { body: JSON.stringify(body) } : {}),
    }), env)
    const source = importedProblems()[0]
    const command = { commandId: 'http-a', problemId: source.postackId, text: 'Lighthouse edge experience', assistance: 'none', circumstances: 'USB on macOS' }
    const preview = await call('/api/commons/contributions/prepare', alice, command)
    expect(preview.status).toBe(200)
    expect(((await preview.json()) as { destination: { visibility: string } }).destination.visibility).toContain('public')
    const response = await call('/api/commons/contributions', alice, command)
    expect(response.status).toBe(201)
    const result = await response.json() as { contribution: { id: string } }
    const reply = await call('/api/commons/contributions', bob, { ...command, commandId: 'http-b', text: 'Lighthouse reply from Bob', parentId: result.contribution.id })
    expect(reply.status).toBe(201)
    expect(((await reply.json()) as { contribution: { provenance: { authoredBy: string } } }).contribution.provenance.authoredBy).toBe('person:bob')
    const found = await call('/api/commons/search?q=Lighthouse', 'public')
    expect(found.status).toBe(200)
    expect(await found.text()).toContain(result.contribution.id)
    // Reconstruct the application with a new repository instance, retaining only SQL.
    const restarted = createCommonsService({ repository: createD1Repository(db) })
    const thread = await restarted.getThread(actor, result.contribution.id)
    expect(JSON.stringify(thread)).toContain('Lighthouse reply from Bob')
    expect((await call('/api/commons/reviews', bob, { commandId: 'denied', proposalId: 'x', decision: 'accept' })).status).toBe(403)
  })

})
