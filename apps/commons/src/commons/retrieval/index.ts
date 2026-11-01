// Reader adapter over the pinned Postack record-only BM25F port.
import artifact from '../../../corpus/index/record-index.json' with { type: 'json' };
import type { CommonsReader, SearchHit } from '../contracts';
import { importedProblems, sourceById, recordData } from '../source';
import { search as bm25Search, tokenize } from './bm25';
import { recordFields } from './records';

/** Query-side vocabulary is explicit in every explanation where it is used. */
export function queryVocabulary(query: string): { text: string; added: string[] } {
  const added: string[] = [];
  if (/\bmac(?:os)?\b/i.test(query)) added.push('mac', 'macos');
  if (/\bframe\b/i.test(query) && /(?:cannot|can.t|doesn.t|not|no|never)\s+(?:\w+\s+)?(?:see|detect|appear|recogniz|find)/i.test(query)) added.push('usb', 'disk', 'data');
  return { text: `${query} ${added.join(' ')}`, added: [...new Set(added.filter(t => !tokenize(query).includes(t)))] };
}
function platformMismatch(query: string, environment: string[]): boolean {
  const conditions = environment.join(' ');
  const mac = /\bmac(?:os)?\b/i;
  const windows = /\b(?:windows|wsl\d*)\b/i;
  const linux = /\blinux\b/i;
  if (mac.test(query)) return windows.test(conditions) && !mac.test(conditions);
  if (windows.test(query)) return (mac.test(conditions) || linux.test(conditions)) && !windows.test(conditions);
  if (linux.test(query)) return (mac.test(conditions) || windows.test(conditions)) && !linux.test(conditions);
  return false;
}
export function createCommonsReader(): CommonsReader {
  return {
    problems: importedProblems,
    problem: id => importedProblems().find(p => p.postackId === id),
    source: sourceById,
    search(query, limit = 20) {
      if (!query.trim() || !Number.isFinite(limit) || limit <= 0) return [];
      const expanded = queryVocabulary(query);
      const index = { ...artifact.index, system: 'structured' as const };
      const rawHits = bm25Search(index, expanded.text).hits;
      const hits = rawHits.map(hit => {
        const p = recordData.problems.find(p => p.id === hit.id)!;
        const fields = recordFields(p);
        const matches: SearchHit['matches'] = hit.matches.flatMap(m => Object.keys(m.fields).map(field => ({
          field: field as SearchHit['matches'][number]['field'], term: m.term, text: fields[field], writerVocabulary: field === 'aliases',
        })));
        const nearMatch = platformMismatch(query, p.environment);
        const explanation = [
          `Matched ${[...new Set(matches.map(m => `${m.field}: ${m.term}${m.writerVocabulary ? ' (writer-added vocabulary)' : ''}`))].join('; ')}.`,
          expanded.added.length ? `Query vocabulary expanded explicitly with: ${expanded.added.join(', ')}.` : '',
          nearMatch ? `Near match: reported conditions (${p.environment.join('; ')}) differ from the query platform; this is not evidence of a fix for your platform.` : `Reported conditions: ${p.environment.join('; ')}.`,
          'Ranking uses record-only BM25F field matches, not a confidence percentage. Agent interpretation is unreviewed.',
        ].filter(Boolean).join(' ');
        return { problemId: p.id, rank: 0, matches, nearMatch, explanation };
      });
      // Explicitly mismatched platform conditions follow compatible/unspecified ones.
      hits.sort((a, b) => Number(a.nearMatch) - Number(b.nearMatch));
      return hits.slice(0, Math.floor(limit)).map((h, i) => ({ ...h, rank: i + 1 }));
    },
  };
}
