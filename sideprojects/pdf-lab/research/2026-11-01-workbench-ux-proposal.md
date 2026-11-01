# PDF LAB: workbench UX proposal and reference atlas

1 November 2026 · Author: Perplexity · kind: assistant
Status: discussion proposal, not an accepted architecture or implementation claim.

This document organises the preceding workbench UX discussion and adds a source-linked reference study. References were researched from documentation and repositories, not through hands-on usability testing. Existing cabinet code and measured results remain authoritative for what is implemented. Inspect current repository guidance before building. No third-party code or assets are included.

## 1. Product idea

A place where research becomes operable: bring a document, encounter a strange result, inspect its mechanism, change one part, run instruments, compare outcomes and preserve evidence. It also permits starting from a mechanism and building a strange document.

See it -> inspect it -> explain it -> change it -> run it -> compare it -> keep the evidence.

The document stays at the centre. Do not organise the first experience around parser names or a wall of PDF features. Organise around a specimen and a question: what is this, what am I seeing, why did copying differ, what happens if I change it, what survived travel?

## 2. Stable interface shell

```text
PDF LAB / specimen / Original -> Variant       processing location / Run
+-------------+--------------------------------+------------------------+
| WORKSPACE   | STAGE                          | INSPECTOR              |
| Specimens   | Actual page / selected region  | What you selected      |
| Recipes     |                                | Visible representation |
| Runs        |                                | Mechanism / trace      |
| Journeys    | Page / Text / Overlays         | Evidence / sources     |
+-------------+--------------------------------+------------------------+
| EXPERIMENT BENCH                                                     |
| question -> prediction -> change -> run -> observation               |
| controls / code / comparison / timeline                              |
+---------------------------------------------------------------------+
```

Workspace: what am I working on? Stage: what does it look like/do? Inspector: what explains this selection? Bench: what am I changing/running/comparing?

Use collapsible, resizable panels and a coherent initial layout. Defer unlimited docking. On narrow screens prioritise the stage and open inspector/bench sequentially without losing selection. This responsive detail is proposed, not validated.

## 3. Signature interaction: reveal the basis

Open the one-letter picture. Invitation: 'This picture is text. Try selecting it.' Start with the artefact, not an object tree.

On selection the inspector distinguishes:
- Visible representation: vector drawing.
- Text representation: the actual recovered string for this specimen/run.
- Construction: Type 3 glyph, if established by inspection.
- Trace: page -> content -> resource -> glyph program.
- Actions: reveal construction, compare readings, make a variant.

Show the relevant stream/mapping/glyph code, not the entire file. Selecting a relation highlights the related objects and region. If provenance is incomplete, say so.

Change the Unicode mapping through a recipe control. Declare expected effect (extracted text) and intended invariants (geometry). Generate a derivative and run comparisons. Report actual render difference/extraction change and unrun viewers separately. Never hard-code a success narrative or let AI manufacture findings.

## 4. Progressive depth in place

1. Encounter: what is surprising?
2. Mechanism: how is it constructed?
3. Structure/instructions: show relevant objects, code and mappings.
4. Instrumentation: input, build/configuration, raw outputs, trace, limitations.

A visitor can stop early or deepen the same selection without navigating into an unrelated documentation section. Use plain-language terms alongside exact technical names; offer keyboard equivalents for select/reveal/compare actions.

## 5. Three starting doors, one workspace

Explore a strange document: curated specimen, one question, one action, reveal and modification path.

Open my PDF: same workbench, but no invented authorial explanation. Start with structural inspection, appearance/text comparison, annotations/attachments and revision questions. Mark unsupported grammar/features.

Build a weird PDF: recipes for alternate readings, layer locks, source bundles, revisions, colour programs or page worlds. Simple controls first; real code underneath.

These are entry points, not isolated products. A user can import, inspect, fork and author without leaving the investigation.

## 6. Recipe controls and actual execution

Example colour program: frequency sliders, a selected coordinate and a stack stepper. Tabs: Controls / Program / Stack / PDF objects / Evidence.

Distinguish:
- Teaching simulation of a calculation.
- Generation of a real PDF.
- An identified engine executing/rendering that PDF.

Instant simulation must not be presented as a renderer result. Costly, active or external actions require explicit execution; do not rerun them merely because a slider moved. Preserve original and previous results when editing.

## 7. Comparisons and instruments

Stage views: Single / Side-by-side / Difference / Overlays. Sync only supported navigation actions and allow unlinking; different engines may produce incompatible text geometry or interaction state.

Each pane states specimen hash, engine/wrapper/version/build/configuration, page, render intent and output kind. Distinguish embedded interactive viewer, local engine output and externally observed product. A screenshot, library render and browser simulator must not have interchangeable badges.

Manual observations are valid when procedure/environment are recorded and labelled not automatically reproduced. Begin with two well-instrumented consumers, not ten logos.

## 8. Outside track: the journey strip

```text
Original -> Browser view
        -> Upload -> Preview / Search / Comments -> Download -> Agent input
```

