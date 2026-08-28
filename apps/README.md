# CWSP — семейство приложений

Конечные продукты U2RE. Имена артефактов на хосте стабильны (`cw-markdown`, `cw-explorer`, `cwsp-control`, `workcenter`). Старые входные точки — симлинки:

- `apps/CrossWord` → `CWSP-document`
- `apps/CWSP-reborn` → `CWSP-transfer`

Не путать `apps/CWSP-shared` с `modules/projects/cwsp-shared` (протокол / helpers для Cap / Neu).

## Матрица

| Приложение | Роль | CRX | PWA / хост | Capacitor |
| --- | --- | --- | --- | --- |
| [**CWSP-shell**](CWSP-shell/) | Launcher / Speed Dial / New Tab | нет (делегирует в crx) | да | launcher SKU |
| [**CWSP-document**](CWSP-document/) | Markdown, печать, DOCX | нет | `build:cw-markdown` → `runtime/fastify/apps/cw-markdown` | sibling SKU |
| [**CWSP-explorer**](CWSP-explorer/) | Файловый менеджер | свой `build:crx` | `build:cw-explorer` | sibling SKU |
| [**CWSP-process**](CWSP-process/) | Work Center, AI process | нет | `build:cw-workcenter` | sibling SKU |
| [**CWSP-transfer**](CWSP-transfer/) | Clipboard / transfer / control | нет | `build:cwsp-control:web`, gateway web | да |
| [**CWSP-crx**](CWSP-crx/) | Manifest V3 | **да** → `dist/` | нет | нет |
| [**CWSP-shared**](CWSP-shared/) | Библиотечные extras | нет | нет | нет |
| [**CWSP-direct**](CWSP-direct/) | AirPad / remote (задел) | — | — | — |

## Хосты (имена, не адреса)

| Поверхность | Владелец |
| --- | --- |
| `md.` / `/markdown` | CWSP-document (`cw-markdown`) |
| `explorer.` / `/explorer` | CWSP-explorer |
| `/workcenter` | CWSP-process |
| `cwsp.` / control + gateway UI | CWSP-transfer |
| New Tab Chrome | CWSP-crx + логика CWSP-shell |

Публичный PWA-хост (`runtime/fastify/layers.ts`): **app** в `fastify/apps/`, **api** `/api/process`, **service** assistant на CWSP core.

## Команды

```bash
# Launcher / Speed Dial
cd apps/CWSP-shell && npm run dev
cd apps/CWSP-shell && npm run build
cd apps/CWSP-shell && npm run build:capacitor:apk:release

# Документы + VDS markdown SPA
cd apps/CWSP-document && npm run dev
cd apps/CWSP-document && npm run build:cw-markdown

# Проводник
cd apps/CWSP-explorer && npm run dev
cd apps/CWSP-explorer && npm run build:cw-explorer
cd apps/CWSP-explorer && npm run build:capacitor

# Work Center
cd apps/CWSP-process && npm run dev
cd apps/CWSP-process && npm run build:cw-workcenter

# Расширение Chrome — Load unpacked → apps/CWSP-crx/dist
cd apps/CWSP-crx && npm run build:crx

# Transfer / control / gateway
cd apps/CWSP-transfer && npm run build:cwsp-control:web
cd apps/CWSP-transfer && npm run build:gateway:web

# VDS: document + transfer (через симлинки CrossWord / CWSP-reborn)
cd runtime && npm run build:vds-apps
```

CRX-сборки сняты с shell / document / shared: их `npm run build` больше не требует `src/crx/manifest.json`. У shell `npm run build:crx` только вызывает соседний `CWSP-crx`.
