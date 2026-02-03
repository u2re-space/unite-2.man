# 🎨 Comprehensive SCSS/CSS Coordination Strategy
## DOM Organization → CSS @layer Sequences → Multi-Agent Implementation

**Status**: Phase 2 Extended Refactoring  
**Created**: 2026-02-02  
**Updated**: Planning Stage  
**Scope**: 15-point comprehensive refactoring covering DOM structure, CSS architecture, and multi-agent coordination

---

## 📋 Executive Summary

This document coordinates all 15 requirements from the CSS/SCSS refactoring into a coherent, production-ready strategy that:

1. **Maps DOM generation** (from TS/JS modules) → **CSS @layer sequences** → **Multi-agent delivery**
2. **Establishes correct cascade order** aligned with runtime element creation
3. **Optimizes for scalability**, maintainability, and performance
4. **Enables parallel work** across multiple AI agents/developers

---

## 🌳 Part 1: DOM Tree Organization & Element Generation

### 1.1 TS/JS DOM Organization Model

From codebase analysis (`lur.e` framework), the DOM is generated through:

```
Frontend Application Layer
  ↓ (lure/Syntax.ts: htmlBuilder)
    ├─ JSX/H (createElement, htmlBuilder)
    │   └─ Creates DocumentFragment with elements
    ├─ E (Element creation - Bindings.ts)
    │   ├─ Attributes (attr:, @attr:)
    │   ├─ Properties (prop:, @prop:)
    │   ├─ Classes (classList)
    │   ├─ Styles (inline style)
    │   ├─ Events (on:, @event)
    │   ├─ Behaviors (data-mixin)
    │   ├─ ARIA (accessibility)
    │   └─ Slots (shadow DOM)
    └─ M (Mapped children rendering)
        └─ Renders into parent element hierarchy

DOM Tree Structure (Runtime):
  <html>
    ├─ <head> (static, managed separately)
    └─ <body>
        └─ #app-mount (root container)
            ├─ shell-root (shell layout)
            │   ├─ header (shell-specific)
            │   ├─ main/nav/sidebar
            │   └─ footer
            └─ current-view (dynamic, swapped)
                ├─ view-container
                │   └─ view-components (varies per view)
                └─ modals/overlays
```

### 1.2 Style Injection Points (TypeScript Runtime)

From `apps/CrossWord/src/frontend/views/styles.ts` pattern:

```typescript
// Layer initialization sequence (MUST follow DOM creation order)
export async function initializeStyles(document: Document) {
  // 1. System (browser resets) - IMMEDIATE
  injectLayer(document, 'system', systemResetCSS);
  
  // 2. Tokens (design system) - BEFORE any component styles
  injectLayer(document, 'tokens', tokenDefinitions);
  
  // 3. Base (global styles, html/body) - AFTER tokens
  injectLayer(document, 'base', baseGlobalStyles);
  
  // 4. Shell (layout, mounted immediately)
  injectShellStyles(document, currentShell); // → @layer shell
  
  // 5. View (after shell, when view mounts)
  onViewChange((viewName) => {
    injectViewStyles(document, viewName); // → @layer view
  });
  
  // 6. Components (throughout lifecycle, reactive)
  // Injected as components render
  
  // 7. Utilities (always available)
  injectLayer(document, 'utilities', utilityClasses);
  
  // 8. Overrides (emergency fixes, load last)
  injectLayer(document, 'overrides', overrideStyles);
}
```

### 1.3 Critical Timing Constraints

```
DOM Element Creation Timeline:
─────────────────────────────────────────────────────────────

TIME 0: Browser loads
  ├─ Parse HTML <head> (system layer CSS auto-loads here)
  └─ Parse HTML <body> (layout paint begins)

TIME 50ms: JavaScript executes
  ├─ Tokens & base styles MUST inject BEFORE first paint
  ├─ Shell layout renders (queries: html, body, :root)
  ├─ View initializes
  └─ Components mount

TIME 100-150ms: First paint (shells visible)
  ├─ :root custom properties available
  ├─ Shell layout constraints active
  └─ View styles can override shell

TIME 150-300ms: Interactions possible
  ├─ Components fully rendered
  ├─ Utilities active
  └─ Overrides ready if needed

CONSTRAINT: CSS @layer order MUST match this injection order
```

