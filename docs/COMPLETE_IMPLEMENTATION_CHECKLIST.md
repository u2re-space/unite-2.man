# Complete CSS Refactoring Implementation Checklist

## 📋 Master Checklist

Use this as your go-to reference for completing the entire CSS refactoring project.

---

## Phase 1: Foundation (COMPLETED ✅)

- [x] Define 8-layer hierarchy
- [x] Create layer strategy documentation
- [x] Update styles.ts with layer initialization
- [x] Refactor basic shell (index, basic.scss, tokens, components)
- [x] Document best practices

---

## Phase 2: Extension & Optimization

### 2.1 Refactor Faint Shell

**Files to Update:**
- [ ] `shells/faint/index.scss` – Add layer declaration + @use imports
- [ ] `shells/faint/_tokens.scss` – Wrap in @layer tokens, categorize
- [ ] `shells/faint/_base.scss` – Create if missing, wrap in @layer base
- [ ] `shells/faint/_layout.scss` – Wrap in @layer shell
- [ ] `shells/faint/_components.scss` – Create/refactor, wrap in @layer components
- [ ] `shells/faint/faint.scss` – Wrap in @layer shell, organize by section
- [ ] `shells/faint/scss/**/*.scss` – Update all to @use + @layer

**Checklist per File:**
- [ ] Remove @import, replace with @use
- [ ] Add @layer wrapper
- [ ] Flatten SCSS nesting (max 2 levels)
- [ ] Extract keyframes to `_keyframes.scss`
- [ ] Add section headers
- [ ] Use semantic names
- [ ] Remove duplicates
- [ ] Test in browser

---

### 2.2 Refactor Raw Shell

**Files to Update:**
- [ ] `shells/raw/index.scss` – Create root with @layer declaration
- [ ] `shells/raw/_reset.scss` – Create with HTML resets (@layer system)
- [ ] `shells/raw/raw.scss` – Create/refactor, wrap in @layer shell

**Checklist:**
- [ ] Minimal setup (raw shell = minimal styling)
- [ ] Only essential resets
- [ ] No design system imposed
- [ ] Test in browser

---

### 2.3 Create Shared SCSS Library

**Create Directory: `shells/lib/`**

- [ ] `shells/lib/_breakpoints.scss` – Centralized media queries
- [ ] `shells/lib/_mixins.scss` – Common SCSS mixins
- [ ] `shells/lib/_functions.scss` – SCSS functions
- [ ] `shells/lib/_variables.scss` – Shared token variables
- [ ] `shells/lib/_keyframes.scss` – Global keyframes
- [ ] `shells/lib/index.scss` – Public exports via @forward

**Breakpoints Checklist:**
- [ ] Define $mobile, $tablet, $desktop, $wide
- [ ] Create @mixin respond($size)
- [ ] Test mixin usage across shells
- [ ] Document breakpoint strategy

**Mixins Checklist:**
- [ ] Create focus-ring() mixin
- [ ] Create flex-center() mixin
- [ ] Create smooth-transition() mixin
- [ ] Create truncate() mixin
- [ ] Create line-clamp() mixin
- [ ] Create visually-hidden() mixin
- [ ] Document each mixin

**Keyframes Checklist:**
- [ ] Extract spin animation
- [ ] Extract fadeIn animation
- [ ] Extract slideIn animations
- [ ] Extract bounce animation
- [ ] Extract shimmer animation
- [ ] Consolidate from all shells/views
- [ ] Remove duplicates

---

### 2.4 Refactor Views

**For Each View: viewer, editor, explorer, workcenter, settings, etc.**

- [ ] Create `views/{view}/index.scss` (root)
- [ ] Create `views/{view}/_tokens.scss` (@layer tokens)
- [ ] Create `views/{view}/_styles.scss` (@layer view)
- [ ] Update view-specific files to @use + @layer
- [ ] Extract keyframes to lib
- [ ] Consolidate media queries
- [ ] Use shared mixins

**Per-View Checklist:**
- [ ] Remove @import, use @use
- [ ] Declare layer tokens at :root:has(.view-{id})
- [ ] Organize styles by section
- [ ] Use semantic names
- [ ] Test in browser
- [ ] No visual changes

---

### 2.5 Consolidate Media Queries

**Task: Replace scattered breakpoints with centralized system**

**Before:**
```bash
@media (max-width: 640px)
@media (max-width: 640px)
@media (max-width: 767px)
@media (max-width: 768px)
```

**After:**
```bash
@include respond("mobile")
@include respond("tablet")
@include respond("desktop")
```

