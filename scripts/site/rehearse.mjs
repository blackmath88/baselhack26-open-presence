// Isolated loopback demo. No deployment, no external publication, no deletion of existing data.
import { spawn, spawnSync } from 'node:child_process';
import { existsSync, mkdirSync, writeFileSync, rmSync } from 'node:fs';
import { resolve, dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { createServer } from 'node:net';
import { destinations } from '../../site/destinations.mjs';
const root=resolve(dirname(fileURLToPath(import.meta.url)),'../..');
const d=destinations('local'), npm=process.platform==='win32'?'npm.cmd':'npm';
const data=join(root,'.phf-demo');mkdirSync(data,{recursive:true});
const lock=join(data,'launcher.lock');
const env={...process.env,VITE_PHF_PRESENTATION_URL:d.storyFuture,VITE_PHF_STORY_URL:d.storyPast,VITE_LEGACY_CABINET_URL:d.pdfCabinet,
  VITE_PHF_PDF_URL:d.pdfCabinet,VITE_PHF_HISTORY_URL:d.pdfHistory,
  BRAINSTORM_DATA_FILE:join(data,'commons.json'),HOST:'127.0.0.1',PORT:'8787',
  COMMONS_ATPROTO_ALLOWED_PDS:'',COMMONS_ATPROTO_ACCOUNTS:'',COMMONS_ATPROTO_FOLLOW:'',OPENAI_API_KEY:''};
// Check ports before starting, then hold a lock to prevent competing launchers.
for(const port of [8001,8000,5173,8787,3100]){
  await new Promise((ok,no)=>{const s=createServer();s.once('error',()=>no(Error('Port '+port+' is occupied; no existing process was stopped.')));s.listen(port,'127.0.0.1',()=>s.close(ok));});
}
try{writeFileSync(lock,String(process.pid),{flag:'wx'})}catch{throw Error('A rehearsal lock exists at '+lock+'. Check whether that launcher is running before removing the lock.')}
const children=[];
let stopping=false;
function stop(code=0){if(stopping)return;stopping=true;for(const c of children)c.kill('SIGTERM');rmSync(lock,{force:true});process.exitCode=code;}
process.on('SIGINT',()=>stop());process.on('SIGTERM',()=>stop());
process.on('exit',()=>{for(const c of children)c.kill();rmSync(lock,{force:true})});
function run(command,args,cwd=root){const r=spawnSync(command,args,{cwd,env,stdio:'inherit',shell:process.platform==='win32'&&command===npm});if(r.status!==0)throw Error(command+' failed');}
function start(command,args,cwd=root){const c=spawn(command,args,{cwd,env,stdio:'inherit'});children.push(c);c.on('error',e=>{console.error(e);stop(1)});c.on('exit',code=>{if(!stopping){console.error('Demo service exited:',code);stop(1)}});}
try{
  for(const folder of ['apps/commons','sideprojects/pdf-lab/workbench']){
    const cwd=join(root,folder);if(!existsSync(join(cwd,'node_modules')))run(npm,['ci'],cwd);
    run(npm,['run','build'],cwd);
  }
  run(process.execPath,['scripts/site/package-public.mjs','.phf-demo/public','local']);
  // Local story also serves the history; the cabinet has its own configured origin.
  run(process.execPath,['scripts/site/build.mjs','local','.phf-demo/public/story']);
  start(process.execPath,['--import','tsx','server/http/server.ts'],join(root,'apps/commons'));
  start(process.execPath,['scripts/site/server.mjs','.phf-demo/public/story','8001']);
  start(process.execPath,['scripts/site/server.mjs','.phf-demo/public/pdf-lab','8000']);
  start(process.execPath,['scripts/site/server.mjs','apps/commons/dist','5173','--commons']);
  // Workbench reads PORT; it has its own production port.
  const c=spawn(process.execPath,['scripts/serve.mjs'],{cwd:join(root,'sideprojects/pdf-lab/workbench'),env:{...env,PORT:'3100'},stdio:'inherit'});
  children.push(c);c.on('error',e=>{console.error(e);stop(1)});c.on('exit',()=>{if(!stopping)stop(1)});
  for(const url of [d.storyHome,d.pdfCabinet,d.commonsHome,'http://127.0.0.1:8787/api/participants',d.pdfWorkbench]){
    let ready=false;for(let i=0;i<60&&!stopping;i++){try{ready=(await fetch(url)).ok}catch{}if(ready)break;await new Promise(r=>setTimeout(r,300));}
    if(!ready)throw Error('Not ready: '+url);
  }
  if(process.argv.includes('--smoke')){
    const check=async(url,needle)=>{const r=await fetch(url);const body=await r.text();if(!r.ok||!body.includes(needle))throw Error('Smoke failed: '+url);console.log('PASS',url);};
    await check(d.storyHome,'Human context.');
    await check(d.storyHome+'destinations.json','127.0.0.1:5173');
    await check(d.pdfOpening,'return-link');
    await check(d.commonsHome+'api/participants','participants');
    await check(d.pdfWorkbench+'specimens/a01-two-poems?reading=other&line=2&reveal=true','Two poems');
    await check(d.pdfHistory,'.phf story');
    stop();
  }
  console.log('\nConnected .phf experience: '+d.storyHome+'\nDemo data: '+data+'\nCtrl+C stops this launcher’s services. Observatory is the published snapshot.');
}catch(e){console.error(e);stop(1)}
