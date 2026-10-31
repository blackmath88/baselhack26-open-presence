/* Validate real rewritten PDF structure and parity with the Python recipe. */
'use strict';
const assert=require('node:assert/strict'),fs=require('node:fs'),path=require('node:path');
const {bend}=require('./poems.js');
const source=fs.readFileSync(path.join(__dirname,'output/pdf/01-poem-other.pdf'));
const lines=['I keep a tide beneath my tongue.','The silence carries paper boats.','A word slips free before a song.','The shore was listening so long.'];
assert.deepEqual(Buffer.from(bend(source,lines)),source,'browser writer must reproduce the canonical alternate PDF byte for byte');
const output=Buffer.from(bend(source,['ONE','TWO','THREE','FOUR'])),s=output.toString('ascii');
const start=Number(s.match(/startxref\n(\d+)\n%%EOF/)[1]);assert.equal(s.slice(start,start+4),'xref');
const entries=s.slice(start).split('\n').slice(3,14);
entries.forEach((entry,i)=>assert.ok(s.slice(Number(entry.slice(0,10))).startsWith(`${i+1} 0 obj\n`)));
assert.match(s,/<41> <004F004E0045>/);
const objects=data=>[...data.toString('ascii').matchAll(/^(\d+) 0 obj\n([\s\S]*?)\nendobj\n/gm)];
const left=objects(source),right=objects(output),mapping=Number(source.toString().match(/\/ToUnicode (\d+) 0 R/)[1]);
left.forEach((o,i)=>{if(Number(o[1])!==mapping)assert.equal(o[2],right[i][2]);});
for(const bad of [[],['a','b','c'],['a','b','c',''],['a','b','c','x'.repeat(33)],['a','b','c','\n'],['a','b','c','é']])assert.throws(()=>bend(source,bad));
assert.throws(()=>bend(new Uint8Array(17000),lines));assert.throws(()=>bend(Buffer.from('%PDF-1.4'),lines));
console.log('Browser mapping writer: canonical byte identity, xref offsets, mapping-only edits and bounded inputs passed.');
