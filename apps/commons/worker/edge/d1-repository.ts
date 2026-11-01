import type { MemoryEvent } from '../../server/domain/events.js'
import type { TransactionalEventRepository } from '../../server/persistence/repository.js'

export interface Statement {
  bind(...values: unknown[]): Statement
  first<T>(): Promise<T | null>
  run(): Promise<unknown>
}
export interface Database { prepare(sql: string): Statement; batch(statements: Statement[]): Promise<unknown> }
interface Document { events: MemoryEvent[]; metadata: Record<string, unknown> }
interface Row { revision: number; document: string }

/** Bounded parity adapter. Callbacks MUST be side-effect free: conflicts replay them.
 * A CHECK constraint aborts the entire SQL batch when the snapshot is stale.
 * Events, metadata and receipts therefore commit together, across isolates.
 * This whole-document representation is temporary, capped at 1 MiB.
 */
export function createD1Repository(db: Database): TransactionalEventRepository {
  const transaction: TransactionalEventRepository['transaction'] = async work => {
    for (let attempt = 0; attempt < 8; attempt++) {
      const row = await db.prepare('SELECT revision, document FROM commons_state WHERE id = 1').first<Row>()
      if (!row) throw new Error('Apply the Commons D1 migration before starting.')
      const document = JSON.parse(row.document) as Document
      const result = await work({ metadata: document.metadata, repository: {
        async read(problemId) { return structuredClone(problemId ? document.events.filter(e => e.problemId === problemId) : document.events) },
        async append(events) { document.events.push(...structuredClone(events)) },
      } })
      const next = JSON.stringify(document)
      if (next === row.document) return structuredClone(result)
      if (new TextEncoder().encode(next).length > 1024 * 1024) throw new Error('Demo capacity reached; export and migrate projections before adding data.')
      const guard = crypto.randomUUID()
      try {
        await db.batch([
          db.prepare('INSERT INTO commons_commit_guard (id, valid) VALUES (?, (SELECT CASE WHEN revision = ? THEN 1 ELSE 0 END FROM commons_state WHERE id = 1))').bind(guard, row.revision),
          db.prepare('UPDATE commons_state SET revision = revision + 1, document = ? WHERE id = 1').bind(next),
          db.prepare('DELETE FROM commons_commit_guard WHERE id = ?').bind(guard),
        ])
        return structuredClone(result)
      } catch (error) {
        // Retry ONLY the known optimistic-lock constraint, not capacity/network errors.
        if (!String(error).includes('CHECK constraint failed: commons_revision_matches')) throw error
      }
    }
    throw new Error('Concurrent updates exceeded the retry budget; retry the same command ID.')
  }
  return { transaction, append: events => transaction(async tx => tx.repository.append(events)),
    read: problemId => transaction(tx => tx.repository.read(problemId)) }
}
