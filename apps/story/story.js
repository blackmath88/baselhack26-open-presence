'use strict';
fetch('destinations.json').then(r => { if (!r.ok) throw Error('Destination configuration unavailable'); return r.json(); }).then(d => {
  document.querySelectorAll('[data-dest]').forEach(a => {
    const value = d[a.dataset.dest];
    if (typeof value !== 'string') return;
    if (!d.commonsAvailable && ['commonsHome','commonsExample'].includes(a.dataset.dest)) { a.href='#commons-access'; return; }
    if (!d.workbenchAvailable && a.dataset.dest==='pdfWorkbench') { a.href='#workbench-access'; return; }
    const url = new URL(value, location.href);
    if (['https:', 'http:'].includes(url.protocol)) a.href = url.href;
  });
  if (d.commonsAvailable) {
    document.querySelector('[data-commons-status]').textContent = 'Open the connected Commons. Choose a demo participant; your observations go to its shared demo room.';
    document.querySelector('[data-live-commons]').hidden = false;
    document.querySelector('[data-local-help]').hidden = true;
    document.querySelectorAll('[data-commons-label]').forEach(a => { a.textContent = 'Try .phf Commons ↗'; });
  }
  if (d.workbenchAvailable) {
    document.querySelector('[data-workbench-status]').textContent = 'Open the connected Workbench to inspect a specimen and build your own second reading.';
    document.querySelector('[data-live-workbench]').hidden = false;
  }
}).catch(() => {
  document.querySelector('[data-commons-status]').textContent = 'App links could not be loaded. Reload to retry; the story and source links remain available.';
});
