import { expect } from '@playwright/test'
import AxeBuilder from '@axe-core/playwright'
import { mkdirSync, writeFileSync } from 'node:fs'
import { resolve } from 'node:path'

const title = 'Mein Mac erkennt meinen Bilderrahmen nicht.'
const arrival = 'Aus dem PDF Lab: gleiche Seite, andere Lesart. Hier zählt, was bei Erfahrung mitreisen muss.'
const labState = '/lab?probe=b&durchsicht=100&zeile=3'
const canvasState = '/canvas/bilderrahmen-mac?von=lab'

export async function verifyDemoTransition(browser, base, out, capture) {
  const checks = [], errors = [], accessibility = []
  const check = (name) => { checks.push(name); console.log('PASS', name) }
  mkdirSync(out, { recursive: true })
  for (const [label, viewport] of [['desktop', { width: 1440, height: 900 }], ['mobile', { width: 390, height: 844 }]]) {
    const context = await browser.newContext({ viewport, deviceScaleFactor: 2 })
    try {
      const page = await context.newPage()
      page.on('pageerror', error => errors.push(error.message))
      page.on('request', request => {
        if (!['GET', 'HEAD'].includes(request.method())) errors.push(`Unexpected write: ${request.method()} ${request.url()}`)
      })
      async function p1() {
        await expect(page).toHaveURL(base + '/lab')
        await expect(page.locator('.sheetlabel')).toContainText('01-poem-visible.pdf')
        await expect(page.locator('.seg').getByRole('button', { name: 'Seite', exact: true })).toHaveAttribute('aria-pressed', 'true')
        await expect(page.locator('.rp h6').first()).toContainText('Zeile 1')
        await expect(page.getByRole('slider', { name: 'Durchsicht' })).toHaveValue('0')
        await expect(page.locator('.sheetwrap')).toHaveCount(1)
        await expect(page.locator('.lab-workbench')).toHaveAttribute('data-focus', 'false')
        await expect(page.locator('.dock')).toBeVisible()
      }
      async function bridge() {
        await page.getByRole('button', { name: 'Zur menschlichen Erfahrung', exact: true }).click()
        await page.getByRole('dialog').getByRole('link', { name: 'Zur menschlichen Erfahrung', exact: true }).click()
        await expect(page).toHaveURL(base + canvasState)
        await expect(page.getByRole('heading', { name: title, exact: true })).toBeVisible()
        await expect(page.locator('.canvas-arrival')).toContainText(arrival)
        await expect(page.getByText('Noch keine Belege für diese Untersuchung.', { exact: true })).toBeVisible()
        await expect(page.getByRole('link', { name: 'Canvas', exact: true })).toHaveClass(/on/)
      }
      await page.goto(base + '/lab')
      await p1()
      check(`${label}: fresh profile equals P1`)

      const kept = { problemId: 'another-problem', text: 'Unrelated private draft', parentId: 'keep-reply' }
      const seeded = [{ problemId: 'usb-c-no-data', text: 'Private root' }, { problemId: 'usb-c-no-data', parentId: 'parent', text: 'Private reply' }, kept]
      await page.evaluate(drafts => localStorage.setItem('commons.drafts.v1', JSON.stringify(drafts)), seeded)
      const drafts = () => page.evaluate(() => JSON.parse(localStorage.getItem('commons.drafts.v1')))
      await page.getByRole('textbox', { name: 'Lesart Zeile 1', exact: true }).fill('00')
      await page.getByRole('textbox', { name: 'Lesart Zeile 1', exact: true }).press('0')
      await page.getByRole('textbox', { name: 'Lesart Zeile 1', exact: true }).press('0')
      expect(await drafts()).toEqual(seeded)
      await page.goto(base + '/lab?probe=b&ansicht=zeichen&zeile=4&durchsicht=75&vergleich=1&fokus=1&leser=mupdf&zoom=140')
      await expect(page.locator('.lab-workbench')).toHaveAttribute('data-focus', 'true')
      // One press and a held-key repeat keep ordinary reset semantics.
      await page.keyboard.down('0'); await page.keyboard.down('0'); await page.keyboard.up('0')
      await expect(page).toHaveURL(base + '/lab')
      await expect(page.locator('.dock')).not.toBeVisible()
      expect(await drafts()).toEqual(seeded)
      expect(await page.evaluate(() => sessionStorage.getItem('pdf-lab.dock-seen'))).toBe('1')
      await page.waitForTimeout(2100) // Verify the actual two-second boundary.
      await page.keyboard.press('0')
      await expect(page.locator('.dock')).not.toBeVisible()
      expect(await drafts()).toEqual(seeded)
      await page.keyboard.press('0')
      await p1()
      await expect(page.getByRole('status')).toContainText('Demo zurückgesetzt')
      expect(await drafts()).toEqual([kept])
      expect(await page.evaluate(() => history.state.demoReset)).toBeUndefined()
      check(`${label}: input/held-key guards, single reset and timeout preserve drafts; double reset restores P1 and removes only usb-c-no-data drafts`)

      await page.keyboard.press('r')
      await expect(page.getByRole('slider', { name: 'Durchsicht' })).toHaveValue('100')
      await expect(page).toHaveURL(base + '/lab?probe=b&durchsicht=100')
      await page.keyboard.press('ArrowDown')
      await expect(page.locator('.rp h6').first()).toContainText('Zeile 2')
      await page.keyboard.press('ArrowDown')
      await expect(page.locator('.rp h6').first()).toContainText('Zeile 3')
      await page.keyboard.press('f')
      await expect(page.locator('.lab-workbench')).toHaveAttribute('data-focus', 'true')
      await page.keyboard.press('f')
      await expect(page.locator('.lab-workbench')).toHaveAttribute('data-focus', 'false')
      await expect(page).toHaveURL(base + labState)
      await bridge()
      await page.evaluate(() => document.fonts.ready)
      expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true)
      if (capture) await page.screenshot({ path: resolve(out, `01-arrival-${label}.png`), animations: 'disabled' })
      const result = await new AxeBuilder({ page }).withTags(['wcag2a', 'wcag2aa', 'wcag21aa']).analyze()
      accessibility.push({ state: label, violations: result.violations.map(v => ({ id: v.id, targets: v.nodes.map(n => n.target) })) })
      await page.goBack()
      await expect(page).toHaveURL(base + labState)
      await expect(page.locator('.rp h6').first()).toContainText('Zeile 3')
      await expect(page.locator('.dock')).not.toBeVisible()
      await bridge()
      await page.reload()
      await expect(page.locator('.canvas-arrival')).toBeVisible()
      await page.getByRole('link', { name: 'Zurück zur Werkbank', exact: true }).click()
      await expect(page).toHaveURL(base + labState)
      check(`${label}: reset → P1 → R → down twice → F twice → bridge; browser back and arrival link after reload restore the exact lab URL`)

      await bridge()
      await page.getByRole('link', { name: 'Canvas', exact: true }).click()
      await expect(page).toHaveURL(base + '/canvas/bilderrahmen-mac')
      await expect(page.locator('.canvas-arrival')).toHaveCount(0)
      await page.goto(base + canvasState)
      await page.getByRole('link', { name: 'Prüfungen', exact: true }).click()
      await expect(page).toHaveURL(base + '/actions')
      await expect(page.locator('.canvas-arrival')).toHaveCount(0)
      await page.goto(base + '/canvas/bilderrahmen-mac?von=x&query=Mac')
      await expect(page).toHaveURL(base + '/canvas/bilderrahmen-mac?query=Mac')
      await expect(page.locator('.canvas-arrival')).toHaveCount(0)
      await page.goto(base + canvasState)
      await page.getByRole('link', { name: 'Zurück zur Werkbank', exact: true }).click()
      await expect(page).toHaveURL(base + '/lab')
      check(`${label}: navigation drops von, invalid von is removed from the address, and direct arrival returns to /lab defaults`)

      await page.goto(base + canvasState)
      await page.evaluate(drafts => localStorage.setItem('commons.drafts.v1', JSON.stringify(drafts)), seeded)
      await page.getByRole('button', { name: 'Alle Werkzeuge', exact: true }).click()
      const group = page.getByRole('dialog').locator('.ov-cols > div').filter({ has: page.getByRole('heading', { name: 'Werkzeuge', exact: true }) })
      await group.getByRole('button', { name: 'Demo zurücksetzen', exact: true }).click()
      await p1()
      await expect(page.getByRole('status')).toContainText('Demo zurückgesetzt')
      expect(await drafts()).toEqual([kept])
      check(`${label}: launcher reset from canvas restores P1, announces completion and preserves unrelated drafts`)
    } finally { await context.close() }
  }
  writeFileSync(resolve(out, '01-verification.json'), JSON.stringify({ testedAt: new Date().toISOString(), base, checks, errors, accessibility }, null, 2) + '\n')
  expect(errors).toEqual([])
  expect(accessibility.flatMap(a => a.violations)).toEqual([])
}
