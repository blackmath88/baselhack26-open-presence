/**
 * Many entrances, one Commons. One service instance is driven through MCP and
 * HTTP (the CLI is an HTTP client) and must show the same ids, authors,
 * revisions and moderation state everywhere. Publication and ingestion run
 * against the in-memory fake (real record building/parsing), so these checks
 * are deterministic; the two-author test against a real PDS lives next door.
 */
import { afterEach, describe, expect, it } from 'vitest'
import { mkdtemp, rm } from 'node:fs/promises'
import { tmpdir } from 'node:os'
import { join } from 'node:path'
import type { CommonsContribution, ImportedProblem, ModeratedContribution } from '../../../src/commons/contracts.js'
import fixtures from './real-records.json'
import { createHarness, structured, structuredError, type Harness } from '../harness.js'
import { createCommonsImporter, commonsMetadata, type CommonsMetadata } from '../../commons/import.js'
import { createCommonsService } from '../../commons/service.js'
import { createJsonRepository, createMemoryRepository } from '../../persistence/json-repository.js'
import { createContributionService } from '../../application/contribution-service.js'
import { createIdSource } from '../../domain/events.js'
import { nullCurator } from '../../curation/ai-curator.js'
import { DEFAULT_SCOPES, type ActorContext } from '../../auth/actor-context.js'
import type { TransactionalEventRepository } from '../../persistence/repository.js'
import { createFakeAtproto } from './fake-atproto.js'
import { contribution as fixtureContribution } from '../atproto/fixtures.js'

const sources = fixtures as ImportedProblem[]
const PROBLEM = 'emmc-not-exposed'
const ROOM = `commons:${PROBLEM}`
const kai: ActorContext = { actorId: 'person:kai', displayName: 'Kai', scopes: DEFAULT_SCOPES }
const lea: ActorContext = { actorId: 'person:lea', displayName: 'Lea', scopes: DEFAULT_SCOPES }
const clock = (() => { let t = Date.parse('2026-10-31T16:00:00.000Z'); return { now: () => new Date((t += 1000)).toISOString() } })()
let harness: Harness | undefined
const dirs: string[] = []
afterEach(async () => { await harness?.close(); harness = undefined; await Promise.all(dirs.splice(0).map(d => rm(d, { recursive: true, force: true }))) })

async function setupHarness() {
  harness = await createHarness({ seed: false })
  await createCommonsImporter(harness.services.repository as TransactionalEventRepository)(sources)
  return harness
}
async function setupService(options: Parameters<typeof createCommonsService>[0] extends infer O ? Partial<O> : never = {}) {
  const repository = options.repository ?? createMemoryRepository()
  const service = createCommonsService({ repository, clock, appUrl: 'http://localhost:5173', appId: 'open-presence-commons-test', ...options })
  await createCommonsImporter(repository, clock)(sources)
  return { repository, service }
}
const ref = sources[0].evidence[0].source.objectId