---

## 🎯 Part 2: 8-Layer CSS Cascade System

### 2.1 Layer Definitions & Purpose

| Layer | Purpose | CSS Examples | @use | Specificity | Load Order |
|-------|---------|--------------|------|-------------|-----------|
| `system` | Browser resets, normalize.css patterns | `*, *::before, *::after { box-sizing }` | EXTERNAL | 0 | FIRST (auto in <style>) |
| `tokens` | Design system, custom properties | `:root, html, body { --color-*, --space-* }` | SCSS lib | 0 | Early (pre-elements) |
| `base` | Global element styles | `body, h1-h6, p, a, input, button` | SCSS lib | 1 (element selectors) | After tokens |
| `shell` | Shell/layout specific | `.shell-faint { }`, `.shell-main-layout { }` | Shell modules | 1-2 (classes) | When shell mounts |
| `view` | View-specific layout | `.view-editor { }`, `.view-viewer { }` | View modules | 1-2 (classes) | When view mounts |
| `components` | Reusable UI components | `.button { }`, `.card { }`, `.modal { }` | UI library | 2-3 (classes/descendants) | Lazily, per component |
| `utilities` | Utility classes | `.flex-center`, `.text-lg`, `.m-4` | Utilities lib | 2-3 | Always available |
| `overrides` | Emergency fixes | `.text-red { color: red !important; }` | Ad-hoc | 3+ (!important) | Last resort |

### 2.2 Layer Establishment in CSS Files

All CSS must declare its layer explicitly:

```scss
// ✅ CORRECT: Explicit layer declaration at top
@layer shell {
  .shell-container {
    display: grid;
  }
}

// ❌ WRONG: No layer declaration
.shell-container {
  display: grid;
}

// ✅ CORRECT for lib files (no layer for reusable mixins)
@mixin flex-center {
  display: flex;
  align-items: center;
  justify-content: center;
}

// ✅ CORRECT for token definitions (tokens are used by layered code)
$color-primary: #007bff;
$space-md: 1rem;
```

### 2.3 Correct @layer Loading Sequence

```scss
// 1. ROOT FILE (e.g., index.scss or app.scss)
// Establish layer order (MUST be first in compiled CSS)
@layer system, tokens, base, shell, view, components, utilities, overrides;

// 2. SYSTEM (browser resets)
@layer system {
  * { box-sizing: border-box; }
}

// 3. TOKENS (design system)
@layer tokens {
  :root {
    --color-primary: #007bff;
    --space-md: 1rem;
  }
}

// 4. BASE (global styles)
@layer base {
  body { font-family: var(--font-body); }
  h1 { font-size: var(--type-h1); }
}

// 5. SHELL (when shell mounts)
// → imported from: shells/{shell-name}/index.scss
@layer shell {
  .shell-faint { ... }
}

// 6. VIEW (when view mounts)
// → imported from: views/{view-name}/index.scss
@layer view {
  .view-editor { ... }
}

// 7. COMPONENTS (as mounted)
// → from: modules/projects/fl.ui/src/styles/
@layer components {
  .button { ... }
  .card { ... }
}

// 8. UTILITIES (always)
// → from: modules/projects/fl.ui/src/styles/utilities/
@layer utilities {
  .flex-center { @include mixin.flex-center(); }
}

// 9. OVERRIDES (last)
@layer overrides {
  .text-red { color: red !important; }
}
```

---

## 📦 Part 3: SCSS Module Structure & @use Organization

### 3.1 Complete Module Hierarchy

