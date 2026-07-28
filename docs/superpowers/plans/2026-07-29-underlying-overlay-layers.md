# Underlying / Overlay Layers Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Ship symmetric underlying/overlaying layer APIs in `fest/lure`, SCSS mixins in `fest/fl-ui`, and demos for glass+glow and scroll+overlay scrollbars.

**Architecture:** Generalize `lur.e/src/design/layers/` around `appendAsLayer` with `role` + `stackMode`; keep `appendAsOverlay` / `registerOverlayElement` as thin compat wrappers; `UnderlyingShadow` and ScrollBar demos consume the layer helpers. `modules/projects/shared/fest/lure` is a symlink to `lur.e/src` — edit only `lur.e/src`.

**Tech Stack:** TypeScript, fest/dom `DOMMixin`, CSS anchor positioning (`makeAnchorElement` / `getExistsZIndex`), fl.ui SCSS, Vite demo suites.

**Spec:** `docs/superpowers/specs/2026-07-29-underlying-overlay-layers-design.md`

## Global Constraints

- Do not break `appendAsOverlay` / `registerOverlayElement` callers (e.g. ScrollFrame).
- Default stacking: `stackMode: "shift"` with `zIndexShift` −1 (underlying) / +1 (overlaying).
- Prefer sibling-of-main insertion (`before` / `after`), not `document.body`, for demos.
- No new LayerHost component; no CWSP network changes.
- Commits: only when the user explicitly asks (omit commit steps otherwise).

## File map

| File | Role |
|---|---|
| `modules/projects/lur.e/src/design/layers/types.ts` (new) | Shared `LayerRole`, `StackMode`, `AppendAsLayerOptions` |
| `modules/projects/lur.e/src/design/layers/stacking.ts` (new) | Resolve layer z-index from main + stackMode |
| `modules/projects/lur.e/src/design/layers/AnchorOverlay.ts` | Add `appendAsLayer` / `appendAsUnderlying`; wrap `appendAsOverlay` |
| `modules/projects/lur.e/src/design/layers/Register.ts` | Role-aware `registerLayerElement` + underlying/overlay helpers |
| `modules/projects/lur.e/src/design/layers/UnderlyingShadow.ts` | Attach via `appendAsUnderlying`; keep shape sync |
| `modules/projects/lur.e/src/index.ts` | Export layer types/helpers + UnderlyingShadow |
| `modules/projects/lur.e/test/suites/layers.test.ts` (new) | DOM order + z-index assertions |
| `modules/projects/lur.e/test/index.ts` | Register layers suite |
| `modules/projects/lur.e/test/test.tsx` | Short visual smoke for under/over |
| `modules/projects/fl.ui/src/styles/ui/_layers.scss` (new) | Mixins + `.c-underlying` / `.c-overlaying` |
| `modules/projects/fl.ui/src/styles/ui/_index.scss` | Forward `_layers` |
| `modules/projects/fl.ui/src/library/_mixins.scss` | Optional re-export of layer mixins |
| `modules/projects/fl.ui/test/suites/layers.ts` (new) | Glass + scroll demos |
| `modules/projects/fl.ui/test/playground.ts` | Suite id `layers` |
| `modules/projects/fl.ui/index.html` + `demo.html` | Nav button + hint |
| `modules/projects/fl.ui/src/ui/navigation/scrollframe/ScrollFrame.ts` | Fix broken UnderlyingShadow import to `fest/lure` |

---

### Task 1: Layer types + stacking helper + failing tests

**Files:**
- Create: `modules/projects/lur.e/src/design/layers/types.ts`
- Create: `modules/projects/lur.e/src/design/layers/stacking.ts`
- Create: `modules/projects/lur.e/test/suites/layers.test.ts`
- Modify: `modules/projects/lur.e/test/index.ts`

**Interfaces:**
- Produces: `LayerRole`, `StackMode`, `AppendAsLayerOptions`, `resolveLayerZIndex(main, options) => number | null`

- [x] **Step 1: Add types**

