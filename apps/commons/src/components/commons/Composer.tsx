/**
 * Draft → preview → submit, for a new experience or a reply/correction. The
 * draft is browser-only until "Submit to shared room"; the preview comes from
 * the server's prepare operation, so what is shown is what gets recorded.
 */
import { useEffect, useState } from 'react'
import { FileText, Send, Trash2 } from 'lucide-react'
import type { AssistanceDeclaration, CommonsContributionKind } from '../../commons/contracts'
import { ASSISTANCE_DECLARATIONS, COMMONS_CONTRIBUTION_KINDS } from '../../commons/contracts'
import { drafts, type DraftV2 } from '../../commons/client/drafts'
import { commonsApi, type PreparedContribution, type ProblemView, type SubmitResult } from '../../commons/client/api'

export type Relation = 'root' | 'reply' | 'correction' | 'supersedes'

export function Composer({ token, problem, parent, relation, onSubmitted, onCancel }: {
  token: string
  problem: ProblemView
  parent?: { id: string; label: string } | null
  relation: Relation
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
  const [refs, setRefs] = useState<string[]>(existing?.sourceRefs ?? (relation === 'root' ? [...new Set(problem.evidence.map((e) => e.source.objectId))] : []))
  const [preview, setPreview] = useState<PreparedContribution | null>(null)
  const [status, setStatus] = useState<{ kind: 'notice' | 'error'; text: string } | null>(null)
  const [busy, setBusy] = useState(false)
  useEffect(() => { setPreview(null) }, [text, circumstances, kind, assistance, refs])

  const draftBody = () => ({
    problemId: problem.problem.postackId, text: text.trim(), kind, assistance,
    circumstances: circumstances.trim() || undefined, sourceRefs: refs, parentId, relation: relation === 'root' ? undefined : relation,
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
      ...(b.circumstances ? { circumstances: b.circumstances } : {}),
      ...(relation === 'reply' && parentId ? { parentId } : {}),
      ...(relation === 'correction' && parentId ? { contradictsId: parentId, parentId } : {}),
      ...(relation === 'supersedes' && parentId ? { supersedesId: parentId } : {}),
      preparedBy: 'browser-draft',
      entrance: 'browser' as const,
    }
  }
  const doPreview = async () => {
    if (!draft) save()
    setBusy(true)
    try { setPreview(await commonsApi.prepare(token, command(draft?.id ?? 'preview'))) } catch (e) { setStatus({ kind: 'error', text: e instanceof Error ? e.message : 'Preview failed.' }) } finally { setBusy(false) }
  }
  const submit = async () => {
    const saved = draft ?? drafts.save({ ...draftBody() }).draft
    setBusy(true)
    try {
      // The draft id is the idempotency key: retrying the same draft never duplicates.
      const result = await commonsApi.submit(token, command(saved.id))
      drafts.remove(problem.problem.postackId, parentId)
      setDraft(undefined); setText(''); setCircumstances(''); setPreview(null)
      setStatus({ kind: 'notice', text: result.replayed ? 'Already recorded earlier — no duplicate created.' : 'Recorded in the local shared room.' })
      onSubmitted(result)
    } catch (e) {
      const msg = e instanceof Error ? e.message : 'Submission failed.'
      setStatus({ kind: 'error', text: msg.includes('draft is still saved') ? msg : `${msg} The draft stays in this browser.` })
    } finally { setBusy(false) }
  }
  const heading = relation === 'root' ? 'Your experience (private draft)' : relation === 'reply' ? `Reply to ${parent?.label ?? ''}` : relation === 'correction' ? `Correction of ${parent?.label ?? ''} (the original stays)` : `Supersede ${parent?.label ?? ''}`
  return (
    <div className="commons-draft" role="form" aria-label={heading}>
      <h3><FileText size={15} /> {heading}</h3>
      <label htmlFor={`cm-text-${parentId ?? 'root'}`}>What happened for you?</label>
      <textarea id={`cm-text-${parentId ?? 'root'}`} value={text} onChange={(e) => setText(e.target.value)} rows={4} />
      <div className="commons-row">
        <label>Kind <select value={kind} onChange={(e) => setKind(e.target.value as CommonsContributionKind)}>{COMMONS_CONTRIBUTION_KINDS.map((k) => <option key={k}>{k}</option>)}</select></label>
        <label>Prepared <select value={assistance} onChange={(e) => setAssistance(e.target.value as AssistanceDeclaration)}>{ASSISTANCE_DECLARATIONS.map((a) => <option key={a} value={a}>{a === 'none' ? 'by me, no AI' : a}</option>)}</select></label>
      </div>
      <label htmlFor={`cm-circ-${parentId ?? 'root'}`}>Your circumstances (optional)</label>
      <input id={`cm-circ-${parentId ?? 'root'}`} value={circumstances} onChange={(e) => setCircumstances(e.target.value)} />
      <details open={relation === 'root'}>
        <summary>Source excerpts to cite ({refs.length})</summary>
        <ul className="commons-refs">
          {[...new Map(problem.evidence.map((e) => [e.source.objectId, e])).values()].map((e) => (
            <li key={e.source.objectId}>
              <label><input type="checkbox" checked={refs.includes(e.source.objectId)} onChange={(ev) => setRefs(ev.target.checked ? [...refs, e.source.objectId] : refs.filter((r) => r !== e.source.objectId))} /> {e.source.objectId} <span className="commons-limit">({e.role}{e.source.author !== 'unknown' ? `, @${e.source.author}` : ''})</span></label>
            </li>
          ))}
        </ul>
      </details>
      <div className="commons-actions">
        <button className="button" onClick={save} disabled={!text.trim()}>Save draft</button>
        <button className="button" onClick={remove} disabled={!draft}><Trash2 size={14} /> Remove draft</button>
        <button className="button" onClick={() => void doPreview()} disabled={!text.trim() || busy}>Preview</button>
        {onCancel && <button className="button" onClick={onCancel}>Cancel</button>}
      </div>
      {preview && (
        <div className="commons-preview" role="region" aria-label="Submission preview">
          <p><strong>Destination:</strong> {preview.destination.visibility}; room <code>{preview.destination.roomId}</code>. {preview.destination.publication}</p>
          {preview.errors.map((e) => <p key={e} className="banner error">{e}</p>)}
          {preview.warnings.map((w) => <p key={w} className="commons-near" role="note">{w}</p>)}
          {preview.command && (
            <>
              <p><strong>Exact content:</strong> {preview.command.text}</p>
              <p className="commons-limit">kind {preview.command.kind} · prepared: {preview.command.assistance} · cites {preview.command.sourceRefs.join(', ') || 'nothing'}{preview.command.parentId ? ` · in reply to ${preview.command.parentId}` : ''}{preview.command.contradictsId ? ` · corrects ${preview.command.contradictsId}` : ''}</p>
              <button className="button aperture" onClick={() => void submit()} disabled={busy}><Send size={14} /> {busy ? 'Submitting…' : 'Submit to shared room'}</button>
            </>
          )}
        </div>
      )}
      {status && <div className={`banner ${status.kind}`} role={status.kind === 'error' ? 'alert' : 'status'}>{status.text}</div>}
    </div>
  )
}
