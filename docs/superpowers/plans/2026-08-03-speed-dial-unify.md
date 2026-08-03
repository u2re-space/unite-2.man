# Speed Dial Unify Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Remove concatenated duplicate speed-dial / SCSS halves and keep one rewrite-based canon with env-shell product deltas cherry-picked in.

**Architecture:** Restore each doubled file from `fl.ui` `HEAD~1` (rewrite base), keep a snapshot of the current second half for diffing, then port only unique second-half behavior. `SpeedDial` remains the renderer; `OrientDesktop` stays a thin adapter. `environment-shell/src/home/{ts,scss}` stay symlinks into `fl.ui`.

**Tech Stack:** TypeScript, fest/lure + fest/dom, Vite playground, `node:test` for layout helpers, Sass/`@layer` styles.

**Spec:** `docs/superpowers/specs/2026-08-03-speed-dial-unify-design.md`

## Global Constraints

- Diff-driven cherry-pick: rewrite base first, then unique env-shell deltas only.
- Preserve public exports: `SpeedDial`, `initializeOrientedDesktop`, `bindInteraction`, `bindPointerInteraction`, layout helpers, `openShortcutEditor`, action-registry / view-opener.
- Do not rename persistence keys (`cw::workspace::speed-dial` + legacy migrator).
- SoT is `modules/projects/fl.ui`; do not re-materialize copies under `environment-shell/src/home/{ts,scss}`.
- SCSS scope: `SpeedDial.scss` + `_bar.scss` / `_tabs.scss` / `_sidebar.scss`. `_content.scss` is **not** doubled — leave it.
- Keep newly added single-copy files from the unify commit: `needs-to-API.ts`, `toast.ts`, shared style primitives (`_gridbox`, `_orientbox`, `_speed-dial`, `_orientation-functions`, `_viewport`, `_home-host`, `_launcher-typography`) unless a duplicate half appears inside them.
- Commits: only when the user explicitly asks (omit commit steps otherwise).
- Do not redesign launcher UX.

## File map

| File | Role / action |
|---|---|
| `modules/projects/fl.ui/src/ui/speed-dial/SpeedDial.ts` | Restore HEAD~1 base; cherry-pick wallpaper/IDB + paste hygiene from 2nd half |
| `.../OrientDesktop.ts` | Restore HEAD~1; cherry-pick paste/drop / wallpaper / orient sync deltas |
| `.../launcher-state.ts` | Restore HEAD~1; cherry-pick view gating + richer defaults |
| `.../Interact.ts` | Restore HEAD~1; cherry-pick touch last-pointer drop fix |
| `.../ShortcutEditor.ts` | Restore HEAD~1; cherry-pick theme + overlay z-index |
| `.../action-registry.ts` | Restore HEAD~1; cherry-pick normalize/open-view improvements |
| `.../OrientBox.ts` | Truncate duplicate class (keep one `UIOrientBox`) |
| `.../view-opener.ts` | Keep HEAD~1 opener API + cherry-pick `OverlayMountResolver` helpers |
| `.../SpeedDial.scss` | Restore HEAD~1 base; union unique visual rules from 2nd half |
| `.../toast.ts`, `needs-to-API.ts` | Keep (single-copy additions) |
| `.../layout.ts`, `pointer-interaction.ts`, `index.ts` | Untouched unless imports break |
| `modules/projects/fl.ui/src/styles/ui/_bar.scss` | Keep lines 1–272 (2nd half identical) |
| `.../_tabs.scss` | Keep lines 1–407 |
| `.../_sidebar.scss` | Keep lines 1–478 (2nd half truncated duplicate) |
| `.../_content.scss` | No change |
| `modules/shells/environment-shell/src/home/{ts,scss}` | Verify still symlinks to fl.ui |
| `modules/projects/fl.ui/test/speed-dial-layout.test.ts` | Keep; run as regression gate |
| `modules/projects/fl.ui/test/suites/speed-dial.ts` | Smoke suite; adjust only if imports break |

### Known restart lines (current broken tree)

