# Phase 2: CSS Optimization & Refactoring Guide

## 🎯 Overview

Phase 2 focuses on extending the layer-based architecture to all shells and views, consolidating shared patterns, and optimizing the overall CSS system.

---

## 📋 Task Breakdown

### 1. Refactor Faint Shell

**Status**: Ready to implement

#### File Structure
```
shells/faint/
├── _keyframes.scss    # Keyframes (@layer tokens)
├── _tokens.scss       # Faint-specific tokens (@layer tokens)
├── _base.scss         # Base faint styling (@layer base)
├── _layout.scss       # Layout (@layer shell)
├── _components.scss   # Components (@layer components)
├── index.scss         # ROOT: @layer declaration + @use
└── faint.scss         # Theme & variant styles (@layer shell)
```

#### Template for `shells/faint/index.scss`
```scss
/**
 * Faint Shell Styles - Layer-based Architecture
 * 
 * Implements CSS cascade layers for proper specificity management.
 * All imports use @use for modern SCSS module system.
 */

@layer system, tokens, base, shell, view, components, utilities, overrides;

@use "keyframes" as kf;
@use "tokens" as t;
@use "base" as base;
@use "layout" as layout;
@use "components" as c;
@use "faint" as faint;
```

#### Template for `shells/faint/_tokens.scss`
```scss
/**
 * Faint Shell - Design Tokens
 * 
 * Shell-specific custom properties and design system tokens.
 * Scoped to .shell-faint to avoid conflicts.
 */

@layer tokens {
    .shell-faint {
        /* ======= LAYOUT ======= */
        --shell-nav-height: 64px;
        --shell-sidebar-width: 280px;
        --shell-padding: 0;

        /* ======= COLORS (override defaults as needed) ======= */
        --shell-primary: #5c6e7b;
        --shell-bg: #f0f2f5;

        /* ======= RADIUS ======= */
        --radius-sm: 4px;
        --radius-md: 8px;
        --radius-lg: 12px;

        /* ======= SPACING ======= */
        --space-xs: 0.25rem;
        --space-sm: 0.5rem;
        --space-md: 0.75rem;
        --space-lg: 1rem;

        /* ======= SHADOWS ======= */
        --shadow-sm: 0 1px 2px rgba(0, 0, 0, 0.05);
        --shadow-md: 0 4px 6px rgba(0, 0, 0, 0.1);
    }
}
```

---

### 2. Refactor Raw Shell

**Status**: Ready to implement (simpler than faint)

#### File Structure
```
shells/raw/
├── _reset.scss        # HTML resets (@layer system)
├── index.scss         # ROOT: minimal @layer
└── raw.scss           # Any shell-specific styles (@layer shell)
```

#### Template for `shells/raw/index.scss`
```scss
/**
 * Raw Shell Styles - Minimal Styling
 * 
 * Provides only essential resets and browser normalization.
 * No design system or framework styles.
 */

@layer system, tokens, base, shell, view, components, utilities, overrides;

@use "reset" as reset;
```

#### Template for `shells/raw/_reset.scss`
```scss
/**
 * HTML Resets - System Layer
 * 
 * Minimal browser reset for raw shell.
 * Focus on compatibility without imposing design.
 */

@layer system {
    * {
        margin: 0;
        padding: 0;
        box-sizing: border-box;
    }

    html, body {
        width: 100%;
        height: 100%;
    }

    body {
        font-family: system-ui, -apple-system, sans-serif;
        line-height: 1.5;
    }
}
```

---

### 3. Create Shared SCSS Library

**Status**: High priority

#### Directory Structure
```
shells/lib/
├── _variables.scss      # Shared variables/tokens
├── _mixins.scss         # Common SCSS mixins
├── _functions.scss      # SCSS functions
├── _keyframes.scss      # Global keyframes
├── _breakpoints.scss    # Media query breakpoints
└── index.scss           # Public exports via @forward
```

#### Template for `shells/lib/_breakpoints.scss`
```scss
/**
 * Breakpoints Library
 * 
 * Centralized responsive design breakpoints.
 * Use @use "lib/breakpoints" as bp; then bp.$mobile, bp.$tablet, etc.
 */

$mobile: 480px;
$tablet: 768px;
$desktop: 1024px;
$wide: 1280px;
$ultrawide: 1920px;

@mixin respond($breakpoint) {
    @if $breakpoint == "mobile" {
        @media (max-width: 479px) { @content; }
    } @else if $breakpoint == "tablet" {
        @media (min-width: 480px) and (max-width: 767px) { @content; }
    } @else if $breakpoint == "desktop" {
        @media (min-width: 768px) and (max-width: 1023px) { @content; }
    } @else if $breakpoint == "wide" {
        @media (min-width: 1024px) and (max-width: 1279px) { @content; }
    } @else if $breakpoint == "ultrawide" {
        @media (min-width: 1920px) { @content; }
    }
}
```

