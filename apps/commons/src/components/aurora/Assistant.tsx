import { useState } from 'react'
import { Link, useNavigate } from '@tanstack/react-router'
import { AppLayout, useInvestigation } from './AppShell'
import { Icon } from './Icon'
import { Button } from './Primitives'
import { assistant, threads, actionId } from '../../mock/commons'
import './Assistant.css'
export function ThreadList() {
  const navigate = useNavigate()
  const { id } = useInvestigation()
  return (
    <>
      <h3>
        <Icon name="menu" size={20} />
        Verläufe
      </h3>
      <Link className="navitem" to="/" search={{}}>
        <Icon name="edit" />
        Neu beginnen
      </Link>
      <Link
        className="navitem"
        to="/canvas/$investigationId"
        params={{ investigationId: id }}
      >
        <Icon name="canvas" />
        Canvas-Übersicht
      </Link>
      <div className="label">Frühere</div>
      {threads.map((t) => (
        <button
          className="thread"
          key={t.id}
          onClick={() =>
            t.hasAction
              ? void navigate({
                  to: '/actions/$actionId',
                  params: { actionId },
                })
              : void navigate({
                  to: '/canvas/$investigationId',
                  params: { investigationId: t.id },
                })
          }
        >
          <span>{t.title}</span>
          <span className="meta">
            {t.hasAction && <Icon name="bolt" />}
            {t.hasCanvas && <Icon name="canvas" />}
          </span>
        </button>
      ))}
    </>
  )
}
export function Composer({ onSubmit }: { onSubmit: (query: string) => void }) {
  const [query, setQuery] = useState('')
  return (
    <form
      className="composer"
      onSubmit={(e) => {
        e.preventDefault()
        if (query.trim()) onSubmit(query.trim())
      }}
    >
      <div className="row">
        <Icon name="plus" size={20} />
        <input
          aria-label="Frage an den Assistenten"
          placeholder={assistant.placeholder}
          value={query}
          onChange={(e) => setQuery(e.target.value)}
        />
      </div>
      <div className="foot">
        <span className="sel">
          Standard
          <Icon name="down" />
        </span>
        <button
          className="send"
          aria-label="Frage senden"
          type="submit"
          disabled={!query.trim()}
        >
          <Icon name="up" />
        </button>
      </div>
    </form>
  )
}
export function Assistant() {
  const navigate = useNavigate()
  const { id } = useInvestigation()
  const submit = (query: string) =>
    void navigate({
      to: '/canvas/$investigationId',
      params: { investigationId: id },
      search: { query },
    })
  return (
    <AppLayout aside={<ThreadList />}>
      <section>
        <div className="hero">
          <h1>{assistant.greeting}</h1>
          <p>
            <Icon name="bolt" size={20} />
            Es warten <b>{assistant.pendingReviews} Prüfungen</b> auf deine
            Durchsicht.
          </p>
          <Button
            variant="ghost-accent"
            onClick={() => void navigate({ to: '/actions' })}
          >
            Prüfungen ansehen
          </Button>
        </div>
        <Composer onSubmit={submit} />
        <div className="sugg">
          {assistant.suggestions.map((text) => (
            <button key={text} onClick={() => submit(text)}>
              {text}
            </button>
          ))}
        </div>
        <p className="disclaimer">
          {assistant.disclaimer}{' '}
          <a href="https://github.com/blackmath88/baselhack26-open-presence/blob/main/apps/commons/docs/CONCEPT.md">
            {assistant.privacy}
          </a>
          .
        </p>
      </section>
    </AppLayout>
  )
}
