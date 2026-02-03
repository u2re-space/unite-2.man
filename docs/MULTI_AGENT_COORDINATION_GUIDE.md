# Multi-Agent Coordination Strategy for CSS Refactoring

**Document Type**: Agent Coordination Guide  
**Date**: February 2, 2026  
**Scope**: U2RE.space CrossWord Application CSS Refactoring  

---

## 🤝 Overview: How Agents Cooperate

This document explains how multiple AI agents can coordinate to refactor CSS/SCSS across different layers of the codebase while maintaining consistency, avoiding conflicts, and ensuring proper layer cascade ordering.

### Why Multi-Agent Approach?

1. **Parallel Processing**: Multiple agents work simultaneously on different code regions
2. **Specialization**: Each agent focuses on their expertise area
3. **Reduced Complexity**: Breaking large task into manageable chunks
4. **Faster Delivery**: Coordinated parallel work vs. sequential single-agent work
5. **Quality**: Specialized review and verification at each layer

---

## 👥 Agent Roles & Responsibilities

### Agent 1: CSS Framework Architect
**Role**: Establish foundation layer  
**Skills**: CSS architecture, module systems, layer strategies  
**Timeline**: Days 1-2

#### Responsibilities
- [ ] Design and implement `@layer` system for all layers
- [ ] Create SCSS module structure for framework
- [ ] Define public API via `@forward`
- [ ] Create canonical keyframes and animations
- [ ] Establish naming conventions and patterns
- [ ] Create comprehensive framework documentation

#### Deliverables
- ✅ `modules/projects/veela.css/src/scss/` (complete)
- ✅ Framework API documentation
- ✅ Example patterns for other agents
- ✅ Dependency graph showing import order

#### Handoff to Agent 2
```
FRAMEWORK READY: Yes/No
├── Layer order: system, tokens, base
├── @use modules: ✅
├── @forward exports: ✅
├── Public API documented: ✅
└── Ready for UI System: Yes
```

---

### Agent 2: UI Component System Lead
**Role**: Build reusable component layer  
**Skills**: Component architecture, SCSS patterns, design systems  
**Timeline**: Days 2-3  
**Dependencies**: Agent 1 (must complete first)

#### Responsibilities
- [ ] Import framework via `@use` (setup by Agent 1)
- [ ] Refactor component styles with `@layer components`
- [ ] Create utilities layer with atomic classes
- [ ] Ensure components follow framework conventions
- [ ] Document component API and variants
- [ ] Coordinate service-related styles

#### Key Coordination Points
1. **Import Framework**:
   ```scss
   @use "../../modules/projects/veela.css" as framework;
   
   // Access framework tokens
   .component {
       color: framework.$token-name;
   }
   ```

2. **Follow Agent 1's Naming**:
   - Use same variable prefixes (e.g., `$color-*`, `$spacing-*`)
   - Use same mixin names
   - Use same breakpoint names

3. **Avoid Conflicts**:
   - Don't override framework tokens
   - Don't redefine framework animations
   - Don't create duplicate utilities

#### Handoff to Agents 3 & 4
```
UI SYSTEM READY: Yes/No
├── Framework imported: ✅
├── Components layered: ✅
├── Utilities organized: ✅
├── Services coordinated: ✅
├── Public API exported: ✅
└── Ready for Shells/Views: Yes
```

---

### Agent 3: Shell Styles Refactorer
**Role**: Refactor application shell styles  
**Skills**: CSS architecture, shell/layout patterns  
**Timeline**: Days 3-4  
**Dependencies**: Agent 2 (must complete first), Agent 5 (parallel)

#### Responsibilities
- [ ] Refactor basic, faint, raw shells with `@use`/`@layer`
- [ ] Implement context-based tokens with `:root:has()`
- [ ] Import UI system components (setup by Agent 2)
- [ ] Create shell-specific custom properties
- [ ] Organize shell layout styles
- [ ] Ensure shells follow Agent 1's layer order

