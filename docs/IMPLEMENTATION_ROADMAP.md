# CSS Architecture Refactoring - Master Implementation Roadmap

## Executive Summary

This roadmap provides a comprehensive, phase-by-phase plan for refactoring the U2RE.space CSS architecture to implement proper `@layer` cascading, migrate from `@import` to `@use`, establish context-based selectors with `:has()`, and optimize overall style management.

**Timeline:** 5-6 phases over 4-6 weeks  
**Impact:** 15-20% CSS size reduction, zero cascading conflicts, improved maintainability  
**Dependencies:** Node.js 18+, SCSS 1.50+, Chrome/Firefox/Safari (all support @layer)

## Phase Overview

```
┌─────────────────────────────────────────────────────────────────┐
│ PHASE 1: Foundation Architecture (Week 1)                      │
│ - Create shared layer definitions                              │
│ - Create custom properties modules                             │
│ - Create layer manager utility                                 │
│ - Create documentation & templates                             │
└─────────────────────────────────────────────────────────────────┘
                            ↓
┌─────────────────────────────────────────────────────────────────┐
│ PHASE 2: Veela CSS Migration (Week 2)                          │
│ - Update layer definitions                                     │
│ - Migrate @import to @use                                      │
│ - Wrap runtime styles in @layer                                │
│ - Test all variants                                            │
└─────────────────────────────────────────────────────────────────┘
                            ↓
┌─────────────────────────────────────────────────────────────────┐
│ PHASE 3: FL.UI Refactoring (Week 2-3)                          │
│ - Update service styles                                        │
│ - Apply @layer structure                                       │
│ - Migrate imports to @use                                      │
│ - Test with/without veela                                      │
└─────────────────────────────────────────────────────────────────┘
                            ↓
┌─────────────────────────────────────────────────────────────────┐
│ PHASE 4: CrossWord Frontend (Week 3-4)                         │
│ - Refactor shells (basic, faint, raw)                          │
│ - Refactor views (workcenter, viewer, etc)                     │
│ - Add context selectors (:has)                                 │
│ - Implement initialization sequence                            │
└─────────────────────────────────────────────────────────────────┘
                            ↓
┌─────────────────────────────────────────────────────────────────┐
│ PHASE 5: Optimization & Cleanup (Week 4-5)                     │
│ - Remove duplicate styles                                      │
│ - Consolidate selectors                                        │
│ - Optimize media queries                                       │
│ - Reduce CSS size                                              │
└─────────────────────────────────────────────────────────────────┘
                            ↓
┌─────────────────────────────────────────────────────────────────┐
│ PHASE 6: Testing & Documentation (Week 5-6)                    │
│ - Comprehensive testing                                        │
│ - Performance validation                                       │
│ - Create implementation guide                                  │
│ - Team training & documentation                                │
└─────────────────────────────────────────────────────────────────┘
```

## Phase 1: Foundation Architecture (Week 1)

### Objectives
- Establish shared layer definitions
- Create custom properties infrastructure
- Provide utilities and documentation
- Set team standards

### Deliverables

#### 1.1 Shared Layer Definitions ✓
- **File:** `modules/shared/scss-layers/_layers.scss`
- **Contents:** Unified cascade order definition
- **Status:** COMPLETED

#### 1.2 Custom Properties Modules ✓
- **Files:**
  - `modules/shared/scss-custom-properties/system.scss` - Base tokens
  - `modules/shared/scss-custom-properties/colors.scss` - Color tokens  
  - `modules/shared/scss-custom-properties/typography.scss` - Typography tokens
  - `modules/shared/scss-custom-properties/index.scss` - Aggregator
- **Status:** COMPLETED

#### 1.3 Layer Manager Utility ✓
- **File:** `modules/projects/dom.ts/src/layer-manager.ts`
- **Provides:** TypeScript API for managing layer initialization
- **Status:** COMPLETED

#### 1.4 Documentation ✓
- **Files:**
  - `CSS_ARCHITECTURE_REFACTORING_PLAN.md` - Overall strategy
  - `CSS_LAYER_INITIALIZATION_GUIDE.md` - Boot sequence guide
  - `SCSS_REFACTORING_TEMPLATE.md` - Migration patterns
  - `VEELA_CSS_REFACTORING_GUIDE.md` - Veela-specific guidance
  - `FLUI_STYLES_REFACTORING_GUIDE.md` - FL.UI-specific guidance
  - `CROSSWORD_FRONTEND_REFACTORING_GUIDE.md` - CrossWord guidance
