/**
 * The imported problem record as a projection: quotes stay quotes, the record
 * writer's reading stays labelled as such, and every source links out.
 */
import { ExternalLink } from 'lucide-react'
import type { ImportedProblem, SearchHit, SourceRef } from '../../commons/contracts'
import { appLinks } from '../../commons/contracts'
import { CitingList, type Citing } from './CitingList'

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

export function Record({ problem, hit, citations = {} }: { problem: ImportedProblem; hit?: SearchHit; citations?: Record<string, Citing[]> }) {
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
        {problem.evidence.map((e, i) => (
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
            {citations[e.id]?.length && problem.evidence.findIndex((x) => x.source.objectId === e.source.objectId) < i ? (
              <p className="commons-limit">Cited by the same {citations[e.id]!.length} contribution{citations[e.id]!.length === 1 ? '' : 's'} as above: contributions cite the whole source object, not one passage.</p>
            ) : citations[e.id]?.length ? (
              <details className="commons-cited-by">
                <summary>{citations[e.id]!.length} contribution{citations[e.id]!.length === 1 ? '' : 's'} cite this source</summary>
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