#### Key Coordination Points
1. **Import UI System**:
   ```scss
   @use "../../../modules/projects/fl.ui" as ui;
   @use "../../../modules/projects/veela.css" as framework;
   ```

2. **Context-Based Tokens** (coordinate with Agent 5 on DOM structure):
   ```scss
   :root:has(.shell-basic) {
       --shell-layout: grid;
       --shell-columns: auto 1fr auto;
   }
   
   :root:has(.shell-faint) {
       --shell-layout: flex;
   }
   ```

3. **Follow Layer Order**:
   - tokens (shell-specific)
   - base (shell-specific)
   - shell (main styling)
   - components (reuse from Agent 2)

#### Coordination with Agent 5
- **Share**: DOM element tree structure
- **Receive**: Element naming conventions and class patterns
- **Provide**: CSS class names used in styles
- **Verify**: Classes match TypeScript/JSX

#### Handoff to Agent 6
```
SHELLS READY: Yes/No
├── Basic shell complete: ✅
├── Faint shell complete: ✅
├── Raw shell complete: ✅
├── Context-based tokens: ✅
├── UI system imports: ✅
├── Layer order correct: ✅
└── Visual testing done: Yes
```

---

### Agent 4: View Styles Refactorer
**Role**: Refactor application view styles  
**Skills**: CSS, layout patterns, `:has()` selectors, `:where()`/`:is()`  
**Timeline**: Days 3-5  
**Dependencies**: Agent 2 (must complete), Agent 5 (parallel), Agent 3 (optional)

#### Responsibilities
- [ ] Refactor viewer, editor, and other views with `@use`/`@layer`
- [ ] Implement context-based tokens with `:root:has(.view-*)`
- [ ] Use `:where()` and `:is()` for selector unification
- [ ] Import UI system and framework
- [ ] Organize view-specific layout styles
- [ ] Create view-specific custom properties

#### Key Coordination Points
1. **Import System**:
   ```scss
   @use "../../../modules/projects/fl.ui" as ui;
   @use "../shells/basic" as shell;
   ```

2. **Context-Based View Tokens** (coordinate with Agent 5 on DOM):
   ```scss
   :root:has(.view-viewer) {
       --view-padding: 2rem;
       --view-gap: 1.5rem;
       --view-layout: grid;
   }
   
   :root:has(.view-editor) {
       --view-padding: 1rem;
       --view-layout: flex;
   }
   ```

3. **Selector Unification** (advanced pattern):
   ```scss
   /* Unified selectors with :where() */
   :where(.view-* [role="button"], .view-* .btn) {
       display: inline-flex;
   }
   
   /* Combining with :is() */
   :is(.panel, .sidebar, .drawer):where(:not(.hidden)) {
       display: flex;
   }
   ```

4. **Layer Ordering**:
   - tokens (view-specific, scoped with `:has()`)
   - view (main view styling)
   - components (reuse from Agent 2)

#### Coordination with Agent 5
- **Share**: View DOM structure and hierarchy
- **Receive**: View element naming conventions
- **Provide**: CSS class names and data attributes
- **Verify**: Class names match generated HTML

#### Handoff to Agent 6
```
VIEWS READY: Yes/No
├── Viewer view complete: ✅
├── Editor view complete: ✅
├── Other views complete: ✅
├── Context-based tokens: ✅
├── :where()/:is() usage: ✅
├── Layer order correct: ✅
└── Visual testing done: Yes
```

---

### Agent 5: DOM Element Organization Lead
**Role**: Document element tree and coordinate with CSS  
**Skills**: TypeScript/JSX, DOM architecture, element generation  
**Timeline**: Days 2-5 (parallel with Agents 3 & 4)

#### Responsibilities
- [ ] Document current DOM element tree structure
- [ ] Map elements to CSS layers and classes
- [ ] Create element naming conventions
- [ ] Design `:has()` selector targets
- [ ] Create TypeScript utilities for dynamic styling
- [ ] Document element-to-layer coordination

