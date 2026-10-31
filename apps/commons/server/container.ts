/**
 * Composition root — the one place that reads the environment and wires
 * adapters to ports.
 *
 * Below this line nothing knows whether it is running under HTTP, MCP-over-stdio,
 * MCP-over-HTTP or a test, which is what lets the integration test drive one
 * service instance through two transports at once.
 */
import { commonsReadRepository } from './commons/read-boundary.js'
import { createIdSource, highWaterMark, systemClock, type Clock, type IdSource } from './domain/events.js'
import { createJsonRepository, createMemoryRepository } from './persistence/json-repository.js'
import { ensureSeedData } from './persistence/seed.js'
import type { EventRepository, TransactionalEventRepository } from './persistence/repository.js'
import { createAiCurator, nullCurator, type Curator } from './curation/ai-curator.js'
import { createProblemService, type ProblemService } from './application/problem-service.js'
import { createContributionService, type ContributionService } from './application/contribution-service.js'
import { createCurationService, type CurationService } from './application/curation-service.js'
import { createOrchestrationService, type OrchestrationService } from './application/orchestration-service.js'
import { createImportService, type ImportService } from './application/import-service.js'
import { createPrototypeAuth, type PrototypeAuth } from './auth/prototype-auth.js'
import { createCommonsService, type CommonsService } from './commons/service.js'
import { createAtprotoAdapter } from './commons/atproto/index.js'
import type { AtprotoAdapter } from './commons/atproto/contract.js'
import type { ServiceDeps } from './application/support.js'
import type { OrchestrationMode } from './domain/types.js'
import { ORCHESTRATION_MODES } from './domain/types.js'

export interface Services {
  problems: ProblemService
  contributions: ContributionService
  curation: CurationService
  orchestration: OrchestrationService
  imports: ImportService
  auth: PrototypeAuth
  curator: Curator
  repository: EventRepository
  /** Present when the repository supports serialized transactions (local JSON / memory). */
  commons?: CommonsService
}

export interface BuildOptions {
  repository?: EventRepository
  clock?: Clock
  ids?: IdSource
  curator?: Curator
  auth?: PrototypeAuth
  /** Skip importing the prototype problem data. Tests that build their own history set this. */
  seed?: boolean
  /**
   * Mode for problems nobody has switched yet; see `ServiceDeps.defaultOrchestration`.
   * `null` means "the domain default, and do not read the environment" — what tests use.
   */
  defaultOrchestration?: OrchestrationMode | null
  /** ATProto adapter for the Commons service. `null` means "none, and do not read the environment" — what tests use. */
  atproto?: AtprotoAdapter | null
  /** Canonical app base URL for links inside published records. */
  appUrl?: string
}

/** Everything the Commons needs from the environment, in one place and with no secrets echoed. */
export function commonsConfigFromEnv(env: NodeJS.ProcessEnv = process.env) {
  const list = (value: string | undefined) => (value ?? '').split(',').map(s => s.trim()).filter(Boolean)
  let accounts: Record<string, { service: string; identifier: string; password: string }> = {}
  if (env.COMMONS_ATPROTO_ACCOUNTS) {
    try { accounts = JSON.parse(env.COMMONS_ATPROTO_ACCOUNTS) } catch { console.error('[commons] COMMONS_ATPROTO_ACCOUNTS is not valid JSON; ignoring it.') }
  }
  const allowedPds = list(env.COMMONS_ATPROTO_ALLOWED_PDS)
  const configured = allowedPds.length > 0 || Object.keys(accounts).length > 0
  return {
    appUrl: env.COMMONS_APP_URL ?? 'http://localhost:5173',
    appId: env.COMMONS_APP_ID ?? 'open-presence-commons',
    follow: list(env.COMMONS_ATPROTO_FOLLOW),
    atproto: configured
      ? createAtprotoAdapter({
          ...(env.COMMONS_ATPROTO_NAMESPACE ? { namespace: env.COMMONS_ATPROTO_NAMESPACE } : {}),
          allowedPds, ...(env.COMMONS_PLC_URL ? { plcUrl: env.COMMONS_PLC_URL } : {}), accounts, appId: env.COMMONS_APP_ID ?? 'open-presence-commons',
        })
      : undefined,
  }
}

/**
 * Builds a fully wired service set. Async because the id source is seeded from
 * the existing log's high-water mark — ids stay unique across restarts without
 * reaching for randomness, which is what keeps event streams reproducible.
 */
