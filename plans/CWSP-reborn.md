# Концепт проекта CWSP

- **Дата создания или обновления:** 09.07.2026
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

Важно по возможности следовать строго по текущей файловой структуре CWSP проекта (особенно где `app`, `src`, `protocol`, `node`, `java`, `web` и прочие). И желательно выполнить по возможности всё (всю задачу/задание) в один prompt/команду... также нежелательно удалять или добовлять файлы исходного кода проектов. Можно в основном исправление или добавление символических ссылок в тех местах, где это действительно может быть необходимо.

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
  - релятивная система соединений (например, у `L-200`, подключаемые или подключающиеся от других ID в Map).
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
    - <https://github.com/roeticvampire/AiR-Mouse>
    - <https://github.com/pritish384/AirPointer>
    - <https://github.com/Sathvik-Rao/ClipCascade>

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

## Техническая часть всего проекта CWSP

- Устройства и клиента, будут/смогут иметь/носить специальный идентфикатор, вроде `L-110`, `L-210` и т.д. 
- Теперь будет применяться Ecosystem Token, который передаётся в виде его хеша, и криптографии на его основе.
- Само Ecosystem Token в чистом виде НЕ передаётся по каналам/связи этой системы, а передаваться будет hash.
- Расшифровку и дешифрация данных будет происходить именно по тому самому Ecosystem Token.
- Клиенты и устройствами с разными Ecosystem Token не смогут взаимодействать между собой.
- Соединения будут/могут не только по прямым IP адресами, но или через посредников (вроде `L-200`) или reverse tunneling (connection, socket), или даже оба варианта.
- В конфигах (внутренних) или настройках, будут карты IP адресов и некоторых правил обращения...
  - Например, на какие IP соединяться (прямой или посредника, gateway, bastion или tunnel).
  - Как подключаться (на пример, на основании reverse туннель, или по прямому если доступно).
  - Alias между private/local IP адресами и внешними/белыми IP адресами или даже доменами.
  - Будет что-то вроде некого реестра, по типу DNS правил, справочник, карта передач и связей.
- Также ID (идентификатор) и его Ecosystem Token могут быть прописаны и в ENV переменных системы.
- Основной способ подключения и передачи - WebSocket (Secure), при этом можно будет по HTTPS:
  - `/health`
  - `/authrozie`
  - `/handshake`
  - `/ws`
  - `/auth` (автоматически, по ecosystem token)
  - `/get?query=map`  (и прочие `get` запросы, при наличии ecosystem token)
  - `/post?device=<ID>` (и прочие тестовые команды, в основном для отладки системы, при наличии ecosystem token)
- Основные query params, в том числе для отладки:
  - `from=<ID>`
  - `device=<ID>`
  - `client=<ID>` (alias)
  - `destination=<IDs>`
  - `dst=<IDs>` (alias)
  - `devicelist`
  - `clientlist` (alias)
  - `originmap`
  - `cmd=<type>`
  - И могут работать/проходить также и через reverse или websocket каналы.
