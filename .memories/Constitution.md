# U2RE Projects Constitution

- **Дата создания или обновления:** 22.08.2026
- **Рассмотрены или прочтены:** 22.08.2026
- **Изменены (автоматически):** 22.08.2026

> **SPECIAL NOTES (FOR AGENTS), AI-RECOMMENDATIONS:**
>
> ```
> - Reasoning         : match the task; do not default to XHigh
> - Context           : spend little; do not fill the window
> - Preferred-LLM     : cheapest model that can do the task
> - NeedsToWriteDocs  : False unless the user asked
> - NeedsToAnalyze    : only the touched surface
> - NeedsToCache      : False
> - NeedsToMemory     : only durable decisions; skip pantry by default
> - MaximumStepTime   : 1Min
> - MaximumAttempts   : 5
> ```

`.specify/memory` points to `.memories`, so this file is both the Spec Kit
constitution and the agent memory constitution.

## Agent Operating Summary

- Do not preload this constitution, Calibration, INDEX, pantry, or network/debug specs.
- Continuing work: read `.progress/CURRENT.json` first (small). Do not restart discovery if it is fresh.
- Search: `.progress/MAP.json` then at most one `FIND:<tag>` Grep. Skip archives/backups/trunk.
- Do not spawn reviewers or run full tests/builds unless the user asks or the change requires that proof.
- Protect private data: keep credentials under `private/`; never quote them.
- Preserve import hierarchy and CWSP envelope semantics when those files are in play.
- Verify proportionally. Docs/rules-only changes need no runtime suite.

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

Validation must match risk. Docs/rules-only changes need no runtime suite.
Runtime/CWSP/AirPad/Android/clipboard changes get the narrowest check for the
touched surface — not a full matrix, and not extra review agents, unless asked.

## Project Constraints

- Preserve the project hierarchy and import direction documented in
  `.cursor/rules/project.mdc`.
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

1. Inspect only the files this task can change.
2. Patch the smallest correction.
3. Run the narrowest verification that can prove the result — or skip if docs/rules-only.
4. Do not write reports, checklists, or review packages unless asked.
5. Record durable decisions in `.memories/` only when they are not obvious from the code.
6. Keep the live workspace thread in `.progress/CURRENT.json` so a later model resumes the same intent.

## Governance

This constitution is the Spec Kit authority for requirements and planning. Cursor
rules may add operational detail, but should not contradict this file. Amendments
must update `.memories/Constitution.md` when the agent operating contract changes.

**Version**: 1.3.1 | **Ratified**: 2026-06-24 | **Last Amended**: 2026-08-22

Cross-model continuity (1.3.0): `.progress/CURRENT.json` is the live thread.
Search cache (1.3.1): `.progress/MAP.json` — tag/synonym → paths; `FIND:tag` in hubs.
`feat/cwsp-launcher` had no newer AI/LLM contracts than `main` on 2026-08-22.

---

## Миграция на новую модель памяти

`.memories` является канонической репозиторной памятью решений и
неочевидных сведений. Внешние session-note системы могут использоваться как
дополнительный кеш, но важные решения должны быть перенесены в `.memories` с
датой наблюдения, evidence-путями, статусом актуальности и следующим безопасным действием.

---

## Важное также обновить все `AGENT.md` или `AGENTS.md`

Необходима актуализация и оптимизация под новые реалии и текущие задачи... также теперь следует делать отметки актуальности сведений/данных.

---

## После рассмотрения

- Приватные значения вынесены из публичной стратегии в `private/`.
- `.memories` используется как краткая операционная память агентов.
- `.specify` используется как официальный слой требований, конституции и планирования.
- Исправить все связи символических ссылок, нормализовать их (свести к исходным, а не цепочками), изменить этот же самый файл (`Work-tree.md`). Удалить или исправить символические связи, которые ведут в никуда. А также всё актуализировать!

---

## Дальнейшие правила обращения с файловой системой

