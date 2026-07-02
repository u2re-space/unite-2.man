# Калибровка ИИ агентов для данного проекта

## Поправки и оптимизации процессов

> Можно взять за основу и план, а также в качестве новых правил...
> Также нужно проанализировать и составить общий план изменений...
> Желательно менять аккуратно, точечно, но при этом чтобы это было заметно.
> - **ВАЖНО!** Также сократить количество расходов token'ов, ресурсов, баланса...
> - **ВАЖНО!** Желательно действовать про-активнее и затрачивать как можно меньше времени (на рассуждения и действия)!
> - **ВАЖНО!** На тесты или попытки соединиться/подключиться, тратить НЕ более 30 секунд... а процессы, которые слишком долгие или зависают, по возможности либо оставить, либо исправить, без ущерба остальных частям кода/архитектуры.

> **SPECIAL NOTES (FOR AGENTS), AI-RECOMMENDATIONS:**
>
> ```
> - Reasoning         : XHight
> - Context           : 1M
> - Preferred-LLM     : GPT-5.6 (or GPT-5.5 if first still no exists), GLM-5.2 (if available), Claude-Opus-4.8 (if available)
> - Speciality-Level  : Senior or beyond
> - Knowledge-Database: N >= 2026
> - Speciality-Area   : Frontend, Backend, UI/UX-Design
> - NeedsToWriteDocs  : True
> - NeedsToAnalyze:   : True
> - NeedsToCache      : True
> - NeedsToMemory     : True
> - NeedsToRecognize  : True
> - NeedsToOCR        : True
> - MaximumStepTime   : 1Min
> - MaximumAttempts   : 5
> - MaximumMemPageSize: 1Mb
> ```

Этот документ задаёт публичную стратегию действий для агентов в `U2RE.space`.
Он описывает фундамент проекта, границы источников истины, режим экономии
контекста и порядок работы с приватными данными.

## Главные поправки

- Действовать проактивно, но сначала проверять текущую архитектуру и факты.
- Сокращать расход токенов, времени, ресурсов и баланса: читать узко, искать
  точечно, не поднимать большие логи и generated/vendor контент без причины.
- Держать обычную проверку соединений, SSH, ADB, PM2, dev-серверов и smoke
  probes в пределах 30 секунд. Долгие процессы запускать только когда это
  действительно нужно, с явным ожиданием результата или безопасным фоном.
- Делать изменения аккуратно и локально, но так, чтобы новая стратегия была
  закреплена в правилах, памяти и планировании.
- Не хранить секреты в публичных планах, правилах, `.specify`, `.memories` или
  `.vscode`. Локальные доступы и приватные значения хранятся в `private/`.

## Рекомендуемый профиль агента

- Уровень: senior или выше.
- Приоритеты: анализ, архитектура, UI/UX, frontend, backend, CWSP/AirPad.
- Режим рассуждений: medium/high для обычных задач, extra-high для архитектуры,
  маршрутизации, безопасности и сложной диагностики.
- Контекст: использовать столько, сколько нужно для точности, но не читать
  большие деревья и файлы целиком без причины.
- Память: фиксировать значимые решения и найденные ловушки в агентской памяти.
- Документы: обновлять правила/планы/конституции только когда это укрепляет
  процесс, а не создаёт шум.

---

## Дополнительные просьбы

Прошу не предлагать Plan Mode. Также прошу не проводить слишком долгие тесты. Вместо этого лучше приготовить (создать/подготовить) заранее ROADMAP всех возможных/дальнейших действий, и по нему уже действуя.

И у меня НЕТУ времени столько ждать, поэтому поменьше тратить времени, особенно на тесты, и прочие... главный тест для AirPad, который должен проходить, это (программный) 3 секундный цикл, разбитый на 360 шагов для смещения мыши из `.196` (или VDS сервера), для проверки плавности, и проверка diff'ов по (реальному) времени из `.110` (если дошло).

Исправлять версию Java также обязательно, как и NodeJS, с восстановлением совместимости. Также важно восстановить/реализовать связи между LAN/WAN (LAN -> WAN, WAN -> LAN, WAN <-> WAN).

Также, ряд недостающего (не доступного) придётся править/исправлять в-слепую, и много анализировать... я и так сделал всё что мог. Так как работает как правило на PM2, то ещё и проверять и логи PM2 в системах. Pls, don't suggest plan mode, and do not long tests...

У CWSP (Web, Java и NodeJS) также наладить/исправить AirPad логику, а также работу передач clipboard'ов (включая по triangle типу/принципу). Возможно придётся восстановить по крупицам различные истории версий...
Также, у меня НЕТУ возможности каждый раз держать в руках мой/свой смартфон ради AirPad, поэтому сделай так, чтобы с `.196` можно было отправить комманду. 

Важно, что я НЕ могу (всё время) сидеть и быть на своём рабочем месте (и крутить свой смартфон), и нужно действовать как сможешь, важно чтобы приложение наконец работало. На крайняк есть puppeteer (или же сам поставить через npm), для UI/UX по capacitor.

