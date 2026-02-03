# 🌳 Complete DOM Tree Organization & CSS Mapping
## Element Generation Analysis from TypeScript/JavaScript

**Status**: DOM Architecture Reference  
**Created**: 2026-02-02  
**Purpose**: Map how TS/JS generates DOM → How CSS @layers must sequence

---

## Part 1: TS/JS DOM Generation Flow

### 1.1 Framework Architecture (lur.e)

```typescript
// Source: modules/projects/lur.e/src/lure/

DOM Generation Pipeline:
─────────────────────────────────────────────────

1. JSX/createElement (JSX.ts)
   ├─ Input: Component function or HTML string
   ├─ Process: Parse props (attributes, classes, styles, events)
   └─ Output: Normalized component object

2. htmlBuilder (Syntax.ts)
   ├─ Input: Template string or component
   ├─ Process: Create DocumentFragment
   │   ├─ Parse HTML/JSX
   │   ├─ Replace comment nodes with dynamic content
   │   ├─ Flatten node tree
   │   └─ Tree-walk all nodes
   └─ Output: DocumentFragment (ready to mount)

3. Element Creation (Bindings.ts - E function)
   ├─ Input: Element selector/instance
   ├─ Process: Apply all bindings
   │   ├─ reflectAttributes() → attr:* props
   │   ├─ reflectProperties() → prop:* props
   │   ├─ reflectClassList() → classList prop
   │   ├─ reflectStyles() → style prop
   │   ├─ reflectBehaviors() → data-* attributes
   │   ├─ reflectARIA() → aria-* attributes
   │   └─ bindEvent() → event listeners
   └─ Output: Configured HTMLElement

4. Children Mapping (Mapped.ts - M function)
   ├─ Input: Children array/object/primitive
   ├─ Process: Recursively map children
   │   ├─ Render arrays as multiple elements
   │   ├─ Render objects as Set/Map
   │   ├─ Convert primitives to text nodes
   │   └─ Append to parent
   └─ Output: Populated element tree

5. Mount Point
   ├─ Input: Root element (usually #app)
   ├─ Process: Insert fragment into DOM
   └─ Output: Live DOM tree
```

### 1.2 Real-World Example: CrossWord App Structure

```typescript
// Source: apps/CrossWord/src/frontend/

Boot Sequence:
──────────────────────────────────────────────

1. main/index.tsx → Bootstrap
   └─ import setupStyleSystem from './main/styles.ts'

2. styles.ts → Initialize Styles
   ├─ Call initializeLayerOrder() [LAYER: system]
   ├─ Inject tokens [LAYER: tokens]
   ├─ Inject base [LAYER: base]
   └─ Watch for shell/view changes

3. JSX Component Tree (simplified)
   └─ <App>
       ├─ <ShellProvider> [Shell Router]
       │   ├─ Load shell (basic/faint/raw)
       │   └─ Mount shell layout
       └─ <ViewProvider> [View Router]
           ├─ Watch view changes
           └─ Mount current view

4. Shell Render (shells/basic/layout/Views.ts)
   ├─ Mount header element
   ├─ Mount main navigation
   ├─ Mount view container
   └─ Mount footer element

5. View Render (views/{view}/index.tsx)
   ├─ Create view container
   ├─ Render view-specific elements
   └─ Attach event listeners
```

---

## Part 2: DOM Tree Structure at Runtime

### 2.1 Complete DOM Hierarchy

