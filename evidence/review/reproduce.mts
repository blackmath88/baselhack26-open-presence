import {createServer} from 'node:http';
import {writeFile} from 'node:fs/promises';
import {buildServices} from '/home/nuc/orca/workspaces/blackmath88__baselhack26-open-presence/commons-packet-d/apps/commons/server/container.ts';
import {createJsonRepository} from '/home/nuc/orca/workspaces/blackmath88__baselhack26-open-presence/commons-packet-d/apps/commons/server/persistence/json-repository.ts';
import {createApi} from '/home/nuc/orca/workspaces/blackmath88__baselhack26-open-presence/commons-packet-d/apps/commons/server/http/api.ts';
import {importedProblems} from '/home/nuc/orca/workspaces/blackmath88__baselhack26-open-presence/commons-packet-d/apps/commons/src/commons/source/index.ts';
import {nullCurator} from '/home/nuc/orca/workspaces/blackmath88__baselhack26-open-presence/commons-packet-d/apps/commons/server/curation/ai-curator.ts';
const repository=createJsonRepository({file:'/home/nuc/projects/op-commons-review/repro-events.json'});
const services=await buildServices({repository,seed:false,curator:nullCurator,defaultOrchestration:null});
const session=services.auth.issue('person:kai');const actor=session.actor;
const records=importedProblems(); await services.commons!.importProblems(actor,records);
const handler=createApi(services,{enablePrototypeAuth:true});
const server=createServer((q,s)=>void handler(q,s));await new Promise<void>(r=>server.listen(8799,'127.0.0.1',r));
const post=async(path:string,body:unknown)=>{const res=await fetch('http://127.0.0.1:8799'+path,{method:'POST',headers:{authorization:'Bearer '+session.token,'content-type':'application/json'},body:JSON.stringify(body)});return {status:res.status,body:await res.json()};};
try {
const outputs=[];
for(const p of records){
 const room=await services.commons!.getRoom(actor,p.postackId); const proposal=room.proposals.find(p=>p.status==='pending');if(!proposal)continue;
 const result=await Promise.all([post('/api/curation/'+encodeURIComponent(proposal.id)+'/accept',{problemId:room.problem.id}),post('/api/commons/reviews',{commandId:'mixed-'+proposal.id,proposalId:proposal.id,decision:'reject'})]);
 const after=await services.commons!.getRoom(actor,p.postackId);
 outputs.push({proposal:proposal.id,statuses:result.map(r=>r.status),finalStatus:after.proposals.find(p=>p.id===proposal.id)?.status,relations:after.relations.length,events:after.history.slice(-2).map(e=>e.eventType)});
 if(result.every(r=>r.status===200))break;
}
console.log(JSON.stringify(outputs,null,2));
const room=await services.commons!.getRoom(actor,records[0].postackId);
console.log('Imported contribution kinds:',[...new Set(room.contributions.map(c=>c.kind))]);
console.log('First imported contribution:',JSON.stringify(room.contributions[0]));
await writeFile('/home/nuc/projects/op-commons-review/reproduction-results.json',JSON.stringify(outputs,null,2));
}finally{await new Promise<void>(r=>server.close(()=>r()));}
