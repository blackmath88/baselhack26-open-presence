import { chromium } from '@playwright/test'
import AxeBuilder from '@axe-core/playwright'
import { mkdir, writeFile } from 'node:fs/promises'
import { fileURLToPath } from 'node:url'
const out=fileURLToPath(new URL('../../../../docs/reports/commons-aurora/',import.meta.url))
await mkdir(out,{recursive:true})
const browser=await chromium.launch()
const results=[]
for(const [size,width,height] of [['desktop',1440,900],['mobile',390,844]]){
  const context=await browser.newContext({viewport:{width,height},deviceScaleFactor:2})
  const page=await context.newPage()
  for(const [view,path] of [['assistant','/'],['canvas','/canvas/schwamm-zitat'],['actions','/actions/zuschreibung-14'],['app-launcher','/']]){
    if(size==='mobile' && !['assistant','canvas'].includes(view))continue
    await page.goto(`${process.env.AURORA_URL ?? 'http://127.0.0.1:5173'}${path}`)
    await page.locator('main').waitFor()
    await page.evaluate(()=>document.fonts.ready)
    if(view==='app-launcher')await page.getByRole('button',{name:'Alle Werkzeuge',exact:true}).click()
    await page.screenshot({path:`${out}/${size}-${view}.png`})
    const overflow=await page.evaluate(()=>({page:document.documentElement.scrollWidth,viewport:innerWidth}))
    const axe=await new AxeBuilder({page}).withTags(['wcag2a','wcag2aa','wcag21aa']).analyze()
    results.push({size,view,overflow,violations:axe.violations.map(v=>({id:v.id,impact:v.impact,description:v.description,nodes:v.nodes.map(n=>({target:n.target,summary:n.failureSummary}))}))})
  }
  await context.close()
}
await writeFile(`${out}/accessibility.json`,JSON.stringify(results,null,2)+'\n')
console.log(JSON.stringify(results,null,2))
await browser.close()
