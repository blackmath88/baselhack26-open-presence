/**
 * How a passage, and a contribution, reached the reader: an ordered list of stages, each
 * built only from fields the Commons actually holds (the snapshot manifest, the source
 * reference, the record's provenance, the search hit, the room's projection). A stage
 * whose facts were not recorded says so; nothing is filled in to complete the chain.
 */
import type { CommonsContribution, ImportedProblem, Ref, SearchHit } from '../contracts'
import { appLinks } from '../contracts'
import { manifest } from '../source'
import { RECORD_WEIGHTS } from '../retrieval/records'
import { tokenize } from '../retrieval/bm25'

export const PASSAGE_STAGES = ['source', 'capture', 'interpretation', 'record', 'since'] as const
export type PassageStage = (typeof PASSAGE_STAGES)[number]
export const CONTRIBUTION_STAGES = ['written', 'recorded', 'responds', 'published'] as const
export type ContributionStage = (typeof CONTRIBUTION_STAGES)[number]

/** recorded: every fact shown was recorded; partial: some facts are missing; absent: nothing recorded for this stage. */
export type StageState = 'recorded' | 'partial' | 'absent'
export interface Fact { k: string; v: string; href?: string; external?: boolean }
export interface Stage<K extends string = string> {
  key: K; label: string; state: StageState; facts: Fact[]; unknown: string[]
  /** Replaces the generic state word where "not recorded" would misread, e.g. "not published". */
  stateWord?: string
}

export interface PassageCiting { contributionId: string; kind: string; author: string; createdAt: string; exact: boolean }

