# style-lib animation Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Two explicit animation writers (`doAnimation` WAAPI, `bindCssAnimation` CSSOM), opt-in `appear`/`disappear`, and LUR.E insert/remove that can wait before detach.

**Architecture:** `A` stays a description. Pure compile helpers live in `css-animation.ts`. Lifecycle (`appear`/`disappear`/`initVisibility`/`decorShow`/`decorHide`) lives in `lifecycle.ts`. LUR.E `appendChild`/`removeChild` become async and thread `{ appear?, disappear? }` from Mapped/Changeable. `dom/decor` keeps only compat aliases to avoid duplicate star-exports.

**Tech Stack:** TypeScript, `@fest-lib/style-lib` / `lure` / `dom`, `node:test`, Vite lib bundle for lure tests (existing `run-mapped-tests.mjs` pattern).

## Global Constraints

- Spec: `docs/superpowers/specs/2026-09-02-style-lib-animation-design.md`
- SoT is `modules/projects/style.ts`. Do not edit copies under `*/fest`.
- `doAnimation` never writes CSS. `bindCssAnimation` never calls `element.animate()`.
- Wrong target or `trigger: { value }` on the CSS path → `TypeError`. No silent fallback.
- Missing `A` / options → no animation (instant resolve / instant DOM).
- `Queries.ts` is a symlink to `Queried.ts`. Do not duplicate it.
- Do not touch `CSSAnimated.ts` or `Shape.ts`.
- Do not run full lure `npm test`, `npm run build`, deploy, or app suites unless a task names a narrower script.
- Do not `git commit` unless the user explicitly asked in this thread.
- `prefers-reduced-motion` and `data-instant` skip waiting.
- `remove` always runs before `parent.removeChild`. `hide` is not `remove`.

## File structure

| File | Role |
| --- | --- |
| `modules/projects/style.ts/src/types.ts` | `show`/`hide`/`remove` on `AnimatableTrigger`; `CssAnimationOptions`; `NodeLifecycle` |
| `modules/projects/style.ts/src/constants.ts` | `ANIM_LAYER = "ux-anim"` |
| `modules/projects/style.ts/src/maps.ts` | keyframe refcount + adopted anim sheet |
| `modules/projects/style.ts/src/css-animation.ts` | **new** — compile keyframes/triggers, resolve target, `bindCssAnimation` |
| `modules/projects/style.ts/src/lifecycle.ts` | **new** — `appear`/`disappear`/`waitElementAnimations`/`initVisibility`/`decorShow`/`decorHide` |
| `modules/projects/style.ts/src/Animate.ts` | `doAnimation` throws on non-Element; re-export bind helpers |
| `modules/projects/style.ts/src/Animatable.ts` | WAAPI `show`/`hide`/`remove` triggers |
| `modules/projects/style.ts/src/index.ts` | export new modules |
| `modules/projects/style.ts/test/css-animation.node.test.ts` | **new** |
| `modules/projects/style.ts/test/lifecycle.node.test.ts` | **new** |
| `modules/projects/style.ts/scripts/run-animation-tests.mjs` | **new** |
| `modules/projects/lur.e/src/lure/context/Utils.ts` | async append/remove + lifecycle |
| `modules/projects/lur.e/src/lure/context/ReflectChildren.ts` | pass lifecycle; await merge |
| `modules/projects/lur.e/src/lure/node/Mapped.ts` | `appear`/`disappear` options |
| `modules/projects/lur.e/src/lure/node/Changeable.ts` | same options |
| `modules/projects/lur.e/test/mapped-lifecycle.node.test.ts` | **new** |
| `modules/projects/lur.e/scripts/run-mapped-lifecycle-tests.mjs` | **new** |
| `modules/projects/dom.ts/src/decor/Animation.ts` | `animateShow`/`animateHide` aliases only |
| `modules/projects/dom.ts/src/decor/Appear.ts` | `initVisibility` re-export only |

---

### Task 1: Compile helpers (keyframes + triggers)

**Files:**
- Create: `modules/projects/style.ts/src/css-animation.ts`
- Modify: `modules/projects/style.ts/src/types.ts` (AnimatableTrigger + CssAnimationOptions)
- Modify: `modules/projects/style.ts/src/constants.ts` (ANIM_LAYER)
- Modify: `modules/projects/style.ts/src/index.ts` (export css-animation)
- Test: `modules/projects/style.ts/test/css-animation.node.test.ts`
- Create: `modules/projects/style.ts/scripts/run-animation-tests.mjs`
- Modify: `modules/projects/style.ts/package.json` (script `test:animation`)

**Interfaces:**
- Consumes: `AnimationOptions`, `AnimatableTrigger`, `parseTime`, `normalizeIterationCount`, `isScrollDriven`, `isViewDriven`, `camelToKebab` from `@fest-lib/core`
- Produces:
  - `export const ANIM_LAYER = "ux-anim"`
  - `export type CssAnimationOptions = AnimationOptions & { trigger?: AnimatableTrigger; selector?: string; reverseOnExit?: boolean }`
  - `export const compileKeyframesCss = (options: CssAnimationOptions) => { name: string; cssText: string; fingerprint: string }`
  - `export const compileTriggerCss = (selector: string, options: CssAnimationOptions) => { selector: string; properties: Record<string, string> }`
  - `export const isReactiveTrigger = (t: unknown) => boolean`
  - `export const resolveCssAnimationTarget = (target: unknown, options: CssAnimationOptions) => { sheet: CSSStyleSheet; rule: CSSStyleRule | null; selector: string }`

- [ ] **Step 1: Write the failing test**

Create `modules/projects/style.ts/test/css-animation.node.test.ts`:

