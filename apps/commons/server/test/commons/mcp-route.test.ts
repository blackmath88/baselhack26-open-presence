/**
 * MCP tools share the composed services, so contradictory reviews of an imported
 * proposal over MCP (or MCP against REST) must also serialize (re-review finding on B1).
 */
import { afterEach, describe, expect, it } from 'vitest'
import type { ImportedProblem } from '../../../src/commons/contracts.js'
import fixtures from './real-records.json'
import { createHarness, type Harness } from '../harness.js'
import { createCommonsImporter } from '../../commons/import.js'
import type { TransactionalEventRepository } from '../../persistence/repository.js'

let harness: Harness | undefined
afterEach(async () => { await harness?.close(); harness = undefined })

const problemId = 'commons:emmc-not-exposed'
const proposalId = 'commons:emmc-not-exposed:relation:0'

async function setup() {
  harness = await createHarness({ seed: false })
  await createCommonsImporter(harness.services.repository as TransactionalEventRepository)(fixtures as ImportedProblem[])
  return harness
}

const decisions = async (h: Harness) =>
  (await h.services.repository.read(problemId)).filter(e => /^(Relation|Proposal)(Accepted|Rejected)$/.test(e.eventType) && JSON.stringify(e).includes(proposalId))

describe('Commons reviews over MCP', () => {
  it('serializes contradictory MCP reviews', async () => {
    const h = await setup()
    const [kai, lea] = await Promise.all([h.mcp('Kai'), h.mcp('Lea')])
    const results = (await Promise.all([
      kai.callTool({ name: 'review_curation_proposal', arguments: { problemId, proposalId, accept: true } }),
      lea.callTool({ name: 'review_curation_proposal', arguments: { problemId, proposalId, accept: false } }),
    ])) as Array<{ isError?: boolean }>
    expect(results.filter(r => !r.isError)).toHaveLength(1)
    expect(await decisions(h)).toHaveLength(1)
  })

  it('serializes an MCP accept against a concurrent REST Commons reject', async () => {
    const h = await setup()
    const kai = await h.mcp('Kai')
    const [mcp, rest] = await Promise.all([
      kai.callTool({ name: 'review_curation_proposal', arguments: { problemId, proposalId, accept: true } }) as Promise<{ isError?: boolean }>,
      h.http('POST', '/api/commons/reviews', { token: h.token('Lea'), body: { commandId: 'rest-reject', proposalId, decision: 'reject' } }),
    ])
    expect([!mcp.isError, rest.status === 200].filter(Boolean)).toHaveLength(1)
    expect(await decisions(h)).toHaveLength(1)
  })
})

describe('stores created before batch 2', () => {
  it('reads imported "observation" contributions as evidence without rewriting events (re-review E-S1)', async () => {
    const { project } = await import('../../domain/projections.js')
    const h = await setup()
    const events = await h.services.repository.read(problemId)
    const legacy = events.map(e => (e.eventType === 'ContributionAdded' ? { ...e, payload: { ...(e.payload as object), kind: 'observation' } } : e))
    const state = project(legacy as typeof events)!
    expect(state.contributions.length).toBeGreaterThan(0)
    expect(state.contributions.every(c => c.kind === 'evidence')).toBe(true)
  })
})

describe('review room targeting and reason policy (re-review F)', () => {
  it('refuses to review a proposal through a room that does not contain it, without appending', async () => {
    const h = await setup()
    const kai = await h.mcp('Kai')
    for (const room of ['commons:no-such-room', 'commons:gadget-error-71']) {
      const result = (await kai.callTool({ name: 'review_curation_proposal', arguments: { problemId: room, proposalId, accept: false, reason: 'wrong room' } })) as { isError?: boolean }
      expect(result.isError).toBe(true)
    }
    expect(await decisions(h)).toHaveLength(0)
  })

  it('treats a blank MCP reason as absent on every transport', async () => {
    const h = await setup()
    const kai = await h.mcp('Kai')
    const result = (await kai.callTool({ name: 'review_curation_proposal', arguments: { problemId, proposalId, accept: false, reason: '   ' } })) as { isError?: boolean }
    expect(result.isError).toBeFalsy()
    expect(await decisions(h)).toHaveLength(1)
  })

  it('leaves a participant-written "observation" alone; only imports are read as evidence', async () => {
    const { project } = await import('../../domain/projections.js')
    const h = await setup()
    const events = await h.services.repository.read(problemId)
    const legacy = events.map(e => (e.eventType === 'ContributionAdded' ? { ...e, actorId: 'person:kai', payload: { ...(e.payload as object), kind: 'observation' } } : e))
    expect(project(legacy as typeof events)!.contributions.every(c => (c.kind as string) === 'observation')).toBe(true)
  })
})
