import manifest from '../../../corpus/snapshots/001/manifest.json' with { type: 'json' };
import recordData from '../../../corpus/records/problems.json' with { type: 'json' };
import correctionData from '../../../corpus/records/corrections.json' with { type: 'json' };
import type { SourceRef, ImportedProblem, EvidenceQuote } from '../contracts';

export { manifest, recordData, correctionData };
export const RECORD_ORIGIN = '9fffa36e04edc7fd76aaa82f36c5f1ef12cea5bf';
export type EvidenceRef = { thread: string; comment?: number } | { doc: string; lines?: number[] };
const snapshotId = `commons-001@${manifest.revision.slice(0, 12)}`;
const coverageNote = 'Metadata and selected record excerpts only; full source text is not committed and is unavailable locally. Absence from a capture does not establish deletion. Inline review comments and attachments are excluded.';

/** Unknown references return undefined, never a fabricated source identity. */
export function resolveSource(ref: EvidenceRef): SourceRef | undefined {
  const base = { snapshotId, retrievedAt: manifest.snapshotAt, availability: 'unavailable' as const, coverageNote };
  if ('doc' in ref) {
    const doc = manifest.docs.find(d => d.path === ref.doc);
    if (!doc) return undefined;
    const locator = ref.lines?.length ? `L${ref.lines[0]}-L${ref.lines[1] ?? ref.lines[0]}` : null;
    return { ...base, objectId: `doc/${doc.path}`, permalink: doc.url + (locator ? `#${locator}` : ''),
      author: 'unknown', sourceTime: null, digest: doc.sha256, locator,
      coverageNote: `${coverageNote} Document author and authoring time are not recorded in this manifest.` };
  }
  const thread = manifest.threads.find(t => `${t.type}/${t.number}` === ref.thread);
  if (!thread) return undefined;
  const object = ref.comment === undefined ? thread : thread.comments.find(c => c.id === ref.comment);
  if (!object) return undefined;
  return { ...base, objectId: ref.comment === undefined ? ref.thread : `comment/${ref.comment}`,
    permalink: object.url, author: object.author ?? 'unknown', sourceTime: object.createdAt,
    digest: object.sha256, locator: null };
}

export function sourceById(objectId: string): SourceRef | undefined {
  if (objectId.startsWith('doc/')) {
    const [doc, fragment] = objectId.slice(4).split('#');
    const lines = fragment?.match(/^L(\d+)(?:-L(\d+))?$/);
    return resolveSource(lines ? { doc, lines: [Number(lines[1]), Number(lines[2] ?? lines[1])] } : { doc });
  }
  if (objectId.startsWith('comment/')) {
    const id = Number(objectId.slice(8));
    const t = manifest.threads.find(t => t.comments.some(c => c.id === id));
    return t ? resolveSource({ thread: `${t.type}/${t.number}`, comment: id }) : undefined;
  }
  // Also accept Postack's original thread#comment reference syntax.
  const [thread, comment] = objectId.split('#');
  return resolveSource(comment ? { thread, comment: Number(comment) } : { thread });
}
function evidence(id: string, role: string, ref: EvidenceRef, quote: string, interpretation: string): EvidenceQuote {
  const source = resolveSource(ref);
  if (!source) throw new Error(`Unresolved committed evidence ${JSON.stringify(ref)}`);
  return { id, role, source, quote: quote || null, interpretation: interpretation || null };
}
/** Fresh objects protect the canonical imported records from consumer edits. */
export function importedProblems(): ImportedProblem[] {
  return recordData.problems.map(p => {
    const corrections = correctionData.corrections.filter(c => c.problem === p.id);
    return {
      postackId: p.id, title: p.title, device: [...p.device], environment: [...p.environment],
      symptoms: [...p.symptoms], aliases: [...p.aliases], status: p.status, statusNote: p.statusNote ?? null,
      evidence: [
        ...p.evidence.map(e => evidence(e.id, e.role, e.ref, e.quote, e.says)),
        ...corrections.flatMap(c => [evidence(c.id, 'correction', c.ref, c.quote, c.says),
          evidence(`${c.id}:qualifies`, 'qualified-claim', c.qualifies.ref, c.qualifies.quote, c.absorbedNote)]),
      ],
      outcomes: p.approaches.map(a => `${a.label}; scope: ${a.scope}; reports: ${a.reports.map(r => `${r.evidence}: ${r.result}`).join(', ') || 'none'}`),
      related: p.related.map(r => ({ problemId: r.to, relation: `${r.kind} (${r.basis}): ${r.note}`,
        origin: r.basis === 'source-declared' ? 'source' as const : 'postack-agent' as const,
        evidenceIds: 'evidence' in r && r.evidence ? [r.evidence] : [] })),
      corrections: corrections.map(c => ({ id: c.id, note: `${c.says} ${c.absorbedNote} Preview is a record-writer proposal, not an applied source change.`, evidenceIds: [c.id, `${c.id}:qualifies`] })),
      provenance: { authoredBy: recordData.authoredBy, review: 'unreviewed', originCommit: RECORD_ORIGIN, snapshotRevision: manifest.revision },
    };
  });
}
