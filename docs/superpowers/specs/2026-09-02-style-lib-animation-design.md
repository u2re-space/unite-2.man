# style-lib animation: CSS bind, triggers, enter/exit

## Goal

`A` is a description only. Applying it is always explicit: WAAPI on an
`Element`, or CSSOM on a style rule/sheet. LUR.E insert/remove waits only
when the caller passed an animation. `decor` moves to `style-lib` as named
exports, not a hidden fade.

## Accepted decisions

- Two writers, no auto-dispatch. Wrong target throws. No silent fallback.
- `bindCssAnimation` compiles triggers to CSS (`:hover`, `animation-trigger`,
  `timeline-trigger`, attribute selectors) and writes them even if unsupported.
- Extra triggers: `show`, `hide`, `remove`. `remove` plays before detach.
- Node lifecycle is JS: wait `animation.finished` and/or `animationend`, then
  hide or remove. CSS bind does not drive Mapped by itself.
- No default animation. Missing `A` / options means instant DOM.
- Approach: explicit writers + opt-in lifecycle. `initVisibility` without a
  second argument emits events only.

## Architecture

SoT: `modules/projects/style.ts` (`@fest-lib/style-lib`).

`A` parses to `AnimationOptions` / keyframes and applies nothing.

| API | Target | Effect |
| --- | --- | --- |
| `doAnimation(el, opts)` | `Element` | `el.animate()` only |
| `bindCssAnimation(target, opts)` | `CSSStyleRule` / `CSSStyleSheet` / `CSSStyleDeclaration.parentRule` | `@keyframes` + `animation-*` + compiled trigger |
| `appear(el, opts?)` / `disappear(el, opts?)` | `Element` | WAAPI if opts present; never detaches |
| `animatable()` + `S` | `Element` | unchanged WAAPI attach |

LUR.E does not pick a writer. `Mapped`, `Changeable`, `appendChild`, and
`removeChild` accept `{ appear?, disappear? }`. Absent fields keep today’s
instant DOM.

`Queries.ts` is a symlink to `Queried.ts`. `Q(".x").style` is a
`CSSStyleDeclaration`; `bindCssAnimation` uses `parentRule`.

**INVARIANT:** `doAnimation` never writes CSS. `bindCssAnimation` never
calls `element.animate()`.

Out of scope: `CSSAnimated.ts` (value-change animation), `Shape.ts`
(clip-path), copies under `*/fest`.

## `bindCssAnimation`

Resolve `(sheet, rule, selector)`:

- `CSSStyleRule` → its sheet + `selectorText`
- `CSSStyleDeclaration` → `parentRule`
- `CSSStyleSheet` → requires `opts.selector`, else `TypeError`
- `Element` or `{ value }` trigger → `TypeError`

Write into an adopted sheet on layer `ux-anim`. `@keyframes fest-anim-<id>`
is refcounted by fingerprint. The **original** rule’s selector is not
rewritten. Animation properties live on a companion rule.

| `trigger` | Companion / properties |
| --- | --- |
| omitted / `mount` | `${sel}` + `animation-*`, plays immediately |
| `hover` / `focus` | `${sel}:hover` / `:focus` + `animation-*`; `reverseOnExit` also writes `animation-trigger` play-backwards on exit |
| `click` | `event-trigger: --t click` + `animation-trigger: --t play` |
| `visible` | `timeline-trigger: --t view contain` + `animation-trigger: --t play` |
| `scroll` / `onScroll` / `onView` | `animation-timeline` + `timeline-trigger` / `animation-range` from options |
| `manual` | `animation-play-state: paused` |
| `show` | `${sel}:not([data-hidden])` |
| `hide` | `${sel}[data-hidden]` |
| `remove` | `${sel}[data-removing]` |
| `{ value }` | not compiled; `TypeError` on this path |

CSS `show` matches whenever the node is not `[data-hidden]`, including first
paint. First insert that needs a playable enter uses JS `appear`, not this
selector.

Reactive slots in `A`: snapshot at bind; subscription rewrites `@keyframes`
text and keeps the same name when the fingerprint is unchanged.

Cleanup: drop the companion rule and `animation-*`; delete `@keyframes` when
refcount hits 0. A second bind with the same fingerprint reuses the name and
increments the count.