```
modules/projects/
├─ veela.css/                           # CSS Framework (NO CODE, DOCS ONLY)
│   ├─ README.md
│   └─ src/scss/
│       └─ (folder empty - for future reference documentation)
│
└─ fl.ui/                               # UI System (MAIN IMPLEMENTATION)
    ├─ src/styles/
    │   ├─ _lib/                        # ✨ SHARED LIBRARY (core utilities)
    │   │   ├─ index.scss               # @forward aggregator
    │   │   ├─ _variables.scss          # Design tokens (NO @layer)
    │   │   ├─ _functions.scss          # SCSS functions (NO @layer)
    │   │   ├─ _mixins.scss             # SCSS mixins (NO @layer)
    │   │   ├─ _breakpoints.scss        # Responsive mixins (NO @layer)
    │   │   └─ components/              # Component-specific mixins
    │   │       ├─ _button.scss
    │   │       ├─ _card.scss
    │   │       └─ ...
    │   │
    │   ├─ layers/                      # 🎯 LAYER DEFINITIONS
    │   │   ├─ _system.scss             # @layer system { ... }
    │   │   ├─ _tokens.scss             # @layer tokens { :root { ... } }
    │   │   ├─ _base.scss               # @layer base { ... }
    │   │   ├─ _components.scss         # @layer components { ... }
    │   │   └─ _utilities.scss          # @layer utilities { ... }
    │   │
    │   └─ index.scss                   # ROOT AGGREGATOR
    │       └─ Orchestrates all imports & @layer order
    │
    ├─ src/services/                    # TypeScript style injection
    │   ├─ StyleManager.ts              # Manages @layer injection
    │   └─ LayerInitializer.ts          # Initializes layer sequence
    │
    └─ README.md

apps/CrossWord/
├─ src/frontend/
│   ├─ main/                            # Entry point
│   │   ├─ styles.ts                    # Style initialization
│   │   └─ index.tsx                    # App bootstrap
│   │
│   ├─ shells/                          # Shell layouts
│   │   ├─ basic/
│   │   │   ├─ index.scss               # ROOT: declares @layer shell
│   │   │   ├─ basic.scss               # LAYOUT (@layer shell)
│   │   │   ├─ _tokens.scss             # TOKENS (@layer tokens)
│   │   │   ├─ _components.scss         # COMPONENTS (@layer components)
│   │   │   ├─ _keyframes.scss          # ANIMATIONS (@layer tokens)
│   │   │   └─ layout/
│   │   │       └─ Views.ts             # TS mounting point
│   │   │
│   │   ├─ faint/                       # Similar structure
│   │   │   ├─ index.scss
│   │   │   ├─ faint.scss
│   │   │   ├─ _tokens.scss
│   │   │   └─ ...
│   │   │
│   │   └─ raw/
│   │       ├─ index.scss
│   │       └─ raw.scss
│   │
│   ├─ views/                           # View pages
│   │   ├─ viewer/
│   │   │   ├─ index.scss               # ROOT: declares @layer view
│   │   │   ├─ viewer.scss              # LAYOUT (@layer view)
│   │   │   ├─ _tokens.scss             # VIEW-SPECIFIC (@layer tokens)
│   │   │   └─ Viewer.tsx               # TS component
│   │   │
│   │   ├─ editor/
│   │   │   ├─ index.scss
│   │   │   ├─ editor.scss
│   │   │   └─ ...
│   │   │
│   │   └─ ...other views...
│   │
│   └─ styles/                          # Global styles
│       ├─ shared/
│       │   └─ _tokens.scss             # SHARED TOKENS (@layer tokens)
│       ├─ _lib.scss                    # Re-export fest/fl-ui libs
│       └─ index.scss                   # ROOT ORCHESTRATOR
```

### 3.2 Correct @use Import Pattern

