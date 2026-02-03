# Phase 2: fl.ui Refactoring - Detailed Implementation Guide

**Status:** Implementation Template  
**Target Module:** `/modules/projects/fl.ui/src`  
**Objective:** Unify layer architecture, create custom properties module, refactor service styles  

---

## Overview

This phase restructures fl.ui to:
1. Create unified layer declarations
2. Define fl.ui-specific custom properties
3. Refactor core styles with @use and @layer
4. Wrap service styles (FileManager, Markdown) with proper layers
5. Integrate with veela.css layer architecture
6. Ensure no style conflicts between services

---

## Step 2.1: Create fl.ui Custom Properties Module

### File: `modules/projects/fl.ui/src/styles/tokens/_custom-properties.scss`

```scss
/**
 * FL.UI Custom Properties Module
 * 
 * Extends veela.css custom properties with FL.UI-specific design tokens.
 * Maintains compatibility with veela theme switching.
 * 
 * Naming convention: --fl-ui-{component}-{state}-{property}
 */

@layer ux-tokens.design-system {
    :root {
        /**
         * COMPONENT SIZING
         * Standard sizes for FL.UI components
         */
        --fl-ui-button-height: 2.5rem;
        --fl-ui-button-padding-x: 1rem;
        --fl-ui-button-padding-y: 0.625rem;
        
        --fl-ui-input-height: 2rem;
        --fl-ui-input-padding-x: 0.75rem;
        --fl-ui-input-padding-y: 0.5rem;
        
        --fl-ui-control-border-width: 1px;
        --fl-ui-control-border-color: var(--ux-border-color);
        --fl-ui-control-border-radius: var(--ux-radius-md);
        
        /**
         * FILE MANAGER COMPONENT
         */
        --fl-ui-file-manager-sidebar-width: 280px;
        --fl-ui-file-manager-item-height: 32px;
        --fl-ui-file-manager-item-padding: 0.5rem;
        --fl-ui-file-manager-icon-size: 1rem;
        --fl-ui-file-manager-hover-bg: rgba(0, 0, 0, 0.05);
        --fl-ui-file-manager-selected-bg: rgba(0, 122, 204, 0.1);
        --fl-ui-file-manager-selected-border: var(--ux-color-primary);
        
        /**
         * MARKDOWN VIEW COMPONENT
         */
        --fl-ui-markdown-heading-margin-top: 1.5rem;
        --fl-ui-markdown-heading-margin-bottom: 0.75rem;
        --fl-ui-markdown-heading-font-weight: var(--ux-font-weight-semibold);
        --fl-ui-markdown-heading-color: var(--ux-on-surface);
        
        --fl-ui-markdown-code-bg: var(--ux-surface-tertiary);
        --fl-ui-markdown-code-color: var(--ux-on-surface);
        --fl-ui-markdown-code-border: 1px solid var(--ux-border-color);
        --fl-ui-markdown-code-border-radius: var(--ux-radius-sm);
        --fl-ui-markdown-code-padding: 0.25rem 0.5rem;
        
        --fl-ui-markdown-code-block-bg: var(--ux-surface-tertiary);
        --fl-ui-markdown-code-block-padding: 1rem;
        --fl-ui-markdown-code-block-border-radius: var(--ux-radius-md);
        --fl-ui-markdown-code-block-overflow: auto;
        
        --fl-ui-markdown-link-color: var(--ux-color-primary);
        --fl-ui-markdown-link-hover-color: var(--ux-color-primary-dark);
        --fl-ui-markdown-link-text-decoration: underline;
        
        --fl-ui-markdown-blockquote-border-left: 3px solid var(--ux-border-color);
        --fl-ui-markdown-blockquote-padding-left: 1rem;
        --fl-ui-markdown-blockquote-opacity: 0.8;
        
        /**
         * WINDOW FRAME COMPONENT
         */
        --fl-ui-window-frame-border: 1px solid var(--ux-border-color);
        --fl-ui-window-frame-border-radius: var(--ux-radius-lg);
        --fl-ui-window-frame-shadow: var(--ux-shadow-lg);
        --fl-ui-window-frame-bg: var(--ux-surface-primary);
        
        --fl-ui-window-title-height: 2.5rem;
        --fl-ui-window-title-padding: 0.75rem 1rem;
        --fl-ui-window-title-bg: var(--ux-surface-secondary);
        --fl-ui-window-title-color: var(--ux-on-surface);
        --fl-ui-window-title-font-weight: var(--ux-font-weight-medium);
        
        /**
         * DRAGGABLE & RESIZABLE
         */
        --fl-ui-draggable-cursor: grab;
        --fl-ui-draggable-active-cursor: grabbing;
        --fl-ui-draggable-opacity: 0.8;
        
        --fl-ui-resizable-handle-size: 10px;
        --fl-ui-resizable-handle-bg: transparent;
        --fl-ui-resizable-handle-hover-bg: rgba(0, 0, 0, 0.1);
        --fl-ui-resizable-cursor: se-resize;
        
        /**
         * CONTAINER & BOX MODELS
         */
        --fl-ui-container-max-width: 1200px;
        --fl-ui-container-padding: var(--ux-space-4);
        --fl-ui-container-gap: var(--ux-space-4);
        
        --fl-ui-box-border: 1px solid var(--ux-border-color);
        --fl-ui-box-border-radius: var(--ux-radius-md);
        --fl-ui-box-padding: var(--ux-space-4);
        
        /**
         * TAB COMPONENT
         */
        --fl-ui-tab-height: 2.5rem;
        --fl-ui-tab-padding-x: 1rem;
        --fl-ui-tab-padding-y: 0.5rem;
        --fl-ui-tab-border-bottom: 2px solid transparent;
        --fl-ui-tab-active-border-color: var(--ux-color-primary);
        --fl-ui-tab-active-bg: var(--ux-surface-primary);
        --fl-ui-tab-hover-bg: var(--ux-surface-secondary);
        
        /**
         * TRANSITIONS
         */
        --fl-ui-transition-default: var(--ux-duration-base) var(--ux-easing-in-out);
        --fl-ui-transition-fast: var(--ux-duration-fast) var(--ux-easing-in-out);
        --fl-ui-transition-slow: var(--ux-duration-slow) var(--ux-easing-in-out);
    }
    
    /**
     * DARK THEME OVERRIDES
     */
    :root:where([data-theme="dark"]) {
        --fl-ui-file-manager-hover-bg: rgba(255, 255, 255, 0.05);
        --fl-ui-file-manager-selected-bg: rgba(0, 122, 204, 0.2);
        
        --fl-ui-markdown-code-bg: rgba(0, 0, 0, 0.3);
        --fl-ui-markdown-blockquote-border-left: 3px solid rgba(255, 255, 255, 0.15);
    }
}
```