```html
<html>
  <!-- Layer: system (reset styles) -->
  <head>
    <style>@layer system, tokens, base, shell, view, components, utilities, overrides;</style>
    <style>@layer system { /* browser resets */ }</style>
    <style>@layer tokens { /* :root { --* } */ }</style>
    <style>@layer base { /* body, h1-h6, a, etc */ }</style>
  </head>

  <body data-shell="basic" data-view="viewer" data-theme="light">
    <!-- Layer: base (body styles) -->

    <div id="app-root">
      <!-- SHELL STRUCTURE: Mounted first -->
      <!-- Layer: shell -->
      <div class="shell-container" data-shell="basic">
        
        <!-- Shell: Header Section -->
        <header class="shell-header">
          <div class="shell-header-inner">
            <h1 class="shell-logo">CrossWord</h1>
            <nav class="shell-nav">
              <!-- Shell components -->
              <button class="shell-nav-button">File</button>
              <button class="shell-nav-button">Edit</button>
            </nav>
            <div class="shell-menu">
              <!-- Shell menu items -->
            </div>
          </div>
        </header>

        <!-- Shell: Main Content Area -->
        <main class="shell-main">
          <aside class="shell-sidebar">
            <!-- Shell sidebar content -->
          </aside>

          <!-- VIEW STRUCTURE: Mounted here dynamically -->
          <!-- Layer: view -->
          <div class="view-container" data-view="viewer">
            
            <!-- View-Specific Content -->
            <div class="view-viewer">
              <!-- Example: Viewer View -->
              <div class="viewer-toolbar">
                <button class="button">Zoom In</button>
                <button class="button">Zoom Out</button>
              </div>
              <div class="viewer-content">
                <div class="viewer-page">
                  <!-- Page content here -->
                </div>
              </div>
            </div>
          </div>
          <!-- /view-container -->

        </main>

        <!-- Shell: Footer Section -->
        <footer class="shell-footer">
          <p class="shell-status">Ready</p>
        </footer>

      </div>
      <!-- /shell-container -->

      <!-- MODALS/OVERLAYS (z-index control) -->
      <!-- Layer: components (modals) -->
      <div class="modal-container" role="dialog" aria-hidden="true">
        <!-- Modals render here -->
      </div>

      <!-- NOTIFICATIONS -->
      <!-- Layer: components (notifications) -->
      <div class="notification-container">
        <!-- Notifications render here -->
      </div>

    </div>
    <!-- /app-root -->

  </body>
</html>
```

### 2.2 DOM Load Timeline

```
TIME 0ms: HTML Parse Begins
├─ <html> created
├─ <head> parsed
│   └─ <link> stylesheets load (async)
│   └─ <style>@layer system...;</style> (LAYER: system)
├─ <body> parsed
│   └─ attributes set: data-shell, data-view, data-theme
└─ DOM Ready event

TIME 50-100ms: DOM Ready Event
├─ JavaScript executes
├─ styles.ts initializes
│   ├─ initializeLayerOrder() [first]
│   ├─ injectLayer('system', ...) [resets]
│   ├─ injectLayer('tokens', ...) [custom props]
│   └─ injectLayer('base', ...) [global styles]
├─ Shell component mounts
│   └─ injectLayer('shell', ...) 
├─ View component mounts
│   └─ injectLayer('view', ...)
└─ First Paint Ready

TIME 150-200ms: First Paint
├─ Browser renders visible layout
├─ Shell visible (header, nav, main, footer)
├─ View visible (current page content)
├─ Custom properties resolved
└─ :root:has(...) selectors evaluated

TIME 200-300ms: Interactions Ready
├─ Components mounted
├─ injectLayer('components', ...) [buttons, cards, etc]
├─ injectLayer('utilities', ...) [helper classes]
├─ Event listeners attached
└─ App fully interactive

TIME 300+ms: Continued Rendering
├─ Additional components lazy-load
├─ injectLayer() called as needed
└─ Overrides applied if necessary
```

---

## Part 3: Element-to-Style Mapping

### 3.1 Shell Elements & Their Styles

