# Task 6 Report: Mapped / Changeable appear/disappear

## What I implemented

- **`MappedOptions` / `ChangeableOptions`** — `appear` / `disappear` (`AnimationOptions | null`).
- **`Mp.makeUpdater` / `Ch.makeUpdater`** — pass `{ appear, disappear }` into `makeUpdater`.
- **`#syncBoundParent`** — outgoing → Utils `removeChild`; entering Elements with `appear` → insert then `await appear`. Overlapping `#queueBoundParentSync` serializes (second splice waits for the first remove).
- **`[Symbol.dispose]`** — Utils `removeChild(..., { disappear })`; no-options path still detaches sync.
- **Changeable `boundParent`** — Utils `removeChild` instead of `.remove()`.
- **Tests** — plan pair appended to `test/mapped-lifecycle.node.test.ts` (imports `observe` + `M`).

Did **not** git commit. Did **not** edit `*/fest`. Did **not** run full lure `npm test`.

## TDD Evidence

### RED

Command:
```bash
cd /home/u2re-dev/U2RE.space/modules/projects/lur.e && npm run test:mapped-lifecycle
```

```
✔ Mapped without options removes instantly
✖ Mapped disappear sets data-removing before detach
  AssertionError: assert.ok(row)  →  actual null
ℹ tests 6  ℹ pass 5  ℹ fail 1
```

Raw `parentNode.removeChild` detached immediately; `data-removing` never set.

### GREEN

Command:
```bash
cd /home/u2re-dev/U2RE.space/modules/projects/lur.e && npm run test:mapped-lifecycle && npm run test:mapped
```

```
test:mapped-lifecycle  ℹ tests 6   ℹ pass 6   ℹ fail 0
test:mapped            ℹ tests 13  ℹ pass 13  ℹ fail 0
```

## Files changed

| File | Action |
|------|--------|
| `src/lure/node/Mapped.ts` | Modified — options, `#syncBoundParent`, dispose, sync preMap |
| `src/lure/node/Changeable.ts` | Modified — options, `makeUpdater` lifecycle, `removeChild` |
| `test/mapped-lifecycle.node.test.ts` | Modified — two plan tests + `observe`/`M` |

## Concerns

- **`#syncBoundParent` is the real Mapped DOM path.** Wiring lifecycle only into `makeUpdater` leaves splice tests red (`_onUpdate` never calls `#updater`).
- **No-options stay instant.** `appear()` / `removeChild` still wait `getAnimations`; awaiting them without options blocked the disappear mock and broke `test:mapped` 0ms ticks. Appear is awaited only when `appear` is set; no-`disappear` still calls Utils `removeChild` then sync-detaches.
- **`reformChildren` preMap is async.** Constructor now uses sync `appendArray` so `mapped.element` is not stub-only before the first microtask.
- **Dispose blocks rebind.** `#disposed` stops `boundParent` setter / `_onUpdate` so `mapped.element` after dispose cannot remount.

Did **not** git commit. Did **not** edit `*/fest`.