export async function buildServices(options: BuildOptions = {}): Promise<Services> {
  const repository =
    options.repository ??
    createJsonRepository({ file: process.env.BRAINSTORM_DATA_FILE ?? 'server/data/memory.json' })

  const clock = options.clock ?? systemClock
  const ids = options.ids ?? createIdSource(highWaterMark(await repository.read()))
  const curator = options.curator ?? defaultCurator()
  const auth = options.auth ?? createPrototypeAuth()

  if (options.seed !== false) {
    await ensureSeedData({ repository, clock, ids })
  }

  const defaultOrchestration =
    options.defaultOrchestration === undefined ? defaultOrchestrationFromEnv(curator) : options.defaultOrchestration
  const deps: ServiceDeps = { repository, clock, ids, curator, ...(defaultOrchestration ? { defaultOrchestration } : {}) }

  const envConfig = options.atproto === undefined || options.appUrl === undefined ? commonsConfigFromEnv() : undefined
  const atproto = options.atproto === undefined ? envConfig?.atproto : options.atproto ?? undefined
  const appUrl = options.appUrl ?? envConfig?.appUrl
  const commons = 'transaction' in repository
    ? createCommonsService({ repository: repository as TransactionalEventRepository, clock, ...(atproto ? { atproto } : {}), ...(appUrl ? { appUrl } : {}), ...(envConfig ? { appId: envConfig.appId } : {}) })
    : undefined
  const readDeps = commons ? { ...deps, repository: commonsReadRepository(repository as TransactionalEventRepository) } : deps
  const readOrchestration = createOrchestrationService(readDeps)
  const contributions = createContributionService(deps)
  const curation = createCurationService(deps)
  const orchestration = createOrchestrationService(deps)

  return {
    problems: createProblemService(readDeps),
    // Every transport (REST, MCP) gets these services. Writes to imported commons:* rooms
    // go through the serialized Commons transaction, so no transport can validate against
    // stale state; a retry by the same participant replays its prior review outcome.
    contributions: commons
      ? { ...contributions, add: (actor, input) => (input.problemId.startsWith('commons:') ? commons.addToRoom(actor, input) : contributions.add(actor, input)) }
      : contributions,
    curation: commons
      ? {
          ...curation,
          list: createCurationService(readDeps).list,
          accept: (actor, input) => (input.problemId.startsWith('commons:')
            ? commons.review(actor, { commandId: `review:${input.proposalId}:accept:${actor.actorId}`, proposalId: input.proposalId, problemId: input.problemId, decision: 'accept' }) as ReturnType<CurationService['accept']>
            : curation.accept(actor, input)),
          reject: (actor, input) => (input.problemId.startsWith('commons:')
            ? commons.review(actor, { commandId: `review:${input.proposalId}:reject:${actor.actorId}`, proposalId: input.proposalId, problemId: input.problemId, decision: 'reject', ...(input.reason !== undefined ? { reason: input.reason } : {}) }) as ReturnType<CurationService['reject']>
            : curation.reject(actor, input)),
        }
      : curation,
    orchestration: commons
      ? {
          ...orchestration,
          get: readOrchestration.get,
          context: readOrchestration.context,
          // Mode changes read the current mode; serialize them with other commons:* writes.
          setMode: (actor, input) => (input.problemId.startsWith('commons:')
            ? (repository as TransactionalEventRepository).transaction(tx => createOrchestrationService({ ...deps, repository: tx.repository }).setMode(actor, input))
            : orchestration.setMode(actor, input)),
        }
      : orchestration,
    imports: createImportService(deps),
    auth,
    curator,
    repository,
    ...(commons ? { commons } : {}),
  }
}

/**
 * `BRAINSTORM_DEFAULT_ORCHESTRATION=api` keeps the pre-v0.4 behaviour (server
 * curator on every contribution) for problems nobody has switched. Refused,
 * loudly, when there is no curator to run — a default that silently does
 * nothing would misreport where proposals come from.
 */
function defaultOrchestrationFromEnv(curator: Curator): OrchestrationMode | undefined {
  const value = process.env.BRAINSTORM_DEFAULT_ORCHESTRATION?.trim()
  if (!value) return undefined
  if (!(ORCHESTRATION_MODES as string[]).includes(value)) {
    console.error(`[br-ai-nstorm] ignoring BRAINSTORM_DEFAULT_ORCHESTRATION="${value}"; expected one of ${ORCHESTRATION_MODES.join(', ')}.`)
    return undefined
  }
  if (value === 'api' && !curator.enabled) {
    console.error('[br-ai-nstorm] ignoring BRAINSTORM_DEFAULT_ORCHESTRATION=api: no curator key is configured.')
    return undefined
  }
  console.error(`[br-ai-nstorm] default orchestration for unswitched problems: ${value}`)
  return value as OrchestrationMode
}

function defaultCurator(): Curator {
  const apiKey = process.env.OPENAI_API_KEY
  const model = process.env.OPENAI_MODEL
  if (!apiKey || !model) return nullCurator
  return createAiCurator({ apiKey, model })
}

/** Convenience for tests and the in-process integration harness. */
export const buildTestServices = (options: BuildOptions = {}) =>
  buildServices({
    repository: createMemoryRepository(),
    auth: createPrototypeAuth({ deterministicTokens: true }),
    curator: nullCurator,
    defaultOrchestration: null,
    atproto: null,
    appUrl: 'http://localhost:5173',
    ...options,
  })
