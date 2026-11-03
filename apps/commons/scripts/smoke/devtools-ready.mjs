import { pathToFileURL } from 'node:url'

export function debuggerUrl(value) {
  const url = new URL(value)
  if (!['ws:', 'wss:'].includes(url.protocol) || !url.hostname || !url.pathname.startsWith('/devtools/browser/')) throw new Error('Expected a browser webSocketDebuggerUrl (ws://…/devtools/browser/…)')
  return url.href
}

export async function waitForDevTools(endpoint, { timeoutMs = 20000, intervalMs = 250, fetchImpl = fetch } = {}) {
  const deadline = Date.now() + timeoutMs
  let last = 'no response'
  while (Date.now() < deadline) {
    try {
      const response = await fetchImpl(endpoint, { signal: AbortSignal.timeout(Math.max(1, Math.min(1000, deadline - Date.now()))) })
      if (!response.ok) throw new Error(`HTTP ${response.status}`)
      const body = await response.json()
      return debuggerUrl(body.webSocketDebuggerUrl)
    } catch (error) { last = error.message }
    await new Promise(resolve => setTimeout(resolve, Math.min(intervalMs, Math.max(0, deadline - Date.now()))))
  }
  throw new Error(`Chrome DevTools was not ready within ${timeoutMs}ms at ${endpoint}: ${last}. Inspect chrome.log; no browser assertions ran.`)
}

if (process.argv[1] && import.meta.url === pathToFileURL(process.argv[1]).href) {
  try { console.log(await waitForDevTools(process.argv[2] ?? 'http://127.0.0.1:9336/json/version')) }
  catch (error) { console.error(error.message); process.exitCode = 1 }
}
