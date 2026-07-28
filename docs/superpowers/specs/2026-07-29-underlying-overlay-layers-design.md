# Underlying / Overlay Layers Design

**Date:** 2026-07-29  
**Status:** Approved — plan at `docs/superpowers/plans/2026-07-29-underlying-overlay-layers.md`  
**Packages:** `fest/lure` (`lur.e`), `fest/fl-ui` (`fl.ui`), related demos

## Problem

Backdrop blur, box-shadow, and under-glow often cannot live on the same element as the painted surface (filter/stacking/overflow clipping). Custom scrollbars likewise need a sibling above a scrollable main element. We need a first-class **underlying** / **overlaying** layer pair: adjacent DOM siblings, anchored to the main element, with controlled stacking.

## Goals

1. Symmetric JS API for inserting a layer sibling before (underlying) or after (overlaying) a main element.
2. Hybrid stacking: default `z-index = main ± 1`, optional equal z-index when DOM order alone is enough.
3. Reuse existing anchor / shape-clone / scrollbar machinery.
4. SCSS mixins in fl.ui for the visual contracts.
5. Demo both primary scenarios (glass+underlying, scrollable+overlay scrollbars).

## Non-goals

- Full matrix playground of every shadow/shape/stackMode combination.
- New LayerHost abstraction that owns under/main/over as a single component tree.
- Rewriting ScrollBar interaction logic beyond wiring it through the overlay layer API.

## Decisions (locked)

| Topic | Choice |
|---|---|
| API home | Generalize `lur.e/design/layers/` (option A) |
| Stacking | Hybrid `stackMode: "shift" \| "order-equal"` (option C); default `"shift"` |
| First demos | Glass card + underlying glow; scroll panel + overlay scrollbars (option A) |
| Approach | Symmetric layer pair; `UnderlyingShadow` / ScrollBar as consumers |

## DOM contracts

### Underlying (backdrop / glow / shadow)

```
[Parent]
|- [Sibling…]
|- [Underlying]  // insertBefore(main); filters/blur/box-shadow; overflow visible
|  |- [Shaped]   // clip-path / mask / radius / background-clip synced from main
|- [Main]        // e.g. backdrop-filter
|- [Sibling…]
```

### Overlaying (e.g. scrollbars)

```
[Parent]
|- [Sibling…]
|- [Main]                 // overflow auto/scroll
|- [Overlay]              // insertAfter(main); hosts chrome
|  |- [Scrollbar-x]
|  |- [Scrollbar-y]
|- [Sibling…]
```

## JS API (`lur.e/design/layers/`)

### Core

```ts
type LayerRole = "underlying" | "overlaying";
type StackMode = "shift" | "order-equal";

interface AppendAsLayerOptions {
  role: LayerRole;
  stackMode?: StackMode;      // default: "shift"
  zIndexShift?: number;       // default: -1 underlying / +1 overlaying; ignored when order-equal
  placement?: "fill" | "bottom" | "top" | "left" | "right" | "center" | "scrollbar-x" | "scrollbar-y";
  inset?: number;
  size?: string;
  useIntersection?: boolean;
  root?: HTMLElement | Window;
}

appendAsLayer(main, layer, options): HTMLElement | void;
appendAsUnderlying(main, layer, options?): …;  // role: underlying
appendAsOverlay(main, layer, options?): …;     // role: overlaying (compat wrapper)
```

### Stacking resolution

1. Read computed/`style.zIndex` of main (fallback `0` when `auto` and shift is needed).
2. `stackMode: "shift"` → layer `zIndex = mainZ + signedShift` (default −1 / +1).
3. `stackMode: "order-equal"` → layer `zIndex = mainZ` (or leave unset if main is `auto`); DOM order decides paint order.

### Registration (DOMMixin)

- Generalize `Register.ts` so both roles share one registrar:
  - `registerLayerElement(name, construct, { role })`
  - `registerUnderlyingElement(name, construct)`
  - `registerOverlayElement(name, construct)` — keep existing export signature
