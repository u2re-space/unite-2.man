# Phase 2: Advanced Optimizations & Refactoring

## 🎯 Strategic Overview

Build on the foundation established in Phase 1 to create a production-ready, scalable CSS architecture. This phase focuses on:
1. Creating shared utility libraries
2. Consolidating color systems
3. Eliminating remaining duplicates
4. Optimizing module structure
5. Establishing team best practices

---

## 📋 Tasks by Priority

### HIGH PRIORITY (Week 1)

#### 1. **Create Shared SCSS Library** ⭐
**Goal**: Centralize reusable mixins, functions, and utilities

**Files to Create**:
```
modules/shared/styles/
├── _animations.scss         # All @keyframes (canonical)
├── _breakpoints.scss        # Media queries & container sizes
├── _mixins.scss             # Reusable layout, typography, state mixins
├── _functions.scss          # Color functions, spacing functions
├── _colors.scss             # Color palette definitions
├── _typography.scss         # Font families, sizing scales
└── index.scss               # Exports all (@forward)
```

**Keyframe Library** (`_animations.scss`):
```scss
@layer tokens {
    /* Spinner/rotation animations */
    @keyframes spin { ... }
    @keyframes viewer-spinner { ... }
    
    /* Entry/exit animations */
    @keyframes fadeIn { ... }
    @keyframes fadeInUp { ... }
    @keyframes slideIn { ... }
    @keyframes viewer-slide-in { ... }
    
    /* Status animations */
    @keyframes shell-basic-status-enter { ... }
    
    /* Loading/shimmer animations */
    @keyframes blink { ... }
    @keyframes pulse { ... }
    @keyframes viewer-pulse { ... }
    @keyframes viewer-skeleton-shimmer { ... }
}
```

**Mixin Library** (`_mixins.scss`):
```scss
// Layout mixins (from faint shell library)
@mixin stack($gap, $display: grid) { ... }
@mixin hstack($gap) { ... }
@mixin vstack($gap) { ... }
@mixin container-inline { ... }
@mixin container-size { ... }

// Typography mixins
@mixin text-heading($token, $align) { ... }
@mixin text-body($token) { ... }
@mixin text-label($token, $uppercase) { ... }

// Interactive state mixins
@mixin hover-state($color, $duration) { ... }
@mixin focus-ring($color, $width) { ... }
@mixin active-lift($distance) { ... }

// Responsive helpers
@mixin responsive-sizing($mobile, $tablet, $desktop) { ... }
@mixin safe-text-wrap($mode) { ... }

// Elevation/shadow mixins
@mixin elevation($level) { ... }
```

**Implementation**:
1. Scan existing files for mixin patterns
2. Extract 10-15 most-used mixins
3. Consolidate into library
4. Update imports across project

---

#### 2. **Consolidate Color Systems** 🎨
**Goal**: Unified color token management (eliminate --c2-*, --color-*, --md3-* confusion)

**Current State Analysis**:
- `--c2-*` functions (veela.css runtime)
- `--md3-*` tokens (Material Design 3)
- `--color-*` custom definitions
- Per-shell color definitions (duplicated)

**Refactoring Plan**:

Create `_colors.scss`:
```scss
/* Color Palette */
$palette-primary: #007acc;
$palette-secondary: #5c6e7b;
$palette-accent: #ff6b35;
$palette-success: #00b366;
$palette-warning: #ff9800;
$palette-error: #f44336;

/* Semantic Color Tokens */
:root {
    --color-primary: $palette-primary;
    --color-secondary: $palette-secondary;
    --color-accent: $palette-accent;
    --color-success: $palette-success;
    --color-warning: $palette-warning;
    --color-error: $palette-error;
    
    /* Surface colors */
    --color-surface: #ffffff;
    --color-surface-variant: #f5f5f5;
    --color-surface-dim: #efefef;
    
    /* Text colors */
    --color-text-primary: #1a1a1a;
    --color-text-secondary: #666666;
    --color-text-tertiary: #999999;
}

/* Dark theme */
@media (prefers-color-scheme: dark) {
    :root {
        --color-surface: #1e1e1e;
        --color-surface-variant: #2d2d2d;
        --color-text-primary: #e0e0e0;
        /* ... */
    }
}
```

**Migration Path**:
- Map `--c2-*` → `--color-*` in component styles
- Replace `--md3-*` references with semantic `--color-*`
- Per-shell theme overrides via `[data-theme]`
- Document migration in team guide

---