```html
<!-- SHELL STRUCTURE -->
<div class="shell-container" data-shell="basic">
  ├─ Styles:
  │   ├─ @layer shell { .shell-container { ... } }
  │   ├─ Context: :root:has(body[data-shell="basic"])
  │   └─ Tokens: --shell-*
  │
  ├─ Header Section
  │   ├─ Element: <header class="shell-header">
  │   ├─ Styles:
  │   │   ├─ @layer shell { .shell-header { ... } }
  │   │   └─ Tokens: --shell-header-bg, --shell-header-border
  │   │
  │   └─ Children
  │       ├─ <h1 class="shell-logo">
  │       │   └─ Styles:
  │       │       ├─ @layer base { h1 { ... } }
  │       │       └─ @layer components { .shell-logo { ... } }
  │       │
  │       ├─ <nav class="shell-nav">
  │       │   ├─ Styles: @layer shell { .shell-nav { ... } }
  │       │   └─ Children:
  │       │       └─ <button class="shell-nav-button">
  │       │           └─ Styles:
  │       │               ├─ @layer base { button { ... } }
  │       │               ├─ @layer shell { .shell-nav-button { ... } }
  │       │               └─ @layer components { .button { ... } }
  │       │
  │       └─ <div class="shell-menu">
  │           └─ Styles: @layer shell { .shell-menu { ... } }
  │
  ├─ Main Content
  │   ├─ Element: <main class="shell-main">
  │   ├─ Styles: @layer shell { .shell-main { ... } }
  │   │
  │   ├─ Sidebar
  │   │   ├─ Element: <aside class="shell-sidebar">
  │   │   ├─ Styles: @layer shell { .shell-sidebar { ... } }
  │   │   └─ Tokens: --shell-sidebar-bg
  │   │
  │   └─ View Container
  │       ├─ Element: <div class="view-container" data-view="viewer">
  │       ├─ Styles: @layer view { .view-container { ... } }
  │       │
  │       └─ View-Specific Content
  │           ├─ Element: <div class="view-viewer">
  │           ├─ Styles: @layer view { .view-viewer { ... } }
  │           │
  │           ├─ Toolbar
  │           │   ├─ Element: <div class="viewer-toolbar">
  │           │   ├─ Styles: @layer view { .viewer-toolbar { ... } }
  │           │   │
  │           │   └─ Buttons
  │           │       ├─ Element: <button class="button">
  │           │       ├─ Styles:
  │           │       │   ├─ @layer base { button { ... } }
  │           │       │   └─ @layer components { .button { ... } }
  │           │       │
  │           │       └─ Element: <button class="button">
  │           │
  │           └─ Content
  │               ├─ Element: <div class="viewer-content">
  │               ├─ Styles: @layer view { .viewer-content { ... } }
  │               │
  │               └─ Page
  │                   ├─ Element: <div class="viewer-page">
  │                   └─ Styles: @layer view { .viewer-page { ... } }
  │
  └─ Footer Section
      ├─ Element: <footer class="shell-footer">
      ├─ Styles: @layer shell { .shell-footer { ... } }
      └─ Children:
          └─ <p class="shell-status">
              └─ Styles:
                  ├─ @layer base { p { ... } }
                  └─ @layer shell { .shell-status { ... } }
```

### 3.2 Style Application Cascade

```
Element Query: <button class="button shell-nav-button">
──────────────────────────────────────────────────────────────

LAYER RESOLUTION ORDER (lowest to highest specificity):
┌─────────────────────────────────────────────────────────────┐
│ 1. @layer system                                            │
│    └─ * { box-sizing: border-box; }                         │
│       Specificity: 0,0,1                                    │
├─────────────────────────────────────────────────────────────┤
│ 2. @layer tokens                                            │
│    └─ :root { --color-primary: #007bff; }                  │
│       Specificity: 0,1,0                                    │
│    └─ :root:has(body[data-shell="basic"]) { ... }          │
│       Specificity: 0,2,1                                    │
├─────────────────────────────────────────────────────────────┤
│ 3. @layer base                                              │
│    └─ button { padding: 0.5rem 1rem; color: black; }       │
│       Specificity: 0,0,1                                    │
├─────────────────────────────────────────────────────────────┤
│ 4. @layer shell                                             │
│    └─ .shell-nav-button { padding: 0.25rem 0.5rem; }       │
│       Specificity: 0,1,0                                    │
├─────────────────────────────────────────────────────────────┤
│ 5. @layer view                                              │
│    └─ (no matching rules)                                   │
├─────────────────────────────────────────────────────────────┤
│ 6. @layer components                                        │
│    └─ .button { @include mixin.transition(background); }   │
│       Specificity: 0,1,0                                    │
│    └─ .button:hover { background: blue; }                  │
│       Specificity: 0,1,1                                    │
├─────────────────────────────────────────────────────────────┤
│ 7. @layer utilities                                         │
│    └─ (no matching rules)                                   │
├─────────────────────────────────────────────────────────────┤
│ 8. @layer overrides                                         │
│    └─ (no matching rules)                                   │
└─────────────────────────────────────────────────────────────┘

RESOLVED STYLES (applied in order):
┌─────────────────────────────────────────────────────────────┐
│ button                                                      │
│ ├─ box-sizing: border-box (from system)                    │
│ ├─ padding: 0.5rem 1rem (from base button)                 │
│ ├─ color: black (from base button)                         │
│ ├─ padding: 0.25rem 0.5rem (from shell-nav-button)  ✓      │
│ │     ↳ OVERRIDES base padding due to same specificity    │
│ │        but layer order (shell > base)                    │
│ ├─ transition: background 300ms ease (from components)     │
│ └─ color: white (hover state)                              │
│     └─ Applied only on :hover pseudo-class                 │
└─────────────────────────────────────────────────────────────┘

FINAL COMPUTED VALUES:
  box-sizing: border-box
  padding: 0.25rem 0.5rem  ← shell layer wins
  color: black (default) / white (:hover)
  transition: background 300ms ease
```

