# AGENTS.md

## Pantry — persistent project notes

This project uses persistent notes via the `pantry` MCP tools.

### Required at session start

Before doing any substantive work, load existing context from previous sessions:

1. Call `pantry_context` to retrieve recent project notes.
2. If the task is about a specific feature, bug, subsystem, file, or topic, also call `pantry_search` with relevant keywords.

Do not skip this step. Important context may exist only in Pantry and may not be visible in the repository.

### Required at session end

If the session produced any durable outcome, store it in Pantry before finishing. This includes:

- code changes
- architectural or implementation decisions
- bug investigations or root causes
- useful discoveries
- non-obvious project context that would help a future agent

Use `pantry_store` with:

- `title`: short descriptive title
- `what`: what happened or what was decided
- `why`: the reasoning behind it
- `impact`: what changed or what is affected
- `category`: one of `decision`, `pattern`, `bug`, `context`, `learning`
- `details`: enough detail for a future agent with no prior context

Do not skip this step for tasks that involved changes, decisions, bugs, or learnings. Pantry is the project’s long-term memory across sessions.

---

## Token usage optimization

Keep context usage efficient:

- Prefer **Grep / ripgrep** when locating functions, classes, variables, or symbols instead of opening large files.
- Read only the relevant file ranges when a file is large.
- Do not proactively load generated or vendor output into context, such as:
  - `build/`
  - `.gradle/`
  - minified bundles
  - other generated artifacts
- Be concise in both internal reasoning and user-facing responses.

---

## Commenting and special comments

When editing `*.ts` / `*.tsx` / `*.js` / `*.mjs` files:

- Add comments for intent, invariants, side effects, protocol/data-shape expectations, lifecycle, trust boundaries, and non-obvious tradeoffs.
- Prefer module-level block comments for non-trivial files and JSDoc for exported functions, classes, and methods when behavior is not obvious from the signature.
- Do not add narration comments that merely restate syntax or variable assignments.
- Keep comments close to the code they describe, and update or delete stale comments in the same edit.
- Extend an existing good overview comment instead of stacking duplicate comment blocks.

Use these special markers consistently when they help:

- `NOTE:` general local context for future humans or AI.
- `WHY:` rationale that is not obvious from the implementation.
- `INVARIANT:` a property that must remain true across edits.
- `TODO(owner/date-or-issue):` a concrete follow-up with enough context to act.
- `FIXME:` known wrong behavior that should be corrected soon.
- `HACK:` temporary workaround; include the intended removal condition.
- `COMPAT:` compatibility behavior for browser/protocol/migration quirks.
- `SECURITY:` validation or secret-handling boundaries.
- `PERF:` hot-path or latency-sensitive behavior.
- `AI-READ:` rare handoff note for hidden contracts or repo-specific traps.

Comment hygiene rules:

- Do not introduce marker spam; one precise comment is better than many weak ones.
- Do not leave bare `TODO` / `FIXME` comments without actionable context.
- Preserve valid special comments during refactors, but remove them once they stop being true.

---

### npm command defaults

These commands default to the **`cwsp` hybrid flavor** (`space.u2re.cwsp`):

- `npm run dev`
- `npm run assemble`
- `npm run build`

### Product flavors

| Flavor | `applicationId` | Purpose |
|---|---|---|
| `cws` | `space.u2re.cws` | NativeScript App |

---

## Additional code locations

When the task is relevant, also inspect these paths:

- `/home/u2re-dev/U2RE.space/modules/projects/uniform.ts/src/newer/` — internal
- `/home/u2re-dev/U2RE.space/runtime/cwsp/endpoint/` — network-related

---

## Model selection

- **Analysis / architecture / planning:** Claude Opus 4.6, GPT 5.4 (`high` or `xhigh`), Gemini 3.1 Pro
- **Coding / implementation / refactoring:** GPT-5.4 (`low` or `medium`), Claude 4.6 Sonnet, Gemini 3.1 Pro
- **Edits / fixes / refinements:** `GPT-5.3-codex-spark`, GPT-5.4 (`instant`, `none`, or `minimal` reasoning), Claude 4.5 Haiku, Gemini 3 Flash
- **Documentation / specs:** GPT-5.4 (`low` or `medium`), Claude 4.6 Sonnet, Gemini 3.1 Pro
- **Recognition / scanning / images:** GPT-5.4 (`low`, `instant`, `none`, or `minimal`), Claude 4.6 Sonnet, Gemini 3.1 Pro, or Gemini 3 Flash

---

## SSH access

Available SSH targets include:

