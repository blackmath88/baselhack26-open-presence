/**
 * One object's lineage as ordered stages: a compact step row to choose a stage, and the
 * chosen stage's recorded facts and unknowns beside it. "All stages" shows every stage as
 * text, which is also the version without the step row's layout. The step row is a list of
 * buttons, so it reads and works the same without the visual connectors.
 */
import { Fragment } from 'react'
import { ExternalLink } from 'lucide-react'
import type { Stage, StageState } from '../../commons/client/lineage'

const STATE_WORD: Record<StageState, string> = { recorded: 'recorded', partial: 'partly recorded', absent: 'not recorded' }

function StageDetail({ stage, headingId }: { stage: Stage; headingId?: string }) {
  return (
    <div className="cc-lineage-stage">
      <h5 id={headingId}>{stage.label} <span className={`cc-stage-state cc-stage-state-${stage.state}`}>{stage.stateWord ?? STATE_WORD[stage.state]}</span></h5>
      {stage.facts.length > 0 && (
        <dl className="cc-kv">
          {stage.facts.map((f, i) => (
            <Fragment key={i}>
              <dt>{f.k}</dt>
              <dd>{f.href ? <a href={f.href} {...(f.external ? { target: '_blank', rel: 'noreferrer noopener' } : {})}>{f.v}{f.external && <> <ExternalLink size={12} aria-hidden="true" /><span className="sr-only"> (opens the original)</span></>}</a> : f.v}</dd>
            </Fragment>
          ))}
        </dl>
      )}
      {stage.unknown.length > 0 && (
        <div className="cc-lineage-unknown">
          <p className="phf-field-k">Not known here</p>
          <ul>{stage.unknown.map((u) => <li key={u}>{u}</li>)}</ul>
        </div>
      )}
    </div>
  )
}

export function Lineage({ id, title, stages, selected, onSelect }: {
  id: string
  title: string
  stages: Stage[]
  /** A stage key, or "all" for every stage as text. */
  selected: string
  onSelect: (stage: string) => void
}) {
  const current = stages.find((s) => s.key === selected) ?? (selected === 'all' ? undefined : stages[0]!)
  return (
    <section className="cc-lineage" aria-labelledby={`${id}-title`}>
      <h4 id={`${id}-title`} className="phf-kicker">{title}</h4>
      <ol className="cc-lineage-steps">
        {stages.map((s, i) => (
          <li key={s.key} className={`cc-step cc-step-${s.state}`}>
            <button type="button" aria-current={current?.key === s.key ? 'step' : undefined} onClick={() => onSelect(s.key)}>
              <span className="cc-step-n" aria-hidden="true">{i + 1}</span>
              <span className="cc-step-label">{s.label}</span>
              <span className="cc-step-state">{s.stateWord ?? STATE_WORD[s.state]}</span>
            </button>
          </li>
        ))}
      </ol>
      <div className="cc-lineage-detail" aria-live="polite">
        {current ? <StageDetail stage={current} headingId={`${id}-stage`} /> : stages.map((s) => <StageDetail key={s.key} stage={s} />)}
      </div>
      <button type="button" className="cc-link-button" onClick={() => onSelect(current ? 'all' : stages[0]!.key)}>
        {current ? 'Show all stages as text' : 'Show one stage at a time'}
      </button>
    </section>
  )
}
