# Explorer Bookmarks + Speed Dial OPFS Design

Date: 2026-08-19  
Status: implemented (pending CRX smoke) — Tasks 1–5 complete; unit tests green for PathRouter / LinkStore / ChromeBookmarksBackend. CRX on-device smoke (`/bookmarks/` R/W, mirror bookmark bar, folder → Explorer, LS→OPFS migration) still owed.

## Goal

Unify Explorer and Speed Dial around a pluggable virtual filesystem so that:

1. Chrome extension (CRX) can browse and edit Chrome bookmarks under `/bookmarks/`.
2. Speed dial persistence moves from `localStorage` to OPFS JSON under `/user/links/`.
3. Speed dial supports curated grid plus optional directory-mirror mode.
4. Folder tiles open Explorer at the target path; markdown/images preview via existing viewer paths.

## Decisions (locked)

| Topic | Choice |
|---|---|
| `/bookmarks/` meaning | Live Chrome Bookmarks API mirror |
| Bookmarks write model | Full R/W back to Chrome |
| Non-CRX hosts | Hide `/bookmarks/` root entirely |
| Speed dial SoT | OPFS `/user/links/` (`links.json` + `meta.json` + `icons/`) |
| Grid vs directory | Hybrid: curated default + optional mirror path |
| Folder tile click | Open Explorer at that path |
| Architecture | Provider mounts + shared LinkStore (approach 1) |
| `/favorites/` alias | Not in v1 (only `/bookmarks/`) |
| Shell ↔ CRX LinkStore sync | Not in v1 (separate origins) |

## Problem

- Speed dial grid/meta live in `localStorage` (`cw::workspace::speed-dial`); icons/wallpaper partially IDB; OPFS is only a best-effort mirror.
- Explorer Operative knows `/`, `/user/` (OPFS), `/assets/` (read-only) — no bookmarks mount.
- CRX already hosts NTP speed dial but lacks a first-class Explorer + Chrome bookmarks backend.
- Users want one path contract for curated links, OPFS folders, and Chrome bookmark folders.

## Architecture

```
SpeedDial / Explorer / Markdown viewer
            │
            ▼
     PathRouter (virtual roots)
     ├── /user/**      → OpfsBackend
     ├── /assets/**    → AssetsBackend (read-only)
     └── /bookmarks/** → ChromeBookmarksBackend  [CRX only]
            │
            ▼
     LinkStore (speed dial SoT)
     └── OPFS /user/links/
         ├── links.json
         ├── meta.json
         └── icons/<hash>.<ext>
```

### Components

| Unit | Responsibility | Depends on |
|---|---|---|
| `PathRouter` | Resolve virtual path → backend; root listing | registered backends |
| `OpfsBackend` | Existing `/user` OPFS operations | OPFS helpers in Operative |
| `AssetsBackend` | Existing read-only `/assets` | static asset index |
| `ChromeBookmarksBackend` | Map Chrome bookmarks tree ↔ explorer entries; R/W | `chrome.bookmarks` |
| `LinkStore` | Load/save curated items + meta; migrate LS; mirror merge | PathRouter + OPFS |
| Speed Dial UI | Curated / mirror render; folder → explorer | LinkStore, action-registry |
| CRX boot | Register bookmarks backend; mount explorer view | environment-shell |

Canonical code homes (edit once; symlinks follow):

- `modules/projects/fl.ui/src/ui/explorer/` (Operative / PathRouter / backends)
- `modules/projects/fl.ui/src/ui/speed-dial/` (LinkStore replaces LS-primary `launcher-state` persistence)
- `apps/CWSP-crx` (manifest `bookmarks`, boot registration)
- `modules/shells/environment-shell` (view wiring only)

## Virtual FS layout

### Roots

| Path | Backend | Visibility |
|---|---|---|
| `/user/` | OPFS | all hosts |
| `/assets/` | assets | all hosts (read-only) |
| `/bookmarks/` | Chrome Bookmarks API | CRX only when `chrome.bookmarks` + permission exist |

### Speed dial files

- `/user/links/links.json` — curated items: `{ id, label, action, href?, path?, icon, iconAsset? }`
- `/user/links/meta.json` — `{ version, mirrorPath?: string\|null, items: { [id]: { cell, shape, openLinkTarget, hidden?, form? } }, grid? }`
- `/user/links/icons/<hash>.<ext>` — custom icon bytes

## Explorer: ChromeBookmarksBackend

### Path identity

Prefer **stable Chrome bookmark id** in path segments so rename does not break links:

- `/bookmarks/<rootId>/…/<nodeId>/` for folders
- `/bookmarks/<rootId>/…/<nodeId>` for URL bookmarks (display title from Chrome `title`)

