# CWSP Projects Family

Ownership and build surface for the CWSP app family. Artifact names for VDS (`cw-markdown`, `cwsp-control`) stay stable; legacy entrypoints are symlinks:

- `apps/CrossWord` → `CWSP-document`
- `apps/CWSP-reborn` → `CWSP-transfer`

## Ownership matrix

| App | Role | Owns CRX? | Owns PWA / host SPA? | Deploy / VDS |
|---|---|---|---|---|
| **CWSP-shell** | Web-desktop / speed-dial shell | No | Yes (`dev` / `build` PWA) | Optional local PWA |
| **CWSP-document** | Markdown / viewer / workcenter (ex-CrossWord) | No | Yes + `build:cw-markdown` → `runtime/fastify/apps/cw-markdown` | VDS via `build:vds-apps` |
| **CWSP-crx** | Chrome extension only | **Yes** (`src/crx`, `build:crx*`, `dist/`) | No | Load unpacked `apps/CWSP-crx/dist` |
| **CWSP-transfer** | Clipboard / file transfer + control (ex-CWSP-reborn) | No | `build:cwsp-control:web` → `cwsp-control` | `deploy:110` / `deploy:200`; VDS via `build:vds-apps` |
| **CWSP-explorer** | Explorer view module (`modules/views/explorer-view`) | No | Lean Vite view (not a full host app yet) | Mount under explorer host later |
| **CWSP-shared** | Library extras for other CWSP apps | No | No (package exports only) | Import from apps |
| **CWSP-direct** | Planned remote/KVM/AirPad toolset | — | — | Planned |

Do **not** conflate `apps/CWSP-shared` with `modules/projects/cwsp-shared` (protocol/helpers SoT for Cap/Neu).

## Intended host map (DNS / nginx cutover out of scope this pass)

| Host / path | App |
|---|---|
| `md.` + `/markdown` | **CWSP-document** (`cw-markdown` artifact) |
| `explorer.` + `/explorer` | **CWSP-explorer** (view module for now) |
| `cwsp.` (name TBD) | **CWSP-transfer** / control surface |

## Commands

```bash
# Shell PWA
cd apps/CWSP-shell && npm run dev
cd apps/CWSP-shell && npm run build

# Document PWA + VDS markdown SPA
cd apps/CWSP-document && npm run dev
cd apps/CWSP-document && npm run build
cd apps/CWSP-document && npm run build:cw-markdown
# same via symlink:
cd apps/CrossWord && npm run build:cw-markdown

# Chrome extension (sole CRX owner) → apps/CWSP-crx/dist
cd apps/CWSP-crx && npm run build:crx
# Chrome: Load unpacked → select apps/CWSP-crx/dist

# Transfer / desk deploy
cd apps/CWSP-transfer && npm run build:cwsp-control:web
cd apps/CWSP-transfer && npm run deploy:110   # or deploy:200

# VDS: document + transfer legs (uses CrossWord / CWSP-reborn symlinks)
cd runtime && npm run build:vds-apps
# deploy when ready:
# cd runtime && npm run deploy:vds
```

## Notes

- CRX vite/scripts were removed from shell, document, and shared so `npm run build` / `dev` no longer require `src/crx/manifest.json`.
- VDS still resolves builds through `apps/CrossWord` and `apps/CWSP-reborn` for compatibility; logs name the real packages (CWSP-document / CWSP-transfer).
