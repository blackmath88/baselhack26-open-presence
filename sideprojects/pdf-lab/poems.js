/* A selector over actual files and measured extraction, never a PDF emulator. */
(function(root){
'use strict';
// Narrow writer for our uncompressed ASCII fixture, not a general PDF editor.
function bend(source, lines){
  if(lines.length!==4 || lines.some(s=>!s.length || s.length>32 || !/^[ -~]+$/.test(s)))throw Error('Use four printable ASCII lines of 1–32 characters.');
  if(source.length>16384)throw Error('Expected the small authored poem fixture.');
  const original=Array.from(source,b=>String.fromCharCode(b)).join('');
  if(!original.includes('/CMapName /TwoPoems') || !original.startsWith('%PDF-1.4'))throw Error('Not the authored two-poem fixture.');
  const target=Number((original.match(/\/ToUnicode (\d+) 0 R/)||[])[1]);
  const objects=[...original.matchAll(/^(\d+) 0 obj\n([\s\S]*?)\nendobj\n/gm)];
  if(objects.length!==11 || objects.some((o,i)=>Number(o[1])!==i+1) || !target)throw Error('Unexpected fixture structure.');
  const pairs=lines.map((line,i)=>'<'+(65+i).toString(16).toUpperCase()+'> <'+Array.from(line,c=>c.charCodeAt(0).toString(16).padStart(4,'0')).join('').toUpperCase()+'>').join('\n');
  let result=original.slice(0,objects[0].index),offsets=[0];
  for(const obj of objects){
    let body=obj[2];
    if(Number(obj[1])===target){
      const match=body.match(/^<< \/Length \d+  >>\nstream\n([\s\S]*)\nendstream$/);
      if(!match)throw Error('Unexpected mapping stream.');
      const stream=match[1].replace(/4 beginbfchar\n[\s\S]*?\nendbfchar/,'4 beginbfchar\n'+pairs+'\nendbfchar');
      body='<< /Length '+stream.length+'  >>\nstream\n'+stream+'\nendstream';
    }
    offsets.push(result.length);result+=obj[1]+' 0 obj\n'+body+'\nendobj\n';
  }
  const xref=result.length;
  result+='xref\n0 '+offsets.length+'\n0000000000 65535 f \n'+offsets.slice(1).map(o=>String(o).padStart(10,'0')+' 00000 n \n').join('');
  result+='trailer\n<< /Size '+offsets.length+' /Root 1 0 R >>\nstartxref\n'+xref+'\n%%EOF\n';
  return Uint8Array.from(result,c=>c.charCodeAt(0));
}
if(typeof module!=='undefined'&&module.exports)module.exports={bend};
if(typeof document==='undefined')return;
const select=document.getElementById('poem-reading');
if(!select)return;
const file=document.getElementById('poem-file'),image=document.getElementById('poem-render'),status=document.getElementById('poem-status'),output=document.getElementById('poem-extraction');
let evidence=null;
function update(){
  const name=select.value;
  if(!['visible','other','direct','raster'].includes(name))return;
  file.href='output/pdf/01-poem-'+name+'.pdf';
  file.textContent='Open '+select.selectedOptions[0].textContent+' PDF ↗';
  image.src='evidence/previews/01-poem-'+(name==='raster'?'visible':name)+'.webp';
  image.alt='Actual MuPDF rendering of the '+name+' poem specimen';
  if(!evidence){output.textContent='Measured output is loading.';return;}
  const row=evidence.runs[name];
  const mupdf=row.mupdf.observation?row.mupdf.observation.text:JSON.parse(row.mupdf.stdout).text;
  output.textContent='MuPDF '+evidence.versions.mupdf+'\n'+(mupdf.trim()||'[no text extracted]')+'\n\n'+evidence.versions.poppler+'\n'+(row.poppler.stdout.trim()||'[no text extracted]');
  status.textContent=name+' · SHA-256 '+row.sha256;
  document.getElementById('poem-caption').textContent='Actual MuPDF rendering · '+(name==='raster'?'source of raster control':name+' specimen')+' · 72 dpi';
}
select.addEventListener('change',update);
fetch('evidence/poems-results.json').then(r=>{if(!r.ok)throw Error('HTTP '+r.status);return r.json();}).then(data=>{evidence=data;update();}).catch(err=>{output.textContent='Recorded extraction could not load. Serve locally, or open evidence/poems-results.json. '+err.message;});
let download=null;
document.getElementById('poem-bend').addEventListener('submit',async event=>{
  event.preventDefault();
  const message=document.getElementById('poem-bend-status'),link=document.getElementById('poem-custom');
  link.hidden=true;
  try{
    const lines=[...document.querySelectorAll('[data-poem-line]')].map(input=>input.value);
    const response=await fetch('output/pdf/01-poem-other.pdf');
    if(!response.ok)throw Error('HTTP '+response.status);
    const data=bend(new Uint8Array(await response.arrayBuffer()),lines);
    if(download)URL.revokeObjectURL(download);
    download=URL.createObjectURL(new Blob([data],{type:'application/pdf'}));
    link.href=download;link.hidden=false;
    message.textContent='PDF built locally. Shapes unchanged; authored mapping: '+lines.join(' / ')+'. Open it to test extraction in your reader. This custom file has no recorded consumer run.';
  }catch(err){message.textContent=err.message;}
});
update();
})(typeof globalThis!=='undefined'?globalThis:this);
