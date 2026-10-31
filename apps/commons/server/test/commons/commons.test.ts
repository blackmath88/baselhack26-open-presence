import { afterEach, describe, expect, it } from 'vitest'
import { mkdtemp, readFile, rm } from 'node:fs/promises'
import { tmpdir } from 'node:os'
import { join } from 'node:path'
import { createServer, type Server } from 'node:http'
import type { AddressInfo } from 'node:net'
import type { ImportedProblem } from '../../../src/commons/contracts.js'
import { importedContributionId, importedProblemSpaceId } from '../../../src/commons/contracts.js'
import fixtures from './real-records.json'
import { createJsonRepository, createMemoryRepository } from '../../persistence/json-repository.js'
import { createCommonsService } from '../../commons/service.js'
import { createCommonsImporter } from '../../commons/import.js'
import { commonsRoutes } from '../../commons/routes.js'
import { createPrototypeAuth } from '../../auth/prototype-auth.js'
import { makeEvent, createIdSource } from '../../domain/events.js'
import { DEFAULT_SCOPES, type ActorContext } from '../../auth/actor-context.js'

const sources = fixtures as ImportedProblem[]
const actor = (name = 'kai'): ActorContext => ({ actorId: `person:${name}`, displayName: name, scopes: DEFAULT_SCOPES })
const clock = { now: () => '2026-10-31T13:30:00.000Z' }
const roomId = importedProblemSpaceId(sources[0].postackId)
const proposalId = `commons:${sources[0].postackId}:relation:1`
const submission = { commandId: 'submit-1', problemId: sources[0].postackId, text: 'My frame also fails on a direct USB port.', sourceRefs: [sources[0].evidence[0].source.objectId], preparedBy: 'browser-draft', circumstances: 'macOS' }
const dirs: string[] = []
const servers: Server[] = []
afterEach(async () => {
  await Promise.all(servers.splice(0).map(s => new Promise<void>((resolve, reject) => s.close(e => e ? reject(e) : resolve()))))
  await Promise.all(dirs.splice(0).map(d => rm(d, { recursive: true, force: true })))
})
async function setup() {
  const repository = createMemoryRepository()
  const service = createCommonsService({ repository, clock })
  await service.importProblems(actor(), sources)
  return { repository, service }
}
describe('Commons memory', () => {
  it('imports two real records idempotently without copying quotes or backdating events', async () => {
    const repository = createMemoryRepository()
    const importProblems = createCommonsImporter(repository, clock)
    const first = await importProblems(sources)
    expect(first.appendedEvents).toBeGreaterThan(0)
    const before = await repository.read()
    expect(await importProblems(structuredClone(sources))).toEqual({ roomIds: first.roomIds, appendedEvents: 0 })
    expect(await repository.read()).toEqual(before)
    expect(before.every(e => e.timestamp === clock.now())).toBe(true)
    for (const e of sources.flatMap(s => s.evidence)) expect(JSON.stringify(before)).not.toContain(e.quote)
    const service = createCommonsService({ repository, clock })
    const room = await service.getRoom(actor(), roomId)
    expect(room.source).toEqual(sources[0])
    expect(room.contributions).toHaveLength(sources[0].evidence.length)
    expect(room.contributions[0].id).toBe(importedContributionId(sources[0].postackId, sources[0].evidence[0].id))
    expect(room.relations).toEqual([])
    expect(room.proposals.find(p => p.id === proposalId)).toMatchObject({ status: 'pending', proposedBy: 'postack-agent', origin: 'postack-agent' })
  })
  it('retries identical concurrent submissions once, rejects changed keys, and preserves source objects', async () => {
    const { service, repository } = await setup()
    const beforeSources = structuredClone(sources)
    const before = (await repository.read()).length
    const results = await Promise.all([service.submitContribution(actor(), submission), service.submitContribution(actor(), structuredClone(submission))])
    expect(results[0]).toEqual(results[1])
    const after = await repository.read()
    expect(after.filter(e => e.eventType === 'ContributionAdded' && e.actorId === 'person:kai')).toHaveLength(1)
    expect(after.length).toBeGreaterThan(before)
    expect(results[0].contribution.provenance).toMatchObject({ authoredBy: 'person:kai', submittedBy: 'person:kai', preparedBy: 'browser-draft' })
    await expect(service.submitContribution(actor(), { ...submission, text: 'Different' })).rejects.toMatchObject({ code: 'conflict' })
    await expect(service.submitContribution(actor('lea'), submission)).rejects.toMatchObject({ code: 'conflict' })
    await service.review(actor('lea'), { commandId: 'review-1', proposalId, decision: 'accept' })
    expect(sources).toEqual(beforeSources)
    expect((await service.getRoom(actor(), roomId)).source).toEqual(beforeSources[0])
  })
  it('serializes contradictory concurrent reviews: exactly one success and one explicit conflict', async () => {
    const { service, repository } = await setup()
    const before = (await repository.read(roomId)).length
    const result = await Promise.allSettled([
      service.review(actor(), { commandId: 'yes', proposalId, decision: 'accept' }),
      service.review(actor('lea'), { commandId: 'no', proposalId, decision: 'reject' }),
    ])
    expect(result.filter(r => r.status === 'fulfilled')).toHaveLength(1)
    expect(result.filter(r => r.status === 'rejected')).toHaveLength(1)
    expect((result.find(r => r.status === 'rejected') as PromiseRejectedResult).reason).toMatchObject({ code: 'conflict' })
    expect((await repository.read(roomId)).length).toBe(before + 1)
    const room = await service.getRoom(actor(), roomId)
    expect(room.proposals.find(p => p.id === proposalId)?.status).toBe('accepted')
    expect(room.relations[0]).toMatchObject({ origin: 'postack-agent', reviewedBy: 'person:kai' })
  })
  it('returns prior review outcome before version checks, rejects changed input and stale versions', async () => {
    const { service, repository } = await setup()
    const input = { commandId: 'yes', proposalId, decision: 'accept' as const, expectedVersion: (await repository.read(roomId)).length }
    const result = await service.review(actor(), input)
    const count = (await repository.read()).length
    expect(await service.review(actor(), input)).toEqual(result)
    expect((await repository.read()).length).toBe(count)
    await expect(service.review(actor(), { ...input, decision: 'reject' })).rejects.toMatchObject({ code: 'conflict' })
    await expect(service.review(actor(), { commandId: 'stale', proposalId: `commons:${sources[0].postackId}:relation:0`, decision: 'reject', expectedVersion: 0 })).rejects.toMatchObject({ code: 'conflict' })
  })
  it('retains independent review policy for a participant AI proposal', async () => {
    const { service, repository } = await setup()
    await repository.append([makeEvent({ clock, ids: createIdSource(9000) }, {
      problemId: roomId, objectId: 'own-ai', actorId: 'agent:test', eventType: 'RelationProposed',
      payload: { proposalId: 'own-ai', kind: 'relation', sourceId: roomId, targetId: 'target', relationKind: 'relates', reason: 'Test', confidence: 0.5, proposedBy: 'agent:test', onBehalfOf: 'person:kai' },
    })])
    await expect(service.review(actor(), { commandId: 'own', proposalId: 'own-ai', decision: 'accept' })).rejects.toMatchObject({ code: 'forbidden' })
    expect((await service.review(actor('lea'), { commandId: 'independent', proposalId: 'own-ai', decision: 'accept' })).proposal.status).toBe('accepted')
  })
  it('survives a new repository/service instance, including import, submission and review receipts', async () => {
    const dir = await mkdtemp(join(tmpdir(), 'commons-')); dirs.push(dir)
    const file = join(dir, 'events.json')
    const repository = createJsonRepository({ file })
    const service = createCommonsService({ repository, clock })
    await service.importProblems(actor(), sources)
    const submitted = await service.submitContribution(actor(), submission)
    const review = { commandId: 'persisted-review', proposalId, decision: 'reject' as const }
    const reviewed = await service.review(actor(), review)
    const events = await repository.read()
    const restartedRepository = createJsonRepository({ file })
    const restarted = createCommonsService({ repository: restartedRepository, clock })
    expect(await restarted.submitContribution(actor(), submission)).toEqual(submitted)
    expect(await restarted.review(actor(), review)).toEqual(reviewed)
    expect((await restarted.importProblems(actor(), sources)).appendedEvents).toBe(0)
    expect(await restartedRepository.read()).toEqual(events)
    expect((await restarted.getRoom(actor(), roomId)).source).toEqual(sources[0])
    const document = JSON.parse(await readFile(file, 'utf8'))
    expect(document.metadata.commons.commands['submit-1'].hash).toMatch(/^[a-f0-9]{64}$/)
  })
  it('serializes commands across two repository instances addressing one file', async () => {
    const dir = await mkdtemp(join(tmpdir(), 'commons-')); dirs.push(dir)
    const file = join(dir, 'events.json')
    const first = createCommonsService({ repository: createJsonRepository({ file }), clock })
    const second = createCommonsService({ repository: createJsonRepository({ file }), clock })
    await first.importProblems(actor(), sources)
    const results = await Promise.all([first.submitContribution(actor(), submission), second.submitContribution(actor(), submission)])
    expect(results[0]).toEqual(results[1])
    expect((await second.getRoom(actor(), roomId)).contributions.filter(c => c.provenance.authoredBy === 'person:kai')).toHaveLength(1)
  })
  it('rolls back failed imports and validation without events or receipts', async () => {
    const { service, repository } = await setup()
    const before = await repository.read()
    await expect(service.submitContribution(actor(), { ...submission, sourceRefs: ['invented'] })).rejects.toMatchObject({ code: 'invalid' })
    await expect(service.submitContribution(actor(), { ...submission, text: '  ' })).rejects.toMatchObject({ code: 'invalid' })
    await expect(service.importProblems(actor(), [{ ...sources[0], title: 'Changed' }])).rejects.toMatchObject({ code: 'conflict' })
    expect(await repository.read()).toEqual(before)
    expect((await service.submitContribution(actor(), submission)).contribution.content).toBe(submission.text)
  })
})

