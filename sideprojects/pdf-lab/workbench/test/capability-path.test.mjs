import { afterEach, expect, it } from 'vitest'
import { mkdtempSync, readFileSync, readdirSync, rmSync, symlinkSync, writeFileSync } from 'node:fs'
import { tmpdir } from 'node:os'
import { join } from 'node:path'
import { createHash } from 'node:crypto'
import { execFile } from 'node:child_process'
import { promisify } from 'node:util'
import { createService, getExample, parseRequest, validateProject } from '../../capability-path/core.mjs'
import { bend } from '../src/adapters/mappingWriter'
const run = promisify(execFile)
const roots = []
const fresh = () => { const root = mkdtempSync(join(tmpdir(), 'capability-test-')); roots.push(root); return { root, service: createService(root) } }
afterEach(() => { for (const root of roots.splice(0)) rmSync(root, { recursive: true, force: true }) })
const sha = b => createHash('sha256').update(b).digest('hex')
const decode = r => Buffer.from(r.data, 'base64')

it('unchanged example: discover → validate → generate → inspect → retrieve real bytes', async () => {
  const { service } = fresh()
  const caps = await service.get_capabilities()
  expect(caps.version).toBe(1)
  const example = service.get_example({ capability: caps.modules[0].id })
  expect(example).toEqual(JSON.parse(readFileSync(new URL('../../capability-path/examples/two-poems.json', import.meta.url))))
  expect(service.validate_project(example)).toEqual({ valid: true, errors: [] })
  const manifest = await service.render_project(example)
  const pdf = service.retrieve_artifact({ renderId: manifest.renderId, artifactId: 'poem.pdf' })
  const bytes = decode(pdf)
  expect(bytes.subarray(0, 8).toString()).toBe('%PDF-1.4')
  expect(bytes).toEqual(readFileSync(pdf.path))
  expect(bytes.length).toBe(pdf.size)
  expect(sha(bytes)).toBe(pdf.sha256)
  const evidence = JSON.parse(decode(service.retrieve_artifact({ renderId: manifest.renderId, artifactId: 'evidence.json' })))
  const poppler = evidence.observations.find(o => o.engine === 'poppler')
  expect(poppler.sourceSha256).toBe(pdf.sha256)
  if (caps.instruments.poppler.extract.available && caps.instruments.poppler.render.available) {
    expect(poppler.status).toBe('measured')
    for (const line of example.parameters.lines) expect(poppler.runs[0].stdout).toContain(line)
    expect(decode(service.retrieve_artifact({ renderId: manifest.renderId, artifactId: 'poppler.png' })).subarray(1, 4).toString()).toBe('PNG')
  } else expect(['not_run', 'failed']).toContain(poppler.status)
  const second = await service.render_project(example)
  expect(second.artifacts[0].sha256).toBe(pdf.sha256)
}, 20000)

it('compiler is byte-compatible with unchanged workbench writer and lab.py poem', async () => {
  const { root, service } = fresh(), project = getExample()
  project.inspections = []
  const manifest = await service.render_project(project)
  const bytes = decode(service.retrieve_artifact({ renderId: manifest.renderId, artifactId: 'poem.pdf' }))
  const parent = readFileSync(new URL('../../output/pdf/01-poem-other.pdf', import.meta.url))
  expect(bytes).toEqual(Buffer.from(bend(parent, project.parameters.lines)))
  const out = join(root, 'python.pdf')
  await run('python3', [new URL('../../lab.py', import.meta.url).pathname, 'poem', '--lines', ...project.parameters.lines, '--out', out])
  expect(bytes).toEqual(readFileSync(out))
})

it('rejects bad fields with allowed values and fixes, before creating output', async () => {
  const { root, service } = fresh()
  const examples = [null, {}, { ...getExample(), capability: '../bad' }, { ...getExample(), version: 2 }, { ...getExample(), inspections: ['ghostscript'] }, { ...getExample(), output: '/tmp/evil' }, { ...getExample(), parameters: { lines: ['a', 'b', '', 'é'] } }]
  for (const project of examples) {
    const result = validateProject(project)
    expect(result.valid).toBe(false)
    for (const error of result.errors) { expect(error.field).toMatch(/^\$/); expect(error.allowed).toBeDefined(); expect(error.fix).toBeTruthy() }
    await expect(service.render_project(project)).rejects.toThrow()
  }
  expect(readdirSync(root)).toEqual([])
  expect(() => parseRequest('{')).toThrow(/malformed JSON/)
  expect(() => parseRequest(' '.repeat(20000))).toThrow(/exceeds/)
})

it('refuses traversal, unknown IDs, tampered bytes and symlink artifacts', async () => {
  const { root, service } = fresh(), project = getExample(); project.inspections = []
  const manifest = await service.render_project(project), args = { renderId: manifest.renderId, artifactId: 'poem.pdf' }
  expect(() => service.retrieve_artifact({ ...args, renderId: '../outside' })).toThrow()
  expect(() => service.retrieve_artifact({ ...args, artifactId: '../manifest.json' })).toThrow()
  expect(() => service.retrieve_artifact({ ...args, artifactId: 'unknown.pdf' })).toThrow()
  const path = manifest.artifacts[0].path
  writeFileSync(path, 'tampered')
  expect(() => service.retrieve_artifact(args)).toThrow(/integrity/)
  rmSync(path); symlinkSync(join(root, manifest.renderId, 'project.json'), path)
  expect(() => service.retrieve_artifact(args)).toThrow()
})

it('refuses overlapping renders and full stores', async () => {
  const { root, service } = fresh(), project = getExample()
  const first = service.render_project(project)
  await expect(service.render_project(project)).rejects.toThrow(/already running/)
  await first
  // Store quota is a refusal, never a successful manifest.
  for (let i = readdirSync(root).length; i < 100; i++) writeFileSync(join(root, `occupied-${i}`), '')
  await expect(service.render_project(project)).rejects.toThrow(/store full/)
  expect(readdirSync(root).length).toBe(100)
})

it('installed SDK stdio server serves all five tools and retrieves exact PDF bytes', async () => {
  const { root } = fresh()
  const { stdout } = await run('python3', [new URL('../../capability-path/stdio-smoke.py', import.meta.url).pathname, process.execPath], { env: { ...process.env, PDF_LAB_ARTIFACT_ROOT: root }, timeout: 20000 })
  expect(JSON.parse(stdout)).toMatchObject({ status: 'passed', tools: 5, size: 3125 })
}, 25000)

it('removes incomplete render after an interrupted artifact directory write', async () => {
  const { root, service } = fresh()
  const pending = service.render_project(getExample())
  // Simulate storage disappearing while the bounded inspector is in flight.
  for (const dir of readdirSync(root)) rmSync(join(root, dir), { recursive: true, force: true })
  await expect(pending).rejects.toThrow()
  expect(readdirSync(root)).toEqual([])
})
