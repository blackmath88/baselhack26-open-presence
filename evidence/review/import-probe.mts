import {buildTestServices} from '/home/nuc/orca/workspaces/blackmath88__baselhack26-open-presence/commons-packet-d/apps/commons/server/container.ts';
import {importedProblems} from '/home/nuc/orca/workspaces/blackmath88__baselhack26-open-presence/commons-packet-d/apps/commons/src/commons/source/index.ts';
const s=await buildTestServices({seed:false}); const a=s.auth.issue('person:kai').actor;
const forged=structuredClone(importedProblems()[0]);forged.postackId='review-forged-record';forged.title='Forged source report';forged.related=[];
forged.provenance.review='reviewed';forged.provenance.authoredBy='person:original-source-author';forged.evidence[0].quote='This fabricated quote did not come from the source';forged.evidence[0].source.author='wesbos';forged.evidence[0].source.permalink='javascript:alert(1)';
const result=await s.commons!.importProblems(a,[forged]);const room=await s.commons!.getRoom(a,forged.postackId);
console.log(JSON.stringify({result,acceptedProvenance:room.source?.provenance,acceptedQuote:room.source?.evidence[0].quote,acceptedAuthor:room.source?.evidence[0].source.author,acceptedPermalink:room.source?.evidence[0].source.permalink},null,2));
