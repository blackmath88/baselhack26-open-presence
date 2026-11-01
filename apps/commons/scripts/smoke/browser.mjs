// Browser leg of the cross-entrance smoke (see browser.sh). Drives the system Chromium over the
// DevTools protocol with Node's built-in WebSocket: no Playwright, no downloads. Signs in through
// the prototype session (stored the way the app stores it), then walks repository → contribution →
// reply → passage response, asserting what a person would see. Exits non-zero on the first failure.
import { writeFileSync } from 'node:fs'

const [, , wsUrl, origin, token, actorJson, outDir, contributionId, problemId, passageId] = process.argv
const ws = new WebSocket(wsUrl)
let seq = 0
const pending = new Map()
ws.onmessage = (m) => { const d = JSON.parse(m.data); if (d.id && pending.has(d.id)) { pending.get(d.id)(d); pending.delete(d.id) } }
await new Promise((resolve, reject) => { ws.onopen = resolve; ws.onerror = reject })
const send = (method, params = {}, sessionId) => new Promise(r => { const i = ++seq; pending.set(i, r); ws.send(JSON.stringify({ id: i, method, params, ...(sessionId ? { sessionId } : {}) })) })
const { result: { targetId } } = await send('Target.createTarget', { url: 'about:blank' })
const { result: { sessionId } } = await send('Target.attachToTarget', { targetId, flatten: true })
const page = (m, p) => send(m, p, sessionId)
const wait = (ms) => new Promise(r => setTimeout(r, ms))
const js = async (expression) => {
  const r = await page('Runtime.evaluate', { expression, returnByValue: true, awaitPromise: true })
  if (r.result?.exceptionDetails) throw new Error(`page script failed: ${r.result.exceptionDetails.exception?.description ?? expression}`)
  return r.result?.result?.value
}
const log = []
const check = (label, ok, detail = '') => { log.push(`${ok ? 'ok  ' : 'FAIL'} ${label}${detail ? ` — ${detail}` : ''}`); if (!ok) { finish(1) } }
const until = async (label, expression, timeout = 8000) => {
  const start = Date.now()
  while (Date.now() - start < timeout) { if (await js(expression)) return true; await wait(200) }
  check(label, false, 'timed out'); return false
}
const shot = async (name) => { const s = await page('Page.captureScreenshot', { format: 'png' }); writeFileSync(`${outDir}/${name}.png`, Buffer.from(s.result.data, 'base64')) }
function finish(code) { writeFileSync(`${outDir}/browser-smoke.txt`, `${log.join('\n')}\n`); console.log(log.join('\n')); ws.close(); process.exit(code) }
// Types into the composer's textarea the way React sees user input.
const type = (text) => js(`(() => { const t = document.querySelector('.commons-draft textarea'); Object.getOwnPropertyDescriptor(HTMLTextAreaElement.prototype, 'value').set.call(t, ${JSON.stringify(text)}); t.dispatchEvent(new Event('input', { bubbles: true })); return true })()`)
const clickButton = (scope, label) => js(`(() => { const b = [...document.querySelectorAll(${JSON.stringify(scope)} + ' button')].find(b => b.innerText.trim().startsWith(${JSON.stringify(label)})); if (!b) return false; b.click(); return true })()`)
const text = () => js('document.body.innerText')
const draftCount = () => js(`document.querySelectorAll('.commons-draft').length`)

await page('Emulation.setDeviceMetricsOverride', { width: 1280, height: 1100, deviceScaleFactor: 1, mobile: false })
await page('Page.enable'); await page('Runtime.enable')
await page('Page.navigate', { url: `${origin}/` }); await wait(1500)
await js(`localStorage.setItem('br-ai-nstorm.session', JSON.stringify({ token: ${JSON.stringify(token)}, actor: ${actorJson} }))`)

