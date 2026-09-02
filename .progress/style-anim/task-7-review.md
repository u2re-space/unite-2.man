# Task 7 Review: decor compat aliases

## Strengths

- `Animation.ts` is alias-only: `animateShow`/`animateHide` delegate to `appear`/`disappear` + `decorShow`/`decorHide`; no WAAPI, `target.animate`, or legacy helpers.
- `Appear.ts` re-exports only `initVisibility` (named + default) from `@fest-lib/style-lib`; no `appear`/`disappear`/`decorShow`/`decorHide` star-export.
- Barrel fix is correct: dropped `export * from "./decor/Appear"` to avoid duplicate `initVisibility` with the existing `@fest-lib/style-lib` line; `animateShow`/`animateHide` still exported via `./decor/Animation`.
- `Shape.ts` untouched. Report claims `test:animation` 16/16 PASS.

## Issues

- None blocking. `Appear.ts` default export is no longer on the `fest/dom` barrel (style-lib has named `initVisibility` only); no repo consumers default-import it.
- Approved behavior change: `initVisibility(root)` no longer auto-fades; callers must pass `{ appear: decorShow, disappear: decorHide }`.

## Assessment

**Pass.** Implementation matches brief and spec; probes satisfied; barrel intact for current consumers.