---

## Part 4: Dynamic DOM Changes & Style Updates

### 4.1 Shell Change Scenario

```typescript
// User switches from "basic" shell to "faint" shell

Timeline:
──────────────────────────────────────────────────

TIME 0ms: Change Event
└─ onShellChange('faint') triggered

TIME 5ms: Update Data Attribute
├─ document.body.setAttribute('data-shell', 'faint')
├─ CSS :has() re-evaluation
│   ├─ :root:has(body[data-shell="basic"]) → no match
│   ├─ :root:has(body[data-shell="faint"]) → MATCH ✓
│   └─ Custom properties update
└─ Existing elements re-styled

TIME 10ms: Inject Faint Shell Styles
├─ styleManager.replaceLayer('shell', faintShellCSS)
├─ Remove old shell styles from DOM
├─ Insert new shell styles
└─ Browser reflow/repaint

TIME 50ms: Shell Re-render
├─ Old shell unmounts (cleanup)
├─ New shell mounts
│   ├─ <div class="shell-container" data-shell="faint">
│   └─ All shell-faint specific elements
└─ First paint of new shell

TIME 100ms: Shell Visible
├─ New layout applied
├─ Custom properties active
└─ User sees new shell

STYLE CHANGES:
─────────────
Before: @layer shell { /* basic shell styles */ }
After:  @layer shell { /* faint shell styles */ }

Context Change:
Before: :root:has(body[data-shell="basic"]) { --shell-*: ... }
After:  :root:has(body[data-shell="faint"]) { --shell-*: ... }
```

### 4.2 View Change Scenario

```typescript
// User navigates from "viewer" view to "editor" view

Timeline:
──────────────────────────────────────────────────

TIME 0ms: Navigation Event
└─ router.navigate('editor') triggered

TIME 5ms: Update Data Attribute
├─ document.body.setAttribute('data-view', 'editor')
├─ CSS :has() re-evaluation
│   ├─ :root:has(body[data-view="viewer"]) → no match
│   ├─ :root:has(body[data-view="editor"]) → MATCH ✓
│   └─ View-specific custom properties update
└─ Existing elements re-styled

TIME 10ms: Replace View Layer
├─ styleManager.replaceLayer('view', editorViewCSS)
├─ Remove old view styles
├─ Insert editor view styles
└─ Browser reflow (only main area affected)

TIME 30ms: View Component Swap
├─ Old view unmounts (cleanup)
├─ New view mounts
│   ├─ <div class="view-container" data-view="editor">
│   ├─ <div class="view-editor">
│   └─ Editor-specific elements (sidebar, toolbar, etc)
└─ Elements enter the DOM

TIME 75ms: View Visible
├─ New layout applied
├─ Custom properties active
└─ User sees new view

TIME 100ms: Interactions Ready
├─ Event listeners attached
├─ Components interactive
└─ App responsive

STYLE CHANGES:
─────────────
Layer: view (replaced)
Before: @layer view { /* viewer styles */ }
After:  @layer view { /* editor styles */ }

Tokens: view-specific (updated)
Before: :root:has(body[data-view="viewer"]) { --view-*: ... }
After:  :root:has(body[data-view="editor"]) { --view-*: ... }
```

---

## Part 5: CSS @layer Loading Sequence (Technical)

