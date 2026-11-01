const fs=require('fs'),vm=require('vm'),assert=require('assert');
const ctx={};vm.createContext(ctx);vm.runInContext(fs.readFileSync(__dirname+'/machine.js','utf8'),ctx);
const fields={};['key','state','memory','step','run','reset'].forEach(n=>fields[n]={value:'',display:2});
const doc={getField:n=>fields[n]};ctx.labStep(doc);assert.equal(ctx.lab.pc,0);
fields.key.value='wrong';ctx.labUnlock(doc);assert.equal(ctx.lab.open,false);
fields.key.value='backstage';ctx.labUnlock(doc);assert.equal(fields.step.display,0);
ctx.labRun(doc);assert.equal(ctx.lab.halted,true);assert.equal(ctx.lab.cells.join(','),'1,2,3,4,5,6,7,8');
ctx.labReset(doc);assert.equal(ctx.lab.pc,0);assert.equal(ctx.lab.cells.length,0);
console.log('Toy-machine unlock, step, run/halt and reset logic passed; PDF viewer integration not tested.');