Важно чтобы возможности буферов обмена, отладка (в том числе) приложения [Java, capacitor] по дополнительному WebSocket соединению/каналу были/работали (и реализованы при этом) [в хост `192.168.0.110` или `192.168.0.111` где Cursor/IDE, из `192.168.0.196`]. 

Желательно протестировать также маршрутизацию приложения, как прямые, так и через пробросы, включая AirPad контроль, буферы обмена, удалённые и/или shared (distribute, broadcast) действия и т.д.

Важно по возможности следовать строго по текущей файловой структуре CWSP (особенно где `app`, `src`, `protocol`, `node`, `java`, `web` и прочие). И желательно выполнить по возможности всё (всю задачу/задание) в один prompt/команду...

---

## Основные контуры проекта

### Triangle A: Markdown + AI + WorkCenter

**Type:** PWA-application
**Stack:** TypeScript, JS, custom framework
**Preferred-AI:** GPT-5.5 (or GPT-5.6 if available), GLM-5.2, Opus-4.8
**Preferred-Reasoning:** Medium or High
**Preferred-Context:** 1M

#### Triangle A2: CRX chrome extension + Markdown + AI

**Type:** CRX-extension
**Stack:** TypeScript, JS, custom framework
**Preferred-AI:** GPT-5.5 (or GPT-5.6 if available), GLM-5.2, Opus-4.8
**Preferred-Reasoning:** Medium or High
**Preferred-Context:** 1M

### Triangle B: AirPad + CWSP + Android + KVM

**Type:** Capacitor-application
**Stack-A:** Java, Kotlin (Native, CWSP-port, compatibility)
**Stack-C:** TypeScript, JS, custom framework (Web, UI/UX, Frontend)
**Preferred-AI:** GPT-5.6 (or GPT-5.5 if first not available), GLM-5.2, Opus-4.8, Fable-5 (if available)
**Preferred-Reasoning:** High, Extra-High or Pro
**Preferred-Context:** 1M
**Inspired-by-projects:**
  - <https://github.com/roeticvampire/AiR-Mouse/tree/master>
  - <https://github.com/pritish384/AirPointer>
  - <https://github.com/Sathvik-Rao/ClipCascade>
  - <https://github.com/MicrosoftDocs/windows-dev-docs/blob/docs/hub/powertoys/mouse-without-borders.md>
  - <https://github.com/symless/synergy>

---

## Источники истины

- `.cursor/rules/network.mdc` — контракт CWSP v2: транспорт, envelope,
  маршрутизация, AirPad, clipboard, debug-log relay.
- `.cursor/rules/debugging.mdc` — порядок восстановления CWSP/AirPad/clipboard,
  PM2, ADB, logcat и удалённых проверок.
- `.cursor/rules/optimization.mdc` — лимиты чтения, проверки и расхода
  контекста.
- `.specify/memory/constitution.md` — официальная конституция для Spec Kit,
  планирования и требований.
- `.memories/constitution.md` — короткая операционная конституция для агентов.
- `AGENTS.md` — стартовый контекст, SSH/Android заметки и общие правила.
- `private/connectivity.md` — локальная приватная карта доступов. Не цитировать
  значения из неё в публичных документах или финальных ответах.

## Карты соединений, путей, файлов и макетов

**Карта макетов/дизайна:**

