// Browser leg of the Phase 1 journey smoke (see journey.sh). Drives Chromium over the DevTools
// protocol with Node's built-in WebSocket: no Playwright. Exits non-zero on the first failure.
import { writeFileSync } from 'node:fs'

const [, , wsUrl, origin, token, actorJson, outDir] = process.argv
const QUERY = 'My Mac cannot see my frame'
const PROBLEM = 'usb-c-no-data'
const PASSAGE = 'e3'
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
const check = (label, ok, detail = '') => { log.push(`${ok ? 'ok  ' : 'FAIL'} ${label}${detail ? ` — ${detail}` : ''}`); if (!ok) finish(1) }
const until = async (label, expression, timeout = 8000) => {
  const start = Date.now()
  while (Date.now() - start < timeout) { if (await js(expression)) { log.push(`ok   ${label}`); return true } await wait(150) }
  check(label, false, 'timed out'); return false
}
const shot = async (name) => { const s = await page('Page.captureScreenshot', { format: 'png' }); writeFileSync(`${outDir}/${name}.png`, Buffer.from(s.result.data, 'base64')) }
function finish(code) { writeFileSync(`${outDir}/journey-smoke.txt`, `${log.join('\n')}\n`); console.log(log.join('\n')); ws.close(); process.exit(code) }
const key = async (k, code, vk, text) => { await page('Input.dispatchKeyEvent', { type: 'keyDown', key: k, code, windowsVirtualKeyCode: vk, ...(text ? { text } : {}) }); await page('Input.dispatchKeyEvent', { type: 'keyUp', key: k, code, windowsVirtualKeyCode: vk }) }
const go = (hash) => js(`(() => { location.hash = ${JSON.stringify(hash)}; return true })()`)

await page('Emulation.setDeviceMetricsOverride', { width: 1280, height: 1000, deviceScaleFactor: 1, mobile: false })
await page('Page.enable'); await page('Runtime.enable')
await page('Page.navigate', { url: `${origin}/` }); await wait(1200)
await js(`localStorage.setItem('br-ai-nstorm.session', JSON.stringify({ token: ${JSON.stringify(token)}, actor: ${actorJson} }))`)
await page('Page.reload')
await until('search entrance ready', `!!document.getElementById('commons-q')`)

// 1. Situation → search, by keyboard: type, then Enter.
await js(`(() => { const i = document.getElementById('commons-q'); i.focus(); Object.getOwnPropertyDescriptor(HTMLInputElement.prototype, 'value').set.call(i, ${JSON.stringify(QUERY)}); i.dispatchEvent(new Event('input', { bubbles: true })); return true })()`)
await key('Enter', 'Enter', 13, '\r')
await until('Enter searches and the URL carries the situation', `location.hash === '#/search?q=' + encodeURIComponent(${JSON.stringify(QUERY)}) && document.querySelectorAll('.cx-hit').length > 0`)
const hits = await js(`document.querySelectorAll('.cx-hit').length`)
const first = await js(`document.querySelector('.cx-hit .commons-hit').getAttribute('href')`)
check('first account is the USB data record and its link keeps the situation', first === `#/problems/${PROBLEM}?q=${encodeURIComponent(QUERY)}`, `${hits} hits, ${first}`)

// 2. Keyboard: Tab from the result reaches "Why it matched"; Enter opens it.
await js(`document.querySelector('.cx-hit .commons-hit').focus()`)
await key('Tab', 'Tab', 9)
check('Tab reaches Why it matched', (await js(`document.activeElement?.textContent?.trim()`)) === 'Why it matched')
await key('Enter', 'Enter', 13, '\r')
await until('Enter expands the match explanation', `document.querySelector('.cx-disclosure').getAttribute('aria-expanded') === 'true' && !document.querySelector('.cx-why-body').hidden`)
await shot('journey-1-results')

// 3. Open the account.
await js(`document.querySelector('.cx-hit .commons-hit').click()`)
await until('record shows the situation', `document.querySelector('.cx-situation q')?.innerText === ${JSON.stringify(QUERY)}`)
await until('fit panel names unstated conditions and unknowns', `/not stated by you/.test(document.querySelector('.cx-fit')?.innerText ?? '') && /Unknown/.test(document.querySelector('.cx-fit').innerText)`)
check('record carries its own match explanation', await js(`!!document.querySelector('.cx-fit .cx-disclosure')`))
check('reported outcomes link to their passages', await js(`[...document.querySelectorAll('.cx-outcomes a')].map(a => a.getAttribute('href')).includes('#/problems/${PROBLEM}?q=' + encodeURIComponent(${JSON.stringify(QUERY)}) + '&passage=e3')`))

