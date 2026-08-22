# CWSP Launcher Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Ship separate Android APK `space.u2re.cwsp.launcher` as selectable HOME launcher with AppMenu app drawer, SpeedDial drag-pin, and `launch-app` tiles (MVP L0–L3).

**Architecture:** Gradle product flavor `launcher` + manifest HOME overlay; `LauncherCoordinator` behind `CwsBridge` channels; Vite mode `capacitor-launcher` boots environment-shell to `home`; AppMenu + `launch-app` in fl.ui.

**Tech Stack:** Capacitor 8, Java 21, LauncherApps / RoleManager, TypeScript, fl.ui SpeedDial, `@capacitor/status-bar` (L5), existing PathRouter.

**Spec:** `docs/superpowers/specs/2026-08-19-cwsp-launcher-design.md`

## Global Constraints

- Locked: separate APK `space.u2re.cwsp.launcher`, HOME role, hub SKU unchanged, `CwsBridge` channels, views `home|explorer|settings|viewer` only on launcher.
- Canonical app tree: `apps/CWSP-reborn/` (may appear as `apps/CWSP-transfer/` symlink in workspace).
- Java sources: `apps/CWSP-reborn/src/backend/java/space/u2re/cwsp/`.
- fl.ui edits: `modules/projects/fl.ui/src/ui/` only (symlinks follow).
- Import hierarchy: fl.ui must not import apps; use `invokeCwsPlatformIPC` from subsystem bridge.
- Commits: only when the user explicitly asks (omit commit steps unless requested).
- Do not run full `build:capacitor` matrix unless verifying a touched phase; narrow ADB smoke per phase.

## File map

| File | Responsibility |
|---|---|
| `apps/CWSP-reborn/app/android/build.gradle` | `productFlavors` hub + launcher |
| `apps/CWSP-reborn/app/android/src/launcher/AndroidManifest.xml` | HOME intent-filter overlay |
| `apps/CWSP-reborn/app/android/src/launcher/res/values/strings.xml` | `app_name` = CWSP Launcher |
| `apps/CWSP-reborn/src/backend/java/space/u2re/cwsp/LauncherCoordinator.java` | LauncherApps, RoleManager, icon cache |
| `apps/CWSP-reborn/src/backend/java/space/u2re/cwsp/MainActivity.java` | HOME onNewIntent, back press |
| `apps/CWSP-reborn/src/backend/java/space/u2re/cwsp/CwsBridgePlugin.java` | Route `launcher:*` channels |
| `apps/CWSP-reborn/scripts/build-capacitor.mjs` | `--flavor launcher` + web mode |
| `apps/CWSP-reborn/package.json` | `build:capacitor:launcher` script |
| `apps/CWSP-reborn/vite.config.*` | mode `capacitor-launcher` defines |
| `modules/projects/subsystem/src/routing/native/cws-bridge.ts` | TS helpers `invokeLauncher*` |
| `modules/projects/subsystem/src/routing/native/launcher-bridge.ts` | Typed launcher IPC (new) |
| `modules/projects/fl.ui/src/ui/speed-dial/action-registry.ts` | `launch-app` handler |
| `modules/projects/fl.ui/src/ui/speed-dial/launcher-state.ts` | `SpeedDialItemMeta` android fields |
| `modules/projects/fl.ui/src/ui/navigation/app-menu/AppMenu.ts` | Drawer grid (new) |
| `modules/projects/fl.ui/src/ui/navigation/app-menu/AppMenu.scss` | Drawer styles (new) |
| `modules/shells/environment-shell/src/scss/app-menu.scss` | Extend placeholder |
| `modules/shells/environment-shell/src/boot/` or taskbar mount | Wire AppMenu + Start handler |
| `modules/projects/fl.ui/src/ui/explorer/backends/android-apps-backend.ts` | L4 |
| `modules/projects/fl.ui/src/ui/explorer/backends/android-storage-backend.ts` | L6 |
| `modules/projects/fl.ui/test/launcher-bridge.test.ts` | Mock IPC contracts |

---

## Phase L0 — SKU scaffold

### Task 1: Gradle product flavors