#### 3. **Refactor Remaining Shells** 🐚
**Goal**: Apply basic shell pattern to faint and raw shells

**Faint Shell** (`shells/faint/`):
1. Extract `_keyframes.scss` (consolidate with shared library)
2. Extract `_tokens.scss` (scope to `.shell-faint`)
3. Extract `_components.scss`
4. Update `index.scss` with @layer declaration + @use
5. Remove dead code from library mixins

**Raw Shell** (`shells/raw/`):
1. Minimal refactoring (likely just index.scss update)
2. Ensure consistent @layer usage
3. Keep @use pattern consistent

**Estimated Effort**: 3-4 hours per shell

---

#### 4. **Remove Duplicate Styles** 🧹
**Goal**: Eliminate ~40-50% code duplication identified in analysis

**Priority Duplicates to Remove**:
| Location | Duplicate | Action |
|----------|-----------|--------|
| workcenter views | `@keyframes spin/pulse/blink` (2-3x each) | Move to shared library |
| workcenter views | Layout sections (220-365 lines) | Consolidate to 1 definition |
| workcenter views | Pipeline/modal components (1500+ lines total) | Extract to shared component module |
| basic shell | Tokens (100+ lines) | Already extracted ✅ |
| faint shell | Mixins duplicated from basic | Consolidate to shared library |

**Commands to Find Duplicates**:
```bash
# Find duplicate @keyframes
grep -rn "@keyframes" . | grep -o "@keyframes [a-z-]*" | sort | uniq -d

# Find identical selectors
grep -rn "^\\.[a-z-]*[^{]*{$" . | cut -d: -f3- | sort | uniq -d | head -20

# Find duplicate CSS property blocks
find . -name "*.scss" -exec grep -l "display: flex;" {} \; | wc -l
```

---

### MEDIUM PRIORITY (Week 2)

#### 5. **Create View Pattern Examples** 📐
**Goal**: Establish pattern for view-specific styles

**Viewer View** (`views/viewer/`):
```
views/viewer/
├── _tokens.scss         # @layer tokens (view-specific)
├── _layout.scss         # @layer view (structure)
├── _components.scss     # @layer components (view-only parts)
└── viewer.scss          # Root index + @use
```

**Editor View** (`views/editor/`):
Similar structure, demonstrating pattern for another complex view

**Benefit**: Clear example for team when adding new views

---

#### 6. **Optimize Typography System** 🔤
**Goal**: Unified, scalable typography

**Create `_typography.scss`**:
```scss
/* Font families */
$font-family-base: system-ui, -apple-system, 'Segoe UI', Roboto, sans-serif;
$font-family-mono: 'Cascadia Mono', 'Fira Code', monospace;
$font-family-display: 'Roboto', sans-serif;

/* Font sizes (modular scale: 1.125) */
$text-xs: 0.75rem;      // 12px
$text-sm: 0.875rem;     // 14px
$text-base: 1rem;       // 16px
$text-lg: 1.125rem;     // 18px
$text-xl: 1.25rem;      // 20px
$text-2xl: 1.5rem;      // 24px

/* Font weights */
$font-weight-light: 300;
$font-weight-normal: 400;
$font-weight-medium: 500;
$font-weight-semibold: 600;
$font-weight-bold: 700;

/* Line heights */
$leading-tight: 1.2;
$leading-normal: 1.5;
$leading-relaxed: 1.8;

/* Letter spacing */
$letter-spacing-tight: -0.02em;
$letter-spacing-normal: 0;
$letter-spacing-loose: 0.05em;

/* Mixins for typography sets */
@mixin text-preset($size, $weight, $line-height) {
    font-size: $size;
    font-weight: $weight;
    line-height: $line-height;
}

@mixin heading-1 { @include text-preset($text-2xl, $font-weight-bold, $leading-tight); }
@mixin heading-2 { @include text-preset($text-xl, $font-weight-semibold, $leading-tight); }
@mixin body-default { @include text-preset($text-base, $font-weight-normal, $leading-normal); }
@mixin label-default { @include text-preset($text-sm, $font-weight-medium, $leading-normal); }
```

**Benefits**:
- Consistent typography across app
- Easy to update scales globally
- Mixins reduce repetition

---

#### 7. **Create Spacing Scale** 📏
**Goal**: Systematic, scalable spacing system

