// Screens beyond find/inspect, for theme coverage. usage: node tour.cjs <ui> <api> <out> <label> <contributionId> [qs]
const { chromium } = require('playwright')
const fs = require('fs')
const [, , ui, api, out, label, cid, qs = ''] = process.argv
const contrastJs = `(() => {
  const lum = (c) => { const m = c.match(/[\\d.]+/g).map(Number); const [r,g,b] = m.slice(0,3).map(v => { v/=255; return v<=0.03928? v/12.92 : ((v+0.055)/1.055)**2.4 }); return 0.2126*r+0.7152*g+0.0722*b }
  const bgOf = (el) => { while (el) { const b = getComputedStyle(el).backgroundColor; const a = b.match(/[\\d.]+/g); if (a && (a.length<4 || Number(a[3])>0.5)) return b; el = el.parentElement } return getComputedStyle(document.body).backgroundColor }
  const low = []; for (const el of document.querySelectorAll('body *')) { if (!el.childNodes.length || ![...el.childNodes].some(n => n.nodeType === 3 && n.textContent.trim())) continue; const r = el.getBoundingClientRect(); if (!r.width || !r.height) continue; const s = getComputedStyle(el); if (s.visibility === 'hidden' || +s.opacity < .6) continue; const f = lum(s.color), b = lum(bgOf(el)); const ratio = (Math.max(f,b)+0.05)/(Math.min(f,b)+0.05); if (ratio < 4.5) low.push(el.tagName + '.' + el.className + ' ' + ratio.toFixed(2) + ' "' + el.innerText.slice(0,30).replace(/\\s+/g,' ') + '"') }
  return low })()`
;(async () => {
  const browser = await chromium.launch({ executablePath: '/usr/bin/chromium' })
  const session = await (await fetch(`${api}/api/auth/session`, { method: 'POST', headers: { 'content-type': 'application/json' }, body: JSON.stringify({ participantId: 'lea' }) })).json()
  const page = await (await browser.newContext({ viewport: { width: 1440, height: 1000 } })).newPage()
  const errs = []; page.on('pageerror', (e) => errs.push(e.message))
  const result = {}
  await page.goto(`${ui}/${qs}`); await page.waitForTimeout(1200)
  result.entry = await page.evaluate(contrastJs)
  await page.evaluate(([t, a]) => localStorage.setItem('br-ai-nstorm.session', JSON.stringify({ token: t, actor: a })), [session.token, session.actor])
  const shot = async (name, hash, ready, act) => {
    await page.goto(`${ui}/${qs}${hash}`); await page.reload(); await page.waitForSelector(ready, { timeout: 15000 }); await page.waitForTimeout(700)
    if (act) await act()
    await page.screenshot({ path: `${out}/${label}-${name}.png` }); result[name] = await page.evaluate(contrastJs)
  }
  await shot('4-repository', '#/repo?object=issue%2F148', '.commons-citing, .commons-tree')
  await shot('5-thread', `#/threads/${cid}`, `#c-${cid}, .commons-card`)
  await shot('6-preview', '#/problems/usb-c-no-data', '.commons-record blockquote', async () => {
    await page.click('button[aria-label="Respond to passage e1"]'); await page.waitForTimeout(400)
    await page.fill('.commons-draft textarea', '[Demo, staged] preview only, not submitted'); await page.waitForTimeout(200)
    const b = page.locator('.commons-draft button', { hasText: 'Preview' }).first(); await b.click(); await page.waitForSelector('.commons-preview', { timeout: 8000 })
    await page.locator('.commons-preview').scrollIntoViewIfNeeded(); await page.waitForTimeout(300)
  })
  await shot('7-workbench', '#/search', '.commons-finder', async () => {
    await page.locator('.phf-workbench-toggle button').first().click(); await page.waitForSelector('.main-panel', { timeout: 10000 })
    await page.locator('.main-panel').scrollIntoViewIfNeeded(); await page.waitForTimeout(500)
  })
  result.errors = errs
  fs.writeFileSync(`${out}/${label}-tour.json`, JSON.stringify(result, null, 2))
  for (const [k, v] of Object.entries(result)) console.log(k, Array.isArray(v) ? `${v.length} low-contrast` : v, Array.isArray(v) ? v.slice(0, 6).join(' | ') : '')
  await browser.close()
})().catch((e) => { console.error(e); process.exit(1) })
