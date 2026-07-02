# Концепт проекта CWSP

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

## Дополнительные просьбы

Прошу не предлагать Plan Mode. Также прошу не проводить слишком долгие тесты. Вместо этого лучше приготовить (создать) заранее ROADMAP всех возможных/дальнейших действий.

И у меня НЕТУ времени столько ждать, поэтому поменьше тратить времени, особенно на тесты, и прочие... главный тест для AirPad, который должен проходить, это (программный) 3 секундный цикл, разбитый на 360 шагов для смещения мыши из `.196` (или VDS сервера), для проверки плавности, и проверка diff'ов по (реальному) времени из `.110` (если дошло).

Исправлять версию Java также обязательно, как и NodeJS, с восстановлением совместимости. Также важно восстановить/реализовать связи между LAN/WAN (LAN -> WAN, WAN -> LAN, WAN <-> WAN).

Также, ряд недостающего (не доступного) придётся править/исправлять в-слепую, и много анализировать... я и так сделал всё что мог.

У CWSP (Web, Java и NodeJS) также наладить/исправить AirPad логику, а также работу передач clipboard'ов (включая по triangle типу/принципу). Возможно придётся восстановить по крупицам различные истории версий...
Также, у меня НЕТУ возможности каждый раз держать в руках мой/свой смартфон ради AirPad, поэтому сделай так, чтобы с `.196` можно было отправить комманду. 

Так как работает как правило на PM2, то ещё и проверять и логи PM2 в системах.

Важно, что я НЕ могу (всё время) сидеть и быть на своём рабочем месте (и крутить свой смартфон), и нужно действовать как сможешь, важно чтобы приложение наконец работало. На крайняк есть puppeteer (или же сам поставить через npm), для UI/UX по capacitor.

Важно чтобы возможности буферов обмена, отладка (в том числе) приложения [Java, capacitor] по дополнительному WebSocket соединению/каналу были/работали (и реализованы при этом) [в хост `192.168.0.110` или `192.168.0.111` где Cursor/IDE, из `192.168.0.196`]. 

Желательно протестировать также маршрутизацию приложения, как прямые, так и через пробросы, включая AirPad контроль, буферы обмена, удалённые и/или shared (distribute, broadcast) действия и т.д.

Важно по возможности следовать строго по текущей файловой структуре CWSP (особенно где `app`, `src`, `protocol`, `node`, `java`, `web` и прочие). И желательно выполнить по возможности всё (всю задачу/задание) в один prompt/команду...

---

## Миграция на новую модель памяти

Тут теперь важный вопрос и задача... Нужно перейти с Pantry на `.memories` модель. Сделать не только миграцию, перенос данных оттуда, но ещё и проделать анализ (скан) проекта (исходного кода), для актуализации всех данных. Также теперь следует делать отметки актуальности сведений/данных.

---

## Важное также обновить все `AGENT.md` или `AGENTS.md`!

Необходима актуализация и оптимизация под новые реалии и текущие задачи... также теперь следует делать отметки актуальности сведений/данных.

---

## Само тех. задание

А нужно...

I. Сетевой стек (CWSP)... 
  - с возможностями течения через gateways, node, или напрямую. 
  - с применением/использованием websocket (линков, соединений, bridges).
  - релятивная система соединений (например, у `L-192.168.0.200`, подключаемые или подключающиеся от других ID в Map).
  - с возможностью доставки сообщений до адресанта по различным (доступным) узлам (мостам, links), в том числе напрямую.
  - requestor (client) или acceptor (server), включая как forward (connect-to), так и reverse (connected-from).
  - использование как JSON конфигов, так и конфигов от приложения (например, у Android, Java, capacitor).
  - возможность управления мышью, клавиатурой (AutoHotKey), touch, а также обмена/синхронизации буферов обмена.
  - справочник ID и ассоциации (IP, клиентов, устройств, токенов), с путями обмена или доставки (получения).
  - сквозное соединение websocket (т.е. возможность chained, цепочкой).
  - возможность работать с self-signed сертификатами (или игнорировать необходимость сертификатов).
  - возможность являться как клиентом (отправляющим), так и сервером (принимающим, отвечающим).

