# Explorer Bookmarks + Speed Dial OPFS Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Add pluggable virtual FS backends (including CRX `/bookmarks/` ↔ Chrome Bookmarks R/W), move speed-dial SoT to OPFS `/user/links/`, and support curated + mirror modes with folder tiles opening Explorer.

**Architecture:** Extract a `PathRouter` + `FsBackend` registry used by Explorer `FileOperative`. Add `LinkStore` that persists curated speed-dial JSON under OPFS and can mirror any PathRouter path. Register `ChromeBookmarksBackend` only in CRX boot.

**Tech Stack:** TypeScript, `node:test`, OPFS (`navigator.storage.getDirectory`), Chrome Extensions MV3 `chrome.bookmarks`, fest/object refs, existing fl.ui speed-dial + explorer-view Operative.

**Spec:** `docs/superpowers/specs/2026-08-19-explorer-bookmarks-speed-dial-opfs-design.md`

## Global Constraints

- Locked decisions from the spec: live `/bookmarks/` (Chrome API), R/W, hide outside CRX, OPFS LinkStore, hybrid curated+mirror, folder click → Explorer, no `/favorites/`, no shell↔CRX sync in v1.
- **Two Operative trees exist today** (different inodes):
  - Product hosts: `modules/views/explorer-view/src/web/ts/Operative.ts` (hardlinked into `environment-shell` + `CWSP-explorer`).
  - fl.ui copy: `modules/projects/fl.ui/src/ui/explorer/Operative.ts` (`navigation/explorer` → symlink).
  - New shared modules live under **fl.ui** and are **symlinked** into explorer-view so both trees share one PathRouter implementation.
- Speed-dial SoT remains `modules/projects/fl.ui/src/ui/speed-dial/` (`environment-shell/src/home/ts` is already a symlink).
- Do not redesign launcher UX beyond source picker + folder open behavior.
- Wallpaper stays IDB (out of scope).
- Commits: only when the user explicitly asks (omit commit steps unless requested).
- Prefer small focused new files over growing `Operative.ts` further.

## File map

| File | Responsibility |
|---|---|
| `modules/projects/fl.ui/src/ui/explorer/fs-backend.ts` | `FsBackend` interface + shared path helpers |
| `modules/projects/fl.ui/src/ui/explorer/path-router.ts` | Backend registry + resolve/listRoots |
| `modules/projects/fl.ui/src/ui/explorer/backends/opfs-backend.ts` | Thin adapter wrapping existing OPFS list/write helpers (optional extract) |
| `modules/projects/fl.ui/src/ui/explorer/backends/assets-backend.ts` | Read-only assets listing adapter |
| `modules/projects/fl.ui/src/ui/explorer/backends/chrome-bookmarks-backend.ts` | Chrome Bookmarks ↔ FileEntry R/W |
| `modules/views/explorer-view/src/web/ts/{fs-backend,path-router,backends}*` | Symlinks → fl.ui copies |
| `…/Operative.ts` (both trees) | Dispatch `#loadPathNow` / mutations via PathRouter |
| `modules/projects/fl.ui/src/ui/speed-dial/link-store.ts` | OPFS links.json + meta.json + migration + mirror merge |
| `modules/projects/fl.ui/src/ui/speed-dial/launcher-state.ts` | Delegate persist/load to LinkStore; keep reactive collections |
| `modules/projects/fl.ui/src/ui/speed-dial/action-registry.ts` | Folder/`path` → explorer with `initialPath`; open md/image |
| `modules/projects/fl.ui/src/ui/speed-dial/SpeedDial.ts` | Mirror mode item source; source picker entry |
| `apps/CWSP-crx/src/crx/manifest.json` | Add `bookmarks` permission |
| `apps/CWSP-crx/src/crx/newtab/main.ts` (or shared CRX boot) | `registerFsBackend(ChromeBookmarksBackend)` |
| `modules/shells/environment-shell/src/views/explorer/runtime.ts` | Already supports `initialPath` — verify wiring from actions |
| `modules/projects/fl.ui/test/path-router.test.ts` | Root visibility + resolve |
| `modules/projects/fl.ui/test/link-store.test.ts` | Migration + mirror merge (memory/mock FS) |
| `modules/projects/fl.ui/test/chrome-bookmarks-backend.test.ts` | Mock `chrome.bookmarks` CRUD |

---

### Task 1: PathRouter + FsBackend registry

