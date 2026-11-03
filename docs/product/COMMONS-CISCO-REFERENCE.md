# Cisco Cloud Control: interaction reference for Commons

Updated 3 November 2026 for the Aurora port. The earlier Phase 0 sampled colours and `cloud-control.css` are historical and no longer apply.

Visual source of truth = `apps/commons/src/styles/tokens.css` + the Aurora mock (`commons-aurora-port/reference/commons-mock.html`). Cisco Cloud Control remains an interaction reference only.

## What carries forward

Overview-to-detail navigation, a route-driven mode switch, pinned tools, a searchable app launcher, conversation references linked to evidence and review-to-canvas continuity remain useful interaction references.

The appearance comes from the supplied Aurora mock: dark surfaces, a glacier-turquoise-to-indigo aurora, film grain, local Geist fonts, gradient borders, evidence statistics and SVG charts. Rebuild that reference faithfully. Do not copy Cisco names, logos, assets, colours or typography.

## Historical research sources

The earlier study used [Cisco Cloud Control overview](https://cloud.cisco.com/docs/en/cisco-cloud-control-overview/cisco-cloud-control-overview.html), its [assistant screen](https://cloud.cisco.com/docs/en/_images/c3-home-screen.jpg), [launcher screen](https://cloud.cisco.com/docs/en/_images/c3-app-launcher-screen.jpg) and [help menu](https://cloud.cisco.com/docs/en/_images/help-menu.jpg). These remain linked research, not bundled assets or the visual acceptance target.

## Implementation references

- Base tokens: `apps/commons/src/styles/tokens.css` (verbatim supplied file).
- Additional values already present in the approved mock: `apps/commons/src/styles/supplemental/tokens.css`.
- Components and CSS: `apps/commons/src/components/aurora/`.
- Mock, inventory and reference captures: `commons-aurora-port/`.
- Verification: `docs/reports/commons-aurora/`.

The prior `?look=classic` / `?theme=light` visual toggles have been retired with the old skin.
