/**
 * Commons tools for MCP. Registered by the single factory in
 * `register-tools.ts`, so stdio and HTTP expose the same set. Every handler
 * calls the same `CommonsService` operation the HTTP routes and the CLI call;
 * the actor was resolved from the bearer token before any tool existed.
 */
import type { McpServer } from '@modelcontextprotocol/server'
import * as z from 'zod/v4'
import type { ActorContext } from '../auth/actor-context.js'
import { ASSISTANCE_DECLARATIONS, COMMONS_CONTRIBUTION_KINDS } from '../../src/commons/contracts.js'
import type { CommonsService } from '../commons/service.js'
import { fail, ok } from './register-tools.js'

const loose = z.looseObject({})
const readOnly = { readOnlyHint: true, idempotentHint: true, openWorldHint: false } as const
const mutating = { readOnlyHint: false, idempotentHint: true, openWorldHint: false } as const
const network = { readOnlyHint: false, idempotentHint: true, openWorldHint: true } as const

/** Zod yields `key?: T | undefined`; services take exact optionals. Dropping undefined keys bridges the two. */
type Compact<T> = { [K in keyof T as undefined extends T[K] ? never : K]: T[K] } & { [K in keyof T as undefined extends T[K] ? K : never]?: Exclude<T[K], undefined> }
const compact = <T extends object>(value: T): Compact<T> => Object.fromEntries(Object.entries(value).filter(([, v]) => v !== undefined)) as Compact<T>

const guard = async (run: () => Promise<unknown>) => {
  try { return ok((await run()) as Record<string, unknown>) } catch (error) { return fail(error) }
}

