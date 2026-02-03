## Architecture: Layers + File Structure

### Canonical layer order

Use one ordering everywhere:

```scss
@layer system, tokens, base, shell, view, components, utilities, overrides;
```

### Responsibilities

- **system**: resets/normalize
- **tokens**: custom properties, keyframes, `@property`
- **base**: typography defaults, base element styles
- **shell**: shell layout + theming wrappers
- **view**: view-specific layout + overrides
- **components**: reusable UI parts
- **utilities**: atomic helpers
- **overrides**: last-resort patches

### Shell structure (pattern)

Directory (example):

```
apps/CrossWord/src/frontend/shells/{shell}/
├── _keyframes.scss      @layer tokens
├── _tokens.scss         @layer tokens
├── _components.scss     @layer components
├── {shell}.scss         @layer shell
└── index.scss           declares @layer order + @use imports
```

### View structure (pattern)

Directory (example):

```
apps/CrossWord/src/frontend/views/{view}/
├── _tokens.scss         @layer tokens
├── _styles.scss         @layer view
└── {view}.scss          @use imports (no new @layer order here)
```

### Token scoping rules

- **Shell tokens**: scope via `.shell-{id} { --vars... }`
- **View tokens**: scope via `:root:has(.view-{id}) { --vars... }`
- Avoid global `:root` unless the token is truly global.

### Selector strategy

- Prefer **low specificity** selectors (classes, `:where()`).
- Avoid specificity fights; prefer layers + scoping over `!important`.

