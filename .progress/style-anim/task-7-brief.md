# Task 7 Brief: decor compat aliases

Plan: `docs/superpowers/plans/2026-09-02-style-lib-animation.md` Task 7.
Spec: `docs/superpowers/specs/2026-09-02-style-lib-animation-design.md`

## Do

1. Replace `modules/projects/dom.ts/src/decor/Animation.ts` with:

```ts
import { appear, disappear, decorShow, decorHide } from "@fest-lib/style-lib";

export const animateShow = (target: any) => appear(target, decorShow);
export const animateHide = (target: any) => disappear(target, decorHide);
```

Delete the old WAAPI keyframes / `data-opacity-animation` / `isMobile` / `addEvents` body.

2. Replace `modules/projects/dom.ts/src/decor/Appear.ts` with:

```ts
export { initVisibility } from "@fest-lib/style-lib";
export { initVisibility as default } from "@fest-lib/style-lib";
```

Do **not** re-export `appear` / `disappear` / `decorShow` / `decorHide` from these files.

3. `dom/src/index.ts` already `export *` from Appear **and** `@fest-lib/style-lib`. Both export `initVisibility` → duplicate. If the barrel breaks, drop `export * from "./decor/Appear"` from `index.ts` (style-lib already exports `initVisibility`; Appear stays for direct imports). Do not otherwise reshuffle the barrel.

4. Probe (plan): `animateShow` body contains `decorShow` and does not contain `target.animate`. Optional: style-lib already has `initVisibility` without second arg = no auto-fade.

5. Green: `cd /home/u2re-dev/U2RE.space/modules/projects/style.ts && npm run test:animation`

6. Report: `.progress/style-anim/task-7-report.md`

## Do not

- git commit
- edit `*/fest`, `Queries.ts`, `CSSAnimated.ts`, `Shape.ts`
- full test suites, `npm run build`, deploy
- star-export `appear` from `dom/decor`

## Behavior change (approved)

Old `Appear.ts` always called `animateShow`/`animateHide` on `data-hidden`. New `initVisibility(root)` only observes and emits via style-lib; pass `{ appear: decorShow, disappear: decorHide }` to keep the fade.
