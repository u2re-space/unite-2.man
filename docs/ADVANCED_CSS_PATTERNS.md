# Advanced CSS/SCSS Patterns Library

## 🎯 Overview

Collection of proven patterns for common UI and layout problems, optimized for the layer-based architecture.

---

## 📦 Pattern Categories

### 1. Layout Patterns

#### Sidebar Layout
```scss
@layer shell {
    .layout-sidebar {
        display: flex;
        gap: var(--space-lg);
    }

    .layout-sidebar__sidebar {
        width: 280px;
        flex-shrink: 0;
        overflow-y: auto;
    }

    .layout-sidebar__content {
        flex: 1;
        min-width: 0;
        overflow-y: auto;
    }

    @media (max-width: 768px) {
        .layout-sidebar {
            flex-direction: column;
        }

        .layout-sidebar__sidebar {
            width: auto;
        }
    }
}
```

#### Split Pane Layout
```scss
@layer shell {
    .layout-split {
        display: grid;
        grid-template-columns: 1fr 1fr;
        gap: 1px; /* Divider */
        height: 100%;
    }

    .layout-split__pane {
        overflow: auto;
        background: var(--surface);
    }

    .layout-split__divider {
        width: 1px;
        background: var(--border);
        cursor: col-resize;
    }

    @media (max-width: 768px) {
        .layout-split {
            grid-template-columns: 1fr;
        }

        .layout-split__divider {
            display: none;
        }
    }
}
```

#### Sticky Header
```scss
@layer shell {
    .layout-sticky-header {
        display: flex;
        flex-direction: column;
        height: 100%;
    }

    .layout-sticky-header__header {
        position: sticky;
        top: 0;
        z-index: var(--z-sticky, 500);
        background: var(--surface);
        border-bottom: 1px solid var(--border);
    }

    .layout-sticky-header__content {
        flex: 1;
        overflow-y: auto;
    }
}
```

---

### 2. Text & Typography Patterns

#### Text Truncation
```scss
@layer components {
    .text-truncate {
        overflow: hidden;
        text-overflow: ellipsis;
        white-space: nowrap;
    }

    .text-truncate-line {
        display: -webkit-box;
        -webkit-line-clamp: 1;
        -webkit-box-orient: vertical;
        overflow: hidden;
    }

    .text-truncate-lines-2 {
        display: -webkit-box;
        -webkit-line-clamp: 2;
        -webkit-box-orient: vertical;
        overflow: hidden;
    }

    .text-truncate-lines-3 {
        display: -webkit-box;
        -webkit-line-clamp: 3;
        -webkit-box-orient: vertical;
        overflow: hidden;
    }
}
```

#### Readable Line Length
```scss
@layer shell {
    .text-readable {
        max-width: 65ch;
        margin-left: auto;
        margin-right: auto;
    }
}
```

#### Text Highlight Pattern
```scss
@layer components {
    .highlight {
        background: linear-gradient(
            to right,
            transparent 0%,
            var(--color-highlight, yellow) 0%,
            var(--color-highlight, yellow) 100%,
            transparent 100%
        );
        background-size: 200% 100%;
        animation: shimmer 2s infinite;
    }

    @keyframes shimmer {
        0% { background-position: 200% 0; }
        100% { background-position: -200% 0; }
    }
}
```

---

### 3. Form Patterns

#### Input Focus State
```scss
@layer components {
    input, textarea, select {
        border: 2px solid var(--border-default);
        padding: var(--space-md);
        border-radius: var(--radius-md);
        font-size: 1rem;
        transition: all 150ms ease;
    }

    input:focus-visible,
    textarea:focus-visible,
    select:focus-visible {
        outline: none;
        border-color: var(--color-primary);
        box-shadow: 0 0 0 3px var(--color-primary-focus);
    }

    input:disabled,
    textarea:disabled,
    select:disabled {
        background: var(--surface-disabled);
        color: var(--text-disabled);
        cursor: not-allowed;
    }
}
```

#### Checkbox & Radio Styling
```scss
@layer components {
    input[type="checkbox"],
    input[type="radio"] {
        accent-color: var(--color-primary);
        cursor: pointer;
        width: 1.25rem;
        height: 1.25rem;
    }

    input[type="checkbox"]:focus-visible,
    input[type="radio"]:focus-visible {
        outline: 2px solid var(--color-primary);
        outline-offset: 2px;
    }
}
```

#### Required Field Indicator
```scss
@layer components {
    label[aria-required="true"]::after {
        content: " *";
        color: var(--color-error);
        font-weight: bold;
    }
}
```

---

### 4. Button Patterns

#### Button Base
```scss
@layer components {
    .button {
        display: inline-flex;
        align-items: center;
        justify-content: center;
        gap: var(--space-sm);
        padding: var(--space-md) var(--space-lg);
        border: none;
        border-radius: var(--radius-md);
        font-weight: 500;
        cursor: pointer;
        transition: all 150ms ease;
        user-select: none;
        font-size: 1rem;
    }

    .button:focus-visible {
        outline: 2px solid var(--color-primary);
        outline-offset: 2px;
    }

    .button:disabled {
        opacity: 0.5;
        cursor: not-allowed;
    }
}
```

