# CrossWord Frontend Styles Refactoring Guide

## Current State

**Location:** `apps/CrossWord/src/frontend/`

**Structure:**
- `shells/` - Application shells (basic, faint, raw)
- `views/` - Content views (workcenter, viewer, editor, explorer, history, home, settings, airpad, from-faint)
- `items/` - Item components (_Cards.scss)
- `main/` - Main app styles (boot-menu.scss)

**Current Issues:**
- No consistent @layer usage
- Missing context-based `:has()` selectors
- Shells and views may conflict in styling
- Not organized by initialization sequence
- Inconsistent import patterns

## Architecture Overview

```
CrossWord App Structure:
├── Shells (MUTUALLY EXCLUSIVE)
│   ├── Basic - Lightweight minimal interface
│   ├── Faint - Full-featured Material Design inspired
│   └── Raw - No shell, raw browser
│
├── Views (SELECTED WITHIN SHELL)
│   ├── Workcenter - Main work area
│   ├── Viewer - Document/file viewer
│   ├── Editor - Text/document editor
│   ├── Explorer - File/resource explorer
│   ├── Settings - Application settings
│   ├── History - History view
│   ├── Home - Home screen
│   └── Airpad - Sensor/input focused view
│
└── Global Components
    ├── Boot Menu
    └── Cards
```

## Layer Organization for CrossWord

```scss
@layer
    /* System & Runtime (from framework) */
    system.normalize,
    system.tokens,
    runtime.core.layout,
    runtime.core.base,
    runtime.core.components,
    runtime.core.utilities,
    
    /* Shell Layers */
    shell.layout,           /* Shell main structure */
    shell.components,       /* Shell UI components */
    shell.utilities,        /* Shell utilities */
    shell.context,          /* Shell variants (themes, etc) */
    
    /* View Layers */
    view.layout,            /* View-specific layout */
    view.components,        /* View-specific components */
    view.utilities,         /* View utilities */
    view.context,           /* View context rules */
    
    /* Global & Features */
    context.features,
    context.themes,
    context.overrides;
```

## Shell Refactoring Guide

### Shell Loading Pattern

Each shell should:
1. Define shell.layout (main structure)
2. Define shell.components (UI parts)
3. Use `:has([data-shell="shell-id"])` for isolation
4. Define theme/variant styles

### Example: Basic Shell Refactoring

**File Structure:**
```
shells/basic/
├── index.scss          → Entry point (import orchestrator)
├── layout.scss         → shell.layout
├── _components.scss    → shell.components
├── basic.scss          → shell context/theme
├── _keyframes.scss     → Animation definitions
└── _tokens.scss        → Shell-specific tokens
```

**File: `shells/basic/layout.scss`**

**Before:**
```scss
.shell-basic {
    display: flex;
    flex-direction: column;
    height: 100vh;
    background: #f8f9fa;
}

.shell-basic__nav {
    display: flex;
    gap: 0.5rem;
    height: 56px;
    padding: 0.75rem;
    background: #ffffff;
    border-bottom: 1px solid #e0e0e0;
}

.shell-basic__content {
    flex: 1;
    overflow: hidden;
    display: flex;
    flex-direction: column;
}
```

**After:**
```scss
/**
 * Basic Shell - Layout Structure
 * 
 * Layer: shell.layout
 * 
 * Defines the main layout structure for the basic shell:
 * - Flexbox column structure (nav + content)
 * - Navigation bar (56px fixed height)
 * - Content area (flexible, scrollable)
 * 
 * Context:
 * - [data-shell="basic"] - Shell container
 */

@use "fest/shared/scss-custom-properties" as props;

@layer shell.layout {
    /* Main shell container */
    :is(.shell-basic) {
        display: flex;
        flex-direction: column;
        height: 100vh;
        background: var(--color-background);
        color: var(--color-text);
        
        /* Ensure it applies to correct shell */
        &:has([data-shell="basic"]) {
            /* Shell-specific layout rules */
        }
    }
    
    /* Navigation bar */
    .shell-basic__nav {
        display: flex;
        gap: var(--space-sm);
        height: 56px;
        padding: var(--space-md);
        background: var(--color-surface);
        border-bottom: 1px solid var(--color-border);
        flex-shrink: 0;
        transition: background var(--duration-base) var(--timing-ease);
    }
    
    /* Main content area */
    .shell-basic__content {
        flex: 1;
        overflow: hidden;
        display: flex;
        flex-direction: column;
        min-height: 0;
        position: relative;
    }
}
```

**File: `shells/basic/_components.scss`**

