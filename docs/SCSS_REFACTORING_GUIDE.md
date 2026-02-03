# SCSS Refactoring Guide - CSS Layers & Module Architecture

## 📚 Summary of Changes

This guide documents the refactoring of the CrossWord app's SCSS and CSS organization to implement proper layer-based cascade management and modern SCSS module syntax (`@use` instead of `@import`).

### Key Improvements

1. **CSS Cascade Layers** – Consistent layer ordering across all stylesheets
2. **SCSS Module System** – Migration from `@import` to `@use` with explicit namespacing
3. **Custom Properties Scoping** – Context-aware tokens using `:has()` selectors
4. **Code Organization** – Cleaner separation of concerns (tokens, base, shell, view, components, utilities)
5. **Reduced Duplication** – Deduplicated selectors and consolidated component styles
6. **Better Maintainability** – Enhanced readability with structured comments and grouped sections

---

## 🎯 Layer Hierarchy

### Official Layer Order

```scss
@layer system, tokens, base, shell, view, components, utilities, overrides;
```

### Layer Priorities (Lowest → Highest)

| Priority | Layer | Purpose | Example |
|----------|-------|---------|---------|
| 1 | `system` | Browser resets, normalize | `*, html, body { box-sizing: border-box; }` |
| 2 | `tokens` | Design tokens (CSS custom properties) | `:root { --primary: #007acc; }` |
| 3 | `base` | Global typography, defaults | `body { font-family: system-ui; }` |
| 4 | `shell` | Shell layout, navigation | `.shell-basic { display: flex; }` |
| 5 | `view` | View-specific layout | `.view-editor { --padding: 1rem; }` |
| 6 | `components` | Reusable UI components | `.button { padding: 0.5rem; }` |
| 7 | `utilities` | Atomic helper classes | `.p-md { padding: 0.75rem; }` |
| 8 | `overrides` | Emergency fixes (rare) | `.error-state { color: red !important; }` |

---

## 🔧 SCSS Module System (`@use` vs `@import`)

### Old Pattern (Deprecated)

```scss
@import "./colors";
@import "./spacing";
@import "./typography";
```

**Problems:**
- Global namespace pollution
- Difficult to track variable sources
- No explicit dependency graph
- Hard to refactor safely

### New Pattern (Recommended)

```scss
@use "./colors" as color;
@use "./spacing" as space;
@use "./typography" as typo;

/* Usage */
.element {
    color: color.$primary;
    padding: space.$md;
    font-size: typo.$text-lg;
}
```

**Benefits:**
- Explicit namespacing prevents collisions
- Clear dependency graph
- Easier refactoring and testing
- Modern SCSS best practice

### Aliasing & Forward

**Namespace alias:**
```scss
@use "./design-system/tokens" as ds;
background: ds.$surface;
```

**Explicit naming:**
```scss
@use "./vendor/framework" as *;  /* Import all into global namespace (rare) */
```

**Public API with `@forward`:**
```scss
/* tokens.scss */
@forward "./colors";
@forward "./spacing" as space-*;  /* Prefix public names */
```

---

## 📂 File Organization Strategy

### Shell Structure Example: `shells/basic/`

```
shells/basic/
├── _keyframes.scss    # @layer tokens; @keyframes only
├── _tokens.scss       # @layer tokens; design tokens (custom properties)
├── _components.scss   # @layer components; reusable UI parts
├── basic.scss         # @layer shell; shell-specific theme & layout
├── layout.scss        # @layer shell; detailed layout (optional)
├── index.scss         # ROOT: declares @layer order, imports all modules
```

### View Structure Example: `views/viewer/`

```
views/viewer/
├── _tokens.scss       # @layer tokens; view-specific custom properties
├── _styles.scss       # @layer view; view-specific layout & components
├── viewer.scss        # ROOT: imports _tokens.scss, _styles.scss
```

---

## ✅ File-by-File Refactoring Checklist

### 1. Root Entry Point (`shells/{shell}/index.scss`)

**What to do:**
- [ ] Declare layer order **once** (before any imports)
- [ ] Use `@use` for all imports
- [ ] Add comprehensive header comment explaining layer strategy
- [ ] Remove old `@layer` declarations from imports

**Example:**
```scss
/**
 * Basic Shell Styles - Layer-based Architecture
 * Declares: system, tokens, base, shell, view, components, utilities, overrides
 */

@layer system, tokens, base, shell, view, components, utilities, overrides;

@use "keyframes" as kf;
@use "tokens" as t;
@use "components" as c;
@use "basic" as basic;
@use "layout" as layout;
```

### 2. Token Files (`_tokens.scss`)