```ts
/* Filename: types.ts
 * FullPath: modules/projects/lur.e/src/design/layers/types.ts
 * Reason: Shared contracts for underlying/overlaying layer append APIs.
 */
export type LayerRole = "underlying" | "overlaying";
export type StackMode = "shift" | "order-equal";

export type LayerPlacement =
  | "fill" | "bottom" | "top" | "left" | "right" | "center"
  | "scrollbar-x" | "scrollbar-y";

export interface AppendAsLayerOptions {
  role: LayerRole;
  stackMode?: StackMode;
  zIndexShift?: number;
  placement?: LayerPlacement;
  inset?: number;
  size?: string;
  useIntersection?: boolean;
  root?: HTMLElement | Window;
  transformOrigin?: string;
}
```

- [x] **Step 2: Add stacking resolver**

```ts
/* Filename: stacking.ts
 * FullPath: modules/projects/lur.e/src/design/layers/stacking.ts
 * Reason: Hybrid stackMode — shift (±1) or order-equal (DOM order).
 */
import { getExistsZIndex } from "../anchor/Utils";
import type { AppendAsLayerOptions, LayerRole, StackMode } from "./types";

export const defaultZIndexShift = (role: LayerRole): number =>
  role === "underlying" ? -1 : 1;

/** Returns numeric z-index to apply, or null to leave unset (order-equal + auto). */
export function resolveLayerZIndex(
  main: HTMLElement,
  options: Pick<AppendAsLayerOptions, "role" | "stackMode" | "zIndexShift">
): number | null {
  const role = options.role;
  const stackMode: StackMode = options.stackMode ?? "shift";
  const mainZ = getExistsZIndex(main);
  const mainStyleZ = (main.style?.zIndex ?? "").trim();
  const mainIsAuto = !mainStyleZ || mainStyleZ === "auto";

  if (stackMode === "order-equal") {
    // Leave unset when main has no explicit z-index so DOM order wins.
    if (mainIsAuto) return null;
    return mainZ;
  }

  const shift = options.zIndexShift ?? defaultZIndexShift(role);
  // When main z is auto, treat as 0 for shift math.
  return (mainIsAuto ? 0 : mainZ) + shift;
}
```

- [x] **Step 3: Write failing layer suite** (browser TestRunner pattern from `test/suites/dom.test.ts`)

```ts
/* Filename: layers.test.ts
 * FullPath: modules/projects/lur.e/test/suites/layers.test.ts
 * NOTE: append* imports fail until Task 2; resolveLayerZIndex is available after Step 2.
 */
import { resolveLayerZIndex } from "../../src/design/layers/stacking";
import { appendAsUnderlying, appendAsOverlay } from "../../src/design/layers/AnchorOverlay";
import type { TestRunner as TestRunnerType } from "../index";

export function runLayersTests(TestRunner: typeof TestRunnerType) {
  console.log("\nCHAPTER: Underlying / Overlay Layers\n");
  TestRunner.setCategory("layers.stackMode");
  const probe = document.createElement("div");
  probe.style.zIndex = "5";
  TestRunner.assertEqual(resolveLayerZIndex(probe, { role: "underlying", stackMode: "shift" }), 4, "resolve shift underlying");
  TestRunner.assertEqual(resolveLayerZIndex(probe, { role: "overlaying", stackMode: "shift" }), 6, "resolve shift overlaying");
  TestRunner.assertEqual(resolveLayerZIndex(probe, { role: "underlying", stackMode: "order-equal" }), 5, "resolve order-equal matches main");

  TestRunner.setCategory("layers.dom-order");
  const parent = document.createElement("div");
  const a = document.createElement("div"); a.className = "a";
  const main = document.createElement("div"); main.className = "main"; main.style.zIndex = "5";
  const b = document.createElement("div"); b.className = "b";
  parent.append(a, main, b);
  document.body.appendChild(parent);

  const under = document.createElement("div"); under.className = "under";
  const over = document.createElement("div"); over.className = "over";
  appendAsUnderlying(main, under, { stackMode: "shift" });
  appendAsOverlay(main, over, null, { stackMode: "shift" });

  const kids = [...parent.children];
  TestRunner.assertEqual(kids.indexOf(under), kids.indexOf(main) - 1, "underlying is immediately before main");
  TestRunner.assertEqual(kids.indexOf(over), kids.indexOf(main) + 1, "overlaying is immediately after main");
  TestRunner.assertEqual(under.style.zIndex, "4", "underlying z = main - 1");
  TestRunner.assertEqual(over.style.zIndex, "6", "overlaying z = main + 1");
  parent.remove();
}
```