export function registerCommonsTools(server: McpServer, commons: CommonsService, actor: ActorContext): void {
  server.registerTool('commons_search', {
    title: 'Search the Commons',
    description: 'Search agent-written problem records over the pinned photo-frame snapshot AND local/ingested contributions. Returns stable ids, match reasons and coverage; ranking is lexical, not confidence.',
    inputSchema: z.object({ query: z.string().min(1).max(500), limit: z.number().int().min(1).max(50).optional(), include: z.array(z.enum(['problems', 'contributions'])).optional() }),
    outputSchema: z.object({ query: z.string(), problems: z.array(loose), contributions: z.array(loose), coverage: loose, note: z.string() }),
    annotations: readOnly,
  }, async (input) => guard(() => commons.search(actor, compact(input))))

  server.registerTool('commons_browse_repository', {
    title: 'Browse the source repository snapshot',
    description: 'Navigate the pinned source repository (paths, threads) and see which problem records and which visible community contributions (with author and entrance) cite each file or thread. Bounded snapshot metadata, not a live GitHub browser; coverage is disclosed.',
    inputSchema: z.object({ path: z.string().max(500).optional(), object: z.string().max(100).optional().describe('e.g. issue/99, pull/113'), type: z.enum(['issue', 'pull', 'discussion']).optional(), cursor: z.string().optional(), limit: z.number().int().min(1).max(200).optional(), linkedOnly: z.boolean().optional() }),
    outputSchema: z.object({ view: z.string(), coverage: loose, problems: z.number() }).and(loose),
    annotations: readOnly,
  }, async (input) => guard(() => commons.browseRepository(actor, compact(input))))

  server.registerTool('commons_list_problems', {
    title: 'List Commons problems',
    description: 'All imported problem records with their room ids and contribution counts.',
    inputSchema: z.object({}),
    outputSchema: z.object({ problems: z.array(loose) }),
    annotations: readOnly,
  }, async () => guard(async () => ({ problems: await commons.listProblems(actor) })))

  server.registerTool('commons_get_problem', {
    title: 'Get a Commons problem',
    description: 'One problem record with its evidence (quotes vs record-writer interpretation), every attributed contribution, related problems and publication summary. Same ids as the UI and CLI.',
    inputSchema: z.object({ problemId: z.string().min(1) }),
    outputSchema: z.object({ problem: loose, roomId: z.string(), contributions: z.array(loose) }).and(loose),
    annotations: readOnly,
  }, async ({ problemId }) => guard(() => commons.getProblem(actor, problemId)))

  server.registerTool('commons_get_contribution', {
    title: 'Get a contribution',
    description: 'One contribution with author, assistance declaration, revision, source refs, origin (local or ATProto) and publication state. Moderated or deleted records return a minimal unavailable body.',
    inputSchema: z.object({ contributionId: z.string().min(1) }),
    outputSchema: loose,
    annotations: readOnly,
  }, async ({ contributionId }) => guard(() => commons.getContribution(actor, contributionId)))

  server.registerTool('commons_get_thread', {
    title: 'Get a conversation thread',
    description: 'The conversation around a contribution: replies and corrections as a tree, both voices preserved, with the participants list.',
    inputSchema: z.object({ contributionId: z.string().min(1) }),
    outputSchema: z.object({ root: loose, participants: z.array(z.string()), problemId: z.string() }).and(loose),
    annotations: readOnly,
  }, async ({ contributionId }) => guard(() => commons.getThread(actor, contributionId)))

  server.registerTool('commons_get_context', {
    title: 'Get agent context',
    description: 'Deterministic, budgeted context packet for a problem or contribution: sources, evidence, contributions with revisions, omissions, freshness and limitations. Not an answer; a bounded record of what is known and by whom.',
    inputSchema: z.object({ problemId: z.string().optional(), contributionId: z.string().optional(), budget: z.number().int().min(1000).max(60000).optional() }),
    outputSchema: z.object({ target: loose, omissions: z.array(z.string()), limitations: z.array(z.string()) }).and(loose),
    annotations: readOnly,
  }, async (input) => guard(() => commons.getContext(actor, compact(input))))

  const contributionInput = z.object({
    problemId: z.string().min(1),
    text: z.string().min(1).max(8000),
    kind: z.enum(COMMONS_CONTRIBUTION_KINDS as [string, ...string[]]).optional(),
    circumstances: z.string().max(2000).optional(),
    sourceRefs: z.array(z.string()).max(50).optional().describe('objectIds from the problem evidence, e.g. issue/99'),
    evidenceIds: z.array(z.string()).max(50).optional().describe('Exact evidence passages of the problem record, e.g. e2; their source objects are cited too.'),
    assistance: z.enum(ASSISTANCE_DECLARATIONS as [string, ...string[]]).optional(),
    preparedBy: z.string().max(200).optional().describe('Model or agent that drafted the text.'),
    parentId: z.string().optional().describe('Reply target: a contribution id or an ingested at:// URI in the same problem.'),
    supersedesId: z.string().optional(),
    contradictsId: z.string().optional(),
    observedAt: z.string().optional(),
  })

  server.registerTool('commons_prepare_contribution', {
    title: 'Prepare a contribution',
    description: 'Validate a contribution and see exactly what would be recorded and where (local shared room; not GitHub, not ATProto). Writes nothing. Returns the normalized command with a commandId to pass to commons_submit_contribution.',
    inputSchema: contributionInput,
    outputSchema: z.object({ ok: z.boolean(), errors: z.array(z.string()), warnings: z.array(z.string()), destination: loose }).and(loose),
    annotations: readOnly,
  }, async (input) => guard(() => commons.prepareContribution(actor, compact(input))))

  server.registerTool('commons_submit_contribution', {
    title: 'Submit a contribution',
    description: 'Record one attributed contribution in the local shared room on behalf of the authenticated participant. Idempotent by commandId: the same key with the same content replays (replayed: true); the same key with other content conflicts. Declare assistance honestly; it is recorded, never detected.',
    inputSchema: contributionInput.extend({ commandId: z.string().min(1).max(200) }),
    outputSchema: z.object({ contribution: loose, contributionId: z.string(), problemId: z.string(), replayed: z.boolean() }).and(loose),
    annotations: mutating,
  }, async (input) => guard(() => commons.submitContribution(actor, { ...compact(input), entrance: 'mcp' } as never)))

  server.registerTool('commons_moderate', {
    title: 'Local moderation',
    description: 'Hide/unhide a contribution or block/unblock an author locally. Affects every projection here (UI, search, context, MCP); never changes the author\'s own record elsewhere. A review act recorded against this participant.',
    inputSchema: z.object({ commandId: z.string().min(1), action: z.enum(['hide', 'unhide', 'block', 'unblock']), contributionId: z.string().optional(), authorId: z.string().optional(), reason: z.string().max(1000).optional() }),
    outputSchema: loose,
    annotations: mutating,
  }, async (input) => guard(() => commons.moderate(actor, compact(input))))

  server.registerTool('commons_prepare_publication', {
    title: 'Prepare an ATProto publication',
    description: 'Build the exact ATProto record for one of YOUR contributions and a content-bound intent (payload digest, account, revision, expiry). Writes nothing to any network. If no development account is connected, returns ready:false with activation steps.',
    inputSchema: z.object({ contributionId: z.string().min(1) }),
    outputSchema: z.object({ ready: z.boolean() }).and(loose),
    annotations: readOnly,
  }, async ({ contributionId }) => guard(() => commons.preparePublication(actor, { contributionId })))

  server.registerTool('commons_publish_contribution', {
    title: 'Publish a prepared contribution',
    description: 'Explicitly publish a previously prepared intent to the author\'s own ATProto repository through the durable outbox. Returns a receipt: queued/publishing/published/failed/conflict. Only call after the participant has reviewed the preview.',
    inputSchema: z.object({ intentId: z.string().min(1) }),
    outputSchema: z.object({ receipt: loose, drained: z.number() }),
    annotations: network,
  }, async ({ intentId }) => guard(() => commons.publishContribution(actor, { intentId })))

  server.registerTool('commons_get_publication', {
    title: 'Get publication state',
    description: 'Transport receipt and observed remote versions for a contribution (local, queued, published, failed, conflict, stale, unavailable).',
    inputSchema: z.object({ contributionId: z.string().min(1) }),
    outputSchema: z.object({ contributionId: z.string(), receipt: loose.nullable(), observed: z.array(loose) }),
    annotations: readOnly,
  }, async ({ contributionId }) => guard(() => commons.getPublication(actor, contributionId)))

  server.registerTool('commons_sync_author', {
    title: 'Sync an ATProto author',
    description: 'Bounded, paginated read of one opted-in author\'s contribution records from their PDS (allowlisted endpoints only), ingesting them into the same rooms with DID, CID and revision intact. An interrupted scan is partial, not deletion.',
    inputSchema: z.object({ did: z.string().min(1).describe('DID or handle'), maxPages: z.number().int().min(1).max(100).optional() }),
    outputSchema: z.object({ did: z.string(), status: z.string(), pages: z.number(), records: z.number(), outcomes: loose }).and(loose),
    annotations: network,
  }, async (input) => guard(() => commons.syncAuthor(actor, compact(input))))

  server.registerTool('commons_resolve_external', {
    title: 'Resolve an external record',
    description: 'Fetch and validate one at:// contribution record from its author\'s PDS and ingest it (deduplicated by URI/CID). Missing means deleted; unreachable means stale, not deleted.',
    inputSchema: z.object({ uri: z.string().min(1) }),
    outputSchema: z.object({ uri: z.string(), status: z.string() }).and(loose),
    annotations: network,
  }, async ({ uri }) => guard(() => commons.resolveExternal(actor, { uri })))

  server.registerTool('commons_status', {
    title: 'Commons status',
    description: 'Schema version, ATProto configuration (no secrets), outbox and sync state, moderation counts.',
    inputSchema: z.object({}),
    outputSchema: loose,
    annotations: readOnly,
  }, async () => guard(() => commons.status(actor)))
}

export const COMMONS_TOOL_NAMES = [
  'commons_search', 'commons_browse_repository', 'commons_list_problems', 'commons_get_problem', 'commons_get_contribution',
  'commons_get_thread', 'commons_get_context', 'commons_prepare_contribution', 'commons_submit_contribution', 'commons_moderate',
  'commons_prepare_publication', 'commons_publish_contribution', 'commons_get_publication', 'commons_sync_author',
  'commons_resolve_external', 'commons_status',
] as const
