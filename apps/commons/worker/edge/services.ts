import { createD1Repository, type Database } from './d1-repository.js'
import { createEdgeAuth } from './auth.js'
import { createCommonsService } from '../../server/commons/service.js'
import { createCommonsImporter } from '../../server/commons/import.js'
import { createModerationAwareReads } from '../../server/commons/read-view.js'
import { importedProblems } from '../../src/commons/source/index.js'
import { createProblemService } from '../../server/application/problem-service.js'
import { createContributionService } from '../../server/application/contribution-service.js'
import { createCurationService } from '../../server/application/curation-service.js'
import { createOrchestrationService } from '../../server/application/orchestration-service.js'
import { createImportService } from '../../server/application/import-service.js'
import { nullCurator } from '../../server/curation/ai-curator.js'
import { systemClock } from '../../server/domain/events.js'
import type { Services } from '../../server/container.js'

export async function buildEdgeServices(db: Database, appUrl: string): Promise<Services> {
  const repository = createD1Repository(db)
  await createCommonsImporter(repository)(importedProblems())
  const commons = createCommonsService({ repository, appUrl })
  const deps = { repository, clock: systemClock, ids: { next: (prefix: string) => `${prefix}_${crypto.randomUUID()}` }, curator: nullCurator }
  const reads = { ...deps, repository: createModerationAwareReads(repository) }
  // Only Commons mutation routes are exposed by the edge entrypoint. Inherited
  // read routes remain available to the existing UI, with moderation filtering.
  return { repository, commons, auth: createEdgeAuth(db), curator: nullCurator,
    problems: createProblemService(reads), contributions: createContributionService(deps),
    curation: createCurationService(reads), orchestration: createOrchestrationService(reads),
    imports: createImportService(deps) }
}