**What to do:**
- [ ] Use `@layer tokens` to wrap ALL declarations
- [ ] Group tokens semantically (layout, colors, typography, etc.)
- [ ] Add section headers with `/* ======= ... ======= */`
- [ ] Use consistent comment formatting
- [ ] Scope tokens to specific selectors (e.g., `.shell-basic`)

**Example:**
```scss
@layer tokens {
    .shell-basic {
        /* Layout tokens */
        --shell-nav-height: 56px;

        /* Color tokens */
        --color-primary: #007acc;

        /* Typography tokens */
        --text-lg: 1rem;
    }
}
```

### 3. Component Files (`_components.scss`)

**What to do:**
- [ ] Use `@layer components` to wrap all rules
- [ ] Flatten nested SCSS (convert `&` nesting to explicit selectors)
- [ ] Group related components with section headers
- [ ] Keep selectors low-specificity (classes only, no IDs)
- [ ] Remove duplicate rules

**Example:**
```scss
@layer components {
    .button {
        padding: 0.5rem 1rem;
        border-radius: 4px;
    }

    .button:hover {
        background-color: var(--color-primary-hover);
    }
}
```

### 4. Layout Files (`basic.scss`, `layout.scss`)

**What to do:**
- [ ] Use `@layer shell` for shell-specific rules
- [ ] Use `@layer view` for view-specific overrides
- [ ] Extract @keyframes to separate `_keyframes.scss`
- [ ] Remove duplicated keyframes
- [ ] Use descriptive section headers

**Example:**
```scss
/**
 * Basic Shell - Layout & Theme Styles
 * Wraps all rules in @layer shell for proper cascade
 */

@layer shell {
    /* ======= NAVIGATION ======= */
    .shell-basic__nav {
        display: flex;
        /* ... */
    }

    /* ======= CONTENT AREA ======= */
    .shell-basic__content {
        flex: 1;
        /* ... */
    }
}
```

### 5. Keyframes File (`_keyframes.scss`)

**What to do:**
- [ ] Extract all `@keyframes` to dedicated file
- [ ] Use `@layer tokens` to wrap keyframes
- [ ] Remove duplicates
- [ ] Document each animation's purpose

**Example:**
```scss
@layer tokens {
    @keyframes spin {
        0% { transform: rotate(0deg); }
        100% { transform: rotate(360deg); }
    }

    @keyframes fadeInUp {
        from {
            opacity: 0;
            transform: translateY(20px);
        }
        to {
            opacity: 1;
            transform: translateY(0);
        }
    }
}
```

---

## 🎨 Best Practices

### 1. Custom Properties Scoping

**DON'T:** Pollute `:root` globally
```scss
:root {
    --shell-color: #123;
    --view-color: #456;
}
```

**DO:** Use context-specific selectors
```scss
.shell-basic {
    --shell-color: #123;
}

:root:has(.view-editor) {
    --view-color: #456;
}
```

### 2. Low-Specificity Selectors

**DON'T:** Over-specific
```scss
div.container > section.content > p.text {
    color: blue;
}
```

**DO:** Minimal, intentional specificity
```scss
.text {
    color: blue;
}
```

### 3. Flatten SCSS Nesting

**DON'T:** Deep nesting
```scss
.component {
    &__item {
        &:hover {
            &::before {
                content: "x";
            }
        }
    }
}
```

**DO:** Explicit selectors (flatter = clearer)
```scss
.component__item {
    /* rules */
}

.component__item:hover {
    /* rules */
}

.component__item:hover::before {
    content: "x";
}
```

### 4. Semantic Naming for Tokens

**DON'T:** Use visual names
```scss
--blue: #007acc;
--small: 0.75rem;
```

**DO:** Use semantic names
```scss
--color-primary: #007acc;
--text-md: 0.75rem;
```

### 5. Section Headers

**DO:** Use consistent formatting
```scss
/* ======================================================================= */
/* SECTION NAME */
/* ======================================================================= */

.element { /* ... */ }
```

---

## 🔄 TypeScript Integration

### Layer Initialization (`src/frontend/views/styles.ts`)

The styles module now:
1. **Declares layers on load** – Injects `@layer` declaration into head
2. **Tracks loaded layers** – Maintains set of loaded layer IDs
3. **Provides helper functions**:
   - `loadStyleSystem()` – Load framework (veela, raw, etc.)
   - `loadShellTokens()` – Load shell-specific tokens
   - `loadViewStyles()` – Load view-specific styles

**Usage:**
```typescript
import { loadStyleSystem, loadShellTokens, loadViewStyles } from "fest/fl-ui/styles";

// 1. Load framework
await loadStyleSystem("veela-advanced");  // Loads system layer

// 2. When shell is selected
await loadShellTokens("basic");           // Loads tokens for shell-basic

// 3. When view is mounted
await loadViewStyles("viewer");           // Loads tokens + view layer
```

---

