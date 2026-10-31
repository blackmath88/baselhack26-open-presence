# Edition 01 — the document workbench

Built 31 October 2026. This is a first working interpretation, not the outcome of the three proposed visual studies. Achim authorised building the standalone HTML here after the planning pass.

## Working visual direction

An editorial page with a 1990s/early-2000s document workbench: warm paper, dark ink, vermilion, grey bevels, blue title bars and mint technical space. Large sans-serif headlines establish the argument; small monospace chrome carries metadata. System fonts and original CSS/SVG illustrations keep the experience offline and independent of external assets. No Adobe or operating-system UI is copied pixel for pixel.

The chrome is a presentational shell, not a reconstruction of the software used in each historical year. Decorative menus/window controls are visibly part of the illustration and are not focusable. Real experimental controls are native buttons. The font warning explains a dependency, and the free-Reader window explains adoption friction.

## Implemented narrative and interaction

Six acts follow one synthetic field manual. Desktop scroll position changes the manual's font state and opens its content package; reversing scroll restores those states. Native buttons allow readers to inspect either state and take precedence over subsequent automatic changes. State is reset by reloading. Chapter anchors, active navigation and a progress line support orientation. Scroll is native, with no interception or timers.

Each act has its own figure; this edition uses repeated document identity rather than one DOM object travelling across every scene. On small or short screens figures flow beneath the text. Reduced motion uses direct, manually controlled states without scroll-driven changes or interpolation. No JavaScript leaves all six acts, prose, figures and sources readable; experiments are hidden. Package content is explained in a noscript note.

Business value gets a full act. No unverified prices, customer savings or active-user series are displayed. The closing context record is explicitly a proposal.

## Running it

Open index.html directly in a browser. No server or install is needed. CSS, JS and SVG are embedded; sources.json is an audit companion and is not fetched. Only reader-activated source/project links use the network.

## Verification performed

Headless Chromium 153.0.8010.0 (packaged test browser), using Playwright locally:

- 1440×1000, 768×1024, 390×844 and 900×550: no horizontal page overflow, no missing internal anchors.
- No page JavaScript errors and zero HTTP/HTTPS resource requests while opening, scrolling and exercising controls from a local file.
- Font substitution/restoration and package inspection/reassembly: button state and visual state agree.
- Forward/reverse scroll: font and package states return deterministically.
- Chapter anchor navigation selects the corresponding navigation state.
- Reduced motion: flowing stages and no automatic font switch; no JavaScript: all six chapters remain.
- Keyboard first focus reaches the skip link. This is not a complete assistive-technology audit.
- Print-to-PDF generation succeeds. Printed page layout has not been comprehensively inspected.
- Screenshots inspected for desktop, mobile and the package act. A caption/dialog overlap was found and corrected.

Final browser version is recorded in the source ledger build record. Safari, Firefox, a real touchscreen and screen-reader testing remain follow-ups. Local QA scripts and screenshots are temporary inspection artifacts, not runtime dependencies or published deliverables.

## Sources and limits

Four historical/technical sources were opened in this build pass, with supporting passages located for the main argument. Wharton's interview is retrospective participant testimony; the economic loop is labelled interpretation. PDF Reference 1.3 is a later technical edition and is not evidence that every feature existed at launch. Claims not used from the supplied research remain unverified in research/CLAIMS.md. The original dossier is preserved.

Next design iteration: evaluate period-specific screenshots/manuals and compare alternative visual treatments if desired. Preserve narrative continuity and accessibility instead of turning the story into a desktop emulator.