| File | Approx 2nd-half start (1-based) | HEAD~1 size |
|---|---|---|
| `SpeedDial.ts` | 876 | 875 |
| `OrientDesktop.ts` | 1174 (`Filename:` again) | 1171 |
| `launcher-state.ts` | 739 | 736 |
| `Interact.ts` | 469 | 468 |
| `ShortcutEditor.ts` | 220 | 217 |
| `action-registry.ts` | 187 | 186 |
| `OrientBox.ts` | 74 (`export class UIOrientBox` again) | 66 |
| `view-opener.ts` | 24 (duplicate type/exports) | 17 |
| `SpeedDial.scss` | 686 (`@layer views` again) | 675 |
| `_bar.scss` | 273 | — |
| `_tabs.scss` | 408 | — |
| `_sidebar.scss` | 479 | — |

---

### Task 1: Snapshot halves + restore rewrite bases

**Files:**
- Create (scratch, gitignored or `/tmp`): ` /tmp/speed-dial-unify/second-half/*`
- Modify: doubled files under `modules/projects/fl.ui/src/ui/speed-dial/`
- Modify: `modules/projects/fl.ui/src/styles/ui/_bar.scss`, `_tabs.scss`, `_sidebar.scss`

**Interfaces:**
- Produces: clean rewrite-base working tree + second-half snapshots for diffing
- Consumes: `git show HEAD~1:...` from `modules/projects/fl.ui`

- [ ] **Step 1: Snapshot current doubled files and extract second halves**

```bash
cd /home/u2re-dev/U2RE.space/modules/projects/fl.ui
mkdir -p /tmp/speed-dial-unify/{current,second,base}
cp src/ui/speed-dial/SpeedDial.ts \
   src/ui/speed-dial/OrientDesktop.ts \
   src/ui/speed-dial/launcher-state.ts \
   src/ui/speed-dial/Interact.ts \
   src/ui/speed-dial/ShortcutEditor.ts \
   src/ui/speed-dial/action-registry.ts \
   src/ui/speed-dial/OrientBox.ts \
   src/ui/speed-dial/view-opener.ts \
   src/ui/speed-dial/SpeedDial.scss \
   src/styles/ui/_bar.scss \
   src/styles/ui/_tabs.scss \
   src/styles/ui/_sidebar.scss \
   /tmp/speed-dial-unify/current/

python3 <<'PY'
from pathlib import Path
cuts = {
  'SpeedDial.ts': 875,
  'OrientDesktop.ts': 1173,
  'launcher-state.ts': 738,
  'Interact.ts': 468,
  'ShortcutEditor.ts': 219,
  'action-registry.ts': 186,
  'OrientBox.ts': 73,
  'view-opener.ts': 23,
  'SpeedDial.scss': 685,
  '_bar.scss': 272,
  '_tabs.scss': 407,
  '_sidebar.scss': 478,
}
root = Path('/tmp/speed-dial-unify/current')
out = Path('/tmp/speed-dial-unify/second')
out.mkdir(parents=True, exist_ok=True)
for name, cut in cuts.items():
    lines = (root / name).read_text().splitlines(True)
    (out / name).write_text(''.join(lines[cut:]))
    print(name, 'second_lines', len(lines) - cut)
PY
```

Expected: second-half files written; line counts roughly match “now − HEAD~1”.

- [ ] **Step 2: Restore rewrite bases from HEAD~1 for TS/SCSS that existed**

```bash
cd /home/u2re-dev/U2RE.space/modules/projects/fl.ui
for f in \
  src/ui/speed-dial/SpeedDial.ts \
  src/ui/speed-dial/OrientDesktop.ts \
  src/ui/speed-dial/launcher-state.ts \
  src/ui/speed-dial/Interact.ts \
  src/ui/speed-dial/ShortcutEditor.ts \
  src/ui/speed-dial/action-registry.ts \
  src/ui/speed-dial/OrientBox.ts \
  src/ui/speed-dial/view-opener.ts \
  src/ui/speed-dial/SpeedDial.scss
do
  git show "HEAD~1:$f" > "$f"
  wc -l "$f"
done
```

Expected sizes ≈ HEAD~1 table above. Keep `toast.ts` / `needs-to-API.ts` as they are.