describe('M1 — one Commons through MCP and HTTP', () => {
  it('finds the same problem from MCP, contributes over HTTP, replies over MCP and rediscovers the phrase everywhere', async () => {
    const h = await setupHarness()
    const kaiMcp = await h.mcp('Kai')
    const leaMcp = await h.mcp('Lea')
    // 1. An agent enters through MCP search.
    const search = structured<{ problems: Array<{ problemId: string; link: string }>; contributions: unknown[] }>(await kaiMcp.callTool({ name: 'commons_search', arguments: { query: 'emmc never appears' } }))
    expect(search.problems[0]?.problemId).toBe(PROBLEM)
    expect(search.problems[0]?.link).toBe(`#/problems/${PROBLEM}`)
    const problem = structured<{ roomId: string; contributions: unknown[]; problem: { provenance: { review: string } } }>(await kaiMcp.callTool({ name: 'commons_get_problem', arguments: { problemId: PROBLEM } }))
    expect(problem.roomId).toBe(ROOM)
    expect(problem.contributions).toHaveLength(0)
    expect(problem.problem.provenance.review).toBe('unreviewed')
    // 2. A person contributes through the CLI path (HTTP), after a preview that writes nothing.
    const phrase = 'quartz-heron-5521 my January unit also fails mmc dev 1'
    const draft = { problemId: PROBLEM, text: phrase, kind: 'attempt', circumstances: 'Route S, 30 MHz SD', sourceRefs: [ref], parentId: 'commons:emmc-not-exposed:e1' }
    const prepared = await h.http<{ ok: boolean; command: { commandId: string }; destination: { roomId: string }; parentSummary: { kind: string } }>('POST', '/api/commons/contributions/prepare', { token: h.token('Kai'), body: draft })
    expect(prepared.status).toBe(200)
    expect(prepared.body.ok).toBe(true)
    expect(prepared.body.destination.roomId).toBe(ROOM)
    expect(prepared.body.parentSummary).toEqual({ objectId: ref, kind: 'source' })
    expect(structured<{ contributions: unknown[] }>(await kaiMcp.callTool({ name: 'commons_get_problem', arguments: { problemId: PROBLEM } })).contributions).toHaveLength(0)
    const command = { ...prepared.body.command, commandId: 'cli-1', authoredBy: 'person:impostor' }
    const submitted = await h.http<{ contributionId: string; replayed: boolean; contribution: { provenance: { authoredBy: string } } }>('POST', '/api/commons/contributions', { token: h.token('Kai'), body: command })
    expect(submitted.status).toBe(201)
    expect(submitted.body.replayed).toBe(false)
    expect(submitted.body.contribution.provenance.authoredBy).toBe('person:kai')
    const id = submitted.body.contributionId
    // Same key + same content replays (200, replayed); same key + other content conflicts.
    const again = await h.http<{ replayed: boolean; contributionId: string }>('POST', '/api/commons/contributions', { token: h.token('Kai'), body: command })
    expect([again.status, again.body.replayed, again.body.contributionId]).toEqual([200, true, id])
    expect((await h.http('POST', '/api/commons/contributions', { token: h.token('Kai'), body: { ...command, text: 'changed' } })).status).toBe(409)
    // 3. Another person replies through MCP; the reply names the parent and keeps both voices.
    const reply = structured<{ contributionId: string; contribution: { provenance: { authoredBy: string } } }>(await leaMcp.callTool({ name: 'commons_submit_contribution', arguments: { commandId: 'mcp-reply-1', problemId: PROBLEM, text: 'Did the no-HS patch change anything on that January unit?', kind: 'question', parentId: id, sourceRefs: [] } }))
    expect(reply.contribution.provenance.authoredBy).toBe('person:lea')
    const thread = structured<{ root: { contribution: CommonsContribution; replies: Array<{ contribution: CommonsContribution }> }; participants: string[] }>(await kaiMcp.callTool({ name: 'commons_get_thread', arguments: { contributionId: reply.contributionId } }))
    expect(thread.root.contribution.id).toBe(id)
    expect(thread.root.contribution.kind).toBe('attempt')
    expect(thread.root.contribution.parent).toMatchObject({ kind: 'source', objectId: ref })
    expect(thread.root.replies.map(r => r.contribution.actor.id)).toEqual(['person:lea'])
    expect(thread.participants.sort()).toEqual(['person:kai', 'person:lea'])
    // 4. The phrase is discoverable from MCP and HTTP with author and source refs.
    const found = structured<{ contributions: Array<{ contributionId: string; summary: { actor: { id: string } } }> }>(await leaMcp.callTool({ name: 'commons_search', arguments: { query: 'quartz-heron-5521' } }))
    expect(found.contributions[0]).toMatchObject({ contributionId: id, summary: { actor: { id: 'person:kai' } } })
    const viaHttp = await h.http<CommonsContribution>('GET', `/api/commons/contributions/${id}`, { token: h.token('Lea') })
    expect(viaHttp.body).toMatchObject({ id, kind: 'attempt', revision: 1, actor: { id: 'person:kai', kind: 'participant' }, assistance: { declared: 'none' }, origin: { kind: 'local' }, publication: null, links: { app: `#/contributions/${id}` } })
    expect(viaHttp.body.sourceRefs.map(s => s.objectId)).toEqual([ref])
    expect(viaHttp.body.sourceRefs[0].author).not.toBe('person:kai')
    // 5. Context packet: deterministic, budgeted, names omissions and limitations; never an answer.
    const context = structured<{ contributions: Array<{ id: string; text: string }>; omissions: string[]; limitations: string[]; freshness: { roomVersion: number } }>(await kaiMcp.callTool({ name: 'commons_get_context', arguments: { contributionId: id, budget: 4000 } }))
    expect(context.contributions[0].id).toBe(id)
    expect(context.contributions.some(c => c.text.includes('quartz-heron-5521'))).toBe(true)
    expect(context.omissions.some(o => /Full source text/.test(o))).toBe(true)
    expect(context.limitations.length).toBeGreaterThan(2)
    const compact = structured<{ contributions: unknown[]; omissions: string[] }>(await kaiMcp.callTool({ name: 'commons_get_context', arguments: { problemId: PROBLEM, budget: 1000 } }))
    expect(compact.omissions.some(o => /omitted for budget|truncated/.test(o))).toBe(true)
    // The room's existing views see the same records with the same provenance.
    const state = await h.http<{ contributions: Array<{ id: string; provenance: { authoredBy: string } }> }>('GET', `/api/problems/${encodeURIComponent(ROOM)}`, { token: h.token('Lea') })
    expect(state.body.contributions.find(c => c.id === id)?.provenance.authoredBy).toBe('person:kai')
  })

  it('a reply through the UI route (Add a thought) and a Commons reply are the same kind of record', async () => {
    const h = await setupHarness()
    const r = await h.http<{ contribution: { id: string } }>('POST', `/api/problems/${encodeURIComponent(ROOM)}/contributions`, { token: h.token('Kai'), body: { content: 'A free-form room thought', commandId: 'ui-1' } })
    expect(r.status).toBe(201)
    const c = await h.http<CommonsContribution>('GET', `/api/commons/contributions/${r.body.contribution.id}`, { token: h.token('Kai') })
    expect(c.body).toMatchObject({ kind: 'observation', actor: { id: 'person:kai' }, sourceRefs: [] })
  })

  it('refuses forged publishers and unknown problems, and the body never chooses the actor', async () => {
    const h = await setupHarness()
    const mcp = await h.mcp('Kai')
    const bad = structuredError(await mcp.callTool({ name: 'commons_submit_contribution', arguments: { commandId: 'x', problemId: 'no-such-problem', text: 'hi' } }))
    expect(bad.error).toBe('not_found')
    const invalid = structured<{ ok: boolean; errors: string[] }>(await mcp.callTool({ name: 'commons_prepare_contribution', arguments: { problemId: PROBLEM, text: 'hi', sourceRefs: ['issue/1'], parentId: 'contrib_999' } }))
    expect(invalid.ok).toBe(false)
    expect(invalid.errors.join(' ')).toMatch(/does not belong|not found/)
  })
})

