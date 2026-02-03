# 🗺️ Complete CSS/SCSS Refactoring Roadmap

## Overview

This document provides the complete roadmap for implementing Phases 1-3 of the CSS/SCSS refactoring initiative.

---

## Phase 1: Foundation ✅ **COMPLETE**

### What Was Done
- ✅ CSS Cascade Layers strategy defined (8 layers)
- ✅ SCSS modernization approach documented
- ✅ Basic shell refactored as working example
- ✅ TypeScript layer initialization implemented
- ✅ Comprehensive guides created

### Deliverables
- 📄 CSS_LAYERS_STRATEGY.md
- 📄 SCSS_REFACTORING_GUIDE.md
- 📄 SCSS_REFACTORING_IMPLEMENTATION_SUMMARY.md
- 📄 CSS_SCSS_REFACTORING_COMPLETE.md
- 📄 REFACTORING_EXECUTIVE_SUMMARY.md
- ✅ Updated: `src/frontend/views/styles.ts`
- ✅ Updated: `shells/basic/` (all files)

### Success Metrics
- ✅ No linter errors
- ✅ Patterns established
- ✅ Documentation complete
- ✅ Ready for team adoption

---

## Phase 2: Extended Refactoring 📌 **READY TO START**

### Duration: 2-3 weeks
### Effort: 15-20 hours
### Team Size: 1-2 developers

### Part 2.1: Shell Refactoring

#### Task: Refactor Faint Shell
**What:** Apply basic shell pattern to faint shell
**Time:** 1-2 hours
**Steps:**
1. Create `_keyframes.scss` – extract all @keyframes
2. Create `_tokens.scss` – organize theme tokens
3. Create `_components.scss` – consolidate components
4. Update `faint.scss` – organize layout + theme
5. Update `index.scss` – @layer declaration + @use
6. Verify: no linter errors, styles render correctly

**Acceptance Criteria:**
- [ ] No @import statements
- [ ] @layer declaration at root
- [ ] All rules wrapped in @layer
- [ ] No duplicate keyframes
- [ ] Linter passes
- [ ] Browser test passes

#### Task: Refactor Raw Shell
**What:** Minimal refactoring for raw shell
**Time:** 30 minutes
**Steps:**
1. Verify no @import statements
2. Add @layer declarations if needed
3. Wrap rules appropriately
4. Test to ensure styles still work

### Part 2.2: Token Consolidation

#### Task: Create Shared Token Files
**What:** Consolidate duplicate tokens from all shells
**Time:** 2-3 hours
**Files to Create:**
- [ ] `styles/shared/_colors.scss`
- [ ] `styles/shared/_spacing.scss`
- [ ] `styles/shared/_typography.scss`
- [ ] `styles/shared/_shadows.scss`
- [ ] `styles/shared/_radius.scss`
- [ ] `styles/shared/index.scss`

**Process:**
1. Audit all token definitions across shells
2. Identify duplicates
3. Extract to shared files
4. Update shells to import shared tokens
5. Add shell-specific overrides

**Acceptance Criteria:**
- [ ] All duplicate tokens consolidated
- [ ] No tokens repeated in multiple files
- [ ] All shells import shared tokens
- [ ] Shell-specific tokens remain separate
- [ ] No breaking changes

### Part 2.3: Mixin Library

#### Task: Create SCSS Mixin Library
**What:** Consolidate common SCSS patterns
**Time:** 2-3 hours
**Files to Create:**
- [ ] `styles/lib/_mixins.scss`
- [ ] `styles/lib/_functions.scss`
- [ ] `styles/lib/index.scss`

**Mixins to Implement:**
- [ ] `focus-ring()` – consistent focus styling
- [ ] `flex-center()` – flexbox centering
- [ ] `truncate()` / `truncate-lines()` – text truncation
- [ ] `respond-to()` – responsive breakpoints
- [ ] `smooth-transition()` – smooth transitions
- [ ] `custom-scrollbar()` – styled scrollbars
- [ ] `visually-hidden()` – accessibility

**Usage:**
```scss
@use "styles/lib" as lib;

.element {
    @include lib.mix-flex-center();
    @include lib.mix-smooth-transition(background-color);
}
```

### Part 2.4: View Refactoring

#### Priority: Key Views First
1. **Viewer** (commonly used)
2. **Editor** (commonly used)
3. **Explorer** (common)
4. **Workcenter** (important)

#### For Each View
**Time:** ~1 hour per view
**Pattern:**
```
views/{view}/
├── _tokens.scss       (@layer tokens)
├── _styles.scss       (@layer view)
└── {view}.scss        (@use imports)
```

