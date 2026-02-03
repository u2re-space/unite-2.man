# 🤖 Multi-Agent CSS/SCSS Coordination Framework
## Distributed Development Model for 15-Point Refactoring

**Status**: Coordination Architecture  
**Created**: 2026-02-02  
**Purpose**: Enable multiple AI agents/developers to work in parallel on CSS architecture

---

## 🎯 Agent Roles & Responsibilities

### Agent 1: SCSS Foundation & Library Builder
**Primary Task**: Build reusable SCSS library  
**Deliverable**: `modules/projects/fl.ui/src/styles/_lib/`  
**Timeline**: Week 1 (Days 1-2)

#### Responsibilities:
- [ ] Create `_variables.scss` (design tokens - NO @layer)
- [ ] Create `_functions.scss` (SCSS functions - NO @layer)
- [ ] Create `_mixins.scss` (SCSS mixins - NO @layer)
- [ ] Create `_breakpoints.scss` (responsive mixins - NO @layer)
- [ ] Create `index.scss` (@forward aggregator)
- [ ] Document all exports with examples
- [ ] Add JSDoc comments to functions/mixins
- [ ] Create validation tests

#### Code Pattern:
```scss
// ✅ CORRECT: Library file (NO @layer)

// _variables.scss
$color-primary: #007bff;
$color-danger: #dc3545;
$space-xs: 0.25rem;
$space-sm: 0.5rem;
$space-md: 1rem;
$space-lg: 1.5rem;
$type-h1: 2.5rem;
$type-body: 1rem;

// _functions.scss
@function rem($px) {
  @return $px / 16px * 1rem;
}

@function strip-unit($number) {
  @return $number / ($number * 0 + 1);
}

// _mixins.scss
@mixin flex-center {
  display: flex;
  align-items: center;
  justify-content: center;
}

@mixin flex-between {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

@mixin transition($props...) {
  @each $prop in $props {
    transition: $prop 300ms cubic-bezier(0.4, 0, 0.2, 1);
  }
}

@mixin text-truncate {
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

// index.scss (aggregator)
@forward "variables" as var-*;
@forward "functions" as func-*;
@forward "mixins" as mixin-*;
@forward "breakpoints" as bp-*;
```

#### Dependencies:
- None (builds foundation)

#### Output:
- 5 SCSS files (400-500 lines total)
- JSDoc documentation
- Validation script

---

### Agent 2: Layer System Foundation & TypeScript Integration
**Primary Task**: Establish @layer order and system  
**Deliverable**: `modules/projects/fl.ui/src/styles/layers/`  
**Timeline**: Week 1 (Days 1-2, parallel with Agent 1)

#### Responsibilities:
- [ ] Create `_system.scss` (@layer system - browser resets)
- [ ] Create `_tokens.scss` (@layer tokens - custom properties)
- [ ] Create `_base.scss` (@layer base - global element styles)
- [ ] Create `_components.scss` (@layer components - reusable UI)
- [ ] Create `_utilities.scss` (@layer utilities - helper classes)
- [ ] Create `index.scss` (@forward aggregator)
- [ ] Create TypeScript `StyleManager.ts` (injection service)
- [ ] Create TypeScript `LayerInitializer.ts` (initialization service)

