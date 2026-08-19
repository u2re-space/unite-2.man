# Calendar Three-Mode Axis Engine Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Extend `fl.ui` `CalendarScheduler` with a unified TimelineGrid (week: time×days; day: branches×time), hybrid branch lanes, and a month week-number gutter that alone opens week view.

**Architecture:** Extract pure axis/branch/placement helpers next to the calendar module; refactor `renderTimeline` behind `data-row` / `data-col` profiles; keep `MonthGrid` separate but add an ISO week gutter. Hosts own `baseBranches`; events carry optional `branchId` (`unassigned` reserved).

**Tech Stack:** TypeScript, Custom Elements (`calendar-scheduler`), Shadow DOM + SCSS, `node:test` (+ `--experimental-strip-types` as needed).

**Spec:** `docs/superpowers/specs/2026-08-19-calendar-axis-engine-design.md`

## Global Constraints

- Locked decisions from the spec (swimlanes, hybrid branches, extend `CalendarScheduler`, `branchId` → `unassigned`, week-number-only month→week, unified axis-engine).
- Canonical code: `modules/projects/fl.ui/src/ui/navigation/calendar/` (symlink mirrors elsewhere — edit the fl.ui inode once).
- Do not change `CalendarFlyout` in v1.
- Do not add in-component branch editor, external calendar sync, or week-view branch filters.
- Prefer small pure modules (`timeline-axes.ts`, `branches.ts`, `place-event.ts`) over growing `index.ts` further without extraction.
- Tests: `cd modules/projects/fl.ui && node --test test/<file>.test.ts` (Node strip-types; same pattern as `test/path-router.test.ts`).
- Commits: only when the user explicitly asks (omit commit steps unless requested). Spec/plan docs live in U2RE.space root; calendar source commits happen in the `fl.ui` git checkout when asked.

## File map

| File | Responsibility |
|---|---|
| `modules/projects/fl.ui/src/ui/navigation/calendar/timeline-axes.ts` | `AxisKind`, `TimelineAxes`, `resolveAxes(view)` |
| `modules/projects/fl.ui/src/ui/navigation/calendar/branches.ts` | `BranchId`, `CalendarBranch`, `UNASSIGNED_BRANCH_ID`, `resolveBranches(...)` |
| `modules/projects/fl.ui/src/ui/navigation/calendar/place-event.ts` | `placeEvent(...)` → time span + row/col keys for week & day |
| `modules/projects/fl.ui/src/ui/navigation/calendar/index.ts` | `CalendarScheduler` wiring: branches API, month gutter, TimelineGrid render + interactions |
| `modules/projects/fl.ui/src/ui/navigation/calendar/index.scss` | Gutter + dual-orientation timeline sticky/layout |
| `modules/projects/fl.ui/test/calendar-axes.test.ts` | `resolveAxes` |
| `modules/projects/fl.ui/test/calendar-branches.test.ts` | Hybrid `resolveBranches` |
| `modules/projects/fl.ui/test/calendar-place-event.test.ts` | Placement for both profiles |
| `modules/projects/fl.ui/test/calendar-month-nav.test.ts` | Pure helpers / action mapping for week-number vs day (no DOM if possible) |

---

### Task 1: `resolveAxes` pure helper

**Files:**
- Create: `modules/projects/fl.ui/src/ui/navigation/calendar/timeline-axes.ts`
- Create: `modules/projects/fl.ui/test/calendar-axes.test.ts`
- Modify: `modules/projects/fl.ui/src/ui/navigation/calendar/index.ts` — re-export types if useful; do not switch render yet

**Interfaces:**
- Consumes: `CalendarView` from `index.ts` **or** duplicate the string union in `timeline-axes.ts` and have `index.ts` import it (prefer define union once in `timeline-axes.ts` and import into `index.ts`).
- Produces:
  ```ts
  export type CalendarView = "month" | "week" | "day";
  export type AxisKind = "time" | "day" | "branch";
  export interface TimelineAxes {
    row: AxisKind;
    col: AxisKind;
  }
  /** Month has no timeline axes — returns null. */
  export function resolveAxes(view: CalendarView): TimelineAxes | null;
  ```

- [ ] **Step 1: Write failing tests**

Create `modules/projects/fl.ui/test/calendar-axes.test.ts`:

