/**
 * ATProto adapter — Packet B. Implements `./contract.ts` with the official
 * `@atproto/api` client, `@atproto/lexicon` validation and `@atproto/identity`
 * resolution. No `process.env` reads: the coordinator passes plain config.
 *
 * Guarantees this file keeps:
 *   - identity comes from server configuration (`accounts`), never from a call;
 *   - the publisher reads before it writes and never overwrites a record;
 *   - every network endpoint is checked against `allowedPds`; a DID whose
 *     document points elsewhere is refused, not fetched;
 *   - a transport failure is reported as `unreachable`, which the caller must
 *     treat as "unknown", never as "not published".
 */
import { createHash } from 'node:crypto'
import { AtpAgent, type ComAtprotoRepoListRecords } from '@atproto/api'
import { Lexicons, type LexiconDoc, ValidationError } from '@atproto/lexicon'
import { IdResolver } from '@atproto/identity'
import { getHandle, getPdsEndpoint } from '@atproto/common-web'
import { AtUri, ensureValidDid, ensureValidHandle, ensureValidNsid, isValidDid, isValidHandle } from '@atproto/syntax'
import { XRPCError } from '@atproto/xrpc'
import defsDoc from '../../../lexicons/test/openpresence/commons/defs.json' with { type: 'json' }
import contributionDoc from '../../../lexicons/test/openpresence/commons/contribution.json' with { type: 'json' }
import type { AssistanceDeclaration, CommonsContributionKind } from '../../../src/commons/contracts.js'
import { ASSISTANCE_DECLARATIONS, COMMONS_CONTRIBUTION_KINDS } from '../../../src/commons/contracts.js'
import type {
  AtprotoAdapter, AtprotoNamespace, AtprotoPublisher, AtprotoReader, AtprotoSession, AtprotoSessionProvider,
  BuiltRecord, FetchResult, ListResult, ParseResult, ParsedContributionRecord, PublishOutcome, PublishRequest,
  RecordBuildInput, RemoteRecord,
} from './contract.js'

/** The namespace the committed Lexicon files are written in. Development only. */
export const DEFAULT_NAMESPACE = 'test.openpresence.commons'
/** Frozen record schema version; bump with the Lexicon, never silently. */
export const CONTRIBUTION_SCHEMA_VERSION = 1
/** Hard caps enforced in addition to the Lexicon, so a bad remote record is rejected cheaply. */
export const LIMITS = { textBytes: 32_000, circumstancesBytes: 4_000, sourceRefs: 50, recordBytes: 64_000, listLimit: 100 } as const

const STRONG_REF_DOC: LexiconDoc = {
  lexicon: 1,
  id: 'com.atproto.repo.strongRef',
  description: 'A URI with a content-hash fingerprint.',
  defs: { main: { type: 'object', required: ['uri', 'cid'], properties: { uri: { type: 'string', format: 'at-uri' }, cid: { type: 'string', format: 'cid' } } } },
}

export interface AtprotoAccountCredentials { service: string; identifier: string; password: string }

export interface AtprotoAdapterConfig {
  /** NSID authority for the records, e.g. `test.openpresence.commons`. Defaults to the development namespace. */
  namespace?: string
  /** PDS origins this app may talk to. Anything else is refused. */
  allowedPds: string[]
  /** PLC directory for did:plc resolution. Unset means the public directory is NOT contacted; did:plc then resolve only via allowlisted PDS session data. */
  plcUrl?: string
  /** Local actor → disposable development account. Server configuration, never caller input. */
  accounts: Record<string, AtprotoAccountCredentials>
  /** Identifier written into `origin.app`, so this app recognises its own publications. */
  appId: string
  fetch?: typeof fetch
  timeoutMs?: number
}

// --- helpers -----------------------------------------------------------------

export function canonicalJson(value: unknown): string {
  const canonical = (v: unknown): unknown => Array.isArray(v) ? v.map(canonical)
    : v !== null && typeof v === 'object'
      ? Object.fromEntries(Object.entries(v as Record<string, unknown>).filter(([, x]) => x !== undefined).sort(([a], [b]) => a.localeCompare(b)).map(([k, x]) => [k, canonical(x)]))
      : v
  return JSON.stringify(canonical(value))
}