#### Key Activities
1. **Element Tree Documentation**:
   ```
   <html>
     <body class="shell-{shell-id}">
       <shell-component>
         <header class="shell-header">...</header>
         <main class="shell-main">
           <div class="view-{view-id}">
             {view content}
           </div>
         </main>
       </shell-component>
     </body>
   </html>
   ```

2. **Class Naming Conventions**:
   - `shell-{id}`: Shell identifier
   - `view-{id}`: View identifier
   - `state-{name}`: State classes (hidden, active, etc.)
   - Component classes follow SMACSS: `.component--modifier`

3. **`:has()` Selector Targets**:
   ```typescript
   // Pattern for shell-specific tokens
   // <body class="shell-basic">
   // CSS: :root:has(.shell-basic) { --var: value; }
   
   // Pattern for view-specific tokens
   // <main class="view-viewer">
   // CSS: :root:has(.view-viewer) { --var: value; }
   ```

4. **TypeScript Utilities**:
   ```typescript
   // src/frontend/styles/layer-manager.ts
   export function initializeShellLayers(shellId: string): void {
       document.body.className = `shell-${shellId}`;
       // Triggers :root:has(.shell-{shellId}) selectors
   }
   
   export function initializeViewLayers(viewId: string): void {
       const viewElement = document.querySelector('[role="main"]');
       viewElement?.className = `view-${viewId}`;
       // Triggers :root:has(.view-{viewId}) selectors
   }
   ```

#### Coordination Handoffs

**To Agent 3** (Shell refactorer):
```
SHELL ELEMENT STRUCTURE:
├── Shell IDs: basic, faint, raw
├── Classes: shell-{id}
├── :has() targets: :root:has(.shell-{id})
├── Custom properties: --shell-*, --layout-*
└── Initialization: initializeShellLayers(id)
```

**To Agent 4** (View refactorer):
```
VIEW ELEMENT STRUCTURE:
├── View IDs: viewer, editor, explorer, ...
├── Classes: view-{id}
├── :has() targets: :root:has(.view-{id})
├── Custom properties: --view-*, --content-*
└── Initialization: initializeViewLayers(id)
```

#### Handoff to Agent 6
```
DOM ORGANIZATION DOCUMENTED: Yes/No
├── Element tree mapped: ✅
├── Layer coordination documented: ✅
├── Naming conventions: ✅
├── :has() targets identified: ✅
├── TS utilities created: ✅
└── Ready for testing: Yes
```

---

### Agent 6: Quality Assurance & Integration Lead
**Role**: Verify correctness, test, and optimize  
**Skills**: Testing, performance analysis, CSS debugging  
**Timeline**: Days 5-7

#### Responsibilities
- [ ] Verify CSS layer cascade correctness
- [ ] Test style application across all shells/views
- [ ] Audit for redundant or dead styles
- [ ] Performance testing and optimization
- [ ] Final documentation and handoff
- [ ] Team training and adoption

#### Quality Checklist

**Layer Verification**:
```bash
# 1. Verify layer declaration
grep "@layer system, tokens, base, shell, view, components, utilities, overrides" \
    apps/CrossWord/src/frontend/**/*.scss

# 2. Verify no conflicting layers
grep -r "@layer" apps/CrossWord/src/frontend | sort | uniq -c | grep -v "^      1 "

# 3. Verify @use instead of @import
grep -r "@import" apps/CrossWord/src/frontend | wc -l  # Should be 0

# 4. Verify all @use statements have namespaces
grep -r "@use" apps/CrossWord/src/frontend | grep -v " as "  # Should show none
```

**Style Testing**:
```bash
# 1. Build SCSS
npm run build:styles

# 2. Check for build errors
# 3. Visual regression testing
# 4. Browser compatibility check

# 5. Bundle size analysis
du -h dist/styles.css
```

**Performance Analysis**:
- CSS selector specificity (max 2 for components)
- File size before/after (target 20% reduction)
- Number of @layer declarations
- Unused styles and variables

#### Coordination with All Agents

1. **Collect Reports** from Agents 1-5:
   - Framework completeness
   - Component system readiness
   - Shell styles verification
   - View styles verification
   - DOM organization documentation