**Audit Commands:**
- [ ] Find all @media queries: `grep -r "@media" shells/ | wc -l`
- [ ] Identify unique breakpoints: `grep -r "@media" shells/ | sort -u`
- [ ] Update each shell/view with mixin
- [ ] Verify build size reduction
- [ ] Test responsive behavior

---

### 2.6 Deduplicate Keyframes

**Task: Find and consolidate all keyframe definitions**

**Audit:**
```bash
grep -r "@keyframes" shells/ | cut -d: -f2 | sort | uniq -d
```

**For Each Duplicate:**
- [ ] Keep one definition in `shells/lib/_keyframes.scss`
- [ ] Remove duplicates from all other files
- [ ] Update imports to use lib version
- [ ] Verify animations still work
- [ ] Test across all shells/views

---

### 2.7 Remove Dead Styles

**Audit Strategy:**

```bash
# Find all CSS classes
grep -r "^\s*\." shells/ --include="*.scss" \
    | sed 's/.*\.\([a-zA-Z0-9_-]*\).*/\1/' | sort -u > all-classes.txt

# Find used classes in TS/TSX
grep -r "class=" apps/CrossWord/src --include="*.ts" --include="*.tsx" \
    | grep -o '\w\+' | sort -u > used-classes.txt

# Find potentially unused (review manually!)
comm -23 all-classes.txt used-classes.txt
```

**Manual Review:**
- [ ] Check for `legacy-*`, `old-*`, `deprecated-*` patterns
- [ ] Look for version suffixes: `v1`, `v2`, `-old`
- [ ] Find single-use classes (candidates for inline)
- [ ] Review commented-out rules
- [ ] Remove or document exceptions

**Cleanup:**
- [ ] Delete unused `.scss` files
- [ ] Remove unused class definitions
- [ ] Remove unused variables
- [ ] Remove unused mixins
- [ ] Verify build succeeds
- [ ] Test in browser

---

## Phase 3: Quality & Verification

### 3.1 Code Quality Audit

**Specificity Check:**
- [ ] No ID selectors in component styles
- [ ] No !important flags (except @layer overrides)
- [ ] Low specificity throughout (prefer classes)
- [ ] No specificity wars in same layer

**Structure Check:**
- [ ] Max 2 levels of SCSS nesting
- [ ] Flat selectors throughout
- [ ] Consistent section headers
- [ ] Clear organization
- [ ] Comprehensive comments

**Naming Check:**
- [ ] Semantic variable names (not `$blue`)
- [ ] BEM class naming (`.component__element--modifier`)
- [ ] Consistent prefixes
- [ ] Meaningful layer names

---

### 3.2 Performance Audit

**File Size Analysis:**
- [ ] Measure current CSS file size
- [ ] Record baseline metrics
- [ ] After refactoring, measure again
- [ ] Target: 20-30% reduction
- [ ] Gzip: < 100KB

**Commands:**
```bash
# File size
du -h dist/styles.css

# Gzip size
gzip -c dist/styles.css | du -h

# Selector count
grep -o "{" dist/styles.css | wc -l

# Line count
wc -l dist/styles.css
```

**Targets:**
- [ ] CSS file: < 400KB (raw)
- [ ] CSS file: < 100KB (gzip)
- [ ] Selectors: < 5000
- [ ] Media queries: < 20 unique breakpoints

---

### 3.3 Browser Testing

**Visual Testing:**
- [ ] Load each shell
- [ ] Verify all styles apply correctly
- [ ] No visual regressions
- [ ] Animations/transitions smooth
- [ ] Hover/focus states work
- [ ] Dark theme switching works (if supported)

**Responsive Testing:**
- [ ] Mobile (320px - 480px)
- [ ] Tablet (480px - 768px)
- [ ] Desktop (768px - 1024px)
- [ ] Wide (1024px - 1280px)
- [ ] Ultrawide (1920px+)

**Accessibility Testing:**
- [ ] Tab navigation works
- [ ] Focus rings visible
- [ ] Keyboard shortcuts functional
- [ ] Screen reader compatible
- [ ] Color contrast sufficient
- [ ] Reduced motion respected

---

### 3.4 Build Verification

**Build Checks:**
```bash
npm run build
npm run lint
npm run dev
```

**Checklist:**
- [ ] Build succeeds (no errors)
- [ ] Lint passes (no warnings)
- [ ] Dev server starts
- [ ] No console errors
- [ ] No console warnings
- [ ] Styles load correctly
- [ ] No FOUC (flash of unstyled content)

---

### 3.5 Documentation & Handoff

**Documentation:**
- [ ] SCSS refactoring guide complete
- [ ] Advanced patterns documented
- [ ] Performance optimization guide complete
- [ ] Layer strategy documented
- [ ] Code examples provided
- [ ] Best practices captured

