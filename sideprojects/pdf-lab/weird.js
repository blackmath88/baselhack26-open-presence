/* A local Boolean toy. No JBIG2 encoder, decoder or exploit machinery. */
(function () {
'use strict';
const MASK=0xffff;
function nand(a,b){return (~(a&b))&MASK;}
function halfAdder(a,b){const n=nand(a,b),l=nand(a,n),r=nand(b,n);return {n,l,r,sum:nand(l,r),carry:nand(n,n)};}
if(typeof module!=='undefined')module.exports={nand,halfAdder};
if(typeof document==='undefined')return;
let a=0x0f0f,b=0x3333;
const $=id=>document.getElementById(id);
function draw(){
 const v={a,b,...halfAdder(a,b)};
 for(const name of Object.keys(v)){
  const grid=$('bits-'+name);grid.replaceChildren();
  for(let i=0;i<16;i++){
   const on=!!(v[name]&(1<<(15-i))),input=name==='a'||name==='b';
   const cell=document.createElement(input?'button':'span');
   cell.className='bit'+(on?' on':'');cell.textContent=on?'1':'0';
   if(input){cell.type='button';cell.setAttribute('aria-label',name.toUpperCase()+' pixel '+(i+1));cell.setAttribute('aria-pressed',String(on));cell.onclick=()=>{if(name==='a')a^=1<<(15-i);else b^=1<<(15-i);draw();$('bits-'+name).children[i].focus();};}
   grid.append(cell);
  }
 }
 $('bitmap-status').textContent='16 independent half-adders. Each position satisfies A + B = SUM + 2 × CARRY. No carry travels between pixels.';
}
$('bitmap-reset').onclick=()=>{a=0x0f0f;b=0x3333;draw();};draw();
let ledger=null;
function updateLock(){
 const state=['switch-a','switch-b','switch-c'].map(id=>$(id).checked?'1':'0').join('');
 const row=ledger&&ledger.rows.find(r=>r.state===state);
 $('lock-file').href='output/pdf/07-layer-lock-'+state+'.pdf';
 $('lock-file').textContent='Open saved state '+state+' ↗';
 for(const engine of ['poppler','mupdf','pdfium']){
  const img=$('lock-'+engine);img.src='evidence/previews/07-'+engine+'-'+state+'.webp';
  img.alt=engine+' actual rendering, saved layer state '+state;
  $('status-'+engine).textContent=row?((row.engines[engine].observed.gate?'Gate visible':'Gate hidden')+' · '+(row.engines[engine].matches_expected?'all eight indicators match':'differs from intended table')):'Measured render · state '+state;
 }
 $('lock-expected').textContent='Intended gate: '+(state==='101'?'visible':'hidden')+'. Displayed images are recorded renderer outputs, not live PDF layer controls.';
}
for(const id of ['switch-a','switch-b','switch-c'])$(id).onchange=updateLock;
updateLock();
fetch('evidence/weird-results.json').then(r=>{if(!r.ok)throw Error(r.status);return r.json();}).then(data=>{ledger=data;updateLock();}).catch(()=>{$('lock-expected').textContent+=' Serve this folder to load the measured JSON ledger.';});
})();
