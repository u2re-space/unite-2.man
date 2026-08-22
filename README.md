# U2RE.space Workspace

**unite-2.man** — общий engineering workspace для проектов U2RE.space.

Это не один продукт и не шаблон приложения. Здесь разрабатываются, собираются и связываются все основные части экосистемы: приложения, общие библиотеки, UI-системы, runtime-интеграции, инструменты сборки и документация.

## Назначение

Workspace служит единым рабочим полем для создания продуктов U2RE:

- браузерных приложений и PWA;
- Chrome/Chromium-расширений;
- Android-приложений на Capacitor;
- desktop/WebNative-поверхностей;
- общих UI-компонентов, document-инструментов и shell-окружений;
- runtime-, endpoint- и platform-интеграций.

Изменение в общем модуле может быть использовано сразу несколькими приложениями. Это позволяет сохранять единую модель интерфейса, настроек, роутинга и платформенных возможностей.

## Что находится в репозитории

| Каталог | Роль |
| --- | --- |
| `apps/` | Конечные приложения и продуктовые поверхности U2RE. |
| `modules/projects/` | Общие библиотеки: core, DOM, реактивность, UI, иконки, стили, subsystem и shared-логика. |
| `modules/shells/` | Shell-окружения: content, minimal, environment, immersive и window-frame. |
| `modules/views/` | Переиспользуемые представления: Home, Viewer, Editor, Explorer, Settings, Work Center и другие. |
| `runtime/` | Runtime-интеграции и сервисы; подключается как отдельный репозиторий/submodule. |
| `assets/` | Общие визуальные ресурсы. |
| `scripts/` | Сборка, синхронизация, публикация и служебные инструменты. |
| `docs/` | Документация по разработке и рабочим процессам. |

## Продукты и направления

В workspace развиваются несколько связанных направлений:

- **CWSP-shell** — Android Launcher и Speed Dial / New Tab Page для Chromium.
- **CWSP-document** — Markdown-документы, печать, DOCX-экспорт и browser-assisted распознавание.
- **CWSP-transfer** — передача и обработка контента между поверхностями.
- **CrossWord** — документные и рабочие представления U2RE.
- **CWSP-crx** — Manifest V3-расширение Chrome с New Tab, context menu и CRX Snip.
- **Fest** — набор библиотек, на которых строится интерфейс и runtime-слой.

## Архитектура

```text
fest/core
├── fest/dom + fest/object
├── fest/veela + fest/icon + fest/lure
└── fest/fl-ui
    └── shells, views и apps
        └── продукты U2RE.space
```

Нижние уровни не зависят от верхних: приложения используют библиотеки, но базовые библиотеки не импортируют приложения. Это помогает держать общий код переносимым между PWA, CRX, Capacitor и desktop-поверхностями.

## Начало работы

```bash
git clone --recurse-submodules https://github.com/u2re-space/unite-2.man.git
cd unite-2.man
npm install
```

Если репозиторий уже клонирован без submodule:

```bash
git submodule update --init --recursive
```

Далее выберите нужное приложение в `apps/` и используйте его локальные scripts для development, build или platform sync.

## Принципы workspace

- Один source of truth для общей логики и UI.
- Переиспользуемые модули вместо копирования кода между приложениями.
- Chromium-first разработка с отдельными адаптерами для Android, CRX и desktop.
- Локально-ориентированное хранение и platform-specific возможности только там, где они действительно доступны.
- Небольшие приложения могут использовать общие views и shells без повторной реализации интерфейса.

## Статус

U2RE.space — активный экспериментальный workspace. Здесь создаются и развиваются новые приложения, shell-окружения, UI-библиотеки и платформенные интеграции экосистемы.