**Files:**
- Create: `modules/projects/fl.ui/src/ui/explorer/fs-backend.ts`
- Create: `modules/projects/fl.ui/src/ui/explorer/path-router.ts`
- Create: `modules/projects/fl.ui/test/path-router.test.ts`
- Modify: both `Operative.ts` trees — `#loadPathNow` + `listVirtualRootEntries` use router
- Create symlinks under `modules/views/explorer-view/src/web/ts/` for the new modules

**Interfaces:**
- Produces:
  ```ts
  export type EntryKind = "file" | "directory";
  export interface FileEntryLike {
    name: string;
    kind: EntryKind;
    path?: string;
    type?: string;
    href?: string; // bookmarks URL entries
    bookmarkId?: string;
  }
  export interface FsBackend {
    readonly root: string; // e.g. "/user/", "/assets/", "/bookmarks/"
    readonly writable: boolean;
    list(path: string): Promise<FileEntryLike[]>;
    mkdir?(path: string, name: string): Promise<void>;
    remove?(path: string, recursive?: boolean): Promise<void>;
    rename?(path: string, newName: string): Promise<void>;
    move?(fromPath: string, toDirPath: string): Promise<void>;
    createUrl?(parentPath: string, title: string, url: string): Promise<void>;
    // byte write only for OPFS-capable backends
    writeFile?(parentPath: string, file: File): Promise<void>;
  }
  export function normalizeVirtualPath(path: string): string;
  export function registerFsBackend(backend: FsBackend): void;
  export function unregisterFsBackend(root: string): void;
  export function listRegisteredRoots(): string[];
  export function resolveFsBackend(path: string): FsBackend | null;
  export function listVirtualRootEntriesFromRouter(): FileEntryLike[];
  ```
- Consumes: existing `normalizeDirectoryPath` logic (move shared helpers into `fs-backend.ts`)

- [ ] **Step 1: Write failing PathRouter tests**

Create `modules/projects/fl.ui/test/path-router.test.ts`:

```ts
import test from "node:test";
import assert from "node:assert/strict";
import {
  normalizeVirtualPath,
  registerFsBackend,
  unregisterFsBackend,
  resolveFsBackend,
  listVirtualRootEntriesFromRouter,
  type FsBackend,
  type FileEntryLike
} from "../src/ui/explorer/path-router.ts";

const makeBackend = (root: string, writable = true): FsBackend => ({
  root,
  writable,
  async list() {
    return [] as FileEntryLike[];
  }
});

test("normalizeVirtualPath forces trailing slash for directories", () => {
  assert.equal(normalizeVirtualPath("/user"), "/user/");
  assert.equal(normalizeVirtualPath("/user/"), "/user/");
  assert.equal(normalizeVirtualPath("/"), "/");
});

test("resolveFsBackend picks longest matching root", () => {
  registerFsBackend(makeBackend("/user/"));
  registerFsBackend(makeBackend("/bookmarks/"));
  assert.equal(resolveFsBackend("/user/links/")?.root, "/user/");
  assert.equal(resolveFsBackend("/bookmarks/1/2")?.root, "/bookmarks/");
  assert.equal(resolveFsBackend("/nope"), null);
  unregisterFsBackend("/user/");
  unregisterFsBackend("/bookmarks/");
});

test("listVirtualRootEntriesFromRouter only includes registered roots", () => {
  registerFsBackend(makeBackend("/user/"));
  registerFsBackend(makeBackend("/assets/", false));
  const names = listVirtualRootEntriesFromRouter().map((e) => e.name).sort();
  assert.deepEqual(names, ["assets", "user"]);
  assert.equal(resolveFsBackend("/bookmarks/"), null);
  unregisterFsBackend("/user/");
  unregisterFsBackend("/assets/");
});
```

- [ ] **Step 2: Run tests — expect FAIL (module missing)**

```bash
cd /home/u2re-dev/U2RE.space/modules/projects/fl.ui
node --test test/path-router.test.ts
```

Expected: FAIL — cannot find module / exports.

- [ ] **Step 3: Implement `fs-backend.ts` + `path-router.ts`**

`fs-backend.ts` — types + `normalizeVirtualPath`:

```ts
export type EntryKind = "file" | "directory";

export interface FileEntryLike {
  name: string;
  kind: EntryKind;
  path?: string;
  type?: string;
  href?: string;
  bookmarkId?: string;
}

export interface FsBackend {
  readonly root: string;
  readonly writable: boolean;
  list(path: string): Promise<FileEntryLike[]>;
  mkdir?(path: string, name: string): Promise<void>;
  remove?(path: string, recursive?: boolean): Promise<void>;
  rename?(path: string, newName: string): Promise<void>;
  move?(fromPath: string, toDirPath: string): Promise<void>;
  createUrl?(parentPath: string, title: string, url: string): Promise<void>;
  writeFile?(parentPath: string, file: File): Promise<void>;
}

/** INVARIANT: directories end with `/`; file paths do not. Root is `/`. */
export function normalizeVirtualPath(path: string, asDirectory = true): string {
  let p = String(path || "/").trim() || "/";
  if (!p.startsWith("/")) p = `/${p}`;
  p = p.replace(/\/{2,}/g, "/");
  if (p !== "/" && asDirectory && !p.endsWith("/")) p += "/";
  if (p !== "/" && !asDirectory && p.endsWith("/")) p = p.slice(0, -1);
  return p;
}
```

`path-router.ts` — registry Map keyed by normalized root; `resolveFsBackend` chooses longest prefix match; `listVirtualRootEntriesFromRouter` returns `{ name: rootSegment, kind: "directory" }` for each registered root (skip `/`).

- [ ] **Step 4: Re-run tests — expect PASS**

```bash
node --test test/path-router.test.ts
```

Expected: all PASS.

- [ ] **Step 5: Symlink into explorer-view and wire Operative dispatch**

```bash
cd /home/u2re-dev/U2RE.space/modules/views/explorer-view/src/web/ts
ln -sfn ../../../../../projects/fl.ui/src/ui/explorer/fs-backend.ts ./fs-backend.ts
ln -sfn ../../../../../projects/fl.ui/src/ui/explorer/path-router.ts ./path-router.ts
```

In **both** Operative `#loadPathNow` (after virtual-root / assets / user branches), prefer:

```ts
import { resolveFsBackend, listVirtualRootEntriesFromRouter, normalizeVirtualPath } from "./path-router";

// listVirtualRootEntries():
return listVirtualRootEntriesFromRouter().map((e) => observe({ name: e.name, kind: e.kind }));

// Inside #loadPathNow, before legacy OPFS openDirectory:
const backend = resolveFsBackend(rel);
if (backend && backend.root === "/bookmarks/") {
  this.applyEntries((await backend.list(rel)).map((e) => observe(e)));
  return this;
}
```

For Task 1 only: **register default `/user/` and `/assets/` backends** at module init inside Operative (adapters that call existing `listUserEntriesDirect` / `listAssetEntries`), so root listing behavior stays identical and `/bookmarks/` remains absent until Task 4.

- [ ] **Step 6: Smoke existing explorer path**

```bash
cd /home/u2re-dev/U2RE.space/modules/projects/fl.ui
node --test test/path-router.test.ts test/explorer-layout.test.ts
```

Manual (optional): `npm run dev` → `?suite=explorer` → `/` shows `user` + `assets` only.

---

### Task 2: LinkStore OPFS + localStorage migration (curated only)

**Files:**
- Create: `modules/projects/fl.ui/src/ui/speed-dial/link-store.ts`
- Create: `modules/projects/fl.ui/test/link-store.test.ts`
- Modify: `modules/projects/fl.ui/src/ui/speed-dial/launcher-state.ts` — `persistSpeedDialItems` / `persistSpeedDialMeta` / boot load
- Modify: `modules/projects/fl.ui/src/ui/speed-dial/index.ts` — export LinkStore APIs if needed