- [ ] **Step 3: Truncate identical / truncated SCSS duplicates**

```bash
cd /home/u2re-dev/U2RE.space/modules/projects/fl.ui
python3 <<'PY'
from pathlib import Path
for name, keep in [('_bar.scss', 272), ('_tabs.scss', 407), ('_sidebar.scss', 478)]:
    p = Path('src/styles/ui') / name
    lines = p.read_text().splitlines(True)
    p.write_text(''.join(lines[:keep]).rstrip() + '\n')
    print(name, 'now', len(p.read_text().splitlines()))
PY
```

Expected: `_bar` ≈272, `_tabs` ≈407, `_sidebar` ≈478; each file defines its mixin/selectors once.

- [ ] **Step 4: Sanity — no duplicate export/class markers**

```bash
cd /home/u2re-dev/U2RE.space/modules/projects/fl.ui
rg -n 'export function SpeedDial|Filename: OrientDesktop|const legacyMetaBuffer|export class UIOrientBox|export function registerSpeedDialAction|@layer views' \
  src/ui/speed-dial/SpeedDial.ts \
  src/ui/speed-dial/OrientDesktop.ts \
  src/ui/speed-dial/launcher-state.ts \
  src/ui/speed-dial/OrientBox.ts \
  src/ui/speed-dial/action-registry.ts \
  src/ui/speed-dial/SpeedDial.scss
```

Expected: each symbol/header appears **once** (except intentional non-duplicate mentions in comments).

- [ ] **Step 5: Run layout unit tests**

```bash
cd /home/u2re-dev/U2RE.space/modules/projects/fl.ui
node --import tsx --test test/speed-dial-layout.test.ts
```

Expected: PASS (layout.ts untouched). If `tsx` loader differs in this checkout, use the repo’s existing equivalent for `node:test` + TS.

---

### Task 2: Cherry-pick `view-opener` overlay resolver + `OrientBox` single class

**Files:**
- Modify: `modules/projects/fl.ui/src/ui/speed-dial/view-opener.ts`
- Modify: `modules/projects/fl.ui/src/ui/speed-dial/OrientBox.ts` (already restored; verify)
- Test: grep + TypeScript resolve via playground import

**Interfaces:**
- Consumes: HEAD~1 `setSpeedDialViewOpener` / `getSpeedDialViewOpener`
- Produces:

```ts
export type OverlayMountResolver = (anchor?: Element | null) => HTMLElement;
export function setHomeOverlayMountResolver(fn: OverlayMountResolver | null): void;
export function getHomeOverlayMountResolver(): OverlayMountResolver | null;
```

- [ ] **Step 1: Confirm `environment-shell` still needs overlay resolver**

```bash
rg -n 'setHomeOverlayMountResolver|getHomeOverlayMountResolver' \
  /home/u2re-dev/U2RE.space/modules/shells/environment-shell \
  /home/u2re-dev/U2RE.space/modules/projects/fl.ui
```

Expected: `HomeView` (`environment-shell/src/home/index.ts`) calls setter; ShortcutEditor may call getter.

- [ ] **Step 2: Append overlay helpers to restored `view-opener.ts`**

Ensure final file is a single module like:

```ts
/* keep existing SpeedDialViewOpener + set/get */

export type OverlayMountResolver = (anchor?: Element | null) => HTMLElement;

let overlayMountResolver: OverlayMountResolver | null = null;

export function setHomeOverlayMountResolver(fn: OverlayMountResolver | null): void {
    overlayMountResolver = fn;
}

export function getHomeOverlayMountResolver(): OverlayMountResolver | null {
    return overlayMountResolver;
}
```

Do **not** duplicate the opener type/exports.

- [ ] **Step 3: Verify OrientBox is a single `UIOrientBox` class**

```bash
rg -n 'export class UIOrientBox' src/ui/speed-dial/OrientBox.ts
```

Expected: one match. If HEAD~1 already is single-copy, no edit.

---

### Task 3: Cherry-pick `launcher-state` product deltas

**Files:**
- Modify: `modules/projects/fl.ui/src/ui/speed-dial/launcher-state.ts`
- Reference: `/tmp/speed-dial-unify/second/launcher-state.ts`