```scss
// ✅ SHELL: shells/basic/index.scss
@use "fest/fl-ui/styles/lib" as lib;
@use "fest/fl-ui/styles/layers/tokens" as sys-tokens;
@use "fest/fl-ui/styles/layers/base" as sys-base;

@layer shell, view, components, utilities;

// Import @layer-wrapped styles
@use "./basic" as *;        // includes @layer shell { ... }
@use "./_tokens" as *;      // includes @layer tokens { ... }
@use "./_keyframes" as *;   // includes @layer tokens { ... }
@use "./_components" as *;  // includes @layer components { ... }


// ✅ VIEW: views/editor/index.scss
@use "fest/fl-ui/styles/lib" as lib;

@layer view, components, utilities;

@use "./editor" as *;       // includes @layer view { ... }
@use "./_tokens" as *;      // includes @layer tokens { ... }


// ✅ APP: apps/CrossWord/src/frontend/styles/index.scss
// ROOT AGGREGATOR - establish complete layer order
@layer 
  system,    // Reset layer
  tokens,    // Design tokens
  base,      // Global element styles
  shell,     // Shell/layout
  view,      // View/page styles
  components,// UI components
  utilities, // Utility classes
  overrides; // Emergency fixes

// Import organized by layer

// 1. System
@use "fest/fl-ui/styles/layers/system" as *;

// 2. Tokens (shared + shell-specific)
@use "fest/fl-ui/styles/layers/tokens" as *;
@use "./shared/_tokens" as *;

// 3. Base
@use "fest/fl-ui/styles/layers/base" as *;

// 4-6. Shell/View/Components (dynamic - mounted per TypeScript)
// NOTE: These are imported IN TypeScript when needed

// 7. Utilities
@use "fest/fl-ui/styles/layers/utilities" as *;

// 8. Overrides (last)
@layer overrides {
  // Only emergency fixes here
}
```

### 3.3 Library Files (NO @layer - for reuse)

```scss
// ✅ LIBRARY: _lib/functions.scss (NO @layer)
@function rem($px) {
  @return $px / 16px * 1rem;
}

// ✅ LIBRARY: _lib/mixins.scss (NO @layer)
@mixin flex-center {
  display: flex;
  align-items: center;
  justify-content: center;
}

// ✅ LIBRARY: _lib/variables.scss (NO @layer)
$color-primary: #007bff;
$space-md: 1rem;

// ✅ LIBRARY AGGREGATOR: _lib/index.scss (NO @layer, just @forward)
@forward "variables" as v-*;
@forward "functions" as func-*;
@forward "mixins" as mixin-*;
@forward "breakpoints" as bp-*;
```

---

## 🎯 Part 4: Context-Aware Selectors & Conflict Prevention

### 4.1 Problem: Shell/View Overlap

Without proper context, styles can conflict:

```scss
// ❌ PROBLEM: Both .header and h1 styles might conflict
// shells/basic/basic.scss
@layer shell {
  .header { background: blue; }
  h1 { color: white; }
}

// views/editor/editor.scss
@layer view {
  .header { background: green; }  // ← CONFLICT! Which wins?
  h1 { color: black; }            // ← CONFLICT!
}
```

### 4.2 Solution: :has() Context Selectors

```scss
// ✅ SOLUTION: Scoped to shell context
// shells/basic/basic.scss
@layer shell {
  :root:has(body[data-shell="basic"]) {
    --shell-header-bg: blue;
  }
  
  body[data-shell="basic"] .header {
    background: var(--shell-header-bg);
  }
}

// views/editor/editor.scss
@layer view {
  :root:has(body[data-view="editor"]) {
    --view-header-bg: green;
  }
  
  body[data-view="editor"] .header {
    background: var(--view-header-bg);
  }
}

// ✅ TypeScript: Set context attributes
document.body.setAttribute('data-shell', 'basic');
onViewChange((view) => {
  document.body.setAttribute('data-view', view.name);
});
```

### 4.3 :where() and :is() for Unification

```scss
// ✅ USE :where() for zero specificity
@layer components {
  // Selector specificity: 0,1,0 (due to :where)
  :where(.button, [role="button"]) {
    padding: 0.5rem 1rem;
    border: none;
  }
}

// ✅ USE :is() for explicit specificity matching
@layer utilities {
  // Matches .button or .btn-primary (specificity: 0,1,0)
  :is(.button, .btn-primary).large {
    font-size: 1.25rem;
  }
}

// ✅ USE :has() for parent context
@layer shell {
  // "When body has data-shell=faint, apply these rules"
  body:has([data-shell="faint"]) {
    --shell-bg: #f5f5f5;
  }
}
```