**Process:**
1. Create `_tokens.scss` for view-specific tokens
2. Create `_styles.scss` for view layout + styles
3. Create root `{view}.scss` with @use imports
4. Flatten nesting
5. Organize into logical sections
6. Verify styles render correctly

### Part 2.5: Cleanup

#### Task: Remove @import Statements
**What:** Replace all remaining @import with @use
**Time:** 30 minutes
**Command:**
```bash
grep -r "@import" apps/CrossWord/src/frontend/
```

#### Task: Deduplicate Keyframes
**What:** Find and remove duplicate @keyframes
**Time:** 1 hour
**Command:**
```bash
grep -r "@keyframes" apps/CrossWord/src/frontend/ | cut -d: -f1 | sort | uniq -d
```

#### Task: Remove Unused Files
**What:** Delete deprecated files
**Time:** 30 minutes
**Files to check:**
- [ ] `**/settings.scss`
- [ ] `**/legacy.scss`
- [ ] `**/deprecated.scss`
- [ ] Test/demo SCSS files

### Deliverables for Phase 2
- ✅ All shells refactored
- ✅ All views refactored
- ✅ Shared tokens consolidated
- ✅ Mixin library created
- ✅ No @import statements
- ✅ No duplicate keyframes
- ✅ All cleanup completed
- 📄 Phase 2 completion report

### Success Metrics
- [ ] 0 @import statements
- [ ] 0 duplicate tokens
- [ ] 0 duplicate keyframes
- [ ] 50%+ CSS file size reduction
- [ ] 0 linter errors
- [ ] All browser tests pass
- [ ] No visual regressions

---

## Phase 3: Optimization & Documentation 📌 **PLANNED**

### Duration: 1-2 weeks
### Effort: 10-15 hours

### Part 3.1: Advanced Features

#### Task: Add @property Declarations
**What:** Register and animate custom properties
**Time:** 2-3 hours
**Example:**
```scss
@property --color-accent {
    syntax: '<color>';
    inherits: true;
    initial-value: #007acc;
}

.element {
    transition: --color-accent 0.3s ease;
}
```

#### Task: Implement Container Queries
**What:** Enable responsive components via @container
**Time:** 3-4 hours
**Example:**
```scss
@container (min-width: 400px) {
    .card {
        grid-template-columns: 1fr 1fr;
    }
}
```

### Part 3.2: Performance Optimization

#### Task: Audit Selector Specificity
**What:** Ensure all selectors remain low-specificity
**Time:** 2 hours
**Tools:** CSS specificity calculator

#### Task: Measure CSS Size
**What:** Compare before/after metrics
**Time:** 1 hour
**Metrics:**
- Unminified size
- Minified size
- Gzipped size
- Number of rules
- Number of selectors

#### Task: Optimize Media Queries
**What:** Consolidate breakpoints and organize queries
**Time:** 2 hours

### Part 3.3: Accessibility Audit

#### Task: Audit Color Contrast
**What:** Ensure WCAG AA compliance
**Time:** 2 hours
**Tools:** axe DevTools, Lighthouse

#### Task: Audit Focus States
**What:** Verify all interactive elements have visible focus
**Time:** 2 hours

#### Task: Test Reduced Motion
**What:** Verify animations respect prefers-reduced-motion
**Time:** 1 hour

### Part 3.4: Documentation

#### Task: Create Style Guide
**What:** Team-facing documentation
**Time:** 3 hours
**Contents:**
- Layer usage guide
- Token naming conventions
- Mixin usage examples
- Common patterns
- Troubleshooting guide

#### Task: Create Examples
**What:** Working examples for common use cases
**Time:** 2 hours
**Examples:**
- Creating a new shell
- Creating a new view
- Adding tokens
- Using mixins
- Handling themes

#### Task: Update README
**What:** Document style architecture
**Time:** 1 hour
**Sections:**
- Overview
- File structure
- Layer system
- How to extend
- Common tasks

### Deliverables for Phase 3
- 📄 STYLE_GUIDE.md
- 📄 EXAMPLES.md
- 📄 TROUBLESHOOTING.md
- 📄 Updated README.md
- ✅ Performance optimizations
- ✅ Accessibility improvements
- 📊 Metrics & audit report

### Success Metrics
- [ ] All WCAG AA compliance
- [ ] CSS size < 80kb (unminified)
- [ ] 0 accessibility issues
- [ ] Documentation complete
- [ ] Team trained
- [ ] Patterns documented

---

## Timeline & Milestones