- На `.110` - `C:\Users\U2RE\Design\`
- На `.200` - `/home/u2re-dev/Design/`

**Карта SSH соединений и приватных доступов:**

- Публично можно упоминать только hosts, роли и безопасные команды без
  credential-значений.
- Приватные пароли, токены, ключи и локальные комментарии по доступам находятся
  в `private/connectivity.md`.
- Для ADB ориентиры: `192.168.0.196:5555`, `192.168.0.208:5555`,
  `192.168.0.210:5555`, если устройства доступны.

**Карты логов PM2:**

- На `.200`: `/home/u2re-dev/.pm2` (45.147.121.152)
- На remote: `/root/.pm2` (45.150.9.153)
- На `.110`: `C:\Users\U2RE\.pm2`  (192.168.0.110 или 192.168.0.111)
- На `.196`, `.210`, `.208` - logcat и/или inspect `:9222` портам.

---

## После рассмотрения

- Приватные значения вынесены из публичной стратегии в `private/`.
- `.memories` используется как краткая операционная память агентов.
- `.specify` используется как официальный слой требований, конституции и
  планирования.

### Ввести такие ветки...

Контекстов, типы страниц памяти, как например:
- Дизайн и визуал, UI/UX
- Цвета и схемы
- Шрифты и типография
- Верстка/разметка
- Box model (layout)
- Анимации
- Логика (UI/UX)
- Хранение/storage (IDB, localStorage, cache)
- Разработка и отладка 
- Frontend and OTA (включая Fastify), совместимые с Capacitor или WebView
- Backend (CWSP), а также возможные database модули/подключения

## Рабочий порядок агента

1. Прочитать только релевантные правила, память и файл задачи.
2. Сначала понять текущую архитектуру и фактический поток данных.
3. Сформулировать короткий план, если задача меняет несколько областей.
4. Делать минимальные целевые правки, не ломая существующие контракты.
5. Проверять пропорционально риску: targeted grep/read, lint/build/test только
   там, где это действительно подтверждает изменение.
6. Не раскрывать секреты в публичных ответах, логах, правилах и планах.
7. После значимого решения сохранить память для будущих агентов.

---

## Миграция на новую модель памяти

Тут теперь важный вопрос и задача... Нужно перейти с Pantry на `.memories` модель. Сделать не только миграцию, перенос данных оттуда, но ещё и проделать анализ (скан) проекта (исходного кода), для актуализации всех данных.

---

## Структура файлов

Нужно исправить все связи символических ссылок, нормализовать их (свести к исходным, а не цепочками), изменить этот же самый файл (`Work-tree.md`). Удалить или исправить символические связи, которые ведут в никуда.

**Можно использовать команду:**

```
tree -L 8 -I "node_modules" \
 -I ".git"\
 -I "dist"\
 -I "build"\
 -I "output"\
 -I "*.ts"\
 -I "*.scss"\
 -I "*.css"\
 -I "*.js"\
 -I "*.mjs"\
 -I "*.html"\
 -I "*.py"\
 -I "*.json"\
 -I "*.md"\
 -I "*.mdc"\
 -I "*.sh"\
 -I "*.rs"\
 -I "*.png"\
 -I "*.jpg"\
 -I "*.jpeg"\
 -I "*.webp"\
 -I "*.svg"\
 -I "*.ps1"\
 -I "*.cmd"\
 -I "*.toml"\
 -I "*.tar"\
 -I "*.gz"\
 -I "*.bz"\
 -I "*.zip"\
 -I "*.pak"\
 -I "chrome-headless-shell"\
 -I "*.hyb"\
 -I "*.txt"\
 -I "fonts"\
 -I "font"\
 -I "*.java"\
 -I "*.webmanifest"\
 -I "*.manifest"\
 -I "https/*"\
 -I "https"\
 -I "*.cjs"\
 -I "*.reg"\
 -I "*.ico"\
 -I "*.pem"\
 -I "*.diff"\
 -I "*.gradle"\
 -I "*.wasm"\
 -I "*.xml"\
 -I "LICENSE"\
 -I "*.tsbuildinfo"\
 -I "*.lock"\
 -I "*.icns"\
 -I "*.tsx"\
 -I "*.br"\
 -I "*.map"\
 -I "*.jar"\
 -I "*.properties"\
 -I "*.jsx"\
 -I "*.bat"\
 -I "*.crt"\
 -I "*.log"\
 -I "*.cert"