2. **Integration Testing**:
   - Verify imports work correctly
   - Test layer cascade order
   - Check for selector conflicts
   - Verify no visual regressions

3. **Performance Optimization**:
   - Profile CSS rendering
   - Optimize selector specificity
   - Minify and bundle CSS
   - Generate performance report

#### Final Handoff
```
PROJECT COMPLETE: Yes/No
├── Layer cascade verified: ✅
├── All tests passing: ✅
├── Performance metrics good: ✅
├── Documentation complete: ✅
├── Team training done: ✅
└── Ready for production: Yes
```

---

## 🔄 Synchronization Points

### Day 1 End: Agent 1 Checkpoint
**Expected Status**:
- Framework structure created
- Layer order declared
- `@use`/`@forward` system in place
- Documentation ready

**Verification**:
```bash
cd apps/CrossWord
npm run build:styles  # Should succeed
```

**Gate**: ✅ Pass/❌ Fail  
**If Fail**: Resolve framework issues before proceeding  
**If Pass**: Proceed to Day 2

---

### Day 2 End: Agent 2 Checkpoint
**Expected Status**:
- UI system imports framework
- Components styled with `@layer components`
- Utilities organized
- Public API exported

**Verification**:
```bash
npm run build:styles
npm run lint:scss
```

**Gate**: ✅ Pass/❌ Fail  
**If Fail**: Resolve component issues before proceeding  
**If Pass**: Notify Agents 3, 4, 5

---

### Day 3 Start: Agents 3, 4, 5 Parallel Work

**Agent 3** (Shells):
- [ ] Basic shell refactored
- [ ] Faint shell refactored
- [ ] Raw shell refactored
- [ ] Context-based tokens working

**Agent 4** (Views):
- [ ] Viewer view started
- [ ] Context-based tokens pattern established

**Agent 5** (DOM):
- [ ] Element tree documented
- [ ] Shell class patterns identified
- [ ] View class patterns identified
- [ ] Utilities drafted

---

### Day 4 Mid-Point: Cross-Coordination

**Agents 3 & 4 → 5**:
- "We're using shell-{id} classes"
- "We're using view-{id} classes"
- "Scoping with :root:has(...)"

**Agent 5 → 3 & 4**:
- "Confirmed - element structure matches"
- "Here are the selector patterns"
- "TS utilities ready for initialization"

**Build Check**:
```bash
npm run build:styles  # Should still succeed
npm run test:styles    # If tests exist
```

---

### Day 5 End: Agents 3 & 4 Complete

**Expected Status**:
- All shells refactored
- All views refactored
- Context-based tokens working
- No visual regressions
- Code follows layer order

**Verification**:
```bash
npm run build:styles
npm run lint:scss
# Manual visual testing in all shells/views
```

**Gate**: ✅ Pass/❌ Fail  
**If Fail**: Debug issues (likely CSS cascade or selector conflicts)  
**If Pass**: Proceed to final phase

---

### Day 6: Agent 6 Integration & Testing

**Activities**:
- [ ] Verify all builds succeed
- [ ] Run comprehensive test suite
- [ ] Performance analysis
- [ ] Audit for redundancies
- [ ] Generate final report

**Output**:
```
FINAL REPORT:
├── Build Status: ✅ Success
├── Test Status: ✅ All Pass
├── Performance: ✅ 18% size reduction
├── Layer Correctness: ✅ Verified
├── Documentation: ✅ Complete
└── Ready for Production: ✅ Yes
```

---

## 📋 Communication Protocol

### Real-time Communication Points

1. **Daily Standup** (9:00 AM)
   - Agent status update (1-2 minutes each)
   - Blockers and issues
   - Coordination needs

2. **Coordination Issues** (As-needed)
   - **Issue Type 1**: Import path mismatch
     - **Solution**: Use path mapping from Agent 1
   - **Issue Type 2**: Layer order conflict
     - **Solution**: Follow Agent 1's documentation
   - **Issue Type 3**: Selector specificity
     - **Solution**: Refactor using `:where()` (Agent 4 specialist)

