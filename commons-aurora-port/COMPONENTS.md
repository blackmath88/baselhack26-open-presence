# Component inventory: Commons «Aurora»

Source = selector in `reference/commons-mock.html`. Props are guidance; keep them minimal.

## Primitives
| Component | Source | Props |
|---|---|---|
| `Icon` | `<symbol id="i-*">` sprite | `name`, `size=16` (port the sprite as-is) |
| `Button` | `.btn`, `.btn-acc`, `.btn-ghost-acc` | `variant: 'default' \| 'primary' \| 'ghost-accent'`, `icon?` |
| `Chip` | `.chip` | `children` (source label, e.g. "PDF Lab") |
| `Badge` | `.badge .b-*` | `tone: 'ok' \| 'warn' \| 'crit' \| 'violet' \| 'accent'` |
| `Severity` | `.sev`, `.sev.w` | `level: 'crit' \| 'warn'` |
| `Avatar` / `AvatarStack` | `.av`, `.avatars` | `initials`, `tone` / `people[]` |
| gradient border | `.gb` + `--gb-fill` | class or `highlighted` prop: active tab, selected action, highlighted card, ghost button |

## Shell
| Component | Source | Notes |
|---|---|---|
| `AppShell` | `.topbar` + `.app` grid | aside 328px + main; single column under 760px |
| `TopBar` | `.topbar` | Brand, `WorkspaceSwitcher` (`.ws`), app-grid button, `PinnedTabs` (`.tab`, active = `.gb`), utility icons with notification dot |
| `ModeSwitch` | `.modes` | Assistent / Canvas / Prüfungen; route-driven; unread dot on Prüfungen |
| `AsidePanel` | `.panel` | scroll container for the aside content of each view |
| `AppLauncher` | `.overlay` | search field (⌘K), 4 columns: Plattform, Werkzeuge, Sammlungen, Favoriten; Esc closes |

## Assistant
| Component | Source | Props |
|---|---|---|
| `ThreadList` | `.navitem`, `.label`, `.thread` | `threads[] {id, title, hasCanvas, hasAction}` |
| `Hero` | `.hero` | `name`, `pendingReviews` |
| `Composer` | `.composer` | `placeholder`, `mode` ("Standard"), `onSubmit`; gradient border on focus; `/` `#` `@` hints |
| `SuggestionGrid` | `.sugg` | `items[]` |

## Canvas
| Component | Source | Props |
|---|---|---|
| `Conversation` | `.msg`, `.ref`, `.mini-comp` | `messages[]`; refs carry `cardId` → highlight + scroll |
| `CanvasHeader` | `.canvas-head` | `title`, `shared`, `participants[]` |
| `EvidenceCard` | `.card`, `.card-h` | `id`, `title`, `source` (Chip), `badge?`, `span: 4\|6\|8\|12`, `highlighted`, `kind` + `data` |
| `EvidenceTable` | card `#c-origin` | `columns[]`, `rows[]`; first column mono |
| `StatTiles` | `.tiles` | `items[] {value, label}`; values mono |
| `LineChart` | card `#c-timeline` | two series, area fill under the primary series, marker + tooltip, legend; plain SVG |
| `ChainGraph` | card `#c-graph` | `nodes[]`, `edges[]` (dashed = disputed) |
| `StackBar` | `.stack` + `.legend` | `segments[] {label, value, tone}` |

## Reviews (Prüfungen)
| Component | Source | Props |
|---|---|---|
| `ActionList` | `.subtabs`, `.filters`, `.act` | `actions[]`, `selectedId`; tabs Offen / Erledigt / Verworfen |
| `ActionDetail` | `.detail` | header with Verwerfen / "Im Canvas öffnen", meta row, assessment |
| `SignalTable` | "Zugehörige Signale" card | `signals[] {source, type, text, time}` |
| `ReviewPlan` | `.plan` | `steps[] {title, text}` |
| `ApprovalBar` | `.approve` | "Nichts wird ohne deine Freigabe geändert." · Plan anpassen / Plan freigeben |
