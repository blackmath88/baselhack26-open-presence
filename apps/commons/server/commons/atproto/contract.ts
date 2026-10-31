/**
 * ATProto adapter contract (coordinator-owned; Packet B implements it in this
 * directory). The Commons service (`../service.ts`) only talks to these types,
 * so the adapter can be exercised against an isolated local PDS, against
 * fixtures, or not at all, without the service knowing which.
 *
 * Nothing here writes to a public account: a session provider yields whatever
 * disposable development identity is configured for a local participant, and
 * every network endpoint goes through an explicit allowlist.
 */
import type { CommonsContribution, ExternalAvailability, Ref } from '../../../src/commons/contracts.js'

/** Lexicon namespace. Development default only; production requires a verified-owned NSID authority. */
export interface AtprotoNamespace {
  /** e.g. `test.openpresence.commons` → records `<ns>.contribution`. */
  authority: string
  contributionCollection: string
}

/** What the publisher needs to build one record from a local contribution. */
export interface RecordBuildInput {
  contribution: CommonsContribution
  /** Canonical absolute app URL of the problem, e.g. http://localhost:5173/#/problems/usb-c-no-data */
  problemUrl: string
  /** Pinned source repository identity for the problem's evidence. */
  source: { repository: string; revision: string; snapshotId: string }
  /** Resolved AT references for parent/supersedes/contradicts, when those targets have been published. */
  resolved: { parent?: { uri: string; cid: string }; supersedes?: { uri: string; cid: string }; contradicts?: { uri: string; cid: string } }
}

export interface BuiltRecord {
  collection: string
  record: Record<string, unknown>
  /** sha256 over the canonical JSON of `record`; the content binding for intents and receipts. */
  digest: string
}

/** A validated, parsed remote contribution record. Never trusted content: a projection input. */
export interface ParsedContributionRecord {
  kind: CommonsContribution['kind']
  text: string
  circumstances?: string
  problem: { appUrl: string; localId: string; repository: string; revision?: string }
  sourceRefs: Array<{ objectId: string; permalink: string; digest?: string }>
  assistance: CommonsContribution['assistance']
  createdAt: string
  observedAt?: string
  parent?: Ref
  supersedes?: Ref
  contradicts?: Ref
  /** The publishing app's own identity for the record, used to reconcile self-publication. */
  origin?: { app: string; localId: string; revision: number }
}

export type ParseResult = { ok: true; value: ParsedContributionRecord } | { ok: false; reason: string }

export interface AtprotoSession {
  did: string
  handle?: string
  service: string
}

/**
 * Resolves a local actor to the ATProto identity they may publish as. Never
 * accepts a caller-provided DID; the mapping is server configuration.
 */
export interface AtprotoSessionProvider {
  /** undefined: this participant has no connected account (an actionable state, not an error). */
  sessionFor(actorId: string): Promise<AtprotoSession | undefined>
  /** Human-readable activation state for UI/CLI, with no secrets. */
  describe(): { mode: 'credentials' | 'oauth' | 'none'; configured: string[]; note: string }
}

export interface PublishRequest {
  actorId: string
  /** Persisted preview destination. Check against the actual session before any record I/O. */
  expectedSession?: Pick<AtprotoSession, 'did' | 'service'>
  collection: string
  rkey: string
  record: Record<string, unknown>
  digest: string
}

export type PublishOutcome =
  | { outcome: 'created'; uri: string; cid: string; did: string }
  /** Found an identical record already at this key (an earlier attempt succeeded past a timeout). */
  | { outcome: 'existing'; uri: string; cid: string; did: string }
  /** A different record sits at this key; never overwrite. */
  | { outcome: 'conflict'; uri: string; cid: string; did: string }
  /** Transport failure; the key must be reused on retry. */
  | { outcome: 'unreachable'; error: string }

export interface AtprotoPublisher {
  /** getRecord(rkey) first, then createRecord with that rkey. Idempotent by construction. */
  reconcileOrCreate(request: PublishRequest): Promise<PublishOutcome>
}

export interface RemoteRecord {
  uri: string
  cid: string
  did: string
  collection: string
  rkey: string
  value: unknown
}

export type FetchResult =
  | { status: 'found'; record: RemoteRecord; pdsEndpoint: string; handle?: string }
  | { status: 'missing'; pdsEndpoint: string }
  | { status: 'unreachable'; error: string }
  | { status: 'refused'; reason: string }

export interface ListPage {
  records: RemoteRecord[]
  cursor?: string
}

export type ListResult =
  | { status: 'page'; page: ListPage; pdsEndpoint: string; handle?: string }
  | { status: 'unreachable'; error: string }
  | { status: 'refused'; reason: string }

export interface AtprotoReader {
  /** Resolves a DID (or handle) to its PDS endpoint; refuses endpoints outside the allowlist. */
  resolveIdentity(didOrHandle: string): Promise<{ did: string; handle?: string; pdsEndpoint: string } | { refused: string } | { unreachable: string }>
  getRecord(uri: string): Promise<FetchResult>
  listRecords(did: string, collection: string, cursor?: string, limit?: number): Promise<ListResult>
}

export interface AtprotoAdapter {
  namespace: AtprotoNamespace
  buildRecord(input: RecordBuildInput): BuiltRecord
  /** Validates against the committed Lexicon and size limits, then parses. */
  parseRecord(value: unknown): ParseResult
  sessions: AtprotoSessionProvider
  publisher: AtprotoPublisher
  reader: AtprotoReader
  /** For status pages: endpoint allowlist, PLC URL, namespace, configured accounts (no secrets). */
  describe(): { namespace: string; allowedPds: string[]; plcUrl?: string; sessions: ReturnType<AtprotoSessionProvider['describe']> }
}

export const availabilityFromFetch = (result: FetchResult): ExternalAvailability =>
  result.status === 'found' ? 'available' : result.status === 'missing' ? 'deleted' : 'unavailable'
