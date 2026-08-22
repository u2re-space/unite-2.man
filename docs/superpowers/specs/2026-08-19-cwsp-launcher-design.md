# CWSP Launcher (Android HOME SKU) Design

Date: 2026-08-19  
Status: approved

## Goal

Ship a **separate Android APK** (`space.u2re.cwsp.launcher`) that can be chosen as the system **default HOME launcher**. The launcher presents the existing environment-shell **SpeedDial** desktop, an **AppMenu drawer** with all installed apps, drag-to-desktop shortcuts, optional **Explorer** roots (`/apps/`, `/storage/`), immersive transparent **status bar** via Capacitor (not PWA display-mode), and configurable **wallpaper** (launcher layer vs Android native).

The existing **CWSP hub** APK (`space.u2re.cwsp`) remains unchanged — AirPad, clipboard, network hub; no HOME intent-filter.

## Decisions (locked)

| Topic | Choice |
|---|---|
| Launcher role | Full system HOME launcher (user-selectable default) |
| Distribution SKU | **Separate APK** / Gradle product flavor `launcher` |
| Hub SKU | Gradle flavor `hub` (default), no HOME filter |
| `applicationId` hub | `space.u2re.cwsp` |
| `applicationId` launcher | `space.u2re.cwsp.launcher` |
| Native IPC | Extend existing `CwsBridgePlugin.invoke` channels |
| App list API | [LauncherApps](https://developer.android.com/reference/android/content/pm/LauncherApps) when default HOME |
| Default role request | [RoleManager.ROLE_HOME](https://developer.android.com/reference/android/app/role/RoleManager) |
| SpeedDial persistence | Existing OPFS/LS LinkStore (launcher SKU origin is separate) |
| New tile action | `launch-app` with `meta.packageName` + optional `componentName` |
| App drawer host | `.env-shell-app-menu` slide-over from TaskBar Start |
| Explorer `/apps/` | Read-only FsBackend over native app list |
| Explorer `/storage/` | Native `java.io.File` under `/storage/emulated/0/` when [MANAGE_EXTERNAL_STORAGE](https://developer.android.com/training/data-storage/manage-all-files) granted |
| Status bar | `@capacitor/status-bar` overlay + `ui-statusbar` safe-area (not WCO/PWA) |
| Views in launcher SKU | `home`, `explorer`, `settings`, `viewer` — **not** `network`, `airpad` |
| Vite mode | `capacitor-launcher` |
| Build script | `npm run build:capacitor:launcher` |
| APK publish path | `build/capacitor/apk/cwsp-launcher-*.apk` via gateway `/releases/android` |

## Problem

- CWSP Android today is a hub app (clipboard, files, AirPad) — not a replacement home screen.
- fl.ui already has SpeedDial grid, drag-drop, action registry, PathRouter — but no Android app enumeration or `launch-app`.
- `.env-shell-app-menu` SCSS slot exists as placeholder only.
- `MANAGE_EXTERNAL_STORAGE` and SAF infrastructure exist in hub Java; Explorer has no `/apps/` or device storage root for launcher use case.
- Immersive wallpaper launcher needs Capacitor status-bar control, not browser display-mode.

## Architecture

```
┌─────────────────────────────────────────────────────────────┐
│  CWSP Launcher APK (Capacitor WebView + environment-shell)   │
├─────────────────────────────────────────────────────────────┤
│  AppMenu drawer ──drag──► SpeedDial (launch-app tiles)       │
│  TaskBar / ui-statusbar (immersive, safe-area)               │
│  Explorer ◄── PathRouter ◄── /apps/ /storage/ /user/ …     │
└───────────────────────────┬─────────────────────────────────┘
                            │ invokeCwsPlatformIPC
                            ▼
┌─────────────────────────────────────────────────────────────┐
│  CwsBridgePlugin (+ LauncherCoordinator when CWSP_LAUNCHER)  │
│  launcher:*  shell:*  fs:list-native                         │
│  LauncherApps · RoleManager · WallpaperManager · File        │
└─────────────────────────────────────────────────────────────┘
```

### Components

| Unit | Responsibility | Depends on |
|---|---|---|
| Gradle flavor `launcher` | Separate `applicationId`, HOME manifest overlay, `BuildConfig.CWSP_LAUNCHER_SKU` | `app/android/build.gradle` |
| `LauncherCoordinator.java` | LauncherApps list/launch/icon cache; RoleManager; wallpaper; native FS list | Android SDK |
| `CwsBridgePlugin` | Route `launcher:*`, `shell:*`, `fs:list-native` channels | `LauncherCoordinator` |
| `MainActivity` | HOME `onNewIntent`, back-on-home noop, immersive window flags | Capacitor |
| Vite `capacitor-launcher` | View flags, `__RS_SHELL_ROLE__=launcher` | vite config |
| `registerAndroidLauncherBackends()` | Register `/apps/`, `/storage/` FsBackends | `path-router`, `cws-bridge` |
| AppMenu UI | Full app grid, search, drag payload, default-launcher onboarding | fl.ui / environment-shell |
| `launch-app` action | IPC → `launcher:launch` | `action-registry` |
| Settings contributions | Wallpaper source, status bar overlay, «Set as Home» | settings workspace tab |

Canonical code homes:

- Java: `apps/CWSP-reborn/src/backend/java/space/u2re/cwsp/` (+ `emission/` helpers if needed)
- Gradle/manifest: `apps/CWSP-reborn/app/android/`
- TS bridge wrappers: `modules/projects/subsystem/src/routing/native/cws-bridge.ts` (+ symlinks)
- fl.ui: `modules/projects/fl.ui/src/ui/speed-dial/`, `explorer/`, `navigation/`
- Shell wiring: `modules/shells/environment-shell/`
- Build: `apps/CWSP-reborn/scripts/build-capacitor.mjs`, `package.json`

## Gradle / manifest

### Product flavors

```gradle
flavorDimensions += "sku"
productFlavors {
    hub {
        dimension "sku"
        applicationId "space.u2re.cwsp"
        buildConfigField "boolean", "CWSP_LAUNCHER_SKU", "false"
    }
    launcher {
        dimension "sku"
        applicationId "space.u2re.cwsp.launcher"
        buildConfigField "boolean", "CWSP_LAUNCHER_SKU", "true"
    }
}
```

### Launcher manifest overlay (`app/android/src/launcher/AndroidManifest.xml`)

Add to `MainActivity` only:

```xml
<intent-filter>
    <action android:name="android.intent.action.MAIN" />
    <category android:name="android.intent.category.HOME" />
    <category android:name="android.intent.category.DEFAULT" />
</intent-filter>
```

Keep existing `MAIN + LAUNCHER` filter. **Do not** add HOME to `ShareActivity` or prompt activities.

### MainActivity behavior

- `launchMode="singleTask"` (already set).
- `onNewIntent`: when `ACTION_MAIN` + `CATEGORY_HOME`, bring WebView to SpeedDial (`home` view) without full reload.
- `OnBackPressed`: on home desktop → close AppMenu if open; else consume (do not finish).
- On launcher SKU boot: apply edge-to-edge window flags.

## Native IPC channels

All channels use existing `CwsBridge.invoke({ channel, payload })` envelope. When `!BuildConfig.CWSP_LAUNCHER_SKU`, return `{ ok: false, reason: "wrong-sku" }`.

| Channel | Input | Output |
|---|---|---|
| `launcher:is-default` | — | `{ ok, isDefault: boolean }` |
| `launcher:request-default` | — | `{ ok }` (starts RoleManager intent) |
| `launcher:list` | `{ query?: string }` | `{ ok, apps: LauncherAppEntry[] }` |
| `launcher:launch` | `{ packageName, componentName? }` | `{ ok }` |
| `launcher:icon` | `{ packageName, size?: number }` | `{ ok, cacheKey, mime, base64? \| fileUri? }` |
| `launcher:subscribe` | `{ enable: boolean }` | `{ ok }` + events `launcher:changed` |
| `shell:immersive` | `{ overlay: boolean, lightIcons?: boolean }` | `{ ok }` |
| `shell:wallpaper-get` | — | `{ ok, hasWallpaper, width?, height? }` |
| `shell:wallpaper-set` | `{ base64 \| fileUri }` | `{ ok }` |
| `fs:list-native` | `{ path }` | `{ ok, entries: FsEntry[] }` |
| `fs:storage-grant-status` | — | `{ ok, isManager: boolean }` |
| `fs:request-storage-grant` | — | `{ ok }` (ACTION_MANAGE_ALL_FILES_ACCESS_PERMISSION) |

### LauncherAppEntry (JSON)

```ts
interface LauncherAppEntry {
  packageName: string;
  label: string;
  componentName: string; // flattened short component for launch
  iconCacheKey: string;    // stable key for lazy icon fetch
}
```

Icons are **not** inlined in `launcher:list`. WebView calls `launcher:icon` per visible tile; cache PNG under app cache; TS may mirror hash filename in OPFS optional v2.

### LauncherApps constraints

- `launcher:list` requires app to hold `ROLE_HOME`. If not default, return `{ ok: false, reason: "not-default" }`.
- Register `LauncherApps.Callback` on subscribe; emit `launcher:changed` via Capacitor plugin listener → `cws-native-message` or dedicated event.

## TypeScript

### Boot detection

```ts
document.documentElement.dataset.cwspShellRole = "launcher"; // vite define
const isLauncherSku = () =>
  document.documentElement.dataset.cwspShellRole === "launcher"
  || (globalThis as any).__RS_SHELL_ROLE__ === "launcher";
```

On Capacitor Android launcher SKU boot:

1. `initCwsNativeBridge()`
2. `registerAndroidLauncherBackends()` if native
3. `applyLauncherChrome()` — status bar overlay, dataset on `.env-shell-chrome`
4. Default navigate to `home` view

### Action `launch-app`

Registered in `action-registry.ts`:

```ts
meta: {
  packageName: string;
  componentName?: string;
  entityType: "android-app";
}
```

Handler: `invokeCwsPlatformIPC({ channel: "launcher:launch", payload: { packageName, componentName } })`.

### Drag envelope (AppMenu → SpeedDial)

Same JSON shortcut envelope as Explorer drags:

```json
{
  "state": { "icon": "android-app", "label": "Telegram" },
  "desc": {
    "action": "launch-app",
    "meta": {
      "packageName": "org.telegram.messenger",
      "componentName": "org.telegram.messenger/.DefaultIcon",
      "entityType": "android-app",
      "iconCacheKey": "org.telegram.messenger"
    }
  }
}
```

Icon layer resolves `iconCacheKey` via `launcher:icon` → data URL for tile render.

### Explorer virtual roots (launcher SKU only)

| Path | Backend | Writable |
|---|---|---|
| `/apps/` | `AndroidAppsBackend` | false |
| `/apps/<pkg>/` | single launchable entry | false |
| `/storage/` | `AndroidStorageBackend` | false (v1 read-only list + open) |
| `/user/`, `/assets/` | existing defaults | per existing |

`/storage/` hidden from root listing until `fs:storage-grant-status.isManager === true`; Settings shows grant button.

### Settings (Workspace)

New fields on launcher SKU only:

| Key | Type | Default |
|---|---|---|
| `shell.wallpaperSource` | `"launcher" \| "android-native" \| "none"` | `"launcher"` |
| `shell.statusBarOverlay` | boolean | `true` |
| `shell.useNativeWallpaper` | boolean | `false` |

UI: «Set as default launcher» button → `launcher:request-default`.

## UI: AppMenu drawer

- Host: `.env-shell-app-menu` in environment-shell layout (beside taskbar region).
- Open: TaskBar Start tap (launcher SKU); long-press may remain process switcher on non-launcher.
- Content: searchable grid of `LauncherAppEntry` tiles (reuse SpeedDial icon/label cell CSS, no grid persistence).
- Interactions:
  - Tap → `launch-app`
  - Long-press → «Pin to desktop» (`addSpeedDialItem`)
  - Drag → desktop grid (existing SpeedDial drop handlers)
- Banner when `!isDefault`: explain + CTA to request HOME role.

## Immersive chrome

1. Native: `WindowCompat.setDecorFitsSystemWindows(window, false)`.
2. Capacitor `@capacitor/status-bar`: `setOverlaysWebView({ overlay: true })`, `setBackgroundColor({ color: '#00000000' })`.
3. CSS: `.env-shell-chrome[data-shell-role="launcher"]` → `padding-top: env(safe-area-inset-top)`; `ui-statusbar` transparent background.
4. Wallpaper: existing `wallpaperState` layer behind chrome; when `wallpaperSource === "none"`, solid theme background.

## Phases

| Phase | Deliverable | Verification |
|---|---|---|
| **L0** | Gradle flavor + Vite mode + build script + HOME overlay | Install launcher APK; distinct package from hub |
| **L1** | `launcher:is-default`, `launcher:request-default`, onboarding UI | Role picker; `cmd role get-role-holders android.app.role.HOME` |
| **L2** | `launcher:list/launch/icon`, AppMenu drawer | Launch external app from drawer |
| **L3** | `launch-app` action, drag → SpeedDial persist | Tile survives reboot |
| **L4** | Explorer `/apps/` backend | Apps visible in Explorer root |
| **L5** | Immersive statusbar + wallpaper settings | Transparent bar over wallpaper |
| **L6** | `/storage/` + MANAGE_EXTERNAL onboarding | List `Download/` on granted device |
| **L7** | `LauncherApps.Callback` invalidation | Install/uninstall refreshes drawer |

**MVP:** L0–L3. **Polish:** L4–L7.

## Coexistence

Both APKs may install on one device (e.g. L-196):

- **CWSP hub** — background bridge, clipboard, files transfer.
- **CWSP Launcher** — default HOME, SpeedDial desktop.

Separate origins / storage — speed-dial grids do not sync between SKUs (expected).

## Risks

| Risk | Mitigation |
|---|---|
| Play Protect / Play policy for HOME + MANAGE_EXTERNAL | Fleet sideload first; Play submission separate |
| Large icon payloads | Lazy `launcher:icon` + disk cache |
| WebView reload on HOME | `singleTask` + `onNewIntent` route to home view |
| Hub regression | `CWSP_LAUNCHER_SKU` gates all launcher Java paths |
| fl.ui import hierarchy | Native wrappers in subsystem; fl.ui calls bridge only |

## Out of scope (v1)

- Widgets / shortcuts pinning (Android App Shortcuts API)
- Recents / overview UI (system handles)
- Play Store listing copy / policy submission
- Sync speed-dial between hub and launcher APK
- Writable `/storage/` (delete/rename) — read + open only in v1

## References

- [LauncherApps](https://developer.android.com/reference/android/content/pm/LauncherApps)
- [Manage all files](https://developer.android.com/training/data-storage/manage-all-files)
- [java.io.File](https://developer.android.com/reference/java/io/File)
- Existing: `CwsBridgePlugin.java`, `launcher-state.ts`, `path-router.ts`, `action-registry.ts`
