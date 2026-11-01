# PDF Workbench — supplied research and design direction
1 November 2026 · Source: research and execution-plan text supplied by Achim; condensed and mapped by ChatGPT / Codex (assistant).
Status: research input and design brief. This is a deduplicated synthesis of the two supplied roadmap versions, not a verbatim archive or independent verification of every referenced product.

## User-requested direction
Build modularly from the existing PDF LAB product, with durable foundations for deeper analysis and more functionality. Use a TanStack Start application shell. Move away from desktop-style collections of windows toward a clean, modern, subtly transparent workspace inspired by Cisco Cloud Control. Keep the document central and reveal technical depth in context.

The supplied research's thesis: a modern document-centred laboratory, approachable on the surface and progressively deeper underneath. Encounter → inspect → change → run → compare → keep. The creative question remains: how far can a document bend before it becomes something else?

## Experience
One stable navigation shell and a dominant document stage. Context opens for a selection; recipe controls open for authoring; comparison divides the stage. The experiment bench is a responsibility, not a permanently visible bottom pane. No floating utility windows, mandatory node editor or sprawling panel dashboard.

Three entrances share the same workspace: explore a strange specimen, inspect an owned PDF, build a weird PDF. The first delivery uses curated specimens; imports come after the execution boundary is implemented.

Visual material: cool near-white canvas, white and pale blue-grey surfaces, dark ink, restrained teal/blue selection, fine borders, modest radii, generous grouping. Translucency belongs in navigation chrome, never under the PDF or evidence. Motion explains state changes. Transparency also means identifying where work ran and what remains unknown.

## Foundation and sequencing
TanStack Start / React / strict TypeScript / Vite is the shell, not a PDF engine. Existing Python generators, narrow browser generation and recorded evidence should be reused. Stable concepts are immutable artefact, specimen, recipe, variant, instrument, run, observation, interpretation, correspondence and transition.

Separate view state (selection, zoom, panels) from research state (variants, runs, findings). Version persisted contracts. An engine adapter must describe capability and limits. A previous run is historical evidence, not a measurement made by opening the UI.

Requested roadmap: consolidate → encounter → inspect → bend → compare → bring your own → keep/journey → extend instruments. Each is a complete user capability, not a framework migration. Initial scope is encounter and inspection over existing two-poem/one-letter material.

## Reference atlas mapped to behaviour
| Reference | Transfer | Phase |
| --- | --- | --- |
| Cisco Cloud Control inventory | Stable collection-to-detail navigation without losing place | All |
| LOOPY; Polypad; PhET | Example → play → remix; change one thing and observe | 1–3 |
| RenderDoc; Spector.js | Trace output to operations/resources | 2 |
| AST Explorer; ImHex | Explicit selection-to-structure correspondence | 2 |
| Blender Geometry Nodes | Inspect intermediate representations and stale/evaluated state | 2–4 |
| Python Tutor | Step through state; distinguish simulation from real execution | Later recipes |
| CyberChef | Explicit reusable recipe and intermediate output | 3 |
| Compiler Explorer; Polypane | Named interpretations and linked comparisons | 4 |
| OpenRefine | Reusable operation history/export, retaining our immutable alternatives | 6 |
| Playwright Trace Viewer | Recorded before/after evidence | 6 |

These are behavioural references, not dependencies or licence clearance. Do not copy proprietary branding or assume the look of an authenticated product was audited.

## Source ledger
Independently read in this planning pass:
- TanStack Start React overview: https://tanstack.com/start/latest/docs/framework/react/overview — confirms React framework, Router, server functions/routes and Vite support. Implementation must pin actual compatible versions.
- Cisco inventory: https://www.cisco.com/c/en/us/td/docs/ai/cisco-cloud-control/articles/cisco-cloud-control-inventory.html — supports collection-to-selected-asset detail. The proposed palette and geometry are our design choices.

Supplied implementation references; validate relevant details when used:
- https://tanstack.com/start/latest/docs/framework/react/build-from-scratch
- https://tanstack.com/start/latest/docs/framework/react/guide/server-functions
- https://tanstack.com/start/latest/docs/framework/react/guide/server-routes
- https://tanstack.com/start/latest/docs/framework/react/guide/hosting
- https://www.cisco.com/c/en/us/td/docs/ai/cisco-cloud-control/release-notes/cisco-cloud-control-release-notes.html
- https://ncase.me/loopy/
- https://phet.colorado.edu/en/simulations/circuit-construction-kit-dc-virtual-lab
- https://github.com/baldurk/renderdoc
- https://github.com/BabylonJS/Spector.js/
- https://github.com/fkling/astexplorer
- https://github.com/gchq/CyberChef
- https://github.com/compiler-explorer/compiler-explorer
- https://playwright.dev/docs/trace-viewer

The supplied bibliography also included Cisco Security Cloud Control, marketing/news, Solid docs, framework hosting vendors and third-party TanStack guides. Those are not evidence of this React application's behaviour or Cisco Cloud Control's exact design. They do not become implementation requirements. PR #26 retains the fuller earlier reference atlas: https://github.com/blackmath88/baselhack26-open-presence/pull/26

## Mapping to the repository
The executable plan is [WORKBENCH-BUILD.md](../WORKBENCH-BUILD.md); the worker entry point is [CLAUDE-WORKBENCH.md](../CLAUDE-WORKBENCH.md).
The existing [creative plan](../PLAN.md) and [format-bending direction](../FORMAT-BENDING.md) remain the content vision. This addition supplies a modular application delivery sequence.
