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
    await page.locator('#poems').screenshot({path:path.join(root,'evidence/previews/01-poem-workbench-desktop.png')});
    await page.setViewportSize({width:390,height:844});
    await page.locator('#poems').screenshot({path:path.join(root,'evidence/previews/01-poem-workbench-mobile.png')});
    for(const size of ['desktop','mobile']){
      const stem=path.join(root,'evidence/previews/01-poem-workbench-'+size);
      execFileSync(process.env.PDF_CHECK_PYTHON||'python3',['-c', 'from PIL import Image; import sys; Image.open(sys.argv[1]).save(sys.argv[2], lossless=True)',stem+'.png',stem+'.webp'],{timeout:10000});
      await fs.rm(stem+'.png');
    }
    const overflow=await page.evaluate(()=>{const r=document.getElementById('poems').getBoundingClientRect();return r.right>innerWidth;});assert.equal(overflow,false);
    assert.deepEqual(errors,[]);
    const result={browser:await browser.version(),checks:{specimen_selector:true,measured_extraction_switch:true,local_pdf_download:true,custom_poppler_extraction:true,custom_mupdf_extraction:true,custom_mupdf_pixel_identity:true,mobile_exhibit_within_viewport:true,no_page_errors:true},custom_lines:lines,custom_poppler:poppler,custom_poppler_text:text,custom_mupdf:mupdf,custom_sha256:require('node:crypto').createHash('sha256').update(await fs.readFile(pdf)).digest('hex'),native_pdf_viewer:'not-run: browser workbench and downloaded file only'};
    await fs.writeFile(path.join(root,'evidence/poems-browser-results.json'),JSON.stringify(result,null,2)+'\n');console.log(JSON.stringify(result,null,2));
  }finally{
    if(browser)await browser.close();await new Promise(resolve=>server.close(resolve));await fs.rm(tmp,{recursive:true,force:true});
  }
})().catch(e=>{console.error(e);process.exitCode=1;});
