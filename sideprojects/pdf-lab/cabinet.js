/* The pure byte helpers are also exercised under Node. No PDF code is executed. */
(function(root){
'use strict';
function ascii(bytes){return Array.from(bytes,b=>String.fromCharCode(b)).join('');}
function locations(bytes){
  const s=ascii(bytes),m=[...s.matchAll(/startxref\s+(\d+)\s+%%EOF/g)];
  const final=m.length?Number(m[m.length-1][1]):null;
  const objects=[...s.matchAll(/(?:^|\n)(17 0 obj)\b/g)].map(x=>x.index+(x[0].startsWith('\n')?1:0));
  return {xref:final,first:objects.length?objects[0]:null,last:objects.length?objects[objects.length-1]:null,zip:s.indexOf('PK\x03\x04')<0?null:s.indexOf('PK\x03\x04')};
}
function hexWindow(bytes,offset=0,count=256){
  offset=Math.max(0,Math.min(Math.trunc(Number(offset)||0),Math.max(0,bytes.length-1)));
  let rows=[];
  for(let i=offset;i<Math.min(bytes.length,offset+count);i+=16){
    const part=bytes.slice(i,i+16),hex=Array.from(part,b=>b.toString(16).padStart(2,'0')).join(' ').padEnd(47,' ');
    const letters=Array.from(part,b=>b>=32&&b<=126?String.fromCharCode(b):'.').join('');
    rows.push(i.toString(16).padStart(8,'0')+'  '+hex+'  '+letters);
  }
  return rows.join('\n');
}
const api={locations,hexWindow};
if(typeof module!=='undefined'&&module.exports)module.exports=api;
if(typeof document==='undefined')return;
const views={witness:{current:['05-object-17','Actual current revision: the witness statement has been replaced','Actual PDF rendering · current revision · object 17 replaced'],original:['05-original-witness','Actual recovered original: the witness statement is visible','Actual PDF rendering · recovered original revision']},'print-view':{screen:['06-screen','Actual Ghostscript screen rendering: an unsolved maze','Actual Ghostscript screen-mode rendering · solution hidden'],print:['06-print','Actual Ghostscript print rendering: the red solution route is visible','Actual Ghostscript print-mode rendering · solution revealed']}};
document.querySelectorAll('[data-view]').forEach(button=>button.addEventListener('click',()=>{
  const target=button.dataset.target,v=views[target][button.dataset.view],img=document.getElementById(target);
  img.src='evidence/previews/'+v[0]+'.webp';img.alt=v[1];document.getElementById(target+'-caption').textContent=v[2];
  document.querySelectorAll('[data-target="'+target+'"]').forEach(b=>b.setAttribute('aria-pressed',String(b===button)));
}));
let bytes=null,request=0;const status=document.getElementById('byte-status'),output=document.getElementById('byte-output'),offset=document.getElementById('offset');
const allowed=new Set(['05-object-17.pdf','04-two-identities.pdf','01-one-letter.pdf','06-print-to-reveal.pdf']);
document.getElementById('load-bytes').addEventListener('click',async()=>{
  const ticket=++request,name=document.getElementById('specimen').value;if(!allowed.has(name))return;
  bytes=null;output.textContent='Loading…';status.textContent='Reading '+name;
  try{
    const response=await fetch('output/pdf/'+name);if(!response.ok)throw new Error('HTTP '+response.status);
    const data=new Uint8Array(await response.arrayBuffer());if(data.length>2*1024*1024)throw new Error('Fixture exceeds 2 MiB limit');
    if(ticket!==request)return;
    bytes=data;offset.value='0';output.textContent=hexWindow(bytes);
    let hash='hash unavailable in this browser context';
    if(root.crypto&&root.crypto.subtle){const digest=new Uint8Array(await root.crypto.subtle.digest('SHA-256',data));hash=Array.from(digest,b=>b.toString(16).padStart(2,'0')).join('');}
    if(ticket===request)status.textContent=name+' · '+data.length+' bytes · SHA-256 '+hash;
  }catch(err){if(ticket===request){status.textContent='Could not read the file. Serve this folder with python3 -m http.server. '+err.message;output.textContent='No file loaded.';}}
});
function jump(to){if(!bytes){status.textContent='Read a specimen first.';return;}if(to===null){status.textContent='That structure is not present in this specimen.';return;}offset.value=String(Math.max(0,Math.min(to,bytes.length-1)));output.textContent=hexWindow(bytes,offset.value);}
document.getElementById('jump').addEventListener('click',()=>jump(Number(offset.value)));
[['find-xref','xref'],['find-old','first'],['find-new','last'],['find-zip','zip']].forEach(([id,key])=>document.getElementById(id).addEventListener('click',()=>{if(!bytes){jump(0);return;}jump(locations(bytes)[key]);}));
})(typeof globalThis!=='undefined'?globalThis:this);
