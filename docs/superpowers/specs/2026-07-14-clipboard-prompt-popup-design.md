# Clipboard Prompt Popup Design

**Date:** 2026-07-14  
**Status:** Amended — independent process required  
**Scope:** Neutralino Windows (primary); Capacitor/Android (partial parity)

## Amendment (2026-07-14 evening)

`Neutralino.window.create` from the main app is **not viable**: each created window is an isolated Neutralino process that re-runs extensions (second Node backend / hub). That approach is abandoned.

**Replacement:**
1. Node clipboard-hub owns prompt state + `/service/clipboard-prompt` HTTP IPC (unchanged).
2. Hub spawns an **independent** Neutralino binary with `clipboard-prompt.config.json`:
   - `enableExtensions: false` (must not start extNode)
   - own UI port `18766` (only Neutralino static server; control RPC stays on `18765`)
   - auth via `CWSP_CONTROL_PORT` / `CWSP_CONTROL_KEY` env + shared `.tmp/cwsp-control-auth.json`
3. Main WebView bridge (`clipboard-prompt-bridge`) is a no-op.
4. Optional future: dedicated WS/SSE push on control host; HTTP poll is enough for v1 independent process.

## Settings (`shell`) — still valid

| Key | Type | Default |
|---|---|---|
| `clipboardOutboundMode` | `"auto" \| "ask"` | `"auto"` |
| `clipboardInboundMode` | `"auto" \| "ask"` | `"auto"` |
| `clipboardOutboundShowErase` | `boolean` | `true` |
| `clipboardInboundShowUndo` | `boolean` | `true` |
| `clipboardPromptDismissMs` | `number` | `10000` |

## Android

Notification-channel actions (Accept/Dismiss/Undo/Share/Erase) — Phase 2 implementation.

## Canonical modules

- `clipboard-prompt.config.json` — independent Neutralino app config
- `src/backend/node/shared/neutralino/clipboard-prompt-host.ts` — spawn/kill
- `src/backend/node/shared/neutralino/clipboard-hub.ts` — policy + state
- `resources/clipboard-prompt/*` — popup UI
- `CwspBridgeService.java` — Android notifications
