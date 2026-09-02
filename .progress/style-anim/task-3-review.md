# Task 3 review: appear / disappear / lifecycle

Gate: task-scoped (brief + binding spec constraints). Not a merge review.
Tests not re-run. No source mutation.

## Verdict

- **Spec compliance:** ❌
- **Task quality:** Issues

## Spec compliance

Surface APIs and the global invariants that do not depend on keyframe payload are present. The WAAPI contract is not: the prescribed `appear` payload and `decorShow` never become real frames.

**Present (required):**

- `src/lifecycle.ts` — `appear`, `disappear`, `waitElementAnimations`, `dispatchLifecycleEvent`, `decorShow`, `decorHide`, `initVisibility`
- `src/index.ts` — `export * from "./lifecycle"`
- `test/lifecycle.node.test.ts` — brief cases plus cancel-`u2-before-show`
- No options / `null` payload → no `el.animate` (`hasPayload`)
- `disappear` never calls `removeChild` / detach
- Cancel of `u2-before-show` / `u2-before-hide` returns `false` and skips WAAPI
- `initVisibility` second arg is opt-in; omitted `appear`/`disappear` stay event-only (no auto `decorShow`)
- `doAnimation` never writes CSS (WAAPI `element.animate` only)
- SoT only (`modules/projects/style.ts`). No `*/fest` file edits, no `CSSAnimated.ts` / `Shape.ts`, no commit
- Header `FIND:style-anim` / `INVARIANT: disappear never detaches. No opts → no WAAPI`

**Miss (spec-binding):**

- Design: `appear` / `disappear` run WAAPI **from the passed `AnimationOptions`**. Plan: no silent fallback.
- `appear(el, { properties: { opacity: [0, 1] }, duration: 1 })` and `appear(el, decorShow)` do **not** drive keyframes via `doAnimation`. `parsePropertyList` only accepts string or array `properties`; object form (the brief test, `decorShow` / `decorHide`, and `css-animation.ts` `asPropertyList`) yields `[]`, then `buildWebAnimationKeyframes` throws `"No animatable properties found in A template"`.
- `play()` catches **any** `doAnimation` throw and calls `el.animate([], {})`. After the duck-type `.animate` guard, this is no longer an `instanceof Element` workaround — it is the happy path for the official payload. Empty frames on real `Element`s too.
- `doAnimation` also ignores `config.keyframes` and its unused third `Map` argument, so `appear(el, { keyframes: A\`…\` })` hits the same empty `animate()`.

**Extra (allowed):**

- `CustomEvent` polyfill on `globalThis` (Node)
- Observer import from `dom.ts/src/mixin/Observer.ts` instead of `@fest-lib/dom` (barrel cycle / `OffscreenCanvas`; justified)
- `doAnimation` duck-typed `.animate` (brief-required)
- `types.ts` `properties` widened to `Record<string, any>` (type-only; runtime parse still broken)
- Rolldown: `play` types `options` as required `| null | undefined`

**Not counted as misses (brief-locked vs design spec):**

- In-flight show canceling hide (design §Lifecycle). Not in the Task 3 snippet; LUR.E / later tasks.
- `appear({})` TypeError only when `Element` exists and there is no `.animate`. Same guard as the brief snippet.
- `initVisibility` Node probe deferred (report: Task 7)
- Brief’s own `catch { el.animate([], {}) }` was authorized **only** for `instanceof Element` on fake els, and preferred `el.animate(buildFrames(options), timing)`. Duck-type was implemented; empty frames were not the remaining authorized path.

## Quality

### Critical

1. **Object-form options and `decorShow` silently play empty WAAPI.**
   `play()` → `doAnimation` → `parsePropertyList` drops `{ opacity: [0, 1] }` / `{ "--opacity": [0, 0, 1], … }` → throw → `el.animate([], {})`.
   Tests pass because they only assert `el.animations.length === 1`, not `frames` / timing. `decor presets exist` never calls `appear`/`disappear`.
   Implementer report already names this. It is a Task 3 miss, not a later polish item: the brief test payload and the named fade presets are inert.
   Fix: teach `parsePropertyList` the same object / `keyframes` Map path as `asPropertyList` in `css-animation.ts`; delete the empty-`animate` catch (or pass built frames, never `[]`). Assert `el.animations[0].frames` contains `opacity` / `--opacity`.

### Important

2. **GREEN does not prove WAAPI content.** Count-only “appear with options plays WAAPI” and “decor presets exist” hide Critical 1. Same gap for `disappear` (no-detach test never inspects frames).

3. **`waitElementAnimations` order vs spec.** Spec: await the started player’s `finished`, then one rAF, then remaining `getAnimations()` `running`/`pending`. Impl discards the `doAnimation` return and rAFs first. Fine when the empty fallback already registered a resolved `finished`; wrong if the real player is not yet in `getAnimations()` or if `doAnimation` throws before the catch (after-event still fires, `true` still returned).

4. **`animate()` helper is the same dead path.** It builds a `Map` and passes it as `doAnimation`’s third argument; that argument is unused. Not introduced here, but Task 3 consumes `doAnimation` as the only writer.

### Minor

5. **`initVisibility` untested** (observer unused by current lifecycle tests). Acceptable if Task 7 owns it.
6. **After-event on swallowed failure.** `u2-appear` / `u2-hidden` dispatch even when `doAnimation` threw and only `[]` ran.

### Not issues for this gate

- CustomEvent polyfill, Observer SoT import, no `@fest-lib/lure` alias.
- `data-instant` / `prefers-reduced-motion` skip both play and wait.
- Report RED/GREEN narrative matches the tree (module-not-found, then 13/13). Not re-run.

## Constraints held

| Constraint | Result |
| --- | --- |
| SoT `style.ts` only; no `*/fest` file edits | held |
| `disappear` never detaches | held |
| No opts → no WAAPI | held |
| `doAnimation` never writes CSS | held |
| No silent fallback | **broken** (`el.animate([], {})`) |
| No full lure/app suites, no commit | held |

## Evidence

Static: `lifecycle.ts` `play` catch; `Animate.ts` `parsePropertyList` + `buildWebAnimationKeyframes` empty throw; `css-animation.ts` `asPropertyList` already accepts object form; tests assert count / `properties` presence only. Report Concerns paragraph agrees. Tests not re-run.