describe('Commons HTTP subrouter', () => {
  it('resolves identity server-side and serves import, room, contribution and review routes', async () => {
    const repository = createMemoryRepository()
    const service = createCommonsService({ repository, clock })
    const auth = createPrototypeAuth({ deterministicTokens: true })
    const handler = commonsRoutes({ commons: service, auth })
    const server = createServer((req, res) => { void handler(req, res).then(handled => { if (!handled) res.writeHead(404).end() }) })
    servers.push(server)
    await new Promise<void>(resolve => server.listen(0, '127.0.0.1', resolve))
    const base = `http://127.0.0.1:${(server.address() as AddressInfo).port}`
    const token = auth.issueStable('person:kai')
    const request = async (path: string, body?: unknown, authenticated = true) => fetch(`${base}/api/commons/${path}`, {
      method: body === undefined ? 'GET' : 'POST', headers: { ...(authenticated ? { authorization: `Bearer ${token}` } : {}), 'content-type': 'application/json' },
      ...(body !== undefined ? { body: JSON.stringify(body) } : {}),
    })
    expect((await request(`rooms/${encodeURIComponent(roomId)}`, undefined, false)).status).toBe(401)
    // No HTTP import: participants cannot inject records under Postack provenance (review S3).
    expect((await request('import', { problems: sources })).status).toBe(404)
    await createCommonsImporter(repository)(sources)
    const submitted = await request('contributions', { ...submission, actorId: 'person:impostor', authoredBy: 'person:impostor' })
    expect(submitted.status).toBe(201)
    expect(((await submitted.json()) as { contribution: { provenance: { authoredBy: string } } }).contribution.provenance.authoredBy).toBe('person:kai')
    expect((await request('contributions', { ...submission, text: 'Changed' })).status).toBe(409)
    expect((await request('reviews', { commandId: 'http-review', proposalId, decision: 'reject' })).status).toBe(200)
    const room = await request(`rooms/${encodeURIComponent(roomId)}`)
    expect(room.status).toBe(200)
    expect(((await room.json()) as { history: unknown[] }).history.length).toBeGreaterThan(0)
  })
})
