# Task 2 Report: bindCssAnimation + refcount

## What I implemented

- **`src/maps.ts`** — `animKeyframeRefs` shared Map (`style.ts@animKeyframeRefs`) holding `{ name, count, keyframesRule, hosts }`.
- **`src/css-animation.ts`** — `bindCssAnimation(target, options) => Cleanup`:
  - Duck-types sheet **before** `instanceof`: `insertRule` + `cssRules` + `options.selector`.
  - Inserts `@keyframes` once per fingerprint; companion rule per bind.
  - Cleanup decrements refcount; last owner deletes keyframes + map entry.
  - Never calls `element.animate()`. Does not re-export `ANIM_LAYER`.
  - `resolveCssAnimationTarget` now guards `typeof Element !== "undefined"` before `instanceof` (Node).
- **`src/Animate.ts`** — `doAnimation` TypeError if not an Element (DOM) or no `.animate` (Node).
- **`test/css-animation.node.test.ts`** — appended 3 cases from the brief.

Did **not** git commit. Did **not** edit `*/fest` copies.

## TDD Evidence

### RED

Command:
```bash
cd /home/u2re-dev/U2RE.space/modules/projects/style.ts && npm run test:animation
```

Output (tests appended, `bindCssAnimation` not exported):
```
[MISSING_EXPORT] "bindCssAnimation" is not exported by "src/css-animation.ts".
```

Vite fails at bundle time (equivalent to the brief’s “not a function”). Bare `node --experimental-strip-types --test` still cannot resolve `@fest-lib/core`.

### GREEN

Same command after implementation + Element guard:

```
✔ compileKeyframesCss emits @keyframes from property arrays
✔ same payload shares fingerprint
✔ compileTriggerCss maps lifecycle and interaction triggers
✔ reactive trigger is detected and compileTriggerCss throws
✔ doAnimation rejects non-Element
✔ resolveCssAnimationTarget rejects Element
✔ bindCssAnimation writes keyframes and companion, refcount drops on cleanup
ℹ tests 7  ℹ pass 7  ℹ fail 0
```

First GREEN attempt: 6/7 — `resolveCssAnimationTarget` threw `ReferenceError: Element is not defined` on Node. Guarded `instanceof Element`; re-run 7/7.

## Files changed

| File | Action |
|------|--------|
| `test/css-animation.node.test.ts` | Modified — append 3 tests + imports |
| `src/maps.ts` | Modified — `animKeyframeRefs` |
| `src/css-animation.ts` | Modified — `bindCssAnimation`, Element guard |
| `src/Animate.ts` | Modified — `doAnimation` Element / `.animate` guard |

## Concerns

- **Duck-typed `@layer` leftovers:** `getOrCreateLayerRule` `insertRule`s `@layer ux-anim {}` on the fake sheet, then `isLayerBlockRule` fails in Node (`CSSLayerBlockRule` undefined), so bind writes keyframes/companion on the sheet itself. Extra `@layer` rules stay; tests only assert `@keyframes` / companion.
- **`serializeValue` still uses unguarded `instanceof Element`** — not hit by current tests (numeric values).
- **Direct Node runner** still unusable without the Vite bundle (`npm run test:animation`).
- **Refcount is process-global** via `Symbol.for` — correct for HMR, but leftover count after a crashed cleanup would pin keyframes until reload.

## Review fixes (Important)

- **`bindCssAnimation` multi-host:** if the fingerprint exists but `host` is not in `entry.hosts`, insert `@keyframes` on that host and add it to the set. Per-host count: cleanup removes keyframes from **this** host when that host’s last bind drops; map entry deleted only when global count hits 0 (leftover hosts swept).
- **`serializeValue`:** `typeof Element !== "undefined" && value instanceof Element` so Node/Vite does not throw `ReferenceError`.
- **Test:** two duck-typed sheets, same `options.selector` / `properties`; both contain `@keyframes` after first bind each; after both cleanups, neither has `@keyframes`.

Did **not** git commit. Did **not** edit `*/fest`.

### Re-run

Command:
```bash
cd /home/u2re-dev/U2RE.space/modules/projects/style.ts && npm run test:animation
```

```
✔ compileKeyframesCss emits @keyframes from property arrays
✔ same payload shares fingerprint
✔ compileTriggerCss maps lifecycle and interaction triggers
✔ reactive trigger is detected and compileTriggerCss throws
✔ doAnimation rejects non-Element
✔ resolveCssAnimationTarget rejects Element
✔ bindCssAnimation writes keyframes and companion, refcount drops on cleanup
✔ bindCssAnimation inserts @keyframes on each host sharing a fingerprint
ℹ tests 8  ℹ pass 8  ℹ fail 0
```
