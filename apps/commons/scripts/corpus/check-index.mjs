#!/usr/bin/env node
import { readFileSync } from 'node:fs';
import { buildRecordIndex, indexPath } from './build-index.mjs';
if (!readFileSync(indexPath).equals(Buffer.from(buildRecordIndex()))) {
  console.error('Record index differs from committed inputs; rebuild with node scripts/corpus/build-index.mjs');
  process.exitCode = 1;
} else console.log('Record-only index reproduced byte-for-byte');
