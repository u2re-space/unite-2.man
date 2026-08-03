# Speed Dial Unify (Hybrid Cherry-Pick) Design

Date: 2026-08-03  
Status: implemented (pending final visual sign-off)

## Goal

Unify speed-dial after a bad merge that concatenated rewrite (`fl.ui`) and env-shell implementations into the same files. Produce one higher-quality canonical implementation and dedupe related SCSS.

## Decisions (locked)

| Topic | Choice |
|---|---|
| Merge strategy | **B** hybrid — best of both halves |
| Execution | **1** diff-driven cherry-pick (rewrite base + unique env-shell deltas) |
| SCSS scope | **2** speed-dial + clearly doubled `_bar` / `_tabs` / `_sidebar` (+ `_content` if confirmed) |
| SoT | `fl.ui`; `environment-shell/src/home/{ts,scss}` stay symlinks |

## Problem

Commit `Needs to unify speed dials components` nearly doubled key files by appending a second copy. Examples:

- `SpeedDial.ts` ~875 → ~1735
- `OrientDesktop.ts` ~1171 → ~2631
- `launcher-state.ts`, `Interact.ts`, `ShortcutEditor.ts`, `action-registry.ts`, `SpeedDial.scss` similarly doubled
- `styles/ui/_bar.scss`, `_tabs.scss`, `_sidebar.scss` contain near-duplicate halves

First half ≈ rewrite architecture (`layout.ts`, `bindPointerInteraction`, `MutationObserver`).  
Second half ≈ env-shell product fixes (wallpaper IDB, view gating, paste/drop hygiene, overlay z-index).

## Architecture

- **Canonical renderer:** `modules/projects/fl.ui/src/ui/speed-dial/SpeedDial.ts`
- **Compat adapter:** `OrientDesktop.ts` / `initializeOrientedDesktop()` for `HomeView` and playground
- **Layout SoT:** `layout.ts`; root `orient` attribute 0–3; explicit mutations via `MutationObserver`; logical persisted cells unchanged; icon+label layers remapped
- **Interaction SoT:** `pointer-interaction.ts`; `Interact.ts` keeps public `bindInteraction` name
- **State SoT:** single `launcher-state.ts` (no double module-level state); keep legacy desktop migrator and storage keys
- **Shell wiring:** `environment-shell/src/home/index.ts` continues to mount via adapter + `view-opener` / `action-registry`

```
HomeView / playground
  → initializeOrientedDesktop | SpeedDial
  → launcher-state (load / migrate / defaults)
  → SpeedDial render (icon + label layers, orient remap)
  → pointer-interaction | ShortcutEditor | view-opener + action-registry
  → persist items/meta; wallpaper via IDB (not localStorage data-URLs)
```

## Cherry-pick from second half (into rewrite base)

Port if missing after dedupe:

- **launcher-state:** `isEnabledView` / Network hide; richer defaults (Markdown, Work Center, History, external); single meta buffer
- **OrientDesktop / SpeedDial:** wallpaper IDB (`idb:rs-wallpaper`); paste/drop URL hygiene (scheme, absolute http(s), prefer uri-list over HTML)
- **Interact:** touch drop uses last pointer client
- **ShortcutEditor:** theme match; overlay mount / high z above chrome
- **action-registry:** legacy label/id normalize for Markdown/Plan and open-view targets

Do **not** keep:

- second copy of module-level state/exports
- parallel second renderer or second defaults block

## SCSS plan

- **`SpeedDial.scss`:** one stylesheet; rewrite grid placement + simple transform; keep unique visual/editor rules from the fuller half
- **Shared primitives:** `_speed-dial.scss`, `_gridbox.scss`, `_orientbox.scss`, orientation helpers — no duplicated placement math in the component sheet
- **Doubled UI sheets:** `_bar.scss`, `_tabs.scss`, `_sidebar.scss` — remove concatenated second half; if halves diverge, union unique rules (not “keep everything”)
- **`_content.scss`:** include only if duplicate half is confirmed

Out of scope: full audit of all `styles/ui/*`, visual redesign, persistence key renames.

## Public API (preserve)

- `SpeedDial`, `initializeOrientedDesktop`
- `bindInteraction` / `bindPointerInteraction`, layout helpers
- `openShortcutEditor`, action-registry / view-opener exports
- Storage keys unchanged (`cw::workspace::speed-dial` + legacy migrator)

## Edge cases

- Corrupt/empty desktop → restore defaults (never empty grid)
- Disabled views → filter defaults and persisted tiles
- Bad paste/drop URLs → soft reject / toast, no bogus tiles
- `prefers-reduced-motion` → same state transitions without FLIP animation

## Verification

1. Unit: `layout` orient 0–3 + hit-test
2. Smoke: fl.ui `?suite=speed-dial` and env-shell home mount
3. Manual: drag, orient change, open view/link, wallpaper, paste URL
4. SCSS: no double-emitted bar/tabs/sidebar rules; dial layers correct
5. Targeted lint/build in `fl.ui`

## Implementation order (for plan)

1. Per-file split map (exact restart line) + unique-delta inventory
2. Dedupe TS to rewrite base; cherry-pick second-half deltas
3. Dedupe `SpeedDial.scss` + doubled UI SCSS
4. Keep/fix env-shell symlinks and imports
5. Tests + smoke + visual check

## Non-goals

- Redesigning launcher UX
- Removing `OrientDesktop` public entrypoint
- Broad fl.ui style refactor beyond confirmed duplicates