3. **Weekly Retro** (Friday 5:00 PM)
   - What worked
   - What didn't
   - Improvements for next project

### Documentation Updates

**Update Schedule**:
- Agent 1: Updates `CSS_REFACTORING_EXECUTION_PLAN.md` after Day 1
- Agent 2: Updates with component patterns after Day 2
- Agent 3: Updates with shell examples after Day 3
- Agent 4: Updates with view examples after Day 3
- Agent 5: Updates with DOM documentation after Day 4
- Agent 6: Final report after Day 6

**Document Location**:
`/mdn/CSS_REFACTORING_EXECUTION_PLAN.md`

---

## 🚫 Common Pitfalls to Avoid

### Pitfall 1: Import Circular Dependencies
**Problem**: Agent 3 imports Agent 4, Agent 4 imports Agent 3
**Solution**: Only shells import views (one-way dependency)
```
Framework → UI System → Shells → Views ✅
Views → Shells → Framework ❌
```

### Pitfall 2: Duplicate Layer Declarations
**Problem**: Agent 3 and 4 both declare `@layer system, tokens, ...`
**Solution**: Only Agent 1 (root) declares layers
```
✅ modules/projects/veela.css/index.scss: @layer system, tokens, ...
❌ apps/CrossWord/shells/*/index.scss: DON'T declare again
❌ apps/CrossWord/views/*/index.scss: DON'T declare again
```

### Pitfall 3: Variable Naming Collisions
**Problem**: Agent 3 uses `$color-primary`, Agent 4 also uses `$color-primary`
**Solution**: Use consistent names from Agent 1, scope via `@use ... as`
```scss
@use "../framework" as fw;
$color-primary: fw.$color-primary;  // Reference, not duplicate
```

### Pitfall 4: Selector Specificity Wars
**Problem**: Agent 4 creates `.view-editor { ... }`, Agent 6 needs to override with `.view-editor:where(...) { ... }`
**Solution**: Design for low specificity from start using `:where()`
```scss
// ✅ Good
:where(.view-editor) { ... }  // Specificity: 0

// ❌ Bad
.view-editor { ... }  // Specificity: 1 (hard to override)
```

### Pitfall 5: `:has()` Scope Misunderstandings
**Problem**: Agent 3 declares `:root:has(.shell-basic)` but element uses class on `<body>`
**Solution**: Verify element structure with Agent 5 first
```html
<!-- Agent 5 confirms: class is on <body> -->
<body class="shell-basic">
  <!-- Agent 3 can now use: :root:has(.shell-basic) -->
</body>
```

---

## ✅ Success Criteria

### Phase Complete When:
- [ ] All SCSS files use `@use` (no `@import`)
- [ ] All styles wrapped in appropriate `@layer`
- [ ] Layer order: system → tokens → base → shell → view → components → utilities → overrides
- [ ] Zero visual regressions
- [ ] CSS bundle size reduced by 15-20%
- [ ] All tests pass
- [ ] All agents confirm completion

### Deliverables:
- ✅ Refactored framework
- ✅ Refactored UI system
- ✅ Refactored shells
- ✅ Refactored views
- ✅ DOM organization documentation
- ✅ Final integration report
- ✅ Team training materials

---

## 📞 Quick Reference

| Agent | Role | Days | Dependencies | Delivers To |
|-------|------|------|--------------|-------------|
| 1 | Framework | 1-2 | None | Agent 2 |
| 2 | UI System | 2-3 | Agent 1 | Agents 3, 4 |
| 3 | Shells | 3-4 | Agent 2, 5 | Agent 6 |
| 4 | Views | 3-5 | Agent 2, 5 | Agent 6 |
| 5 | DOM Org | 2-5 | None | Agents 3, 4, 6 |
| 6 | QA/Integration | 5-7 | All agents | Final Report |

---

**Status**: Ready for implementation  
**Start Date**: Day 1 (Agent 1 begins framework)  
**Target Completion**: Day 7  
**Last Updated**: February 2, 2026
