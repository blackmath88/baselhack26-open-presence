# Opus Canvas — infinite canvas with rendered Explorer windows (FoldKit prototype)

A standalone [FoldKit](https://foldkit.dev) (Effect-based, Elm-architecture TypeScript
framework) prototype of the spatial "infinite canvas" Scott Tolinski showed on the latest
Syntax episodes while talking about how frontier agents such as Claude Opus 5.5 / 5.1 work:
instead of a single chat window, the agent's workspace is a canvas where each Explorer
(Finder-style) window it opens is rendered as a draggable card.

## What this is

- An infinite, pannable/zoomable 2D canvas (dot grid follows the camera).
- Explorer-style windows rendered on it: traffic lights, titlebar with path, Favorites
  sidebar, file list, status bar. Click a folder to navigate that window; click a file to
  log it; the red light closes the window; clicking a window raises it (z-order).
- **Run agent task** simulates an Opus-style run: a `Command` (Effect) walks a short task
  list with delays and spawns one Explorer window per step, logging each action — the
  "agent opens Explorer windows on the canvas" pattern from the podcast.

## Run it

```bash
cd sideprojects/infinite-canvas
npm install
npm run dev        # http://localhost:5173
npm test           # vitest: update unit tests + foldkit/scene DOM tests
npm run typecheck  # tsc --noEmit
npm run build      # vite build
```

Controls: drag background to pan · drag a titlebar to move a window · `+` / `-` / `0` zoom
(buttons too) · click a window to raise it · `+ Explorer window` spawns one at the viewport
center · `▶ Run agent task` runs the simulated agent.

## Architecture (one Model, one update, one view)

`src/main.ts` is a complete FoldKit program, importable without booting a runtime:

- `Model` — `Schema.Struct` with `camera {x, y, zoom}`, `windows[]`, `nextId`/`nextZ`,
  optional `drag` state, `log[]`, `agentRunning`.
- `Message` — `defineMessageUnion` of pointer/zoom/click/agent facts.
- `update` — exhaustive `Message.match`; pan/zoom math lives here (window drags are
  divided by `zoom`; zoom keeps the pointer center fixed and clamps to 0.25–4).
- `RunAgentStep` — `Command.define` whose `execute` is an `Effect` (`Effect.sleep` between
  steps) returning the next `AgentSpawnedExplorer` message; `update` chains the next step.
- `view` — `HtmlBuilder` tree; the world is a transformed container
  (`translate(...) scale(...)`), windows are absolutely positioned divs with
  `data-window` / `data-titlebar` attributes that the root pointer handler inspects.
- `src/entry.ts` boots `Runtime.makeApplication` separately, so tests import `main.ts`
  without side effects.

## Why FoldKit (yes, not "no")

FoldKit is a real, current framework — a TypeScript frontend framework built on
[Effect](https://effect.website), architected like Elm (foldkit.dev, npm `foldkit` 0.171).
It was also literally discussed on Syntax: in **#1056 "Convince us that Effect.ts is
good"** Michael Arnaldi (Effect) talked about Effect v4, guardrails for AI-written code,
and FoldKit. For this prototype it fits well: one Schema-defined Model, exhaustive
`update`, and named `Command`s for the timed agent run — the agent-spawns-windows sequence
is a plain Effect, which is exactly the "how Opus's harness works" mental model. Its
built-in `Canvas`/pointer-event support and `foldkit/scene` DOM tests made the prototype
fast to build and verify.

## Research notes — what Scott showed and who builds what

- Latest Syntax episodes: **#1058 "Can we still be proud of what we build?"** (potluck:
  design taste, pruning global skills, sandboxing agents with devvm, **Conductor —
  AI coding workspaces compared**, Opus 5.5 mentioned re: visual/animation output) and
  **#1056 "Convince us that Effect.ts is good"** with Michael Arnaldi (Effect v4, FoldKit).
- Scott Tolinski's own spatial/agent tooling around this idea: `stolinski/gfx-computer`
  ([gfx.computer](https://gfx.computer) — a canvas where a person authors in the GUI and an
  agent authors through WebMCP on the same visible composition), `stolinski/gpui-agent`
  (agent-driven GPUI testing), and the GPUI "Space" macOS window manager he demoed in
  **#1043 "I'm Using GPUI For Everything"**; workspace managers like
  [Conductor](https://conductor.build) are the "many agent workspaces as windows" pattern
  he compared in #1058.
- The pattern this prototype implements: an agent harness whose environment is an
  infinite canvas, where each tool action (here: opening a folder) renders as a window on
  the canvas — a spatial alternative to a linear chat transcript.

## Scope

Prototype only: static in-memory file system, single player, no persistence, no real model
calls. The `▶ Run agent task` button is a scripted stand-in for an Opus 5.x run.