**Files:**
- Modify: `apps/CWSP-reborn/app/android/build.gradle`
- Create: `apps/CWSP-reborn/app/android/src/launcher/AndroidManifest.xml`
- Create: `apps/CWSP-reborn/app/android/src/launcher/res/values/strings.xml`

**Interfaces:**
- Produces: `BuildConfig.CWSP_LAUNCHER_SKU` boolean; flavor-specific `applicationId`.

- [ ] **Step 1: Add flavor dimension and flavors**

In `build.gradle` `android { }` block after `defaultConfig`:

```gradle
flavorDimensions += "sku"
productFlavors {
    hub {
        dimension "sku"
        applicationId "space.u2re.cwsp"
        resValue "string", "app_name", "CWSP"
        buildConfigField "boolean", "CWSP_LAUNCHER_SKU", "false"
    }
    launcher {
        dimension "sku"
        applicationId "space.u2re.cwsp.launcher"
        buildConfigField "boolean", "CWSP_LAUNCHER_SKU", "true"
    }
}
```

Remove hardcoded `applicationId` from `defaultConfig` (move to flavors).

- [ ] **Step 2: Launcher manifest overlay**

Create `app/android/src/launcher/AndroidManifest.xml`:

```xml
<?xml version="1.0" encoding="utf-8"?>
<manifest xmlns:android="http://schemas.android.com/apk/res/android">
    <application android:label="@string/app_name">
        <activity android:name="space.u2re.cwsp.MainActivity">
            <intent-filter>
                <action android:name="android.intent.action.MAIN" />
                <category android:name="android.intent.category.HOME" />
                <category android:name="android.intent.category.DEFAULT" />
            </intent-filter>
        </activity>
    </application>
</manifest>
```

Create `app/android/src/launcher/res/values/strings.xml`:

```xml
<resources>
    <string name="app_name">CWSP Launcher</string>
</resources>
```

- [ ] **Step 3: Verify assemble**

Run: `cd apps/CWSP-reborn/app/android && ./gradlew assembleLauncherDebug assembleHubDebug`  
Expected: two APK outputs with distinct applicationIds.

---

### Task 2: Vite mode + build script

**Files:**
- Modify: `apps/CWSP-reborn/vite.config.ts` (or project vite entry)
- Modify: `apps/CWSP-reborn/scripts/build-capacitor.mjs`
- Modify: `apps/CWSP-reborn/package.json`

**Interfaces:**
- Produces: `import.meta.env.RS_SHELL_ROLE === "launcher"` or `__RS_SHELL_ROLE__` global at build time.

- [ ] **Step 1: Add vite mode `capacitor-launcher`**

In vite `define` for mode `capacitor-launcher`:

```ts
__RS_SHELL_ROLE__: JSON.stringify("launcher"),
__RS_VIEW_HOME__: "true",
__RS_VIEW_EXPLORER__: "true",
__RS_VIEW_SETTINGS__: "true",
__RS_VIEW_VIEWER__: "true",
__RS_VIEW_NETWORK__: "false",
__RS_VIEW_AIRPAD__: "false",
```

Mirror existing `capacitor` mode boot paths; only defines differ.

- [ ] **Step 2: Extend build-capacitor.mjs**

Add CLI flag `--flavor launcher` (default `hub`):

- Web build: `vite build --mode capacitor-launcher` when flavor is launcher.
- Gradle: `assembleLauncherRelease` / `assembleLauncherDebug`.
- Output APK name: `cwsp-launcher-${version}.apk` under `build/capacitor/apk/`.

- [ ] **Step 3: package.json script**

```json
"build:capacitor:launcher": "node scripts/build-capacitor.mjs --flavor launcher"
```

- [ ] **Step 4: Boot marker in shell**

In environment-shell boot (single entry), when `__RS_SHELL_ROLE__ === "launcher"`:

```ts
document.documentElement.dataset.cwspShellRole = "launcher";
document.documentElement.dataset.cwspDefaultView = "home";
```

---

## Phase L1 — Default launcher onboarding

### Task 3: LauncherCoordinator + role channels

**Files:**
- Create: `apps/CWSP-reborn/src/backend/java/space/u2re/cwsp/LauncherCoordinator.java`
- Modify: `apps/CWSP-reborn/src/backend/java/space/u2re/cwsp/CwsBridgePlugin.java`