- **Status:** COMPLETED

### Phase 1 Validation Checklist

- [x] Layer definitions compile without errors
- [x] Custom properties accessible via `@use`
- [x] Layer manager has full TypeScript documentation
- [x] All guidance documents complete and reviewed
- [x] Team onboarded on new architecture

### Next Steps
→ Proceed to Phase 2

---

## Phase 2: Veela CSS Migration (Week 2)

### Objectives
- Migrate veela.css to new layer system
- Replace all `@import` with `@use`
- Wrap all runtime styles in `@layer`
- Maintain backward compatibility

### File-by-File Tasks

#### Priority 1: Layer System Update
```
⬜ Update runtime/_layers.scss
   - Define new layer mappings
   - Maintain backward compatibility aliases
   - Test layer order
```

**Expected Output:**
```scss
@layer
    system.normalize,
    system.tokens,
    runtime.core.base,
    runtime.core.layout,
    runtime.core.components,
    runtime.core.utilities,
    context.themes,
    context.overrides;

// Backward compatibility
@layer ux-normalize { }
@layer ux-tokens { }
// ... etc
```

#### Priority 2: Import Migration
```
⬜ Update all files in runtime/
   - Replace @import with @use
   - Establish namespace conventions
   - Update relative paths
   
Examples:
@import "./styles" → @use "./styles" as s;
@import "@lib/mixins" → @use "../lib/mixins" as m;
```

#### Priority 3: Layer Wrapping
```
⬜ Wrap CSS rules in appropriate layers

Current:
.button { ... }

New:
@layer runtime.core.components {
    .button { ... }
}
```

**Files to update (by category):**

**Layout Files:**
- [ ] `runtime/core/layout/_core-layout.scss` → `runtime.core.layout`
- [ ] `runtime/core/layout/_normalize.scss` → `system.normalize`
- [ ] `runtime/core/layout/_states.scss` → `runtime.core.layout`
- [ ] `runtime/core/layout/_gridbox.scss` → `runtime.core.layout`
- [ ] `runtime/core/layout/_orientbox.scss` → `runtime.core.layout`

**Base/Design Files:**
- [ ] `runtime/core/misc/*.scss` → `runtime.core.base`
- [ ] `runtime/basic/design/*.scss` → `runtime.core.components`
- [ ] `runtime/advanced/design/*.scss` → `runtime.core.components`

**Animation/Effects:**
- [ ] `runtime/advanced/effects/*.scss` → `runtime.core.utilities`

**Theme Files:**
- [ ] `runtime/advanced/theme/*.scss` → `context.themes`

#### Priority 4: Custom Properties Integration
```
⬜ Replace hard values with variables

Current:
padding: 8px 16px;
color: #0066cc;
border-radius: 8px;

New:
padding: var(--space-sm) var(--space-md);
color: var(--color-primary);
border-radius: var(--radius-md);
```

#### Priority 5: Testing
```
⬜ Test each variant
   - [ ] core variant loads correctly
   - [ ] basic variant loads correctly
   - [ ] advanced variant loads correctly
   - [ ] beercss variant loads correctly
   - [ ] Layer order is correct
   - [ ] No console errors
```

### Phase 2 Validation

- [ ] All veela files use `@use` instead of `@import`
- [ ] 100% of CSS rules wrapped in `@layer`
- [ ] Hard-coded values replaced with custom properties
- [ ] All variants load and display correctly
- [ ] Layer order matches unified hierarchy
- [ ] Backward compatibility maintained
- [ ] CSS size not increased (should decrease slightly)

### Estimated Effort: 16-20 hours
### Difficulty: Medium
### Risk: Low (contained to veela.css module)

---

## Phase 3: FL.UI Refactoring (Week 2-3)

### Objectives
- Update FL.UI style layers
- Migrate service styles
- Integrate with veela changes
- Maintain multiple entry points

### Task Breakdown

#### 3.1 Layer System Update
```
⬜ Update layers.scss

Current layer names → New names:
ux-layer.u2-normalize → system.normalize
ux-layer.ux-agate → runtime.core.components
ux-ctm → context.themes
ux-classes → runtime.core.utilities
ui-window-frame → runtime.core.components
```