Wire in `test/index.ts` next to other suite imports/calls:

```ts
import { runLayersTests } from "./suites/layers.test";
// ...
runLayersTests(TestRunner);
```

- [x] **Step 4: Run suite and confirm append helpers fail (not exported / not inserting correctly)**

Run (from `modules/projects/lur.e`): `npm run dev` then open demo, or whatever script loads `test/index.ts`.  
Expected: FAIL / module resolve error on `appendAsUnderlying` until Task 2.

---

### Task 2: `appendAsLayer` + underlying/overlay wrappers

**Files:**
- Modify: `modules/projects/lur.e/src/design/layers/AnchorOverlay.ts`
- Modify: `modules/projects/lur.e/src/index.ts` (export stacking + types if not already)

**Interfaces:**
- Consumes: `AppendAsLayerOptions`, `resolveLayerZIndex`
- Produces: `appendAsLayer`, `appendAsUnderlying`, `appendAsOverlay` (compat)

- [x] **Step 1: Refactor AnchorOverlay**

Keep existing helpers (`getParentOrShadowRoot`, `observeConnect`, `observeDisconnect`, `appendScrollbarOverlay`). Replace body of `appendAsOverlay` with a call into `appendAsLayer`.

Core insertion logic (integrate with existing `makeAnchorElement` connect):

```ts
import { resolveLayerZIndex, defaultZIndexShift } from "./stacking";
import type { AppendAsLayerOptions } from "./types";

export const appendAsLayer = (
  anchor: HTMLElement | null,
  layer?: HTMLElement | null,
  self?: HTMLElement | null,
  options?: AppendAsLayerOptions
) => {
  const role = options?.role ?? "overlaying";
  const stackMode = options?.stackMode ?? "shift";
  const zIndexShift = options?.zIndexShift ?? defaultZIndexShift(role);
  // reuse existing placement / makeAnchorElement connect from current appendAsOverlay
  // AFTER connect:
  const z = resolveLayerZIndex(anchor!, { role, stackMode, zIndexShift });
  if (z == null) layer!.style.removeProperty("z-index");
  else layer!.style.setProperty("z-index", String(z));

  if (role === "underlying") {
    layer!.style.pointerEvents ||= "none";
    observeConnect(anchor!, () => {
      const parent = getParentOrShadowRoot(anchor!) ?? self;
      (anchor as any)?.before?.(layer);
      observeDisconnect(parent as Element, () => layer?.remove?.());
    });
  } else {
    observeConnect(anchor!, () => {
      const parent = getParentOrShadowRoot(anchor!) ?? self;
      (anchor as any)?.after?.(layer);
      observeDisconnect(parent as Element, () => layer?.remove?.());
    });
  }
  return anchor;
};

export const appendAsUnderlying = (main, layer, options?) =>
  appendAsLayer(main, layer, null, { placement: "fill", ...options, role: "underlying" });

export const appendAsOverlay = (anchor, overlay?, self?, options?) =>
  appendAsLayer(anchor, overlay, self, {
    placement: options?.placement ?? "fill",
    zIndexShift: options?.zIndexShift ?? 1,
    stackMode: options?.stackMode ?? "shift",
    ...options,
    role: "overlaying",
  });
```

Preserve current `appendAsOverlay` positional signature `(anchor, overlay?, self?, options?)` exactly so ScrollFrame/register keep compiling.

- [x] **Step 2: Export from index**

In `modules/projects/lur.e/src/index.ts` (near existing AnchorOverlay export):

```ts
export * from "./design/layers/AnchorOverlay"
export * from "./design/layers/Register"
export * from "./design/layers/types"
export * from "./design/layers/stacking"
```

- [x] **Step 3: Re-run layers suite**

Expected: DOM-order + shift z-index assertions PASS. Fix `order-equal` edge if needed.

---

### Task 3: Role-aware registration

**Files:**
- Modify: `modules/projects/lur.e/src/design/layers/Register.ts`

