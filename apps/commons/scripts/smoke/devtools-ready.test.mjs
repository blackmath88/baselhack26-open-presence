import { test } from 'node:test'
import assert from 'node:assert/strict'
import { debuggerUrl, waitForDevTools } from './devtools-ready.mjs'
const ws = 'ws://127.0.0.1:9336/devtools/browser/test'
test('retries refused, empty, malformed, missing and invalid URLs before readiness', async () => {
  const responses = [() => { throw new Error('ECONNREFUSED') }, () => new Response(''), () => new Response('{'), () => new Response('{}'), () => Response.json({ webSocketDebuggerUrl: 'http://localhost/' }), () => Response.json({ webSocketDebuggerUrl: ws })]
  let count = 0
  assert.equal(await waitForDevTools('http://127.0.0.1:9336/json/version', { timeoutMs: 1000, intervalMs: 1, fetchImpl: async () => responses[count++]() }), ws)
  assert.equal(count, 6)
})
test('bounded permanent failure names endpoint and no assertions ran', async () => {
  await assert.rejects(waitForDevTools('http://127.0.0.1:9336/json/version', { timeoutMs: 20, intervalMs: 1, fetchImpl: async () => new Response('', { status: 503 }) }), /within 20ms.*9336.*HTTP 503.*no browser assertions ran/)
})
test('rejects invalid direct browser CLI URL', () => {
  for (const value of ['', undefined, 'http://localhost/', 'ws://localhost/devtools/page/x']) assert.throws(() => debuggerUrl(value))
})