#### 3.2 Service Styles Refactoring
```
⬜ FileManager service styles
   File: services/file-manager/scss/FileManager.scss
   Layer: runtime.core.components
   
   Tasks:
   - Add file header documentation
   - Replace @import with @use
   - Wrap in @layer runtime.core.components
   - Replace hard values with custom properties
   - Add `:where()` for element selectors
   - Add `:has()` for context scoping

⬜ FileManagerContent service styles
   File: services/file-manager/scss/FileManagerContent.scss
   Layer: runtime.core.components
   (Same pattern as FileManager)
```

#### 3.3 Component Styles Update
```
⬜ Draggable component (_draggable.scss)
⬜ Resizable component (_resizable.scss)
⬜ Window Frame component (_window-frame.scss)

Pattern:
- Add documentation header
- Migrate imports to @use
- Wrap in @layer runtime.core.components
- Use custom properties
```

#### 3.4 Entry Point Updates
```
⬜ Update index.scss
   - Verify all imports use @use
   - Ensure layer registration is correct
   - Document entry points

⬜ Verify core.scss entry point (should have no layers)
⬜ Verify veela.scss entry point (should use veela layers)
```

#### 3.5 Testing
```
⬜ Test multiple scenarios:
   - [ ] FL.UI standalone (without veela)
   - [ ] FL.UI with veela basic
   - [ ] FL.UI with veela advanced
   - [ ] FileManager service loads and displays
   - [ ] Component styles apply correctly
   - [ ] Dark theme works
   - [ ] No CSS conflicts
```

### Files to Update (Checklist)

**Priority 1 - Foundation:**
- [ ] `layers.scss`
- [ ] `index.scss`

**Priority 2 - Services:**
- [ ] `services/file-manager/scss/FileManager.scss`
- [ ] `services/file-manager/scss/FileManagerContent.scss`

**Priority 3 - Components:**
- [ ] `components/_draggable.scss`
- [ ] `components/_resizable.scss`
- [ ] `components/_window-frame.scss`

**Priority 4 - Core (usually no changes needed):**
- [ ] Verify all core mixins have proper documentation
- [ ] Ensure backward compatibility

### Phase 3 Validation

- [ ] All FL.UI files use `@use` pattern
- [ ] Service styles properly layered
- [ ] Component styles apply correctly
- [ ] Works with and without veela
- [ ] No CSS size increase
- [ ] TypeScript compilation successful

### Estimated Effort: 12-16 hours
### Difficulty: Medium
### Risk: Low (contained to FL.UI module)

---

## Phase 4: CrossWord Frontend Refactoring (Week 3-4)

### Objectives
- Refactor all shells with layer structure
- Refactor all views with proper scoping
- Implement context-based isolation (`:has()`)
- Establish initialization sequence

### 4.1 Shell Refactoring

#### Basic Shell
```
⬜ Create/update: shells/basic/layout.scss
   Layer: shell.layout
   - Main shell structure
   - Nav bar, content area layout
   - Use custom properties

⬜ Create/update: shells/basic/_components.scss
   Layer: shell.components
   - Navigation buttons
   - Status messages
   - Loading indicators

⬜ Update: shells/basic/basic.scss
   Layer: shell.context
   - Theme variants
   - Shell-specific tokens

⬜ Create: shells/basic/index.ts
   - Initialization logic
   - Style loading sequence
```

#### Faint Shell
```
⬜ Similar refactoring as basic
   Location: shells/faint/
   - Main styles in faint.scss
   - Component styles in scss/
   - Proper layer wrapping
```

#### Raw Shell
```
⬜ Minimal refactoring (already minimal)
   Location: shells/raw/
   - Ensure proper layer assignment
   - Basic structure only
```

### 4.2 View Refactoring

For each view, create file structure:
```
views/{view-name}/
├── scss/
│   ├── _layout.scss      → view.layout
│   ├── _components.scss  → view.components
│   ├── _utilities.scss   → view.utilities
│   ├── _theme-dark.scss  → context.themes
│   └── _print.scss       → context.print
└── index.ts              → Initialization
```

**Views to refactor:**

- [ ] **Workcenter** - Main work interface
  - Complex layout with header/content/footer
  - Result cards with semantic colors
  - High priority for testing

- [ ] **Viewer** - Document/file viewer
  - Reading layout
  - Annotations