```ts
import test from "node:test";
import assert from "node:assert/strict";
import { resolveAxes } from "../src/ui/navigation/calendar/timeline-axes.ts";

test("resolveAxes week is time × day", () => {
  assert.deepEqual(resolveAxes("week"), { row: "time", col: "day" });
});

test("resolveAxes day is branch × time", () => {
  assert.deepEqual(resolveAxes("day"), { row: "branch", col: "time" });
});

test("resolveAxes month is null", () => {
  assert.equal(resolveAxes("month"), null);
});
```

- [ ] **Step 2: Run tests — expect FAIL**

```bash
cd /home/u2re-dev/U2RE.space/modules/projects/fl.ui
node --test test/calendar-axes.test.ts
```

Expected: FAIL (module missing or `resolveAxes` not exported).

- [ ] **Step 3: Implement minimal helper**

Create `modules/projects/fl.ui/src/ui/navigation/calendar/timeline-axes.ts`:

```ts
export type CalendarView = "month" | "week" | "day";
export type AxisKind = "time" | "day" | "branch";

export interface TimelineAxes {
  row: AxisKind;
  col: AxisKind;
}

export function resolveAxes(view: CalendarView): TimelineAxes | null {
  if (view === "week") return { row: "time", col: "day" };
  if (view === "day") return { row: "branch", col: "time" };
  return null;
}
```

- [ ] **Step 4: Align `index.ts` type import**

In `index.ts`, replace local `export type CalendarView = ...` with:

```ts
export type { CalendarView } from "./timeline-axes.ts";
import type { CalendarView } from "./timeline-axes.ts";
```

(Keep a single public re-export; avoid duplicating the union.)

- [ ] **Step 5: Run tests — expect PASS**

```bash
cd /home/u2re-dev/U2RE.space/modules/projects/fl.ui
node --test test/calendar-axes.test.ts
```

Expected: 3 pass.

---

### Task 2: Hybrid `resolveBranches`

**Files:**
- Create: `modules/projects/fl.ui/src/ui/navigation/calendar/branches.ts`
- Create: `modules/projects/fl.ui/test/calendar-branches.test.ts`

**Interfaces:**
- Consumes: event shapes with optional `branchId` + `start` (use a minimal input type in `branches.ts`, not the full `Schedule` class dependency).
- Produces:
  ```ts
  export type BranchId = string;
  export const UNASSIGNED_BRANCH_ID = "unassigned" as const;

  export interface CalendarBranch {
    id: BranchId;
    label: string;
    color?: string;
    pinned?: boolean;
  }

  export interface BranchEventHint {
    branchId?: BranchId;
    start: Date;
  }

  /**
   * Hybrid rows for day view.
   * - pinned base order preserved
   * - dynamic ids from events not in base (order: earliest start, tie-break id)
   * - unassigned last when any event lacks branchId OR no other rows exist
   */
  export function resolveBranches(
    base: CalendarBranch[],
    eventsOfDay: BranchEventHint[],
  ): CalendarBranch[];
  ```

- [ ] **Step 1: Write failing tests**

Create `modules/projects/fl.ui/test/calendar-branches.test.ts`:

```ts
import test from "node:test";
import assert from "node:assert/strict";
import {
  resolveBranches,
  UNASSIGNED_BRANCH_ID,
} from "../src/ui/navigation/calendar/branches.ts";

const t = (iso: string) => new Date(iso);

test("empty base + no events → single unassigned", () => {
  const rows = resolveBranches([], []);
  assert.deepEqual(rows.map((r) => r.id), [UNASSIGNED_BRANCH_ID]);
  assert.equal(rows[0]?.pinned, false);
});

test("pinned base only when day empty", () => {
  const rows = resolveBranches(
    [{ id: "work", label: "Work", pinned: true }],
    [],
  );
  assert.deepEqual(rows.map((r) => r.id), ["work"]);
});

test("missing branchId forces unassigned after pinned", () => {
  const rows = resolveBranches(
    [{ id: "work", label: "Work", pinned: true }],
    [{ start: t("2026-08-19T10:00:00"), branchId: undefined }],
  );
  assert.deepEqual(rows.map((r) => r.id), ["work", UNASSIGNED_BRANCH_ID]);
});

test("unknown branchId becomes dynamic; order by earliest start", () => {
  const rows = resolveBranches(
    [{ id: "work", label: "Work", pinned: true }],
    [
      { start: t("2026-08-19T12:00:00"), branchId: "b" },
      { start: t("2026-08-19T09:00:00"), branchId: "a" },
    ],
  );
  assert.deepEqual(rows.map((r) => r.id), ["work", "a", "b"]);
  assert.equal(rows[1]?.label, "a");
  assert.equal(rows[1]?.pinned, false);
});

test("base id not duplicated when event uses it", () => {
  const rows = resolveBranches(
    [{ id: "work", label: "Work", pinned: true }],
    [{ start: t("2026-08-19T10:00:00"), branchId: "work" }],
  );
  assert.deepEqual(rows.map((r) => r.id), ["work"]);
});
```