- `ssh U2RE@192.168.0.110`
- `ssh U2RE@192.168.0.111`
- `ssh u2re-dev@192.168.0.200`
- `ssh u2re-dev@192.168.0.201`
- External access / VDS example:
  - `ssh u2re-dev@45.147.121.152`
  - `ssh root@45.150.9.153 -p 22 -i ~/.ssh/id_ecdsa`

---

## Android debugging

- ADB usage (`adb` and/or `adb shell`)
- Connect to `192.168.0.196:5555` (defaultly)
- Reading logcat

---

## Network stack:

How &ould works our network.

```
[ Laptop/Ultrabook ] Bi-dir  {[ Server (Endpoint), Have External Entry IP ]}
[ L-192.168.0.110  ] ←←---→→ {[ 192.168.0.200:8443 / 45.147.121.152:8443  ]}
          ↑                         ↑                         ↑
          ┷                         ↑                         ↑ 
          |                         ↓                         ↓ 
          ┗------------------{[ [L-192.168.0.196] |- - -| [L-192.168.0.208] ]}   # Phone device groups (cws-androids, PWA-airpad)
                                [Android Phone 1]         [Android Phone 2]
```

### Topology

**L-192.168.0.110 <---> L-192.168.0.196**
- clipboard (via android application, and cwsp endpoint server)
- `airpad` signals (PWA/WebView application)
  - mouse
  - keyboard
  - clipboard
- tunneling through 192.168.0.200:8443 / 45.147.121.152:8443 if in LTE/NAT mode, using identification client token

**L-192.168.0.110 <---> L-192.168.0.208**
- clipboard (via android application, and cwsp endpoint server)
- `airpad` signals (PWA/WebView application)
  - mouse
  - keyboard
  - clipboard
- tunneling through 192.168.0.200:8443 / 45.147.121.152:8443 if in LTE/NAT mode, using identification client token

**L-192.168.0.196 <---> L-192.168.0.208**
- clipboard (via android application, and cwsp endpoint server)
- tunneling through 192.168.0.200:8443 / 45.147.121.152:8443 if one of in LTE/NAT mode, using identification client token

**L-192.168.0.110 <---> {[ 192.168.0.200:8443 / 45.147.121.152:8443 ]}**
- initiated or initiator exchanger (bridge/tunnel/link)
- `L-192.168.0.110` is AirPad controllable (by PWA apps)
  - Or directly, or through bridge/proxy
- `L-192.168.0.110` is one of `clipboard` (and/or other data) synchronize/exchanger member
  - Devices through bridge/proxy can/may ask or pass `clipboard` (and/or other data) data

**{[ 192.168.0.200:8443 / 45.147.121.152:8443 ]}** 
- is in general a central coordinator (bridge, and/or tunnel/proxy)

---

## Potential routes what needs to support

- Airpad (PWA) or Native from `L-192.168.0.196` to https://192.168.0.110:8443/ (local/private network)
- Airpad (PWA) or Native from `L-192.168.0.196` through `https://192.168.0.200:8443/`  to `L-192.168.0.110` (local/private network)
- Airpad (PWA) or Native from `L-192.168.0.196` through `https://45.147.121.152:8443/` to `L-192.168.0.110` (any network of device)
- Native (app) Clipboard (and/or other data) from `L-192.168.0.196` to https://192.168.0.110:8443/ (local network, directly)
- Native (app) Clipboard (and/or other data) from `L-192.168.0.196` to through `https://192.168.0.200:8443/`  to `L-192.168.0.110` (local network, directly)
- Native (app) Clipboard (and/or other data) from `L-192.168.0.196` to through `https://45.147.121.152:8443/` to `L-192.168.0.110` (any network of device)
- CWSP/`endpoint` Clipboard (and/or other data) from `L-192.168.0.110` to https://192.168.0.196:8443/ (rare case, local network, directly)
- CWSP/`endpoint` Clipboard (and/or other data) from `L-192.168.0.110` to through `https://192.168.0.200:8443/`  to `L-192.168.0.196` (local network, directly)
- CWSP/`endpoint` Clipboard (and/or other data) from `L-192.168.0.110` to through `https://45.147.121.152:8443/` to `L-192.168.0.196` (any network of device)

### `L-192.168.0.196` may/can be:

- Simulator/debug client from `45.150.9.153` (VDS), with client token `n3v3rm1nd` instead of IP
- PWA or Native application from NAT (unknown IP, but with client token `n3v3rm1nd` instead of IP)
- PWA or Native application from private/local network with IP `192.168.0.196`.