---

## 🔄 Part 5: TypeScript Style Injection Pipeline

### 5.1 Style Injection Service Architecture

```typescript
// services/StyleManager.ts
export class StyleManager {
  private injectedLayers = new Map<string, CSSStyleSheet>();
  private layerOrder = [
    'system', 'tokens', 'base', 'shell', 'view', 'components', 'utilities', 'overrides'
  ];

  /**
   * Initialize layer order in document
   * MUST be called before any other layer injection
   */
  initializeLayerOrder(doc: Document) {
    const sheet = new CSSStyleSheet();
    sheet.insertRule(`@layer ${this.layerOrder.join(', ')};`, 0);
    doc.adoptedStyleSheets.push(sheet);
  }

  /**
   * Inject a layer with SCSS-compiled CSS
   */
  injectLayer(name: string, cssText: string, doc: Document) {
    const sheet = new CSSStyleSheet();
    
    // Parse CSS text and ensure @layer wrapper
    const layered = cssText.includes(`@layer ${name}`)
      ? cssText
      : `@layer ${name} { ${cssText} }`;
    
    sheet.insertRule(layered, 0);
    doc.adoptedStyleSheets.push(sheet);
    this.injectedLayers.set(name, sheet);
  }

  /**
   * Swap styles (e.g., when changing shells or views)
   */
  replaceLayerContent(name: string, newCssText: string, doc: Document) {
    const existing = this.injectedLayers.get(name);
    if (existing) {
      doc.adoptedStyleSheets = doc.adoptedStyleSheets.filter(s => s !== existing);
    }
    this.injectLayer(name, newCssText, doc);
  }
}

// services/LayerInitializer.ts
export async function initializeStyleLayers(doc: Document) {
  const manager = new StyleManager();
  
  // 1. Establish layer order (MUST be first)
  manager.initializeLayerOrder(doc);
  
  // 2. Inject static layers
  manager.injectLayer('system', await import('@generated/system.css?raw'));
  manager.injectLayer('tokens', await import('@generated/tokens.css?raw'));
  manager.injectLayer('base', await import('@generated/base.css?raw'));
  manager.injectLayer('utilities', await import('@generated/utilities.css?raw'));
  
  return manager;
}

// apps/CrossWord/src/frontend/main/styles.ts
export async function setupStyleSystem(doc: Document) {
  const styleManager = await initializeStyleLayers(doc);
  
  // When shell changes
  onShellChange((shell) => {
    const shellCSS = await import(`../shells/${shell.name}/dist/index.css?raw`);
    styleManager.injectLayer('shell', shellCSS);
  });
  
  // When view changes
  onViewChange((view) => {
    const viewCSS = await import(`../views/${view.name}/dist/index.css?raw`);
    styleManager.replaceLayerContent('view', viewCSS, doc);
  });
}
```

### 5.2 Build-Time SCSS to CSS Pipeline

```bash
# Build SCSS files with layer preservation

# 1. Compile shell SCSS
sass shells/basic/index.scss dist/shells/basic.css --load-path=node_modules

# 2. Compile view SCSS
sass views/editor/index.scss dist/views/editor.css --load-path=node_modules

# 3. Verify layer declarations
grep -r "@layer" dist/ | grep -E "(system|tokens|base|shell|view|components|utilities)"

# 4. Optimize: combine layers at build time if needed
# (Keep separate for dynamic injection)
```

---

## 📊 Part 6: 15-Point Requirements Implementation Map

### Requirement 1: Multi-Agent Coordination
**Status**: ✅ Enabled  
**How**: This document establishes clear layer boundaries and file organization