// 4. Honest voices: every rendered quote equals the corpus quote; interpretations stay labelled.
const api = await js(`fetch('/api/commons/problems/${PROBLEM}', { headers: { authorization: 'Bearer ${token}' } }).then(r => r.json())`)
const corpus = Object.fromEntries(api.problem.evidence.map((e) => [e.id, e.quote]))
const rendered = await js(`[...document.querySelectorAll('.commons-evidence > li')].map(li => [li.id.replace('passage-', ''), li.querySelector('.phf-source-voice blockquote')?.innerText ?? null, !!li.querySelector('.phf-agent-voice .phf-voice-tag')])`)
const mismatched = rendered.filter(([id, q]) => (q === null ? corpus[id] !== null : q !== `“${corpus[id]}”`))
check('every rendered quote is the corpus quote, verbatim', rendered.length === api.problem.evidence.length && mismatched.length === 0, `${rendered.length} passages${mismatched.length ? `; mismatched ${mismatched.map((m) => m[0])}` : ''}`)
check('every interpretation carries the agent label', rendered.every(([id, , labelled]) => labelled || !api.problem.evidence.find((e) => e.id === id).interpretation))

// 5. Passage selection through the index.
await js(`[...document.querySelectorAll('.cx-passage-index a')].find(a => a.innerText.startsWith('${PASSAGE}')).click()`)
await until('passage selected, in the URL, focused and in view', `location.hash.endsWith('&passage=${PASSAGE}') && document.querySelector('.cx-selected')?.id === 'passage-${PASSAGE}' && document.activeElement?.id === 'passage-${PASSAGE}' && Math.abs(document.activeElement.getBoundingClientRect().top) < innerHeight / 2`)
const original = await js(`(() => { const a = document.querySelector('#passage-${PASSAGE} .cx-original'); return a && [a.href, a.target, a.rel] })()`)
check('original source opens GitHub in a new tab', !!original && original[0].startsWith('https://github.com/wesbos/photo-frame-dashboard/') && original[1] === '_blank' && original[2].includes('noopener'), original?.[0])
await shot('journey-2-passage')

// 6. Reload and back.
await page('Page.reload'); await wait(800)
await until('reload keeps situation and selected passage', `document.querySelector('.cx-selected')?.id === 'passage-${PASSAGE}' && document.querySelector('.cx-situation q')?.innerText === ${JSON.stringify(QUERY)}`)
await js(`history.back()`)
await until('back clears the passage, keeps the record', `!location.hash.includes('passage=') && !document.querySelector('.cx-selected') && !!document.querySelector('.cx-situation')`)
await js(`history.back()`)
await until('back again returns to the same results', `location.hash.startsWith('#/search?q=') && document.querySelectorAll('.cx-hit').length === ${hits} && document.getElementById('commons-q').value === ${JSON.stringify(QUERY)}`)

// 7. Unknown passage and unknown record.
await go(`#/problems/${PROBLEM}?passage=zz9`)
await until('unknown passage is reported, not guessed', `/Passage “zz9” is not part of this record/.test(document.body.innerText) && !document.querySelector('.cx-selected')`)
await go(`#/problems/no-such-record?q=${encodeURIComponent(QUERY)}`)
await until('unknown record says so and keeps the way back', `/No record called “no-such-record”/.test(document.body.innerText) && document.querySelector('.cx-back')?.getAttribute('href') === '#/search?q=' + encodeURIComponent(${JSON.stringify(QUERY)})`)

// 8. Failed load keeps the situation and recovers on retry.
await js(`(() => { window.__fetch = window.fetch; window.fetch = (u, o) => String(u).includes('/api/commons/problems/') ? Promise.reject(new TypeError('offline')) : window.__fetch(u, o); return true })()`)
await go(`#/problems/reset-after-uboot?q=${encodeURIComponent(QUERY)}`)
await until('failed load shows an error with the situation still on screen', `/could not be loaded/.test(document.body.innerText) && !!document.querySelector('.cx-situation') && [...document.querySelectorAll('button')].some(b => b.innerText === 'Try again')`)
await js(`(() => { window.fetch = window.__fetch; [...document.querySelectorAll('button')].find(b => b.innerText === 'Try again').click(); return true })()`)
await until('Try again loads the record', `!!document.querySelector('.commons-record') && !/could not be loaded/.test(document.body.innerText)`)

