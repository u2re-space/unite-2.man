# AGENTS.md

## Cursor Cloud specific instructions

### Project overview

Unite-2 is a frontend-only monorepo containing shared `fest/*` libraries and multiple web apps (`apps/*`). The primary application scoped for development is **CrossWord** (`apps/CrossWord`), a PWA/Chrome extension markdown viewer/editor.

### Node version

This project requires **Node.js >= 24**. Use `nvm use 24` before any command. The default nvm alias is already set to 24.

### Package manager

npm workspaces. Root `npm install` hoists all workspace deps. No lockfile is committed; the first install generates one. A `postinstall` script patches Rollup WASM bindings automatically.

### Git submodules

All library code and apps live in git submodules. They must be initialized before anything works:

```
git submodule update --init --recursive
```

### CrossWord dev server

The CrossWord app at `apps/CrossWord` runs via Vite (`npx vite dev`). Key setup caveats:

1. **HTTPS certificate**: The shared vite config imports `../private/https/certificate.mjs`. This file is not tracked in git. Create it by generating a self-signed cert:

   ```
   mkdir -p apps/CrossWord/private/https
   openssl req -x509 -newkey rsa:2048 -nodes \
     -keyout apps/CrossWord/private/https/key.pem \
     -out apps/CrossWord/private/https/cert.pem \
     -days 365 -subj '/CN=localhost'
   ```

   Then create `apps/CrossWord/private/https/certificate.mjs`:

   ```js
   import { readFileSync } from "node:fs";
   import { resolve, dirname } from "node:path";
   import { fileURLToPath } from "node:url";
   const __dirname = dirname(fileURLToPath(import.meta.url));
   export default {
       key: readFileSync(resolve(__dirname, "key.pem")),
       cert: readFileSync(resolve(__dirname, "cert.pem")),
   };
   ```

2. **Fest library symlinks**: `apps/CrossWord/shared/fest/` needs symlinks pointing to `modules/projects/*/src`. Create them:

   ```
   mkdir -p apps/CrossWord/shared/fest
   cd apps/CrossWord/shared/fest
   ln -sf ../../../../modules/projects/core.ts/src core
   ln -sf ../../../../modules/projects/dom.ts/src dom
   ln -sf ../../../../modules/projects/fl.ui/src fl-ui
   ln -sf ../../../../modules/projects/icon.ts/src icon
   ln -sf ../../../../modules/projects/lur.e/src lure
   ln -sf ../../../../modules/projects/object.ts/src object
   ln -sf ../../../../modules/projects/uniform.ts/src uniform
   ln -sf ../../../../modules/projects/veela.css/src veela
   ```

   Also copy polyfill files: `cp -r modules/shared/fest/polyfill apps/CrossWord/shared/fest/polyfill`

3. **Font registry stub**: `modules/projects/veela.css/src/ts/font-registry.ts` may not exist. If missing, create a stub exporting an empty object to prevent import errors.

4. **Port binding**: The Vite config defaults to port 443. Either use `--port 5173` or grant Node low-port capability via `sudo setcap 'cap_net_bind_service=+ep' $(which node)`.

### Lint & type checks

- **Stylelint**: `npx stylelint "src/**/*.scss" "src/**/*.css" --allow-empty-input` (from `apps/CrossWord`)
- **TypeScript**: `npx tsc --noEmit --project tsconfig.json` (from `apps/CrossWord`)
- **ESLint**: The root `eslint.config.js` has pre-existing rule-name issues in flat-config format (e.g. `braceStyle` not found). ESLint will error on these until they are fixed upstream.

### Build

- PWA build: `npm run build:pwa` (from `apps/CrossWord`)
- CRX build: `npm run build:crx` (from `apps/CrossWord`)