**Interfaces:**
- Consumes: rewrite persistence API from HEAD~1
- Produces: same public loaders/savers + gated defaults

- [ ] **Step 1: Diff base vs second half for unique symbols**

```bash
diff -u \
  /home/u2re-dev/U2RE.space/modules/projects/fl.ui/src/ui/speed-dial/launcher-state.ts \
  /tmp/speed-dial-unify/second/launcher-state.ts \
  | rg -n 'isEnabledView|DEFAULT_SPEED_DIAL|Network|Work Center|History|legacyMetaBuffer|isSpeedDialViewAllowed' \
  | head -80
```

- [ ] **Step 2: Port only these behaviors into the single module**

Must exist exactly once after edit:

1. `isEnabledView` / `isSpeedDialViewAllowed` filtering defaults **and** persisted tiles
2. Richer default tiles present in second half but missing in base (Markdown / Work Center / History / external shortcuts) **without** colliding cells
3. Single `legacyMetaBuffer` + flush helper
4. No second file header / second `DEFAULT_SPEED_DIAL_DATA_ALL` block

- [ ] **Step 3: Guard against double-declare**

```bash
rg -n 'const legacyMetaBuffer|DEFAULT_SPEED_DIAL_DATA_ALL|Speed-dial / launcher persistence' \
  src/ui/speed-dial/launcher-state.ts
```

Expected: header once; `legacyMetaBuffer` once; one defaults source array.

---

### Task 4: Cherry-pick `action-registry` + `ShortcutEditor`

**Files:**
- Modify: `modules/projects/fl.ui/src/ui/speed-dial/action-registry.ts`
- Modify: `modules/projects/fl.ui/src/ui/speed-dial/ShortcutEditor.ts`
- Reference: `/tmp/speed-dial-unify/second/{action-registry,ShortcutEditor}.ts`

**Interfaces:**
- Consumes: `resolveOpenViewTarget`, `registerSpeedDialAction`, `openShortcutEditor`
- Produces: same names; richer normalize + overlay mounting

- [ ] **Step 1: Diff and list second-half-only functions**

```bash
diff -u src/ui/speed-dial/action-registry.ts /tmp/speed-dial-unify/second/action-registry.ts | head -200
diff -u src/ui/speed-dial/ShortcutEditor.ts /tmp/speed-dial-unify/second/ShortcutEditor.ts | head -200
```

- [ ] **Step 2: Port action-registry deltas**

Required if present in second half and missing in base:

- `resolveOpenViewTarget` legacy label/id normalization (Markdown/Plan/etc.)
- any open-link / open-view dispatch hardening used by `HomeView`

Keep a **single** `registerSpeedDialAction` export.

- [ ] **Step 3: Port ShortcutEditor deltas**

Required:

- theme match before paint (`data-theme`)
- mount via `getHomeOverlayMountResolver()` when available; high z above `.env-shell-chrome`

```ts
const mount =
  getHomeOverlayMountResolver()?.(anchor) ??
  document.body;
```

- [ ] **Step 4: Verify single exports**

```bash
rg -n 'export function registerSpeedDialAction|export function openShortcutEditor|Filename: ShortcutEditor' \
  src/ui/speed-dial/action-registry.ts \
  src/ui/speed-dial/ShortcutEditor.ts
```

Expected: one export each; one filename header in ShortcutEditor.

---

### Task 5: Cherry-pick `Interact` touch-drop fix

**Files:**
- Modify: `modules/projects/fl.ui/src/ui/speed-dial/Interact.ts`
- Reference: `/tmp/speed-dial-unify/second/Interact.ts`
- Possibly touch: `modules/projects/fl.ui/src/ui/speed-dial/pointer-interaction.ts` only if fix belongs there

**Interfaces:**
- Consumes: `bindPointerInteraction` from `pointer-interaction.ts`
- Produces: `bindInteraction(...)` public adapter

- [ ] **Step 1: Locate second-half touch note**