**Before:**
```scss
.shell-basic__nav-btn {
    display: flex;
    padding: 0.5rem 0.75rem;
    border: none;
    border-radius: 8px;
    background: transparent;
    cursor: pointer;
}

.shell-basic__nav-btn:hover {
    background: rgba(0, 0, 0, 0.05);
}

.shell-basic__nav-btn.active {
    background: rgba(0, 122, 204, 0.12);
    color: #007acc;
}
```

**After:**
```scss
/**
 * Basic Shell - Component Styles
 * 
 * Layer: shell.components
 * 
 * Provides styling for interactive shell components:
 * - Navigation buttons
 * - Status indicators
 * - Loading states
 */

@use "fest/shared/scss-custom-properties" as props;
@use "fest/fl-ui/core" as ui;

@layer shell.components {
    /* Navigation button */
    .shell-basic__nav-btn {
        @include ui.display('flex', 'center', 'center');
        gap: var(--space-xs);
        padding: var(--space-sm) var(--space-md);
        border: none;
        border-radius: var(--radius-lg);
        background: transparent;
        color: var(--color-text);
        font-size: var(--font-size-sm);
        font-weight: var(--font-weight-medium);
        cursor: pointer;
        transition: all var(--duration-base) var(--timing-ease);
        
        &:hover {
            background: var(--color-overlay-light);
        }
        
        &.active {
            background: rgba(var(--color-primary), 0.1);
            color: var(--color-primary);
        }
        
        &:focus-visible {
            outline: 2px solid var(--color-primary);
            outline-offset: 2px;
        }
        
        ui-icon {
            font-size: var(--font-size-lg);
            opacity: 0.8;
            flex-shrink: 0;
            
            .active & {
                opacity: 1;
            }
        }
    }
    
    /* Status messages */
    .shell-basic__status {
        position: fixed;
        bottom: var(--space-xl);
        left: 50%;
        transform: translateX(-50%);
        padding: var(--space-sm) var(--space-lg);
        background: var(--color-text);
        color: var(--color-surface);
        border-radius: var(--radius-lg);
        font-size: var(--font-size-sm);
        font-weight: var(--font-weight-medium);
        z-index: var(--z-notification);
        box-shadow: var(--shadow-lg);
        animation: shell-basic-status-enter var(--duration-base) var(--timing-ease-out);
        
        &:empty,
        &[hidden] {
            display: none;
        }
    }
}
```

### Shell Initialization

**File: `shells/basic/index.ts`** (TypeScript initialization)

```typescript
/**
 * Basic Shell - Initialization
 * 
 * Loads and mounts the basic shell with proper CSS layer sequencing.
 */

import { loadAsAdopted } from 'fest/dom';
import type { Shell, ShellTheme } from '../types';

/**
 * Load basic shell styles
 */
async function loadShellStyles(): Promise<void> {
    const { loadAsAdopted } = await import('fest/dom');
    
    // Load shell layout styles
    const layoutStyle = await import('./layout.scss?inline');
    await loadAsAdopted(layoutStyle, 'shell.layout');
    
    // Load shell component styles
    const componentStyle = await import('./_components.scss?inline');
    await loadAsAdopted(componentStyle, 'shell.components');
    
    // Load shell-specific theme/tokens
    const themeStyle = await import('./basic.scss?inline');
    await loadAsAdopted(themeStyle, 'shell.context');
}

/**
 * Initialize and mount basic shell
 */
export async function mountBasicShell(
    container: HTMLElement,
    theme?: ShellTheme
): Promise<Shell> {
    // Load styles
    await loadShellStyles();
    
    // Set shell indicator attribute
    document.documentElement.setAttribute('data-shell', 'basic');
    
    // Create shell DOM
    const shell = createShellDOM(container);
    
    // Apply theme
    if (theme) {
        document.documentElement.setAttribute('data-theme', theme);
    }
    
    return {
        id: 'basic',
        element: shell.root,
        theme: theme ?? 'light',
        mount: (viewContainer) => mountViewInShell(shell, viewContainer),
        unmount: () => unmountShell(shell),
        setTheme: (newTheme) => applyTheme(shell, newTheme)
    };
}
```

## View Refactoring Guide

Each view follows the same pattern:

**Structure:**
```
views/{view-name}/
├── index.ts         → Entry point
├── {view-name}.scss → view.components (main styles)
└── scss/            → Additional views partials
    ├── _layout.scss
    ├── _components.scss
    └── _utilities.scss
```

### Example: Workcenter View Refactoring

**File: `views/workcenter/scss/_base.scss`**

