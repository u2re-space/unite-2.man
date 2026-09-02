# Task 3 Report: appear / disappear / decorShow / initVisibility

## What I implemented

- **`src/lifecycle.ts`** — `appear`, `disappear`, `waitElementAnimations`, `dispatchLifecycleEvent`, `decorShow`, `decorHide`, `initVisibility`.
  - No options → no WAAPI. `disappear` never detaches.
  - Cancel of `u2-before-show` / `u2-before-hide` returns `false`.
  - CustomEvent polyfill on `globalThis` when Node lacks it.
  - `initVisibility` observes `data-hidden`; second arg is opt-in (no auto `decorShow`).
- **`src/index.ts`** — `export * from "./lifecycle"`.
- **`src/Animate.ts`** — `doAnimation` accepts `instanceof Element` **or** duck-typed `.animate`. Still TypeError for `{}`.
- **`src/types.ts`** — `properties` also accepts a `Record<string, any>` (object form used by decor presets and tests).
- **`test/lifecycle.node.test.ts`** — brief cases + cancel contract + CustomEvent polyfill.

Did **not** git commit. Did **not** edit `*/fest`, `CSSAnimated.ts`, or `Shape.ts`.

## TDD Evidence

### RED

Command:
```bash
cd /home/u2re-dev/U2RE.space/modules/projects/style.ts && node --experimental-strip-types --test test/lifecycle.node.test.ts
```

```
Error [ERR_MODULE_NOT_FOUND]: Cannot find module '.../src/lifecycle.ts'
ℹ tests 1  ℹ pass 0  ℹ fail 1
```

### GREEN

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
✔ appear without options is a no-op and does not animate
✔ appear with options plays WAAPI
✔ disappear does not detach
✔ decor presets exist
✔ appear returns false when u2-before-show is canceled
ℹ tests 13  ℹ pass 13  ℹ fail 0
```

8 css-animation + 5 lifecycle.

## Files changed

| File | Action |
|------|--------|
| `src/lifecycle.ts` | Created |
| `test/lifecycle.node.test.ts` | Created |
| `src/index.ts` | Modified — export lifecycle |
| `src/Animate.ts` | Modified — duck-typed `.animate` |
| `src/types.ts` | Modified — object `properties` |

## Concerns

- **`@fest-lib/dom` barrel is unsafe here.** First GREEN attempt bundled `dom.ts/src/index.ts` and crashed on `OffscreenCanvas` (also a style-lib ↔ dom cycle). `lifecycle.ts` imports `Observer.ts` SoT instead. `@fest-lib/lure` alias was **not** needed.
- **`play()` catch fallback (fixed 2026-09-02):** object-form now parses; empty `el.animate([], {})` is gone.
- **`play()` TypeError** only when `Element` exists and the target has no `.animate`. Node without `Element` + `{}` does not throw (same as the brief snippet).
- **Rolldown:** optional `options?` before required `before`/`after` failed transform; typed as `options: T | null | undefined`.
- **`initVisibility` Node probe** not added (Task 7). Observer import is unused by the current lifecycle tests.

Did **not** git commit. Did **not** edit `*/fest`.

## Critical fix (2026-09-02)

Object-form `{ properties: { opacity: [0, 1] } }` and `decorShow`/`decorHide` now emit real WAAPI frames. `play()` no longer treats `el.animate([], {})` as success.

### What changed

- **`src/Animate.ts`** — `parsePropertyList` accepts a record of arrays, an optional `Map` from `animate()`, and `options.keyframes.properties`. `doAnimation` forwards that Map. Exported `buildWebAnimationKeyframes` / `buildAnimationTiming`.
- **`src/lifecycle.ts`** — object-form routes through `animate()`. Catch only rethrows unless `TypeError` mentions Element **and** `el.animate` exists; fallback then passes real frames/timing.
- **`test/lifecycle.node.test.ts`** — `appear({ opacity: [0, 1] })` and `appear(el, decorShow)` assert recorded opacity keyframes (not `[]`).

### Re-run

```bash
cd /home/u2re-dev/U2RE.space/modules/projects/style.ts && npm run test:animation
```

```
✔ appear with options plays WAAPI
✔ appear with decorShow plays opacity keyframes
ℹ tests 14  ℹ pass 14  ℹ fail 0
```

8 css-animation + 6 lifecycle.

Did **not** git commit. Did **not** edit `*/fest`.

## Important (2026-09-02)

Player `finished` then rAF; show-during-hide cancel.

### What changed

- **`src/lifecycle.ts`** — `play()` awaits the started WAAPI player's `finished` (`.catch` cancel), then `waitElementAnimations` (rAF + `getAnimations`).
- **`WeakMap<Element, { kind: "show"|"hide", cancel() }>`** — `appear` cancels in-flight hide; `disappear` cancels in-flight show. Cancelled hide returns `false` and does not dispatch `u2-hidden`.
- **`test/lifecycle.node.test.ts`** — never-resolving hide `finished`, then `appear`; hide resolves `false` without `u2-hidden`.

### Re-run

```bash
cd /home/u2re-dev/U2RE.space/modules/projects/style.ts && npm run test:animation
```

```
✔ appear cancels in-flight disappear
ℹ tests 15  ℹ pass 15  ℹ fail 0
```

8 css-animation + 7 lifecycle.

Did **not** git commit. Did **not** edit `*/fest`.
