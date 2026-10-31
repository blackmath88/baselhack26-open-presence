/** Local event log; transactions atomically commit events and command receipts. */
import { mkdir, readFile, rename, writeFile } from 'node:fs/promises'
import { dirname, resolve } from 'node:path'
import type { MemoryEvent } from '../domain/events.js'
import type { RepositoryTransaction, TransactionalEventRepository } from './repository.js'

export interface JsonRepositoryOptions { file: string }
interface LogDocument {
  version: 1
  events: MemoryEvent[]
  metadata?: Record<string, unknown>
}
// All instances addressing the same file share a queue. Reload on every transaction
// avoids stale-instance overwrites. This is a single-process local backend contract.
const queues = new Map<string, Promise<unknown>>()
function enqueue<T>(key: string, work: () => Promise<T>): Promise<T> {
  const run = (queues.get(key) ?? Promise.resolve()).then(work, work)
  const settled = run.then(() => undefined, () => undefined)
  queues.set(key, settled)
  void settled.then(() => { if (queues.get(key) === settled) queues.delete(key) })
  return run
}
function transactionView(document: LogDocument): RepositoryTransaction {
  const metadata = document.metadata ??= {}
  return {
    metadata,
    repository: {
      async append(events) { document.events.push(...structuredClone(events)) },
      async read(problemId) {
        return structuredClone(problemId ? document.events.filter(e => e.problemId === problemId) : document.events)
      },
    },
  }
}
export function createJsonRepository(options: JsonRepositoryOptions): TransactionalEventRepository {
  const file = resolve(options.file)
  const load = async (): Promise<LogDocument> => {
    try {
      const parsed = JSON.parse(await readFile(file, 'utf8')) as LogDocument | MemoryEvent[]
      return Array.isArray(parsed) ? { version: 1, events: parsed } : parsed
    } catch (error) {
      if ((error as NodeJS.ErrnoException).code !== 'ENOENT') throw error
      return { version: 1, events: [] }
    }
  }
  const transaction: TransactionalEventRepository['transaction'] = work => enqueue(file, async () => {
    const document = await load()
    const before = JSON.stringify(document)
    const result = await work(transactionView(document))
    const next = JSON.stringify(document, null, 2)
    if (JSON.stringify(document) !== before) {
      await mkdir(dirname(file), { recursive: true })
      const temp = `${file}.${process.pid}.tmp`
      await writeFile(temp, next)
      await rename(temp, file)
    }
    return structuredClone(result)
  })
  return {
    transaction,
    append: events => transaction(async tx => { await tx.repository.append(events) }),
    read: problemId => enqueue(file, async () => {
      const document = await load()
      return structuredClone(problemId ? document.events.filter(e => e.problemId === problemId) : document.events)
    }),
  }
}

export function createMemoryRepository(seed: MemoryEvent[] = []): TransactionalEventRepository {
  let document: LogDocument = { version: 1, events: structuredClone(seed) }
  const key = `memory:${++memoryCounter}`
  const transaction: TransactionalEventRepository['transaction'] = work => enqueue(key, async () => {
    const next = structuredClone(document)
    const result = await work(transactionView(next))
    document = next
    return structuredClone(result)
  })
  return {
    transaction,
    append: events => transaction(async tx => { await tx.repository.append(events) }),
    read: problemId => enqueue(key, async () => structuredClone(problemId ? document.events.filter(e => e.problemId === problemId) : document.events)),
  }
}
let memoryCounter = 0