#### Code Pattern:
```scss
// ✅ CORRECT: Layer file (WITH @layer)

// _system.scss
@layer system {
  *,
  *::before,
  *::after {
    box-sizing: border-box;
  }

  html {
    -webkit-font-smoothing: antialiased;
    -moz-osx-font-smoothing: grayscale;
  }
}

// _tokens.scss
@layer tokens {
  :root {
    --color-primary: #007bff;
    --color-danger: #dc3545;
    --space-md: 1rem;
    --type-h1: 2.5rem;
    --type-body: 1rem;
  }
}

// _base.scss
@layer base {
  body {
    font-family: var(--font-family, sans-serif);
    font-size: var(--type-body);
    color: var(--color-text);
    background: var(--color-bg);
  }

  h1 { font-size: var(--type-h1); }
  h2 { font-size: 1.875rem; }
  h3 { font-size: 1.5rem; }

  a { color: var(--color-primary); }
  a:visited { color: var(--color-primary-dark); }
}

// _components.scss
@layer components {
  .button {
    padding: var(--space-sm) var(--space-md);
    border: none;
    border-radius: 0.25rem;
    background: var(--color-primary);
    color: white;
    cursor: pointer;
    @include mixin.transition(background);

    &:hover {
      background: var(--color-primary-dark);
    }
  }

  .card {
    border: 1px solid var(--color-border);
    border-radius: 0.5rem;
    padding: var(--space-md);
    background: var(--color-bg-secondary);
  }
}

// _utilities.scss
@layer utilities {
  .flex-center {
    @include mixin.flex-center();
  }

  .flex-between {
    @include mixin.flex-between();
  }

  .text-truncate {
    @include mixin.text-truncate();
  }

  .m-0 { margin: 0; }
  .m-1 { margin: var(--space-sm); }
  .m-2 { margin: var(--space-md); }

  .p-0 { padding: 0; }
  .p-1 { padding: var(--space-sm); }
  .p-2 { padding: var(--space-md); }
}
```

#### TypeScript Pattern:
```typescript
// StyleManager.ts
export class StyleManager {
  private injectedLayers = new Map<string, CSSStyleSheet>();
  private layerOrder = [
    'system', 'tokens', 'base', 'shell', 'view', 'components', 'utilities', 'overrides'
  ];

  /**
   * Initialize layer order - MUST be called first
   */
  initializeLayerOrder(doc: Document) {
    const sheet = new CSSStyleSheet();
    const rule = `@layer ${this.layerOrder.join(', ')};`;
    sheet.insertRule(rule, 0);
    doc.adoptedStyleSheets.push(sheet);
    return this;
  }

  /**
   * Inject layer with CSS
   */
  injectLayer(name: string, cssText: string, doc: Document) {
    const sheet = new CSSStyleSheet();
    const layered = cssText.includes(`@layer ${name}`)
      ? cssText
      : `@layer ${name} { ${cssText} }`;
    sheet.insertRule(layered, 0);
    doc.adoptedStyleSheets.push(sheet);
    this.injectedLayers.set(name, sheet);
  }

  /**
   * Replace layer (for shell/view changes)
   */
  replaceLayer(name: string, newCssText: string, doc: Document) {
    const existing = this.injectedLayers.get(name);
    if (existing) {
      doc.adoptedStyleSheets = doc.adoptedStyleSheets.filter(s => s !== existing);
    }
    this.injectLayer(name, newCssText, doc);
  }
}
```

#### Dependencies:
- Agent 1 (uses SCSS functions/mixins)

#### Output:
- 6 SCSS layer files (300-400 lines total)
- 2 TypeScript services (200-300 lines)
- API documentation

---

### Agent 3: Shell Architecture Refactoring
**Primary Task**: Refactor shell styles to @use/@layer  
**Deliverable**: `apps/CrossWord/src/frontend/shells/`  
**Timeline**: Week 1 (Days 3-4)

#### Responsibilities:
- [ ] Refactor `shells/basic/index.scss` (root with @layer declaration)
- [ ] Refactor `shells/basic/basic.scss` (layout styles)
- [ ] Create `shells/basic/_tokens.scss` (shell-specific tokens)
- [ ] Create `shells/basic/_keyframes.scss` (animations)
- [ ] Create `shells/basic/_components.scss` (shell components)
- [ ] Repeat for `shells/faint/` (same pattern)
- [ ] Repeat for `shells/raw/` (minimal)
- [ ] Add context selectors (:has) for shell conflicts
- [ ] Test shell transitions

