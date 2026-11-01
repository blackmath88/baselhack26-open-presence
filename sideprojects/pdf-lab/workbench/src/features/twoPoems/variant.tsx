// A file the visitor makes in this browser from four lines. Rebuilt from the URL (parent + lines),
// so reload, back and a shared link reproduce the same bytes. Never measured by an engine here.
import { useEffect, useRef, useState } from 'react'
import type { MappingRecipe } from '../../domain/types'
import { latin1, lineProblem } from '../../adapters/mappingWriter'
import { makeRecipe, parseRecipe } from '../../adapters/recipe'
import { changedObjects, parseTwoPoemFixture, type TwoPoemFixture } from '../../adapters/twoPoemFixture'
import { READING_INFO, artefactFor, lab, mappedLines, previewUrl, runsFor, selectVariantLine } from './model'
import { PageStage } from './Stage'
import { EvidenceLink } from './Inspector'
import { RunOutput } from './Readings'
import type { LiveMeasurement } from '../../adapters/liveRuns'
import { containsLine } from '../../adapters/poemsResults'

export type Parent = 'visible' | 'other'
export type Lines = [string, string, string, string]

export interface BuiltVariant {
  recipe: MappingRecipe
  bytes: Uint8Array
  url: string
  fixture: TwoPoemFixture
  changed: Array<{ number: number; role: string }>
}

export type VariantState = { status: 'building' } | { status: 'ready'; variant: BuiltVariant } | { status: 'error'; message: string }

export function useVariant(from: Parent, lines: Lines | undefined): VariantState | null {
  const [state, setState] = useState<VariantState | null>(null)
  const key = lines ? `${from}\u0000${lines.join('\u0000')}` : ''
  useEffect(() => {
    if (!lines) { setState(null); return }
    let cancelled = false
    let url: string | null = null
    setState({ status: 'building' })
    void (async () => {
      try {
        const parent = artefactFor(from)
        if (!parent?.url) throw new Error(`${READING_INFO[from].file} is not available`)
        const res = await fetch(parent.url)
        if (!res.ok) throw new Error(`could not read the parent file (HTTP ${res.status})`)
        const parentBytes = new Uint8Array(await res.arrayBuffer())
        const { recipe, bytes } = await makeRecipe({ path: parent.path, sha256: parent.sha256, bytes: parentBytes }, lines)
        const fixture = parseTwoPoemFixture(latin1(bytes))
        const changed = changedObjects(latin1(parentBytes), latin1(bytes))
        url = URL.createObjectURL(new Blob([bytes as Uint8Array<ArrayBuffer>], { type: 'application/pdf' }))
        if (!cancelled) setState({ status: 'ready', variant: { recipe, bytes, url, fixture, changed } })
      } catch (e) {
        if (!cancelled) setState({ status: 'error', message: (e as Error).message })
      }
    })()
    return () => { cancelled = true; if (url) URL.revokeObjectURL(url) }
  }, [key])
  return state
}

const short = (h: string) => `${h.slice(0, 12)}…`

