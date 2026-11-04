# Component inventory: PDF Lab «Werkbank»

Source = selector or id in `reference/pdf-lab-mock.html`. Reuse = what to take from `sideprojects/pdf-lab/workbench/`.
Shared Aurora parts (TopBar, Button, Chip, Badge, gradient border `.gb`, Avatar) already exist in `apps/commons`.

## Frame
| Component | Source | Data / props | Reuse |
|---|---|---|---|
| `WorkbenchLayout` | `.wb` grid | `focus` (URL) collapses side panels | — |
| `ToolRail` | `.rail`, `.tool` | active tool; tooltips with shortcut; chat dock button with dot | — |
| `SpecimenPanel` | `.lp` → Proben | `specimens[] {id, name, file, pages, status: gemessen\|nicht gemessen}` | specimen list |
| `ReaderPicker` | Leser box | `readers[] {id, name, version, measured}` | engine adapters |
| `ExplainerBox` | "Was ist hier anders?" | static German text | — |

## Stage
| Component | Source | Data / props | Reuse |
|---|---|---|---|
| `StageBar` | `.stagebar` | view (`seite\|text\|zeichen\|struktur`), `durchsicht` 0–100 | — |
| `Sheet` | `.sheetwrap`, `.sheet` | specimen, page rendering, line boxes, label + status badge, zoom | stage / page renderer |
| `PageView` (Seite) | `.drawn` + `.read` | drawn rendering + extracted lines placed on the line boxes; overlay opacity = durchsicht | stage |
| `TextView` | `.textsheet` | extracted lines; diff words (`mark`) against drawn text | extraction results |
| `GlyphView` (Zeichen) | `.g`, `.g.diff`, `.codes` | glyph boxes, glyph IDs, mapping; hover tooltip; code line under the selected line | inspector data |
| `StructureView` | `.tree` | Seite → Schrift (ToUnicode) → Textblock → Zeilen → Glyphen | inspector data |
| `CompareStage` | `.cmp` + `.readstrip` | two specimens or two readers, synced selection | comparison |
| `FloatingToolbar` | `.floatbar` | reveal (primary, R), compare (V), zoom −/+, reset | — |

## Inspector & recipe
| Component | Source | Data / props | Reuse |
|---|---|---|---|
| `LineInspector` | `#chain`, `.step` | selected line: drawn, glyph IDs of the differing word, mapping rows, read; `Rohdaten` details | inspector |
| `MappingTable` | `.map` | rows `{glyph, looksLike, readAs}` for the differing word only | ToUnicode data |
| `RecipeEditor` | `#recipe` | 4 line inputs → writer → new specimen "Meine Lesart" | narrow PDF writer |
| `Toast` | `#toast` | "meine-lesart.pdf erzeugt · noch nicht gemessen" | — |

## Evidence, dock, bridge
| Component | Source | Data / props | Reuse |
|---|---|---|---|
| `EvidenceStrip` | `.foot` | `measured` → reader · version · run date · file; else "Neu erzeugt · nicht gemessen" + reference file; links Original / Beleg | run records |
| `AssistantDock` | `#dock` | guided first message + reveal action | — |
| `BridgeOverlay` | `#bridge` | question, short text, back + "Zur menschlichen Erfahrung" → Commons canvas | — |

## Selection model
One selection drives the stage, the comparison, the inspector and the code line:
`{ probe, ansicht, zeile, durchsicht, vergleich, fokus }`, read from and written to the URL search params.
