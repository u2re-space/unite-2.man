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
| Canonical endpoint | `runtime/cwsp/endpoint` (symlink → legacy adapters) |
| Legacy endpoint | `runtime/legacy/endpoint` |
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
- `runtime/cwsp/endpoint` is the canonical path; do not invent a second tree.

## 7. Open blockers

- APK: Capacitor Android dep + assets copy
- Full PM2/TLS boot on `:8434`
- Driver readiness + debug relay
- Desk WebNative packaged shell vs `build/webnative`
- Robot/AHK/AutoKey stubs
- Gradle requires JDK 17 (`JAVA_HOME`)

## 8. Parallelization

- Agents own **disjoint file sets** only.
- Shared boundaries merge in dependency order (shared → protocol → backend → views → platform).
- Do **not** edit `apps/CWSP-reborn/docs` or `.analysis` unless that ownership is assigned.

## 9. Resume protocol

1. Read `.progress/CWSP-reborn/STATE.json`.
2. Read latest `JOURNAL.md` entry.
3. Open active pass ledger (`.roadmaps/CWSP-reborn/PASS-III.md`).
4. Execute only `activeTask`; record outcomes before switching.
5. Prefer Pass II/III evidence over fresh discovery.

## 10. Private data

- Never quote secrets from `private/connectivity.md`.
- Public docs may link the path only.