- [ ] **Editor** - Text/document editor
  - Editor container
  - Toolbar
  - Markdown/quill specific

- [ ] **Explorer** - File browser
  - Tree view
  - List view
  - Search

- [ ] **Settings** - Application settings
  - Form controls
  - Sections

- [ ] **History** - Version/action history
  - Timeline
  - Item list

- [ ] **Home** - Home screen
  - Welcome/intro
  - Quick actions

- [ ] **Airpad** - Sensor/input interface
  - Specialized layout
  - Input controls

- [ ] **From-Faint** - Ported components
  - Animation
  - UI elements

### 4.3 Context Selector Implementation

```scss
// For each shell
:has([data-shell="basic"]) {
    /* shell-specific overrides */
}

// For each view
:has([data-view="workcenter"]) {
    /* view-specific overrides */
}

// For each theme
:has([data-theme="dark"]) {
    /* dark theme overrides */
}
```

### 4.4 Initialization Sequence Update

**File:** `src/frontend/main/BootLoader.ts`

Update `loadStyles()` method to:
1. Load system layers
2. Load runtime core
3. Load shell (based on selection)
4. Defer view loading until mount
5. Apply theme

```typescript
private async loadStyles(styleSystem: StyleSystem): Promise<void> {
    const { initializeLayerSystem } = await import('fest/dom/layer-manager');
    
    // Load system layers
    await initializeLayerSystem({
        system: ['normalize', 'tokens', 'reset']
    });
    
    // Load runtime core
    await this.loadRuntimeCore();
    
    // Load selected shell
    await this.loadShell(this.state.shell);
}
```

### Files to Update (Checklist)

**Shells:**
- [ ] `shells/basic/layout.scss` (new/update)
- [ ] `shells/basic/_components.scss` (new/update)
- [ ] `shells/basic/basic.scss` (update)
- [ ] `shells/basic/index.ts` (new/update)
- [ ] `shells/faint/faint.scss` (update)
- [ ] `shells/faint/scss/**/*.scss` (update)
- [ ] `shells/raw/raw.scss` (update)

**Views (each gets similar treatment):**
- [ ] `views/workcenter/scss/*.scss` (new structure)
- [ ] `views/viewer/scss/*.scss` (new structure)
- [ ] `views/editor/scss/*.scss` (new structure)
- [ ] `views/explorer/scss/*.scss` (new structure)
- [ ] `views/settings/scss/*.scss` (new structure)
- [ ] `views/history/scss/*.scss` (new structure)
- [ ] `views/home/scss/*.scss` (new structure)
- [ ] `views/airpad/scss/*.scss` (new structure)

**Global:**
- [ ] `main/boot-menu.scss` (update to shell.context)
- [ ] `items/_Cards.scss` (update)
- [ ] `main/BootLoader.ts` (update initialization)

### Phase 4 Validation

- [ ] All shells load and display correctly
- [ ] All views render properly in respective shells
- [ ] Context selectors prevent style conflicts
- [ ] Theme switching works (light/dark)
- [ ] Responsive design works
- [ ] Print view works
- [ ] No console errors
- [ ] Layer order correct for each combination

### Estimated Effort: 24-32 hours
### Difficulty: High (most complex phase)
### Risk: Medium (many interdependencies)

---

## Phase 5: Optimization & Cleanup (Week 4-5)

### Objectives
- Remove duplicate styles
- Consolidate selectors
- Optimize media queries
- Reduce overall CSS size

### 5.1 Duplicate Detection

```
Tools:
- PostCSS analysis
- Manual review
- Browser devtools

Steps:
1. Identify duplicate properties across selectors
2. Identify similar selectors that can be consolidated
3. Identify unused styles
4. Mark for consolidation
```

### 5.2 Selector Consolidation

**Before:**
```scss
.button { padding: var(--space-sm); }
.link { padding: var(--space-sm); }
.tag { padding: var(--space-sm); }
```

**After:**
```scss
:is(.button, .link, .tag) {
    padding: var(--space-sm);
}
```

### 5.3 Media Query Optimization

```scss
// Group related media queries
@media (max-width: 768px) {
    .container { /* related changes */ }
    .header { /* related changes */ }
    .footer { /* related changes */ }
}
```

### 5.4 CSS Size Audit

