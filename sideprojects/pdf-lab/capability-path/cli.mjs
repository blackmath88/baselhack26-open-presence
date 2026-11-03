import { readFileSync, statSync } from 'node:fs'
import { createService, parseRequest } from './core.mjs'

try {
  const [operation, requestPath] = process.argv.slice(2)
  const service = createService()
  if (!Object.hasOwn(service, operation)) throw new Error(`Choose an operation: ${Object.keys(service).join(', ')}`)
  if (requestPath && statSync(requestPath).size > 16384) throw new Error('$: request exceeds 16384 bytes; shorten the request.')
  const input = requestPath ? parseRequest(readFileSync(requestPath, 'utf8')) : {}
  const result = await service[operation](input)
  console.log(JSON.stringify(result, null, 2))
  if (operation === 'validate_project' && !result.valid) process.exitCode = 1
} catch (error) { console.error(error.message); process.exitCode = 1 }