```ts
import assert from "node:assert/strict";
import test from "node:test";
import {
    compileKeyframesCss,
    compileTriggerCss,
    isReactiveTrigger,
} from "../src/css-animation.ts";

test("compileKeyframesCss emits @keyframes from property arrays", () => {
    const out = compileKeyframesCss({
        properties: { opacity: [0, 1] },
        duration: 300,
    });
    assert.match(out.name, /^fest-anim-/);
    assert.match(out.cssText, /@keyframes fest-anim-/);
    assert.match(out.cssText, /opacity:\s*0/);
    assert.match(out.cssText, /opacity:\s*1/);
    assert.ok(out.fingerprint.length > 0);
});

test("same payload shares fingerprint", () => {
    const a = compileKeyframesCss({ properties: { opacity: [0, 1] } });
    const b = compileKeyframesCss({ properties: { opacity: [0, 1] } });
    assert.equal(a.fingerprint, b.fingerprint);
    assert.equal(a.name, b.name);
});

test("compileTriggerCss maps lifecycle and interaction triggers", () => {
    assert.equal(compileTriggerCss(".x", { properties: { opacity: [0, 1] } }).selector, ".x");
    assert.equal(compileTriggerCss(".x", { properties: { opacity: [0, 1] }, trigger: "hover" }).selector, ".x:hover");
    assert.equal(compileTriggerCss(".x", { properties: { opacity: [0, 1] }, trigger: "focus" }).selector, ".x:focus");
    assert.equal(compileTriggerCss(".x", { properties: { opacity: [0, 1] }, trigger: "show" }).selector, ".x:not([data-hidden])");
    assert.equal(compileTriggerCss(".x", { properties: { opacity: [0, 1] }, trigger: "hide" }).selector, ".x[data-hidden]");
    assert.equal(compileTriggerCss(".x", { properties: { opacity: [0, 1] }, trigger: "remove" }).selector, ".x[data-removing]");
    const click = compileTriggerCss(".x", { properties: { opacity: [0, 1] }, trigger: "click" });
    assert.equal(click.properties["event-trigger"], "--fest-t click");
    assert.equal(click.properties["animation-trigger"], "--fest-t play");
    const vis = compileTriggerCss(".x", { properties: { opacity: [0, 1] }, trigger: "visible" });
    assert.equal(vis.properties["timeline-trigger"], "--fest-t view contain");
    const manual = compileTriggerCss(".x", { properties: { opacity: [0, 1] }, trigger: "manual" });
    assert.equal(manual.properties["animation-play-state"], "paused");
});

test("reactive trigger is detected and compileTriggerCss throws", () => {
    assert.equal(isReactiveTrigger({ value: true }), true);
    assert.throws(
        () => compileTriggerCss(".x", { properties: { opacity: [0, 1] }, trigger: { value: true } }),
        TypeError,
    );
});
```

- [ ] **Step 2: Run test to verify it fails**

Create `modules/projects/style.ts/scripts/run-animation-tests.mjs`:

```js
import { spawn } from "node:child_process";
import { resolve } from "node:path";

const root = resolve(import.meta.dirname, "..");
const files = [
    resolve(root, "test/css-animation.node.test.ts"),
    resolve(root, "test/lifecycle.node.test.ts"),
];
const child = spawn(process.execPath, ["--experimental-strip-types", "--test", ...files], {
    cwd: root,
    stdio: "inherit",
});
child.once("exit", (code) => process.exit(code ?? 1));
```

Add to `modules/projects/style.ts/package.json` scripts: `"test:animation": "node ./scripts/run-animation-tests.mjs"`

For this task only, run the first file:

```bash
cd /home/u2re-dev/U2RE.space/modules/projects/style.ts && node --experimental-strip-types --test test/css-animation.node.test.ts
```

Expected: FAIL (`Cannot find module` / `css-animation`).

If Node cannot strip types, use the same Vite+`--test` pattern as `lur.e/scripts/run-mapped-tests.mjs` (alias `@fest-lib/core` → `../core.ts/src/index.ts`) and point the script at `test/css-animation.node.test.ts` only.

- [ ] **Step 3: Write minimal implementation**

In `types.ts`, extend:

```ts
export type AnimatableTrigger =
    | "mount"
    | "hover"
    | "focus"
    | "click"
    | "visible"
    | "manual"
    | "show"
    | "hide"
    | "remove"
    | { value: any }
    | ScrollDrivenOptions
    | ViewDrivenOptions;

export type CssAnimationOptions = AnimationOptions & {
    trigger?: AnimatableTrigger;
    selector?: string;
    reverseOnExit?: boolean;
};
```

Make `AnimationOptions.properties` optional (`properties?: ...`) so `keyframes` from `A` can stand alone.

In `constants.ts` add:

```ts
export const ANIM_LAYER = "ux-anim";
export const ANIM_TRIGGER_NAME = "--fest-t";
```

Create `css-animation.ts` with these functions (full file):

