# Task 5 Report: LUR.E appendChild / removeChild wait

## What I implemented

- **`Utils.ts`** — `NodeLifecycle`; `appendChild` / `removeChild` / `removeNotExists` are async.
  - After insert: `appear` on a real Element only.
  - Remove: `u2-before-remove` → `data-removing` → `disappear` → `waitElementAnimations` → detach → clear attr → `u2-removed`.
  - Cancel `u2-before-remove` leaves the node. Text/comment still detaches immediately.
  - `removeNotExists` `await Promise.all` of `removeChild` for missing nodes.
- **`ReflectChildren.ts` `makeUpdater`** — optional `lifecycle`; `merge` awaits each command and passes lifecycle as the last arg.
- **Harness** — `test/mapped-lifecycle.node.test.ts`, `scripts/run-mapped-lifecycle-tests.mjs`, `test:mapped-lifecycle`.

Did **not** git commit. Did **not** edit `*/fest`. Did **not** run full lure `npm test`. Mapped appear/disappear options are Task 6.

## TDD Evidence

### RED

Command:
```bash
cd /home/u2re-dev/U2RE.space/modules/projects/lur.e && npm run test:mapped-lifecycle
```

```
✔ removeChild without lifecycle detaches immediately
✖ removeChild sets data-removing and waits getAnimations
✖ cancel u2-before-remove leaves the node
ℹ tests 3  ℹ pass 1  ℹ fail 2
```

Sync `removeChild` detached immediately: no `data-removing`, cancel ignored.

### GREEN

Command:
```bash
cd /home/u2re-dev/U2RE.space/modules/projects/lur.e && npm run test:mapped-lifecycle
```

```
✔ removeChild without lifecycle detaches immediately
✔ removeChild sets data-removing and waits getAnimations
✔ cancel u2-before-remove leaves the node
ℹ tests 3  ℹ pass 3  ℹ fail 0
```

## Files changed

| File | Action |
|------|--------|
| `src/lure/context/Utils.ts` | Modified — async lifecycle append/remove |
| `src/lure/context/ReflectChildren.ts` | Modified — `makeUpdater` merge awaits + lifecycle |
| `test/mapped-lifecycle.node.test.ts` | Created |
| `scripts/run-mapped-lifecycle-tests.mjs` | Created |
| `package.json` | Modified — `test:mapped-lifecycle` |

## Concerns

- **`appendChild` appear is singular.** Arrays/fragments skip `appear` unless `getNode` yields one Element. Task 6 Mapped may need per-child appear.
- **`replaceChildren` still ignores the `appendChild` Promise.** Replace path does not wait for appear.
- **`disappear` already waits animations.** `removeChild` waits again; double-wait is harmless, slightly extra rAF.
- **No Mapped coverage here.** Three Utils tests only.

Did **not** git commit. Did **not** edit `*/fest`.
