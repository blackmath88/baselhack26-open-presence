// Phase 1 walkthrough: keyboard search → record → source link → back → reload → missing record. Screens + checks.
const { chromium } = require('playwright')
const [, , ui, api, out, qs = ''] = process.argv
const Q = 'My Mac cannot see my frame'
const results = []
const ok = (n, p, d = '') => { results.push(`${p ? 'ok  ' : 'FAIL'} ${n}${d ? ' — ' + d : ''}`) }
;(async () => {
  const browser = await chromium.launch({ executablePath: '/usr/bin/chromium' })
  const s = await (await fetch(`${api}/api/auth/session`, { method: 'POST', headers: { 'content-type': 'application/json' }, body: JSON.stringify({ participantId: 'lea' }) })).json()
  for (const [vp, w, h] of [['wide', 1440, 1000], ['narrow', 390, 844]]) {
    const page = await (await browser.newContext({ viewport: { width: w, height: h } })).newPage()
    const errs = []; page.on('pageerror', (e) => errs.push(e.message))
    await page.goto(`${ui}/${qs}`); await page.evaluate(([t, a]) => localStorage.setItem('br-ai-nstorm.session', JSON.stringify({ token: t, actor: a })), [s.token, s.actor])
    await page.goto(`${ui}/${qs}#/search`); await page.reload(); await page.waitForSelector('#commons-q')
    // Keyboard only: type the situation, Enter, Tab to the first result, Enter.
    await page.focus('#commons-q'); await page.keyboard.type(Q); await page.keyboard.press('Enter')
    await page.waitForSelector('.commons-hits .phf-result')
    const first = await page.$eval('.commons-hits .phf-result', (a) => a.getAttribute('href'))
    ok(`${vp}: result link carries the situation`, first.includes('?q=') && decodeURIComponent(first).includes(Q), first)
    await page.focus('.commons-hits .phf-result'); await page.keyboard.press('Enter')
    await page.waitForSelector('.commons-record h2'); await page.waitForTimeout(500)
    ok(`${vp}: focus moves to the record heading`, await page.evaluate(() => document.activeElement?.id === 'commons-record-title'))
    const ctx = await page.evaluate(() => ({ crumb: document.querySelector('.cc-crumbs a')?.innerText, sit: document.querySelector('.cc-situation-text')?.innerText, fit: document.querySelector('.cc-fit')?.innerText ?? '' }))
    ok(`${vp}: breadcrumb and situation show the query`, ctx.crumb?.includes(Q) && ctx.sit === Q, `${ctx.crumb} | ${ctx.sit}`)
    ok(`${vp}: why/differs/unknown are present`, /Why it may fit/i.test(ctx.fit) && /What may differ/i.test(ctx.fit) && /Not known here/i.test(ctx.fit))
    if (true) results.push("info " + ctx.fit.replace(/\s+/g, ' ').slice(0, 600))
    ok(`${vp}: status badges`, await page.evaluate(() => /Agent-written · not reviewed/i.test(document.querySelector('.commons-record-status')?.innerText ?? '')))
    const src = await page.$eval('.commons-source a', (a) => ({ href: a.href, target: a.target, rel: a.rel }))
    ok(`${vp}: original source opens GitHub in a new tab`, /^https:\/\/github\.com\//.test(src.href) && src.target === '_blank' && /noopener/.test(src.rel), src.href)
    await page.screenshot({ path: `${out}/p1-record-${vp}.png` })
    const sw = await page.evaluate(() => document.documentElement.scrollWidth); ok(`${vp}: no horizontal scroll on record`, sw <= w, `scrollWidth ${sw}`)
    // Reload keeps context.
    const hash = await page.evaluate(() => location.hash); await page.reload(); await page.waitForSelector('.cc-situation-text')
    ok(`${vp}: reload keeps record and situation`, (await page.evaluate(() => location.hash)) === hash && (await page.$eval('.cc-situation-text', (e) => e.innerText)) === Q)
    // Back via breadcrumb (keyboard).
    await page.focus('.cc-crumbs a'); await page.keyboard.press('Enter'); await page.waitForSelector('.phf-result.selected'); await page.waitForTimeout(400)
    const back = await page.evaluate(() => ({ q: document.querySelector('#commons-q')?.value, sel: document.querySelector('.phf-result.selected')?.getAttribute('href'), focused: document.activeElement?.classList.contains('selected') }))
    ok(`${vp}: back keeps the query and focuses the result you came from`, back.q === Q && back.sel === first && back.focused, JSON.stringify(back))
    await page.screenshot({ path: `${out}/p1-back-${vp}.png` })
    // Browser back from a fresh record visit returns to results too.
    await page.goto(`${ui}/${qs}${first}`); await page.waitForSelector('.commons-record h2'); await page.goBack(); await page.waitForTimeout(800)
    ok(`${vp}: browser back returns to the results`, (await page.evaluate(() => location.hash)).startsWith('#/search?q='))
    // Missing record: not-found state keeps the context.
    await page.goto(`${ui}/${qs}#/problems/no-such-record?q=${encodeURIComponent(Q)}`); await page.reload(); await page.waitForSelector('.cc-state', { timeout: 10000 })
    const nf = await page.evaluate(() => ({ t: document.querySelector('.cc-state')?.innerText, crumb: !!document.querySelector('.cc-crumbs a'), retry: !!document.querySelector('.cc-state button') }))
    ok(`${vp}: missing record says so, keeps the way back, offers no pointless retry`, /no problem record/i.test(nf.t) && nf.crumb && !nf.retry, nf.t)
    if (vp === 'wide') await page.screenshot({ path: `${out}/p1-notfound-wide.png` })
    // Deep link without a situation: canonical, no situation panel.
    await page.goto(`${ui}/${qs}#/problems/usb-c-no-data`); await page.reload(); await page.waitForSelector('.commons-record h2')
    ok(`${vp}: canonical deep link shows no invented situation`, !(await page.$('.cc-situation')) && !!(await page.$('.cc-crumbs a')))
    ok(`${vp}: no page errors`, errs.length === 0, errs.join(' | '))
  }
  console.log(results.join('\n'))
  await browser.close()
})().catch((e) => { console.error(e); process.exit(1) })
