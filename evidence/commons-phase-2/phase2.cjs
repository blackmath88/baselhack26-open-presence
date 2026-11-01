// Phase 2 walkthrough: choose two results → compare → change one → remove one → back; stale search; narrow.
const { chromium } = require('playwright')
const [, , ui, api, out] = process.argv
const Q = 'My Mac cannot see my frame'
const results = []
const ok = (n, p, d = '') => results.push(`${p ? 'ok  ' : 'FAIL'} ${n}${d ? ' — ' + d : ''}`)
;(async () => {
  const browser = await chromium.launch({ executablePath: '/usr/bin/chromium' })
  const s = await (await fetch(`${api}/api/auth/session`, { method: 'POST', headers: { 'content-type': 'application/json' }, body: JSON.stringify({ participantId: 'lea' }) })).json()
  for (const [vp, w, h] of [['wide', 1440, 1000], ['narrow', 390, 844]]) {
    const page = await (await browser.newContext({ viewport: { width: w, height: h } })).newPage()
    const errs = []; page.on('pageerror', (e) => errs.push(e.message))
    await page.goto(`${ui}/`); await page.evaluate(([t, a]) => localStorage.setItem('br-ai-nstorm.session', JSON.stringify({ token: t, actor: a })), [s.token, s.actor])
    await page.goto(`${ui}/#/search?q=${encodeURIComponent(Q)}`); await page.reload(); await page.waitForSelector('.cc-compare-toggle')
    ok(`${vp}: results show a readable match line`, /Your words found: “Mac”, “frame”/.test(await page.$eval('.phf-result .cc-match-summary', (e) => e.innerText)))
    ok(`${vp}: raw match trace stays reachable`, await page.$eval('.cc-trace', (d) => { d.open = true; return /Matched/.test(d.innerText) }))
    // Keyboard: choose results 2 and 3.
    const toggles = page.locator('.cc-compare-toggle')
    await toggles.nth(1).focus(); await page.keyboard.press('Enter'); await page.waitForSelector('.cc-compare-bar')
    await page.locator('.cc-compare-toggle').nth(2).focus(); await page.keyboard.press('Enter'); await page.waitForFunction(() => document.querySelectorAll('.cc-compare-toggle[aria-pressed="true"]').length === 2)
    const hash = await page.evaluate(() => location.hash)
    ok(`${vp}: choice lives in the URL`, /compare=reset-after-uboot,ums-drops-during-backup/.test(hash), hash)
    ok(`${vp}: a third choice is disabled until one is removed`, await page.locator('.cc-compare-toggle').nth(0).isDisabled())
    await page.reload(); await page.waitForSelector('.cc-compare-bar a.button')
    ok(`${vp}: choice survives reload`, (await page.locator('.cc-compare-toggle[aria-pressed="true"]').count()) === 2)
    await page.focus('.cc-compare-bar a.button'); await page.keyboard.press('Enter'); await page.waitForSelector('.cc-compare-table')
    const sum = await page.$eval('.cc-compare-summary', (e) => e.innerText)
    ok(`${vp}: one shared circumstance, one difference, one unknown`, /Route U/.test(sum) && /symptoms, reported outcomes/.test(sum) && /Whether either account applies/.test(sum))
    ok(`${vp}: declared relationship keeps its origin`, /stated in the source/.test(sum) && /proposed by the record writer, unreviewed/.test(sum))
    ok(`${vp}: unstated fields read Not stated`, (await page.locator('.cc-not-stated').count()) >= 2)
    const src = await page.$$eval('.cc-compare-table a[target=_blank]', (as) => as.map((a) => a.href))
    ok(`${vp}: original sources reachable from both sides`, src.length >= 4 && src.every((u) => u.startsWith('https://github.com/')), `${src.length} links`)
    const sw = await page.evaluate(() => document.documentElement.scrollWidth); ok(`${vp}: no horizontal scroll`, sw <= w, `scrollWidth ${sw}`)
    await page.screenshot({ path: `${out}/p2-compare-${vp}.png` })
    // Change B without losing A.
    await page.selectOption('.cc-compare-table thead th:nth-of-type(2) select', 'usb-c-no-data'); await page.waitForFunction(() => location.hash.includes('b=usb-c-no-data'))
    ok(`${vp}: changing B keeps A`, (await page.evaluate(() => location.hash)).includes('a=reset-after-uboot'))
    // Remove A → results with B still chosen.
    await page.click('text=Remove A'); await page.waitForSelector('.cc-compare-bar')
    const kept = await page.$$eval('.cc-compare-toggle[aria-pressed="true"]', (b) => b.length)
    ok(`${vp}: removing A returns to results with B still chosen`, kept === 1 && (await page.evaluate(() => location.hash)).includes('compare=usb-c-no-data'))
    // Browser back returns to the previous comparison.
    await page.goBack(); await page.waitForSelector('.cc-compare-table')
    ok(`${vp}: browser back returns to the comparison`, (await page.evaluate(() => location.hash)).startsWith('#/compare'))
    // From a record: compare link.
    await page.goto(`${ui}/#/problems/ums-drops-during-backup?q=${encodeURIComponent(Q)}`); await page.waitForSelector('.cc-fit-action a')
    const link = await page.$eval('.cc-fit-action a', (a) => a.getAttribute('href'))
    ok(`${vp}: a record offers a comparison with the top result`, link.startsWith('#/compare?a=usb-c-no-data&b=ums-drops-during-backup'), link)
    // Missing record in a comparison.
    await page.goto(`${ui}/#/compare?a=nope&b=usb-c-no-data&q=x`); await page.waitForSelector('.cc-state')
    ok(`${vp}: missing record in a comparison says so and keeps the way back`, /no problem record/.test(await page.$eval('.cc-state', (e) => e.innerText)) && !!(await page.$('.cc-crumbs a')))
    ok(`${vp}: no page errors`, errs.length === 0, errs.join(' | '))
    await page.close()
  }
  // Stale response: the server answer for an older query arrives after the newer one and must not replace it.
  const page = await (await browser.newContext({ viewport: { width: 1280, height: 900 } })).newPage()
  await page.goto(`${ui}/`); await page.evaluate(([t, a]) => localStorage.setItem('br-ai-nstorm.session', JSON.stringify({ token: t, actor: a })), [s.token, s.actor])
  // Control: without a delay, the older query does show a contribution, so its absence below means something.
  await page.goto(`${ui}/#/search?q=staged`); await page.reload(); await page.waitForTimeout(1500)
  ok('control: the older query shows what people added', await page.evaluate(() => [...document.querySelectorAll('.phf-section-title')].some((h) => /What people added/.test(h.innerText))))
  await page.route('**/api/commons/search?q=staged*', async (route) => { await new Promise((r) => setTimeout(r, 1500)); await route.continue() })
  await page.goto(`${ui}/#/search?q=staged`); await page.reload(); await page.waitForTimeout(200)
  // Precondition, checked against the server: the newer query has no contributions of its own.
  const newer = await (await fetch(`${api}/api/commons/search?q=${encodeURIComponent('zzqx qqvv')}`, { headers: { authorization: `Bearer ${s.token}` } })).json()
  ok('precondition: the newer query has no contributions on the server', newer.contributions.length === 0, `${newer.contributions.length}`)
  await page.evaluate(() => { location.hash = '#/search?q=' + encodeURIComponent('zzqx qqvv') }); await page.waitForTimeout(2500)
  const shown = await page.evaluate(() => ({ q: document.querySelector('#commons-q')?.value, people: [...document.querySelectorAll('.phf-section-title')].some((h) => /What people added/.test(h.innerText)) }))
  ok('stale contribution results for an older query do not replace the newer query', shown.q === 'zzqx qqvv' && !shown.people, JSON.stringify(shown))
  console.log(results.join('\n'))
  await browser.close()
})().catch((e) => { console.error(e); process.exit(1) })