export const sha256Hex = (text: string): string => createHash('sha256').update(text).digest('hex')

/** TID record keys: 53-bit microsecond timestamp + 10-bit clock id, base32-sortable, 13 chars. */
const TID_ALPHABET = '234567abcdefghijklmnopqrstuvwxyz'
let lastTidMicros = 0n
const clockId = BigInt(Math.floor(Math.random() * 1024))
export function nextTid(): string {
  let micros = BigInt(Date.now()) * 1000n
  if (micros <= lastTidMicros) micros = lastTidMicros + 1n
  lastTidMicros = micros
  let n = (micros << 10n) | clockId
  let out = ''
  for (let i = 0; i < 13; i++) { out = TID_ALPHABET[Number(n & 31n)] + out; n >>= 5n }
  return out
}

const normalizeOrigin = (url: string): string | undefined => {
  try { return new URL(url).origin } catch { return undefined }
}

const errorText = (error: unknown): string => error instanceof Error ? `${error.name}: ${error.message}` : String(error)

function withTimeout(base: typeof fetch, timeoutMs: number): typeof fetch {
  return (input, init) => {
    const signal = init?.signal ? AbortSignal.any([init.signal, AbortSignal.timeout(timeoutMs)]) : AbortSignal.timeout(timeoutMs)
    return base(input, { ...init, signal })
  }
}

function renamespace(doc: unknown, namespace: string): LexiconDoc {
  const text = JSON.stringify(doc)
  return JSON.parse(namespace === DEFAULT_NAMESPACE ? text : text.split(DEFAULT_NAMESPACE).join(namespace)) as LexiconDoc
}

function isXrpc(error: unknown, name: string): boolean {
  return error instanceof XRPCError && error.error === name
}

// --- adapter -----------------------------------------------------------------

