# Task 4 Report: animatable triggers show / hide / remove

## What I implemented

- **`src/Animatable.ts` `#wireTrigger`** — after the `{ value }` branch, `trigger === "show"|"hide"|"remove"`:
  - Event: `u2-before-show` / `u2-before-hide` / `u2-before-remove` → `playForward()`.
  - Backup: `MutationObserver` on `data-hidden` (show/hide) or `data-removing` (remove).
  - Show plays when the attr is **absent**; hide/remove when it is **present**. `reverseOnExit` reverses on the opposite attr state.
- **`test/lifecycle.node.test.ts`** — `animatable trigger remove starts on u2-before-remove`; Node `MutationObserver` stub (observe/disconnect no-op).

Did **not** git commit. Did **not** edit `*/fest`. Existing 15 tests unchanged in intent.

## TDD Evidence

### RED

Command:
```bash
cd /home/u2re-dev/U2RE.space/modules/projects/style.ts && npm run test:animation
```

```
✖ animatable trigger remove starts on u2-before-remove
  AssertionError: assert.ok(el.animations.length >= 1)
ℹ tests 16  ℹ pass 15  ℹ fail 1
```

Trigger ignored; `attach()` did not start on `u2-before-remove`.

### GREEN

Command:
```bash
cd /home/u2re-dev/U2RE.space/modules/projects/style.ts && npm run test:animation
```

```
✔ animatable trigger remove starts on u2-before-remove
ℹ tests 16  ℹ pass 16  ℹ fail 0
```

8 css-animation + 8 lifecycle.

## Files changed

| File | Action |
|------|--------|
| `src/Animatable.ts` | Modified — `#wireTrigger` show/hide/remove |
| `test/lifecycle.node.test.ts` | Modified — remove-trigger test + MutationObserver stub |

## Concerns

- **MutationObserver not exercised.** Stub is no-op; only the event path is asserted. Attr backup is untested in Node.
- **show / hide event paths** not covered by a dedicated test (same branch as remove).
- **`makeEl` has no `removeEventListener`.** Cleanup is untested; would leak listeners on a real detach test.

Did **not** git commit. Did **not** edit `*/fest`.