```ts
/*
 * FIND:style-anim
 * TAG:style-lib,style-anim
 * WHY: CSSOM animation writer. INVARIANT: never call element.animate().
 */
import { camelToKebab } from "@fest-lib/core";
import { ANIM_LAYER, ANIM_TRIGGER_NAME } from "./constants";
import type { CssAnimationOptions, PropertyAnimation } from "./types";
import {
    isScrollDriven,
    isViewDriven,
    normalizeIterationCount,
    parseTime,
} from "./utils";

export const isReactiveTrigger = (t: unknown): boolean =>
    t != null && typeof t === "object" && !isScrollDriven(t) && !isViewDriven(t) && "value" in (t as object);

const asPropertyList = (options: CssAnimationOptions): PropertyAnimation[] => {
    const kf = options.keyframes?.properties;
    if (kf instanceof Map) {
        return Array.from(kf.values());
    }
    const props = options.properties;
    if (typeof props === "string") {
        throw new TypeError("string properties are not used on the CSS compile path");
    }
    if (Array.isArray(props)) {
        return props.map((item: any, i) => {
            if (item && Array.isArray(item.values) && item.property) return item as PropertyAnimation;
            const entries = Object.entries(item || {}).filter(([k]) => k !== "offset" && k !== "easing");
            return {
                property: entries[0]?.[0] ?? `p${i}`,
                values: entries[0] ? [entries[0][1]] : [],
            };
        });
    }
    if (props && typeof props === "object") {
        return Object.entries(props).map(([property, values]) => ({
            property,
            values: Array.isArray(values) ? values : [values],
        }));
    }
    throw new TypeError("No animatable properties");
};

const serializeValue = (value: any): string => {
    if (value == null) return "";
    if (typeof value === "object" && "value" in value && !(value instanceof Element)) {
        return String(value.value ?? "");
    }
    return String(value);
};

export const compileKeyframesCss = (options: CssAnimationOptions) => {
    const list = asPropertyList(options);
    const maxLength = Math.max(2, ...list.map((p) => p.values.length));
    const offsets = options.offsets ?? Array.from({ length: maxLength }, (_, i) => i / (maxLength - 1));
    const frames: string[] = [];
    for (let i = 0; i < maxLength; i++) {
        const decls: string[] = [];
        for (const prop of list) {
            const raw = prop.values[Math.min(i, prop.values.length - 1)];
            decls.push(`${camelToKebab(prop.property)}: ${serializeValue(raw)}`);
        }
        const pct = Math.round((offsets[i] ?? i / (maxLength - 1)) * 100);
        frames.push(`${pct}% { ${decls.join("; ")}; }`);
    }
    const fingerprint = frames.join("|");
    let hash = 0;
    for (let i = 0; i < fingerprint.length; i++) hash = (hash * 31 + fingerprint.charCodeAt(i)) | 0;
    const name = `fest-anim-${(hash >>> 0).toString(36)}`;
    const cssText = `@keyframes ${name} {\n${frames.join("\n")}\n}`;
    return { name, cssText, fingerprint };
};

export const compileTriggerCss = (selector: string, options: CssAnimationOptions) => {
    const trigger = options.trigger ?? "mount";
    if (isReactiveTrigger(trigger)) {
        throw new TypeError("reactive { value } trigger is not valid on the CSS path");
    }
    const compiled = compileKeyframesCss(options);
    const duration = `${parseTime(options.duration, 300)}ms`;
    const delay = `${parseTime(options.delay, 0)}ms`;
    const iterations = normalizeIterationCount(options.iterationCount);
    const properties: Record<string, string> = {
        "animation-name": compiled.name,
        "animation-duration": duration,
        "animation-delay": delay,
        "animation-iteration-count": iterations === "Infinity" || iterations === Infinity ? "infinite" : String(iterations),
        "animation-direction": options.direction ?? "normal",
        "animation-fill-mode": options.fillMode ?? "none",
        "animation-timing-function": typeof options.easing === "string" ? options.easing : "linear",
    };

    if (trigger === "hover") {
        if (options.reverseOnExit) {
            properties["animation-trigger"] = `${ANIM_TRIGGER_NAME} play-backwards`;
        }
        return { selector: `${selector}:hover`, properties };
    }
    if (trigger === "focus") {
        return { selector: `${selector}:focus`, properties };
    }
    if (trigger === "show") return { selector: `${selector}:not([data-hidden])`, properties };
    if (trigger === "hide") return { selector: `${selector}[data-hidden]`, properties };
    if (trigger === "remove") return { selector: `${selector}[data-removing]`, properties };
    if (trigger === "manual") {
        properties["animation-play-state"] = "paused";
        return { selector, properties };
    }
    if (trigger === "click") {
        properties["event-trigger"] = `${ANIM_TRIGGER_NAME} click`;
        properties["animation-trigger"] = `${ANIM_TRIGGER_NAME} play`;
        return { selector, properties };
    }
    if (trigger === "visible") {
        properties["timeline-trigger"] = `${ANIM_TRIGGER_NAME} view contain`;
        properties["animation-trigger"] = `${ANIM_TRIGGER_NAME} play`;
        return { selector, properties };
    }
    if (isScrollDriven(trigger) || isViewDriven(trigger)) {
        const kind = isViewDriven(trigger) ? "view" : "scroll";
        properties["timeline-trigger"] = `${ANIM_TRIGGER_NAME} ${kind}`;
        if (trigger.rangeStart) properties["animation-range-start"] = trigger.rangeStart;
        if (trigger.rangeEnd) properties["animation-range-end"] = trigger.rangeEnd;
        return { selector, properties };
    }
    return { selector, properties };
};

export const resolveCssAnimationTarget = (target: any, options: CssAnimationOptions) => {
    if (target instanceof Element) {
        throw new TypeError("bindCssAnimation does not accept Element");
    }
    if (typeof CSSStyleDeclaration !== "undefined" && target instanceof CSSStyleDeclaration) {
        const rule = (target as any).parentRule;
        if (!rule) throw new TypeError("CSSStyleDeclaration has no parentRule");
        return resolveCssAnimationTarget(rule, options);
    }
    if (typeof CSSStyleRule !== "undefined" && target instanceof CSSStyleRule) {
        const sheet = target.parentStyleSheet;
        if (!sheet) throw new TypeError("CSSStyleRule has no parentStyleSheet");
        return { sheet, rule: target, selector: target.selectorText };
    }
    if (typeof CSSStyleSheet !== "undefined" && target instanceof CSSStyleSheet) {
        const selector = options.selector;
        if (!selector) throw new TypeError("CSSStyleSheet bind requires options.selector");
        return { sheet: target, rule: null, selector };
    }
    throw new TypeError("bindCssAnimation target must be a CSSStyleRule, CSSStyleSheet, or CSSStyleDeclaration");
};

export { ANIM_LAYER };
```

Do **not** implement `bindCssAnimation` in this task.

Export from `index.ts`: `export * from "./css-animation";`

- [ ] **Step 4: Run the tests and make sure they pass**

```bash
cd /home/u2re-dev/U2RE.space/modules/projects/style.ts && node --experimental-strip-types --test test/css-animation.node.test.ts
```

Expected: PASS (all 4 tests).

- [ ] **Step 5: Commit**

Skip unless the user asked to commit.

---

### Task 2: `bindCssAnimation` + refcount

