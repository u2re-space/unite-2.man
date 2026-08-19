# Calendar Three-Mode Axis Engine Design

Date: 2026-08-19  
Status: draft (awaiting user review of written spec)

## Goal

Extend `CalendarScheduler` in `fl.ui` into a three-mode planning calendar:

1. **Month** — month grid with a dedicated ISO week-number gutter.
2. **Week** — timeline: rows = time, columns = days of the week.
3. **Day** — timeline: rows = parallel branch swimlanes, columns = time.

Navigation:

- Month: click **week number only** → week view for that week.
- Month or week: click a **day** → day view for that date.

## Decisions (locked)

| Topic | Choice |
|---|---|
| Day rows meaning | Parallel swimlanes (person / project / calendar / context) |
| Branch list | Hybrid: pinned base always + dynamic branches from that day's events |
| Component home | Extend existing `CalendarScheduler` (`fl.ui`) |
| Event → lane | `branchId` on schedule; missing → reserved `unassigned` |
| Month → week | Dedicated left week-number column; **only** week-number click opens week |
| Empty week-row click | Does **not** open week (behavior change vs current) |
| Architecture | Unified **TimelineGrid** axis-engine (one grid, two axis profiles) |
| Branch persistence | Host-owned; scheduler does not persist base branches |
| Branch editor UI | Out of v1 |
| External calendar sync | Out of v1 |
| Week-view filter by branch | Out of v1 |

## Problem

- Existing `CalendarScheduler` already has `month | week | day` and a shared vertical-time timeline.
- Week layout matches the desired axes (time × days).
- Day view is currently the same timeline with one day column — not branch swimlanes with time as columns.
- Month opens week via empty week-row click; there is no week-number gutter.
- Future planning apps (shell / CRX / other hosts) need one reusable component with stable branch semantics.

## Architecture

```
CalendarScheduler
  ├── view: month | week | day
  ├── activeDate, events[], baseBranches[]
  ├── MonthGrid (+ ISO week-number gutter)
  └── TimelineGrid (axis-engine)
        ├── axes config by view
        ├── resolveRows() / resolveCols()
        ├── placeEvents() → spans on time axis
        └── interactions (slot click, drag, event edit)
```

### Axis profiles (invariant)

| View | Rows | Columns |
|---|---|---|
| `week` | `time` | `day` |
| `day` | `branch` | `time` |

Month is **not** a TimelineGrid consumer; it remains `MonthGrid`.

Canonical code home (edit once; symlinks follow):

- `modules/projects/fl.ui/src/ui/navigation/calendar/` (`index.ts`, `index.scss`, tests)

`CalendarFlyout` (Win11-like month picker) stays separate and is out of this design.

## Data model

```ts
type BranchId = string; // "unassigned" reserved

interface CalendarBranch {
  id: BranchId;
  label: string;
  color?: string;
  pinned?: boolean; // from baseBranches / host config
}

interface ScheduleInput {
  id?: string;
  title: string;
  start: Date | string;
  end: Date | string;
  color?: string;
  allDay?: boolean;
  branchId?: BranchId;
}
```

### Hybrid branch rows (day view)

1. Start from `baseBranches` (pinned order preserved).
2. Add any `branchId` present on events of the active day that is not already in the base list (dynamic lanes).
3. Ensure `unassigned` when any event lacks `branchId`, or when there are no pinned/dynamic lanes (empty day with empty base → single `unassigned` row).
4. Order: pinned (as configured) → dynamic (first-seen by earliest event `start` on that day; tie-break by `branchId`) → `unassigned` last when present.

Unknown `branchId` on an event creates a dynamic row with that id and a fallback label equal to the id.

## Public API additions

| Surface | Role |
|---|---|
| `branches` get/set / `setBranches(list)` | Host-supplied pinned base set |
| `Schedule.branchId` / `ScheduleInput.branchId` | Lane placement in day view |
| Existing `view`, `date`, `slot-minutes`, events API | Unchanged semantics where possible |

Optional later (not required in v1): `branches-change` if in-component branch editing is added.

## TimelineGrid

### Config

```ts
type AxisKind = "time" | "day" | "branch";

interface TimelineAxes {
  row: AxisKind;
  col: AxisKind;
}
```

- `week` → `{ row: "time", col: "day" }`
- `day` → `{ row: "branch", col: "time" }`

### Axis resolution

- **time** — slots from `slot-minutes`; hour labels on the time axis.
- **day** — seven days from `startOfWeek(activeDate)` (same week-start rules as today).
- **branch** — hybrid list for `activeDate` (§ Data model).

### Event placement

- Span along the **time** axis (start + duration).
- Pin to **day** or **branch** on the other axis.
- Multi-day week events: clip/continue per day as today.
- Day view: missing/invalid mapping without id → `unassigned`; unknown id → dynamic lane.

### Interactions (v1)

| Action | Week | Day |
|---|---|---|
| Click / drag empty slot | Create event (day + time) | Create event (branch + time); set `branchId` from row |
| Click event | Edit (existing) | Edit including `branchId` |
| Drag reschedule | Time (and day if supported) | Time and/or across branches |
| Click day header in week | → day view | — |

### Sticky / scroll

- Week: sticky time axis (left), sticky day headers (top), corner sticky both.
- Day: sticky branch labels (left), sticky time headers (top), corner sticky both.

### CSS

- Shared tokens (`--slot-size`, event colors).
- Layout switched via `.timeline[data-row][data-col]` rather than two unrelated timeline trees.

## MonthGrid + week gutter

- Left column of ISO week numbers aligned to each week row.
- Weekday header row: empty cell above gutter + seven weekday labels.
- **Only** week-number control opens week view (`data-action="week"` + week start key).
- Day cell click → day view (existing `data-action="day"`).
- Remove / stop treating empty `.month-week` background click as week navigation.

## Edge cases

| Case | Behavior |
|---|---|
| Event with unknown `branchId` | Dynamic row; label fallback = id |
| Empty day + baseBranches | Show pinned rows only |
| Empty day + empty base | Single `unassigned` row |
| all-day in day view | Compact all-day strip compatible with week (minimal viable) |
| Event crosses midnight | Clip to active day (same spirit as current) |
| `slot-minutes` change | Both time-axis orientations recompute |

## Testing

Unit focus (pure helpers preferred):

- `resolveAxes(view)`
- `resolveBranches(base, eventsOfDay)` — hybrid + `unassigned`
- `placeEvent` for week vs day axis profiles
- Month handler mapping: week-number vs day click (`data-action`)

## Out of scope (v1)

- In-component branch list editor
- Syncing branches from external calendar accounts
- Filtering week view by `branchId`
- Changing `CalendarFlyout`
- New package / extract outside `fl.ui` calendar module

## Compatibility notes

- Hosts that never set `branches` still get day view via `unassigned` (+ dynamic ids if present).
- Existing events without `branchId` remain valid.
- Week visual/interaction path should stay recognizable; refactor goes through TimelineGrid, not a parallel week implementation.
- Planning apps in CWSP-shell / CRX consume the same `fl.ui` calendar; no shell-specific fork in v1.

## Success criteria

- Month shows week numbers; only week-number click enters week.
- Week: time × days via TimelineGrid.
- Day: branches × time via the same engine.
- Hybrid branch list matches locked rules.
- Creating from a day-view slot stamps the row’s `branchId` (or omits for `unassigned`).
