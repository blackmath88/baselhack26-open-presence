/* Optional real browser smoke. Supply Playwright via NODE_PATH; no package changes. */
const {chromium}=require('playwright');
const http=require('node:http'),fs=require('node:fs/promises'),path=require('node:path'),os=require('node:os'),assert=require('node:assert/strict'),{execFileSync}=require('node:child_process');
(async()=>{
  const root=__dirname,tmp=await fs.mkdtemp(path.join(os.tmpdir(),'poem-browser-'));
  const server=http.createServer(async(req,res)=>{
    try{
      const target=path.resolve(root,'.'+decodeURIComponent(new URL(req.url,'http://localhost').pathname));
      if(!target.startsWith(root+path.sep))throw Error('outside root');
      const data=await fs.readFile(target);if(data.length>2*1024**2)throw Error('oversize');
      res.setHeader('Content-Type',({'.html':'text/html','.js':'text/javascript','.css':'text/css','.json':'application/json','.webp':'image/webp','.pdf':'application/pdf'})[path.extname(target)]||'text/plain');res.end(data);
    }catch(e){res.statusCode=404;res.end('not found');}
  });
  let browser;
  try{
    await new Promise(resolve=>server.listen(0,'127.0.0.1',resolve));
    browser=await chromium.launch({headless:true,executablePath:process.env.CHROMIUM_PATH||'/usr/bin/chromium'});
    const page=await browser.newPage({viewport:{width:1440,height:1000}}),errors=[];
    page.on('pageerror',e=>errors.push(e.message));
    await page.goto(`http://127.0.0.1:${server.address().port}/index.html#poems`);
    if(process.argv.includes('--minimal')){
      await page.locator('#minimal-mapping > summary').click();
      await page.waitForFunction(()=>document.getElementById('minimal-text').textContent.includes('Source extraction:'));
      await page.waitForFunction(()=>document.getElementById('minimal-audit-text').textContent.includes('Static inference'))
      const evidence=JSON.parse(await fs.readFile(path.join(root,'evidence/mapping-minimal.json'),'utf8'));
      for(const engine of ['mupdf','poppler']){
        await page.selectOption('#minimal-engine',engine);
        for(const [caseName,mapping,expected] of [['identity','A','A'],['single','Z','Z'],['multiple','SEA','A']]){
          await page.selectOption('#minimal-case',caseName);
          const output=await page.locator('#minimal-text').textContent();
          assert.ok(output.includes('Source extraction:\n'+mapping));
          assert.ok(output.includes('Rewrite extraction:\n'+expected));
          const row=evidence.rows.find(r=>r.case===caseName);
          for(const state of ['source','rewrite']){
            const href=await page.locator('#minimal-'+state+'-file').getAttribute('href');
            const response=await page.request.get(new URL(href,page.url()).href);assert.equal(response.status(),200);
            assert.equal(require('node:crypto').createHash('sha256').update(await response.body()).digest('hex'),row.states[state].sha256);
          }
          assert.match(await page.locator('#minimal-cmaps').textContent(),/begincmap/);
          const audit=await page.locator('#minimal-audit-text').textContent();
          assert.ok(audit.includes('Input UTF-16BE bytes: '+(caseName==='multiple'?6:2)));
          assert.ok(audit.includes('Simple-font writer gate: '+(caseName==='multiple'?'omit entry':'add entry')));
          assert.equal(await page.locator('#minimal-audit-links a').count(),4);
        }
      }
      await page.locator('#minimal-case').focus();await page.keyboard.press('Home');
      assert.equal(await page.locator('#minimal-case').inputValue(),'identity');
      await page.keyboard.press('End');assert.equal(await page.locator('#minimal-case').inputValue(),'multiple');
      await page.selectOption('#minimal-engine','mupdf');
      await page.locator('#mapping-audit > summary').click();
      assert.equal(await page.locator('#minimal-audit-text').isVisible(),true);
      await page.waitForFunction(()=>document.getElementById('minimal-rewrite-image').complete);
      for(const [name,width,height] of [['desktop',1440,1000],['mobile',390,844]]){
        await page.setViewportSize({width,height});
        assert.ok(await page.evaluate(()=>document.getElementById('minimal-mapping').getBoundingClientRect().right<=innerWidth));
        const stem=path.join(root,'evidence/previews/minimal-workbench-'+name);
        await page.locator('#minimal-mapping').screenshot({path:stem+'.png'});
        execFileSync(process.env.PDF_CHECK_PYTHON||'python3',['-c','from PIL import Image; import sys; Image.open(sys.argv[1]).save(sys.argv[2],lossless=True)',stem+'.png',stem+'.webp'],{timeout:10000});
        await fs.rm(stem+'.png');
      }
      assert.deepEqual(errors,[]);
      const result={browser:await browser.version(),checks:{three_controls_in_both_engines:true,source_and_rewrite_served_hashes:true,decoded_map_display:true,source_audit_matches_selected_case:true,pinned_source_links:true,keyboard_selection:true,desktop_mobile_within_viewport:true,no_page_errors:true},native_viewer:'not-run: HTML notebook and artifact bytes only'};
      await fs.writeFile(path.join(root,'evidence/mapping-minimal-browser.json'),JSON.stringify(result,null,2)+'\n');
      console.log(JSON.stringify(result,null,2));return;
    }
    await page.waitForFunction(()=>document.getElementById('poem-extraction').textContent.includes('I keep a tide'));
    await page.selectOption('#poem-reading','visible');
    assert.match(await page.locator('#poem-file').getAttribute('href'),/visible.pdf$/);
    assert.match(await page.locator('#poem-extraction').textContent(),/I leave a lamp/);
    await page.selectOption('#poem-reading','raster');
    assert.match(await page.locator('#poem-extraction').textContent(),/\[no text extracted\]/);
    await page.selectOption('#poem-reading','other');
    await page.getByText('Bend your own four lines',{exact:true}).click();
    const lines=['A tide waits under the floor.','The house remembers the sea.','I open a door in a whisper.','Water comes looking for me.'];
    for(let i=0;i<4;i++)await page.locator('[data-poem-line]').nth(i).fill(lines[i]);
    await page.getByRole('button',{name:'Build my mapped PDF',exact:true}).click();
    await page.waitForFunction(()=>!document.getElementById('poem-custom').hidden);
    const [download]=await Promise.all([page.waitForEvent('download'),page.locator('#poem-custom').click()]);
    const pdf=path.join(tmp,'custom.pdf');await download.saveAs(pdf);
    const poppler=JSON.parse(execFileSync(process.env.PDF_CHECK_PYTHON||'python3',[path.join(root,'check-poems.py'),'--poppler',pdf],{timeout:15000,encoding:'utf8'}));
    const text=poppler.stdout;
    lines.forEach(line=>assert.ok(text.includes(line),line));
    const mupdf=JSON.parse(execFileSync(process.env.PDF_CHECK_PYTHON||'python3',[path.join(root,'check-poems.py'),'--worker',pdf,path.join(tmp,'custom.png')],{timeout:10000,encoding:'utf8'}));
    lines.forEach(line=>assert.ok(mupdf.text.includes(line),line));
    const measured=JSON.parse(await fs.readFile(path.join(root,'evidence/poems-results.json'),'utf8'));
    assert.equal(mupdf.pixels_sha256,measured.runs.other.mupdf.observation.pixels_sha256);
    // The new journey must expose the measured files and semantic loss honestly.
    await page.waitForFunction(()=>!document.getElementById('journey-reveal').disabled);
    const notebook=JSON.parse(await fs.readFile(path.join(root,'evidence/poems-transforms.json'),'utf8'));
    for(const instrument of ['mupdf','poppler']){
      await page.selectOption('#journey-engine',instrument);
      for(const operation of ['source','clone','rewrite','raster']){
        await page.selectOption('#journey-operation',operation);
        assert.equal(await page.locator('#journey-result').isVisible(),false);
        await page.locator('#journey-reveal').click();
        const raw=await page.locator('#journey-extraction').textContent();
        if(operation==='source'||operation==='clone')assert.ok(raw.includes('I keep a tide beneath my tongue.'));
        if(operation==='rewrite'){
          assert.ok(!raw.includes('I keep a tide beneath my tongue.'));
          assert.ok(!raw.includes('I leave a lamp beside the rain.'));
          assert.match(raw,instrument==='mupdf'?/A\nB\nC\nD/:/ABCD/);
          assert.match(await page.locator('#journey-pair').textContent(),/byte-identical/);
        }
        if(operation==='raster')assert.equal(raw,'[no text extracted]');
        const href=await page.locator('#journey-file').getAttribute('href');
        const response=await page.request.get(new URL(href,page.url()).href);assert.equal(response.status(),200);
        const row=notebook.rows.find(r=>r.reading==='other'&&r.operation===operation);
        assert.equal(require('node:crypto').createHash('sha256').update(await response.body()).digest('hex'),row.sha256);
      }
    }
    await page.selectOption('#journey-operation','clone');
    await page.selectOption('#journey-reading','visible');
    await page.locator('#journey-reveal').click();assert.match(await page.locator('#journey-extraction').textContent(),/I leave a lamp beside the rain/);
    await page.selectOption('#journey-reading','other');await page.selectOption('#journey-engine','mupdf');
    // Native keyboard operation of the select and reveal button.
    await page.locator('#journey-operation').focus();await page.keyboard.press('End');
    await page.keyboard.press('ArrowUp');
    assert.equal(await page.locator('#journey-operation').inputValue(),'rewrite');
    await page.locator('#journey-difference').check();
    assert.match(await page.locator('#journey-image').getAttribute('src'),/rewrite-mupdf-difference.webp$/);
    await page.locator('#journey-reveal').focus();await page.keyboard.press('Space');
    assert.equal(await page.locator('#journey-reveal').getAttribute('aria-expanded'),'true');
    await page.locator('#poem-journey').screenshot({path:path.join(root,'evidence/previews/01-poem-journey-desktop.png')});
    await page.setViewportSize({width:390,height:844});
    assert.ok(await page.evaluate(()=>document.getElementById('poem-journey').getBoundingClientRect().right<=innerWidth));
    await page.locator('#poem-journey').screenshot({path:path.join(root,'evidence/previews/01-poem-journey-mobile.png')});
    await page.setViewportSize({width:1440,height:1000});
    await page.locator('#poems').screenshot({path:path.join(root,'evidence/previews/01-poem-workbench-desktop.png')});
    await page.setViewportSize({width:390,height:844});
    await page.locator('#poems').screenshot({path:path.join(root,'evidence/previews/01-poem-workbench-mobile.png')});
    for(const name of ['workbench-desktop','workbench-mobile','journey-desktop','journey-mobile']){
      const stem=path.join(root,'evidence/previews/01-poem-'+name);
      execFileSync(process.env.PDF_CHECK_PYTHON||'python3',['-c', 'from PIL import Image; import sys; Image.open(sys.argv[1]).save(sys.argv[2], lossless=True)',stem+'.png',stem+'.webp'],{timeout:10000});
      await fs.rm(stem+'.png');
    }
    const overflow=await page.evaluate(()=>{const r=document.getElementById('poems').getBoundingClientRect();return r.right>innerWidth;});assert.equal(overflow,false);
    assert.deepEqual(errors,[]);
    const result={browser:await browser.version(),checks:{specimen_selector:true,measured_extraction_switch:true,local_pdf_download:true,custom_poppler_extraction:true,custom_mupdf_extraction:true,custom_mupdf_pixel_identity:true,mobile_exhibit_within_viewport:true,no_page_errors:true,journey_selector_and_reveal:true,journey_served_artifact_hashes:true,journey_keyboard:true,journey_mobile_within_viewport:true},custom_lines:lines,custom_poppler:poppler,custom_poppler_text:text,custom_mupdf:mupdf,custom_sha256:require('node:crypto').createHash('sha256').update(await fs.readFile(pdf)).digest('hex'),native_pdf_viewer:'not-run: browser workbench and downloaded file only'};
    await fs.writeFile(path.join(root,'evidence/poems-browser-results.json'),JSON.stringify(result,null,2)+'\n');console.log(JSON.stringify(result,null,2));
  }finally{
    if(browser)await browser.close();await new Promise(resolve=>server.close(resolve));await fs.rm(tmp,{recursive:true,force:true});
  }
})().catch(e=>{console.error(e);process.exitCode=1;});
