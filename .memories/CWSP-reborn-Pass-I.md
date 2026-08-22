# CWSP-reborn Pass I Preparation Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: use
> `superpowers:subagent-driven-development` or `superpowers:executing-plans`
> when executing later product-code phases. Steps use checkbox syntax for
> interruption-safe tracking.

**Goal:** establish an evidence-based, recoverable planning baseline for
CWSP-reborn without implementing product behavior.

**Architecture:** root-level governance, roadmap, memory, progress, and backup
artifacts are canonical; `apps/CWSP-reborn/docs` is the human product
documentation; `apps/CWSP-reborn/.analysis` records the observed snapshot.
Symlink mirrors remain navigation aliases.

**Tech stack:** Markdown, JSON, Cursor `.mdc` rules, Git, existing Vite/TypeScript
and platform scaffolds.

---

## Scope guard

This plan may create documentation and continuity structure and may correct
documentation-only links. It must not fill Java, TypeScript, Gradle, Vite,
WebNative, Capacitor, protocol, driver, or view product stubs.

## File map

### Create

- `plans/INDEX.md` — canonical planning entrypoint.
- `plans/CWSP-reborn-Pass-I.md` — this execution plan.
- `.roadmaps/CWSP-reborn/*.md` — master and specialized future roadmaps.
- `.progress/CWSP-reborn/STATE.json` — machine resume state.
- `.progress/CWSP-reborn/JOURNAL.md` — append-only human handoff.
- `.backups/README.md` — recovery policy.
- `.backups/manifest.schema.json` — manifest validation contract.
- `.backups/manifests/<timestamp>.json` — pre-edit baseline.
- `apps/CWSP-reborn/.backups/README.md` — project-local pointer to canonical recovery.
- `.memories/CWSP-reborn-Pass-I.md` — concise operational memory.
- `.memories/constitution.md` — lowercase compatibility link to `Constitution.md`.
- `apps/CWSP-reborn/.analysis/*.md` — observed architecture and risk snapshot.
- `apps/CWSP-reborn/docs/AGENTS.md` — documentation-scoped guidance.
- `apps/CWSP-reborn/docs/platforns/README.md` — compatibility note for the legacy typo alias.
- `apps/CWSP-reborn/config/README.md` — configuration ownership scaffold.
- `.cursor/rules/cwsp-reborn-pass-i.mdc` — project-specific readiness rules.
- `.cursor/rules/continuity-artifacts.mdc` — memory/progress/backup protocol.

### Modify

- `.cursor/rules/foundation.mdc` — fix source-of-truth paths.
- `.cursor/rules/debugging.mdc` — remove public literal authentication values.
- `.cursor/rules/endpoint.mdc` — remove public literal authentication values.
- `.cursor/rules/network.mdc` — remove public literal authentication values.
- `.memories/Constitution.md` — align memory and backup governance.
- `AGENTS.md` — remove public literal authentication values.
- `plans/Calibration.md` — record Pass-I review freshness.
- `plans/Commands.md` — replace public authentication literals with config placeholders.
- `plans/CWSP-reborn.md` — move private values behind the private-data boundary.
- `apps/CWSP-reborn/README.md` — replace placeholder with navigation and status.
- `apps/CWSP-reborn/docs/Protocol.md` — v2-first current contract.
- `apps/CWSP-reborn/docs/Drivers.md` — observed capability taxonomy.
- `apps/CWSP-reborn/docs/Extensions.md` — bounded extension contract.
- `apps/CWSP-reborn/docs/Specification.md` — product architecture baseline.

## Task P0.1 — Establish a recoverable baseline

**Files:**

- Create: `.backups/manifests/2026-07-10T13-14-41+07-00.json`
- Create: `.progress/CWSP-reborn/STATE.json`
- Create: `.progress/CWSP-reborn/JOURNAL.md`

- [x] **Step 1: Confirm clean baselines**

Run:

```bash
git status --short --untracked-files=all
git -C apps/CWSP-reborn status --short --untracked-files=all
```

Expected: no output before Pass-I edits.

- [x] **Step 2: Record hashes of every existing file to be modified**

Run `sha256sum` on every existing file listed in the manifest before its first edit.

Expected: one 64-character lowercase digest per path.

- [x] **Step 3: Create state and journal before substantive edits**

Expected: `STATE.json` points to the roadmap, plan, memory, and backup manifest.

## Task P0.2 — Publish the architecture snapshot

**Files:**

- Create: `apps/CWSP-reborn/.analysis/architecture.md`
- Create: `apps/CWSP-reborn/.analysis/views-and-design.md`
- Create: `apps/CWSP-reborn/.analysis/protocol-and-drivers.md`
- Create: `apps/CWSP-reborn/.analysis/gaps-and-risks.md`

- [x] **Step 1: Separate observed state from proposals**

Record source roots, projections, build inputs, view entrypoints, runtime
dependencies, and broken/missing areas. Every proposal must appear under a
future-work heading.

