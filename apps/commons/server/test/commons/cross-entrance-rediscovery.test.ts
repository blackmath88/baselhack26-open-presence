/**
 * Repository → problem → evidence → contribution → reply → rediscovery, across
 * entrances. A contribution made over HTTP the way the CLI does it must come
 * back to whoever browses the cited source object from MCP or HTTP, with its
 * author, entrance and the source refs it cited; search by the cited object
 * finds it; a reply over MCP is labelled with its own entrance; moderation
 * removes it from the navigator too. Imported records are never changed.
 */
import { afterEach, describe, expect, it } from 'vitest'
import type { ImportedProblem } from '../../../src/commons/contracts.js'
import fixtures from './real-records.json'
import { createHarness, structured, type Harness } from '../harness.js'
import { createCommonsImporter } from '../../commons/import.js'
import type { TransactionalEventRepository } from '../../persistence/repository.js'

const sources = fixtures as ImportedProblem[]
const PROBLEM = 'emmc-not-exposed'
const COMMENT = 'comment/6175633958' // a comment inside issue/99 cited by the record's evidence
let harness: Harness | undefined
afterEach(async () => { await harness?.close(); harness = undefined })

type Citing = { contributionId: string; actor: { id: string }; entrance: string; cited: string[]; link: string; problemId: string }
type ThreadView = { view: 'thread'; contributions: number; thread: { object: string; problems: Array<{ problemId: string }>; contributions: Citing[]; commentList: Array<{ object: string; contributions: Citing[] }> } }

