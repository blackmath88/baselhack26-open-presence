import { afterEach, describe, expect, it } from 'vitest'
import { createHarness, structured, type Harness } from '../harness.js'
import { commonsMetadata, createCommonsImporter } from '../../commons/import.js'
import type { TransactionalEventRepository } from '../../persistence/repository.js'
import type { ImportedProblem } from '../../../src/commons/contracts.js'
import fixtures from './real-records.json'

let h: Harness | undefined
afterEach(async () => { await h?.close(); h = undefined })

describe('moderation on inherited room and agent read paths', () => {
  for (const mode of ['hidden', 'blocked-author', 'deleted', 'invalid'] as const) {
    it(`withholds ${mode} content from room/history, legacy HTTP and MCP without rewriting storage`, async () => {
      h = await createHarness({ seed: false })
      const repository = h.services.repository as TransactionalEventRepository
      await createCommonsImporter(repository)(fixtures as ImportedProblem[])
      const kai = await h.actor('Kai'), lea = await h.actor('Lea')
      const marker = `withheld-${mode}-indigo-mongoose`
      const roomId = 'commons:emmc-not-exposed'
      const added = await h.services.commons!.submitContribution(kai, {
        commandId: `moderation-${mode}`, problemId: 'emmc-not-exposed', text: marker, sourceRefs: [],
      })
      // A derived proposal can repeat the label/body; hiding just the contribution is insufficient.
      await repository.append([{
        id: `event-${mode}`, problemId: roomId, actorId: 'agent:test', timestamp: new Date().toISOString(),
        objectId: `proposal-${mode}`, eventType: 'RelationProposed',
        payload: { proposalId: `proposal-${mode}`, kind: 'relation', sourceId: added.contributionId,
          targetId: `commons:emmc-not-exposed:${(fixtures as ImportedProblem[])[0].evidence[0].id}`,
          relationKind: 'relates', confidence: 0, reason: marker, proposedBy: 'agent:test' },
      }, {
        id: `review-event-${mode}`, problemId: roomId, actorId: lea.actorId, timestamp: new Date().toISOString(),
        objectId: `review-${mode}`, eventType: 'RelationRejected',
        payload: { proposalId: `proposal-${mode}`, reason: marker },
      }])
      if (mode === 'hidden') await h.services.commons!.moderate(lea, { commandId: 'hide', action: 'hide', contributionId: added.contributionId })
      else if (mode === 'blocked-author') await h.services.commons!.moderate(lea, { commandId: 'block', action: 'block', authorId: kai.actorId })
      else await repository.transaction(async tx => {
        commonsMetadata(tx).external[`at://did:plc:test/test.openpresence.commons.contribution/key`] = {
          uri: 'at://did:plc:test/test.openpresence.commons.contribution/key', did: 'did:plc:test', cid: 'test-cid',
          collection: 'test.openpresence.commons.contribution', rkey: 'key', retrievedAt: new Date().toISOString(),
          availability: mode, contributionId: added.contributionId, roomId, versions: [],
        }
      })
      const encoded = encodeURIComponent(roomId)
      for (const suffix of ['', '?detail=compact', '/events', '/updates', '/mine', '/curation', '/context?draft=indigo']) {
        const result = await h.http('GET', `/api/problems/${encoded}${suffix}`, { token: h.token('Kai') })
        expect(result.status).toBe(200)
        expect(JSON.stringify(result.body), suffix).not.toContain(marker)
      }
      const room = await h.services.commons!.getRoom(kai, roomId)
      expect(JSON.stringify(room)).not.toContain(marker)
      const mcp = await h.mcp('Kai')
      for (const name of ['get_problem_state', 'get_problem_overview', 'get_my_contributions', 'get_problem_updates', 'get_contribution_context']) {
        const result = await mcp.callTool({ name, arguments: { problemId: roomId } })
        expect(result.isError, name).not.toBe(true)
        expect(JSON.stringify(structured(result)), name).not.toContain(marker)
      }
      const selected = await mcp.callTool({ name: 'get_contributions', arguments: { problemId: roomId, ids: [added.contributionId] } })
      expect(selected.isError).not.toBe(true)
      expect(JSON.stringify(structured(selected))).not.toContain(marker)
      expect(JSON.stringify(await h.services.problems.getContributions(roomId, [added.contributionId]))).not.toContain(marker)
      expect(JSON.stringify(await repository.read(roomId))).toContain(marker)
      if (mode === 'hidden' || mode === 'blocked-author') {
        await h.services.commons!.moderate(lea, { commandId: 'restore', action: mode === 'hidden' ? 'unhide' : 'unblock',
          contributionId: added.contributionId, authorId: kai.actorId })
        expect(JSON.stringify(await h.services.problems.getState(roomId))).toContain(marker)
      }
    })
  }
})
