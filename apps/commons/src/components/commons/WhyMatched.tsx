import { useId, useState } from 'react'
import { ChevronRight } from 'lucide-react'
import type { SearchHit } from '../../commons/contracts'

const FIELD_LABEL: Record<SearchHit['matches'][number]['field'], string> = {
  title: 'title', symptoms: 'symptoms', aliases: 'search words', environment: 'conditions', device: 'device', quote: 'quoted source',
}

/**
 * Why a result is on the list, from the ranking's own output: which record
 * fields matched which (stemmed) index terms, then the rest of the recorded
 * explanation verbatim. Nothing here is written after the fact.
 */
export function WhyMatched({ hit, initiallyOpen = false }: { hit: SearchHit; initiallyOpen?: boolean }) {
  const [open, setOpen] = useState(initiallyOpen)
  const id = useId()
  const byField = new Map<string, { terms: Set<string>; writer: boolean }>()
  for (const m of hit.matches) {
    const entry = byField.get(m.field) ?? { terms: new Set<string>(), writer: m.writerVocabulary }
    entry.terms.add(m.term)
    byField.set(m.field, entry)
  }
  const notes = hit.explanation.split(/(?<=\.)\s+(?=[A-Z])/).filter((s) => !s.startsWith('Matched '))
  return (
    <div className="cx-why">
      <button type="button" className="cx-disclosure" aria-expanded={open} aria-controls={id} onClick={() => setOpen((v) => !v)}>
        <ChevronRight size={14} aria-hidden="true" className="cx-chevron" /> Why it matched
      </button>
      <div id={id} className="cx-why-body" hidden={!open}>
        <p className="cx-why-lead">Your words matched these parts of the record <span className="commons-limit">(index terms are word stems)</span>:</p>
        <dl className="cx-why-fields">
          {[...byField].map(([field, { terms, writer }]) => (
            <div key={field}>
              <dt>{FIELD_LABEL[field as keyof typeof FIELD_LABEL] ?? field}{writer && <span className="cx-status neutral">added by the record writer</span>}</dt>
              <dd>{[...terms].map((t) => <code key={t} className="cx-term">{t}</code>)}</dd>
            </div>
          ))}
        </dl>
        <ul className="cx-why-notes">{notes.map((n) => <li key={n}>{n}</li>)}</ul>
      </div>
    </div>
  )
}