**Files:**
- Modify: `modules/projects/style.ts/src/css-animation.ts`
- Modify: `modules/projects/style.ts/src/maps.ts`
- Modify: `modules/projects/style.ts/src/Animate.ts` (`doAnimation` guard)
- Test: `modules/projects/style.ts/test/css-animation.node.test.ts` (append cases)

**Interfaces:**
- Consumes: `compileKeyframesCss`, `compileTriggerCss`, `resolveCssAnimationTarget`, `getOrCreateLayerRule`
- Produces:
  - `export const bindCssAnimation = (target, options: CssAnimationOptions) => Cleanup`
  - `animKeyframeRefs: Map<string, { name: string; count: number }>`
  - `doAnimation(el: HTMLElement, ...)` throws `TypeError` if `!(el instanceof Element)`

- [ ] **Step 1: Write the failing tests**

Append to `test/css-animation.node.test.ts`:

```ts
import { bindCssAnimation, resolveCssAnimationTarget } from "../src/css-animation.ts";
import { doAnimation } from "../src/Animate.ts";

test("doAnimation rejects non-Element", () => {
    assert.throws(() => doAnimation({} as any, { properties: { opacity: [0, 1] } }), TypeError);
});

test("resolveCssAnimationTarget rejects Element", () => {
    class FakeEl { }
    Object.defineProperty(FakeEl.prototype, Symbol.toStringTag, { get: () => "not-used" });
    // If Element is undefined in this Node process, skip Element instanceof and assert the generic TypeError:
    assert.throws(() => resolveCssAnimationTarget({ animate() {} }, { properties: { opacity: [0, 1] } }), TypeError);
});

test("bindCssAnimation writes keyframes and companion, refcount drops on cleanup", () => {
    const rules: string[] = [];
    const sheet = {
        cssRules: [] as any[],
        insertRule(text: string) {
            rules.push(text);
            this.cssRules.push({ cssText: text, style: {} });
            return this.cssRules.length - 1;
        },
        deleteRule(i: number) {
            rules.splice(i, 1);
            this.cssRules.splice(i, 1);
        },
    } as unknown as CSSStyleSheet;

    const opts = { properties: { opacity: [0, 1] }, selector: ".row", trigger: "remove" as const };
    const a = bindCssAnimation(sheet, opts);
    const b = bindCssAnimation(sheet, opts);
    assert.ok(rules.some((r) => r.includes("@keyframes")));
    assert.ok(rules.some((r) => r.includes("[data-removing]") && r.includes("animation-name")));
    a();
    assert.ok(rules.some((r) => r.includes("@keyframes")), "keyframes remain after first cleanup");
    b();
    assert.equal(rules.filter((r) => r.includes("@keyframes")).length, 0);
});
```

`bindCssAnimation` must accept a duck-typed sheet (not only `instanceof CSSStyleSheet`) **or** the test constructs a real `CSSStyleSheet` when available. Prefer duck-typing: if `target` has `insertRule` and `cssRules` and `options.selector`, treat it as a sheet. Put that branch **before** `instanceof` checks so Node tests work.

- [ ] **Step 2: Run test to verify it fails**

```bash
cd /home/u2re-dev/U2RE.space/modules/projects/style.ts && node --experimental-strip-types --test test/css-animation.node.test.ts
```

Expected: FAIL (`bindCssAnimation is not a function` or `doAnimation` does not throw).

- [ ] **Step 3: Write minimal implementation**

In `maps.ts`:

```ts
export const animKeyframeRefs = shared(
    "style.ts@animKeyframeRefs",
    () => new Map<string, { name: string; count: number; keyframesRule: any; hosts: Set<any> }>(),
);
```

In `css-animation.ts` add `bindCssAnimation`:

```ts
import { getOrCreateLayerRule } from "./layers";
import { animKeyframeRefs } from "./maps";
import type { Cleanup } from "./types";

const declarationsToText = (properties: Record<string, string>) =>
    Object.entries(properties).map(([k, v]) => `${k}: ${v};`).join(" ");

export const bindCssAnimation = (target: any, options: CssAnimationOptions): Cleanup => {
    const compiled = compileKeyframesCss(options);
    let sheet: any;
    let selector: string;
    if (target && typeof target.insertRule === "function" && options.selector) {
        sheet = target;
        selector = options.selector;
    } else {
        const resolved = resolveCssAnimationTarget(target, options);
        sheet = resolved.sheet;
        selector = resolved.selector;
    }

    const trigger = compileTriggerCss(selector, options);
    const layer = getOrCreateLayerRule(sheet, ANIM_LAYER) ?? sheet;
    const host = layer.insertRule ? layer : sheet;

    let entry = animKeyframeRefs.get(compiled.fingerprint);
    if (!entry) {
        host.insertRule(compiled.cssText, host.cssRules?.length ?? 0);
        const keyframesRule = host.cssRules?.[host.cssRules.length - 1];
        entry = { name: compiled.name, count: 0, keyframesRule, hosts: new Set() };
        animKeyframeRefs.set(compiled.fingerprint, entry);
    }
    entry.count += 1;
    entry.hosts.add(host);

    const companionText = `${trigger.selector} { ${declarationsToText(trigger.properties)} }`;
    const companionIndex = host.insertRule(companionText, host.cssRules?.length ?? 0);
    const companionRule = host.cssRules?.[companionIndex];

    let dead = false;
    return () => {
        if (dead) return;
        dead = true;
        try {
            const rules = Array.from(host.cssRules || []);
            const idx = rules.indexOf(companionRule);
            if (idx >= 0) host.deleteRule(idx);
        } catch { /* already gone */ }
        entry!.count -= 1;
        if (entry!.count <= 0) {
            try {
                const rules = Array.from(host.cssRules || []);
                const idx = rules.indexOf(entry!.keyframesRule);
                if (idx >= 0) host.deleteRule(idx);
            } catch { /* already gone */ }
            animKeyframeRefs.delete(compiled.fingerprint);
        }
    };
};
```

In `Animate.ts`, first lines of `doAnimation`:

```ts
if (typeof Element !== "undefined" && !(element instanceof Element)) {
    throw new TypeError("doAnimation requires an Element");
}
if (typeof Element === "undefined" && (element == null || typeof (element as any).animate !== "function")) {
    throw new TypeError("doAnimation requires an Element");
}
```

- [ ] **Step 4: Run the tests and make sure they pass**

Same command as Step 2. Expected: PASS.

- [ ] **Step 5: Commit**

Skip unless the user asked to commit.

---

### Task 3: `appear` / `disappear` / `decorShow` / `initVisibility`

**Files:**
- Create: `modules/projects/style.ts/src/lifecycle.ts`
- Modify: `modules/projects/style.ts/src/index.ts`
- Test: `modules/projects/style.ts/test/lifecycle.node.test.ts`

**Interfaces:**
- Consumes: `doAnimation`, `AnimationOptions`
- Produces:
  - `appear(el: Element, options?: AnimationOptions | null): Promise<boolean>`
  - `disappear(el: Element, options?: AnimationOptions | null): Promise<boolean>`
  - `waitElementAnimations(el: Element): Promise<void>`
  - `dispatchLifecycleEvent(el: EventTarget, type: string): boolean`
  - `decorShow: AnimationOptions`
  - `decorHide: AnimationOptions`
  - `initVisibility(root?: any, animations?: { appear?: AnimationOptions | null; disappear?: AnimationOptions | null }): Promise<void>`
  - Return `false` when a `before-*` event is canceled.

- [ ] **Step 1: Write the failing test**

`modules/projects/style.ts/test/lifecycle.node.test.ts`:

```ts
import assert from "node:assert/strict";
import test from "node:test";
import { appear, disappear, decorShow, decorHide } from "../src/lifecycle.ts";

const makeEl = () => {
    const listeners = new Map<string, Function[]>();
    const el: any = {
        nodeType: 1,
        attrs: new Set<string>(),
        animations: [] as any[],
        animate(frames: any, timing: any) {
            const animation = {
                playState: "running",
                finished: Promise.resolve(),
                cancel() { this.playState = "idle"; },
                finish() { this.playState = "finished"; },
                frames, timing,
            };
            this.animations.push(animation);
            return animation;
        },
        getAnimations() { return this.animations.filter((a: any) => a.playState === "running" || a.playState === "pending"); },
        hasAttribute(n: string) { return this.attrs.has(n); },
        setAttribute(n: string) { this.attrs.add(n); },
        removeAttribute(n: string) { this.attrs.delete(n); },
        getAttribute(n: string) { return this.attrs.has(n) ? "" : null; },
        dispatchEvent(ev: any) {
            for (const cb of listeners.get(ev.type) || []) cb(ev);
            return !ev.defaultPrevented;
        },
        addEventListener(type: string, cb: Function) {
            listeners.set(type, [...(listeners.get(type) || []), cb]);
        },
        ownerDocument: { defaultView: globalThis },
    };
    return el;
};

test("appear without options is a no-op and does not animate", async () => {
    const el = makeEl();
    const ok = await appear(el);
    assert.equal(ok, true);
    assert.equal(el.animations.length, 0);
});

test("appear with options plays WAAPI", async () => {
    const el = makeEl();
    await appear(el, { properties: { opacity: [0, 1] }, duration: 1 });
    assert.equal(el.animations.length, 1);
});

test("disappear does not detach", async () => {
    const el = makeEl();
    el.parentNode = { removeChild() { throw new Error("detached"); } };
    await disappear(el, { properties: { opacity: [1, 0] }, duration: 1 });
});

test("decor presets exist", () => {
    assert.ok(decorShow.properties);
    assert.ok(decorHide.properties);
});
```

- [ ] **Step 2: Run test to verify it fails**

```bash
cd /home/u2re-dev/U2RE.space/modules/projects/style.ts && node --experimental-strip-types --test test/lifecycle.node.test.ts
```

Expected: FAIL (module not found).

- [ ] **Step 3: Write minimal implementation**

`lifecycle.ts`:

```ts
/*
 * FIND:style-anim
 * TAG:style-lib,style-anim
 * WHY: Element enter/exit. INVARIANT: disappear never detaches. No opts → no WAAPI.
 */
import { observeAttributeBySelector } from "@fest-lib/dom";
import { doAnimation } from "./Animate";
import type { AnimationOptions } from "./types";

const hasPayload = (options?: AnimationOptions | null): options is AnimationOptions =>
    !!options && (options.properties != null || options.keyframes != null);

const reduced = (el: any) =>
    el?.hasAttribute?.("data-instant") ||
    (typeof matchMedia === "function" && matchMedia("(prefers-reduced-motion: reduce)").matches);

export const dispatchLifecycleEvent = (el: any, type: string): boolean =>
    el?.dispatchEvent?.(new CustomEvent(type, { detail: {}, bubbles: true, cancelable: true })) !== false;

export const waitElementAnimations = async (el: any): Promise<void> => {
    if (reduced(el)) return;
    await new Promise<void>((resolve) => {
        const raf = globalThis.requestAnimationFrame ?? ((cb: FrameRequestCallback) => setTimeout(() => cb(0), 0));
        raf(() => resolve());
    });
    const list = typeof el?.getAnimations === "function" ? el.getAnimations() : [];
    await Promise.all(list
        .filter((a: any) => a.playState === "running" || a.playState === "pending")
        .map((a: any) => a.finished?.catch?.(() => {}) ?? Promise.resolve()));
};

const play = async (el: any, options?: AnimationOptions | null, before: string, after: string): Promise<boolean> => {
    if (typeof Element !== "undefined" && !(el instanceof Element) && typeof el?.animate !== "function") {
        throw new TypeError("appear/disappear require an Element");
    }
    if (!dispatchLifecycleEvent(el, before)) return false;
    if (hasPayload(options) && !reduced(el) && typeof el.animate === "function") {
        try { doAnimation(el, options); } catch { /* fake test els */ el.animate([], {}); }
    }
    await waitElementAnimations(el);
    dispatchLifecycleEvent(el, after);
    return true;
};

export const appear = (el: any, options?: AnimationOptions | null) =>
    play(el, options, "u2-before-show", "u2-appear");

export const disappear = (el: any, options?: AnimationOptions | null) =>
    play(el, options, "u2-before-hide", "u2-hidden");

export const decorShow: AnimationOptions = {
    properties: {
        "--opacity": [0, 0, 1],
        "--scale": [0.8, 0.8, 1],
        display: ["none", "none", "revert-layer"],
        pointerEvents: ["none", "none", "revert-layer"],
    },
    duration: 80,
    easing: "linear",
};

export const decorHide: AnimationOptions = {
    properties: {
        "--opacity": [1, 0, 0],
        "--scale": [1, 0.8, 0.8],
        display: ["revert-layer", "revert-layer", "none"],
        pointerEvents: ["none", "none", "none"],
    },
    duration: 120,
    easing: "linear",
};

export const initVisibility = async (
    ROOT: any = (typeof document !== "undefined" ? document.body : null),
    animations?: { appear?: AnimationOptions | null; disappear?: AnimationOptions | null },
) => {
    if (!ROOT) return;
    observeAttributeBySelector(ROOT, "*", "data-hidden", (mutation: any) => {
        if (mutation.attributeName !== "data-hidden") return;
        const target = mutation.target as HTMLElement;
        if (target.getAttribute("data-hidden") === mutation.oldValue) return;
        const hidden = target.getAttribute("data-hidden") != null;
        const opts = hidden ? animations?.disappear : animations?.appear;
        Promise.resolve(hidden ? disappear(target, opts) : appear(target, opts)).catch(console.warn);
    });
};
```

