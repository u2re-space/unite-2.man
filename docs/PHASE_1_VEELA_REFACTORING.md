# Phase 1: veela.css Refactoring - Detailed Implementation Guide

**Status:** Implementation Template  
**Target Module:** `/modules/projects/veela.css/`  
**Objective:** Modernize veela.css with @use, @layer, and custom properties modules  

---

## Overview

This phase restructures veela.css to:
1. Create a dedicated custom properties module
2. Refactor all imports to use @use instead of @forward (where appropriate)
3. Wrap runtime styles with explicit @layer declarations
4. Create TypeScript layer management system
5. Maintain backward compatibility with existing consumers

---

## Step 1.1: Create Custom Properties Module

### File: `modules/projects/veela.css/src/scss/lib/_custom-properties.scss`

This module defines ALL CSS custom properties (variables) at the `:root` level with no side effects.

```scss
/**
 * Veela CSS Custom Properties Module
 * 
 * Defines design tokens as CSS variables only.
 * NO selectors that target elements.
 * NO property declarations outside :root.
 * 
 * Usage:
 *   @use './custom-properties';  // For CSS contexts
 *   @import './custom-properties';  // For older SCSS
 */

@layer ux-tokens.custom-properties {
    :root {
        /**
         * COLOR PALETTE
         * Base colors that define the design system
         */
        --ux-color-primary: #007acc;
        --ux-color-primary-dark: #005a9c;
        --ux-color-primary-light: #0098ff;
        
        --ux-color-secondary: #6c757d;
        --ux-color-secondary-dark: #545b62;
        --ux-color-secondary-light: #848c94;
        
        --ux-color-success: #28a745;
        --ux-color-success-dark: #1e7e34;
        --ux-color-success-light: #51cf66;
        
        --ux-color-warning: #ffc107;
        --ux-color-warning-dark: #e0a800;
        --ux-color-warning-light: #ffd43b;
        
        --ux-color-danger: #dc3545;
        --ux-color-danger-dark: #bd2130;
        --ux-color-danger-light: #f5365c;
        
        --ux-color-info: #17a2b8;
        --ux-color-info-dark: #138496;
        --ux-color-info-light: #3dd5f3;
        
        /**
         * SURFACE & CONTRAST
         * For background/foreground relationships
         */
        --ux-surface-primary: #ffffff;
        --ux-surface-secondary: #f5f5f5;
        --ux-surface-tertiary: #eeeeee;
        --ux-surface-container: #fafafa;
        --ux-surface-container-high: #f0f0f0;
        
        --ux-on-surface: #1a1a1a;
        --ux-on-surface-variant: #666666;
        --ux-on-surface-subtle: #999999;
        
        /**
         * BORDERS & OUTLINES
         */
        --ux-border-color: rgba(0, 0, 0, 0.12);
        --ux-border-color-variant: rgba(0, 0, 0, 0.08);
        --ux-outline: rgba(0, 0, 0, 0.15);
        --ux-outline-variant: rgba(0, 0, 0, 0.1);
        
        /**
         * SPACING SCALE
         * Based on 4px baseline
         */
        --ux-space-0: 0;
        --ux-space-1: 0.25rem;   /* 4px */
        --ux-space-2: 0.5rem;    /* 8px */
        --ux-space-3: 0.75rem;   /* 12px */
        --ux-space-4: 1rem;      /* 16px */
        --ux-space-5: 1.25rem;   /* 20px */
        --ux-space-6: 1.5rem;    /* 24px */
        --ux-space-8: 2rem;      /* 32px */
        --ux-space-10: 2.5rem;   /* 40px */
        --ux-space-12: 3rem;     /* 48px */
        --ux-space-16: 4rem;     /* 64px */
        --ux-space-20: 5rem;     /* 80px */
        --ux-space-24: 6rem;     /* 96px */
        
        /**
         * TYPOGRAPHY
         */
        --ux-font-family-base: -apple-system, BlinkMacSystemFont, 'Segoe UI', 
                               Roboto, 'Helvetica Neue', Arial, sans-serif;
        --ux-font-family-mono: 'Monaco', 'Courier New', monospace;
        --ux-font-family-serif: 'Georgia', 'Times New Roman', serif;
        
        --ux-font-size-xs: 0.75rem;      /* 12px */
        --ux-font-size-sm: 0.875rem;     /* 14px */
        --ux-font-size-base: 1rem;       /* 16px */
        --ux-font-size-lg: 1.125rem;     /* 18px */
        --ux-font-size-xl: 1.25rem;      /* 20px */
        --ux-font-size-2xl: 1.5rem;      /* 24px */
        --ux-font-size-3xl: 1.875rem;    /* 30px */
        --ux-font-size-4xl: 2.25rem;     /* 36px */
        
        --ux-font-weight-light: 300;
        --ux-font-weight-normal: 400;
        --ux-font-weight-medium: 500;
        --ux-font-weight-semibold: 600;
        --ux-font-weight-bold: 700;
        
        --ux-line-height-tight: 1.2;
        --ux-line-height-normal: 1.5;
        --ux-line-height-relaxed: 1.75;
        --ux-line-height-loose: 2;
        
        /**
         * BORDER RADIUS
         */
        --ux-radius-none: 0;
        --ux-radius-xs: 2px;
        --ux-radius-sm: 4px;
        --ux-radius-md: 6px;
        --ux-radius-lg: 8px;
        --ux-radius-xl: 12px;
        --ux-radius-2xl: 16px;
        --ux-radius-full: 999px;
        
        /**
         * SHADOWS
         */
        --ux-shadow-xs: 0 1px 2px 0 rgba(0, 0, 0, 0.05);
        --ux-shadow-sm: 0 1px 3px 0 rgba(0, 0, 0, 0.1), 
                        0 1px 2px 0 rgba(0, 0, 0, 0.06);
        --ux-shadow-md: 0 4px 6px -1px rgba(0, 0, 0, 0.1), 
                        0 2px 4px -1px rgba(0, 0, 0, 0.06);
        --ux-shadow-lg: 0 10px 15px -3px rgba(0, 0, 0, 0.1), 
                        0 4px 6px -2px rgba(0, 0, 0, 0.05);
        --ux-shadow-xl: 0 20px 25px -5px rgba(0, 0, 0, 0.1), 
                        0 10px 10px -5px rgba(0, 0, 0, 0.04);
        --ux-shadow-2xl: 0 25px 50px -12px rgba(0, 0, 0, 0.25);
        
        /**
         * TRANSITIONS & ANIMATIONS
         */
        --ux-duration-instant: 0ms;
        --ux-duration-fast: 150ms;
        --ux-duration-base: 300ms;
        --ux-duration-slow: 500ms;
        --ux-duration-slower: 700ms;
        
        --ux-easing-linear: linear;
        --ux-easing-in: cubic-bezier(0.4, 0, 1, 1);
        --ux-easing-out: cubic-bezier(0, 0, 0.2, 1);
        --ux-easing-in-out: cubic-bezier(0.4, 0, 0.2, 1);
        --ux-easing-bounce: cubic-bezier(0.68, -0.55, 0.265, 1.55);
        
        /**
         * Z-INDEX SCALE
         */
        --ux-z-hide: -1;
        --ux-z-auto: auto;
        --ux-z-base: 0;
        --ux-z-dropdown: 1000;
        --ux-z-sticky: 1020;
        --ux-z-fixed: 1030;
        --ux-z-modal-backdrop: 1040;
        --ux-z-modal: 1050;
        --ux-z-popover: 1060;
        --ux-z-tooltip: 1070;
        --ux-z-max: 999999;
    }
    
    /**
     * LIGHT THEME (Default - can be explicit)
     */
    @supports (color: color(display-p3 1 1 1)) {
        :root:where([data-theme="light"]) {
            --ux-surface-primary: #ffffff;
            --ux-surface-secondary: #f5f5f5;
            --ux-surface-tertiary: #eeeeee;
            --ux-on-surface: #1a1a1a;
            --ux-on-surface-variant: #666666;
            --ux-on-surface-subtle: #999999;
            --ux-border-color: rgba(0, 0, 0, 0.12);
        }
    }
    
    /**
     * DARK THEME
     * High contrast variant for dark mode
     */
    :root:where([data-theme="dark"]) {
        --ux-surface-primary: #1e1e1e;
        --ux-surface-secondary: #2d2d30;
        --ux-surface-tertiary: #3e3e42;
        --ux-surface-container: #252526;
        --ux-surface-container-high: #353537;
        
        --ux-on-surface: #e0e0e0;
        --ux-on-surface-variant: #b0b0b0;
        --ux-on-surface-subtle: #808080;
        
        --ux-border-color: rgba(255, 255, 255, 0.12);
        --ux-border-color-variant: rgba(255, 255, 255, 0.08);
        --ux-outline: rgba(255, 255, 255, 0.15);
        --ux-outline-variant: rgba(255, 255, 255, 0.1);
    }
    
    /**
     * HIGH CONTRAST MODE
     * For accessibility
     */
    @media (prefers-contrast: more) {
        :root {
            --ux-on-surface: #000000;
            --ux-surface-primary: #ffffff;
            --ux-border-color: #000000;
        }
        
        :root:where([data-theme="dark"]) {
            --ux-on-surface: #ffffff;
            --ux-surface-primary: #000000;
            --ux-border-color: #ffffff;
        }
    }
    
    /**
     * REDUCED MOTION MODE
     * For users who prefer reduced motion
     */
    @media (prefers-reduced-motion: reduce) {
        :root {
            --ux-duration-instant: 0ms;
            --ux-duration-fast: 0ms;
            --ux-duration-base: 0ms;
            --ux-duration-slow: 0ms;
            --ux-duration-slower: 0ms;
        }
    }
}
```