describe('cross-entrance rediscovery from the repository', () => {
  it('brings a CLI-style contribution back to the cited thread for an MCP agent, with author, entrance and refs', async () => {
    harness = await createHarness({ seed: false })
    await createCommonsImporter(harness.services.repository as TransactionalEventRepository)(sources)
    const h = harness
    const leaMcp = await h.mcp('Lea')
    const before = structured<ThreadView>(await leaMcp.callTool({ name: 'commons_browse_repository', arguments: { object: 'issue/99' } }))
    expect(before.thread.problems.map(p => p.problemId)).toContain(PROBLEM)
    expect(before.thread.contributions).toEqual([])
    const recordBefore = JSON.stringify((await h.http<{ problem: unknown }>('GET', `/api/commons/problems/${PROBLEM}`, { token: h.token('Lea') })).body.problem)

    // Kai contributes the way `npm run commons -- submit … --ref comment/…` does: prepare, then submit with entrance cli.
    const prepared = await h.http<{ ok: boolean; command: Record<string, unknown> }>('POST', '/api/commons/contributions/prepare', {
      token: h.token('Kai'), body: { problemId: PROBLEM, text: 'larkspur-0417: reflashing over USB OTG still hides the eMMC', kind: 'attempt', sourceRefs: [COMMENT] },
    })
    expect(prepared.body.ok).toBe(true)
    const submitted = await h.http<{ contributionId: string }>('POST', '/api/commons/contributions', { token: h.token('Kai'), body: { ...prepared.body.command, commandId: 'cli-larkspur', entrance: 'cli' } })
    expect(submitted.status).toBe(201)
    const id = submitted.body.contributionId
    // A retry of the same command through another entrance replays rather than conflicting; the first entrance stays.
    const retried = await h.http<{ replayed: boolean }>('POST', '/api/commons/contributions', { token: h.token('Kai'), body: { ...prepared.body.command, commandId: 'cli-larkspur', entrance: 'browser' } })
    expect([retried.status, retried.body.replayed]).toEqual([200, true])
    expect((await h.http('POST', '/api/commons/contributions', { token: h.token('Kai'), body: { ...prepared.body.command, commandId: 'bad-entrance', entrance: 'carrier-pigeon' } })).status).toBe(422)

    // An agent browsing the thread through MCP rediscovers it, under the thread and under the exact comment.
    const after = structured<ThreadView>(await leaMcp.callTool({ name: 'commons_browse_repository', arguments: { object: 'issue/99' } }))
    expect(after.thread.contributions).toEqual([expect.objectContaining({ contributionId: id, actor: expect.objectContaining({ id: 'person:kai' }), entrance: 'cli', cited: [COMMENT], problemId: PROBLEM, link: `#/contributions/${id}` })])
    expect(after.thread.commentList.find(c => c.object === COMMENT)?.contributions.map(c => c.contributionId)).toEqual([id])
    // Linked-only thread listings now include threads cited by contributions.
    const listing = await h.http<{ threads: Array<{ object: string; contributions: Citing[] }> }>('GET', '/api/commons/repository?type=issue&linked=true', { token: h.token('Lea') })
    expect(listing.body.threads.find(t => t.object === 'issue/99')?.contributions.map(c => c.contributionId)).toEqual([id])

    // Lea replies through MCP; that reply carries its own entrance.
    const reply = structured<{ contributionId: string }>(await leaMcp.callTool({ name: 'commons_submit_contribution', arguments: { commandId: 'mcp-larkspur-reply', problemId: PROBLEM, text: 'Which OTG cable? Mine only enumerates with a data-rated one.', kind: 'question', parentId: id, sourceRefs: [] } }))
    const replyView = await h.http<{ entrance: string; actor: { id: string } }>('GET', `/api/commons/contributions/${reply.contributionId}`, { token: h.token('Kai') })
    expect(replyView.body).toMatchObject({ entrance: 'mcp', actor: { id: 'person:lea' } })

    // Problem → evidence → contribution → reply: the record's evidence items name who cites them and how far it went.
    type Cite = Citing & { replies: number; participants: string[]; otherProblem: boolean }
    const problemView = structured<{ evidenceCitations: Record<string, Cite[]> }>(await leaMcp.callTool({ name: 'commons_get_problem', arguments: { problemId: PROBLEM } }))
    for (const evidenceId of ['e1', 'e2']) { // issue/99 (thread containing the comment) and the comment itself
      expect(problemView.evidenceCitations[evidenceId]).toEqual([expect.objectContaining({ contributionId: id, replies: 1, participants: ['person:kai', 'person:lea'], otherProblem: false })])
    }
    expect(problemView.evidenceCitations.e3).toBeUndefined()
    const thread99 = structured<ThreadView>(await leaMcp.callTool({ name: 'commons_browse_repository', arguments: { object: 'issue/99' } }))
    expect(thread99.thread.contributions[0]).toMatchObject({ replies: 1, participants: ['person:kai', 'person:lea'] })
    const packet = structured<{ evidence: Array<{ id: string; citedBy: string[] }> }>(await leaMcp.callTool({ name: 'commons_get_context', arguments: { problemId: PROBLEM, budget: 6000 } }))
    expect(packet.evidence.find(e => e.id === 'e2')?.citedBy).toEqual([id])

    // Search by the cited object id rediscovers the contribution with source refs and entrance.
    const byObject = await h.http<{ contributions: Array<{ contributionId: string; matches: Array<{ field: string }>; explanation: string; summary: { entrance: string; sourceRefs: Array<{ objectId: string; permalink: string; author: string }> } }> }>('GET', `/api/commons/search?q=${encodeURIComponent(COMMENT)}`, { token: h.token('Lea') })
    const hit = byObject.body.contributions.find(c => c.contributionId === id)!
    expect(hit.matches.some(m => m.field === 'source')).toBe(true)
    expect(hit.summary.entrance).toBe('cli')
    expect(hit.summary.sourceRefs.map(r => r.objectId)).toEqual([COMMENT])
    expect(hit.summary.sourceRefs[0].permalink).toMatch(/^https:\/\/github\.com\//)
    expect(hit.explanation).toContain('entered via cli')
    expect(hit.explanation).toContain(COMMENT)

    // The imported record is unchanged by any of this.
    expect(JSON.stringify((await h.http<{ problem: unknown }>('GET', `/api/commons/problems/${PROBLEM}`, { token: h.token('Lea') })).body.problem)).toBe(recordBefore)

    // Hiding the contribution removes it from the navigator for every entrance; nothing of its body leaks.
    const kaiMcp = await h.mcp('Kai')
    await kaiMcp.callTool({ name: 'commons_moderate', arguments: { commandId: 'hide-larkspur', action: 'hide', contributionId: id } })
    const hidden = structured<ThreadView>(await leaMcp.callTool({ name: 'commons_browse_repository', arguments: { object: 'issue/99' } }))
    expect(hidden.thread.contributions).toEqual([])
    expect(JSON.stringify(hidden)).not.toContain('larkspur')
    const hiddenHttp = await h.http<unknown>('GET', '/api/commons/repository?object=issue%2F99', { token: h.token('Kai') })
    expect(JSON.stringify(hiddenHttp.body)).not.toContain('larkspur')
  })

  it('shows a contribution citing a shared source on every problem whose evidence cites it, flagged as another problem', async () => {
    harness = await createHarness({ seed: false })
    await createCommonsImporter(harness.services.repository as TransactionalEventRepository)(sources)
    const h = harness
    const DOC = 'docs/pf1007l-start-here.md' // e8 of emmc-not-exposed, e1 of gadget-error-71
    const submitted = await h.http<{ contributionId: string }>('POST', '/api/commons/contributions', {
      token: h.token('Lea'), body: { commandId: 'browser-doc-1', problemId: 'gadget-error-71', text: 'The start-here guide skips the gadget reset step on PF1007L.', kind: 'observation', sourceRefs: [DOC], entrance: 'browser' },
    })
    expect(submitted.status).toBe(201)
    const other = await h.http<{ evidenceCitations: Record<string, Array<{ contributionId: string; otherProblem: boolean; problemId: string; entrance: string }>> }>('GET', `/api/commons/problems/${PROBLEM}`, { token: h.token('Kai') })
    expect(other.body.evidenceCitations.e8).toEqual([expect.objectContaining({ contributionId: submitted.body.contributionId, otherProblem: true, problemId: 'gadget-error-71', entrance: 'browser' })])
    const own = await h.http<{ evidenceCitations: Record<string, Array<{ otherProblem: boolean }>> }>('GET', '/api/commons/problems/gadget-error-71', { token: h.token('Kai') })
    expect(own.body.evidenceCitations.e1?.map(c => c.otherProblem)).toEqual([false])
  })

  it('lets a contributor cite one exact passage, attaches it only there, and shows real participant names everywhere', async () => {
    harness = await createHarness({ seed: false })
    await createCommonsImporter(harness.services.repository as TransactionalEventRepository)(sources)
    const h = harness
    const kaiMcp = await h.mcp('Kai')
    // Passage e2 (a comment inside issue/99) only; its source object joins sourceRefs on the server.
    const prepared = structured<{ ok: boolean; command: { sourceRefs: string[]; evidenceIds: string[] } }>(await kaiMcp.callTool({ name: 'commons_prepare_contribution', arguments: { problemId: PROBLEM, text: 'heliotrope-22: the mmc dev 1 failure in that comment matches my unit exactly', evidenceIds: ['e2'] } }))
    expect(prepared.command).toMatchObject({ sourceRefs: [COMMENT], evidenceIds: ['e2'] })
    const bad = structured<{ ok: boolean; errors: string[] }>(await kaiMcp.callTool({ name: 'commons_prepare_contribution', arguments: { problemId: PROBLEM, text: 'x', evidenceIds: ['e99'] } }))
    expect(bad.ok).toBe(false)
    const submitted = structured<{ contributionId: string }>(await kaiMcp.callTool({ name: 'commons_submit_contribution', arguments: { commandId: 'mcp-passage-1', problemId: PROBLEM, text: 'heliotrope-22: the mmc dev 1 failure in that comment matches my unit exactly', evidenceIds: ['e2'] } }))
    const id = submitted.contributionId
    const view = await h.http<{ evidenceCitations: Record<string, Array<{ contributionId: string; evidenceIds?: string[]; actor: { displayName?: string } }>>; contributions: Array<{ id: string; evidenceIds?: string[]; actor: { id: string; displayName?: string } }> }>('GET', `/api/commons/problems/${PROBLEM}`, { token: h.token('Lea') })
    expect(view.body.evidenceCitations.e2).toEqual([expect.objectContaining({ contributionId: id, evidenceIds: ['e2'], actor: expect.objectContaining({ displayName: 'Kai' }) })])
    expect(view.body.evidenceCitations.e1).toBeUndefined() // same thread, different passage: not attached
    expect(view.body.contributions.find(c => c.id === id)).toMatchObject({ evidenceIds: ['e2'], actor: { id: 'person:kai', displayName: 'Kai' } })
    // The navigator still finds it from the thread, and search shows the real name.
    const thread = await h.http<{ thread: { contributions: Array<{ contributionId: string; evidenceIds?: string[] }> } }>('GET', '/api/commons/repository?object=issue%2F99', { token: h.token('Lea') })
    expect(thread.body.thread.contributions).toEqual([expect.objectContaining({ contributionId: id, evidenceIds: ['e2'] })])
    const found = await h.http<{ contributions: Array<{ contributionId: string; summary: { actor: { displayName?: string } } }> }>('GET', '/api/commons/search?q=heliotrope', { token: h.token('Lea') })
    expect(found.body.contributions[0]).toMatchObject({ contributionId: id, summary: { actor: { displayName: 'Kai' } } })
  })
})
