# Clipboard Prompt Popup Design

**Date:** 2026-07-14  
**Status:** Approved (user)  
**Scope:** Neutralino Windows (primary); Capacitor/Android (partial parity)  
**Approach:** Hybrid C — Node clipboard-hub detects + decides; separate Neutralino `popup` window shows UI

## Problem

Outbound local copy and inbound remote clipboard currently auto-share / auto-apply with no confirm UX. Users need settings-driven auto vs ask flows and a tray-safe toast window with spoiler preview.

## Decisions

1. **Toast surface (Windows):** dedicated always-on-top Neutralino window (mode `popup` already in `neutralino.config.json`), not main WebView overlay.
2. **Position:** right-bottom on Windows; Android left-bottom / notification style.
3. **Dismiss:** 10s default auto-dismiss; timeout on ask = dismiss (no share / no apply).
4. **Models:** Grok audit + GLM-5.2 implement; no Composer.

## Settings (`shell`)

| Key | Type | Default | Meaning |
|---|---|---|---|
| `clipboardOutboundMode` | `"auto" \| "ask"` | `"auto"` | On local user copy |
| `clipboardInboundMode` | `"auto" \| "ask"` | `"auto"` | On remote/app clipboard change |
| `clipboardOutboundShowErase` | `boolean` | `true` | Auto-share popup shows Erase |
| `clipboardInboundShowUndo` | `boolean` | `true` | Auto-accept popup shows Undo |
| `clipboardPromptDismissMs` | `number` | `10000` | Auto-dismiss delay |

Existing gates remain: `acceptInboundClipboardData`, `applyRemoteClipboardToDevice`, `clipboardShareDestinationIds`, allow lists.

## Outbound (local copy)

- **auto:** share immediately; show popup (spoiler + optional Erase + Dismiss).
- **ask:** hold share until Share; Dismiss / timeout → do not share.
- Erase: clear local clipboard (after share when auto; only if user taps Erase).

## Inbound (remote / service)

- **auto:** apply immediately; show popup (spoiler + optional Undo + Dismiss).
- **ask:** hold apply until Accept; Dismiss / timeout → do not apply.
- Undo: restore previous local clipboard snapshot captured before apply.

## Neutralino popup UI

- Mode `popup`: borderless, transparent, hidden by default, ~360×160–220.
- alwaysOnTop; place at right-bottom of work area.
- Spoiler: collapsed text truncate / image thumb; expand on click.
- Android-like card styling (shared CSS tokens where possible).
- IPC: hub ↔ popup via control HTTP and/or Neutralino events (`clipboard-prompt`).

## Android (partial)

- Same settings keys in Settings contributions + `SettingsTypes`.
- Inbound: notification and/or left-bottom toast with Accept/Dismiss/Undo when feasible.
- Outbound ask/auto full popup parity is phase 2 if FGS notification actions are insufficient.

## Non-goals (this pass)

- Redesign main Settings layout beyond new fields.
- Change CWSP v2 wire envelope.
- Force-share when `acceptInboundClipboardData` is false.

## Canonical touch points

- `modules/views/shared/src/other/config/SettingsTypes.ts`
- `modules/views/shared/src/other/config/settings/contributions/cwsp.ts`
- `apps/CWSP-reborn/src/backend/node/shared/neutralino/clipboard-hub.ts`
- `apps/CWSP-reborn/app/windows/neutralino/neutralino.config.json` (+ mirrors)
- New: clipboard prompt popup web entry + styles under Neutralino resources / frontend
- Android: `CwspBridgeService` / notification path (partial)

## Self-review

- No placeholders left for required behavior.
- Defaults match user-approved design.
- Scope split: Neutralino first, Android partial second.
- Secrets stay out of docs.
