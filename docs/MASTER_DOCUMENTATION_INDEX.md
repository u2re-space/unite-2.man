> [!IMPORTANT]
> **Canonical docs moved.** Start here: `docs/css-scss/README.md`
>
> This file is **legacy** (kept for history) and may duplicate other docs.

# 📚 CSS/SCSS Refactoring Master Index (Legacy)

**Complete documentation for the CrossWord CSS/SCSS refactoring and optimization initiative.**

---

## 🎯 Quick Start

Choose your role:

### 👨‍💼 Project Manager
Start here:
1. **REFACTORING_EXECUTIVE_SUMMARY.md** – High-level overview, benefits, timeline
2. **SCSS_OPTIMIZATION_ACTION_PLAN.md** – Phases, schedule, metrics

### 👨‍💻 Developer (Implementing)
Start here:
1. **SCSS_REFACTORING_GUIDE.md** – Step-by-step refactoring instructions
2. **SCSS_MODULARIZATION_OPTIMIZATION_GUIDE.md** – Code patterns and best practices
3. **modules/projects/fl.ui/src/styles/_lib/** – Reference implementation

### 🎨 CSS Author
Start here:
1. **CSS_LAYERS_STRATEGY.md** – Layer system and organization
2. **SCSS_MODULARIZATION_OPTIMIZATION_GUIDE.md** – Patterns and utilities
3. **modules/projects/fl.ui/src/styles/_lib/** – Shared library

### 📚 Architect
Start here:
1. **CSS_LAYERS_STRATEGY.md** – Architecture overview
2. **SCSS_MODULARIZATION_OPTIMIZATION_GUIDE.md** – Modularization strategy
3. **SCSS_OPTIMIZATION_ACTION_PLAN.md** – Long-term plan

---

## 📖 Document Index

### Strategic Documents

| Document | Purpose | For Whom | Read Time |
|----------|---------|----------|-----------|
| **REFACTORING_EXECUTIVE_SUMMARY.md** | High-level project overview | Managers, leads | 15 min |
| **CSS_LAYERS_STRATEGY.md** | CSS layer hierarchy and patterns | Architects, developers | 20 min |
| **SCSS_REFACTORING_GUIDE.md** | Step-by-step refactoring guide | Developers | 30 min |
| **SCSS_MODULARIZATION_OPTIMIZATION_GUIDE.md** | Code modularization patterns | CSS authors, devs | 45 min |
| **SCSS_OPTIMIZATION_ACTION_PLAN.md** | Implementation roadmap | Managers, leads | 25 min |

### Implementation Reference

| Component | Location | Purpose |
|-----------|----------|---------|
| **Shared SCSS Library** | `modules/projects/fl.ui/src/styles/_lib/` | Reusable utilities |
| **Functions** | `_lib/functions.scss` | Math, color, sizing functions |
| **Mixins** | `_lib/mixins.scss` | Layout, text, form, animation patterns |
| **Tokens** | `_lib/tokens.scss` | Design tokens (spacing, colors, etc.) |
| **Breakpoints** | `_lib/breakpoints.scss` | Responsive breakpoint mixins |
| **Shared Components** | `_lib/components/` | Reusable UI components (TBD) |

### Example Implementations

| Shell/View | Status | Reference |
|-----------|--------|-----------|
| **Basic Shell** | ✅ Complete | `apps/CrossWord/src/frontend/shells/basic/` |
| **Faint Shell** | 📌 Pending | Follow basic shell pattern |
| **Raw Shell** | 📌 Pending | Follow basic shell pattern |
| **Viewer View** | 📌 Pending | Follow basic pattern |
| **Editor View** | 📌 Pending | Follow basic pattern |

---

## 🗺️ Navigation Guide

### By Task

**I want to...**

✅ **Understand the overall architecture**
→ Read: `REFACTORING_EXECUTIVE_SUMMARY.md`, `CSS_LAYERS_STRATEGY.md`

✅ **Refactor a shell (basic → faint/raw)**
→ Read: `SCSS_REFACTORING_GUIDE.md`
→ Reference: `apps/CrossWord/src/frontend/shells/basic/`

✅ **Refactor a view (viewer, editor, etc.)**
→ Read: `SCSS_REFACTORING_GUIDE.md` (View section)
→ Reference: Basic shell pattern

✅ **Add a new component**
→ Read: `SCSS_MODULARIZATION_OPTIMIZATION_GUIDE.md` (Shared Components section)
→ Reference: `modules/projects/fl.ui/src/styles/_lib/components/`

✅ **Use shared utilities in my SCSS**
→ Read: `SCSS_MODULARIZATION_OPTIMIZATION_GUIDE.md` (Core Utilities section)
→ Reference: `modules/projects/fl.ui/src/styles/_lib/`

✅ **Plan/manage the project**
→ Read: `SCSS_OPTIMIZATION_ACTION_PLAN.md`, `REFACTORING_EXECUTIVE_SUMMARY.md`

### By Layer

**Understanding the 8-layer system:**

```
system              → CSS_LAYERS_STRATEGY.md (Layer Definitions)
  ↓
tokens              → SCSS_MODULARIZATION_OPTIMIZATION_GUIDE.md (Tokens section)
  ↓
base                → SCSS_REFACTORING_GUIDE.md (Layer Definitions)
  ↓
shell               → Basic shell example
  ↓
view                → Basic shell example (same pattern)
  ↓
components          → SCSS_MODULARIZATION_OPTIMIZATION_GUIDE.md (Components)
  ↓
utilities           → _lib/tokens.scss, _lib/breakpoints.scss
  ↓
overrides           → CSS_LAYERS_STRATEGY.md (Use sparingly!)
```

### By File Type

**Refactoring `_tokens.scss`**
→ CSS_LAYERS_STRATEGY.md section "Token Files"
→ SCSS_REFACTORING_GUIDE.md section "2. Token Files"
→ Reference: `shells/basic/_tokens.scss`

**Refactoring `_components.scss`**
→ CSS_LAYERS_STRATEGY.md section "Component Files"
→ SCSS_REFACTORING_GUIDE.md section "3. Component Files"
→ Reference: `shells/basic/_components.scss`

**Refactoring `{shell}.scss` or `_styles.scss`**
→ SCSS_REFACTORING_GUIDE.md section "4. Layout Files"
→ Reference: `shells/basic/basic.scss`

**Creating root `index.scss`**
→ SCSS_REFACTORING_GUIDE.md section "1. Root Entry Point"
→ Reference: `shells/basic/index.scss`

---

## 📊 Key Metrics

### Before Refactoring
- Total SCSS lines: 8,000+
- Duplicate code: ~40%
- Average file size: 400 lines
- CSS output size: 180 KB
- Load time: 350ms
- Maintainability: Low

### After Refactoring (Target)
- Total SCSS lines: 4,500
- Duplicate code: <5%
- Average file size: 200 lines
- CSS output size: 120 KB
- Load time: 250ms
- Maintainability: High

### Current Status (Phase 1 ✅)
- Foundation complete
- Layer system defined
- Shared library created
- Basic shell refactored (example)
- Ready for Phase 2

---

## 🚀 Implementation Timeline

```
Phase 1: Foundation          ✅ COMPLETE (Jan)
├── Layer strategy defined
├── Shared library created
├── Basic shell refactored
└── Documentation written

Phase 2: Library Expansion   📌 NEXT (Feb-Mar)
├── Shared components created
├── All shells refactored
├── Key views refactored (3+)
└── Duplicates consolidated

Phase 3: Consolidation      📌 PLANNED (Mar)
├── Remaining views refactored
├── Duplicate patterns merged
└── Migration guide published

Phase 4: Optimization       📌 PLANNED (Apr)
├── Performance optimized
├── Accessibility audited
├── Documentation finalized
└── Team trained & adopted
```

---

## 🎓 Learning Path

### Beginner (First time)
1. Read: `REFACTORING_EXECUTIVE_SUMMARY.md` (5 min)
2. Read: `CSS_LAYERS_STRATEGY.md` (15 min)
3. Look at: `shells/basic/index.scss` (10 min)
4. Read: First section of `SCSS_REFACTORING_GUIDE.md` (10 min)

**Total: 40 minutes to understand the basics**

### Intermediate (Ready to implement)
1. Read: `SCSS_REFACTORING_GUIDE.md` (30 min)
2. Study: `modules/projects/fl.ui/src/styles/_lib/` (20 min)
3. Read: `SCSS_MODULARIZATION_OPTIMIZATION_GUIDE.md` (45 min)
4. Practice: Refactor one shell with guide

**Total: 2-3 hours to be productive**

### Advanced (Leading implementation)
1. Read all strategic documents (1 hour)
2. Study all implementation files (1 hour)
3. Read action plan in detail (30 min)
4. Lead team through phased implementation

**Total: 2.5 hours to lead the project**

---

## ✅ Quality Checklist

### Before Starting Work
- [ ] Read relevant documentation
- [ ] Understand the 8-layer system
- [ ] Review basic shell example
- [ ] Understand `@use` vs `@import`

### During Implementation
- [ ] Follow file structure pattern
- [ ] Use `@use` (not `@import`)
- [ ] Wrap in appropriate `@layer`
- [ ] Keep max nesting 2 levels
- [ ] Use semantic variable names
- [ ] Add section headers and comments
- [ ] Test build succeeds

### After Implementation
- [ ] Visual regression testing
- [ ] No CSS output increase
- [ ] Verified no `@import` statements
- [ ] Verified all `@layer` declarations correct
- [ ] Code review passed
- [ ] Performance metrics good

---

## 🔧 Tools & Commands Reference

### Essential Commands
```bash
# Build
npm run build

# Dev server
npm run dev

# Analysis
find apps/CrossWord/src/frontend -name "*.scss" -exec wc -l {} + | tail -1
grep -r "@import" apps/CrossWord/src/frontend/ | wc -l
grep -r "@keyframes" apps/CrossWord/src/frontend/ | wc -l
```

### Git Workflow
```bash
# Start feature branch
git checkout -b refactor/scss-{phase}

# Commit after each shell/view
git commit -m "refactor(scss): {name} - {description}"

# Push and create PR
git push origin refactor/scss-{phase}
```

---

## 📞 Support & Resources

### Get Help
1. **About layers**: CSS_LAYERS_STRATEGY.md
2. **About refactoring**: SCSS_REFACTORING_GUIDE.md
3. **About patterns**: SCSS_MODULARIZATION_OPTIMIZATION_GUIDE.md
4. **About scheduling**: SCSS_OPTIMIZATION_ACTION_PLAN.md

### External Resources
- [Sass Documentation](https://sass-lang.com/documentation)
- [CSS @layer MDN](https://developer.mozilla.org/en-US/docs/Web/CSS/@layer)
- [CSS Performance](https://web.dev/css-performance/)

---

## 🏆 Success Criteria

**Project complete when:**
1. ✅ All SCSS refactored (100% of codebase)
2. ✅ All documentation updated
3. ✅ Team trained and adopting patterns
4. ✅ Performance targets met (30-40% CSS reduction)
5. ✅ All tests pass
6. ✅ Zero style-related bugs in production
7. ✅ Code review sign-off from lead
8. ✅ Documentation published

---

## 📝 Document Maintenance

**This index should be updated:**
- After each major phase completes
- When new documentation is added
- When URLs/paths change
- Monthly (minimum)

**Last Updated**: 2026-02-02  
**Next Review**: 2026-02-09  
**Maintainer**: Architecture Team

---

## 🎯 One-Page Quick Reference

| Need | Document | Section |
|------|----------|---------|
| Understand project | EXECUTIVE_SUMMARY | Overview |
| Understand layers | CSS_LAYERS_STRATEGY | Layer Definitions |
| Refactor shell | REFACTORING_GUIDE | Shells |
| Refactor view | REFACTORING_GUIDE | Views |
| Use utilities | MODULARIZATION_GUIDE | Core Utilities |
| Plan timeline | ACTION_PLAN | Phases |
| Find example | Basic Shell | `shells/basic/` |

---

**Master Index v1.0**  
✅ Ready for team adoption  
🚀 All resources available  
📚 Complete documentation suite