- [ ] **Step 2: Run tests — expect FAIL**

```bash
cd /home/u2re-dev/U2RE.space/modules/projects/fl.ui
node --test test/calendar-branches.test.ts
```

- [ ] **Step 3: Implement `resolveBranches`**

Create `branches.ts` implementing the rules above. Use label `"Общее"` (or `"Unassigned"` if you keep English UI strings consistent with nearby copy — match existing calendar locale strings in `index.ts`; Russian hints already exist, so prefer `"Общее"`) for `unassigned`. Dynamic unknown ids: `label = id`, `pinned: false`. Force `pinned: true` on base entries even if caller omitted it.

- [ ] **Step 4: Run tests — expect PASS**

```bash
cd /home/u2re-dev/U2RE.space/modules/projects/fl.ui
node --test test/calendar-branches.test.ts test/calendar-axes.test.ts
```

Expected: all pass.

---

### Task 3: `placeEvent` for both axis profiles

**Files:**
- Create: `modules/projects/fl.ui/src/ui/navigation/calendar/place-event.ts`
- Create: `modules/projects/fl.ui/test/calendar-place-event.test.ts`

**Interfaces:**
- Consumes: `TimelineAxes`, `UNASSIGNED_BRANCH_ID`, date-key helpers (implement minimal `dateKey` locally or accept precomputed keys).
- Produces:
  ```ts
  export interface PlaceableEvent {
    id: string;
    start: Date;
    end: Date;
    allDay?: boolean;
    branchId?: string;
  }

  export interface EventPlacement {
    eventId: string;
    /** Key on the non-time axis: dateKey (week) or branchId (day). */
    laneKey: string;
    /** Minutes from local midnight of the clipped day. */
    startMinute: number;
    endMinute: number;
    allDay: boolean;
  }

  /**
   * Clip event to `activeDay` (local calendar day) and map to a lane.
   * week axes → laneKey = YYYY-MM-DD of activeDay
   * day axes → laneKey = branchId ?? UNASSIGNED_BRANCH_ID
   * Returns null if event does not intersect activeDay.
   */
  export function placeEvent(
    event: PlaceableEvent,
    activeDay: Date,
    axes: TimelineAxes,
  ): EventPlacement | null;
  ```

- [ ] **Step 1: Write failing tests**

```ts
import test from "node:test";
import assert from "node:assert/strict";
import { placeEvent } from "../src/ui/navigation/calendar/place-event.ts";
import { resolveAxes } from "../src/ui/navigation/calendar/timeline-axes.ts";
import { UNASSIGNED_BRANCH_ID } from "../src/ui/navigation/calendar/branches.ts";

const day = new Date(2026, 7, 19); // Aug 19 2026 local

test("week profile lanes by dateKey", () => {
  const p = placeEvent(
    {
      id: "1",
      start: new Date(2026, 7, 19, 9, 0),
      end: new Date(2026, 7, 19, 10, 30),
    },
    day,
    resolveAxes("week")!,
  );
  assert.ok(p);
  assert.equal(p!.laneKey, "2026-08-19");
  assert.equal(p!.startMinute, 9 * 60);
  assert.equal(p!.endMinute, 10 * 60 + 30);
});

test("day profile lanes by branchId / unassigned", () => {
  const withBranch = placeEvent(
    {
      id: "2",
      start: new Date(2026, 7, 19, 11, 0),
      end: new Date(2026, 7, 19, 12, 0),
      branchId: "work",
    },
    day,
    resolveAxes("day")!,
  );
  assert.equal(withBranch?.laneKey, "work");

  const bare = placeEvent(
    {
      id: "3",
      start: new Date(2026, 7, 19, 11, 0),
      end: new Date(2026, 7, 19, 12, 0),
    },
    day,
    resolveAxes("day")!,
  );
  assert.equal(bare?.laneKey, UNASSIGNED_BRANCH_ID);
});

test("non-intersecting day returns null", () => {
  const p = placeEvent(
    {
      id: "4",
      start: new Date(2026, 7, 20, 9, 0),
      end: new Date(2026, 7, 20, 10, 0),
    },
    day,
    resolveAxes("week")!,
  );
  assert.equal(p, null);
});
```