- Стандартый (default) порты - `8434`, хотя в advanced конфигах могут быть прописаны и иные.
- Также возможность реализации режима ожидения, deferred или pending (но лимиты по времени ограничены).
- Clipboard, contacts, sms, airpad, move, pointer, actions и прочие (операции, действия), будут иметь крайне ограниченный срок годности.
  - Их payload может иметь варьированную размерность в байтах, но могут быть выровнены по 16 байтов, в зависимости от выбранных или согласованных методов шифрования.
  - Два байта также отводиться для CRC-16 (валидность), либо внутри, либо снаружи.
  - Оптимальные методы передачи пакетов: [JSON](https://ecma-international.org/publications-and-standards/standards/ecma-404/), [JSOX](https://github.com/d3x0r/jsox), [CBOR](https://github.com/kriszyp/cbor-x), или даже [TOON](https://github.com/toon-format/toon). 
  - Срок хранения таких данных, не больше 1 или 2 секунды (в очереди).
  - Для изображений или файлов (большой объемности), срок годности может составлять примерно от 1 или 2 секунды (максимум не больше 10 секунд).
- [Pointer, Mouse] move, scroll (pointer) операции [включая по delta, diff] должны и вовсе происходить в режиме минимальнейшей задержки (т.е. в real-time).
  - Их Payload этих пакетов, не будет или не должно быть меньше или превышать 16-байт.
  - Эти 16 байт будут зашифрованы наиболее совместимыми и быстрым методом шифрования.
  - Применяться наиболее быстрые или аппаратно-поддержимаемые методы шифрования, вроде AES-ECB или иных быстрых и эффективных по производительности из возможных методов.
  - Два байта также отводиться для CRC-16 (валидность), либо внутри, либо снаружи (в/от payload). 
  - Оптимальные методы передачи пакетов: [JSON](https://ecma-international.org/publications-and-standards/standards/ecma-404/), [JSOX](https://github.com/d3x0r/jsox), [CBOR](https://github.com/kriszyp/cbor-x), или даже [TOON](https://github.com/toon-format/toon). 
  - Срок хранения таких данных, не больше 100 ms (при минимальной возможной очереди в всего от 2 до 8 действий).
- Протокол - отдельная часть от исполнителей (executor) и эммиторов (emission), также могут пересылаться другим клиентам (связкам, nodes, bridges), и по-сути проксироваться, без необходимости дешифрации или пере-шифрации.
  - Системы, вроде Android, Windows или Linux (могут) имеют свои правила или права (и драйвера), как обращаться с данными и пакетами, пересылать или исполнять.
  - Stale данные не могут быть переданы или исполнены по истичению срока годности.
  - Ранее исполненные (пришедщие) данные НЕ должны больше передаваться другим seeds/peers (если только не указаны другие/дополнительные адресанты), при этом важно избегать повторных исполнений или пересылок одних и тех же пакетов (с одинаковым UUID) т.е. избегать бесконечной цикличности.
  - Также на clipboard, contacts или sms есть период заморозки (от случайной передачи) в примерно 1 секунду, чтобы случайно не стриггерить по clipboard-write операцию на отправку clipboard тех же самых данных. Также пересылка, получение (исполнение) или отправка тех же самых данных, ограничены по throttle времени в 5 секунд.
- Для MOVE или SCROLL операций, в засимости от частотности, имеют свои ограничения (лимиты) по времени.
  - При 120-pps - не более 10ms или 8ms,  очереди ожидания не больше 2 ops (и пинге менее 10ms).
  - При  90-pps - не более 12ms или 10ms, очереди ожидания не больше 2 или 3 ops (и пинге менее 14ms).
  - При  60-pps - не более 16ms или 20ms, очереди ожидания не больше 2, 3 или 4 ops (и пинге менее 20ms).
  - При  30-pps - не более 30ms или 40ms, очереди ожидания не больше 2, 3, 4 или 5 ops (и пинге менее 40ms).
- Драйвер (executor) может исполнять по своему усмотрению (например, сглаживать или нет движения мыши/delta).
- Любые пакеты обязательно должны содержать:
  - UUID
  - CommandType
  - Timestamp
  - Sender-ID
  - Destination-IDs
  - Identify Hash
  - Meta [+ PayloadSize]
  - DataType
  - Crypted Payload [by Ecosystem Token]
  - CRC16
- В Android приложениях, в Capacitor, в APK, так-же желательно встроить механизмы длч отладки (удалённой).
  - Такие как отправки данных от приложения в gateway (или dev origin), вроде логов, замеров...
  - Возможность при подключении в WS запросить отладочные данные.
  - Возможность считать как frontend логи, так и logcat данные.
    - Как по ADB/SSH, так и по приложению напрямую, или с тех же inspect.
  - Возможность проводить проверки/тесты/отладку на отправку из устройства.

### Frontend часть (UI/UX)

- У настроек (`settings`) могут быть (свои) различные contribute от различных модулей, частей, views, сервисов или нативной части... настройки могут (или даже должны) быть связаны со своими backend'ами (например, что под localhost или нативной части), и должны быть сохраняемыми.
- AirPad (клиентская часть) обычно применима к мобильным устройствам (в основном Android, или iOS [в будущем]).
- У CWSP-UI основной набор view'ов: `network` и `settings` (а также `airpad` у мобильных или поддерживаемых).
- В основном из shell'ов применяется `minimal`.
- У Android это обычно Capacitor или PWA, с service или Java частями (backend'ом).
- У Windows, Linux (и прочие) это обычно: Electron, WebNative или Neutralino.
  - В качестве backend'ов могут быть использованы: NodeJS, или Java версии.
  - Для BFF (backend for frontend) обычно используется Fastify на NodeJS.
  - Однако Frontend могут быть запакованы (bundled) в самом приложении или расширении.
- Реализовать в настройках возможность задать `gateway` origin/URL/IP илт даже несколько таковых (резеврных).
- Также в настройках желательно реализовать возможность или вручную прописать карты `ID:origin` или `ID:[origins...]`, либо же автоматически получить эти карты с gateway (серверных, посредников) узлов.
- Возможность задать в настройках "разрешить directly" или "only by/through gateways".
- Возможность задать список разрешенных ID (к устройству, приложению, клиенту), по умолчанию все разрешены.
- Возможность задать список отправляемых в другие ID (к другим seed, клиентам, устройствам).
- В Airpad возможность прописать в quick config: origin/URL/IP/ID/node и ecosystem-token (последний, по умолчанию из настроек системы самого приложения).
- Так как системы в основном работают через `ws` (WebSocket), нужно реализовать также внутренний терминал/консоль отладки, например (включая `dst=self`):
  - `/from=<ID> cmd=<type> dst=<IDs>`
  - `/cmd=<type> dst=<IDs>`
  - В целом, аналогично query params.
- Для этого также ввести `developer` (или `debug`) view.

---

Needs to make more parity with/between Capacitor version and WebNative (or [Neutralino](https://github.com/neutralinojs/neutralinojs)+[NodeJS](https://github.com/hschneider/neutralino-ext-node)) CWSP version.

[Capacitor](https://github.com/ionic-team/capacitor) ("CWSP"):
- Frontend: Capacitor (web, frontend)
  - Contain: `minimal` shell, `network`, `airpad` and `settings` views
  - Settings extended (contributed) by Java/native config system.
  - Settings needs to be synchronized with internal backend...
  - Frontend building by Vite into `./dist/<category>/`.
- Backend: Java (native code/core, platform)
- Platform: Android
- Build Output: `./build/<category>/...`
- Build Command: `npm run build:capacitor` (preferred)
- Deploys: to Android devices (incl. by ADB, or APK install)
- Source-directory: `apps/CWSP-reborn/app/android` (symbolic linked)

[WebNative](https://github.com/L2NE-dev/webnative) [or [Neutralino](https://github.com/neutralinojs/neutralinojs)+[NodeJS](https://github.com/hschneider/neutralino-ext-node)] ("CWSP", [NodeJS](https://nodejs.org/), [optionally] some Java-bridge/IPC):
- Frontend: WebView2 (web, frontend), connected with backend sub-system (such as settings, config)
  - Contain: `minimal` shell, `network` and `settings` views
  - Settings extended (contributed) by NodeJS/CWSP config system.
  - Settings needs to be synchronized with internal backend (NodeJS).
  - Frontend building by Vite into `./dist/<category>/`.
- Backend: NodeJS (with possible Java bridge/IPC support), from/by CWSP itself
- Platform: Windows, Linux (and/or possibly/probably Mac-OS)
- Build Output: `./dist/<category>/` or `./build/<category>/`
- Framework: 
  - <https://github.com/kl1ro/webnative>
  - <https://github.com/L2NE-dev/webnative> (forked)
  - `npm install -D @mindw1n/webnative`
- Build Command: `npm run build:webnative` (preferred)
- Deploy Command: 
  - `npm run deploy:110:webnative` (preferred)
  - `npm run deploy:200:webnative` (option)
- Deploys: to Desktops, Windows, Linux hosts/devices (by SSH, open `cwsp-ui.exe` portable or installer alike APK).
- Source-directory: `apps/CWSP-reborn/app/windows` и `apps/CWSP-reborn/app/linux`

---

May be in future non-existent Java-with-WebView2 [aka. JW2 or JWV] (Java driven Tauri or NeutralinoJS, with/by JNI)...
- Potentially, similar with [`Capacitor`](https://github.com/ionic-team/capacitor), but for Desktop, Windows or Linux.
- Also may be tried to use [Neutralino](https://github.com/neutralinojs/neutralinojs) with Java, and other interfaces...
  - <https://github.com/MarkusJx/node-java-bridge> (theoretically possible way to connect with neutralino)
  - <https://github.com/hunyadi/javabind> (theoretically possible way to connect with neutralino)

### Используемые библиотеки

**Java (Kotlin interop possibly):**

- <https://github.com/tootallnate/java-websocket>
- <https://github.com/kotlin/kotlinx.serialization>
- <https://github.com/google/gson>
- <https://github.com/peteroupc/CBOR-Java>
- <https://github.com/c-rack/cbor-java>
- <https://github.com/authlete/cbor>
- <https://github.com/toon-format/toon-java.git>
- <https://ktor.io/docs/server-websockets.html>
- <https://github.com/ktorio/ktor>
- <https://github.com/socketio/socket.io-client-java>
- <https://github.com/socketio/engine.io-server-java>
- <https://capacitorjs.com/>
- <https://github.com/ionic-team/capacitor>
- `npm install -D @capacitor/core @capacitor/cli`
- <https://capacitorjs.com/docs/v6/android/custom-code>
- <https://github.com/MarkusJx/node-java-bridge> (theoretically possible way to connect with neutralino)
- <https://github.com/hunyadi/javabind> (theoretically possible way to connect with neutralino)

**NodeJS:**

- <https://github.com/websockets/ws>
- <https://nodejs.org/learn/getting-started/websocket>
- <https://github.com/kriszyp/cbor-x>
- <https://github.com/toon-format/toon>
- <https://github.com/d3x0r/jsox>
- <https://github.com/socketio/socket.IO>
- `npm install -D socket.io socket.io-client`
- <https://github.com/L2NE-dev/webnative>
  - For of <https://github.com/kl1ro/webnative>
- <https://github.com/jedisct1/libsodium.git>
- <https://www.json.org/json-en.html>
- <https://ecma-international.org/publications-and-standards/standards/ecma-404/>
- Native JSON, Buffer or other of NodeJS API.
- <https://github.com/nodejs/node/blob/main/src/README.md>
- <https://github.com/neutralinojs-community/node-neutralino> (older, for connect NodeJS with neutralino)
- <https://github.com/hschneider/neutralino-ext-node> (recent, for connect NodeJS with neutralino)
- <https://github.com/sindresorhus/clipboardy> (practically universal library for clipboard API's)
- <https://github.com/octalmage/robotjs> (latest github version only)
- <https://github.com/tauri-apps/tauri> (may be used with rolldown, also needs NodeJS/Rust bridges)
- <https://github.com/napi-rs/napi-rs> (connect with Rust/rolldown/Tauri more directly)

**Web/PWA/Frontend:**

- <https://github.com/socketio/socket.IO>
- `npm install -D socket.io-client`
- <https://github.com/kriszyp/cbor-x>
- <https://github.com/toon-format/toon>
- <https://github.com/d3x0r/jsox>
- <https://www.w3.org/TR/webcrypto/>
- <https://w3c.github.io/webcrypto/>
- <https://developer.mozilla.org/en-US/docs/Web/API/Web_Crypto_API>
- <https://www.json.org/json-en.html>
- <https://ecma-international.org/publications-and-standards/standards/ecma-404/>
- Crypto, WebSocket, JSON, etc. API's (native)
- Other Web Natives...
- <https://capacitorjs.com/>
- <https://github.com/ionic-team/capacitor>
- `npm install -D @capacitor/core @capacitor/cli`
- <https://github.com/neutralinojs/neutralinojs> (needs also Java, and/or NodeJS extension)
- <https://github.com/tauri-apps/tauri> (may be used with rolldown, also needs NodeJS/Rust bridges)
- <https://github.com/sindresorhus/clipboardy> (practically universal library for clipboard API's)
- <https://github.com/vitejs/vite>
- <https://github.com/rolldown/rolldown> (may be connected/combined with Tauri)
- <https://vite.dev/>
- <https://rolldown.rs/> (may be connected/combined with Tauri)

**Данные для ручных тестов:**

- `L-110`
- `n3v3rm1nd`
- `L-210,L-196,L-208`
- `https://45.147.121.152:8434/`

---

## Прошлые возможные проблемы

**Которые нужно решать или избегать от их появлений:**

- Нужно исправить связи и согласованность с WAN (включая через `45.147.121.152`) и LAN (через `192.168.0.200`) для передач clipboard'ов между устройствами, даже в дали.
- Особенно нужно исправить WAN <-> WAN через `45.147.121.152`. Правки и исправления желательны (или даже нужны) везде: в NodeJS, CWSP, Java, Android, возможно и сapacitor...
- Использовать для этого в основном следует/желательно именно постоянное соединение по WebSocket (со стороны приложения/устройства), даже в фоне, и при активациях overlay.
- Также ВООБЩЕ убери VBScript и wscript, откуда бы то ни было, а использовать чтатный `sudo` у Windows 11 (что с `.110`), так как UAC проверки и так отключен.
- Нужно сделать так, чтобы AHK (от AirPad) инициировался только когда происходил connecting, и убирать процесс AHK когда завершилась сессия.
- Нужно от AirPad реализовать такой механизм... причём в (из) AirPad отключить сглаживание частот до 120 с его стороны (а default частота это 30 или 60 Hz).
- Из input поставляются пакеты на MOVE, (и когда) они доходят до remote... успеть вовремя обработать прошлую операцию.
- Так как (возможно) AHK или что-либо не успевает обработать, собирать в очередь на исполнение (максимум 4 или 8).
Эту очередь перед запуском схлопнуть в один, а в AHK "приказать" сделать плавный переход и старой позиции в новую (и при помощи delta/diff'ов).
- Это значит, что логировать следует, именно схлопнутые для исполнения команды/результаты, а не каждый до единого сигнал (чтобы успевать исполнить).
- Всё это должно происходить в считанные миллисекунды (и даже нано-секунды), примерно но 30hz до 60hz и выше (сглаживаясь в 120fps).
- Сделай cooldown между каждым clipboard write примерно в 1 секунду (для одних и тех же значений в write примерно 10 секунд), включая системные или что сделал user, чтобы при ctrl+c на Windows он не перезаписался мгновенно.

---

There (potential, possible) is problems/issues, and needs to solve/resolve/avoid (for Windows, Linux, WebNative):
1. Settings isn't saving, not working, and isn't loading from CWSP configs.
   - Even there is no any connections, incl. to https://45.147.121.152:8434/
2. NodeJS bundled code isn't working, needs to somehow restore/run service.
3. Port &ould still remains 8434 by default, and don't randomize ports.
   - If occupied by Cursor IDE or SSH, just skip/ignore such test and check.
4. Now I'm using forked versions...
   - <https://github.com/L2NE-dev/webnative>
5. You can look, how backend can be working/connected to app...
   - <https://github.com/L2NE-dev/webnative/tree/master/template/ts>

---

## Списки карт и комманд

**Что стоит понимать?**
- PC/Laptop Windows `192.168.0.110` (пользователь U2RE), ID `L-110`
  - возможно, можно использовать `sudo`, так как я лично выключил UAC
  - также из-за отсутствия WiFi соединения, можно попробовать IP `192.168.0.111`.
- Server/Laptop `192.168.0.200` (internal) aka. `45.147.121.152` (external), with ID `L-200`
  - пользователь `u2re-dev`
  - пароль для root прав: `el1V&nH0`
  - так как у него есть root, а также приложение Termux.  
  - так что попробуй ещё реализовать reverse tunnel, и SSH (или канады) для отладки (из WAN).
- Также VDS `call ssh root@45.150.9.153 -p 22 -i ~/.ssh/id_ecdsa` (для симуляции/эмуляции WAN, `.196`, есть root уже и с коробки). 
- Android Device 1 `L-196`, по ADB 192.168.0.196:5555 (Main, but may/can be skipped)
- Android Device 2 `L-210`, по ADB 192.168.0.210:5555 (May/can be skipped)
- Android Device 3 `L-208`, по ADB 192.168.0.208:5555 (UNUSED, SKIP)

---

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

**В основном для ручного ввода и тестирования.**

- `L-110`
- `n3v3rm1nd`
- `L-210,L-196,L-208`
- `https://45.147.121.152:8434/`

### Получить файловое дерево проекта

Нужно исправить все связи символических ссылок, нормализовать их (свести к исходным, а не цепочками), изменить этот же самый файл (`Work-tree.md`). Удалить или исправить символические связи, которые ведут в никуда. А также всё актуализировать!

Важно по возможности следовать строго по текущей файловой структуре CWSP проекта (особенно где `app`, `src`, `protocol`, `node`, `java`, `web` и прочие). И желательно выполнить по возможности всё (всю задачу/задание) в один prompt/команду... также нежелательно удалять или добовлять файлы исходного кода проектов. Можно в основном исправление или добавление символических ссылок в тех местах, где это действительно может быть необходимо. Частично распространяется и на другие части проектов, за пределами CWSP (например, нельзя удалять файлы без весомой необходимости, допустимы например rename или перенос, также допустимы исправления, добавления, переносы или удаления symbolic ссылок).

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

---

## После рассмотрения

- Приватные значения вынесены из публичной стратегии в `private/`.
- `.memories` используется как краткая операционная память агентов.
- `.specify` используется как официальный слой требований, конституции и планирования.
- Исправить все связи символических ссылок, нормализовать их (свести к исходным, а не цепочками), изменить этот же самый файл (`Work-tree.md`). Удалить или исправить символические связи, которые ведут в никуда. А также всё актуализировать!

---

## Дальнейшие правила обращения с файловой системой

Важно по возможности следовать строго по текущей файловой структуре CWSP или данного проекта (особенно где `src`, `app`, `src`, `protocol`, `node`, `java`, `web`, `database` и прочие). И желательно выполнить по возможности всё (всю задачу/задание) в один prompt/команду (перед этим подготовив ROADMAP файлы в специально отведённый `.roadmaps/*`)... также нежелательно удалять или добовлять файлы исходного кода проектов. Можно в основном исправление или добавление символических ссылок в тех местах, где это действительно может быть необходимо. Частично распространяется и на другие части проектов, за пределами CWSP (например, нельзя удалять файлы без весомой необходимости, допустимы например rename или перенос, также допустимы исправления, добавления, переносы или удаления symbolic ссылок). Некоторые исключения для добавления (перемещение, или renaming) по nesting (или удаления в крайних случаях) модулей допускаются для (CWSP):
- `app/**/*`
- `src/**/*`
- `scripts/*` (предпочитать уже имеющееся базу)
Также разрешается (в случаях необходимости) создания/генерации файлов для построения, отладки и тестирования проектов/приложений/решений.

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

---

## Примерное время супер-генерации и задачи для ИИ (агентов)

**Это самое главное и важное!**

- Я лично предполагаю от 30 минут, до возможно даже целого часа, может и два... и это (при этом) главный, единственный и основной целый промпт, даже с учётом всех оптимизаций, а также проработки и доработок (но исключая возможные откаты или прерывания процесса или процессов).
- Нужно также быть готовым к тому, что исполнение задачи (генерации) может даже оборваться, и поэтому важно сохранять по любой возможности прогресс, а не начинать всё снова/заново. 
- Также желательно обзавестись директорией/путём `.progress/*` (и который может иметь и свои коррективы).

---

## Shared Symbolic Linked Modules Patterns

That/such import/export pattern for shared modules is useful for avoid dublications by importing modules from differed symbolic links paths.

```ts
// For avoid symbolic link and cross-module imports issues

// Symbol for the shared registry
const SharedLink = Symbol.for("SharedLink@CWSP"); // Or any other `SharedLink@<Namespace>` pattern
(globalThis as any)[SharedLink] ??= (globalThis as any)[SharedLink] ?? {};
const SharedRegistry: Record<symbol, any> = (globalThis as any)?.[SharedLink] ?? {};

export default SharedRegistry;
export function registerShared<T>(key: symbol, value: T) {
    SharedRegistry[key] ??= value;
    return SharedRegistry[key];
}

export const exportShared = <T>(key: symbol, value: T) => {
    return registerShared(key, value);
}

export const importShared = <T>(key: symbol) => {
    return SharedRegistry?.[key];
}
```

---

## Важное примечание - роли ИИ, агентов и моделей

> Возможно потребуется корректировка suitables.

**Архитектура и фундамент (основа):**
- Fable 5 (High or Highest reasoning, 1M context)
- GPT-5.6 (Sol, Highest Reasoning, 1M context)

**Дизайн и UI/UX:**
- Fable 5 (High or Highest reasoning, 1M context)
- GPT-5.6 (Sol or Terra, High or Highest Reasoning, 1M context)

**Имплементация и реализация основного кода (компонентов, модулей):**
- GPT-5.6 (Sol, Highest Reasoning, 1M context or more)
- Fable 5 (High or Highest reasoning, 1M context)
- GLM-5.2 (Highest, maximum suitable context)

**Поправки и коррекции в коде, а также тестирование:**
- Grok 4.5 (High reasoning) [may be Fast]
- GLM-5.2 (Highest, maximum suitable context)
- GPT 5.6 Terra or Luna (High or Medium reasoning, 1M context or Fast)
- Gemini 3.5 Flash

**Code Review:**
- GLM-5.2 (Highest, maximum suitable context)
- GPT-5.6 (Sol or Terra, High or Highest Reasoning, 200k or 1M context)
- Fable 5 (High or Highest reasoning, 1M context)
- Grok 4.5 (High reasoning)
- Gemini 3.1 Pro

**Documentation and Specification:**
- GPT-5.6 (Sol, Highest reasoning, 1M context, cachable)
- Fable 5 (Highest reasoning, 1M context)