### Integration into lib/index.scss

Update: `modules/projects/veela.css/src/scss/lib/index.scss`

```scss
/**
 * Veela Library Index
 * 
 * Exports all SCSS utilities, mixins, and variables
 * for use in application code.
 * 
 * Note: Library files are NOT wrapped in @layer
 * (layers are applied by consuming code)
 */

@forward "./custom-properties";
@forward "./basic/index";
@forward "./core/index";
@forward "./advanced/index";
@forward "./beercss/index";
```

---

## Step 1.2: Update lib/basic/index.scss

### File: `modules/projects/veela.css/src/scss/lib/basic/index.scss`

```scss
/**
 * Basic Library Index
 * 
 * Configuration, tokens, mixins, and properties
 * for basic CSS framework
 */

@forward "./config";
@forward "./icons";
@forward "./mixins";
@forward "./props";
@forward "./tokens";
@forward "./typed-properties";
```

No changes to the actual utility files, just ensure proper forwarding.

---

## Step 1.3: Create Runtime Layer Manager

### File: `modules/projects/veela.css/src/ts/runtime-layers.ts`

```typescript
/**
 * Runtime Layer Sequence Manager
 * 
 * Dynamically manages CSS @layer declarations and loading order.
 * Ensures consistent cascade across all veela variants.
 * 
 * Usage:
 *   import { RuntimeLayerManager } from '@fest/veela';
 *   RuntimeLayerManager.initializeLayers();
 */

export interface LayerConfig {
    /**
     * Custom layer ordering
     * If not provided, uses default LAYER_ORDER
     */
    layers?: string[];
    
    /**
     * Whether to prepend to document head
     * @default true
     */
    prepend?: boolean;
    
    /**
     * Debug mode - logs layer info to console
     * @default false
     */    
    debug?: boolean;
}

/**
 * Comprehensive cascade layer ordering for veela variants
 * 
 * Ordering principle:
 * 1. Browser defaults (reset)
 * 2. Design tokens (custom properties)
 * 3. Foundation (typography, forms)
 * 4. Layout primitives (grid, flex, positioning)
 * 5. Components (buttons, inputs, containers)
 * 6. Shell-specific (app layout)
 * 7. View-specific (page/section layout)
 * 8. Utilities (atomic classes)
 * 9. Theme (light/dark variants)
 * 10. Emergency (patches, fixes)
 */
const DEFAULT_LAYER_ORDER = [
    'ux-system.reset',
    'ux-system.fonts',
    'ux-system.root',
    
    'ux-tokens.custom-properties',
    'ux-tokens.design-system',
    'ux-tokens.material-colors',
    
    'ux-base.typography',
    'ux-base.forms',
    'ux-base.tables',
    'ux-base.lists',
    
    'ux-layout.normalize',
    'ux-layout.grid',
    'ux-layout.flexbox',
    'ux-layout.positioning',
    'ux-layout.sizing',
    
    'ux-components.core',
    'ux-components.buttons',
    'ux-components.inputs',
    'ux-components.containers',
    'ux-components.navigation',
    'ux-components.feedback',
    
    'ux-shell.raw',
    'ux-shell.basic',
    'ux-shell.faint',
    
    'ux-views.default',
    'ux-views.workcenter',
    'ux-views.editor',
    'ux-views.viewer',
    
    'ux-utilities.spacing',
    'ux-utilities.typography',
    'ux-utilities.visibility',
    'ux-utilities.interactions',
    'ux-utilities.display',
    'ux-utilities.layout',
    
    'ux-theme.light',
    'ux-theme.dark',
    'ux-theme.high-contrast',
    
    'ux-overrides.fixes',
    'ux-overrides.patches',
] as const;

export type LayerName = typeof DEFAULT_LAYER_ORDER[number];

export class RuntimeLayerManager {
    private static isInitialized = false;
    private static layerOrder: readonly string[] = DEFAULT_LAYER_ORDER;
    private static styleElement: HTMLStyleElement | null = null;

    /**
     * Initialize CSS layer ordering
     */
    static initializeLayers(config?: LayerConfig): void {
        if (this.isInitialized && !config?.debug) return;
        
        this.layerOrder = config?.layers || DEFAULT_LAYER_ORDER;
        
        if (config?.debug) {
            console.log('[RuntimeLayerManager] Initializing layers:', this.layerOrder);
        }
        
        this.createLayerDeclaration();
        this.isInitialized = true;
    }

    /**
     * Create and inject @layer declaration into document
     */
    private static createLayerDeclaration(): void {
        const style = document.createElement('style');
        style.setAttribute('data-veela-layers', 'true');
        style.type = 'text/css';
        style.textContent = this.generateLayerCSS();
        
        const target = document.head;
        if (this.styleElement?.parentNode === target) {
            target.replaceChild(style, this.styleElement);
        } else {
            target.insertBefore(style, target.firstChild);
        }
        
        this.styleElement = style;
    }

    /**
     * Generate CSS @layer declaration
     */
    private static generateLayerCSS(): string {
        return `@layer ${this.layerOrder.join(', ')};`;
    }

    /**
     * Get the current layer ordering
     */
    static getLayers(): readonly string[] {
        return this.layerOrder;
    }

    /**
     * Check if a specific layer is defined
     */
    static hasLayer(layerName: string): boolean {
        return this.layerOrder.includes(layerName);
    }

    /**
     * Get the index of a layer in the ordering
     * Returns -1 if not found
     */
    static getLayerIndex(layerName: string): number {
        return this.layerOrder.indexOf(layerName as LayerName);
    }

    /**
     * Get layers between two layer names (inclusive)
     */
    static getLayerRange(startLayer: string, endLayer: string): string[] {
        const start = this.getLayerIndex(startLayer);
        const end = this.getLayerIndex(endLayer);
        
        if (start === -1 || end === -1) {
            console.warn('[RuntimeLayerManager] Invalid layer range:', 
                        { startLayer, endLayer });
            return [];
        }
        
        const minIndex = Math.min(start, end);
        const maxIndex = Math.max(start, end);
        
        return Array.from(this.layerOrder.slice(minIndex, maxIndex + 1));
    }

    /**
     * Reset to default layer ordering
     */
    static reset(debug?: boolean): void {
        this.layerOrder = DEFAULT_LAYER_ORDER;
        this.createLayerDeclaration();
        
        if (debug) {
            console.log('[RuntimeLayerManager] Reset to default layers');
        }
    }

    /**
     * Debug helper - list all layers with their index
     */
    static debug(): void {
        console.group('[RuntimeLayerManager] Layer Ordering');
        this.layerOrder.forEach((layer, index) => {
            console.log(`${index.toString().padStart(3)}: ${layer}`);
        });
        console.groupEnd();
    }
}

// Auto-initialize on module load in browser environment
if (typeof window !== 'undefined' && typeof document !== 'undefined') {
    // Defer initialization to allow for custom config
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', () => {
            RuntimeLayerManager.initializeLayers();
        }, { once: true });
    } else {
        RuntimeLayerManager.initializeLayers();
    }
}
```