Важно по возможности следовать строго по текущей файловой структуре CWSP или данного проекта (особенно где `src`, `app`, `src`, `protocol`, `node`, `java`, `web`, `database` и прочие). И желательно выполнить по возможности всё (всю задачу/задание) в один prompt/команду (перед этим подготовив ROADMAP файлы в специально отведённый `.roadmaps/*`)... также нежелательно удалять или добовлять файлы исходного кода проектов. Можно в основном исправление или добавление символических ссылок в тех местах, где это действительно может быть необходимо. Частично распространяется и на другие части проектов, за пределами CWSP (например, нельзя удалять файлы без весомой необходимости, допустимы например rename или перенос, также допустимы исправления, добавления, переносы или удаления symbolic ссылок). Некоторые исключения для добавления (перемещение, или renaming) по nesting (или удаления в крайних случаях) модулей допускаются для (CWSP):

- `app/**/*`
- `src/**/*`
- `scripts/*` (предпочитать уже имеющееся базу)
Также разрешается (в случаях необходимости) создания/генерации файлов для построения, отладки и тестирования проектов/приложений/решений.

---

## Системы backup'ов

Перед значимыми изменениями создаётся manifest в `.backups/manifests/` с
репозиторием, baseline commit, scope и SHA-256 прежних файлов. Для восстановления
предпочитаются Git-объекты и reviewable patches. Полные копии source tree,
generated/vendor/cache/log данные и private values в `.backups` запрещены.
Игнорируемый `.backups` является только локальным recovery-слоем; долговременная
история хранится в проверенных commit'ах или отдельном явно управляемом backup.

---

## Примерное время супер-генерации и задачи для ИИ (агентов)

**Это самое главное и важное!**

- Я лично предполагаю от 30 минут, до возможно даже целого часа, может и два... и это (при этом) главный, единственный и основной целый промпт, даже с учётом всех оптимизаций, а также проработки и доработок (но исключая возможные откаты или прерывания процесса или процессов).
- Нужно также быть готовым к тому, что исполнение задачи (генерации) может даже оборваться, и поэтому важно сохранять по любой возможности прогресс, а не начинать всё снова/заново.
- Также желательно обзавестись директорией/путём `.progress/*` (и который может иметь и свои коррективы).

---

## Shared Symbolic Linked Modules Patterns

That/such import/export pattern for shared modules is useful for avoid dublications by importing modules from differed symbolic links paths.

```ts
// For avoid symbolic link and cross-module imports issues

// Symbol for the shared registry
const SharedLink = Symbol.for("SharedLink@CWSP"); // Or any other `SharedLink@<Namespace>` pattern
(globalThis as any)[SharedLink] ??= (globalThis as any)[SharedLink] ?? {};
const SharedRegistry: Record<symbol, any> = (globalThis as any)?.[SharedLink] ?? {};

export default SharedRegistry;
export function registerShared<T>(key: symbol, value: T) {
    SharedRegistry[key] ??= value;
    return SharedRegistry[key];
}

export const exportShared = <T>(key: symbol, value: T) => {
    return registerShared(key, value);
}

export const importShared = <T>(key: symbol) => {
    return SharedRegistry?.[key];
}
```

---

## Важное примечание - роли ИИ, агентов и моделей

Roles, not brands. Live pair: `AGENTS.md` + `.cursor/rules/model-pair.mdc`.
Thread: `.progress/CURRENT.json` (then `.progress/<project>/STATE.json` if named).

| Role | Default (2026-08-22) | Writes |
| --- | --- | --- |
| Implementer | Grok 4.6 groups | SoT and real files |
| Mapper | GPT 5.6 Luna (1M Max) | `CONFLICTS` / `SAFE_FIRST_FIXES` / `DO_NOT_TOUCH` in CURRENT only |

The user may name GLM / Claude / others. If two models would edit one file, implementer writes.

Brand lists below are historical suitables, not the live contract.

**Архитектура и фундамент (основа):**

- GPT-5.6 Luna (1M Max) as mapper
- Grok 4.6 as implementer when the scan is already in CURRENT

**Дизайн и UI/UX:**

- Grok 4.6 (implementer) after mapper scan
- GPT-5.6 Luna / Terra when the user names them
- Sonnet / GLM when the user names them

**Имплементация и реализация основного кода:**

- Grok 4.6 (implementer)
- GLM-5.2 when the user names it

**Поправки, коррекции, тестирование:**

- Grok 4.6
- GLM-5.2 / Sonnet when the user names them

**Code Review / Documentation:**

- Only when the user asks. Mapper findings go to CURRENT, not a review file.
