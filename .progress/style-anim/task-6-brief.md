# Task 6 Brief: Mapped / Changeable appear/disappear

Plan: `docs/superpowers/plans/2026-09-02-style-lib-animation.md` Task 6.
Spec: `docs/superpowers/specs/2026-09-02-style-lib-animation-design.md`

## AI-READ (do not miss)

`Mp.makeUpdater` creates an updater, but `_onUpdate` **does not call it**.
Mapped DOM mutations go through `#syncBoundParent` (`parentNode.removeChild` +
`insertBefore`). Wiring lifecycle only into `makeUpdater` will leave the plan
tests red. Thread options into `makeUpdater` **and** use Utils `removeChild` /
`appear` inside `#syncBoundParent` / `[Symbol.dispose]`.

Changeable **does** call `#updater` — `replaceChildren` is now async and awaits
`appendChild` / `appear`. Pass `{ appear, disappear }` into `makeUpdater`.
When `#oldNode` is replaced or `boundParent` changes, use Utils `removeChild`
instead of `.remove()`.

## Do

1. TDD: append the two plan tests to `test/mapped-lifecycle.node.test.ts`
   (import `observe` + `M` like `mapped.node.test.ts`).
2. RED: `npm run test:mapped-lifecycle` — options ignored / raw `removeChild`.
3. Implement:
   - `MappedOptions.appear` / `disappear` (`AnimationOptions | null`)
   - `ChangeableOptions` same
   - `makeUpdater(..., { appear: this.#options.appear, disappear: this.#options.disappear })`
   - `#syncBoundParent`: outgoing nodes → `await removeChild(parent, oldNode, null, -1, lifecycle)`
   - entering Elements (not already in parent) → insert as today, then `await appear(node, lifecycle.appear)`
   - serialize overlapping `#queueBoundParentSync` so a second splice waits for the first remove
   - `[Symbol.dispose]` → `removeChild(node.parentNode, node, null, -1, { disappear: this.#options.disappear })` (void ok)
4. GREEN: `npm run test:mapped-lifecycle && npm run test:mapped`
5. Report: `.progress/style-anim/task-6-report.md`

## Do not

- git commit
- edit `*/fest`
- edit `Queries.ts` (symlink), `CSSAnimated.ts`, `Shape.ts`
- full lure `npm test`, `npm run build`, deploy

## Constraints

- No options → instant DOM (rAF wait from `appear`/`disappear` is ok; 5ms `tick` covers it).
- `disappear` never detaches; Utils `removeChild` detaches after wait.
- Cancel `u2-before-remove` leaves the node.
- Do not star-export appear from `dom/decor`.
