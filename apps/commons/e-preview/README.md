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

Confirm crisp → inhale → exhale → melt → leisure, Replay, Pause/Resume, Hide/Restore, mobile layout and the OS reduced-motion setting in a browser. Automated tests cover the behaviour reducer and opening timeline; the static build is not a substitute for that visual check.
