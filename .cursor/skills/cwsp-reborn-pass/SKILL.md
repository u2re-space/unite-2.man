---
name: cwsp-reborn-pass
description: >-
  CWSP-reborn Pass II/III operating skill. Use when continuing CWSP-reborn work,
  calibrating docs/progress, running check scripts, or avoiding expensive re-audits.
  Encodes SoT paths, green verification commands, alias rules, and open blockers.
---

# CWSP-reborn Pass Operating Skill

## 1. Models / mode

- Use **Grok 4.5** + **GLM-5.2** only.
- **No Sol** (GPT-5.6-Sol excluded).
- **No Plan Mode** unless the user explicitly asks.

## 2. Source-of-truth map

| Area | Path |
|---|---|
| Shared v2 contract | `modules/projects/cwsp-shared` |
| Protocol facades | `apps/CWSP-reborn/src/protocol/{node,web,java}` |
| Backend | `apps/CWSP-reborn/src/backend/{node,web,java}` |
| Canonical endpoint | `apps/CWSP-reborn/runtime/endpoint` |
| Compat endpoint paths | `runtime/cwsp/endpoint`, `runtime/legacy/endpoint` (symlinks) |
| Ingress adapters | `apps/CWSP-reborn/runtime/adapters` |
| Progress | `.progress/CWSP-reborn/STATE.json` + `JOURNAL.md` |
| Roadmaps | `.roadmaps/CWSP-reborn/` (`.roadmap` → `.roadmaps`) |
| Archive | `.archives/CWSP-reborn/` |

## 3. Import aliases

- `@fest-lib/cwsp-shared` → `modules/projects/cwsp-shared`
- `protocol/{node,web}/*` → `src/protocol/{node,web}/*`
- `backend/{node,web}/*` → `src/backend/{node,web}/*`
- Node checks: `--import ./scripts/resolve-aliases.mjs`
- Vite/tsconfig aliases must stay aligned with the loader.

## 4. Archives

- Canonical: **`.archives`**
- Retired typos: `.acrhive` / `.acrhives` (do not recreate)

## 5. npm check matrix (cwd: `apps/CWSP-reborn`)

| Command | Green (Pass II) |
|---|---|
| `npm run check:topology` | 4/4 |
| `npm run check:protocol-facades` | 11/11 |
| `npm run check:settings-backend` | 3/3 |
| `npm run check:clipboard-backend` | 5/5 |
| `npm run check:web-backend` | 9/9 |
| `npm run check:ws-loopback` | 4/4 |
| `npm run check:java-backend` | 3/3 |
| `npm run check:java-protocol` | 24/24 |
| `npm run check:types` | as needed |
| cwsp-shared package tests | 29 |
| Android `./gradlew tasks` | JDK 17 only |
| `check-java-android-pure` | merge OK |

**Do not re-audit green checks unless related code changed.**

## 6. Hardlink / symlink gotchas

- `.roadmap` → `.roadmaps` (edit once).
- `apps/CWSP-reborn/.cursor` → `../../.cursor` (skills live once).
- Protocol/backend may be hardlinked across mirrors — edit one inode.
- `app/` is mostly platform projection via symlinks to `src/`; prefer `src/`.
- `developer-view` is a real package (no longer symlink-to-`debug-view`).
- Endpoint SoT is `apps/CWSP-reborn/runtime/endpoint`; `runtime/cwsp/*` are compat symlinks only.

## 7. Start / deploy (cwd: `apps/CWSP-reborn`)

| Script | Behavior |
|---|---|
| `npm run start` / `start:node` | Foreground Node backend |
| `npm run start:java` | `javac` + foreground Java main |
| `npm run start:pm2` | PM2 both (`cwsp-reborn-node` + `cwsp-reborn-java`) |
| `npm run start:pm2:node` / `start:pm2:java` | PM2 single runtime |
| `npm run deploy:110` | Both runtimes → desk `C:/U2RE/cwsp-{node,java}` |
| `npm run deploy:110:node` / `deploy:110:java` | Desk only |
| `npm run deploy:110:neutralino` | Desk Neutralino → `C:/U2RE/cwsp-neutralino` |
| `npm run deploy:200:node` / `deploy:200:java` | Gateway `/home/u2re-dev/cwsp-{node,java}` |
| `npm run deploy:200:neutralino` | Gateway `/home/u2re-dev/cwsp-neutralino` |

Implementations: `scripts/start-runtime.mjs`, `scripts/deploy-runtime.mjs`, `scripts/lib/runtime-env.mjs`, `scripts/build-neutralino.mjs`, `ecosystem.config.cjs`.

- Deploy stages for **target OS** (110=windows, 200=linux), not the build host.
- Override hosts/dirs via `CWSP_DEPLOY_{110,200}_{HOST,USER,DIR_NODE,DIR_JAVA,DIR_NEUTRALINO}`.
- Prefer `--dry-run` before first live sync.
- Neutralino: deploys exe + `resources.neu` + `extensions/` + `backend/node/`; auto-builds if package missing (`--rebuild` forces).

## 8. Neutralino desktop shell

Alternate desktop shell beside WebNative: [NeutralinoJS](https://github.com/neutralinojs/neutralinojs) + [neutralino-ext-node](https://github.com/hschneider/neutralino-ext-node) ([docs](https://neutralino.js.org/)). Capacitor stays Android.

- Build: `npm run build:neutralino:windows` (or `:linux`)
- Backend-only refresh: `npm run build:neutralino:backend`
- Deploy desk: `npm run deploy:110:neutralino`
- Ledger: `.roadmaps/CWSP-reborn/PASS-III.md` § Future.

## 9. Open blockers

- Driver readiness + debug relay
- Desk WebNative packaged shell vs `build/webnative`
- Robot/AHK/AutoKey stubs
- Phone ADB E2 proven on `.196`; `.208`/`.210` ADB not yet open

**Resolved (2026-07-10):** TLS `:8434` PM2 boot + native `/ws`; Capacitor APK + phone `.196` `/ws` E2.

## 10. Parallelization

- Agents own **disjoint file sets** only.
- Shared boundaries merge in dependency order (shared → protocol → backend → views → platform).
- Do **not** edit `apps/CWSP-reborn/docs` or `.analysis` unless that ownership is assigned.

## 11. Resume protocol

1. Read `.progress/CWSP-reborn/STATE.json`.
2. Read latest `JOURNAL.md` entry.
3. Open active pass ledger (`.roadmaps/CWSP-reborn/PASS-III.md`).
4. Execute only `activeTask`; record outcomes before switching.
5. Prefer Pass II/III evidence over fresh discovery.

## 12. Private data

- Never quote secrets from `private/connectivity.md`.
- Public docs may link the path only.
