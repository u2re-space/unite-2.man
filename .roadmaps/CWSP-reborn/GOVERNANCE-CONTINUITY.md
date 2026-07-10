# CWSP-reborn Governance and Continuity Roadmap

- **Parent:** `PASS-I.md`
- **Status:** prepared; P0 complete

## Canonical artifacts

| Concern | Canonical path |
|---|---|
| Governance | `.memories/Constitution.md` |
| Planning index | `plans/INDEX.md` |
| Product concept | `plans/CWSP-reborn.md` |
| Pass-I execution plan | `plans/CWSP-reborn-Pass-I.md` |
| Current network semantics | `.cursor/rules/network.mdc` |
| Product documentation | `apps/CWSP-reborn/docs/` |
| Analysis snapshot | `apps/CWSP-reborn/.analysis/` |
| Roadmaps | `.roadmaps/CWSP-reborn/` |
| Resume state | `.progress/CWSP-reborn/STATE.json` |
| Operational memory | `.memories/CWSP-reborn-Pass-I.md` |
| Recovery manifests | `.backups/manifests/` |

Aliases are navigation aids and must not become independent writable copies.

## P0 — Correct governance references (complete)

- [x] Use the actual `Constitution.md` case on case-sensitive filesystems.
- [x] Add a lowercase compatibility symlink for tools that require it.
- [x] Point calibration references to `plans/Calibration.md`.
- [x] Point architecture references to `plans/INDEX.md` and CWSP-reborn analysis.
- [x] Keep private connectivity data under `private/` only.

## P1 — Reduce mirror ambiguity

- [x] Record `tasks`, `.cursor/plans`, `.cursor/context`, `.memory`, and
  `.specify/memory` as aliases in the planning index.
- [x] Stop creating new physical documents under alias paths.
- [x] Mark legacy `spec`, `docs`, and `specification` aliases before consolidation.
- [x] Avoid changing symlink topology in the same task as product behavior.

## P2 — Interruption-safe work

Every significant pass uses:

1. one roadmap task ID;
2. one `STATE.json` active task;
3. an append-only journal entry;
4. one pre-edit recovery manifest;
5. exact validation evidence;
6. a final state transition.

An interrupted agent resumes the active task; it does not restart broad discovery.

## P3 — Backup discipline

- [x] Validate manifests against `.backups/manifest.schema.json`.
- [ ] Add patches only for existing-file changes that cannot rely on Git alone.
- [ ] Store link snapshots as metadata, not copied source trees.
- [x] Exclude generated, vendor, cache, log, and private data.
- [x] Document recovery commands per task; never automate a destructive bulk restore.

## P4 — Memory freshness

Operational memory entries include:

- observed date;
- evidence paths;
- decisions;
- known blockers;
- next safe action;
- superseded-by pointer when stale.

Memory never claims runtime readiness without dated validation evidence.

## Exit criteria

- A new agent can locate the canonical artifact for every concern.
- Linux case-sensitive paths resolve.
- Alias paths do not contain divergent copies.
- Current task and recovery baseline are machine-readable.
- Public docs contain no credentials or private access values.