If `doAnimation` on the fake el throws because of `instanceof Element`, the `el.animate` fallback in `play` covers tests. Adjust `doAnimation` guard so a duck-typed el with `.animate` is accepted **or** call `el.animate` directly from `play` when `doAnimation` throws. Prefer: `play` catches and uses `el.animate(buildFrames(options), timing)` only in tests if needed. Simpler path: `doAnimation` treats `typeof element.animate === "function"` as sufficient when `Element` is undefined; when `Element` exists, require `instanceof Element` **or** `animate` function (so Node tests work). Keep the TypeError for `{}` without `animate`.

Export from `index.ts`: `export * from "./lifecycle";`

- [ ] **Step 4: Run the tests and make sure they pass**

```bash
cd /home/u2re-dev/U2RE.space/modules/projects/style.ts && npm run test:animation
```

Expected: PASS (css-animation + lifecycle).

- [ ] **Step 5: Commit**

Skip unless the user asked to commit.

---

### Task 4: `animatable` triggers `show` / `hide` / `remove`

**Files:**
- Modify: `modules/projects/style.ts/src/Animatable.ts` (`#wireTrigger`)

**Interfaces:**
- Consumes: `AnimatableTrigger` including `"show"|"hide"|"remove"`
- Produces: `attach()` starts on `u2-before-show` / `u2-before-hide` / `u2-before-remove` (and attribute `data-hidden` / `data-removing` MutationObserver as backup)

- [ ] **Step 1: Write the failing test**

Add to `lifecycle.node.test.ts` (or a small `animatable.node.test.ts`):

```ts
import { animatable } from "../src/Animatable.ts";

test("animatable trigger remove starts on u2-before-remove", () => {
    const el = makeEl();
    const anim = animatable([0, 1], { trigger: "remove", duration: 1 });
    anim.attach(el, { mode: "property", target: "opacity" });
    assert.equal(el.animations.length, 0);
    el.dispatchEvent(new CustomEvent("u2-before-remove", { bubbles: true, cancelable: true }));
    assert.ok(el.animations.length >= 1);
});
```

`makeEl` must implement `CustomEvent` via `globalThis.CustomEvent = class { constructor(type, init) { this.type = type; this.defaultPrevented = false; Object.assign(this, init); } preventDefault() { this.defaultPrevented = true; } }`.

- [ ] **Step 2: Run test to verify it fails**

`npm run test:animation` — FAIL (trigger ignored / no start).

- [ ] **Step 3: Write minimal implementation**

In `Animatable.ts` `#wireTrigger`, after the `{ value }` branch and before `return () => {}`:

```ts
if (trigger === "show" || trigger === "hide" || trigger === "remove") {
    const eventName =
        trigger === "show" ? "u2-before-show" :
        trigger === "hide" ? "u2-before-hide" : "u2-before-remove";
    const attr = trigger === "remove" ? "data-removing" : "data-hidden";
    const wantPresent = trigger !== "show";
    const onEvent = () => playForward();
    element.addEventListener(eventName, onEvent);
    const mo = new MutationObserver(() => {
        const present = element.hasAttribute(attr);
        if (present === wantPresent) playForward();
        else if (reverseOnExit && attachment.animation) playBackward();
    });
    mo.observe(element, { attributes: true, attributeFilter: [attr] });
    return () => {
        element.removeEventListener(eventName, onEvent);
        mo.disconnect();
    };
}
```

- [ ] **Step 4: Run the tests and make sure they pass**

`npm run test:animation` — PASS.

- [ ] **Step 5: Commit**

Skip unless the user asked to commit.

---

### Task 5: LUR.E `appendChild` / `removeChild` wait

**Files:**
- Modify: `modules/projects/lur.e/src/lure/context/Utils.ts`
- Modify: `modules/projects/lur.e/src/lure/context/ReflectChildren.ts`

**Interfaces:**
- Consumes: `appear`, `disappear`, `waitElementAnimations`, `dispatchLifecycleEvent` from `@fest-lib/style-lib`
- Produces:
  - `export type NodeLifecycle = { appear?: AnimationOptions | null; disappear?: AnimationOptions | null }`
  - `appendChild(element, cp, mapper?, index?, lifecycle?: NodeLifecycle): Promise<any>`
  - `removeChild(element, cp, mapper?, index?, lifecycle?: NodeLifecycle): Promise<any>`
  - `removeNotExists(..., lifecycle?: NodeLifecycle): Promise<any>`
  - `makeUpdater(parent, mapper?, isArray?, lifecycle?: NodeLifecycle)` — `merge` awaits each command