#### Code Pattern:
```scss
// ✅ shells/basic/index.scss (ROOT)
@use "fest/fl-ui/styles/lib" as lib;

@layer shell, view, components, utilities;

@use "./basic" as *;      // @layer shell
@use "./_tokens" as *;    // @layer tokens
@use "./_keyframes" as *; // @layer tokens
@use "./_components" as *; // @layer components

// ✅ shells/basic/basic.scss (LAYOUT)
@layer shell {
  .shell-container {
    display: grid;
    grid-template-rows: auto 1fr auto;
    height: 100vh;
  }

  .shell-header {
    background: var(--shell-header-bg);
    padding: var(--space-md);
    border-bottom: 1px solid var(--shell-border);
  }

  .shell-main {
    overflow: auto;
  }

  .shell-footer {
    background: var(--shell-footer-bg);
    padding: var(--space-sm);
    border-top: 1px solid var(--shell-border);
  }
}

// ✅ shells/basic/_tokens.scss (TOKENS)
@layer tokens {
  :root:has(body[data-shell="basic"]) {
    --shell-header-bg: #f8f9fa;
    --shell-footer-bg: #f8f9fa;
    --shell-border: #e0e0e0;
    --shell-text: #333333;
  }
}

// ✅ shells/basic/_keyframes.scss (ANIMATIONS)
@layer tokens {
  @keyframes slideIn {
    from { transform: translateX(-100%); }
    to { transform: translateX(0); }
  }
}

// ✅ shells/basic/_components.scss (COMPONENTS)
@layer components {
  .shell-button {
    @include lib.mixin-transition(background);
    padding: 0.5rem 1rem;
    background: var(--color-primary);
    color: white;
    border: none;
    border-radius: 0.25rem;
    cursor: pointer;

    &:hover {
      background: var(--color-primary-dark);
    }
  }
}
```

#### Dependencies:
- Agent 1 (SCSS lib)
- Agent 2 (Layer system)

#### Output:
- 3 shells × 5 files = 15 SCSS files (600-800 lines total)
- Shell-specific documentation

---

### Agent 4: View Styles Refactoring
**Primary Task**: Refactor view styles to @use/@layer  
**Deliverable**: `apps/CrossWord/src/frontend/views/`  
**Timeline**: Week 2-3 (Days 5-10)

#### Responsibilities:
- [ ] Refactor `views/viewer/index.scss` (root with @layer)
- [ ] Refactor `views/viewer/viewer.scss` (view styles)
- [ ] Create `views/viewer/_tokens.scss` (view-specific tokens)
- [ ] Repeat for: editor, explorer, workcenter, home, airpad, history, settings, print, from-faint
- [ ] Add context selectors (:has) for view conflicts
- [ ] Optimize selector nesting (flatten 3+ levels)
- [ ] Group selectors by component
- [ ] Apply :where()/:is() patterns

#### Code Pattern:
```scss
// ✅ views/editor/index.scss (ROOT)
@use "fest/fl-ui/styles/lib" as lib;

@layer view, components, utilities;

@use "./editor" as *;    // @layer view
@use "./_tokens" as *;   // @layer tokens

// ✅ views/editor/editor.scss (LAYOUT)
@layer view {
  .view-editor {
    display: grid;
    grid-template-columns: 250px 1fr;
    gap: var(--space-md);
    padding: var(--space-md);
  }

  .editor-sidebar {
    border-right: 1px solid var(--color-border);
    padding-right: var(--space-md);
  }

  .editor-content {
    overflow: auto;
  }
}

// ✅ views/editor/_tokens.scss (VIEW-SPECIFIC)
@layer tokens {
  :root:has(body[data-view="editor"]) {
    --editor-sidebar-bg: #f5f5f5;
    --editor-line-height: 1.6;
    --editor-font-family: "Monaco", monospace;
  }
}
```

#### Dependencies:
- Agent 1 (SCSS lib)
- Agent 2 (Layer system)
- Agent 3 (Shell patterns)

#### Output:
- 10 views × 3 files = 30 SCSS files (400-600 lines each = 4,000-6,000 lines total)
- View-specific documentation

---

