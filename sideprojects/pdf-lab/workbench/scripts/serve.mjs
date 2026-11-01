// Production preview: static files from dist/client, everything else through the Start server
// handler. Loopback only by default; read-only (GET/HEAD); no path outside dist/client is served.
import { createReadStream, statSync } from 'node:fs'
import { createServer } from 'node:http'
import { extname, join, normalize, resolve, sep } from 'node:path'
import { fileURLToPath } from 'node:url'

const ROOT = resolve(fileURLToPath(new URL('../dist/client', import.meta.url)))
const { default: server } = await import('../dist/server/server.js')
const HOST = process.env.HOST ?? '127.0.0.1'
const PORT = Number(process.env.PORT ?? 3100)
const TYPES = { '.js': 'text/javascript', '.css': 'text/css', '.pdf': 'application/pdf', '.webp': 'image/webp', '.json': 'application/json', '.svg': 'image/svg+xml', '.ico': 'image/x-icon' }

function staticFile(pathname) {
  let decoded
  try { decoded = decodeURIComponent(pathname) } catch { return null }
  const file = normalize(join(ROOT, decoded))
  if (!file.startsWith(ROOT + sep)) return null
  try { return statSync(file).isFile() ? file : null } catch { return null }
}

createServer(async (req, res) => {
  if (req.method !== 'GET' && req.method !== 'HEAD') { res.writeHead(405, { allow: 'GET, HEAD' }).end(); return }
  const url = new URL(req.url ?? '/', `http://${req.headers.host ?? 'localhost'}`)
  const file = staticFile(url.pathname)
  if (file) {
    res.writeHead(200, { 'content-type': TYPES[extname(file)] ?? 'application/octet-stream', 'x-content-type-options': 'nosniff', ...(url.pathname.startsWith('/assets/') ? { 'cache-control': 'public, max-age=31536000, immutable' } : {}) })
    if (req.method === 'HEAD') res.end(); else createReadStream(file).pipe(res)
    return
  }
  const response = await server.fetch(new Request(url, { method: req.method, headers: req.headers }))
  res.writeHead(response.status, Object.fromEntries(response.headers))
  if (req.method === 'HEAD' || !response.body) { res.end(); return }
  for await (const chunk of response.body) res.write(chunk)
  res.end()
}).listen(PORT, HOST, () => console.log(`PDF LAB Workbench (production build) on http://${HOST}:${PORT}/`))