**Interfaces:**
- Consumes: `appendAsUnderlying`, `appendAsOverlay`, `LayerRole`
- Produces: `registerLayerElement`, `registerUnderlyingElement`, `registerOverlayElement`

- [x] **Step 1: Generalize Register**

```ts
import { DOMMixin } from "fest/dom";
import { appendAsOverlay, appendAsUnderlying } from "./AnchorOverlay";
import type { LayerRole } from "./types";

const registered = new Map();

export const registerLayerElement = (
  name: string,
  construct: (content: any, holder?: any, inputChange?: any) => HTMLElement | null | undefined,
  opts: { role: LayerRole } = { role: "overlaying" }
) => {
  const withIt = new WeakMap();
  const bindWith = (content: any, holder?: any, inputChange?: any | null) => {
    if (content?.style?.anchorName || withIt?.has?.(content)) return false;
    if (content) {
      const self: any = construct?.(content, holder, inputChange);
      withIt?.set?.(content, self);
      if (opts.role === "underlying") appendAsUnderlying(content, self, holder);
      else appendAsOverlay(content, self, holder);
    }
    return true;
  };

  class LayerModifier extends DOMMixin {
    constructor(n?) { super(n); }
    connect(ws) {
      const self: any = ws?.deref?.() ?? ws;
      if (withIt?.has?.(self)) return;
      bindWith(self);
    }
  }

  const pack = [withIt, bindWith, LayerModifier];
  registered.set(name, pack);
  new LayerModifier(name);
  return pack;
};

export const registerOverlayElement = (name, construct) =>
  registerLayerElement(name, construct, { role: "overlaying" });

export const registerUnderlyingElement = (name, construct) =>
  registerLayerElement(name, construct, { role: "underlying" });
```

- [x] **Step 2: Smoke** — existing ScrollFrame `registerOverlayElement` import still resolves; no behavior change required beyond append path.

---

### Task 4: UnderlyingShadow on appendAsUnderlying + public export

**Files:**
- Modify: `modules/projects/lur.e/src/design/layers/UnderlyingShadow.ts`
- Modify: `modules/projects/lur.e/src/index.ts`
- Modify: `modules/projects/fl.ui/src/ui/navigation/scrollframe/ScrollFrame.ts` (broken import)

**Interfaces:**
- Consumes: `appendAsUnderlying`
- Produces: exported `UnderlyingShadow`, `createUnderlyingShadow`, `createDropShadow`, …

- [x] **Step 1: Replace `attachToDOM` insertBefore with:**

```ts
import { appendAsUnderlying } from "./AnchorOverlay";

private attachToDOM() {
  if (!this.shadowContainer) return;
  appendAsUnderlying(this.target, this.shadowContainer, {
    stackMode: "shift",
    zIndexShift: this.options.zIndexShift ?? -1,
    placement: "fill",
    useIntersection: this.options.useIntersection,
  });
  // keep disconnect observer cleanup as today
}
```

Also sync `maskImage` / `-webkit-mask-image` in `setupGeometryCloning` next to clip-path (spec: shaped children).

- [x] **Step 2: Export**

```ts
export * from "./design/layers/UnderlyingShadow"
```

- [x] **Step 3: Fix ScrollFrame import**

Replace broken path:

```ts
// OLD (broken):
// import { createUnderlyingShadow, createDropShadow } from "../../../../modules/projects/lur.e/src/extension/overlay/UnderlyingShadow"
import { createDropShadow } from "fest/lure"
```

- [x] **Step 4: Manual smoke** — import `createDropShadow` from `fest/lure` in a tiny console check / layers suite extension.

---

### Task 5: fl.ui SCSS layer mixins

**Files:**
- Create: `modules/projects/fl.ui/src/styles/ui/_layers.scss`
- Modify: `modules/projects/fl.ui/src/styles/ui/_index.scss`

- [x] **Step 1: Write `_layers.scss`**

