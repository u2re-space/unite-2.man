# FL.UI Styles Refactoring Guide

## Current State

**Location:** `modules/projects/fl.ui/src/styles/`

**Current Structure:**
- `core/` - Core SCSS mixins (veela-independent)
- `components/` - Component styles
- `adapters/` - Veela and core adapters
- `lib/` - Library layer with variables and veela integration
- `services/` - Service-specific styles (FileManager, etc.)

**Current Layer Definition:**
```scss
@layer ux-layer.u2-normalize, ux-layer.ux-agate, ux-ctm, ux-classes, ui-window-frame;
```

**Issues:**
- Service styles not properly layered
- Inconsistent layer naming
- Missing context-based scoping

## Migration Path

### Step 1: Update Layer Definitions

**File:** `modules/projects/fl.ui/src/styles/layers.scss`

**Current:**
```scss
@layer ux-layer.u2-normalize, ux-layer.ux-agate, ux-ctm, ux-classes, ui-window-frame;
```

**Updated:**
```scss
/**
 * FL.UI Layer Definitions
 * 
 * FL.UI participates in the unified CSS layer cascade, providing
 * specialized layers for UI components and adaptive styling.
 * 
 * Mapping:
 * - ux-layer.u2-normalize → system.normalize
 * - ux-layer.ux-agate → runtime.core.components
 * - ux-ctm → context.themes
 * - ux-classes → runtime.core.utilities
 * - ui-window-frame → runtime.core.components
 */

@use "fest/shared/scss-layers";

// Define FL.UI's specialized component layers
@layer
    system.normalize,           // Reset and normalize
    runtime.core.components,    // UI components base
    context.themes,             // Theme variants
    runtime.core.utilities,     // Utility classes
    runtime.core.components;    // Window frame components

// Backward compatibility aliases
@layer ux-layer.u2-normalize { /* alias */ }
@layer ux-layer.ux-agate { /* alias */ }
@layer ux-ctm { /* alias */ }
@layer ux-classes { /* alias */ }
@layer ui-window-frame { /* alias */ }
```

### Step 2: Refactor Core Mixins

**Pattern - All files in `core/`:**

**Before:**
```scss
// No layer (mixin files)
@mixin display($type, $align, $justify) {
    display: #{$type};
    align-items: #{$align};
    justify-content: #{$justify};
}
```

**After:**
```scss
/**
 * Display Mixin
 * 
 * Creates flexbox/grid display configurations
 * 
 * @param {string} $type - Display type (flex, grid, etc.)
 * @param {string} $align - Align items value
 * @param {string} $justify - Justify content value
 */
@mixin display($type, $align, $justify) {
    display: #{$type};
    align-items: #{$align};
    justify-content: #{$justify};
}

// Export for use
@function display($type, $align, $justify) {
    @return display: #{$type}, align-items: #{$align}, justify-content: #{$justify};
}
```

### Step 3: Refactor Component Styles

**Files to update:**
- `components/_draggable.scss`
- `components/_resizable.scss`
- `components/_window-frame.scss`

**Pattern - Before:**
```scss
.draggable {
    cursor: grab;
    user-select: none;
}

.draggable.is-dragging {
    cursor: grabbing;
    opacity: 0.8;
}
```

**Pattern - After:**
```scss
/**
 * Draggable Component Styles
 * Layer: runtime.core.components
 * 
 * Provides styling for draggable elements with proper
 * cursor feedback and visual states.
 */

@use "fest/shared/scss-custom-properties" as props;

@layer runtime.core.components {
    .draggable {
        cursor: grab;
        user-select: none;
        transition: opacity var(--duration-base) var(--timing-ease);
        
        &.is-dragging {
            cursor: grabbing;
            opacity: 0.8;
        }
    }
}
```

### Step 4: Update Service Styles

**Files to update:**
- `services/file-manager/scss/FileManager.scss`
- `services/file-manager/scss/FileManagerContent.scss`

**Pattern - Before:**
```scss
@use "../../lib/variables";

.file-manager {
    display: flex;
    background: #ffffff;
}

.file-manager__tree {
    width: 250px;
    border-right: 1px solid #e0e0e0;
}

.file-manager__content {
    flex: 1;
    overflow: auto;
}
```

**Pattern - After:**
```scss
/**
 * File Manager Service Styles
 * Layer: runtime.core.components
 * 
 * Provides styling for the file manager component,
 * including tree view and content area.
 * 
 * Context:
 * - [data-service="file-manager"] - Service container
 */

@use "fest/shared/scss-custom-properties" as props;
@use "fest/fl-ui/core" as ui;

@layer runtime.core.components {
    .file-manager {
        @include ui.display('flex', 'stretch', 'flex-start');
        background: var(--color-surface);
        
        &__tree {
            width: 250px;
            border-right: 1px solid var(--color-border);
            overflow-y: auto;
        }
        
        &__content {
            flex: 1;
            overflow: auto;
            padding: var(--space-md);
        }
        
        /* Context-specific scoping */
        &:has([data-service="file-manager"]) {
            /* Additional context-based rules */
        }
    }
}
```

