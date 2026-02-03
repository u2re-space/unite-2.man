# CSS/SCSS Refactoring - Complete Execution Plan

**Status**: Phase 2 Implementation Planning  
**Last Updated**: February 2, 2026  
**Target**: Distributed AI Agent Coordination

---

## 🎯 Executive Summary

This document provides a **comprehensive execution framework** for coordinating multiple AI agents to refactor the CSS/SCSS architecture across:
- `modules/projects/veela.css/src/scss` (CSS Framework Layer)
- `modules/projects/fl.ui/src/styles` (UI System & Services)
- `apps/CrossWord/src/frontend/{views,shells,main}` (Application Views & Shells)

**Key Objectives** (from user requirements):
1. ✅ Implement CSS `@layer` hierarchy (system → tokens → base → shell → view → components → utilities → overrides)
2. ✅ Migrate from `@import` to `@use` SCSS modules
3. ✅ Wrap all SCSS/CSS in `@layer` declarations (except library code)
4. ✅ Create dedicated custom properties modules
5. ✅ Implement context-based `:root`/`html`/`body` rules with `:has(...)` selectors
6. ✅ Logically correct loading/init order (system → runtime/core → shell/index → view)
7. ✅ Better `@layer` naming for clarity
8. ✅ Use `:where()` and `:is()` for selector unification
9. ✅ Recover/repair broken SCSS modules
10. ✅ Cleanup/trim redundant styles

---

## 📊 Architecture Overview

### Layer Hierarchy (Cascade Order - Lowest to Highest)

```
SYSTEM        → Browser resets, normalize, box-sizing
↓
TOKENS        → CSS custom properties, keyframe definitions
↓
BASE          → Global typography, defaults, body rules
↓
SHELL         → Shell structure, layout framework
↓
VIEW          → View-specific layout and context
↓
COMPONENTS    → Reusable UI components, patterns
↓
UTILITIES     → Atomic helper classes (.p-md, .gap-lg)
↓
OVERRIDES     → Emergency fixes (rarely used)
```

### CSS Module Dependency Graph

```
veela.css (Framework)
  ├── system/
  │   ├── _normalize.scss (@layer system)
  │   ├── _reset.scss (@layer system)
  │   └── _box-model.scss (@layer system)
  ├── tokens/
  │   ├── _custom-properties.scss (@layer tokens)
  │   ├── _keyframes.scss (@layer tokens)
  │   └── _typography-tokens.scss (@layer tokens)
  ├── base/
  │   ├── _typography.scss (@layer base)
  │   ├── _forms.scss (@layer base)
  │   └── _links.scss (@layer base)
  └── index.scss (@layer declaration)

fl.ui (UI System)
  ├── components/
  │   ├── _button.scss (@layer components)
  │   ├── _card.scss (@layer components)
  │   └── ... (reusable components)
  ├── utilities/
  │   ├── _spacing.scss (@layer utilities)
  │   └── _display.scss (@layer utilities)
  └── index.scss

CrossWord (Application)
  ├── shells/
  │   ├── basic/
  │   │   ├── index.scss (@layer declaration)
  │   │   ├── _tokens.scss (@layer tokens)
  │   │   ├── _base.scss (@layer base)
  │   │   ├── _components.scss (@layer components)
  │   │   └── basic.scss (@layer shell)
  │   ├── faint/
  │   │   └── (similar structure)
  │   └── raw/
  │       └── (minimal structure)
  ├── views/
  │   ├── viewer/
  │   │   ├── _tokens.scss (@layer tokens, scoped to :root:has(.view-viewer))
  │   │   ├── _styles.scss (@layer view)
  │   │   └── index.scss
  │   ├── editor/
  │   │   └── (similar structure)
  │   └── ... (other views)
  └── main/
      └── boot-menu.scss (@layer shell)
```

---

## 🔧 SCSS Module System - Conversion Rules

### Rule 1: Replace `@import` with `@use`