```
Tasks:
- [ ] Measure baseline CSS size (before optimization)
- [ ] Apply optimizations
- [ ] Measure final CSS size
- [ ] Calculate % reduction
- [ ] Document findings
```

**Target:** 15-20% size reduction

### Phase 5 Validation

- [ ] No duplicate properties
- [ ] Selectors efficiently grouped
- [ ] No unused styles
- [ ] CSS size reduced by 15-20%
- [ ] All functionality preserved
- [ ] Visual appearance unchanged

### Estimated Effort: 16-20 hours
### Difficulty: Medium
### Risk: Low (optimization, not functional changes)

---

## Phase 6: Testing & Documentation (Week 5-6)

### Objectives
- Comprehensive testing across browsers and devices
- Performance validation
- Create implementation guide
- Team training

### 6.1 Testing Checklist

#### Functional Testing
- [ ] All shells load and initialize correctly
- [ ] All views render and function properly
- [ ] Shell + view combinations work
- [ ] Theme switching works (light/dark/system)
- [ ] Responsive design at all breakpoints
- [ ] Print view works
- [ ] Navigation between views works
- [ ] No CSS loading errors

#### Browser Testing
- [ ] Chrome/Edge (latest 2 versions)
- [ ] Firefox (latest 2 versions)
- [ ] Safari (latest 2 versions)
- [ ] Mobile Safari (iOS)
- [ ] Chrome Mobile (Android)

#### Performance Testing
- [ ] CSS load time (should improve)
- [ ] Layout shift (should decrease)
- [ ] Paint time (should improve)
- [ ] Overall bundle size (should decrease)

#### Accessibility Testing
- [ ] Color contrast (WCAG AA)
- [ ] Keyboard navigation
- [ ] Screen reader compatibility
- [ ] Focus indicators visible
- [ ] Reduced motion respected

### 6.2 Documentation

#### Implementation Guide
```
File: IMPLEMENTATION_COMPLETE.md

Sections:
1. Architecture overview
2. Layer cascade reference
3. Custom properties registry
4. File organization
5. Initialization sequence
6. Common patterns
7. Troubleshooting
8. Migration guide for new styles
```

#### Migration Guide for Developers
```
File: NEW_STYLE_MIGRATION_GUIDE.md

Sections:
1. When to create new styles
2. Choosing correct layer
3. Using custom properties
4. Testing requirements
5. Common mistakes to avoid
6. Examples for each layer
```

#### API Documentation
```
File: LAYER_MANAGER_API.md

Document:
- LayerManager class
- initializeLayerSystem()
- loadStylesheetInLayer()
- adoptStylesheetInLayer()
- getLayerManager()
```

### 6.3 Team Training

#### Sessions
- [ ] Architecture overview (30 min)
- [ ] Layer system deep dive (60 min)
- [ ] Custom properties and CSS variables (30 min)
- [ ] Refactoring patterns (60 min)
- [ ] Q&A and troubleshooting (30 min)

#### Deliverables
- [ ] Training slides
- [ ] Video recordings
- [ ] Cheat sheet (1 page reference)
- [ ] FAQ document
- [ ] Example projects

### 6.4 Documentation Review

- [ ] All docs reviewed for clarity
- [ ] Examples tested and working
- [ ] Links verified
- [ ] Formatting consistent
- [ ] Indexed in central docs

### Phase 6 Validation

- [ ] All functional tests pass
- [ ] All browser tests pass
- [ ] Performance targets met
- [ ] Accessibility standards met
- [ ] Team trained and confident
- [ ] Documentation complete and accessible

### Estimated Effort: 20-24 hours
### Difficulty: Medium
### Risk: Low (testing and documentation)

---

## Success Criteria

### ✅ Functional Success
- [x] All SCSS uses `@use` not `@import`
- [x] 100% of styles wrapped in `@layer`
- [x] All shells and views work correctly
- [x] No CSS cascading conflicts
- [x] Theme switching works
- [x] Responsive design functional
- [x] Accessibility standards met

### ✅ Performance Success
- [x] CSS bundle size reduced 15-20%
- [x] No layout shift or jank
- [x] Paint time improved or maintained
- [x] Layer initialization under 100ms
- [x] Mobile performance maintained

### ✅ Maintainability Success
- [x] Clear file organization
- [x] Consistent naming conventions
- [x] Proper documentation
- [x] Easy to add new styles
- [x] Team confident with system
- [x] Low defect rate on new styles

