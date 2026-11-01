// Phase 4 walkthrough: open a passage's lineage, change stage, reload, all stages as text; a contribution's lineage.
const { chromium } = require('playwright')
const [, , ui, api, out] = process.argv
const Q = 'My Mac cannot see my frame'
const results = []
const ok = (n, p, d = '') => results.push(`${p ? 'ok  ' : 'FAIL'} ${n}${d ? ' — ' + d : ''}`)
;(async () => {
  const browser = await chromium.launch({ executablePath: '/usr/bin/chromium' })
  const s = await (await fetch(`${api}/api/auth/session`, { method: 'POST', headers: { 'content-type': 'application/json' }, body: JSON.stringify({ participantId: 'lea' }) })).json()
  // Staged demo data: one contribution citing exact passage e2, so the passage link is exercised.
  const auth = { 'content-type': 'application/json', authorization: `Bearer ${s.token}` }
  const prep = await (await fetch(`${api}/api/commons/contributions/prepare`, { method: 'POST', headers: auth, body: JSON.stringify({ problemId: 'usb-c-no-data', text: '[Demo, staged] Phase 4 check: this passage matches my unit', sourceRefs: [], evidenceIds: ['e2'] }) })).json()
  const sub = await (await fetch(`${api}/api/commons/contributions`, { method: 'POST', headers: auth, body: JSON.stringify({ ...prep.command, commandId: 'phase4-demo-e2', entrance: 'browser' }) })).json()
  ok('setup: a staged contribution cites passage e2', !!sub.contributionId, sub.contributionId)
  for (const [vp, w, h] of [['wide', 1440, 1000], ['narrow', 390, 844]]) {
    const page = await (await browser.newContext({ viewport: { width: w, height: h } })).newPage()
    const errs = []; page.on('pageerror', (e) => errs.push(e.message))
    await page.goto(`${ui}/`); await page.evaluate(([t, a]) => localStorage.setItem('br-ai-nstorm.session', JSON.stringify({ token: t, actor: a })), [s.token, s.actor])
    await page.goto(`${ui}/#/problems/usb-c-no-data?q=${encodeURIComponent(Q)}`); await page.reload(); await page.waitForSelector('#passage-e3')
    // Open by keyboard.
    const open = page.locator('#passage-e3 button[aria-controls="lineage-e3"]')
    await open.focus(); await page.keyboard.press('Enter'); await page.waitForSelector('#lineage-e3 .cc-lineage')
    ok(`${vp}: opening a trace puts passage and situation in the URL`, await page.evaluate(() => location.hash.includes('trace=e3') && location.hash.includes('q=')))
    ok(`${vp}: the open button reports expanded`, (await open.getAttribute('aria-expanded')) === 'true')
    const src = await page.$eval('#lineage-e3 .cc-lineage-detail', (e) => e.innerText)
    ok(`${vp}: source stage names the recorded author and links the original`, /@jethrojones/.test(src) && (await page.$$eval('#lineage-e3 .cc-lineage-detail a[target=_blank]', (a) => a.every((x) => x.href.startsWith('https://github.com/')) && a.length > 0)))
    // Change stage by keyboard.
    const cap = page.locator('#lineage-e3 .cc-step button', { hasText: 'Captured' })
    await cap.focus(); await page.keyboard.press('Enter'); await page.waitForFunction(() => location.hash.includes('stage=capture'))
    const capText = await page.$eval('#lineage-e3 .cc-lineage-detail', (e) => e.innerText)
    ok(`${vp}: capture stage shows snapshot, fingerprint scope and what is not known`, /commons-001@/.test(capText) && /not the passage/.test(capText) && /Not known here/.test(capText))
    ok(`${vp}: the chosen stage is marked current`, (await cap.getAttribute('aria-current')) === 'step')
    // Reload keeps passage, stage and situation.
    await page.reload(); await page.waitForSelector('#lineage-e3 .cc-lineage'); await page.waitForTimeout(300)
    ok(`${vp}: reload keeps passage, stage and situation`, (await page.locator('#lineage-e3 .cc-step button[aria-current=step]').innerText()).includes('Captured') && (await page.evaluate(() => document.body.innerText)).includes(Q))
    ok(`${vp}: a shared trace link opens at its passage`, await page.$eval('#passage-e3', (e) => { const r = e.getBoundingClientRect(); return r.top < innerHeight && r.bottom > 0 }))
    await page.screenshot({ path: `${out}/p4-passage-${vp}.png` })
    // All stages as text.
    await page.click('#lineage-e3 .cc-link-button'); await page.waitForFunction(() => location.hash.includes('stage=all'))
    const stages = await page.$$eval('#lineage-e3 .cc-lineage-stage', (els) => els.map((e) => ({ h: e.querySelector('h5').innerText, facts: !!e.querySelector('dl'), unknown: !!e.querySelector('.cc-lineage-unknown') })))
    ok(`${vp}: all five stages readable as text`, stages.length === 5, stages.map((x) => x.h.split('\n')[0]).join(' | '))
    ok(`${vp}: every stage shows recorded facts or says what is not known`, stages.every((x) => x.facts || x.unknown))
    const record = await page.$eval('#lineage-e3 .cc-lineage-detail', (e) => e.innerText)
    ok(`${vp}: record stage says whether the quote matched your words`, /For your words/.test(record) && /reading is not indexed/.test(record))
    // A document passage: no invented author.
    await page.goto(`${ui}/#/problems/usb-c-no-data?q=${encodeURIComponent(Q)}&trace=e1`); await page.waitForSelector('#lineage-e1 .cc-lineage')
    ok(`${vp}: a document passage says its author is not recorded`, /Author: not recorded/.test(await page.$eval('#lineage-e1', (e) => e.innerText)))
    // Close keeps the situation.
    await page.click('#passage-e1 button[aria-controls="lineage-e1"]'); await page.waitForFunction(() => !location.hash.includes('trace='))
    ok(`${vp}: closing the trace keeps the situation`, await page.evaluate(() => location.hash.includes('q=') && !document.querySelector('.cc-lineage')))
    // A contribution's lineage.
    const card = page.locator('.commons-card', { hasText: 'Phase 4 check' }).first()
    await card.locator('button', { hasText: 'How this got here' }).click(); await page.waitForSelector('.commons-card .cc-lineage')
    await card.locator('.cc-lineage .cc-link-button').click()
    const ct = await card.locator('.cc-lineage').innerText()
    ok(`${vp}: contribution lineage shows entrance, room, responses and publication honestly`, /Entrance/.test(ct) && /commons:usb-c-no-data/.test(ct) && /Responds to/.test(ct) && /(Not published|Not confirmed as published|Status)/.test(ct))
    if (vp === 'wide') { await card.locator('.cc-lineage').scrollIntoViewIfNeeded(); await page.screenshot({ path: `${out}/p4-contribution-${vp}.png` }) }
    await card.locator('.cc-lineage a[href*="trace=e2"]').click(); await page.waitForSelector('#lineage-e2 .cc-lineage')
    ok(`${vp}: a cited passage in a contribution's lineage opens that passage's trace`, await page.evaluate(() => location.hash.includes('trace=e2')))
    ok(`${vp}: that passage's "since" stage lists the contribution as citing this exact passage`, await page.evaluate(async () => { [...document.querySelectorAll('#lineage-e2 .cc-step button')].find((b) => b.innerText.includes('Since')).click(); await new Promise((r) => setTimeout(r, 300)); return /Cites this passage/.test(document.querySelector('#lineage-e2 .cc-lineage-detail').innerText) }))
    ok(`${vp}: no horizontal scroll`, (await page.evaluate(() => document.documentElement.scrollWidth)) <= w)
    ok(`${vp}: no page errors`, errs.length === 0, errs.join(' | '))
    await page.close()
  }
  console.log(results.join('\n'))
  await browser.close()
})().catch((e) => { console.error(e); console.log(results.join('\n')); process.exit(1) })
