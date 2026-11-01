import test from 'node:test';
import { createRequire } from 'node:module';
const { returnTarget } = createRequire(import.meta.url)('../../sideprojects/pdf-lab/opening.js');
import assert from 'node:assert/strict';
import { mkdtempSync, readFileSync, writeFileSync, existsSync, mkdirSync, rmSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join, resolve } from 'node:path';
import { execFileSync } from 'node:child_process';
import { destinations } from '../../site/destinations.mjs';
test('hosted profile never pretends local apps are hosted',()=>{
  const d=destinations();assert.equal(d.commonsAvailable,false);assert.equal(d.workbenchAvailable,false);
  assert.ok(d.commonsExample.endsWith('#commons-access'));
  for(const v of Object.values(d))if(typeof v==='string')assert.ok(!v.includes('127.0.0.1'));
  for(const commons of ['http://example.com','https://127.0.0.1/','https://example.com:5173/','javascript:alert(1)','https://user:password@example.com/'])
    assert.throws(()=>destinations('hosted',{commons}));
});
test('local route contract preserves example and chapter returns',()=>{
  const d=destinations('local');assert.ok(d.commonsAvailable&&d.workbenchAvailable);
  assert.equal(new URL(d.commonsExample).hash,'#/search?q=My%20Mac%20cannot%20see%20my%20frame');
  assert.equal(new URL(d.pdfOpening).searchParams.get('return'),d.storyPast);
});
test('configured public applications retain canonical URLs',()=>{
  const d=destinations('hosted',{commons:'https://demo.example/',workbench:'https://lab.example/'});
  assert.equal(d.commonsHome,'https://demo.example/');assert.equal(d.workbenchAvailable,true);
});
test('composed artifact preserves Observatory and copies exact PDF bytes',()=>{
  const out=mkdtempSync(join(tmpdir(),'phf-artifact-'));
  try {
    writeFileSync(join(out,'index.html'),'existing observatory');
    mkdirSync(join(out,'e'));writeFileSync(join(out,'e/index.html'),'existing companion');
    mkdirSync(join(out,'data'));writeFileSync(join(out,'data/knowledge.json'),'{"keep":true}');
    execFileSync(process.execPath,['scripts/site/package-public.mjs',out],{stdio:'pipe'});
    assert.equal(readFileSync(join(out,'index.html'),'utf8'),'existing observatory');
    assert.equal(readFileSync(join(out,'data/knowledge.json'),'utf8'),'{"keep":true}');
    for(const name of ['01-poem-other.pdf','01-poem-visible.pdf'])
      assert.deepEqual(readFileSync(join(out,'pdf-lab/output/pdf',name)),readFileSync('sideprojects/pdf-lab/output/pdf/'+name));
    for(const file of ['story/index.html','pdf-lab/index.html','pdf-lab/opening.html','pdf-history/index.html']){
      const html=readFileSync(join(out,file),'utf8');
      for(const m of html.matchAll(/(?:src|href)="([^"#?]+)(?:[?#][^"]*)?"/g)){
        const href=m[1];
        if(/^(https?:|data:|\/)/.test(href))continue;
        // Explicit app destinations are configured at runtime; generated artifact links must exist.
        const target=resolve(out,file,'..',href);
        if(target===resolve(out,'story')||target===resolve(out))continue;
        assert.ok(existsSync(target),file+' links to missing '+href);
      }
    }
  }finally{rmSync(out,{recursive:true,force:true})}
});

test('PDF opening defaults return to a real story chapter',()=>{
  assert.equal(returnTarget(new URL('https://blackmath88.github.io/baselhack26-open-presence/pdf-lab/opening.html')),'https://blackmath88.github.io/baselhack26-open-presence/story/#past');
  assert.equal(returnTarget(new URL('http://127.0.0.1:8000/opening.html')),'http://127.0.0.1:8001/#past');
});
