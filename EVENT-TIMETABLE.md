# BaselHack 2026 — event timetable

Event: **Friday 30 October–Sunday 1 November 2026**, Europe/Zurich (UTC+01:00).

Source: event programme supplied by Achim in this project conversation on 31 October. Transcribed here for planning; not independently checked with the organisers. Approximate and “after” times retain their qualifiers.

**Hard boundary from the supplied timetable: Sunday 1 November, 12:00 — Hands off!** Presentations begin at 13:00. The submission/upload process and each team's individual pitch slot are not specified.

| Day / date | Local time | Event | Location |
| --- | --- | --- | --- |
| Friday 2026-10-30 | 17:00 | Get-In / Registration | Entrance Location @Memox Basel SBB |
| Friday 2026-10-30 | 18:00 | Opening Presentation, Pitch Presentation | Presentation Room |
| Friday 2026-10-30 | 18:45 | Challenge pitches | Presentation Room |
| Friday 2026-10-30 | 19:45 | Teambuilding + Dinner | Lobby / Foyer |
| Friday 2026-10-30 | > 20:30 | Teambuilding End + Start Hacking | Assigned Team Rooms |
| Friday 2026-10-30 | ~ 21:00 | Drinks + Snacks | Lobby / Foyer |
| Saturday 2026-10-31 | 08:00–09:00 | Breakfast | Foyer / Lobby |
| Saturday 2026-10-31 | 12:00–13:00 | Lunch | Lobby / Foyer |
| Saturday 2026-10-31 | 18:00–19:30 | Dinner | Lobby / Foyer |
| Saturday 2026-11-01 | 00:00 | Voluntary "Midnight-Pushups" (: | Presentation Room |
| Sunday 2026-11-01 | 08:00–09:00 | Breakfast | Lobby / Foyer |
| Sunday 2026-11-01 | 12:00 | Hands off! | Assigned Team Rooms |
| Sunday 2026-11-01 | 12:00–13:00 | Lunch | Lobby / Foyer |
| Sunday 2026-11-01 | 13:00 | Pitching Info + Presentations | Main Presentation Room |
| Sunday 2026-11-01 | ~ 15:15 | Group Photo | Lobby / Foyer |
| Sunday 2026-11-01 | 15:30 | Awarding | Lobby / Foyer |
| Sunday 2026-11-01 | 16:00 | Event End / Networking | Entrance |

## Time interpretation

- Friday “> 20:30” means hacking begins after 20:30; it is not an exact start.
- Drinks/snacks (~21:00) and the group photo (~15:15) are approximate.
- “00:00” appears under Saturday. The machine-readable record provisionally interprets this as the end of Saturday (Sunday 1 November 00:00) and includes a diagnostic. This is an assumption, not an organiser-confirmed date.
- Meal intervals are known ranges. No end times are invented for other events.
- Internal work targets remain proposals in [.observstory/coordination.json](.observstory/coordination.json). The former Sunday 13:00 feature freeze and 15:00 rehearsal were incompatible with noon hands-off and are superseded by earlier proposed targets in [HACKATHON-PLAN.md](HACKATHON-PLAN.md).

## Data and implementation

- Source: [.observstory/event.json](.observstory/event.json), `observstory.event-schedule/v0`, an experimental companion contract.
- Publishing: the existing workflow copies the same bytes to `data/event.json` beside the Observatory snapshot and knowledge artifact.
- Current UI limitation: publishing this feed does not itself build a timetable/task interface. Claude's existing Observstory redesign should consume it alongside knowledge, coordination and observed GitHub activity.
- New information is deliberately limited to the supplied programme and the project-view requirement. No task owner, completion, submission or approval is inferred.
