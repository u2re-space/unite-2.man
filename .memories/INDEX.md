# U2RE Planning Index

- **Updated:** 2026-07-10
- **Purpose:** identify canonical planning artifacts and prevent edits through mirrors

## Source-of-truth order

1. Current user request.
2. `.memories/Constitution.md`.
3. `plans/Calibration.md`.
4. Domain rules under `.cursor/rules/`.
5. Product plan and analysis listed below.
6. Progress and recovery evidence.

## CWSP-reborn

- Product concept and historical requirements: `plans/CWSP-reborn.md`
- Pass-I execution plan: `plans/CWSP-reborn-Pass-I.md`
- Master roadmap: `.roadmaps/CWSP-reborn/PASS-I.md`
- Architecture snapshot: `apps/CWSP-reborn/.analysis/architecture.md`
- Product specification: `apps/CWSP-reborn/docs/Specification.md`
- Network semantics: `.cursor/rules/network.mdc`
- Resume state: `.progress/CWSP-reborn/STATE.json`
- Operational memory: `.memories/CWSP-reborn-Pass-I.md`

## Workspace plans

- `plans/Calibration.md` — project contours, priorities, operating strategy.
- `plans/Work-tree.md` — historical work-tree and symlink map; verify before use.
- `plans/Commands.md` — operational command reference.
- `plans/Outdated.md` — legacy context; not a current source of truth.

## Alias map

The following paths are navigation aliases, not independent planning roots:

- `tasks` → `plans`
- `.cursor/plans` → `plans`
- `.cursor/context` → `.cursor/plans`
- `.memory` → `.memories`
- `.specify/memory` → `.memories`
- `plans/docs`, `plans/spec`, and `plans/specification` → CWSP-reborn product docs
- `.memories/docs` and `.memories/spec` → CWSP-reborn product docs
- `apps/CWSP-reborn/plans` → root `plans`
- `apps/CWSP-reborn/.roadmaps` → root `.roadmaps`
- `apps/CWSP-reborn/.progress` → root `.progress`

Create and edit canonical files through the paths listed in the preceding
sections. Do not create a divergent copy through an alias.

## Status vocabulary

- `observed` — confirmed from repository state.
- `planned` — accepted future work with no readiness claim.
- `in_progress` — active task recorded in progress state.
- `verified` — dated command or device evidence exists.
- `blocked` — a concrete missing dependency or decision prevents progress.
- `superseded` — another named artifact replaces this one.

## Security boundary

Public plans may name roles and logical nodes but must not contain passwords,
tokens, keys, private access notes, or clipboard/device payloads. Those values
belong only under `private/`.
