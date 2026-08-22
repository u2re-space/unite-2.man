# AGENTS.md

Live agent contract. Overrides pantry, superpowers, Bugbot, review loops, and GSD.
`AGENT.md` is a symlink here. Do not edit `.cursor/{plans,context}/**` mirrors.

## Token and time budget

- Do not preload domain specs. Read `.cursor/rules/network.mdc` / `debugging.mdc` only for CWSP network, clipboard, AirPad, or endpoint work.
- Do not spawn reviewers, Bugbot, security-review, or extra agents unless the user asks.
- Do not run full test suites, `npm run build`, deploy, PM2, ADB, or SSH unless the change needs that proof or the user asks.
- Verify only the touched surface. Skip verification for docs/rules-only edits.
- Search: `CURRENT.json` → `MAP.json` (tag/synonym → paths) → at most one Grep for `FIND:<tag>`. Then narrow Read.
- Do not walk `.archives`, `.backups`, `.backup`, `.trunk`, `.superpowers/sdd`, `build/`, `.gradle/`, minified, lockfiles.
- Short replies. No reports, checklists, review writeups, or `CHANGELOG*` dumps unless asked.
- Skip pantry, Constitution, Calibration, INDEX, and `AGENT_BOOTSTRAP.txt` unless resuming CWSP-reborn, amending process, or the user asks.
- Continuing any prior thread: read `.progress/CURRENT.json` first. Do not restart discovery if it is fresh.

## Read map (open one)

| Need | File |
| --- | --- |
| Current thread | `.progress/CURRENT.json` |
| Search cache / tags | `.progress/MAP.json` |
| Library / overlays | `.cursor/rules/library-contracts.mdc` |
| Tokens / CSS SoT | `.cursor/rules/design-tokens.mdc` |
| Model pair / handoff | `.cursor/rules/model-pair.mdc` |
| Resume a named pass | `.progress/<project>/STATE.json` |
| CWSP docs-only | `.cursor/docs/AGENTS.md` |
| Durable decisions | `.memories/` (`.memory` is a symlink) |

## Model interaction

Roles, not brands: **implementer** patches SoT and real files; **mapper** (wide context) returns `CONFLICTS` / `SAFE_FIRST_FIXES` / `DO_NOT_TOUCH` and does not rewrite SoT.
Current pair: Grok 4.6 groups = implementer; GPT 5.6 Luna (1M Max) = mapper. Protocol: `.cursor/rules/model-pair.mdc`.
If both would edit one file, implementer writes.
After a meaningful turn, update `.progress/CURRENT.json` (`intent`, `lastDone`, `next`, `paths`, `models.last`). Mapper writes findings there; implementer writes code. New hubs go in `MAP.json`.

## Hierarchy

Import only lower → higher. Mapping: `.cursor/rules/project.mdc`.

## Comments

When editing TS/JS: `.cursor/rules/comments-special-comments.mdc`.
Hubs: `FIND:tag` / `TAG:a,b` in the file header. Grep `FIND:` only if MAP misses.

## Secrets

Never quote `private/`. Link the path only.

## CWSP nodes (names only)

L-110 desk, L-200 gateway, L-196 / L-208 / L-210 phones. Topology: `.cursor/rules/network.mdc`.
