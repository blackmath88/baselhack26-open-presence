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
  const review = (who: string, proposalId: string, decision: 'accept' | 'reject') =>
    fetch(`${base}/api/curation/${encodeURIComponent(proposalId)}/${decision}`, {
      method: 'POST',
      headers: { 'content-type': 'application/json', authorization: `Bearer ${token(who)}` },
      body: JSON.stringify({ problemId: 'commons:emmc-not-exposed' }),
    })
  return { review }
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
})
