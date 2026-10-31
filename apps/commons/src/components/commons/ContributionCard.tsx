/**
 * One attributable contribution, rendered the same way wherever it appears
 * (problem view, thread, search). Author, assistance declaration, revision,
 * origin and publication state are always visible; a moderated or deleted
 * record shows only that it is unavailable, never its body.
 */
import { useState } from 'react'
import { CornerDownRight, ExternalLink, EyeOff, Globe, MessageSquare, Pencil } from 'lucide-react'
import type { CommonsContribution, ModeratedContribution, SourceRef } from '../../commons/contracts'
import { appLinks, isModerated } from '../../commons/contracts'
import { commonsApi } from '../../commons/client/api'
import { PublicationPanel } from './PublicationPanel'

export const safeHref = (url: string) => (/^https:\/\/github\.com\//.test(url) ? url : undefined)

export function actorLabel(actor: CommonsContribution['actor']): string {
  if (actor.kind === 'atproto') return actor.displayName ? `@${actor.displayName}` : actor.id
  if (actor.kind === 'import') return actor.id
  return actor.displayName ?? actor.id.replace(/^person:/, '')
}

const PUBLICATION_LABEL: Record<string, string> = {
  local: 'local only', queued: 'queued for publication', publishing: 'publishing…', published: 'published (ATProto)',
  failed: 'publication failed — retryable', conflict: 'publication conflict', stale: 'stale', unavailable: 'unavailable',
}

export function PublicationBadge({ c }: { c: CommonsContribution }) {
  if (c.origin.kind === 'atproto') {
    return <span className={`badge origin-${c.origin.availability}`} title={c.origin.uri}>ATProto · {c.origin.availability}{c.origin.selfPublicationOf ? ' · own' : ''}</span>
  }
  const status = c.publication?.status ?? 'local'
  return <span className={`badge pub-${status}`} title={c.publication?.uri ?? 'Not published anywhere; visible to participants of this local room.'}>{PUBLICATION_LABEL[status] ?? status}</span>
}

function refLabel(ref: NonNullable<CommonsContribution['parent']>): { text: string; href?: string } {
  if (ref.kind === 'local') return { text: ref.id, href: appLinks.contribution(ref.id) }
  if (ref.kind === 'atproto') return { text: ref.uri }
  return { text: `source ${ref.objectId}` }
}

export function SourceRefs({ refs }: { refs: SourceRef[] }) {
  if (!refs.length) return <span className="commons-limit">cites no source excerpt</span>
  return (
    <span>
      cites{' '}
      {refs.map((s, i) => {
        const href = safeHref(s.permalink)
        return (
          <span key={s.objectId}>
            {i > 0 && ', '}
            {href ? <a href={href} target="_blank" rel="noreferrer noopener">{s.objectId} <ExternalLink size={11} /></a> : s.objectId}
            <span className="commons-limit"> ({s.author === 'unknown' ? 'author unknown' : `@${s.author}`})</span>
          </span>
        )
      })}
    </span>
  )
}

export function ContributionCard({ c, token, actorId, canReview, onReply, onCorrect, onChanged, highlight, children }: {
  c: CommonsContribution | ModeratedContribution
  token: string
  actorId: string | null
  canReview: boolean
  onReply?: (c: CommonsContribution) => void
  onCorrect?: (c: CommonsContribution) => void
  onChanged?: () => void
  highlight?: boolean
  children?: React.ReactNode
}) {
  const [busy, setBusy] = useState(false)
  const [publishing, setPublishing] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const moderate = async (action: 'hide' | 'unhide') => {
    setBusy(true)
    setError(null)
    try {
      await commonsApi.moderate(token, { commandId: crypto.randomUUID(), action, contributionId: c.id })
      onChanged?.()
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Moderation failed.')
    } finally {
      setBusy(false)
    }
  }
  if (isModerated(c)) {
    const why = { hidden: 'hidden by local moderation', 'blocked-author': 'author blocked locally', deleted: 'deleted by its author (observed on their repository)', invalid: 'invalid record; not shown as content' }[c.reason]
    return (
      <article className={`commons-card moderated ${highlight ? 'highlight' : ''}`} id={`c-${c.id}`} aria-label={`Unavailable contribution ${c.id}`}>
        <div className="commons-card-head"><EyeOff size={14} /> <strong>Unavailable</strong> · {why} <span className="commons-limit">· {c.id}</span></div>
        {canReview && c.reason === 'hidden' && <button className="button" disabled={busy} onClick={() => void moderate('unhide')}>Unhide locally</button>}
        {error && <div className="banner error" role="alert">{error}</div>}
      </article>
    )
  }
  // A self-published contribution stays the participant's own: the publication panel keeps showing its receipt.
  const own = actorId !== null && c.actor.id === actorId && (c.origin.kind === 'local' || Boolean(c.origin.selfPublicationOf))
  return (
    <article className={`commons-card ${highlight ? 'highlight' : ''}`} id={`c-${c.id}`} aria-label={`${c.kind} by ${actorLabel(c.actor)}`}>
      <div className="commons-card-head">
        <span className={`badge kind-${c.kind}`}>{c.kind}</span>
        <strong>{actorLabel(c.actor)}</strong>
        <span className="commons-limit">· {c.createdAt.slice(0, 16).replace('T', ' ')}{c.revision > 1 ? ` · revision ${c.revision}` : ''}</span>
        <PublicationBadge c={c} />
        {c.assistance.declared !== 'none' && <span className="badge">{c.assistance.declared}{c.assistance.preparedBy ? ` · ${c.assistance.preparedBy}` : ''}</span>}
      </div>
      {c.parent && (
        <div className="commons-limit"><CornerDownRight size={12} /> replies to {refLabel(c.parent).href ? <a href={refLabel(c.parent).href}>{refLabel(c.parent).text}</a> : refLabel(c.parent).text}</div>
      )}
      {c.contradicts && <div className="commons-limit">corrects {refLabel(c.contradicts).href ? <a href={refLabel(c.contradicts).href}>{refLabel(c.contradicts).text}</a> : refLabel(c.contradicts).text} — the original stays visible</div>}
      {c.supersedes && <div className="commons-limit">supersedes {refLabel(c.supersedes).text}</div>}
      <p className="commons-text">{c.text}</p>
      {c.circumstances && <p className="commons-limit"><strong>Conditions:</strong> {c.circumstances}</p>}
      <div className="commons-limit"><SourceRefs refs={c.sourceRefs} /></div>
      {c.origin.kind === 'atproto' && (
        <div className="commons-limit"><Globe size={12} /> owned by {c.origin.handle ? `@${c.origin.handle} (${c.origin.did})` : c.origin.did}; observed {c.origin.retrievedAt.slice(0, 16).replace('T', ' ')} · <code>{c.origin.uri}</code></div>
      )}
      <div className="commons-actions">
        <a className="button" href={appLinks.thread(c.id)}><MessageSquare size={13} /> Thread</a>
        <a className="button" href={appLinks.contribution(c.id)}>Permalink</a>
        {onReply && <button className="button" onClick={() => onReply(c)}>Reply</button>}
        {onCorrect && <button className="button" onClick={() => onCorrect(c)}><Pencil size={13} /> Correct</button>}
        {own && <button className="button" aria-expanded={publishing} onClick={() => setPublishing((v) => !v)}><Globe size={13} /> {c.publication && c.publication.status !== 'local' ? 'Publication…' : 'Publish publicly…'}</button>}
        {canReview && <button className="button" disabled={busy} onClick={() => void moderate('hide')}><EyeOff size={13} /> Hide locally</button>}
      </div>
      {publishing && own && <PublicationPanel token={token} contribution={c} onChanged={onChanged} />}
      {error && <div className="banner error" role="alert">{error}</div>}
      {children}
    </article>
  )
}
