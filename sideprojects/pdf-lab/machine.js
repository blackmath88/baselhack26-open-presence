/* PDF LAB toy machine. The secret is authored, not a security boundary. */
var lab = {open:false, pc:0, a:0, cells:[], halted:false};
function labPaint(doc) {
  doc.getField('state').value = 'PC '+lab.pc+' | A '+lab.a+' | '+(lab.halted?'HALT':'READY');
  doc.getField('memory').value = lab.cells.join('  ');
}
function labReset(doc) {
  if(!lab.open) return;
  lab.pc=0; lab.a=0; lab.cells=[]; lab.halted=false; labPaint(doc);
}
function labUnlock(doc) {
  if(String(doc.getField('key').value).toLowerCase().replace(/^\s+|\s+$/g,'')!=='backstage') {
    doc.getField('state').value='Still locked. What is behind a stage?'; return;
  }
  lab.open=true;
  ['memory','step','run','reset'].forEach(function(n){doc.getField(n).display=0;});
  labReset(doc);
}
function labStep(doc) {
  if(!lab.open || lab.halted) return;
  if(lab.pc===0) lab.a=1;
  else if(lab.pc%2===1) lab.cells.push(lab.a);
  else lab.a+=1;
  lab.pc+=1;
  if(lab.cells.length===8) lab.halted=true;
  labPaint(doc);
}
function labRun(doc) { for(var i=0;i<32 && !lab.halted;i++) labStep(doc); }
