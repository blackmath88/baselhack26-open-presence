// Deterministic, read-only ingestion of curated PDF LAB material into the workbench.
//
// Reads an allowlist of files from the parent pdf-lab folder, copies their bytes unchanged to
// public/lab/ (served under /lab/), and writes src/generated/lab-data.json: a source/hash
// inventory, the raw evidence documents and the legacy cabinet index. Nothing outside the
// allowlist is copied, no path comes from a request, and no source file is modified.
// Hash checks are recorded, not enforced here: the app shows a mismatch instead of stale evidence.
import { createHash } from 'node:crypto'
import { execFileSync } from 'node:child_process'
import { copyFileSync, existsSync, mkdirSync, readFileSync, readdirSync, rmSync, writeFileSync } from 'node:fs'
import { dirname, join, resolve } from 'node:path'
import { fileURLToPath } from 'node:url'

const WORKBENCH = resolve(dirname(fileURLToPath(import.meta.url)), '..')
const LAB = resolve(WORKBENCH, '..')
const PUBLIC = join(WORKBENCH, 'public', 'lab')
const GENERATED = join(WORKBENCH, 'src', 'generated')

const MANIFESTS = ['output/pdf/manifest.json', 'output/pdf/poems-manifest.json']
const EVIDENCE = ['evidence/poems-results.json', 'evidence/poems-transforms.json']
// Small, uncompressed ASCII fixtures whose bytes the app parses for the mapping reveal.
const FIXTURE_TEXT = ['output/pdf/01-poem-visible.pdf', 'output/pdf/01-poem-other.pdf', 'output/pdf/01-poem-direct.pdf']
const POEM_PREVIEWS = ['visible', 'other', 'direct'].map((n) => `evidence/previews/01-poem-${n}.webp`)
  .concat(['visible', 'other'].flatMap((r) => ['mupdf', 'poppler'].map((e) => `evidence/previews/01-poem-${r}-source-${e}.webp`)))

const sha256 = (bytes) => createHash('sha256').update(bytes).digest('hex')
const read = (rel) => readFileSync(join(LAB, rel))
const media = (rel) => (rel.endsWith('.pdf') ? 'application/pdf' : rel.endsWith('.webp') ? 'image/webp' : 'application/json')

function sourceCommit() {
  try {
    const commit = execFileSync('git', ['-C', LAB, 'rev-parse', 'HEAD'], { encoding: 'utf8' }).trim()
    const dirty = execFileSync('git', ['-C', LAB, 'status', '--porcelain', '--', '.', ':!workbench'], { encoding: 'utf8' }).trim() !== ''
    return { commit, dirty }
  } catch {
    return { commit: null, dirty: null }
  }
}

// Legacy cabinet index: exhibit id, eyebrow, headline and the first recorded preview it shows.
function legacyExhibits() {
  const html = read('index.html').toString('utf8')
  const out = []
  for (const m of html.matchAll(/<article[^>]*id="([^"]+)"([\s\S]*?)<\/article>/g)) {
    const body = m[2]
    const eyebrow = body.match(/class="eyebrow">([^<]*)/)?.[1] ?? null
    const headline = body.match(/<h2>([\s\S]*?)<\/h2>/)?.[1].replace(/<br\s*\/?>/g, ' ').replace(/<[^>]+>/g, '').trim() ?? null
    const preview = body.match(/src="(evidence\/previews\/[^"]+\.webp)"/)?.[1] ?? null
    const files = [...new Set([...body.matchAll(/href="(output\/pdf\/[^"]+\.pdf)"/g)].map((x) => x[1]))]
    out.push({ anchor: m[1], eyebrow, headline, preview, files })
  }
  return out
}

rmSync(PUBLIC, { recursive: true, force: true })
mkdirSync(PUBLIC, { recursive: true })
mkdirSync(GENERATED, { recursive: true })

const problems = []
const manifests = {}
for (const rel of MANIFESTS) {
  try { manifests[rel] = JSON.parse(read(rel).toString('utf8')) } catch (e) { problems.push({ path: rel, problem: `unreadable manifest: ${e.message}` }) }
}

// Every PDF in output/pdf, deduplicated by path; each keeps every manifest entry that names it.
const artefacts = new Map()
for (const file of readdirSync(join(LAB, 'output/pdf')).filter((f) => f.endsWith('.pdf')).sort()) {
  const rel = `output/pdf/${file}`
  const bytes = read(rel)
  const listed = Object.entries(manifests).flatMap(([m, entries]) =>
    Array.isArray(entries) ? entries.filter((e) => e && e.file === file).map((e) => ({ manifest: m, sha256: e.sha256 ?? null, bytes: e.bytes ?? null })) : [])
  artefacts.set(rel, { path: rel, sha256: sha256(bytes), bytes: bytes.length, mediaType: 'application/pdf', listed })
}

const exhibits = legacyExhibits()
const previews = new Set([...POEM_PREVIEWS, ...exhibits.map((e) => e.preview).filter(Boolean)])
for (const rel of previews) {
  if (!existsSync(join(LAB, rel))) { problems.push({ path: rel, problem: 'preview missing' }); continue }
  const bytes = read(rel)
  artefacts.set(rel, { path: rel, sha256: sha256(bytes), bytes: bytes.length, mediaType: media(rel), listed: [] })
}

// Copy bytes unchanged. Only the poem family and legacy previews are published; other PDFs stay
// in the inventory (hash/bytes) and are opened through the legacy cabinet.
const published = new Set([...[...artefacts.keys()].filter((p) => /01-poem-[a-z]+\.pdf$/.test(p)), ...previews])
for (const rel of published) {
  if (!artefacts.has(rel)) continue
  const target = join(PUBLIC, rel)
  mkdirSync(dirname(target), { recursive: true })
  copyFileSync(join(LAB, rel), target)
  artefacts.get(rel).url = `/lab/${rel}`
}

const evidence = {}
for (const rel of EVIDENCE) {
  try {
    const bytes = read(rel)
    evidence[rel] = { sha256: sha256(bytes), raw: JSON.parse(bytes.toString('utf8')) }
    const target = join(PUBLIC, rel)
    mkdirSync(dirname(target), { recursive: true })
    copyFileSync(join(LAB, rel), target)
  } catch (e) {
    evidence[rel] = { sha256: null, raw: null, error: e.message }
  }
}

const fixtures = Object.fromEntries(FIXTURE_TEXT.map((rel) => [rel, read(rel).toString('latin1')]))

const data = {
  schemaVersion: 1,
  source: { root: 'sideprojects/pdf-lab', ...sourceCommit() },
  artefacts: [...artefacts.values()].sort((a, b) => a.path.localeCompare(b.path)),
  evidence,
  fixtures,
  legacy: exhibits,
  problems,
}
// No timestamps: the same sources produce the same file.
writeFileSync(join(GENERATED, 'lab-data.json'), `${JSON.stringify(data, null, 1)}\n`)
const mismatched = data.artefacts.filter((a) => a.listed.some((l) => l.sha256 !== a.sha256))
console.log(`ingest: ${data.artefacts.length} artefacts (${published.size} published), ${Object.keys(evidence).length} evidence files, ${exhibits.length} legacy exhibits, ${mismatched.length} hash mismatches, ${problems.length} problems; source ${data.source.commit?.slice(0, 12) ?? 'unknown'}${data.source.dirty ? ' (dirty)' : ''}`)
