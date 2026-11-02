# Deploy a dope e

A backend-independent static page using the same lowercase e components as Commons. The [selected character contract](../../../docs/design/DOPE-E.md) governs its appearance and opening.

## Build and run

Node 22 or newer. From `apps/commons`:

```sh
npm ci
npm run test:e
npm run build:e
npm run preview:e -- --host 127.0.0.1 --port 4173
```

Open http://127.0.0.1:4173/ . `build:e` checks the preview's TypeScript and produces `dist-e/index.html` plus `dist-e/assets/`. No backend, API key, environment variable or runtime server is needed for the deployed page.

## Deploy

Upload **the contents of `apps/commons/dist-e/`** to any static host. Relative asset paths support a domain root or a subdirectory. Keep `index.html` and `assets/` together. There is no client-side routing or SPA rewrite requirement. The Observatory link is absolute so it also works outside GitHub Pages.

Current hosting: the existing Observatory workflow runs `npm run build:e` and copies the result to `/e/` before deploying Pages. Merges to main update https://blackmath88.github.io/baselhack26-open-presence/e/ automatically.

For a portable download, open the repository's **e companion release** Actions workflow and download the **dope-e-static** artifact from a successful run. Its ZIP contains the static site and this deployment guide. This is independent of the Observatory build and does not require the Commons server. Manual workflow runs build a downloadable artifact; they do not publish a second site.

## Integrate in Commons

Keep the existing `<EGuide />` integration. `EOpening` and `EPixelSprite` are shared with this preview. Smoke, joint, lowercase form, red eyes and leisure expression belong to the selected design; preserve them when moving the component into another shell.

## Release check

Confirm crisp → inhale → exhale → melt → leisure, Replay, Pause/Resume, closing the bubble without removing e, mobile layout and the OS reduced-motion setting in a browser. Automated tests cover the behaviour reducer and opening timeline; the static build is not a substitute for that visual check.

## Wordmark film

The preview leads with `EOpening variant="wordmark"`: Adobe → A dobe e → A dope e → a dope e → e turns and exhales white bubble smoke → letters fold into e → selected e alone. Duration: 14.2 seconds (word transitions quicker, smoke still 6.1 seconds). Its Pause and Replay controls act on the same clock as the scene. The compact Commons character remains available under “Try e in the Commons”.

## Persistent overlay

The character remains above the page. Drag it or focus e and use arrow keys; Home/“Return to e’s place” restores authored placement. Closing the conversation never hides e. The panel is an authored page guide, not an LLM connection.

`npm run build:companion` produces `dist-companion/companion.js` and `companion.css`. Load both on a static page (script with `defer`), or mount the React ECompanion once. The downloadable release includes these assets under `companion/`. Authored placement and behaviour: `docs/build/E-PERSISTENT-COMPANION.md` in the repository.

The small companion has no text label underneath it. It idles through blinking, a tiny cough and a slow smoke exhale; Pause and reduced motion stop those cues.
