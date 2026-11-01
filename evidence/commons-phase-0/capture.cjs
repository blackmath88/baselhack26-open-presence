// Phase 0 capture: real journey screenshots + measured checks.
// usage: node capture.cjs <uiOrigin> <apiOrigin> <outDir> <label> [query-suffix e.g. "?look=classic"]
const { chromium } = require('playwright')
const fs = require('fs')
const [, , ui, api, out, label, qs = ''] = process.argv
fs.mkdirSync(out, { recursive: true })
const Q = 'My Mac cannot see my frame'
const report = { label, ui, qs, checks: [], contrast: {}, trace: {} }
const ok = (name, pass, detail = '') => report.checks.push({ name, pass, detail })

const contrastJs = `(() => {
  const lum = (c) => { const m = c.match(/[\\d.]+/g).map(Number); const [r,g,b] = m.slice(0,3).map(v => { v/=255; return v<=0.03928? v/12.92 : ((v+0.055)/1.055)**2.4 }); return 0.2126*r+0.7152*g+0.0722*b }
  const bgOf = (el) => { while (el) { const b = getComputedStyle(el).backgroundColor; const a = b.match(/[\\d.]+/g); if (a && (a.length<4 || Number(a[3])>0.5)) return b; el = el.parentElement } return 'rgb(255,255,255)' }
  const ratio = (el) => { const f = lum(getComputedStyle(el).color), b = lum(bgOf(el)); return +((Math.max(f,b)+0.05)/(Math.min(f,b)+0.05)).toFixed(2) }
  const pick = { body: 'h1, h2, .phf-search-label', muted: '.commons-limit', link: 'a[href^="#/"]', primary: '.button.primary', badge: '.badge', quote: 'blockquote', interp: '.commons-interp', tag: '.phf-voice-tag', source: '.commons-source', why: '.commons-why' }
  const r = {}; for (const [k, s] of Object.entries(pick)) { const el = document.querySelector(s); if (el) r[k] = { ratio: ratio(el), size: getComputedStyle(el).fontSize, sample: el.innerText.slice(0, 40) } }
  return r })()`

