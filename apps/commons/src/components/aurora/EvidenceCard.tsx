import { useState } from 'react'
import type { Evidence } from '../../mock/commons'
import { Badge, Chip, IconButton } from './Primitives'
import { EvidenceBody } from './EvidenceBodies'
import './EvidenceCard.css'
export function EvidenceCard({
  card,
  highlighted,
}: {
  card: Evidence
  highlighted: boolean
}) {
  const [expanded, setExpanded] = useState(false)
  const [info, setInfo] = useState(false)
  return (
    <article
      className={`card c-${expanded ? 12 : card.span} ${highlighted ? 'hl' : ''}`}
      id={card.id}
      tabIndex={-1}
      aria-labelledby={`${card.id}-title`}
    >
      <div className="card-h">
        <div>
          <h4 id={`${card.id}-title`}>{card.title}</h4>
          <Chip>{card.source}</Chip>
        </div>
        <div className="tools">
          {card.badge && (
            <Badge tone={card.badge.tone}>{card.badge.text}</Badge>
          )}
          <IconButton
            name="expand"
            label={`${card.title} ${expanded ? 'verkleinern' : 'vergrößern'}`}
            aria-pressed={expanded}
            onClick={() => setExpanded((v) => !v)}
          />
          <IconButton
            name="dots"
            label={`Informationen zu ${card.title}`}
            aria-expanded={info}
            onClick={() => setInfo((v) => !v)}
          />
        </div>
      </div>
      {card.subtitle && <p className="sub">{card.subtitle}</p>}
      <EvidenceBody kind={card.kind} data={card.data} />
      {info && (
        <p className="sub card-info">
          {card.source} · Beispieldaten aus dem Aurora-Entwurf
        </p>
      )}
    </article>
  )
}
