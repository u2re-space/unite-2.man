# Shells

Уровень **3.6**: оболочки. Импортируют views. Их импортируют apps.

Source of truth — `*-shell` и `window-frame`. Не править `modules/shells/shared` и копии под `*/shells`.

```text
views + fl-ui
 └── shells           ← вы здесь
      └── apps (PWA / CRX / Capacitor)
```

| Пакет | Chrome | Когда |
| --- | --- | --- |
| [`environment-shell`](environment-shell/) | статус, taskbar, окна, App Menu | CWSP-shell, desktop |
| [`window-frame`](window-frame/) | плавающие рамки (drag / resize) | demo и вложенные окна |
| [`minimal-shell`](minimal-shell/) | тулбар + одна view | простой хост |
| [`content-shell`](content-shell/) | прозрачный overlay | CRX / content-script |
| [`immersive-shell`](immersive-shell/) | без хрома | print, fullscreen, embed |

## Как запускать

Демо по умолчанию — viewer / markdown-view, HTTPS на **443** (часто нужен `sudo`) или `npm run dev:8434`.

```bash
cd modules/shells/environment-shell
npm run ssl:localhost    # certs/cert.pem + key.pem
npm run dev              # :443
npm run dev:8434
```

`VIEW_DEV_HTTP=1` — HTTP. `VITE_DEV_ORIGIN` — origin для воркеров / LAN.

Слоты: `SHELL_SLOT` (content / overlay). Views не знают, какая оболочка их держит.
