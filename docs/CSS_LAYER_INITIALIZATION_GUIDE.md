# CSS Layer Initialization & Loading Sequence Guide

## Overview

This guide outlines the proper sequence for initializing CSS layers and loading styles in the U2RE.space application. Following this sequence ensures predictable cascade behavior and eliminates specificity conflicts.

## Layer Cascade Order

The following cascade order is defined in `modules/shared/scss-layers/_layers.scss` and **MUST** be maintained:

```
@layer
    system.normalize,
    system.tokens,
    system.reset,
    runtime.core.layout,
    runtime.core.base,
    runtime.core.components,
    runtime.core.utilities,
    shell.layout,
    shell.components,
    shell.utilities,
    shell.context,
    view.layout,
    view.components,
    view.utilities,
    view.context,
    context.features,
    context.themes,
    context.accessibility,
    context.print,
    context.overrides;
```

## Application Boot Sequence

### Phase 1: System Foundation (Executed FIRST)

```
┌─────────────────────────────────────────────┐
│ 1. SYSTEM LAYERS                            │
│                                             │
│ Load in order:                              │
│ ✓ system.normalize - Reset/normalize       │
│ ✓ system.tokens - Design token vars        │
│ ✓ system.reset - Additional resets         │
└─────────────────────────────────────────────┘
        ↓
   (HTML rendered with base styles)
```

**Files to load:**
- `modules/shared/scss-custom-properties/system.scss`
- `modules/shared/scss-custom-properties/colors.scss`
- `modules/shared/scss-custom-properties/typography.scss`

**TypeScript initialization:**
```typescript
import { initializeLayerSystem } from 'fest/dom/layer-manager';

await initializeLayerSystem({
    system: ['normalize', 'tokens', 'reset']
});
```

**When:** In `index.html` `<head>` or earliest boot phase

### Phase 2: Runtime Core Framework

```
┌─────────────────────────────────────────────┐
│ 2. RUNTIME CORE LAYERS                      │
│                                             │
│ Load in order:                              │
│ ✓ runtime.core.layout - Grid, flex, pos    │
│ ✓ runtime.core.base - Elements (h1, p, etc)│
│ ✓ runtime.core.components - Buttons, etc   │
│ ✓ runtime.core.utilities - Utility classes │
└─────────────────────────────────────────────┘
        ↓
   (Framework ready)
```

**Files to load:**
- `modules/projects/fl.ui/src/styles/core/*.scss`
- `modules/projects/veela.css/src/scss/runtime/core/*.scss` (if veela selected)

**When:** During app initialization, before shell selection

### Phase 3: Shell Selection & Loading

```
┌─────────────────────────────────────────────┐
│ 3. SELECT & LOAD SHELL                      │
│                                             │
│ Choose ONE of:                              │
│ ○ basic shell - Lightweight, minimal       │
│ ○ faint shell - Full-featured design sys   │
│ ○ raw shell - No shell, raw browser        │
│                                             │
│ Then load:                                  │
│ ✓ shell.layout - Shell structure           │
│ ✓ shell.components - Shell UI parts        │
│ ✓ shell.utilities - Shell utilities        │
│ ✓ shell.context - Theme/variant overly     │
└─────────────────────────────────────────────┘
        ↓
   (Shell rendered and interactive)
```

**Files to load (example for basic shell):**
- `apps/CrossWord/src/frontend/shells/basic/layout.scss`
- `apps/CrossWord/src/frontend/shells/basic/_components.scss`
- `apps/CrossWord/src/frontend/shells/basic/basic.scss`

**TypeScript pattern:**
```typescript
export async function loadShell(shellId: 'basic' | 'faint' | 'raw') {
    const { loadAsAdopted } = await import('fest/dom');
    
    switch(shellId) {
        case 'basic':
            const basicStyle = await import('./basic/layout.scss?inline');
            await loadAsAdopted(basicStyle, 'shell.layout');
            
            const basicComponents = await import('./basic/_components.scss?inline');
            await loadAsAdopted(basicComponents, 'shell.components');
            break;
            
        case 'faint':
            // Similar pattern...
            break;
    }
}
```

### Phase 4: View Loading & Mounting

```
┌─────────────────────────────────────────────┐
│ 4. SELECT & LOAD VIEW                       │
│                                             │
│ Choose view and load:                       │
│ ✓ view.layout - View structure/layout       │
│ ✓ view.components - View-specific UI        │
│ ✓ view.utilities - View utilities           │
│ ✓ view.context - View-specific overrides    │
└─────────────────────────────────────────────┘
        ↓
   (View rendered inside shell)
```

**Example for workcenter view:**
```typescript
export async function loadWorkcenterView(container: HTMLElement) {
    const { loadAsAdopted } = await import('fest/dom');
    
    // Load workcenter styles
    const workStyle = await import('./scss/workcenter.scss?inline');
    await loadAsAdopted(workStyle, 'view.components');
    
    // Mount view
    renderWorkcenter(container);
}
```

### Phase 5: Context & Theme Application

```
┌─────────────────────────────────────────────┐
│ 5. CONTEXT LAYERS (Optional)                │
│                                             │
│ Apply in order:                             │
│ ✓ context.features - Feature flags          │
│ ✓ context.themes - Theme variants           │
│ ✓ context.accessibility - A11y adjustments │
│ ✓ context.print - Print styles              │
│ ✓ context.overrides - Emergency fixes       │
└─────────────────────────────────────────────┘
        ↓
   (Final styling applied)
```

**Example for theme switching:**
```typescript
export async function applyTheme(theme: 'light' | 'dark') {
    const themeStyle = await import(`./themes/${theme}.scss?inline`);
    await loadAsAdopted(themeStyle, 'context.themes');
    
    // Update data attribute
    document.documentElement.setAttribute('data-theme', theme);
}
```