### Update lib/_variables.scss

**File:** `modules/projects/fl.ui/src/styles/lib/_variables.scss` (REFERENCE FILE)

Keep this as a reference for design variables, but consider migrating all to custom properties:

```scss
/**
 * FL.UI Variables Reference
 * 
 * DEPRECATED: Use custom properties instead
 * These are maintained for backward compatibility only
 * 
 * Migrate existing SCSS code to use:
 *   var(--fl-ui-*) instead of $variable-name
 */

// Legacy SCSS variables (maintained for compatibility)
$file-manager-sidebar-width: var(--fl-ui-file-manager-sidebar-width);
$file-manager-item-height: var(--fl-ui-file-manager-item-height);

// ... other legacy variables
```

---

## Step 2.2: Unify Layer Declarations

### File: `modules/projects/fl.ui/src/styles/layers.scss` (COMPLETE REWRITE)

```scss
/**
 * FL.UI Layer Architecture
 * 
 * Unified CSS Cascade Layer ordering that:
 * 1. Extends veela.css layer hierarchy
 * 2. Introduces fl.ui-specific layers
 * 3. Maintains proper cascade for shell/view integration
 * 4. Supports service-specific styling (file-manager, markdown-view)
 * 
 * IMPORTANT: This file is imported FIRST in index.scss
 * It establishes the cascade order for all subsequent imports
 */

/**
 * LAYER ORDERING STRATEGY
 * 
 * Inherited from veela.css (lower specificity):
 * - ux-system.* (resets, fonts)
 * - ux-tokens.* (design tokens)
 * - ux-base.* (typography, forms)
 * - ux-layout.* (layout primitives)
 * - ux-components.core (base components)
 * 
 * FL.UI Specific (higher specificity):
 * - ux-components.buttons through .file-manager
 * - ux-shell.* (application shells)
 * - ux-views.* (page/view specific)
 * - ux-utilities.* (atomic classes)
 * - ux-theme.* (theme variants)
 * - ux-overrides.* (emergency fixes)
 */

@layer
    /* System & Foundation (inherited from veela.css) */
    ux-system.reset,
    ux-system.fonts,
    ux-system.root,
    
    /* Tokens (inherited from veela.css) */
    ux-tokens.custom-properties,
    ux-tokens.design-system,
    ux-tokens.material-colors,
    
    /* Base (inherited from veela.css) */
    ux-base.typography,
    ux-base.forms,
    ux-base.tables,
    ux-base.lists,
    
    /* Layout (inherited from veela.css) */
    ux-layout.normalize,
    ux-layout.grid,
    ux-layout.flexbox,
    ux-layout.positioning,
    ux-layout.sizing,
    
    /* Components - Core (inherited) */
    ux-components.core,
    ux-components.buttons,
    ux-components.inputs,
    ux-components.containers,
    ux-components.navigation,
    ux-components.feedback,
    
    /* Components - FL.UI Specific */
    ux-components.window-frame,
    ux-components.box-models,
    ux-components.tabs,
    ux-components.draggable,
    ux-components.resizable,
    ux-components.file-manager,
    ux-components.markdown-view,
    
    /* Shell Specific */
    ux-shell.raw,
    ux-shell.basic,
    ux-shell.faint,
    
    /* Views */
    ux-views.default,
    ux-views.workcenter,
    ux-views.editor,
    ux-views.viewer,
    ux-views.settings,
    ux-views.history,
    
    /* Utilities */
    ux-utilities.spacing,
    ux-utilities.typography,
    ux-utilities.visibility,
    ux-utilities.interactions,
    ux-utilities.display,
    ux-utilities.layout,
    
    /* Themes */
    ux-theme.light,
    ux-theme.dark,
    ux-theme.high-contrast,
    
    /* Emergency */
    ux-overrides.fixes,
    ux-overrides.patches,
    ux-overrides.critical;
```

