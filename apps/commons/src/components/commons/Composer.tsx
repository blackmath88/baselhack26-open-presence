/**
 * Draft → preview → submit, for a new experience or a reply/correction. The
 * draft is browser-only until "Submit to shared room"; the preview comes from
 * the server's prepare operation, so what is shown is what gets recorded.
 */
import { useState } from 'react'
import { FileText, Send, Trash2 } from 'lucide-react'
import type { AssistanceDeclaration, CommonsContributionKind } from '../../commons/contracts'
import { ASSISTANCE_DECLARATIONS, COMMONS_CONTRIBUTION_KINDS } from '../../commons/contracts'
import { drafts, type DraftV2 } from '../../commons/client/drafts'
import { journey } from '../../commons/client/journey'
import { ApiError } from '../../lib/api'
import { commonsApi, type PreparedContribution, type ProblemView, type SubmitResult } from '../../commons/client/api'
import { notIncluded, outgoingCommand } from '../../commons/client/outgoing'

export type Relation = 'root' | 'reply' | 'correction' | 'supersedes'

export function Composer({ token, problem, parent, relation, focusEvidence, actorName, query, onSubmitted, onCancel }: {
  token: string
  /** The situation that led here; shown as not included unless the participant typed it into the draft. */
  query?: string
  /** Display name of the session's participant: the voice this contribution will carry. */
  actorName?: string
  problem: ProblemView
  parent?: { id: string; label: string } | null
  relation: Relation
  /** Evidence id to cite as an exact passage when the composer opens ("Respond to this passage"). */
  focusEvidence?: string
  onSubmitted: (result: SubmitResult) => void
  onCancel?: () => void
}) {
  const parentId = relation === 'root' ? undefined : parent?.id
  const existing = drafts.forProblem(problem.problem.postackId, parentId)
  const [draft, setDraft] = useState<DraftV2 | undefined>(existing)
  const [text, setText] = useState(existing?.text ?? '')
  const [circumstances, setCircumstances] = useState(existing?.circumstances ?? '')
  const [kind, setKind] = useState<CommonsContributionKind>(existing?.kind ?? (relation === 'correction' ? 'correction' : relation === 'reply' ? 'question' : 'observation'))
  const [assistance, setAssistance] = useState<AssistanceDeclaration>(existing?.assistance ?? 'none')
  const focused = focusEvidence ? problem.evidence.find((e) => e.id === focusEvidence) : undefined
  const [refs, setRefs] = useState<string[]>(() => {
    const base = existing?.sourceRefs ?? (focused ? [] : relation === 'root' ? [...new Set(problem.evidence.map((e) => e.source.objectId))] : [])
    return focused && !base.includes(focused.source.objectId) ? [...base, focused.source.objectId] : base
  })
  const [passages, setPassages] = useState<string[]>(() => [...new Set([...(existing?.evidenceIds ?? []), ...(focused ? [focused.id] : [])])])
  const togglePassage = (id: string, objectId: string, on: boolean) => {
    setPassages(on ? [...passages, id] : passages.filter((p) => p !== id))
    if (on && !refs.includes(objectId)) setRefs([...refs, objectId])
  }
  const toggleObject = (objectId: string, on: boolean) => {
    setRefs(on ? [...refs, objectId] : refs.filter((r) => r !== objectId))
    // Un-citing an object also un-cites its passages; the server would add the object back otherwise.
    if (!on) setPassages(passages.filter((p) => problem.evidence.find((e) => e.id === p)?.source.objectId !== objectId))
  }
  /** The preview and the draft it was made from; a changed draft makes the preview stale, not silently gone. */
  const [preview, setPreview] = useState<{ prepared: PreparedContribution; of: string } | null>(null)
  const [status, setStatus] = useState<{ kind: 'notice' | 'error'; text: string; retry?: boolean } | null>(null)
  const [busy, setBusy] = useState(false)

  const draftBody = () => ({
    problemId: problem.problem.postackId, text: text.trim(), kind, assistance,
    circumstances: circumstances.trim() || undefined, sourceRefs: refs, ...(passages.length ? { evidenceIds: passages } : {}), parentId, relation: relation === 'root' ? undefined : relation,
  })
  const save = () => {
    if (!text.trim()) return
    const { draft: saved, persisted } = drafts.save({ id: draft?.id, ...draftBody() })
    setDraft(saved)
    setStatus(persisted ? { kind: 'notice', text: 'Draft saved in this browser only. Nobody else can see it.' } : { kind: 'error', text: 'This browser refused local storage; the draft will be lost on reload.' })
  }
  const remove = () => {
    drafts.remove(problem.problem.postackId, parentId)
    setDraft(undefined); setText(''); setCircumstances(''); setPreview(null)
    setStatus({ kind: 'notice', text: 'Draft removed from this browser.' })
  }
  const command = (id: string) => {
    const b = draftBody()
    return {
      commandId: id, problemId: b.problemId, text: b.text, kind: b.kind, assistance: b.assistance, sourceRefs: b.sourceRefs,
      ...(b.evidenceIds ? { evidenceIds: b.evidenceIds } : {}),
      ...(b.circumstances ? { circumstances: b.circumstances } : {}),
      ...(relation === 'reply' && parentId ? { parentId } : {}),
      ...(relation === 'correction' && parentId ? { contradictsId: parentId, parentId } : {}),
      ...(relation === 'supersedes' && parentId ? { supersedesId: parentId } : {}),
      preparedBy: 'browser-draft',
      entrance: 'browser' as const,
    }
  }
  const current = JSON.stringify(draftBody())
  const stale = preview !== null && preview.of !== current
  const doPreview = async () => {
    const saved = draft ?? drafts.save({ ...draftBody() }).draft
    setDraft(saved)
    setBusy(true); setStatus(null)
    try { setPreview({ prepared: await commonsApi.prepare(token, command(saved.id)), of: current }) } catch (e) { setStatus({ kind: 'error', text: e instanceof Error ? e.message : 'Preview failed.' }) } finally { setBusy(false) }
  }
  const submit = async () => {
    const saved = draft ?? drafts.save({ ...draftBody() }).draft
    // Exactly the previewed command: the server's prepared body, the draft id as idempotency key.
    const body = preview && !stale ? outgoingCommand(preview.prepared, saved.id) : undefined
    if (!body) return
    setBusy(true)
    try {
      // Retrying the same draft never duplicates.
      const result = await commonsApi.submit(token, body)
      drafts.remove(problem.problem.postackId, parentId)
      setDraft(undefined); setText(''); setCircumstances(''); setPreview(null)
      setStatus(null) // The confirmation, read back from the room, is shown above the composer.
      if (relation === 'root') {
        const words = text.trim().replace(/^\[[^\]]*\]\s*/, '').split(/\s+/).slice(0, 6).join(' ')
        journey.follow({ contributionId: result.contributionId, problemId: problem.problem.postackId, author: actorName ?? 'this participant', excerpt: words, cites: refs })
      } else journey.mark('reply')
      onSubmitted(result)
    } catch (e) {
      const msg = e instanceof ApiError && e.status === 409
        ? 'An earlier attempt of this draft was already recorded with different words, so this one was not. Your text stays here; remove the draft to start a new one.'
        : e instanceof Error ? e.message : 'Submission failed.'
      setStatus({ kind: 'error', text: msg.includes('draft is still saved') || msg.includes('stays here') ? msg : `${msg} Your text stays in this browser.`, retry: !(e instanceof ApiError && e.status >= 400 && e.status < 500) })
    } finally { setBusy(false) }
  }
  const heading = relation === 'root' ? 'Your experience (private draft)' : relation === 'reply' ? `Reply to ${parent?.label ?? ''}` : relation === 'correction' ? `Correction of ${parent?.label ?? ''} (the original stays)` : `Supersede ${parent?.label ?? ''}`
  const field = parentId ?? 'root'
  return (
    <div className="commons-draft" role="form" aria-label={heading}>
      <h3><FileText size={15} /> {heading}</h3>
      <div className="phf-field">
        <span className="phf-field-k">Voice</span>
        <span>Speaking as <strong>{actorName ?? 'this participant'}</strong> <span className="commons-limit">(prototype participant; switch with Voice above)</span></span>
      </div>
      {focused && (
        <div className="phf-field phf-cited">
          <span className="phf-field-k">Source passage</span>
          <span>{focused.quote ? `“${focused.quote.length > 160 ? `${focused.quote.slice(0, 157)}…` : focused.quote}”` : `passage ${focused.id}`} <span className="commons-limit">— {focused.source.author === 'unknown' ? 'author unknown' : `@${focused.source.author}`}, {focused.source.objectId}, passage {focused.id} ({focused.role})</span></span>
        </div>
      )}
      <label htmlFor={`cm-text-${field}`} className="phf-field-k">{relation === 'root' ? 'What happened for you?' : relation === 'correction' ? 'What is different in your experience?' : 'Your reply or question'}</label>
      <textarea id={`cm-text-${field}`} value={text} onChange={(e) => setText(e.target.value)} rows={4} autoFocus={Boolean(focused) || relation !== 'root'} />
      <label htmlFor={`cm-circ-${field}`} className="phf-field-k">Your circumstances <span className="commons-limit">(device, OS, cable, what you tried — optional)</span></label>
      <input id={`cm-circ-${field}`} value={circumstances} onChange={(e) => setCircumstances(e.target.value)} placeholder="e.g. macOS 15, USB-C cable direct, no hub" />
      <div className="commons-row">
        <label className="phf-field-k">Kind <select value={kind} onChange={(e) => setKind(e.target.value as CommonsContributionKind)}>{COMMONS_CONTRIBUTION_KINDS.map((k) => <option key={k}>{k}</option>)}</select></label>
        <label className="phf-field-k">How it was prepared <select value={assistance} onChange={(e) => setAssistance(e.target.value as AssistanceDeclaration)}>{ASSISTANCE_DECLARATIONS.map((a) => <option key={a} value={a}>{a === 'none' ? 'by me, no AI' : a}</option>)}</select></label>
      </div>
      <details>
        <summary>Sources to cite ({refs.length}{passages.length ? `, ${passages.length} exact passage${passages.length === 1 ? '' : 's'}` : ''})</summary>
        <ul className="commons-refs">
          {[...new Map(problem.evidence.map((e) => [e.source.objectId, e])).values()].map((e) => (
            <li key={e.source.objectId}>
              <label><input type="checkbox" checked={refs.includes(e.source.objectId)} onChange={(ev) => toggleObject(e.source.objectId, ev.target.checked)} /> {e.source.objectId} <span className="commons-limit">(whole source; {e.role}{e.source.author !== 'unknown' ? `, @${e.source.author}` : ''})</span></label>
              <ul className="commons-passages" aria-label={`Passages of ${e.source.objectId}`}>
                {problem.evidence.filter((p) => p.source.objectId === e.source.objectId).map((p) => (
                  <li key={p.id}>
                    <label className="commons-limit"><input type="checkbox" checked={passages.includes(p.id)} onChange={(ev) => togglePassage(p.id, p.source.objectId, ev.target.checked)} /> passage {p.id} · {p.role}{p.source.locator ? ` · ${p.source.locator}` : ''}{p.quote ? ` · “${p.quote.length > 60 ? `${p.quote.slice(0, 57)}…` : p.quote}”` : ''}</label>
                  </li>
                ))}
              </ul>
            </li>
          ))}
        </ul>
      </details>
      <p className="phf-dest"><strong>Destination:</strong> the local shared room of this Commons — not GitHub, not ATProto. Only what the preview shows is sent; no chat or draft history leaves this browser.</p>
      <div className="commons-actions">
        <button className="button" onClick={save} disabled={!text.trim()}>Save draft</button>
        <button className="button" onClick={remove} disabled={!draft}><Trash2 size={14} /> Remove draft</button>
        <button className="button primary" onClick={() => void doPreview()} disabled={!text.trim() || busy}>Preview what leaves</button>
        {onCancel && <button className="button" onClick={onCancel}>Cancel</button>}
      </div>
      {preview && <Disclosure prepared={preview.prepared} stale={stale} actorName={actorName} problem={problem}
        notSent={outgoingCommand(preview.prepared, draft?.id ?? 'draft') ? notIncluded(outgoingCommand(preview.prepared, draft?.id ?? 'draft')!, { query, otherDrafts: drafts.list().filter((d) => d.id !== draft?.id) }) : []}
        busy={busy} onSubmit={() => void submit()} onPreview={() => void doPreview()} />}
      {status && (
        <div className={`banner ${status.kind}`} role={status.kind === 'error' ? 'alert' : 'status'}>
          {status.text}
          {status.retry && preview && !stale && <> <button className="button" onClick={() => void submit()} disabled={busy}>Try again</button></>}
        </div>
      )}
    </div>
  )
}

