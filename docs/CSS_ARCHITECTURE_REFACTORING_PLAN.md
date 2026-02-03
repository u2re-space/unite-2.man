# CSS Architecture Refactoring - Complete Plan

## Overview
This document outlines a comprehensive refactoring of the CSS/SCSS architecture across the U2RE.space project to implement proper `@layer` cascading, migrate from `@import` to `@use`, and establish a correct DOM/style initialization sequence.

## Current State Analysis

### Veela CSS
- **Path**: `modules/projects/veela.css/src/scss/`
- **Layers**: Defined in `runtime/_layers.scss` (ux-normalize, ux-tokens, ux-base, ux-layout, ux-components, ux-utilities, ux-theme, ux-overrides)
- **Structure**: 
  - `lib/` - SCSS library (core, basic, advanced)
  - `runtime/` - Runtime styles for different variants
- **Issue**: Uses `@forward` but lacks proper `@layer` wrapping in some files

### FL.UI
- **Path**: `modules/projects/fl.ui/src/styles/`
- **Layers**: Defined in `layers.scss` (ux-layer.u2-normalize, ux-layer.ux-agate, ux-ctm, ux-classes, ui-window-frame)
- **Structure**:
  - `core/` - Core mixins and utilities
  - `components/` - Component styles
  - `adapters/` - Veela and core adapters
  - `lib/` - Library layer
- **Issue**: Incomplete layer definitions, service styles not properly layered

### CrossWord Frontend
- **Path**: `apps/CrossWord/src/frontend/`
- **Shells**: basic, faint, raw
- **Views**: viewer, workcenter, settings, editor, explorer, history, home, airpad, from-faint
- **Issue**: 
  - Inconsistent layer usage
  - No context-based rules with `:has()`
  - Views/shells may conflict in styling
  - Not organized by initialization sequence

## Refactoring Strategy

### Phase 1: Foundation Layer Architecture

#### 1.1 Define Unified @layer Order
Create a consistent layer hierarchy across all modules:

```
@layer
    /* System Layers - Never override */
    system.normalize,
    system.tokens,
    system.reset,
    
    /* Runtime Core - Base framework styles */
    runtime.core.layout,
    runtime.core.base,
    runtime.core.components,
    runtime.core.utilities,
    
    /* Shell Layer - Application shell/frame */
    shell.layout,
    shell.components,
    shell.utilities,
    
    /* View Layer - Specific view styles */
    view.layout,
    view.components,
    view.utilities,
    
    /* Context/Feature Layers */
    context.themes,
    context.overrides;
```

#### 1.2 Replace @import with @use
- Migrate all `@import` statements to `@use`
- Establish proper namespace conventions
- Use `@forward` for re-exports

#### 1.3 Create Custom Properties Modules
Separate CSS custom property definitions:
- `custom-properties/system.scss` - System-level tokens
- `custom-properties/shell.scss` - Shell-specific tokens
- `custom-properties/view.scss` - View-specific tokens
- All wrapped with appropriate `@layer`

### Phase 2: Veela CSS Refactoring

#### 2.1 Migrate to @use Pattern
- Replace all `@import` with `@use`
- Establish namespace conventions

#### 2.2 Proper Layer Wrapping
- Wrap all runtime styles with correct `@layer`
- Ensure library files (vars, mixins, functions) are layer-free

#### 2.3 Layer Organization
```
system.normalize - Reset/normalize styles
system.tokens - Design tokens registration
runtime.core.layout - Core layout system
runtime.core.base - Base element styles
runtime.core.components - Component foundations
runtime.core.utilities - Utility classes
```

### Phase 3: FL.UI Refactoring

#### 3.1 Service Styles Organization
- FileManager services need proper layer assignment
- Context-based with `:has()` selectors

#### 3.2 Adapter Integration
- Ensure adapters properly forward to selected layer
- Clear separation between veela and core adapters

#### 3.3 Custom Properties
- Centralize CSS variable definitions
- Separate by concern (layout, color, typography, etc.)

### Phase 4: CrossWord Frontend Refactoring

