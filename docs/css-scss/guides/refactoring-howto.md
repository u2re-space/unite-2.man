## How-to: Refactor SCSS (Practical Checklist)

### Non-negotiables

- Use **`@use`** (not `@import`) in any touched SCSS.
- Put **`@layer system, tokens, base, shell, view, components, utilities, overrides;`** in **one** root entrypoint per bundle (e.g. a shell `index.scss`).
- Wrap rules inside the correct `@layer { ... }`.

### Refactoring steps (shell or view)

- **Step 1 — Identify the entrypoint**
  - Shell: `shells/{shell}/index.scss`
  - View: `views/{view}/{view}.scss`

- **Step 2 — Split by concern**
  - Tokens → `_tokens.scss` (`@layer tokens`)
  - Keyframes → `_keyframes.scss` (`@layer tokens`)
  - Components → `_components.scss` (`@layer components`)
  - Layout/theme → `{shell}.scss` (`@layer shell`) or `_styles.scss` (`@layer view`)

- **Step 3 — Flatten deep nesting**
  - Prefer explicit selectors over 3+ levels of nesting.

- **Step 4 — Remove duplicates safely**
  - If blocks are verbatim duplicates, keep one canonical copy.
  - Prefer a shared mixin only when it’s reused across multiple files/modules.

### Verification (minimum)

- `npm run build`
- `npm run dev` (smoke-check key screens)

### Reference implementations

- Basic shell: `apps/CrossWord/src/frontend/shells/basic/`
- Shared SCSS library: `modules/projects/fl.ui/src/styles/_lib/`

