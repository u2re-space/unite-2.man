# Process / Work Center capabilities

SoT: `workcenter-view`, `subsystem`, `CWSP-process` (minimal-shell). Do not edit consumer copies.

## Ports

`:8434` is CWSP core / Control / Java / Neutralino fleet `/ws` only. SKU apps do not bind it.

| SKU | fleet `/ws` | ssre `sse`/`ssw` |
| --- | --- | --- |
| core / transfer / reborn | 8434 | — |
| process | 8436 | 8455 |
| shell | 8437 | 8456 |
| explorer | 8438 | 8457 |
| document | 8439 | 8458 |

`ssre` path is `/ssre/channel` (not `/ws`). Vite Dev also hosts that path on the app origin (existing `index.html` is the document base). Dedicated listen stays on the SKU port. Public `:443` may proxy.

Constants: `modules/projects/subsystem/src/routing/api/sku-ports.ts`.

## Host × skills (Process)

| | Vite Web | Process PWA | LAN `/workcenter` | Capacitor | CRX |
| --- | --- | --- | --- | --- | --- |
| Shell | minimal | minimal | minimal | minimal | handoff / embed |
| Views | workcenter, settings, history | same | same | same | workcenter if mounted |
| Share Target | yes (manifest) | yes | via host PWA | OS SEND/VIEW | no OS share_target |
| Launch Queue / file_handlers | yes | yes | yes | Open-with | file pickers |
| POST `/api/process` | Vite + SW local-first | SW local-first, then public | remote public | Java `CwsProcessApi`, then public | remote public |
| In-browser AI fallback | yes | yes | yes | yes | yes |
| Fleet `/ws` | process :8436 (not 8434) | :8436 | :8436 | Java owns **core** :8434 | CRX hub :8434 |
| ssre | Vite `/ssre/channel` + :8455 | Vite + :8455 | :8455 | do not steal Java :8434 | optional |
| view-api / `rs-view-workcenter` | yes | yes | yes | yes | uniform CRX channel |
| `rs-workcenter` commands | yes | yes | yes | yes | ChromeExtensionBroadcast |
| SW NetworkOnly `/api` | if SW | yes | if SW | n/a | MV3 SW |
| OPFS attachments | yes | yes | yes | yes | limited |
| Clipboard after process | yes | yes | yes | device write | extension |

## Other SKUs (not Process)

- **shell** (`u2re.space`): environment-shell, hub. Ports reserved 8437 / 8456.
- **document** (`md.u2re.space`): markdown-view. Share Target already on. Ports reserved 8439 / 8458.
- **explorer** (`explorer.u2re.space`): explorer-view. Ports reserved 8438 / 8457.
- **transfer / reborn**: Control + core `:8434`. Do not move.