#### Button Variants
```scss
@layer components {
    .button--primary {
        background: var(--color-primary);
        color: white;
    }

    .button--primary:hover:not(:disabled) {
        background: var(--color-primary-dark);
        transform: translateY(-1px);
        box-shadow: var(--shadow-md);
    }

    .button--secondary {
        background: var(--surface-container);
        color: var(--text-primary);
        border: 1px solid var(--border);
    }

    .button--secondary:hover:not(:disabled) {
        background: var(--surface-container-high);
    }

    .button--ghost {
        background: transparent;
        color: var(--color-primary);
    }

    .button--ghost:hover:not(:disabled) {
        background: var(--color-primary-light);
    }
}
```

#### Button Sizes
```scss
@layer components {
    .button--small {
        padding: var(--space-sm) var(--space-md);
        font-size: 0.875rem;
    }

    .button--large {
        padding: var(--space-lg) var(--space-2xl);
        font-size: 1.125rem;
    }

    .button--block {
        width: 100%;
    }
}
```

---

### 5. Card & Container Patterns

#### Card Component
```scss
@layer components {
    .card {
        background: var(--surface);
        border: 1px solid var(--border);
        border-radius: var(--radius-lg);
        padding: var(--space-lg);
        box-shadow: var(--shadow-sm);
        transition: all 150ms ease;
    }

    .card:hover {
        box-shadow: var(--shadow-md);
        border-color: var(--border-light);
    }
}
```

#### Card Grid
```scss
@layer components {
    .card-grid {
        display: grid;
        grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
        gap: var(--space-lg);
    }

    @media (max-width: 1024px) {
        .card-grid {
            grid-template-columns: repeat(auto-fill, minmax(240px, 1fr));
        }
    }

    @media (max-width: 768px) {
        .card-grid {
            grid-template-columns: 1fr;
        }
    }
}
```

---

### 6. Navigation Patterns

#### Tab Navigation
```scss
@layer components {
    .tabs {
        display: flex;
        border-bottom: 2px solid var(--border);
        gap: var(--space-lg);
    }

    .tabs__item {
        padding: var(--space-md) 0;
        border-bottom: 2px solid transparent;
        margin-bottom: -2px;
        cursor: pointer;
        font-weight: 500;
        transition: all 150ms ease;
        color: var(--text-secondary);
    }

    .tabs__item:hover {
        color: var(--text-primary);
        border-color: var(--border-light);
    }

    .tabs__item.active {
        color: var(--color-primary);
        border-color: var(--color-primary);
    }
}
```

#### Breadcrumb Navigation
```scss
@layer components {
    .breadcrumb {
        display: flex;
        align-items: center;
        gap: var(--space-md);
        font-size: 0.875rem;
    }

    .breadcrumb__item {
        display: flex;
        align-items: center;
        gap: var(--space-sm);
    }

    .breadcrumb__item::after {
        content: "/";
        margin-left: var(--space-md);
        color: var(--text-tertiary);
    }

    .breadcrumb__item:last-child::after {
        display: none;
    }

    .breadcrumb__link {
        color: var(--color-primary);
        text-decoration: none;
    }

    .breadcrumb__link:hover {
        text-decoration: underline;
    }
}
```

---

### 7. Modal & Overlay Patterns

#### Modal Overlay
```scss
@layer components {
    .modal-overlay {
        position: fixed;
        inset: 0;
        background: rgba(0, 0, 0, 0.5);
        display: flex;
        align-items: center;
        justify-content: center;
        z-index: var(--z-modal, 2000);
        opacity: 1;
        visibility: visible;
        transition: all 150ms ease;
    }

    .modal-overlay[data-hidden] {
        opacity: 0;
        visibility: hidden;
        pointer-events: none;
    }
}
```

#### Modal Dialog
```scss
@layer components {
    .modal {
        background: var(--surface);
        border-radius: var(--radius-lg);
        box-shadow: var(--shadow-lg);
        max-width: 90vw;
        max-height: 90vh;
        overflow: auto;
        padding: var(--space-2xl);
    }

    .modal__header {
        margin-bottom: var(--space-lg);
        font-size: 1.5rem;
        font-weight: 600;
    }

    .modal__content {
        margin-bottom: var(--space-lg);
    }

    .modal__footer {
        display: flex;
        justify-content: flex-end;
        gap: var(--space-md);
        margin-top: var(--space-lg);
    }
}
```

---

### 8. Notification & Alert Patterns

#### Alert Component
```scss
@layer components {
    .alert {
        display: flex;
        align-items: flex-start;
        gap: var(--space-md);
        padding: var(--space-md) var(--space-lg);
        border-radius: var(--radius-md);
        border-left: 4px solid;
    }

    .alert--info {
        background: var(--color-info-light);
        border-color: var(--color-info);
        color: var(--color-info-dark);
    }

    .alert--success {
        background: var(--color-success-light);
        border-color: var(--color-success);
        color: var(--color-success-dark);
    }

    .alert--warning {
        background: var(--color-warning-light);
        border-color: var(--color-warning);
        color: var(--color-warning-dark);
    }

    .alert--error {
        background: var(--color-error-light);
        border-color: var(--color-error);
        color: var(--color-error-dark);
    }
}
```

