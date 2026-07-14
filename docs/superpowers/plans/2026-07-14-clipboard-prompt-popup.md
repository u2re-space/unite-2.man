# Clipboard Prompt Popup Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Add settings-driven outbound/inbound clipboard confirm UX with a tray-safe Neutralino always-on-top popup (Android partial parity).

**Architecture:** Node clipboard-hub owns detect/decide/share/apply gates; a dedicated Neutralino `popup` window renders spoiler + actions; settings live under `shell.*` and sync to hub via existing control POST.

**Tech Stack:** NeutralinoJS multi-window, Node clipboard-hub, SettingsTypes + contributions, Capacitor/Java notifications (partial).

**Models:** GLM-5.2 implement; Grok review. **Do not use Composer.**

**Spec:** `docs/superpowers/specs/2026-07-14-clipboard-prompt-popup-design.md`

---

## File map

| File | Role |
|---|---|
| `modules/views/shared/src/other/config/SettingsTypes.ts` | New shell keys + defaults |
| `modules/views/shared/src/other/config/settings/contributions/cwsp.ts` | Settings UI fields |
| `apps/CWSP-reborn/src/backend/node/shared/neutralino/clipboard-hub.ts` | Prompt policy + pending hold + IPC hooks |
| `apps/CWSP-reborn/src/backend/node/shared/neutralino/control.ts` | `/service/clipboard-prompt` GET/POST actions |
| `apps/CWSP-reborn/app/windows/neutralino/neutralino.config.json` (+ src mirrors) | popup alwaysOnTop, size |
| New popup entry (e.g. `resources/clipboard-prompt/` or frontend `clipboard-prompt/`) | Toast UI |
| Main Neutralino boot / extension | `window.create` / show-hide popup on hub event |
| Android `CwspBridgeService` / notification | Partial inbound/outbound prompts |

Prefer editing `src/` canonical paths; hardlinks may mirror into `app/`.

---

### Task 1: Settings types + contribution UI

- [ ] Add to `ShellSettings` / defaults in `SettingsTypes.ts`:
  - `clipboardOutboundMode: "auto" | "ask"` default `"auto"`
  - `clipboardInboundMode: "auto" | "ask"` default `"auto"`
  - `clipboardOutboundShowErase: true`
  - `clipboardInboundShowUndo: true`
  - `clipboardPromptDismissMs: 10000`
- [ ] Add select/checkbox fields under clipboard section in `cwsp.ts` contributions
- [ ] Ensure Settings save still patches Node via existing Neutralino sync path
- [ ] Smoke: load Settings, save, reload — values persist

### Task 2: Hub policy + pending clipboard ops

- [ ] In `clipboard-hub.ts`, read prompt modes from synced config
- [ ] On **local clipboard change** (outbound):
  - Snapshot payload (text and/or asset envelope)
  - If `ask`: do **not** send WS yet; emit prompt event; wait for Share/Dismiss/timeout
  - If `auto`: send WS immediately; emit prompt with Erase affordance if enabled
- [ ] On **inbound clipboard packet**:
  - If `ask`: hold OS write; emit prompt; wait for Accept/Dismiss/timeout
  - If `auto`: apply; keep previous snapshot for Undo; emit prompt
- [ ] Implement Erase (clear local) and Undo (restore snapshot)
- [ ] Deduplicate: do not stack infinite popups; replace or ignore duplicates in short window

### Task 3: Control API for prompt actions

- [ ] Add `/service/clipboard-prompt` (or extend hub POST) with:
  - `GET` current pending prompt (kind, mode, spoiler meta, hasImage, textPreview, expiresAt)
  - `POST` `{ action: "share"|"dismiss"|"erase"|"accept"|"undo" }`
- [ ] Auth: same `X-API-Key` as clipboard-hub control
- [ ] Timeout worker dismisses pending ask ops safely

### Task 4: Neutralino popup window

- [ ] Ensure `modes.popup` has `alwaysOnTop: true`, sensible width/height (~360×200), borderless, transparent, hidden
- [ ] Create/show popup at **right-bottom** (use display size API / approximate work area)
- [ ] Popup page: spoiler (text/image), action buttons by kind+mode, 10s countdown dismiss
- [ ] Wire popup ↔ control API; hide window on dismiss/timeout
- [ ] Main process or extension opens popup when hub signals (do not rely on main WebView visibility)

### Task 5: Android partial parity

- [ ] Persist same settings keys via Capacitor settings patch / Configure
- [ ] Inbound ask/auto: notification actions Accept / Dismiss / Undo when possible
- [ ] Left-bottom toast if existing UI hook exists; otherwise notification-only is OK for this pass
- [ ] Document remaining gaps (full outbound ask popup) in code comment, not new markdown report

### Task 6: Verify

- [ ] Neutralino: outbound auto shows popup; erase works
- [ ] Neutralino: outbound ask blocks share until Share; timeout skips
- [ ] Neutralino: inbound auto applies + undo restores
- [ ] Neutralino: inbound ask does not apply until Accept
- [ ] Tray/minimized main window still shows popup
- [ ] `npm run build:neutralino:windows` (or web-only if full build blocked)
- [ ] Capacitor settings fields visible; no SMS regression

### Task 7: Stop + handoff

- [ ] Do **not** commit unless user asks
- [ ] Report changed files, how to test, remaining Android gaps

---

## Risks

- Neutralino multi-window create API differences across versions — probe `window.create` / extensions first.
- Holding inbound apply must not block hub WS loop — use pending queue, not sync wait on socket thread.
- Large image spoilers: thumb/hash only in popup GET; full asset stays in hub memory until accept/share.
