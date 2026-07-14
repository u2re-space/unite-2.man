# Clipboard Prompt Popup Design

**Date:** 2026-07-14  
**Status:** Amended — Neutralino second-process toast abandoned  
**Scope:** Neutralino Windows (primary); Capacitor/Android (partial parity)

## Amendment (2026-07-14 night)

Independent Neutralino toast process is **abandoned**: it opened empty/fullscreen
shells and left orphan processes. Replacement:

1. Node clipboard-hub still owns prompt state + `/service/clipboard-prompt`.
2. Windows: WinForms PowerShell dialog (`resources/clipboard-prompt/prompt-toast.ps1`).
3. Android: notification actions (Phase 2) — unchanged.
4. Main WebView bridge remains a no-op.
5. Backend watches `CWSP_PARENT_PID` (extNode) and exits when Neutralino dies;
   extNode uses `taskkill /T /F` on backend stop.

## Settings (`shell`) — still valid

| Key | Type | Default |
|---|---|---|
| `clipboardOutboundMode` | `"auto" \| "ask"` | `"auto"` |
| `clipboardInboundMode` | `"auto" \| "ask"` | `"auto"` |
| `clipboardOutboundShowErase` | `boolean` | `true` |
| `clipboardInboundShowUndo` | `boolean` | `true` |
| `clipboardPromptDismissMs` | `number` | `10000` |

## Canonical modules

- `resources/clipboard-prompt/prompt-toast.ps1` — Windows toast UI
- `src/backend/node/shared/neutralino/clipboard-prompt-host.ts` — spawn/kill native toast
- `src/backend/node/shared/neutralino/clipboard-hub.ts` — policy + state
- `extensions/node/main.js` — backend spawn + tree kill
- `CwspBridgeService.java` — Android notifications
