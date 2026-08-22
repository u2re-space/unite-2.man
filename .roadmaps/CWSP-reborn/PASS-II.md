# CWSP-reborn Pass II Execution Ledger

- **Started:** 2026-07-10T14:16:43+07:00
- **Updated:** 2026-07-10T17:15:00+07:00
- **Status:** in progress
- **Baseline archive:** `.archives/CWSP-reborn/pass-II-2026-07-10/manifest.json`
- **Models:** Grok 4.5 Highest + GLM-5.2 Highest (GPT-5.6-Sol excluded)
- **Rule:** independent agents own disjoint files; shared boundaries merge in dependency order

## Wave 0 — Continuity

- [x] Record repository commits and archive Pass-I originals.
- [x] Archive aliases: typo paths `.acrhive` / `.acrhives` retired; canonical `.archives` only (Pass III).
- [x] Open Pass-II progress state and recovery manifest.

## Wave 1 — P1/P2 source and build baseline

Owner: `apps/CWSP-reborn`

- [x] Add a failing topology test.
- [x] Repair selected WebNative links without touching compatibility-only CRX.
- [x] Add target-aware Vite/TypeScript configuration.
- [x] Add minimal Capacitor and WebNative frontend entrypoints.
- [x] Produce independent static bundles and focused type evidence.
- [x] Emit installable `index.html` shells via platform-rooted Vite builds.

## Wave 2 — P3 protocol and endpoint

Owners:

- `modules/projects/cwsp-shared` — packet semantics and fixtures.
- `runtime/legacy/endpoint` — physical endpoint adapter/runtime.
- `apps/CWSP-reborn/src/protocol` — thin platform facades.

- [x] Restore one shared v2 contract package with failing tests first.
- [x] Add canonical fixtures and policy tests.
- [x] Create canonical `runtime/cwsp/endpoint` path (symlink + adapters).
- [x] Fill thin `apps/CWSP-reborn/src/protocol` web/node facades (+ focused test).
- [x] Bind the legacy endpoint runtime handlers to shared semantics (soft-bind `normalizeFrame` + `ingress-normalize`).
- [x] Pass local normalization/routing tests against a live `/ws` loopback harness (`check:ws-loopback` 4/4).

## Wave 3 — P4 views and settings

Owners:

- `modules/views/airpad-view`
- `modules/views/settings-view`
- root-owned Network/Debug/Developer view packages

- [x] Replace broken AirPad migration links with compatibility facades.
- [x] Add settings sync/contribution tests.
- [x] Add Network capability/a11y tests and behavior (22/22 contracts).
- [x] Implement gated Debug and Developer minimum surfaces with tests (still unregistered in shells).
- [x] Split `developer-view` from symlink-to-`debug-view` into a real package.

## Wave 4 — P5 platform contours

### Android

- [x] Add a reproducible Capacitor/Gradle graph (scaffold; `./gradlew tasks` OK with JDK 17).
- [x] Implement the minimum native settings/clipboard/coordinator bridge (`check-java-android-pure` OK; typed Packet wiring optional).
- [ ] Assemble an APK or record a concrete toolchain blocker (Capacitor Android dep + assets copy still blocking APK).

### Desktop

- [x] Add shared Node settings/backend contract.
- [x] Wire Windows/Linux WebNative json + settings projections + focused tests.
- [ ] Run a packaged WebNative shell against `build/webnative` on a desk host.
- [x] Land Java alternative backend beside Node (`src/backend/java/shared`) — `check:java-backend` 3/3.
- [x] Land shared Java CWSP v2 protocol (`src/protocol/java`) — `check:java-protocol` 24/24.
- [x] Wire Android Java settings/clipboard/coordinator to platform APIs (`check-java-android-pure` OK).

## Wave 5 — P6 local integration

- [x] Direct loopback `/ws` packet flow (harness + optional `ws` echo).
- [x] Routed loopback destination preservation (`cwsp_route_target` / destinations).
- [x] Settings get/patch persistence (`check:settings-backend` 3/3).
- [x] Clipboard text/DataAsset contract (Node executor + web/PWA emission; `check:clipboard-backend` + `check:web-backend`).
- [ ] Driver readiness and debug relay.

Remote/device E4 work runs only if local E2/E3 evidence is green and target
access is available.

## Wave 6 — Closure

- [ ] Update product docs from implementation evidence.
- [ ] Update progress, memory, compatibility matrix, and archive references.
- [ ] Run per-repository tests, builds, lint/type checks, and final reviews.
- [ ] Leave unsupported scenarios explicitly unverified.
