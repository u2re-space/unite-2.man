# developer-view

Developer tools. Отдельный пакет (раньше был симлинк на debug-view). **Выключен** без `enabled: true`.

```ts
import { createView } from "developer-view/src";

createView(host, { enabled: true, title: "CWSP Developer" });
```

```bash
cd modules/views/developer-view
npm run dev
npm run test:gate
```