---

## Step 2.3: Refactor Core Styles Index

### File: `modules/projects/fl.ui/src/styles/core/index.scss` (REWRITE)

```scss
/**
 * FL.UI Core Styles Index
 * 
 * Foundational styles for all FL.UI components
 * Each module is imported with @use and automatically wrapped in @layer
 */

/* Import with module namespaces */
@use "./border" as border-utils;
@use "./color" as color-utils;
@use "./container" as container-utils;
@use "./display" as display-utils;
@use "./interaction" as interaction-utils;
@use "./layout" as layout-utils;
@use "./motion" as motion-utils;
@use "./position" as position-utils;
@use "./scrollbar" as scrollbar-utils;
@use "./shadow" as shadow-utils;
@use "./size" as size-utils;
@use "./typography" as typography-utils;

/* Each core module wraps its styles in appropriate layers */
/* See individual files below for examples */
```

### Update Individual Core Files with Layer Wrappers

**Example: `modules/projects/fl.ui/src/styles/core/_border.scss`**

```scss
/**
 * Border Utilities
 * 
 * Provides mixins and utility classes for border styling
 * All rules wrapped in ux-components.core layer
 */

@layer ux-components.core {
    /* Existing border utility classes */
    .border {
        border: 1px solid var(--ux-border-color);
    }
    
    .border-none {
        border: none;
    }
    
    .border-solid {
        border-style: solid;
    }
    
    .border-dashed {
        border-style: dashed;
    }
    
    .rounded {
        border-radius: var(--ux-radius-md);
    }
    
    .rounded-sm {
        border-radius: var(--ux-radius-sm);
    }
    
    .rounded-lg {
        border-radius: var(--ux-radius-lg);
    }
    
    .rounded-full {
        border-radius: var(--ux-radius-full);
    }
}

/**
 * Border Mixins (no @layer needed - these are utilities for authors)
 */

@mixin border($color: var(--ux-border-color), $width: 1px, $style: solid) {
    border: $width $style $color;
}

@mixin rounded($radius: var(--ux-radius-md)) {
    border-radius: $radius;
}
```

