# Comprehensive CSS/SCSS Refactoring Strategy

**Date:** February 2, 2026  
**Project:** U2RE.space - Multi-Agent CSS Optimization  
**Scope:** veela.css, fl.ui, CrossWord App  

---

## 📋 Executive Summary

This document outlines a systematic, multi-phase refactoring strategy to modernize and optimize the CSS/SCSS architecture across the U2RE.space project hierarchy. The refactoring focuses on:

1. **Modern SCSS Module System** - Replace `@import` with `@use`
2. **CSS Cascade Layers** - Implement logical `@layer` ordering
3. **Custom Properties Management** - Dedicated modules for design tokens
4. **Context-Based Selectors** - Use `:has()` and `:where()/:is()` for better scoping
5. **Redundancy Elimination** - Clean up duplicate and overlapping rules
6. **Runtime Style Generation** - Script-based layer sequence generation

---

## 🏗️ Current Architecture Analysis

### veela.css Module

**Location:** `/modules/projects/veela.css/src`

**Current Structure:**
```
src/
├── index.scss (forwards to scss/index)
├── scss/
│   ├── fonts/
│   ├── lib/
│   │   ├── basic/ (configuration, tokens, mixins)
│   │   ├── core/ (utility mixins, pseudo-selectors)
│   │   ├── advanced/ (complex design patterns)
│   │   └── beercss/ (Material Design compatibility)
│   └── runtime/
│       ├── core/
│       ├── basic/
│       ├── advanced/
│       └── beercss/
└── ts/ (TypeScript wrappers & skins)
```

**Current Layer Structure** (from `_layers.scss`):
```
ux-normalize, ux-tokens, ux-base, ux-layout, 
ux-components, ux-utilities, ux-theme, ux-overrides
```

