# Fest libraries

Публичные npm-пакеты `@fest-lib/*` и workspace-модули. Импорты только **снизу вверх**. Source of truth — корень пакета (`core.ts`, `lur.e`, `fl.ui`, …), не копии под `*/fest`.

```text
0.5  @fest-lib/core
1    @fest-lib/dom        @fest-lib/object       @fest-lib/veela
     @fest-lib/uniform
2    @fest-lib/lure       @fest-lib/ssre         @fest-lib/icon         @fest-lib/image
3    @fest-lib/fl-ui      @fest-lib/subsystem
     @fest-lib/cwsp-shared   (workspace, не npm)
```

| Пакет | npm | Слой | Зачем |
| --- | --- | --- | --- |
| [`core.ts`](core.ts/) | `@fest-lib/core` | 0.5 | refs unwrap, промисы, пути, сетка |
| [`dom.ts`](dom.ts/) | `@fest-lib/dom` | 1 | viewport, стили, inline CSS |
| [`object.ts`](object.ts/) | `@fest-lib/object` | 1 | `observe` / `affected` / refs |
| [`veela.css`](veela.css/) | `@fest-lib/veela` | 1 | токены, `--c2-*`, Agate.UX |
| [`uniform.ts`](uniform.ts/) | `@fest-lib/uniform` | 1 | каналы между контекстами |
| [`lur.e`](lur.e/) | `@fest-lib/lure` | 2 | реактивный DOM `E` / `H` / `M` |
| [`ssr.e`](ssr.e/) | `@fest-lib/ssre` | 2 | backend HTML `E` / `H` / `M`, Fastify + канал |
| [`icon.ts`](icon.ts/) | `@fest-lib/icon` | 2 | `<ui-icon>` + OPFS-кэш |
| [`image.ts`](image.ts/) | `@fest-lib/image` | 2 | обои и K-Means тема |
| [`fl.ui`](fl.ui/) | `@fest-lib/fl-ui` | 3 | окна, App Menu, Speed Dial |
| [`subsystem`](subsystem/) | `@fest-lib/subsystem` | 3 | настройки, routing, document |
| [`cwsp-shared`](cwsp-shared/) | workspace | — | CWSP v2 пакеты (не публикуется) |

## Установка (с npm)

Peers ставьте явно. Node **20+**.

```bash
npm install @fest-lib/core
npm install @fest-lib/dom @fest-lib/object @fest-lib/uniform @fest-lib/veela
npm install @fest-lib/lure @fest-lib/ssre @fest-lib/icon @fest-lib/image
npm install @fest-lib/fl-ui
```

В этом workspace пакеты уже в npm workspaces — импортируйте `@fest-lib/…` без отдельного install.

## Публикация

Из корня пакета:

```bash
npm run publish    # patch +1, затем сборка и npm publish
npm run release    # текущая version, без bump
```

Не публиковать `subsystem` / `cwsp-shared`, пока у них нет `publish` в `package.json`.
