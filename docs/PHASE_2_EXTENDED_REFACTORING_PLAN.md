# Phase 2: Extended Refactoring & Optimization

## 📋 Comprehensive Task List

### Part 1: Shell Refactoring (Faint & Raw)
- [ ] Refactor `shells/faint/index.scss` with @layer declaration
- [ ] Refactor `shells/faint/faint.scss` (organize by sections)
- [ ] Refactor `shells/faint/_tokens.scss` (if exists)
- [ ] Extract faint keyframes to `shells/faint/_keyframes.scss`
- [ ] Refactor `shells/raw/raw.scss` (minimal, verify no @import)

### Part 2: View Refactoring (All Views)
- [ ] Refactor `views/viewer/viewer.scss`
- [ ] Refactor `views/editor/editor.scss`
- [ ] Refactor `views/explorer/index.scss`
- [ ] Refactor `views/workcenter/scss/workcenter.scss`
- [ ] Refactor `views/home/home.scss`
- [ ] Refactor `views/airpad/` styles
- [ ] Refactor `views/history/history.scss`
- [ ] Refactor `views/settings/Settings.scss`
- [ ] Refactor `views/print/` styles
- [ ] Refactor `views/from-faint/` styles

### Part 3: Token Consolidation
- [ ] Extract shared tokens to `styles/shared/_tokens.scss`
- [ ] Identify duplicate tokens across shells
- [ ] Consolidate color definitions
- [ ] Consolidate spacing definitions
- [ ] Consolidate typography definitions

### Part 4: Mixin & Function Library
- [ ] Create `styles/lib/_mixins.scss` for common patterns
- [ ] Create `styles/lib/_functions.scss` for computed values
- [ ] Document shared utilities
- [ ] Create `@forward` index for public API

### Part 5: Cleanup & Optimization
- [ ] Remove all remaining `@import` statements
- [ ] Remove unused/deprecated files (`settings.scss`, etc.)
- [ ] Deduplicate all keyframes across project
- [ ] Audit media queries (consolidate breakpoints)
- [ ] Verify no unused custom properties

### Part 6: Documentation & Standards
- [ ] Create style guide for team
- [ ] Document project-specific patterns
- [ ] Create examples for new shells/views
- [ ] Update README with style architecture
- [ ] Create troubleshooting guide

---

## 🎯 Priority Breakdown

### Tier 1: Critical (Do First)
1. Refactor remaining shells (faint, raw)
2. Consolidate shared tokens
3. Create shared mixin library
4. Remove all @import statements

### Tier 2: Important (Do Next)
1. Refactor all views (at least key ones)
2. Deduplicate keyframes
3. Audit and consolidate media queries
4. Clean up unused files

### Tier 3: Enhancement (Nice to Have)
1. Create @property declarations
2. Add container queries
3. Performance optimization
4. Accessibility audit

---

## 🔧 Execution Strategy

### For Each Shell (Faint, Raw)
1. Create `_keyframes.scss` with all @keyframes (@layer tokens)
2. Create `_tokens.scss` with design tokens (@layer tokens)
3. Create `_components.scss` with reusable components (@layer components)
4. Update main `.scss` file (@layer shell)
5. Update `index.scss` with @layer declaration + @use imports
6. Verify no linter errors
7. Test in browser

### For Each View
1. Create `_tokens.scss` with view-specific tokens (@layer tokens)
2. Create `_styles.scss` with view layout (@layer view)
3. Create root `{view}.scss` with @use imports
4. Flatten nesting, organize by sections
5. Verify no linter errors
6. Test that view renders correctly

### For Token Consolidation
1. Identify all token definitions across shells
2. Find duplicates
3. Move duplicates to shared `styles/shared/_tokens.scss`
4. Update shells to use shared tokens
5. Add shell-specific overrides where needed

### For Mixin Library
1. Identify common SCSS patterns
2. Extract into mixins with parameters
3. Document each mixin
4. Create `@forward` exports
5. Update usage across project

---

## 📊 Estimated Effort

| Task | Effort | Notes |
|------|--------|-------|
| Refactor faint shell | 1-2 hours | Similar size to basic |
| Refactor raw shell | 30 min | Minimal styles |
| Refactor 3-5 views | 4-6 hours | ~1 hour each |
| Token consolidation | 2-3 hours | Requires analysis |
| Mixin library | 2-3 hours | Identify + extract + document |
| Cleanup | 1-2 hours | Dedup, remove, audit |
| Documentation | 2-3 hours | Write guides + examples |
| **Total Phase 2** | **13-20 hours** | ~2-3 days work |

---

## ✅ Success Criteria

- [ ] All shells use modern @use syntax
- [ ] All shells declare @layer order
- [ ] All views follow view structure pattern
- [ ] No @import statements remain
- [ ] No duplicate tokens
- [ ] No duplicate keyframes
- [ ] Shared tokens consolidated
- [ ] Mixin library created and used
- [ ] All tests pass
- [ ] No linter errors
- [ ] Documentation complete

---

## 🎬 Ready to Execute

This plan builds directly on Phase 1 foundation:
- ✅ Layer system defined
- ✅ Patterns established (in basic shell)
- ✅ Documentation created
- ✅ TypeScript integration ready

**Proceed with Phase 2 immediately** – patterns are proven and ready to scale!

---

## 📝 Template Files

For quick reference when refactoring:

### Shell Index Template
```scss
/**
 * {Shell} Shell Styles - Modern Layer-based Architecture
 * Uses @use instead of @import
 */

@layer system, tokens, base, shell, view, components, utilities, overrides;

@use "keyframes" as kf;
@use "tokens" as t;
@use "components" as c;
@use "{shell}" as shell;
```

### Shell Main Template
```scss
/**
 * {Shell} Shell - Theme & Layout Styles
 * Organized in @layer shell
 */

@layer shell {
    /* === SECTION NAME === */
    
    .shell-{id} {
        /* rules */
    }
}
```

### Tokens Template
```scss
/**
 * {Shell} Shell - Design Tokens
 * Organized in @layer tokens
 */

@layer tokens {
    .shell-{id} {
        /* tokens */
    }
}
```

### View Template
```scss
/**
 * {View} View Styles
 * Root: imports _tokens and _styles
 */

@use "tokens" as t;
@use "styles" as s;
```

---

## 🚀 Next Steps

1. **Review this plan** with team
2. **Assign shells/views** to team members
3. **Use templates** for consistency
4. **Follow verification checklist**
5. **Test as you go** (don't batch test all at end)

Ready when you are! 🎉
