const { chromium } = require('playwright')
const [,, base, out] = process.argv
;(async () => {
  const b = await chromium.launch(); const errors = []
  for (const [label, vp] of [['wide', { width: 1440, height: 1000 }], ['narrow', { width: 360, height: 800 }]]) {
    const ctx = await b.newContext({ viewport: vp }); const page = await ctx.newPage()
    page.on('pageerror', (e) => errors.push(e.message))
    await page.goto(base + '/'); await page.getByRole('button', { name: 'Kai' }).click(); await page.waitForSelector('#commons-q')
    await page.goto(base + '/#/problems/usb-c-no-data?q=' + encodeURIComponent('My Mac cannot see my frame'))
    await page.waitForSelector('.cx-fit'); await page.waitForTimeout(300)
    await page.locator('.cx-fit').scrollIntoViewIfNeeded()
    await page.screenshot({ path: `${out}/p1-${label}-fit.png` })
    await page.locator('.cx-passage-index a', { hasText: 'e3' }).click()
    await page.waitForSelector('.cx-selected'); await page.waitForTimeout(600)
    await page.screenshot({ path: `${out}/p1-${label}-passage.png` })
    console.log(label, page.url(), 'focused:', await page.evaluate(() => document.activeElement?.id))
    await ctx.close()
  }
  console.log('errors', errors); await b.close()
})()