```bash
rg -n 'last pointer|touch|clientX|clientY|drop' /tmp/speed-dial-unify/second/Interact.ts
rg -n 'last pointer|touch|clientX|pointer' src/ui/speed-dial/Interact.ts src/ui/speed-dial/pointer-interaction.ts
```

- [ ] **Step 2: Port the fix into the rewrite path**

Prefer implementing inside `pointer-interaction.ts` if that is where drop coordinates are resolved; keep `Interact.ts` as thin adapter.

Invariant: on touch, drop cell uses **last pointer client** coordinates, not lagged transformed tile center.

- [ ] **Step 3: Confirm single adapter export**

```bash
rg -n 'export function bindInteraction|Filename: Interact' src/ui/speed-dial/Interact.ts
```

Expected: one filename header, one `bindInteraction` export.

---

### Task 6: Cherry-pick `SpeedDial.ts` + `OrientDesktop.ts` product deltas

**Files:**
- Modify: `modules/projects/fl.ui/src/ui/speed-dial/SpeedDial.ts`
- Modify: `modules/projects/fl.ui/src/ui/speed-dial/OrientDesktop.ts`
- Reference: `/tmp/speed-dial-unify/second/{SpeedDial,OrientDesktop}.ts`

**Interfaces:**
- Consumes: `launcher-state`, `layout`, `pointer-interaction`, `view-opener`, wallpaper helpers from `fest/lure` / `fl-ui/misc/Canvas-2`
- Produces: single `SpeedDial(makeView)` and `initializeOrientedDesktop(root)`

- [ ] **Step 1: Inventory second-half-only WHY/features**

```bash
rg -n 'idb:rs-wallpaper|wallpaper|uri-list|bare domains|absolute http|data-URLs|Network|MutationObserver|bindPointerInteraction' \
  /tmp/speed-dial-unify/second/SpeedDial.ts \
  /tmp/speed-dial-unify/second/OrientDesktop.ts
rg -n 'idb:rs-wallpaper|wallpaper|uri-list|bare domains|absolute http|MutationObserver|bindPointerInteraction' \
  src/ui/speed-dial/SpeedDial.ts \
  src/ui/speed-dial/OrientDesktop.ts
```

- [ ] **Step 2: Port missing behaviors into the single copies**

Must end present (from second half if not already in base):

1. Wallpaper persistence via IDB (`idb:rs-wallpaper`); never persist raw data-URLs to localStorage
2. Paste/drop URL hygiene: add scheme for bare domains; require absolute http(s); prefer `text/uri-list` / plain over HTML chrome links
3. Keep rewrite orient pipeline: explicit `orient` + `MutationObserver` + `bindPointerInteraction`
4. `OrientDesktop` remains adapter delegating render to `SpeedDial` (no second desktop implementation)

- [ ] **Step 3: Duplicate-export gate**

```bash
rg -n 'export function SpeedDial|export function initializeOrientedDesktop|Filename: SpeedDial|Filename: OrientDesktop' \
  src/ui/speed-dial/SpeedDial.ts \
  src/ui/speed-dial/OrientDesktop.ts
```

Expected: one export and one filename header per file.

- [ ] **Step 4: Export surface still matches `index.ts`**

```bash
sed -n '1,20p' src/ui/speed-dial/index.ts
rg -n 'from \"./view-opener\"|OverlayMount|toast|needs-to-API' src/ui/speed-dial/index.ts src/ui/speed-dial/*.ts | head -40
```

If `HomeView` imports overlay helpers from `./ts/view-opener`, ensure they remain exported (either from `view-opener.ts` directly or re-exported).

---

### Task 7: Cherry-pick unique `SpeedDial.scss` rules

**Files:**
- Modify: `modules/projects/fl.ui/src/ui/speed-dial/SpeedDial.scss`
- Reference: `/tmp/speed-dial-unify/second/SpeedDial.scss`
- Related primitives (usually no edit): `src/styles/ui/_speed-dial.scss`, `_gridbox.scss`, `_orientbox.scss`

**Interfaces:**
- Produces: one `@layer views` stylesheet; rewrite grid placement retained; unique visual/editor rules from second half merged once

- [ ] **Step 1: Diff unique selectors**

