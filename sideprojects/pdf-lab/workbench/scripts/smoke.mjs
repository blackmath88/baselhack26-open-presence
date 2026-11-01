// Production smoke: starts the built server on a spare loopback port and checks direct deep links,
// asset bytes against the inventory, the published-file allowlist and path traversal.
// Run after `npm run build`: node scripts/smoke.mjs
import { spawn } from 'node:child_process'
import { createHash } from 'node:crypto'
import { readFileSync } from 'node:fs'

const PORT = Number(process.env.SMOKE_PORT ?? 3199)
const base = `http://127.0.0.1:${PORT}`
const inventory = JSON.parse(readFileSync(new URL('../src/generated/lab-data.json', import.meta.url), 'utf8'))
const child = spawn(process.execPath, [new URL('./serve.mjs', import.meta.url).pathname], { env: { ...process.env, PORT: String(PORT) }, stdio: ['ignore', 'pipe', 'inherit'] })
const results = []
const check = (label, ok, detail = '') => results.push(`${ok ? 'ok  ' : 'FAIL'} ${label}${detail ? ` — ${detail}` : ''}`)
try {
  for (let i = 0; i < 50; i++) { try { await fetch(base + '/'); break } catch { await new Promise((r) => setTimeout(r, 100)) } }
  const page = async (path) => { const r = await fetch(base + path); return { status: r.status, text: await r.text() } }
  const home = await page('/')
  check('cabinet renders on the server', home.status === 200 && home.text.includes('Two readings. One picture.'))
  const deep = await page('/specimens/a01-two-poems?reading=other&line=2&view=page&reveal=true')
  check('deep link reloads into the selected line', deep.status === 200 && deep.text.includes('The silence carries paper boats.') && deep.text.includes('Line 2'))
  const raster = await page('/specimens/a01-two-poems?reading=raster&line=3&view=text')
  check('raster deep link states no character map', raster.status === 200 && raster.text.includes('holds no character codes'))
  const bad = await page('/specimens/a01-two-poems?reading=nonsense&line=99&view=x')
  check('invalid search params fall back to defaults', bad.status === 200 && bad.text.includes('Alternate reading'))
  const unknown = await page('/specimens/02-backstage')
  check('unknown specimen points to the legacy cabinet', unknown.text.includes('does not inspect this specimen yet'), `status ${unknown.status}`)
  for (const a of inventory.artefacts.filter((x) => x.url)) {
    const r = await fetch(base + a.url)
    const digest = createHash('sha256').update(Buffer.from(await r.arrayBuffer())).digest('hex')
    if (r.status !== 200 || digest !== a.sha256) check(`asset ${a.url}`, false, `status ${r.status}`)
  }
  check(`all ${inventory.artefacts.filter((x) => x.url).length} published assets serve their inventory bytes`, !results.some((l) => l.startsWith('FAIL asset')))
  check('unpublished PDFs are not served', (await fetch(base + '/lab/output/pdf/02-backstage.pdf')).status !== 200 || !(await page('/lab/output/pdf/02-backstage.pdf')).text.startsWith('%PDF'))
  const traversal = await fetch(base + '/lab/%2e%2e/%2e%2e/package.json')
  check('path traversal is refused', !(await traversal.text()).includes('"pdf-lab-workbench"'))
  check('mutating methods are refused', (await fetch(base + '/', { method: 'POST' })).status === 405)
} finally {
  child.kill()
}
console.log(results.join('\n'))
process.exit(results.some((l) => l.startsWith('FAIL')) ? 1 : 0)