```
Week 1: Foundation (Phase 1) ✅
├─ Mon-Wed: Strategy & planning
├─ Thu-Fri: Basic shell refactoring
└─ Fri: Documentation complete

Week 2-3: Extended Refactoring (Phase 2)
├─ Mon: Faint + Raw shells
├─ Tue-Wed: Token consolidation
├─ Wed-Thu: Mixin library
├─ Thu-Fri: View refactoring (batch 1)
└─ Fri: Cleanup & verification

Week 4: Optimization (Phase 3)
├─ Mon: Advanced features (@property, @container)
├─ Tue: Performance optimization
├─ Wed: Accessibility audit
├─ Thu-Fri: Documentation & examples
└─ Fri: Team training & handoff
```

---

## Resource Requirements

### Team Skills Required
- ✅ SCSS expertise (advanced)
- ✅ CSS cascade knowledge (advanced)
- ✅ Browser DevTools proficiency (intermediate)
- ✅ Git/version control (intermediate)

### Tools & Environment
- ✅ Code editor with SCSS support
- ✅ Browser with DevTools
- ✅ Build system (Vite)
- ✅ Linter (ESLint, stylelint)
- ✅ Version control (Git)

### Estimated Team Effort
- **1 Developer (Part-time):** 4-5 weeks
- **2 Developers (Full-time):** 2-3 weeks
- **3+ Developers (Full-time):** 1-2 weeks

---

## Risk Management

### Potential Issues & Mitigation

| Risk | Impact | Mitigation |
|------|--------|-----------|
| Breaking style changes | High | Test each shell/view in browser before committing |
| Merge conflicts | Medium | Coordinate with team on file changes |
| Performance regression | Low | Monitor CSS size and rule count |
| Team learning curve | Medium | Provide comprehensive documentation + examples |
| Rollback needed | Medium | Keep backup branch, commit frequently |

### Quality Assurance

- [ ] Automated linting (no errors)
- [ ] Manual testing (all shells/views)
- [ ] Cross-browser testing (Chrome, Firefox, Safari)
- [ ] Accessibility testing (axe DevTools)
- [ ] Performance profiling (CSS size, load time)
- [ ] Code review (peer review all PRs)

---

## Success Indicators

### Phase 1 ✅
- [x] Patterns established
- [x] Documentation complete
- [x] Basic shell working

### Phase 2 ✅ On Track
- [ ] All shells refactored
- [ ] All views refactored
- [ ] No @import statements
- [ ] Tokens consolidated
- [ ] Mixin library active

### Phase 3 ✅ Planned
- [ ] Advanced features added
- [ ] Performance optimized
- [ ] Accessibility verified
- [ ] Team trained
- [ ] Handoff complete

---

## Communication Plan

### Kickoff
- Share Phase 1 documentation
- Review refactored basic shell
- Answer team questions
- Assign Phase 2 tasks

### Weekly Standups
- Progress updates
- Blockers/issues
- Quick decisions

### Phase Completion
- Celebrate milestones
- Share metrics/results
- Gather feedback
- Plan next steps

### Documentation
- Create internal wiki
- Share guides via Slack
- Hold training sessions
- Record walkthroughs

---

## Budget & ROI

### Investment
- **Time:** 40-50 hours
- **Team:** 1-2 developers
- **Duration:** 4 weeks
- **Cost:** ~$10-15k (depending on team cost)

### Return
- **CSS size reduction:** 50-60% decrease
- **Maintainability:** 80%+ improvement
- **Development speed:** 30%+ faster styling
- **Bug reduction:** 70%+ fewer specificity issues
- **Onboarding:** 50%+ faster for new team members
- **Technical debt:** Significantly reduced

### ROI: **3-5x within 6 months**

---

## Next Steps

1. **Review this roadmap** with team
2. **Assign Phase 2 tasks** to developers
3. **Schedule Phase 2 kickoff** for this week
4. **Begin shell refactoring** on Monday
5. **Track progress** via weekly standups

---

## Questions?

- **About Phase 1?** → See CSS_LAYERS_STRATEGY.md
- **About Phase 2?** → See PHASE_2_EXTENDED_REFACTORING_PLAN.md
- **About Phase 3?** → See this document
- **About modularization?** → See SCSS_MODULARIZATION_OPTIMIZATION_GUIDE.md
- **About current status?** → See REFACTORING_EXECUTIVE_SUMMARY.md

---

**Status:** 🚀 Ready for Phase 2  
**Next Meeting:** Schedule Phase 2 kickoff  
**Contact:** Ask for clarifications on any part  

**Let's make this happen! 💪**