```scss
// Underlying / overlaying visual contracts for sibling layers.

@mixin underlying-layer {
  position: absolute;
  pointer-events: none;
  overflow: visible;
  inset: 0;
  z-index: calc(var(--layer-main-z, 0) - 1);
}

@mixin overlaying-layer {
  position: absolute;
  inset: 0;
  pointer-events: none; // chrome children re-enable
  z-index: calc(var(--layer-main-z, 0) + 1);
}

@mixin shaped-from-main {
  border-radius: var(--layer-shape-radius, inherit);
  clip-path: var(--layer-shape-clip, none);
  mask-image: var(--layer-shape-mask, none);
  -webkit-mask-image: var(--layer-shape-mask, none);
  inline-size: 100%;
  block-size: 100%;
}

.c-underlying {
  @include underlying-layer;
}
.c-underlying__shaped {
  @include shaped-from-main;
}
.c-overlaying {
  @include overlaying-layer;
}
.c-overlaying [data-axis] {
  pointer-events: auto;
}
```

- [x] **Step 2: Forward from `_index.scss`**

```scss
@forward "./layers";
```

---

### Task 6: fl.ui demo suite `layers`

**Files:**
- Create: `modules/projects/fl.ui/test/suites/layers.ts`
- Modify: `modules/projects/fl.ui/test/playground.ts`
- Modify: `modules/projects/fl.ui/index.html`
- Modify: `modules/projects/fl.ui/demo.html`

**Interfaces:**
- Consumes: `createBlurShadow` / `createDropShadow`, `appendAsOverlay`, `ScrollBar` from `fest/lure`; layer CSS classes

- [x] **Step 1: Implement suite**

```ts
/* Filename: layers.ts
 * FullPath: modules/projects/fl.ui/test/suites/layers.ts
 * Reason: Demo glass+underlying glow and scroll+overlay scrollbars.
 */
import { createBlurShadow, appendAsOverlay, ScrollBar } from "fest/lure";
import "../../src/styles/ui/_layers.scss"; // or project style entry if ?inline required

export function mount(el: HTMLElement): void {
  el.style.cssText = "display:flex;flex-direction:column;gap:1.5rem;padding:1rem;position:relative;";

  // --- Glass + underlying ---
  const glassWrap = document.createElement("div");
  glassWrap.style.cssText = "position:relative;isolation:isolate;padding:2rem;";
  const main = document.createElement("div");
  main.className = "layers-demo-glass";
  main.style.cssText = [
    "position:relative;z-index:2;padding:1.25rem 1.5rem;border-radius:16px;",
    "backdrop-filter:blur(16px);background:color-mix(in oklch,white 18%,transparent);",
    "border:1px solid color-mix(in oklch,white 35%,transparent);color:#e8edf5;",
  ].join("");
  main.textContent = "Glass card — underlying glow sits under backdrop blur";
  glassWrap.appendChild(main);
  el.appendChild(glassWrap);
  createBlurShadow(main, {
    shadowColor: "rgba(110,231,183,0.55)",
    shadowBlur: 18,
    shadowOffsetY: 0,
    zIndexShift: -1,
    cloneGeometry: true,
  });

  // --- Scroll + overlay scrollbars ---
  const scrollHost = document.createElement("div");
  scrollHost.style.cssText = "position:relative;isolation:isolate;inline-size:min(100%,28rem);block-size:14rem;";
  const scroller = document.createElement("div");
  scroller.className = "layers-demo-scroll";
  scroller.style.cssText = "position:relative;z-index:1;overflow:auto;inline-size:100%;block-size:100%;padding:0.75rem;";
  scroller.innerHTML = `<div style="inline-size:48rem;block-size:28rem;white-space:pre-wrap;">${"Scroll me XY\n".repeat(40)}</div>`;
  scrollHost.appendChild(scroller);

  const overlay = document.createElement("div");
  overlay.className = "c-overlaying";
  overlay.style.pointerEvents = "none";

  const barY = document.createElement("div");
  barY.setAttribute("data-axis", "y");
  barY.className = "ui-scrollbar";
  barY.style.cssText = "position:absolute;inset-block:4px;inset-inline-end:2px;inline-size:8px;pointer-events:auto;background:rgba(255,255,255,.15);border-radius:4px;";
  const thumbY = document.createElement("div");
  thumbY.style.cssText = "inline-size:100%;block-size:40px;background:rgba(110,231,183,.8);border-radius:4px;";
  barY.appendChild(thumbY);

  const barX = document.createElement("div");
  barX.setAttribute("data-axis", "x");
  barX.className = "ui-scrollbar";
  barX.style.cssText = "position:absolute;inset-inline:4px;inset-block-end:2px;block-size:8px;pointer-events:auto;background:rgba(255,255,255,.15);border-radius:4px;";
  const thumbX = document.createElement("div");
  thumbX.style.cssText = "block-size:100%;inline-size:40px;background:rgba(110,231,183,.8);border-radius:4px;";
  barX.appendChild(thumbX);

  overlay.append(barY, barX);
  el.appendChild(scrollHost);
  appendAsOverlay(scroller, overlay, scrollHost, { placement: "fill", stackMode: "shift", zIndexShift: 1 });

  // Wire ScrollBar if constructor accepts these nodes (axis 0=x, 1=y)
  try {
    new ScrollBar({ holder: scrollHost, scrollbar: barX, content: scroller }, 0);
    new ScrollBar({ holder: scrollHost, scrollbar: barY, content: scroller }, 1);
  } catch (e) {
    console.warn("[layers demo] ScrollBar wire skipped", e);
  }
}
```