**Pattern for other core files:** Apply same layer wrapping to:
- `_color.scss` → `@layer ux-components.core`
- `_container.scss` → `@layer ux-components.core`
- `_display.scss` → `@layer ux-components.core`
- `_interaction.scss` → `@layer ux-utilities.interactions`
- `_layout.scss` → `@layer ux-layout.* (appropriate sub-layer)`
- `_motion.scss` → `@layer ux-utilities.interactions`
- `_position.scss` → `@layer ux-layout.positioning`
- `_scrollbar.scss` → `@layer ux-components.core`
- `_shadow.scss` → `@layer ux-components.core`
- `_size.scss` → `@layer ux-layout.sizing`
- `_typography.scss` → `@layer ux-base.typography`

---

## Step 2.4: Wrap Service Styles with Layers

### File: `modules/projects/fl.ui/src/services/file-manager/scss/FileManager.scss`

```scss
/**
 * File Manager Component Styles
 * 
 * Service-specific styles for file manager component
 * Properly layered to prevent conflicts with other services
 * 
 * Uses @layer to ensure predictable cascade
 * Extends custom properties defined in tokens module
 */

@layer ux-components.file-manager {
    /**
     * FILE MANAGER CONTAINER
     */
    .file-manager {
        display: flex;
        flex-direction: column;
        height: 100%;
        background: var(--ux-surface-primary);
        border: var(--fl-ui-file-manager-border, var(--ux-border-color));
        border-radius: var(--fl-ui-file-manager-border-radius, var(--ux-radius-md));
    }

    /**
     * FILE MANAGER SIDEBAR
     */
    .file-manager__sidebar {
        flex-shrink: 0;
        width: var(--fl-ui-file-manager-sidebar-width);
        border-right: 1px solid var(--ux-border-color);
        background: var(--ux-surface-secondary);
        overflow-y: auto;
    }

    /**
     * FILE MANAGER TREE
     * 
     * Uses :where() for selector optimization
     */
    :where(.file-manager__tree, .file-manager__tree-node) {
        list-style: none;
        margin: 0;
        padding: 0;
    }

    /**
     * FILE MANAGER ITEM
     * 
     * Context-aware styling with :has()
     */
    .file-manager__item {
        display: flex;
        align-items: center;
        gap: var(--fl-ui-file-manager-item-padding);
        height: var(--fl-ui-file-manager-item-height);
        padding: 0 var(--fl-ui-file-manager-item-padding);
        cursor: pointer;
        transition: all var(--fl-ui-transition-fast);
        user-select: none;
    }

    .file-manager__item:hover {
        background-color: var(--fl-ui-file-manager-hover-bg);
    }

    .file-manager__item:is(.selected) {
        background-color: var(--fl-ui-file-manager-selected-bg);
        border-left: 3px solid var(--fl-ui-file-manager-selected-border);
        padding-left: calc(var(--fl-ui-file-manager-item-padding) - 3px);
    }

    /**
     * FILE MANAGER ICON
     */
    .file-manager__icon {
        flex-shrink: 0;
        width: var(--fl-ui-file-manager-icon-size);
        height: var(--fl-ui-file-manager-icon-size);
        opacity: 0.7;
    }

    /**
     * FILE MANAGER TEXT
     */
    .file-manager__text {
        flex: 1;
        min-width: 0;
        overflow: hidden;
        text-overflow: ellipsis;
        white-space: nowrap;
        font-size: var(--ux-font-size-sm);
    }

    /**
     * THEME-AWARE STYLING
     */
    :where([data-theme="dark"]) .file-manager__sidebar {
        background: var(--ux-surface-secondary);
    }
}
```

