# CWSP-reborn Platform Parity Roadmap

- **Parent:** `PASS-I.md`
- **Status:** planned
- **Rule:** parity means shared contracts with explicit platform capabilities,
  not identical native implementations.

## Current evidence

### Shared frontend

- The intended common views are `minimal`, `network`, `settings`, and, on
  supported mobile surfaces, `airpad`.
- Real view code resolves from `modules/views/*-view`; CWSP-reborn currently
  reaches it through `src/frontend/submodules/views` → `modules/shared/views` →
  `apps/CrossWord/src/frontend/views` → per-view compatibility links.
- CWSP-reborn platform Vite and TypeScript files are placeholders, so no target
  is currently build-verified from this package.
- `dist` currently aliases `build`; the output-category contract is not yet implemented.

### Android Capacitor

- Intended frontend: `app/android` projected from the Capacitor tree.
- Intended backend: Java/native bridge and preferences/config.
- Missing gate evidence: non-empty build files, canonical Capacitor config,
  package dependencies, APK assembly, bridge round trip, ADB validation.

### Windows WebNative

- Intended frontend: shared web views inside a WebView2 shell.
- Intended backend: Node.js service with optional native/Java IPC.
- Missing gate evidence: resolved WebNative links, non-empty bootstrap,
  package dependency, portable settings persistence, executable packaging.

### Linux WebNative

- Intended frontend/backend split matches Windows.
- Additional driver choice is required for Wayland/X11 input and clipboard.
- The current Linux WebNative projection participates in a broken/cyclic link
  chain and cannot be treated as a build entrypoint.

## Shared contract first

The following artifacts must be platform-neutral:

- CWSP v2 logical envelope and stable action names.
- Endpoint URL, direct URL, AirPad target, and destination ID semantics.
- Settings schema and contribution identifiers.
- Driver capability and readiness responses.
- Debug event shape and correlation identifiers.
- DataAsset envelope for text, images, and files.

## Android work sequence

1. Establish one Capacitor config and one web entrypoint.
2. Declare Java bridge channels for coordinator, clipboard, settings,
   permissions, and diagnostics.
3. Build the minimal/network/settings/airpad frontend bundle.
4. Assemble an APK without remote deployment.
5. Validate settings and clipboard locally.
6. Validate direct then gateway-routed AirPad.
7. Record logcat and debug-relay evidence.

## Windows work sequence

1. Establish one WebNative shared bootstrap and Node backend entrypoint.
2. Define portable config ownership and atomic persistence.
3. Build minimal/network/settings without AirPad.
4. Package a portable executable.
5. Validate backend lifecycle independent of the UI process.
6. Validate WS, clipboard, settings, and debug relay.
7. Validate target-host deployment only after local E3.

## Linux work sequence

1. Correct the WebNative source projection without alias loops.
2. Share the Node/settings contract with Windows.
3. Add capability selection for Wayland/X11 and supported clipboard/input drivers.
4. Build and run without native input privileges.
5. Enable each native driver through an explicit capability check.
6. Record package, service, and route evidence.

## Parity acceptance matrix

| Capability | Android | Windows | Linux |
|---|---:|---:|---:|
| minimal/network/settings views | target E4 | target E4 | target E4 |
| AirPad view | target E4 | intentionally absent | intentionally absent |
| canonical `/ws` envelope | target E4 | target E4 | target E4 |
| settings backend round trip | target E4 | target E4 | target E4 |
| clipboard text | target E4 | target E4 | target E4 |
| clipboard DataAsset | target E3 | target E3 | target E3 |
| native pointer/keyboard executor | client emitter | target E4 | capability-dependent |
| background/service lifecycle | target E4 | target E3 | target E3 |
| debug/log export | target E4 | target E3 | target E3 |

Targets are goals, not current status. Current CWSP-reborn package evidence is E0
for platform scaffolding and E1 for selected shared contracts.

## Promotion rule

A platform is promoted only when:

- its canonical source paths resolve;
- its package/build inputs are non-placeholder;
- focused build and settings tests pass;
- unsupported native capabilities are reported;
- the matching rows in the compatibility matrix contain dated evidence.
