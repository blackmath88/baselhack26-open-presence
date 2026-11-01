// Compose into the existing Observatory artifact. Never replace its root or data.
import { mkdirSync, readdirSync, copyFileSync, readFileSync, writeFileSync } from 'node:fs';
import { resolve, dirname, extname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { execFileSync } from 'node:child_process';
const root = resolve(dirname(fileURLToPath(import.meta.url)), '../..');
const out = resolve(root, process.argv[2] || 'observstory');
const profile = process.argv[3] || 'hosted';
execFileSync(process.execPath,[join(root,'scripts/site/build.mjs'),profile,join(out,'story')],{stdio:'inherit'});
const copy = (from,to) => { mkdirSync(dirname(to),{recursive:true}); copyFileSync(from,to); };
const lab = join(root,'sideprojects/pdf-lab');
for(const name of readdirSync(lab)){
  if (['index.html','opening.html','cabinet.css','opening.css','cabinet.js','opening.js','weird.js','poems.js','transforms.js','machine.js','RUNNING.md','TWO-POEMS.md','poems.py'].includes(name) || (name.endsWith('.md') && !name.startsWith('CLAUDE'))) copy(join(lab,name),join(out,'pdf-lab',name));
}
function tree(from,to,allowed) {
  for(const e of readdirSync(from,{withFileTypes:true})){
    if(e.isDirectory()) tree(join(from,e.name),join(to,e.name),allowed);
    else if(e.isFile() && allowed.includes(extname(e.name))) copy(join(from,e.name),join(to,e.name));
  }
}
for(const dir of ['pdf','transforms','mapping-minimal']) tree(join(lab,'output',dir),join(out,'pdf-lab/output',dir),['.pdf','.json']);
for(const name of readdirSync(join(lab,'evidence'))) if(name.endsWith('.json')) copy(join(lab,'evidence',name),join(out,'pdf-lab/evidence',name));
tree(join(lab,'evidence/previews'),join(out,'pdf-lab/evidence/previews'),['.webp','.png']);
copy(join(root,'modules/pdf-history/index.html'),join(out,'pdf-history/index.html'));
copy(join(root,'modules/pdf-history/sources.json'),join(out,'pdf-history/sources.json'));
if(profile==='local'){
  copy(join(root,'modules/pdf-history/index.html'),join(out,'story/pdf-history/index.html'));
  copy(join(root,'modules/pdf-history/sources.json'),join(out,'story/pdf-history/sources.json'));
}
const story = profile === 'local' ? 'http://127.0.0.1:8001/' : '../story/';
for(const file of ['pdf-lab/index.html','pdf-lab/opening.html','pdf-history/index.html']){
  const p=join(out,file);
  const nav='<nav aria-label=".phf experiences" style="padding:14px 5%;background:#f4f7fb;color:#182536;font:14px system-ui;display:flex;gap:24px;flex-wrap:wrap"><a style="color:inherit" href="'+story+'#past">← .phf story</a><a style="color:inherit" href="'+story+'#future">Commons</a><a style="color:inherit" href="https://blackmath88.github.io/baselhack26-open-presence/">Observatory ↗</a></nav>';
  let html=readFileSync(p,'utf8').replace(/<body([^>]*)>/,'<body$1>'+nav);
  html=html.replaceAll('../../presentation/',story+'#past').replaceAll('../../sideprojects/pdf-lab/',profile==='local'?'http://127.0.0.1:8000/':'../pdf-lab/');
  writeFileSync(p,html);
}
console.log('Published assets composed without changing Observatory root.');

if(profile==='local') copy(join(out,'pdf-history/index.html'),join(out,'story/pdf-history/index.html'));
