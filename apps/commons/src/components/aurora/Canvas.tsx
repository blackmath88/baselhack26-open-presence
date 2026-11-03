import { useEffect, useState } from 'react'
import { AppLayout, useInvestigation } from './AppShell'
import { Conversation } from './Conversation'
import { Badge, Button } from './Primitives'
import { EvidenceCard } from './EvidenceCard'
import {
  canvas,
  evidence,
  investigationId as mockId,
  threads,
  actions,
} from '../../mock/commons'
import './EvidenceCard.css'
export function Canvas({
  investigationId,
  query,
}: {
  investigationId: string
  query?: string
}) {
  const { setId } = useInvestigation()
  const isReference = investigationId === mockId
  const title = isReference
    ? canvas.title
    : (threads.find((t) => t.id === investigationId)?.title ??
      actions.find((a) => a.investigationId === investigationId)?.title ??
      'Untersuchung')

  const [highlighted, setHighlighted] = useState('')
  const [shared, setShared] = useState(false)
  useEffect(() => setId(investigationId), [investigationId, setId])
  const highlight = (id: string) => {
    setHighlighted(id)
    document.getElementById(id)?.scrollIntoView({
      behavior: matchMedia('(prefers-reduced-motion: reduce)').matches
        ? 'instant'
        : 'smooth',
      block: 'center',
    })
  }
  return (
    <AppLayout
      aside={
        <Conversation
          key={investigationId}
          onReference={highlight}
          query={query}
          reference={isReference}
        />
      }
    >
      <section>
        <div className="canvas-head">
          <h2>{title}</h2>
          <Badge tone="acc">{canvas.shared}</Badge>
          <div className="avatars" aria-label="Teilnehmende">
            {canvas.participants.map((p) => (
              <span key={p.initials} style={{ background: `var(--${p.tone})` }}>
                {p.initials}
              </span>
            ))}
          </div>
          <Button
            icon="voices"
            onClick={async () => {
              try {
                await navigator.clipboard.writeText(location.href)
                setShared(true)
              } catch {
                setShared(false)
              }
            }}
          >
            {shared ? 'Link kopiert' : 'Teilen'}
          </Button>
        </div>
        {!isReference && (
          <p className="sub">Noch keine Belege für diese Untersuchung.</p>
        )}
        <div className="grid">
          {(isReference ? evidence : []).map((card) => (
            <EvidenceCard
              key={card.id}
              card={card}
              highlighted={highlighted === card.id}
            />
          ))}
        </div>
      </section>
    </AppLayout>
  )
}
