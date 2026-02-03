# 🚀 PHASE 2 QUICK START GUIDE

**What**: BasicShell + Settings + Boot Menu modernization  
**When**: February 2, 2026  
**Status**: ✅ Complete

---

## 🎯 QUICK OVERVIEW

Phase 2 brought three major updates:

### 1️⃣ **BasicShell Styling** 
✅ All hardcoded values → veela-basic tokens  
✅ Consistent spacing, colors, motion  
✅ Better navigation button states

### 2️⃣ **Settings View**
✅ Modernized form design  
✅ Token-based component styling  
✅ Dark mode support

### 3️⃣ **Boot Menu**
✅ Accessible at root route (`/`)  
✅ Shell selection on first visit  
✅ Preference persistence in localStorage

---

## 🔧 WHAT CHANGED

### Files Modified
```
apps/CrossWord/src/
├─ index.ts                                      (Added initializeLayers())
├─ frontend/shells/basic/basic.scss             (Veela-basic refactor)
└─ frontend/views/settings/Settings.scss        (Modern design)
```

### Key Changes

#### `src/index.ts`
```typescript
// ADD THIS FIRST:
import { initializeLayers } from "./frontend/styles/layer-manager";

export default async function index(mountElement: HTMLElement) {
    // CRITICAL: Initialize layers FIRST
    initializeLayers();
    // ... rest of code
}
```

#### `shells/basic/basic.scss`
```scss
// Before
padding-inline: 0.75rem;
border-radius: 8px;
font-size: 0.875rem;

// After
padding-inline: var(--basic-spacing-sm, 0.75rem);
border-radius: var(--basic-radius-md, 8px);
font-size: var(--basic-text-sm, 0.875rem);
```

#### `views/settings/Settings.scss`
```scss
// Before
@layer bs-settings { /* styles */ }

// After
@use "../../styles/lib" as lib;
@use "../../styles/properties/tokens" as tokens;
@layer settings { /* styles */ }
```

---

## 🎨 VEELA-BASIC TOKENS QUICK REFERENCE

### Common Tokens
| Use Case | Token | Fallback |
|----------|-------|----------|
| Primary background | `--basic-surface` | `#ffffff` |
| Primary text | `--basic-on-surface` | `#1a1a1a` |
| Small padding | `--basic-spacing-sm` | `0.75rem` |
| Medium spacing | `--basic-spacing-md` | `1rem` |
| Small radius | `--basic-radius-sm` | `6px` |
| Medium radius | `--basic-radius-md` | `8px` |
| Fast motion | `--basic-motion-fast` | `0.15s ease` |
| Small text | `--basic-text-sm` | `0.875rem` |

### Usage Pattern
```scss
// Apply token with fallback
color: var(--basic-on-surface, #1a1a1a);
padding: var(--basic-spacing-md, 1rem);
border-radius: var(--basic-radius-lg, 12px);
transition: background-color var(--basic-motion-fast, 0.15s ease);
```

---

## 🌓 DARK MODE

### Automatic (System Preference)
```scss
@media (prefers-color-scheme: dark) {
    .component {
        background: var(--basic-surface);  // Auto-adjusts
        color: var(--basic-on-surface);    // Auto-adjusts
    }
}
```

### Manual (Explicit Override)
```scss
[data-theme="dark"] .component {
    --view-bg: var(--basic-surface);
    --view-fg: var(--basic-on-surface);
}
```

---

## 🗺️ BOOT MENU FLOW

### First Visit
```
User opens app at /
  ↓
Check saved shell preference
  ↓
NO preference found
  ↓
Show boot menu
  ├─ Basic (Recommended)
  ├─ Faint OS (Unstable)
  └─ Airpad
  ↓
User clicks option + checks "Remember"
  ↓
Save to localStorage
  ↓
Redirect to /viewer with shell
```

### Return Visit (Remembered)
```
User opens app at /
  ↓
Check localStorage: rs-boot-shell = "basic"
  ↓
YES - has preference
  ↓
Auto-redirect to /viewer
```

