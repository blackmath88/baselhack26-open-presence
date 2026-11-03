import { useState } from 'react'
import { conversation, canvas, type Message } from '../../mock/commons'
import './Conversation.css'
export function Conversation({
  onReference,
  query,
  reference = true,
}: {
  onReference: (cardId: string) => void
  query?: string
  reference?: boolean
}) {
  const [followup, setFollowup] = useState('')
  const [messages, setMessages] = useState<Message[]>([])
  return (
    <>
      {[...(reference ? conversation : []), ...messages].map((message, i) => (
        <div className="msg" key={i}>
          <div className="who">
            <span
              className={`av ${message.author === 'Assistent' ? 'ai' : ''}`}
            >
              {message.initials}
            </span>
            {message.author}
            {message.time && <time>{message.time}</time>}
          </div>
          {(i === 0 && query ? [[query]] : message.paragraphs).map(
            (parts, p) => (
              <p key={p}>
                {parts.map((part, j) =>
                  typeof part === 'string' ? (
                    part
                  ) : (
                    <a
                      key={j}
                      className="ref"
                      href={`#${part.cardId}`}
                      onClick={(e) => {
                        e.preventDefault()
                        onReference(part.cardId)
                      }}
                    >
                      {part.text}
                    </a>
                  ),
                )}
              </p>
            ),
          )}
        </div>
      ))}
      <form
        onSubmit={(e) => {
          e.preventDefault()
          if (followup.trim()) {
            setMessages([
              ...messages,
              { author: 'Du', initials: 'AI', paragraphs: [[followup.trim()]] },
            ])
            setFollowup('')
          }
        }}
      >
        <textarea
          rows={2}
          className="mini-comp"
          aria-label="Weiterfragen"
          placeholder={canvas.followup}
          value={followup}
          onChange={(e) => setFollowup(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === 'Enter' && !e.shiftKey) {
              e.preventDefault()
              e.currentTarget.form?.requestSubmit()
            }
          }}
        />
      </form>
    </>
  )
}