// 8b. Compare two accounts: start from a result, choose the second, follow a passage, come back, remove one.
const A = 'reset-after-uboot', B = 'ums-drops-during-backup'
await go(`#/search?q=${encodeURIComponent(QUERY)}`)
await until('results back for comparison', `document.querySelectorAll('.cx-hit').length === ${hits}`)
await js(`(() => { const li = [...document.querySelectorAll('.cx-hit')].find(l => l.querySelector('a.commons-hit')?.getAttribute('href').startsWith('#/problems/${A}?')); li.querySelector('.cx-compare-link').click(); return true })()`)
await until('compare starts with that account and keeps the situation', `location.hash === '#/compare?ids=${A}&q=' + encodeURIComponent(${JSON.stringify(QUERY)}) && document.querySelectorAll('.cx-compare-title').length === 1 && !!document.querySelector('.cx-situation')`)
await js(`(() => { const sel = document.querySelectorAll('.cx-compare-head select')[1]; Object.getOwnPropertyDescriptor(HTMLSelectElement.prototype, 'value').set.call(sel, '${B}'); sel.dispatchEvent(new Event('change', { bubbles: true })); return true })()`)
await until('choosing B puts both in the URL and aligns them', `location.hash.startsWith('#/compare?ids=${A},${B}&q=') && !!document.querySelector('.cx-compare-table')`)
const row = (name) => js(`[...document.querySelectorAll('.cx-compare-table tbody tr')].find(r => r.querySelector('th').innerText === ${JSON.stringify(name)})?.innerText ?? ''`)
check('identical device is marked in both', /PF1007L \(Allwinner A33\)\s*in both/.test(await row('Applies to')))
const summary = await js(`document.querySelector('#cx-compare-summary').parentElement.innerText`)
check('summary names a shared circumstance, a difference and an unknown', /Route U/.test(summary) && /records \d+ entr(y|ies) B does not/.test(summary) && /Unknown/.test(summary), summary.replace(/\s+/g, ' ').slice(0, 160))
check('no cause is inferred', !/same cause|caused by|will fix/i.test(summary))
const bLinks = await js(`[...document.querySelectorAll('.cx-compare-table td:nth-child(3) a')].map(a => a.getAttribute('href'))`)
const badB = bLinks.filter((h) => !h.startsWith(`#/problems/${B}?q=${encodeURIComponent(QUERY)}&passage=`))
check('B links go to B passages with the situation', bLinks.length > 0 && badB.length === 0, `${bLinks.length} links${badB.length ? '; bad: ' + badB.join(' ') : ''}`)
await js(`[...document.querySelectorAll('.cx-compare-table td:nth-child(3) .cx-compare-passages a')].find(a => a.innerText.startsWith('e3')).click()`)
await until('a passage from the comparison opens selected on its record', `document.querySelector('.cx-selected')?.id === 'passage-e3' && location.hash.startsWith('#/problems/${B}?')`)
await js(`history.back()`)
await until('back returns to the same comparison', `location.hash.startsWith('#/compare?ids=${A},${B}&q=') && document.querySelectorAll('.cx-compare-title').length === 2`)
await js(`[...document.querySelectorAll('.cx-compare-head a.button')].find(a => a.innerText === 'Remove A').click()`)
await until('removing A keeps B and the situation', `location.hash === '#/compare?ids=${B}&q=' + encodeURIComponent(${JSON.stringify(QUERY)}) && document.querySelector('.cx-compare-title')?.getAttribute('href').startsWith('#/problems/${B}')`)
await go(`#/compare?ids=nope-record,${A}`)
await until('unknown account in a comparison is reported', `/No record called “nope-record”/.test(document.body.innerText) && document.querySelectorAll('.cx-compare-title').length === 1`)
await shot('journey-4-compare')

// 9. Narrow viewport.
await page('Emulation.setDeviceMetricsOverride', { width: 360, height: 800, deviceScaleFactor: 1, mobile: true })
await go(`#/problems/${PROBLEM}?q=${encodeURIComponent(QUERY)}&passage=e5`)
await until('360 px: selected passage is scrolled into view', `(() => { const el = document.querySelector('.cx-selected'); if (el?.id !== 'passage-e5') return false; const t = el.getBoundingClientRect().top; return t > -5 && t < innerHeight / 2 })()`)
const widths = await js(`[document.documentElement.scrollWidth, window.innerWidth]`)
check('360 px: no horizontal scroll', widths[0] <= widths[1], widths.join('/'))
await shot('journey-3-narrow-passage')
await go(`#/compare?ids=${A},${B}&q=${encodeURIComponent(QUERY)}`)
await until('360 px: comparison stacks', `!!document.querySelector('.cx-compare-table') && getComputedStyle(document.querySelector('.cx-compare-table td')).display === 'block'`)
const cw = await js(`[document.documentElement.scrollWidth, window.innerWidth]`)
check('360 px: comparison has no horizontal scroll', cw[0] <= cw[1], cw.join('/'))
await js(`document.querySelector('.cx-compare-table').scrollIntoView()`)
await shot('journey-5-narrow-compare')
finish(0)