---

## Step 1.4: Update Runtime Module Imports

### File: `modules/projects/veela.css/src/scss/runtime/index.scss`

```scss
/**
 * Veela Runtime Entry Point
 * 
 * Loads runtime styles for specific variant (core, basic, advanced, beercss)
 * Layer declarations are handled by RuntimeLayerManager (TS) or parent context
 */

@use "./core/index" as core;
@use "./basic/index" as basic;
@use "./advanced/index" as advanced;
@use "./beercss/index" as beercss;

// NOTE: Do NOT declare @layer here - let consuming code manage layer order
// Each variant (core, basic, advanced, beercss) is imported dynamically
```

### Update runtime/core/index.scss Example

**File:** `modules/projects/veela.css/src/scss/runtime/core/index.scss`

```scss
/**
 * Veela Core Runtime Styles
 * 
 * Wraps all core styles in their designated layers
 */

@use "./layout/core-layout" as core-layout;
@use "./layout/gridbox" as gridbox;
@use "./layout/normalize" as normalize;
@use "./layout/orientbox" as orientbox;
@use "./layout/shared" as shared;
@use "./layout/states" as states;
@use "./misc/orientation-functions" as orientation-fns;
@use "./misc/properties" as properties;
@use "./misc/wavy-runtime" as wavy;

// All styles are wrapped in appropriate @layer contexts
```