- [ ] **Step 1: Write the failing test**

Create `modules/projects/lur.e/test/mapped-lifecycle.node.test.ts` using the same JSDOM prelude as `mapped.node.test.ts` (copy the global install block). Then:

```ts
const { removeChild, appendChild } = await import("../src/lure/context/Utils");

const tick = () => new Promise((r) => setTimeout(r, 5));

test("removeChild without lifecycle detaches immediately", async () => {
    const parent = document.createElement("div");
    const child = document.createElement("span");
    parent.append(child);
    await removeChild(parent, child);
    assert.equal(child.parentNode, null);
});

test("removeChild sets data-removing and waits getAnimations", async () => {
    const parent = document.createElement("div");
    const child = document.createElement("span");
    parent.append(child);
    let finished!: () => void;
    const done = new Promise<void>((resolve) => { finished = resolve; });
    child.getAnimations = () => [{ playState: "running", finished: done }];
    const pending = removeChild(parent, child);
    await tick();
    assert.equal(child.getAttribute("data-removing"), "");
    assert.equal(child.parentNode, parent);
    finished();
    await pending;
    assert.equal(child.parentNode, null);
});

test("cancel u2-before-remove leaves the node", async () => {
    const parent = document.createElement("div");
    const child = document.createElement("span");
    parent.append(child);
    child.addEventListener("u2-before-remove", (ev) => ev.preventDefault());
    await removeChild(parent, child);
    assert.equal(child.parentNode, parent);
});
```

Create `modules/projects/lur.e/scripts/run-mapped-lifecycle-tests.mjs` by copying `run-mapped-tests.mjs` and changing `entry` / `outDir` / `fileName` to `mapped-lifecycle`.

Add lure script: `"test:mapped-lifecycle": "node ./scripts/run-mapped-lifecycle-tests.mjs"`

- [ ] **Step 2: Run test to verify it fails**

```bash
cd /home/u2re-dev/U2RE.space/modules/projects/lur.e && npm run test:mapped-lifecycle
```

Expected: FAIL (`removeChild` is sync and ignores `data-removing` / cancel).

- [ ] **Step 3: Write minimal implementation**

In `Utils.ts`:

```ts
import { appear, disappear, dispatchLifecycleEvent, waitElementAnimations } from "@fest-lib/style-lib";
import type { AnimationOptions } from "@fest-lib/style-lib";

export type NodeLifecycle = {
    appear?: AnimationOptions | null;
    disappear?: AnimationOptions | null;
};

export const appendChild = async (element, cp, mapper?: Function | null, index: number = -1, lifecycle?: NodeLifecycle) => {
    // keep existing mapper / appendArray body, then:
    // after the node is in the tree:
    const node = /* the appended Element, if any */;
    if (node instanceof Element) {
        await appear(node, lifecycle?.appear ?? null);
    }
    return element;
};

export const removeChild = async (element, cp, mapper?: Function | null, index: number = -1, lifecycle?: NodeLifecycle) => {
    const $node = getNode(cp, mapper);
    if (!element) element = $node?.parentNode;
    if (Array.from(element?.childNodes ?? []).length < 1) return element;
    const whatToRemove = dePhantomNode(element, $node, index);
    if (whatToRemove?.parentNode != element) return element;
    if (whatToRemove instanceof Element) {
        if (!dispatchLifecycleEvent(whatToRemove, "u2-before-remove")) return element;
        whatToRemove.setAttribute("data-removing", "");
        await disappear(whatToRemove, lifecycle?.disappear ?? null);
        await waitElementAnimations(whatToRemove);
        whatToRemove.remove();
        whatToRemove.removeAttribute("data-removing");
        dispatchLifecycleEvent(whatToRemove, "u2-removed");
        return element;
    }
    whatToRemove?.remove?.();
    return element;
};
```

Keep the existing `appendArray` / fragment logic; only await `appear` on real Elements after `appendFix`.

`removeNotExists` must `await Promise.all` of `removeChild` for missing nodes.

In `ReflectChildren.ts` `makeUpdater`:

```ts
export const makeUpdater = (defaultParent: Node | null = null, mapper?: Function | null, isArray: boolean = true, lifecycle?: NodeLifecycle) => {
    const commandBuffer: any[] = [];
    const merge = async () => {
        const batch = commandBuffer.splice(0, commandBuffer.length);
        for (const [fn, args] of batch) await fn?.(...args, lifecycle);
    };
    // push [removeChild, [element, oldNode, null, oldIdx]] as today
    // if op requires merge, return merge() (Promise)
};
```

Callers of `makeUpdater` that ignore the return value stay valid; the detach still happens.

- [ ] **Step 4: Run the tests and make sure they pass**

`npm run test:mapped-lifecycle` — PASS for the three Utils tests (Mapped tests in Task 6).

- [ ] **Step 5: Commit**

Skip unless the user asked to commit.

---

### Task 6: Mapped / Changeable options

**Files:**
- Modify: `modules/projects/lur.e/src/lure/node/Mapped.ts`
- Modify: `modules/projects/lur.e/src/lure/node/Changeable.ts`
- Test: `modules/projects/lur.e/test/mapped-lifecycle.node.test.ts`

**Interfaces:**
- Consumes: `NodeLifecycle` fields on options
- Produces: `MappedOptions.appear`, `MappedOptions.disappear`; `ChangeableOptions` same; `makeUpdater(..., this.#options)`

- [ ] **Step 1: Write the failing test**

Append to `mapped-lifecycle.node.test.ts` (after importing `M` like `mapped.node.test.ts`):

