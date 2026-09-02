# Task 4 brief

## Prior facts
- Green: cd modules/projects/style.ts && npm run test:animation (currently 15 tests)
- makeEl helper lives in test/lifecycle.node.test.ts — extend that file or add animatable.node.test.ts and list it in scripts/run-animation-tests.mjs
- Do not git commit. Do not edit */fest.
- CustomEvent may need a small global polyfill in the test file.

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

