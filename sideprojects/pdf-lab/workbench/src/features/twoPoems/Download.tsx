// Original-file download that keeps the visitor's place, plus an optional in-browser hash check
// against the inventory (Web Crypto; nothing is sent anywhere).
import { useState } from 'react'
import type { Reading } from '../../adapters/poemsResults'
import { READING_INFO, artefactFor } from './model'

export function Download({ reading }: { reading: Reading }) {
  const a = artefactFor(reading)
  const [check, setCheck] = useState<{ reading: Reading; text: string } | null>(null)
  if (!a?.url) return <p className="notice warn small">Original file unavailable.</p>
  const name = a.path.split('/').pop()!
  const verify = async () => {
    setCheck({ reading, text: 'Checking…' })
    try {
      const bytes = await (await fetch(a.url!)).arrayBuffer()
      const hex = [...new Uint8Array(await crypto.subtle.digest('SHA-256', bytes))].map((b) => b.toString(16).padStart(2, '0')).join('')
      setCheck({ reading, text: hex === a.sha256 ? `Bytes match SHA-256 ${hex.slice(0, 12)}…` : `Mismatch: served bytes hash to ${hex.slice(0, 12)}…, inventory says ${a.sha256.slice(0, 12)}…` })
    } catch (e) {
      setCheck({ reading, text: `Could not check: ${(e as Error).message}` })
    }
  }
  return (
    <div className="download">
      <div className="toolbar-group">
        <a className="btn primary" href={a.url} download={name}>Download original PDF</a>
        <button className="btn" onClick={() => void verify()}>Verify bytes</button>
      </div>
      <span className="small muted" aria-live="polite">
        {check?.reading === reading ? check.text : `${name} · ${a.bytes.toLocaleString('en')} bytes · ${a.integrity === 'verified' ? 'hash matches manifest' : a.integrity}`}
      </span>
      <span className="sr-only">{READING_INFO[reading].label}</span>
    </div>
  )
}