### Agent 5: Token Consolidation & Deduplication
**Primary Task**: Consolidate duplicate tokens across project  
**Deliverable**: `apps/CrossWord/src/frontend/styles/shared/`  
**Timeline**: Week 2 (parallel with Agent 4)

#### Responsibilities:
- [ ] Audit all token definitions across shells and views
- [ ] Identify duplicate token names/values
- [ ] Create `shared/_tokens.scss` with consolidated tokens
- [ ] Create mapping document showing consolidation
- [ ] Update shells/views to use shared tokens
- [ ] Add shell/view specific token overrides
- [ ] Document token naming conventions
- [ ] Create token audit script

#### Code Pattern:
```scss
// ✅ styles/shared/_tokens.scss (CONSOLIDATED)
@layer tokens {
  :root {
    // Colors
    --color-primary: #007bff;
    --color-primary-dark: #0056b3;
    --color-danger: #dc3545;
    --color-success: #28a745;

    // Spacing
    --space-xs: 0.25rem;
    --space-sm: 0.5rem;
    --space-md: 1rem;
    --space-lg: 1.5rem;
    --space-xl: 2rem;

    // Typography
    --type-h1: 2.5rem;
    --type-h2: 1.875rem;
    --type-body: 1rem;
    --type-small: 0.875rem;
    --font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto;

    // Borders & Radius
    --border-radius-sm: 0.25rem;
    --border-radius-md: 0.5rem;
    --border-radius-lg: 1rem;
    --border: 1px solid #e0e0e0;
  }
}

// ✅ shells/basic/_tokens.scss (OVERRIDE SPECIFICS)
@layer tokens {
  :root:has(body[data-shell="basic"]) {
    // Override with shell-specific values
    --shell-header-bg: #f8f9fa;
    --shell-border: #e0e0e0;
  }
}
```

#### Dependencies:
- Agent 3 (Shell tokens)
- Agent 4 (View tokens)

#### Output:
- 1 consolidated tokens file (200-300 lines)
- Mapping/audit document (500 lines)
- Deduplication checklist

---

### Agent 6: Mixins, Functions & Library Optimization
**Primary Task**: Extract and optimize SCSS utilities  
**Deliverable**: Enhanced `modules/projects/fl.ui/src/styles/_lib/`  
**Timeline**: Week 2-3 (Days 7-9, parallel work)

#### Responsibilities:
- [ ] Audit existing mixins for duplication
- [ ] Extract common patterns from shells/views
- [ ] Create specialized mixins:
  - Layout patterns (grid, flex, spacing)
  - Text patterns (truncate, overflow, sizing)
  - Form patterns (input, select, checkbox)
  - Animation patterns (transitions, keyframes)
  - Responsive patterns (media queries)
- [ ] Optimize mixin parameters
- [ ] Add comprehensive JSDoc
- [ ] Create @forward aggregator
- [ ] Document usage examples
- [ ] Create validation tests

#### Code Pattern:
```scss
// ✅ _lib/_mixins.scss (ENHANCED)

// Layout Mixins
@mixin flex-center($dir: row) {
  display: flex;
  flex-direction: $dir;
  align-items: center;
  justify-content: center;
}

@mixin flex-between($dir: row) {
  display: flex;
  flex-direction: $dir;
  justify-content: space-between;
  align-items: center;
}

@mixin grid-auto($min: 250px, $gap: 1rem) {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax($min, 1fr));
  gap: $gap;
}

// Text Mixins
@mixin text-truncate {
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

@mixin text-clamp($lines: 2) {
  display: -webkit-box;
  -webkit-line-clamp: $lines;
  -webkit-box-orient: vertical;
  overflow: hidden;
}

// Animation Mixins
@mixin transition($props: all, $duration: 300ms, $easing: ease) {
  transition: $props $duration $easing;
}

@mixin animation($name, $duration: 1s, $easing: ease, $delay: 0s) {
  animation: $name $duration $easing $delay;
}

// Responsive Mixin
@mixin respond-to($breakpoint) {
  @if $breakpoint == "mobile" {
    @media (max-width: 640px) { @content; }
  } @else if $breakpoint == "tablet" {
    @media (max-width: 1024px) { @content; }
  } @else if $breakpoint == "desktop" {
    @media (min-width: 1025px) { @content; }
  }
}
```

