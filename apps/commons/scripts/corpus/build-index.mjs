#!/usr/bin/env node
// Adapted from postack-underflow 9fffa36e04edc7fd76aaa82f36c5f1ef12cea5bf:
// scripts/commons/build-index.mjs. Record-only: never reads cache or network.
import { createHash } from 'node:crypto';
import { readFileSync, writeFileSync, mkdirSync } from 'node:fs';
import { pathToFileURL } from 'node:url';
import { buildIndex } from '../../src/commons/retrieval/bm25.ts';
import { recordFields, RECORD_WEIGHTS } from '../../src/commons/retrieval/records.ts';
const root = new URL('../../corpus/', import.meta.url);
export const indexPath = new URL('index/record-index.json', root);
export function buildRecordIndex() {
  const inputs = {};
  const read = path => {
    const bytes = readFileSync(new URL(path, root));
    inputs[path] = createHash('sha256').update(bytes).digest('hex');
    return JSON.parse(bytes);
  };
  const manifest = read('snapshots/001/manifest.json');
  const records = read('records/problems.json');
  read('records/corrections.json');
  return JSON.stringify({
    schema: 'commons.record-index/1', revision: manifest.revision,
    snapshotAt: manifest.snapshotAt, inputs,
    index: buildIndex('structured', 'BM25F over committed unreviewed records only; no raw conversation',
      records.problems.map(p => ({ id: p.id, fields: recordFields(p) })), RECORD_WEIGHTS),
  }) + '\n';
}
if (process.argv[1] && import.meta.url === pathToFileURL(process.argv[1]).href) {
  mkdirSync(new URL('index/', root), { recursive: true });
  writeFileSync(indexPath, buildRecordIndex());
  console.log('Built deterministic record-only index');
}