Each runtime file should be wrapped:

```scss
/**
 * Core Layout Styles
 */
@layer ux-layout.grid {
    /* Existing styles from _core-layout.scss */
}

@layer ux-layout.flexbox {
    /* Additional layout utilities */
}
```

---

## Step 1.5: Update Entry Point (index.ts)

### File: `modules/projects/veela.css/src/ts/index.ts`

```typescript
/**
 * Veela CSS Main Export
 * 
 * Provides access to:
 * - Design tokens (CSS variables)
 * - SCSS utilities (mixins, functions)
 * - Runtime layer management
 * - Variant loaders
 */

export { RuntimeLayerManager, type LayerConfig, type LayerName } 
    from './runtime-layers';

export { loadVeelaVariant, getActiveVariant } 
    from './variant-loader';

export { fontRegistry, registerCustomFont } 
    from './font-registry';

// Re-export types
export type { VeelaConfig } from './engine/Config';

// Initialize on import
import { RuntimeLayerManager } from './runtime-layers';

if (typeof window !== 'undefined') {
    RuntimeLayerManager.initializeLayers();
}
```

---

## Step 1.6: Update scss/runtime/_layers.scss

### File: `modules/projects/veela.css/src/scss/runtime/_layers.scss`

This file now serves as documentation and backup reference:

```scss
/**
 * Veela CSS Runtime Layer Declaration Reference
 * 
 * This defines the layer ordering for runtime styles.
 * 
 * PRIMARY SOURCE: RuntimeLayerManager in TypeScript
 * This file serves as documentation and CSS-only fallback.
 * 
 * Load order (enforced by RuntimeLayerManager):
 * 1. System resets and fonts
 * 2. Custom properties and design tokens
 * 3. Base typography, forms, tables
 * 4. Layout primitives
 * 5. Components
 * 6. Shell-specific
 * 7. View-specific
 * 8. Utilities
 * 9. Theme variants
 * 10. Emergency fixes
 */

/* ===========================================================================
   For CSS-only contexts (no TypeScript):
   Uncomment the following @layer declaration
   =========================================================================== */

/*
@layer
    ux-system.reset,
    ux-system.fonts,
    ux-system.root,
    ux-tokens.custom-properties,
    ux-tokens.design-system,
    ux-tokens.material-colors,
    ux-base.typography,
    ux-base.forms,
    ux-base.tables,
    ux-base.lists,
    ux-layout.normalize,
    ux-layout.grid,
    ux-layout.flexbox,
    ux-layout.positioning,
    ux-layout.sizing,
    ux-components.core,
    ux-components.buttons,
    ux-components.inputs,
    ux-components.containers,
    ux-components.navigation,
    ux-components.feedback,
    ux-shell.raw,
    ux-shell.basic,
    ux-shell.faint,
    ux-views.default,
    ux-views.workcenter,
    ux-views.editor,
    ux-views.viewer,
    ux-utilities.spacing,
    ux-utilities.typography,
    ux-utilities.visibility,
    ux-utilities.interactions,
    ux-utilities.display,
    ux-utilities.layout,
    ux-theme.light,
    ux-theme.dark,
    ux-theme.high-contrast,
    ux-overrides.fixes,
    ux-overrides.patches;
*/
```