**BEFORE** (deprecated):
```scss
@import "./colors";
@import "./spacing";
@import "./typography";

.element {
    color: $primary;
    padding: $spacing-md;
}
```

**AFTER** (modern):
```scss
@use "./colors" as color;
@use "./spacing" as space;
@use "./typography" as typo;

@layer components {
    .element {
        color: color.$primary;
        padding: space.$spacing-md;
    }
}
```

**Benefits:**
- Explicit namespacing prevents collisions
- Clear dependency graph
- Variables scoped to namespace
- Easier to refactor and test

### Rule 2: Declare `@layer` at File Root (Not Inside Rules)

**INCORRECT**:
```scss
// ❌ Don't do this
.button {
    @layer components {
        padding: 0.5rem;
    }
}
```

**CORRECT**:
```scss
// ✅ Do this
@layer components {
    .button {
        padding: 0.5rem;
    }
}
```

### Rule 3: Wrap Entire File in Single `@layer`

**INCORRECT**:
```scss
// ❌ File: _buttons.scss
@layer components {
    .button { ... }
}
@layer components {
    .button-small { ... }
}
```

**CORRECT**:
```scss
// ✅ File: _buttons.scss
@layer components {
    .button { ... }
    .button-small { ... }
    .button-large { ... }
}
```

### Rule 4: Import Order and `@forward`

**Using `@forward` for Public API**:
```scss
// lib/index.scss - Public exports
@forward "./colors" as color-*;
@forward "./spacing" as space-*;
@forward "./typography" as typo-*;
```

**Importing in Application**:
```scss
// app/styles.scss
@use "../lib" as design;

// Now access via design.color-primary, design.space-md, etc.
```

---

## 📋 Implementation Strategy - Distributed Agents

### Agent Role Distribution

**AGENT 1: Framework Refactoring** (`veela.css`)
- **Responsibility**: Refactor CSS framework layer
- **Tasks**:
  1. Create system layer (normalize, resets)
  2. Create tokens layer (custom properties, keyframes)
  3. Create base layer (typography, defaults)
  4. Set up `@use/@forward` system
  5. Document framework API

**AGENT 2: UI System Refactoring** (`fl.ui`)
- **Responsibility**: Refactor UI components layer
- **Tasks**:
  1. Refactor component styles with `@use`
  2. Implement `@layer components`
  3. Create utilities layer
  4. Setup service-related styles
  5. Coordinate with framework (AGENT 1)

**AGENT 3: Application - Shells** (CrossWord shells)
- **Responsibility**: Refactor shell styles
- **Tasks**:
  1. Refactor basic shell
  2. Refactor faint shell
  3. Refactor raw shell
  4. Implement context-based tokens
  5. Coordinate imports from UI system (AGENT 2)

**AGENT 4: Application - Views** (CrossWord views)
- **Responsibility**: Refactor view styles
- **Tasks**:
  1. Refactor viewer view
  2. Refactor editor view
  3. Refactor other views
  4. Implement `:has()` selectors
  5. Use `:where()` and `:is()` for unification

**AGENT 5: DOM/Element Organization** (TS/JS Modules)
- **Responsibility**: Coordinate DOM element generation with CSS layers
- **Tasks**:
  1. Document element tree structure
  2. Coordinate class naming conventions
  3. Setup layer initialization in TypeScript
  4. Create utilities for dynamic class management
  5. Ensure DOM tree matches CSS hierarchy

**AGENT 6: Quality & Integration** (Testing & Verification)
- **Responsibility**: Verify, test, and optimize
- **Tasks**:
  1. Verify layer cascade correctness
  2. Test style application
  3. Audit for redundant styles
  4. Performance analysis
  5. Documentation and hand-off

---

## 🔄 Execution Phases

### Phase 1: Foundation (Completed ✅)
- ✅ Layer strategy defined
- ✅ Documentation created
- ✅ Basic concepts established

### Phase 2A: Framework Setup (AGENT 1)
**Timeline**: Day 1-2