/** Parent → recipe → your file, with hashes. `expected` is the hash an imported recipe recorded. */
export function Lineage({ variant, expected, measuredAt }: { variant: BuiltVariant; expected?: string; measuredAt?: string }) {
  const { recipe, changed } = variant
  return (
    <div className="card panel lineage" aria-label="Lineage">
      <ol className="lineage-steps">
        <li><span className="kind kind-parsed">original</span><strong>{recipe.parent.path.split('/').pop()}</strong><code className="small">{short(recipe.parent.sha256)}</code><span className="small muted">verified against the inventory</span></li>
        <li><span className="kind kind-authored">your recipe</span><strong>4 lines</strong><span className="small muted">rewrites object {variant.fixture.kind === 'type3-mapped' ? variant.fixture.toUnicodeObject : '?'} only</span></li>
        <li><span className={`kind ${measuredAt ? 'kind-measured' : 'kind-unknown'}`}>your file</span><strong>made in this browser</strong><code className="small">{short(recipe.output.sha256)}</code><span className="small muted">{recipe.output.bytes.toLocaleString('en')} bytes · {measuredAt ? `measured live ${new Date(measuredAt).toLocaleTimeString()}` : 'not measured'}</span></li>
      </ol>
      <p className="small muted" style={{ margin: '8px 0 0' }}>
        Objects that differ from the original: {changed.map((c) => `${c.number} (${c.role})`).join(', ') || 'none'}; byte offsets after it shift.
        {expected && (expected === recipe.output.sha256
          ? <strong className="mark-yes"> Rebuilt bytes match the recipe's recorded hash.</strong>
          : <strong className="mark-no"> Rebuilt bytes do not match the recipe's recorded hash ({short(expected)}).</strong>)}
      </p>
    </div>
  )
}

export function VariantDownload({ variant, measured }: { variant: BuiltVariant; measured?: boolean }) {
  const name = `my-two-poems-${variant.recipe.output.sha256.slice(0, 8)}`
  const recipeUrl = useBlobUrl(JSON.stringify(variant.recipe, null, 2) + '\n', 'application/json')
  return (
    <div className="download">
      <div className="toolbar-group">
        <a className="btn primary" href={variant.url} download={`${name}.pdf`}>Download your PDF</a>
        {recipeUrl && <a className="btn" href={recipeUrl} download={`${name}.recipe.json`}>Recipe</a>}
      </div>
      <span className="small muted">{name}.pdf · {variant.recipe.output.bytes.toLocaleString('en')} bytes · {measured ? 'measured live' : 'not measured'}</span>
    </div>
  )
}

function useBlobUrl(text: string, type: string): string | null {
  const [url, setUrl] = useState<string | null>(null)
  useEffect(() => {
    const u = URL.createObjectURL(new Blob([text], { type }))
    setUrl(u)
    return () => URL.revokeObjectURL(u)
  }, [text, type])
  return url
}

export function VariantStage({ variant, from, line, reveal, onSelect, measurement }: { variant: BuiltVariant; from: Parent; line: number | null; reveal: boolean; onSelect: (n: number) => void; measurement: LiveMeasurement | null }) {
  const fx = variant.fixture
  const lines = fx.kind === 'type3-mapped' ? fx.lines.map((l, i) => ({ drawn: l.drawn, mapped: l.mapped, region: selectVariantLine(fx, variant.recipe.output.sha256, i)!.region })) : []
  const onlyMap = variant.changed.length === 1 && variant.changed[0]!.role === 'ToUnicode character map'
  const recordedMupdf = runsFor(from)?.mupdf.pixelsSha256
  const live = measurement?.runs.mupdf
  const exact = live?.pixelsSha256 != null && live.pixelsSha256 === recordedMupdf
  const caption = live
    ? exact
      ? <><span className="label live">Measured</span><span>Your file, rendered live by MuPDF {live.instrument.version}, gives pixels identical to this recorded picture of the original, so it shows your file exactly.</span></>
      : <><span className="label">Original's recorded render</span><span>Measured live: your file's MuPDF pixels differ from this picture of the original. Open your download to see it drawn.</span></>
    : <><span className="label">Original's recorded render</span><span>Your file has not been rendered. {onlyMap ? 'Only its character map differs from the original, so this is the original\'s recorded MuPDF picture;' : 'It differs from the original in more than its character map, so this picture may not match it;'} measure it below, or open your download in a PDF reader.</span></>
  return (
    <PageStage src={previewUrl(from)} label="Your file: page" lines={lines} line={line} reveal={reveal} onSelect={onSelect}
      alt={`Recorded MuPDF render of the original ${READING_INFO[from].label.toLowerCase()} file, standing in for your unrendered file`}
      caption={caption} />
  )
}

export function VariantInspector({ variant, line, onClose, headingRef, measurement }: { variant: BuiltVariant; line: number; onClose: () => void; headingRef: React.Ref<HTMLHeadingElement>; measurement: LiveMeasurement | null }) {
  const fx = variant.fixture
  const sel = selectVariantLine(fx, variant.recipe.output.sha256, line - 1)
  if (!sel || fx.kind !== 'type3-mapped') return null
  const l = fx.lines[line - 1]!
  const tuLine = fx.toUnicodeStream.split('\n').find((x) => x.startsWith(`<${l.code}>`))
  return (
    <aside className="card inspector" aria-labelledby="inspector-title" onKeyDown={(e) => { if (e.key === 'Escape') onClose() }}>
      <div className="inspector-head">
        <div><p className="eyebrow" style={{ margin: 0 }}>Your file</p><h2 id="inspector-title" ref={headingRef} tabIndex={-1}>Line {line}</h2></div>
        <button className="btn quiet" onClick={onClose} aria-label="Close inspector">Close</button>
      </div>
      <section><h3>You see</h3><p className="quote">{l.drawn}</p></section>
      <section>
        <h3>Your file says it means</h3>
        <p className="quote alt">{l.mapped}</p>
        <details style={{ marginTop: 8 }}><summary>Show the bytes</summary><pre className="excerpt">{tuLine}</pre></details>
      </section>
      <section>
        <h3>Readers returned {measurement && <span className="label live">live</span>}</h3>
        {measurement ? (
          <dl className="kv">
            {[measurement.runs.mupdf, measurement.runs.pdftotext].map((run) => run && [
              <dt key={`${run.id}-t`}>{run.instrument.engine} {run.instrument.version ?? '(version unknown)'} <span className="muted">({run.instrument.wrapper})</span></dt>,
              <dd key={`${run.id}-d`}>{containsLine(run.text, l.mapped) ? <span className="mark-yes">“{l.mapped}”</span> : <span className="mark-no">not returned</span>}</dd>,
            ])}
          </dl>
        ) : <p className="notice warn small" style={{ margin: 0 }}>Not measured. No PDF engine has read this file yet. Use <strong>Measure your file</strong>, or run <code>pdftotext -layout</code> on your download.</p>}
      </section>
      <section>
        <h3>How we know</h3>
        <ol className="chain">
          {sel.correspondences.map((c, i) => (
            c.kind === 'unknown' && measurement ? (
              <li key={i}><span className="kind kind-measured">live run</span><span>Measured on this computer at {new Date(measurement.finishedAt).toLocaleTimeString()}: {[measurement.runs.mupdf, measurement.runs.pdftotext].filter(Boolean).map((r) => `${r!.instrument.engine} ${r!.instrument.wrapper} ${containsLine(r!.text, l.mapped) ? 'returned it' : 'did not return it'}`).join('; ')}.</span></li>
            ) : <li key={i}><span className={`kind kind-${c.kind}`}>{c.kind === 'parsed' ? 'parsed from your file' : 'unknown'}</span><span>{c.statement}</span></li>
          ))}
        </ol>
      </section>
    </aside>
  )
}

/** Four inputs, prefilled from the current mapping, validated as the writer validates. */
export function AuthorPanel({ initial, focusLine, onBuild, onImport, legacyUrl }: {
  initial: Lines
  focusLine: number | null
  onBuild: (lines: Lines) => void
  onImport: (lines: Lines, from: Parent | null, expected: string) => void
  legacyUrl: string
}) {
  const [lines, setLines] = useState<Lines>(initial)
  const [importMessage, setImportMessage] = useState<string | null>(null)
  const inputs = useRef<Array<HTMLInputElement | null>>([])
  useEffect(() => { setLines(initial) }, [initial.join('\u0000')])
  useEffect(() => { if (focusLine) inputs.current[focusLine - 1]?.focus() }, [focusLine])
  const problems = lines.map(lineProblem)
  const unchanged = lines.every((l, i) => l === initial[i])
  const readRecipe = async (file: File) => {
    try {
      if (file.size > 64 * 1024) throw new Error('that file is too large to be a recipe')
      const r = parseRecipe(JSON.parse(await file.text()))
      const from = r.parent ? (Object.entries(READING_INFO).find(([, i]) => i.file === r.parent!.path)?.[0] as Parent | undefined) ?? null : null
      if (r.parent && (!from || artefactFor(from)?.sha256 !== r.parent.sha256)) throw new Error(`its parent (${r.parent.path}, ${r.parent.sha256.slice(0, 12)}…) is not a file this workbench has`)
      setImportMessage(`Read a ${r.format} recipe from ${file.name}. The lineage above shows whether the rebuilt bytes match its recorded hash.`)
      onImport(r.lines, from, r.outputSha256)
    } catch (e) {
      setImportMessage(`Could not use that recipe: ${(e as Error).message}`)
    }
  }
  return (
    <div className="card panel" id="author">
      <h2>Write your own second reading</h2>
      <p className="muted" style={{ marginTop: 4 }}>Keep the drawn poem. Change what its character map says. Your browser rewrites the real file; nothing is sent anywhere.</p>
      <form className="author-form" onSubmit={(e) => { e.preventDefault(); if (problems.every((p) => p === null)) onBuild(lines) }}>
        {lines.map((value, i) => (
          <label key={i} className="author-line">
            <span className="author-k">Line {i + 1} <span className="muted">· drawn: {mappedLines('visible')?.[i]}</span></span>
            <input ref={(el) => { inputs.current[i] = el }} value={value} maxLength={40} spellCheck={false} aria-invalid={problems[i] !== null} aria-describedby={`author-help-${i}`}
              onChange={(e) => { const next = [...lines] as Lines; next[i] = e.target.value; setLines(next) }} />
            <span id={`author-help-${i}`} className={`small ${problems[i] ? 'mark-no' : 'muted'}`}>{problems[i] ?? `${value.length}/32`}</span>
          </label>
        ))}
        <div className="toolbar-group">
          <button className="btn primary" type="submit" disabled={problems.some((p) => p !== null)}>{unchanged ? 'Build this PDF' : 'Build my PDF'}</button>
          <label className="btn">Open a recipe…<input type="file" accept="application/json,.json" className="sr-only" onChange={(e) => { const f = e.target.files?.[0]; if (f) void readRecipe(f); e.target.value = '' }} /></label>
        </div>
        <p className="small muted" style={{ margin: 0 }}>Four printable ASCII lines, 1–32 characters each: the same limit as the lab's writer. Recipes are read locally. <a href={legacyUrl || undefined} target="_blank" rel="noreferrer">Legacy form ↗</a></p>
        {importMessage && <p className="small" role="status" style={{ margin: 0 }}>{importMessage}</p>}
      </form>
    </div>
  )
}

/** Extracted text has not been measured for a file made here; say so and show how to measure it. */
export function VariantText({ variant, measurement, line }: { variant: BuiltVariant; measurement: LiveMeasurement | null; line: number | null }) {
  const fx = variant.fixture
  if (measurement) {
    const needle = line !== null && fx.kind === 'type3-mapped' ? fx.lines[line - 1]?.mapped : undefined
    return (
      <div className="stage card">
        <div className="stage-intro"><p>What two PDF readers extracted from <strong>your file</strong>, measured live on this computer. {needle ? 'The selected line is marked.' : 'Select a line to mark it.'}</p></div>
        <div className="side-by-side">
          {measurement.runs.mupdf && <RunOutput run={measurement.runs.mupdf} needle={needle} />}
          {measurement.runs.pdftotext && <RunOutput run={measurement.runs.pdftotext} needle={needle} />}
        </div>
      </div>
    )
  }
  return (
    <div className="stage card">
      <div className="stage-intro"><p>No engine has read your file yet, so there is no extracted text to show; use <strong>Measure your file</strong> below. What its character map says, parsed from its bytes:</p></div>
      <pre className="text-out">{fx.kind === 'type3-mapped' ? fx.lines.map((l) => l.mapped).join('\n') : ''}</pre>
      <p className="small muted" style={{ margin: 0 }}>Measure it yourself: <code>pdftotext -layout my-two-poems-{variant.recipe.output.sha256.slice(0, 8)}.pdf -</code>. The original's runs (<EvidenceLink evidence={{ path: 'evidence/poems-results.json', sourceCommit: lab.data?.source.commit ?? null, pointer: '/runs/other' }} />) show Poppler may reorder lines.</p>
    </div>
  )
}

