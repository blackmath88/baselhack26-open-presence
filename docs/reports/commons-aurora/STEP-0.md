# Step 0 — baseline inspection

Inspected main at `1077ce9` before writing application code, 3 November 2026.

- Stack: React 19.1, TypeScript 5.8, Vite 7.1; npm/package-lock. This is not TanStack Start. `src/main.tsx` mounts `App.tsx`; `src/commons/client/router.ts` is a custom hash router.
- PR #35 supplied the Cloud Control skin. #36 added find/inspect context through `matchBasis.ts`; #37 added deterministic `comparison.ts`. Neither changed backend/data/API contracts.
- `src/commons/reader.ts`, `retrieval/` and `source/` read the committed corpus and its BM25F index. `client/matchBasis.ts` explains real matches; `client/comparison.ts` compares reported fields. These modules stay unchanged.
- `src/commons/client/api.ts` exposes search, problem inspection, repository, context, contributions, threads, publication and moderation. `src/lib/api.ts`, `state/useRoom.ts`, server/domain/application/persistence and worker implement the existing session and backend. The Aurora shell reuses reads; no new backend endpoints or auth are in scope.
- `src/styles/cloud-control.css` has one runtime import, in `src/main.tsx`, after `src/styles.css`. It is scoped with `data-look="cloud"` and `data-theme`; query switches select classic/light. Old layout CSS also mentions it in a comment. Remove the skin and import after Start routes render.
- Decision: migrate to TanStack Start v1 using the official `examples/react/start-basic` structure, React 19 and file routes. Preserve data/API modules; replace the old UI after verifying route rendering. Retain the separately built e companion and preview unchanged.
- The context packet `cp_7cdc6f026054f6d6650d202f` cuts off at `93a5445150d0`, before the inspected main. Its accepted project direction is historical context, not authority to override this requested visual port.

Visual source: `commons-aurora-port/reference/commons-mock.html` and supplied captures. German mock text, exact base tokens, local Geist fonts. Cisco Cloud Control is an interaction reference only.
