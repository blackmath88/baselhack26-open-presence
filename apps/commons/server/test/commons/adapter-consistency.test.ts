import { afterEach, expect, it } from 'vitest'
import { createHarness, type Harness } from '../harness.js'
import { createCommonsImporter } from '../../commons/import.js'
import type { TransactionalEventRepository } from '../../persistence/repository.js'
import type { ImportedProblem } from '../../../src/commons/contracts.js'
import fixtures from './real-records.json'

let h: Harness | undefined
afterEach(async () => { await h?.close() })
it('withholds moderated bodies and derived labels through room, legacy HTTP, MCP, context and replay', async () => {
  h = await createHarness({ seed: false })
  await createCommonsImporter(h.services.repository as TransactionalEventRepository)(fixtures as ImportedProblem[])
  const actor = await h.actor('Kai')
  const reviewer = await h.actor('Lea')
  const commons = h.services.commons!
  const command = { commandId: 'redaction-regression', problemId: 'emmc-not-exposed', text: 'secret-tern-972 full body must be withheld', sourceRefs: [] }
  const result = await commons.submitContribution(actor, command)
  const room = 'commons:emmc-not-exposed'
  const rawBefore = await h.services.repository.read(room)
  const mcp = await h.mcp('Lea')
  for (const action of ['hide', 'block'] as const) {
    await commons.moderate(reviewer, { commandId: action, action, contributionId: result.contributionId, authorId: actor.actorId })
    expect((await commons.moderate(reviewer, { commandId: action, action, contributionId: result.contributionId, authorId: actor.actorId })).replayed).toBe(true)
    const reads = [
      await commons.getRoom(actor, room), await h.services.problems.getState(room),
      await h.services.problems.getCompactState(room), await h.services.problems.getEvents(room),
      await h.services.problems.getUpdates(room, actor), await h.services.orchestration.context(room),
      (await h.http('GET', `/api/problems/${encodeURIComponent(room)}`, { token: h.token('Lea') })).body,
      await mcp.callTool({ name: 'get_problem_state', arguments: { problemId: room } }),
      await mcp.callTool({ name: 'get_problem_overview', arguments: { problemId: room } }),
      await mcp.callTool({ name: 'get_contribution_context', arguments: { problemId: room } }),
    ]
    for (const read of reads) expect(JSON.stringify(read)).not.toContain('secret-tern-972')
    await expect(commons.submitContribution(actor, command)).rejects.toMatchObject({ code: 'forbidden' })
    expect(await h.services.repository.read(room)).toEqual(rawBefore)
    await commons.moderate(reviewer, { commandId: 'undo-'+action, action: action === 'hide' ? 'unhide' : 'unblock', contributionId: result.contributionId, authorId: actor.actorId })
    expect(JSON.stringify(await commons.getRoom(actor, room))).toContain('secret-tern-972')
  }
})

it('rejects malformed operation inputs at service, HTTP, MCP and CLI entrances', async () => {
  h = await createHarness({ seed: false })
  const actor = await h.actor('Kai')
  const mcp = await h.mcp('Kai')
  const badCases = [
    { tool: 'commons_search', method: 'GET', path: '/api/commons/search?q=x&limit=NaN', input: { query: 'x', limit: NaN }, run: () => h!.services.commons!.search(actor, { query: 'x', limit: NaN }) },
    { tool: 'commons_search', method: 'GET', path: '/api/commons/search?q=x&include=bogus', input: { query: 'x', include: ['bogus'] }, run: () => h!.services.commons!.search(actor, { query: 'x', include: ['bogus'] as never }) },
    { tool: 'commons_browse_repository', method: 'GET', path: '/api/commons/repository?type=bogus', input: { type: 'bogus' }, run: () => h!.services.commons!.browseRepository(actor, { type: 'bogus' as never }) },
    { tool: 'commons_get_context', method: 'GET', path: '/api/commons/context?problemId=x&budget=-5', input: { problemId: 'x', budget: -5 }, run: () => h!.services.commons!.getContext(actor, { problemId: 'x', budget: -5 }) },
    { tool: 'commons_sync_author', method: 'POST', path: '/api/commons/sync', input: { did: 'alice.test', maxPages: 'five' }, run: () => h!.services.commons!.syncAuthor(actor, { did: 'alice.test', maxPages: 'five' as never }) },
    { tool: 'commons_prepare_publication', method: 'POST', path: '/api/commons/publications/prepare', input: { contributionId: 42 }, run: () => h!.services.commons!.preparePublication(actor, { contributionId: 42 as never }) },
    { tool: 'commons_moderate', method: 'POST', path: '/api/commons/moderation', input: { commandId: 'bad-mod', action: 'oops', authorId: 'person:kai' }, run: () => h!.services.commons!.moderate(actor, { commandId: 'bad-mod', action: 'oops' as never, authorId: 'person:kai' }) },
  ]
  for (const c of badCases) {
    await expect(Promise.resolve().then(async (): Promise<unknown> => c.run())).rejects.toMatchObject({ code: 'invalid' })
    expect((await h.http(c.method, c.path, { token: h.token('Kai'), ...(c.method === 'POST' ? { body: c.input } : {}) })).status).toBe(422)
    const result = await mcp.callTool({ name: c.tool, arguments: c.input })
    expect(result.isError).toBe(true)
  }
  const { execFile } = await import('node:child_process')
  const { promisify } = await import('node:util')
  for (const args of [['search', 'anything', '--limit', 'NaN'], ['sync', 'alice.test', '--max-pages', '0'], ['browse', '--threads', 'bogus']]) {
    await expect(promisify(execFile)(process.execPath, ['--import', 'tsx', 'scripts/commons/cli.ts', ...args], {
      env: { ...process.env, COMMONS_API: h.baseUrl, BRAINSTORM_TOKEN: h.token('Kai') },
    })).rejects.toMatchObject({ code: 2 })
  }
})