export function createAtprotoAdapter(config: AtprotoAdapterConfig): AtprotoAdapter {
  const authority = config.namespace ?? DEFAULT_NAMESPACE
  ensureValidNsid(`${authority}.contribution`)
  const namespace: AtprotoNamespace = { authority, contributionCollection: `${authority}.contribution` }
  const lexicons = new Lexicons([STRONG_REF_DOC, renamespace(defsDoc, authority), renamespace(contributionDoc, authority)])
  const allowed = new Set(config.allowedPds.map(normalizeOrigin).filter((o): o is string => Boolean(o)))
  const timeoutMs = config.timeoutMs ?? 10_000
  const baseFetch = withTimeout(config.fetch ?? globalThis.fetch, timeoutMs)
  const isAllowed = (endpoint: string) => { const o = normalizeOrigin(endpoint); return Boolean(o && allowed.has(o)) }

  // Resolution: did:plc through the configured directory only; did:web through fetch (then allowlisted).
  const idResolver = new IdResolver({ timeout: timeoutMs, fetch: baseFetch as never, ...(config.plcUrl ? { plcUrl: config.plcUrl } : {}) })
  const publicAgent = (service: string) => new AtpAgent({ service, fetch: baseFetch })

  // ---- build / parse --------------------------------------------------------

  function buildRecord(input: RecordBuildInput): BuiltRecord {
    const c = input.contribution
    const strong = (ref?: { uri: string; cid: string }) => ref ? { uri: ref.uri, cid: ref.cid } : undefined
    const record: Record<string, unknown> = {
      $type: namespace.contributionCollection,
      kind: c.kind,
      text: c.text,
      ...(c.circumstances ? { circumstances: c.circumstances } : {}),
      problem: { appUrl: input.problemUrl, localId: c.problemId, repository: input.source.repository, revision: input.source.revision },
      sourceRefs: c.sourceRefs.slice(0, LIMITS.sourceRefs).map(s => ({ objectId: s.objectId, permalink: s.permalink, ...(s.digest ? { digest: s.digest } : {}) })),
      assistance: { declared: c.assistance.declared, ...(c.assistance.preparedBy ? { preparedBy: c.assistance.preparedBy } : {}) },
      createdAt: c.createdAt,
      ...(c.observedAt ? { observedAt: c.observedAt } : {}),
      ...(strong(input.resolved.parent) ? { parent: strong(input.resolved.parent) } : {}),
      ...(strong(input.resolved.supersedes) ? { supersedes: strong(input.resolved.supersedes) } : {}),
      ...(strong(input.resolved.contradicts) ? { contradicts: strong(input.resolved.contradicts) } : {}),
      origin: { app: config.appId, localId: c.id, revision: c.revision },
    }
    lexicons.assertValidRecord(namespace.contributionCollection, record)
    const canonical = canonicalJson(record)
    if (Buffer.byteLength(canonical) > LIMITS.recordBytes) throw new ValidationError(`Record exceeds ${LIMITS.recordBytes} bytes.`)
    return { collection: namespace.contributionCollection, record: JSON.parse(canonical) as Record<string, unknown>, digest: sha256Hex(canonical) }
  }

  function parseRecord(value: unknown): ParseResult {
    try {
      if (!value || typeof value !== 'object' || Array.isArray(value)) return { ok: false, reason: 'Record is not an object.' }
      const raw = value as Record<string, unknown>
      if (raw.$type !== namespace.contributionCollection) return { ok: false, reason: `Unexpected $type ${String(raw.$type)}; expected ${namespace.contributionCollection}.` }
      if (Buffer.byteLength(JSON.stringify(raw)) > LIMITS.recordBytes) return { ok: false, reason: `Record exceeds ${LIMITS.recordBytes} bytes.` }
      const result = lexicons.validate(namespace.contributionCollection, raw)
      if (!result.success) return { ok: false, reason: result.error.message }
      const r = result.value as Record<string, unknown>
      const kind = r.kind as string
      if (!(COMMONS_CONTRIBUTION_KINDS as string[]).includes(kind)) return { ok: false, reason: `Unknown kind "${kind}".` }
      const text = r.text as string
      if (Buffer.byteLength(text) > LIMITS.textBytes) return { ok: false, reason: 'text too long.' }
      const circumstances = r.circumstances as string | undefined
      if (circumstances !== undefined && Buffer.byteLength(circumstances) > LIMITS.circumstancesBytes) return { ok: false, reason: 'circumstances too long.' }
      const assistance = r.assistance as { declared: string; preparedBy?: string }
      if (!(ASSISTANCE_DECLARATIONS as string[]).includes(assistance.declared)) return { ok: false, reason: `Unknown assistance declaration "${assistance.declared}".` }
      const sourceRefs = ((r.sourceRefs as Array<{ objectId: string; permalink: string; digest?: string }> | undefined) ?? [])
      if (sourceRefs.length > LIMITS.sourceRefs) return { ok: false, reason: 'Too many source references.' }
      const problem = r.problem as { appUrl: string; localId: string; repository: string; revision?: string }
      const strong = (v: unknown) => {
        if (!v || typeof v !== 'object') return undefined
        const s = v as { uri: string; cid: string }
        return { kind: 'atproto' as const, uri: s.uri, cid: s.cid }
      }
      const origin = r.origin as { app: string; localId: string; revision: number } | undefined
      const parsed: ParsedContributionRecord = {
        kind: kind as CommonsContributionKind,
        text,
        ...(circumstances !== undefined ? { circumstances } : {}),
        problem: { appUrl: problem.appUrl, localId: problem.localId, repository: problem.repository, ...(problem.revision !== undefined ? { revision: problem.revision } : {}) },
        sourceRefs: sourceRefs.map(s => ({ objectId: s.objectId, permalink: s.permalink, ...(s.digest !== undefined ? { digest: s.digest } : {}) })),
        assistance: { declared: assistance.declared as AssistanceDeclaration, ...(assistance.preparedBy !== undefined ? { preparedBy: assistance.preparedBy } : {}) },
        createdAt: r.createdAt as string,
        ...(r.observedAt !== undefined ? { observedAt: r.observedAt as string } : {}),
      }
      const parent = strong(r.parent), supersedes = strong(r.supersedes), contradicts = strong(r.contradicts)
      if (parent) parsed.parent = parent
      if (supersedes) parsed.supersedes = supersedes
      if (contradicts) parsed.contradicts = contradicts
      if (origin) parsed.origin = { app: origin.app, localId: origin.localId, revision: origin.revision }
      return { ok: true, value: parsed }
    } catch (error) {
      return { ok: false, reason: errorText(error) }
    }
  }

  // ---- sessions -------------------------------------------------------------

  const agents = new Map<string, Promise<AtpAgent>>()
  async function agentFor(actorId: string): Promise<AtpAgent | undefined> {
    const account = config.accounts[actorId]
    if (!account) return undefined
    if (!isAllowed(account.service)) throw new Error(`Configured service ${account.service} for ${actorId} is not in the PDS allowlist.`)
    let pending = agents.get(actorId)
    if (!pending) {
      pending = (async () => {
        const agent = new AtpAgent({ service: account.service, fetch: baseFetch })
        await agent.login({ identifier: account.identifier, password: account.password })
        return agent
      })()
      agents.set(actorId, pending)
      pending.catch(() => agents.delete(actorId))
    }
    return pending
  }

  const sessions: AtprotoSessionProvider = {
    async sessionFor(actorId): Promise<AtprotoSession | undefined> {
      const agent = await agentFor(actorId)
      if (!agent?.session) return undefined
      const session: AtprotoSession = { did: agent.session.did, service: config.accounts[actorId]!.service }
      return agent.session.handle ? { ...session, handle: agent.session.handle } : session
    },
    describe() {
      const configured = Object.keys(config.accounts).sort()
      return {
        mode: configured.length ? 'credentials' : 'none',
        configured,
        note: configured.length
          ? 'Credential sessions for disposable development accounts only. Real-user sign-in is an activation step: OAuth with the official @atproto/oauth-client-node (see server/commons/atproto/README.md).'
          : 'No ATProto account is connected for any participant. Publication is prepared locally and stays queued; nothing is sent. See server/commons/atproto/README.md to connect a development account.',
      }
    },
  }

  // ---- publisher ------------------------------------------------------------

  const publisher: AtprotoPublisher = {
    async reconcileOrCreate(request: PublishRequest): Promise<PublishOutcome> {
      let agent: AtpAgent | undefined
      try { agent = await agentFor(request.actorId) } catch (error) { return { outcome: 'unreachable', error: `login failed: ${errorText(error)}` } }
      if (!agent?.session) return { outcome: 'unreachable', error: `no connected account for ${request.actorId}` }
      const did = agent.session.did
      const expected = canonicalJson(request.record)
      // 1. Read first: an earlier attempt may have succeeded past a timeout.
      try {
        const existing = await agent.com.atproto.repo.getRecord({ repo: did, collection: request.collection, rkey: request.rkey })
        const same = canonicalJson(existing.data.value) === expected
        return { outcome: same ? 'existing' : 'conflict', uri: existing.data.uri, cid: existing.data.cid ?? '', did }
      } catch (error) {
        if (!isXrpc(error, 'RecordNotFound')) return { outcome: 'unreachable', error: `getRecord: ${errorText(error)}` }
      }
      // 2. Create at exactly this key. A retry reuses the key and lands in step 1.
      try {
        const created = await agent.com.atproto.repo.createRecord({ repo: did, collection: request.collection, rkey: request.rkey, record: request.record, validate: false })
        return { outcome: 'created', uri: created.data.uri, cid: created.data.cid, did }
      } catch (error) {
        return { outcome: 'unreachable', error: `createRecord: ${errorText(error)}` }
      }
    },
  }

  // ---- reader ---------------------------------------------------------------

  async function resolveHandleViaAllowedPds(handle: string): Promise<string | undefined> {
    for (const service of allowed) {
      try {
        const res = await publicAgent(service).com.atproto.identity.resolveHandle({ handle })
        if (res.data.did) return res.data.did
      } catch { /* try the next allowlisted PDS */ }
    }
    return undefined
  }

  const reader: AtprotoReader = {
    async resolveIdentity(didOrHandle) {
      let did = didOrHandle
      let handleHint: string | undefined
      if (!isValidDid(didOrHandle)) {
        if (!isValidHandle(didOrHandle)) return { refused: `"${didOrHandle}" is neither a DID nor a handle.` }
        ensureValidHandle(didOrHandle)
        handleHint = didOrHandle
        let resolved: string | undefined
        try { resolved = await idResolver.handle.resolve(didOrHandle) } catch { resolved = undefined }
        resolved ??= await resolveHandleViaAllowedPds(didOrHandle)
        if (!resolved) return { unreachable: `Handle ${didOrHandle} did not resolve through DNS/HTTP or any allowlisted PDS.` }
        did = resolved
      }
      try { ensureValidDid(did) } catch { return { refused: `Invalid DID ${did}.` } }
      if (!did.startsWith('did:plc:') && !did.startsWith('did:web:')) return { refused: `Unsupported DID method in ${did}.` }
      if (did.startsWith('did:plc:') && !config.plcUrl) return { refused: 'No PLC directory is configured; did:plc identities cannot be resolved.' }
      let doc
      try { doc = await idResolver.did.resolve(did, true) } catch (error) { return { unreachable: `DID resolution failed: ${errorText(error)}` } }
      if (!doc) return { unreachable: `DID document for ${did} not found.` }
      const pdsEndpoint = getPdsEndpoint(doc)
      if (!pdsEndpoint) return { refused: `DID document for ${did} declares no PDS.` }
      if (!isAllowed(pdsEndpoint)) return { refused: `PDS ${normalizeOrigin(pdsEndpoint) ?? pdsEndpoint} is not in the allowlist.` }
      const handle = getHandle(doc) ?? handleHint
      return { did, pdsEndpoint: normalizeOrigin(pdsEndpoint)!, ...(handle ? { handle } : {}) }
    },

    async getRecord(uri): Promise<FetchResult> {
      let at: AtUri
      try { at = new AtUri(uri) } catch { return { status: 'refused', reason: `Not an at:// URI: ${uri}` } }
      if (at.collection !== namespace.contributionCollection) return { status: 'refused', reason: `Collection ${at.collection} is not ${namespace.contributionCollection}.` }
      if (!at.rkey) return { status: 'refused', reason: 'URI names no record key.' }
      const identity = await reader.resolveIdentity(at.hostname)
      if ('refused' in identity) return { status: 'refused', reason: identity.refused }
      if ('unreachable' in identity) return { status: 'unreachable', error: identity.unreachable }
      try {
        const res = await publicAgent(identity.pdsEndpoint).com.atproto.repo.getRecord({ repo: identity.did, collection: at.collection, rkey: at.rkey })
        const record: RemoteRecord = { uri: res.data.uri, cid: res.data.cid ?? '', did: identity.did, collection: at.collection, rkey: at.rkey, value: res.data.value }
        return { status: 'found', record, pdsEndpoint: identity.pdsEndpoint, ...(identity.handle ? { handle: identity.handle } : {}) }
      } catch (error) {
        if (isXrpc(error, 'RecordNotFound')) return { status: 'missing', pdsEndpoint: identity.pdsEndpoint }
        return { status: 'unreachable', error: `getRecord: ${errorText(error)}` }
      }
    },

    async listRecords(did, collection, cursor, limit = 50): Promise<ListResult> {
      if (collection !== namespace.contributionCollection) return { status: 'refused', reason: `Collection ${collection} is not ${namespace.contributionCollection}.` }
      const identity = await reader.resolveIdentity(did)
      if ('refused' in identity) return { status: 'refused', reason: identity.refused }
      if ('unreachable' in identity) return { status: 'unreachable', error: identity.unreachable }
      const bounded = Math.max(1, Math.min(LIMITS.listLimit, Math.floor(limit)))
      try {
        const res = await publicAgent(identity.pdsEndpoint).com.atproto.repo.listRecords({ repo: identity.did, collection, limit: bounded, ...(cursor ? { cursor } : {}) })
        const records = res.data.records.map((r: ComAtprotoRepoListRecords.Record): RemoteRecord => {
          const parsed = new AtUri(r.uri)
          return { uri: r.uri, cid: r.cid, did: identity.did, collection: parsed.collection, rkey: parsed.rkey, value: r.value }
        })
        return { status: 'page', page: { records, ...(res.data.cursor ? { cursor: res.data.cursor } : {}) }, pdsEndpoint: identity.pdsEndpoint, ...(identity.handle ? { handle: identity.handle } : {}) }
      } catch (error) {
        return { status: 'unreachable', error: `listRecords: ${errorText(error)}` }
      }
    },
  }

  return {
    namespace,
    buildRecord,
    parseRecord,
    sessions,
    publisher,
    reader,
    describe: () => ({ namespace: authority, allowedPds: [...allowed], ...(config.plcUrl ? { plcUrl: config.plcUrl } : {}), sessions: sessions.describe() }),
  }
}
