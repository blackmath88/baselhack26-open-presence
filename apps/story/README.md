# .phf story and connected demo

A buildless static landing page: Past → Future → Now, with direct app entrances.
Build: node scripts/site/build.mjs hosted (from the repository root).
Production artifact composition: node scripts/site/package-public.mjs observstory.
The latter preserves the existing Observatory index and data, adds /story/, /pdf-lab/ and
/pdf-history/, and leaves the existing /e/ build untouched.

## Local experience
Node 22+ and npm:
~~~sh
node scripts/site/rehearse.mjs
~~~
This installs missing dependencies and builds Commons + Workbench, then starts:
- story on 8001
- published PDF cabinet on 8000
- Commons built frontend and API proxy on 5173, Node backend on 8787
- Workbench production server on 3100

All bind to loopback. The story uses explicit local destinations; Observatory is the public snapshot.
The launcher waits for each service, stops its children on Ctrl+C, and refuses occupied ports.
Demo data persists in .phf-demo/commons.json; no existing application database is reset.
External AI keys and ATProto accounts/allowlist/follow settings are disabled for this rehearsal.
A launcher lock prevents concurrent runs. After a force-kill, confirm no launcher remains before
removing .phf-demo/launcher.lock. Stop normally when possible.

Verification:
~~~sh
node --test scripts/site/site.test.mjs
node scripts/site/rehearse.mjs --smoke
~~~
The latter builds and starts the actual production services, checks six integration endpoints and stops.
Linux execution was verified; Windows npm invocation is supported in the script but not tested here.

## Hosted boundary
The public static site works without a backend. The PDF cabinet includes its existing in-browser
PDF writer and recorded evidence. The full Commons and Workbench servers are **not hosted by Pages**.
Their links display availability information rather than a local URL or mock successful app.

The destination builder accepts PHF_COMMONS_URL and PHF_WORKBENCH_URL as public HTTPS URLs.
Set those only after deploying and verifying the actual runtimes; rebuild the story afterward.
The current Pages workflow deliberately sets neither. It does not deploy the inherited Cloudflare
Worker as a substitute for Commons.

When building the actual applications, use the same destination contract to set:
- Commons: VITE_PHF_PRESENTATION_URL to storyFuture; VITE_PHF_PDF_URL to pdfCabinet;
  VITE_PHF_HISTORY_URL to pdfHistory.
- Workbench: VITE_PHF_STORY_URL to storyPast; VITE_LEGACY_CABINET_URL to pdfCabinet.

Production defaults use the published story and PDF cabinet; the local launcher sets all values.
No auth tokens or private draft text cross app URLs. Returning from Commons preserves its existing
canonical state. This release does not add autosave for existing unsaved drafts.

The packaging allowlist copies authored PDF specimens, evidence and explanatory files;
it excludes workbench source, node_modules, development reports and the local runner.
Checks verify that PDF bytes are unchanged, static links resolve and Observatory files are preserved.
