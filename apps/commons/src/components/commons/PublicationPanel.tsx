/**
 * Explicit publication: preview the exact ATProto record and destination,
 * then publish that payload and nothing else. Missing accounts and failures
 * are shown as actionable states; queued is never called published.
 */
import { useState } from 'react'
import type { CommonsContribution } from '../../commons/contracts'
import { commonsApi, type PreparePublicationResult, type PublishResult } from '../../commons/client/api'

export function PublicationPanel({ token, contribution, onChanged }: { token: string; contribution: CommonsContribution; onChanged?: () => void }) {
  const [prepared, setPrepared] = useState<PreparePublicationResult | null>(null)
  const [result, setResult] = useState<PublishResult | null>(null)
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const receipt = result?.receipt ?? contribution.publication
  const run = async (work: () => Promise<void>) => {
    setBusy(true)
    setError(null)
    try { await work() } catch (e) { setError(e instanceof Error ? e.message : 'Failed.') } finally { setBusy(false) }
  }
  return (
    <div className="commons-preview" role="region" aria-label="Publication">
      {receipt && (
        <p>
          <strong>Publication state:</strong> {receipt.status}
          {receipt.uri && <> · <code>{receipt.uri}</code></>}
          {receipt.lastError && <> · <span className="commons-limit">{receipt.lastError}</span></>}
          {receipt.attempts > 0 && <span className="commons-limit"> · {receipt.attempts} attempt{receipt.attempts === 1 ? '' : 's'}</span>}
        </p>
      )}
      {receipt && (receipt.status === 'failed' || receipt.status === 'queued' || receipt.status === 'publishing') && (
        <button className="button" disabled={busy} onClick={() => void run(async () => { await commonsApi.retryPublications(token); onChanged?.() })}>Retry pending publication</button>
      )}
      {(!receipt || receipt.status === 'local' || receipt.status === 'conflict') && !prepared && (
        <button className="button" disabled={busy} onClick={() => void run(async () => setPrepared(await commonsApi.preparePublication(token, contribution.id)))}>
          Preview the public record
        </button>
      )}
      {prepared && !prepared.ready && (
        <div className="banner notice" role="status">
          <strong>Not ready:</strong> {prepared.message}
          <div className="commons-limit">Activation: mode {prepared.activation.mode}; connected participants: {prepared.activation.configured.join(', ') || 'none'}. {prepared.activation.note}</div>
        </div>
      )}
      {prepared && prepared.ready && (
        <div>
          <p><strong>Destination:</strong> {prepared.destination.handle ? `@${prepared.destination.handle} ` : ''}<code>{prepared.destination.did}</code> on {prepared.destination.service} · collection <code>{prepared.destination.collection}</code> · key <code>{prepared.destination.rkey}</code></p>
          <p className="commons-limit">This writes ONLY the record below to that account's own repository. ATProto repositories are public. The intent expires {prepared.intent.expiresAt.slice(11, 16)} UTC; changing the text or account invalidates it.</p>
          {prepared.warnings.map((w) => <p key={w} className="commons-near" role="note">{w}</p>)}
          <details>
            <summary>Exact record</summary>
            <pre className="commons-json">{JSON.stringify(prepared.preview, null, 2)}</pre>
          </details>
          {!result && (
            <button className="button aperture" disabled={busy} onClick={() => void run(async () => { setResult(await commonsApi.publish(token, prepared.intent.intentId)); onChanged?.() })}>
              {busy ? 'Publishing…' : 'Publish exactly this record'}
            </button>
          )}
        </div>
      )}
      {error && <div className="banner error" role="alert">{error}</div>}
    </div>
  )
}
