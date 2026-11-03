import { createHash, randomUUID } from 'node:crypto'
import { constants, closeSync, fstatSync, lstatSync, mkdirSync, openSync, readFileSync, readdirSync, realpathSync, rmSync, writeFileSync } from 'node:fs'
import { createRequire } from 'node:module'
import { join, resolve } from 'node:path'
import { tmpdir } from 'node:os'
import { fileURLToPath } from 'node:url'
import { execFile } from 'node:child_process'
const run = (cmd, args, options) => new Promise(resolve => execFile(cmd, args, { ...options, killSignal: 'SIGKILL' }, (error, stdout, stderr) => resolve({ error, status: error ? error.code : 0, stdout, stderr })))

const HERE = fileURLToPath(new URL('.', import.meta.url))
const LAB = resolve(HERE, '..')
const registry = JSON.parse(readFileSync(join(HERE, 'capabilities.json'), 'utf8'))
const { bend } = createRequire(import.meta.url)('../poems.js')
const sha = bytes => createHash('sha256').update(bytes).digest('hex')
const clone = value => structuredClone(value)
const object = v => v !== null && typeof v === 'object' && !Array.isArray(v)

// Deliberately small JSON Schema subset used by the one reviewed declaration.
function check(schema, value, field, errors) {
  const fail = allowed => errors.push({ field, allowed, fix: `Set ${field} to ${allowed}.` })
  if ('const' in schema && value !== schema.const) fail(JSON.stringify(schema.const))
  if (schema.enum && !schema.enum.includes(value)) fail(schema.enum.map(JSON.stringify).join(' | '))
  if (schema.type && !(schema.type === 'object' ? object(value) : schema.type === 'array' ? Array.isArray(value) : schema.type === 'integer' ? Number.isInteger(value) : typeof value === schema.type)) { fail(schema.type); return }
  if (schema.type === 'object') {
    for (const key of schema.required ?? []) if (!(key in value)) errors.push({ field: `${field}.${key}`, allowed: 'required field', fix: `Add ${field}.${key}; copy its value from get_example.` })
    for (const [key, child] of Object.entries(value)) {
      if (schema.properties?.[key]) check(schema.properties[key], child, `${field}.${key}`, errors)
      else if (schema.additionalProperties === false) errors.push({ field: `${field}.${key}`, allowed: Object.keys(schema.properties).join(', '), fix: `Remove unsupported field ${field}.${key}.` })
    }
  }
  if (schema.type === 'array') {
    if (value.length < (schema.minItems ?? 0) || value.length > (schema.maxItems ?? Infinity)) fail(`${schema.minItems ?? 0}–${schema.maxItems} items`)
    if (schema.uniqueItems && new Set(value).size !== value.length) fail('unique inspection IDs')
    value.forEach((v, i) => check(schema.items, v, `${field}[${i}]`, errors))
  }
  if (schema.type === 'string' && (value.length < (schema.minLength ?? 0) || value.length > (schema.maxLength ?? Infinity) || (schema.pattern && !new RegExp(schema.pattern).test(value)))) fail(`${schema.minLength}–${schema.maxLength} printable ASCII characters (space through ~)`)
}
export function validateProject(project) {
  const errors = []
  if (Buffer.byteLength(JSON.stringify(project) ?? '') > registry.limits.requestBytes) errors.push({ field: '$', allowed: `at most ${registry.limits.requestBytes} bytes`, fix: 'Shorten the request.' })
  check(registry.projectSchema, project, '$', errors)
  if (object(project)) {
    const capability = registry.modules.find(m => m.id === project.capability)
    if (!capability) errors.push({ field: '$.capability', allowed: registry.modules.map(m => m.id).join(', '), fix: 'Use get_example with a supported capability ID.' })
    else {
      if (project.version !== capability.version) errors.push({ field: '$.version', allowed: capability.version, fix: `Set $.version to ${capability.version} for ${capability.id}.` })
      check(capability.inputSchema, project.parameters, '$.parameters', errors)
    }
  }
  return { valid: errors.length === 0, errors }
}
export function parseRequest(text) {
  if (Buffer.byteLength(text) > registry.limits.requestBytes) throw new Error(`$: request exceeds ${registry.limits.requestBytes} bytes; shorten the request.`)
  try { return JSON.parse(text) } catch { throw new Error('$: malformed JSON; use a JSON object with double-quoted keys (get_example provides one).') }
}
export function getExample(id = 'two-poems') {
  const cap = registry.modules.find(m => m.id === id)
  if (!cap) throw new Error('$.capability: allowed two-poems; use get_example two-poems.')
  return JSON.parse(readFileSync(join(HERE, 'examples', `${cap.exampleId}.json`), 'utf8'))
}
export async function getCapabilities() {
  const probe = async (cmd, args) => { const p = await run(cmd, args, { timeout: 2000, maxBuffer: 65536, encoding: 'utf8' }); return { available: !p.error && p.status === 0, diagnostic: p.error?.message ?? null, version: !p.error && p.status === 0 ? (p.stdout + p.stderr).trim() : null } }
  return { ...clone(registry), instruments: { poppler: { extract: await probe('pdftotext', ['-v']), render: await probe('pdftoppm', ['-v']) }, mupdf: await probe('python3', ['-c', 'import fitz; print(fitz.VersionBind, fitz.VersionFitz)']) } }
}
function readBounded(path, max = registry.limits.artifactBytes) {
  const fd = openSync(path, constants.O_RDONLY | constants.O_NOFOLLOW)
  try { const stat = fstatSync(fd); if (!stat.isFile() || stat.size > max) throw new Error('Artifact is not a bounded regular file'); return readFileSync(fd) } finally { closeSync(fd) }
}
export function createService(root = process.env.PDF_LAB_ARTIFACT_ROOT ?? join(tmpdir(), `pdf-lab-capability-${process.getuid?.() ?? 'local'}`)) {
  root = resolve(root)
  let busy = false
  const prepare = () => {
    mkdirSync(root, { recursive: true, mode: 0o700 })
    if (lstatSync(root).isSymbolicLink() || realpathSync(root) !== root) throw new Error('Artifact root must be a real directory without symlink components')
  }
  async function renderProject(project) {
    project = clone(project)
    const validation = validateProject(project)
    if (!validation.valid) throw new Error(JSON.stringify(validation))
    prepare()
    if (readdirSync(root).length >= registry.limits.maxRenders) throw new Error('Artifact store full (100 renders); remove old render directories locally before retrying.')
    const renderId = randomUUID(), dir = join(root, renderId)
    mkdirSync(dir, { mode: 0o700 })
    try {
      const source = readBounded(join(LAB, 'output/pdf/01-poem-other.pdf'), 16384)
      const inventory = JSON.parse(readFileSync(join(LAB, 'output/pdf/poems-manifest.json'), 'utf8'))
      if (sha(source) !== inventory.find(r => r.file === '01-poem-other.pdf').sha256) throw new Error('Authored fixture hash mismatch')
      const bytes = Buffer.from(bend(source, project.parameters.lines))
      const artifacts = []
      let total = 0
      const add = (id, mediaType, data) => {
        total += data.length
        if (data.length > registry.limits.artifactBytes || total > registry.limits.renderBytes) throw new Error('Artifact output budget exceeded')
        const path = join(dir, id)
        writeFileSync(path, data, { flag: 'wx', mode: 0o600 })
        artifacts.push({ id, mediaType, path, sha256: sha(data), size: data.length })
      }
      add('poem.pdf', 'application/pdf', bytes)
      add('project.json', 'application/json', Buffer.from(JSON.stringify(project, null, 2)))
      const observations = []
      for (const engine of ['poppler', 'mupdf']) {
        const observation = { engine, sourceSha256: sha(bytes), origin: 'this_run', status: 'not_run', reason: 'Not requested' }
        if (project.inspections.includes(engine)) {
          const preview = join(dir, `${engine}-working.png`)
          const p = await run('python3', [join(HERE, 'inspect.py'), engine, join(dir, 'poem.pdf'), preview], { timeout: registry.limits.childTimeoutMs, maxBuffer: registry.limits.artifactBytes, encoding: 'utf8' })
          delete observation.reason
          if (p.error || p.status !== 0) Object.assign(observation, { status: 'failed', reason: String(p.error ?? p.stderr), exitCode: p.status })
          else {
            Object.assign(observation, JSON.parse(p.stdout))
            if (observation.status === 'measured') add(`${engine}.png`, 'image/png', readBounded(preview))
          }
          rmSync(preview, { force: true })
        }
        observations.push(observation)
      }
      add('evidence.json', 'application/json', Buffer.from(JSON.stringify({ schema: 'pdf-lab.inspection/v1', observations, limits: { wallMs: 10000, cpuSeconds: 8, addressSpaceMiB: 768, fileMiB: 2 }, gaps: ['native viewer copy/paste', 'physical printing', 'other readers'] }, null, 2)))
      const manifest = { schema: 'pdf-lab.render/v1', renderId, status: 'generated', inspectionStatus: observations.map(({ engine, status }) => ({ engine, status })), capability: project.capability, version: project.version, parentSha256: sha(source), generator: { path: 'poems.js', sha256: sha(readFileSync(join(LAB, 'poems.js'))) }, artifacts }
      writeFileSync(join(dir, 'manifest.json'), JSON.stringify(manifest, null, 2), { flag: 'wx', mode: 0o600 })
      return manifest
    } catch (error) { rmSync(dir, { recursive: true, force: true }); throw error }
  }
  function retrieveArtifact(renderId, artifactId) {
    if (typeof renderId !== 'string' || !/^[a-f0-9]{8}-[a-f0-9]{4}-4[a-f0-9]{3}-[89ab][a-f0-9]{3}-[a-f0-9]{12}$/.test(renderId)) throw new Error('$.renderId: use a render ID returned by render_project')
    prepare()
    const dir = join(root, renderId)
    if (lstatSync(dir).isSymbolicLink() || realpathSync(dir) !== dir) throw new Error('Symlink render directory refused')
    const manifest = JSON.parse(readBounded(join(dir, 'manifest.json')).toString())
    const entry = manifest.artifacts.find(a => a.id === artifactId)
    if (!entry || !/^[a-z-]+\.(pdf|json|png)$/.test(artifactId)) throw new Error('$.artifactId: use an artifact ID listed in the render manifest')
    const path = join(dir, artifactId), bytes = readBounded(path)
    if (sha(bytes) !== entry.sha256 || bytes.length !== entry.size) throw new Error('Artifact integrity mismatch; render the project again')
    return { ...entry, path, encoding: 'base64', data: bytes.toString('base64') }
  }
  return { get_capabilities: getCapabilities, get_example: ({ capability } = {}) => getExample(capability), validate_project: validateProject, render_project: async project => {
    if (busy) throw new Error('A render is already running; retry after it completes.')
    busy = true
    try { return await renderProject(project) } finally { busy = false }
  }, retrieve_artifact: ({ renderId, artifactId }) => retrieveArtifact(renderId, artifactId) }
}