#### Dependencies:
- Agent 1 (Base library)
- Agent 3-4 (Extract from shells/views)

#### Output:
- Enhanced _lib/ (600-800 lines)
- Usage examples (200-300 lines)
- Optimization documentation

---

### Agent 7: Validation, Testing & Documentation
**Primary Task**: Ensure quality and document  
**Deliverable**: Validation scripts, tests, guides  
**Timeline**: Week 3-4 (Days 9-14)

#### Responsibilities:
- [ ] Create lint rules for @layer compliance
- [ ] Create validation script for @use imports
- [ ] Create tests for layer order
- [ ] Create tests for no circular imports
- [ ] Create tests for no unused styles
- [ ] Verify :where()/:is() patterns
- [ ] Run performance tests
- [ ] Run accessibility audit
- [ ] Create team style guide
- [ ] Create migration guide
- [ ] Create troubleshooting guide
- [ ] Document all 15 requirements compliance

#### Validation Scripts:
```bash
# ✅ Validate @layer declarations
validate-layers.sh:
  └─ Check all SCSS files have @layer declarations
  └─ Verify no duplicate layer declarations
  └─ Ensure layer order is correct

# ✅ Validate @use imports
validate-use.sh:
  └─ Check no @import statements remain
  └─ Verify all paths resolve
  └─ Check for circular imports

# ✅ Validate selectors
validate-selectors.sh:
  └─ Check nesting depth < 3
  └─ Verify :where()/:is() usage
  └─ Check specificity patterns
```

#### Output:
- 3+ validation scripts
- Test suites (100+ test cases)
- 3 comprehensive guides (1,500+ lines)
- Compliance checklist

---

## 📊 Parallel Execution Timeline

```
WEEK 1: Foundation
─────────────────────────────────────

Day 1:
├─ Agent 1: Create _lib/ (functions, mixins, variables)
├─ Agent 2: Create layers/ (_system, _tokens, _base)
└─ Agent 2: Create TypeScript services

Day 2:
├─ Agent 1: Document @forward aggregator
├─ Agent 2: Create _components, _utilities layers
└─ Agent 2: Verify layer order in compiled CSS

Day 3:
├─ Agent 3: Refactor shells/basic/
├─ Agent 4: Study Agent 1 & 2 outputs
└─ Agent 5: Begin token audit

Day 4:
├─ Agent 3: Refactor shells/faint/
├─ Agent 3: Refactor shells/raw/
└─ Agent 5: Create shared/_tokens.scss

Day 5:
├─ Agent 3: Add :has() context selectors
├─ Agent 3: Verify shell transitions work
└─ Agent 5: Map token consolidation

WEEK 2-3: Views & Optimization
─────────────────────────────────────

Days 6-10:
├─ Agent 4: Refactor views (5 per agent-day)
├─ Agent 5: Consolidate remaining tokens
├─ Agent 6: Extract mixins from views
└─ Agent 7: Setup validation framework

Days 11-14:
├─ Agent 4: Complete remaining views
├─ Agent 6: Optimize mixin library
├─ Agent 7: Run validation suite
└─ Agent 7: Begin documentation

WEEK 4: Validation & Completion
─────────────────────────────────────

Days 15-20:
├─ Agent 6: Finalize mixins/functions
├─ Agent 7: Complete tests & guides
├─ Agent 7: Verify :where()/:is() patterns
└─ Agent 7: Performance & accessibility audit

TOTAL: 20 days (4 weeks) or 60-80 hours of work
```

---

## 🤝 Cross-Agent Coordination

