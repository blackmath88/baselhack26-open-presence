// Only modifies full HTML documents, preserving the existing application and data.
export function injectCompanion(html, assetPrefix) {
  if (html.includes('data-phf-e-script') || !/<\/body>/i.test(html)) return html;
  return html.replace(/<\/body>/i, `<link rel="stylesheet" href="${assetPrefix}companion.css"><script defer data-phf-e-script src="${assetPrefix}companion.js"></script></body>`);
}
