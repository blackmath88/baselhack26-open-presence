// usage: node shoot2.cjs <baseUrl> <outDir> <prefix>
const { chromium } = require('playwright')
const [,, base, out, prefix] = process.argv
const Q = 'My Mac cannot see my frame'
const lum = (rgb) => { const c = rgb.match(/\d+(\.\d+)?/g).slice(0, 3).map(Number).map((v) => v / 255).map((x) => x <= 0.03928 ? x / 12.92 : ((x + 0.055) / 1.055) ** 2.4); return 0.2126 * c[0] + 0.7152 * c[1] + 0.0722 * c[2] }
const ratio = (a, b) => { const [x, y] = [lum(a), lum(b)].sort((m, n) => n - m); return ((x + 0.05) / (y + 0.05)).toFixed(2) }
;(async () => {
  const browser = await chromium.launch()
  const errors = []
  for (const [label, vp] of [['wide', { width: 1440, height: 1000 }], ['narrow', { width: 360, height: 800 }]]) {
    const ctx = await browser.newContext({ viewport: vp, reducedMotion: label === 'narrow' ? 'reduce' : 'no-preference' })
    const page = await ctx.newPage()
    page.on('pageerror', (e) => errors.push(`${label}: ${e.message}`))
    page.on('console', (m) => { if (m.type() === 'error') errors.push(`${label} console: ${m.text()}`) })
    await page.goto(base + '/')
    await page.getByRole('button', { name: 'Kai' }).click()
    await page.waitForSelector('#commons-q')
    // Keyboard: type the situation and submit with Enter.
    await page.locator('#commons-q').fill(Q)
    await page.keyboard.press('Enter')
    await page.waitForSelector('.cx-hit')
    await page.waitForTimeout(500)
    await page.screenshot({ path: `${out}/${prefix}-${label}-2-results.png` })
    // Keyboard: Tab from the first result link reaches its "Why it matched" button; Enter opens it.
    await page.locator('.cx-hit .commons-hit').first().focus()
    const linkOutline = await page.evaluate(() => getComputedStyle(document.activeElement).outlineStyle + ' ' + getComputedStyle(document.activeElement).outlineColor)
    await page.keyboard.press('Tab')
    const focused = await page.evaluate(() => document.activeElement?.textContent?.trim())
    await page.keyboard.press('Enter')
    const expanded = await page.locator('.cx-disclosure').first().getAttribute('aria-expanded')
    console.log(label, 'focus ring on result link:', linkOutline, '| Tab ->', JSON.stringify(focused), '| Enter -> aria-expanded', expanded)
    await page.locator('.cx-hit').first().scrollIntoViewIfNeeded()
    await page.screenshot({ path: `${out}/${prefix}-${label}-2b-why.png` })
    // Contrast on real rendered pairs.
    const pairs = await page.evaluate(() => {
      const bgOf = (el) => { while (el) { const b = getComputedStyle(el).backgroundColor; if (b && !/rgba\(0, 0, 0, 0\)|transparent/.test(b)) return b; el = el.parentElement } return 'rgb(255,255,255)' }
      const sel = ['.cx-hit-title', '.phf-applies-k', '.cx-voice-label', '.cx-hit .commons-limit', '.cx-disclosure', '.cx-why-notes li', '.cx-term', '.cx-results-head .cx-meta', '.commons-search-row .button.primary']
      return sel.map((s) => { const el = document.querySelector(s); return el ? [s, getComputedStyle(el).color, bgOf(el)] : [s, null, null] })
    })
    if (label === 'wide') for (const [s, fg, bg] of pairs) console.log('  contrast', s, fg ? ratio(fg, bg) : 'n/a')
    await page.locator('.cx-hit .commons-hit').first().click()
    await page.waitForSelector('.commons-record')
    await page.waitForTimeout(500)
    await page.screenshot({ path: `${out}/${prefix}-${label}-3-account.png` })
    await page.screenshot({ path: `${out}/${prefix}-${label}-3-account-full.png`, fullPage: true })
    const statusPairs = await page.evaluate(() => [...document.querySelectorAll('.cx-status, .cx-back, .cx-situation-k, .cx-context-note, .phf-voice-tag, .phf-evidence .badge')].slice(0, 8).map((el) => [el.className, getComputedStyle(el).color, (() => { let e = el; while (e) { const b = getComputedStyle(e).backgroundColor; if (!/rgba\(0, 0, 0, 0\)/.test(b)) return b; e = e.parentElement } })()]))
    if (label === 'wide') for (const [c, fg, bg] of statusPairs) console.log('  contrast', c, ratio(fg, bg))
    const sw = await page.evaluate(() => [document.documentElement.scrollWidth, window.innerWidth])
    console.log(label, 'account url', page.url(), '| scrollWidth/innerWidth', sw.join('/'))
    console.log(label, 'situation shown:', await page.locator('.cx-situation').innerText().catch(() => 'none'))
    await page.reload(); await page.waitForSelector('.cx-situation')
    console.log(label, 'reload keeps situation:', await page.locator('.cx-situation q').innerText())
    await page.locator('.cx-back').click(); await page.waitForSelector('.cx-hit')
    console.log(label, 'Back to results ->', page.url(), (await page.locator('.cx-hit').count()) + ' hits')
    await page.goBack(); await page.waitForSelector('.commons-record'); await page.goBack(); await page.waitForSelector('.cx-hit')
    console.log(label, 'browser back twice ->', page.url())
    await page.goto(base + '/#/problems/usb-c-no-data'); await page.waitForSelector('.commons-record')
    console.log(label, 'old deep link (no q):', await page.locator('.cx-back').innerText(), '| situation shown:', await page.locator('.cx-situation').count())
    await ctx.close()
  }
  console.log('page errors:', errors.length ? errors : 'none')
  await browser.close()
})().catch((e) => { console.error(e); process.exit(1) })