#### Template for `shells/lib/_mixins.scss`
```scss
/**
 * Common SCSS Mixins Library
 * 
 * Reusable patterns for common CSS needs.
 * Import via: @use "lib/mixins" as mx;
 */

/* Focus Ring Mixin */
@mixin focus-ring($color: var(--focus-color, #007acc), $offset: 2px) {
    outline: 2px solid $color;
    outline-offset: $offset;
}

/* Truncate Text */
@mixin truncate {
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
}

/* Line Clamp */
@mixin line-clamp($lines: 2) {
    display: -webkit-box;
    -webkit-line-clamp: $lines;
    -webkit-box-orient: vertical;
    overflow: hidden;
}

/* Flexbox Center */
@mixin flex-center {
    display: flex;
    align-items: center;
    justify-content: center;
}

/* Smooth Transition */
@mixin smooth-transition($props: all, $duration: 200ms, $timing: ease) {
    transition: $props $duration $timing;
}

/* Visually Hidden (Accessible) */
@mixin visually-hidden {
    position: absolute !important;
    width: 1px !important;
    height: 1px !important;
    padding: 0 !important;
    margin: -1px !important;
    overflow: hidden !important;
    clip: rect(0, 0, 0, 0) !important;
    white-space: nowrap !important;
    border: 0 !important;
}
```

#### Template for `shells/lib/_keyframes.scss`
```scss
/**
 * Global Keyframes Library
 * 
 * Centralized animations used across shells/views.
 * Wrap in @layer tokens when imported.
 */

@keyframes spin {
    0% { transform: rotate(0deg); }
    100% { transform: rotate(360deg); }
}

@keyframes pulse {
    0%, 100% { opacity: 1; }
    50% { opacity: 0.5; }
}

@keyframes fadeIn {
    from { opacity: 0; }
    to { opacity: 1; }
}

@keyframes fadeInUp {
    from {
        opacity: 0;
        transform: translateY(20px);
    }
    to {
        opacity: 1;
        transform: translateY(0);
    }
}

@keyframes slideInLeft {
    from {
        opacity: 0;
        transform: translateX(-20px);
    }
    to {
        opacity: 1;
        transform: translateX(0);
    }
}

@keyframes slideInRight {
    from {
        opacity: 0;
        transform: translateX(20px);
    }
    to {
        opacity: 1;
        transform: translateX(0);
    }
}

@keyframes bounce {
    0%, 100% { transform: translateY(0); }
    50% { transform: translateY(-10px); }
}

@keyframes shimmer {
    0% { background-position: -1000px 0; }
    100% { background-position: 1000px 0; }
}
```

#### Template for `shells/lib/index.scss`
```scss
/**
 * Shared SCSS Library
 * 
 * Public exports for use across shells and views.
 * Import via: @use "shells/lib" as lib;
 */

@forward "breakpoints";
@forward "mixins";
@forward "variables";
@forward "functions";
```

---

### 4. Create Shared Token Module

**Status**: High priority

#### Template for `shells/lib/_variables.scss`
```scss
/**
 * Shared Design Tokens
 * 
 * Common tokens used across multiple shells.
 * Override in shell-specific _tokens.scss as needed.
 */

/* ======= SPACING ======= */
$space-xs: 0.25rem;
$space-sm: 0.5rem;
$space-md: 0.75rem;
$space-lg: 1rem;
$space-xl: 1.25rem;
$space-2xl: 1.6rem;

/* ======= RADIUS ======= */
$radius-sm: 4px;
$radius-md: 8px;
$radius-lg: 12px;
$radius-xl: 16px;
$radius-full: 9999px;

/* ======= SHADOWS ======= */
$shadow-sm: 0 1px 2px rgba(0, 0, 0, 0.05);
$shadow-md: 0 4px 6px rgba(0, 0, 0, 0.1);
$shadow-lg: 0 10px 15px rgba(0, 0, 0, 0.1);

/* ======= TRANSITIONS ======= */
$transition-fast: 120ms ease;
$transition-normal: 200ms ease;
$transition-slow: 300ms ease;

/* ======= Z-INDEX ======= */
$z-dropdown: 100;
$z-sticky: 500;
$z-fixed: 1000;
$z-modal: 2000;
$z-popover: 2500;
$z-tooltip: 3000;
```

---

### 5. Refactor Views (Template Pattern)

#### Template for `views/{view}/index.scss` (Root)
```scss
/**
 * {View} View Styles - Layer-based Architecture
 * 
 * View-specific styles scoped to .view-{view} container.
 * Uses @use for imports and @layer for cascade management.
 */

@use "tokens" as t;
@use "styles" as styles;

/* Layer tokens at view scope */
@layer tokens {
    :root:has(.view-{view}) {
        /* View-specific custom properties */
        --view-padding: 1rem;
        --view-max-width: 100%;
    }
}
```

#### Template for `views/{view}/_tokens.scss`
```scss
/**
 * {View} - Design Tokens
 * 
 * View-specific tokens scoped to this view.
 */

@layer tokens {
    .view-{view} {
        /* ======= LAYOUT ======= */
        --view-padding: 1rem;
        --view-gap: 0.75rem;

        /* ======= COLORS ======= */
        --view-primary: var(--color-primary);

        /* Add more tokens as needed */
    }
}
```