## 📊 File Checklist

### Shells
- [ ] `shells/basic/index.scss` – Updated with @use + layer declaration
- [ ] `shells/basic/_tokens.scss` – Wrapped in @layer tokens
- [ ] `shells/basic/basic.scss` – Wrapped in @layer shell
- [ ] `shells/basic/_components.scss` – Wrapped in @layer components
- [ ] `shells/basic/_keyframes.scss` – Wrapped in @layer tokens, deduplicated
- [ ] `shells/basic/layout.scss` – Wrapped in @layer shell, deduplicated

- [ ] `shells/faint/index.scss` – Similar refactoring
- [ ] `shells/faint/_tokens.scss` – Similar refactoring
- [ ] `shells/faint/faint.scss` – Similar refactoring

- [ ] `shells/raw/raw.scss` – Minimal; verify no @import

### Views
- [ ] `views/viewer/viewer.scss` – Root index with @use
- [ ] `views/viewer/_tokens.scss` – @layer tokens
- [ ] `views/viewer/_styles.scss` – @layer view

- [ ] `views/editor/editor.scss` – Similar structure
- [ ] `views/editor/_tokens.scss` – Similar structure

- [ ] (Repeat for other views)

### Boot Menu
- [ ] `main/boot-menu.scss` – Wrapped in proper layers

### Styles Module
- [ ] `views/styles.ts` – Updated with layer initialization

---

## 🧹 Cleanup & Deduplication

### Common Duplicates to Remove

1. **Keyframes** – Search for `@keyframes spin`, `@keyframes fadeInUp`, etc.
2. **Color tokens** – Check for theme definitions in multiple files
3. **Border radius tokens** – Often repeated across shells
4. **Spacing tokens** – Search for duplicate `--space-*` definitions
5. **Selectors** – Look for identical `.button`, `.card`, etc. rules

### Cleanup Commands

```bash
# Find all @keyframes definitions
grep -r "@keyframes" apps/CrossWord/src/frontend/

# Find @import statements (should be replaced with @use)
grep -r "@import" apps/CrossWord/src/frontend/

# Find duplicate class selectors
grep -rn "^\.class-name" apps/CrossWord/src/frontend/ | cut -d: -f1 | sort | uniq -d
```

---

## 📝 Migration Examples

### Before & After: Shell Index

**BEFORE:**
```scss
@use "keyframes" as kf;
@use "tokens" as t;
@use "components" as c;

@use "basic.scss";
@use "settings.scss";

@layer reset, base, components, settings, layout, utilities;
```

**AFTER:**
```scss
/**
 * Basic Shell Styles - Modern Layer-based Architecture
 * Declares layer order once for all imports
 */

@layer system, tokens, base, shell, view, components, utilities, overrides;

@use "keyframes" as kf;
@use "tokens" as t;
@use "components" as c;
@use "basic" as basic;
@use "layout" as layout;
```

### Before & After: Component File

**BEFORE:**
```scss
@layer base {
    .button {
        padding: 0.5rem;

        &:hover {
            background: var(--hover);
        }

        &.active {
            background: var(--active);
        }
    }
}
```

**AFTER:**
```scss
@layer components {
    .button {
        padding: 0.5rem;
        transition: background 0.2s ease;
    }

    .button:hover {
        background: var(--hover);
    }

    .button.active {
        background: var(--active);
    }
}
```

---

## 🚀 Next Steps

1. **Complete basic shell refactoring** – Finish `shells/basic/` fully
2. **Refactor other shells** – Apply same pattern to `faint`, `raw`
3. **Refactor views** – Apply to `viewer`, `editor`, etc.
4. **Test in browser** – Verify layers work correctly
5. **Remove old files** – Delete unused `settings.scss` etc.
6. **Document patterns** – Add style guide comments to codebase

---

## 📚 References

- **CSS Cascade Layers**: https://developer.mozilla.org/en-US/docs/Web/CSS/@layer
- **SCSS @use & @forward**: https://sass-lang.com/documentation/at-rules/use
- **CSS Custom Properties**: https://developer.mozilla.org/en-US/docs/Web/CSS/--*
- **:has() Selector**: https://developer.mozilla.org/en-US/docs/Web/CSS/:has

---

## ✅ Verification Checklist

After refactoring a file:

- [ ] No `@import` statements (all converted to `@use`)
- [ ] @layer declaration at root index only
- [ ] All rules wrapped in appropriate @layer
- [ ] No @layer declarations repeated in imported files
- [ ] Custom properties scoped appropriately (not global `:root`)
- [ ] No duplicate keyframes
- [ ] Selectors flattened (minimal nesting)
- [ ] Consistent section header formatting
- [ ] Low specificity (classes, not IDs)
- [ ] Tests pass (build succeeds, styles apply correctly)