**Create `_spacing.scss`**:
```scss
/* Base unit: 0.25rem (4px) */
$space-unit: 0.25rem;

$space-0: 0;
$space-1: $space-unit;       // 4px
$space-2: $space-unit * 2;   // 8px
$space-3: $space-unit * 3;   // 12px
$space-4: $space-unit * 4;   // 16px
$space-6: $space-unit * 6;   // 24px
$space-8: $space-unit * 8;   // 32px
$space-12: $space-unit * 12; // 48px
$space-16: $space-unit * 16; // 64px

/* Aliases for clarity */
$space-xs: $space-2;
$space-sm: $space-3;
$space-md: $space-4;
$space-lg: $space-6;
$space-xl: $space-8;
$space-2xl: $space-12;
$space-3xl: $space-16;

/* CSS custom properties */
:root {
    --space-xs: #{$space-xs};
    --space-sm: #{$space-sm};
    /* ... */
}
```

---

### LOW PRIORITY (Week 3+)

#### 8. **Performance Audit** ⚡
**Goal**: Reduce CSS bundle size and runtime performance

**Metrics to Measure**:
- Selector specificity distribution
- CSS file sizes (gzipped vs raw)
- Unused CSS detection
- @layer overhead (if any)

**Tools**:
```bash
# Analyze CSS size
stat apps/CrossWord/dist/styles.css

# Check selector specificity
npx cssstats apps/CrossWord/dist/styles.css

# Find unused CSS
npx uncss "http://localhost:5173" --stylesheets http://localhost:5173/styles.css
```

---

#### 9. **Add @property Declarations** 🎬
**Goal**: Enable smooth animations for custom properties

```scss
@property --color-primary {
    syntax: '<color>';
    inherits: false;
    initial-value: #007acc;
}

@property --space-md {
    syntax: '<length>';
    inherits: false;
    initial-value: 0.75rem;
}
```

**Benefits**:
- Smooth color transitions
- Typed custom properties
- Better animation control

---

#### 10. **Container Query Implementation** 📦
**Goal**: Responsive components via container queries

```scss
.component {
    container-type: inline-size;
}

@container (min-width: 400px) {
    .component { /* larger layout */ }
}
```

---

## 🛠️ Implementation Checklist

### Week 1
- [ ] Create shared SCSS library structure
- [ ] Extract and consolidate keyframes
- [ ] Extract common mixins
- [ ] Create centralized color system
- [ ] Refactor faint shell (demo)
- [ ] Refactor raw shell (minimal)
- [ ] Remove identified duplicates

### Week 2
- [ ] Create view pattern examples
- [ ] Refactor 2-3 key views
- [ ] Optimize typography system
- [ ] Create spacing scale
- [ ] Test build size reduction

### Week 3+
- [ ] Performance audit
- [ ] Add @property declarations
- [ ] Implement container queries
- [ ] Update team documentation
- [ ] Create refactoring guide

---

## 📊 Expected Improvements

| Metric | Before | After | Improvement |
|--------|--------|-------|-------------|
| Code duplication | ~50% | ~10% | -40% |
| CSS bundle size | 200KB | 120KB | -40% |
| Mixin reuse | Scattered | 80% | +High |
| Color system clarity | 3 systems | 1 system | +Simple |
| View onboarding time | 2-3 hours | 30 min | -90% |

---

## 🎯 Success Criteria

- ✅ 40%+ reduction in CSS duplication
- ✅ Shared library with 15+ reusable mixins
- ✅ Single unified color system
- ✅ All shells using consistent @layer pattern
- ✅ 3+ view examples following pattern
- ✅ Documentation updated for team
- ✅ Build verification (all styles work)
- ✅ Performance maintained or improved

---

## 📚 Related Documentation

- Phase 1 documentation (in workspace)
- Refactoring guides (faint shell, raw shell)
- Best practices for team adoption

---

## 💡 Notes for Team

### Key Principles
1. **DRY** – Extract duplication as you find it
2. **Layers** – Always use @layer consistently
3. **Modularity** – Small, focused files
4. **Naming** – Semantic, not visual (--color-primary, not --blue)
5. **Testing** – Build and visual check after each change

### Common Pitfalls to Avoid
- ❌ Defining same @keyframes in multiple files
- ❌ Mixing color token systems (--c2-*, --md3-*, --color-*)
- ❌ Over-nesting SCSS (max 2 levels)
- ❌ Using !important (use layers instead)
- ❌ Global state mutation (use scoped tokens)

### Communication Plan
1. Share this document with team
2. Schedule 30-min walkthrough
3. Pair program first refactoring
4. Create shared library together
5. Establish team consensus on patterns

---

**Next Step**: Begin Week 1 tasks with shared library creation!
