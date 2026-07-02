# U2RE.space Constitution

> **SPECIAL NOTES (FOR AGENTS), AI-RECOMMENDATIONS:**
>
> ```
> - Reasoning         : XHight
> - Context           : 1M
> - Preferred-LLM     : GPT-5.6 (or GPT-5.5 if first still no exists), GLM-5.2 (if available), Claude-Opus-4.8 (if available)
> - Speciality-Level  : Senior or beyond
> - Knowledge-Database: N >= 2026
> - Speciality-Area   : Frontend, Backend, UI/UX-Design
> - NeedsToWriteDocs  : True
> - NeedsToAnalyze:   : True
> - NeedsToCache      : True
> - NeedsToMemory     : True
> - NeedsToRecognize  : True
> - NeedsToOCR        : True
> - MaximumStepTime   : 1Min
> - MaximumAttempts   : 5
> - MaximumMemPageSize: 1Mb
> ```

`.specify/memory` points to `.memories`, so this file is both the Spec Kit
constitution and the agent memory constitution.

## Agent Operating Summary

- Read facts first: inspect relevant files, rules, and current architecture.
- Spend context carefully: search first, read narrow ranges, avoid generated and
  vendor output.
- Protect private data: keep credential values under `private/` and do not quote
  them in public docs or final responses.
- Preserve contracts: import hierarchy, CWSP envelope semantics, stable action
  names, and destination routing concepts.
- Verify proportionally before claiming completion.

## Core Principles

### I. Fact-First Work

Every plan or implementation must start from the current repository state. Agents
must inspect the relevant files, rules, contracts, and recent operational notes
before changing behavior. For CWSP/AirPad/clipboard work, the canonical contracts
are `.cursor/rules/network.mdc` and `.cursor/rules/debugging.mdc`.

### II. Small, Targeted Changes

Changes must be local, reviewable, and aligned with existing architecture. Prefer
one canonical implementation over parallel variants. Avoid broad refactors unless
they directly support the accepted requirement.

### III. Token And Time Economy

Agents must minimize context load and runtime cost. Read narrow ranges, search
before opening large files, avoid generated/vendor/build output, and keep normal
connectivity or smoke probes within about 30 seconds unless the user explicitly
asks for a longer validation.

### IV. Security Boundary

Secrets, passwords, tokens, local credential notes, and machine-specific private
access details must not be stored in public plans, rules, specs, memory files, or
final responses. Local private details belong under `private/`, which must remain
ignored by Git and agent indexing.

### V. Operational Verification

Validation must match risk. Documentation/rule changes require targeted text and
secret-leak checks. Runtime, network, CWSP, AirPad, Android, or clipboard changes
require focused compatibility checks and diagnostics appropriate to the touched
surface.

## Project Constraints

- Preserve the project hierarchy and import direction documented in `AGENTS.md`
  and `.cursor/context/base.md`.
- Preserve CWSP v2 packet semantics, stable action names, and route diagnostics
  unless a migration is explicitly accepted.
- Do not conflate Endpoint URL, direct target URL, AirPad target URL, and
  destination client ID.
- Keep `.vscode` and workspace MCP settings low-noise; do not re-enable broad
  watchers, submodule detection, auto-fetch, or reconnecting MCP endpoints without
  explicit reason.
- Chromium-based browsers are the primary browser target unless a task states
  otherwise.

## Development Workflow

1. Audit the relevant implementation, documents, and current rules.
2. Identify actual architecture and data flow before editing.
3. Make the smallest correction that satisfies the requirement.
4. Run the narrowest verification that can prove the result.
5. Document meaningful decisions in the appropriate rule, plan, memory, or pantry
   note.
6. Report changed files, validation performed, and unresolved risks.

## Governance

This constitution is the Spec Kit authority for requirements and planning. Cursor
rules may add operational detail, but should not contradict this file. Amendments
must update `.memories/constitution.md` when the agent operating contract changes.

**Version**: 1.0.0 | **Ratified**: 2026-06-24 | **Last Amended**: 2026-06-24

---

## Миграция на новую модель памяти

Тут теперь важный вопрос и задача... Нужно перейти с Pantry на `.memories` модель. Сделать не только миграцию, перенос данных оттуда, но ещё и проделать анализ (скан) проекта (исходного кода), для актуализации всех данных. Также теперь следует делать отметки актуальности сведений/данных.

---

## Важное также обновить все `AGENT.md` или `AGENTS.md`!

Необходима актуализация и оптимизация под новые реалии и текущие задачи... также теперь следует делать отметки актуальности сведений/данных.