- [ ] **Step 2: Run — expect FAIL**

```bash
cd /home/u2re-dev/U2RE.space/modules/projects/fl.ui
node --test test/calendar-place-event.test.ts
```

- [ ] **Step 3: Implement `placeEvent`**

Clip `[start,end)` against local start/end of `activeDay`. Compute minutes with `getHours()*60+getMinutes()`. If `allDay`, set `startMinute=0`, `endMinute=24*60`, `allDay=true`. For week axes always `laneKey = dateKey(activeDay)` when intersecting. For day axes use `event.branchId ?? UNASSIGNED_BRANCH_ID`.

- [ ] **Step 4: Run — expect PASS**

```bash
cd /home/u2re-dev/U2RE.space/modules/projects/fl.ui
node --test test/calendar-place-event.test.ts test/calendar-branches.test.ts test/calendar-axes.test.ts
```

---

### Task 4: `branchId` on Schedule + `branches` API on scheduler

**Files:**
- Modify: `modules/projects/fl.ui/src/ui/navigation/calendar/index.ts`
- Extend: `modules/projects/fl.ui/test/calendar-branches.test.ts` only if normalize helpers are extracted; otherwise manual smoke via typecheck is enough — prefer adding a tiny `normalizeSchedule` export test only if you extract normalize. **Do not extract unless needed.** Keep normalize private; unit-test via public setter if exposed.

**Interfaces:**
- Produces on `CalendarScheduler`:
  ```ts
  get branches(): CalendarBranch[];
  set branches(value: CalendarBranch[]);
  setBranches(list: CalendarBranch[]): void;
  // Schedule / ScheduleInput gain optional branchId
  ```

- [ ] **Step 1: Extend types**

Update `ScheduleInput` / `Schedule` in `index.ts`:

```ts
import type { BranchId, CalendarBranch } from "./branches.ts";
export type { BranchId, CalendarBranch } from "./branches.ts";
export { UNASSIGNED_BRANCH_ID } from "./branches.ts";

export interface ScheduleInput {
  id?: string;
  title: string;
  start: Date | string;
  end: Date | string;
  color?: string;
  allDay?: boolean;
  branchId?: BranchId;
}

export interface Schedule {
  id: string;
  title: string;
  start: Date;
  end: Date;
  color: string;
  allDay: boolean;
  branchId?: BranchId;
}
```

In `normalizeSchedule`, copy `branchId` when it is a non-empty string; omit otherwise (do not auto-write `"unassigned"` onto the stored event).

- [ ] **Step 2: Add private `_branches: CalendarBranch[] = []` + public API**

```ts
get branches(): CalendarBranch[] {
  return this._branches.map((b) => ({ ...b }));
}
set branches(value: CalendarBranch[]) {
  this.setBranches(value);
}
setBranches(list: CalendarBranch[]): void {
  this._branches = Array.isArray(list)
    ? list
        .filter((b) => b && typeof b.id === "string" && b.id.length > 0)
        .map((b) => ({
          id: b.id,
          label: b.label || b.id,
          color: b.color,
          pinned: true,
        }))
    : [];
  this.render();
}
```

- [ ] **Step 3: Smoke that existing week/month still render**

```bash
cd /home/u2re-dev/U2RE.space/modules/projects/fl.ui
node --test test/calendar-*.test.ts
```

Optional visual: `npm run dev` and open a page that mounts `calendar-scheduler` if one exists; otherwise skip UI until Task 6–7.

---

### Task 5: Month week-number gutter + navigation change

**Files:**
- Modify: `modules/projects/fl.ui/src/ui/navigation/calendar/index.ts` (`renderMonth`, click handler)
- Modify: `modules/projects/fl.ui/src/ui/navigation/calendar/index.scss`
- Create: `modules/projects/fl.ui/test/calendar-month-nav.test.ts` (pure week-number helper)

**Interfaces:**
- Produces:
  ```ts
  /** ISO week number (1–53) for a Date in local time. */
  export function isoWeekNumber(date: Date): number;
  ```
  Place `isoWeekNumber` in `timeline-axes.ts` or a tiny `week-number.ts` beside calendar — prefer `week-number.ts` to keep axes file small.

- [ ] **Step 1: Failing test for ISO week helper**