---

## Validation Checklist for Phase 1

### Code Quality
- [ ] All @import statements converted to @use
- [ ] All runtime files wrapped with explicit @layer
- [ ] Custom properties module compiles without errors
- [ ] No circular dependencies
- [ ] StyleLint passes with 0 errors

### Functionality
- [ ] veela-core variant loads correctly
- [ ] veela-basic variant loads correctly
- [ ] veela-advanced variant loads correctly
- [ ] veela-beercss variant loads correctly
- [ ] RuntimeLayerManager initializes automatically
- [ ] CustomProperties applied to :root

### Compatibility
- [ ] Works in Chrome 99+
- [ ] Works in Firefox 97+
- [ ] Works in Safari 15.4+
- [ ] Works in Edge 99+
- [ ] TypeScript compiles without errors
- [ ] No console warnings

### Performance
- [ ] Layer initialization < 50ms
- [ ] CSS output size maintains or reduces
- [ ] No repaints/reflows on layer init
- [ ] Memory usage stable

---

## Files Modified/Created in Phase 1

| File | Action | Status |
|------|--------|--------|
| `src/scss/lib/_custom-properties.scss` | CREATE | ⏳ Pending |
| `src/scss/lib/index.scss` | UPDATE | ⏳ Pending |
| `src/scss/runtime/_layers.scss` | UPDATE | ⏳ Pending |
| `src/scss/runtime/index.scss` | UPDATE | ⏳ Pending |
| `src/ts/runtime-layers.ts` | CREATE | ⏳ Pending |
| `src/ts/index.ts` | UPDATE | ⏳ Pending |
| `src/scss/runtime/core/index.scss` | UPDATE | ⏳ Pending |
| `src/scss/runtime/basic/index.scss` | UPDATE | ⏳ Pending |
| `src/scss/runtime/advanced/index.scss` | UPDATE | ⏳ Pending |
| `src/scss/runtime/beercss/index.scss` | UPDATE | ⏳ Pending |

---

## Next Phase

→ [Phase 2: fl.ui Refactoring](./PHASE_2_FL_UI_REFACTORING.md)