**Files to Create/Refactor**:
1. `modules/projects/veela.css/src/scss/index.scss`
   - Declare `@layer` order
   - Import all submodules via `@use`

2. `modules/projects/veela.css/src/scss/system/`
   - `_normalize.scss` (HTML normalize)
   - `_reset.scss` (box-sizing, margins)
   - `_box-model.scss` (grid/flex defaults)

3. `modules/projects/veela.css/src/scss/tokens/`
   - `_custom-properties.scss` (CSS vars)
   - `_keyframes.scss` (animations)
   - `_typography-tokens.scss` (font scales)

4. `modules/projects/veela.css/src/scss/base/`
   - `_typography.scss` (font-family, line-height)
   - `_forms.scss` (input styling)
   - `_links.scss` (hyperlink defaults)

**Deliverables**:
- ✅ Framework with correct layer order
- ✅ All code using `@use` modules
- ✅ Public API via `@forward`

---

### Phase 2B: UI System Refactoring (AGENT 2)
**Timeline**: Day 2-3

**Files to Create/Refactor**:
1. `modules/projects/fl.ui/src/styles/index.scss`
   - Declare `@layer` order
   - Import framework (veela.css)
   - Import all components

2. `modules/projects/fl.ui/src/styles/components/`
   - Refactor existing components with `@layer components`
   - Use `@use` imports
   - Remove duplication

3. `modules/projects/fl.ui/src/styles/utilities/`
   - Create atomic utilities
   - Use `@layer utilities`

4. `modules/projects/fl.ui/src/services/`
   - Ensure service-related styles coordinate

**Deliverables**:
- ✅ UI system with proper layering
- ✅ Components ready for application use
- ✅ Clear public API

---

### Phase 2C: Application Shells (AGENT 3)
**Timeline**: Day 3-4

**Files to Create/Refactor**:
1. Basic Shell: `apps/CrossWord/src/frontend/shells/basic/`
   - Create `index.scss` with layer declaration
   - Create `_tokens.scss` (shell tokens)
   - Create `_base.scss` (shell-specific base)
   - Refactor `basic.scss` with `@layer shell`
   - Organize with `@use` imports

2. Faint Shell: `apps/CrossWord/src/frontend/shells/faint/`
   - Similar structure to basic

3. Raw Shell: `apps/CrossWord/src/frontend/shells/raw/`
   - Minimal structure

**Deliverables**:
- ✅ Shells with correct layer order
- ✅ Context-based tokens using `:root:has()`
- ✅ All imports use `@use`

---

### Phase 2D: Application Views (AGENT 4)
**Timeline**: Day 4-5

**Files to Create/Refactor** (for each view):
1. `apps/CrossWord/src/frontend/views/{view}/index.scss`
   - Create root entry point
   - Import `_tokens.scss` and `_styles.scss`

2. `apps/CrossWord/src/frontend/views/{view}/_tokens.scss`
   - View-specific custom properties
   - Scoped with `:root:has(.view-{id})`

3. `apps/CrossWord/src/frontend/views/{view}/_styles.scss`
   - View layout and styling
   - Wrapped in `@layer view`

**Deliverables**:
- ✅ Views with proper context-based scoping
- ✅ Layer compliance across views
- ✅ Using `:where()` and `:is()` selectors

---

### Phase 2E: DOM/Element Organization (AGENT 5)
**Timeline**: Day 5-6

**Tasks**:
1. Document current DOM element tree structure
2. Analyze TypeScript/JavaScript module organization
3. Create layer initialization system
4. Document class naming conventions
5. Create utilities for dynamic styling

**Deliverables**:
- ✅ DOM tree documentation
- ✅ Element-to-layer mapping
- ✅ Layer initialization code

---

### Phase 2F: Quality & Integration (AGENT 6)
**Timeline**: Day 6-7

**Tasks**:
1. Verify CSS layer cascade correctness
2. Test style application across all shells/views
3. Audit for redundant or dead styles
4. Analyze performance metrics
5. Final documentation