- [x] **Step 2: Record platform readiness with evidence levels**

Capacitor, Windows WebNative, and Linux WebNative remain E0/E1 until focused
build evidence exists.

- [x] **Step 3: Record responsive design guidance**

Document current mobile shell behavior and a proposed desktop/wide composition.
Do not present the desktop proposal as implemented.

## Task P0.3 — Create executable roadmaps

**Files:**

- Create: `.roadmaps/CWSP-reborn/PASS-I.md`
- Create: `.roadmaps/CWSP-reborn/PLATFORM-PARITY.md`
- Create: `.roadmaps/CWSP-reborn/VIEWS.md`
- Create: `.roadmaps/CWSP-reborn/PROTOCOL-DRIVERS.md`
- Create: `.roadmaps/CWSP-reborn/GOVERNANCE-CONTINUITY.md`

- [x] **Step 1: Define phase dependencies**

Order: governance → link integrity → build entrypoints → protocol → parity →
platform packaging → route verification → readiness decision.

- [x] **Step 2: Define objective exit gates**

Use E0–E4 evidence levels. Never mark a target ready because its scaffold exists.

- [x] **Step 3: Link specialized roadmaps from the master**

Expected: every future workstream has one owner document and no duplicate task
definition in another roadmap.

## Task P0.4 — Replace product documentation placeholders

**Files:**

- Modify: `apps/CWSP-reborn/docs/Protocol.md`
- Modify: `apps/CWSP-reborn/docs/Drivers.md`
- Modify: `apps/CWSP-reborn/docs/Extensions.md`
- Modify: `apps/CWSP-reborn/docs/Specification.md`
- Modify: `apps/CWSP-reborn/README.md`

- [x] **Step 1: Make v2 the current protocol**

Keep stable action names and the canonical envelope. Put v1 encryption,
alignment, CRC16, alternate encoding, QUIC, and UDP concepts in a future
versioning section.

- [x] **Step 2: Document only observed drivers**

Distinguish implemented shared frontend adapters, legacy endpoint availability,
and empty CWSP-reborn platform stubs.

- [x] **Step 3: Add navigation and status**

README must link to analysis, product docs, plan, roadmap, progress, and recovery.

## Task P0.5 — Align governance and agent behavior

**Files:**

- Modify: `.cursor/rules/foundation.mdc`
- Create: `.cursor/rules/cwsp-reborn-pass-i.mdc`
- Create: `.cursor/rules/continuity-artifacts.mdc`
- Create: `apps/CWSP-reborn/docs/AGENTS.md`
- Create: `.memories/CWSP-reborn-Pass-I.md`

- [x] **Step 1: Correct case-sensitive and missing references**

Use `.memories/Constitution.md`, `plans/Calibration.md`, and `plans/INDEX.md`.

- [x] **Step 2: Enforce evidence-based readiness**

Rules must forbid readiness claims without the matching E2–E4 evidence.

- [x] **Step 3: Define resume and backup protocol**

The active task lives in `STATE.json`; the journal is append-only; manifests
contain metadata rather than copied source trees.

## Task P0.6 — Add configuration documentation scaffold

**Files:**

- Create: `apps/CWSP-reborn/config/README.md`

- [x] **Step 1: Define ownership layers**

Separate defaults, persisted user settings, native backend settings, endpoint
policy, environment overrides, and secrets.

- [x] **Step 2: Preserve routing concepts**

Endpoint URL, direct URL, AirPad target, and destination ID remain distinct.

- [x] **Step 3: Avoid runtime defaults**

This pass documents schema ownership only; it does not create an authoritative
runtime config that unimplemented backends might accidentally consume.

## Task P0.7 — Verify and close Pass I

**Files:**

- Update: `.progress/CWSP-reborn/STATE.json`
- Append: `.progress/CWSP-reborn/JOURNAL.md`

- [x] **Step 1: Validate JSON**

Run:

```bash
python -m json.tool .progress/CWSP-reborn/STATE.json
python -m json.tool .backups/manifest.schema.json
python -m json.tool .backups/manifests/2026-07-10T13-14-41+07-00.json
```

Expected: each command exits 0 and prints parsed JSON.

- [x] **Step 2: Scan new docs for unresolved placeholders and private values**

Run targeted `rg` checks over the created Pass-I paths. Existing historical
files are reported separately and are not silently rewritten.

- [x] **Step 3: Check links and diffs**

Run:

```bash
git -c core.whitespace=cr-at-eol diff --check
git -C apps/CWSP-reborn diff --check
git status --short --untracked-files=all
git -C apps/CWSP-reborn status --short --untracked-files=all
```

Expected: diff checks exit 0; the root command preserves existing CRLF plan
files without treating carriage returns as trailing whitespace; status lists
only documented Pass-I changes.

- [x] **Step 4: Close progress**

Set `status` to `prepared`, clear `activeTask`, set the last completed task, and
record remaining P1 blockers. A commit is created only if the user explicitly
requests one.
