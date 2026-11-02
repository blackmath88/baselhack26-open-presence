// npm run build:edge && node test/client/edge-ux.mjs
// EDGE_HARNESS=workerd runs the same journey against the real Worker bundle in workerd with persisted D1.
// Use an installed Playwright, or set PLAYWRIGHT_MODULE to its index.mjs; no downloads.
// Credentials stay in process memory/IPC and the browser's sessionStorage, never artifacts.
import { fork } from 'node:child_process'
import { randomBytes } from 'node:crypto'
import { mkdir, writeFile } from 'node:fs/promises'
import { resolve } from 'node:path'
const { chromium } = await import(process.env.PLAYWRIGHT_MODULE || 'playwright')
const workerd = process.env.EDGE_HARNESS === 'workerd'
const out = resolve(workerd ? 'test-results/edge-ux-workerd' : 'test-results/edge-ux')
await mkdir(out, { recursive: true })
const log = []
const check = (label, ok) => { if (!ok) throw new Error(label); log.push(`PASS ${label}`); console.log(`PASS ${label}`) }
const harness = fork(workerd ? 'test/client/edge-harness-workerd.mjs' : 'test/client/edge-harness.ts', [], { execArgv: ['--import', 'tsx'], stdio: ['ignore', 'ignore', 'ignore', 'ipc'] })
let sequence = 0
const control = (body) => new Promise((resolve, reject) => {
  const id = ++sequence
  const timeout = setTimeout(() => { harness.off('message', onMessage); reject(new Error('Harness control timed out')) }, 15000)
  const onMessage = message => { if (message.id !== id) return; clearTimeout(timeout); harness.off('message', onMessage); message.error ? reject(new Error(message.error)) : resolve(message) }
  harness.on('message', onMessage)
  harness.send({ id, ...body })
})
const identities = ['Alice', 'Bob', 'Expired'].map(name => ({ name, code: randomBytes(32).toString('base64url') }))
const codes = identities.map(i => i.code)
let browser
const consoleOutput = [], urls = []
const secretFree = value => codes.every(code => !value.includes(code))
const waitFor = async (page, selector) => page.locator(selector).waitFor({ state: 'visible' })
const text = async page => page.locator('body').innerText()
const shot = async (page, name) => {
  check(`safe screenshot ${name}`, secretFree(await page.content()) && await page.locator('input[type=password]').evaluateAll(inputs => inputs.every(input => input.value === '')))
  await page.screenshot({ path: `${out}/${name}.png`, fullPage: true })
}
try {
  const { port } = await control({ action: 'start', identities })
  const origin = `http://127.0.0.1:${port}`
  browser = await chromium.launch({ executablePath: process.env.CHROMIUM || '/usr/bin/chromium', headless: true, args: ['--no-sandbox'] })
  const contexts = await Promise.all([0, 1, 2].map(() => browser.newContext({ viewport: { width: 1440, height: 1000 }, reducedMotion: 'reduce' })))
  const [alice, bob, anonymous] = await Promise.all(contexts.map(context => context.newPage()))
  for (const page of [alice, bob, anonymous]) {
    page.on('console', message => consoleOutput.push(message.text()))
    page.on('pageerror', error => consoleOutput.push(error.message))
    page.on('request', request => urls.push(request.url()))
  }
  const open = async (page, hash = '#/problems/usb-c-no-data') => {
    await page.goto(`${origin}/${hash}`)
    await waitFor(page, '.phf-voice')
    await waitFor(page, '.commons-draft')
  }
  const signIn = async (page, identity) => {
    const input = page.getByLabel('Contributor access code', { exact: true })
    if (!(await input.isVisible())) await page.locator('.phf-voice').click()
    await input.fill(identity.code)
    check('code absent from DOM attributes while entering', secretFree(await page.content()))
    await page.getByRole('button', { name: 'Sign in to contribute', exact: true }).click()
    await page.waitForFunction(name => document.querySelector('.phf-voice')?.textContent.includes(name), identity.name)
    await waitFor(page, '.commons-draft')
  }
  await open(anonymous)
  check('anonymous read-only entrance', (await text(anonymous)).includes('Public reader') && await anonymous.getByRole('button', { name: 'Preview what leaves' }).isDisabled())
  check('edge hides participant picker and legacy workbench', !(await text(anonymous)).includes('Choose a prototype participant') && await anonymous.getByRole('button', { name: /Room workbench/ }).count() === 0)
  await shot(anonymous, '01-public-entrance')
  await open(alice)
  await signIn(alice, identities[0])
  check('contributor session uses sessionStorage only', await alice.evaluate(() => sessionStorage.getItem('phf.edge.session') !== null && localStorage.getItem('br-ai-nstorm.session') === null && localStorage.getItem('phf.edge.session') === null))
  await alice.reload()
  await alice.waitForFunction(() => document.querySelector('.phf-voice')?.textContent.includes('Alice'))
  await waitFor(alice, '.commons-draft')
  check('reload restores contributor session', true)
  const original = 'edge-ux-saffron Alice observed a USB-A hub restoring data on macOS.'
  await alice.locator('.commons-draft textarea').fill(original)
  await alice.getByRole('button', { name: 'Preview what leaves' }).click()
  await waitFor(alice, '.commons-preview')
  check('preview names public destination and author', /public on this Commons website/.test(await alice.locator('.commons-preview').innerText()) && /Voice: Alice/.test(await alice.locator('.commons-preview').innerText()))
  await shot(alice, '02-alice-preview')
  await alice.getByRole('button', { name: 'Submit to shared room' }).click()
  await waitFor(alice, '.phf-recorded')
  const card = alice.locator('.commons-card').filter({ hasText: original })
  await card.waitFor()
  const id = (await card.getAttribute('id')).slice(2)
  check('public card names Alice and hides legacy publication', (await card.innerText()).includes('Alice') && (await card.innerText()).includes('Public on this Commons') && await card.getByRole('button', { name: /Publish|Publication/ }).count() === 0)
  await shot(alice, '03-alice-recorded')
  await open(bob)
  await signIn(bob, identities[1])
  await bob.locator(`#c-${id}`).getByRole('button', { name: 'Reply', exact: true }).click()
  const reply = 'edge-ux-saffron Bob confirms the same hub workaround with a second frame.'
  await bob.locator('.commons-draft textarea').fill(reply)
  await bob.getByRole('button', { name: 'Preview what leaves' }).click()
  await waitFor(bob, '.commons-preview')
  await bob.getByRole('button', { name: 'Submit to shared room' }).click()
  await waitFor(bob, '.phf-recorded')
  await bob.locator('.commons-card').filter({ hasText: reply }).waitFor()
  await shot(bob, '04-bob-reply')
  await anonymous.goto(`${origin}/#/search?q=edge-ux-saffron`)
  await anonymous.getByText(original, { exact: false }).first().waitFor()
  await anonymous.getByText(reply, { exact: false }).first().waitFor()
  check('independent anonymous search rediscovers both authors', (await text(anonymous)).includes('Alice') && (await text(anonymous)).includes('Bob'))
  await shot(anonymous, '05-anonymous-rediscovery')
  await anonymous.goto(`${origin}/#/threads/${id}`)
  await anonymous.locator('.commons-card').filter({ hasText: reply }).waitFor()
  check('anonymous thread retains both contributions', (await text(anonymous)).includes(original) && (await text(anonymous)).includes(reply))
  await shot(anonymous, '06-anonymous-thread')
  // Failure after preview: edit a saved draft, then verify the latest version survives reload.
  const latest = 'edge-ux-draft The latest edited draft must survive failed submission and reload.'
  await alice.locator('.commons-draft textarea').fill('Earlier saved version')
  await alice.getByRole('button', { name: 'Save draft', exact: true }).click()
  await alice.locator('.commons-draft textarea').fill(latest)
  await alice.getByRole('button', { name: 'Preview what leaves' }).click()
  await waitFor(alice, '.commons-preview')
  await control({ action: 'writes', enabled: false })
  await alice.getByRole('button', { name: 'Submit to shared room' }).click()
  await alice.locator('.commons-draft [role=alert]').waitFor()
  check('failed submission retains latest draft and has no success notice', await alice.locator('.commons-draft textarea').inputValue() === latest && await alice.locator('.phf-recorded').count() === 0 && !(await alice.locator('.commons-draft').innerText()).includes('Recorded publicly'))
  await shot(alice, '07-failed-submission')
  await alice.reload()
  await waitFor(alice, '.commons-draft')
  check('failed draft survives reload', await alice.locator('.commons-draft textarea').inputValue() === latest)
  await control({ action: 'writes', enabled: true })
  await alice.getByRole('button', { name: 'Preview what leaves' }).click()
  await waitFor(alice, '.commons-preview')
  await control({ action: 'revoke', name: 'Alice' })
  await alice.getByRole('button', { name: 'Submit to shared room' }).click()
  await alice.locator('.commons-draft [role=alert]').waitFor()
  check('revocation error shown without clearing draft', /revoked or expired/.test(await alice.locator('.commons-draft [role=alert]').innerText()) && await alice.locator('.commons-draft textarea').inputValue() === latest)
  await alice.reload()
  await waitFor(alice, '.commons-draft')
  check('revoked reload recovers public reading with explanation', (await text(alice)).includes('You are reading publicly') && (await text(alice)).includes('Public reader') && await alice.evaluate(() => sessionStorage.getItem('phf.edge.session') === null))
  await shot(alice, '08-revoked-public-recovery')
  await control({ action: 'expire', name: 'Expired' })
  await alice.getByLabel('Contributor access code', { exact: true }).fill(identities[2].code)
  await alice.getByRole('button', { name: 'Sign in to contribute', exact: true }).click()
  await alice.getByText('Unknown, revoked or expired contributor access code.', { exact: true }).waitFor()
  check('expired sign-in remains recoverable and clears password field', await alice.getByLabel('Contributor access code', { exact: true }).inputValue() === '')
  await signIn(alice, identities[1])
  check('valid code recovers from expiry/revocation', await alice.locator('.commons-draft textarea').inputValue() === latest)
  await alice.locator('.phf-voice').click()
  await alice.getByLabel('Contributor access code', { exact: true }).fill(identities[2].code)
  await alice.getByRole('button', { name: 'Sign in to contribute', exact: true }).click()
  await alice.getByText('Unknown, revoked or expired contributor access code.', { exact: true }).waitFor()
  check('failed identity switch keeps sign-in open and current voice', await alice.getByLabel('Contributor access code', { exact: true }).isVisible() && (await alice.locator('.phf-voice').innerText()).includes('Bob'))
  // Even offline, logout must clear the credential and switch the UI to public.
  await contexts[0].setOffline(true)
  await alice.getByRole('button', { name: 'Read without signing in / sign out' }).click()
  await alice.waitForFunction(() => document.querySelector('.phf-voice')?.textContent.includes('Public reader'))
  check('offline logout clears sessionStorage', await alice.evaluate(() => sessionStorage.getItem('phf.edge.session') === null))
  await contexts[0].setOffline(false)
  await control({ action: 'restart' })
  await anonymous.goto(`${origin}/#/search?q=edge-ux-saffron`)
  await anonymous.getByText(reply, { exact: false }).first().waitFor()
  check('after runtime restart anonymous search still rediscovers both authors', (await text(anonymous)).includes(original) && (await text(anonymous)).includes('Alice') && (await text(anonymous)).includes('Bob'))
  await shot(anonymous, '11-after-restart-rediscovery')
  // A slow session bootstrap must not restore a contributor after the person has already signed out.
  const racing = await browser.newContext({ viewport: { width: 1440, height: 1000 }, reducedMotion: 'reduce' })
  await racing.addInitScript(session => { if (!sessionStorage.getItem('raced')) { sessionStorage.setItem('raced', '1'); sessionStorage.setItem('phf.edge.session', session) } },
    JSON.stringify({ token: identities[1].code, actor: { actorId: 'person:bob', displayName: 'Bob', scopes: ['memory:read', 'memory:contribute'] } }))
  let releaseBootstrap
  const bootstrapHeld = new Promise(resolve => { releaseBootstrap = resolve })
  await racing.route('**/api/auth/session', async route => { await bootstrapHeld; await route.continue() }, { times: 1 })
  const racer = await racing.newPage()
  await racer.goto(origin)
  await racer.getByRole('button', { name: 'Read without signing in / sign out' }).click()
  releaseBootstrap()
  await racer.waitForResponse(response => response.url().endsWith('/api/auth/session'))
  await racer.waitForTimeout(500)
  check('delayed bootstrap cannot undo sign-out', (await racer.locator('.phf-voice').innerText()).includes('Public reader') && await racer.evaluate(() => sessionStorage.getItem('phf.edge.session') === null))
  await racing.close()
  await alice.reload()
  await waitFor(alice, '.commons-draft')
  check('logout remains public after reload', (await alice.locator('.phf-voice').innerText()).includes('Public reader'))
  await shot(alice, '09-logout-public')
  await contexts[0].setOffline(true)
  await alice.getByLabel('Contributor access code', { exact: true }).fill(identities[1].code)
  await alice.getByRole('button', { name: 'Sign in to contribute', exact: true }).click()
  await alice.getByText('The Commons service is unavailable. Try again shortly; your saved drafts stay in this browser.', { exact: true }).waitFor()
  check('network failure is recoverable without local service instructions', await alice.getByLabel('Contributor access code', { exact: true }).isVisible())
  await shot(alice, '10-service-unavailable')
  await contexts[0].setOffline(false)
  check('no credential in console, URLs or DOM', secretFree(consoleOutput.join('\n')) && secretFree(urls.join('\n')) && secretFree(await alice.content()) && secretFree(await bob.content()))
  check('no guessed local service URL or legacy API requests', urls.filter(url => url.includes('/api/')).every(url => url.startsWith(origin + '/api/commons/') || url === origin + '/api/auth/session'))
  check('no local-service instructions in hosted UI', !/npm run dev:server|API on :8787|local only|prototype participant/.test(await text(alice)))
  await writeFile(`${out}/checks.txt`, log.join('\n') + '\n')
} catch (error) {
  const message = secretFree(String(error)) ? String(error) : 'Redacted credential-bearing error'
  await writeFile(`${out}/checks.txt`, log.join('\n') + '\nFAIL ' + message + '\n')
  console.error(message)
  process.exitCode = 1
} finally {
  await browser?.close()
  harness.kill()
}
