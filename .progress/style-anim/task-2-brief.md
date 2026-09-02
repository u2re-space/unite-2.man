# Task 2 brief

Source: docs/superpowers/plans/2026-09-02-style-lib-animation.md

## Global Constraints
- SoT is modules/projects/style.ts. Do not edit */fest copies.
- bindCssAnimation never calls element.animate().
- Wrong target or trigger { value } → TypeError.
- Do not git commit.
- Do not run full lure npm test or app builds.

## Prior-task facts the brief cannot know
- ANIM_LAYER lives only in constants.ts; css-animation.ts must import it, not re-export it.
- Tests run via `npm run test:animation` (Vite bundle). Bare node --test cannot resolve @fest-lib/core.
- run-animation-tests.mjs already exists and should keep skipping missing lifecycle.test until Task 3.
- compileKeyframesCss / compileTriggerCss / resolveCssAnimationTarget already exist.

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