#### Template for `views/{view}/_styles.scss`
```scss
/**
 * {View} - Component Styles
 * 
 * View layout, components, and interactions.
 */

@layer view {
    .view-{view} {
        display: flex;
        flex-direction: column;
        gap: var(--view-gap);
        padding: var(--view-padding);
    }

    .view-{view}__header {
        /* header styles */
    }

    .view-{view}__content {
        flex: 1;
        overflow: auto;
    }

    .view-{view}__footer {
        /* footer styles */
    }
}
```

---

### 6. Media Query Consolidation

**Strategy**: Centralize breakpoint-based rules

#### Before (Scattered):
```scss
/* In shell A */
@media (max-width: 640px) { /* mobile styles */ }

/* In shell B */
@media (max-width: 640px) { /* mobile styles */ }

/* In view C */
@media (max-width: 767px) { /* different breakpoint! */ }
```

#### After (Consolidated):
```scss
/* shells/lib/_breakpoints.scss */
$mobile: 480px;
$tablet: 768px;
$desktop: 1024px;

@mixin respond($breakpoint) {
    @if $breakpoint == "mobile" {
        @media (max-width: 479px) { @content; }
    } @else if $breakpoint == "tablet" {
        @media (min-width: 480px) { @content; }
    } @else if $breakpoint == "desktop" {
        @media (min-width: 1024px) { @content; }
    }
}

/* Usage in shells/*/
@use "lib/breakpoints" as bp;

.element {
    @include bp.respond("mobile") {
        /* mobile styles */
    }
}
```

---

### 7. Remove Dead Styles

#### Search Pattern
```bash
# Find unused classes
grep -r "^\." apps/CrossWord/src/frontend/shells --include="*.scss" \
    | grep -v "::" | grep -v "@" | sort -u > /tmp/scss-classes.txt

# Find used classes in TS
grep -r "\".*\"" apps/CrossWord/src/frontend --include="*.ts" \
    | grep -o "\".+\"" | sort -u > /tmp/used-classes.txt

# Compare to find unused
comm -23 /tmp/scss-classes.txt /tmp/used-classes.txt
```

#### Common Dead Styles to Check
- `.legacy-*` patterns
- Prefixed versions (`.btn-old`, `.nav-v1`)
- Commented-out selectors
- Duplicated rules across files

---

### 8. Create Optimization Checklist

#### For Each Shell/View:
- [ ] Convert `@import` to `@use`
- [ ] Declare `@layer` order once at root
- [ ] Wrap all rules in appropriate `@layer`
- [ ] Flatten SCSS nesting (max 2 levels)
- [ ] Extract keyframes to `_keyframes.scss`
- [ ] Group related rules with headers
- [ ] Use semantic token names
- [ ] Remove duplicate selectors
- [ ] Check for unused styles
- [ ] Test in browser (no visual changes)
- [ ] Run build (`npm run build`)
- [ ] Verify no linter errors

---

## 🎯 Priority Order

**Week 1:**
1. Create shared lib (`_breakpoints.scss`, `_mixins.scss`, `_keyframes.scss`)
2. Refactor faint shell
3. Refactor raw shell

**Week 2:**
1. Refactor viewer view
2. Refactor editor view
3. Consolidate media queries

**Week 3:**
1. Refactor remaining views
2. Remove dead styles
3. Final optimization pass

---

## 📊 Expected Outcomes

- ✅ Centralized breakpoints (1 source of truth)
- ✅ Reduced keyframe duplication (40-50%)
- ✅ Shared mixin library (reusable patterns)
- ✅ All shells/views using @layer system
- ✅ Reduced CSS file size (10-20%)
- ✅ Improved code reusability

---

## 🧪 Testing Checklist

After each refactoring:

```bash
# 1. Build
npm run build

# 2. Dev server
npm run dev

# 3. Visual test
# - Load each shell
# - Test responsive breakpoints
# - Verify theme switching
# - Check animations

# 4. Lint check
npm run lint

# 5. No console errors
# Open DevTools → Console tab
```

---

## 💡 Tips & Tricks

### Using Shared Mixins
```scss
@use "shells/lib/mixins" as mx;

.element {
    @include mx.smooth-transition;
    @include mx.truncate;

    &:focus-visible {
        @include mx.focus-ring;
    }
}
```

### Using Breakpoint Mixin
```scss
@use "shells/lib/breakpoints" as bp;

.element {
    @include bp.respond("mobile") {
        /* Mobile-specific styles */
    }

    @include bp.respond("desktop") {
        /* Desktop-specific styles */
    }
}
```

### Using Shared Tokens
```scss
@use "shells/lib/variables" as vars;

.element {
    padding: vars.$space-md;
    border-radius: vars.$radius-md;
    transition: vars.$transition-normal;
}
```

---

## ✅ Success Criteria

- All shells refactored to @use + @layer
- All views refactored to @use + @layer  
- Shared lib created with common patterns
- Keyframes centralized (no duplication)
- Media queries consolidated (1 breakpoint system)
- Dead styles removed
- CSS file size reduced
- Build passes, no linter errors
- All functionality preserved

---

**Ready to start Phase 2! Use these templates and continue the refactoring journey.** 🚀
