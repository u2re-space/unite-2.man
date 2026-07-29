# CWSP-explorer Standalone PWA (Slim / Online-first)

**Date:** 2026-07-29  
**Status:** approved — implementing  
**App:** `apps/CWSP-explorer` → `modules/views/explorer-view`  
**Decision:** Approach **A** (slim Explorer PWA)

## Goals

Make CWSP-explorer installable as a standalone PWA on HTTPS LAN (e.g. `https://192.168.0.200/`) with:

1. Web App Manifest (Explorer identity, WCO / standalone)
2. Service worker (online-first; share-target staging only)
3. Share Target + File Handlers → files land in Explorer OPFS (`/user/`)
4. Client registration via existing subsystem `initPWA` / `ensureServiceWorkerRegistered` patterns

## Non-goals (v1)

- Offline shell / aggressive Workbox precache
- Viewer / Work Center / AI share pipelines from CrossWord
- Clipboard SW relays, push, background sync
- Full port of the ~2.6k-line CrossWord `sw.ts`

## Product identity

| Field | Value |
|---|---|
| `name` | CWSP Explorer |
| `short_name` | Explorer |
| `description` | Standalone file manager (OPFS) |
| `start_url` | `/` |
| `scope` | `/` |
| `display` | `standalone` |
| `display_override` | `window-controls-overlay`, `standalone` |
| `theme_color` / `background_color` | dark shell (`#1f2225` or current demo chrome) |
| Icons | reuse `src/pwa/icons/*` (svg / png / maskable) |

Remove CrossWord branding (`cw.u2re.space`, viewer/workcenter shortcuts/screenshots that refer to document PWA).

## Manifest features

### Share Target

```json
{
  "share_target": {
    "action": "/share-target",
    "method": "POST",
    "enctype": "multipart/form-data",
    "params": {
      "title": "title",
      "text": "text",
      "url": "url",
      "files": [{ "name": "mapped_files", "accept": ["*/*", "text/*", "image/*", "application/pdf", "application/json"] }]
    }
  }
}
```

### File Handlers

Accept common text / markdown / image / pdf / json (same spirit as current explorer manifest, without CW-only routes).  
`action`: `/` (or `/explorer` if SPA routing requires it — prefer `/` for standalone host).

### Launch

- `launch_handler.client_mode`: `focus-existing`
- `handle_links`: `preferred` (optional; keep if harmless)

## Architecture

```
[ OS Share / File Open ]
        │
        ▼
[ SW POST /share-target ] ──► Cache Storage (share-target-data)
        │
        ▼
[ clients.openWindow('/') or focus ]
        │
        ▼
[ demo/boot.ts + Explorer view ]
        │
        ▼
[ drain share cache → OPFS /user/ via FileManager ingest ]
```

### Service worker (new slim `src/pwa/sw.ts`)

Replace CrossWord-heavy worker with a small module that:

1. Imports `./sw-preamble` (keep quiet Workbox logging if still needed)
2. Declares `self.__WB_MANIFEST` for injectManifest compatibility
3. **Does not** call aggressive `precacheAndRoute` of the whole app in v1  
   - Either skip precache, or precache only an empty/minimal filtered list
4. Default fetch: **network-only** (pass-through); never intercept Vite HMR / `/@vite` / `/@fs` / `/src/*` in a way that breaks dev
5. Registers POST handler for `/share-target` (and `/share_target` alias):
   - parse FormData (reuse `parseFormDataFromRequest` / `buildShareData` / `cacheShareData` from `ShareTargetUtils` **without** AI / ExecutionCore paths)
   - redirect or `Response.redirect('/')` with `?shared=1`
   - open/focus a client window
6. Optional GET `/share-target-files` or message handler so the page can pull staged files
7. `skipWaiting` + `clientsClaim` on activate

Archive or leave unused CW routers (`commit-analyze`, etc.) **unimported** — do not delete in v1 unless they block the build.

### Client (`demo/boot.ts`)

1. Keep `ui-window[native-mode]` host
2. After view mount, call `initPWA()` from `core/pwa/pwa-handling` (alias already in vite-base → subsystem routing/pwa)
3. If `?shared=1` or on load: drain share cache → write into OPFS via existing explorer ingest (`FileManager` / operative upload path)
4. Clear share cache after successful ingest

### HTML

- `index.html` and `demo.html`:
  - `<link rel="manifest" href="/pwa/manifest.json">`
  - `<meta name="theme-color" content="...">`
  - apple-touch-icon → `icons/icon.png` (or svg where supported)
- Favicon optional follow-up (404 is non-blocking)

### Vite (`vite.config.js` / `vite.view.config.js`)

- Add `vite-plugin-pwa` with:
  - `strategies: 'injectManifest'`
  - `srcDir: 'src/pwa'`, `filename: 'sw.ts'`
  - `injectRegister: false` (single owner: `initPWA`)
  - `devOptions.enabled: true` (HTTPS LAN install smoke)
  - `manifest: false` (use our static `manifest.json`, not generated)
- Dev middleware / `viteStaticCopy` (or equivalent) so `/pwa/manifest.json` and `/pwa/icons/*` resolve in serve + build
- Ensure `server.fs.allow` already covers workspace (already true)

### Build / scripts

- `npm run build` emits `dist/sw.js` (or plugin default) + copies `pwa/manifest.json` + icons
- Document: install requires HTTPS + trusted CA (`apps/CrossWord/private/https/local/rootCA.crt` already used for LAN)

## File change map (expected)

| Path | Action |
|---|---|
| `src/pwa/manifest.json` | Rewrite for Explorer |
| `src/pwa/sw.ts` | Replace with slim SW (backup old logic unused) |
| `src/pwa/lib/ShareTargetUtils.ts` | Keep parse/cache helpers; avoid AI entrypoints from SW |
| `demo/boot.ts` | `initPWA` + share drain → OPFS |
| `index.html`, `demo.html` | manifest + theme meta |
| `vite.config.js` / `vite.view.config.js` | VitePWA + static pwa assets |
| `package.json` | ensure `vite-plugin-pwa` / workbox deps (workspace root if already present) |

## Validation matrix

| Scenario | Expect |
|---|---|
| `npm run dev` on `:443` with multi TLS | No import errors; Installable criteria in Chromium (manifest + SW + HTTPS) |
| Open `https://192.168.0.200/` | App loads; console shows SW registered |
| Install PWA | Standalone / WCO chrome; native-mode window still works |
| Share file to Explorer (Android/Desktop where supported) | POST handled; file appears under OPFS `/user/` |
| Vite HMR edit | No SW cache poisoning of `/src` modules |
| `npm run build` | Completes; `sw.js` + `pwa/manifest.json` in outDir |

## Risks

- Existing CW `sw.ts` / AI share utils pull heavy aliases — slim SW must not import ExecutionCore / Settings AI paths
- `initPWA` may assume CrossWord SW URL layout — verify `sw-url.ts` candidates include explorer `BASE_URL` / `/sw.js`
- Dev `injectManifest` can be noisy — keep registration single-owner (`injectRegister: false`)
- Share Target OS support varies; File Handlers are Chromium-centric — document as best-effort

## Approval

- [x] Product: standalone Explorer  
- [x] Share Target + File Handlers  
- [x] Online-first (no aggressive precache)  
- [x] Approach A (slim SW)  
- [x] User review of this spec file (approved 2026-07-29)

Implementation plan: `docs/superpowers/plans/2026-07-29-cwsp-explorer-pwa.md`