If SCSS import fails under Vite, use `?inline` + existing style preload helper, or duplicate minimal demo CSS in the suite `style.cssText` (acceptable for first pass).

- [x] **Step 2: Wire playground**

```ts
export const SUITE_IDS = ["explorer", "markdown", "misc", "speed-dial", "window", "layers"] as const;
// loaders:
layers: () => import("./suites/layers"),
```

- [x] **Step 3: Nav in `index.html` and `demo.html`**

Add button `data-fl-suite="layers"` and mention `?suite=layers` in the hint.

- [x] **Step 4: Manual validation**

Run from `modules/projects/fl.ui`: `npm run dev:http` → `http://localhost:<port>/?suite=layers`  
Expected: green glow under glass; overlay scrollbar siblings after scroller; thumbs interactive if ScrollBar wires.

---

### Task 7: lur.e visual smoke in `test.tsx`

**Files:**
- Modify: `modules/projects/lur.e/test/test.tsx`

- [x] **Step 1: Append a small section** after existing demos:

```ts
import { appendAsUnderlying, appendAsOverlay } from "../src/design/layers/AnchorOverlay";

const layerDemo = document.createElement("div");
layerDemo.style.cssText = "position:relative;margin:1rem;isolation:isolate;";
const mainEl = document.createElement("div");
mainEl.textContent = "Main (z=3)";
mainEl.style.cssText = "position:relative;z-index:3;padding:1rem;background:#246;color:#fff;border-radius:12px;";
const underEl = document.createElement("div");
underEl.style.cssText = "background:rgba(255,200,0,.35);filter:blur(8px);border-radius:12px;";
const overEl = document.createElement("div");
overEl.textContent = "overlay";
overEl.style.cssText = "display:flex;align-items:end;justify-content:end;padding:4px;color:#0f0;font:12px monospace;";
layerDemo.appendChild(mainEl);
document.querySelector("#app")?.appendChild(layerDemo);
appendAsUnderlying(mainEl, underEl, { stackMode: "shift" });
appendAsOverlay(mainEl, overEl, { stackMode: "shift", placement: "fill" });
```

- [x] **Step 2: Open lur.e demo** — under paints behind, overlay label on top.

---

## Spec coverage checklist

| Spec requirement | Task |
|---|---|
| `appendAsLayer` / underlying / overlay | 2 |
| `stackMode` shift + order-equal | 1–2 |
| `registerUnderlyingElement` / overlay compat | 3 |
| UnderlyingShadow via append + export | 4 |
| Shape sync mask | 4 |
| SCSS mixins + classes | 5 |
| fl.ui glass + scroll demos | 6 |
| lur.e smoke | 7 |
| ScrollFrame import fix | 4 |
| Sibling not body for demos | 6 |

## Self-review notes

- No TBD placeholders in steps.
- `appendAsOverlay` signature preserved for Register/ScrollFrame.
- Symlink: edit `lur.e/src` only; do not duplicate into `shared/fest/lure`.
