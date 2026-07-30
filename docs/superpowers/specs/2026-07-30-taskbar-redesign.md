# Taskbar redesign (environment-shell)

Date: 2026-07-30  
Status: approved (user: «Норм, можно»)  
Approach: targeted edits in `taskbar.ts` + `chrome.scss` + window layer (no new CE)

## Decisions

1. **Acrylic:** desktop bar = backdrop-blur + translucent fill + lur.e under-shadow; mobile bar fully transparent (no blur/shadow).
2. **Home:** mobile centered icon-only; desktop Home pin hidden. Markdown pin kept icon-only on desktop.
3. **Tasks:** desktop window chips icon-only (`::part(title)` hidden + `title`/`aria-label`).
4. **Click:** Win toggle — minimized→restore+focus; focused+visible→minimize; else→focus(+restore).
5. **Menus:** unified ContextMenu on task + empty taskbar; desktop tray clock+date (right).

## Files

- `modules/shells/environment-shell/src/components/taskbar.ts`
- `modules/shells/environment-shell/src/scss/chrome.scss`
- `modules/shells/environment-shell/src/workspace-window-layer.ts` / `mount-ui-window.ts` (as needed)