```bash
diff -u src/ui/speed-dial/SpeedDial.scss /tmp/speed-dial-unify/second/SpeedDial.scss \
  | rg -n '^\+.*(\.speed-dial|data-grid-layer|label|dragging|editor|wallpaper)' \
  | head -120
```

- [ ] **Step 2: Merge only missing rules into the single `@layer views`**

Rules of merge:

- Keep rewrite placement model (standard grid + simple transform; no reintroducing obsolete `--cs-*` / `--rv-*` math if HEAD~1 already removed it)
- Port second-half-only visual fixes (label inert layer, edge captions, pointer-events on orient desktop, editor chrome)
- Do not paste the entire second `@layer views` block

- [ ] **Step 3: Gate single layer block + root**

```bash
rg -n '@layer views|\.speed-dial-root \{' src/ui/speed-dial/SpeedDial.scss
```

Expected: `@layer views` once; `.speed-dial-root {` may appear for variants but not a full duplicated stylesheet restart mid-file.

---

### Task 8: Symlink + import verification + smoke

**Files:**
- Verify: `modules/shells/environment-shell/src/home/ts` → `fl.ui/src/ui/speed-dial`
- Verify: `modules/shells/environment-shell/src/home/scss` → `fl.ui/src/styles/ui`
- Modify only if imports broke: `modules/shells/environment-shell/src/home/index.ts`, `modules/projects/fl.ui/test/suites/speed-dial.ts`

- [ ] **Step 1: Confirm symlinks**

```bash
readlink -f /home/u2re-dev/U2RE.space/modules/shells/environment-shell/src/home/ts
readlink -f /home/u2re-dev/U2RE.space/modules/shells/environment-shell/src/home/scss
```

Expected: paths under `modules/projects/fl.ui/src/ui/speed-dial` and `.../styles/ui`.

- [ ] **Step 2: Duplicate / syntax sweep**

```bash
cd /home/u2re-dev/U2RE.space/modules/projects/fl.ui
rg -n '<<<<<<|>>>>>>' src/ui/speed-dial src/styles/ui/_bar.scss src/styles/ui/_tabs.scss src/styles/ui/_sidebar.scss
node --import tsx --test test/speed-dial-layout.test.ts
```

Expected: no conflict markers; layout tests PASS.

- [ ] **Step 3: Playground smoke**

With fl.ui Vite already running (`npm run test` / `npm run dev` in fl.ui or consumer):

1. Open `?suite=speed-dial`
2. Confirm tiles render once (no doubled icons/labels)
3. Drag a tile; change `orient` 0→1→2→3; open a view shortcut
4. If env-shell consumer is up: home mount, paste a bare domain, set wallpaper if UI exposes it

- [ ] **Step 4: Update spec status line**

In `docs/superpowers/specs/2026-08-03-speed-dial-unify-design.md`, set:

```md
Status: implemented (pending final visual sign-off)
```

only after smoke passes.

---

## Spec coverage checklist

| Spec requirement | Task |
|---|---|
| Hybrid cherry-pick rewrite-base | 1–7 |
| SpeedDial canonical / OrientDesktop adapter | 6 |
| layout + pointer interaction preserved | 1, 5, 6 |
| launcher-state single module + gating/defaults | 3 |
| wallpaper IDB / paste hygiene | 6 |
| ShortcutEditor overlay z / theme | 2, 4 |
| action-registry normalize | 4 |
| Interact touch last-pointer | 5 |
| SpeedDial.scss unify | 7 |
| `_bar` / `_tabs` / `_sidebar` dedupe | 1 |
| `_content` untouched | 1 (explicit) |
| env-shell symlinks SoT | 8 |
| Public API + storage keys | 2–6, 8 |
| layout tests + suite smoke | 1, 8 |

## Self-review notes

- No TBD placeholders.
- `_content.scss` confirmed non-duplicate (half-ratio ~0.20) — excluded.
- `_bar` / `_tabs` second halves are ~identical (ratio 0.999) — safe truncate.
- `_sidebar` second half is shorter truncated duplicate — keep first 478 lines.
- Commit steps omitted per repo user rule unless user asks.
