# Project Context

> !!!
> Необходимо обновление данной спецификации и правил...

- **Дата создания или обновления:** ??.??.2026
- **Рассмотрены или прочтены:** --.--.----
- **Изменены (автоматически):** --.--.----

## Project Overview

**Name:** U2RE.space

**Purpose:** Development of custom Web / PWA / CRX applications and a Fastify-based runtime.

## General Conventions

- **Git:** use Conventional Commits:
  - `feat`
  - `fix`
  - `refactor`
  - `docs`
  - `test`
  - `chore`
- **Logging:** use structured logging, preferably with `zerolog`.
- **Common tools:**
  - `pm2`
  - `vite`
  - `npm`
  - `tsx`
  - `npx`
  - `nvm`
  - `pwsh`
  - `bash`
- **Security / portability:**
  - SSH hosts and machine-specific absolute paths must be documented outside the repository.
  - Do not hardcode local machine paths into project files.

---

## Repository Architecture

Нужно исправить все связи символических ссылок, нормализовать их (свести к исходным, а не цепочками), изменить этот же самый файл (`Work-tree.md`). Удалить или исправить символические связи, которые ведут в никуда. Также актуализировать набор (используемых) модулей, библиотек всего этого проекта...

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

## Текущая карта

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

## Related Projects

When relevant, follow conventions and architecture from these projects:

- <https://github.com/u2re-space/crossword>
- <https://github.com/u2re-space/unite-2.man>
- <https://github.com/fest-live/>

---

## Browser Support

Primary target: Chromium-based browsers.

Useful references:

- <https://chromestatus.com/>
- <https://developer.chrome.com/>
- <https://caniuse.com/>

---

# Project Hierarchy

The repository is organized by dependency levels.

Higher-level packages may depend on lower-level packages.

Lower-level packages must not depend on higher-level packages.

---

## Level 0 — Project Root

- `./` — project root directory
- `modules/` — modules directory
- `modules/projects/` — submodules and internal libraries
- `modules/shared/` — shared modules and utilities
- `runtime/` — backend/runtime layer for applications
- `externals/` — external builds and internal distributed libraries
- `assets/` — project assets, images, fonts, etc.

---

## Level 0.5 — Root Core Libraries

- `modules/projects/core.ts` — core JS/TS utilities and helpers

---

## Level 1 — Core Libraries

- `modules/projects/dom.ts` — DOM utilities and helpers
- `modules/projects/object.ts` — core reactivity library
- `modules/projects/veela.css` — CSS framework

---

## Level 2 — Derived Libraries

- `modules/projects/lur.e` — reactive DOM framework
- `modules/projects/icon.ts` — icon library implemented as Web Components

---

## Level 3 — UI Libraries

- `modules/projects/fl.ui` — UI system and component library

---

## Level 4 — Applications

- `apps/*` — application projects

---

# Import Rules

## Main Rule

Dependencies must flow from higher-level packages to lower-level packages.

In other words:

- Applications may import UI libraries, derived libraries, and core libraries.
- UI libraries may import derived and core libraries.
- Derived libraries may import core libraries.
- Core libraries must not import derived, UI, or application code.

---

## Allowed Imports

A higher-level package may import a lower-level package.

Examples:

```ts
// Allowed:
// Level 2 imports Level 1
import { something } from "fest/object";
import { domHelper } from "fest/dom";
```

Example:

- `fest/lure` may import:
  - `fest/object`
  - `fest/dom`
  - `fest/core`

---

## Restricted Imports

Imports between packages on the same level are normally not allowed unless explicitly approved.

Examples:

- `fest/object` and `fest/dom` are both Level 1.
- They should not import each other unless there is a documented architectural reason.

---

## Forbidden Imports

A lower-level package must not import a higher-level package.

Examples:

```ts
// Forbidden:
// Level 1 must not import Level 2 or Level 3
import { something } from "fest/lure";
import { Button } from "fest/fl-ui";
```

Examples:

- `fest/object` must not import:
  - `fest/lure`
  - `fest/icon`
  - `fest/fl-ui`
- `fest/dom` must not import:
  - `fest/lure`
  - `fest/icon`
  - `fest/fl-ui`

---

# Common Import Aliases

Use these aliases as the default import roots.

| Alias | Description |
|---|---|
| `fest/core` | Core TS/JS utilities and helpers |
| `fest/dom` | DOM utilities and helpers |
| `fest/lure` | Reactive DOM framework |
| `fest/object` | Core reactivity library |
| `fest/fl-ui` | UI system and components |
| `fest/veela` | CSS framework |
| `fest/icon` | Icon library / Web Components |

---

# Project Directory Mapping

By default, use the key name as the import root.

| Library | Path |
|---|---|
| `fest/core` | `modules/projects/core.ts` |
| `fest/lure` | `modules/projects/lur.e` |
| `fest/dom` | `modules/projects/dom.ts` |
| `fest/object` | `modules/projects/object.ts` |
| `fest/fl-ui` | `modules/projects/fl.ui` |
| `fest/veela` | `modules/projects/veela.css` |
| `fest/icon` | `modules/projects/icon.ts` |

---

# AI Assistant Guidelines

When working with this repository:

1. Respect the project hierarchy and import rules.
2. Prefer existing aliases such as `fest/core`, `fest/dom`, `fest/object`, etc.
3. Do not introduce dependencies from lower-level packages to higher-level packages.
4. Avoid same-level imports unless the project already has an established pattern for that case.
5. Use TypeScript-compatible solutions by default.
6. Prefer Vite-compatible frontend code.
7. Prefer Fastify-compatible backend/runtime code.
8. Follow Conventional Commits for commit messages.
9. Use structured logging where logging is required.
10. Do not hardcode machine-specific absolute paths, SSH hosts, credentials, or secrets.
11. Target Chromium-based browsers unless explicitly asked otherwise.
12. Keep shared logic in the appropriate lower-level package instead of duplicating it in applications.
13. If unsure where code belongs:
    - generic JS/TS helpers → `fest/core`
    - DOM helpers → `fest/dom`
    - reactivity primitives → `fest/object`
    - reactive DOM framework logic → `fest/lure`
    - reusable UI components → `fest/fl-ui`
    - application-specific code → `apps/*`
