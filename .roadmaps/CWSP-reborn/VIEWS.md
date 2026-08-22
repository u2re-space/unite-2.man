# CWSP-reborn Views Roadmap

- **Parent:** `PASS-I.md`
- **Status:** planned
- **Canonical packages:** `modules/views/*-view`

## Inventory

### AirPad

Evidence:

- Public custom-element and mount entrypoints exist.
- Gesture, clipboard, configuration, motion, and regression modules exist.
- Current `input` and `network` projections target incomplete CWSP-reborn trees.
- Functional legacy implementations remain under `input-old` and `network-old`.

Roadmap:

1. Freeze the public AirPad intent/session API.
2. Add compatibility facades before changing import targets.
3. Validate lifecycle reset, queue bounds, route target, clipboard, and reconnect.
4. Keep phone-first layout and gate orientation APIs on supported surfaces.
5. Remove old trees only after all imports and regression tests move.

### Network

Evidence:

- Status, probe, reconnect, configuration, native runtime, and log-export UI exists.
- No dedicated package regression suite was found.
- Current layout is primarily single-column.

Roadmap:

1. Separate transport status from platform capability status.
2. Add focused probe and state-rendering tests.
3. Add a wide layout only after a mobile baseline screenshot/spec is recorded.
4. Add accessible live status and log semantics.
5. Integrate debug-view through a stable debug channel, not direct internals.

### Settings

Evidence:

- Tabbed host, contributions, shell profiles, and sync-arm registry exist.
- Capacitor, WebNative, CRX, and web surfaces are represented by the adapter.
- End-to-end backend registration is not proven for all shells.

Roadmap:

1. Define one settings schema and ownership map.
2. Test contribution registration and pruning by shell profile.
3. Test `settings:get` and `settings:patch` for each surface.
4. Keep mobile and desktop presentation separate from persisted values.
5. Expose backend errors and pending/retry state in the UI.

### Debug

Evidence:

- Package and Vite scaffold exist.
- Source entrypoint is empty and the default view registry does not register it.

Roadmap:

1. Specify debug-log backlog, streaming, filters, correlation, and export.
2. Define `debug:log`, `debug:tail`, `debug:subscribe`, and readiness bindings.
3. Implement read-only diagnostics first.
4. Add bounded rendering and sensitive-data redaction.
5. Register only after focused build and channel tests pass.

### Developer

Evidence:

- Source entrypoint is empty.
- Package and Vite metadata still identify it as debug-view.
- Current CWSP-reborn projection resolves to the debug scaffold.

Roadmap:

1. Decide the boundary: developer tools inspect and inject; debug tools observe.
2. Correct package identity and projection only after the specification is accepted.
3. Gate packet injection and control actions behind explicit development policy.
4. Keep production builds free of developer-only actions by default.

## Shared shell and responsive model

### Mobile

- Minimal shell.
- Network, AirPad, and Settings.
- Bottom or compact navigation with touch targets of at least 44 CSS pixels.
- AirPad owns the primary gesture surface.

### Desktop / wide screen

- Minimal shell remains the baseline.
- Network and Settings may use a two-pane composition.
- Debug may become a docked secondary panel.
- AirPad is not included in WebNative parity unless a later requirement adds a
  local control mode.

## Cross-view gates

- One view registry and one enablement policy.
- No package exports pointing to an empty implementation.
- No view imports through a broken or cyclic symlink.
- Shared theme tokens with `prefers-reduced-motion` support.
- Keyboard focus, landmarks, live regions, and error recovery documented.
- Each view has a focused smoke test before platform packaging.