```

## Текущий вид файловой структуры

```
.
├── apps
│   ├── CrossWord
│   │   ├── assets
│   │   │   ├── brand
│   │   │   │   ├── 2026
│   │   │   │   └── cross
│   │   │   ├── icons -> ../../../node_modules/@phosphor-icons/core/assets
│   │   │   └── imgs
│   │   ├── cwsp -> ../../runtime/cwsp
│   │   ├── dist-crx
│   │   │   ├── app
│   │   │   ├── assets
│   │   │   ├── chunks
│   │   │   ├── com
│   │   │   ├── fest
│   │   │   ├── icons
│   │   │   ├── markdown
│   │   │   ├── newtab
│   │   │   ├── offscreen
│   │   │   ├── popup
│   │   │   ├── settings
│   │   │   ├── shells
│   │   │   ├── vendor
│   │   │   ├── views
│   │   │   └── workers
│   │   │       └── opfs
│   │   ├── private
│   │   ├── public
│   │   │   └── pwa -> ../src/pwa
│   │   ├── scripts
│   │   ├── shared
│   │   │   ├── assets -> ../assets
│   │   │   └── polyfill
│   │   └── src
│   │       ├── crx
│   │       │   ├── content
│   │       │   ├── icons
│   │       │   ├── markdown
│   │       │   │   └── old
│   │       │   ├── network
│   │       │   ├── newtab
│   │       │   ├── offscreen
│   │       │   ├── popup
│   │       │   ├── service
│   │       │   ├── settings
│   │       │   ├── shared
│   │       │   └── shims
│   │       ├── frontend
│   │       │   ├── ai-slop
│   │       │   │   └── window
│   │       │   ├── boot -> ../shared/boot
│   │       │   ├── misc -> ../shared/boot/misc
│   │       │   ├── shells
│   │       │   │   ├── boot -> ../boot
│   │       │   │   ├── content -> ../../../../../modules/shells/content-shell/src
│   │       │   │   ├── environment -> ../../../../../modules/shells/environment-shell/src
│   │       │   │   ├── immersive -> ../../../../../modules/shells/immersive-shell/src
│   │       │   │   └── minimal -> ../../../../../modules/shells/minimal-shell/src
│   │       │   └── views
│   │       │       ├── airpad -> ../../../../../modules/views/airpad-view/src
│   │       │       ├── editor -> ../../../../../modules/views/editor-view/src
│   │       │       ├── explorer -> ../../../../../modules/views/explorer-view/src
│   │       │       ├── history -> ../../../../../modules/views/history-view/src
│   │       │       ├── home -> ../../../../../modules/views/home-view/src
│   │       │       ├── markdown -> ./viewer
│   │       │       ├── network -> ../../../../../modules/views/network-view/src
│   │       │       ├── settings -> ../../../../../modules/views/settings-view/src
│   │       │       ├── viewer -> ../../../../../modules/views/markdown-view/src
│   │       │       └── workcenter -> ../../../../../modules/views/workcenter-view/src
│   │       ├── pwa
│   │       │   ├── icons
│   │       │   ├── lib
│   │       │   ├── routers
│   │       │   └── screenshots
│   │       ├── shared -> ../../../modules/projects/subsystem/src
│   │       └── types
│   └── CWSP-reborn
│       ├── app
│       │   ├── android
│       │   │   ├── backend -> ../../src/backend/java/android
│       │   │   ├── frontend -> ../src/frontend/web/capacitor/android
│       │   │   └── main
│       │   │       ├── java
│       │   │       │   ├── backend -> ../../backend
│       │   │       │   └── frontend -> ../../../../src/frontend/java
│       │   │       └── kotlin
│       │   ├── crx
│       │   │   ├── backend -> ../../src/backend/web/crx
│       │   │   ├── frontend -> ../../src/frontend/web/crx
│       │   │   └── protocol -> ../../src/protocol/web
│       │   ├── ios
│       │   ├── linux
│       │   │   ├── backend
│       │   │   │   ├── java -> ../../../src/backend/java/linux
│       │   │   │   └── node -> ../../../src/backend/node/linux
│       │   │   ├── electron -> ../../src/frontend/web/electron
│       │   │   └── webnative -> ../../src/frontend/web/webnative
│       │   ├── pwa -> src/frontend/web/pwa
│       │   ├── shared
│       │   │   ├── java -> ../../src/backend/java
│       │   │   ├── node -> ../../src/backend/node
│       │   │   └── protocol -> ../../src/protocol
│       │   ├── src -> ../src
│       │   └── windows
│       │       ├── backend
│       │       │   ├── java -> ../../../src/backend/java/windows
│       │       │   └── node -> ../../../src/backend/node/windows
│       │       ├── electron -> ../../src/frontend/web/electron
│       │       ├── frontend -> ../src/frontend/web/webnative/windows
│       │       └── protocol -> ../../src/protocol/node
│       ├── scripts
│       └── src
│           ├── backend
│           │   ├── crx -> web/crx
│           │   ├── java
│           │   │   ├── android
│           │   │   │   ├── core
│           │   │   │   ├── emission
│           │   │   │   ├── executor
│           │   │   │   └── protocol -> ../../../../app/src/protocol/java
│           │   │   ├── generic -> shared
│           │   │   ├── linux
│           │   │   ├── protocol -> ../../protocol/java
│           │   │   ├── pwa
│           │   │   ├── shared
│           │   │   │   ├── emission
│           │   │   │   ├── executor
│           │   │   │   └── protocol -> ../../../protocol/java
│           │   │   ├── submodules
│           │   │   └── windows
│           │   ├── node
│           │   │   ├── android
│           │   │   ├── fastify
│           │   │   │   ├── emission
│           │   │   │   ├── executor
│           │   │   │   └── protocol -> ../../../../app/src/protocol
│           │   │   ├── generic -> shared
│           │   │   ├── linux
│           │   │   │   └── protocol -> ../../../../app/src/protocol
│           │   │   ├── protocol -> ../../protocol/node
│           │   │   ├── pwa -> ../../../app/src/backend/node/fastify
│           │   │   ├── shared
│           │   │   │   ├── emission
│           │   │   │   ├── executor
│           │   │   │   └── protocol -> ../../../protocol/node
│           │   │   ├── submodules
│           │   │   └── windows
│           │   │       └── protocol -> ../../../../app/src/protocol
│           │   └── web
│           │       ├── airpad
│           │       │   ├── emission
│           │       │   └── executor
│           │       ├── android
│           │       │   ├── emission
│           │       │   └── executor
│           │       ├── crx
│           │       └── protocol -> ../../protocol/web
│           ├── frontend
│           │   ├── crx -> web/crx
│           │   ├── java
│           │   ├── native
│           │   ├── submodules
│           │   │   ├── core -> ../../../../../modules/shared/src
│           │   │   ├── fest -> ../../../../../modules/shared/fest
│           │   │   ├── shells -> ../../../../../modules/shared/shells
│           │   │   └── views -> ../../../../../modules/shared/views
│           │   └── web
│           │       ├── assets
│           │       ├── capacitor
│           │       │   ├── android
│           │       │   │   ├── shared -> ../../shared
│           │       │   │   └── web -> shared
│           │       │   ├── ios
│           │       │   ├── shared
│           │       │   │   ├── airpad -> ../../../submodules/views/airpad
│           │       │   │   ├── minimal -> ../../../submodules/shells/minimal
│           │       │   │   ├── network -> ../../../submodules/views/network
│           │       │   │   └── settings -> ../../../submodules/views/settings
│           │       │   └── web -> shared
│           │       ├── crx
│           │       │   ├── chrome
│           │       │   ├── firefox
│           │       │   ├── service
│           │       │   └── shared
│           │       │       ├── minimal -> ../../../submodules/shells/minimal
│           │       │       ├── network -> ../../../submodules/views/network
│           │       │       └── settings -> ../../../submodules/views/settings
│           │       ├── electron
│           │       │   ├── linux
│           │       │   ├── shared
│           │       │   │   ├── minimal -> ../../../submodules/shells/minimal
│           │       │   │   ├── network -> ../../../submodules/views/network
│           │       │   │   └── settings -> ../../../submodules/views/settings
│           │       │   └── windows
│           │       ├── protocol -> ../../../app/src/protocol/node
│           │       ├── public
│           │       ├── pwa
│           │       │   ├── backend
│           │       │   │   ├── java -> ../../../../backend/java/pwa
│           │       │   │   └── node -> ../../../../backend/node/fastify
│           │       │   ├── frontend
│           │       │   │   ├── airpad -> ../../../submodules/views/airpad
│           │       │   │   ├── minimal -> ../../../submodules/shells/minimal
│           │       │   │   ├── network -> ../../../submodules/views/network
│           │       │   │   ├── service -> ../../../../../app/pwa/service
│           │       │   │   └── settings -> ../../../submodules/views/settings
│           │       │   ├── protocol -> ../../../protocol/web
│           │       │   ├── service
│           │       │   └── shared
│           │       ├── shared
│           │       │   ├── airpad -> ../../submodules/views/airpad
│           │       │   ├── minimal -> ../../submodules/shells/minimal
│           │       │   ├── network -> ../../submodules/views/network
│           │       │   └── settings -> ../../submodules/views/settings
│           │       ├── submodules -> ../../../app/src/frontend/submodules
│           │       └── webnative
│           │           ├── linux
│           │           │   ├── assets -> ../../assets
│           │           │   ├── public -> ../../public
│           │           │   ├── shared -> ../../../../../app/linux/webnative/shared
│           │           │   └── web -> ../../../../../app/linux/webnative/web
│           │           ├── shared -> ../../../../app/linux/webnative/web
│           │           ├── web
│           │           │   ├── minimal -> ../../../../../app/src/frontend/submodules/shells/minimal
│           │           │   ├── network -> ../../../../../app/src/frontend/submodules/views/network
│           │           │   └── settings -> ../../../../../app/src/frontend/submodules/views/settings
│           │           └── windows
│           │               ├── assets -> ../../assets
│           │               ├── public -> ../../public
│           │               ├── shared -> ../../../../../app/src/frontend/web/webnative/shared
│           │               └── web -> ../../../../../app/src/frontend/web/webnative/web
│           ├── protocol
│           │   ├── java
│           │   │   ├── codec
│           │   │   ├── network
│           │   │   ├── packet
│           │   │   ├── state
│           │   │   └── transmission
│           │   ├── node
│           │   │   ├── codec
│           │   │   ├── network
│           │   │   ├── packet
│           │   │   ├── state
│           │   │   └── transmission
│           │   └── web
│           │       ├── codec
│           │       ├── network
│           │       ├── packet
│           │       ├── state
│           │       └── transmission
│           ├── shared
│           └── submodules
├── assets
│   ├── crypto
│   ├── icons
│   │   ├── bold -> ../../node_modules/@phosphor-icons/core/assets/bold
│   │   ├── duotone -> ../../node_modules/@phosphor-icons/core/assets/duotone
│   │   ├── fill -> ../../node_modules/@phosphor-icons/core/assets/fill
│   │   └── regular -> ../../node_modules/@phosphor-icons/core/assets/regular
│   ├── imgs -> ../apps/CrossWord/assets/imgs
│   └── wallpaper
├── externals
├── modules
│   ├── projects
│   │   ├── fl.ui
│   │   │   ├── assets
│   │   │   │   ├── icons -> ../../../../node_modules/@phosphor-icons/core/assets
│   │   │   │   └── imgs
│   │   │   ├── demo
│   │   │   ├── docs
│   │   │   │   ├── classes
│   │   │   │   └── variables
│   │   │   ├── legacy
│   │   │   │   ├── deconstruction
│   │   │   │   ├── deprecated
│   │   │   │   ├── html
│   │   │   │   ├── md3-re-old
│   │   │   │   ├── questionable
│   │   │   │   └── scss
│   │   │   ├── src
│   │   │   │   ├── library
│   │   │   │   ├── misc
│   │   │   │   ├── styles
│   │   │   │   │   ├── runtime
│   │   │   │   │   │   ├── advanced
│   │   │   │   │   │   │   ├── effects
│   │   │   │   │   │   │   ├── layout
│   │   │   │   │   │   │   ├── theme
│   │   │   │   │   │   │   └── tokens
│   │   │   │   │   │   └── basic
│   │   │   │   │   │       ├── design
│   │   │   │   │   │       └── misc
│   │   │   │   │   ├── scripts
│   │   │   │   │   ├── skins
│   │   │   │   │   │   ├── button
│   │   │   │   │   │   ├── switch
│   │   │   │   │   │   └── thin
│   │   │   │   │   └── ui
│   │   │   │   └── ui
│   │   │   │       ├── base
│   │   │   │       ├── containers
│   │   │   │       │   ├── modal
│   │   │   │       │   └── window
│   │   │   │       ├── inputs
│   │   │   │       │   ├── editor
│   │   │   │       │   ├── slider
│   │   │   │       │   ├── text
│   │   │   │       │   └── toggle
│   │   │   │       └── navigation
│   │   │   │           ├── appearance
│   │   │   │           ├── calendar
│   │   │   │           │   └── ui-calendar
│   │   │   │           ├── scrollframe
│   │   │   │           ├── settings
│   │   │   │           ├── start
│   │   │   │           ├── statusbar
│   │   │   │           └── taskbar
│   │   │   │               ├── element
│   │   │   │               └── scss
│   │   │   ├── test
│   │   │   │   ├── style
│   │   │   │   ├── suites
│   │   │   │   └── ui
│   │   │   └── typings
│   │   ├── lur.e
│   │   │   ├── assets
│   │   │   │   └── logo
│   │   │   ├── demo
│   │   │   ├── docs
│   │   │   │   ├── classes
│   │   │   │   ├── enumerations
│   │   │   │   ├── functions
│   │   │   │   ├── interfaces
│   │   │   │   ├── type-aliases
│   │   │   │   └── variables
│   │   │   ├── scripts
│   │   │   ├── src
│   │   │   │   ├── design
│   │   │   │   │   ├── anchor
│   │   │   │   │   ├── color
│   │   │   │   │   ├── layers
│   │   │   │   │   └── mixins
│   │   │   │   ├── interactive
│   │   │   │   │   ├── controllers
│   │   │   │   │   ├── mixins
│   │   │   │   │   │   └── junction -> ../../../../dom.ts/src/mixin/junction
│   │   │   │   │   ├── modules
│   │   │   │   │   └── tasking
│   │   │   │   ├── lure
│   │   │   │   │   ├── context
│   │   │   │   │   ├── core
│   │   │   │   │   ├── misc
│   │   │   │   │   └── node
│   │   │   │   └── utils
│   │   │   │       ├── math
│   │   │   │       └── opfs
│   │   │   └── test
│   │   │       ├── stubs
│   │   │       └── suites
│   │   ├── shared -> ../shared
│   │   └── subsystem
│   │       ├── demo
│   │       ├── fest
│   │       │   ├── core -> ../../core.ts/src
│   │       │   ├── dom -> ../../dom.ts/src
│   │       │   ├── fl-ui -> ../../fl.ui/src
│   │       │   ├── icon -> ../../icon.ts/src
│   │       │   ├── image -> ../../image.ts/src
│   │       │   ├── lure -> ../../lur.e/src
│   │       │   ├── object -> ../../object.ts/src
│   │       │   ├── polyfill
│   │       │   ├── uniform -> ../../uniform.ts/src
│   │       │   └── veela -> ../../veela.css/src
│   │       ├── shells -> ../../../apps/CrossWord/src/frontend/shells
│   │       ├── src
│   │       │   ├── boot
│   │       │   │   └── misc
│   │       │   ├── core
│   │       │   ├── LEGACY
│   │       │   ├── modules
│   │       │   ├── other
│   │       │   │   ├── config
│   │       │   │   │   └── settings
│   │       │   │   │       └── contributions
│   │       │   │   ├── document
│   │       │   │   │   ├── docx
│   │       │   │   │   └── legacy
│   │       │   │   ├── sections
│   │       │   │   └── utils
│   │       │   ├── routing
│   │       │   │   ├── api
│   │       │   │   ├── channel
│   │       │   │   ├── constants
│   │       │   │   ├── core
│   │       │   │   ├── native
│   │       │   │   ├── policies
│   │       │   │   ├── pwa
│   │       │   │   └── workers
│   │       │   ├── service
│   │       │   │   ├── instructions
│   │       │   │   ├── misc
│   │       │   │   ├── model
│   │       │   │   ├── processing
│   │       │   │   ├── recognition
│   │       │   │   ├── service
│   │       │   │   ├── shared
│   │       │   │   └── template
│   │       │   ├── store
│   │       │   ├── transport
│   │       │   └── types
│   │       ├── test
│   │       └── views -> ../../../apps/CrossWord/src/frontend/views
│   ├── scripts
│   ├── shared -> projects/subsystem
│   ├── shells
│   │   ├── content-shell
│   │   │   ├── certs
│   │   │   ├── demo
│   │   │   ├── src
│   │   │   └── test
│   │   ├── environment-shell
│   │   │   ├── assets -> ../../../assets
│   │   │   ├── demo
│   │   │   ├── public
│   │   │   │   ├── assets
│   │   │   │   └── demo
│   │   │   ├── shared -> ../../shared/src
│   │   │   ├── src
│   │   │   │   ├── components
│   │   │   │   ├── controller
│   │   │   │   ├── home -> ../../../views/home-view/src
│   │   │   │   ├── image -> ../../../projects/image.ts/src
│   │   │   │   ├── scss
│   │   │   │   │   └── lib
│   │   │   │   ├── stubs
│   │   │   │   ├── tasking -> ../../../projects/lur.e/src/interactive/tasking
│   │   │   │   ├── views -> ../../../shared/views
│   │   │   │   └── window -> ../../window-frame/src
│   │   │   └── test
│   │   ├── immersive-shell
│   │   │   ├── demo
│   │   │   ├── src
│   │   │   └── test
│   │   ├── minimal-shell
│   │   │   ├── demo
│   │   │   ├── src
│   │   │   └── test
│   │   ├── shared -> ../shared
│   │   └── window-frame
│   │       ├── demo
│   │       ├── public
│   │       │   └── demo
│   │       ├── src
│   │       │   ├── components
│   │       │   ├── controller
│   │       │   ├── frame
│   │       │   ├── scss
│   │       │   ├── tasking -> ../../../projects/lur.e/src/interactive/tasking
│   │       │   └── views
│   │       └── test
│   ├── subsystem -> projects/subsystem
│   └── views
│       ├── airpad-view
│       │   ├── demo
│       │   ├── dist-test
│       │   │   └── assets
│       │   ├── src
│       │   │   ├── component
│       │   │   ├── config
│       │   │   ├── input -> ../../../../apps/CWSP-reborn/src/backend/web/airpad
│       │   │   ├── input-old
│       │   │   │   ├── keyboard
│       │   │   │   ├── sensor
│       │   │   │   └── unfinised
│       │   │   ├── network -> ../../../../apps/CWSP-reborn/src/protocol/web
│       │   │   ├── network-old
│       │   │   │   ├── rails
│       │   │   │   └── transport
│       │   │   ├── public
│       │   │   │   └── icons
│       │   │   ├── ui
│       │   │   └── utils
│       │   └── test
│       ├── editor-view
│       │   ├── demo
│       │   ├── dist-test
│       │   │   └── assets
│       │   ├── src
│       │   │   ├── scss
│       │   │   └── ts
│       │   └── test
│       ├── explorer-view
│       │   ├── certs
│       │   ├── demo
│       │   ├── dist-test
│       │   │   └── assets
│       │   ├── src
│       │   │   ├── scss
│       │   │   └── ts
│       │   └── test
│       ├── history-view
│       │   ├── demo
│       │   ├── src
│       │   │   └── scss
│       │   └── test
│       ├── home-view
│       │   ├── assets -> ../../../assets
│       │   ├── demo
│       │   ├── dist-test
│       │   ├── misc
│       │   ├── src
│       │   │   ├── lib
│       │   │   │   └── core
│       │   │   │       ├── misc
│       │   │   │       └── orient
│       │   │   ├── scss
│       │   │   └── ts
│       │   └── test
│       ├── markdown-view
│       │   ├── certs
│       │   ├── demo
│       │   ├── dist-test
│       │   │   └── assets
│       │   ├── public
│       │   │   └── demo
│       │   ├── src
│       │   │   ├── scss
│       │   │   └── ts
│       │   └── test
│       ├── network-view
│       │   └── src
│       ├── settings-view
│       │   ├── demo
│       │   ├── dist-test
│       │   │   └── assets
│       │   ├── src
│       │   │   ├── overlay
│       │   │   ├── scss
│       │   │   ├── sections
│       │   │   └── ts
│       │   └── test
│       ├── shared -> ../shared
│       ├── viewer-view -> markdown-view
│       └── workcenter-view
│           ├── demo
│           ├── src
│           │   ├── scss
│           │   └── ts
│           └── test
├── plans
├── pnpm-workspace.yaml
├── private
├── runtime
│   ├── Dockerfile
│   ├── frontend
│   │   └── apps
│   │       ├── admin -> ./server/admin
│   │       ├── cw -> ../../../apps/CrossWord/dist
│   │       └── server
│   │           └── admin -> ../../../cwsp/endpoint/server/admin
│   ├── legacy
│   │   ├── endpoint
│   │   │   ├── config
│   │   │   │   └── examples
│   │   │   ├── endpoint
│   │   │   ├── fastify
│   │   │   ├── portable
│   │   │   │   └── endpoint-portable
│   │   │   │       ├── config
│   │   │   │       │   └── examples
│   │   │   │       ├── endpoint
│   │   │   │       ├── fastify
│   │   │   │       ├── scripts
│   │   │   │       ├── server
│   │   │   │       │   ├── admin
│   │   │   │       │   ├── airpad
│   │   │   │       │   │   └── input
│   │   │   │       │   ├── config
│   │   │   │       │   ├── io
│   │   │   │       │   ├── lib
│   │   │   │       │   ├── network
│   │   │   │       │   │   ├── modules
│   │   │   │       │   │   ├── socket
│   │   │   │       │   │   ├── specification
│   │   │   │       │   │   └── stack
│   │   │   │       │   └── routing
│   │   │   │       └── server-v2
│   │   │   │           ├── admin
│   │   │   │           ├── assistant -> /home/u2re-dev/U2RE.space/runtime/legacy/endpoint/server-v2/http/routers/assistant
│   │   │   │           ├── auth -> /home/u2re-dev/U2RE.space/runtime/legacy/endpoint/server-v2/http/routers/auth
│   │   │   │           ├── client
│   │   │   │           ├── config -> /home/u2re-dev/U2RE.space/runtime/legacy/endpoint/server-v2/protocol/config
│   │   │   │           ├── http -> /home/u2re-dev/U2RE.space/runtime/legacy/endpoint/server-v2/protocol/http
│   │   │   │           ├── inputs
│   │   │   │           │   ├── access
│   │   │   │           │   ├── assistant -> /home/u2re-dev/U2RE.space/runtime/legacy/endpoint/server-v2/protocol/http/routers/assistant
│   │   │   │           │   └── drivers
│   │   │   │           ├── legacy
│   │   │   │           ├── protocol
│   │   │   │           │   ├── auth -> /home/u2re-dev/U2RE.space/runtime/legacy/endpoint/server-v2/protocol/http/routers/auth
│   │   │   │           │   ├── config
│   │   │   │           │   ├── http
│   │   │   │           │   ├── socket -> ../../../../../../cwsp/endpoint/server/protocol/socket
│   │   │   │           │   └── utils -> /home/u2re-dev/U2RE.space/runtime/legacy/endpoint/server-v2/utils
│   │   │   │           └── utils
│   │   │   ├── scripts
│   │   │   ├── server
│   │   │   │   ├── admin
│   │   │   │   ├── airpad
│   │   │   │   │   └── input
│   │   │   │   ├── config
│   │   │   │   ├── io
│   │   │   │   ├── lib
│   │   │   │   ├── network
│   │   │   │   │   ├── modules
│   │   │   │   │   ├── socket
│   │   │   │   │   ├── specification
│   │   │   │   │   └── stack
│   │   │   │   │       └── protocol
│   │   │   │   └── routing
│   │   │   ├── server-v2
│   │   │   │   ├── admin
│   │   │   │   ├── assistant -> http/routers/assistant
│   │   │   │   ├── auth -> http/routers/auth
│   │   │   │   ├── client
│   │   │   │   ├── config -> protocol/config
│   │   │   │   ├── http -> protocol/http
│   │   │   │   ├── inputs
│   │   │   │   │   ├── access
│   │   │   │   │   ├── assistant -> ../protocol/http/routers/assistant
│   │   │   │   │   └── drivers
│   │   │   │   │       └── adapters
│   │   │   │   ├── legacy
│   │   │   │   ├── protocol
│   │   │   │   │   ├── auth -> http/routers/auth
│   │   │   │   │   ├── config
│   │   │   │   │   ├── http
│   │   │   │   │   │   ├── branches
│   │   │   │   │   │   ├── handlers
│   │   │   │   │   │   ├── lib
│   │   │   │   │   │   └── routers
│   │   │   │   │   │       ├── api
│   │   │   │   │   │       ├── assistant
│   │   │   │   │   │       ├── auth
│   │   │   │   │   │       ├── broadcast
│   │   │   │   │   │       ├── clipboard
│   │   │   │   │   │       ├── contact
│   │   │   │   │   │       ├── dispatch
│   │   │   │   │   │       ├── getter
│   │   │   │   │   │       ├── health
│   │   │   │   │   │       ├── hello
│   │   │   │   │   │       ├── ops
│   │   │   │   │   │       ├── proxy
│   │   │   │   │   │       ├── settings
│   │   │   │   │   │       ├── sms
│   │   │   │   │   │       ├── status
│   │   │   │   │   │       ├── storage
│   │   │   │   │   │       └── webdav
│   │   │   │   │   ├── socket -> ../../../../cwsp/endpoint/server/protocol/socket
│   │   │   │   │   └── utils -> ../utils
│   │   │   │   └── utils
│   │   │   └── tests
│   │   │       └── unit
│   │   │           ├── agent
│   │   │           │   ├── agent_prompt
│   │   │           │   ├── agent_registry
│   │   │           │   └── agent_tools
│   │   │           ├── desktop
│   │   │           └── tree
│   │   ├── fastify
│   │   │   └── scripts -> ../fastify-js
│   │   └── fastify-js
│   │       └── lib
│   └── src-tauri
│       ├── capabilities
│       ├── icons
│       └── src
├── scripts
└── tasks -> plans
```

---

## Миграция на новую модель памяти

Тут теперь важный вопрос и задача... Нужно перейти с Pantry на `.memories` модель. Сделать не только миграцию, перенос данных оттуда, но ещё и проделать анализ (скан) проекта (исходного кода), для актуализации всех данных. Также теперь следует делать отметки актуальности сведений/данных.

---

## Важное также обновить все `AGENT.md` или `AGENTS.md`!

Необходима актуализация и оптимизация под новые реалии и текущие задачи... также теперь следует делать отметки актуальности сведений/данных.
