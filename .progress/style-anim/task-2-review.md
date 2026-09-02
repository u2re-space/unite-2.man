# Task 2 review: bindCssAnimation + refcount

Gate: task-scoped (brief + binding spec constraints). Not a merge review.
Diff: `.progress/style-anim/task-2-diff.patch`. Tests not re-run.

## Verdict

- **Spec compliance:** ✅
- **Task quality:** Issues (Important)

## Spec compliance

Matches the task brief and the spec constraints that bind this task.

**Present (required):**

- `src/maps.ts` — `animKeyframeRefs` via `shared("style.ts@animKeyframeRefs", …)` with `{ name, count, keyframesRule, hosts }`
- `src/css-animation.ts` — `export const bindCssAnimation = (target, options) => Cleanup`
  - Duck-types `insertRule` + `cssRules` + `options.selector` **before** `instanceof` / `resolveCssAnimationTarget`
  - Inserts `@keyframes` once per fingerprint; companion per bind (`[data-removing]` + `animation-name` for `trigger: "remove"`)
  - Cleanup decrements count; last owner deletes keyframes + map entry; idempotent (`dead`)
  - Never calls `element.animate()`; does not re-export `ANIM_LAYER` (imports from `constants`)
- `src/Animate.ts` — `doAnimation` TypeError when `Element` exists and `!(el instanceof Element)`, or when `Element` is undefined and there is no `.animate`
- `test/css-animation.node.test.ts` — three appended cases match the brief (including unused `FakeEl` scaffolding)
- `{ value }` trigger still TypeError via `compileTriggerCss` (called before any `insertRule` of keyframes/companion)
- Wrong target TypeError via `resolveCssAnimationTarget` (Element / unknown / sheet without `selector`)
- `doAnimation` still WAAPI-only (`element.animate`); no CSSOM writes
- SoT only (`modules/projects/style.ts`). `*/fest/style-lib` paths are existing directory symlinks to `style.ts/src`, not edited copies
- No commit

**Extra (allowed):**

- Duck-type also requires `target.cssRules` (brief prose asked for it; the Step 3 snippet omitted it)
- `resolveCssAnimationTarget` now guards `typeof Element !== "undefined"` before `instanceof` (needed in this Vite runner; report: first GREEN was 6/7 with `ReferenceError: Element is not defined`)
- Tests run via `npm run test:animation` (brief’s bare `node --experimental-strip-types --test` still cannot resolve `@fest-lib/core`)

**Not counted as misses (brief-locked vs design spec):**

- Design table asks `animation-timeline` on scroll/view; Task 1 `compileTriggerCss` (consumed here) still writes `timeline-trigger` + range only
- `hosts` is allocated and `.add`ed exactly as the prescribed snippet; per-host insert/delete was not in that snippet
- Plan overview line “Animate.ts re-export bind helpers” is not in the Task 2 file list; public export is `index.ts` `export * from "./css-animation"` (Task 1)

## Quality

### Important

1. **Same fingerprint on a second stylesheet never gets `@keyframes`.**
   `animKeyframeRefs` is process-global. Reuse skips `insertRule(compiled.cssText)` even when `host` is new. `entry.hosts` is written and never read; last cleanup `deleteRule`s only the closing bind’s `host`, then drops the map entry. A second adopted sheet gets a companion `animation-name` with no local `@keyframes` (silent no-play), and the first sheet can leak the keyframes rule.
   Fix: if this `host` is not in `entry.hosts` (or has no matching rule), insert keyframes there; on count 0, delete the rule from every host.

2. **`serializeValue` still uses unguarded `instanceof Element`.**
   This runner has no `Element` (same crash they patched on `resolveCssAnimationTarget` / `doAnimation`). `bindCssAnimation` always calls `compileKeyframesCss` → `serializeValue`. Numeric tests pass; a reactive slot `{ value }` in a property (spec: snapshot at bind, not a trigger TypeError) throws `ReferenceError` instead of snapshotting.
   Fix: `typeof Element !== "undefined" && value instanceof Element`, same as the other two guards.

### Minor

3. **Duck-typed `@layer` leftovers.** `getOrCreateLayerRule` `insertRule`s `@layer ux-anim {}`; `isLayerBlockRule` is false when `CSSLayerBlockRule` is undefined, so bind writes on the sheet and never removes the empty layer. Browser CSSOM should attach to the layer. Tests only assert `@keyframes` / companion.
4. **No direct `bindCssAnimation(Element)` or `bindCssAnimation(…, { trigger: { value } })` cases.** Covered transitively (`resolveCssAnimationTarget` / `compileTriggerCss`). Fine for this gate.
5. **`.tmp-tests/` still unignored** in `style.ts` (Task 1 minor; runner still writes it).

### Not issues for this gate

- Global leftover count after a crashed cleanup (report). Inherent to `Symbol.for` shared maps; reload clears it.
- `doAnimation` accepting `{ animate }` only when `Element` is undefined. Brief-prescribed Node path; browser still requires `instanceof Element`.
- `createReactiveAnimation` / the rest of `doAnimation` unchanged (no CSS writes).

## Constraints held

| Constraint | Result |
| --- | --- |
| SoT `style.ts` only; no `*/fest` file edits | held (symlinks) |
| `bindCssAnimation` never calls `element.animate()` | held |
| Wrong target or `{ value }` trigger → `TypeError` | held |
| `doAnimation` never writes CSS | held |
| No full lure/app suites, no commit | held |

## Evidence

RED/GREEN in the implementer report is consistent with the tree (`[MISSING_EXPORT] bindCssAnimation`, then 7/7 after the Element guard). Not re-run.
