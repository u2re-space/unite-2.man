# CWSP-explorer Slim PWA Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Make standalone `CWSP-explorer` installable as an online-first PWA with Share Target / File Handlers draining into OPFS `/user/`.

**Architecture:** Slim `src/pwa/sw.ts` (network-only + share staging) + Explorer `manifest.json` + `VitePWA` injectManifest (`injectRegister: false`) + `initPWA` from boot. No CrossWord AI/viewer SW.

**Tech Stack:** Vite 8, vite-plugin-pwa, Cache Storage, OPFS FileManager, subsystem `initPWA` / `ensureServiceWorkerRegistered`.

## Global Constraints

- Standalone Explorer identity (not CrossWord branding)
- Online-first: no aggressive precache
- Share Target + File Handlers required
- Do not import ExecutionCore / Settings AI into SW
- HTTPS LAN multi cert already wired
- No commits unless user asks

---

### Task 1: Explorer manifest + HTML head

**Files:**
- Modify: `modules/views/explorer-view/src/pwa/manifest.json`
- Modify: `modules/views/explorer-view/index.html`
- Modify: `modules/views/explorer-view/demo.html`

- [ ] Rewrite manifest (CWSP Explorer, `/`, share_target, file_handlers, WCO)
- [ ] Add `<link rel="manifest">`, theme-color, apple-touch-icon

### Task 2: Slim share-stage helper + SW

**Files:**
- Create: `modules/views/explorer-view/src/pwa/lib/share-stage.ts`
- Create: `modules/views/explorer-view/src/pwa/sw.legacy-crossword.ts` (mv old)
- Create/Replace: `modules/views/explorer-view/src/pwa/sw.ts`

- [ ] Worker-safe parse/cache/drain helpers (no AI imports)
- [ ] Slim SW: skipWaiting, network-only, POST `/share-target`

### Task 3: VitePWA + static `/pwa/*` + aliases

**Files:**
- Modify: `modules/views/explorer-view/vite.view.config.js`
- Modify: `modules/views/explorer-view/vite.config.js`
- Modify: `modules/views/view-resolve-aliases.js`
- Modify: `modules/views/explorer-view/package.json` (optional dep note)

- [ ] VitePWA injectManifest, devOptions.enabled, manifest:false
- [ ] Dev middleware + static copy for `/pwa/manifest.json` + icons
- [ ] Alias `core/pwa/pwa-handling`

### Task 4: Client boot — initPWA + OPFS drain

**Files:**
- Create: `modules/views/explorer-view/src/pwa/client-share-drain.ts`
- Modify: `modules/views/explorer-view/demo/boot.ts`

- [ ] Register SW via `initPWA`
- [ ] Drain share cache → `ingestFileIntoWorkspace` → `/user/`

### Task 5: Verify

- [ ] `npm run dev` — `/pwa/manifest.json` 200, SW registers, no blank page
- [ ] `npm run build` — emits sw + pwa assets (SPA or plugin out)

---

**Spec:** `docs/superpowers/specs/2026-07-29-cwsp-explorer-pwa-design.md`
