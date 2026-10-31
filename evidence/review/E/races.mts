
import {Client,StreamableHTTPClientTransport} from '/home/nuc/orca/workspaces/blackmath88__baselhack26-open-presence/commons-packet-e/apps/commons/node_modules/@modelcontextprotocol/client/dist/index.mjs';
import {createServer} from 'node:http';
import {writeFile} from 'node:fs/promises';
import {buildServices} from '/home/nuc/orca/workspaces/blackmath88__baselhack26-open-presence/commons-packet-e/apps/commons/server/container.ts';
import {createJsonRepository} from '/home/nuc/orca/workspaces/blackmath88__baselhack26-open-presence/commons-packet-e/apps/commons/server/persistence/json-repository.ts';
import {createApi} from '/home/nuc/orca/workspaces/blackmath88__baselhack26-open-presence/commons-packet-e/apps/commons/server/http/api.ts';
import {createMcpNodeHandler} from '/home/nuc/orca/workspaces/blackmath88__baselhack26-open-presence/commons-packet-e/apps/commons/server/mcp/http.ts';
import {importedProblems} from '/home/nuc/orca/workspaces/blackmath88__baselhack26-open-presence/commons-packet-e/apps/commons/src/commons/source/index.ts';
import {nullCurator} from '/home/nuc/orca/workspaces/blackmath88__baselhack26-open-presence/commons-packet-e/apps/commons/server/curation/ai-curator.ts';
import {createCommonsImporter} from '/home/nuc/orca/workspaces/blackmath88__baselhack26-open-presence/commons-packet-e/apps/commons/server/commons/import.ts';
const out:any[]=[];
for (const mode of ['mixed-http','mixed-mcp-http','same-mcp']) for(let i=0;i<12;i++) {
 const file=`/home/nuc/projects/op-commons-review-3/v2-${mode}-${i}.json`;
 const repository=createJsonRepository({file});
 const services=await buildServices({repository,seed:false,curator:nullCurator,defaultOrchestration:null});
 await createCommonsImporter(repository)(importedProblems());
 const kai=services.auth.issue('person:kai'),lea=services.auth.issue('person:lea');
 const api=createApi(services,{enablePrototypeAuth:true}),mcp=createMcpNodeHandler(services);
 const server=createServer((q,s)=>void (q.url==='/mcp'?mcp(q,s):api(q,s)));
 await new Promise<void>(r=>server.listen(8798,'127.0.0.1',r));
 const post=async(path:string,body:unknown,token=kai.token)=>{
  const res=await fetch('http://127.0.0.1:8798'+path,{method:'POST',headers:{authorization:'Bearer '+token,'content-type':'application/json',accept:'application/json, text/event-stream','mcp-protocol-version':'2026-07-28'},body:JSON.stringify(body)});
  const raw=await res.text();let value:any;try{value=JSON.parse(raw)}catch{value=raw}
  return {status:res.status,body:value};
 };
 const proposalId='commons:emmc-not-exposed:relation:0';
 const legacy=()=>post('/api/curation/'+encodeURIComponent(proposalId)+'/accept',{problemId:'commons:emmc-not-exposed'});
 const commons=()=>post('/api/commons/reviews',{commandId:'reject-'+i,proposalId,decision:'reject'},lea.token);
 const clients:any[]=[];
 const connect=async(token:string)=>{const c=new Client({name:'packet-e',version:'1'});await c.connect(new StreamableHTTPClientTransport(new URL('http://127.0.0.1:8798/mcp'),{requestInit:{headers:{authorization:'Bearer '+token}}}));clients.push(c);return c};
 const clientKai=mode==='mixed-http'?null:await connect(kai.token);
 const clientLea=mode==='same-mcp'?await connect(lea.token):null;
 const tool=async(accept:boolean,_token:string)=>{const body=await (accept?clientKai:clientLea).callTool({name:'review_curation_proposal',arguments:{problemId:'commons:emmc-not-exposed',proposalId,accept}});return {status:body.isError?'tool-error':'tool-success',body}};
 try {
  const results=await Promise.all(mode==='mixed-http'?[legacy(),commons()]:mode==='mixed-mcp-http'?[tool(true,kai.token),commons()]:[tool(true,kai.token),tool(false,lea.token)]);
  const room=await services.commons!.getRoom(kai.actor,'emmc-not-exposed');
  const decisions=room.history.filter(e=>e.eventType==='RelationAccepted'||e.eventType==='RelationRejected');
  out.push({mode,i,results,decisions:decisions.map(e=>({type:e.eventType,actor:e.actorId})),final:room.proposals.find(p=>p.id===proposalId)?.status,relations:room.relations.length});
  console.log(mode,i,JSON.stringify(out.at(-1)));
  if(mode==='mixed-http'&&i===0){
   const id2='commons:emmc-not-exposed:relation:1';
   const first=await post('/api/curation/'+encodeURIComponent(id2)+'/reject',{problemId:'commons:emmc-not-exposed',reason:'My explicit rejection rationale'});
   const retry=await post('/api/curation/'+encodeURIComponent(id2)+'/reject',{problemId:'commons:emmc-not-exposed',reason:'Changed rationale'});
   const events=await repository.read('commons:emmc-not-exposed');
   await writeFile('/home/nuc/projects/op-commons-review-3/reason-results.json',JSON.stringify({first,retry,rejections:events.filter(e=>e.eventType==='RelationRejected')},null,2));
   const imp=await post('/api/commons/import',{problems:importedProblems()});
   console.log('removed import endpoint',imp.status);
   const add=await post('/api/problems/commons%3Aemmc-not-exposed/contributions',{content:'An ordinary room thought'});
   console.log('add shape',add.status,Object.keys(add.body));
  }
 } finally {for(const c of clients)await c.close();await new Promise<void>(r=>server.close(()=>r()));}
}
await writeFile('/home/nuc/projects/op-commons-review-3/races-v2.json',JSON.stringify(out,null,2));