```ts
test("Mapped without options removes instantly", async () => {
    const items = observe(["a", "b"]);
    const list = document.createElement("ul");
    const mapped: any = M(items, (item: string) => {
        const li = document.createElement("li");
        li.textContent = item;
        return li;
    }, { boundParent: list });
    mapped.elementForPotentialParent(list);
    await tick();
    items.splice(1, 1);
    await tick();
    assert.equal(list.children.length, 1);
});

test("Mapped disappear sets data-removing before detach", async () => {
    const items = observe(["a"]);
    const list = document.createElement("ul");
    let hold!: () => void;
    const gate = new Promise<void>((resolve) => { hold = resolve; });
    const mapped: any = M(items, (item: string) => {
        const li = document.createElement("li");
        li.textContent = item;
        li.getAnimations = () => [{ playState: "running", finished: gate }];
        return li;
    }, { boundParent: list, disappear: { properties: { opacity: [1, 0] }, duration: 1 } });
    mapped.elementForPotentialParent(list);
    await tick();
    items.splice(0, 1);
    await tick();
    const row = list.querySelector("li");
    assert.ok(row);
    assert.equal(row?.getAttribute("data-removing"), "");
    hold();
    await tick();
    assert.equal(list.querySelector("li"), null);
});
```

- [ ] **Step 2: Run test to verify it fails**

`npm run test:mapped-lifecycle` — FAIL (options ignored).

- [ ] **Step 3: Write minimal implementation**

`MappedOptions`:

```ts
interface MappedOptions {
    uniquePrimitives?: boolean;
    removeNotExistsWhenHasPrimitives?: boolean;
    boundParent?: Node | null;
    preMap?: boolean;
    appear?: import("@fest-lib/style-lib").AnimationOptions | null;
    disappear?: import("@fest-lib/style-lib").AnimationOptions | null;
}
```

In `Mp.makeUpdater`:

```ts
this.#updater ??= makeUpdater(basisParent, null, false, {
    appear: this.#options.appear,
    disappear: this.#options.disappear,
});
```

`[Symbol.dispose]`: use `removeChild(node.parentNode, node, null, -1, { disappear: this.#options.disappear })` instead of `parentNode.removeChild`.

Same `appear`/`disappear` fields on `ChangeableOptions`. When Changeable replaces `#oldNode`, call `removeChild` / `appendChild` with those options instead of `remove()`.

- [ ] **Step 4: Run the tests and make sure they pass**

```bash
cd /home/u2re-dev/U2RE.space/modules/projects/lur.e && npm run test:mapped-lifecycle && npm run test:mapped
```

Expected: both PASS. `test:mapped` is the existing matrix; run it because Mapped/Utils signatures changed.

- [ ] **Step 5: Commit**

Skip unless the user asked to commit.

---

### Task 7: `decor` compat aliases

**Files:**
- Modify: `modules/projects/dom.ts/src/decor/Animation.ts`
- Modify: `modules/projects/dom.ts/src/decor/Appear.ts`

**Interfaces:**
- Consumes: `appear`, `disappear`, `decorShow`, `decorHide`, `initVisibility` from `@fest-lib/style-lib`
- Produces:
  - `animateShow(el) => appear(el, decorShow)`
  - `animateHide(el) => disappear(el, decorHide)`
  - `initVisibility` re-export (second arg optional)
- Do **not** re-export `appear`/`disappear` from these files. `dom/src/index.ts` already has `export * from "@fest-lib/style-lib"`.

- [ ] **Step 1: Write the failing test**

Add to `lifecycle.node.test.ts` (or a one-file Node import of the decor path if types allow). Minimum: a style-lib assertion that `initVisibility` without the second argument does not call `appear` with `decorShow`.

```ts
import { initVisibility, decorShow } from "../src/lifecycle.ts";

test("initVisibility without animations does not auto-fade", async () => {
    const calls: any[] = [];
    const root: any = {
        querySelectorAll() { return []; },
    };
    // After implementation, observeAttributeBySelector will subscribe.
    // Probe: calling initVisibility(root) must not throw and must not require decorShow.
    await initVisibility(root);
    assert.equal(calls.length, 0);
    assert.ok(decorShow);
});
```

If `observeAttributeBySelector` needs a real DOM, skip this Node probe and instead assert `Animation.ts` source after rewrite: `animateShow` body contains `decorShow` and does not contain `target.animate`.

- [ ] **Step 2: Replace decor files**

`Animation.ts`:

```ts
import { appear, disappear, decorShow, decorHide } from "@fest-lib/style-lib";

export const animateShow = (target: any) => appear(target, decorShow);
export const animateHide = (target: any) => disappear(target, decorHide);
```

`Appear.ts`:

```ts
export { initVisibility } from "@fest-lib/style-lib";
export default initVisibility;
```

Delete the old WAAPI keyframes from `Animation.ts`.

- [ ] **Step 3: Run style-lib animation tests**

```bash
cd /home/u2re-dev/U2RE.space/modules/projects/style.ts && npm run test:animation
```

Expected: PASS.

- [ ] **Step 4: Commit**

Skip unless the user asked to commit.

---

## Self-review (coverage)

| Spec item | Task |
| --- | --- |
| `A` description only | already true; Task 1 compile does not apply |
| `doAnimation` Element-only TypeError | Task 2 |
| `bindCssAnimation` + companion + refcount | Task 1–2 |
| Trigger table including show/hide/remove | Task 1 |
| Write CSS even if unsupported | Task 2 (always writes properties) |
| `{ value }` TypeError on CSS path | Task 1 |
| `appear`/`disappear` no detach, no opts no-op | Task 3 |
| rAF + `getAnimations` wait | Task 3 + 5 |
| Events + cancel | Task 3 + 5 |
| `decorShow`/`decorHide` + `initVisibility` no auto-fade | Task 3 + 7 |
| `animateShow` = `appear(el, decorShow)` | Task 7 |
| Mapped/Changeable options | Task 6 |
| `data-removing` before detach | Task 5–6 |
| `animatable` show/hide/remove | Task 4 |
| No `CSSAnimated` / `Shape` / `*/fest` | Global Constraints |

No TBD. `appendChild`/`removeChild` become `async`; existing sync callers may ignore the Promise — detach still occurs.
