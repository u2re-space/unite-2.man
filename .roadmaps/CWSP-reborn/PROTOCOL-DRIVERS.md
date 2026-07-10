# CWSP-reborn Protocol and Drivers Roadmap

- **Parent:** `PASS-I.md`
- **Status:** planned
- **Current semantic source:** `.cursor/rules/network.mdc`

## Version boundary

### Current v2

- Native WebSocket `/ws` is the canonical realtime transport.
- Logical packets use `op`, `what`, `payload`, identity, routing, UUID, and timestamp.
- HTTP and Socket.IO are compatibility paths.
- Stable action families cover clipboard, input, network dispatch, and debug.
- DataAsset is the compact cross-context binary/file envelope.

### Future protocol research

The older v1 outline proposes fixed alignment, CRC16, encrypted payloads,
ecosystem-token derivation, alternate encodings, QUIC, and UDP. These are not
silently merged into v2. Each requires:

1. a threat/performance model;
2. an explicit version negotiation design;
3. TypeScript/Java/Node fixtures;
4. downgrade and compatibility behavior;
5. benchmark and failure evidence.

## Contract tasks

- [ ] Publish canonical JSON fixtures for ask, act, result, and error.
- [ ] Publish routed mouse, keyboard, clipboard text, and DataAsset fixtures.
- [ ] Lock identity aliases and destination resolution behavior.
- [ ] Lock stale/duplicate/replay policy by action class.
- [ ] Define request correlation and error codes.
- [ ] Define capability/readiness responses for optional drivers.
- [ ] Define extension namespace and unknown-extension behavior.

## Driver taxonomy

### Transport drivers

- Browser WebSocket client.
- Android native WebSocket bridge.
- Node/WebNative client and local control channel.
- Endpoint gateway/server.
- HTTP and Socket.IO compatibility adapters.

### Input drivers

- AirPad pointer/keyboard intent producer.
- Windows AutoHotkey executor.
- Linux Wayland/X11 executor selected by capability.
- Browser/native permission and readiness probes.

### Clipboard drivers

- Browser Clipboard API.
- Capacitor/native clipboard bridge.
- Node desktop clipboard adapter.
- Endpoint text clipboard adapter and optional DataAsset persistence.

### Configuration drivers

- Web storage/IDB.
- Android native preferences/config.
- WebNative portable config.
- Endpoint JSON/environment policy.

### Diagnostics drivers

- Frontend console and error capture.
- Android logcat export.
- Endpoint debug ring/file/SSE sink.
- Route and transport trace events.

## Implementation order

1. Fixtures and normalizers.
2. Transport-independent handlers.
3. Browser client adapter.
4. Endpoint adapter.
5. Android bridge.
6. WebNative desktop adapter.
7. Native executors.
8. Routed and device compatibility tests.

## Required tests

- Golden packet normalization and wire round trip.
- Endpoint URL versus direct URL versus destination ID invariants.
- Duplicate and stale realtime input rejection.
- Clipboard echo suppression and DataAsset hash deduplication.
- Reconnect queue bounds and no replay of stale relative movement.
- Unknown extension preservation or rejection according to negotiated policy.
- Driver readiness and unsupported-capability errors.

## Promotion rule

No Java or Node stub is treated as a driver until it has:

- a declared capability;
- a non-empty entrypoint;
- a fixture-compatible adapter;
- a focused test;
- platform evidence at the roadmap's required level.