### 5.1 What Must Happen When

```
BOOT SEQUENCE:
──────────────────────────────────────────────────

PHASE 1: HTML Parse (browser automatic)
└─ @layer system; (in <head>)
   └─ @layer system { /* resets */ }

PHASE 2: JavaScript Execution (styles.ts)
├─ initializeLayerOrder() [CRITICAL]
│   ├─ Create CSSStyleSheet
│   ├─ insertRule("@layer system, tokens, base, shell, view, components, utilities, overrides;")
│   └─ adoptedStyleSheets.push(sheet)
│
├─ injectLayer('system', systemCSS)
│   └─ Insert rules into sheet with @layer system { ... }
│
├─ injectLayer('tokens', tokensCSS)
│   ├─ :root { --color-*: ... }
│   └─ :root:has(body[data-shell="basic"]) { --shell-*: ... }
│
└─ injectLayer('base', baseCSS)
    └─ body, h1, a, button, input, etc...

PHASE 3: Shell Mount (shells/basic/layout/Views.ts)
└─ injectLayer('shell', shellCSS)
    ├─ .shell-container { ... }
    ├─ .shell-header { ... }
    └─ (all shell-specific selectors)

PHASE 4: View Mount (views/*/index.tsx)
└─ injectLayer('view', viewCSS)
    ├─ .view-container { ... }
    ├─ .view-{view-name} { ... }
    └─ (all view-specific selectors)

PHASE 5: Components & Utilities (lazy)
├─ injectLayer('components', componentsCSS)
│   ├─ .button { ... }
│   ├─ .card { ... }
│   └─ .modal { ... }
│
└─ injectLayer('utilities', utilitiesCSS)
    ├─ .flex-center { ... }
    ├─ .text-truncate { ... }
    └─ .m-4 { ... }
```

### 5.2 Critical Timing Requirements

```
CONSTRAINT 1: @layer order MUST be declared before first style
├─ Can be in <style> tag
├─ Can be in @import
├─ Can be via CSSStyleSheet.insertRule()
└─ MUST come before any @layer rules

CONSTRAINT 2: Custom properties MUST be in :root before use
├─ @layer tokens { :root { --color-*: ... } }
├─ Must be injected BEFORE @layer shell/view
└─ Allows shells/views to use var(--color-*)

CONSTRAINT 3: Shell styles MUST load before view styles
├─ @layer shell < @layer view (order matters)
├─ Shell provides base layout
├─ View overrides shell (same specificity but higher layer)
└─ Example: .shell-main becomes view-main with view layer

CONSTRAINT 4: Context selectors depend on DOM attributes
├─ :root:has(body[data-shell="basic"])
├─ Requires body[data-shell] attribute SET before evaluation
├─ Set attribute BEFORE injecting shell layer
└─ Attribute changes trigger :has() re-evaluation

CONSTRAINT 5: Dynamic injection order matters
├─ Shell change: updateLayer('shell', newShellCSS)
├─ View change: replaceLayer('view', newViewCSS)
├─ Always update data attributes FIRST
└─ THEN inject/update CSS layers
```

---

## Part 6: Integration Points & Best Practices

### 6.1 TS/JS Integration Checklist

```
□ INITIALIZATION
  ├─ [ ] Call initializeLayerOrder() FIRST in styles.ts
  ├─ [ ] Inject system layer immediately
  ├─ [ ] Inject tokens layer before any shell/view
  └─ [ ] Inject base layer before shell

□ SHELL MOUNTING
  ├─ [ ] Set body[data-shell] attribute
  ├─ [ ] Wait for attribute DOM update
  ├─ [ ] Then inject shell layer CSS
  ├─ [ ] Verify :root:has() selectors activate
  └─ [ ] Shell renders with correct styles

□ VIEW MOUNTING
  ├─ [ ] Set body[data-view] attribute
  ├─ [ ] Wait for attribute DOM update
  ├─ [ ] Replace view layer CSS
  ├─ [ ] Verify :root:has() selectors activate
  └─ [ ] View renders with correct styles

□ COMPONENT MOUNTING (as needed)
  ├─ [ ] Use existing components layer
  ├─ [ ] Don't create new layers per component
  ├─ [ ] Use class-based styling
  └─ [ ] Utility classes from utilities layer

□ CLEANUP
  ├─ [ ] Remove old styles when replacing
  ├─ [ ] Don't accumulate duplicate sheets
  ├─ [ ] Track injected layers in Map
  └─ [ ] Verify memory usage
```