/** The review step: where it goes, who it speaks as, exactly what is recorded, and what stays here. */
function Disclosure({ prepared, stale, actorName, problem, notSent, busy, onSubmit, onPreview }: {
  prepared: PreparedContribution; stale: boolean; actorName?: string; problem: ProblemView
  notSent: { label: string; detail?: string }[]; busy: boolean; onSubmit: () => void; onPreview: () => void
}) {
  const c = prepared.command
  const passage = (id: string) => problem.evidence.find((e) => e.id === id)
  return (
    <section className={`commons-preview cc-disclosure${stale ? ' stale' : ''}`} aria-labelledby="cc-disclosure-title">
      <h4 id="cc-disclosure-title" className="phf-kicker">Review what will be recorded</h4>
      {stale && <p className="cc-warn" role="status">You changed the draft after this preview. <button className="button" onClick={onPreview} disabled={busy}>Preview again</button></p>}
      {prepared.errors.map((e) => <p key={e} className="banner error">{e}</p>)}
      {prepared.warnings.map((w) => <p key={w} className="commons-near" role="note">{w}</p>)}
      <dl className="cc-kv">
        <dt>Goes to</dt><dd>{prepared.destination.visibility}. Room <code>{prepared.destination.roomId}</code>.</dd>
        <dt>Published</dt><dd>{prepared.destination.publication}</dd>
        {c && <>
          <dt>Speaks as</dt><dd>{actorName ?? 'this participant'} <span className="commons-limit">(the server records the signed-in participant)</span></dd>
          <dt>Exact words</dt><dd><blockquote className="cc-outgoing">{c.text}</blockquote></dd>
          {c.circumstances && <><dt>Circumstances</dt><dd>{c.circumstances}</dd></>}
          <dt>Kind</dt><dd>{c.kind} · prepared {c.assistance === 'none' ? 'by the participant, no AI' : c.assistance}</dd>
          <dt>Cites</dt><dd>{c.sourceRefs.length ? c.sourceRefs.join(', ') : 'nothing'}{c.evidenceIds?.length ? <> · exact passage{c.evidenceIds.length === 1 ? '' : 's'} {c.evidenceIds.map((id) => `${id}${passage(id) ? ` (${passage(id)!.role})` : ''}`).join(', ')}</> : null}</dd>
          {(c.parentId || c.contradictsId || c.supersedesId) && <><dt>Responds to</dt><dd>{c.contradictsId ? `corrects ${c.contradictsId}` : c.supersedesId ? `supersedes ${c.supersedesId}` : `reply to ${c.parentId}`}</dd></>}
          <dt>Stays in this browser</dt><dd><ul className="cc-items">{notSent.map((n) => <li key={n.label}>{n.label}{n.detail ? `: ${n.detail}` : ''}</li>)}</ul></dd>
        </>}
      </dl>
      {c && <button className="button aperture" onClick={onSubmit} disabled={busy || stale}><Send size={14} /> {busy ? 'Submitting…' : 'Submit to the shared room'}</button>}
    </section>
  )
}
