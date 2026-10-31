/* A measured transformation notebook. Select committed files, never emulate a reader. */
(function(){
'use strict';
const labels={source:'Original PDF',clone:'pypdf object clone',rewrite:'Ghostscript pdfwrite',raster:'MuPDF raster control'};
function readingLabel(reading){
  if(reading.empty)return 'No extracted text';
  if(reading.visible_lines===4&&reading.other_lines===0)return 'All four visible-poem lines';
  if(reading.other_lines===4&&reading.visible_lines===0)return 'All four alternate-poem lines';
  return reading.visible_lines+' visible lines / '+reading.other_lines+' alternate lines';
}
if(typeof module!=='undefined'&&module.exports)module.exports={readingLabel};
if(typeof document==='undefined')return;
const panel=document.getElementById('poem-journey');if(!panel)return;
const operation=document.getElementById('journey-operation'),reading=document.getElementById('journey-reading'),engine=document.getElementById('journey-engine'),difference=document.getElementById('journey-difference');
const reveal=document.getElementById('journey-reveal'),results=document.getElementById('journey-result');
let evidence=null;
function selected(){return evidence.rows.find(row=>row.reading===reading.value&&row.operation===operation.value);}
function update(){
  if(!evidence)return;
  const row=selected(),instrument=engine.value,comparison=row.render_comparison[instrument];
  results.hidden=true;reveal.setAttribute('aria-expanded','false');
  const original=evidence.rows.find(r=>r.reading===reading.value&&r.operation==='source');
  document.getElementById('journey-source-image').src=original.preview_prefix+'-'+instrument+'.webp';
  document.getElementById('journey-source-image').alt='Actual '+instrument+' render of the original '+reading.value+' mapping';
  document.getElementById('journey-image').src=row.preview_prefix+'-'+instrument+(difference.checked?'-difference':'')+'.webp';
  document.getElementById('journey-image').alt=difference.checked?'Measured RGB difference mask: pink is changed, white is unchanged':'Actual '+instrument+' render after '+labels[operation.value];
  document.getElementById('journey-source-caption').textContent='Actual '+instrument+' source rendering · 72 dpi';
  document.getElementById('journey-caption').textContent=difference.checked?'Measured difference mask · pink = any changed RGB channel':'Actual '+instrument+' rendering · '+labels[operation.value]+' · 72 dpi';
  const link=document.getElementById('journey-file');link.href=row.file;link.textContent='Open '+labels[operation.value]+' PDF ↗';
  document.getElementById('journey-source').href=row.parent_file;
  document.getElementById('journey-hashes').textContent='Source SHA-256 '+row.parent_sha256+' → Output SHA-256 '+row.sha256;
  document.getElementById('journey-pixels').textContent=comparison.same_dimensions?comparison.changed_pixels.toLocaleString()+' / '+comparison.total_pixels.toLocaleString()+' pixels differ from this source in '+instrument+'. Mean absolute RGB channel error: '+comparison.mean_absolute_channel_error.toFixed(4)+' / 255.':'Page dimensions differ; pixel comparison not performed.';
  document.getElementById('journey-method').textContent=row.recipe_runs.length?row.recipe_runs[0].command.join(' '):row.recipe_note||'Identity control: use the original file without changing bytes.';
}
for(const control of [operation,reading,engine,difference])control.addEventListener('change',update);
reveal.addEventListener('click',()=>{
  if(!evidence)return;
  const row=selected(),observation=row.engines[engine.value];
  document.getElementById('journey-verdict').textContent=readingLabel(observation.reading)+'. Matching words does not establish their line order.';
  document.getElementById('journey-extraction').textContent=(engine.value==='mupdf'?observation.observation.text:observation.stdout).trim()||'[no text extracted]';
  document.getElementById('journey-pair').textContent=operation.value==='raster'?'Both paths reuse the same raster control; these are not two independent rasterizations.':evidence.pair_output_byte_identity[operation.value]?'The two different source mappings produced byte-identical output files for this operation.':'The two source mappings still have different output bytes for this operation.';
  document.getElementById('journey-mapping').textContent=row.structure.fonts.filter(font=>font.has_tounicode).map(font=>font.key+' / '+font.subtype+'\n'+font.tounicode_stream).join('\n\n')||'[no ToUnicode stream]';
  results.hidden=false;reveal.setAttribute('aria-expanded','true');
});
fetch('evidence/poems-transforms.json').then(r=>{if(!r.ok)throw Error('HTTP '+r.status);return r.json();}).then(data=>{
  evidence=data;document.getElementById('journey-version').textContent='Recorded: MuPDF '+data.versions.mupdf+' · '+data.versions.poppler+' · pypdf '+data.versions.pypdf+' · Ghostscript '+data.versions.ghostscript;
  reveal.disabled=false;update();
}).catch(err=>{document.getElementById('journey-version').textContent='Could not load measurements. Serve this folder locally, or open evidence/poems-transforms.json. '+err.message;});
// The minimized fixture stays a small drawer in the existing notebook.
const minimalCase=document.getElementById('minimal-case'),minimalEngine=document.getElementById('minimal-engine');
let minimal=null;
function updateMinimal(){
  if(!minimal)return;
  const row=minimal.rows.find(r=>r.case===minimalCase.value),engine=minimalEngine.value;
  const text=state=>engine==='mupdf'?row.states[state].mupdf.observation.text:row.states[state].poppler.stdout;
  document.getElementById('minimal-text').textContent='Source extraction:\n'+text('source')+'\nRewrite extraction:\n'+text('rewrite');
  const changes=row.states.rewrite.render_observations[engine];
  document.getElementById('minimal-status').textContent='Recorded '+engine+' · map '+row.mapping+' · '+changes.changed_pixels.toLocaleString()+' / '+changes.total_pixels.toLocaleString()+' pixels changed after Ghostscript '+minimal.versions.ghostscript+' pdfwrite.';
  for(const state of ['source','rewrite']){
    const img=document.getElementById('minimal-'+state+'-image');
    img.src='evidence/previews/minimal-'+row.case+'-'+state+'-'+engine+'.webp';
    img.alt='Actual '+engine+' '+state+' rendering, map '+row.mapping;
    document.getElementById('minimal-'+state+'-file').href=row.states[state].file;
  }
  document.getElementById('minimal-cmaps').textContent=['source','rewrite'].map(state=>state.toUpperCase()+' / '+row.states[state].sha256+'\n'+row.states[state].structure.fonts[0].tounicode_stream).join('\n\n');
}
minimalCase.addEventListener('change',updateMinimal);minimalEngine.addEventListener('change',updateMinimal);
fetch('evidence/mapping-minimal.json').then(r=>{if(!r.ok)throw Error('HTTP '+r.status);return r.json();}).then(data=>{minimal=data;updateMinimal();}).catch(err=>{document.getElementById('minimal-status').textContent='Minimized evidence unavailable: '+err.message;});
})();
