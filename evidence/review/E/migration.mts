
import {createCommonsImporter as oldImporter} from './old-import.ts';
import {createCommonsImporter} from '/home/nuc/orca/workspaces/blackmath88__baselhack26-open-presence/commons-packet-e/apps/commons/server/commons/import.ts';
import {createJsonRepository} from '/home/nuc/orca/workspaces/blackmath88__baselhack26-open-presence/commons-packet-e/apps/commons/server/persistence/json-repository.ts';
import {importedProblems} from '/home/nuc/orca/workspaces/blackmath88__baselhack26-open-presence/commons-packet-e/apps/commons/src/commons/source/index.ts';
import {project} from '/home/nuc/orca/workspaces/blackmath88__baselhack26-open-presence/commons-packet-e/apps/commons/server/domain/projections.ts';
import {createElement} from '/home/nuc/orca/workspaces/blackmath88__baselhack26-open-presence/commons-packet-e/apps/commons/node_modules/react/index.js';
import {renderToStaticMarkup} from '/home/nuc/orca/workspaces/blackmath88__baselhack26-open-presence/commons-packet-e/apps/commons/node_modules/react-dom/server.node.js';
import {StateView} from '/home/nuc/orca/workspaces/blackmath88__baselhack26-open-presence/commons-packet-e/apps/commons/src/components/StateView.tsx';
import {writeFile} from 'node:fs/promises';
const repo=createJsonRepository({file:'/home/nuc/projects/op-commons-review-3/upgrade-events.json'});
const records=importedProblems();
const before=await oldImporter(repo)(records);
const after=await createCommonsImporter(repo)(records);
const state=project(await repo.read('commons:emmc-not-exposed'))!;
const markup=renderToStaticMarkup(createElement(StateView,{contributions:state.contributions,conflicts:[],onSelect:()=>{}}));
const result={before,after,kinds:[...new Set(state.contributions.map(c=>c.kind))],contributions:state.contributions.length,cards:(markup.match(/state-card /g)||[]).length,markup};
console.log(JSON.stringify(result,null,2));await writeFile('/home/nuc/projects/op-commons-review-3/upgrade-results.json',JSON.stringify(result,null,2));