**Team Handoff:**
- [ ] Share documentation with team
- [ ] Conduct code review
- [ ] Hold knowledge-sharing session
- [ ] Gather feedback
- [ ] Capture team questions
- [ ] Update docs based on feedback

---

## Ongoing Maintenance

### Regular Tasks

**Weekly:**
- [ ] Monitor CSS file size trends
- [ ] Review new styles for layer compliance
- [ ] Check for dead code
- [ ] Ensure mixin/token reuse

**Monthly:**
- [ ] Performance audit
- [ ] Accessibility audit
- [ ] Browser compatibility check
- [ ] Unused styles cleanup

**Quarterly:**
- [ ] Refactor opportunities assessment
- [ ] New patterns identified
- [ ] Best practices update
- [ ] Team feedback session

---

## Success Metrics

### Before Refactoring
- CSS file size: ~500KB
- Keyframe duplicates: 3-5x
- Media queries: 15+ unique breakpoints
- Unused styles: 5-10%
- Nesting depth: 3-4 levels
- Specificity conflicts: Frequent

### After Refactoring (Target)
- [ ] CSS file size: 350-400KB (30% reduction)
- [ ] Keyframe duplicates: 0 (1 definition each)
- [ ] Media queries: 1 system (5 breakpoints)
- [ ] Unused styles: 0-2%
- [ ] Nesting depth: max 2 levels
- [ ] Specificity conflicts: 0

### Team Metrics
- [ ] Onboarding time reduced: 50%
- [ ] Style bugs decreased: 80%
- [ ] Maintenance time reduced: 40%
- [ ] Code reuse increased: 60%

---

## Troubleshooting Guide

### Issue: Styles not applying

**Debug:**
1. Check if @layer is declared at root
2. Verify @use imports are correct
3. Confirm rule is wrapped in @layer
4. Check layer priority (is it lower than intended?)
5. Look for selector specificity issues

### Issue: Cascade not working as expected

**Debug:**
1. Verify @layer order is correct at root
2. Check no @layer redeclarations in imports
3. Confirm specificity is low (classes only)
4. Use DevTools layer panel to debug

### Issue: Build errors

**Debug:**
1. Check for SCSS syntax errors (quotes, braces)
2. Verify @use paths are correct
3. Check for circular imports
4. Review recent changes
5. Run `npm run lint` for details

### Issue: Large file size

**Debug:**
1. Check for duplicate rules
2. Look for unused variables
3. Audit keyframes (are they deduplicated?)
4. Check media query consolidation
5. Measure with `du -h dist/styles.css`

---

## Quick Reference

### Essential Commands

```bash
# Build
npm run build

# Dev
npm run dev

# Lint
npm run lint

# Type check
npm run typecheck

# Audit CSS size
du -h dist/styles.css

# Find all media queries
grep -r "@media" shells/ | wc -l

# Find all keyframes
grep -r "@keyframes" shells/ | sort | uniq

# Find unused classes
grep -r "^\." shells/ --include="*.scss" | sort -u
```

### Important Files

- `shells/lib/_breakpoints.scss` – Media queries
- `shells/lib/_mixins.scss` – Common patterns
- `shells/lib/_keyframes.scss` – Global animations
- `shells/lib/_variables.scss` – Shared tokens
- `shells/{shell}/index.scss` – Layer declaration
- `src/frontend/views/styles.ts` – Layer initialization

### Key Principles

1. ✅ Layers eliminate specificity conflicts
2. ✅ @use creates explicit dependencies
3. ✅ Flat selectors are clearer than nested
4. ✅ Variables enable consistency
5. ✅ Semantic naming improves maintainability
6. ✅ Centralized patterns = DRY code

---

## Phase Timeline

**Estimated Timeline:**
- Phase 1: ✅ Complete (Done)
- Phase 2: 2-3 weeks (Shells + Views + Optimization)
- Phase 3: 1 week (QA + Verification)
- Total: ~4 weeks to full completion

**Resource Estimate:**
- 1 frontend engineer: 4 weeks full-time
- Or 2 engineers: 2 weeks
- Code reviews: 3-5 hours
- Testing: 5-8 hours

---

## Sign-Off

- [ ] Phase 1 complete and documented
- [ ] Phase 2 implementation started
- [ ] Team aligned on approach
- [ ] Metrics tracked
- [ ] Quality gates met
- [ ] Documentation delivered
- [ ] Ready for production deployment

---

**You've got this! Refer back to this checklist as you progress through the refactoring.** 🚀
