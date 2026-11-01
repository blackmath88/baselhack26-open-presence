const { chromium } = require('playwright')
const contrastJs = `(() => {
  const lum = (c) => { const m = c.match(/[\\d.]+/g).map(Number); const [r,g,b] = m.slice(0,3).map(v => { v/=255; return v<=0.03928? v/12.92 : ((v+0.055)/1.055)**2.4 }); return 0.2126*r+0.7152*g+0.0722*b }
  const bgOf = (el) => { while (el) { const b = getComputedStyle(el).backgroundColor; const a = b.match(/[\\d.]+/g); if (a && (a.length<4 || Number(a[3])>0.5)) return b; el = el.parentElement } return getComputedStyle(document.body).backgroundColor }
  const low = []; for (const el of document.querySelectorAll('body *')) { if (!el.childNodes.length || ![...el.childNodes].some(n => n.nodeType === 3 && n.textContent.trim())) continue; const r = el.getBoundingClientRect(); if (!r.width || !r.height) continue; const s = getComputedStyle(el); if (s.visibility === 'hidden' || +s.opacity < .6) continue; const f = lum(s.color), b = lum(bgOf(el)); const ratio = (Math.max(f,b)+0.05)/(Math.min(f,b)+0.05); if (ratio < 4.5) low.push(el.tagName + '.' + el.className + ' ' + ratio.toFixed(2) + ' "' + el.innerText.slice(0,30).replace(/\\s+/g,' ') + '"') }
  return low })()`

;(async () => { const b = await chromium.launch({ executablePath: '/usr/bin/chromium' })
const s = await (await fetch('http://127.0.0.1:8811/api/auth/session', { method: 'POST', headers: { 'content-type': 'application/json' }, body: JSON.stringify({ participantId: 'lea' }) })).json()
for (const qs of ['', '?theme=light']) for (const h of ['#/compare?a=reset-after-uboot&b=ums-drops-during-backup&q=My%20Mac%20cannot%20see%20my%20frame', '#/search?q=My%20Mac%20cannot%20see%20my%20frame&compare=reset-after-uboot,ums-drops-during-backup', '#/compare?a=nope&b=usb-c-no-data', '#/problems/ums-drops-during-backup?q=My%20Mac%20cannot%20see%20my%20frame']) {
  const p = await (await b.newContext({ viewport: { width: 1440, height: 1000 } })).newPage()
  await p.goto('http://127.0.0.1:5211/' + qs); await p.evaluate(([t, a]) => localStorage.setItem('br-ai-nstorm.session', JSON.stringify({ token: t, actor: a })), [s.token, s.actor])
  await p.goto('http://127.0.0.1:5211/' + qs + h); await p.reload(); await p.waitForTimeout(1800)
  const low = await p.evaluate(contrastJs); console.log((qs || 'dark').padEnd(12), h.slice(0, 40).padEnd(42), low.length, low.slice(0, 3).join(' | ')); await p.close() }
await b.close() })()
