import { useEffect, useState } from 'react'
import { Link, useNavigate } from '@tanstack/react-router'
import { commonsReader } from '../../commons/reader'
import { commonsApi, type SearchResponse, type ProblemView } from '../../commons/client/api'
import { compareRecords, type CompareField } from '../../commons/client/comparison'
import { matchBasis } from '../../commons/client/matchBasis'
import type { ImportedProblem } from '../../commons/contracts'
import { AppLayout } from './AppShell'
import { ThreadList } from './Assistant'
import { Button, Badge } from './Primitives'
import './Find.css'

// Reuse the existing session when present. The committed reader works without a service.
function sessionToken() {
  try { const value = JSON.parse(localStorage.getItem('br-ai-nstorm.session') ?? 'null'); return typeof value?.token === 'string' ? value.token : '' } catch { return '' }
}
export function Find({query='', selected, compare=[]}: {query?:string; selected?:string; compare?:string[]}) {
  const navigate = useNavigate()
  const [input,setInput]=useState(query)
  const [remote,setRemote]=useState<SearchResponse>()
  const [record,setRecord]=useState<ProblemView>()
  const [offline,setOffline]=useState(false)
  const local = commonsReader.search(query)
  const hits = remote?.query === query ? remote.problems : local
  const problem = selected ? (record?.problem.postackId === selected ? record.problem : commonsReader.problem(selected)) : undefined
  useEffect(()=>setInput(query),[query])
  useEffect(()=>{
    let active=true
    setRemote(undefined);setRecord(undefined);setOffline(false)
    if(query) void commonsApi.search(sessionToken(),query).then(result=>{if(active)setRemote(result)}).catch(()=>{if(active)setOffline(true)})
    if(selected) void commonsApi.problem(sessionToken(),selected).then(result=>{if(active)setRecord(result)}).catch(()=>{if(active)setOffline(true)})
    return ()=>{active=false}
  },[query,selected])
  const choose=(id:string)=>void navigate({to:'/find',search:{query,selected,compare:compare.includes(id)?compare.filter(x=>x!==id):[...compare,id].slice(0,2)}})
  return <AppLayout aside={<ThreadList />}><section className="find"><h1>Finden</h1><form className="find-form" onSubmit={e=>{e.preventDefault();void navigate({to:'/find',search:{query:input}})}}><input aria-label="Quellen finden" placeholder="Stimmen, Quellen, Korrekturen suchen" value={input} onChange={e=>setInput(e.target.value)} /><Button type="submit" variant="primary">Finden</Button></form>{query && <p className="sub">{offline ? 'Lokaler Quellenstand · Dienst nicht verbunden' : remote ? 'Quellen und Beiträge aus dem Commons-Dienst' : 'Lokaler Quellenstand'}</p>}{selected && <Link className="back-link" to="/find" search={{query,compare}}>← Zurück zu den Ergebnissen</Link>}{selected ? problem ? <Record problem={problem} query={query} /> : <h2>Quelle nicht gefunden</h2> : <div className="find-results">{hits.map(hit=>{const p=commonsReader.problem(hit.problemId);const basis=matchBasis(query,hit);return <article className="card" key={hit.problemId}><div className="card-h"><h2><Link to="/find" search={{query,selected:hit.problemId,compare}}>{p?.title ?? hit.problemId}</Link></h2>{hit.nearMatch && <Badge tone="warn">Abweichende Bedingungen</Badge>}</div><p>{p?.environment.join(' · ')}</p><p className="sub">Deine Wörter: {basis.yourWords.map(w=>w.word).join(', ') || 'Keine direkten Treffer'}{basis.addedBySearch.length>0 && ` · Durch die Suche ergänzt: ${basis.addedBySearch.map(w=>w.word).join(', ')}`}</p><Button aria-pressed={compare.includes(hit.problemId)} disabled={!compare.includes(hit.problemId)&&compare.length===2} onClick={()=>choose(hit.problemId)}>{compare.includes(hit.problemId)?'Auswahl aufheben':'Vergleichen'}</Button></article>})}{query && hits.length===0 && <p>Keine passenden Quellen gefunden.</p>}</div>}{remote?.contributions.map(c=><article className="card" key={c.contributionId}><h2>Beitrag von {c.summary.actor.displayName ?? c.summary.actor.id}</h2><p>{c.summary.excerpt}</p>{c.summary.sourceRefs.map(ref=><a key={ref.objectId} href={ref.permalink}>Originalquelle: {ref.objectId}</a>)}</article>)}{compare.length>0 && <div className="compare-selection"><span>{compare.length} von 2 Quellen ausgewählt</span><Button onClick={()=>void navigate({to:'/find',search:{query,selected,compare:[]}})}>Auswahl aufheben</Button></div>}{compare.length===2 && <Comparison ids={compare} />}</section></AppLayout>
}
const labels: Record<CompareField,string> = {device:'Gilt für',environment:'Bedingungen',symptoms:'Symptome',outcomes:'Ergebnisse',status:'Status und Grenzen',corrections:'Korrekturen'}
function Record({problem,query}: {problem:ImportedProblem;query:string}) {
  const hit=commonsReader.search(query).find(h=>h.problemId===problem.postackId)
  const basis=hit?matchBasis(query,hit):undefined
  return <article className="card record"><h2>{problem.title}</h2><p className="sub">Interpretation durch Agenten · ungeprüft</p>{basis && <p>Deine Wörter im Datensatz: {basis.yourWords.map(w=>w.word).join(', ')}{basis.unmatched.length>0 && ` · Nicht gefunden: ${basis.unmatched.join(', ')}`}</p>}<dl>{Object.entries(labels).map(([field,label])=><div key={field}><dt>{label}</dt><dd>{field==='status'?problem.statusNote ?? problem.status:field==='corrections'?problem.corrections.map(c=>c.note).join(' · ')||'Nicht angegeben':problem[field as 'device'|'environment'|'symptoms'|'outcomes'].join(' · ')||'Nicht angegeben'}</dd></div>)}</dl>{problem.evidence.map(e=><section key={e.id}><h3>Originalworte</h3><blockquote>{e.quote ?? 'Kein Originaltext im lokalen Quellenstand'}</blockquote><a href={e.source.permalink} target="_blank" rel="noreferrer">Originalquelle öffnen ↗</a>{e.interpretation && <><h3>Interpretation durch Agenten</h3><p>{e.interpretation}</p></>}</section>)}</article>
}
function Comparison({ids}: {ids:string[]}) {
  const a=commonsReader.problem(ids[0]),b=commonsReader.problem(ids[1])
  if(!a||!b)return <p>Vergleich nicht verfügbar</p>
  const comparison=compareRecords(a,b)
  return <section className="card"><h2>Vergleichen</h2><p className="sub">Gleiche Formulierungen belegen keine gemeinsame Ursache.</p><div className="table-scroll"><table className="comparison"><thead><tr><th>Merkmal</th><th>{a.title}</th><th>{b.title}</th></tr></thead><tbody>{comparison.rows.map(row=><tr key={row.field}><th>{labels[row.field]}</th><td>{row.a.join(' · ')||'Nicht angegeben'}</td><td>{row.b.join(' · ')||'Nicht angegeben'}</td></tr>)}</tbody></table></div><p className="sub">In beiden genannt: {comparison.shared.map(f=>labels[f]).join(', ')||'Keine Übereinstimmungen'}</p></section>
}