**Deliverables**:
- ✅ Test report
- ✅ Performance metrics
- ✅ Final documentation

---

## 💻 Code Generation Patterns

### Pattern 1: Shell Index File

```scss
/**
 * Shell Index - Layer-based Architecture
 * @layer system, tokens, base, shell, view, components, utilities, overrides;
 * 
 * This file declares the cascade layer order and imports all shell modules.
 * Import order: tokens first (layer definition), then all others.
 */

@layer system, tokens, base, shell, view, components, utilities, overrides;

@use "../../../modules/projects/fl.ui" as ui;
@use "./keyframes" as kf;
@use "./tokens" as t;
@use "./base" as b;
@use "./components" as c;
@use "./shell-name" as shell;
@use "./layout" as layout;
```

### Pattern 2: Component File with `@layer`

```scss
/**
 * Component: Button Styles
 * Layer: components
 * Dependencies: tokens (colors, spacing)
 */

@use "../tokens" as t;
@use "../../../modules/projects/fl.ui/utilities" as u;

@layer components {
    .button {
        display: inline-flex;
        align-items: center;
        justify-content: center;
        padding: t.$spacing-md t.$spacing-lg;
        background-color: t.$color-primary;
        color: t.$color-on-primary;
        border: none;
        border-radius: t.$border-radius-md;
        font-weight: t.$font-weight-semibold;
        cursor: pointer;
        transition: background-color 0.2s ease-in-out;

        &:hover {
            background-color: t.$color-primary-dark;
        }

        &:focus {
            outline: 2px solid t.$color-focus;
            outline-offset: 2px;
        }

        &:active {
            background-color: t.$color-primary-darker;
        }

        // Variant: small
        &.button--small {
            padding: t.$spacing-sm t.$spacing-md;
            font-size: t.$font-size-sm;
        }

        // Variant: large
        &.button--large {
            padding: t.$spacing-lg t.$spacing-xl;
            font-size: t.$font-size-lg;
        }
    }
}
```

### Pattern 3: Tokens File with Context-Based `:has()`

```scss
/**
 * Tokens: Shell-specific Custom Properties
 * Layer: tokens
 * Scope: Scoped with :root:has() to shell element
 */

@layer tokens {
    /* Default tokens (no shell context) */
    :root {
        --color-primary: #007acc;
        --color-secondary: #6c757d;
        --color-surface: #ffffff;
        --color-on-surface: #000000;
    }

    /* Shell-specific tokens */
    :root:has(.shell-basic) {
        --shell-layout: grid;
        --shell-columns: auto 1fr auto;
        --shell-gap: 1rem;
    }

    :root:has(.shell-faint) {
        --shell-layout: flex;
        --shell-direction: column;
        --shell-gap: 0.5rem;
    }

    :root:has(.shell-raw) {
        --shell-layout: block;
    }

    /* View-specific tokens */
    :root:has(.view-viewer) {
        --view-padding: 2rem;
        --view-gap: 1.5rem;
    }

    :root:has(.view-editor) {
        --view-padding: 1rem;
        --view-gap: 1rem;
    }
}
```

### Pattern 4: Using `:where()` and `:is()` for Unification

```scss
/**
 * Selector Unification with :where() and :is()
 * These pseudo-classes don't contribute to specificity
 */

@layer components {
    /* Multiple selectors → unified styling */
    :where(.button, .btn, [role="button"]) {
        display: inline-flex;
        align-items: center;
        justify-content: center;
        cursor: pointer;
        border: none;
        padding: 0.5rem 1rem;
    }

    /* State pseudo-classes */
    :is(.button, .btn):where(:hover, :focus-visible) {
        background-color: var(--color-primary-dark);
        outline: 2px solid var(--color-focus);
    }

    /* Combining selectors */
    .card {
        :is(h1, h2, h3, h4, h5, h6) {
            margin-top: 0;
            color: var(--color-heading);
        }

        :where(p, li, dl, dd) {
            line-height: 1.6;
        }
    }
}
```