**Before:**
```scss
.workcenter {
    display: flex;
    flex-direction: column;
    height: 100%;
    gap: 0;
}

.workcenter__header {
    display: flex;
    gap: 1rem;
    padding: 1rem;
    border-bottom: 1px solid #e0e0e0;
    background: #f8f9fa;
    flex-shrink: 0;
}

.workcenter__content {
    flex: 1;
    overflow: auto;
    padding: 1rem;
}

.workcenter__footer {
    padding: 1rem;
    border-top: 1px solid #e0e0e0;
    flex-shrink: 0;
}
```

**After:**
```scss
/**
 * Workcenter View - Base Layout
 * 
 * Layer: view.layout
 * 
 * Defines the main layout structure for workcenter view:
 * - Vertical flexbox with header/content/footer
 * - Header: controls and title (fixed height)
 * - Content: scrollable main area
 * - Footer: status/info bar (optional)
 */

@use "fest/shared/scss-custom-properties" as props;

@layer view.layout {
    .workcenter {
        display: flex;
        flex-direction: column;
        height: 100%;
        gap: 0;
        background: var(--color-background);
        color: var(--color-text);
        
        /* Ensure isolated to workcenter view */
        :has([data-view="workcenter"]) & {
            /* View-specific isolation rules */
        }
    }
    
    .workcenter__header {
        display: flex;
        gap: var(--space-lg);
        padding: var(--space-md);
        border-bottom: 1px solid var(--color-border);
        background: var(--color-surface-secondary);
        flex-shrink: 0;
        transition: all var(--duration-base) var(--timing-ease);
    }
    
    .workcenter__content {
        flex: 1;
        overflow: auto;
        padding: var(--space-md);
        min-height: 0;
    }
    
    .workcenter__footer {
        padding: var(--space-md);
        border-top: 1px solid var(--color-border);
        background: var(--color-surface);
        flex-shrink: 0;
    }
}
```

**File: `views/workcenter/scss/_components.scss`**

**Before:**
```scss
.result-item {
    background: white;
    border: 1px solid #e0e0e0;
    border-left: 4px solid transparent;
    border-radius: 4px;
    padding: 1rem;
    margin-bottom: 0.5rem;
}

.result-item.success {
    border-left-color: #10a981;
    background: #f0fdf4;
}

.result-item.error {
    border-left-color: #ef4444;
    background: #fef2f2;
}

.result-item__title {
    font-size: 1rem;
    font-weight: 600;
    margin-bottom: 0.5rem;
}

.result-item__body {
    font-size: 0.875rem;
    color: #666;
    line-height: 1.5;
}
```

**After:**
```scss
/**
 * Workcenter View - Result Components
 * 
 * Layer: view.components
 * 
 * Provides styling for result items displayed in workcenter,
 * with semantic color coding for different states.
 */

@use "fest/shared/scss-custom-properties" as props;

@layer view.components {
    /* Main result item card */
    .result-item {
        background: var(--color-surface);
        border: 1px solid var(--color-border);
        border-left: 4px solid transparent;
        border-radius: var(--radius-md);
        padding: var(--space-md);
        margin-bottom: var(--space-sm);
        transition: all var(--duration-base) var(--timing-ease);
        
        &:hover {
            box-shadow: var(--shadow-sm);
        }
    }
    
    /* State variants using :is() */
    :is(.result-item.success) {
        border-left-color: var(--color-success);
        background: rgba(16, 169, 129, 0.05);
    }
    
    :is(.result-item.error) {
        border-left-color: var(--color-error);
        background: rgba(239, 68, 68, 0.05);
    }
    
    :is(.result-item.warning) {
        border-left-color: var(--color-warning);
        background: rgba(245, 158, 11, 0.05);
    }
    
    /* Title */
    .result-item__title {
        font: var(--typography-body-lg);
        font-weight: var(--font-weight-semibold);
        margin-bottom: var(--space-sm);
        color: var(--color-text);
    }
    
    /* Body content */
    .result-item__body {
        font: var(--typography-body-sm);
        color: var(--color-text-secondary);
        line-height: var(--line-height-normal);
        white-space: pre-wrap;
        word-break: break-word;
    }
}
```

## Context-Based Isolation Pattern

Use `:has()` selector to ensure view styles don't conflict:

```scss
@layer view.components {
    // General styles applied to all contexts
    .workcenter {
        /* ... */
    }
    
    // Context-specific overrides (only in workcenter view)
    :has([data-view="workcenter"]) {
        .workcenter {
            /* Context-specific tweaks */
        }
        
        /* View-specific component rules */
        .custom-component {
            /* ... */
        }
    }
}
```

## Theme Variant Styling

**File: `views/workcenter/scss/_theme-dark.scss`**

