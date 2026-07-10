# CWSP-reborn Pass I Operational Memory

- **Observed:** 2026-07-10
- **Freshness:** current for the Pass-I documentation baseline
- **Supersedes:** no earlier dedicated CWSP-reborn Pass-I memory
- **Resume:** `.progress/CWSP-reborn/STATE.json`

## Decisions

1. `.cursor/rules/network.mdc` remains the current CWSP v2 semantic contract.
2. The older v1 packet/crypto ideas are future research, not current behavior.
3. `src/` is the intended CWSP-reborn canonical source and `app/` is a platform
   projection, but links must be verified individually.
4. Android Capacitor and Windows/Linux WebNative share frontend contracts while
   native implementations and capabilities remain platform-specific.
5. Platform readiness uses E0–E4 evidence levels; scaffold presence is only E0.
6. Pass I creates documentation and continuity artifacts only.
7. Backups are manifest/patch based; full source-tree copies and private data are excluded.

## Observed state

- CWSP-reborn root scripts expose only generic Vite commands.
- Root Vite, TypeScript, Gradle, config, and platform scripts are placeholder or empty.
- Shared AirPad, network, and settings views contain implementation.
- Debug and developer view entrypoints are empty; developer metadata also
  identifies the package as debug-view.
- AirPad's new `input` and `network` projections are incomplete while working
  code remains in legacy-named folders.
- `runtime/cwsp/endpoint` is absent.
- `runtime/legacy/endpoint` exists but was not validated as the canonical v2 runtime.
- Several WebNative/Neutralino/CRX links are broken, cyclic, or target the wrong tree.

## Canonical navigation

- Plan: `plans/CWSP-reborn-Pass-I.md`
- Roadmap: `.roadmaps/CWSP-reborn/PASS-I.md`
- Analysis: `apps/CWSP-reborn/.analysis/`
- Product docs: `apps/CWSP-reborn/docs/`
- Progress: `.progress/CWSP-reborn/`
- Recovery: `.backups/`

## Next safe action

Complete and verify the documentation baseline. After review, start P1 with a
read-only symlink manifest and select one build contour. Do not fill platform
stubs or delete legacy AirPad code during the same task.

## Known risks

- Large alias fan-out can make one physical file appear under many paths.
- Historical plans contain duplicated and partly aspirational protocol material.
- Platform shell presence can be mistaken for build readiness.
- Changing symlink topology before entrypoint tests exist can remove the only
  working implementation path.