### File: `modules/projects/fl.ui/src/services/markdown-view/scss/markdown-render.scss`

```scss
/**
 * Markdown Viewer Render Styles
 * 
 * Styles for rendered markdown content
 * Properly layered and using custom properties
 */

@layer ux-components.markdown-view {
    /**
     * MARKDOWN CONTAINER
     */
    .markdown {
        font-family: var(--ux-font-family-base);
        line-height: var(--ux-line-height-normal);
        color: var(--ux-on-surface);
    }

    /**
     * HEADINGS
     * 
     * Consolidated with :where() selector
     */
    :where(.markdown h1, .markdown h2, .markdown h3, 
            .markdown h4, .markdown h5, .markdown h6) {
        margin-top: var(--fl-ui-markdown-heading-margin-top);
        margin-bottom: var(--fl-ui-markdown-heading-margin-bottom);
        font-weight: var(--fl-ui-markdown-heading-font-weight);
        color: var(--fl-ui-markdown-heading-color);
        line-height: var(--ux-line-height-tight);
    }

    .markdown h1 {
        font-size: var(--ux-font-size-4xl);
    }

    .markdown h2 {
        font-size: var(--ux-font-size-3xl);
    }

    .markdown h3 {
        font-size: var(--ux-font-size-2xl);
    }

    .markdown h4 {
        font-size: var(--ux-font-size-xl);
    }

    .markdown h5 {
        font-size: var(--ux-font-size-lg);
    }

    .markdown h6 {
        font-size: var(--ux-font-size-base);
    }

    /**
     * INLINE CODE
     */
    .markdown code {
        display: inline;
        background-color: var(--fl-ui-markdown-code-bg);
        color: var(--fl-ui-markdown-code-color);
        border: var(--fl-ui-markdown-code-border);
        border-radius: var(--fl-ui-markdown-code-border-radius);
        padding: var(--fl-ui-markdown-code-padding);
        font-family: var(--ux-font-family-mono);
        font-size: 0.95em;
    }

    /**
     * CODE BLOCKS
     */
    .markdown pre {
        background-color: var(--fl-ui-markdown-code-block-bg);
        border-radius: var(--fl-ui-markdown-code-block-border-radius);
        padding: var(--fl-ui-markdown-code-block-padding);
        overflow: var(--fl-ui-markdown-code-block-overflow);
        margin: 1rem 0;
    }

    .markdown pre code {
        display: block;
        background: none;
        border: none;
        padding: 0;
        font-size: 1em;
    }

    /**
     * LINKS
     */
    .markdown a {
        color: var(--fl-ui-markdown-link-color);
        text-decoration: var(--fl-ui-markdown-link-text-decoration);
        transition: color var(--fl-ui-transition-fast);
        cursor: pointer;
    }

    .markdown a:hover {
        color: var(--fl-ui-markdown-link-hover-color);
    }

    /**
     * BLOCKQUOTES
     */
    .markdown blockquote {
        border-left: var(--fl-ui-markdown-blockquote-border-left);
        padding-left: var(--fl-ui-markdown-blockquote-padding-left);
        opacity: var(--fl-ui-markdown-blockquote-opacity);
        margin: 1rem 0;
        font-style: italic;
    }

    /**
     * LISTS
     */
    :where(.markdown ul, .markdown ol) {
        padding-left: 2rem;
        margin: 1rem 0;
    }

    .markdown li {
        margin: 0.5rem 0;
    }

    /**
     * TABLES
     */
    .markdown table {
        width: 100%;
        border-collapse: collapse;
        margin: 1rem 0;
    }

    .markdown th,
    .markdown td {
        border: 1px solid var(--ux-border-color);
        padding: 0.75rem;
        text-align: left;
    }

    .markdown th {
        background-color: var(--ux-surface-secondary);
        font-weight: var(--ux-font-weight-semibold);
    }

    /**
     * PARAGRAPH & TEXT
     */
    .markdown p {
        margin: 1rem 0;
    }

    .markdown strong {
        font-weight: var(--ux-font-weight-bold);
    }

    .markdown em {
        font-style: italic;
    }

    .markdown hr {
        border: none;
        border-top: 1px solid var(--ux-border-color);
        margin: 2rem 0;
    }
}
```

