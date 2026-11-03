# Codex task: port the .phf Commons «Aurora» mock to TanStack Start

Repo: `blackmath88/baselhack26-open-presence` · target: `apps/commons`
Branch: `feat/commons-aurora` (own worktree, from current `main`)

## Context
`.phf Commons` gets a new visual and interaction shell. The owner approved the static mock in
`reference/commons-mock.html` (open it in a browser; screenshots in `reference/screens/`).
It is a dark, premium operations console. Its vibe is inspired by Cisco Cloud Control, but the
colours, wording and identity are our own («Aurora»: glacier turquoise → indigo). Use no Cisco
names, logos or assets.

The mock is the spec. Rebuild it faithfully as a TanStack Start app. Do not redesign it.

## Package contents
- `reference/commons-mock.html`: the approved mock (single file, includes a small JS view switcher)
- `reference/screens/*.png`: desktop 1440×900 and mobile 390×844 captures at @2x
- `styles/tokens.css`: design tokens. **Copy verbatim** to `apps/commons/src/styles/tokens.css`.
- `styles/app.css`: reference CSS from the mock. Split it into component CSS; reference values only through tokens.
- `COMPONENTS.md`: component inventory, props and the mock selector each one comes from

## Step 0: inspect, then report before writing code
1. Read `apps/commons` and report what it is built on (TanStack Start? Vite + React? router?),
   which data/API modules exist (find / inspect / compare from PRs #35–#37), and where
   `src/styles/cloud-control.css` is used.
2. Decision rule:
   - **Already TanStack Start:** build the new shell inside `apps/commons`.
   - **Anything else:** scaffold TanStack Start v1 (official starter, React 19, TypeScript) in
     `apps/commons` on this branch. Keep existing data/API modules and move them over unchanged.
     Delete the old UI layer only after the new routes render.
3. Write the findings at the top of the PR description.

## Step 1: shell and tokens
- `tokens.css` copied verbatim and imported once at the root. Load Geist and Geist Mono via
  `@fontsource/geist` and `@fontsource/geist-mono` (no Google Fonts call at runtime).
- Background aurora and film grain on `body` exactly as in the mock.
- `AppShell`, `TopBar`, `ModeSwitch` and `AppLauncher` overlay (see COMPONENTS.md).
- Remove `cloud-control.css` and its imports.

## Step 2: routes and views
| Route | View | Aside content |
|---|---|---|
| `/` | Assistant (greeting, review count, composer, suggestions) | Thread list |
| `/canvas/$investigationId` | Canvas (header, evidence-card grid) | Conversation |
| `/actions` and `/actions/$actionId` | Review list and detail | Review list |

- The `ModeSwitch` navigates between these routes. The active mode comes from the route, not local state.
- **Context carries over:** "Im Canvas öffnen" on an action and submitting the composer both open
  `/canvas/$investigationId` for the *same* investigation. Reuse it, never create a duplicate.
- Clicking an underlined reference in the conversation highlights its card (gradient border)
  and scrolls it into view, as in the mock.
- Data: one typed `src/mock/commons.ts` holding all mock content, copied from the mock HTML (German text, verbatim).
  Where an existing API already returns real data (find/inspect/compare), wire it in and keep the mock as fallback.

## Step 3: evidence cards
`EvidenceCard` is a frame. Its body is one of: `EvidenceTable`, `StatTiles`, `LineChart`,
`ChainGraph`, `StackBar`. Use a small typed registry (`kind` → component). Charts are plain SVG
like in the mock; no chart library.

## Constraints
- Prototype quality: no extra abstraction layers, config systems, error boundaries, state libraries,
  Tailwind or shadcn. Plain CSS (one CSS file per component, or CSS modules) plus the tokens.
- All UI text in **German**, exactly as in the mock. Code, comments and the PR in English.
- No hard-coded colours outside `tokens.css`. In SVGs, use `var(--…)` or `currentColor`.
- Keep the gradient border technique (`.gb` in the mock) as a reusable class or prop.
- Accessibility: all icon buttons get German `aria-label`s; visible `:focus-visible` ring
  (gradient or accent); text contrast ≥ 4.5:1; `prefers-reduced-motion` disables transitions.

## Acceptance
1. `pnpm dev` (or the repo's runner) serves `/`, `/canvas/schwamm-zitat` and `/actions/zuschreibung-14`.
2. Playwright screenshots at 1440×900 and 390×844 match `reference/screens/` closely
   (layout, colours, type, spacing). Commit them to `docs/reports/commons-aurora/`.
3. No horizontal scroll at 390px. On mobile the assistant thread panel is hidden, like in the mock.
4. Mode switch, app launcher (open/close, Esc), reference → card highlight and action → canvas all work.
5. Typecheck and build pass.
6. Docs: in `docs/product/COMMONS-REFERENCE-ATLAS.md`, `COMMONS-EXPERIENCE-BLUEPRINT.md` and
   `COMMONS-CISCO-REFERENCE.md`, replace the old visual rules (light/cool-white surfaces,
   "no dashboard metrics", "Cisco as visual north star") with: *Visual source of truth =
   `apps/commons/src/styles/tokens.css` + the Aurora mock. Cisco Cloud Control remains an
   interaction reference only.*
7. Update `MODULES.md` and the Commons entry. One PR, small commits per step.

## Out of scope
Drag-and-drop canvas layout, real multiplayer/presence, auth, new backend endpoints.