// 1. Repository entrance: the cited thread names the CLI contribution with author and entrance.
await js(`location.hash = '#/repo?object=issue%2F148'`); await page('Page.reload', {})
await until('repository view lists the citing contribution', `!!document.querySelector('.commons-citing a[href="#/contributions/${contributionId}"]')`)
const repoLine = await js(`document.querySelector('.commons-citing li')?.innerText ?? ''`)
check('citing entry shows author and entrance', /by Kai/.test(repoLine) && /via cli/.test(repoLine), repoLine.replace(/\s+/g, ' '))
await shot('smoke-1-repository')

// 2. Follow it: the problem record opens with the contribution highlighted.
await js(`document.querySelector('.commons-citing a[href="#/contributions/${contributionId}"]').click()`)
await until('contribution card opens', `!!document.getElementById('c-${contributionId}')`)
check('problem record is shown with the contribution', /problem record/i.test(await text()))
check('problem names others sharing cited sources', await js(`!!document.querySelector('ul[aria-label="Problems sharing cited sources"] a')`), await js(`[...document.querySelectorAll('ul[aria-label="Problems sharing cited sources"] li')].slice(0, 2).map(l => l.innerText.replace(/\\s+/g, ' ')).join(' | ')`))

// 3. Reply from the browser.
check('reply composer opens', await js(`(() => { const b = [...document.getElementById('c-${contributionId}').querySelectorAll('button')].find(b => b.innerText.trim() === 'Reply'); if (!b) return false; b.click(); return true })()`))
await until('reply composer heading', `[...document.querySelectorAll('.commons-draft h3')].some(h => h.innerText.includes('Reply to'))`)
await type('smoke-reply-quillwort: which hub did you use, powered or not?')
check('reply preview requested', await clickButton('.commons-draft', 'Preview'))
await until('reply preview names the parent', `(document.querySelector('.commons-preview')?.innerText ?? '').includes('in reply to ${contributionId}')`)
check('reply submitted', await clickButton('.commons-preview', 'Submit'))
await until('reply appears in the conversation', `document.body.innerText.includes('smoke-reply-quillwort')`)

// 4. Respond to one evidence passage.
await until('root composer is back', `document.querySelectorAll('.commons-draft').length === 1 && ![...document.querySelectorAll('.commons-draft h3')].some(h => h.innerText.includes('Reply to'))`)
check(`respond to passage ${passageId}`, await js(`(() => { const b = document.querySelector('button[aria-label="Respond to passage ${passageId}"]'); if (!b) return false; b.click(); return true })()`))
await until('composer focuses the passage', `[...document.querySelectorAll('.commons-draft p')].some(p => p.innerText.startsWith('Responding to passage ${passageId}'))`)
await type('smoke-passage-bergamot: this passage matches my unit')
check('passage preview requested', await clickButton('.commons-draft', 'Preview'))
await until('preview states the exact passage', `(document.querySelector('.commons-preview')?.innerText ?? '').includes('exact passages ${passageId}')`)
await shot('smoke-2-passage-preview')
check('passage response submitted', await clickButton('.commons-preview', 'Submit'))
await until('passage response appears', `document.body.innerText.includes('smoke-passage-bergamot')`)
check('draft count settles', (await draftCount()) === 1)
// 5. Search entrance: the problem hit now says people have been here.
await js(`location.hash = '#/search?q=' + encodeURIComponent('frame charges but no usb data')`)
await until('search shows community activity on the problem hit', `[...document.querySelectorAll('.commons-hit')].some(a => a.getAttribute('href') === '#/problems/${problemId}' && /Community: \\d+ experience/.test(a.innerText))`)
log.push('ok   search hit: ' + (await js(`[...document.querySelectorAll('.commons-hit')].find(a => a.getAttribute('href') === '#/problems/${problemId}')?.innerText.split('\\n').find(l => l.startsWith('Community')) ?? ''`)))
await shot('smoke-3-search')
log.push(`info problem ${problemId}, passage ${passageId}, signed in as ${JSON.parse(actorJson).displayName}`)
finish(0)