**Interfaces:**
- Produces:
  ```java
  public final class LauncherCoordinator {
      public JSONObject isDefaultHome(Context ctx);
      public void requestDefaultHome(Activity activity);
      // gated: if (!BuildConfig.CWSP_LAUNCHER_SKU) return not-available
  }
  ```
- Consumes: `BuildConfig.CWSP_LAUNCHER_SKU`

- [ ] **Step 1: Implement LauncherCoordinator.isDefaultHome / requestDefaultHome**

Use `RoleManager` (API 29+):

```java
RoleManager rm = ctx.getSystemService(RoleManager.class);
boolean held = rm != null && rm.isRoleAvailable(RoleManager.ROLE_HOME)
    && rm.isRoleHeld(RoleManager.ROLE_HOME);
```

`requestDefaultHome`: `startActivity(rm.createRequestRoleIntent(RoleManager.ROLE_HOME))`.

- [ ] **Step 2: Wire CwsBridgePlugin channels**

In `invoke` router:

```java
case "launcher:is-default":
    return launcherCoordinator.isDefaultHome(getContext());
case "launcher:request-default":
    launcherCoordinator.requestDefaultHome(getActivity());
    return ok();
```

If `!BuildConfig.CWSP_LAUNCHER_SKU`: `{ ok: false, reason: "wrong-sku" }`.

- [ ] **Step 3: TS wrapper**

Create `modules/projects/subsystem/src/routing/native/launcher-bridge.ts`:

```ts
export async function launcherIsDefault(): Promise<boolean> {
  const r = await invokeCwsPlatformIPC({ channel: "launcher:is-default" });
  return Boolean(r.ok && (r.echo as { isDefault?: boolean })?.isDefault);
}
export async function launcherRequestDefault(): Promise<boolean> {
  const r = await invokeCwsPlatformIPC({ channel: "launcher:request-default" });
  return r.ok === true;
}
```

---

### Task 4: Onboarding banner in AppMenu shell

**Files:**
- Create: `modules/projects/fl.ui/src/ui/navigation/app-menu/AppMenu.ts` (minimal shell first)
- Modify: environment-shell taskbar mount file

**Interfaces:**
- Consumes: `launcherIsDefault`, `launcherRequestDefault`

- [ ] **Step 1: AppMenu placeholder with banner**

Render `.env-shell-app-menu` with:

- If `dataset.cwspShellRole !== "launcher"` → hidden.
- If `!await launcherIsDefault()` → banner «Set CWSP Launcher as Home» + button calling `launcherRequestDefault()`.
- Else → empty grid host for Task 5.

- [ ] **Step 2: Mount in environment-shell**

When launcher SKU, TaskBar Start opens/toggles AppMenu instead of only `onHome()`.

---

## Phase L2 — App list + drawer

### Task 5: launcher:list / launch / icon

**Files:**
- Modify: `LauncherCoordinator.java`
- Modify: `CwsBridgePlugin.java`
- Modify: `launcher-bridge.ts`

**Interfaces:**
- Produces:
  ```ts
  export interface LauncherAppEntry {
    packageName: string;
    label: string;
    componentName: string;
    iconCacheKey: string;
  }
  export async function launcherList(query?: string): Promise<LauncherAppEntry[]>;
  export async function launcherLaunch(pkg: string, component?: string): Promise<boolean>;
  export async function launcherIcon(cacheKey: string, size?: number): Promise<string>; // data URL
  ```

- [ ] **Step 1: launcher:list in Java**

When `!isDefaultHome` → `{ ok: false, reason: "not-default" }`.

Else `LauncherApps.getActivityList(null, userHandle)` → dedupe by package, pick default launch activity, build JSON array.

- [ ] **Step 2: launcher:launch**

`launcherApps.startMainActivity(info, null, opts)` or explicit component `Intent`.

- [ ] **Step 3: launcher:icon**

Draw drawable → compress PNG → base64 **or** write to cache file and return `file:///android_asset/...` via Capacitor-safe URI (prefer base64 ≤64px for v1).

- [ ] **Step 4: AppMenu grid**

Populate searchable grid from `launcherList()`; tile tap calls `launcherLaunch()`.

---

### Task 6: MainActivity HOME lifecycle

