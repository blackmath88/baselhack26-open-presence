/**
 * Repository entrance: walk the pinned snapshot of the source repository and
 * jump to the problem records that cite a file or thread. Metadata only —
 * coverage and exclusions are shown, and the original is one click away.
 */
import { useEffect, useState } from 'react'
import { ExternalLink, FileText, Folder, MessageSquare } from 'lucide-react'
import { appLinks } from '../../commons/contracts'
import { commonsApi, type RepoView } from '../../commons/client/api'
import { safeHref } from './ContributionCard'

type Linked = { problemId: string; title: string; evidenceIds: string[]; locators: string[]; link: string }

function Problems({ problems }: { problems: Linked[] }) {
  if (!problems.length) return <span className="commons-limit">no problem record cites this</span>
  return (
    <span>
      {problems.map((p, i) => (
        <span key={p.problemId}>{i > 0 && ' · '}<a href={p.link} title={p.locators.join(', ')}>{p.title}</a> <span className="commons-limit">({p.evidenceIds.join(', ')})</span></span>
      ))}
    </span>
  )
}

export function RepoNavigator({ token, path, object, type }: { token: string; path: string; object?: string; type?: 'issue' | 'pull' | 'discussion' }) {
  const [view, setView] = useState<RepoView | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [linkedOnly, setLinkedOnly] = useState(true)
  const [pages, setPages] = useState<Array<Extract<RepoView, { view: 'threads' }>>>([])
  useEffect(() => {
    setView(null); setPages([])
    const options = object ? { object } : type ? { type, linked: linkedOnly } : { path }
    commonsApi.repository(token, options).then((v) => { setView(v); setError(null) }, (e) => setError(e instanceof Error ? e.message : 'Could not load the repository view.'))
  }, [token, path, object, type, linkedOnly])
  if (error) return <div className="banner error" role="alert">{error}</div>
  if (!view) return <div className="empty-state">Loading repository snapshot…</div>
  const crumbs = path.split('/').filter(Boolean)
  const more = async (cursor: string) => {
    const next = await commonsApi.repository(token, { type, linked: linkedOnly, cursor })
    if (next.view === 'threads') setPages((p) => [...p, next])
  }
  return (
    <section className="commons-repo" aria-label="Repository navigator">
      <div className="section-kicker">
        Repository snapshot · <a href={view.coverage.url} target="_blank" rel="noreferrer noopener">{view.coverage.repository} <ExternalLink size={11} /></a> @ {view.coverage.revision.slice(0, 12)} · captured {view.coverage.snapshotAt.slice(0, 10)} · {view.problems} problem records
      </div>
      <details className="commons-coverage">
        <summary>What this snapshot covers (and does not)</summary>
        <p className="commons-limit">{view.coverage.note}</p>
        <ul className="commons-limit">{view.coverage.exclusions.map((e) => <li key={e}>{e}</li>)}{view.coverage.coverage.map((c) => <li key={c}>{c}</li>)}</ul>
        <p className="commons-limit">{view.coverage.licenseNote}</p>
      </details>
      <nav className="commons-crumbs" aria-label="Path">
        <a href={appLinks.repository()}>root</a>
        {crumbs.map((c, i) => <span key={i}> / <a href={appLinks.repository(crumbs.slice(0, i + 1).join('/'))}>{c}</a></span>)}
        {object && <span> / {object}</span>}
        {type && <span> / {type}s</span>}
      </nav>
      {view.view === 'dir' && (
        <>
          {view.path === '' && 'threads' in view && view.threads && (
            <p>
              <MessageSquare size={14} /> Threads: <a href={`${appLinks.repository()}?type=issue`}>{view.threads.issues} issues</a> · <a href={`${appLinks.repository()}?type=pull`}>{view.threads.pulls} pull requests</a> · <a href={`${appLinks.repository()}?type=discussion`}>{view.threads.discussions} discussions</a>
              <span className="commons-limit"> · {view.threads.linked} cited by a problem record</span>
            </p>
          )}
          <ul className="commons-tree">
            {view.entries.map((e) => (
              <li key={e.path}>
                {e.kind === 'dir' ? <Folder size={14} /> : <FileText size={14} />} <a href={appLinks.repository(e.path)}>{e.name}</a>
                {e.kind === 'dir' && <span className="commons-limit"> ({e.children} files)</span>}
                {' '}<span className="commons-limit">→ </span><Problems problems={e.problems} />
              </li>
            ))}
          </ul>
        </>
      )}
      {view.view === 'doc' && (
        <div className="commons-card">
          <h3><FileText size={15} /> {view.doc.path}</h3>
          <p className="commons-limit">{view.doc.bytes} bytes · sha256 {view.doc.sha256?.slice(0, 16)}… · {safeHref(view.doc.url ?? '') ? <a href={view.doc.url} target="_blank" rel="noreferrer noopener">original at this revision <ExternalLink size={11} /></a> : 'no safe link'}. Full text is not stored here.</p>
          <p>Cited by: <Problems problems={view.doc.problems} /></p>
        </div>
      )}
      {(view.view === 'threads') && (
        <>
          <label className="commons-limit"><input type="checkbox" checked={linkedOnly} onChange={(e) => setLinkedOnly(e.target.checked)} /> only threads cited by a problem record ({view.total} shown)</label>
          <ul className="commons-tree">
            {[view, ...pages].flatMap((p) => p.threads).map((t) => (
              <li key={t.object}>
                <a href={`${appLinks.repository()}?object=${encodeURIComponent(t.object)}`}>#{t.number} {t.title}</a>
                <span className="commons-limit"> · {t.author ? `@${t.author}` : 'author unknown'} · {t.createdAt.slice(0, 10)} · {t.comments} comments</span>
                {' '}<span className="commons-limit">→ </span><Problems problems={t.problems} />
              </li>
            ))}
          </ul>
          {(pages[pages.length - 1] ?? view).cursor && <button className="button" onClick={() => void more((pages[pages.length - 1] ?? view).cursor!)}>More</button>}
        </>
      )}
      {view.view === 'thread' && (
        <div className="commons-card">
          <h3><MessageSquare size={15} /> {view.thread.object}: {view.thread.title}</h3>
          <p className="commons-limit">{view.thread.author ? `@${view.thread.author}` : 'author unknown'} · opened {view.thread.createdAt.slice(0, 10)} · {view.thread.comments} comments by {view.thread.commentAuthors.map((a) => `@${a}`).join(', ') || 'nobody'} · {safeHref(view.thread.url) ? <a href={view.thread.url} target="_blank" rel="noreferrer noopener">original <ExternalLink size={11} /></a> : null}</p>
          <p>Cited by: <Problems problems={view.thread.problems} /></p>
          <ul className="commons-tree">
            {view.thread.commentList.filter((c) => c.problems.length > 0).map((c) => (
              <li key={c.object}>{c.object} <span className="commons-limit">@{c.author} · {c.createdAt.slice(0, 10)}</span> → <Problems problems={c.problems} /></li>
            ))}
          </ul>
          <p className="commons-limit">Comment bodies are not stored here; only authors, times and hashes. Follow the original to read them.</p>
        </div>
      )}
    </section>
  )
}