Select a transition to inspect input artefact plus service state, output, observed preserved/added/lost information, evidence and unknowns. Inside asks what produced a mark; outside asks what produced a version. Reuse the same inspector/evidence language at both scales.

## 9. References attached to claims

Every explanation gets an evidence drawer:
- In this specimen: object/stream/recipe.
- In this run: command/output/log/comparison.
- In the specification: exact section.
- In prior work: original repository/author.
- Our interpretation: what the evidence establishes.
- Still unknown: unsupported or untested scope.

Do not substitute a giant bibliography for contextual links. An optional assistant can navigate evidence; it is not the source of missing observations.

## 10. Notebook as accumulated investigation

Free exploration does not require a form before every action. 'Keep this observation' captures a draft with evidence references, interpretation and status. Guided lessons may request prediction first.

Export a readable narrative linked back to actual specimen, variant and run: I changed X; these instruments produced Y; this comparison preserved Z; here are the limits. Do not automatically promote an observation to a conclusion.

## 11. Bring-your-own file boundary

Proposed defaults: immutable originals, local initial inspection, document actions not executed, explicit cloud upload, derived specimens for edits, separate active interaction and bounded workers/processes. Display processing location and actual policy. Do not promise safety from a badge or treat a worker as a universal security sandbox. Do not launch as an unrestricted hosted upload scanner.

## 12. Code layers and shared selection

```text
UI shell: workspace / stage / inspector / bench
  -> shared selection and navigation
  -> experiment model: recipe / variant / prediction / observation
  -> adapters: inspect / extract / render / OCR / interaction / procedure
  -> execution boundary: workers / processes / limits / permissions
  -> artefact store: immutable input / derivatives / manifests / raw output
```

A selection can identify specimen, page, region, objects, operators, run and transition. Not every field is known. Support one-to-many and many-to-one relationships; renderer optimisation breaks simplistic pixel-to-byte links. Never draw a correspondence the instrument cannot establish.

## 13. What not to build first

No universal editor, security score, default force graph, chat-first UI, giant compatibility dashboard, raw hex landing page, huge component catalogue or unrestricted IDE. Do not over-engineer node graphs because reference products have them. UI should expose mechanisms, not simply expose internal data structures.

## 14. First storyboard and acceptance

1. Encounter one-letter picture.
2. Select/copy.
3. Reveal different readings.
4. Inspect mapping and drawing.
5. Change recovered word.
6. Generate derivative.
7. Compare two actual instrument outputs.
8. Save evidence-backed observation.
9. Export specimen and recipe.

Then bring one user-supplied PDF into the same shell. This tests where authored lessons hid general UX gaps. Acceptance: visitor can explain what changed, why the tools say so, which evidence supports it and what was not tested. Prototype these screen states before selecting the full component stack.

# Reference atlas

Inspection date: 1 November 2026. Feature descriptions below come from primary project documentation; the suggested transfers and cautions are our design proposals. Source availability is not clearance to copy branding, media or code. Pin and audit licences before reuse.

## A. RenderDoc — visual output as an entry to execution

- Product/source: https://github.com/baldurk/renderdoc
- Official site: https://renderdoc.org/
- UI overview: https://developers.meta.com/vr/documentation/web/webxr-perf-renderdoc/

Frame capture, event browser, pipeline state, textures and pixel-history inspection form the closest technical analogy to the inward microscope. Select a draw event, see rendering state and related output. The project is MIT licensed and intended for debugging owned/authorised applications.

Borrow the relation between output, event and resources. Adapt it to PDF operators and page resources. Do not copy the initial density or promise pixel provenance where our instrumentation lacks it. Start by studying the Event Browser, Texture Viewer and Pipeline State for one tiny owned capture.

## B. CyberChef — a transparent recipe bench

- Try: https://gchq.github.io/CyberChef/
- Source: https://github.com/gchq/CyberChef

Operations, recipe, input and output; drag/reorder operations; step/breakpoint intermediate states; save recipes; local client-side processing. Apache-2.0 reported by repository.

Borrow explicit input -> operation -> intermediate output -> result. Use for decode/inspect/extract/render sequences with artefact identities. Do not automatically run expensive or active operations. Share recipes without silently embedding private PDF data in URLs; CyberChef itself supports input-bearing deep links.

## C. Blender Geometry Nodes — inspect intermediate representations

- Viewer: https://docs.blender.org/manual/en/latest/modeling/geometry_nodes/output/viewer.html
- Spreadsheet: https://docs.blender.org/manual/en/latest/editors/spreadsheet.html
- Inspection: https://docs.blender.org/manual/en/latest/modeling/geometry_nodes/inspection.html

Viewer nodes expose intermediate geometry/attributes in viewport and spreadsheet; original/evaluated/viewer states can be inspected. Inspection reflects the last evaluation, not necessarily current unevaluated edits.

