/*
 * Spec: CWSP-shell taskbar (Win10), context-menu icons, ui-window chrome, settings prune
 * Approved: 2026-07-29
 */

# CWSP-shell chrome + settings (approved)

## Goals

1. **Taskbar → Windows 10 style**: left-aligned pins/tasks, flat bar (no acrylic/center cluster), active underline.
2. **Context menu icons (empty slots)**: ensure `ui-icon` is registered + sized so Phosphor glyphs paint.
3. **`ui-window` close / maximize / minimize** in environment shell: reliable managed teardown + control re-wire.
4. **Settings**: hide **CWSP**, **Extension**, **Server** on environment / CWSP-shell desktop surface.

## Non-goals

- Full Start menu
- Win11 centered taskbar
- Removing CWSP settings from Capacitor / Control SPA