it('applies contribution field limits in preview and submission, stripping forged identity consistently', async () => {
  h = await createHarness({ seed: false })
  await createCommonsImporter(h.services.repository as TransactionalEventRepository)(fixtures as ImportedProblem[])
  const actor = await h.actor('Kai')
  const commons = h.services.commons!
  for (const extra of [{ circumstances: 'x'.repeat(2001) }, { preparedBy: 42 }, { sourceRefs: 'issue/99' }, { parentId: 42 }]) {
    const command = { commandId: 'bad-fields', problemId: 'emmc-not-exposed', text: 'hello', sourceRefs: [], ...extra }
    expect((await commons.prepareContribution(actor, command)).ok).toBe(false)
    expect((await h.http('POST', '/api/commons/contributions/prepare', { token: h.token('Kai'), body: command })).body).toMatchObject({ ok: false })
    await expect(commons.submitContribution(actor, command as never)).rejects.toMatchObject({ code: 'invalid' })
    expect((await h.http('POST', '/api/commons/contributions', { token: h.token('Kai'), body: command })).status).toBe(422)
  }
  const command = { commandId: 'identity-parity', problemId: 'emmc-not-exposed', text: 'hello', sourceRefs: [], authoredBy: 'person:forged' }
  const first = await commons.submitContribution(actor, command)
  expect(first.contribution.provenance.authoredBy).toBe('person:kai')
  const retry = { ...command, authoredBy: 'person:other' }
  expect((await commons.submitContribution(actor, retry)).replayed).toBe(true)
  await expect(commons.moderate(actor, { commandId: command.commandId, action: 'hide', contributionId: first.contributionId })).rejects.toMatchObject({ code: 'conflict' })
})

it('withholds deleted and invalid remote records and dependent proposal reasons without altering stored events', async () => {
  const { createFakeAtproto } = await import('./fake-atproto.js')
  const { contribution } = await import('../atproto/fixtures.js')
  const fake = createFakeAtproto({ appId: 'test-app' })
  h = await createHarness({ seed: false, atproto: fake.adapter })
  const repository = h.services.repository as TransactionalEventRepository
  await createCommonsImporter(repository)(fixtures as ImportedProblem[])
  const actor = await h.actor('Kai')
  const remoteActor = { did: 'did:plc:abcdefghijklmnopqrstuvwx', handle: 'remote.test' }
  const built = fake.adapter.buildRecord({
    contribution: contribution({ problemId: 'emmc-not-exposed', text: 'remote-secret-781 content and label', sourceRefs: [] }),
    problemUrl: 'http://localhost/#/problems/emmc-not-exposed',
    source: { repository: 'wesbos/photo-frame-dashboard', revision: 'test', snapshotId: 'test' }, resolved: {},
  })
  const remote = fake.put(remoteActor, 'record1', built.record)
  const result = await h.services.commons!.resolveExternal(actor, { uri: remote.uri })
  const room = 'commons:emmc-not-exposed'
  await repository.append([{
    id: 'dependent-event', problemId: room, actorId: actor.actorId, timestamp: '2026-10-31T18:00:00Z', objectId: 'dependent-proposal', eventType: 'RelationProposed',
    payload: { proposalId: 'dependent-proposal', kind: 'relation', sourceId: result.contributionId!, targetId: 'commons:emmc-not-exposed:e1', reason: 'remote-secret-781 derived reason', relationKind: 'supports', confidence: 1, proposedBy: actor.actorId },
  }])
  const raw = await repository.read(room)
  for (const state of ['deleted', 'invalid'] as const) {
    if (state === 'deleted') fake.delete(remote.uri)
    else fake.put(remoteActor, 'record1', { invalid: true })
    await h.services.commons!.resolveExternal(actor, { uri: remote.uri })
    const reads = [
      await h.services.commons!.getRoom(actor, room), await h.services.problems.getState(room),
      await h.services.problems.getEvents(room), await h.services.problems.getUpdates(room, actor),
      await h.services.curation.list(room), await h.services.orchestration.context(room),
      (await h.http('GET', `/api/problems/${encodeURIComponent(room)}/curation`, { token: h.token('Kai') })).body,
    ]
    for (const read of reads) expect(JSON.stringify(read)).not.toContain('remote-secret-781')
    expect(await repository.read(room)).toEqual(raw)
    expect(await h.services.commons!.getContribution(actor, result.contributionId!)).toMatchObject({ moderated: true, reason: state })
  }
})
