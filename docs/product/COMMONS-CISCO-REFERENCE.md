# Cisco Cloud Control: visual reference for Commons

1 November 2026 · Claude (assistant) · Reference notes for the owner-chosen visual north star; not Cisco material and
not a claim to Cisco's tokens. Used by `apps/commons/src/styles/cloud-control.css`.

## Sources (public, unauthenticated)
Cisco's own documentation, [Cisco Cloud Control overview](https://cloud.cisco.com/docs/en/cisco-cloud-control-overview/cisco-cloud-control-overview.html),
shows the product UI in these screenshots:
- Home with the Assistant: https://cloud.cisco.com/docs/en/_images/c3-home-screen.jpg
- Main menu / app launcher: https://cloud.cisco.com/docs/en/_images/c3-app-launcher-screen.jpg
- Help menu: https://cloud.cisco.com/docs/en/_images/help-menu.jpg

The images are **linked, not committed**: this repository is public and the screenshots are Cisco's copyrighted
material. Open the links to compare. The Start Kit design contract
([blackmath88/start-kit docs/DESIGN.md](https://github.com/blackmath88/start-kit/blob/main/docs/DESIGN.md)) is the
owner's earlier written teardown of the same product.

## What the reference shows
- **Dark by default.** Near-black canvas with a faint violet glow toward the lower edge; no visible light theme in the
  public screenshots ("display preferences" exist in user settings).
- **Top bar** on the canvas colour: wordmark + product name, a divider, tenant switcher, app-launcher grid, then pinned
  destinations as **outlined pills** (8 px radius, icon + label); the current one has a **blue-to-violet gradient
  edge**. Help, notifications and profile icons at the right.
- **Segmented control** (Assistant / Canvas / Actions) inside a raised rounded container; the selected segment is a
  lighter filled surface, not an accent colour.
- **Raised side panel** (threads list) with ~12 px radius; list rows are plain text with small trailing icons; section
  labels ("Previous") in muted grey.
- **Prompt field**: large, 12 px radius, light grey border noticeably brighter than other borders.
- **Primary call to action** ("Review actions") is an **outlined blue button** with blue text, not a solid fill.
- **Suggestion tiles** and launcher items: dark fill, thin grey borders, 6–8 px radius, white text; generous spacing.
- Type is a neutral grotesque (similar to Inter) with regular-weight large headings; restrained use of colour beyond
  the blue accent and status dots.

## Approximate sampled values
Sampled with ImageMagick from the JPEG screenshots above (compression and anti-aliasing make these ±a few units).

| Role | Sampled | Used token |
| --- | --- | --- |
| Canvas | #0C1117 | `--cc-canvas` #0C1117 |
| Lower-edge glow | #2F2152 – #341E4F | `--cc-glow` rgba(88,44,150,.30) radial |
| Raised panel / segmented container | #181D23 | `--cc-raised` #181D23 |
| Selected segment | #31343B | `--cc-selected` #31343B |
| Tile border | #393B48 | `--cc-border-strong` #393B48 |
| Prompt border | #707682 | `--cc-input-border` #707682 |
| Muted label ("Previous") | #90959B | `--cc-text-2` #A2A8B0 (raised for contrast on panels) |
| Outlined primary button border | #729CEE | `--cc-accent` #729CEE, text #8DB0F2 |

Not taken: Cisco logo, wordmark, product names, icons, fonts, the AI Canvas/Assistant features, tenant chrome, the
multi-product navigation. Commons keeps its own identity (.phf / Photo Frame Commons) and its own navigation.