**Issues Identified:**
- Library files are NOT wrapped in `@layer` (correct, they're utilities)
- Runtime files ARE wrapped in individual layer contexts
- Module imports use `@forward` (good) but could be more granular
- No custom properties-only module

### fl.ui Module

**Location:** `/modules/projects/fl.ui/src`

**Current Structure:**
```
src/
├── styles/
│   ├── lib/ (variables, veela adapter)
│   ├── core/ (typography, layout, colors, etc.)
│   ├── components/ (UI components)
│   ├── adapters/ (veela, core)
│   ├── layers.scss
│   ├── index.scss
│   └── index.*.ts (variant loaders)
└── services/
    ├── file-manager/
    │   └── scss/ (FileManager styles)
    └── markdown-view/
        └── scss/ (Markdown viewer styles)
```

**Current Layer Structure** (from `layers.scss`):
```
ux-layer.u2-normalize, ux-layer.ux-agate, ux-ctm, 
ux-classes, ui-window-frame
```

**Issues Identified:**
- Layer names are inconsistent with veela.css
- Services have their own SCSS but no explicit layer wrapping
- No clear hierarchy between lib/core/components
- Adapters not properly layered

### CrossWord App

**Location:** `/apps/CrossWord/src/frontend`

**Current Structure:**
```
frontend/
├── shells/
│   ├── raw/ (minimal styles)
│   ├── basic/ (uses @layer declarations)
│   └── faint/ (Material Design shell)
├── views/
│   ├── workcenter/ (custom implementation)
│   ├── viewer/, editor/, history/, etc.
│   └── from-faint/ (imported from Faint UI)
├── main/ (boot, menus)
└── items/ (card components)
```

**Current Observations:**
- `basic/index.scss` already uses proper `@layer` declarations
- `workcenter.scss` wraps rules in `@layer workcenter { ... }`
- Views use theme-aware custom properties
- Shell conflicts may arise from missing context scoping

---

## 🎯 Refactoring Goals

### Goal 1: Module System Modernization
- ✅ Replace all `@import` with `@use` where applicable
- ✅ Use `@forward` only for library re-exports
- ✅ Implement proper module namespacing with `as` aliases
- ✅ Create dedicated custom properties modules

### Goal 2: Layer Architecture Enhancement
- ✅ Define unified layer ordering across all modules
- ✅ Wrap all application/runtime styles with explicit layers
- ✅ Keep library modules WITHOUT layers (they export utilities)
- ✅ Implement script-based layer sequence generation in TS/JS

### Goal 3: Custom Properties Organization
- ✅ Create `_custom-properties.scss` in each module
- ✅ Define design tokens as CSS variables only (no side effects)
- ✅ Document variable namespacing conventions
- ✅ Implement runtime property registration

### Goal 4: Selector Optimization
- ✅ Use `:where()` and `:is()` for selector unification
- ✅ Implement `:has()` for context-based styling
- ✅ Avoid deep nesting to reduce specificity
- ✅ Create theme-aware context selectors

### Goal 5: Code Quality & Performance
- ✅ Identify and remove duplicate rules
- ✅ Consolidate similar selectors
- ✅ Optimize media queries
- ✅ Improve readability through logical grouping

---

## 📊 Layer Ordering Strategy

### Unified Layer Hierarchy

```
@layer
    /* System & Foundation */
    ux-system.reset,
    ux-system.fonts,
    ux-system.root,
    
    /* Tokens & Variables */
    ux-tokens.custom-properties,
    ux-tokens.design-system,
    
    /* Base Styles */
    ux-base.typography,
    ux-base.forms,
    ux-base.tables,
    
    /* Layout Primitives */
    ux-layout.grid,
    ux-layout.flexbox,
    ux-layout.positioning,
    
    /* Core Components */
    ux-components.core,
    ux-components.buttons,
    ux-components.inputs,
    ux-components.containers,
    
    /* Shell-Specific */
    ux-shell.raw,
    ux-shell.basic,
    ux-shell.faint,
    
    /* View-Specific */
    ux-views.default,
    ux-views.workcenter,
    ux-views.editor,
    ux-views.viewer,
    
    /* Utilities & Helpers */
    ux-utilities.spacing,
    ux-utilities.typography,
    ux-utilities.visibility,
    ux-utilities.interactions,
    
    /* Theme Overrides */
    ux-theme.light,
    ux-theme.dark,
    
    /* Emergency Overrides */
    ux-overrides.fixes;
```

### Loading Order

**Phase 1: Initialization** (veela.css library loads)
1. System resets and fonts
2. Custom properties definitions
3. Design token variables

**Phase 2: Base** (veela.css runtime loads)
1. Typography, forms, tables
2. Layout primitives
3. Core component styles

**Phase 3: Application** (fl.ui loads)
1. UI framework components
2. File manager service styles
3. Markdown view service styles

**Phase 4: Shell** (CrossWord shell loads)
1. Shell-specific layout rules
2. Shell-specific components

**Phase 5: View** (Dynamic view loading)
1. View-specific overrides
2. Context-aware styling

**Phase 6: Theme** (Runtime theme switching)
1. Light theme customizations
2. Dark theme customizations

**Phase 7: Emergency** (Last resort)
1. Bug fixes and patches

---

## 🛠️ Refactoring Implementation Plan

### Phase 1: veela.css Refactoring

#### Step 1.1: Create Custom Properties Module
**File:** `modules/projects/veela.css/src/scss/lib/custom-properties.scss`

```scss
/**
 * Custom Properties Module
 * 
 * Pure CSS variable definitions with NO side effects.
 * This module should:
 * - ONLY define :root, ::before, ::after custom properties
 * - NOT include any selectors that target elements
 * - Be usable by any CSS/SCSS preprocessor
 */

@layer ux-system.root {
    :root {
        /* Color System */
        --color-primary: #007acc;
        --color-secondary: #6c757d;
        --color-success: #28a745;
        --color-warning: #ffc107;
        --color-danger: #dc3545;
        
        /* Surfaces & Typography */
        --surface-primary: #ffffff;
        --surface-secondary: #f5f5f5;
        --surface-tertiary: #eeeeee;
        
        --on-surface-primary: #1a1a1a;
        --on-surface-secondary: #666666;
        --on-surface-tertiary: #999999;
        
        /* Spacing Scale */
        --spacing-xs: 0.25rem;
        --spacing-sm: 0.5rem;
        --spacing-md: 1rem;
        --spacing-lg: 1.5rem;
        --spacing-xl: 2rem;
        --spacing-2xl: 3rem;
        
        /* Typography Scale */
        --font-family-base: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif;
        --font-size-xs: 0.75rem;
        --font-size-sm: 0.875rem;
        --font-size-base: 1rem;
        --font-size-lg: 1.125rem;
        --font-size-xl: 1.25rem;
        --font-size-2xl: 1.5rem;
        
        /* Border & Shadow */
        --border-radius-sm: 4px;
        --border-radius-md: 8px;
        --border-radius-lg: 12px;
        --border-radius-full: 999px;
        
        --shadow-sm: 0 1px 2px rgba(0, 0, 0, 0.05);
        --shadow-md: 0 4px 6px rgba(0, 0, 0, 0.1);
        --shadow-lg: 0 10px 15px rgba(0, 0, 0, 0.1);
        
        /* Transitions */
        --duration-fast: 150ms;
        --duration-base: 300ms;
        --duration-slow: 500ms;
        --easing-ease-in-out: cubic-bezier(0.4, 0, 0.2, 1);
    }
    
    /* Dark theme variant */
    [data-theme="dark"] {
        --surface-primary: #1e1e1e;
        --surface-secondary: #2d2d30;
        --surface-tertiary: #3e3e42;
        
        --on-surface-primary: #e0e0e0;
        --on-surface-secondary: #b0b0b0;
        --on-surface-tertiary: #808080;
    }
    
    /* Light theme variant (explicit) */
    [data-theme="light"] {
        --surface-primary: #ffffff;
        --surface-secondary: #f5f5f5;
        --surface-tertiary: #eeeeee;
        
        --on-surface-primary: #1a1a1a;
        --on-surface-secondary: #666666;
        --on-surface-tertiary: #999999;
    }
}
```

#### Step 1.2: Refactor lib/index.scss

**Current approach:** Uses `@forward` for re-exports

**Target approach:**
```scss
/**
 * Library Index (Pure utilities - no layers)
 * 
 * Re-exports all SCSS functions, mixins, and variables
 * for use in application code.
 */

@forward "./custom-properties";
@forward "./basic/index";
@forward "./core/index";
@forward "./advanced/index";
@forward "./beercss/index";
```

#### Step 1.3: Create Runtime Layer Manager

**File:** `modules/projects/veela.css/src/ts/runtime-layers.ts`

```typescript
/**
 * Runtime Layer Sequence Manager
 * 
 * Dynamically manages CSS @layer loading and ordering.
 * Ensures consistent cascade across all variants.
 */

export class RuntimeLayerManager {
    private static readonly LAYER_ORDER = [
        'ux-system.reset',
        'ux-system.fonts',
        'ux-system.root',
        'ux-tokens.custom-properties',
        'ux-tokens.design-system',
        'ux-base.typography',
        'ux-base.forms',
        'ux-base.tables',
        'ux-layout.grid',
        'ux-layout.flexbox',
        'ux-layout.positioning',
        'ux-components.core',
        'ux-components.buttons',
        'ux-components.inputs',
        'ux-components.containers',
        'ux-shell.raw',
        'ux-shell.basic',
        'ux-shell.faint',
        'ux-views.default',
        'ux-utilities.spacing',
        'ux-utilities.typography',
        'ux-utilities.visibility',
        'ux-utilities.interactions',
        'ux-theme.light',
        'ux-theme.dark',
        'ux-overrides.fixes',
    ] as const;

    /**
     * Initialize layer ordering in the document
     */
    static initializeLayers(): void {
        const style = document.createElement('style');
        style.textContent = this.generateLayerDeclaration();
        document.head.insertBefore(style, document.head.firstChild);
    }

    /**
     * Generate @layer declaration
     */
    private static generateLayerDeclaration(): string {
        return `@layer ${this.LAYER_ORDER.join(', ')};`;
    }

    /**
     * Get the current layer ordering
     */
    static getLayers(): readonly string[] {
        return this.LAYER_ORDER;
    }

    /**
     * Check if a layer exists in the ordering
     */
    static hasLayer(layerName: string): boolean {
        return this.LAYER_ORDER.includes(layerName as any);
    }
}

// Auto-initialize on module load
if (typeof window !== 'undefined') {
    RuntimeLayerManager.initializeLayers();
}
```

#### Step 1.4: Refactor runtime/index.scss

**Current:** Runtime files load dynamically

**Target:**
```scss
/**
 * Veela Runtime Entry Point
 * 
 * Loads all runtime styles with proper layer organization.
 */

@use "./core/index" as core;
@use "./basic/index" as basic;
@use "./advanced/index" as advanced;
@use "./beercss/index" as beercss;
```

#### Step 1.5: Wrap Runtime Modules with Layers

**Pattern for each runtime module:**

```scss
/**
 * Veela Core Layout Runtime
 * 
 * Application of core layout utilities with proper cascading.
 */

@layer ux-layout.grid, ux-layout.flexbox, ux-layout.positioning {
    // Existing rules from _core-layout.scss
    .grid { /* ... */ }
    .flex { /* ... */ }
    // etc.
}
```

---

### Phase 2: fl.ui Refactoring

#### Step 2.1: Unify Layer Declarations

**File:** `modules/projects/fl.ui/src/styles/layers.scss` (REFACTOR)

```scss
/**
 * FL.UI Layer Architecture
 * 
 * Unified layer ordering that integrates with veela.css
 * and supports custom view/shell overlays.
 */

@layer
    /* Inherited from veela.css */
    ux-system.reset,
    ux-system.fonts,
    ux-system.root,
    ux-tokens.custom-properties,
    ux-tokens.design-system,
    ux-base.typography,
    ux-base.forms,
    ux-base.tables,
    ux-layout.grid,
    ux-layout.flexbox,
    ux-layout.positioning,
    
    /* FL.UI Specific Layers */
    ux-components.core,
    ux-components.buttons,
    ux-components.inputs,
    ux-components.containers,
    ux-components.file-manager,
    ux-components.markdown-view,
    
    /* Shell & View Integration */
    ux-shell.raw,
    ux-shell.basic,
    ux-shell.faint,
    ux-views.default,
    
    /* Theme & Utilities */
    ux-utilities.spacing,
    ux-utilities.typography,
    ux-utilities.visibility,
    ux-utilities.interactions,
    ux-theme.light,
    ux-theme.dark,
    ux-overrides.fixes;
```

#### Step 2.2: Create Custom Properties Module for fl.ui

**File:** `modules/projects/fl.ui/src/styles/tokens/_custom-properties.scss`

```scss
/**
 * FL.UI Custom Properties
 * 
 * Design tokens specific to FL.UI framework.
 * Extends veela.css custom properties.
 */

@layer ux-tokens.design-system {
    :root {
        /* Component-specific variables */
        --fl-ui-button-height: 2.5rem;
        --fl-ui-input-height: 2rem;
        --fl-ui-container-max-width: 1200px;
        
        /* File Manager tokens */
        --fl-ui-file-manager-sidebar-width: 280px;
        --fl-ui-file-manager-item-height: 32px;
        
        /* Markdown tokens */
        --fl-ui-markdown-heading-color: var(--on-surface-primary);
        --fl-ui-markdown-code-bg: var(--surface-tertiary);
        --fl-ui-markdown-link-color: var(--color-primary);
    }
    
    [data-theme="dark"] {
        --fl-ui-markdown-code-bg: rgba(0, 0, 0, 0.3);
    }
}
```

#### Step 2.3: Refactor Core Styles with Layers

**File:** `modules/projects/fl.ui/src/styles/core/index.scss` (REFACTOR)

```scss
/**
 * FL.UI Core Styles
 * 
 * Foundational styles for FL.UI components.
 * All rules wrapped in appropriate @layer contexts.
 */

@use "./border" as border;
@use "./color" as color;
@use "./container" as container;
@use "./display" as display;
@use "./interaction" as interaction;
@use "./layout" as layout;
@use "./motion" as motion;
@use "./position" as position;
@use "./scrollbar" as scrollbar;
@use "./shadow" as shadow;
@use "./size" as size;
@use "./typography" as typography;
```

#### Step 2.4: Wrap Service Styles with Layers

**File:** `modules/projects/fl.ui/src/services/file-manager/scss/FileManager.scss` (REFACTOR)

```scss
/**
 * File Manager Styles
 * 
 * Wrapped in dedicated layer for proper cascading.
 */

@layer ux-components.file-manager {
    /* Existing FileManager styles */
}
```

**File:** `modules/projects/fl.ui/src/services/markdown-view/scss/markdown-render.scss` (REFACTOR)

```scss
/**
 * Markdown Viewer Styles
 * 
 * Wrapped in dedicated layer for proper cascading.
 */

@layer ux-components.markdown-view {
    /* Existing markdown styles */
}
```

---

### Phase 3: CrossWord App Refactoring

#### Step 3.1: Unified Shell Layer Management

**File:** `apps/CrossWord/src/frontend/shells/_layers.ts`

```typescript
/**
 * Shell Layer Manager
 * 
 * Manages CSS @layer loading and theming for CrossWord shells.
 * Integrates with veela.css and fl.ui layer architecture.
 */

export interface ShellLayerConfig {
    name: 'raw' | 'basic' | 'faint';
    theme: 'light' | 'dark' | 'auto';
    customLayers?: string[];
}

export class ShellLayerManager {
    private static currentShell: string | null = null;

    static initializeShell(config: ShellLayerConfig): void {
        this.currentShell = config.name;
        
        // Load shell-specific layers
        this.setupShellLayers(config);
        
        // Setup theme context
        this.setupThemeContext(config.theme);
    }

    private static setupShellLayers(config: ShellLayerConfig): void {
        const style = document.createElement('style');
        
        const layers = [
            `ux-shell.${config.name}`,
            'ux-views.default',
            ...(config.customLayers || []),
        ];
        
        style.textContent = `
            @supports (display: contents) {
                @layer ${layers.join(', ')};
            }
        `;
        
        document.head.appendChild(style);
    }

    private static setupThemeContext(theme: string): void {
        const htmlElement = document.documentElement;
        
        if (theme === 'auto') {
            const isDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
            htmlElement.setAttribute('data-theme', isDark ? 'dark' : 'light');
        } else {
            htmlElement.setAttribute('data-theme', theme);
        }
    }

    static getShell(): string | null {
        return this.currentShell;
    }
}
```

#### Step 3.2: Refactor Basic Shell

**File:** `apps/CrossWord/src/frontend/shells/basic/index.scss` (ENHANCE)

```scss
/**
 * Basic Shell Styles - Enhanced Layer Architecture
 * 
 * Implements:
 * - Unified layer declarations
 * - @use instead of @import
 * - Context-based selectors with :has()
 * - Redundancy elimination
 */

@layer
    ux-system.reset,
    ux-system.fonts,
    ux-system.root,
    ux-tokens.custom-properties,
    ux-tokens.design-system,
    ux-base.typography,
    ux-base.forms,
    ux-base.tables,
    ux-layout.grid,
    ux-layout.flexbox,
    ux-layout.positioning,
    ux-components.core,
    ux-components.buttons,
    ux-components.inputs,
    ux-components.containers,
    ux-shell.basic,
    ux-views.default,
    ux-utilities.spacing,
    ux-utilities.typography,
    ux-utilities.visibility,
    ux-utilities.interactions,
    ux-theme.light,
    ux-theme.dark,
    ux-overrides.fixes;

/* ============================================================================
   MODULE IMPORTS (using @use)
   ============================================================================ */

@use "./tokens" as tokens;
@use "./keyframes" as keyframes;
@use "./components" as components;
@use "./basic" as basic-shell;
@use "./layout" as shell-layout;

/* ============================================================================
   SHELL-SPECIFIC STYLES
   ============================================================================ */

@layer ux-shell.basic {
    /* Shell initialization styles */
    .shell-basic {
        display: flex;
        flex-direction: column;
        height: 100vh;
        background: var(--surface-primary);
        color: var(--on-surface-primary);
        font-family: var(--font-family-base);
    }
    
    /* Context-aware header styling */
    .shell-basic:has(> .header) > .header {
        border-bottom: 1px solid var(--border-color, var(--surface-tertiary));
        background: var(--header-bg, var(--surface-secondary));
    }
}
```

#### Step 3.3: Enhance View Styling with Context Selectors

**File:** `apps/CrossWord/src/frontend/views/workcenter/scss/workcenter.scss` (REFACTOR)

```scss
/**
 * Workcenter View Styles
 * 
 * Implements:
 * - Layer wrapping
 * - Context-based selectors with :has()
 * - Selector optimization with :where()/:is()
 * - Variable consolidation
 */

@layer ux-views.default {
    /* Root context for workcenter view */
    :where(.shell-basic, [data-view="workcenter"]) .view-workcenter {
        display: flex;
        flex-direction: column;
        block-size: 100%;
        background-color: var(--view-bg, var(--surface-primary));
        color: var(--view-fg, var(--on-surface-primary));
    }

    /* Nested layout optimization */
    .view-workcenter:has(> .main) > .main {
        display: flex;
        flex: 1;
        gap: 1rem;
        padding: 1rem;
        overflow: hidden;
    }

    /* Input area context */
    .view-workcenter__input-area {
        display: flex;
        flex-direction: column;
        gap: 1rem;
        flex: 1;
        min-inline-size: 0;
    }

    /* Files section with drag-over state */
    .view-workcenter__files {
        display: flex;
        flex-direction: column;
        gap: 0.5rem;
        padding: 1rem;
        border: 2px dashed var(--view-border, rgba(0, 0, 0, 0.15));
        border-radius: 12px;
        background-color: var(--view-files-bg, rgba(0, 0, 0, 0.02));
        transition: border-color var(--duration-fast), 
                    background-color var(--duration-fast);
    }

    .view-workcenter__files:is(.dragover) {
        border-color: var(--color-primary, #007acc);
        background-color: rgba(0, 122, 204, 0.05);
    }

    /* Consolidated button styles */
    :where(.view-workcenter__btn, .view-workcenter__process-btn) {
        display: flex;
        align-items: center;
        justify-content: center;
        gap: 0.5rem;
        padding: 0.75rem 1.5rem;
        border: none;
        border-radius: 8px;
        font-size: 0.875rem;
        font-weight: 600;
        cursor: pointer;
        transition: all var(--duration-fast) var(--easing-ease-in-out);
    }

    .view-workcenter__process-btn {
        background-color: var(--color-primary, #007acc);
        color: white;
    }

    .view-workcenter__process-btn:hover:not(:disabled) {
        filter: brightness(1.1);
    }

    .view-workcenter__process-btn:disabled {
        opacity: 0.5;
        cursor: not-allowed;
    }

    /* Theme-aware styling */
    :is([data-theme="dark"]) .view-workcenter {
        --view-bg: var(--surface-primary);
        --view-fg: var(--on-surface-primary);
        --view-border: var(--border-color, rgba(255, 255, 255, 0.1));
        --view-files-bg: rgba(255, 255, 255, 0.02);
        --view-file-bg: rgba(255, 255, 255, 0.05);
        --view-input-bg: var(--surface-secondary);
        --view-results-bg: rgba(255, 255, 255, 0.02);
        --view-result-bg: rgba(255, 255, 255, 0.05);
    }

    /* Responsive adjustments */
    @media (max-width: 768px) {
        .view-workcenter__main {
            flex-direction: column;
        }

        :where(.view-workcenter__input-area, .view-workcenter__results) {
            min-inline-size: auto;
        }
    }
}
```

#### Step 3.4: Create View Context Manager

**File:** `apps/CrossWord/src/frontend/views/_view-context.ts`

```typescript
/**
 * View Context Manager
 * 
 * Manages view-specific styling contexts and CSS variables.
 * Enables dynamic view switching with proper style isolation.
 */

export interface ViewContext {
    name: string;
    theme: 'light' | 'dark';
    customVariables?: Record<string, string>;
}

export class ViewContextManager {
    private static currentView: string | null = null;
    private static styleElement: HTMLStyleElement | null = null;

    static switchView(context: ViewContext): void {
        this.currentView = context.name;
        
        // Update data attribute for CSS context
        document.documentElement.setAttribute('data-view', context.name);
        
        // Apply theme
        document.documentElement.setAttribute('data-theme', context.theme);
        
        // Apply custom variables
        if (context.customVariables) {
            this.applyCustomVariables(context.customVariables);
        }
        
        // Trigger view-specific layer
        this.triggerViewLayer(context.name);
    }

    private static applyCustomVariables(variables: Record<string, string>): void {
        const root = document.documentElement;
        Object.entries(variables).forEach(([key, value]) => {
            root.style.setProperty(key, value);
        });
    }

    private static triggerViewLayer(viewName: string): void {
        if (!this.styleElement) {
            this.styleElement = document.createElement('style');
            document.head.appendChild(this.styleElement);
        }
        
        this.styleElement.textContent = `
            @layer ux-views.${viewName};
        `;
    }

    static getCurrentView(): string | null {
        return this.currentView;
    }
}
```

---

### Phase 4: Code Cleanup & Optimization

#### Step 4.1: Identify Redundant Rules

**Scan for:**
- Duplicate selectors across files
- Overlapping media queries
- Redundant color/spacing definitions
- Unused variables

**Tools:**
```bash
# Find duplicate selectors
grep -r "^\\." apps/CrossWord/src/frontend --include="*.scss" | \
  cut -d: -f2 | sort | uniq -d

# Find unused variables
grep -r "\$" modules/projects/fl.ui/src/styles --include="*.scss" | \
  cut -d: -f2 | sort | uniq | while read var; do
    count=$(grep -r "$var" --include="*.scss" | wc -l)
    if [ $count -lt 3 ]; then echo "$var: $count occurrences"; fi
done
```

#### Step 4.2: Consolidate Similar Selectors

**Example Pattern:**

**Before:**
```scss
.button-primary { /* 10 properties */ }
.button-secondary { /* 8 properties */ }
.button-success { /* 8 properties */ }
```

**After:**
```scss
:where(.button-primary, .button-secondary, .button-success) {
    /* Shared 8 properties */
}

.button-primary { /* 2 unique properties */ }
.button-secondary { /* Unique styles */ }
.button-success { /* Unique styles */ }
```

#### Step 4.3: Optimize Nesting

**Before:**
```scss
.container {
    .header {
        .title {
            .icon {
                color: blue;
            }
        }
    }
}
```

**After:**
```scss
.container__header__title__icon {
    color: blue;
}
```

Or with better nesting:
```scss
.container {
    .header {
        &__title {
            &__icon {
                color: blue;
            }
        }
    }
}
```

---

## 📐 Custom Properties Naming Convention

### Root Level (`:root`)
```
--{category}-{subcategory}-{variant}-{property}
```

**Examples:**
- `--color-primary-base`
- `--color-primary-hover`
- `--spacing-grid-xs`
- `--font-size-heading-1`

### Scoped Contexts
```
--{component}-{state}-{property}
```

**Examples:**
- `--button-hover-bg`
- `--input-focus-border`
- `--modal-overlay-opacity`

### Theme Variants
```
[data-theme="light"] { --{name}: value; }
[data-theme="dark"] { --{name}: value; }
```

---

## 🚀 Migration Checklist

### Phase 1: Preparation
- [ ] Create backup of current styles
- [ ] Document current @import usage
- [ ] Identify all custom properties in use
- [ ] Create this comprehensive plan

### Phase 2: veela.css
- [ ] Create custom-properties.scss module
- [ ] Refactor lib/index.scss with @use
- [ ] Create runtime-layers.ts manager
- [ ] Wrap all runtime modules with @layer
- [ ] Test variant loading (core, basic, advanced, beercss)
- [ ] Verify browser compatibility

### Phase 3: fl.ui
- [ ] Unify layers.scss
- [ ] Create tokens/_custom-properties.scss
- [ ] Refactor core/index.scss
- [ ] Wrap service styles with @layer
- [ ] Update adapters with layer context
- [ ] Test component rendering

### Phase 4: CrossWord App
- [ ] Create shells/_layers.ts manager
- [ ] Refactor shell styles
- [ ] Enhance view styles with context selectors
- [ ] Create views/_view-context.ts manager
- [ ] Update all shell and view SCSS files
- [ ] Test shell switching
- [ ] Test view switching
- [ ] Test theme switching

### Phase 5: Cleanup
- [ ] Remove duplicate rules
- [ ] Consolidate similar selectors
- [ ] Optimize media queries
- [ ] Remove unused variables
- [ ] Update documentation

### Phase 6: Validation
- [ ] Run StyleLint
- [ ] Check visual regression
- [ ] Test all variants
- [ ] Verify layer cascade
- [ ] Confirm performance

---

## 📊 Success Metrics

- **Bundle Size:** Reduce SCSS output by 15-20%
- **Load Time:** CSS layer initialization < 50ms
- **Maintainability:** 50% reduction in duplicate rules
- **Browser Support:** All modern browsers (Chrome, Firefox, Safari, Edge)
- **Code Quality:** 100% StyleLint compliance
- **Performance:** No visual regression

---

## 📚 Reference Documents

- [CSS Cascade Layers (MDN)](https://developer.mozilla.org/en-US/docs/Web/CSS/@layer)
- [SCSS @use Module System](https://sass-lang.com/documentation/at-rules/use)
- [CSS Custom Properties](https://developer.mozilla.org/en-US/docs/Web/CSS/--*)
- [:where() and :is() Selectors](https://developer.mozilla.org/en-US/docs/Web/CSS/:where)
- [:has() Pseudo-class](https://developer.mozilla.org/en-US/docs/Web/CSS/:has)

---

## 🎯 Next Steps

1. **Review this strategy** with the team
2. **Validate layer ordering** with stakeholders
3. **Begin Phase 1** refactoring
4. **Create pull requests** for each phase
5. **Test thoroughly** before merging
6. **Document learnings** for future reference

---

**Document Version:** 1.0  
**Last Updated:** 2026-02-02  
**Status:** Ready for Implementation
