# Task 5 Review

**Strengths:** Spec-aligned `removeChild` sequence (`u2-before-remove` → `data-removing` → `disappear` → detach); cancel leaves node; `merge` sequentially awaits commands + passes `lifecycle`; TDD red/green on three Utils cases; `appear` gated to `Element`; text/comment remove stays sync.

**Critical:** None for Task 5 Utils scope.

**Important:** `replaceChildren` is sync and calls `appendChild` without `await` (line 273) — `makeUpdater` `set` ops never wait insert/appear; Mapped replace path is broken for animation wait. `reflectChildren` / `reformChildren` fire-and-forget `removeNotExists`/`appendChild` (detach/appear may race initial paint).

**Minor:** `removeChild` double-waits (`disappear` already calls `waitElementAnimations`; spec also mandates LUR.E wait — harmless extra rAF). Array/fragment inserts skip per-child `appear` (Task 6). No tests for `merge`, `replaceChildren`, or `removeNotExists`.

**Assessment:** **Pass with follow-ups.** Core remove/append lifecycle in direct Utils calls meets spec and brief; ship Task 6 only after fixing `replaceChildren` async propagation (and ideally top-level `reflectChildren` awaits).