**Files:**
- Modify: `apps/CWSP-reborn/src/backend/java/space/u2re/cwsp/MainActivity.java`

- [ ] **Step 1: onNewIntent for HOME**

When `Intent.ACTION_MAIN` + `CATEGORY_HOME`, notify WebView:

```java
bridge.triggerJSEvent("launcherHomePressed", "{}");
```

- [ ] **Step 2: TS listener**

On event: navigate to `home`, close AppMenu, focus SpeedDial.

- [ ] **Step 3: Back on home**

If WebView reports home visible, `OnBackPressedCallback` consumes event (do not `finish()`).

---

## Phase L3 — SpeedDial integration

### Task 7: launch-app action

**Files:**
- Modify: `modules/projects/fl.ui/src/ui/speed-dial/action-registry.ts`
- Modify: `modules/projects/fl.ui/src/ui/speed-dial/launcher-state.ts` (`SpeedDialItemMeta`)

**Interfaces:**
- Consumes: `launcherLaunch(pkg, component?)`

- [ ] **Step 1: Extend SpeedDialItemMeta**

```ts
packageName?: string;
componentName?: string;
iconCacheKey?: string;
entityType?: string; // "android-app"
```

- [ ] **Step 2: Register launch-app**

```ts
actionRegistry.set("launch-app", async (context, entityDesc) => {
  const meta = /* resolve meta */;
  const pkg = String(meta?.packageName || "").trim();
  if (!pkg) { showError("App missing"); return; }
  const ok = await launcherLaunch(pkg, meta?.componentName);
  if (!ok) showError("Unable to launch app");
});
iconsPerAction.set("launch-app", "device-mobile");
```

- [ ] **Step 3: SpeedDial action picker**

Add `{ value: "launch-app", label: "Launch app" }` to action list when `cwspShellRole === "launcher"`.

---

### Task 8: Drag AppMenu → SpeedDial

**Files:**
- Modify: `AppMenu.ts`
- Modify: `SpeedDial.ts` (only if drop handler needs new MIME type — prefer reusing JSON envelope)

- [ ] **Step 1: Drag payload**

On dragstart for app tile, set `text/plain` to JSON envelope from spec (include `packageName`, `componentName`, `iconCacheKey`).

- [ ] **Step 2: Drop**

Existing `parseSpeedDialItemFromJSON` path should create item; ensure `action: "launch-app"` and meta fields persist via `addSpeedDialItem` + OPFS flush.

- [ ] **Step 3: Pin via long-press**

Context action «Pin to desktop» calls same envelope builder at next free cell.

- [ ] **Step 4: Device smoke**

Install launcher APK on phone; set as HOME; pin app; reboot; tile still launches app.

---

## Phase L4–L7 (follow-up, separate PRs)

| Task | Summary | Key file |
|---|---|---|
| L4 | `AndroidAppsBackend` `/apps/` | `android-apps-backend.ts` + register on boot |
| L5 | `@capacitor/status-bar` + wallpaper settings | settings workspace + `shell:immersive` |
| L6 | `AndroidStorageBackend` + grant UI | `android-storage-backend.ts`, `fs:request-storage-grant` |
| L7 | `LauncherApps.Callback` → invalidate list | `LauncherCoordinator.registerCallback` |

Do not start L4 until L0–L3 smoke passes on device.

---

## Verification matrix (MVP)

| Check | Command / action |
|---|---|
| Distinct package | `adb shell pm list packages \| grep u2re.cwsp` shows both `.cwsp` and `.cwsp.launcher` |
| HOME role | Settings → Default home → CWSP Launcher |
| List apps | AppMenu shows installed apps after default set |
| Launch | Tap Telegram (or any app) opens it |
| Pin | Drag to SpeedDial; reboot; tile works |
| Hub unchanged | Hub APK still installs; no HOME in hub manifest |

---

## Plan self-review

- Spec coverage: L0–L7 mapped; out-of-scope items explicitly deferred.
- No TBD placeholders in task steps.
- Type names consistent: `LauncherAppEntry`, `launch-app`, `launcher:launch`, `CWSP_LAUNCHER_SKU`.
- MVP boundary: Tasks 1–8 = L0–L3; L4–L7 table only.