### Step 5: Update Index Files

**File:** `modules/projects/fl.ui/src/styles/index.scss`

**Current:**
```scss
@use "./layers";
@use "../services/file-manager/scss/FileManager";
@use "../services/file-manager/scss/FileManagerContent";

// FL.UI Style Abstraction Layer
// This provides a veela-independent base that can be extended or replaced
// with any CSS framework/library

// Design tokens (CSS variables)
@use "./lib/variables";

// Core mixins
@forward "./core/index";
@forward "./components/index";
@forward "./adapters/index";
```

**Updated:**
```scss
/**
 * FL.UI Styles - Main Entry Point
 * 
 * Provides the complete FL.UI styling system with:
 * - Veela-independent core mixins
 * - Adaptable component styling
 * - Service-specific styles (FileManager, etc.)
 * 
 * Layer: runtime.core.* (multiple phases)
 * 
 * Usage:
 * @use "fest/fl-ui/styles" as flui;
 * 
 * Or with specific entry points:
 * @use "fest/fl-ui/core" - Just mixins, no styles
 * @use "fest/fl-ui/veela" - With veela integration
 */

// Import layer definitions
@use "./layers";

// Import and apply shared layers
@use "fest/shared/scss-layers";
@use "fest/shared/scss-custom-properties" as props;

// Service styles (loaded with proper layers)
@use "../services/file-manager/scss/FileManager";
@use "../services/file-manager/scss/FileManagerContent";

// Design tokens (CSS variables)
@use "./lib/variables";

// Forward public APIs
@forward "./core/index";       // Core mixins (no styles)
@forward "./components/index"; // Component styles
@forward "./adapters/index";   // Adapter selectors
```

## Refactoring Checklist

### For each file in `core/`:
- [ ] Already correctly structured (mixins only)
- [ ] Add JSDoc comments to all mixins
- [ ] No CSS rules in these files
- [ ] Ensure proper @use pattern

### For each file in `components/`:
- [ ] Add file header documentation
- [ ] Update all `@import` to `@use`
- [ ] Wrap CSS rules in `@layer runtime.core.components`
- [ ] Replace hard values with `var(--*)`
- [ ] Use `:where()` for element selectors
- [ ] Test component functionality

### For each service style file:
- [ ] Create dedicated layer (e.g., `runtime.core.components`)
- [ ] Update imports to use `@use`
- [ ] Replace hard-coded values with custom properties
- [ ] Add context selector with `:has()`
- [ ] Document service-specific styling

## Example: Complete Refactoring - FileManager Service

### Before: `services/file-manager/scss/FileManager.scss`

```scss
@use "../../lib/variables" as v;
@import "../../core/mixins";

.file-manager {
    display: flex;
    flex-direction: column;
    height: 100%;
    background: #ffffff;
    border: 1px solid #e0e0e0;
}

.file-manager__header {
    display: flex;
    gap: 8px;
    padding: 12px;
    border-bottom: 1px solid #e0e0e0;
    background: #f8f9fa;
}

.file-manager__header-title {
    font-size: 14px;
    font-weight: 600;
    color: #111827;
    flex: 1;
}

.file-manager__header-close {
    border: none;
    background: transparent;
    cursor: pointer;
    padding: 4px;
    color: #666;
}

.file-manager__tree {
    flex: 1;
    overflow-y: auto;
    min-width: 0;
    padding: 8px;
    background: #ffffff;
}

.file-manager__tree-item {
    padding: 4px 8px;
    margin: 2px 0;
    border-radius: 4px;
    user-select: none;
}

.file-manager__tree-item:hover {
    background: #f0f0f0;
}

.file-manager__tree-item.selected {
    background: #0066cc;
    color: white;
}
```

### After: `services/file-manager/scss/FileManager.scss`