### Dependencies Graph:
```
Agent 1 (SCSS Lib)
├─ Blocks on: Nothing
├─ Blocks: Agents 2-6
└─ Output Used By: Everyone

Agent 2 (Layer System)
├─ Blocks on: Agent 1
├─ Blocks: Agents 3-4
└─ Output Used By: Agents 3-4

Agent 3 (Shells)
├─ Blocks on: Agents 1-2
├─ Blocks: Agent 5 (partial)
└─ Output Used By: Agents 5-6

Agent 4 (Views)
├─ Blocks on: Agents 1-2
├─ Blocks: Agent 5 (partial)
└─ Output Used By: Agents 5-6

Agent 5 (Consolidation)
├─ Blocks on: Agents 3-4 (partial)
├─ Blocks: Nothing
└─ Output Used By: Agents 3-4 (for updates)

Agent 6 (Optimization)
├─ Blocks on: Agents 1, 3-4
├─ Blocks: Agent 7
└─ Output Used By: Agents 3-4 (for use in code)

Agent 7 (Validation)
├─ Blocks on: Everyone (partial)
├─ Blocks: Nothing (final pass)
└─ Output Used By: Team
```

### Sync Points:
```
SYNC 1 (End of Day 2):
├─ Agents 1-2 present outputs
├─ Verify @use paths work
├─ Agents 3-4 begin based on outputs

SYNC 2 (End of Day 5):
├─ Agents 3 present shell refactoring
├─ Agent 5 presents token consolidation plan
├─ Agents 4-6 review for integration

SYNC 3 (Mid-Week 2):
├─ Agent 4 progress check (25% of views)
├─ Agent 6 mixin extraction plan
├─ Agent 7 validation framework ready

SYNC 4 (End of Week 3):
├─ All agents report blockers
├─ Agent 7 ready for full suite
├─ Final optimizations identified

FINAL (End of Week 4):
├─ All agents complete
├─ Agent 7 runs full validation
├─ Team sign-off
```

---

## ✅ Quality Checkpoints

### Agent 1 Deliverables:
- [ ] All functions/mixins documented
- [ ] No @layer in library files
- [ ] @forward aggregator works
- [ ] All imports resolve
- [ ] Tests pass

### Agent 2 Deliverables:
- [ ] Layer order verified
- [ ] All @layer declarations valid
- [ ] TypeScript services compile
- [ ] No import errors
- [ ] API documentation complete

### Agent 3 Deliverables:
- [ ] All 3 shells refactored
- [ ] @use replaces all @import
- [ ] Context selectors in place
- [ ] No linter errors
- [ ] Shell transitions tested

### Agent 4 Deliverables:
- [ ] All 10 views refactored
- [ ] @use replaces all @import
- [ ] Context selectors in place
- [ ] Nesting flattened (< 3 levels)
- [ ] View rendering verified

### Agent 5 Deliverables:
- [ ] Tokens consolidated
- [ ] Duplicates eliminated
- [ ] Consolidation documented
- [ ] No token conflicts
- [ ] All shells/views updated

### Agent 6 Deliverables:
- [ ] Mixins extracted & optimized
- [ ] Functions consolidated
- [ ] All documented
- [ ] Usage examples provided
- [ ] Performance verified

### Agent 7 Deliverables:
- [ ] 100% requirement coverage
- [ ] All tests passing
- [ ] Zero linter errors
- [ ] Complete documentation
- [ ] Team ready to maintain

---

## 📋 Handoff Protocol

### When Handing Off To Next Agent:

1. **Create PR/MR** with:
   - Clear description of changes
   - Link to documentation
   - Test results
   - Any blockers

2. **Include**:
   - Changelog
   - Migration guide
   - Code examples
   - Performance metrics

3. **Notify**:
   - Next agent in chain
   - Document in shared space
   - Note any special setup

4. **Wait For Confirmation**:
   - Verify outputs working
   - Get OK before proceeding
   - Address feedback

---

**Framework Created By**: Architecture Team  
**Status**: 🎯 Ready for Implementation  
**Next**: Begin Agent 1 & 2 in parallel
