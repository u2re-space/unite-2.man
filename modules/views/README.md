# Views

Уровень **3.5**: представления CWSP. Импортируют Fest + subsystem. Их импортируют shells, не наоборот.

Source of truth — каталог `*-view`. Не править копии под `*/views` и `modules/views/shared`.

```text
fest + subsystem
 └── views            ← вы здесь
      └── shells → apps
```

| Пакет | id | Роль |
| --- | --- | --- |
| [`home-view`](home-view/) | `home` | Speed Dial / рабочий стол |
| [`markdown-view`](markdown-view/) | `viewer` | Markdown viewer (`viewer-view` → сюда) |
| [`editor-view`](editor-view/) | `editor` | Markdown editor |
| [`explorer-view`](explorer-view/) | `explorer` | Проводник (OPFS / mounts) |
| [`settings-view`](settings-view/) | `settings` | Настройки |
| [`history-view`](history-view/) | `history` | История transfer / clipboard |
| [`workcenter-view`](workcenter-view/) | `workcenter` | Work Center / очередь задач |
| [`network-view`](network-view/) | `network` | Сеть и probe |
| [`debug-view`](debug-view/) | `debug` | Debug (только с `enabled`) |
| [`developer-view`](developer-view/) | `developer` | Developer (только с `enabled`) |

`window-frame` в этом каталоге — симлинк на [`../shells/window-frame`](../shells/window-frame/).

## Как запускать

Пакеты не в npm. Из workspace:

```bash
cd modules/views/home-view && npm run dev
cd modules/views/markdown-view && npm run dev:8434
```

Сборка модуля: `npm run build` → `dist/<name>.js`, плюс `exports["./src"]` для TypeScript-хостов.

Контракт view: `View` + `ViewLifecycle` + `ShellContext` из `views/types` / `shells/types`. Хост монтирует view внутрь слота оболочки.
