# Task 1 review: Compile helpers (keyframes + triggers)

Gate: task-scoped (brief + binding spec constraints). Not a merge review.
Diff: `.progress/style-anim/task-1-diff.patch`. Tests not re-run.

## Verdict

- **Spec compliance:** ✅
- **Task quality:** Issues (Important)

## Spec compliance

Matches the task brief and the spec constraints that bind this task.

**Present (required):**

- `src/css-animation.ts` — `compileKeyframesCss`, `compileTriggerCss`, `isReactiveTrigger`, `resolveCssAnimationTarget`; re-exports `ANIM_LAYER`
- `src/types.ts` — `AnimatableTrigger` + `show`/`hide`/`remove`; `CssAnimationOptions`; `AnimationOptions.properties` optional
- `src/constants.ts` — `ANIM_LAYER = "ux-anim"`, `ANIM_TRIGGER_NAME = "--fest-t"`
- `src/index.ts` — `export * from "./css-animation"`
- `test/css-animation.node.test.ts` — four tests, same as the brief
- `scripts/run-animation-tests.mjs` + `package.json` `test:animation`
- No `bindCssAnimation`
- No edits to `CSSAnimated.ts`, `Shape.ts`, or `*/fest` copies
- SoT only (`modules/projects/style.ts`; `style-lib.ts` is an existing symlink to `index.ts`)
- `{ value }` trigger → `TypeError` (no silent fallback)
- Element target → `TypeError` in `resolveCssAnimationTarget`
- Header `FIND:style-anim` / `INVARIANT: never call element.animate()`
- No commit

**Extra (allowed):**

- Test runner uses the Vite + `node --test` pattern (brief fallback when `--experimental-strip-types` cannot resolve extensionless / `@fest-lib/core` imports). Skips missing `lifecycle.node.test.ts`. Adds `--test-force-exit` like `lur.e/scripts/run-mapped-tests.mjs`.

**Not counted as misses (brief-locked vs design spec):**

- Design table asks `animation-timeline` on scroll/view; the prescribed `compileTriggerCss` writes `timeline-trigger` + range only.
- Design table asks `reverseOnExit` on hover **and** focus; the prescribed file handles hover only.

Those belong in a later bind/compile pass if the spec table is enforced. This task was given a full file.

## Quality

### Important

1. **Ambiguous `ANIM_LAYER` on the public barrel.**  
   `index.ts` already does `export * from "./constants"` (now includes `ANIM_LAYER`). `css-animation.ts` also `export { ANIM_LAYER }`, and index star-exports that module. Two `export *` of the same name is a TypeScript `TS2308` / ESM ambiguous export: `import { ANIM_LAYER } from "@fest-lib/style-lib"` via the source alias can fail or omit the binding. Same value, but the barrel is now unsafe.  
   Fix: drop the re-export from `css-animation.ts`, or named-export the compile helpers from `index.ts` and leave `ANIM_LAYER` on `constants` only.

### Minor

2. **`style.ts` has no `.tmp-tests/` gitignore.** The new runner writes `.tmp-tests/animation`. `lur.e`, `object.ts`, and `uniform.ts` already ignore that directory.
3. **`AnimationOptions.properties` is still `Record<string, any>[] | string`.** Tests and `animate()` use the object-of-arrays form `{ opacity: [0, 1] }`. Optional-only matches the brief; the type still does not describe the payload the tests pass.
4. **`asPropertyList` mishandles `Record<string, any>[]` keyframe lists** (e.g. `[{ opacity: 0 }, { opacity: 1 }]` → two one-value props, both frames collapse). Prescribed code; this task’s tests and Task 2 samples use the object-of-arrays form, so it does not fail the wave. The `keyframes` Map path (from `A`) is fine.

### Not issues for this gate

- `resolveCssAnimationTarget` is untested (brief did not require it here).
- `normalizeIterationCount` `"Infinity"` string branch is dead (noted in the implementer report; harmless).
- Making `properties` optional does not break `doAnimation` / `parsePropertyList` (they already treat a missing array as empty). `animate()` still assumes `properties` is an object; that was already true.

## Constraints held

| Constraint | Result |
| --- | --- |
| SoT `style.ts` only | held |
| No `bindCssAnimation` | held |
| `doAnimation` / `element.animate()` untouched | held |
| `{ value }` → `TypeError` | held |
| No `CSSAnimated.ts` / `Shape.ts` | held |
| No full lure/app suites, no commit | held |

## Evidence

RED/GREEN in the implementer report is consistent with the tree (module missing, then Vite runner). Not re-run.

---

## Re-review (ANIM_LAYER export)

Gate: confirm the Important barrel collision is gone. Tests not re-run (report: 4/4 via `npm run test:animation`).

### Verdict

- **Spec compliance:** ✅
- **Task quality:** Approved

### Confirm

- `css-animation.ts` header still has `FIND:style-anim` / `INVARIANT: never call element.animate()`.
- `ANIM_LAYER` appears once in that file: `import { ANIM_LAYER, ANIM_TRIGGER_NAME } from "./constants"` (internal use). No `export { ANIM_LAYER }`.
- Public binding is `constants.ts` (`export const ANIM_LAYER = "ux-anim"`) → `index.ts` `export * from "./constants"`. `export * from "./css-animation"` no longer duplicates the name.

Previous Important (ambiguous `ANIM_LAYER` on the public barrel) is resolved. No remaining Critical or Important.

Minors from the first review are unchanged and non-blocking: missing `.tmp-tests/` gitignore; `AnimationOptions.properties` type still omits the object-of-arrays form; prescribed `asPropertyList` array-of-records path.
