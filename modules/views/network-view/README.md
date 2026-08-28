# network-view

Статус CWSP-сети и probe-диагностика (в т.ч. Capacitor home). View id: **`network`**.

Capability / surface / a11y-контракты экспортируются отдельно — ими пользуются Cap и WebNative, не только панель.

```ts
import {
    NetworkView,
    resolveNetworkCapabilities,
    detectNetworkSurface
} from "network-view/src";
```

## Запуск

```bash
cd modules/views/network-view
npm run dev
npm run test:contracts
npm run build
```

Топология узлов — `.cursor/rules/network.mdc`. Секреты не сюда.