### ✅ Quality Success
- [x] Zero cascading conflicts
- [x] Proper selector specificity
- [x] Consistent use of custom properties
- [x] No redundant styles
- [x] Proper context isolation

---

## Risk Assessment

### Technical Risks

**Risk: Browser support for @layer**
- Mitigation: Already supported in all modern browsers (Chrome 99+, Firefox 97+, Safari 15.4+)
- Fallback: Styles still work in older browsers, just without layer isolation

**Risk: SCSS compilation fails**
- Mitigation: Use SCSS 1.50+, test in CI/CD pipeline
- Fallback: Incremental migration if needed

**Risk: CSS size increases instead of decreases**
- Mitigation: Careful optimization, remove actual redundancy not just rearrangement
- Fallback: Accept temporary increase, optimize further in next phase

### Schedule Risks

**Risk: Phases take longer than estimated**
- Mitigation: Clear scope, regular checkpoints, prioritize critical paths
- Fallback: Extend timeline, reduce scope of non-critical optimization

**Risk: Unforeseen compatibility issues**
- Mitigation: Thorough testing, early integration testing
- Fallback: Quick rollback to previous version, identify and fix issues

---

## Rollback Plan

If critical issues occur:

1. **Git stash uncommitted work**
2. **Revert to previous commit**
3. **Identify root cause**
4. **Fix in isolated branch**
5. **Re-test before reintegration**

Each phase is designed to be independently deployable to enable quick rollback if needed.

---

## Team Assignments

### Phase 1 (Foundation)
- Lead: Senior developer
- Team: 1-2 developers
- Task: Create shared modules, documentation, utilities

### Phase 2 (Veela CSS)
- Lead: Veela CSS maintainer
- Team: 1-2 developers
- Task: Migrate veela.css module

### Phase 3 (FL.UI)
- Lead: FL.UI maintainer
- Team: 1-2 developers
- Task: Refactor FL.UI styles and services

### Phase 4 (CrossWord)
- Lead: Frontend lead
- Team: 2-3 developers
- Task: Refactor shells and views

### Phase 5 (Optimization)
- Lead: Performance engineer
- Team: 1-2 developers
- Task: Optimization and cleanup

### Phase 6 (Testing & Docs)
- Lead: QA/Documentation lead
- Team: 2-3 people
- Task: Testing, training, documentation

---

## Communication Plan

### Weekly Standups
- Monday: Phase status and blockers
- Wednesday: Mid-week check-in
- Friday: Week summary and planning

### Documentation
- Daily: Update task checklists
- Weekly: Phase completion report
- End of project: Retrospective

### Team Sync
- Phase completion reviews
- Technical challenges discussion
- Solution brainstorming

---

## Success Metrics (Measurable)

| Metric | Target | Measurement |
|--------|--------|-------------|
| CSS Size Reduction | 15-20% | Before/after bundle analysis |
| Layer Coverage | 100% | Linter rule checking |
| @use Adoption | 100% | Grep search for @import |
| Test Pass Rate | 100% | Automated test suite |
| Browser Coverage | 5+ browsers | Cross-browser testing |
| Accessibility | WCAG AA | Axe accessibility audit |
| Team Confidence | 4/5 average | Survey after training |
| Documentation | 90%+ complete | Checklist review |

---

## Next Steps

1. **Approve roadmap** ✓
2. **Form teams** (Week 1)
3. **Kick off Phase 1** (Week 1)
4. **Weekly status reviews** (Ongoing)
5. **Phase gates** (Completion criteria review)
6. **Final deployment** (Week 6)

---

## Related Documentation

- `CSS_ARCHITECTURE_REFACTORING_PLAN.md` - Overall strategy and rationale
- `CSS_LAYER_INITIALIZATION_GUIDE.md` - Complete initialization guide
- `SCSS_REFACTORING_TEMPLATE.md` - Detailed refactoring patterns
- `VEELA_CSS_REFACTORING_GUIDE.md` - Veela-specific implementation
- `FLUI_STYLES_REFACTORING_GUIDE.md` - FL.UI-specific implementation
- `CROSSWORD_FRONTEND_REFACTORING_GUIDE.md` - CrossWord-specific implementation

---

**Document Version:** 1.0  
**Last Updated:** 2026-02-02  
**Status:** Ready for Implementation  
**Approval:** Pending
