## Phase 2 Plan (Canonical)

### Goals

- Refactor remaining shells (`faint`, `raw`) to match the established pattern.
- Refactor key views (start with `viewer`, `editor`, `explorer`).
- Consolidate duplicates (keyframes, repeated selectors, repeated token blocks).
- Keep the layer contract stable and predictable.

### Week 1 (highest ROI)

- **Shell: `faint`**
  - Extract `_keyframes.scss`, `_tokens.scss`, `_components.scss`, `{shell}.scss`, `index.scss`
- **Shell: `raw`**
  - Minimal: ensure `@use` + correct layer wrapping + consistent entrypoint
- **Deduplicate keyframes**
  - Prefer canonical definitions (avoid multiple `@keyframes spin` copies)

### Week 2–3

- **Views**
  - Apply view structure pattern and scope tokens with `:root:has(.view-*)`.
- **Shared patterns**
  - Promote truly shared patterns into `modules/projects/fl.ui/src/styles/_lib/` (only if reused).

### FL.UI note

FL.UI style refactoring should remain consistent with Veela layer ordering and should not introduce cross-level import violations.

