// Live measurement of a file made in this browser, through the optional local runner. Nothing runs
// until the visitor asks. Live results sit beside, never inside, the original's recorded ones.
import { useEffect, useState } from 'react'
import type { Run } from '../../domain/types'
import { isRunnerError, parseHealth, parseMeasurement, type LiveMeasurement, type RunnerHealth } from '../../adapters/liveRuns'
import { containsLine } from '../../adapters/poemsResults'
import { runnerUrl } from '../live'
import { runsFor } from './model'
import type { BuiltVariant, Parent } from './variant'

type Health = { state: 'checking' } | { state: 'ready'; health: RunnerHealth } | { state: 'unavailable'; reason: string }

export function useRunnerHealth(): [Health, () => void] {
  const [health, setHealth] = useState<Health>({ state: 'checking' })
  const [tick, setTick] = useState(0)
  useEffect(() => {
    let cancelled = false
    setHealth({ state: 'checking' })
    fetch(`${runnerUrl()}/health`, { cache: 'no-store' })
      .then(async (r) => { const body = await r.json(); if (!r.ok) throw new Error(isRunnerError(body) ?? `HTTP ${r.status}`); return parseHealth(body) })
      .then((h) => { if (!cancelled) setHealth({ state: 'ready', health: h }) })
      .catch((e: Error) => { if (!cancelled) setHealth({ state: 'unavailable', reason: e.message }) })
    return () => { cancelled = true }
  }, [tick])
  return [health, () => setTick((t) => t + 1)]
}

export async function measureVariant(variant: BuiltVariant): Promise<LiveMeasurement> {
  const url = runnerUrl()
  const res = await fetch(`${url}/measure`, {
    method: 'POST', cache: 'no-store',
    headers: { 'content-type': 'application/pdf', 'x-pdf-lab-runner': '1', 'x-expect-sha256': variant.recipe.output.sha256 },
    body: variant.bytes as Uint8Array<ArrayBuffer>,
  })
  const body = await res.json()
  if (!res.ok) throw new Error(isRunnerError(body) ?? `HTTP ${res.status}`)
  return parseMeasurement(body, variant.recipe.output.sha256, url)
}

const version = (r: Run) => `${r.instrument.engine} ${r.instrument.wrapper === 'PyMuPDF' ? '' : `${r.instrument.wrapper} `}${r.instrument.version ?? '(version unknown)'}`

/** Did the picture hold? Live pixels of your file vs the original's recorded pixels, same engine only. */
function PixelRow({ live, recorded }: { live: Run | null; recorded: Run | null | undefined }) {
  if (!live) return null
  const same = live.pixelsSha256 !== null && live.pixelsSha256 === recorded?.pixelsSha256
  const crossVersion = recorded && recorded.instrument.version !== null && live.instrument.version !== null && recorded.instrument.version !== live.instrument.version
  return (
    <li className={live.pixelsSha256 === null ? 'mark-no' : same ? 'mark-yes' : 'mark-no'}>
      <span>
        {version(live)}: {live.pixelsSha256 === null ? 'no picture produced' : same ? 'identical pixels to the original\'s recorded render' : 'pixels differ from the original\'s recorded render'}
        <span className="small muted"> · yours <code>{live.pixelsSha256?.slice(0, 12) ?? '—'}…</code> vs recorded <code>{recorded?.pixelsSha256?.slice(0, 12) ?? 'unknown'}…</code>{crossVersion ? ` (recorded with ${recorded!.instrument.version})` : ''}</span>
      </span>
    </li>
  )
}

export function MeasurePanel({ variant, from, measurement, onMeasured }: { variant: BuiltVariant; from: Parent; measurement: LiveMeasurement | null; onMeasured: (m: LiveMeasurement) => void }) {
  const [health, retry] = useRunnerHealth()
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const lines = variant.fixture.kind === 'type3-mapped' ? variant.fixture.lines.map((l) => l.mapped) : []
  const recorded = runsFor(from)
  const run = async () => {
    setBusy(true); setError(null)
    try { onMeasured(await measureVariant(variant)) } catch (e) { setError((e as Error).message) } finally { setBusy(false) }
  }
  return (
    <div className="card panel" aria-labelledby="measure-title">
      <div className="engine-head">
        <h2 id="measure-title">Measure your file</h2>
        <span className={`label ${measurement ? 'live' : ''}`}>{measurement ? `live · ${new Date(measurement.finishedAt).toLocaleTimeString()}` : 'not measured'}</span>
      </div>
      {health.state === 'checking' && <p className="small muted" role="status">Looking for the local runner…</p>}
      {health.state === 'unavailable' && (
        <div className="small">
          <p className="muted" style={{ marginTop: 0 }}>The local runner is not reachable from this browser ({health.reason}). It only listens on this computer. To start it:</p>
          <pre className="excerpt">cd sideprojects/pdf-lab/workbench{'\n'}PDF_CHECK_PYTHON=/path/to/python-with-pymupdf npm run runner</pre>
          <button className="btn" onClick={retry}>Check again</button>
        </div>
      )}
      {health.state === 'ready' && (
        <>
          <p className="small muted" style={{ marginTop: 0 }}>
            Runs {Object.values(health.health.instruments).filter(Boolean).map((i) => `${i!.engine} ${i!.version ?? '(version unknown)'} (${i!.wrapper})`).join(', ')} on your {variant.recipe.output.bytes.toLocaleString('en')} bytes,
            {' '}with the lab's limits ({(health.health.limits.wallMs ?? 0) / 1000} s, {health.health.limits.cpuSeconds ?? '?'} s CPU, {health.health.limits.addressSpaceMiB ?? '?'} MiB) and network {health.health.isolation.network}. Only your PDF is sent, to this computer.
          </p>
          <button className="btn primary" onClick={() => void run()} disabled={busy || health.health.busy}>{busy ? 'Measuring…' : measurement ? 'Measure again' : 'Measure with local engines'}</button>
        </>
      )}
      {error && <p className="notice bad small" role="alert" style={{ marginBottom: 0 }}>Measurement failed: {error}</p>}
      {measurement && (
        <div style={{ marginTop: 12, display: 'grid', gap: 10 }} aria-live="polite">
          <h3 style={{ fontSize: 14, margin: 0 }}>Did your reading arrive?</h3>
          <ul className="check-list">
            {[measurement.runs.mupdf, measurement.runs.pdftotext].map((r) => r && (
              <li key={r.id} className={lines.every((l) => containsLine(r.text, l)) ? 'mark-yes' : 'mark-no'}>
                <span>{version(r)}: {lines.filter((l) => containsLine(r.text, l)).length} of 4 of your lines returned{r.status !== 'ok' ? ` (run ${r.status})` : ''}</span>
              </li>
            ))}
          </ul>
          <h3 style={{ fontSize: 14, margin: 0 }}>Did the picture hold?</h3>
          <ul className="check-list">
            <PixelRow live={measurement.runs.mupdf} recorded={recorded?.mupdf} />
            <PixelRow live={measurement.runs.pdftoppm} recorded={recorded?.pdftoppm} />
          </ul>
          <p className="small muted" style={{ margin: 0 }}>Live runs on {new Date(measurement.finishedAt).toLocaleString()} via {measurement.runs.mupdf?.evidence.path}. Network {measurement.isolation.network}; limits {measurement.isolation.rlimits}. These results are not saved; measure again after reload.</p>
        </div>
      )}
    </div>
  )
}
