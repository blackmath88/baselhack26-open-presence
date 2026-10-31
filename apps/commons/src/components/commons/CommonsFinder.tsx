/**
 * Find → inspect → draft → submit, over the pinned Photo Frame Commons records.
 *
 * Search and evidence are read from the committed record-only index in the
 * browser. Nothing here is room state: the only write is an explicit submit,
 * which goes through the backend and is attributed to the session participant.
 */
import { useMemo, useState } from 'react'
import { ExternalLink, FileText, Search, Send, Trash2 } from 'lucide-react'
import type { CommonsReader, Draft, ImportedProblem, SearchHit, SourceRef } from '../../commons/contracts'
import { importedProblemSpaceId } from '../../commons/contracts'
import { drafts } from '../../commons/client/drafts'
import { commonsApi } from '../../commons/client/api'

const EXAMPLE = 'My Mac cannot see my frame'

/** Only link out to the original public host; never render source HTML. */
const safeHref = (url: string) => (/^https:\/\/github\.com\//.test(url) ? url : undefined)

function SourceLine({ source }: { source: SourceRef }) {
  const href = safeHref(source.permalink)
  return (
    <div className="commons-source">
      <span>{source.author === 'unknown' ? 'author unknown' : `@${source.author}`}</span>
      {source.sourceTime && <span> · {source.sourceTime.slice(0, 10)}</span>}
      <span> · {source.objectId}</span>
      {href ? (
        <a href={href} target="_blank" rel="noreferrer noopener">
          {' '}
          original <ExternalLink size={12} />
        </a>
      ) : null}
      {source.availability !== 'captured' && (
        <span className="commons-limit"> · full conversation not stored here ({source.availability}); follow the original</span>
      )}
    </div>
  )
}

function Record({ problem, hit }: { problem: ImportedProblem; hit?: SearchHit }) {
  return (
    <article className="commons-record" aria-label={problem.title}>
      <div className="section-kicker">
        Problem record · {problem.status} ·{' '}
        <strong>{problem.provenance.review === 'unreviewed' ? 'agent-written, not reviewed by a person' : 'reviewed'}</strong>{' '}
        ({problem.provenance.authoredBy})
      </div>
      <h2>{problem.title}</h2>
      {hit && <p className="commons-why">Why this matched: {hit.explanation}</p>}
      {hit?.nearMatch && (
        <p className="commons-near" role="note">
          Near-match: the reported conditions differ from your description. Compare before relying on it.
        </p>
      )}
      <dl className="commons-facts">
        <dt>Device</dt>
        <dd>{problem.device.join(', ') || '—'}</dd>
        <dt>Reported conditions</dt>
        <dd>{problem.environment.join(' · ') || '—'}</dd>
        <dt>Symptoms</dt>
        <dd>{problem.symptoms.join(' · ') || '—'}</dd>
        {problem.statusNote && (
          <>
            <dt>Limits</dt>
            <dd>{problem.statusNote}</dd>
          </>
        )}
      </dl>
      <h3>Evidence</h3>
      <ol className="commons-evidence">
        {problem.evidence.map((e) => (
          <li key={e.id}>
            <span className="badge">{e.role}</span>
            {e.quote && (
              <blockquote>
                “{e.quote}”
              </blockquote>
            )}
            {e.interpretation && (
              <p className="commons-interp">
                <em>Record writer's reading, not the author's words:</em> {e.interpretation}
              </p>
            )}
            <SourceLine source={e.source} />
          </li>
        ))}
      </ol>
      {problem.corrections.length > 0 && (
        <>
          <h3>Corrections and different outcomes</h3>
          <ul>
            {problem.corrections.map((c) => (
              <li key={c.id}>
                {c.note} <span className="commons-limit">(source assertion, evidence {c.evidenceIds.join(', ')})</span>
              </li>
            ))}
          </ul>
        </>
      )}
      {problem.related.length > 0 && (
        <>
          <h3>Related records</h3>
          <ul>
            {problem.related.map((r) => (
              <li key={r.problemId}>
                {r.relation} → {r.problemId}{' '}
                <span className="commons-limit">({r.origin === 'postack-agent' ? 'proposed by the record writer, unreviewed' : 'stated in source'})</span>
              </li>
            ))}
          </ul>
        </>
      )}
    </article>
  )
}

export function CommonsFinder({
  reader,
  token,
  onSubmitted,
}: {
  reader: CommonsReader
  token: string | null
  onSubmitted: (problemId: string) => void
}) {
  const [query, setQuery] = useState('')
  const [submittedQuery, setSubmittedQuery] = useState('')
  const [selectedId, setSelectedId] = useState<string>()
  const [draft, setDraft] = useState<Draft | undefined>()
  const [text, setText] = useState('')
  const [circumstances, setCircumstances] = useState('')
  const [preview, setPreview] = useState(false)
  const [status, setStatus] = useState<{ kind: 'notice' | 'error'; text: string } | null>(null)
  const [busy, setBusy] = useState(false)

  const hits = useMemo(() => (submittedQuery ? reader.search(submittedQuery, 8) : []), [reader, submittedQuery])
  const selected = selectedId ? reader.problem(selectedId) : undefined
  const selectedHit = hits.find((h) => h.problemId === selectedId)

  const select = (id: string) => {
    setSelectedId(id)
    const existing = drafts.forProblem(id)
    setDraft(existing)
    setText(existing?.text ?? '')
    setCircumstances(existing?.circumstances ?? '')
    setPreview(false)
    setStatus(null)
  }

  const save = () => {
    if (!selected || !text.trim()) return
    const { draft: saved, persisted } = drafts.save({
      id: draft?.id,
      problemId: selected.postackId,
      text: text.trim(),
      circumstances: circumstances.trim() || undefined,
      sourceRefs: [...new Set(selected.evidence.map((e) => e.source.objectId))],
    })
    setDraft(saved)
    setStatus(
      persisted
        ? { kind: 'notice', text: 'Draft saved in this browser only. Nobody else can see it.' }
        : { kind: 'error', text: 'This browser refused local storage; the draft will be lost on reload.' },
    )
  }

  const remove = () => {
    if (!selected) return
    drafts.remove(selected.postackId)
    setDraft(undefined)
    setText('')
    setCircumstances('')
    setPreview(false)
    setStatus({ kind: 'notice', text: 'Draft removed from this browser.' })
  }

  const submit = async () => {
    if (!selected || !draft || !token) return
    setBusy(true)
    try {
      const result = await commonsApi.submit(token, {
        // The draft id is the idempotency key: retrying the same draft never duplicates.
        commandId: draft.id,
        problemId: selected.postackId,
        text: draft.text,
        circumstances: draft.circumstances,
        sourceRefs: draft.sourceRefs,
        preparedBy: 'browser-draft',
      })
      drafts.remove(selected.postackId)
      setDraft(undefined)
      setText('')
      setCircumstances('')
      setPreview(false)
      setStatus({ kind: 'notice', text: result.replayed ? 'Already submitted earlier — no duplicate created.' : 'Submitted to the local shared room.' })
      onSubmitted(result.problemId ?? importedProblemSpaceId(selected.postackId))
    } catch (error) {
      setStatus({ kind: 'error', text: `${error instanceof Error ? error.message : 'Submission failed.'} The draft stays in this browser.` })
    } finally {
      setBusy(false)
    }
  }

  return (
    <section className="commons-finder" aria-label="Find a photo-frame experience">
      <form
        className="commons-search"
        role="search"
        onSubmit={(e) => {
          e.preventDefault()
          setSubmittedQuery(query.trim())
          setSelectedId(undefined)
        }}
      >
        <label htmlFor="commons-q" className="section-kicker">
          Find an experience in the Photo Frame Commons
        </label>
        <div className="commons-search-row">
          <input id="commons-q" value={query} placeholder={EXAMPLE} onChange={(e) => setQuery(e.target.value)} />
          <button className="button" type="submit">
            <Search size={15} /> Search
          </button>
        </div>
        <p className="commons-limit">
          Searches agent-written records over a pinned public snapshot of wesbos/photo-frame-dashboard. Not live, not
          reviewed by a person.
        </p>
      </form>

      {submittedQuery && hits.length === 0 && <p>No record matches “{submittedQuery}”.</p>}
      {hits.length > 0 && (
        <ol className="commons-hits">
          {hits.map((h) => {
            const p = reader.problem(h.problemId)
            return (
              <li key={h.problemId}>
                <button className={h.problemId === selectedId ? 'active' : ''} onClick={() => select(h.problemId)}>
                  <strong>{p?.title ?? h.problemId}</strong>
                  {h.nearMatch && <span className="badge conflict">near-match</span>}
                  <span className="commons-why">{h.explanation}</span>
                </button>
              </li>
            )
          })}
        </ol>
      )}

      {selected && (
        <div className="commons-detail">
          <Record problem={selected} hit={selectedHit} />
          <div className="commons-draft">
            <h3>
              <FileText size={15} /> Your observation (private draft)
            </h3>
            <label htmlFor="commons-text">What happened for you?</label>
            <textarea id="commons-text" value={text} onChange={(e) => setText(e.target.value)} rows={4} />
            <label htmlFor="commons-circ">Your circumstances (optional)</label>
            <input id="commons-circ" value={circumstances} onChange={(e) => setCircumstances(e.target.value)} />
            <div className="commons-actions">
              <button className="button" onClick={save} disabled={!text.trim()}>
                Save draft
              </button>
              <button className="button" onClick={remove} disabled={!draft}>
                <Trash2 size={14} /> Remove draft
              </button>
              <button className="button" onClick={() => setPreview(true)} disabled={!draft}>
                Preview submission
              </button>
            </div>
            {preview && draft && (
              <div className="commons-preview" role="region" aria-label="Submission preview">
                <p>
                  <strong>Destination:</strong> local shared room on this server, problem space{' '}
                  <code>{importedProblemSpaceId(selected.postackId)}</code>. Not GitHub, not public.
                </p>
                <p>
                  <strong>Exact content:</strong> {draft.text}
                </p>
                {draft.circumstances && (
                  <p>
                    <strong>Circumstances:</strong> {draft.circumstances}
                  </p>
                )}
                <p>
                  <strong>Linked sources:</strong> {draft.sourceRefs.join(', ')}
                </p>
                <button className="button aperture" onClick={() => void submit()} disabled={busy || !token}>
                  <Send size={14} /> {busy ? 'Submitting…' : 'Submit to shared room'}
                </button>
              </div>
            )}
            {status && (
              <div className={`banner ${status.kind}`} role={status.kind === 'error' ? 'alert' : 'status'}>
                {status.text}
              </div>
            )}
          </div>
        </div>
      )}
    </section>
  )
}