```scss
/**
 * Workcenter View - Dark Theme Variant
 * 
 * Layer: context.themes
 * 
 * Dark theme specific overrides for workcenter view.
 */

@layer context.themes {
    :has([data-theme="dark"]) {
        .workcenter {
            background: var(--color-background);
            
            &__header {
                background: var(--color-surface-secondary);
                border-color: var(--color-border);
            }
        }
    }
}
```

## Responsive Design Pattern

```scss
@layer view.components {
    .workcenter {
        /* Desktop (default) */
        
        @media (max-width: 1024px) {
            /* Tablet */
        }
        
        @media (max-width: 768px) {
            /* Mobile */
        }
    }
}
```

## Print Styles

**File: `views/workcenter/scss/_print.scss`**

```scss
/**
 * Workcenter View - Print Styles
 * 
 * Layer: context.print
 */

@layer context.print {
    @media print {
        .workcenter {
            &__header,
            &__footer {
                display: none;
            }
            
            &__content {
                overflow: visible;
                padding: 0;
            }
        }
    }
}
```

## Migration Checklist

For each shell/view:

- [ ] Create layer-based file structure
- [ ] Replace `@import` with `@use`
- [ ] Wrap CSS in appropriate `@layer`
- [ ] Add context selectors (`:has()`)
- [ ] Replace hard values with custom properties
- [ ] Use `:where()` for element selectors
- [ ] Use `:is()` for selector grouping
- [ ] Test with shell + view combination
- [ ] Test theme switching
- [ ] Test responsive breakpoints
- [ ] Test print view

## Example: View Initialization (TypeScript)

```typescript
/**
 * Workcenter View - Initialization
 */

import { loadAsAdopted } from 'fest/dom';
import type { View } from '../types';

/**
 * Load workcenter view styles
 */
async function loadViewStyles(): Promise<void> {
    // Load base layout
    const layoutStyle = await import('./scss/_layout.scss?inline');
    await loadAsAdopted(layoutStyle, 'view.layout');
    
    // Load component styles
    const componentStyle = await import('./scss/_components.scss?inline');
    await loadAsAdopted(componentStyle, 'view.components');
    
    // Load theme variants
    const darkThemeStyle = await import('./scss/_theme-dark.scss?inline');
    await loadAsAdopted(darkThemeStyle, 'context.themes');
    
    // Load print styles
    const printStyle = await import('./scss/_print.scss?inline');
    await loadAsAdopted(printStyle, 'context.print');
}

/**
 * Mount workcenter view
 */
export async function mountWorkcenterView(
    container: HTMLElement
): Promise<View> {
    // Load styles
    await loadViewStyles();
    
    // Set view attribute for context selectors
    container.setAttribute('data-view', 'workcenter');
    
    // Render view
    renderWorkcenterUI(container);
    
    return {
        id: 'workcenter',
        element: container,
        mount: () => { /* already mounted */ },
        unmount: () => cleanupWorkcenter()
    };
}
```

## File Organization Recommendations

```
apps/CrossWord/src/frontend/
├── main/
│   ├── boot-menu.scss        → shell.context
│   └── BootLoader.ts
│
├── shells/
│   ├── basic/
│   │   ├── index.ts          → Initialization
│   │   ├── index.scss        → Aggregator
│   │   ├── layout.scss       → shell.layout
│   │   ├── _components.scss  → shell.components
│   │   ├── _tokens.scss      → Shell tokens
│   │   └── _keyframes.scss   → Animations
│   │
│   ├── faint/
│   │   ├── index.ts
│   │   ├── faint.scss
│   │   └── scss/
│   │       ├── index.scss
│   │       ├── layout/
│   │       ├── inputs/
│   │       └── library/
│   │
│   └── raw/
│       └── raw.scss
│
├── views/
│   ├── workcenter/
│   │   ├── index.ts
│   │   ├── scss/
│   │   │   ├── _layout.scss      → view.layout
│   │   │   ├── _components.scss  → view.components
│   │   │   ├── _theme-dark.scss  → context.themes
│   │   │   └── _print.scss       → context.print
│   │   └── *.ts
│   │
│   ├── viewer/
│   ├── editor/
│   ├── explorer/
│   ├── settings/
│   ├── history/
│   ├── home/
│   └── airpad/
│
├── items/
│   └── _Cards.scss          → view.components
│
└── styles.ts                → Style system loader
```

## Related Documents

- `CSS_ARCHITECTURE_REFACTORING_PLAN.md` - Overall strategy
- `SCSS_REFACTORING_TEMPLATE.md` - General patterns
- `CSS_LAYER_INITIALIZATION_GUIDE.md` - Initialization sequence
- `VEELA_CSS_REFACTORING_GUIDE.md` - Framework reference
- `FLUI_STYLES_REFACTORING_GUIDE.md` - UI library reference