---

## Step 2.5: Refactor Adapter Styles

### File: `modules/projects/fl.ui/src/styles/adapters/_index.scss`

```scss
/**
 * Style Adapters Index
 * 
 * Adapters bridge FL.UI with different CSS frameworks
 * Each adapter is properly layered and isolated
 */

@use "./core" as core-adapter;
@use "./veela" as veela-adapter;

/* Adapters wrap their styles appropriately - see individual files */
```

### File: `modules/projects/fl.ui/src/styles/adapters/_veela.scss` (REFACTOR)

```scss
/**
 * Veela CSS Adapter
 * 
 * Integrates FL.UI components with Veela design system
 * Properly layered to work with veela runtime styles
 */

@use "../../tokens/custom-properties";
@use "../../lib/veela";

@layer ux-components.buttons,
        ux-components.inputs,
        ux-components.containers {
    
    /**
     * BUTTON INTEGRATION
     */
    .btn {
        display: inline-flex;
        align-items: center;
        justify-content: center;
        gap: var(--ux-space-2);
        height: var(--fl-ui-button-height);
        padding: var(--fl-ui-button-padding-y) var(--fl-ui-button-padding-x);
        border: var(--fl-ui-control-border-width) solid transparent;
        border-radius: var(--fl-ui-control-border-radius);
        background-color: var(--ux-color-primary);
        color: white;
        font-family: var(--ux-font-family-base);
        font-size: var(--ux-font-size-base);
        font-weight: var(--ux-font-weight-medium);
        cursor: pointer;
        transition: all var(--fl-ui-transition-fast);
        user-select: none;
    }

    .btn:hover {
        filter: brightness(1.08);
    }

    .btn:active {
        filter: brightness(0.95);
    }

    .btn:disabled {
        opacity: 0.5;
        cursor: not-allowed;
    }

    /* Button variants */
    .btn.variant-secondary {
        background-color: var(--ux-color-secondary);
    }

    .btn.variant-success {
        background-color: var(--ux-color-success);
    }

    .btn.variant-danger {
        background-color: var(--ux-color-danger);
    }

    /**
     * INPUT INTEGRATION
     */
    .input {
        display: block;
        width: 100%;
        height: var(--fl-ui-input-height);
        padding: var(--fl-ui-input-padding-y) var(--fl-ui-input-padding-x);
        border: var(--fl-ui-control-border-width) solid var(--fl-ui-control-border-color);
        border-radius: var(--fl-ui-control-border-radius);
        background-color: var(--ux-surface-primary);
        color: var(--ux-on-surface);
        font-family: var(--ux-font-family-base);
        font-size: var(--ux-font-size-base);
        transition: all var(--fl-ui-transition-fast);
    }

    .input:focus {
        outline: none;
        border-color: var(--ux-color-primary);
        box-shadow: 0 0 0 3px rgba(0, 122, 204, 0.1);
    }

    .input:disabled {
        opacity: 0.5;
        cursor: not-allowed;
    }

    /**
     * CONTAINER INTEGRATION
     */
    .container {
        max-width: var(--fl-ui-container-max-width);
        margin: 0 auto;
        padding: 0 var(--fl-ui-container-padding);
    }

    .box {
        border: var(--fl-ui-box-border);
        border-radius: var(--fl-ui-box-border-radius);
        padding: var(--fl-ui-box-padding);
        background-color: var(--ux-surface-primary);
    }
}
```

---

## Step 2.6: Update Main Index