```
Agent 1: SCSS Foundation
  ├─ Implements: _lib/ (functions, mixins, variables)
  ├─ File: modules/projects/fl.ui/src/styles/_lib/
  └─ Produces: Reusable utilities (NO @layer)

Agent 2: Shell Architecture
  ├─ Implements: shells/{basic,faint,raw}
  ├─ Files: apps/CrossWord/src/frontend/shells/*/
  └─ Wraps: @layer shell { ... }

Agent 3: View Styles
  ├─ Implements: views/{*}
  ├─ Files: apps/CrossWord/src/frontend/views/*/
  └─ Wraps: @layer view { ... }

Agent 4: Components Library
  ├─ Implements: @layer components { ... }
  ├─ Files: modules/projects/fl.ui/src/styles/layers/_components.scss
  └─ Wraps: Button, Card, Modal, etc.

Agent 5: Documentation & Validation
  ├─ Validates: Layer order, @use imports, conflicts
  ├─ Produces: Style guide, checklist
  └─ Ensures: Zero regressions
```

### Requirement 2: Script-Based Layer Sequence Generation
**Status**: ✅ Ready  
**Implementation**:

```typescript
// Generate @layer order from configuration
export function generateLayerSequence(config: LayerConfig): string {
  const order = config.layers.join(', ');
  return `@layer ${order};`;
}

// auto-generate.ts
const layerSequence = generateLayerSequence({
  layers: ['system', 'tokens', 'base', 'shell', 'view', 'components', 'utilities', 'overrides'],
  sourceDir: './styles',
  outputFile: './dist/layer-order.css'
});
```

### Requirement 3: Convert @import to @use
**Status**: ✅ Required  
**Implementation**: See section 3.2 - SCSS Module Structure

```scss
// ❌ OLD
@import "./variables";
@import "./mixins";

// ✅ NEW
@use "./variables" as var;
@use "./mixins" as mixin;

// Usage
color: var.$primary;
@include mixin.flex-center();
```

### Requirement 4: Wrap Styles with @layer
**Status**: ✅ Required  
**Except**: Library files (_lib/ - variables, functions, mixins)

```scss
// ✅ DO THIS
@layer shell {
  .container { /* ... */ }
}

// ❌ DON'T DO THIS
.container { /* ... */ }

// ✅ BUT NOT FOR LIBS
@mixin flex-center { /* no @layer */ }
$token-value: 1rem; /* no @layer */
```

### Requirement 5: Dedicated Custom Properties Modules
**Status**: ✅ Required  
**Structure**:

```
styles/
├─ layers/
│   └─ _tokens.scss
│       @layer tokens {
│         :root { --color-*, --space-*, ... }
│       }
└─ _lib/
    └─ _variables.scss (design tokens, NO @layer)
        $color-primary: #007bff;
        $space-md: 1rem;
```

### Requirement 6: :has(...) Context Selectors
**Status**: ✅ Pattern Established  
**Usage**: See section 4.2-4.3

```scss
:root:has(body[data-shell="faint"]) {
  --shell-bg: #f5f5f5;
}
```

### Requirement 7: Correct CSS @layer Loading Order
**Status**: ✅ Defined  
**Order**: system → tokens → base → shell → view → components → utilities → overrides

### Requirement 8: Better @layer Naming
**Status**: ✅ Standardized  
**Names**: `system`, `tokens`, `base`, `shell`, `view`, `components`, `utilities`, `overrides`

### Requirement 9: Cleanup & Trim Styles
**Status**: 📌 TBD  
**Process**:
1. Find all duplicate selectors
2. Consolidate into shared tokens
3. Verify no unused custom properties

### Requirement 10: Regroup & Cleanup
**Status**: 📌 TBD  
**Process**:
1. Organize selectors by component/feature
2. Group related properties
3. Remove verbose nesting

### Requirement 11: SCSS Mixins/Functions Optimization
**Status**: 📌 TBD  
**Process**:
1. Extract common patterns into mixins
2. Document parameters
3. Create @forward index