### Operation map

| Explorer op | Chrome API |
|---|---|
| list | `getChildren` / `getTree` (cached) |
| mkdir | `create({ parentId, title })` |
| create URL | `create({ parentId, title, url })` |
| rename | `update(id, { title })` |
| move | `move(id, { parentId, index })` |
| remove / rmdir | `remove` / `removeTree` |
| open URL | open tab / shell open-link policy |
| open folder | navigate explorer `path` |

### Events

Subscribe to `onCreated` / `onChanged` / `onRemoved` / `onMoved` → invalidate Operative listing cache for affected parents.

### Ingress rules

- `/bookmarks/` is not a byte store. Drop of non-URL file → reject (or offer save under `/user/` + create link); URI/url drop → `bookmarks.create`.
- Markdown/image preview for bookmark entries only when the URL is fetchable / data; otherwise show meta + favicon.

## Speed dial: LinkStore

### Modes

1. **Curated (default):** `mirrorPath == null` — items from `links.json` only.
2. **Mirror:** `mirrorPath` set to a PathRouter path (`/user/…` or `/bookmarks/…` in CRX) — listing becomes virtual items; `meta.json` overlays cell/shape/icon/`hidden`; “pin to curated” copies into `links.json`.

### Item actions

| Kind | Behavior |
|---|---|
| `open-link` / http(s) | Existing `openLinkTarget` policy |
| `path` → directory | Open Explorer with `initialPath` |
| `path` → `.md` / image | Existing viewer / preview channel |
| `open-view` | System tiles remain curated-only |

### Migration

On boot: if `localStorage` keys `cw::workspace::speed-dial` (+ `::meta`) exist and OPFS `links.json` is missing → import → write OPFS → leave LS under a one-release backup/migrated marker. Wallpaper stays IDB (out of scope for this change).

### UI (minimum)

- Settings / context: Speed dial source = Curated | Mirror + path picker.
- Path picker reuses Explorer (shows `/bookmarks/` only in CRX).

## CRX host

1. Manifest permission: `bookmarks`.
2. Boot: if `chrome?.bookmarks` → `registerFsBackend({ root: "/bookmarks/", backend })`.
3. Init LinkStore from extension-page OPFS.
4. Wire Explorer view through environment-shell (same as CWSP-shell), not a CRX-only fork.
5. Folder tiles → `open-view-explorer` with `initialPath`.

**Origin note:** CRX NTP OPFS ≠ HTTPS shell OPFS. No cross-origin LinkStore sync in v1.

## Error handling

- Missing API / permission → do not register backend; mirror to `/bookmarks/` fails soft (toast + curated fallback).
- Chrome API failure / concurrent edit → fail soft, re-list; never corrupt `links.json`.
- OPFS unavailable → temporary memory + LS fallback with visible warning.
- Invalid drop into `/bookmarks/` → clear user-facing reject.

## Testing

- Unit: PathRouter root visibility; LS→OPFS migration; mirror merge of listing + meta.
- Unit with mocked `chrome.bookmarks`: create/update/move/removeTree mapping.
- CRX smoke: `/` lists `/bookmarks`; folder tile opens explorer path; mirror bookmark bar.

## Implementation phases

1. PathRouter + backend registry refactor (no product UI change).
2. LinkStore OPFS + localStorage migration (curated only).
3. Mirror mode + folder → Explorer.
4. ChromeBookmarksBackend + CRX explorer wiring + `bookmarks` permission.
5. Polish: favicons, URL drop-to-bookmark, settings path picker UX.

## Out of scope (v1)

- `/favorites/` as a separate or alias root
- Syncing LinkStore between CWSP-shell origin and CRX NTP
- Changing wallpaper persistence (remains IDB)
- Non-Chromium bookmarks providers

## Touched surfaces (expected)

- `modules/projects/fl.ui/src/ui/explorer/*`
- `modules/projects/fl.ui/src/ui/speed-dial/launcher-state.ts` (and/or new `LinkStore`)
- `apps/CWSP-crx` manifest + boot
- `modules/shells/environment-shell` view/open wiring
- `apps/CWSP-explorer` / `apps/CWSP-shell` only if they share Operative mounts (symlink-aware)

## Success criteria

- In CRX: Explorer shows `/bookmarks/`, R/W reflects in Chrome bookmark manager.
- Outside CRX: `/bookmarks/` absent from root listing.
- Speed dial survives reload via OPFS JSON after one-time LS migration.
- Mirror mode can target `/user/links/` and (CRX) a bookmarks folder.
- Directory tile opens Explorer at that path; markdown/image open via viewer.
