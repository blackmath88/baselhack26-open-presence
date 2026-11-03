import { chromium, expect } from '@playwright/test'
import AxeBuilder from '@axe-core/playwright'
import { mkdirSync, readFileSync, writeFileSync, rmSync } from 'node:fs'
import { createHash } from 'node:crypto'
import { resolve } from 'node:path'

const base = process.env.LAB_URL ?? 'http://127.0.0.1:5197'
const out = resolve(process.env.LAB_REPORT_DIR ?? '../../docs/reports/pdf-lab-werkbank')
const capture = process.env.LAB_CAPTURE === '1'
mkdirSync(out, { recursive: true })
const downloads = resolve(out, '.downloads')
mkdirSync(downloads, { recursive: true })
const browser = await chromium.launch({ headless: true })
const errors = [], optionalServiceErrors = [], checks = [], accessibility = []
const check = name => { checks.push(name); console.log('PASS', name) }
function observe(page) {
  page.on('pageerror', e => errors.push(e.message))
  page.on('response', response => {
    const url = new URL(response.url())
    if (response.status() >= 400 && url.origin === new URL(base).origin) {
      // Production preview has no Commons API. Finden's committed-corpus fallback is intentional.
      const target = url.pathname.startsWith('/api/commons/') ? optionalServiceErrors : errors
      target.push(`${response.status()} ${response.url()}`)
    }
  })
}
async function ready(page) {
  await expect(page.locator('.wb')).toBeVisible()
  await page.evaluate(() => document.fonts.ready)
  await page.waitForFunction(() => [...document.querySelectorAll('.pdf-render')].every(i => i.complete && i.naturalWidth > 0))
}
async function goto(page, query = '') { await page.goto(base + '/lab' + query); await ready(page) }
async function noOverflow(page) {
  const dimensions = await page.evaluate(() => ({ width: innerWidth, scroll: document.documentElement.scrollWidth }))
  expect(dimensions.scroll).toBeLessThanOrEqual(dimensions.width)
}
async function audit(page, state) {
  const result = await new AxeBuilder({ page }).withTags(['wcag2a', 'wcag2aa', 'wcag21aa']).analyze()
  accessibility.push({ state, violations: result.violations.map(v => ({ id: v.id, impact: v.impact, help: v.help, nodes: v.nodes.map(n => ({ target: n.target, summary: n.failureSummary })) })) })
}
async function shot(page, name, viewport) {
  await noOverflow(page)
  if (capture) {
    await page.evaluate(() => scrollTo(0, 0))
    await page.screenshot({ path: resolve(out, `${name}-${viewport}.png`), animations: 'disabled' })
  }
}
try {
  const context = await browser.newContext({ viewport: { width: 1440, height: 900 }, deviceScaleFactor: 2 })
  const page = await context.newPage()
  observe(page)
  await goto(page)
  await expect(page.getByRole('button', { name: 'Schliessen', exact: true })).toBeVisible()
  await expect(page.locator('.sheetlabel')).toContainText('01-poem-visible.pdf')
  await expect(page.locator('.foot')).toContainText('Laufdatum nicht erfasst')
  await audit(page, 'desktop-start')
  check('real initial specimen, unknown run date, one-time assistant introduction')
  await page.getByRole('button', { name: 'Schliessen', exact: true }).click()
  await page.keyboard.press('r')
  await expect(page.getByRole('slider', { name: 'Durchsicht' })).toHaveValue('100')
  await expect(page.locator('.sheetlabel')).toContainText('01-poem-other.pdf')
  await page.keyboard.press('ArrowDown')
  await expect(page.locator('.rp h6').first()).toContainText('Zeile 2')
  await page.keyboard.press('ArrowUp')
  await expect(page.locator('.rp h6').first()).toContainText('Zeile 1')
  for (const [key, view] of [['1', 'Seite'], ['2', 'Text'], ['3', 'Zeichen'], ['4', 'Struktur']]) {
    await page.keyboard.press(key)
    await expect(page.locator('.seg').getByRole('button', { name: view, exact: true })).toHaveAttribute('aria-pressed', 'true')
  }
  await expect(page.locator('.tree')).toContainText('1 Glyphe')
  await expect(page.locator('.rp')).toContainText('/line0')
  check('reveal, four view shortcuts, real whole-line glyph and linked selection')
  await page.getByRole('radio', { name: /^MuPDF/ }).check()
  await expect(page.locator('.foot')).toContainText('1.26.11')
  await page.locator('.chain summary').click()
  await expect(page.locator('.chain details')).toContainText('ToUnicode · Objekt 9')
  await page.getByRole('radio', { name: /^pdftotext/ }).check()
  await expect(page.locator('.foot')).toContainText('26.08.0')
  await page.locator('.table').focus()
  check('reader selection changes real run metadata; raw data exposes the original ToUnicode object')
  await page.keyboard.press('v')
  await expect(page.locator('.sheetwrap')).toHaveCount(2)
  await page.keyboard.press('f')
  await expect(page.locator('.lab-workbench')).toHaveAttribute('data-focus', 'true')
  const linked = page.url()
  await page.reload(); await ready(page)
  await expect(page.locator('.lab-workbench')).toHaveAttribute('data-focus', 'true')
  expect(page.url()).toBe(linked)
  await expect(page.locator('.sheetwrap')).toHaveCount(2)
  await expect(page.locator('.seg').getByRole('button', { name: 'Struktur', exact: true })).toHaveAttribute('aria-pressed', 'true')
  await expect(page.getByRole('button', { name: 'Schliessen', exact: true })).not.toBeVisible()
  await page.keyboard.press('g'); await expect(page.locator('.dock')).toBeVisible()
  await page.keyboard.press('Escape'); await expect(page.locator('.dock')).not.toBeVisible()
  await page.keyboard.press('0')
  await expect(page).toHaveURL(base + '/lab')
  await expect(page.locator('.sheetlabel')).toContainText('01-poem-visible.pdf')
  check('comparison/focus reload, dock shortcut, Escape and reset clear the URL')

  const lines = ['A tide waits under the floor.', 'The house remembers the sea.', 'I open a door in a whisper.', 'Water comes looking for me.']
  for (let i = 0; i < 4; i++) {
    const input = page.getByRole('textbox', { name: `Lesart Zeile ${i + 1}`, exact: true })
    await input.fill(lines[i]); await expect(input).toHaveValue(lines[i])
  }
  // Letters in inputs do not trigger global R/V/F/G shortcuts.
  expect(new URL(page.url()).search).toBe('')
  await page.getByRole('button', { name: 'PDF erzeugen', exact: true }).click()
  await expect(page.getByRole('link', { name: 'PDF herunterladen', exact: true })).toBeVisible()
  await expect(page.locator('.foot .st')).toHaveText('Neu erzeugt · nicht gemessen')
  await expect(page.locator('.chain')).toContainText('Noch kein Leserlauf')
  await expect(page.locator('.foot').getByRole('link', { name: 'Beleg', exact: true })).toHaveCount(0)
  async function download(label, file) {
    const promise = page.waitForEvent('download')
    await page.getByRole('link', { name: label, exact: true }).click()
    const result = await promise
    const path = resolve(downloads, file); await result.saveAs(path); return readFileSync(path)
  }
  const bytes = await download('PDF herunterladen', 'first.pdf')
  const recipe = JSON.parse((await download('Rezept herunterladen', 'recipe.json')).toString())
  expect(bytes.subarray(0, 5).toString()).toBe('%PDF-')
  expect(createHash('sha256').update(bytes).digest('hex')).toBe(recipe.output.sha256)
  expect(recipe.lines).toEqual(lines)
  const generatedUrl = page.url()
  await page.reload(); await ready(page)
  await expect(page.getByRole('link', { name: 'PDF herunterladen', exact: true })).toBeVisible()
  expect(page.url()).toBe(generatedUrl)
  expect(await download('PDF herunterladen', 'restored.pdf')).toEqual(bytes)
  check('real PDF and recipe downloads agree by SHA-256; URL rebuild is byte-identical and unmeasured')
  await page.getByRole('button', { name: 'Zur menschlichen Erfahrung', exact: true }).click()
  await expect(page.getByRole('dialog')).toBeVisible()
  await page.keyboard.press('Tab'); await page.keyboard.press('Tab')
  expect(await page.evaluate(() => document.querySelector('dialog').contains(document.activeElement))).toBe(true)
  await page.keyboard.press('Escape'); await expect(page.getByRole('dialog')).not.toBeVisible()
  await page.getByRole('button', { name: 'Zur menschlichen Erfahrung', exact: true }).click()
  await page.getByRole('dialog').getByRole('link', { name: 'Zur menschlichen Erfahrung', exact: true }).click()
  await expect(page.getByRole('heading', { name: 'Menschliche Erfahrung', exact: true })).toBeVisible()
  await page.getByRole('link', { name: 'Erfahrungen finden' }).click()
  await expect(page).toHaveURL(/\/find\?query=/)
  await page.locator('.topbar').getByRole('button', { name: 'PDF Lab', exact: true }).click()
  await ready(page)
  check('accessible bridge, explicit canvas fallback, real corpus entrance and in-app PDF Lab navigation')

  await page.emulateMedia({ reducedMotion: 'reduce' })
  await page.keyboard.press('r')
  await expect(page.getByRole('slider', { name: 'Durchsicht' })).toHaveValue('100')
  await expect(page.locator('mark.pulse')).toHaveCount(0)
  await page.emulateMedia({ reducedMotion: 'no-preference' })
  check('reduced motion skips reveal animation and pulses')
  await context.close()

  for (const [label, viewport] of [['desktop', { width: 1440, height: 900 }], ['mobile', { width: 390, height: 844 }]]) {
    const context = await browser.newContext({ viewport, deviceScaleFactor: 2 })
    const page = await context.newPage(); observe(page)
    await goto(page); await expect(page.locator('.dock')).toBeVisible(); await shot(page, '01-start', label)
    await page.getByRole('button', { name: 'Schliessen', exact: true }).click()
    await goto(page, '?probe=b&zeile=3&durchsicht=100'); await shot(page, '02-reveal-zeile3', label)
    await goto(page, '?probe=b&ansicht=zeichen&zeile=3'); await shot(page, '03-zeichen', label)
    await audit(page, label + '-glyphs')
    await goto(page, '?probe=b&ansicht=struktur&zeile=3'); await shot(page, '04-struktur', label)
    await goto(page, '?probe=b&vergleich=1&zeile=3'); await expect(page.locator('.sheetwrap')).toHaveCount(2); await shot(page, '05-vergleichen', label)
    await page.goto(generatedUrl); await ready(page); await expect(page.getByRole('link', { name: 'PDF herunterladen', exact: true })).toBeVisible(); await shot(page, '06-eigene-lesart', label)
    await audit(page, label + '-generated')
    await goto(page, '?probe=b&durchsicht=100&fokus=1&zeile=3'); await shot(page, '07-fokus', label)
    await goto(page, '?probe=b&durchsicht=100&zeile=3'); await page.getByRole('button', { name: 'Zur menschlichen Erfahrung', exact: true }).click(); await expect(page.getByRole('dialog')).toBeVisible(); await shot(page, '08-bruecke', label)
    await audit(page, label + '-bridge')
    await context.close()
    check(label + ' eight reference states; no page overflow')
  }
  writeFileSync(resolve(out, 'accessibility.json'), JSON.stringify(accessibility, null, 2) + '\n')
  writeFileSync(resolve(out, 'interactions.json'), JSON.stringify({ testedAt: new Date().toISOString(), base, checks, errors, optionalServiceErrors, generatedPdfSha256: recipe.output.sha256 }, null, 2) + '\n')
  expect(errors).toEqual([])
  expect(accessibility.flatMap(a => a.violations)).toEqual([])
  console.log('PASS PDF Lab workbench browser verification')
} finally {
  await browser.close()
  rmSync(downloads, { recursive: true, force: true })
}
