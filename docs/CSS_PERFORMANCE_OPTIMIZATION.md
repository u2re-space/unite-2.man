# CSS Performance & Optimization Strategies

## 🚀 Overview

This guide covers performance optimization, CSS file size reduction, and best practices for the refactored layer-based system.

---

## 📊 File Size Optimization

### Current Metrics (Baseline)
```
Before Phase 2:
- Total CSS: ~500KB (estimate)
- Keyframes duplicated: 3-5 times each
- Media queries scattered: 15+ different breakpoints
- Unused classes: 5-10%
```

### Target Metrics (After Optimization)
```
After Phase 2:
- Total CSS: ~350-400KB (20-30% reduction)
- Keyframes deduplicated: 100% (1 definition each)
- Media queries consolidated: 1 system
- Unused classes: 0-2% (actively maintained)
```

---

## 🎯 Optimization Strategies

### 1. Selector Specificity Audit

**Goal**: Keep selector specificity as low as possible

#### Anti-patterns to Fix:
```scss
/* ❌ Too specific */
div#main > section.content > article.post > p.text { }
div.container > div.row > div.col > .item { }

/* ✅ Better */
.text { }
.item { }
.post__text { }
```

#### Audit Command:
```bash
# Find high-specificity selectors
grep -r "ID\|!important" apps/CrossWord/src/frontend/shells --include="*.scss"
```

---

### 2. Property Grouping & Consolidation

#### Before (Scattered):
```scss
.button {
    padding: 0.5rem;
    color: #333;
    margin: 0.25rem;
}

.button-primary {
    padding: 0.5rem;
    color: white;
}

.button-small {
    padding: 0.25rem;
    color: #333;
}
```

#### After (Consolidated):
```scss
.button {
    padding: 0.5rem;
    color: #333;
}

.button--primary {
    color: white;
}

.button--small {
    padding: 0.25rem;
}
```

**Savings**: 30-40% of button rules

---

### 3. CSS Custom Properties Optimization

#### Use Variables for Repeated Values:
```scss
/* ❌ Duplicated */
.element-a { border-radius: 8px; }
.element-b { border-radius: 8px; }
.element-c { border-radius: 8px; }

/* ✅ With Variables */
.shell {
    --radius-md: 8px;
}

.element-a { border-radius: var(--radius-md); }
.element-b { border-radius: var(--radius-md); }
.element-c { border-radius: var(--radius-md); }
```

**Result**: Single definition, updated everywhere

---

### 4. Media Query Consolidation

#### Before (Scattered):
```scss
/* shells/basic/basic.scss */
@media (max-width: 640px) { .nav { } }

/* shells/basic/layout.scss */
@media (max-width: 640px) { .content { } }

/* views/viewer/viewer.scss */
@media (max-width: 768px) { .panel { } }
```

#### After (Centralized):
```scss
/* shells/lib/_breakpoints.scss */
$mobile: 480px;
$tablet: 768px;

@mixin respond($size) {
    @if $size == "mobile" {
        @media (max-width: 479px) { @content; }
    }
}

/* Usage everywhere */
@include respond("mobile") { /* styles */ }
```

**Savings**: 20-30% from consolidated breakpoints

---

### 5. Keyframe Deduplication

#### Before (Multiple Definitions):
```scss
/* shells/basic/_keyframes.scss */
@keyframes spin { /* definition */ }

/* shells/faint/_keyframes.scss */
@keyframes spin { /* duplicate */ }

/* views/editor/_keyframes.scss */
@keyframes spin { /* duplicate */ }
```

#### After (Single Source):
```scss
/* shells/lib/_keyframes.scss */
@keyframes spin { /* single definition */ }

/* Import everywhere */
@use "shells/lib/keyframes" as kf;
animation: kf.spin;
```

**Savings**: 40-50% from deduplicated keyframes

---

## 🧹 Dead Code Removal

### Automated Search Strategy

```bash
# 1. Find all CSS classes
grep -r "^\." apps/CrossWord/src/frontend --include="*.scss" \
    | sed 's/.*\.\([a-zA-Z0-9_-]*\).*/\1/' | sort -u > classes.txt

# 2. Find used classes in HTML/JSX/TS
grep -r "class=" apps/CrossWord/src/frontend --include="*.ts" --include="*.tsx" \
    | grep -o 'class="[^"]*' | sed 's/.*class="//' | tr ' ' '\n' | sort -u > used.txt

# 3. Find potentially unused
comm -23 classes.txt used.txt | head -20
```

### Manual Review Checklist
- [ ] Search for `legacy-*`, `old-*`, `deprecated-*` patterns
- [ ] Check for commented-out rules
- [ ] Look for `v1`, `v2` version suffixes
- [ ] Find single-use classes
- [ ] Identify prefixed alternatives

---

## 🔍 Performance Profiling

### Browser DevTools Audit

1. Open DevTools → Coverage tab
2. Reload page
3. Identify unused CSS
4. Review and remove

### Build-time Analysis

```bash
# Check CSS file size
du -h dist/styles/*.css | sort -h

# Find large rules
grep -r "." apps/CrossWord/src/frontend --include="*.scss" \
    | wc -l  # Count lines

# Optimize for gzip
# Smaller files = better compression
```

---

## 🚨 Common Pitfalls to Avoid

### ❌ Pitfall 1: Over-using `@extend`
```scss
/* Don't */
%button { padding: 0.5rem; }
.btn-primary { @extend %button; }
.btn-secondary { @extend %button; }
/* Results in repeated code in CSS output */

/* Do */
.button { padding: 0.5rem; }
.button--primary { /* additional styles */ }
```

