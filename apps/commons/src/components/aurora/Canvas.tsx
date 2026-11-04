import { useEffect, useState } from 'react'
import { Link, useLocation, useRouter } from '@tanstack/react-router'
import { investigations } from '../../data/investigations'
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
  von,
}: {
  investigationId: string
  query?: string
  von?: 'lab'
}) {
  const { setId } = useInvestigation()
  const router = useRouter()
  const fromLab = useLocation({ select: (location) => location.state.fromLab })
  const isReference = investigationId === mockId
  const title = investigations.find((item) => item.id === investigationId)?.title ??
    (isReference
      ? canvas.title
      : threads.find((t) => t.id === investigationId)?.title ??
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
          <div className="canvas-title">
            <h2>{title}</h2>
            {von === 'lab' && (
              <p className="canvas-arrival">
                Aus dem PDF Lab: gleiche Seite, andere Lesart. Hier zählt, was bei
                Erfahrung mitreisen muss.{' '}
                <Link
                  to="/lab"
                  onClick={(event) => {
                    if (event.button !== 0 || event.metaKey || event.ctrlKey ||
                      event.shiftKey || event.altKey) return
                    // The bridge marks a real pushed entry. Referrer covers a full-page same-origin arrival.
                    const referrer = document.referrer ? new URL(document.referrer) : undefined
                    const previousDocumentWasLab =
                      router.history.location.state.__TSR_index === 0 &&
                      window.history.length > 1 && referrer?.origin === location.origin &&
                      referrer.pathname === '/lab'
                    if (fromLab || previousDocumentWasLab) {
                      event.preventDefault()
                      router.history.back()
                    }
                  }}
                >
                  Zurück zur Werkbank
                </Link>
              </p>
            )}
          </div>
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