### Requirement 12: Fix Broken SCSS Modules
**Status**: 📌 TBD  
**Actions**: Identified in Phase 2 plan

### Requirement 13: Improve SCSS Nesting
**Status**: 📌 TBD  
**Pattern**: Flatten 3+ levels of nesting, use BEM for clarity

### Requirement 14: Validate @use Imports
**Status**: ✅ Pattern Established  
**Validation**:
```bash
# Check all @use statements
grep -r "@use" --include="*.scss" | sort | uniq

# Verify paths exist
grep -r "@use.*fest/" --include="*.scss"

# Check no circular imports
# (SCSS will error if circular - let compiler catch)
```

### Requirement 15: Apply :where() & :is()
**Status**: ✅ Pattern Established  
**Usage**: See section 4.3

---

## 🎬 Part 7: Execution Roadmap

### Phase 2.1: Foundation (Week 1)

**Task**: Implement requirements 1-8, 14 (foundation architecture)

```
Day 1: Layer Order & Core Lib
├─ [ ] Establish @layer order in app root
├─ [ ] Create _lib/ with functions, mixins, variables
├─ [ ] Create layers/ directory with @layer wrappers
└─ [ ] Document in style guide

Day 2: Convert to @use
├─ [ ] Convert all @import to @use in shells/
├─ [ ] Convert all @import to @use in views/
└─ [ ] Verify no linter errors

Day 3-4: Shells Refactoring
├─ [ ] Refactor shells/basic (reference pattern)
├─ [ ] Refactor shells/faint
├─ [ ] Refactor shells/raw
└─ [ ] Test all shell transitions

Day 5: Context Selectors & Validation
├─ [ ] Add :has() context to shells
├─ [ ] Add :has() context to views
├─ [ ] Validate @layer order in compiled CSS
└─ [ ] Create validation script
```

### Phase 2.2: Views & Cleanup (Week 2-3)

**Task**: Apply requirements 9-13 to views

```
Week 2:
├─ Refactor 3-5 view styles
├─ Apply context selectors
├─ Group selectors by component
└─ Remove nesting where possible

Week 3:
├─ Refactor remaining views
├─ Deduplicate tokens
├─ Optimize mixins/functions
└─ Final validation
```

### Phase 2.3: Validation & Documentation (Week 4)

**Task**: Requirement 15 + comprehensive testing

```
├─ [ ] Apply :where()/:is() patterns
├─ [ ] Run full linter check
├─ [ ] Performance testing
├─ [ ] Accessibility audit
├─ [ ] Update documentation
└─ [ ] Team training
```

---

## ✅ Success Criteria

- [ ] **8-layer system** fully implemented and documented
- [ ] **All SCSS** uses `@use` (zero `@import`)
- [ ] **All styles** wrapped with `@layer` (except libs)
- [ ] **Custom properties** in dedicated modules
- [ ] **Context selectors** (:has) prevent conflicts
- [ ] **Correct loading order** verified
- [ ] **Layer naming** clear and consistent
- [ ] **No duplicates** in styles or tokens
- [ ] **Reusable mixins** documented and exported
- [ ] **SCSS nesting** 2 levels max (BEM at surface)
- [ ] **All imports** in correct order (@use)
- [ ] **:where()/:is()** used for unification
- [ ] **Zero linter errors**
- [ ] **All tests pass**
- [ ] **Documentation complete**

---

## 📚 Related Documents

- `QUICK_START.txt` – Quick reference
- `SCSS_REFACTORING_GUIDE.md` – Step-by-step instructions
- `CSS_LAYERS_STRATEGY.md` – Layer philosophy
- `SCSS_MODULARIZATION_OPTIMIZATION_GUIDE.md` – Code patterns
- `PHASE_2_EXTENDED_REFACTORING_PLAN.md` – Detailed tasks

---

**Created by**: CSS Architecture Team  
**Status**: 🎯 Ready for Implementation  
**Next Steps**: Begin Phase 2.1 with Agent 1 (SCSS Foundation)
