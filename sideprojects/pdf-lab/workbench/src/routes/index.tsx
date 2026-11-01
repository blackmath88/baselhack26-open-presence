import { Link, createFileRoute } from '@tanstack/react-router'
import { lab, previewUrl } from '../features/twoPoems/model'
import { legacyCabinetUrl, useClientValue } from '../features/legacy'

export const Route = createFileRoute('/')({ component: Cabinet })

// Exhibits the workbench fully supports; their legacy cards are not repeated below.
const SUPPORTED_LEGACY = new Set(['poems', 'poem-journey'])

function Cabinet() {
  const legacyBase = useClientValue(() => legacyCabinetUrl(), '')
  const art = previewUrl('other')
  const data = lab.data
  const others = (data?.legacy ?? []).filter((e) => !SUPPORTED_LEGACY.has(e.anchor))
  const verified = data ? [...data.artefacts.values()].filter((a) => a.integrity === 'verified').length : 0
  return (
    <>
      <div className="crumbs" aria-label="Breadcrumb">Cabinet</div>
      <div className="page-head">
        <div>
          <h1>Strange documents, opened carefully.</h1>
          <p className="lead">Real PDFs from the lab, with the recorded evidence of what readers did with them.</p>
        </div>
      </div>
      {lab.errors.length > 0 && (
        <div className="notice bad" role="alert" style={{ marginBottom: 24 }}>
          <strong>Some evidence could not be loaded.</strong>
          <ul>{lab.errors.map((e) => <li key={e}>{e}</li>)}</ul>
        </div>
      )}

      <article className="card feature" aria-labelledby="a01-title">
        <div className="feature-art">
          {art ? <img src={art} width={612} height={792} alt="Recorded MuPDF render of the alternate-reading poem: four lines of verse on a white page" /> : <p className="muted">Recorded render unavailable.</p>}
        </div>
        <div>
          <p className="eyebrow">A01 · Two poems</p>
          <h2 id="a01-title">Two readings. One picture.</h2>
          <p>Four lines you can read with your eyes. Four different lines in the character map underneath. Open the file, choose a line, and follow what each reader actually returned.</p>
          <p style={{ display: 'flex', gap: 8, flexWrap: 'wrap', marginTop: 20 }}>
            <Link className="btn primary" to="/specimens/$specimenId" params={{ specimenId: 'a01-two-poems' }} search={{}}>Open the specimen</Link>
            <Link className="btn" to="/specimens/$specimenId" params={{ specimenId: 'a01-two-poems' }} search={{ reveal: true }}>Reveal the other reading</Link>
          </p>
        </div>
      </article>

      <h2 className="section-title">In the legacy cabinet</h2>
      <p className="section-lead">These exhibits work in the original cabinet and open there in a new tab. The workbench does not inspect them yet.</p>
      <div className="grid">
        {others.map((e) => {
          const img = e.preview ? data?.artefacts.get(e.preview)?.url : undefined
          return (
            <a key={e.anchor} className="card tile" href={legacyBase ? `${legacyBase}#${e.anchor}` : undefined} target="_blank" rel="noreferrer">
              {img
                ? <span className="tile-art"><img src={img} alt="" loading="lazy" /></span>
                : <span className="tile-art empty">No recorded render in the cabinet</span>}
              <span className="tile-body">
                <span className="eyebrow" style={{ margin: 0 }}>{e.eyebrow}</span>
                <strong>{e.headline}</strong>
                <span className="small muted">Opens the legacy cabinet ↗</span>
              </span>
            </a>
          )
        })}
      </div>

      {data && (
        <p className="inventory">
          Inventory: {data.artefacts.size} files read from <code>{data.source.root}</code> at {data.source.commit ? <code>{data.source.commit.slice(0, 12)}</code> : 'an unknown commit'}{data.source.dirty ? ' (with uncommitted changes)' : ''};
          {' '}{verified} match the hashes in their manifests. {data.sameBytes.length > 0 && <>Identical bytes under different names: {data.sameBytes.map((g) => g.map((p) => p.split('/').pop()).join(' = ')).join('; ')}.</>}
        </p>
      )}
    </>
  )
}
