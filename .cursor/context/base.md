# Project Context

> NOTE: This file partially mirrors the root repository rules in `.cursor/rules/project.mdc`.
> Prefer editing the root copy first, then sync this file if needed.

## Project Overview

**Name:** U2RE.space

**Purpose:** Development of custom Web / PWA / CRX applications and a Fastify-based runtime.

## General Conventions

- **Git:** use Conventional Commits:
  - `feat`
  - `fix`
  - `refactor`
  - `docs`
  - `test`
  - `chore`
- **Logging:** use structured logging, preferably with `zerolog`.
- **Common tools:**
  - `pm2`
  - `vite`
  - `npm`
  - `tsx`
  - `npx`
  - `nvm`
  - `pwsh`
  - `bash`
- **Security / portability:**
  - SSH hosts and machine-specific absolute paths must be documented outside the repository.
  - Do not hardcode local machine paths into project files.

---

## Repository Architecture

```text
U2RE.space/
├── .cursor/
├── .vscode/
├── apps/
│   └── CrossWord/
│       ├── fastify/
│       ├── src/
│       │   ├── endpoint/
│       │   ├── frontend/
│       │   ├── pwa/
│       │   ├── crx/
│       │   ├── core/
│       │   ├── com/
│       │   └── index.ts
│       ├── shared/
│       │   ├── tsconfig.json
│       │   ├── vite.config.js
│       │   └── package.json
│       ├── tsconfig.json
│       ├── vite.config.js
│       └── package.json
├── modules/
│   ├── shared/
│   └── projects/
│       ├── shared/
│       ├── core.ts/
│       │   ├── docs/
│       │   ├── src/
│       │   ├── test/
│       │   ├── tsconfig.json
│       │   ├── vite.config.js
│       │   └── package.json
│       ├── dom.ts/
│       │   ├── docs/
│       │   ├── src/
│       │   ├── test/
│       │   ├── tsconfig.json
│       │   ├── vite.config.js
│       │   └── package.json
│       ├── fl.ui/
│       │   ├── docs/
│       │   ├── src/
│       │   ├── test/
│       │   ├── tsconfig.json
│       │   ├── vite.config.js
│       │   └── package.json
│       ├── icon.ts/
│       │   ├── docs/
│       │   ├── src/
│       │   ├── test/
│       │   ├── tsconfig.json
│       │   ├── vite.config.js
│       │   └── package.json
│       ├── lur.e/
│       │   ├── docs/
│       │   ├── src/
│       │   ├── test/
│       │   ├── tsconfig.json
│       │   ├── vite.config.js
│       │   └── package.json
│       ├── object.ts/
│       │   ├── docs/
│       │   ├── src/
│       │   ├── test/
│       │   ├── tsconfig.json
│       │   ├── vite.config.js
│       │   └── package.json
│       ├── uniform.ts/
│       │   ├── docs/
│       │   ├── src/
│       │   ├── test/
│       │   ├── tsconfig.json
│       │   ├── vite.config.js
│       │   └── package.json
│       └── veela.css/
│           ├── docs/
│           ├── src/
│           ├── test/
│           ├── tsconfig.json
│           ├── vite.config.js
│           └── package.json
├── runtime/
│   ├── https/
│   ├── fastify/
│   │   ├── scripts/
│   │   ├── tsconfig.json
│   │   └── package.json
│   ├── frontend/
│   │   ├── apps/
│   │   ├── init.mjs
│   │   ├── load.mjs
│   │   ├── vital.mjs
│   │   └── index.html
│   ├── tsconfig.json
│   ├── vite.config.js
│   └── package.json
├── tsconfig.json
├── vite.config.js
└── package.json
```

---

## Related Projects

When relevant, follow conventions and architecture from these projects:

- <https://github.com/u2re-space/crossword>
- <https://github.com/u2re-space/unite-2.man>
- <https://github.com/fest-live/>

---

## Browser Support

Primary target: Chromium-based browsers.

Useful references:

- <https://chromestatus.com/>
- <https://developer.chrome.com/>
- <https://caniuse.com/>

---

# Project Hierarchy

The repository is organized by dependency levels.

Higher-level packages may depend on lower-level packages.

Lower-level packages must not depend on higher-level packages.

---

## Level 0 — Project Root