;(async () => {
  const browser = await chromium.launch({ executablePath: '/usr/bin/chromium' })
  const errors = []
  const session = await (await fetch(`${api}/api/auth/session`, { method: 'POST', headers: { 'content-type': 'application/json' }, body: JSON.stringify({ participantId: 'lea' }) })).json()
  for (const [vp, w, h] of [['wide', 1440, 1000], ['narrow', 390, 844]]) {
    const ctx = await browser.newContext({ viewport: { width: w, height: h }, deviceScaleFactor: 1 })
    const page = await ctx.newPage()
    page.on('console', (m) => { if (m.type() === 'error') errors.push(`${vp}: ${m.text()}`) })
    page.on('response', (r) => { if (r.status() >= 400) errors.push(`${vp}: HTTP ${r.status()} ${r.url()}`) })
    page.on('pageerror', (e) => errors.push(`${vp}: ${e.message}`))
    // Entry (no session yet)
    await page.goto(`${ui}/${qs}`); await page.waitForSelector('.phf-entry, .commons-finder', { timeout: 15000 })
    await page.screenshot({ path: `${out}/${label}-0-entry-${vp}.png`, fullPage: false })
    await page.evaluate(([t, a]) => localStorage.setItem('br-ai-nstorm.session', JSON.stringify({ token: t, actor: a })), [session.token, session.actor])
    // Search
    await page.goto(`${ui}/${qs}#/search?q=${encodeURIComponent(Q)}`); await page.reload()
    await page.waitForSelector('.commons-hits .phf-result', { timeout: 15000 }); await page.waitForTimeout(600)
    await page.screenshot({ path: `${out}/${label}-1-search-${vp}.png`, fullPage: false })
    await page.screenshot({ path: `${out}/${label}-1-search-${vp}-full.png`, fullPage: true })
    const hits = await page.$$eval('.commons-hits .phf-result', (as) => as.map((a) => ({ href: a.getAttribute('href'), title: a.querySelector('strong')?.innerText, near: !!a.querySelector('.badge.conflict') })))
    if (vp === 'wide') { report.trace.hits = hits; report.contrast.search = await page.evaluate(contrastJs) }
    ok(`${vp}: real search returns records`, hits.length > 0, `${hits.length} hits; first ${hits[0]?.title}`)
    // keyboard: tab into the search field and screenshot focus
    await page.focus('#commons-q'); await page.keyboard.press('Tab')
    const focused = await page.evaluate(() => { const e = document.activeElement; const s = getComputedStyle(e); return `${e.tagName}.${e.className} outline=${s.outlineStyle} ${s.outlineColor} ${s.outlineWidth}` })
    ok(`${vp}: Tab from search moves to a visibly focused control`, /solid/.test(focused), focused)
    if (vp === 'wide') await page.screenshot({ path: `${out}/${label}-1b-focus-${vp}.png`, clip: { x: 0, y: 0, width: w, height: 420 } })
    // Record
    await page.goto(`${ui}/${qs}${hits[0].href}`)
    await page.waitForSelector('.commons-record blockquote', { timeout: 15000 }); await page.waitForTimeout(600)
    await page.screenshot({ path: `${out}/${label}-2-record-${vp}.png`, fullPage: false })
    await page.screenshot({ path: `${out}/${label}-2-record-${vp}-full.png`, fullPage: true })
    const ev = page.locator('.phf-evidence').first(); await ev.scrollIntoViewIfNeeded()
    await ev.screenshot({ path: `${out}/${label}-3-passage-${vp}.png` })
    if (vp === 'wide') {
      report.contrast.record = await page.evaluate(contrastJs)
      report.trace.record = await page.evaluate(() => ({ url: location.hash, title: document.querySelector('.commons-record h2')?.innerText, kicker: document.querySelector('.commons-record .section-kicker')?.innerText, firstPassage: document.querySelector('.phf-evidence')?.innerText.slice(0, 600) }))
    }
    const labels = await page.evaluate(() => ({ orig: !!document.querySelector('.phf-source-voice .phf-voice-tag'), agent: !!document.querySelector('.phf-agent-voice .phf-voice-tag'), src: !!document.querySelector('.commons-source a[href^="https://github.com/"]') }))
    ok(`${vp}: passage keeps original/agent labels and source link`, labels.orig && labels.agent && labels.src, JSON.stringify(labels))
    // reload keeps record
    await page.reload(); await page.waitForSelector('.commons-record h2', { timeout: 15000 })
    ok(`${vp}: reload keeps the record route`, (await page.evaluate(() => location.hash)) === hits[0].href)
    await page.goBack().catch(() => {})
    await ctx.close()
  }
  // 360px overflow check on search + record
  const ctx = await browser.newContext({ viewport: { width: 360, height: 780 } }); const page = await ctx.newPage()
  await page.goto(`${ui}/${qs}`); await page.evaluate(([t, a]) => localStorage.setItem('br-ai-nstorm.session', JSON.stringify({ token: t, actor: a })), [session.token, session.actor])
  for (const hash of [`#/search?q=${encodeURIComponent(Q)}`, report.trace.hits[0].href]) {
    await page.goto(`${ui}/${qs}${hash}`); await page.reload(); await page.waitForTimeout(1500)
    const sw = await page.evaluate(() => document.documentElement.scrollWidth)
    ok(`360px: no horizontal page scroll at ${hash.slice(0, 24)}`, sw <= 360, `scrollWidth ${sw}`)
  }
  // reduced motion
  const rm = await browser.newContext({ viewport: { width: 1280, height: 900 }, reducedMotion: 'reduce' }); const p2 = await rm.newPage()
  await p2.goto(`${ui}/${qs}`); const td = await p2.evaluate(() => { const b = document.querySelector('.button, .phf-chip, a'); return b ? getComputedStyle(b).transitionDuration : 'n/a' })
  ok('reduced motion: transitions removed', /^0s(, 0s)*$/.test(td) || td === 'n/a', `transition-duration ${td}`)
  ok('no console or page errors', errors.length === 0, errors.join(' | '))
  fs.writeFileSync(`${out}/${label}-report.json`, JSON.stringify(report, null, 2))
  for (const c of report.checks) console.log(`${c.pass ? 'ok  ' : 'FAIL'} ${c.name}${c.detail ? ' — ' + c.detail : ''}`)
  console.log('contrast', JSON.stringify(report.contrast))
  await browser.close()
})().catch((e) => { console.error(e); process.exit(1) })