describe('M2 — repository navigation and deep links', () => {
  it('walks the pinned snapshot from root to a doc and a thread, with cited problems and disclosed coverage', async () => {
    const h = await setupHarness()
    const root = await h.http<{ view: string; entries: Array<{ kind: string; name: string }>; coverage: { revision: string; exclusions: string[]; note: string }; threads: { issues: number; linked: number } }>('GET', '/api/commons/repository', { token: h.token('Kai') })
    expect(root.body.view).toBe('dir')
    expect(root.body.entries.map(e => e.name)).toContain('docs')
    expect(root.body.coverage.revision).toMatch(/^[0-9a-f]{40}$/)
    expect(root.body.coverage.exclusions.length).toBeGreaterThan(0)
    expect(root.body.threads.issues).toBe(57)
    const doc = await h.http<{ view: string; doc: { path: string; url: string; problems: Array<{ problemId: string; locators: string[] }> } }>('GET', '/api/commons/repository/docs/pf1007l-start-here.md', { token: h.token('Kai') })
    expect(doc.body.view).toBe('doc')
    expect(doc.body.doc.url).toMatch(/^https:\/\/github\.com\/wesbos\/photo-frame-dashboard\/blob\//)
    expect(doc.body.doc.problems.map(p => p.problemId)).toContain(PROBLEM)
    const thread = await h.http<{ view: string; thread: { object: string; author: string | null; problems: Array<{ problemId: string }>; commentList: Array<{ object: string; problems: unknown[] }> } }>('GET', '/api/commons/repository?object=issue/99', { token: h.token('Kai') })
    expect(thread.body.thread.object).toBe('issue/99')
    expect(thread.body.thread.problems.map(p => p.problemId)).toContain(PROBLEM)
    const mcp = await h.mcp('Lea')
    const threads = structured<{ view: string; total: number; threads: Array<{ object: string; problems: unknown[] }>; cursor?: string }>(await mcp.callTool({ name: 'commons_browse_repository', arguments: { type: 'issue', linkedOnly: true, limit: 5 } }))
    expect(threads.view).toBe('threads')
    expect(threads.threads.length).toBeLessThanOrEqual(5)
    expect(threads.threads.every(t => t.problems.length > 0)).toBe(true)
    expect((await h.http('GET', '/api/commons/repository/no/such/path', { token: h.token('Kai') })).status).toBe(404)
  })
})

describe('M0 — migration and moderation', () => {
  it('reads a first-slice store without new fields: same ids, defaulted kind, schema version stamped', async () => {
    const { repository, service } = await setupService()
    const submitted = await service.submitContribution(kai, { commandId: 'old-1', problemId: PROBLEM, text: 'An old-style submission', sourceRefs: [ref], preparedBy: 'browser-draft' })
    await repository.transaction(async tx => {
      const m = tx.metadata.commons as Partial<CommonsMetadata> & { submissions: Record<string, Record<string, unknown>> }
      delete m.publications; delete m.intents; delete m.outbox; delete m.external; delete m.sync; delete m.moderation; delete m.schemaVersion
      delete m.submissions[submitted.contributionId].kind; delete m.submissions[submitted.contributionId].assistance
    })
    const view = await service.getProblem(kai, PROBLEM)
    const c = view.contributions[0] as CommonsContribution
    expect(c.id).toBe(submitted.contributionId)
    expect(c).toMatchObject({ kind: 'observation', revision: 1, assistance: { declared: 'none', preparedBy: 'browser-draft' }, publication: null })
    await repository.transaction(async tx => { expect(commonsMetadata(tx).schemaVersion).toBe('2026-10-31.1') })
    expect(await service.submitContribution(kai, { commandId: 'old-1', problemId: PROBLEM, text: 'An old-style submission', sourceRefs: [ref], preparedBy: 'browser-draft' })).toMatchObject({ replayed: true, contributionId: submitted.contributionId })
  })

  it('hide and block affect search, thread, context, MCP and HTTP alike, without leaking the body', async () => {
    const h = await setupHarness()
    const mcp = await h.mcp('Kai')
    const { contributionId } = structured<{ contributionId: string }>(await mcp.callTool({ name: 'commons_submit_contribution', arguments: { commandId: 'm1', problemId: PROBLEM, text: 'secret-otter-3310 sensitive remark', sourceRefs: [] } }))
    const hide = await h.http('POST', '/api/commons/moderation', { token: h.token('Lea'), body: { commandId: 'mod-1', action: 'hide', contributionId, reason: 'test' } })
    expect(hide.status).toBe(200)
    const viaMcp = structured<ModeratedContribution & { text?: string }>(await mcp.callTool({ name: 'commons_get_contribution', arguments: { contributionId } }))
    expect(viaMcp).toMatchObject({ id: contributionId, moderated: true, reason: 'hidden' })
    expect(JSON.stringify(viaMcp)).not.toContain('secret-otter')
    expect(structured<{ contributions: unknown[] }>(await mcp.callTool({ name: 'commons_search', arguments: { query: 'secret-otter-3310' } })).contributions).toHaveLength(0)
    const context = structured<{ contributions: unknown[]; omissions: string[] }>(await mcp.callTool({ name: 'commons_get_context', arguments: { problemId: PROBLEM } }))
    expect(context.contributions).toHaveLength(0)
    expect(context.omissions.some(o => /withheld/.test(o))).toBe(true)
    expect(JSON.stringify(context)).not.toContain('secret-otter')
    const problem = await h.http<{ contributions: ModeratedContribution[]; moderatedCount: number }>('GET', `/api/commons/problems/${PROBLEM}`, { token: h.token('Lea') })
    expect(problem.body.moderatedCount).toBe(1)
    expect(JSON.stringify(problem.body.contributions)).not.toContain('secret-otter')
    await h.http('POST', '/api/commons/moderation', { token: h.token('Lea'), body: { commandId: 'mod-2', action: 'unhide', contributionId } })
    expect(structured<{ contributions: unknown[] }>(await mcp.callTool({ name: 'commons_search', arguments: { query: 'secret-otter-3310' } })).contributions).toHaveLength(1)
    await h.http('POST', '/api/commons/moderation', { token: h.token('Lea'), body: { commandId: 'mod-3', action: 'block', authorId: 'person:kai' } })
    expect(structured<ModeratedContribution>(await mcp.callTool({ name: 'commons_get_contribution', arguments: { contributionId } })).reason).toBe('blocked-author')
  })
})

describe('M3 — publication outbox (fake PDS, real records)', () => {
  const alice = { did: 'did:plc:alicefake000000000000000', handle: 'alice.test' }
  it('does not retry a queued publication while its contribution is hidden or its author blocked', async () => {
    const fake = createFakeAtproto({ appId: 'open-presence-commons-test', accounts: { 'person:kai': alice } })
    const { service } = await setupService({ atproto: fake.adapter })
    const { contributionId } = await service.submitContribution(kai, { commandId: 'moderated-publish', problemId: PROBLEM, text: 'Withheld observation', sourceRefs: [] })
    const prepared = await service.preparePublication(kai, { contributionId })
    if (!prepared.ready) throw new Error('expected ready')
    fake.faults.timeoutAfterWrite = 1
    await service.publishContribution(kai, { intentId: prepared.intent.intentId })
    const callsBefore = fake.calls.length
    await service.moderate(lea, { commandId: 'hide-pending', action: 'hide', contributionId })
    expect((await service.retryPublications(kai)).attempted).toBe(0)
    expect(fake.calls).toHaveLength(callsBefore)
    await service.moderate(lea, { commandId: 'unhide-pending', action: 'unhide', contributionId })
    await service.moderate(lea, { commandId: 'block-pending', action: 'block', authorId: kai.actorId })
    expect((await service.retryPublications(kai)).attempted).toBe(0)
    expect(fake.calls).toHaveLength(callsBefore)
    await service.moderate(lea, { commandId: 'unblock-pending', action: 'unblock', authorId: kai.actorId })
    expect((await service.retryPublications(kai)).receipts[0].status).toBe('published')
    expect(fake.count(alice.did)).toBe(1)
  })

  it('keeps a pending publication bound to the previewed account after a restart', async () => {
    const fake = createFakeAtproto({ appId: 'open-presence-commons-test', accounts: { 'person:kai': alice } })
    const { service, repository } = await setupService({ atproto: fake.adapter })
    const { contributionId } = await service.submitContribution(kai, { commandId: 'bound-publish', problemId: PROBLEM, text: 'Account-bound observation', sourceRefs: [] })
    const prepared = await service.preparePublication(kai, { contributionId })
    if (!prepared.ready) throw new Error('expected ready')
    const bob = { did: 'did:plc:bobfake00000000000000000', handle: 'bob.test' }
    const changed = createFakeAtproto({ appId: 'open-presence-commons-test', accounts: { 'person:kai': bob } })
    const restarted = createCommonsService({ repository, clock, atproto: changed.adapter, appUrl: 'http://localhost:5173', appId: 'open-presence-commons-test' })
    const result = await restarted.publishContribution(kai, { intentId: prepared.intent.intentId })
    expect(result.receipt.status).toBe('failed')
    expect(result.receipt.did).toBe(alice.did)
    expect(result.receipt.lastError).toMatch(/account.*changed/i)
    expect(changed.store.size).toBe(0)
  })

  it('reports an actionable state without an account, previews with one, and never writes until told to', async () => {
    const fake = createFakeAtproto({ appId: 'open-presence-commons-test', accounts: { 'person:kai': alice } })
    const { service } = await setupService({ atproto: fake.adapter })
    const { contributionId } = await service.submitContribution(kai, { commandId: 'p1', problemId: PROBLEM, text: 'Publish me: marble-lynx-8841', sourceRefs: [ref] })
    const none = await service.preparePublication(lea, { contributionId })
    expect(none).toMatchObject({ ready: false, reason: 'not-author' })
    const leaOwn = await service.submitContribution(lea, { commandId: 'p2', problemId: PROBLEM, text: 'Lea has no account', sourceRefs: [] })
    expect(await service.preparePublication(lea, { contributionId: leaOwn.contributionId })).toMatchObject({ ready: false, reason: 'no-account', activation: { configured: ['person:kai'] } })
    const prepared = await service.preparePublication(kai, { contributionId })
    expect(prepared.ready).toBe(true)
    if (!prepared.ready) return
    expect(prepared.destination.did).toBe(alice.did)
    expect(prepared.preview.text).toBe('Publish me: marble-lynx-8841')
    expect((prepared.preview.problem as { localId: string }).localId).toBe(PROBLEM)
    expect((prepared.preview.sourceRefs as unknown[]).length).toBe(1)
    expect(fake.store.size).toBe(0)
    expect(fake.calls).toEqual([])
    expect((await service.getPublication(kai, contributionId)).receipt).toBeNull()
  })

  it('publishes exactly once: replayed publish, timeout-after-write recovery with the same key, restart retention', async () => {
    const dir = await mkdtemp(join(tmpdir(), 'commons-outbox-')); dirs.push(dir)
    const file = join(dir, 'events.json')
    const fake = createFakeAtproto({ appId: 'open-presence-commons-test', accounts: { 'person:kai': alice } })
    const { service } = await setupService({ repository: createJsonRepository({ file }), atproto: fake.adapter })
    const { contributionId } = await service.submitContribution(kai, { commandId: 'p1', problemId: PROBLEM, text: 'Once only', sourceRefs: [ref] })
    const prepared = await service.preparePublication(kai, { contributionId })
    if (!prepared.ready) throw new Error('expected ready')
    fake.faults.timeoutAfterWrite = 1
    const first = await service.publishContribution(kai, { intentId: prepared.intent.intentId })
    expect(first.receipt).toMatchObject({ status: 'failed', attempts: 1, rkey: prepared.intent.rkey })
    expect(first.receipt.lastError).toMatch(/timeout/)
    expect(fake.count(alice.did)).toBe(1)
    // Restart: a new service over the same file still has the pending item and the same key.
    const restarted = createCommonsService({ repository: createJsonRepository({ file }), clock, atproto: fake.adapter, appUrl: 'http://localhost:5173', appId: 'open-presence-commons-test' })
    expect((await restarted.status(kai)).publications.outbox).toBe(1)
    const retried = await restarted.retryPublications(kai)
    expect(retried.receipts[0]).toMatchObject({ status: 'published', rkey: prepared.intent.rkey, uri: `at://${alice.did}/${prepared.intent.collection}/${prepared.intent.rkey}`, attempts: 2 })
    expect(fake.count(alice.did)).toBe(1)
    expect(fake.calls.filter(c => c.startsWith('publish:'))).toHaveLength(2)
    // Publishing the same intent again is a replay, not a second record.
    const again = await restarted.publishContribution(kai, { intentId: prepared.intent.intentId })
    expect(again.receipt.status).toBe('published')
    expect(fake.count(alice.did)).toBe(1)
    const c = await restarted.getContribution(kai, contributionId) as CommonsContribution
    expect(c.publication?.status).toBe('published')
    expect((await restarted.getPublication(kai, contributionId)).observed[0]).toMatchObject({ selfPublicationOf: contributionId })
    expect((await restarted.status(kai)).publications).toMatchObject({ published: 1, outbox: 0 })
  })

  it('a changed payload or an expired intent requires a new preview', async () => {
    const fake = createFakeAtproto({ appId: 'open-presence-commons-test', accounts: { 'person:kai': alice } })
    const repository = createMemoryRepository()
    const { service } = await setupService({ repository, atproto: fake.adapter })
    const { contributionId } = await service.submitContribution(kai, { commandId: 'p1', problemId: PROBLEM, text: 'Version one', sourceRefs: [ref] })
    const prepared = await service.preparePublication(kai, { contributionId })
    if (!prepared.ready) throw new Error('expected ready')
    await createContributionService({ repository, clock, ids: createIdSource(5000), curator: nullCurator }).edit(kai, { problemId: ROOM, contributionId, content: 'Version two' })
    await expect(service.publishContribution(kai, { intentId: prepared.intent.intentId })).rejects.toMatchObject({ code: 'conflict' })
    expect(fake.store.size).toBe(0)
    const fresh = await service.preparePublication(kai, { contributionId })
    if (!fresh.ready) throw new Error('expected ready')
    expect(fresh.intent.revision).toBe(2)
    expect(fresh.preview.text).toBe('Version two')
    await expect(service.publishContribution(lea, { intentId: fresh.intent.intentId })).rejects.toMatchObject({ code: 'forbidden' })
    const published = await service.publishContribution(kai, { intentId: fresh.intent.intentId })
    expect(published.receipt.status).toBe('published')
  })
})

describe('M4 — ingestion semantics (fake PDS, real records)', () => {
  const bob = { did: 'did:plc:bobfake00000000000000000', handle: 'bob.test' }
  const alice = { did: 'did:plc:alicefake000000000000000', handle: 'alice.test' }
  const record = (fake: ReturnType<typeof createFakeAtproto>, overrides: Partial<CommonsContribution> = {}, resolved: Record<string, { uri: string; cid: string }> = {}) =>
    fake.adapter.buildRecord({
      contribution: fixtureContribution({ problemId: PROBLEM, roomId: ROOM, id: 'remote-local-id', actor: { id: bob.did, kind: 'atproto' }, sourceRefs: [sources[0].evidence[0].source], ...overrides }),
      problemUrl: `http://elsewhere.test/#/problems/${PROBLEM}`,
      source: { repository: 'wesbos/photo-frame-dashboard', revision: '0bff55ef3fb2a3bfdab05bc8e3bd0c9d69f63189', snapshotId: 'commons-001@0bff55ef3fb2' },
      resolved,
    }).record

  it('ingests, deduplicates, versions, keeps unknown problems unresolved, and treats interruption as partial', async () => {
    const fake = createFakeAtproto({ appId: 'open-presence-commons-test', identities: [bob] })
    const { service } = await setupService({ atproto: fake.adapter })
    const r1 = fake.put(bob, '3lzzzzzzzzza2', record(fake, { text: 'Bob observed: copper-finch-2207 on a May unit' }))
    fake.put(bob, '3lzzzzzzzzzb2', record(fake, { problemId: 'not-here', roomId: 'commons:not-here', text: 'Unknown problem' }))
    fake.put(bob, '3lzzzzzzzzzc2', { $type: 'test.openpresence.commons.contribution', nonsense: true })
    const first = await service.syncAuthor(kai, { did: bob.handle })
    expect(first).toMatchObject({ status: 'complete', records: 3, outcomes: { created: 1, unresolved: 1, invalid: 1 }, deleted: 0 })
    const view = await service.getProblem(kai, PROBLEM)
    expect(view.contributions).toHaveLength(1)
    const c = view.contributions[0] as CommonsContribution
    expect(c).toMatchObject({ actor: { id: bob.did, kind: 'atproto', displayName: 'bob.test' }, revision: 1, origin: { kind: 'atproto', uri: r1.uri, cid: r1.cid, availability: 'available' } })
    expect(c.sourceRefs.map(s => s.objectId)).toEqual([ref])
    expect(c.sourceRefs[0].author).not.toBe(bob.did)
    expect((await service.search(kai, { query: 'copper-finch-2207' })).contributions[0]?.summary.actor.id).toBe(bob.did)
    // Re-sync: nothing new; the invalid and unresolved records stay visible as bounded states, not content.
    // The unresolved reference is kept and re-seen unchanged; the invalid record is re-validated and stays invalid.
    expect((await service.syncAuthor(kai, { did: bob.did })).outcomes).toMatchObject({ unchanged: 2, invalid: 1, created: 0 })
    expect((await service.status(kai)).external).toMatchObject({ observed: 3, unresolved: 1, invalid: 1 })
    // An edit upstream advances the version of the same contribution; no second participant appears.
    fake.put(bob, '3lzzzzzzzzza2', record(fake, { text: 'Bob corrected himself: copper-finch-2207 only after the 12 MHz build' }))
    expect((await service.syncAuthor(kai, { did: bob.did })).outcomes.updated).toBe(1)
    const updated = (await service.getProblem(kai, PROBLEM)).contributions[0] as CommonsContribution
    expect(updated.id).toBe(c.id)
    expect(updated.revision).toBe(2)
    expect(updated.text).toMatch(/corrected himself/)
    // Interrupted scan: partial, nothing deleted.
    fake.faults.listUnreachable = true
    const partial = await service.syncAuthor(kai, { did: bob.did })
    expect(partial.status).toBe('failed')
    expect(((await service.getProblem(kai, PROBLEM)).contributions[0] as CommonsContribution).origin).toMatchObject({ availability: 'available' })
    fake.faults.listUnreachable = false
    // Deletion upstream: only a complete scan turns it into unavailable; the event history stays.
    fake.delete(r1.uri)
    expect((await service.syncAuthor(kai, { did: bob.did })).deleted).toBe(1)
    const gone = (await service.getProblem(kai, PROBLEM)).contributions[0] as ModeratedContribution
    expect(gone).toMatchObject({ id: c.id, moderated: true, reason: 'deleted' })
    expect((await service.search(kai, { query: 'copper-finch-2207' })).contributions).toHaveLength(0)
  })

  it('resolves a single at:// URI, distinguishes missing from unreachable, and recognises its own publication', async () => {
    const fake = createFakeAtproto({ appId: 'open-presence-commons-test', accounts: { 'person:kai': alice }, identities: [bob] })
    const { service } = await setupService({ atproto: fake.adapter })
    const r = fake.put(bob, '3lzzzzzzzzzd2', record(fake, { text: 'Resolve me' }))
    expect(await service.resolveExternal(kai, { uri: r.uri })).toMatchObject({ status: 'ingested', outcome: 'created' })
    fake.faults.getUnreachable = true
    expect(await service.resolveExternal(kai, { uri: r.uri })).toMatchObject({ status: 'stale' })
    expect(((await service.getProblem(kai, PROBLEM)).contributions[0] as CommonsContribution).origin).toMatchObject({ availability: 'stale' })
    fake.faults.getUnreachable = false
    fake.delete(r.uri)
    expect(await service.resolveExternal(kai, { uri: r.uri })).toMatchObject({ status: 'deleted' })
    expect(await service.resolveExternal(kai, { uri: `at://${bob.did}/test.openpresence.commons.contribution/3lzzzzzzzzze2` })).toMatchObject({ status: 'missing' })
    await expect(service.resolveExternal(kai, { uri: 'https://example.com' })).rejects.toMatchObject({ code: 'invalid' })
    // Self echo: Kai publishes, then syncing alice yields `self`, not a second contribution.
    const { contributionId } = await service.submitContribution(kai, { commandId: 's1', problemId: PROBLEM, text: 'Mine, published', sourceRefs: [ref] })
    const prepared = await service.preparePublication(kai, { contributionId })
    if (!prepared.ready) throw new Error('expected ready')
    await service.publishContribution(kai, { intentId: prepared.intent.intentId })
    const sync = await service.syncAuthor(kai, { did: alice.did })
    // The outbox already registered the published record as an observation of the local contribution: no echo.
    expect(sync.outcomes).toMatchObject({ unchanged: 1, created: 0, self: 0 })
    expect((await service.getProblem(kai, PROBLEM)).contributions.filter(c => !('moderated' in c))).toHaveLength(1)
    const own = await service.getPublication(kai, contributionId)
    expect(own.observed[0]).toMatchObject({ selfPublicationOf: contributionId, did: alice.did })
    // A fresh app that never published it recognises the record by its declared origin only when the DID matches a receipt it holds — here it has none, so the record is a new, attributed contribution by Alice's DID.
    const fresh = await setupService({ atproto: fake.adapter })
    expect((await fresh.service.syncAuthor(kai, { did: alice.did })).outcomes.created).toBe(1)
    expect(((await fresh.service.getProblem(kai, PROBLEM)).contributions[0] as CommonsContribution).actor.id).toBe(alice.did)
    // A reply by Bob referencing Alice's record reconstructs the thread across authors.
    const alicePub = (await service.getPublication(kai, contributionId)).receipt!
    fake.put(bob, '3lzzzzzzzzzf2', record(fake, { kind: 'question', text: 'Bob replies to Alice' }, { parent: { uri: alicePub.uri!, cid: alicePub.cid! } }))
    expect((await service.syncAuthor(kai, { did: bob.did })).outcomes.created).toBe(1)
    const thread = await service.getThread(kai, contributionId)
    expect(thread.root.replies.map(r => (r.contribution as CommonsContribution).actor.id)).toEqual([bob.did])
    expect(thread.participants.sort()).toEqual(['person:kai', bob.did].sort())
  })
})
