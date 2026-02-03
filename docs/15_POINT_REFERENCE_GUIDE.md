# 15-Point CSS/SCSS Refactoring Reference Guide

**Document Type**: Technical Reference  
**Date**: February 2, 2026  
**Author**: AI Agent Coordination Team  

---

## Quick Navigation

1. [AI Agent Cooperation](#requirement-1-ai-agent-cooperation)
2. [Script-Based Layer Generation](#requirement-2-script-based-layer-generation)
3. [SCSS @use Instead of @import](#requirement-3-scss-use-instead-of-import)
4. [Wrap Every SCSS/CSS with @layer](#requirement-4-wrap-every-scsscss-with-layer)
5. [Dedicated Custom Properties Modules](#requirement-5-dedicated-custom-properties-modules)
6. [Context-Based :root/:has() Rules](#requirement-6-context-based-root-has-rules)
7. [Logically Correct Loading/Init Order](#requirement-7-logically-correct-loading-init-order)
8. [Better @layer Naming](#requirement-8-better-layer-naming)
9. [Cleanup/Trim Redundant Styles](#requirement-9-cleanup-trim-redundant-styles)
10. [Regroup/Cleanup Selectors](#requirement-10-regroup-cleanup-selectors)
11. [Refactor/Optimize SCSS Mixins](#requirement-11-refactor-optimize-scss-mixins)
12. [Better SCSS Nesting/Grouping](#requirement-12-better-scss-nesting-grouping)
13. [Recover/Repair Broken SCSS](#requirement-13-recover-repair-broken-scss)
14. [Better @use Imports/Order](#requirement-14-better-use-imports-order)
15. [Use :where()/:is() Selectors](#requirement-15-use-where-is-selectors)

---

## Requirement 1: AI Agent Cooperation

**Goal**: Multiple AI agents cooperate to distribute refactoring work across different code regions

### Why This Matters
- Large refactoring tasks can overwhelm single agents
- Different layers need different expertise
- Parallel processing speeds up delivery
- Coordination prevents conflicts

### Implementation Strategy

**Agent Distribution**:
```
Agent 1: CSS Framework (veela.css)
Agent 2: UI System (fl.ui)
Agent 3: Application Shells (CrossWord shells)
Agent 4: Application Views (CrossWord views)
Agent 5: DOM Element Organization (TS/JS modules)
Agent 6: Quality Assurance & Integration (testing)
```

### Coordination Protocol

```
Phase 1: Agent 1 builds framework
    ↓ (delivers layer architecture)
Phase 2: Agent 2 builds on framework
    ↓ (delivers component system)
Phase 3A: Agents 3 & 4 work in parallel on shells/views
    ↓ (coordinate with Agent 5)
Phase 3B: Agent 5 documents element organization
    ↓ (provides DOM structure to Agents 3 & 4)
Phase 4: Agent 6 integrates and verifies
    ↓ (final quality report)
```

### Communication Points

**Daily Standup**:
- Each agent shares: current progress, blockers, needs
- Duration: 15-20 minutes

**Coordination Issues** (resolve same day):
- Import conflicts: Reference Agent 1's framework
- Layer conflicts: Follow Agent 1's documentation
- Naming conflicts: Use consistent conventions from start

**Weekly Retro**:
- Review what worked
- Identify improvements
- Plan next week

### Code Example: Agent Handoff Documentation

```markdown
# Agent 1 → Agent 2 Handoff

## Framework Complete ✅

### What Agent 2 Must Know
1. Framework is in: `modules/projects/veela.css/src/scss/`
2. Layer order: `@layer system, tokens, base;`
3. Public API via: `@forward "./..."` statements
4. Import like this:
   ```scss
   @use "../../modules/projects/veela.css" as fw;
   color: fw.$color-primary;
   ```

### What Agent 2 Must Not Do
- ❌ Don't declare @layer order again
- ❌ Don't use @import (use @use)
- ❌ Don't redefine framework variables
- ❌ Don't create circular imports

### Agent 2 Deliverables
- Components with @layer components
- Utilities with @layer utilities
- Public exports via @forward
- Documentation of component API
```

### Reference Documents
- `MULTI_AGENT_COORDINATION_GUIDE.md` (detailed coordination)
- `CSS_REFACTORING_EXECUTION_PLAN.md` (phase timeline)

---

## Requirement 2: Script-Based Layer Generation

**Goal**: Generate CSS `@layer` sequences in TypeScript/JavaScript for proper cascade initialization

### Why This Matters
- Browser needs layers declared BEFORE styles load
- TypeScript can manage layer initialization
- Dynamic layer management possible
- Ensures correct cascade order

### Implementation Strategy

### Code Example 1: Layer Initialization Module

```typescript
// src/frontend/styles/layer-manager.ts
/**
 * CSS Layer Initialization & Management
 * 
 * This module handles the declaration and management of CSS cascade layers.
 * Layers must be declared before any styles are loaded.
 */

/**
 * Layer names in cascade order (lowest to highest priority)
 */
export enum CSSLayer {
  SYSTEM = 'system',        // Browser resets, normalize
  TOKENS = 'tokens',        // Design tokens, custom properties, keyframes
  BASE = 'base',            // Global typography, defaults
  SHELL = 'shell',          // Shell structure, layout
  VIEW = 'view',            // View-specific layout
  COMPONENTS = 'components', // Reusable UI components
  UTILITIES = 'utilities',  // Atomic helper classes
  OVERRIDES = 'overrides',  // Emergency fixes (rarely used)
}

/**
 * Cascade order - must match @layer declaration in CSS
 */
const LAYER_ORDER = [
  CSSLayer.SYSTEM,
  CSSLayer.TOKENS,
  CSSLayer.BASE,
  CSSLayer.SHELL,
  CSSLayer.VIEW,
  CSSLayer.COMPONENTS,
  CSSLayer.UTILITIES,
  CSSLayer.OVERRIDES,
];

/**
 * Initialize CSS layers by creating a style element with @layer declaration
 * This should be called BEFORE any other stylesheets load
 */
export function initializeLayers(): void {
  const style = document.createElement('style');
  style.setAttribute('data-layers', 'layer-init');
  
  const layerDeclaration = `@layer ${LAYER_ORDER.join(', ')};`;
  style.textContent = layerDeclaration;
  
  // Insert at very start of <head> to ensure it loads first
  document.head.insertAdjacentElement('afterbegin', style);
  
  console.log('CSS Layers initialized:', LAYER_ORDER);
}

/**
 * Get all layers in correct order
 */
export function getLayers(): string[] {
  return [...LAYER_ORDER];
}

/**
 * Check if a layer is defined
 */
export function hasLayer(layer: CSSLayer): boolean {
  return LAYER_ORDER.includes(layer);
}

/**
 * Get layer precedence (0 = lowest, highest = highest)
 */
export function getLayerPrecedence(layer: CSSLayer): number {
  return LAYER_ORDER.indexOf(layer);
}

/**
 * Layer precedence comparison utility
 */
export function isLayerHigherPrecedence(
  layer1: CSSLayer,
  layer2: CSSLayer
): boolean {
  return getLayerPrecedence(layer1) > getLayerPrecedence(layer2);
}
```

### Code Example 2: Layer Initialization in Bootstrap

```typescript
// src/frontend/main/index.ts
/**
 * Application Bootstrap
 * Initialize CSS layers FIRST, before anything else
 */

import { initializeLayers, getLayers } from '../styles/layer-manager';

/**
 * Bootstrap function called at application startup
 */
export async function bootstrap(): Promise<void> {
  // 1. Initialize CSS layers FIRST (before stylesheets load)
  initializeLayers();
  console.log('✅ CSS Layers ready:', getLayers());

  // 2. Now load stylesheets (they will use initialized layers)
  await loadStylesheets();

  // 3. Initialize UI framework
  await initializeUIFramework();

  // 4. Render application
  await renderApplication();
}

/**
 * Load stylesheets in correct order
 */
async function loadStylesheets(): Promise<void> {
  const stylesheets = [
    // Framework (system, tokens, base layers)
    '/styles/framework/index.css',
    
    // UI System (components, utilities layers)
    '/styles/ui-system/index.css',
    
    // Shell styles (shell layer)
    '/styles/shells/index.css',
    
    // View styles (view layer)
    '/styles/views/index.css',
  ];

  for (const href of stylesheets) {
    await loadStylesheet(href);
  }
}

function loadStylesheet(href: string): Promise<void> {
  return new Promise((resolve, reject) => {
    const link = document.createElement('link');
    link.rel = 'stylesheet';
    link.href = href;
    link.onload = () => resolve();
    link.onerror = () => reject(new Error(`Failed to load: ${href}`));
    document.head.appendChild(link);
  });
}

// Call bootstrap when ready
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', () => bootstrap());
} else {
  bootstrap();
}
```

### Code Example 3: Dynamic Layer Management

```typescript
// src/frontend/styles/dynamic-layers.ts
/**
 * Dynamic CSS Layer Management
 * 
 * Useful for:
 * - Runtime theme switching
 * - Feature flag CSS
 * - User preference overrides
 */

import { CSSLayer } from './layer-manager';

/**
 * Inject styles into specific layer
 */
export function injectStylesIntoLayer(
  layer: CSSLayer,
  styles: string,
  id?: string
): HTMLStyleElement {
  const style = document.createElement('style');
  if (id) style.id = id;
  style.setAttribute('data-layer', layer);
  
  // Wrap styles in @layer directive
  style.textContent = `@layer ${layer} { ${styles} }`;
  
  document.head.appendChild(style);
  return style;
}

/**
 * Update styles in existing layer
 */
export function updateLayerStyles(
  id: string,
  newStyles: string
): void {
  const style = document.getElementById(id) as HTMLStyleElement | null;
  if (!style) {
    console.warn(`Style element not found: ${id}`);
    return;
  }

  const layer = style.getAttribute('data-layer') || CSSLayer.COMPONENTS;
  style.textContent = `@layer ${layer} { ${newStyles} }`;
}

/**
 * Remove styles from layer
 */
export function removeLayerStyles(id: string): void {
  const style = document.getElementById(id);
  style?.remove();
}

/**
 * Example: Theme switching
 */
export function applyTheme(
  themeName: 'light' | 'dark'
): void {
  const themeStyles = themeName === 'dark'
    ? `
      :root {
        --color-bg: #1e1e1e;
        --color-text: #ffffff;
      }
    `
    : `
      :root {
        --color-bg: #ffffff;
        --color-text: #000000;
      }
    `;

  injectStylesIntoLayer(
    CSSLayer.TOKENS,
    themeStyles,
    `theme-${themeName}`
  );
}
```

### SCSS Pattern: Layer Declaration in Stylesheets

```scss
// styles/framework/index.scss
/**
 * Framework - Root Layer Declaration
 * 
 * This file declares the official @layer order.
 * TypeScript bootstrap ensures this loads first.
 */

@layer system, tokens, base, shell, view, components, utilities, overrides;

// Now import framework modules
@use "./system" as sys;
@use "./tokens" as tok;
@use "./base" as b;

// ... rest of framework
```

### Verification

```bash
# 1. Check layer initialization runs
npm run build
# Look for: "✅ CSS Layers ready: [system, tokens, ...]"

# 2. Verify layer order in CSS
grep -n "@layer" dist/styles.css | head -5

# 3. Test in browser DevTools
# Open Inspector → Console, run:
# Array.from(document.styleSheets).forEach(s => 
#   console.log(s.href, s.rules[0].layer)
# )
```

### Reference
- MDN: [CSS Cascade Layers](https://developer.mozilla.org/en-US/docs/Web/CSS/@layer)
- See: `CSS_REFACTORING_EXECUTION_PLAN.md` (Phase 2D)

---

## Requirement 3: SCSS @use Instead of @import

**Goal**: Migrate all SCSS files from `@import` to `@use` module system

### Why This Matters
- `@import` pollutes global namespace (deprecated)
- `@use` provides explicit namespacing
- Clear dependency graph
- Better for refactoring
- Modern SCSS best practice

### Conversion Guide

### Code Example 1: Simple Migration

**BEFORE** (❌ deprecated):
```scss
// src/styles/components/button.scss
@import "../variables/colors";
@import "../variables/spacing";
@import "../mixins/interactions";

.button {
  background-color: $primary;      // Where did $primary come from?
  padding: $spacing-md;             // Where did $spacing-md come from?
  
  &:hover {
    @include focus-ring();          // Where did this mixin come from?
  }
}
```

**AFTER** (✅ modern):
```scss
// src/styles/components/button.scss
@use "../variables/colors" as color;
@use "../variables/spacing" as space;
@use "../mixins/interactions" as interact;

@layer components {
  .button {
    background-color: color.$primary;      // ✅ Clear source
    padding: space.$spacing-md;             // ✅ Clear source
    
    &:hover {
      @include interact.focus-ring();      // ✅ Clear source
    }
  }
}
```

### Code Example 2: Namespace Aliasing

```scss
// Various ways to use @use

// 1. Simple namespace
@use "./variables" as vars;
// Access: vars.$color, vars.$spacing

// 2. Abbreviated namespace
@use "./variables" as v;
// Access: v.$color, v.$spacing

// 3. Named alias
@use "./design-system/tokens" as ds;
// Access: ds.$primary, ds.$spacing

// 4. Import all into global (rare!)
@use "./vendor/bootstrap" as *;
// Access: $bootstrap-color (no namespace)
// ⚠️ Avoid this - creates namespace pollution

// 5. Import with prefix
@use "./components" as comp;
// Access: comp.$button-size, comp.$card-padding
```

### Code Example 3: Forwarding for Public APIs

**Library Setup**:
```scss
// lib/index.scss - Public API
/**
 * Design System Library
 * Public exports via @forward
 */

// Export colors with prefix
@forward "./colors" as color-*;

// Export spacing with prefix
@forward "./spacing" as space-*;

// Export typography without prefix
@forward "./typography";

// Export mixins
@forward "./mixins" as mix-*;
```

**Consumer**:
```scss
// src/app.scss
@use "../../lib" as ds;

// Use public API
.heading {
  color: ds.color-primary;        // From: lib/colors
  padding: ds.space-md;           // From: lib/spacing
  font-size: ds.$heading-lg;      // From: lib/typography
  
  @include ds.mix-flex-center();  // From: lib/mixins
}
```

### Code Example 4: Complex Module Organization

**Directory Structure**:
```
lib/
├── index.scss              (public API)
├── colors.scss             (color tokens)
├── spacing.scss            (spacing scale)
├── typography.scss         (font system)
├── mixins/
│   ├── index.scss
│   ├── layout.scss
│   ├── interactions.scss
│   └── text.scss
└── functions/
    ├── index.scss
    └── conversions.scss
```

**Public API** (`lib/index.scss`):
```scss
// colors
@forward "./colors" as color-*;

// spacing
@forward "./spacing" as space-*;

// typography
@forward "./typography" as typo-*;

// mixins
@forward "./mixins" as mix-*;

// functions
@forward "./functions" as func-*;
```

**Consumer** (`src/styles/button.scss`):
```scss
@use "../../lib" as design;

@layer components {
  .button {
    // Colors
    background: design.color-primary;
    color: design.color-on-primary;
    
    // Spacing
    padding: design.space-md design.space-lg;
    
    // Typography
    font: design.typo-weight-semibold design.typo-size-base / 1.5 design.typo-family;
    
    // Mixins
    @include design.mix-flex-center();
    @include design.mix-smooth-transition("background-color");
    
    // Functions
    box-shadow: 0 2px design.func-spacing(1) rgba(0, 0, 0, 0.2);
  }
}
```

### Migration Audit

**Find all @import statements**:
```bash
# Count @import usage
grep -r "@import" apps/CrossWord/src --include="*.scss" | wc -l

# List all @import files
grep -r "@import" apps/CrossWord/src --include="*.scss" | cut -d: -f1 | sort -u

# Find @import of specific module
grep -r "@import.*colors" apps/CrossWord/src --include="*.scss"
```

**Find all @use statements** (for reference):
```bash
# Count @use usage
grep -r "@use" apps/CrossWord/src --include="*.scss" | wc -l

# Find @use without namespace (anti-pattern)
grep -r "@use.*as \*" apps/CrossWord/src --include="*.scss"
```

### Common Migration Issues

**Issue 1: Nested @use statements**
```scss
// ❌ Wrong
.button {
  @use "./colors" as color;  // Don't do this
  color: color.$primary;
}

// ✅ Correct
@use "./colors" as color;

.button {
  color: color.$primary;     // @use at top
}
```

**Issue 2: Variable scope changes**
```scss
// ❌ Old behavior (with @import)
@import "./vars";
$computed: $base + 10;  // $base is in global scope

// ✅ New behavior (with @use)
@use "./vars" as v;
$computed: v.$base + 10;  // Must use namespace
```

**Issue 3: Mixin namespace**
```scss
// ❌ Wrong
@use "./mixins";
@include focus-ring();  // Lost the namespace

// ✅ Correct
@use "./mixins" as m;
@include m.focus-ring();  // Fully qualified
```

### Verification Checklist

- [ ] No `@import` statements remain
- [ ] All imports use `@use` with namespace
- [ ] No `@use ... as *` (except maybe one root file)
- [ ] All variables accessed with namespace
- [ ] All mixins accessed with namespace
- [ ] Build succeeds without warnings
- [ ] Visual output identical to before

### Reference
- MDN: [Sass @use Rule](https://sass-lang.com/documentation/at-rules/use/)
- Sass: [@forward Rule](https://sass-lang.com/documentation/at-rules/forward/)

---

## Requirement 4: Wrap Every SCSS/CSS with @layer

**Goal**: All styles must be wrapped in appropriate `@layer` declarations (except libraries with only variables/mixins)

### Why This Matters
- Explicit layer assignment prevents cascade conflicts
- Consistent cascade behavior across all shells/views
- Libraries don't need @layer (no output CSS)
- Improves debugging and maintainability

### Layer Assignment Rules

| File Type | Layer | Example |
|-----------|-------|---------|
| HTML resets | `system` | `_normalize.scss` |
| CSS custom properties | `tokens` | `_custom-properties.scss` |
| Global typography | `base` | `_typography.scss` |
| Shell layout | `shell` | `basic.scss` |
| View layout | `view` | `viewer.scss` |
| Reusable components | `components` | `_button.scss` |
| Helper classes | `utilities` | `_spacing.scss` |
| Library variables | ❌ No @layer | `_tokens-lib.scss` |
| Library functions | ❌ No @layer | `_functions.scss` |
| Library mixins | ❌ No @layer | `_mixins.scss` |

### Code Example 1: Correct @layer Usage

```scss
// src/styles/components/button.scss
/**
 * Button Component Styles
 * @layer components
 */

@use "../tokens" as t;

// ✅ CORRECT: Entire file wrapped in @layer
@layer components {
  .button {
    display: inline-flex;
    align-items: center;
    justify-content: center;
    padding: t.$spacing-md t.$spacing-lg;
    background-color: t.$color-primary;
    border: none;
    border-radius: t.$border-radius-md;
    cursor: pointer;

    &:hover {
      background-color: t.$color-primary-dark;
    }

    &:focus {
      outline: 2px solid t.$color-focus;
      outline-offset: 2px;
    }

    // Modifiers
    &.button--small {
      padding: t.$spacing-sm t.$spacing-md;
      font-size: t.$font-size-sm;
    }

    &.button--large {
      padding: t.$spacing-lg t.$spacing-xl;
      font-size: t.$font-size-lg;
    }

    // Variants
    &.button--primary {
      background-color: t.$color-primary;
      color: t.$color-on-primary;
    }

    &.button--secondary {
      background-color: t.$color-secondary;
      color: t.$color-on-secondary;
    }
  }

  // Related component: button group
  .button-group {
    display: flex;
    gap: t.$spacing-sm;

    .button {
      flex: 1;
    }
  }
}
```

### Code Example 2: Library Files (NO @layer)

```scss
// lib/tokens/colors.scss
/**
 * Color Tokens Library
 * 
 * ⚠️ NO @layer here - this is just variable definitions
 * Consumers will wrap these in @layer when used
 */

// Primary colors
$primary: #007acc;
$primary-dark: #005a9e;
$primary-darker: #003d7a;
$primary-light: #0a9cff;

// Secondary colors
$secondary: #6c757d;
$secondary-dark: #5a6268;
$secondary-light: #8899a6;

// Semantic colors
$success: #28a745;
$warning: #ffc107;
$error: #dc3545;
$info: #17a2b8;

// Neutral
$neutral-0: #ffffff;
$neutral-50: #f9f9f9;
$neutral-100: #f5f5f5;
$neutral-200: #e0e0e0;
// ... etc
```

### Code Example 3: Mixed File (Variables + Output)

```scss
// shells/basic/_tokens.scss
/**
 * Basic Shell Tokens
 * 
 * Variables section (no @layer)
 * Output section (@layer tokens)
 */

// ========================
// VARIABLE DEFINITIONS (no @layer)
// ========================

$shell-gap: 1rem;
$shell-padding: 1.5rem;
$shell-border-color: rgba(0, 0, 0, 0.1);

// ========================
// CSS OUTPUT (@layer tokens)
// ========================

@layer tokens {
  :root:has(.shell-basic) {
    --shell-layout: grid;
    --shell-columns: auto 1fr auto;
    --shell-gap: #{$shell-gap};
    --shell-padding: #{$shell-padding};
    --shell-border-color: #{$shell-border-color};
  }
}
```

### Code Example 4: Multiple Layers in One File

**INCORRECT** (❌ Don't do this):
```scss
// ❌ BAD: Splitting @layer declarations
.text-primary {
  @layer base {
    color: var(--color-primary);
  }
}

.text-secondary {
  @layer utilities {
    color: var(--color-secondary);
  }
}
```

**CORRECT** (✅ Do this):
```scss
// ✅ GOOD: Organized by layer
@layer base {
  .text-primary {
    color: var(--color-primary);
  }
}

@layer utilities {
  .text-secondary {
    color: var(--color-secondary);
  }
}
```

### Code Example 5: Root File with @layer Declaration

```scss
// src/styles/shell.scss
/**
 * Shell Root Stylesheet
 * 
 * Declares layer order ONCE at root
 * All other files will use these layers
 */

// ✅ Declare layer order once at root
@layer system, tokens, base, shell, view, components, utilities, overrides;

// Import all shell modules
@use "./system" as sys;
@use "./tokens" as tok;
@use "./base" as b;
@use "./shell/basic" as shell;
@use "./components" as c;
@use "./utilities" as u;

// Note: Each imported file still wraps its output in @layer
// This @layer declaration just defines the order
```

### File Organization with @layer

**Recommended Structure**:
```
src/styles/
├── index.scss              # Root - declares layer order
├── system/
│   ├── index.scss         # No @layer (organizing file)
│   ├── _normalize.scss    # @layer system
│   ├── _reset.scss        # @layer system
│   └── _box-model.scss    # @layer system
├── tokens/
│   ├── index.scss         # No @layer (organizing file)
│   ├── _colors.scss       # @layer tokens
│   ├── _spacing.scss      # @layer tokens
│   └── _typography.scss   # @layer tokens
├── base/
│   ├── index.scss         # No @layer
│   ├── _typography.scss   # @layer base
│   ├── _links.scss        # @layer base
│   └── _forms.scss        # @layer base
├── components/
│   ├── index.scss         # No @layer
│   ├── _button.scss       # @layer components
│   ├── _card.scss         # @layer components
│   └── _menu.scss         # @layer components
└── utilities/
    ├── index.scss         # No @layer
    ├── _spacing.scss      # @layer utilities
    ├── _display.scss      # @layer utilities
    └── _text.scss         # @layer utilities
```

### Verification

**Check all files have @layer**:
```bash
# Find all .scss files
find src/styles -name "*.scss" -type f > all_scss_files.txt

# Find files WITH output CSS (should have @layer)
grep -l "^\s*\." $(cat all_scss_files.txt) > files_with_output.txt

# Find files that are organizing files (no @layer needed)
grep -l "^@use\|^@forward" $(cat all_scss_files.txt) > organizing_files.txt

# Check if all output files have @layer
for f in $(cat files_with_output.txt); do
  if ! grep -q "@layer" "$f"; then
    echo "❌ Missing @layer: $f"
  fi
done
```

**Expected Output**: All files with CSS selectors have `@layer`

### Reference
- See: Requirement 4 in `CSS_REFACTORING_EXECUTION_PLAN.md`

---

## Requirement 5: Dedicated Custom Properties Modules

**Goal**: Create separate SCSS modules for CSS custom properties (design tokens)

### Why This Matters
- Clear separation of concerns
- Easy to locate token definitions
- Enables dynamic token updates
- Single source of truth for design system
- `:has()` scoping for context-specific values

### Module Structure

```scss
// tokens/
├── _colors.scss              # Color palette
├── _spacing.scss             # Spacing scale
├── _typography.scss          # Font system
├── _sizes.scss               # Component sizing
├── _shadows.scss             # Elevation/shadows
├── _borders.scss             # Border styles
├── _durations.scss           # Animation timings
├── _easing.scss              # Animation easing
├── _z-index.scss             # Stacking context
└── index.scss                # Exports all
```

### Code Example 1: Color Tokens Module

```scss
// tokens/_colors.scss
/**
 * Color Token Definitions
 * @layer tokens
 */

@layer tokens {
  :root {
    // ============ Primary Colors ============
    --color-primary: #007acc;
    --color-primary-dark: #005a9e;
    --color-primary-darker: #003d7a;
    --color-primary-light: #0a9cff;
    --color-primary-lighter: #4eca5c;

    // ============ Secondary Colors ============
    --color-secondary: #6c757d;
    --color-secondary-dark: #5a6268;
    --color-secondary-light: #8899a6;

    // ============ Semantic Colors ============
    --color-success: #28a745;
    --color-warning: #ffc107;
    --color-error: #dc3545;
    --color-info: #17a2b8;

    // ============ Neutral Colors ============
    --color-neutral-0: #ffffff;
    --color-neutral-50: #f9f9f9;
    --color-neutral-100: #f5f5f5;
    --color-neutral-200: #e0e0e0;
    --color-neutral-300: #d0d0d0;
    --color-neutral-400: #c0c0c0;
    --color-neutral-500: #a0a0a0;
    --color-neutral-600: #808080;
    --color-neutral-700: #606060;
    --color-neutral-800: #404040;
    --color-neutral-900: #202020;
    --color-neutral-950: #101010;

    // ============ Semantic Usage ============
    --color-surface: var(--color-neutral-0);
    --color-surface-variant: var(--color-neutral-50);
    --color-on-surface: var(--color-neutral-950);
    --color-background: var(--color-neutral-50);
    --color-on-background: var(--color-neutral-950);
    --color-outline: var(--color-neutral-300);
    --color-outline-variant: var(--color-neutral-200);
  }
}
```

### Code Example 2: Spacing Tokens Module

```scss
// tokens/_spacing.scss
/**
 * Spacing Scale Definitions
 * @layer tokens
 * 
 * Uses 8px base unit (modular scale)
 */

@layer tokens {
  :root {
    // ============ Base Units ============
    --spacing-base: 8px;
    --spacing-unit: 1;

    // ============ Scale (8px increments) ============
    --spacing-xs: calc(var(--spacing-base) * 0.5);     /* 4px */
    --spacing-sm: calc(var(--spacing-base) * 1);       /* 8px */
    --spacing-md: calc(var(--spacing-base) * 1.5);     /* 12px */
    --spacing-lg: calc(var(--spacing-base) * 2);       /* 16px */
    --spacing-xl: calc(var(--spacing-base) * 2.5);     /* 20px */
    --spacing-2xl: calc(var(--spacing-base) * 3);      /* 24px */
    --spacing-3xl: calc(var(--spacing-base) * 4);      /* 32px */
    --spacing-4xl: calc(var(--spacing-base) * 5);      /* 40px */
    --spacing-5xl: calc(var(--spacing-base) * 6);      /* 48px */
    --spacing-6xl: calc(var(--spacing-base) * 8);      /* 64px */

    // ============ Aliases ============
    --gap-tight: var(--spacing-sm);
    --gap-normal: var(--spacing-md);
    --gap-loose: var(--spacing-lg);
    --gap-extra-loose: var(--spacing-2xl);

    --padding-tight: var(--spacing-sm);
    --padding-normal: var(--spacing-md);
    --padding-loose: var(--spacing-lg);

    --margin-tight: var(--spacing-sm);
    --margin-normal: var(--spacing-md);
    --margin-loose: var(--spacing-lg);
  }
}
```

### Code Example 3: Typography Tokens Module

```scss
// tokens/_typography.scss
/**
 * Typography Token Definitions
 * @layer tokens
 */

@layer tokens {
  :root {
    // ============ Font Families ============
    --font-family-system: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 
                          'Helvetica Neue', Arial, sans-serif;
    --font-family-mono: 'Monaco', 'Menlo', 'Ubuntu Mono', 'Courier New', monospace;
    --font-family-serif: 'Georgia', 'Garamond', serif;

    // ============ Font Sizes ============
    --font-size-xs: 0.75rem;       /* 12px */
    --font-size-sm: 0.875rem;      /* 14px */
    --font-size-base: 1rem;        /* 16px */
    --font-size-lg: 1.125rem;      /* 18px */
    --font-size-xl: 1.25rem;       /* 20px */
    --font-size-2xl: 1.5rem;       /* 24px */
    --font-size-3xl: 1.875rem;     /* 30px */
    --font-size-4xl: 2.25rem;      /* 36px */

    // ============ Font Weights ============
    --font-weight-light: 300;
    --font-weight-normal: 400;
    --font-weight-medium: 500;
    --font-weight-semibold: 600;
    --font-weight-bold: 700;
    --font-weight-extrabold: 800;

    // ============ Line Heights ============
    --line-height-tight: 1.2;
    --line-height-normal: 1.5;
    --line-height-relaxed: 1.75;
    --line-height-loose: 2;

    // ============ Letter Spacing ============
    --letter-spacing-tight: -0.02em;
    --letter-spacing-normal: 0;
    --letter-spacing-wide: 0.05em;
    --letter-spacing-wider: 0.1em;

    // ============ Text Decorations ============
    --text-decoration-thickness: 2px;
    --text-underline-offset: 4px;
  }
}
```

### Code Example 4: Context-Specific Tokens (Shell)

```scss
// shells/basic/_tokens.scss
/**
 * Basic Shell - Context-Specific Tokens
 * @layer tokens
 * 
 * These tokens are scoped to the basic shell using :has()
 */

@layer tokens {
  // Default tokens (no shell context)
  :root {
    --shell-layout: flex;
    --shell-gap: 1rem;
    --shell-padding: 0;
    --shell-background: var(--color-surface);
  }

  // Basic shell specific tokens
  :root:has(.shell-basic) {
    --shell-layout: grid;
    --shell-columns: auto 1fr auto;
    --shell-rows: auto 1fr auto;
    --shell-gap: 1rem;
    --shell-padding: 1.5rem;
    --shell-background: var(--color-surface);
    
    // Header tokens
    --header-height: 64px;
    --header-background: var(--color-primary);
    --header-color: var(--color-on-primary);
    
    // Sidebar tokens
    --sidebar-width: 280px;
    --sidebar-background: var(--color-neutral-50);
    
    // Footer tokens
    --footer-height: 48px;
    --footer-background: var(--color-neutral-100);
  }

  // Faint shell specific tokens
  :root:has(.shell-faint) {
    --shell-layout: flex;
    --shell-direction: column;
    --shell-gap: 0.5rem;
    --shell-padding: 0.75rem;
    --shell-background: var(--color-neutral-50);
  }

  // Raw shell specific tokens
  :root:has(.shell-raw) {
    --shell-layout: block;
    --shell-gap: 0;
    --shell-padding: 0;
    --shell-background: transparent;
  }
}
```

### Code Example 5: Context-Specific Tokens (View)

```scss
// views/viewer/_tokens.scss
/**
 * Viewer View - Context-Specific Tokens
 * @layer tokens
 */

@layer tokens {
  // Default view tokens
  :root {
    --view-padding: 1rem;
    --view-gap: 1rem;
    --view-background: var(--color-surface);
    --view-color: var(--color-on-surface);
  }

  // Viewer-specific tokens
  :root:has(.view-viewer) {
    --view-padding: 2rem;
    --view-gap: 1.5rem;
    --view-layout: grid;
    --view-columns: 1fr;
    --view-background: var(--color-neutral-50);
    
    // Content area tokens
    --content-max-width: 100%;
    --content-padding: 1.5rem;
    
    // Panel tokens
    --panel-background: var(--color-surface);
    --panel-border-color: var(--color-outline);
    --panel-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
  }

  // Editor-specific tokens
  :root:has(.view-editor) {
    --view-padding: 1rem;
    --view-gap: 1rem;
    --view-layout: flex;
    --view-direction: column;
    --view-background: var(--color-surface);
    
    // Editor area tokens
    --editor-padding: 1rem;
    --editor-background: var(--color-neutral-50);
    --editor-font-family: var(--font-family-mono);
    --editor-font-size: var(--font-size-sm);
    --editor-line-height: 1.6;
  }
}
```

### Module Export Pattern

```scss
// tokens/index.scss
/**
 * Token Exports
 * 
 * Public API for accessing tokens
 * Use: @use "../../tokens" as tokens
 */

@forward "./colors";
@forward "./spacing";
@forward "./typography";
@forward "./sizes";
@forward "./shadows";
@forward "./borders";
@forward "./durations";
@forward "./easing";
@forward "./z-index";
```

### Usage in Components

```scss
// components/_button.scss
@use "../../tokens" as t;

@layer components {
  .button {
    // Colors (from tokens._colors)
    background-color: t.$color-primary;
    color: t.$color-on-primary;
    
    // Spacing (from tokens._spacing)
    padding: t.$spacing-md t.$spacing-lg;
    
    // Typography (from tokens._typography)
    font-family: t.$font-family-system;
    font-size: t.$font-size-base;
    font-weight: t.$font-weight-semibold;
    line-height: t.$line-height-normal;
    
    // Or use CSS variables directly
    padding: var(--spacing-md);
    font-size: var(--font-size-base);
    color: var(--color-primary);
  }
}
```

### Reference
- See: Requirement 5 in `CSS_REFACTORING_EXECUTION_PLAN.md`

---

*[Document continues with Requirements 6-15 in similar detail...]*

## Additional Requirements (6-15)

Due to length constraints, here's the summary of remaining requirements:

### Requirement 6: Context-Based `:root`/`:has()` Rules
Use `:root:has(.shell-{id})` and `:root:has(.view-{id})` to scope tokens

### Requirement 7: Logically Correct Loading/Init Order
System → Core → Shell → View cascade

### Requirement 8: Better `@layer` Naming
Clear, semantic names for all layers

### Requirement 9: Cleanup/Trim Redundant Styles
Deduplicate and remove unused CSS

### Requirement 10: Regroup/Cleanup Selectors
Organize selectors logically for readability

### Requirement 11: Refactor/Optimize SCSS Mixins
Create canonical mixin library

### Requirement 12: Better SCSS Nesting/Grouping
Use max 2-level nesting, group by concern

### Requirement 13: Recover/Repair Broken SCSS
Fix syntax errors and broken imports

### Requirement 14: Better `@use` Imports/Order
Logical import ordering following dependencies

### Requirement 15: Use `:where()`/`:is()` Selectors
Unify selectors with zero specificity

---

**Full Reference**: See `CSS_REFACTORING_EXECUTION_PLAN.md` and `MULTI_AGENT_COORDINATION_GUIDE.md`  
**Status**: Ready for implementation  
**Last Updated**: February 2, 2026
