# CWSP-reborn Pass I Journal

## 2026-07-10 13:14 +07 — P0 audit and bootstrap

- Scope: documentation, structure, governance, memory, roadmap, progress, and recovery only.
- Baseline: workspace root and `apps/CWSP-reborn` were clean before edits.
- Evidence gathered:
  - `src/` is the intended canonical CWSP-reborn source; `app/` is mostly a platform projection through symlinks.
  - `package.json` exposes only generic Vite commands while root Vite, TypeScript, Gradle, config, and platform scripts are empty or incomplete.
  - AirPad, network, and settings views contain implementation; debug and developer views are scaffolds.
  - `.cursor/rules/network.mdc` is the operational v2 contract. Product v1 documents were outlines and mixed future wire-format ideas with current behavior.
  - `runtime/cwsp/endpoint` is absent. `runtime/legacy/endpoint` exists but was not validated as a drop-in v2 runtime.
- Recovery marker: `.backups/manifests/2026-07-10T13-14-41+07-00.json`.
- Current task: write the canonical Pass-I artifacts and replace placeholder product documentation with evidence-based status.
- Next checkpoint: run documentation, JSON, link, and diff verification; then update `STATE.json`.

## Resume protocol

1. Read `.progress/CWSP-reborn/STATE.json`.
2. Read the latest entry in this journal.
3. Open the referenced roadmap and execute only `activeTask`.
4. Record commands and outcomes before changing `activeTask`.
5. Do not infer platform readiness from file presence; use the evidence gates in the roadmap.

## 2026-07-10 13:39 +07 — Review correction checkpoint

- Review found five release-blocking documentation issues: public literal
  authentication values, task-ID drift, local-only manifest ambiguity,
  Constitution/backup-policy conflict, and duplicated roadmap ownership.
- Corrected public files:
  - `AGENTS.md`
  - `.cursor/rules/debugging.mdc`
  - `.cursor/rules/endpoint.mdc`
  - `.cursor/rules/network.mdc`
  - `plans/CWSP-reborn.md`
- Recovery manifest now records root and nested repository commits, repository
  ownership per entry, hashes, and local-only durability.
- Constitution advanced to v1.1.0 and now makes `.memories` plus
  manifest/patch recovery canonical.
- Plan tasks now use stable P0.1–P0.7 IDs. Specialized roadmaps own workstream
  checklists; the master owns dependencies/status/exits.
- Prior validation evidence: JSON parsing, explicit link existence, lints, and
  both `git diff --check` runs passed before review corrections.
- Active task: P0.7, rerun the complete validation set after all corrections.

## 2026-07-10 13:50 +07 — P0.7 closed

- Result: Pass-I preparation baseline is `prepared`; no product code was changed.
- Created:
  - five CWSP-reborn roadmaps and one executable plan;
  - four analysis documents;
  - progress state/journal, operational memory, and compatibility constitution link;
  - backup policy, JSON Schema, and repository/commit-aware local manifest;
  - two scoped Cursor rules plus documentation AGENTS guidance;
  - configuration ownership documentation.
- Updated:
  - CWSP-reborn README and four primary product documents;
  - foundation and Constitution source-of-truth paths/policies;
  - canonical public plans/rules/AGENTS to remove authentication and remote-access details.
- Validation:
  - JSON parse and Draft 2020-12 manifest-schema validation: pass;
  - canonical path and local-link existence checks: pass;
  - IDE lints: no errors;
  - placeholder/freshness scan: pass for Pass-I artifacts and refreshed canonical headers;
  - public-data scan: pass for the reviewed public governance/plan/rule paths;
  - root diff check: pass with existing CRLF plan files recognized via
    `core.whitespace=cr-at-eol`;
  - nested CWSP-reborn diff check: pass;
  - working-tree scope: documentation, rules, analysis, config docs, and continuity only.