**Interfaces:**
- Produces:
  ```ts
  export const LINKS_DIR = "/user/links/";
  export const LINKS_JSON = "/user/links/links.json";
  export const META_JSON = "/user/links/meta.json";
  export const LS_ITEMS_KEY = "cw::workspace::speed-dial";
  export const LS_META_KEY = "cw::workspace::speed-dial::meta";
  export const LS_MIGRATED_KEY = "cw::workspace::speed-dial::migrated-opfs-v1";

  export interface LinkStoreItem {
    id: string;
    label: string;
    action: string;
    icon: string;
    href?: string;
    path?: string;
    iconAsset?: string; // path under /user/links/icons/
  }
  export interface LinkStoreMetaFile {
    version: 1;
    mirrorPath?: string | null;
    items: Record<string, {
      cell?: [number, number];
      shape?: string;
      openLinkTarget?: string;
      hidden?: boolean;
      form?: string;
      // retain existing SpeedDialItemMeta fields as needed
      [key: string]: unknown;
    }>;
    grid?: unknown;
  }
  export function packLinksFromSpeedDial(/* existing packed items */): LinkStoreItem[];
  export function mergeMetaFile(/* ... */): LinkStoreMetaFile;
  export async function migrateLocalStorageToOpfsIfNeeded(io: LinkStoreIo): Promise<"migrated" | "skipped" | "already">;
  export async function readLinkStore(io: LinkStoreIo): Promise<{ items: LinkStoreItem[]; meta: LinkStoreMetaFile } | null>;
  export async function writeLinkStore(io: LinkStoreIo, items: LinkStoreItem[], meta: LinkStoreMetaFile): Promise<void>;
  export interface LinkStoreIo {
    readText(path: string): Promise<string | null>;
    writeText(path: string, text: string): Promise<void>;
    exists(path: string): Promise<boolean>;
  }
  ```
- Consumes: existing `packState` / `packMetaRegistry` shapes from `launcher-state.ts`

- [ ] **Step 1: Write failing LinkStore unit tests (pure + mock IO)**

```ts
import test from "node:test";
import assert from "node:assert/strict";
import {
  migrateLocalStorageToOpfsIfNeeded,
  readLinkStore,
  writeLinkStore,
  type LinkStoreIo,
  type LinkStoreItem,
  type LinkStoreMetaFile,
  LS_ITEMS_KEY,
  LS_META_KEY,
  LS_MIGRATED_KEY,
  LINKS_JSON
} from "../src/ui/speed-dial/link-store.ts";

function memoryIo(initial: Record<string, string> = {}): LinkStoreIo & { files: Record<string, string> } {
  const files = { ...initial };
  return {
    files,
    async readText(path) { return files[path] ?? null; },
    async writeText(path, text) { files[path] = text; },
    async exists(path) { return path in files; }
  };
}

test("migrate copies LS into OPFS once", async () => {
  const io = memoryIo();
  // simulate LS via injected getters — implement migrate to accept optional ls: Storage-like
  const ls = new Map<string, string>([
    [LS_ITEMS_KEY, JSON.stringify([{ id: "a", label: "A", action: "open-link", icon: "link", cell: [0, 0] }])],
    [LS_META_KEY, JSON.stringify({ a: { href: "https://example.com" } })]
  ]);
  const result = await migrateLocalStorageToOpfsIfNeeded(io, ls);
  assert.equal(result, "migrated");
  assert.ok(await io.exists(LINKS_JSON));
  assert.equal(ls.get(LS_MIGRATED_KEY), "1");
  const again = await migrateLocalStorageToOpfsIfNeeded(io, ls);
  assert.equal(again, "already");
});

test("write/read roundtrip", async () => {
  const io = memoryIo();
  const items: LinkStoreItem[] = [{ id: "x", label: "X", action: "open-view", icon: "books" }];
  const meta: LinkStoreMetaFile = { version: 1, mirrorPath: null, items: { x: { cell: [1, 2] } } };
  await writeLinkStore(io, items, meta);
  const got = await readLinkStore(io);
  assert.equal(got?.items[0]?.id, "x");
  assert.deepEqual(got?.meta.items.x.cell, [1, 2]);
});
```

Adjust `migrateLocalStorageToOpfsIfNeeded` signature to accept `Map | Storage` for testability.

- [ ] **Step 2: Run — expect FAIL**

```bash
node --test test/link-store.test.ts
```

- [ ] **Step 3: Implement `link-store.ts`**

- Use JSOX or JSON consistently with launcher-state (prefer **JSON** for OPFS files for hand-editability; if existing pack uses JSOX, accept both on read).
- Real browser IO helper:

```ts
export async function createOpfsLinkStoreIo(): Promise<LinkStoreIo> {
  const root = await navigator.storage.getDirectory();
  // walk/create user/links via getDirectoryHandle({ create:true })
  // read/write via getFileHandle + createWritable
}
```

- On OPFS failure: throw typed error; launcher-state catches and falls back to LS **with** `console.warn("[link-store] OPFS unavailable; using localStorage")`.

- [ ] **Step 4: Wire `launcher-state.ts`**

On module init / first persist:

1. `await migrateLocalStorageToOpfsIfNeeded(opfsIo, localStorage)`
2. If OPFS links exist → hydrate `speedDialItems` / `speedDialMeta` from OPFS (map cells into observe/stringRef as today)
3. `persistSpeedDialItems` / `persistSpeedDialMeta` write OPFS first; optionally mirror LS for one release when `LS_MIGRATED_KEY` set

Keep public function names: `persistSpeedDialItems`, `persistSpeedDialMeta`, `speedDialItems`, `speedDialMeta`.

- [ ] **Step 5: Run tests — expect PASS**

```bash
node --test test/link-store.test.ts test/speed-dial-layout.test.ts
```

Note: pre-existing orient assertion failures in `speed-dial-layout.test.ts` are unrelated — do not “fix” unless this task breaks imports.

---

### Task 3: Mirror mode + folder tile → Explorer

**Files:**
- Modify: `link-store.ts` — `buildMirrorItems(listing, meta)`
- Modify: `launcher-state.ts` — `getSpeedDialMirrorPath` / `setSpeedDialMirrorPath`
- Modify: `SpeedDial.ts` — render curated vs mirror-merged list
- Modify: `action-registry.ts` — open `path` directories via explorer `initialPath`
- Modify: `modules/shells/environment-shell/src/views/explorer/runtime.ts` — confirm `params.path` / `initialPath` (already present)
- Create/extend: `test/link-store.test.ts` mirror merge cases

**Interfaces:**
- Produces:
  ```ts
  export function buildMirrorSpeedDialItems(
    listing: Array<{ name: string; kind: EntryKind; path: string; href?: string }>,
    meta: LinkStoreMetaFile,
    mirrorPath: string
  ): Array<{ id: string; label: string; action: string; icon: string; cell: [number, number]; path?: string; href?: string }>;
  // id = `mirror:${path}`; skip meta.items[id].hidden === true
  // directories → action "open-path"; files .md/image → action "open-path"; url href → "open-link"
  ```
- Consumes: PathRouter `resolveFsBackend(mirrorPath).list(mirrorPath)`; explorer runtime `initialPath`

- [ ] **Step 1: Failing tests for mirror merge**

```ts
test("mirror merge applies hidden and cell overrides", () => {
  const items = buildMirrorSpeedDialItems(
    [
      { name: "docs", kind: "directory", path: "/user/docs/" },
      { name: "a.md", kind: "file", path: "/user/a.md" }
    ],
    {
      version: 1,
      mirrorPath: "/user/",
      items: {
        "mirror:/user/docs/": { cell: [2, 3] },
        "mirror:/user/a.md": { hidden: true }
      }
    },
    "/user/"
  );
  assert.equal(items.length, 1);
  assert.equal(items[0].id, "mirror:/user/docs/");
  assert.deepEqual(items[0].cell, [2, 3]);
  assert.equal(items[0].action, "open-path");
});
```

- [ ] **Step 2: Implement merge + `setSpeedDialMirrorPath`**

Persist `mirrorPath` in `meta.json`. When non-null, SpeedDial data source = merge(listing, meta) instead of curated `links.json` items (system `open-view-*` tiles: either keep pinned curated overlay or hide in mirror — **keep curated `open-view` tiles always visible above mirror items**).

- [ ] **Step 3: `open-path` action in action-registry**

```ts
actionRegistry.set("open-path", async (context, entityDesc) => {
  const path = String(entityDesc?.path || entityDesc?.meta?.path || context?.path || "").trim();
  if (!path) return;
  const opener = context?.viewMaker || getSpeedDialViewOpener();
  // Directory if ends with / or known dir
  if (path.endsWith("/") || entityDesc?.kind === "directory") {
    await opener?.("explorer", { params: { path, initialPath: path } } as any);
    return;
  }
  if (/\.(md|markdown|txt)$/i.test(path) || entityDesc?.type?.startsWith?.("text/")) {
    await opener?.("viewer", { params: { src: path, path } } as any);
    return;
  }
  if (/\.(png|jpe?g|gif|webp|svg)$/i.test(path)) {
    await opener?.("viewer", { params: { src: path, path } } as any);
    return;
  }
  // fallback: explorer parent
  await opener?.("explorer", { params: { path, initialPath: path } } as any);
});
```

Ensure explorer `runtime.ts` `loadLastPath` already prefers `initialPath` (it does). Verify `requestOpenView` / view opener passes `params.path` through in CRX + shell.

- [ ] **Step 4: Minimal UI — context menu “Speed dial source”**