const NOT = 'not recorded'
const state = (facts: Fact[], unknown: string[]): StageState => (facts.length === 0 ? 'absent' : unknown.length ? 'partial' : 'recorded')
const objectKind = (id: string) => (id.startsWith('doc/') ? 'document' : id.startsWith('comment/') ? 'comment' : id.split('/')[0] ?? 'object')
const github = (url: string) => (/^https:\/\/github\.com\//.test(url) ? url : undefined)

export function passageLineage(problem: ImportedProblem, evidenceId: string, ctx: { hit?: SearchHit; query?: string; citing?: PassageCiting[] } = {}): Stage<PassageStage>[] | undefined {
  const e = problem.evidence.find((x) => x.id === evidenceId)
  if (!e) return undefined
  const s = e.source
  const stages: Stage<PassageStage>[] = []

  {
    const facts: Fact[] = [
      { k: 'Repository', v: manifest.repository, ...(github(manifest.url) ? { href: manifest.url, external: true } : {}) },
      { k: 'Object', v: `${s.objectId} (${objectKind(s.objectId)})` },
    ]
    const unknown: string[] = []
    if (s.author !== 'unknown') facts.push({ k: 'Written by', v: `@${s.author}` }); else unknown.push(`Author: ${NOT} for this ${objectKind(s.objectId)}.`)
    if (s.sourceTime) facts.push({ k: 'Written at', v: s.sourceTime.slice(0, 10) }); else unknown.push(`Time written: ${NOT}.`)
    const href = github(s.permalink)
    if (href) facts.push({ k: 'Original', v: 'open on GitHub', href, external: true }); else unknown.push('No public link to the original.')
    stages.push({ key: 'source', label: 'Original source', state: state(facts, unknown), facts, unknown })
  }
  {
    const facts: Fact[] = [
      { k: 'Snapshot', v: `${s.snapshotId}, captured ${s.retrievedAt.slice(0, 10)}` },
      { k: 'Repository state', v: `${manifest.revision.slice(0, 12)} of ${manifest.revisionDate.slice(0, 10)}` },
      { k: 'Method', v: manifest.method },
    ]
    const unknown: string[] = []
    if (s.locator) facts.push({ k: 'Passage location', v: s.locator }); else unknown.push(`Passage location inside the ${objectKind(s.objectId)}: ${NOT}.`)
    if (s.digest) facts.push({ k: 'Text fingerprint at capture', v: `sha256 ${s.digest.slice(0, 16)}… (of the whole ${objectKind(s.objectId)}, not the passage)` })
    else unknown.push(`Text fingerprint: ${NOT}.`)
    if (s.availability !== 'captured') unknown.push('The full text is not stored here, so this Commons cannot re-check the quote against it. Follow the original.')
    unknown.push('Whether the original changed after the capture is not checked live.')
    stages.push({ key: 'capture', label: 'Captured', state: state(facts, unknown), facts, unknown })
  }
  {
    const facts: Fact[] = [
      { k: 'Written by', v: `${problem.provenance.authoredBy} (record writer, not the source author)` },
      { k: 'Review', v: problem.provenance.review === 'unreviewed' ? 'not reviewed by a person' : 'reviewed' },
      { k: 'Role given', v: `${e.role} (the record writer's label)` },
      { k: 'Ported from', v: `Postack commit ${problem.provenance.originCommit.slice(0, 12)}` },
    ]
    const unknown: string[] = []
    if (e.quote) facts.push({ k: 'Quote kept', v: `“${e.quote}”` }); else unknown.push('No verbatim quote was kept for this passage.')
    if (e.interpretation) facts.push({ k: 'Reading', v: e.interpretation }); else unknown.push('The record writer wrote no reading of this passage.')
    stages.push({ key: 'interpretation', label: 'Interpreted', state: state(facts, unknown), facts, unknown })
  }
  {
    const facts: Fact[] = [{ k: 'Record', v: `${problem.title} (${problem.postackId})`, href: appLinks.problem(problem.postackId) }]
    const corrections = problem.corrections.filter((c) => c.evidenceIds.includes(e.id))
    for (const c of corrections) facts.push({ k: 'Supports a correction', v: c.note })
    for (const r of problem.related.filter((r) => r.evidenceIds.includes(e.id))) {
      facts.push({ k: 'Supports a relation', v: `${r.relation} → ${r.problemId} (${r.origin === 'source' ? 'stated in the source' : 'proposed by the record writer, unreviewed'})`, href: appLinks.problem(r.problemId) })
    }
    facts.push({ k: 'In search', v: e.quote ? `the quoted words are indexed (weight ${RECORD_WEIGHTS.quote}); the reading is not indexed` : 'nothing from this passage is indexed' })
    if (ctx.hit && ctx.query && e.quote) {
      const words = new Set(tokenize(e.quote))
      const here = [...new Set(ctx.hit.matches.filter((m) => m.field === 'quote' && words.has(m.term)).map((m) => m.term))]
      facts.push({ k: 'For your words', v: here.length ? `this quote matched ${here.map((t) => `“${t}”`).join(', ')}` : 'this quote did not contribute to the match' })
    }
    stages.push({ key: 'record', label: 'In the record', state: 'recorded', facts, unknown: [] })
  }
  {
    const citing = ctx.citing ?? []
    const facts: Fact[] = citing.map((c) => ({ k: c.exact ? 'Cites this passage' : 'Cites its whole source', v: `${c.kind} by ${c.author}, ${c.createdAt.slice(0, 10)}`, href: appLinks.contribution(c.contributionId) }))
    const unknown = citing.length ? [] : ['No contribution in this room cites this passage or its source yet.']
    stages.push({ key: 'since', label: 'Since, in this room', state: citing.length ? 'recorded' : 'absent', ...(citing.length ? { stateWord: `${citing.length} contribution${citing.length === 1 ? '' : 's'}` } : { stateWord: 'none yet' }), facts, unknown })
  }
  return stages
}

/** A reference as a fact: local contributions link inside the app; sources and AT records are named. */
function refFact(k: string, r: Ref): Fact {
  if (r.kind === 'local') return { k, v: r.id, href: appLinks.contribution(r.id) }
  if (r.kind === 'source') return { k, v: `source ${r.objectId}` }
  return { k, v: r.uri }
}

export function contributionLineage(c: CommonsContribution): Stage<ContributionStage>[] {
  const stages: Stage<ContributionStage>[] = []
  {
    const facts: Fact[] = [
      { k: 'Entrance', v: c.origin.kind === 'atproto' ? 'an ATProto repository, read into this room' : c.entrance },
      { k: 'Prepared', v: c.assistance.declared === 'none' ? 'by the participant, no AI (declared)' : `${c.assistance.declared} (declared)` },
    ]
    const unknown = ['How it was prepared is the author’s declaration; the Commons does not verify it.']
    if (c.observedAt) facts.push({ k: 'Observed at', v: c.observedAt.slice(0, 10) })
    stages.push({ key: 'written', label: 'Written', state: 'partial', facts, unknown })
  }
  {
    const facts: Fact[] = [
      { k: 'Room', v: c.roomId },
      { k: 'Speaks as', v: `${c.actor.displayName ?? c.actor.id} (${c.actor.kind})` },
      { k: 'Recorded', v: `${c.createdAt.slice(0, 16).replace('T', ' ')} UTC, revision ${c.revision}` },
    ]
    if (c.origin.kind === 'atproto') {
      facts.push({ k: 'Read from', v: `${c.origin.handle ?? c.origin.did} · ${c.origin.uri}` }, { k: 'Retrieved', v: `${c.origin.retrievedAt.slice(0, 10)} (${c.origin.availability})` })
    }
    stages.push({ key: 'recorded', label: 'Recorded here', state: 'recorded', facts, unknown: [] })
  }
  {
    const facts: Fact[] = []
    for (const id of c.evidenceIds ?? []) facts.push({ k: 'Cites passage', v: `${id} of ${c.problemId}`, href: appLinks.problem(c.problemId, undefined, { passage: id }) })
    for (const r of c.sourceRefs) facts.push({ k: 'Cites source', v: r.objectId, ...(github(r.permalink) ? { href: github(r.permalink)!, external: true } : {}) })
    if (c.parent) facts.push(refFact('Replies to', c.parent))
    if (c.contradicts) facts.push(refFact('Corrects', c.contradicts))
    if (c.supersedes) facts.push(refFact('Supersedes', c.supersedes))
    stages.push({ key: 'responds', label: 'Responds to', state: facts.length ? 'recorded' : 'absent', facts, unknown: facts.length ? [] : ['It cites no source and responds to no contribution.'] })
  }
  {
    const p = c.publication
    const facts: Fact[] = p ? [
      { k: 'Status', v: p.status },
      { k: 'Repository', v: p.handle ?? p.did },
      ...(p.uri ? [{ k: 'Record', v: p.uri }] : []),
      { k: 'Attempts', v: String(p.attempts) },
    ] : []
    const unknown = p ? (p.status === 'published' ? [] : [`Not confirmed as published: status is “${p.status}”.`]) : ['Not published. Publishing to an ATProto repository is a separate, explicit step.']
    stages.push({ key: 'published', label: 'Published', state: p ? (p.status === 'published' ? 'recorded' : 'partial') : 'absent', stateWord: p ? p.status : 'not published', facts, unknown })
  }
  return stages
}