## Lifecycle

Three moments: **show** and **hide** keep the node; **remove** detaches it.

### style-lib

- `appear` / `disappear` run WAAPI only when `A` / `AnimationOptions` is
  passed; otherwise they resolve immediately.
- `disappear` does not detach.
- Wait `animation.finished` when a WAAPI player was started. Then, after one
  `requestAnimationFrame`, wait every `el.getAnimations()` entry whose
  `playState` is `running` or `pending` (CSS `trigger: "remove"|"hide"|"show"`
  included).
- `prefers-reduced-motion` or `data-instant`: do not wait.
- A new show that starts during hide cancels that hide; hide must not
  continue into remove.

### Events (cancelable)

`u2-before-show` → `u2-appear`  
`u2-before-hide` → `u2-hidden`  
`u2-before-remove` → `u2-removed`

Cancel of a `before-*` event skips hide or detach.

### LUR.E node

- **insert:** put in DOM, then `appear(opts.appear)` if provided.
- **hide:** set `data-hidden`, then `disappear(opts.disappear)`.
- **remove:** dispatch `u2-before-remove`; set `data-removing`; run
  `disappear(opts.disappear)` if provided; after one rAF wait every
  `getAnimations()` that is `running` or `pending`; detach; clear
  `data-removing` on the detached node; dispatch `u2-removed`.
- No `appear` / `disappear` in options: no WAAPI. CSS companions still
  apply if someone already called `bindCssAnimation`. The same rAF +
  `getAnimations()` wait still holds detach when those animations start.

`remove` always plays **before** `parent.removeChild`. `hide` is not
`remove`.

`animatable({ trigger: "show"|"hide"|"remove" })` on an Element starts from
the same attributes/events. On a rule it only writes the CSS companion.

### `initVisibility`

`initVisibility(root, { appear?, disappear? })` watches `data-hidden`.
Without the second argument it only observes and dispatches events.

The current fade becomes named exports `decorShow` and `decorHide`
(`AnimationOptions` with today’s opacity/scale/display keyframes). Callers
that want the old behavior pass them explicitly.

## Errors

| Call | Result |
| --- | --- |
| `doAnimation` / `appear` / `disappear` on non-`Element` | `TypeError` |
| `bindCssAnimation` on `Element` | `TypeError` |
| `bindCssAnimation` on a sheet without `selector` | `TypeError` |
| `bindCssAnimation` with `trigger: { value }` | `TypeError` |
| `appear` / `disappear` without opts | resolve, no throw |

## `decor` migration

SoT lives in `style.ts`. `modules/projects/dom.ts/src/decor/Animation.ts` and
`Appear.ts` re-export `appear`, `disappear`, `animateShow`, `animateHide`,
`initVisibility`, `decorShow`, `decorHide`.

`animateShow(el)` is `appear(el, decorShow)`. `animateHide(el)` is
`disappear(el, decorHide)`. Direct callers keep today’s fade.

**Breaking:** `initVisibility()` no longer passes those presets. Restore with
`initVisibility(root, { appear: decorShow, disappear: decorHide })`.

`Shape.ts` stays out of this API.

## Tests (narrow)

style-lib:

- `A` compiles to `@keyframes` text
- trigger → companion selector / properties table
- `bindCssAnimation` on a `CSSStyleSheet` writes name + companion
- `doAnimation` rejects non-`Element`
- refcount: two binds, one cleanup, keyframes remain; second cleanup removes them

lure:

- Mapped without options is instant
- Mapped with `disappear` sets `data-removing` and waits before detach
- cancel `u2-before-remove` leaves the node in place

Do not run the full lure suite or app builds unless those files change
and proof is required.

## Implementation order

1. `style.ts`: trigger types, keyframes emit, `bindCssAnimation`,
   `appear` / `disappear`, `decorShow` / `decorHide`.
2. `lur.e` node: options on Mapped / Changeable / append / remove;
   `data-removing`; new events.
3. `dom.ts/decor`: re-exports; `initVisibility` second argument.

## Non-goals

- Auto-picking WAAPI vs CSS from one `apply()`
- Compiling reactive `{ value }` triggers to CSS
- Shipping `animation-trigger` polyfills
- Moving `Shape.ts` or rewriting `CSSAnimated.ts`