- Product validation intentionally not run: Vite/Gradle/Capacitor/WebNative
  entrypoints are documented blockers and no product behavior changed.
- Remaining P1 blockers: missing canonical endpoint path, placeholder build
  roots/backends/config loaders, broken/cyclic projections, and empty
  debug/developer entrypoints.
- Next action: review Pass I, choose the first platform contour, then create a
  read-only symlink manifest.

## 2026-07-10 16:57 +07 — Java dual-stack wave closed

- Java protocol v2: `check:java-protocol` 24/24.
- Java backend beside Node: `check:java-backend` 3/3.
- Android bridges: `check-java-android-pure` OK; Capacitor `./gradlew tasks` OK (JDK 17).
- Next: endpoint↔cwsp-shared binding + `/ws` loopback; optional typed Packet on Coordinator; APK deps.

## 2026-07-10 17:15 +07 — Node/TS/WEB/PWA protocol + backend wave

- Protocol facades filled (re-exports + WS/UUID/Timestamp); deferred crypto/QUIC/transmission stubs.
- Node Clipboardy emission/executor + optional `enableClipboard` on WebNative bootstrap.
- Web/PWA IDB/ShareTarget/LaunchQueue + airpad clipboard emission (no UI).
- Soft-bind legacy `normalizeFrame` + `ingress-normalize` + `/ws` loopback harness.
- Checks: protocol-facades 11, clipboard 5, web-backend 9, ws-loopback 4, settings 3, smoke 4/4.
- Next: driver readiness / debug relay; APK deps; Wave 6 docs closure.

## 2026-07-10 17:25 +07 — tsconfig alias + short imports

- Extended `tsconfig.json` / `src/tsconfig.json` / `app/tsconfig.json` with
  `@fest-lib/cwsp-shared`, `protocol/{node,web}/*`, `backend/{node,web}/*`.
- Vite aliases aligned; Node loader `scripts/resolve-aliases.mjs` wired into check scripts.
- Protocol/backend long `../../../modules/projects/cwsp-shared` relatives → `@fest-lib/cwsp-shared/v2/*`.
- Web backend → `protocol/web/packet/*`. Workspace includes `cwsp-shared`.
- Checks still green: protocol 11, clipboard 5, web 9, settings 3, ws 4, topology.

## 2026-07-10 17:30 +07 — Pass III consolidation / calibration

- Opened `.roadmaps/CWSP-reborn/PASS-III.md` (visible via `.roadmap` → `.roadmaps`).
- Status: consolidation / calibration; models Grok 4.5 + GLM-5.2 (Sol excluded); no Plan Mode.
- Archives: typo aliases `.acrhive` / `.acrhives` retired; canonical `.archives` only.
- Skill: `.cursor/skills/cwsp-reborn-pass/SKILL.md`.
- STATE moved to pass `III`.

## 2026-07-10 17:50 +07 — Android clipboard executor protocol path

- `executor.Clipboard` now handles clipboard:* ask/act (read/write/update/clear/isReady)
  via pluggable Driver; MemoryDriver for host-free tests; adaptEmission for OS bridge.
- `core.Coordinator` routes clipboard actions exclusively through the executor.
- `check-java-android-pure` runs MergeTest + ClipboardExecutorTest.

## 2026-07-10 18:05 +07 — start/deploy npm scripts + Neutralino plan note

- Wired `start`, `start:node`, `start:java`, `start:pm2*`, `deploy:110*`, `deploy:200:*`
  via `scripts/start-runtime.mjs`, `deploy-runtime.mjs`, `lib/runtime-env.mjs`, `ecosystem.config.cjs`.
- Defaults: desk `C:/Users/U2RE/cwsp-{node,java}`; gateway `/home/u2re-dev/cwsp-{node,java}`.
- Deploy stages for target OS (110=windows, 200=linux). Dry-run smoke OK.
- Neutralino future contour documented in PASS-III + skill §8 (no code yet).
