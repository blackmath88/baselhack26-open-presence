/**
 * The pre-existing /api/curation route must not bypass the serialized Commons review
 * command for imported rooms: contradictory concurrent reviews yield one success and one
 * conflict, and a retried click by the same participant replays its prior outcome.
 */
import { afterEach, describe, expect, it } from 'vitest'
import { createServer, type Server } from 'node:http'
import type { AddressInfo } from 'node:net'
import type { ImportedProblem } from '../../../src/commons/contracts.js'
import fixtures from './real-records.json'
import { buildServices } from '../../container.js'
import { createMemoryRepository } from '../../persistence/json-repository.js'
import { createPrototypeAuth } from '../../auth/prototype-auth.js'
import { createCommonsImporter } from '../../commons/import.js'
import type { TransactionalEventRepository } from '../../persistence/repository.js'
import { createApi } from '../../http/api.js'

let server: Server | undefined
afterEach(() => new Promise<void>(resolve => (server ? server.close(() => resolve()) : resolve())))

async function start() {
  const repository = createMemoryRepository()
  const services = await buildServices({ repository, auth: createPrototypeAuth({ deterministicTokens: true }), seed: false, defaultOrchestration: null })
  await createCommonsImporter(repository as TransactionalEventRepository)(fixtures as ImportedProblem[])
  server = createServer(createApi(services, { enablePrototypeAuth: true }))
  await new Promise<void>(resolve => server!.listen(0, '127.0.0.1', resolve))
  const base = `http://127.0.0.1:${(server.address() as AddressInfo).port}`
  const token = (id: string) => services.auth.issue(id).token
  const review = (who: string, proposalId: string, decision: 'accept' | 'reject', reason?: string) =>
    fetch(`${base}/api/curation/${encodeURIComponent(proposalId)}/${decision}`, {
      method: 'POST',
      headers: { 'content-type': 'application/json', authorization: `Bearer ${token(who)}` },
      body: JSON.stringify({ problemId: 'commons:emmc-not-exposed', ...(reason ? { reason } : {}) }),
    })
  const commonsReview = (who: string, proposalId: string, decision: 'accept' | 'reject') =>
    fetch(`${base}/api/commons/reviews`, {
      method: 'POST',
      headers: { 'content-type': 'application/json', authorization: `Bearer ${token(who)}` },
      body: JSON.stringify({ commandId: `c-${who}-${decision}`, proposalId, decision }),
    })
  const addThought = (who: string) =>
    fetch(`${base}/api/problems/${encodeURIComponent('commons:emmc-not-exposed')}/contributions`, {
      method: 'POST',
      headers: { 'content-type': 'application/json', authorization: `Bearer ${token(who)}` },
      body: JSON.stringify({ content: `Thought from ${who}` }),
    })
  const state = async () =>
    (await (await fetch(`${base}/api/problems/${encodeURIComponent('commons:emmc-not-exposed')}`, {
      headers: { authorization: `Bearer ${token('person:kai')}` },
    })).json()) as { contributions: Array<{ kind: string; content: string; status: string }>; relations: unknown[] }
  return { review, commonsReview, addThought, state, repository }
}

describe('legacy curation route on Commons rooms', () => {
  it('serializes contradictory concurrent reviews', async () => {
    const { review } = await start()
    const results = await Promise.all([
      review('person:kai', 'commons:emmc-not-exposed:relation:0', 'accept'),
      review('person:lea', 'commons:emmc-not-exposed:relation:0', 'reject'),
    ])
    expect(results.map(r => r.status).sort()).toEqual([200, 409])
  })

  it('replays a retried click instead of failing or duplicating', async () => {
    const { review } = await start()
    const first = await review('person:kai', 'commons:emmc-not-exposed:relation:1', 'accept')
    const again = await review('person:kai', 'commons:emmc-not-exposed:relation:1', 'accept')
    expect([first.status, again.status]).toEqual([200, 200])
    expect(await again.json()).toEqual(await first.json())
  })

  it('serializes a legacy accept against a concurrent Commons reject (review B1)', async () => {
    const { review, commonsReview, state } = await start()
    for (let i = 0; i < 5; i++) {
      const id = `commons:emmc-not-exposed:relation:${i % 2}`
      const results = await Promise.all([review('person:kai', id, 'accept'), commonsReview('person:lea', id, 'reject')])
      if (i < 2) expect(results.map(r => r.status).sort()).toEqual([200, 409])
      else expect(results.every(r => r.status === 409 || r.status === 200)).toBe(true)
    }
    expect((await state()).relations.length).toBeLessThanOrEqual(2)
  })

  it('adds free-form thoughts to imported rooms through the transaction, and imported evidence shows in State (S1)', async () => {
    const { addThought, state } = await start()
    const results = await Promise.all([addThought('person:kai'), addThought('person:lea')])
    expect(results.map(r => r.status)).toEqual([201, 201])
    const s = await state()
    expect(s.contributions.filter(c => c.content.startsWith('Thought from')).length).toBe(2)
    expect(s.contributions.some(c => c.kind === 'evidence')).toBe(true)
    expect(s.contributions.some(c => c.kind === 'observation')).toBe(false)
  })

  it('records the rejection reason, and a changed reason under the same key conflicts (re-review E-S3)', async () => {
    const { review, repository } = await start()
    const id = 'commons:emmc-not-exposed:relation:1'
    expect((await review('person:kai', id, 'reject', 'Different failure stage')).status).toBe(200)
    expect((await review('person:kai', id, 'reject', 'Different failure stage')).status).toBe(200)
    expect((await review('person:kai', id, 'reject', 'Changed rationale')).status).toBe(409)
    const rejected = (await repository.read('commons:emmc-not-exposed')).filter(e => e.eventType === 'RelationRejected')
    expect(rejected).toHaveLength(1)
    expect(JSON.stringify(rejected[0].payload)).toContain('Different failure stage')
  })
})