On home empty-area context menu (existing SpeedDial menu): entries `Curated` | `Mirror…`. Mirror… opens explorer picker callback that sets path via `setSpeedDialMirrorPath` and refreshes.

- [ ] **Step 5: Run unit tests**

```bash
node --test test/link-store.test.ts test/path-router.test.ts
```

---

### Task 4: ChromeBookmarksBackend + CRX wiring

**Files:**
- Create: `modules/projects/fl.ui/src/ui/explorer/backends/chrome-bookmarks-backend.ts`
- Create symlink: `modules/views/explorer-view/src/web/ts/backends/chrome-bookmarks-backend.ts`
- Create: `modules/projects/fl.ui/test/chrome-bookmarks-backend.test.ts`
- Modify: `apps/CWSP-crx/src/crx/manifest.json` — add `"bookmarks"`
- Modify: `apps/CWSP-crx/src/crx/newtab/main.ts` — register backend before `bootEnvironment`
- Modify: Operative mutation paths (mkdir/rename/remove/drop) to call backend methods when `resolveFsBackend(path)?.root === "/bookmarks/"`

**Interfaces:**
- Produces:
  ```ts
  export function createChromeBookmarksBackend(api?: typeof chrome.bookmarks): FsBackend;
  // root = "/bookmarks/"
  // path form: /bookmarks/<id>/.../<id>  (ids are Chrome bookmark ids)
  // list("/bookmarks/") → getTree() top-level children (bookmark bar, other, …)
  ```
- Consumes: PathRouter `registerFsBackend`

- [ ] **Step 1: Failing tests with mock API**

```ts
import test from "node:test";
import assert from "node:assert/strict";
import { createChromeBookmarksBackend } from "../src/ui/explorer/backends/chrome-bookmarks-backend.ts";

function mockBookmarks() {
  const nodes = new Map<string, any>([
    ["0", { id: "0", title: "", children: [{ id: "1", title: "Bookmarks bar", children: [] }] }],
    ["1", { id: "1", title: "Bookmarks bar", parentId: "0", children: [
      { id: "10", title: "Example", url: "https://example.com", parentId: "1" }
    ]}]
  ]);
  return {
    async getTree() { return [nodes.get("0")]; },
    async getChildren(id: string) { return nodes.get(id)?.children ?? []; },
    async create(opts: any) {
      const id = String(100 + nodes.size);
      const node = { id, title: opts.title, url: opts.url, parentId: opts.parentId, children: opts.url ? undefined : [] };
      nodes.set(id, node);
      const parent = nodes.get(opts.parentId);
      parent.children.push(node);
      return node;
    },
    async update(id: string, changes: any) { Object.assign(nodes.get(id), changes); return nodes.get(id); },
    async move(id: string, dest: any) { /* update parentId */ return nodes.get(id); },
    async remove(id: string) { nodes.delete(id); },
    async removeTree(id: string) { nodes.delete(id); }
  };
}

test("lists bookmark bar entries", async () => {
  const backend = createChromeBookmarksBackend(mockBookmarks() as any);
  const entries = await backend.list("/bookmarks/1/");
  assert.equal(entries.some((e) => e.bookmarkId === "10" && e.href === "https://example.com"), true);
});

test("createUrl writes through API", async () => {
  const api = mockBookmarks();
  const backend = createChromeBookmarksBackend(api as any);
  await backend.createUrl!("/bookmarks/1/", "New", "https://n.example");
  const entries = await backend.list("/bookmarks/1/");
  assert.ok(entries.some((e) => e.href === "https://n.example"));
});
```

- [ ] **Step 2: Implement backend**

Mapping rules (locked):

- Directory entry `path = /bookmarks/<id>/`, `name = title || id`
- URL entry `path = /bookmarks/<id>`, `kind = "file"`, `href = url`, `type = "text/uri-list"`
- `mkdir(parentPath, name)` → `create({ parentId: lastId(parentPath), title: name })`
- `createUrl` → `create({ parentId, title, url })`
- `rename` → `update(id, { title })`
- `remove` → URL `remove`, folder `removeTree`
- `writeFile` → **omit / throw** `"bookmarks backend does not store file bytes"`
- Subscribe optional: if `api.onCreated` exists, caller may invalidate; expose `subscribeBookmarksInvalidation(cb)` used by Operative to `loadPath(current)`

- [ ] **Step 3: CRX manifest + boot**

