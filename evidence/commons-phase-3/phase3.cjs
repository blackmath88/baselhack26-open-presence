// Phase 3 walkthrough: write → review → (stale) → failed submit keeps text → retry → read-back → rediscover; second participant.
const { chromium } = require('playwright')
const [, , ui, api, out] = process.argv
const Q = 'My Mac cannot see my frame'
const results = []
const ok = (n, p, d = '') => results.push(`${p ? 'ok  ' : 'FAIL'} ${n}${d ? ' — ' + d : ''}`)
const session = async (who) => (await fetch(`${api}/api/auth/session`, { method: 'POST', headers: { 'content-type': 'application/json' }, body: JSON.stringify({ participantId: who }) })).json()
const ids = {}
const RUN = 'k' + Date.now().toString(36)
;(async () => {
  const browser = await chromium.launch({ executablePath: '/usr/bin/chromium' })
  const lea = await session('lea'), kai = await session('kai')
  for (const [vp, w, h] of [['wide', 1440, 1000], ['narrow', 390, 844]]) {
    const page = await (await browser.newContext({ viewport: { width: w, height: h } })).newPage()
    const errs = []; page.on('pageerror', (e) => errs.push(e.message))
    await page.goto(`${ui}/`)
    await page.evaluate(([t, a]) => {
      localStorage.setItem('br-ai-nstorm.session', JSON.stringify({ token: t, actor: a }))
      localStorage.setItem('commons.drafts.v1', JSON.stringify([{ id: 'other-draft', problemId: 'reset-after-uboot', text: 'private note about my home network', sourceRefs: [], savedAt: new Date().toISOString() }]))
    }, [lea.token, lea.actor])
    await page.goto(`${ui}/#/problems/usb-c-no-data?q=${encodeURIComponent(Q)}`); await page.reload(); await page.waitForSelector('#cm-text-root')
    const words = `Kestrelcable ${RUN} ${vp}: plugging the frame straight into the Mac with a data cable worked`
    await page.fill('#cm-text-root', words)
    await page.fill('#cm-circ-root', 'macOS 15, no hub')
    const prep = page.waitForResponse((r) => r.url().includes('/contributions/prepare'))
    await page.click('text=Preview what leaves')
    const prepared = await (await prep).json()
    await page.waitForSelector('.cc-disclosure')
    const disc = await page.$eval('.cc-disclosure', (e) => e.innerText)
    ok(`${vp}: review names destination, voice and exact words`, /local shared room/.test(disc) && /Speaks as\s*Lea/.test(disc) && disc.includes(words), '')
    ok(`${vp}: review says search words and the other draft stay in this browser`, disc.includes(`“${Q}”`) && /other draft in this browser/.test(disc))
    // Stale preview: changing the draft disables submit until previewed again.
    await page.fill('#cm-text-root', words + ' (edited)')
    ok(`${vp}: a changed draft marks the preview stale and blocks submit`, (await page.$('.cc-disclosure.stale')) !== null && await page.locator('.cc-disclosure button.aperture').isDisabled())
    await page.fill('#cm-text-root', words)
    ok(`${vp}: undoing the change makes the preview current again`, (await page.$('.cc-disclosure.stale')) === null)
    // A rejection by the room (not a network failure) keeps the text and offers no blind retry.
    await page.route('**/api/commons/contributions', (route) => route.fulfill({ status: 403, contentType: 'application/json', body: JSON.stringify({ error: 'forbidden', message: 'This participant may not contribute here.' }) }))
    await page.click('.cc-disclosure button.aperture'); await page.waitForSelector('.banner.error')
    ok(`${vp}: a rejection keeps the text and shows the room's reason without a retry button`, (await page.inputValue('#cm-text-root')) === words && /may not contribute/.test(await page.$eval('.banner.error', (e) => e.innerText)) && !(await page.$('.banner.error button')))
    await page.unroute('**/api/commons/contributions')
    // First submit fails at the network: text stays, retry offered.
    let attempts = 0, sentBody = null
    await page.route('**/api/commons/contributions', async (route) => {
      attempts++; sentBody = route.request().postDataJSON()
      if (attempts === 1) return route.abort('connectionrefused')
      return route.continue()
    })
    await page.click('.cc-disclosure button.aperture'); await page.waitForSelector('.banner.error')
    ok(`${vp}: failed submit keeps the text and says so`, (await page.inputValue('#cm-text-root')) === words && /stays in this browser|still saved/.test(await page.$eval('.banner.error', (e) => e.innerText)))
    const { commandId, entrance, ...rest } = sentBody
    const { commandId: _c, ...previewed } = prepared.command
    ok(`${vp}: outgoing body equals the previewed command`, JSON.stringify(rest) === JSON.stringify(previewed) && entrance === 'browser', JSON.stringify(rest))
    ok(`${vp}: outgoing body excludes search words and the other draft`, !JSON.stringify(sentBody).includes('cannot see') && !JSON.stringify(sentBody).includes('home network'))
    await page.focus('.banner.error button'); await page.keyboard.press('Enter'); await page.waitForSelector('.phf-recorded .cc-kv')
    ok(`${vp}: retry reuses the same draft id`, sentBody.commandId === commandId && attempts === 2)
    const rec = await page.$eval('.phf-recorded', (e) => e.innerText)
    const id = (rec.match(/contrib_[0-9a-f-]+/) || [])[0]; ids[vp] = id
    ok(`${vp}: confirmation is read back from the room`, !!id && /Speaks as\s*Lea/.test(rec) && /participant, confirmed by the server/.test(rec) && /Not published to ATProto/.test(rec), id)
    ok(`${vp}: no duplicate success banner under the confirmation`, (await page.$$eval('.commons-draft .banner', (b) => b.length)) === 0)
    await page.$eval('.phf-recorded', (e) => e.scrollIntoView({ block: 'start' })); await page.waitForTimeout(200)
    await page.screenshot({ path: `${out}/p3-recorded-${vp}.png` })
    const view = await (await fetch(`${api}/api/commons/problems/usb-c-no-data`, { headers: { authorization: `Bearer ${lea.token}` } })).json()
    ok(`${vp}: exactly one contribution with these words`, view.contributions.filter((c) => c.text === words).length === 1)
    ok(`${vp}: draft removed from this browser after success, other draft kept`, await page.evaluate(() => { const d = JSON.parse(localStorage.getItem('commons.drafts.v1') || '[]'); return d.length === 1 && d[0].id === 'other-draft' }))
    // Rediscover through search.
    await page.click('.phf-recorded a:has-text("Search for")'); await page.waitForTimeout(1200)
    ok(`${vp}: search for its words finds it`, (await page.evaluate(() => document.body.innerText)).includes(words))
    ok(`${vp}: no horizontal scroll`, (await page.evaluate(() => document.documentElement.scrollWidth)) <= w)
    ok(`${vp}: no page errors`, errs.length === 0, errs.join(' | '))
    await page.close()
  }
  // Review screenshot (fresh draft, not submitted).
  for (const [vp, w, h] of [['wide', 1440, 1000], ['narrow', 390, 844]]) {
    const page = await (await browser.newContext({ viewport: { width: w, height: h } })).newPage()
    await page.goto(`${ui}/`); await page.evaluate(([t, a]) => { localStorage.setItem('br-ai-nstorm.session', JSON.stringify({ token: t, actor: a })); localStorage.removeItem('commons.drafts.v1') }, [lea.token, lea.actor])
    await page.goto(`${ui}/#/problems/usb-c-no-data?q=${encodeURIComponent(Q)}`); await page.reload(); await page.waitForSelector('#cm-text-root')
    await page.fill('#cm-text-root', 'With a USB-C data cable straight into the Mac, the frame showed up as a disk.')
    await page.click('text=Preview what leaves'); await page.waitForSelector('.cc-disclosure .cc-kv')
    await page.$eval('.cc-disclosure', (e) => e.scrollIntoView({ block: 'start' })); await page.waitForTimeout(200)
    await page.screenshot({ path: `${out}/p3-review-${vp}.png` })
    await page.evaluate(() => localStorage.removeItem('commons.drafts.v1'))
    await page.close()
  }
  // A second participant finds it, by search and by permalink.
  const page = await (await browser.newContext({ viewport: { width: 1280, height: 900 } })).newPage()
  await page.goto(`${ui}/`); await page.evaluate(([t, a]) => localStorage.setItem('br-ai-nstorm.session', JSON.stringify({ token: t, actor: a })), [kai.token, kai.actor])
  await page.goto(`${ui}/#/search?q=${encodeURIComponent('Kestrelcable ' + RUN + ' wide')}`); await page.reload(); await page.waitForTimeout(1500)
  ok('second participant (Kai) finds it by search', (await page.evaluate(() => document.body.innerText)).includes(`Kestrelcable ${RUN} wide: plugging the frame`))
  await page.goto(`${ui}/#/contributions/${ids.wide}`); await page.waitForTimeout(1500)
  const t = await page.evaluate(() => document.body.innerText)
  ok('second participant opens the permalink and sees it attributed to Lea', t.includes(`Kestrelcable ${RUN} wide`) && /Lea/.test(t))
  console.log(results.join('\n')); console.log('IDS ' + JSON.stringify(ids))
  await browser.close()
})().catch((e) => { console.error(e); console.log(results.join('\n')); process.exit(1) })