### 6.2 CSS/SCSS Integration Checklist

```
□ LIBRARY FILES (_lib/)
  ├─ [ ] NO @layer in functions.scss
  ├─ [ ] NO @layer in mixins.scss
  ├─ [ ] NO @layer in variables.scss
  ├─ [ ] @forward aggregator in index.scss
  └─ [ ] Document all exports

□ LAYER FILES (layers/)
  ├─ [ ] Each file wrapped with @layer {name}
  ├─ [ ] system: Browser resets only
  ├─ [ ] tokens: Custom properties (:root, :root:has())
  ├─ [ ] base: Global element styles (body, h1, etc)
  ├─ [ ] components: Reusable UI components (.button, .card)
  └─ [ ] utilities: Helper classes (.flex-center, .m-4)

□ SHELL FILES (shells/*/index.scss)
  ├─ [ ] Root file declares @layer shell, view, components, utilities
  ├─ [ ] @use "fest/fl-ui/styles/lib" imports
  ├─ [ ] All styles wrapped with @layer shell { ... }
  ├─ [ ] Tokens in separate _tokens.scss file
  ├─ [ ] Context selectors: :root:has(body[data-shell="..."])
  └─ [ ] NO @import (use @use only)

□ VIEW FILES (views/*/index.scss)
  ├─ [ ] Root file declares @layer view, components, utilities
  ├─ [ ] @use "fest/fl-ui/styles/lib" imports
  ├─ [ ] All styles wrapped with @layer view { ... }
  ├─ [ ] Tokens in separate _tokens.scss file
  ├─ [ ] Context selectors: :root:has(body[data-view="..."])
  ├─ [ ] Nesting ≤ 2 levels deep
  └─ [ ] NO @import (use @use only)

□ GENERAL SCSS
  ├─ [ ] All styles in @layer (except libs)
  ├─ [ ] Use :where() for zero specificity where possible
  ├─ [ ] Use :is() for selector matching
  ├─ [ ] Use :has() for parent/context selectors
  ├─ [ ] Flat nesting (max 2 levels)
  ├─ [ ] BEM-like naming for clarity
  └─ [ ] Document all custom properties
```

---

## Part 7: Example: Complete Element Flow

### User Journey: Open Editor View

```
STEP 1: User clicks "Edit" in shell
├─ Event: onclick → onNavigate('editor')
└─ DOM Ready

STEP 2: Navigation triggers
├─ Code: router.navigate('editor')
├─ Action: document.body.setAttribute('data-view', 'editor')
└─ Effect: DOM updates (visible to CSS immediately)

STEP 3: CSS Re-evaluation (:has selectors)
├─ OLD: :root:has(body[data-view="viewer"]) → no match
│   └─ Tokens removed: --view-*, --editor-*
├─ NEW: :root:has(body[data-view="editor"]) → MATCH ✓
│   └─ Tokens applied: --view-editor-*, --editor-*
└─ Result: Custom properties update

STEP 4: View layer is replaced
├─ OLD: @layer view { /* viewer styles */ }
├─ NEW: @layer view { /* editor styles */ }
├─ Old sheet removed from adoptedStyleSheets
└─ New sheet added

STEP 5: Old view component unmounts
├─ <div class="view-viewer"> removed
├─ Event listeners cleaned up
└─ Memory freed

STEP 6: New view component mounts
├─ JSX renders <EditorView>
├─ Creates: <div class="view-container" data-view="editor">
├─ Creates: <div class="view-editor">
│   ├─ <aside class="editor-sidebar">
│   ├─ <div class="editor-toolbar">
│   │   └─ <button class="button">
│   └─ <div class="editor-content">
└─ All appended to shell-main

STEP 7: Styles applied automatically
├─ @layer view { .view-editor { ... } }
├─ @layer view { .editor-sidebar { ... } }
├─ @layer view { .editor-toolbar { ... } }
├─ @layer components { .button { ... } }
├─ Custom properties from :root:has(body[data-view="editor"])
└─ All selectors evaluate with new context

STEP 8: Browser paints
├─ Layout recalculated (main area reflow)
├─ Paint updated (main area repaint)
├─ New view visible ✓
└─ All styles applied

STEP 9: App ready
├─ Event listeners attached
├─ Interactions enabled
└─ Animation ready
```

