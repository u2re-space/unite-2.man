# debug-view

Минимальная debug-поверхность. **Выключена**, пока хост не передаст `enabled: true`.

```ts
import { createView } from "debug-view/src";

const { element, unmount, gated } = createView(host, { enabled: true, title: "CWSP Debug" });
```

Без флага: `data-cwsp-gated="true"`, UI не рабочий инструмент. Гейт: `npm run test:gate`.

```bash
cd modules/views/debug-view
npm run dev
npm run test:gate
```