- `./` — project root directory
- `modules/` — modules directory
- `modules/projects/` — submodules and internal libraries
- `modules/shared/` — shared modules and utilities
- `runtime/` — backend/runtime layer for applications
- `externals/` — external builds and internal distributed libraries
- `assets/` — project assets, images, fonts, etc.

---

## Level 0.5 — Root Core Libraries

- `modules/projects/core.ts` — core JS/TS utilities and helpers

---

## Level 1 — Core Libraries

- `modules/projects/dom.ts` — DOM utilities and helpers
- `modules/projects/object.ts` — core reactivity library
- `modules/projects/veela.css` — CSS framework

---

## Level 2 — Derived Libraries

- `modules/projects/lur.e` — reactive DOM framework
- `modules/projects/icon.ts` — icon library implemented as Web Components

---

## Level 3 — UI Libraries

- `modules/projects/fl.ui` — UI system and component library

---

## Level 4 — Applications

- `apps/*` — application projects

---

# Import Rules

## Main Rule

Dependencies must flow from higher-level packages to lower-level packages.

In other words:

- Applications may import UI libraries, derived libraries, and core libraries.
- UI libraries may import derived and core libraries.
- Derived libraries may import core libraries.
- Core libraries must not import derived, UI, or application code.

---

## Allowed Imports

A higher-level package may import a lower-level package.

Examples:

```ts
// Allowed:
// Level 2 imports Level 1
import { something } from "fest/object";
import { domHelper } from "fest/dom";
```

Example:

- `fest/lure` may import:
  - `fest/object`
  - `fest/dom`
  - `fest/core`

---

## Restricted Imports

Imports between packages on the same level are normally not allowed unless explicitly approved.

Examples:

- `fest/object` and `fest/dom` are both Level 1.
- They should not import each other unless there is a documented architectural reason.

---

## Forbidden Imports

A lower-level package must not import a higher-level package.

Examples:

```ts
// Forbidden:
// Level 1 must not import Level 2 or Level 3
import { something } from "fest/lure";
import { Button } from "fest/fl-ui";
```

Examples:

- `fest/object` must not import:
  - `fest/lure`
  - `fest/icon`
  - `fest/fl-ui`
- `fest/dom` must not import:
  - `fest/lure`
  - `fest/icon`
  - `fest/fl-ui`

---

# Common Import Aliases

Use these aliases as the default import roots.

| Alias | Description |
|---|---|
| `fest/core` | Core TS/JS utilities and helpers |
| `fest/dom` | DOM utilities and helpers |
| `fest/lure` | Reactive DOM framework |
| `fest/object` | Core reactivity library |
| `fest/fl-ui` | UI system and components |
| `fest/veela` | CSS framework |
| `fest/icon` | Icon library / Web Components |

---

# Project Directory Mapping

By default, use the key name as the import root.

| Library | Path |
|---|---|
| `fest/core` | `modules/projects/core.ts` |
| `fest/lure` | `modules/projects/lur.e` |
| `fest/dom` | `modules/projects/dom.ts` |
| `fest/object` | `modules/projects/object.ts` |
| `fest/fl-ui` | `modules/projects/fl.ui` |
| `fest/veela` | `modules/projects/veela.css` |
| `fest/icon` | `modules/projects/icon.ts` |

---

# AI Assistant Guidelines

When working with this repository:

1. Respect the project hierarchy and import rules.
2. Prefer existing aliases such as `fest/core`, `fest/dom`, `fest/object`, etc.
3. Do not introduce dependencies from lower-level packages to higher-level packages.
4. Avoid same-level imports unless the project already has an established pattern for that case.
5. Use TypeScript-compatible solutions by default.
6. Prefer Vite-compatible frontend code.
7. Prefer Fastify-compatible backend/runtime code.
8. Follow Conventional Commits for commit messages.
9. Use structured logging where logging is required.
10. Do not hardcode machine-specific absolute paths, SSH hosts, credentials, or secrets.
11. Target Chromium-based browsers unless explicitly asked otherwise.
12. Keep shared logic in the appropriate lower-level package instead of duplicating it in applications.
13. If unsure where code belongs:
    - generic JS/TS helpers → `fest/core`
    - DOM helpers → `fest/dom`
    - reactivity primitives → `fest/object`
    - reactive DOM framework logic → `fest/lure`
    - reusable UI components → `fest/fl-ui`
    - application-specific code → `apps/*`