```scss
/**
 * File Manager Service - Header and Tree
 * 
 * Layer: runtime.core.components
 * 
 * Provides styling for the file manager service component,
 * including header with controls and hierarchical tree view.
 * 
 * Components:
 * - .file-manager - Main container
 * - .file-manager__header - Top control bar
 * - .file-manager__tree - Tree list container
 * - .file-manager__tree-item - Individual tree items
 * 
 * Context:
 * - [data-service="file-manager"] - Service root
 * - .selected - Selected tree item state
 * 
 * Usage:
 * ```html
 * <div class="file-manager" data-service="file-manager">
 *   <div class="file-manager__header">
 *     <h3 class="file-manager__header-title">Files</h3>
 *     <button class="file-manager__header-close">×</button>
 *   </div>
 *   <div class="file-manager__tree">
 *     <div class="file-manager__tree-item selected">file.txt</div>
 *     <div class="file-manager__tree-item">folder/</div>
 *   </div>
 * </div>
 * ```
 */

@use "fest/shared/scss-custom-properties" as props;
@use "fest/fl-ui/core" as ui;
@use "../../lib/variables" as v;

@layer runtime.core.components {
    /* ====================================================================
       MAIN CONTAINER
       ==================================================================== */
    
    .file-manager {
        display: flex;
        flex-direction: column;
        height: 100%;
        background: var(--color-surface);
        border: 1px solid var(--color-border);
        border-radius: var(--radius-md);
        overflow: hidden;
    }
    
    /* ====================================================================
       HEADER BAR
       ==================================================================== */
    
    .file-manager__header {
        display: flex;
        gap: var(--space-xs);
        padding: var(--space-sm);
        border-bottom: 1px solid var(--color-border);
        background: var(--color-surface-secondary);
        flex-shrink: 0;
    }
    
    .file-manager__header-title {
        font: var(--typography-label-base);
        font-weight: var(--font-weight-semibold);
        color: var(--color-text);
        flex: 1;
    }
    
    .file-manager__header-close {
        :where(&) {
            border: none;
            background: transparent;
            cursor: pointer;
            padding: var(--space-xs);
            color: var(--color-text-tertiary);
            font-size: var(--font-size-lg);
            transition: color var(--duration-base) var(--timing-ease);
        }
        
        &:hover {
            color: var(--color-text);
        }
    }
    
    /* ====================================================================
       TREE VIEW
       ==================================================================== */
    
    .file-manager__tree {
        flex: 1;
        overflow-y: auto;
        overflow-x: hidden;
        min-width: 0;
        padding: var(--space-xs);
        background: var(--color-surface);
    }
    
    .file-manager__tree-item {
        padding: var(--space-xs) var(--space-sm);
        margin-block: 2px;
        border-radius: var(--radius-sm);
        user-select: none;
        cursor: pointer;
        transition: all var(--duration-base) var(--timing-ease);
        
        &:hover {
            background: var(--color-surface-secondary);
            color: var(--color-text);
        }
        
        &.selected {
            background: var(--color-primary);
            color: var(--color-text-inverse);
            font-weight: var(--font-weight-medium);
        }
    }
    
    /* ====================================================================
       CONTEXT VARIANTS
       ==================================================================== */
    
    :has([data-service="file-manager"]) {
        /* Additional context-specific styling if needed */
    }
}
```

## FL.UI + Veela Integration

When using with Veela:

```scss
// File: fl.ui/src/styles/adapters/_veela.scss

/**
 * FL.UI Veela Adapter
 * 
 * Provides FL.UI components with full veela.css integration.
 * Re-exports veela mixins and provides specialized adapters.
 */

@use "veela-lib" as veela;
@use "fest/shared/scss-layers";

@forward "veela-lib" as veela-*;

// Specialized adapters using veela features
@layer runtime.core.components {
    /* Veela-powered enhancements */
}
```

## Testing Requirements

For each refactored module:

- [ ] Import/export paths work correctly
- [ ] Mixins are accessible via proper namespaces
- [ ] Layer order is maintained correctly
- [ ] Component styles apply without conflicts
- [ ] Custom properties are properly resolved
- [ ] Dark theme works (if applicable)
- [ ] Responsive breakpoints work
- [ ] No console warnings or errors
- [ ] File size not increased significantly

## Backward Compatibility

Maintain support for existing imports:

```scss
// Old way (still works during transition)
@use "fest/fl-ui" as flui;

// New way (preferred)
@use "fest/fl-ui/core" as ui;
@use "fest/fl-ui/styles" as styles;
```

## Migration Order

1. Core mixins (already mostly done)
2. Component styles
3. Service styles
4. Adapter files
5. Test and validate all combinations

## Files to Update

### Priority 1 - Foundation
- [ ] `layers.scss` - Update layer definitions
- [ ] `index.scss` - Update main entry point
- [ ] `core/` - Verify and document

### Priority 2 - Components
- [ ] `components/_draggable.scss`
- [ ] `components/_resizable.scss`
- [ ] `components/_window-frame.scss`

### Priority 3 - Services
- [ ] `services/file-manager/scss/FileManager.scss`
- [ ] `services/file-manager/scss/FileManagerContent.scss`

### Priority 4 - Adapters
- [ ] `adapters/_index.scss`
- [ ] `adapters/_core.scss`
- [ ] `adapters/_veela.scss`

## Documentation to Create

- [ ] Updated FL.UI styling guide
- [ ] Mixin API reference
- [ ] Component API documentation
- [ ] Service style guidelines
- [ ] Integration examples

## Related Documents

- `CSS_ARCHITECTURE_REFACTORING_PLAN.md` - Overall strategy
- `SCSS_REFACTORING_TEMPLATE.md` - General patterns
- `VEELA_CSS_REFACTORING_GUIDE.md` - Veela-specific guidance
- `CSS_LAYER_INITIALIZATION_GUIDE.md` - Initialization sequence
