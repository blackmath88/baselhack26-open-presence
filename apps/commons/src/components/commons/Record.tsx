/**
 * The imported problem record as a projection: quotes stay quotes, the record
 * writer's reading stays labelled as such, and every source links out.
 */
import { useEffect, useRef } from 'react'
import { ExternalLink, Link2 } from 'lucide-react'
import type { ImportedProblem, SearchHit, SourceRef } from '../../commons/contracts'
import { appLinks } from '../../commons/contracts'
import { compareSituation, evidenceRefs } from '../../commons/client/situation'
import { CitingList, type Citing } from './CitingList'
import { WhyMatched } from './WhyMatched'

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
        <a className="cx-original" href={href} target="_blank" rel="noreferrer noopener">
          {' '}
          original <ExternalLink size={12} aria-hidden="true" /><span className="cx-sr"> (opens GitHub in a new tab)</span>
        </a>
      ) : null}
      {source.availability !== 'captured' && (
        <span className="commons-limit"> · full conversation not stored here ({source.availability}); follow the original</span>
      )}
    </div>
  )
}

type Shared = { problemId: string; title: string; objects: string[]; contributions: number; link: string }

export function Record({ problem, hit, query, passage, citations = {}, onCite, shared = [] }: { problem: ImportedProblem; hit?: SearchHit; query?: string; passage?: string; citations?: Record<string, Citing[]>; onCite?: (evidenceId: string) => void; shared?: Shared[] }) {
  const passageLink = (id: string) => appLinks.passage(problem.postackId, id, query)
  const evidenceIds = problem.evidence.map((e) => e.id)
  const unknownPassage = passage !== undefined && !evidenceIds.includes(passage)
  // A selected passage (link, reload, back) is scrolled to and receives focus, so keyboard users land on it.
  const selectedRef = useRef<HTMLLIElement | null>(null)
  useEffect(() => {
    if (!passage || !selectedRef.current) return
    const reduce = matchMedia('(prefers-reduced-motion: reduce)').matches
    selectedRef.current.scrollIntoView({ block: 'start', behavior: reduce ? 'auto' : 'smooth' })
    selectedRef.current.focus({ preventScroll: true })
  }, [passage])
  const refs = (text: string) => evidenceRefs(text, evidenceIds).map((part, i) =>
    part.evidenceId ? <a key={i} href={passageLink(part.evidenceId)}>{part.text}</a> : <span key={i}>{part.text}</span>)
  // A later passage of an already-listed object repeats the list only when exactly the same contributions cite it.
  const key = (id: string) => (citations[id] ?? []).map((c) => c.contributionId).join(' ')
  const sameAsEarlier = (id: string, i: number) => problem.evidence.slice(0, i).some((x) => x.source.objectId === problem.evidence[i]!.source.objectId && key(x.id) === key(id))
  return (
    <article className="commons-record" aria-label={problem.title}>
      <div className="cx-record-status">
        <span className="cx-type">Problem record</span>
        <span className="cx-status neutral">{problem.status}</span>
        <span className={`cx-status ${problem.provenance.review === 'unreviewed' ? 'warn' : 'ok'}`}>
          {problem.provenance.review === 'unreviewed' ? 'Agent-written · not reviewed by a person' : 'Reviewed'}
        </span>
        <span className="cx-meta">written by {problem.provenance.authoredBy}</span>
      </div>
      <h2>{problem.title}</h2>
      <p className="phf-voices" role="note">
        Two voices on this page: <span className="phf-voice-chip source">source authors</span> quoted and linked to the original, and the{' '}
        <span className="phf-voice-chip agent">agent record writer</span> whose reading is labelled and unreviewed.
      </p>
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
      {problem.outcomes.length > 0 && (
        <section className="cx-outcomes" aria-labelledby="cx-outcomes-title">
          <h3 id="cx-outcomes-title">Reported outcomes <span className="cx-meta">· record writer's summary, linked to the passages it cites</span></h3>
          <ul>{problem.outcomes.map((o) => <li key={o}>{refs(o)}</li>)}</ul>
        </section>
      )}
      {query && <FitPanel problem={problem} query={query} hit={hit} passageLink={passageLink} />}
      <p className="cx-compare-entry"><a className="cx-compare-link" href={appLinks.compare([problem.postackId], query)}>Compare with another account</a> <span className="cx-meta">side by side: conditions, symptoms, outcomes, limits</span></p>
      <h3 id="cx-evidence-title">Evidence · what people actually wrote</h3>
      <nav className="cx-passage-index" aria-label="Passages in this record">
        <ol>
          {problem.evidence.map((e) => (
            <li key={e.id}>
              <a href={passageLink(e.id)} aria-current={passage === e.id ? 'location' : undefined}>
                <span className="cx-pi-id">{e.id}</span> {e.role} · {e.source.author === 'unknown' ? e.source.objectId : `@${e.source.author}`}
              </a>
            </li>
          ))}
        </ol>
      </nav>
      {unknownPassage && <p className="cx-state" role="status">Passage “{passage}” is not part of this record. Showing all passages.</p>}
      <ol className="commons-evidence">
        {problem.evidence.map((e, i) => (
          <li key={e.id} id={`passage-${e.id}`} ref={passage === e.id ? selectedRef : undefined} tabIndex={passage === e.id ? -1 : undefined}
            className={`phf-evidence${passage === e.id ? ' cx-selected' : ''}`} aria-labelledby={`passage-${e.id}-label`}>
            <div className="phf-evidence-head">
              <span className="badge">{e.role}</span> <span id={`passage-${e.id}-label`} className="commons-limit">passage {e.id}</span>
              {passage === e.id && <span className="cx-status selected">Selected passage</span>}
              <a className="cx-passage-link" href={passageLink(e.id)}><Link2 size={13} aria-hidden="true" /> Link to passage<span className="cx-sr"> {e.id}</span></a>
            </div>
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
            {onCite && <button className="button commons-cite primary" onClick={() => onCite(e.id)} aria-label={`Respond to passage ${e.id}`}>Respond to this passage</button>}
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
                {c.note} <span className="commons-limit">(source assertion, evidence {c.evidenceIds.map((id, k) => <span key={id}>{k ? ', ' : ''}<a href={passageLink(id)}>{id}</a></span>)})</span>
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


/**
 * Before relying on a record: what may fit and what differs or is unknown,
 * from the reader's own words, the record's reported conditions, its limit and
 * its corrections. A word comparison, never a compatibility verdict.
 */
function FitPanel({ problem, query, hit, passageLink }: { problem: ImportedProblem; query: string; hit: SearchHit | undefined; passageLink: (id: string) => string }) {
  const checks = compareSituation(query, problem)
  const mentioned = checks.filter((c) => c.yourWords.length || c.expandedWords.length)
  const unstated = checks.filter((c) => !c.yourWords.length && !c.expandedWords.length)
  const correctionPassages = problem.evidence.filter((e) => e.role === 'correction')
  return (
    <section className="cx-fit" aria-labelledby="cx-fit-title">
      <h3 id="cx-fit-title">Before you rely on it</h3>
      <p className="cx-meta">A comparison of your words with what the record reports. It cannot tell whether this fix will work for you.</p>
      <div className="cx-fit-cols">
        <div className="cx-fit-col">
          <h4>Why it may fit</h4>
          {mentioned.length ? (
            <ul>
              {mentioned.map((c) => (
                <li key={c.kind + c.label}>
                  <span className="cx-fit-k">{c.kind === 'device' ? 'Device' : 'Condition'}</span>
                  <span>{c.label} <span className="cx-meta">— your words: {[...c.yourWords, ...c.expandedWords.map((w) => `${w} (added by search)`)].join(', ')}</span></span>
                </li>
              ))}
            </ul>
          ) : <p className="cx-meta">None of the recorded devices or conditions appear in your words. It matched on other fields; see below.</p>}
          {hit ? <WhyMatched hit={hit} /> : <p className="cx-meta">This record is not among the search results for your words, so there is no match explanation.</p>}
          {hit?.nearMatch && <p className="cx-status warn">Near match · the reported platform differs from yours</p>}
        </div>
        <div className="cx-fit-col">
          <h4>What differs or remains unknown</h4>
          <ul>
            {unstated.map((c) => (
              <li key={c.kind + c.label}><span className="cx-fit-k">{c.kind === 'device' ? 'Device' : 'Condition'}</span><span>{c.label} <span className="cx-meta">— not stated by you</span></span></li>
            ))}
            {problem.statusNote && <li><span className="cx-fit-k">Limit</span><span>{problem.statusNote}</span></li>}
            {correctionPassages.map((e) => (
              <li key={e.id}><span className="cx-fit-k">Correction</span><span><a href={passageLink(e.id)}>passage {e.id}</a>{e.quote ? <> — “{e.quote}”</> : null}</span></li>
            ))}
            <li><span className="cx-fit-k">Unknown</span><span>Your frame model, cable and port. The Commons only has your words.</span></li>
          </ul>
        </div>
      </div>
    </section>
  )
}
