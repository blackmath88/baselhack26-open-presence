/* Browser walkthrough of the guided opening. Supply Playwright via NODE_PATH; no package changes.
   Pass --shots to write screenshots to evidence/phf-sprint/. */
const {chromium}=require('playwright');
const http=require('node:http'),fs=require('node:fs/promises'),path=require('node:path'),assert=require('node:assert/strict');
(async()=>{
  const root=__dirname,shots=process.argv.includes('--shots'),out=path.join(root,'evidence','phf-sprint');
  const server=http.createServer(async(req,res)=>{
    try{
      const target=path.resolve(root,'.'+decodeURIComponent(new URL(req.url,'http://localhost').pathname));
      if(!target.startsWith(root+path.sep))throw Error('outside root');
      const data=await fs.readFile(target);if(data.length>2*1024**2)throw Error('oversize');
      res.setHeader('Content-Type',({'.html':'text/html','.js':'text/javascript','.css':'text/css','.json':'application/json','.webp':'image/webp','.pdf':'application/pdf','.md':'text/plain'})[path.extname(target)]||'text/plain');res.end(data);
    }catch(e){res.statusCode=404;res.end('not found');}
  });
  let browser;
  try{
    await new Promise(resolve=>server.listen(0,'127.0.0.1',resolve));
    const base=`http://127.0.0.1:${server.address().port}`;
    if(shots)await fs.mkdir(out,{recursive:true});
    browser=await chromium.launch({headless:true,executablePath:process.env.CHROMIUM_PATH||'/usr/bin/chromium'});
    for(const [name,viewport] of [['desktop',{width:1440,height:900}],['phone',{width:390,height:844}]]){
      const page=await browser.newPage({viewport}),errors=[],failed=[];
      page.on('pageerror',e=>errors.push(e.message));
      page.on('console',m=>{if(m.type()==='error')errors.push(m.text());});
      page.on('requestfailed',r=>failed.push(r.url()));
      page.on('response',r=>{if(r.status()>=400)failed.push(r.status()+' '+r.url());});
      await page.goto(base+'/opening.html');
      const visible=async()=>page.locator('.scene:not([hidden])').getAttribute('data-scene');
      assert.equal(await visible(),'1');
      if(shots)await page.waitForTimeout(600),await page.screenshot({path:path.join(out,`opening-1-title-${name}.png`)});
      // Keyboard path: → through every scene.
      await page.keyboard.press('ArrowRight');assert.equal(await visible(),'2');
      if(shots)await page.waitForTimeout(600),await page.screenshot({path:path.join(out,`opening-2-read-${name}.png`)});
      await page.keyboard.press('ArrowRight');assert.equal(await visible(),'3');
      await page.waitForFunction(()=>document.querySelectorAll('#pairs .got').length===4);
      const got=await page.locator('#pairs .got').allTextContents();
      assert.deepEqual(got,['I keep a tide beneath my tongue.','The silence carries paper boats.','A word slips free before a song.','The shore was listening so long.']);
      assert.equal(await page.locator('#pairs .seen').first().textContent(),'I leave a lamp beside the rain.');
      await page.waitForTimeout(2200);
      if(shots)await page.waitForTimeout(600),await page.screenshot({path:path.join(out,`opening-3-reveal-${name}.png`),fullPage:true});
      await page.locator('[data-engine=poppler]').click();
      assert.match(await page.locator('#pairs').textContent(),/I keep a tide beneath my tongue\.The silence/);
      await page.locator('[data-engine=mupdf]').click();
      await page.keyboard.press('ArrowRight');assert.equal(await visible(),'4');
      await page.waitForFunction(()=>/matches the recorded specimen/.test(document.getElementById('live-hash').textContent));
      assert.equal(await page.locator('#map li').count(),4);
      assert.equal(await page.locator('#live-badge').textContent(),'LIVE');
      if(shots)await page.waitForTimeout(600),await page.screenshot({path:path.join(out,`opening-4-mechanism-${name}.png`),fullPage:true});
      await page.keyboard.press('ArrowRight');assert.equal(await visible(),'5');
      await page.waitForFunction(()=>/A B C D/.test(document.getElementById('travel-facts').textContent));
      const facts=await page.locator('#travel-facts').textContent();
      assert.match(facts,/0 of 484,704/);assert.match(facts,/3,043 of 484,704/);
      if(shots)await page.waitForTimeout(600),await page.screenshot({path:path.join(out,`opening-5-travel-${name}.png`),fullPage:true});
      await page.keyboard.press('ArrowRight');assert.equal(await visible(),'6');
      assert.match(await page.locator('#s6-title').textContent(),/What should survive when an answer travels through AI\?/);
      assert.equal(await page.locator('#return-link').getAttribute('href'),base+'/presentation/');
      if(shots)await page.waitForTimeout(600),await page.screenshot({path:path.join(out,`opening-6-bridge-${name}.png`)});
      await page.keyboard.press('ArrowRight');assert.equal(await visible(),'6','stays on last scene');
      await page.keyboard.press('ArrowLeft');assert.equal(await visible(),'5');
      // Pointer/touch path and deep link.
      await page.goto(base+'/opening.html?return=http://presenter.example:8001/#step-6');
      assert.equal(await visible(),'6');
      assert.equal(await page.locator('#return-link').getAttribute('href'),'http://presenter.example:8001/');
      await page.locator('[data-prev]').click();assert.equal(await visible(),'5');
      await page.locator('.dots button').nth(2).click();assert.equal(await visible(),'3');
      // No horizontal overflow at this width.
      assert.ok(await page.evaluate(()=>document.documentElement.scrollWidth<=window.innerWidth),'no horizontal scroll');
      // Real specimen links resolve.
      for(const href of ['output/pdf/01-poem-other.pdf','output/transforms/poem-other-rewrite.pdf','index.html','TWO-POEMS.md','TRANSFORMATION-NOTEBOOK.md']){
        const r=await page.request.get(base+'/'+href);assert.equal(r.status(),200,href);
      }
      assert.deepEqual(errors,[],name+' console/page errors');
      assert.deepEqual(failed,[],name+' failed requests');
      await page.close();
      console.log(name,'walkthrough ok');
    }
    // Reduced motion still reveals immediately.
    const ctx=await browser.newContext({reducedMotion:'reduce'}),page=await ctx.newPage();
    await page.goto(base+'/opening.html#step-3');
    await page.waitForFunction(()=>document.querySelectorAll('#pairs .got').length===4);
    assert.equal(await page.locator('#pairs .got.flip').count(),0);
    console.log('reduced-motion ok');
    await ctx.close();
  }finally{
    if(browser)await browser.close();
    server.close();
  }
})().catch(e=>{console.error(e);process.exit(1);});
