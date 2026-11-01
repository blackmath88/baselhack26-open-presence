/**
 * The imported problem record as a projection: quotes stay quotes, the record
 * writer's reading stays labelled as such, and every source links out.
 */
import { ExternalLink } from 'lucide-react'
import type { ImportedProblem, SearchHit, SourceRef } from '../../commons/contracts'
import { appLinks } from '../../commons/contracts'
import { CitingList, type Citing } from './CitingList'
import { useEffect, useRef } from 'react'
import { Lineage } from './Lineage'
import { passageLineage } from '../../commons/client/lineage'
import { actorLabel } from './ContributionCard'

/** Only link out to the original public host; never render source HTML. */
const safeHref = (url: string) => (/^https:\/\/github\.com\//.test(url) ? url : undefined)

export function SourceLine({ source }: { source: SourceRef }) {
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

type Shared = { problemId: string; title: string; objects: string[]; contributions: number; link: string }

export type Trace = { passage: string; stage?: string }

export function Record({ problem, hit, citations = {}, onCite, shared = [], trace, onTrace, matchHit, query }: {
  problem: ImportedProblem; hit?: SearchHit; citations?: Record<string, Citing[]>; onCite?: (evidenceId: string) => void; shared?: Shared[]
  /** The passage whose lineage is open, and at which stage; kept in the URL by the caller. */
  trace?: Trace; onTrace?: (trace: Trace | null) => void
  /** The search hit for the situation that led here, used only to say whether a quote matched it. */
  matchHit?: SearchHit; query?: string
}) {
  const traced = useRef<HTMLLIElement | null>(null)
  // A shared link to a trace opens at that passage.
  const tracedOnLoad = useRef(trace?.passage)
  useEffect(() => { if (tracedOnLoad.current) traced.current?.scrollIntoView({ block: 'start' }) }, [])
  // A later passage of an already-listed object repeats the list only when exactly the same contributions cite it.
  const key = (id: string) => (citations[id] ?? []).map((c) => c.contributionId).join(' ')
  const sameAsEarlier = (id: string, i: number) => problem.evidence.slice(0, i).some((x) => x.source.objectId === problem.evidence[i]!.source.objectId && key(x.id) === key(id))
  return (
    <article className="commons-record" aria-label={problem.title}>
      <p className="section-kicker commons-record-status">
        <span className="badge">Problem record</span>
        <span className="badge">{problem.status}</span>
        <span className={`badge ${problem.provenance.review === 'unreviewed' ? 'status-unreviewed' : 'status-reviewed'}`}>
          {problem.provenance.review === 'unreviewed' ? 'Agent-written · not reviewed by a person' : 'Reviewed'}
        </span>
        <span className="commons-limit">by {problem.provenance.authoredBy}</span>
      </p>
      <h2 id="commons-record-title" tabIndex={-1}>{problem.title}</h2>
      <p className="phf-voices" role="note">
        Two voices on this page: <span className="phf-voice-chip source">source authors</span> quoted and linked to the original, and the{' '}
        <span className="phf-voice-chip agent">agent record writer</span> whose reading is labelled and unreviewed.
      </p>
      {hit && <p className="commons-why">Why this matched: {hit.explanation}</p>}
      {hit?.nearMatch && (
        <p className="commons-near" role="note">
          Near-match: the reported conditions differ from your description. Compare before relying on it.
        </p>
      )}
      <dl className="commons-facts">
        <dt>Applies to</dt>
        <dd>{problem.device.join(', ') || '—'}</dd>
        <dt>When</dt>
        <dd>{problem.environment.join(' · ') || '—'}</dd>
        <dt>Symptoms</dt>
        <dd>{problem.symptoms.join(' · ') || '—'}</dd>
        {problem.statusNote && (
          <>
            <dt>Limit</dt>
            <dd>{problem.statusNote}</dd>
          </>
        )}
      </dl>
      <h3>Evidence · what people actually wrote</h3>
      <ol className="commons-evidence">
        {problem.evidence.map((e, i) => (
          <li key={e.id} className="phf-evidence" id={`passage-${e.id}`} ref={trace?.passage === e.id ? traced : undefined}>
            <div className="phf-evidence-head"><span className="badge">{e.role}</span> <span className="commons-limit">passage {e.id}</span></div>
            {e.quote ? (
              <figure className="phf-source-voice">
                <figcaption className="phf-voice-tag">Original words · source author</figcaption>
                <blockquote>“{e.quote}”</blockquote>
                <SourceLine source={e.source} />
              </figure>
            ) : (
              <SourceLine source={e.source} />
            )}
            {e.interpretation && (
              <div className="phf-agent-voice">
                <span className="phf-voice-tag">Agent interpretation · {problem.provenance.authoredBy} · {problem.provenance.review === 'unreviewed' ? 'not reviewed' : 'reviewed'}</span>
                <p className="commons-interp">{e.interpretation}</p>
              </div>
            )}
            <div className="commons-actions">
              {onCite && <button className="button commons-cite primary" onClick={() => onCite(e.id)} aria-label={`Respond to passage ${e.id}`}>Respond to this passage</button>}
              {onTrace && (
                <button className="button" aria-expanded={trace?.passage === e.id} aria-controls={`lineage-${e.id}`} onClick={() => onTrace(trace?.passage === e.id ? null : { passage: e.id })}>
                  How this reached you<span className="sr-only">: passage {e.id}</span>
                </button>
              )}
            </div>
            {onTrace && trace?.passage === e.id && (
              <div id={`lineage-${e.id}`}>
                <Lineage id={`lineage-${e.id}-v`} title={`How passage ${e.id} reached you`}
                  stages={passageLineage(problem, e.id, {
                    ...(matchHit ? { hit: matchHit } : {}), ...(query ? { query } : {}),
                    citing: (citations[e.id] ?? []).map((c) => ({ contributionId: c.contributionId, kind: c.kind, author: actorLabel(c.actor), createdAt: c.createdAt, exact: Boolean(c.evidenceIds?.includes(e.id)) })),
                  })!}
                  selected={trace.stage ?? 'source'} onSelect={(stage) => onTrace({ passage: e.id, stage })} />
              </div>
            )}
            {citations[e.id]?.length && sameAsEarlier(e.id, i) ? (
              <p className="commons-limit">Cited by the same {citations[e.id]!.length} contribution{citations[e.id]!.length === 1 ? '' : 's'} as above: they cite the whole source object, not one passage.</p>
            ) : citations[e.id]?.length ? (
              <details className="commons-cited-by">
                <summary>{citations[e.id]!.length === 1 ? '1 contribution cites' : `${citations[e.id]!.length} contributions cite`} this source</summary>
                <CitingList contributions={citations[e.id]!} label={`Contributions citing evidence ${e.id}`} />
              </details>
            ) : null}
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
      {shared.length > 0 && (
        <>
          <h3>Shares cited sources with</h3>
          <p className="commons-limit">Derived from the imported records' evidence: these problems cite the same issue or document. Not a reviewed relationship, and not a claim that they are the same problem.</p>
          <ul aria-label="Problems sharing cited sources">
            {shared.map((s) => (
              <li key={s.problemId}>
                <a href={s.link}>{s.title}</a> <span className="commons-limit">· {s.objects.join(', ')} · {s.contributions ? `${s.contributions} contribution${s.contributions === 1 ? '' : 's'} there` : 'no contributions there yet'}</span>
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
                {r.relation} → <a href={appLinks.problem(r.problemId)}>{r.problemId}</a>{' '}
                <span className="commons-limit">({r.origin === 'postack-agent' ? 'proposed by the record writer, unreviewed' : 'stated in source'})</span>
              </li>
            ))}
          </ul>
        </>
      )}
    </article>
  )
}

