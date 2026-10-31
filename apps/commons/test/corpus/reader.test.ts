import { describe, it, expect } from 'vitest';
import { readFileSync } from 'node:fs';
import { createHash } from 'node:crypto';
import { execFileSync } from 'node:child_process';
import { createCommonsReader } from '../../src/commons/retrieval';
import { manifest, recordData, resolveSource, sourceById } from '../../src/commons/source';

const reader = createCommonsReader();
const root = new URL('../../', import.meta.url);
describe('pinned corpus reader', () => {
  it('retains the exact pinned manifest bytes', () => {
    const bytes = readFileSync(new URL('corpus/snapshots/001/manifest.json', root));
    expect(createHash('sha256').update(bytes).digest('hex')).toBe('a34914f68f90114e922543a60b4ce24a8050fe7fd6b8bc1844390cd49dd2a0a5');
  });
  it('reproduces the committed index with no cache', () => {
    expect(execFileSync(process.execPath, ['scripts/corpus/check-index.mjs'], { cwd: root, encoding: 'utf8' })).toContain('byte-for-byte');
  });
  it('finds the Mac USB report first with explicit field and term explanations', () => {
    const hits = reader.search('My Mac cannot see my frame');
    expect(hits[0].problemId).toBe('usb-c-no-data');
    expect(hits[0].nearMatch).toBe(false);
    expect(hits[0].matches.some(m => m.term === 'mac' && m.field === 'quote')).toBe(true);
    expect(hits[0].explanation).toContain('Query vocabulary expanded explicitly');
    const near = hits.find(h => h.problemId === 'wsl-usbipd-ums');
    expect(near?.nearMatch).toBe(true);
    expect(near?.explanation).toContain('Windows + WSL2');
    expect(hits.every(h => h.matches.length && !/\d+%/.test(h.explanation))).toBe(true);
    expect(hits).toEqual(reader.search('My Mac cannot see my frame'));
  });
  it('labels aliases as writer vocabulary', () => {
    const hits = reader.search('computer doesnt see the frame');
    expect(hits.flatMap(h => h.matches).filter(m => m.field === 'aliases').length).toBeGreaterThan(0);
    expect(hits.flatMap(h => h.matches).filter(m => m.field === 'aliases').every(m => m.writerVocabulary)).toBe(true);
  });
  it('resolves every evidence author or explicit unknown, permalink, digest and availability', () => {
    for (const p of reader.problems()) for (const e of p.evidence) {
      expect(e.source.author.length).toBeGreaterThan(0);
      expect(e.source.permalink).toMatch(/^https:\/\/github.com\/wesbos\/photo-frame-dashboard\//);
      expect(e.source.digest).toMatch(/^[0-9a-f]{64}$/);
      expect(e.source.retrievedAt).toBe(manifest.snapshotAt);
      expect(e.source.availability).toBe('unavailable');
      expect(e.source.coverageNote).toContain('does not establish deletion');
      expect(sourceById(e.source.objectId)?.digest).toBe(e.source.digest);
      if (e.source.objectId.startsWith('doc/')) {
        expect(e.source.author).toBe('unknown');
        expect(e.source.sourceTime).toBeNull();
      } else {
        expect(e.source.author).not.toBe('unknown');
        expect(e.source.sourceTime).toBeTruthy();
      }
    }
    const thread = manifest.threads.find(t => t.comments.length)!;
    const comment = thread.comments[0];
    expect(resolveSource({ thread: `${thread.type}/${thread.number}`, comment: comment.id })?.author).toBe(comment.author);
    expect(reader.source(`comment/${comment.id}`)?.permalink).toBe(comment.url);
    expect(reader.source('issue/999999')).toBeUndefined();
    expect(resolveSource({ thread: 'issue/99', comment: -1 })).toBeUndefined();
  });
  it('keeps original quotes separate from interpretation and all records unreviewed', () => {
    for (const raw of recordData.problems) {
      const p = reader.problem(raw.id)!;
      expect(p.provenance.review).toBe('unreviewed');
      expect(p.provenance.authoredBy).toBe('agent:claude-opus-5-5');
      for (const e of raw.evidence) {
        const imported = p.evidence.find(x => x.id === e.id)!;
        expect(imported.quote).toBe(e.quote || null);
        expect(imported.interpretation).toBe(e.says || null);
      }
    }
    expect(reader.problem('gadget-error-71')?.corrections[0].id).toBe('c-71-january');
    const first = reader.problems()[0];
    first.title = 'consumer edit'; first.device.push('consumer device');
    expect(reader.problem(first.postackId)?.title).not.toBe('consumer edit');
    expect(reader.problem(first.postackId)?.device).not.toContain('consumer device');
  });
  it('handles empty queries and explicit result limits', () => {
    expect(reader.search('')).toEqual([]);
    expect(reader.search('frame', 0)).toEqual([]);
    expect(reader.search('frame', 2)).toHaveLength(2);
  });
});
