# Task 1 Report: Compile helpers (keyframes + triggers)

## What I implemented

- **`src/css-animation.ts`** — compile helpers per spec:
  - `compileKeyframesCss` — builds `@keyframes fest-anim-*` from property arrays/maps, with fingerprint + hash name
  - `compileTriggerCss` — maps lifecycle/interaction triggers to selectors and animation-* properties
  - `isReactiveTrigger` — detects `{ value }` objects (excluding scroll/view driven)
  - `resolveCssAnimationTarget` — resolves CSSStyleRule/Sheet/Declaration targets (stub for later bindCssAnimation)
  - Re-exports `ANIM_LAYER`
- **`src/types.ts`** — extended `AnimatableTrigger` with `show`/`hide`/`remove`; added `CssAnimationOptions`; made `AnimationOptions.properties` optional
- **`src/constants.ts`** — added `ANIM_LAYER = "ux-anim"` and `ANIM_TRIGGER_NAME = "--fest-t"`
- **`src/index.ts`** — `export * from "./css-animation"`
- **`test/css-animation.node.test.ts`** — 4 tests from brief
- **`scripts/run-animation-tests.mjs`** — Vite bundle + `node --test` runner (skips missing lifecycle test)
- **`package.json`** — `"test:animation"` script

Did **not** implement `bindCssAnimation`.

## TDD Evidence

### RED

Command:
```bash
cd modules/projects/style.ts && node --experimental-strip-types --test ./test/css-animation.node.test.ts
```

Output (before `css-animation.ts` existed):
```
Error [ERR_MODULE_NOT_FOUND]: Cannot find module '.../style.ts/src/css-animation.ts'
 imported from .../test/css-animation.node.test.ts
✖ test/css-animation.node.test.ts
ℹ pass 0  ℹ fail 1
```

### GREEN

Command:
```bash
cd modules/projects/style.ts && npm run test:animation
```

Output:
```
✔ compileKeyframesCss emits @keyframes from property arrays
✔ same payload shares fingerprint
✔ compileTriggerCss maps lifecycle and interaction triggers
✔ reactive trigger is detected and compileTriggerCss throws
ℹ tests 4  ℹ pass 4  ℹ fail 0
```

Note: bare `node --experimental-strip-types --test` still fails after implementation because extensionless relative imports (`./constants`, `@fest-lib/core`) do not resolve under Node ESM without bundling. The Vite runner aliases `@fest-lib/core` → sibling SoT and bundles each test entry.

## Files changed

| File | Action |
|------|--------|
| `src/css-animation.ts` | Created |
| `src/types.ts` | Modified |
| `src/constants.ts` | Modified |
| `src/index.ts` | Modified |
| `test/css-animation.node.test.ts` | Created |
| `scripts/run-animation-tests.mjs` | Created |
| `package.json` | Modified |

## Self-review findings

- Implementation matches brief verbatim; no `bindCssAnimation`, no edits to `CSSAnimated.ts` / `Shape.ts` / `*/fest` copies.
- `resolveCssAnimationTarget` is present but untested in this task (deferred to lifecycle/bind task).
- `normalizeIterationCount` return type is `number | "Infinity"` but runtime returns numeric `Infinity`; the `"Infinity"` string branch in `compileTriggerCss` is dead code from the brief — harmless.
- Making `properties` optional on `AnimationOptions` is safe: existing `Animate.ts` already guards with `typeof` / `Array.isArray` checks.
- `ANIM_LAYER` lives in `constants.ts` and is re-exported from `css-animation.ts` as specified.

## Concerns

- **Direct Node runner**: `node --experimental-strip-types --test test/css-animation.node.test.ts` cannot run unbundled in this package (extensionless imports + `@fest-lib/core`). CI/dev should use `npm run test:animation` until an import-map or `.ts` extension policy is adopted repo-wide.
- **`resolveCssAnimationTarget` untested**: throws on Element/CSS edge cases with no coverage yet; acceptable for wave 1 but worth tests in Task 2+.

## Review fix: ambiguous ANIM_LAYER export

### What changed

Removed `export { ANIM_LAYER }` from `src/css-animation.ts`. `ANIM_LAYER` is now exported only via `src/constants.ts` → `index.ts`. Internal import in `css-animation.ts` retained.

### Test command + output

```bash
cd /home/u2re-dev/U2RE.space/modules/projects/style.ts && npm run test:animation
```

```
✔ compileKeyframesCss emits @keyframes from property arrays
✔ same payload shares fingerprint
✔ compileTriggerCss maps lifecycle and interaction triggers
✔ reactive trigger is detected and compileTriggerCss throws
ℹ tests 4  ℹ pass 4  ℹ fail 0
```

### Files changed

| File | Action |
|------|--------|
| `src/css-animation.ts` | Modified — removed duplicate `ANIM_LAYER` re-export |