### File: `modules/projects/fl.ui/src/styles/index.scss` (ENHANCE)

```scss
/**
 * FL.UI Styles Main Entry Point
 * 
 * Loads FL.UI component styles with proper layer organization.
 * Layer declaration ensures correct cascade for all variants.
 * 
 * Import order:
 * 1. Layers (establishes cascade order)
 * 2. Custom properties (design tokens)
 * 3. Core utilities (mixins, functions)
 * 4. Components
 * 5. Adapters
 * 6. Services
 */

/**
 * STEP 1: Establish layer ordering
 * This MUST be first to define the cascade
 */
@use "./layers";

/**
 * STEP 2: Import custom properties (design tokens)
 * These are CSS variables - no side effects
 */
@use "./tokens/custom-properties";

/**
 * STEP 3: Import core utilities and mixins
 * These are reusable functions/mixins
 */
@use "./lib/variables" as lib-vars;
@use "./core/index" as core;

/**
 * STEP 4: Import component styles
 * All rules already wrapped in @layer
 */
@use "./components/index" as components;

/**
 * STEP 5: Import service-specific styles
 * File manager and markdown view
 */
@use "../services/file-manager/scss/FileManager" as file-manager;
@use "../services/file-manager/scss/FileManagerContent" as file-manager-content;
@use "../services/markdown-view/scss/markdown-render" as markdown-render;
@use "../services/markdown-view/scss/markdown-viewer" as markdown-viewer;

/**
 * STEP 6: Import adapters
 * Framework integrations (veela, etc.)
 */
@use "./adapters/index" as adapters;

/**
 * NOTES:
 * - All @layer declarations are in layers.scss
 * - All rules are wrapped in appropriate @layer contexts
 * - Custom properties use @layer ux-tokens.design-system
 * - Services use @layer ux-components.* 
 * - Adapters use @layer ux-components.*
 */
```

---

## Step 2.7: Create TypeScript Style Loader

### File: `modules/projects/fl.ui/src/styles/style-loader.ts`

```typescript
/**
 * FL.UI Style Loader
 * 
 * Manages dynamic style loading and variant selection
 * Coordinates with veela.css RuntimeLayerManager
 */

import { RuntimeLayerManager } from '@fest/veela';

export interface StyleConfig {
    variant: 'core' | 'veela' | 'veela-advanced' | 'veela-beercss';
    theme: 'light' | 'dark' | 'auto';
    customLayers?: string[];
}

export class FlUiStyleLoader {
    private static isInitialized = false;
    private static currentVariant: string | null = null;

    /**
     * Initialize FL.UI styles
     */
    static initialize(config: StyleConfig): void {
        if (this.isInitialized && !config.customLayers) {
            console.warn('[FlUiStyleLoader] Already initialized');
            return;
        }

        // Ensure veela layers are ready
        RuntimeLayerManager.initializeLayers();

        // Load variant-specific styles
        this.loadVariant(config.variant);

        // Setup theme
        this.setupTheme(config.theme);

        // Setup custom layers if provided
        if (config.customLayers) {
            this.registerCustomLayers(config.customLayers);
        }

        this.isInitialized = true;
    }

    /**
     * Load variant-specific stylesheet
     */
    private static loadVariant(variant: string): void {
        const styleMap: Record<string, string> = {
            'core': '/styles/index.core.css',
            'veela': '/styles/index.veela.css',
            'veela-advanced': '/styles/index.veela-advanced.css',
            'veela-beercss': '/styles/index.veela-beercss.css',
        };

        const stylePath = styleMap[variant];
        if (!stylePath) {
            console.error(`[FlUiStyleLoader] Unknown variant: ${variant}`);
            return;
        }

        const link = document.createElement('link');
        link.rel = 'stylesheet';
        link.href = stylePath;
        link.setAttribute('data-fl-ui-variant', variant);
        document.head.appendChild(link);

        this.currentVariant = variant;
    }

    /**
     * Setup theme context
     */
    private static setupTheme(theme: string): void {
        const html = document.documentElement;

        if (theme === 'auto') {
            const isDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
            html.setAttribute('data-theme', isDark ? 'dark' : 'light');

            // Listen for system theme changes
            window.matchMedia('(prefers-color-scheme: dark)')
                .addEventListener('change', (e) => {
                    html.setAttribute('data-theme', e.matches ? 'dark' : 'light');
                });
        } else {
            html.setAttribute('data-theme', theme);
        }
    }

    /**
     * Register custom layers
     */
    private static registerCustomLayers(layers: string[]): void {
        const style = document.createElement('style');
        style.textContent = `@layer ${layers.join(', ')};`;
        document.head.appendChild(style);
    }

    /**
     * Get current variant
     */
    static getVariant(): string | null {
        return this.currentVariant;
    }

    /**
     * Switch theme dynamically
     */
    static switchTheme(theme: 'light' | 'dark'): void {
        document.documentElement.setAttribute('data-theme', theme);
    }
}
```