## Complete Initialization Example

```typescript
// boot-sequence.ts
import { initializeLayerSystem, getLayerManager } from 'fest/dom/layer-manager';
import { loadAsAdopted } from 'fest/dom';

/**
 * Complete boot sequence with proper layer initialization
 */
export async function bootApplication(
    container: HTMLElement,
    options: BootOptions
) {
    console.log('[Boot] Starting application initialization...');
    
    // Phase 1: Initialize layer cascade
    console.log('[Boot] Phase 1: Initializing system layers...');
    await initializeLayerSystem({
        system: ['normalize', 'tokens', 'reset']
    });
    
    // Phase 2: Load framework core
    console.log('[Boot] Phase 2: Loading runtime core...');
    const frostyleIndex = await import('modules:fl.ui/src/styles/index.scss?inline');
    await loadAsAdopted(frostyleIndex, 'runtime.core.base');
    
    // Phase 3: Load shell
    console.log(`[Boot] Phase 3: Loading ${options.shell} shell...`);
    const shellModule = await import(`./shells/${options.shell}/index.ts`);
    await shellModule.loadShell(container);
    
    // Phase 4: Load initial view
    console.log(`[Boot] Phase 4: Loading ${options.view} view...`);
    const viewModule = await import(`./views/${options.view}/index.ts`);
    await viewModule.loadView(container);
    
    // Phase 5: Apply theme
    console.log('[Boot] Phase 5: Applying theme...');
    await applyTheme(options.theme ?? 'light');
    
    console.log('[Boot] Application ready!');
}
```

## SCSS Module Pattern

Every SCSS module should follow this pattern:

```scss
/**
 * Module: Workcenter Styles
 * Layer: view.components
 * Dependencies: Uses fl.ui mixins from runtime.core
 */

// Import only what you need
@use "fest/fl-ui/core" as ui;
@use "../library/variables" as v;
@use "../library/mixins" as m;

// Wrap all styles in appropriate layer
@layer view.components {
    // Component styles
    .workcenter {
        @include ui.display('flex', 'column', 'stretch');
        
        &__header {
            // ...
        }
        
        &__content {
            // ...
        }
    }
    
    // Context-based rules to avoid conflicts
    :has([data-view="workcenter"]) {
        /* workcenter-specific overrides */
    }
}
```

## Best Practices

### ✅ DO:

1. **Always use @use, not @import**
   ```scss
   @use "fest/dom" as dom;  // ✓ Good
   @import "fest/dom";      // ✗ Bad
   ```

2. **Wrap styles in @layer**
   ```scss
   @layer view.components {
       .my-component { /* ... */ }
   }
   ```

3. **Use context selectors with :has()**
   ```scss
   :has([data-shell="faint"]) {
       /* faint-specific styles */
   }
   ```

4. **Use :where() for vendor resets**
   ```scss
   :where(button) {
       background: inherit;
   }
   ```

5. **Load styles in defined order**
   ```
   system → runtime → shell → view → context
   ```

### ❌ DON'T:

1. **Don't use !important**
   ```scss
   color: red !important;  // ✗ Breaks cascade
   ```

2. **Don't use extremely specific selectors**
   ```scss
   html body main .container .row .col span {  // ✗ Too specific
       color: blue;
   }
   ```

3. **Don't mix layer orders**
   ```scss
   @layer context.themes {
       /* Don't load shell styles here */
   }
   ```

4. **Don't load view styles before shell**
   ```
   Shell MUST load before View
   ```

5. **Don't forget context attributes**
   ```typescript
   // Set these attributes for context selectors to work
   element.setAttribute('data-shell', shellId);
   element.setAttribute('data-view', viewId);
   element.setAttribute('data-theme', theme);
   ```

## Debugging Layer Issues

### Check layer loading status:
```typescript
import { getLayerManager } from 'fest/dom/layer-manager';

const manager = getLayerManager();
console.log(manager.getStatus());  // See all layers and load status
```

### View layer order in CSS:
```javascript
// In browser devtools console
const sheets = document.styleSheets;
for (let sheet of sheets) {
    console.log(sheet.href);
    try {
        console.log(sheet.cssRules);
    } catch (e) {
        // Cross-origin stylesheet
    }
}
```

### Validate layer definitions:
```css
/* Should exist in <style> tags */
@layer system.normalize, system.tokens, system.reset;
@layer runtime.core.layout, runtime.core.base;
@layer shell.layout, shell.components;
@layer view.layout, view.components;
@layer context.themes, context.overrides;
```

## Migration Checklist

When adding new styles:

- [ ] Determine appropriate layer (system/runtime/shell/view/context)
- [ ] Use `@use` for imports, not `@import`
- [ ] Wrap all rules in `@layer layer-name { }`
- [ ] Use `:has()` for context-based scoping
- [ ] Avoid `!important`
- [ ] Keep specificity low
- [ ] Add comments indicating module purpose
- [ ] Load in correct sequence during boot

## Related Files

- `modules/shared/scss-layers/_layers.scss` - Layer definition
- `modules/shared/scss-custom-properties/` - Custom properties
- `modules/projects/dom.ts/src/layer-manager.ts` - Layer manager API
- `CSS_ARCHITECTURE_REFACTORING_PLAN.md` - Overall strategy

## References

- [MDN: CSS Cascade Layers](https://developer.mozilla.org/en-US/docs/Web/CSS/@layer)
- [CSS Cascade Layers Spec](https://www.w3.org/TR/css-cascade-5/#layering)
- [Using :has() Selector](https://developer.mozilla.org/en-US/docs/Web/CSS/:has)
- [Specificity Calculator](https://specificity.keegan.st/)
