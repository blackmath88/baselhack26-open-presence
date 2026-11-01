const { chromium } = require('playwright')
const [,, base, out] = process.argv
const q = encodeURIComponent('My Mac cannot see my frame')
;(async () => {
  const b = await chromium.launch(); const errors = []
  for (const [label, vp] of [['wide', { width: 1440, height: 1000 }], ['narrow', { width: 360, height: 800 }]]) {
    const ctx = await b.newContext({ viewport: vp }); const page = await ctx.newPage()
    page.on('pageerror', (e) => errors.push(e.message))
    await page.goto(base + '/'); await page.getByRole('button', { name: 'Kai' }).click(); await page.waitForSelector('#commons-q')
    await page.evaluate(() => { try { localStorage.setItem('e-opening-seen', '1') } catch {} })
    await page.goto(`${base}/#/compare?ids=reset-after-uboot,ums-drops-during-backup&q=${q}`)
    await page.waitForSelector('.cx-compare-table'); await page.waitForTimeout(400)
    await page.evaluate(() => document.getElementById('cx-compare-summary').scrollIntoView())
    await page.screenshot({ path: `${out}/p2-${label}-compare.png` })
    await page.locator('.cx-compare-table').scrollIntoViewIfNeeded()
    await page.screenshot({ path: `${out}/p2-${label}-table.png` })
    console.log(label, 'sw', await page.evaluate(() => [document.documentElement.scrollWidth, innerWidth].join('/')))
    await ctx.close()
  }
  console.log('errors', errors); await b.close()
})()
