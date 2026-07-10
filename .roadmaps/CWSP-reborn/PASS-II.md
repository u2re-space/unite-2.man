# CWSP-reborn Pass II Execution Ledger

- **Started:** 2026-07-10T14:16:43+07:00
- **Status:** in progress
- **Baseline archive:** `.archives/CWSP-reborn/pass-II-2026-07-10/manifest.json`
- **Rule:** independent agents own disjoint files; shared boundaries merge in dependency order

## Wave 0 — Continuity

- [x] Record repository commits and archive Pass-I originals.
- [x] Provide `.acrhive` and `.acrhives` compatibility aliases.
- [ ] Open Pass-II progress state and recovery manifest.

## Wave 1 — P1/P2 source and build baseline

Owner: `apps/CWSP-reborn`

- [ ] Add a failing topology test.
- [ ] Repair selected WebNative links without touching compatibility-only CRX.
- [ ] Add target-aware Vite/TypeScript configuration.
- [ ] Add minimal Capacitor and WebNative frontend entrypoints.
- [ ] Produce independent static bundles and focused type evidence.

## Wave 2 — P3 protocol and endpoint

Owners:

- `modules/projects/cwsp-shared` — packet semantics and fixtures.
- `runtime/legacy/endpoint` — physical endpoint adapter/runtime.
- `apps/CWSP-reborn/src/protocol` — thin platform facades.

- [ ] Restore one shared v2 contract package with failing tests first.
- [ ] Add canonical fixtures and policy tests.
- [ ] Bind the endpoint to shared semantics without duplicating builders.
- [ ] Pass local normalization/routing/readiness tests.

## Wave 3 — P4 views and settings

Owners:

- `modules/views/airpad-view`
- `modules/views/settings-view`
- root-owned Network/Debug/Developer view packages

- [ ] Replace broken AirPad migration links with compatibility facades.
- [ ] Add settings sync/contribution tests.
- [ ] Add Network capability/a11y tests and behavior.
- [ ] Implement gated Debug and Developer minimum surfaces with tests.

## Wave 4 — P5 platform contours

### Android

- [ ] Add a reproducible Capacitor/Gradle graph.
- [ ] Implement the minimum native settings/clipboard/coordinator bridge.
- [ ] Assemble an APK or record a concrete toolchain blocker.

### Desktop

- [ ] Add shared Node settings/backend contract.
- [ ] Run Windows-oriented WebNative frontend/backend locally.
- [ ] Apply the same backend contract to Linux with explicit driver capability.

## Wave 5 — P6 local integration

- [ ] Direct loopback `/ws` packet flow.
- [ ] Routed loopback destination preservation.
- [ ] Settings get/patch persistence.
- [ ] Clipboard text/DataAsset contract.
- [ ] Driver readiness and debug relay.

Remote/device E4 work runs only if local E2/E3 evidence is green and target
access is available.

## Wave 6 — Closure

- [ ] Update product docs from implementation evidence.
- [ ] Update progress, memory, compatibility matrix, and archive references.
- [ ] Run per-repository tests, builds, lint/type checks, and final reviews.
- [ ] Leave unsupported scenarios explicitly unverified.
