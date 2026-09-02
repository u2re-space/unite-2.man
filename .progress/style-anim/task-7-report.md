# Task 7 Report: decor compat aliases

**Status:** Done

## Changes

| File | Change |
| --- | --- |
| `modules/projects/dom.ts/src/decor/Animation.ts` | Replaced WAAPI keyframes with `animateShow`/`animateHide` aliases to `appear`/`disappear` + `decorShow`/`decorHide` |
| `modules/projects/dom.ts/src/decor/Appear.ts` | Re-exports `initVisibility` (named + default) from `@fest-lib/style-lib` only |
| `modules/projects/dom.ts/src/index.ts` | Removed `export * from "./decor/Appear"` (duplicate `initVisibility` with style-lib barrel) |

## Probe

- `Animation.ts` body contains `decorShow`; no `target.animate`.
- `initVisibility` without second arg does not auto-fade (style-lib Task 3; unchanged here).

## Tests

```bash
cd modules/projects/style.ts && npm run test:animation
```

**Result:** 16/16 PASS

## Behavior note (approved)

Old `Appear.ts` wired `data-hidden` → local `animateShow`/`animateHide`. New `initVisibility(root)` only observes; pass `{ appear: decorShow, disappear: decorHide }` to restore fade-on-toggle.

## Not touched

- `*/fest`, `Queries.ts`, `CSSAnimated.ts`, `Shape.ts`
- No git commit