II. Приложение Android (Java, capacitor, с частичками Java), APK, "CWSP".
  - синхронизацию/обмен буфера обмена.
  - возможность работать с self-signed сертификатами (или игнорировать необходимость сертификатов).
  - реализовать также поддержку PNA (Private Network Access) если есть необходимость, в числе и у CWSP.
  - настройки capacitor (Java, capacitor).
    - маппинг (реестра) ID (destinations).
    - ассоциация (приложения/устройства с ID в сети).
    - список разрешений (к принятию или отправке по ID).
    - специальные разделы для настройки карты сети (опционально).
    - список IP адресов (через которые пройдут данные или будут соединения) из приложения/устройства.
  - AirPad (capacitor), связанный с сетевым стеком и Java. 
  - также свой сетевой стек (см. I), ориентированный как connector.
  - фоновый service/daemon (для получения данных, для отправки данных при помощи actions).
    - share-target (в это приложение), например из буфера обмена.
    - контекстное меню у выделенного текста.
    - кратковременный transparent overlay (со spinner) для действия "do-copy" (если выделен текст) и/или "read-clipboard"/"to-share-content" (если share-target).
    - возможность быть поверх всех приложений.
  - приложение, схожее/аналогичное (по функциям) с:
    - https://github.com/roeticvampire/AiR-Mouse
    - https://github.com/pritish384/AirPointer
    - https://github.com/Sathvik-Rao/ClipCascade

III. Приложение на WebNative или ElectronJS
  - аналогично с приложением на Android
  - вместо Java используется NodeJS
  - отсутствует AirPad
  - дополнительные настройки сетевого стека

IV. Спецификации (и документации) к сетевому стеку, конфигам, CWSP (NodeJS, Java, Web).
  - Всё нужно согласовать к чему-то более однозначному и единому.
  - Нужно сделать наиболее единый протокол (сетевого стека, transport, WS).

V. Настройки (новая, обновлённая система)... 
  - По идеи, каждый `view` должен `contribute` свои наборы настроек в `settings` (от `viewer`, связанные с ними, от `workcenter` аналогично...).

VI. Per Domain SSL Certificates.
  - Требуется обновление модели HTTPS (папка `https`), с per IP/Domain маппингом SSL сертификатов (чтобы не обновлять под каждый новых чих).

---

Needs to make more parity with/between Capacitor version and WebNative CWSP version.

Capacitor ("CWSP"):
- Frontend: Capacitor (web, frontend)
  - Contain: `minimal` shell, `network`, `airpad` and `settings` views
  - Settings extended (contributed) by Java/native config system.
  - Settings needs to be synchronized with internal backend...
  - Frontend building by Vite into `./dist/<category>/`.
- Backend: Java (native code/core, platform)
- Platform: Android
- Build Output: `./build/...`
- Build Command: `npm run build:capacitor` (preferred)
- Deploys: to Android devices (incl. by ADB, or APK install)
- Source-directory: `apps/CWSP-reborn/app/android` (symbolic linked)

WebNative ("CWSP", NodeJS, [optionally] some Java-bridge/IPC):
- Frontend: WebView2 (web, frontend), connected with backend sub-system (such as settings, config)
  - Contain: `minimal` shell, `network` and `settings` views
  - Settings extended (contributed) by NodeJS/CWSP config system.
  - Settings needs to be synchronized with internal backend (NodeJS).
  - Frontend building by Vite into `./dist/<category>/`.
- Backend: NodeJS (with possible Java bridge/IPC support), from/by CWSP itself
- Platform: Windows, Linux
- Build Output: `./dist/<category>/` or `./build/<category>/`
- Framework: 
  - https://github.com/kl1ro/webnative
  - `npm install -D @mindw1n/webnative`