### Force Boot Menu
Clear localStorage:
```javascript
localStorage.removeItem('rs-boot-shell');
localStorage.removeItem('rs-boot-remember');
```

---

## ✅ VERIFICATION

### Check 1: Layer Initialization
In browser console:
```javascript
// Should show in order:
console.log(document.head.querySelector('[data-layer-manager]'));
// <style id="css-layer-init" data-layer-manager="true">...</style>
```

### Check 2: Boot Menu
Navigate to `/` in new browser/incognito  
Should see shell selection menu

### Check 3: Settings
Open `/settings`  
Should see modern form design with proper spacing/colors

### Check 4: Token Fallbacks
Open DevTools → Elements → Find `.shell-basic__nav`  
Should see computed colors from `--basic-*` tokens

---

## 🔍 DEBUGGING

### Issue: Boot Menu Not Showing
```
Check 1: Is localStorage cleared?
Check 2: Is CSS loaded (initializeLayers() called)?
Check 3: Check browser console for errors
Check 4: Verify route is exactly "/"
```

### Issue: Tokens Not Applying
```
Check 1: Is @use import present?
Check 2: Is token name correct (--basic-*)?
Check 3: Is @layer directive present?
Check 4: DevTools → Computed → Search token name
```

### Issue: Dark Mode Not Working
```
Check 1: Is prefers-color-scheme media query present?
Check 2: Is [data-theme] selector correct?
Check 3: System Settings → Appearance → Dark
Check 4: Check CSS in DevTools → Styles
```

---

## 📚 RELATED FILES

### To Understand Phase 2
- `PHASE_2_EXECUTION_SUMMARY.md` — Full details
- `PHASE_2_STATUS_REPORT.md` — Technical report

### To Understand Phase 1
- `PHASE_1_EXECUTION_SUMMARY.md` — Context selectors
- `COMPREHENSIVE_CSS_REFACTORING_STRATEGY.md` — Full strategy

### Token Definitions
- `modules/projects/veela.css/` — Veela framework
- `apps/CrossWord/src/frontend/styles/properties/_tokens.scss` — App tokens

---

## 🚦 NEXT STEPS (Phase 3)

### Faint Shell
```scss
// Apply same pattern as Basic
@use "../../styles/lib" as lib;
@use "../../styles/properties/tokens" as tokens;

@layer shell-faint {
    // Use --basic-* tokens
    // Use context mixins from lib
    // Support dark mode
}
```

### Raw Shell
```scss
// Minimal styling approach
@use "../../styles/properties/tokens" as tokens;

@layer shell-raw {
    // Only essential styles
    // Maximize content space
    // Minimal chrome
}
```

---

## 💡 BEST PRACTICES

### ✅ DO
- Use `--basic-*` tokens for everything
- Include fallback values
- Use `@use` for imports
- Wrap in `@layer`
- Test dark mode

### ❌ DON'T
- Hardcode pixel/color values
- Use `@import` (deprecated)
- Mix layer names
- Skip fallback values
- Forget media queries

---

## 🎯 SUCCESS CHECKLIST

- ✅ Boot menu shows at `/`
- ✅ Shell selection works
- ✅ Settings looks modern
- ✅ Dark mode works
- ✅ Tokens apply correctly
- ✅ No console errors
- ✅ No styling glitches

---

## 📞 QUICK LINKS

| Resource | Link |
|----------|------|
| Layer Manager | `src/frontend/styles/layer-manager.ts` |
| Veela Tokens | `src/frontend/styles/properties/_tokens.scss` |
| Context Mixins | `src/frontend/styles/lib/_context-mixins.scss` |
| Boot Menu Code | `src/frontend/main/boot-menu.ts` |
| Routing | `src/frontend/main/routing.ts` |

---

**Status**: ✅ Phase 2 Complete  
**Ready For**: Phase 3 (Faint & Raw shells)  
**Created**: February 2, 2026
