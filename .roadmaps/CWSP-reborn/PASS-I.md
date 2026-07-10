# CWSP-reborn Pass I Roadmap

- **Created:** 2026-07-10
- **Status:** prepared; P1 product work not started
- **Scope:** preliminary formation and pre-optimization
- **Product-code policy:** documentation and minimal structural scaffolding only
- **Progress pointer:** `.progress/CWSP-reborn/STATE.json`

## Goal

Turn the current CWSP-reborn scaffold into an auditable, interruption-safe
starting point for Android Capacitor and Windows/Linux WebNative work without
claiming unsupported readiness.

## Evidence gates

Readiness is recorded by evidence level:

1. **E0 — inventoried:** the path and responsibility are known.
2. **E1 — contracted:** entrypoint, data shape, ownership, and dependencies are documented.
3. **E2 — statically verified:** links resolve and focused type/build tests pass.
4. **E3 — locally integrated:** frontend and backend complete a local flow.
5. **E4 — device/route verified:** the flow passes on its target platform and direct/routed topology.

File presence alone is never higher than E0.

## Dependency order

```text
P0 governance and continuity
  -> P1 canonical paths and symlink integrity
  -> P2 build and entrypoint baseline
  -> P3 protocol and driver contracts
     -> P4 settings and view parity
     -> P5 platform packaging
  -> P6 direct/routed/reverse compatibility
  -> P7 release documentation and readiness decision
```

## P0 — Governance and continuity

**Current status:** complete

- **Owner:** `GOVERNANCE-CONTINUITY.md`
- **Progress:** audit, recovery manifest, resume state, plan, analysis, product
  docs, scoped rules, public-data scrub, and synchronized validation are complete.

**Exit:** a new agent can resume from `STATE.json` without rescanning the whole
workspace.

## P1 — Canonical paths and symlink integrity

- **Owner:** `GOVERNANCE-CONTINUITY.md`
- **Scope:** classify links, select canonical roots, and repair only the first
  build contour without mixing product behavior changes.

**Exit:** selected Android and desktop source paths resolve in one direction and
do not traverse a cycle.

## P2 — Build and entrypoint baseline

- **Owner:** `PLATFORM-PARITY.md`
- **Scope:** establish separate Android and desktop build graphs, canonical
  bootstraps, output categories, and focused empty-entrypoint/dependency checks.

**Exit:** each selected target reaches E2 independently; one target failing does
not hide the status of another.

## P3 — Protocol and drivers

- **Owner:** `PROTOCOL-DRIVERS.md`
- **Scope:** lock v2 fixtures, platform capability contracts, and stale,
  duplicate, clipboard-echo, and reconnect policies.

**Exit:** TypeScript, Java, and Node implementations can be tested against the
same transport-neutral fixtures.

## P4 — Views and settings parity

- **Owner:** `VIEWS.md`
- **Scope:** stabilize AirPad migration, test Network/Settings, specify
  Debug/Developer boundaries, and verify shell/profile/settings behavior.

**Exit:** Android and desktop use the same settings schema and explicit,
platform-appropriate view allowlists.

## P5 — Platform packaging

- **Owner:** `PLATFORM-PARITY.md`
- **Scope:** package Android, Windows, and Linux independently and report
  unsupported native capabilities explicitly.

**Exit:** every declared platform reaches at least E2; promoted targets reach E3.

## P6 — Network compatibility

- **Owners:** `PROTOCOL-DRIVERS.md` for contracts and
  `PLATFORM-PARITY.md` for platform/device evidence.
- **Scope:** direct, routed, and reverse paths; clipboard/DataAsset; AirPad
  input; TLS/WSS; and debug/log collection.

**Exit:** the compatibility matrix records E4 evidence for each promoted route;
untested cells remain unverified.

## P7 — Readiness decision

- **Owner:** `GOVERNANCE-CONTINUITY.md`
- **Scope:** reconcile artifacts, archive checkpoints, remove only migrated
  aliases, and publish the supported/unsupported matrix.

**Exit:** “ready” is used only for capabilities with current E4 evidence.

## Specialized roadmaps

- `PLATFORM-PARITY.md`
- `VIEWS.md`
- `PROTOCOL-DRIVERS.md`
- `GOVERNANCE-CONTINUITY.md`

## Deferred beyond Pass I

- New wire encryption or ecosystem-token cryptography.
- Fixed-size realtime packets, CBOR/JSOX/TOON negotiation, QUIC, and UDP.
- Product UI implementation for debug/developer views.
- Broad source-tree rewrites or deletion of legacy implementations.