```ts
import test from "node:test";
import assert from "node:assert/strict";
import { isoWeekNumber } from "../src/ui/navigation/calendar/week-number.ts";

test("isoWeekNumber known dates", () => {
  // 2026-01-01 is Thursday → ISO week 1
  assert.equal(isoWeekNumber(new Date(2026, 0, 1)), 1);
  // 2026-08-19 is Wednesday → ISO week 34
  assert.equal(isoWeekNumber(new Date(2026, 7, 19)), 34);
});
```

- [ ] **Step 2: Implement `isoWeekNumber`** (UTC-noon trick or Thursday-based ISO algorithm; keep local-date inputs stable).

- [ ] **Step 3: Update `renderMonth` markup**

For each week row:

```html
<section class="month-week" data-week-start="YYYY-MM-DD">
  <button
    type="button"
    class="month-week-number"
    data-action="week"
    data-week-start="YYYY-MM-DD"
    aria-label="Неделя N"
  >N</button>
  <!-- 7 day cells unchanged -->
</section>
```

Weekday header: leading empty `.weekday-gutter` + 7 labels. Update SCSS grid to `auto + repeat(7, 1fr)` (or fixed gutter width).

- [ ] **Step 4: Click handler**

- Add `action === "week"` → set `_activeDate` from `data-week-start`, `setView("week")`.
- **Remove** the block that opens week on empty `.month-week` background click (spec behavior change).

- [ ] **Step 5: Run unit tests**

```bash
cd /home/u2re-dev/U2RE.space/modules/projects/fl.ui
node --test test/calendar-month-nav.test.ts test/calendar-*.test.ts
```

---

### Task 6: TimelineGrid week path (refactor, same UX)

**Files:**
- Modify: `index.ts` — replace `renderTimeline()` body to go through axes + shared structure
- Modify: `index.scss` — add `.timeline[data-row="time"][data-col="day"]` hooks (keep current look)

**Interfaces:**
- Consumes: `resolveAxes`, `placeEvent`
- Produces: DOM with:
  ```html
  <section class="timeline-scroll">
    <div class="timeline" data-row="time" data-col="day" style="--lane-count: 7; ...">
      <!-- header: time corner + day headers -->
      <!-- body: time axis + day tracks -->
    </div>
  </section>
  ```

- [ ] **Step 1: Refactor `renderTimeline`**

```ts
private renderTimeline(): string {
  const axes = resolveAxes(this._view);
  if (!axes) return "";
  if (axes.row === "time" && axes.col === "day") {
    return this.renderTimelineTimeByDay();
  }
  if (axes.row === "branch" && axes.col === "time") {
    return this.renderTimelineBranchByTime(); // stub empty until Task 7
  }
  return "";
}
```

Move current week/day-column markup into `renderTimelineTimeByDay()` (week: 7 days; if somehow called for day-with-old-axes, do not — day uses branch path). **While Task 7 incomplete**, temporarily keep old single-day vertical timeline only if needed for compile — prefer stub day view message `"…"` only if unavoidable; better implement Task 7 immediately after.

- [ ] **Step 2: Use `placeEvent` when positioning week events** instead of inline math where practical (can wrap existing `renderTimelineEvent`).

- [ ] **Step 3: Regression**

```bash
cd /home/u2re-dev/U2RE.space/modules/projects/fl.ui
node --test test/calendar-*.test.ts
```

Manual: week view still shows 7 day columns, time on the left, create-by-drag still works.

---

### Task 7: Day view branch × time layout + slot create with `branchId`

**Files:**
- Modify: `index.ts` — `renderTimelineBranchByTime`, slot handlers, `createSchedule`
- Modify: `index.scss` — horizontal time columns, branch rows, sticky labels

**Interfaces:**
- Consumes: `resolveBranches(this._branches, eventsOfDayHints)`, `placeEvent`, `UNASSIGNED_BRANCH_ID`
- Produces: day TimelineGrid:
  - rows = hybrid branches
  - columns = time slots (slot-minutes)
  - sticky branch label column + sticky time header row

- [ ] **Step 1: Implement `renderTimelineBranchByTime`**

Pseudo-structure:

```html
<div class="timeline" data-row="branch" data-col="time" style="--lane-count: N; --slot-count: S">
  <div class="timeline-header">
    <div class="branch-head"></div>
    <div class="time-head-grid">…hour/slot labels…</div>
  </div>
  <div class="timeline-body">
    for each branch:
      <div class="branch-label">…</div>
      <div class="branch-track" data-branch-id="…">
        slot-hit buttons with data-branch-id + data-minute
        positioned events via placeEvent → left/width from minutes
      </div>
  </div>
</div>
```