Borrow 'inspect here' on an intermediate result, plus explicit evaluated/stale state. Original bytes -> decoded stream -> engine representation -> appearance can be viewed without replacing the final artefact. Do not make a node editor the beginner's landing screen. Native application, not a web component dependency.

## D. Python Tutor — step through state rather than explain abstractly

- Product: https://pythontutor.com/
- Historical source anchor: https://github.com/pgbovine/OnlinePythonTutor/tree/536436b50820f8bc50583340b8378c35b2c1ed3b

Product visualises code execution, variables, objects, pointers and stack frames. Treat current hosted product and historical source as different reuse propositions; present-day source/licence scope was not established here.

Borrow source/current instruction/stack synchronisation for the colour program. Show q/cm/clip/paint state for selected operations. Do not assume PDF operators have arbitrary CPU-style reversible execution; a previous recorded state is not engine rollback.

## E. ImHex — connect bytes to semantic structures

- Source and screenshots: https://github.com/WerWolv/ImHex
- Selection discussion: https://github.com/WerWolv/ImHex/discussions/2037

Pattern-based structures, highlighted bytes, data inspection, bookmarks, visualisers and derived preprocessing. Mainly GPLv2-only with specified LGPL exceptions. A maintainer explicitly notes that continuously jumping a large structure tree with every cursor move can be annoying and costly; offers explicit jump instead.

Borrow raw/decoded distinction, named byte regions and click-to-correspondence. Do not synchronise everything on hover or front-load hex. Offer pin selection and explicit follow/jump. Inspiration does not require embedding this native application.

## F. OpenRefine — history is an inspectable research object

- History: https://openrefine.org/docs/manual/running
- Export: https://openrefine.org/docs/manual/exporting

Undo/redo records data changes, operations can be extracted/reapplied as JSON and project archives carry history. View state is not the same as data history. New actions after undo discard the later redo branch in documented behaviour.

Borrow reusable recipes and evidence-bearing project export. Deliberately do not inherit destructive branch semantics: PDF LAB should retain immutable variants and alternative attempts. Avoid confusing a filter, observation or selection with an artefact transformation.

## G. Polypad — manipulation before terminology

- Playground: https://mathigon.org/polypad
- Activities: https://mathigon.org/tasks
- Guide: https://static.mathigon.org/polypad.pdf

A mathematical canvas with manipulatives, direct dragging and lessons. Mathigon reports Polypad moved to Amplify; follow current product links. Free use is not source-code or artwork reuse permission.

Borrow the lesson and free-play continuity. A layer, glyph or mask can become a manipulable teaching object. Keep that toy view labelled: moving a symbolic tile is not proof a PDF engine performed the corresponding action.

## H. LOOPY — example -> play -> remix

- Try: https://ncase.me/loopy/
- Editor: https://ncase.me/loopy/v1.1/

Draw circles/arrows, simulate, remix. The author describes it as open source/public domain; inspect the actual source before importing. The Remix action creates a copy rather than changing the original.

Borrow a strong specimen-to-fork loop. 'Make your own' should preserve the authored original and carry a starting recipe. Do not force document internals into a causal-loop model or hide all complexity behind an explanatory animation.

## I. Polypane — coordinated comparisons

- Product: https://polypane.app/
- Portal: https://polypane.app/docs/portal/
- Sync limitations: https://polypane.app/docs/website-issues-you-could-encounter/

Synchronised views support shared navigation/interaction. Ordinary panes use Chromium; different viewport/browser emulation is not an independent rendering engine. Portal can connect actual external browsers. Commercial product reference, not proposed source dependency.

Borrow linked page/zoom/region and one action across comparison panes. Make unlink/pin visible. Do not sync dangerous actions or assume identical selectable text/DOM. Each pane must identify real engine and representation, not show decorative logos.

## J. Supporting patterns

- DevTools inspect + resolved properties: https://developer.chrome.com/docs/devtools/elements and https://developer.chrome.com/docs/devtools/css/reference
- JupyterLab document workspaces: https://jupyterlab.readthedocs.io/en/stable/user/interface.html
- Bret Victor, Learnable Programming: https://worrydream.com/LearnableProgramming/
- Small expandable-value inspector: https://github.com/observablehq/inspector

Borrow selection continuity, persistent working context, state visibility and small expandable data views. Do not adopt notebook execution ambiguity, unlimited panes or an opaque inspector as the product's whole UX.

## Synthesis: borrow relationships, not skins

RenderDoc for visual evidence; CyberChef for recipe transparency; Blender for intermediate-state inspection; Python Tutor for stepping; ImHex for byte correspondence; OpenRefine for history/export; Polypad and LOOPY for learning/remixing; Polypane for coordinated comparison.

Do not copy all shells. Build one coherent stage + inspector + bench. Keep playful first contact, technical depth and evidence connected to one specimen.

## Next design study

Storyboard Encounter, Inspect, Change and Compare as four concrete screen states. Use real existing specimen output and explicitly labelled unimplemented controls. Test whether a new visitor can produce and explain one derivative. Only then choose pane/layout libraries or build a component catalogue.