---

## 📊 Metrics & Quality Checks

### CSS Complexity Metrics

- **Layer Order**: 8 layers, strictly enforced
- **File Count**: Target <50 SCSS files (currently 80+)
- **Duplication**: Target <5% (currently 30-40%)
- **Bundle Size**: Target 20% reduction
- **Selector Specificity**: Max 2 (except components)

### Quality Checks

```bash
# 1. Find all @import statements (should be empty after refactoring)
grep -r "@import" apps/CrossWord/src/frontend --include="*.scss"

# 2. Verify @layer declarations
grep -r "@layer" apps/CrossWord/src/frontend --include="*.scss" | wc -l

# 3. Check for @use statements (should match all imports)
grep -r "@use" apps/CrossWord/src/frontend --include="*.scss" | wc -l

# 4. Find unused variables
grep -r "\$[a-z-]*" modules/projects --include="*.scss" | grep -v ":" | sort | uniq

# 5. Check bundle size
npm run build && du -h dist/styles.css

# 6. Verify no conflicting selectors
npx stylelint "apps/CrossWord/src/frontend/**/*.scss"
```

---

## 🚀 Getting Started - Quick Start Guide

### Step 1: Read This Document
- Understand the architecture
- Review the agent roles
- Familiarize yourself with patterns

### Step 2: Choose Your Agent Role
- **Framework** (AGENT 1): Start with `veela.css`
- **UI System** (AGENT 2): Work on `fl.ui` after AGENT 1
- **Shells** (AGENT 3): Refactor shells after AGENT 2
- **Views** (AGENT 4): Refactor views in parallel with AGENT 3
- **DOM Org** (AGENT 5): Start documentation while others code
- **Quality** (AGENT 6): Review and test after each phase

### Step 3: Follow the Phase Plan
- Focus on your assigned phase
- Follow the code patterns provided
- Update this document as you progress
- Communicate with other agents

---

## 📞 Coordination Checkpoints

### Checkpoint 1: Framework Complete (After AGENT 1)
- ✅ veela.css has correct layer order
- ✅ All code uses `@use` modules
- ✅ Public API documented
- **Next**: AGENT 2 starts work

### Checkpoint 2: UI System Complete (After AGENT 2)
- ✅ fl.ui imports framework correctly
- ✅ Components properly layered
- ✅ Utilities organized
- **Next**: AGENTS 3 & 4 start work

### Checkpoint 3: Shells & Views Complete (After AGENTS 3 & 4)
- ✅ Shell and view styles use new system
- ✅ Context-based tokens working
- ✅ No visual regressions
- **Next**: AGENT 5 & 6 final work

### Checkpoint 4: Documentation & Testing (After AGENT 6)
- ✅ All patterns working correctly
- ✅ Performance metrics acceptable
- ✅ Documentation complete
- **Status**: Project complete ✅

---

## 📚 Related Documentation

- `COMPLETE_CSS_REFACTORING_STRATEGY.md` - Detailed strategy
- `SCSS_REFACTORING_GUIDE.md` - SCSS patterns
- `COMPLETE_IMPLEMENTATION_CHECKLIST.md` - Detailed checklist

---

## 🔗 Key Files Reference

| Purpose | Path |
|---------|------|
| Framework Root | `modules/projects/veela.css/src/scss/index.scss` |
| UI System Root | `modules/projects/fl.ui/src/styles/index.scss` |
| Shell Template | `apps/CrossWord/src/frontend/shells/*/index.scss` |
| View Template | `apps/CrossWord/src/frontend/views/*/index.scss` |
| Layer Init | `apps/CrossWord/src/frontend/styles.ts` |

---

**Status**: Ready for distributed implementation  
**Last Updated**: February 2, 2026  
**Next**: Assign agents and begin Phase 2A (Framework Setup)