Use CSS grid or absolute positioning consistent with week track style, but **time is horizontal**: `left = (startMinute/60)*HOUR_WIDTH`, `width = duration`.

Pick `HOUR_WIDTH` constant (e.g. 72) parallel to existing `HOUR_HEIGHT = 56`.

- [ ] **Step 2: Extend `createSchedule`**

```ts
private createSchedule(
  dayKeyValue: string,
  startMinute: number,
  endMinute: number,
  branchId?: string,
): void {
  // ...
  const schedule = normalizeSchedule({
    title: title.trim(),
    start,
    end,
    color: "#2563eb",
    branchId:
      branchId && branchId !== UNASSIGNED_BRANCH_ID
        ? branchId
        : undefined,
  });
  // ...
}
```

Slot click/drag in day view must pass `data-branch-id` from the track.

- [ ] **Step 3: Pointer drag**

Adapt `bindTimeline` / pointer handlers so day tracks use horizontal delta → minutes, and optionally vertical delta → branch index change on drop (v1: at least horizontal time reschedule; cross-branch drop if pointer ends over another `.branch-track`).

- [ ] **Step 4: Edit prompt**

Minimal: after title prompt, optional second prompt or keep title-only in v1 but allow `branchId` change via `prompt("Ветка (id):", current.branchId ?? "")` — acceptable for v1 per spec “edit including branchId”.

- [ ] **Step 5: Tests still green + manual day smoke**

```bash
cd /home/u2re-dev/U2RE.space/modules/projects/fl.ui
node --test test/calendar-*.test.ts
```

Manual checks:
- `setBranches([{id:"work",label:"Work"}])` → day shows Work row
- event without `branchId` → Unassigned row appears
- create on Work row → event has `branchId: "work"`

---

### Task 8: Sticky CSS + all-day strip (minimal) + footer hints

**Files:**
- Modify: `index.scss`
- Modify: `index.ts` footer hint strings for month/week/day

- [ ] **Step 1: Sticky rules**

For `[data-row="branch"][data-col="time"]`:
- `.branch-label` / corner: `position: sticky; left: 0; z-index: …`
- `.timeline-header`: `position: sticky; top: 0`
- Corner cell sticky on both axes

For week profile, preserve existing sticky behavior; rename classes only if required for sharing.

- [ ] **Step 2: all-day**

In day profile, render `allDay` placements as a compact bar at the start of the branch track (or a single all-day row above slots). Match week’s all-day treatment as closely as practical — minimal viable.

- [ ] **Step 3: Update footer hints**

- Month: `"Нажмите номер недели или день"`
- Timeline: keep drag hint; day can mention branches.

- [ ] **Step 4: Final test sweep**

```bash
cd /home/u2re-dev/U2RE.space/modules/projects/fl.ui
node --test test/calendar-axes.test.ts test/calendar-branches.test.ts test/calendar-place-event.test.ts test/calendar-month-nav.test.ts
```

Expected: all pass.

- [ ] **Step 5: Update spec status line** (optional, in U2RE.space repo)

In `docs/superpowers/specs/2026-08-19-calendar-axis-engine-design.md`, set `Status: approved (implementation in progress)` or `implemented` when done — only if user wants doc churn.

---

## Spec coverage checklist

| Spec item | Task |
|---|---|
| `resolveAxes` week/day/month | Task 1 |
| Hybrid branches + unassigned rules | Task 2 |
| `placeEvent` week/day | Task 3 |
| `branchId` + `branches` API | Task 4 |
| Month week-number gutter; only number opens week | Task 5 |
| Remove empty week-row → week | Task 5 |
| TimelineGrid week path | Task 6 |
| Day branches × time + create stamps branchId | Task 7 |
| Sticky axes + all-day minimal + hints | Task 8 |
| Out of scope (editor/sync/filters/flyout) | Explicitly not tasked |

## Self-review notes

- No TBD placeholders in task steps.
- Types `CalendarView` / `CalendarBranch` / `placeEvent` names are consistent across tasks.
- Commit steps omitted per repo commit policy; ask user before committing `fl.ui` or docs.

---

## Execution handoff

Plan complete and saved to `docs/superpowers/plans/2026-08-19-calendar-axis-engine.md`.

Two execution options:

1. **Subagent-Driven (recommended)** — fresh subagent per task, review between tasks  
2. **Inline Execution** — execute tasks in this session with checkpoints  

Which approach?
