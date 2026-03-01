# Контекст проекта

> NOTE: This file partially mirrors the repo root rules in `.cursor/rules/project.mdc`.
> Prefer editing the root copy and then syncing here if needed.

## О проекте

**Название:** U2RE.space
**Цель:** Разработка собственных Web/PWA/CRX приложений, а также fastify runtime

## Соглашения

- Git: Conventional Commits (feat/fix/refactor/docs/test/chore)
- Логирование: structured logging, zerolog
- Используемые инструменты: pm2, vite, npm, tsx, npx, nvm, pwsh, bash
- SSH по `U2RE@192.168.0.110` (Windows)
- SSH по `u2re-dev@192.168.0.200` (Linux)
- Расположение основного проекта (`192.168.0.200`):
  - `/home/u2re-dev/U2RE.space`
  - `/home/u2re-dev/copy-to-vds.sh`
- Расположение данных в Windows (`192.168.0.110`):
  - `C:\Users\U2RE\`
  - `C:\Users\U2RE\endpoint-portable\`
  - `C:\Users\U2RE\.pm2\`

## Архитектура

```
U2RE.space/
├── .cursor/
├── .vscode/
├── apps/
|   └── CrossWord/
|       ├── fastify/
|       ├── src/
|       |   ├── endpoint/
|       |   ├── frontend/
|       |   ├── pwa/
|       |   ├── crx/
|       |   ├── core/
|       |   ├── com/
|       |   └── index.ts
|       ├── shared/
|       |   ├── tsconfig.json
|       |   ├── vite.config.js
|       |   └── package.json
|       ├── tsconfig.json
|       ├── vite.config.js
|       └── package.json
├── modules/
|   ├── shared/
|   └── projects/
|       ├── shared/
|       ├── core.ts/
|       |   ├── docs/
|       |   ├── src/
|       |   ├── test/
|       |   ├── tsconfig.json
|       |   ├── vite.config.js
|       |   └── package.json
|       ├── dom.ts/
|       |   ├── docs/
|       |   ├── src/
|       |   ├── test/
|       |   ├── tsconfig.json
|       |   ├── vite.config.js
|       |   └── package.json
|       ├── fl.ui/
|       |   ├── docs/
|       |   ├── src/
|       |   ├── test/
|       |   ├── tsconfig.json
|       |   ├── vite.config.js
|       |   └── package.json
|       ├── icon.ts/
|       |   ├── docs/
|       |   ├── src/
|       |   ├── test/
|       |   ├── tsconfig.json
|       |   ├── vite.config.js
|       |   └── package.json
|       ├── lur.e/
|       |   ├── docs/
|       |   ├── src/
|       |   ├── test/
|       |   ├── tsconfig.json
|       |   ├── vite.config.js
|       |   └── package.json
|       ├── object.ts/
|       |   ├── docs/
|       |   ├── src/
|       |   ├── test/
|       |   ├── tsconfig.json
|       |   ├── vite.config.js
|       |   └── package.json
|       ├── uniform.ts/
|       |   ├── docs/
|       |   ├── src/
|       |   ├── test/
|       |   ├── tsconfig.json
|       |   ├── vite.config.js
|       |   └── package.json
|       └── veela.css/
|           ├── docs/
|           ├── src/
|           ├── test/
|           ├── tsconfig.json
|           ├── vite.config.js
|           └── package.json
├── runtime/
|   ├── https/
|   ├── fastify/
|   |   ├── scripts/
|   |   ├── tsconfig.json
|   |   └── package.json
|   ├── frontend/
|   |   ├── apps/
|   |   ├── init.mjs
|   |   ├── load.mjs
|   |   ├── vital.mjs
|   |   └── index.html
|   ├── https/
|   ├── tsconfig.json
|   ├── vite.config.js
|   └── package.json
├── tsconfig.json
├── vite.config.js
└── package.json
```

# Our projects (for following)

- <https://github.com/u2re-space/crossword>
- <https://github.com/u2re-space/unite-2.man>
- <https://github.com/fest-live/>

---

## Supported Features

Currently, only Chromium-based browsers most suitable.

- <https://chromestatus.com/>
- <https://developer.chrome.com/>
- <https://caniuse.com/>

---

## 🌳 Project Hierarchy

### ⛰️ Level 0 (project root)

- `./` - Project root directory
- `modules/` - Modules directory
- `modules/projects` - Submodules and our libraries
- `modules/shared/` - Shared modules, utilities, etc.
- `runtime/` - Application running backend runtimes
- `externals/` - Dist external and our libraries.
- `assets/` - Project assets, images, fonts, etc.

### 🚧 Level 0.5 (root core libraries)

- `modules/projects/core.ts` - JS/TS utils and helpers library

### 🚧 Level 1 (core libraries)

- `modules/projects/dom.ts` - DOM utils and helpers library
- `modules/projects/object.ts` - Core reactivity library
- `modules/projects/veela.css` - CSS framework

### 🧱 Level 2 (derived libraries)

- `modules/projects/lur.e` - Reactive DOM framework
- `modules/projects/icon.ts` - Icon library (web component)

### 🏗️ Level 3 (UI libraries)

- `modules/projects/fl.ui` - UI system and components library

### 🏬 Level 4 (applications)

- `apps/*` - Applications projects

---

## 🧩 Import rules

- ✅ Allowed imports from lower level to higher level only.
- ⚠️ Normally, imports between in same level or not approved.
- ⛔ Imports in lower level from next level is not allowed.

### 🧪 Examples

- ✅ `fest/lure` can import `fest/object` or `fest/dom`, but not vice versa.
- ⚠️ `fest/object` and `fest/dom`, or something in same level, isn't allowed to import vice versa...
- ⛔ `fest/object`, `fest/dom` isn't allowed to import `fest/lure` or `fest/fl-ui`.

---

## Common Imports

- `fest/core` - Core TS/JS utilities and helpers library
- `fest/dom` - DOM utils and helpers library
- `fest/lure` - reactive DOM framework
- `fest/object` - Core reactivity library
- `fest/fl-ui` - UI system and components library
- `fest/veela` - CSS framework
- `fest/icon` - Icon library (web component)

---

## Project Directory Mapping

By default, use key-name as import root.

| Library | Path |
|---|---|
| `fest/core`   | `modules/projects/core.ts`    |
| `fest/lure`   | `modules/projects/lur.e`      |
| `fest/dom`    | `modules/projects/dom.ts`     |
| `fest/object` | `modules/projects/object.ts`  |
| `fest/fl-ui`  | `modules/projects/fl.ui`      |
| `fest/veela`  | `modules/projects/veela.css`  |
| `fest/icon`   | `modules/projects/icon.ts`    |
