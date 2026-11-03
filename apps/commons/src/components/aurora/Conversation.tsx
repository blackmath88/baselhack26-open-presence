import { useState } from 'react'
import { conversation, canvas, type Message } from '../../mock/commons'
import './Conversation.css'
export function Conversation({onReference, query}: {onReference: (cardId: string) => void; query?: string}) {
  const [followup,setFollowup] = useState('')
  const [messages,setMessages] = useState<Message[]>([])
  return <>{[...conversation,...messages].map((message,i) => <div className="msg" key={i}><div className="who"><span className={`av ${message.author === 'Assistent' ? 'ai' : ''}`}>{message.initials}</span>{message.author}{message.time && <time>{message.time}</time>}</div>{(i === 0 && query ? [[query]] : message.paragraphs).map((parts,p) => <p key={p}>{parts.map((part,j) => typeof part === 'string' ? part : <button key={j} className="ref" onClick={() => onReference(part.cardId)}>{part.text}</button>)}</p>)}</div>)}<form onSubmit={e => {e.preventDefault(); if(followup.trim()) {setMessages([...messages,{author:'Du',initials:'AI',paragraphs:[[followup.trim()]]}]);setFollowup('')}}}><input className="mini-comp" aria-label="Weiterfragen" placeholder={canvas.followup} value={followup} onChange={e => setFollowup(e.target.value)} /></form></>
}
