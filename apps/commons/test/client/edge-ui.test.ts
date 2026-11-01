import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import React, { createElement } from 'react'
import { renderToStaticMarkup } from 'react-dom/server'
import type { CommonsContribution } from '../../src/commons/contracts'

const contribution: CommonsContribution = {
  id: 'c-alice', revision: 1, problemId: 'usb-c-no-data', roomId: 'commons:usb-c-no-data',
  kind: 'observation', text: 'A USB hub restored data.', sourceRefs: [],
  actor: { id: 'person:alice', displayName: 'Alice', kind: 'participant' }, submittedBy: 'person:alice',
  assistance: { declared: 'none' }, createdAt: '2026-11-01T12:00:00.000Z',
  origin: { kind: 'local' }, entrance: 'browser', publication: null, links: { app: '#/contributions/c-alice' },
}
// The repository's Node Vitest transform uses classic JSX (the app uses Vite React).
beforeEach(() => vi.stubGlobal('React', React))
afterEach(() => { vi.unstubAllEnvs(); vi.unstubAllGlobals(); vi.resetModules() })

for (const edge of [true, false]) describe(`${edge ? 'hosted' : 'local'} UI boundaries`, () => {
  it('labels the destination and only offers available publication', async () => {
    vi.stubEnv('VITE_COMMONS_EDGE', String(edge))
    const { ContributionCard } = await import('../../src/components/commons/ContributionCard')
    const html = renderToStaticMarkup(createElement(ContributionCard, { c: contribution, token: 'test-session', actorId: 'person:alice', canReview: false }))
    expect(html).toContain('Alice')
    expect(html).toContain(edge ? 'Public on this Commons' : 'local only')
    expect(html.includes('Publish publicly')).toBe(!edge)
  })
  it('keeps hosted failures free of local startup instructions', async () => {
    vi.stubEnv('VITE_COMMONS_EDGE', String(edge))
    const { PhfUnavailable } = await import('../../src/components/phf/PhfShell')
    const html = renderToStaticMarkup(createElement(PhfUnavailable, { error: null }))
    expect(html.includes('npm run dev:server')).toBe(!edge)
    expect(html.includes(':8787')).toBe(!edge)
  })
  it('uses same-origin edge requests even with a local API override', async () => {
    vi.stubEnv('VITE_COMMONS_EDGE', String(edge))
    vi.stubEnv('VITE_API_BASE', 'http://localhost:8787')
    const fetch = vi.fn().mockResolvedValue(new Response('{}', { status: 200 }))
    vi.stubGlobal('fetch', fetch)
    const { commonsApi } = await import('../../src/commons/client/api')
    await commonsApi.search('public', 'frame')
    expect(fetch.mock.calls[0][0]).toBe(`${edge ? '' : 'http://localhost:8787'}/api/commons/search?q=frame&limit=10`)
  })
  it('uses appropriate network error guidance', async () => {
    vi.stubEnv('VITE_COMMONS_EDGE', String(edge))
    vi.stubGlobal('fetch', vi.fn().mockRejectedValue(new Error('offline')))
    const { api } = await import('../../src/lib/api')
    await expect(api.startSession('public')).rejects.toThrow(edge ? 'Commons service is unavailable' : 'npm run dev:server')
  })
})

describe('operator credential handling', () => {
  it('writes owner-only files without printing the reusable code', async () => {
    const { mkdtemp, readFile, readdir, stat, rm } = await import('node:fs/promises')
    const { tmpdir } = await import('node:os')
    const { join } = await import('node:path')
    const { execFileSync } = await import('node:child_process')
    const { fileURLToPath } = await import('node:url')
    const directory = await mkdtemp(join(tmpdir(), 'commons-code-test-'))
    try {
      const output = execFileSync(process.execPath, [fileURLToPath(new URL('../../scripts/edge/issue-contributor.mjs', import.meta.url)), 'alice', 'Alice'], { cwd: directory, encoding: 'utf8' })
      const privateDirectory = join(directory, '.edge-credentials')
      const files = await readdir(privateDirectory)
      const codePath = join(privateDirectory, files.find(file => file.endsWith('.code'))!)
      const sqlPath = join(privateDirectory, files.find(file => file.endsWith('.sql'))!)
      const code = (await readFile(codePath, 'utf8')).trim()
      // Boolean assertions keep credential values out of failed assertion output too.
      expect(code.length >= 32).toBe(true)
      expect(output.includes(code)).toBe(false)
      expect((await readFile(sqlPath, 'utf8')).includes(code)).toBe(false)
      expect((await stat(codePath)).mode & 0o777).toBe(0o600)
      expect((await stat(sqlPath)).mode & 0o777).toBe(0o600)
      expect((await stat(privateDirectory)).mode & 0o777).toBe(0o700)
    } finally { await rm(directory, { recursive: true, force: true }) }
  })
})
