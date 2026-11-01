/* Guided 60-second opening. Shows committed renders and recorded extraction; parses one real fixture live. Never a PDF viewer. */
(function(){
'use strict';
const SPECIMEN='output/pdf/01-poem-other.pdf';

// Narrow reader for the authored uncompressed two-poem fixture: code -> drawn words (Type 3 CharProc) and mapped text (/ToUnicode).
function readPoemMap(text){
  if(!text.startsWith('%PDF-1.4')||text.length>16384)throw Error('Not the small authored two-poem fixture.');
  const objects={};
  for(const m of text.matchAll(/^(\d+) 0 obj\n([\s\S]*?)\nendobj\n/gm))objects[m[1]]=m[2];
  const font=Object.values(objects).find(body=>body.includes('/Subtype /Type3'));
  if(!font)throw Error('No Type 3 font found.');
  const procs={};
  for(const m of (font.match(/\/CharProcs << ([^>]*) >>/)||[,''])[1].matchAll(/\/(\w+) (\d+) 0 R/g))procs[m[1]]=m[2];
  const diff=(font.match(/\/Differences \[(\d+) ([^\]]*)\]/));
  const tu=(font.match(/\/ToUnicode (\d+) 0 R/)||[])[1];
  if(!diff||!tu||!objects[tu])throw Error('Unexpected font structure.');
  const mapped={};
  for(const m of objects[tu].matchAll(/<([0-9A-Fa-f]{2})> <([0-9A-Fa-f]+)>/g)){
    let s='';for(let i=0;i<m[2].length;i+=4)s+=String.fromCharCode(parseInt(m[2].slice(i,i+4),16));
    mapped[parseInt(m[1],16)]=s;
  }
  const first=Number(diff[1]);
  return diff[2].trim().split(/\s+/).map((name,i)=>{
    const code=first+i,body=objects[procs[name.slice(1)]]||'';
    const drawn=(body.match(/\(((?:[^()\\]|\\.)*)\) Tj/)||[])[1];
    if(drawn===undefined||mapped[code]===undefined)throw Error('Glyph '+name+' is incomplete.');
    return {code:code.toString(16).toUpperCase(),glyph:name.slice(1),draws:drawn.replace(/\\(.)/g,'$1'),means:mapped[code]};
  });
}
// The four poem lines differ between the two recorded extractions; everything else on the page is shared.
function poemLines(seenText,gotText){
  const seen=seenText.split('\n'),got=gotText.split('\n');
  return {seen:seen.filter(l=>l&&!got.includes(l)),got:got.filter(l=>l&&!seen.includes(l))};
}
// Return target: ?return= (relative or http/https only), else a guess from the documented local contract.
function returnTarget(loc){
  const asked=new URLSearchParams(loc.search).get('return');
  if(asked){try{const u=new URL(asked,loc.href);if(u.protocol==='http:'||u.protocol==='https:')return u.href;}catch(e){}}
  if(loc.port==='8000')return loc.protocol+'//'+loc.hostname+':8001/#past';
  if(/\/pdf-lab\//.test(loc.pathname)&&!/\/sideprojects\//.test(loc.pathname))return new URL('../story/#past',loc.href).href;
  return 'https://blackmath88.github.io/baselhack26-open-presence/story/#past';
}
if(typeof module!=='undefined'&&module.exports)module.exports={readPoemMap,poemLines,returnTarget};
if(typeof document==='undefined')return;

const scenes=[...document.querySelectorAll('.scene')];
const dots=document.getElementById('dots');
const reduce=window.matchMedia('(prefers-reduced-motion: reduce)').matches;
let index=0,evidence=null,transforms=null,engine='mupdf',revealed=false;

scenes.forEach((scene,i)=>{
  const li=document.createElement('li'),b=document.createElement('button');
  b.type='button';b.setAttribute('aria-label','Step '+(i+1)+' of '+scenes.length+': '+scene.querySelector('h1,h2').textContent);
  b.addEventListener('click',()=>go(i));li.append(b);dots.append(li);
});
function go(i,focus=true){
  i=Math.max(0,Math.min(scenes.length-1,i));
  const changed=i!==index;index=i;
  scenes.forEach((s,n)=>{s.hidden=n!==i;s.classList.toggle('enter',n===i&&changed&&!reduce);});
  [...dots.querySelectorAll('button')].forEach((b,n)=>{if(n===i)b.setAttribute('aria-current','step');else b.removeAttribute('aria-current');});
  document.querySelector('[data-prev]').disabled=i===0;
  document.querySelector('.controls [data-next]').disabled=i===scenes.length-1;
  history.replaceState(null,'',location.pathname+location.search+'#step-'+(i+1));
  window.scrollTo(0,0);
  if(focus){const h=scenes[i].querySelector('h1,h2');h.tabIndex=-1;h.focus({preventScroll:true});}
  if(scenes[i].dataset.scene==='3')renderReveal(true);
}
document.querySelectorAll('[data-next]').forEach(b=>b.addEventListener('click',()=>go(index+1)));
document.querySelector('[data-prev]').addEventListener('click',()=>go(index-1));
document.querySelector('[data-restart]').addEventListener('click',()=>{revealed=false;go(0);});
document.addEventListener('keydown',e=>{
  if(e.altKey||e.ctrlKey||e.metaKey)return;
  const t=e.target,interactive=t.closest&&t.closest('a,button,summary,input,select,textarea');
  if(['ArrowRight','PageDown'].includes(e.key)||(e.key===' '&&!interactive)){e.preventDefault();go(index+1);}
  else if(['ArrowLeft','PageUp'].includes(e.key)){e.preventDefault();go(index-1);}
  else if(e.key==='Home'){e.preventDefault();go(0);}
  else if(e.key==='End'){e.preventDefault();go(scenes.length-1);}
  else if(e.key==='c'||e.key==='C'){location.href='index.html#poems';}
});
document.getElementById('return-link').href=returnTarget(location);

// Reveal: recorded extraction beside the visible lines.
const pairs=document.getElementById('pairs');
document.querySelectorAll('[data-engine]').forEach(b=>b.addEventListener('click',()=>{
  engine=b.dataset.engine;
  document.querySelectorAll('[data-engine]').forEach(x=>x.setAttribute('aria-pressed',String(x===b)));
  renderReveal(false);
}));
function el(tag,cls,text){const e=document.createElement(tag);if(cls)e.className=cls;if(text!==undefined)e.textContent=text;return e;}
function renderReveal(animate){
  if(!evidence)return;
  const runs=evidence.runs,lines=poemLines(runs.visible.mupdf.observation.text,runs.other.mupdf.observation.text);
  pairs.replaceChildren();
  if(engine==='mupdf'){
    lines.got.forEach((got,i)=>{
      const li=el('li');li.append(el('span','seen',lines.seen[i]));
      const g=el('span','got',got);
      if(animate&&!revealed&&!reduce){g.classList.add('flip');g.style.animationDelay=(0.35+i*0.35)+'s';}
      li.append(g);pairs.append(li);
    });
    revealed=revealed||animate;
  }else{
    const li=el('li');li.append(el('span','seen','Raw pdftotext -layout output, first lines:'));
    li.append(el('pre','raw',runs.other.poppler.stdout.split('\n').slice(0,3).join('\n')));
    pairs.append(li);
    const note=el('li');note.append(el('p','note','Same alternate poem — but Poppler joins three lines and puts them before the page header. Line order is not preserved uniformly.'));
    pairs.append(note);
  }
}

// Mechanism: parse the actual bytes, check the hash against the recorded one.
async function live(){
  const status=document.getElementById('live-status'),badge=document.getElementById('live-badge'),map=document.getElementById('map'),hashOut=document.getElementById('live-hash');
  try{
    const res=await fetch(SPECIMEN,{cache:'no-store'});if(!res.ok)throw Error('HTTP '+res.status);
    const buf=await res.arrayBuffer(),text=new TextDecoder('latin1').decode(buf);
    const rows=readPoemMap(text);
    map.replaceChildren(...rows.map(r=>{const li=el('li');li.append(el('span','code','<'+r.code+'>'),el('span','draws',r.draws),el('span'),el('span','means',r.means));return li;}));
    let hashNote='SHA-256 check unavailable on this origin (needs https or localhost).';
    if(window.crypto&&crypto.subtle){
      const hex=[...new Uint8Array(await crypto.subtle.digest('SHA-256',buf))].map(b=>b.toString(16).padStart(2,'0')).join('');
      const recorded=await loaded.catch(()=>null),expected=recorded&&recorded.runs.other.sha256;
      hashNote='SHA-256 '+hex.slice(0,16)+'… '+(expected?(hex===expected?'matches the recorded specimen.':'DOES NOT match the recorded specimen.'):'(recorded hash not loaded).');
    }
    status.textContent='Parsed just now from '+SPECIMEN+' ('+buf.byteLength.toLocaleString('en')+' bytes): font /G, four CharProcs, /ToUnicode.';
    hashOut.textContent=hashNote;
  }catch(err){
    badge.textContent='OFFLINE';badge.className='badge off';
    status.textContent='Could not read the file live ('+err.message+'). Serve this folder over http, e.g. python3 -m http.server 8000.';
  }
}

// Travel: measured rewrite outcome.
function renderTravel(){
  const row=transforms.rows.find(r=>r.reading==='other'&&r.operation==='rewrite');
  const pct=c=>c.changed_pixels.toLocaleString('en')+' of '+c.total_pixels.toLocaleString('en');
  const dds=document.querySelectorAll('#travel-facts dd'),got=row.engines.mupdf.observation.text.split('\n').filter(l=>/^[A-D]$/.test(l));
  dds[0].textContent=pct(row.render_comparison.poppler);
  dds[1].textContent=pct(row.render_comparison.mupdf);
  dds[2].textContent=got.length===4?'“'+got.join(' ')+'” instead of verse':'see notebook';
}

const fail=msg=>()=>{pairs.replaceChildren(el('li','error',msg));};
const loaded=fetch('evidence/poems-results.json').then(r=>{if(!r.ok)throw Error('HTTP '+r.status);return r.json();});
loaded.then(d=>{evidence=d;if(scenes[index].dataset.scene==='3')renderReveal(true);})
  .catch(fail('Recorded evidence could not load. Serve this folder over http (python3 -m http.server 8000).'));
live();
fetch('evidence/poems-transforms.json').then(r=>r.json()).then(d=>{transforms=d;renderTravel();}).catch(()=>{});

const start=Number((location.hash.match(/^#step-(\d+)$/)||[])[1]);
index=-1;go(start?start-1:0,false);
})();