#### Toast Notification
```scss
@layer components {
    .toast {
        position: fixed;
        bottom: 1.5rem;
        right: 1.5rem;
        background: var(--surface);
        border: 1px solid var(--border);
        border-radius: var(--radius-md);
        padding: var(--space-md) var(--space-lg);
        box-shadow: var(--shadow-lg);
        z-index: var(--z-tooltip, 3000);
        animation: slideInUp 200ms ease-out;
    }

    @keyframes slideInUp {
        from {
            transform: translateY(100%);
            opacity: 0;
        }
        to {
            transform: translateY(0);
            opacity: 1;
        }
    }
}
```

---

### 9. Loading & Skeleton Patterns

#### Loading Spinner
```scss
@layer components {
    .spinner {
        display: inline-block;
        width: 1.5rem;
        height: 1.5rem;
        border: 2px solid var(--border);
        border-top-color: var(--color-primary);
        border-radius: 50%;
        animation: spin 1s linear infinite;
    }

    @keyframes spin {
        to { transform: rotate(360deg); }
    }
}
```

#### Skeleton Loader
```scss
@layer components {
    .skeleton {
        background: linear-gradient(
            90deg,
            var(--surface) 25%,
            var(--surface-container) 50%,
            var(--surface) 75%
        );
        background-size: 200% 100%;
        animation: loading 1.5s infinite;
    }

    @keyframes loading {
        0% { background-position: 200% 0; }
        100% { background-position: -200% 0; }
    }
}
```

---

### 10. Accessibility Patterns

#### Focus Visible Ring
```scss
@layer components {
    :focus-visible {
        outline: 2px solid var(--color-primary);
        outline-offset: 2px;
    }

    .no-outline:focus-visible {
        outline: none;
    }
}
```

#### Skip Navigation Link
```scss
@layer components {
    .skip-to-main {
        position: absolute;
        top: -9999px;
        left: -9999px;
        z-index: 999;
    }

    .skip-to-main:focus {
        top: 0;
        left: 0;
        background: var(--color-primary);
        color: white;
        padding: var(--space-md) var(--space-lg);
        text-decoration: none;
    }
}
```

#### Reduced Motion Support
```scss
@media (prefers-reduced-motion: reduce) {
    * {
        animation-duration: 0.01ms !important;
        animation-iteration-count: 1 !important;
        transition-duration: 0.01ms !important;
    }
}
```

---

### 11. Utility Patterns

#### Flexbox Utilities
```scss
@layer utilities {
    .flex { display: flex; }
    .flex-col { flex-direction: column; }
    .flex-center { @include flex-center; }
    .flex-between { justify-content: space-between; }
    .flex-around { justify-content: space-around; }
    .flex-gap-sm { gap: var(--space-sm); }
    .flex-gap-md { gap: var(--space-md); }
    .flex-gap-lg { gap: var(--space-lg); }
}
```

#### Grid Utilities
```scss
@layer utilities {
    .grid { display: grid; }
    .grid-2 { grid-template-columns: repeat(2, 1fr); }
    .grid-3 { grid-template-columns: repeat(3, 1fr); }
    .grid-auto { grid-template-columns: repeat(auto-fill, minmax(200px, 1fr)); }
    .grid-gap-md { gap: var(--space-md); }
    .grid-gap-lg { gap: var(--space-lg); }
}
```

#### Spacing Utilities
```scss
@layer utilities {
    .p-xs { padding: var(--space-xs); }
    .p-sm { padding: var(--space-sm); }
    .p-md { padding: var(--space-md); }
    .p-lg { padding: var(--space-lg); }
    .m-xs { margin: var(--space-xs); }
    .m-sm { margin: var(--space-sm); }
    .m-md { margin: var(--space-md); }
    .m-lg { margin: var(--space-lg); }
}
```

---

## 📚 Pattern Usage Guidelines

### When to Use Each Pattern

| Pattern | Use Case | Layer |
|---------|----------|-------|
| Sidebar Layout | Multi-column apps | shell |
| Split Pane | Comparison views | shell |
| Card Grid | Collections | components |
| Tabs | Navigation | components |
| Modal | Important dialogs | components |
| Toast | Temporary notifications | components |
| Alert | Inline messages | components |
| Spinner | Loading state | components |
| Skeleton | Placeholder | components |

### Extension Points

Each pattern includes:
- ✅ CSS custom properties for theming
- ✅ Media query responsive variants
- ✅ Accessibility considerations
- ✅ Reusable modifier classes
- ✅ Animation/transition support

---

## 💡 Pro Tips

1. **Combine Patterns**: Mix layout + card patterns for flexibility
2. **Customize via Variables**: Override tokens in shell-specific `_tokens.scss`
3. **Use Modifiers**: Add `--variant` classes for variations
4. **Keep DRY**: Extract common patterns to shared lib
5. **Test Accessibility**: Keyboard navigation, screen readers

---

**Use these patterns as foundation for your UI!** 🎨
