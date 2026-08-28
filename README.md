# U2RE.space

**unite-2.man** — общий engineering workspace экосистемы U2RE. Это не один продукт и не шаблон приложения: здесь собираются библиотеки, оболочки, представления и конечные приложения (PWA, Chrome-расширение, Capacitor, desktop).

Изменение в общем модуле сразу доступно нескольким поверхностям. Один source of truth, без копирования деревьев в потребителей.

## Назначение

- браузерные приложения и PWA;
- Chrome / Chromium-расширение (Manifest V3);
- Android-приложения на Capacitor (launcher и sibling SKU);
- desktop / Neutralino / WebNative;
- общие UI-библиотеки (Fest), views и shells;
- runtime, endpoint и platform-интеграции.

## Каталоги

| Путь | Роль |
| --- | --- |
| [`apps/`](apps/README.md) | Конечные приложения CWSP. |
| [`modules/projects/`](modules/projects/README.md) | Fest npm-библиотеки (`@fest-lib/*`): установка, слои, publish. |
| `modules/views/` | Переиспользуемые представления (home, viewer, explorer, settings, workcenter, …). |
| `modules/shells/` | Оболочки: content, minimal, environment, immersive, window-frame. |
| `runtime/` | Хост, Fastify-слои, endpoint (отдельный репозиторий / submodule). |
| `assets/` | Общие визуальные ресурсы. |
| `scripts/` | Сборка, синхронизация, публикация. |

Импорты только снизу вверх: `fest/core` → `dom` / `object` / `veela` → `lure` / `icon` → `fl-ui` → views → shells → apps. Source of truth — корень пакета, не копии под `*/fest`, `*/views`, `*/shells`.

## Приложения

Подробная матрица и команды — в [`apps/README.md`](apps/README.md).

| Приложение | Роль |
| --- | --- |
| **CWSP-shell** | Android Launcher и Speed Dial / New Tab. |
| **CWSP-document** | Markdown, печать, DOCX. Синоним: `apps/CrossWord`. |
| **CWSP-explorer** | Файловый менеджер (OPFS, mounts, native storage). |
| **CWSP-process** | Work Center и AI-обработка. |
| **CWSP-transfer** | Буфер обмена и передача между устройствами. Синоним: `apps/CWSP-reborn`. |
| **CWSP-crx** | Единственный владелец Chrome-расширения. |
| **CWSP-shared** | Общие extras для приложений (не SPA). |
| **CWSP-direct** | Задел под AirPad / remote. |

## Архитектура

```text
fest/core
├── fest/dom + fest/object + fest/veela
├── fest/lure + fest/icon + fest/image
└── fest/fl-ui + subsystem
    └── views → shells → apps
        └── runtime / PWA / CRX / Capacitor
```

## Начало работы

Нужен Node.js **24+**.

```bash
git clone --recurse-submodules https://github.com/u2re-space/unite-2.man.git
cd unite-2.man
npm install
```

Если клонировали без submodule:

```bash
git submodule update --init --recursive
```

Дальше — скрипты нужного пакета в `apps/` или `modules/projects/`. Fest-библиотеки: `npm run publish` поднимает patch и публикует в npm; `npm run release` публикует текущую версию без bump.

Контракт для агентов: [`AGENTS.md`](AGENTS.md).