### ❌ Pitfall 2: Nesting Variables
```scss
/* Don't */
.shell {
    --spacing: 1rem;
    .content {
        padding: var(--spacing);
    }
}

/* Do */
.shell {
    --spacing: 1rem;
}

.shell__content {
    padding: var(--spacing);
}
```

### ❌ Pitfall 3: Unused Color Variables
```scss
/* Don't define colors you don't use */
$primary: #007acc;
$secondary: #6c757d;
$tertiary: #ff6b6b;      /* If unused, remove */
$quaternary: #20c997;    /* If unused, remove */

/* Do: Keep only what you use */
$primary: #007acc;
$secondary: #6c757d;
```

### ❌ Pitfall 4: Duplicating Breakpoints
```scss
/* Don't */
@media (max-width: 640px) { /* rules */ }
@media (max-width: 640px) { /* more rules */ }
@media (max-width: 641px) { /* oops, different! */ }

/* Do: Use mixin */
@include respond("mobile") { /* rules */ }
@include respond("mobile") { /* more rules */ }
@include respond("mobile") { /* consistent */ }
```

---

## ⚡ Performance Best Practices

### 1. Minimize Reflows & Repaints
```scss
/* ❌ Triggers layout */
.element {
    width: 100%;
    height: 100%;
    top: 0;
    left: 0;
}

/* ✅ Use transform instead */
.element {
    width: 100%;
    height: 100%;
    transform: translate(0, 0);
}
```

### 2. Hardware Acceleration
```scss
.animated {
    /* Enable GPU acceleration */
    transform: translate3d(0, 0, 0);
    will-change: transform;
}

/* Remove will-change after animation */
.animated:not(:hover) {
    will-change: auto;
}
```

### 3. Lazy Loading Styles
```scss
/* Load only when needed */
@layer utilities {
    .utilities {
        display: none; /* Hidden by default */
    }

    &.active {
        display: block;
    }
}
```

---

## 📈 Metrics to Monitor

### Build-time Metrics
```bash
# CSS file size
du -h dist/styles.css

# Gzip size
gzip -c dist/styles.css | du -h

# Line count
wc -l dist/styles.css

# Selector count
grep -o "{" dist/styles.css | wc -l
```

### Runtime Metrics
- CSS Parse time (DevTools)
- Layout/Paint time (Performance tab)
- First Contentful Paint (FCP)
- Largest Contentful Paint (LCP)

### Target Goals
- CSS file size: < 100KB (gzipped)
- Parse time: < 200ms
- Selector count: < 5000
- Media query rules: < 20 breakpoints

---

## 🔧 Optimization Checklist

### Phase 2 Optimization Tasks

- [ ] Consolidate media queries (1 system)
- [ ] Deduplicate keyframes
- [ ] Extract shared variables
- [ ] Create mixin library
- [ ] Audit specificity (remove IDs)
- [ ] Remove unused classes
- [ ] Consolidate colors
- [ ] Audit shadows/elevations
- [ ] Review fonts/typography
- [ ] Remove vendor prefixes where not needed

### Code Quality Checks
- [ ] No `!important` flags
- [ ] No deep nesting (max 2 levels)
- [ ] No duplicated selectors
- [ ] No unused variables
- [ ] All variables named semantically
- [ ] Consistent naming conventions

### Performance Checks
- [ ] CSS file size < 100KB (gzip)
- [ ] No unused media queries
- [ ] No unused keyframes
- [ ] Transform used for animations
- [ ] will-change managed carefully
- [ ] Container queries used where appropriate

---

## 📋 Refactoring Runbook

### Step 1: Baseline
```bash
# Record current state
du -h dist/styles.css > baseline.txt
npm run build
```

### Step 2: Consolidate
```bash
# Move shared patterns to lib
# Update imports
# Test build
npm run build
```

### Step 3: Deduplicate
```bash
# Identify duplicates
grep -r "@keyframes" shells/ | sort | uniq -d

# Move to lib/_keyframes.scss
# Update imports
npm run build
```

### Step 4: Audit Specificity
```bash
# Check for IDs
grep -r "#" shells/ --include="*.scss" | wc -l

# Remove or convert to classes
npm run build
```

### Step 5: Verify
```bash
# Compare sizes
du -h dist/styles.css
git diff --stat

# Test in browser
npm run dev
```

---

## 🎓 Learning Resources

### CSS Performance
- [Google Fonts Performance](https://web.dev/performance/)
- [CSS Tricks: Performance](https://css-tricks.com/performance/)
- [MDN: CSS Performance](https://developer.mozilla.org/en-US/docs/Learn/Performance)

### SCSS Best Practices
- [SCSS Documentation](https://sass-lang.com/documentation)
- [BEM Methodology](http://getbem.com/)
- [OOCSS Principles](https://github.com/stubbornella/oocss)

---

## 💡 Quick Reference

### Common Optimizations & Impact
| Optimization | Impact | Effort |
|---|---|---|
| Consolidate media queries | 20-30% | Medium |
| Deduplicate keyframes | 40-50% | Low |
| Extract shared vars | 10-15% | Low |
| Remove dead styles | 5-10% | Medium |
| Reduce nesting | 5-8% | Low |
| Consolidate colors | 5-10% | Medium |

---

**Next: Apply these strategies during Phase 2 refactoring!** 🚀
