# Task 1 brief

Source: docs/superpowers/plans/2026-09-02-style-lib-animation.md

## Global Constraints
- Spec: docs/superpowers/specs/2026-09-02-style-lib-animation-design.md
- SoT is modules/projects/style.ts. Do not edit copies under */fest.
- doAnimation never writes CSS. bindCssAnimation never calls element.animate().
- Wrong target or trigger: { value } on the CSS path → TypeError. No silent fallback.
- Missing A / options → no animation.
- Do not touch CSSAnimated.ts or Shape.ts.
- Do not git commit.
- Do not implement bindCssAnimation in this task.

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