- On connect: construct layer, call `appendAsUnderlying` / `appendAsOverlay`, WeakMap de-dupe.

### Consumers

- **UnderlyingShadow:** attach via `appendAsUnderlying`; keep geometry clone (border-radius, clip-path, mask, transform, background) and filter/box-shadow modes; export from `fest/lure`.
- **Overlay scrollbars:** overlay container after main; children scrollbar-x/y via existing ScrollBar + anchor placements (`scrollbar-x` / `scrollbar-y`). Prefer sibling-of-main overlay (not `document.body`) for the demo path.

### Lifecycle

- Insert when main is connected; remove layer when main disconnects (`observeDisconnect`).
- Pointer-events: underlying default `none`; overlay chrome may opt into hit-testing (scrollbars).

## SCSS (`fl.ui`)

Add mixins (library or `_shared-overlays.scss` / new `_layers.scss`):

- `@mixin underlying-layer` — absolute/anchor fill, `pointer-events: none`, `overflow: visible`, stacking hooks.
- `@mixin overlaying-layer` — absolute/anchor fill, stacking hooks; optional pointer-events for chrome.
- `@mixin shaped-from-main` — placeholder for radius/clip/mask vars synced by JS.
- Utility classes for demos: `.c-underlying`, `.c-overlaying`, `.c-underlying__shaped`.

Wire into styles index if needed so demos can import them.

## Demos

### fl.ui — suite `layers` (`?suite=layers`)

1. **Glass + underlying:** card with `backdrop-filter`; underlying sibling with blur/glow shaped to the card.
2. **Scroll + overlay scrollbars:** overflow scroll content; overlay sibling with x/y scrollbars bound to main.

Register suite in `test/playground.ts` + nav buttons in `index.html` / `demo.html`.

### lur.e

Short block in existing demo/test entry showing `appendAsUnderlying` + `appendAsOverlay` smoke usage (or a tiny suite if the test harness already supports suites).

## Files (expected touch list)

| Path | Change |
|---|---|
| `lur.e/src/design/layers/AnchorOverlay.ts` | Generalize to `appendAsLayer`; keep `appendAsOverlay` |
| `lur.e/src/design/layers/AnchorUnderlying.ts` (new) or same file | `appendAsUnderlying` |
| `lur.e/src/design/layers/Register.ts` | Role-aware registration |
| `lur.e/src/design/layers/UnderlyingShadow.ts` | Use appendAsUnderlying; export-ready |
| `lur.e/src/index.ts` | Export UnderlyingShadow + layer helpers |
| `fl.ui/src/styles/ui/_layers.scss` (new) + index | Mixins/classes |
| `fl.ui/src/library/_mixins.scss` | Forward/include if needed |
| `fl.ui/test/suites/layers.ts` (new) | Demo suite |
| `fl.ui/test/playground.ts`, `index.html`, `demo.html` | Suite wiring |
| `lur.e/demo.html` / `test/*` | Short smoke demo |

Shared/subsystem `fest/*` copies follow existing symlink/copy conventions of the repo.

## Compatibility

- Existing `appendAsOverlay` / `registerOverlayElement` callers (e.g. ScrollFrame) keep working.
- Default `zIndexShift` remains −1 / +1 (`shift` mode).
- No change to CWSP network contracts.

## Validation

1. Manual: fl.ui `?suite=layers` — glass glow paints under card; scrollbars track/scroll over content.
2. Smoke: create underlying + overlay programmatically; assert DOM order and z-index for both `stackMode`s.
3. Regression: ScrollFrame / existing overlay registration still mounts.

## Open follow-ups (out of first pass)

- Full shape matrix (mask-image / background-clip:text toggles).
- Native CSS anchor-only path without bbox JS fallback.
- Theme tokens for under-glow colors.
