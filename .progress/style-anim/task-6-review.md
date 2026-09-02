# Task 6 Review: Mapped / Changeable appear/disappear

**Spec:** `docs/superpowers/specs/2026-09-02-style-lib-animation-design.md`  
**Evidence:** report TDD RED→GREEN; `test:mapped-lifecycle` 6/6, `test:mapped` 13/13 (re-run 2026-09-02).

## Strengths

- Correctly wired the **real Mapped DOM path** (`#syncBoundParent`), not only `makeUpdater`; `_onUpdate` queues sync only.
- Animated splice: Utils `removeChild` + `await` when `disappear` set; `data-removing` visible before detach (plan test green).
- Overlapping splices serialized via `#queueBoundParentSync` / `#drainBoundParentSync` (`#syncInFlight`).
- `[Symbol.dispose]` and Changeable `boundParent` / `#updater` use Utils lifecycle; `makeUpdater` passes `{ appear, disappear }`.
- No-options stay instant: `appear` awaited only when set; preMap uses sync `appendArray`; no `*/fest` edits.
- Task 5 Utils behavior intact: no-lifecycle detach, `getAnimations` wait, cancel `u2-before-remove`, `replaceChildren` appear — all pass.

## Issues

### Critical

- None blocking merge for Task 6 scope (plan tests + regression suite green).

### Important

1. **No-options cancel bypass** — When `!disappear`, `#syncBoundParent` and `[Symbol.dispose]` fire `removeChild` then **sync** `parentNode.removeChild` without awaiting. A cancelled `u2-before-remove` on the async path is ignored; node still detaches. Spec invariant holds for Utils-only test, not Mapped/dispose no-options path.
2. **`boundParent` rebind uses raw DOM** — Mapped setter (L226–229) calls `oldParent.removeChild(node)`, skipping Utils lifecycle on parent change (Changeable setter does use `removeChild`).

### Minor

1. **Dispose with `disappear`** — `void removeChild(...)`; detach is async while `#disposed` / `#renderedNodes.clear()` run sync (brief allows void; edge case if caller assumes sync teardown).
2. **No cancel/overlap tests for Mapped** — Plan pair covers happy path only; cancel-on-splice and rapid double-splice not asserted.
3. **Dual-remove pattern** — Fire-and-forget `removeChild` + sync detach when `!disappear` is redundant and muddies lifecycle events vs instant goal.

## Assessment

**Pass with reservations.** Task 6 deliverables meet the brief and spec for the wired test matrix: Mapped splice/disappear, instant no-options Mapped, Changeable lifecycle via updater, serialized syncs, Utils Task 5 preserved, no fest copies. Ship for style-anim Phase 2 node work; follow up on cancel + `boundParent` rebind parity before treating lifecycle invariants as fully closed on Mapped no-options and parent moves.