---

## Validation Checklist for Phase 2

### Code Quality
- [ ] All core styles wrapped with @layer
- [ ] All service styles wrapped with @layer
- [ ] Custom properties module compiles
- [ ] No unused CSS variables
- [ ] StyleLint passes with 0 errors
- [ ] No circular dependencies

### Integration
- [ ] Works with veela-core variant
- [ ] Works with veela-basic variant
- [ ] Works with veela-advanced variant
- [ ] File Manager renders correctly
- [ ] Markdown View renders correctly
- [ ] Custom properties applied correctly

### Functionality
- [ ] Components display correctly
- [ ] Styles cascade properly
- [ ] Theme switching works
- [ ] Dark mode renders correctly
- [ ] All transitions smooth
- [ ] No visual regressions

### Performance
- [ ] CSS output size optimized
- [ ] Layer initialization < 50ms
- [ ] No layout thrashing
- [ ] No CLS (Cumulative Layout Shift)

---

## Files Modified/Created in Phase 2

| File | Action | Status |
|------|--------|--------|
| `src/styles/tokens/_custom-properties.scss` | CREATE | ⏳ Pending |
| `src/styles/layers.scss` | REWRITE | ⏳ Pending |
| `src/styles/core/index.scss` | REWRITE | ⏳ Pending |
| `src/styles/core/_border.scss` | ENHANCE | ⏳ Pending |
| `src/styles/core/_color.scss` | ENHANCE | ⏳ Pending |
| `src/styles/core/_container.scss` | ENHANCE | ⏳ Pending |
| `src/styles/core/_display.scss` | ENHANCE | ⏳ Pending |
| `src/styles/core/_interaction.scss` | ENHANCE | ⏳ Pending |
| `src/styles/core/_layout.scss` | ENHANCE | ⏳ Pending |
| `src/styles/core/_motion.scss` | ENHANCE | ⏳ Pending |
| `src/styles/core/_position.scss` | ENHANCE | ⏳ Pending |
| `src/styles/core/_scrollbar.scss` | ENHANCE | ⏳ Pending |
| `src/styles/core/_shadow.scss` | ENHANCE | ⏳ Pending |
| `src/styles/core/_size.scss` | ENHANCE | ⏳ Pending |
| `src/styles/core/_typography.scss` | ENHANCE | ⏳ Pending |
| `src/styles/adapters/_index.scss` | REWRITE | ⏳ Pending |
| `src/styles/adapters/_veela.scss` | REWRITE | ⏳ Pending |
| `src/styles/index.scss` | ENHANCE | ⏳ Pending |
| `src/services/file-manager/scss/FileManager.scss` | ENHANCE | ⏳ Pending |
| `src/services/markdown-view/scss/markdown-render.scss` | ENHANCE | ⏳ Pending |
| `src/services/markdown-view/scss/markdown-viewer.scss` | ENHANCE | ⏳ Pending |
| `src/styles/style-loader.ts` | CREATE | ⏳ Pending |

---

## Next Phase

→ [Phase 3: CrossWord App Refactoring](./PHASE_3_CROSSWORD_REFACTORING.md)
