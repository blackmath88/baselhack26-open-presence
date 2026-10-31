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


# Edition 02 — reassurance, then the next question

Implemented 31 October 2026 in the Orca-managed `pdf-history-reassurance` worktree. The original six-act narrative and warm paper / ink / red / mint / blue title-bar direction remain. This is an extension of edition 01, not a new visual theme.

## Narrative and continuity

The sixth act first returns to the feeling Achim described: “I know what I’m receiving.” Three receiving situations repeat the same manual title, revision A, diagram, marked instruction, specimen and page number. The familiar format means less negotiation about receiving it; that is attributed interpretation, not a public-trust statistic. Signature details and limits are expandable, before the optional project bridge. The closing has two concise visual examples: search context, and LLM context/contribution backflow. The photo-frame case remains concrete and ATProto remains a candidate.

The two primary operations remain manual-state mutation and reframing what must travel. The font experiment has explicit intact/substituted states: an actual marked paragraph changes DOM parent from page 1 to a distinct page 2, then returns. Wide desktops use a spread; narrower and short views stack full sheets. Character-loss boxes are separately labelled, decorative, and deterministic; semantic intact characters remain available. No claim is made that Courier inherently lacks umlauts. The later PDF scene explains settled pagination rather than repairing the author's layout.

## Edition-02 checks actually run

Playwright with local headless Chromium **153.0.8010.12**, opening the HTML via `file://`:

- 390×844, 768×1024, 1440×1000 and 900×550: no horizontal document overflow, before and after substitution, through every story section and with signature details expanded.
- Each size: real marked paragraph appears on visible sheet 2, disappears from sheet 1, and returns with intact characters/page count on restore. Desktop spreads and phone stacks inspected visually. Stamp moved out of absolute positioning after finding a footer collision.
- Manual selection survives scrolling; forward/reverse desktop scroll restores automatic font and package states. Package button state agrees with the illustration.
- Keyboard: skip link is first focus; Enter/Space operate the font button, Enter operates package inspection and signature details. Internal fragment targets exist and IDs are unique. No screen-reader certification is claimed.
- Zero page JavaScript errors and zero HTTP/HTTPS resource requests during local opening, controls and scrolling.
- Reduced motion: no automatic substitution; manual before/after remains available. No JavaScript at 390 px: all six acts, intact specimen, static pagination comparison, actual instruction on the illustrated second sheet, signature notes and sources remain available; experiment controls are hidden.
- Print-to-PDF generated and pages rendered for inspection. Print uses margins, keeps individual sheets/windows intact where possible, reassembles the package, expands source/signature notes and hides the focused skip link. Print output is a reading fallback, not a facsimile of the interactive spread.
- Screenshots inspected for desktop spread, mobile stacked sheets, no-JS comparison, travelling-manual sequence and closing examples. Supplemental viewport capture confirmed the sticky navigation stays at the viewport top; full-element screenshots can include that fixed chrome mid-image.

## Limits

Safari, Firefox, physical printers, real touchscreens and screen readers were not tested. Print raster inspection was targeted, not an exhaustive typography audit. Small metadata labels remain illustrative chrome; the overflow paragraph is readable at full phone sheet width. The comparison is an authored simulation, not an actual font engine or PDF renderer. No live signature validation, protocol integration or deployment was introduced. Adobe's primary documentation supports the new bounded signature wording; source details/caveats are in sources.json. Unused research remains unverified.
