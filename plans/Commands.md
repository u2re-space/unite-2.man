# Команды на все случаи 

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

## Deploy в `.110` (из Linux)

```
npm run build:webnative -- --windows
npm run deploy:webnative:110
npm run build:webnative -- --windows
```

```
npm run build:webnative:windows
npm run deploy:110:webnative
```

## Построить WebNative (Windows)

```
cd C:\Users\U2RE\Projects\webnative\src\core\windows
nuget restore .\packages.config -PackagesDirectory .\packages
msbuild windows.slnx /p:Platform=x64 /m /p:Configuration=Release
```

## Данные для CWSP к `.110` хосту

- `L-192.168.0.110`
- `n3v3rm1nd`
- `L-192.168.0.210,L-192.168.0.196,L-192.168.0.208`
- `https://45.147.121.152:8434/`

## Получить файловое дерево проекта

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

## Прочие скрипты

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
