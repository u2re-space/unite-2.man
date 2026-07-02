# Структура файлов

- **Дата создания или обновления:** 02.07.2026
- **Рассмотрены или прочтены:** --.--.----
- **Изменены (автоматически):** --.--.----

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

## Правки в структуре проекта

Нужно исправить все связи символических ссылок, нормализовать их (свести к исходным, а не цепочками), изменить этот же самый файл (`Work-tree.md`). Удалить или исправить символические связи, которые ведут в никуда. А также всё актуализировать!

Важно по возможности следовать строго по текущей файловой структуре CWSP проекта (особенно где `app`, `src`, `protocol`, `node`, `java`, `web` и прочие). И желательно выполнить по возможности всё (всю задачу/задание) в один prompt/команду... также нежелательно удалять или добовлять файлы исходного кода проектов. Можно в основном исправление или добавление символических ссылок в тех местах, где это действительно может быть необходимо.

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

**Возможны дальенейшие изменения!**

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

---

## После рассмотрения

- Приватные значения вынесены из публичной стратегии в `private/`.
- `.memories` используется как краткая операционная память агентов.
- `.specify` используется как официальный слой требований, конституции и планирования.
- Исправить все связи символических ссылок, нормализовать их (свести к исходным, а не цепочками), изменить этот же самый файл (`Work-tree.md`). Удалить или исправить символические связи, которые ведут в никуда. А также всё актуализировать!

---

## Дальнейшие правила обращения с файловой системой

Важно по возможности следовать строго по текущей файловой структуре CWSP или данного проекта (особенно где `src`, `app`, `src`, `protocol`, `node`, `java`, `web`, `database` и прочие). И желательно выполнить по возможности всё (всю задачу/задание) в один prompt/команду (перед этим подготовив ROADMAP файлы в специально отведённый `.roadmaps/*`)... также нежелательно удалять или добовлять файлы исходного кода проектов. Можно в основном исправление или добавление символических ссылок в тех местах, где это действительно может быть необходимо. Частично распространяется и на другие части проектов, за пределами CWSP (например, нельзя удалять файлы без весомой необходимости, допустимы например rename или перенос, также допустимы исправления, добавления, переносы или удаления symbolic ссылок).

---

## Системы backup'ов

Теперь крайне рекоммендуется создавать специальные `./backups/{hour}-{minutes}-{seconds}_{day}.{month}.{year}/*` [время брать от первой возможной правки] перед (любыми) внесениями изменений в коде (частичный слепок от структуры исходного кода, и сами преждние файлы исходного кода). Делается это с целой (хотя бы, частично) предотвратить возможные повреждения от изменений при помощи ИИ и агентов.

---

## Комментарии и маркеры в коде

1. Желательно в шапке (блочном комменте) кодов (вписывать, даже заранее, но ПЕРЕД backup'ом): 
   - `*.ts`, `*.js`, `*.mjs`, `*.css`, `*.scss`, `*.tsx`, `*.jsx`, `*.esm`
   - Оставлять или добавить/переписать heading блочный комментарий по типу:

```ts
/* 
 * Filename: ...
 * FullPath: ...
 * Change date and time: {hour}.{minues}.{seconds}_{day}.{month}.{year}
 * Reason for changes: ...
 */
```

2. Желательно оставлять комментарии в функциях (в особенности новых), в переменных, в логике самого кода, а также их (возможно, новые) связи с другими частями этого кода. Это нужно для упрощения навигации и поиска нужны модулей и частей кода.
