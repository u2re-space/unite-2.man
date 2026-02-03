## CSS/SCSS Refactoring Documentation (Canonical)

This folder is the **single source of truth** for the CSS/SCSS refactor docs.
Root-level `.md` files are considered **legacy snapshots** and may contain duplicated content.

### Start here (recommended reading order)

- **Architecture (layers, scoping, file layout)**: `docs/css-scss/architecture/layers-and-structure.md`
- **How-to (refactoring shells/views, @use, @layer)**: `docs/css-scss/guides/refactoring-howto.md`
- **Phase 2 plan (what to do next, in what order)**: `docs/css-scss/plans/phase-2.md`
- **Reports (what was already changed)**: `docs/css-scss/reports/README.md`

### Legacy entrypoints (do not maintain)

These are kept for history but should be treated as read-only:

- `MASTER_DOCUMENTATION_INDEX.md`
- `README_DOCUMENTATION_INDEX.md`
- `DOCUMENTATION_INDEX.md`
- `DOCUMENTATION_INDEX_COMPLETE.md`

### Where the real code lives

- **Veela.CSS**: `modules/projects/veela.css/`
- **FL.UI shared styles lib**: `modules/projects/fl.ui/src/styles/_lib/`
- **CrossWord frontend styles**: `apps/CrossWord/src/frontend/`

### Legacy mapping

If you land on an older root-level doc, use:

- `docs/css-scss/legacy-map.md`

