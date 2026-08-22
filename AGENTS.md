# AGENTS.md

This file overrides skills (pantry, superpowers, Bugbot, review loops, GSD).

## Token and time budget

- Do not preload domain specs. Read `.cursor/rules/network.mdc` / `debugging.mdc` only for CWSP network, clipboard, AirPad, or endpoint work.
- Do not spawn reviewers, Bugbot, security-review, or extra agents unless the user asks.
- Do not run full test suites, `npm run build`, deploy, PM2, ADB, or SSH unless the change needs that proof or the user asks.
- Verify only the touched surface. Skip verification for docs/rules-only edits.
- Grep before reading. Read narrow ranges. Skip `build/`, `.gradle/`, minified, lockfiles, `.archives`, `.backups`, `.superpowers/sdd`.
- Short replies. No reports, checklists, or review writeups unless asked.
- Skip pantry, Constitution, Calibration, INDEX, and AGENT_BOOTSTRAP rituals unless resuming CWSP-reborn or the user asks.

## Hierarchy

Import only lower → higher. Mapping: `.cursor/rules/project.mdc`.

## Library/UI context

- For current LUR.E / Object / DOM / FL-UI contracts and CWSP shell consumers, read `.cursor/rules/library-contracts.mdc`; durable status and deferred work are in `.memories/CWSP-reborn.md`.

## Comments

When editing TS/JS: `.cursor/rules/comments-special-comments.mdc`.

## Secrets

Never quote `private/`. Link the path only.

## CWSP nodes (names only)

L-110 desk, L-200 gateway, L-196 / L-208 / L-210 phones. Topology lives in `.cursor/rules/network.mdc`.
