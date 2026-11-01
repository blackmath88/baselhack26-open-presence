# .phf story site — implementation handoff
1 November 2026 · ChatGPT / Codex (assistant).

## Delivered
- Static landing page and Past / Future / Now story, with the Commons section longest.
- Explicit hosted/local destination contract and honest app-availability panels.
- Public packaging for the real PDF opening, cabinet, downloads, evidence and PDF history.
- Story return links from Commons, Workbench and PDF pages; E missions open apps, not source folders.
- Existing Observatory Pages artifact extended without replacing its index, data or E preview.
- One local production launcher for story, Commons UI/API proxy, PDF cabinet and Workbench.
  Local demo data is isolated; external AI and ATProto configuration is disabled.
- Existing Cisco implementation branches remain untouched.

## Checks actually run
- Commons production build/typecheck and 207 tests across 22 files passed.
- Workbench build/typecheck, 21 tests including Python writer parity, 11 production smoke checks passed.
- Five site tests passed: hosted/local destinations, public URL guard, preservation of Observatory
  files, byte-identical PDF copying, relative static links and PDF default return targets.
- Local launcher started all five processes; six integration checks passed, including API through
  the frontend proxy, Workbench specimen deep link and PDF history; --smoke stopped the services.
- Desktop cloud-browser preview inspected: landing layout and real PDF preview; Follow the story
  navigated to #past. App availability links resolve to the same page in the hosted preview.
- git diff --check passed.

## Limits
- Public Commons and Workbench runtimes are not deployed. Pages provides the story and static
  PDF experiences, not the Node services. The hosted page says so.
- This run did not execute the full contribution/reply journey in a browser across all apps.
  Existing app tests passed; the new integration smoke is HTTP-level.
- No new mobile browser walkthrough or Windows launcher run; responsive CSS is implemented.
- No final film, new Cisco integration, live PDF engine runner or external federation is claimed.
- Existing unsaved draft behavior is preserved; the bridge does not introduce universal autosave.
- Desktop visual verification used the managed preview, not a verified public deployment.
  Check the Pages run/public URL after merging.

Run instructions: apps/story/README.md.
Plan: docs/build/PHF-WEBSITE-END-TO-END.md.