#### 4.1 Shell Layer Architecture
Each shell (basic, faint, raw) should:
- Define shell-specific layers
- Use context-based `:has()` for isolation
- Properly sequence initialization

#### 4.2 View Organization
Views should:
- Load after shell initialization
- Use view-specific layers
- Use `:has()` to avoid conflicts with other views

#### 4.3 Initialization Sequence
```
1. System layers (normalize, tokens, reset)
2. Runtime core (layout, base, components, utilities)
3. Shell selection and loading:
   - shell.layout
   - shell.components
   - shell.utilities
4. View loading:
   - view.layout
   - view.components
   - view.utilities
5. Context/theme overrides
```

### Phase 5: Context-Based Rules with :has()

#### 5.1 Shell Isolation
```scss
// Faint shell specific
@layer shell {
    :has([data-shell="faint"]) {
        /* faint-specific rules */
    }
}
```

#### 5.2 View Isolation
```scss
// Workcenter view specific
@layer view {
    :has([data-view="workcenter"]) {
        /* workcenter-specific rules */
    }
}
```

#### 5.3 Feature Flags
```scss
// Theme variant specific
@layer context.themes {
    :has([data-theme="dark"]) {
        /* dark theme rules */
    }
}
```

### Phase 6: Selector Optimization

#### 6.1 Nesting Improvements
- Use proper SCSS nesting for readability
- Group related selectors
- Apply `:is()` and `:where()` for selector unification

#### 6.2 Redundancy Cleanup
- Identify and merge duplicate selectors
- Consolidate similar rules
- Remove overridden properties

#### 6.3 Specificity Control
```scss
// Use :where() to avoid specificity issues
:where(.component) {
    /* 0 specificity */
}

// Use :is() when specificity needed
:is(.component, .variant) {
    /* applies with lowest matching selector specificity */
}
```

## Implementation Roadmap

### Step 1: Create Architecture Documentation
- [ ] Layer hierarchy definition
- [ ] Import conventions
- [ ] Context-based selector patterns
- [ ] File organization guide

### Step 2: Create Shared Layer Definition Module
- [ ] `modules/shared/scss-layers/_layers.scss` - Unified layer order
- [ ] `modules/shared/scss-custom-properties/` - Custom properties by concern
- [ ] Implementation guide for using shared layers

### Step 3: Refactor Veela CSS
- [ ] Migrate `@import` to `@use`
- [ ] Apply unified layer order
- [ ] Wrap runtime styles properly
- [ ] Test variant loading

### Step 4: Refactor FL.UI
- [ ] Update service styles with layers
- [ ] Fix adapter imports
- [ ] Add custom properties modules
- [ ] Test veela and core entry points

### Step 5: Refactor CrossWord Frontend
- [ ] Update shell initialization
- [ ] Apply layer structure to shells
- [ ] Add context-based rules to views
- [ ] Update style loading sequence

### Step 6: Cleanup & Optimization
- [ ] Remove duplicate/redundant styles
- [ ] Optimize selectors
- [ ] Improve nesting structure
- [ ] Final testing

### Step 7: Documentation & Validation
- [ ] Create implementation guide
- [ ] Document CSS variable registry
- [ ] Create migration checklist for new styles
- [ ] Set up linting rules

## Expected Benefits

1. **Predictable Cascade**: Explicit layer order prevents unexpected overrides
2. **Better Maintainability**: Clear separation of concerns and dependencies
3. **Reduced Specificity Wars**: Layers prevent specificity escalation
4. **Easier Testing**: Context-based rules enable feature isolation
5. **Performance**: Redundant rules can be safely removed
6. **Scalability**: New shells/views can follow established patterns
7. **Reduced CSS Size**: Better organization leads to better compression

## Success Metrics

- All SCSS files use `@use` instead of `@import`
- 100% of styles wrapped in appropriate `@layer`
- All views/shells use `:has()` context selectors
- Zero cascading conflicts between shells/views
- 15-20% reduction in CSS size (through cleanup)
- Clear documentation of style loading sequence
