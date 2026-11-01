/** One route contract for the static story, app adapters and local rehearsal. */
export const PAGES = 'https://blackmath88.github.io/baselhack26-open-presence/';
export function destinations(profile = 'hosted', overrides = {}) {
  if (!['local', 'hosted'].includes(profile)) throw new Error('Unknown destination profile');
  const local = profile === 'local';
  const home = local ? 'http://127.0.0.1:8001/' : PAGES + 'story/';
  const commons = local ? 'http://127.0.0.1:5173/' : overrides.commons;
  const workbench = local ? 'http://127.0.0.1:3100/' : overrides.workbench;
  for (const value of [commons, workbench].filter(Boolean)) {
    const u = new URL(value);
    if (!['http:', 'https:'].includes(u.protocol) || u.username || u.password) throw new Error('Invalid app URL');
    if (!local && (u.protocol !== 'https:' || /^(localhost|127\.|0\.0\.0\.0|\[::1\])/.test(u.hostname) || ['3100','5173','8000','8001','8787'].includes(u.port))) throw new Error('Hosted app URL must be public HTTPS');
  }
  const lab = local ? 'http://127.0.0.1:8000/' : PAGES + 'pdf-lab/';
  return {
    profile, storyHome: home, storyPast: home + '#past', storyFuture: home + '#future', storyNow: home + '#now',
    commonsHome: commons || home + '#commons-access',
    commonsExample: commons ? commons + '#/search?q=' + encodeURIComponent('My Mac cannot see my frame') : home + '#commons-access',
    commonsAvailable: Boolean(commons),
    pdfOpening: lab + 'opening.html?return=' + encodeURIComponent(home + '#past'),
    pdfCabinet: lab + 'index.html', pdfWorkbench: workbench || home + '#workbench-access',
    workbenchAvailable: Boolean(workbench),
    pdfHistory: local ? home + 'pdf-history/index.html' : PAGES + 'pdf-history/',
    observatoryHome: PAGES, ePreview: PAGES + 'e/',
    sourceRepository: 'https://github.com/blackmath88/baselhack26-open-presence',
  };
}