- Build Command: `npm run build:webnative` (preferred)
- Deploy Command: 
  - `npm run deploy:110:webnative` (preferred)
  - `npm run deploy:200:webnative` (option)
- Deploys: to Desktops, Windows, Linux hosts/devices (by SSH, open `cwsp-ui.exe` portable or installer alike APK).
- Source-directory: `apps/CWSP-reborn/app/windows` и `apps/CWSP-reborn/app/linux`

May be in future non-existent Java-with-WebView2 [aka. JW2 or JWV] (Java driven Tauri or NeutralinoJS, with/by JNI)...
- Potentially, similar with Capacitor, but for Desktop, Windows or Linux

---

There is problems, and needs to solve/resolve:
1. Settings isn't saving, not working, and isn't loading from CWSP configs.
   - Even there is no any connections, incl. to https://45.147.121.152:8434/
2. NodeJS bundled code isn't working, needs to somehow restore/run service.
3. Port &ould still remains 8434 by default, and don't randomize ports.
   - If occupied by Cursor IDE or SSH, just skip/ignore such test and check.
4. Now I'm using forked versions...
   - https://github.com/L2NE-dev/webnative
5. You can look, how backend can be working/connected to app...
   - https://github.com/L2NE-dev/webnative/tree/master/template/ts

---

Нужно исправить связи и согласованность с WAN (включая через `45.147.121.152`) и LAN (через `192.168.0.200`) для передач clipboard'ов между устройствами, даже в дали.
Особенно нужно исправить WAN <-> WAN через `45.147.121.152`. Правки и исправления желательны (или даже нужны) везде: в NodeJS, CWSP, Java, Android, возможно и сapacitor...
Использовать для этого в основном следует/желательно именно постоянное соединение по WebSocket (со стороны приложения/устройства), даже в фоне, и при активациях overlay.
Также ВООБЩЕ убери VBScript и wscript, откуда бы то ни было, а использовать чтатный `sudo` у Windows 11 (что с `.110`), так как UAC проверки и так отключен.

---

Что стоит понимать?
- PC/Laptop Windows `192.168.0.110` (пользователь U2RE), ID `L-192.168.0.110`
  - возможно, можно использовать `sudo`, так как выключил UAC
  - также из-за отсутствия WiFi соединения, можно попробовать IP `192.168.0.111`.
- Server/Laptop `192.168.0.200` (internal) aka. `45.147.121.152` (external), with ID `L-192.168.0.200`
  - пользователь `u2re-dev`
  - пароль для root прав: `el1V&nH0`
  - так как у него есть root, а также приложение Termux.  
  - так что попробуй ещё реализовать reverse tunnel, и SSH (или канады) для отладки (из WAN).
- Также VDS `call ssh root@45.150.9.153 -p 22 -i ~/.ssh/id_ecdsa` (для симуляции/эмуляции WAN, `.196`, есть root уже и с коробки). 
- Android Device 1 `L-192.168.0.196`, по ADB 192.168.0.196:5555 (Main, but may/can be skipped)
- Android Device 2 `L-192.168.0.210`, по ADB 192.168.0.210:5555 (May/can be skipped)
- Android Device 3 `L-192.168.0.208`, по ADB 192.168.0.208:5555 (UNUSED, SKIP)

---

## Прошлые возможные проблемы