### DOM at Each Step:

```
STEP 2: Data attribute updated
───────────────────────────────────────────────
<body data-shell="basic" data-view="viewer">
    └─ (old)

<body data-shell="basic" data-view="editor">
    └─ (new) ← attribute changed, CSS :has() re-evaluates

STEP 6: New elements mounted
───────────────────────────────────────────────
<div class="shell-container" data-shell="basic">
  <main class="shell-main">
    
    <!-- OLD VIEW (removed) -->
    <!-- <div class="view-container" data-view="viewer">
           <div class="view-viewer"> ... </div>
         </div> -->

    <!-- NEW VIEW (mounted) -->
    <div class="view-container" data-view="editor">
      <div class="view-editor">
        <aside class="editor-sidebar">
          <!-- Editor sidebar content -->
        </aside>
        <div class="editor-toolbar">
          <button class="button">Save</button>
        </div>
        <div class="editor-content">
          <!-- Editor canvas/content -->
        </div>
      </div>
    </div>

  </main>
</div>
```

---

## Part 8: Performance Implications

### 8.1 Style Injection Performance

```
COST ANALYSIS:
──────────────────────────────────────────────

Operation                    Cost        Time
─────────────────────────────────────────────
Create CSSStyleSheet()        LOW         <1ms
insertRule() (1 rule)        MEDIUM      1-2ms
insertRule() (100+ rules)    MEDIUM      5-10ms
adoptedStyleSheets.push()     LOW        <1ms
Attribute update             MEDIUM      2-5ms
:has() selector evaluation    MEDIUM     3-8ms (1st time)
                                         <1ms (cached)
Browser reflow               HIGH        10-50ms
Browser repaint              HIGH        5-20ms

TOTAL PER CHANGE:
  Shell change: 20-80ms
  View change:  15-70ms
  (Mostly reflow/repaint, not style injection)

OPTIMIZATION:
  ✓ Use adoptedStyleSheets (fast)
  ✓ Batch DOM updates (fewer reflows)
  ✓ Use data attributes (fast :has evaluation)
  ✓ Avoid document.body.style (slow, triggers reflow)
```

### 8.2 CSS Specificity & Performance

```
RULE EVALUATION:
────────────────────────────────────────────

Selector                              Specificity  Cost
───────────────────────────────────────────────────────
.button                               0,1,0        FAST
button                                0,0,1        FAST
:where(.button)                       0,0,0        FASTEST
:root:has(body[data-shell="basic"])  0,2,1        FAST
:is(.button, .btn)                    0,1,0        FAST

CSS @layer evaluation:
  ✓ @layer system wins over normal (100% cascade)
  ✓ Only style once per element (browser caches)
  ✓ Minimal performance impact

RECOMMENDATION:
  ✓ Use low specificity (0,1,0)
  ✓ Rely on @layer for cascade
  ✓ Avoid high specificity (0,2,0+)
  ✓ Use :where() for component libraries
```

---

## Conclusion

This document establishes the complete mapping from:

1. **TS/JS DOM Generation** → How lur.e creates elements
2. **DOM Structure** → How elements are organized at runtime
3. **Style Injection** → How CSS @layers must sequence
4. **Dynamic Changes** → How shell/view changes trigger re-styling
5. **Performance** → How to optimize style operations

**Key Takeaway**: CSS @layer order must match the DOM mounting order:
- system (browser) → tokens (properties) → base (elements) → shell (layout) → view (content) → components (UI) → utilities (helpers) → overrides (fixes)

This ensures predictable, performant, maintainable styling at scale.

---

**Created by**: CSS Architecture Team  
**Status**: 📚 Reference Documentation  
**Use With**: COMPREHENSIVE_SCSS_COORDINATION_STRATEGY.md, MULTI_AGENT_COORDINATION_FRAMEWORK.md
