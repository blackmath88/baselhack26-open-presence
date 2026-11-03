import { readFile, writeFile } from 'node:fs/promises'
import { fileURLToPath } from 'node:url'
import { PNG } from 'pngjs'
import pixelmatch from 'pixelmatch'
const root=fileURLToPath(new URL('../../../../',import.meta.url))
const names=['desktop-assistant','desktop-canvas','desktop-actions','desktop-app-launcher','mobile-assistant','mobile-canvas']
const results=[]
for(const name of names){
  const reference=PNG.sync.read(await readFile(`${root}/commons-aurora-port/reference/screens/${name}.png`))
  const actual=PNG.sync.read(await readFile(`${root}/docs/reports/commons-aurora/${name}.png`))
  if(reference.width!==actual.width||reference.height!==actual.height)throw new Error(`Size mismatch: ${name}`)
  const changed=pixelmatch(reference.data,actual.data,null,actual.width,actual.height,{threshold:0.15,includeAA:false})
  results.push({view:name,width:actual.width,height:actual.height,changedPercent:Number((100*changed/(actual.width*actual.height)).toFixed(2)),threshold:0.15,includeAntialiasing:false})
}
await writeFile(`${root}/docs/reports/commons-aurora/visual-comparison.json`,JSON.stringify(results,null,2)+'\n')
console.log(results)