А теперь... нужно сделать так, чтобы AHK (от AirPad) инициировался только когда происходил connecting, и убирать процесс AHK когда завершилась сессия.
Нужно сделать так, чтобы AHK (от AirPad) инициировался только когда происходил connecting, и убирать процесс AHK когда завершилась сессия.
Нужно от AirPad реализовать такой механизм... причём в (из) AirPad отключить сглаживание частот до 120 с его стороны (а default частота это 30 или 60 Hz).
Из input поставляются пакеты на MOVE, (и когда) они доходят до remote... успеть вовремя обработать прошлую операцию.
Так как (возможно) AHK или что-либо не успевает обработать, собирать в очередь на исполнение (максимум 4 или 8).
Эту очередь перед запуском схлопнуть в один, а в AHK "приказать" сделать плавный переход и старой позиции в новую (и при помощи delta/diff'ов).
Это значит, что логировать следует, именно схлопнутые для исполнения команды/результаты, а не каждый до единого сигнал (чтобы успевать исполнить).
Всё это должно происходить в считанные миллисекунды (и даже нано-секунды), примерно но 30hz до 60hz (сглаживаясь в 120fps, при 192 DPI).
Сделай cooldown между каждым clipboard write примерно в 1 секунду (для одних и тех же значений в write примерно 10 секунд), включая системные или что сделал user, чтобы при ctrl+c на Windows он не перезаписался мгновенно.

---

## Списки карт и комманд

- PM2 логи в `.110`: `C:\Users\U2RE\.pm2`
- PM2 логи в `.200`: `/home/u2re-dev/.pm2`

---

Я обычно провожу такую операцию...

Для `.110`:
- 110: `pm2 stop all`
- 110: `taskkill /F /IM node.exe` (иногда от админа)
- 110: очистка логов `C:\Users\U2RE\.pm2`
- 200: `npm run deploy 110`
- 110: запуск `C:\Users\U2RE\scripts\run-cwsp-sync.cmd`

Для `.200`:
- 200: `pm2 stop all`
- 200: очистка логов `/home/u2re-dev/.pm2`
- 200: `npm run deploy:200:start`

Она слишком муторная, сложная, и нужно как-то упростить...
И подобное писание, желательно упростить:
- `npm run deploy:110:restart` (из `.200` к `.110`)
- `npm run deploy:200:restart` (`.200` у себя)

С (возможностью) обоих концов причём...

---

В важном дополении: нужно сделать и для Java, и для Android, и для TS/JS (NodeJS). Использовать для deploy:
- `npm run deploy:110`
- `npm run deploy:200:start`

### Deploy в `.110` (из Linux)

```
npm run build:webnative -- --windows
npm run deploy:webnative:110
npm run build:webnative -- --windows
```

```
npm run build:webnative:windows
npm run deploy:110:webnative
```

### Построить WebNative (Windows)

```
cd C:\Users\U2RE\Projects\webnative\src\core\windows
nuget restore .\packages.config -PackagesDirectory .\packages
msbuild windows.slnx /p:Platform=x64 /m /p:Configuration=Release
```

### Данные для CWSP к `.110` хосту

- `L-192.168.0.110`
- `n3v3rm1nd`
- `L-192.168.0.210,L-192.168.0.196,L-192.168.0.208`
- `https://45.147.121.152:8434/`

### Получить файловое дерево проекта

Нужно исправить все связи символических ссылок, нормализовать их (свести к исходным, а не цепочками), изменить этот же самый файл (`Work-tree.md`). Удалить или исправить символические связи, которые ведут в никуда.

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

### Прочие скрипты

```
sudo apt update && sudo apt install -y psmisc
sudo fuser -k 443/tcp 2>/dev/null || true
NODE_PATH="$(readlink -f "$(command -v node)")"
sudo setcap 'cap_net_bind_service=+ep' "$NODE_PATH"
getcap "$NODE_PATH"
```

```
sudo apt update && sudo apt install -y psmisc
sudo fuser -k 443/tcp 2>/dev/null || true; NODE_PATH="$(readlink -f "$(command -v node)")"; sudo setcap 'cap_net_bind_service=+ep' "$NODE_PATH"; getcap "$NODE_PATH"
```

---

## Миграция на новую модель памяти

Тут теперь важный вопрос и задача... Нужно перейти с Pantry на `.memories` модель. Сделать не только миграцию, перенос данных оттуда, но ещё и проделать анализ (скан) проекта (исходного кода), для актуализации всех данных. Также теперь следует делать отметки актуальности сведений/данных.

---

## Важное также обновить все `AGENT.md` или `AGENTS.md`!

Необходима актуализация и оптимизация под новые реалии и текущие задачи... также теперь следует делать отметки актуальности сведений/данных.