`manifest.json` permissions array add `"bookmarks"`.

In `newtab/main.ts` before boot:

```ts
import { registerFsBackend } from "fl-ui/explorer/path-router"; // or relative alias used by CRX
import { createChromeBookmarksBackend } from "fl-ui/explorer/backends/chrome-bookmarks-backend";

if (globalThis.chrome?.bookmarks) {
  registerFsBackend(createChromeBookmarksBackend(chrome.bookmarks));
}
```

Fix import alias to whatever CRX/Vite already uses for fl.ui (prefer existing `@fest-lib/fl-ui` / `fl-ui/*` patterns).

- [ ] **Step 4: Operative mutations for bookmarks**

In remove/rename/mkdir/drop handlers: if backend is bookmarks:

- drop URI → `createUrl`
- drop File bytes → reject with user-visible error string (toast/showMessage)
- never call OPFS `writeUserFile` for `/bookmarks/**`

- [ ] **Step 5: Run unit tests**

```bash
node --test test/chrome-bookmarks-backend.test.ts test/path-router.test.ts
```

- [ ] **Step 6: CRX manual smoke checklist**

1. `npm run build:crx` (from repo script that builds CWSP-crx)
2. Load unpacked extension; open NTP
3. Open Explorer → `/` lists `bookmarks`
4. Create folder + URL; confirm in `chrome://bookmarks`
5. Speed dial folder tile / mirror `/bookmarks/1/` → explorer opens that path
6. Same build in non-CRX shell: `/bookmarks` absent

---

### Task 5: Polish (favicons, URL drop, settings picker)

**Files:**
- Modify: `ChromeBookmarksBackend` / SpeedDial icon resolution — `chrome://favicon/` or `https://www.google.com/s2/favicons?domain=`
- Modify: SpeedDial / explorer drop handlers for URI-list into `/bookmarks/`
- Modify: QuickSettings or home context — clearer “Speed dial source” control
- Update spec status line to `approved / implementing`

**Interfaces:**
- Consumes: Tasks 1–4 APIs unchanged
- Produces: favicon helper `resolveEntryIcon(entry: FileEntryLike): string`

- [ ] **Step 1: Favicon helper + wire into mirror items + explorer list (CRX only)**

```ts
export function faviconForHref(href: string): string {
  try {
    const host = new URL(href).hostname;
    return `https://www.google.com/s2/favicons?domain=${encodeURIComponent(host)}&sz=64`;
  } catch {
    return "link";
  }
}
```

- [ ] **Step 2: Drop URI onto bookmarks folder creates bookmark**

Reuse explorer drop path; if `text/uri-list` or URL string and backend.root === `/bookmarks/`, call `createUrl` then refresh.

- [ ] **Step 3: Settings copy**

Label: “Speed dial source” — values Curated / Mirror path (read-only path text + Change… button opening explorer).

- [ ] **Step 4: Final verification matrix**

| Check | Where |
|---|---|
| Unit PathRouter / LinkStore / Bookmarks mock | `node --test test/path-router.test.ts test/link-store.test.ts test/chrome-bookmarks-backend.test.ts` |
| Non-CRX root has no bookmarks | shell / fl.ui explorer suite |
| CRX root has bookmarks + R/W | unpacked CRX |
| LS → OPFS migration once | clear OPFS, keep LS, reload |
| Mirror + folder → explorer | NTP / shell home |
| Markdown/image open | mirror file tile |

---

## Spec coverage checklist

| Spec requirement | Task |
|---|---|
| PathRouter + backends | 1 |
| `/bookmarks/` CRX-only visibility | 1 + 4 |
| LinkStore OPFS JSON + meta | 2 |
| LS migration | 2 |
| Hybrid curated + mirror | 3 |
| Folder → Explorer `initialPath` | 3 |
| Chrome R/W backend | 4 |
| CRX permission + boot | 4 |
| Favicons / URL drop / picker UX | 5 |
| No `/favorites/`, no shell↔CRX sync, wallpaper unchanged | Global constraints (explicit non-goals) |

## Placeholder / consistency self-review

- No TBD steps; interfaces named consistently (`FsBackend`, `LinkStoreIo`, `createChromeBookmarksBackend`, `open-path`).
- Dual Operative trees called out; symlinks required so product hosts receive PathRouter.
- `initialPath` already exists in explorer `runtime.ts` — Task 3 wires actions to it rather than inventing a second API.
