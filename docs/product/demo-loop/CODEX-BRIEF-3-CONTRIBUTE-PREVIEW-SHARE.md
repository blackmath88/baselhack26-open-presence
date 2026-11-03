# Codex brief 3 — passage → contribution → exact preview → shared room

Repo `blackmath88/baselhack26-open-presence` · base `feat/demo-2-photo-frame-canvas` · new branch `feat/demo-3-contribute` · own worktree. Read `README.md`, `PHF-EXPERIENCE.md` §2 card 5 and §3, `CONTEXT-BLOCK.md` §3 (outgoing), `SELECTION-MODEL.md`, `BRIDGE.md` §2.

## Goal

One contribution path: write in the canvas card „Eigene Beobachtung ergänzen“ → Prüfungen shows the server-prepared preview with attribution, destination and the context block → „In den geteilten Raum stellen“ → read back from the room with ways to find it again. No new backend endpoint.

## Step 0: inspect, report, then build

1. Read `server/commons/queries.ts` (`prepareContribution`, `PreparedContribution.destination`), `server/commons/service.ts` (`submitContribution`, idempotency), `src/lib/api.ts`, `src/commons/client/api.ts`, `src/state/useRoom.ts`.
2. Read PR 45 on `origin/feat/commons-phase-3-contribute`: `src/commons/client/outgoing.ts` and the preview rules in `Composer.tsx` (stale preview, request = preview, failure keeps text, read back from room). Port the rules, not the old screens.
3. Read `components/aurora/Actions.tsx` (mock review list and detail) and decide how a real Prüfung coexists with mock ones without changing the mock.
4. Report: the exact `prepare` and `submit` request bodies for a reply to passage e3 as Kai, and what the server returns.

## Build

1. **Composer in card 5** (`src/features/phf/Composer.tsx`): fields per PHF-EXPERIENCE §2 card 5; relation defaults to „Antwort auf diese Passage“ with `beleg` from the URL (`parentId: commons:usb-c-no-data:<beleg>`, `evidenceIds: [<beleg>]`); draft in `localStorage["commons.drafts.v1"]`; button „Vorschau und teilen“ calls `prepare` and navigates to `/actions/beitrag-<draftId>`.
2. **Real Prüfung** (`src/features/phf/ContributionReview.tsx`) rendered by `actions.$actionId.tsx` when the ID starts with `beitrag-`: sections Genau das verlässt deinen Browser · Zuschreibung (context block, outgoing shape) · Ziel (`destination.visibility`, `destination.publication` in German) · „Bleibt hier“ · footer with the one real action. Mock Prüfungen keep their local „Plan freigeben“.
3. **Rules from PR 45:** submit sends the prepared `command` unchanged plus `entrance: 'browser'`; an edited draft marks the preview stale and disables submit; network failure keeps the text and offers „Erneut versuchen“ with the same `commandId`; a 4xx shows the server's reason; after success read the contribution back from the room (not from the form) and show „Im Raum seit … · als Kai · Browser“, links „Im Canvas“ (`/canvas/bilderrahmen-mac?beitrag=<id>`), „Suche“ (`/find?query=<first words>`), and the CLI line `npm run commons -- inspect <id>`.
4. **Signed-in participant.** If no session exists, the Prüfung shows the existing prototype gate inline: „Prototyp-Anmeldung, keine echte Identität.“ with Kai / Lea. Reuse `ParticipantSwitcher` logic; new Aurora markup.
5. **Open Prüfungen list.** `/actions` lists real drafts and submitted contributions for `bilderrahmen-mac` under Offen / Erledigt, with source chip „Commons“, before the mock items.
6. **Card 3 and 4 update** after submit via the existing room read (`useRoom`), without reload.

## Constraints

German UI; the request body must equal the preview (intercept and assert); no draft text in URLs; no token changes; offline: card 5 says „Dienst nicht verbunden · Entwurf bleibt gespeichert“ and the preview button is disabled.

## Acceptance

1. Kai: card 5 → text and Bedingungen from PHF-EXPERIENCE §2 → Vorschau → Prüfung shows context block Wer Kai · Quelle genaue Passage e3 · Unterstützung ohne KI geschrieben → submit → read back; card 3 shows the entry „im Raum“, card 4 shows it under Antworten.
2. Playwright: intercepted submit body equals the prepared command; editing after preview disables submit; a simulated network failure keeps the text and a retry creates exactly one contribution (idempotent); reload of `/actions/beitrag-<id>` after submit shows the room state.
3. `npm run commons -- inspect <id>` from a terminal shows the contribution with `entrance: browser` and `evidenceIds: ["e3"]`.
4. Typecheck, build, tests, Aurora smoke, multi-entry smoke; captures `docs/reports/demo-loop/03-*.png`; zero axe A/AA violations on card 5 and the Prüfung.

## Out of scope

Second participant's reply UI (Brief 4), publication to ATProto, moderation UI, Observatory.
