# CWSP Files Transfer — Wave 3+ (Neutralino hub + Android Open-with) Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Ship a shared **files-hub** core with Neutralino Open-for-Share (desk) and Capacitor **Open-with / Share-to-CWSP** (phone → Temp → hybrid offer), on top of W1 protocol + W2 endpoint relay.

**Architecture:** One logical hub (`ingress → stage Temp → pack → publish bytes → files:offer → progress/cancel`) with thin adapters. Clipboard-hub stays untouched for text/image. Android file-manager entry always copies into app-private Temp; hybrid offer auto-fires only when `defaultDestinations` is non-empty. Desktop shell “Open with CWSP” is **out of scope**. Full Cap incoming SAF/notification UX stays **W4** (W3+ may stub accept for smoke).

**Tech Stack:** `@fest-lib/cwsp-shared` (W1), Node Neutralino backend (`src/backend/node/shared/neutralino`), Android Java (`ShareTarget` / bridge), Capacitor web listener, `node:test` + existing Cap/Java check scripts.

**Models:** GLM-5.2 implement; Grok audit. **Do not use Composer / Sol.**

**Spec:** `docs/superpowers/specs/2026-07-21-cwsp-files-transfer-design.md` (Amendment **A2**)  
**Depends on:** W1 + W2 on `main` (`c6a8751` or later)  
**Follow-ups:** W4 Cap incoming/SAF; W5 settings UI; later desktop shell Open-with

## Global Constraints

- Edit SoT once (hardlinks/symlinks will mirror):
  - Shared: `apps/CWSP-reborn/src/shared` (= `modules/projects/cwsp-shared`)
  - Neutralino: `apps/CWSP-reborn/src/backend/node/shared/neutralino/`
  - Android Java: `apps/CWSP-reborn/src/backend/java/android/` (hardlinked under `app/android/…`)
- Do **not** route multi-file Open-with through clipboard-hub / `clipboard:update`.
- Wire envelopes stay clean (no `content://`, no absolute paths).
- Stage caps (locked for this plan): `FILES_STAGE_MAX_COUNT = 64`, `FILES_STAGE_MAX_BYTES = 512 * 1024 * 1024` (512 MiB).
- Hybrid offer: `defaultDestinations.length > 0` → auto offer; else `needDestinations` UI (never silent `*`).
- `openForShare` setting gates **clipboard-style** Neutralino outgoing only; Open-with uses hybrid path.
- Endpoint code: do not rework W2 unless a proven blocker; prefer client-side blob serve on sender.
- Commits: Conventional Commits; only when human allows / SDD Method 1.
- Tests: shared `npm test`; Neutralino hub `node --import tsx --test …`; Android unit where practical; smoke via `am start` notes in Task 6.

---

## File map (W3+)

| File | Role |
|---|---|
| Create: `src/shared/src/v2/files-hub-policy.ts` | Pure: stage limit check + `decideOfferAfterStage` |
| Modify: `src/shared/src/v2/files-constants.ts` | Stage caps + ingress source constants |
| Modify: `src/shared/src/v2/files-types.ts` | `FilesIngressSource`, hub phase types |
| Modify: `src/shared/src/v2/index.ts` + `package.json` | Export policy |
| Create: `src/shared/test/v2-files-hub-policy.test.ts` | Policy unit tests |
| Create: `src/backend/node/shared/neutralino/files-hub.ts` | Desk files-hub (stage/pack/offer/progress) |
| Create: `src/backend/node/shared/neutralino/files-hub.test.ts` | Hub unit tests (fs temp) |
| Modify: `src/backend/node/shared/neutralino/index.ts` | Export `createFilesHub` |
| Modify: `src/backend/node/windows/index.ts` (and linux boot if separate) | Construct + wire files-hub beside clipboard-hub |
| Modify: `src/backend/node/shared/neutralino/clipboard-prompt-host.ts` **or** small files prompt host | Open for Share / needDestinations / progress toast hooks |
| Modify: `app/android/AndroidManifest.xml` (SoT used by Cap build) | `VIEW` + `SEND`/`SEND_MULTIPLE` `*/*` |
| Modify: `src/backend/java/android/emission/ShareTarget.java` | File streams → Temp stage + `emitFilesIngress` |
| Modify: `src/backend/java/space/u2re/cwsp/CwsBridgePlugin.java` | `emitFilesIngress` → WebView |
| Create: `src/frontend/web/capacitor/android/web/logic/files-hub.ts` | Cap listener + hybrid offer |
| Optional: `scripts/` smoke notes in task report only — no new markdown reports unless asked |

---

### Task 1: Shared files-hub policy

**Files:**
- Create: `apps/CWSP-reborn/src/shared/src/v2/files-hub-policy.ts`
- Modify: `apps/CWSP-reborn/src/shared/src/v2/files-constants.ts`
- Modify: `apps/CWSP-reborn/src/shared/src/v2/files-types.ts`
- Modify: `apps/CWSP-reborn/src/shared/src/v2/index.ts`
- Test: `apps/CWSP-reborn/src/shared/test/v2-files-hub-policy.test.ts`

**Interfaces:**
- Produces:
  - `FILES_STAGE_MAX_COUNT = 64`
  - `FILES_STAGE_MAX_BYTES = 512 * 1024 * 1024`
  - `FilesIngressSource = "clipboard" | "open-with" | "share-target" | "picker"`
  - `FilesHubPhase = "staged" | "readyToOffer" | "needDestinations" | "offering" | "progress" | "done" | "cancel"`
  - `assertStageLimits(files: { size: number }[]): { ok: true } | { ok: false; reason: "count" | "bytes"; count: number; totalBytes: number }`
  - `decideOfferAfterStage(input: { source: FilesIngressSource; defaultDestinations: string[]; openForShare: "manual" | "auto" }): { phase: "readyToOffer" | "needDestinations"; destinations?: string[] }`

**Rules for `decideOfferAfterStage`:**
- If `source === "open-with" || source === "share-target"`: hybrid — non-empty `defaultDestinations` → `readyToOffer` with those destinations; else `needDestinations`.
- If `source === "clipboard" || source === "picker"`: `openForShare === "auto"` and destinations non-empty → `readyToOffer`; `openForShare === "auto"` and empty destinations → `needDestinations`; `openForShare === "manual"` → always `needDestinations` (UI shows Open for Share / picker).

- [ ] **Step 1: Write failing tests**

```ts
// apps/CWSP-reborn/src/shared/test/v2-files-hub-policy.test.ts
import assert from "node:assert/strict";
import test from "node:test";
import {
  FILES_STAGE_MAX_COUNT,
  FILES_STAGE_MAX_BYTES,
} from "../src/v2/files-constants.ts";
import {
  assertStageLimits,
  decideOfferAfterStage,
} from "../src/v2/files-hub-policy.ts";

test("stage limits constants", () => {
  assert.equal(FILES_STAGE_MAX_COUNT, 64);
  assert.equal(FILES_STAGE_MAX_BYTES, 512 * 1024 * 1024);
});

test("assertStageLimits rejects over count", () => {
  const files = Array.from({ length: 65 }, () => ({ size: 1 }));
  const r = assertStageLimits(files);
  assert.equal(r.ok, false);
  if (!r.ok) assert.equal(r.reason, "count");
});

test("open-with with destinations → readyToOffer", () => {
  const r = decideOfferAfterStage({
    source: "open-with",
    defaultDestinations: ["L-192.168.0.110"],
    openForShare: "manual",
  });
  assert.equal(r.phase, "readyToOffer");
  assert.deepEqual(r.destinations, ["L-192.168.0.110"]);
});

test("open-with without destinations → needDestinations", () => {
  const r = decideOfferAfterStage({
    source: "open-with",
    defaultDestinations: [],
    openForShare: "auto",
  });
  assert.equal(r.phase, "needDestinations");
});

test("clipboard manual → needDestinations even with destinations", () => {
  const r = decideOfferAfterStage({
    source: "clipboard",
    defaultDestinations: ["L-192.168.0.110"],
    openForShare: "manual",
  });
  assert.equal(r.phase, "needDestinations");
});
```

- [ ] **Step 2: Run tests — expect FAIL (module missing)**

```bash
cd /home/u2re-dev/U2RE.space/apps/CWSP-reborn/src/shared && node --import tsx --test test/v2-files-hub-policy.test.ts
```

Expected: FAIL resolving `files-hub-policy.ts`.

- [ ] **Step 3: Implement policy + constants + types + exports**

```ts
// files-hub-policy.ts (sketch — implement fully)
export function assertStageLimits(files: { size: number }[]) {
  const count = files.length;
  const totalBytes = files.reduce((a, f) => a + Math.max(0, f.size | 0), 0);
  if (count > FILES_STAGE_MAX_COUNT) {
    return { ok: false as const, reason: "count" as const, count, totalBytes };
  }
  if (totalBytes > FILES_STAGE_MAX_BYTES) {
    return { ok: false as const, reason: "bytes" as const, count, totalBytes };
  }
  return { ok: true as const };
}

export function decideOfferAfterStage(input: {
  source: FilesIngressSource;
  defaultDestinations: string[];
  openForShare: "manual" | "auto";
}) {
  const dest = (input.defaultDestinations || []).map(String).filter(Boolean);
  const openWithLike =
    input.source === "open-with" || input.source === "share-target";
  if (openWithLike) {
    if (dest.length > 0) return { phase: "readyToOffer" as const, destinations: dest };
    return { phase: "needDestinations" as const };
  }
  if (input.openForShare === "auto") {
    if (dest.length > 0) return { phase: "readyToOffer" as const, destinations: dest };
    return { phase: "needDestinations" as const };
  }
  return { phase: "needDestinations" as const };
}
```

Export from `index.ts` and ensure `package.json` `"./files"` (or main v2 index) re-exports.

- [ ] **Step 4: Run tests — expect PASS**

```bash
cd /home/u2re-dev/U2RE.space/apps/CWSP-reborn/src/shared && npm test
```

Expected: prior 46 + new policy tests green.

- [ ] **Step 5: Commit** (if human enabled)

```bash
git -C /home/u2re-dev/U2RE.space/apps/CWSP-reborn add src/shared/src/v2/files-hub-policy.ts src/shared/src/v2/files-constants.ts src/shared/src/v2/files-types.ts src/shared/src/v2/index.ts src/shared/test/v2-files-hub-policy.test.ts
git -C /home/u2re-dev/U2RE.space/apps/CWSP-reborn commit -m "feat(shared): files-hub stage limits and hybrid offer policy"
```

---

### Task 2: Neutralino files-hub stage + pack plan

**Files:**
- Create: `apps/CWSP-reborn/src/backend/node/shared/neutralino/files-hub.ts`
- Create: `apps/CWSP-reborn/src/backend/node/shared/neutralino/files-hub.test.ts`
- Modify: `apps/CWSP-reborn/src/backend/node/shared/neutralino/index.ts`

**Interfaces:**
- Consumes: `planFilesBatches` from `@fest-lib/cwsp-shared`, `assertStageLimits`, `decideOfferAfterStage`
- Produces: `createFilesHub(options)` with:
  - `ingressLocalPaths({ source, paths, defaultDestinations, openForShare }): Promise<FilesHubSession>`
  - `confirmOffer(transferId, destinations: string[]): Promise<void>` (from needDestinations)
  - `cancel(transferId): Promise<void>`
  - `getSession(transferId)` / `onPhase(cb)`
- Session holds: `transferId`, `stageDir`, `files[]`, `phase`, `batchPlan` (from W1 packer; zip bytes may be Task 3)

**Staging:**
- Root: `path.join(os.tmpdir(), "cwsp-files", transferId)` (or Neutralino app data dir if already used by clipboard-hub — match existing temp style).
- Copy each path into stageDir with basename collision suffix.
- Reject on stage limit failure; delete partial dir.

- [ ] **Step 1: Failing test — ingress creates stage + needDestinations**

```ts
import assert from "node:assert/strict";
import test from "node:test";
import { mkdtemp, writeFile, rm } from "node:fs/promises";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { createFilesHub } from "./files-hub.ts";

test("ingressLocalPaths stages and needs destinations when empty", async () => {
  const root = await mkdtemp(join(tmpdir(), "cwsp-fh-"));
  const src = join(root, "a.txt");
  await writeFile(src, "hello");
  const hub = createFilesHub({ stageRoot: join(root, "stage") });
  const session = await hub.ingressLocalPaths({
    source: "clipboard",
    paths: [src],
    defaultDestinations: [],
    openForShare: "manual",
  });
  assert.equal(session.phase, "needDestinations");
  assert.ok(session.files.some((f) => f.name === "a.txt"));
  await hub.cancel(session.transferId);
  await rm(root, { recursive: true, force: true });
});
```

- [ ] **Step 2: Run — expect FAIL**

```bash
cd /home/u2re-dev/U2RE.space/apps/CWSP-reborn && node --import ./scripts/resolve-aliases.mjs --experimental-strip-types --test src/backend/node/shared/neutralino/files-hub.test.ts
```

- [ ] **Step 3: Implement `createFilesHub` stage + policy phase + cancel GC**

Do not emit WS yet. Call W1 `planFilesBatches` on staged `{name,size}` for `batchPlan` on session.

- [ ] **Step 4: Tests PASS**

- [ ] **Step 5: Commit** (if allowed) `feat(neutralino): files-hub local stage and pack plan`

---

### Task 3: Neutralino Open for Share → build + send `files:offer`

**Files:**
- Modify: `files-hub.ts` — materialize batches (zip/raw per plan), mint local blob URLs or prepare WS chunk iterators
- Modify: prompt host / control RPC used by clipboard popup — add **files** branch (do not overload text clipboard prompt state machine)
- Modify: windows/linux Neutralino boot (`src/backend/node/windows/index.ts`) — construct hub; pass `sendPacket` adapter

**Interfaces:**
- Produces:
  - `offer(transferId, destinations: string[]): Promise<CwspPacket>` via W1 `buildFilesOfferPacket`
  - Uses hub `sendPacket(packet)` adapter for wire send
  - On `readyToOffer` after ingress (clipboard auto / open-with hybrid): call `offer` immediately
  - On `needDestinations`: expose session to UI; `confirmOffer` then `offer`

**Blob publish (minimal):**
- PUT each materialized batch to the local desk endpoint `PUT /files/blob/:transferId/:batchId` (W2) using the desk’s loopback origin (`https://127.0.0.1:8434` or configured control origin) and upload secret when set; set `asset.url` to the resulting GET URL + token.
- If PUT fails (endpoint down), fall back to embedding only for batches ≤ `SMALL_FILE_MAX` via `asset.data` (emergency); otherwise surface `files:error` and cancel — do not invent a second blob server in W3+.
- `byteTransportHint` from settings (`auto` default).

- [ ] **Step 1: Test — after confirmOffer, sendPacket called with `what: "files:offer"`**

```ts
test("confirmOffer emits files:offer packet", async () => {
  const sent: unknown[] = [];
  const hub = createFilesHub({
    stageRoot: join(root, "stage"),
    sendPacket: async (p) => {
      sent.push(p);
    },
    putBlob: async () => ({
      url: "https://127.0.0.1:8434/files/blob/t/b?token=x",
    }),
  });
  const session = await hub.ingressLocalPaths({
    source: "clipboard",
    paths: [src],
    defaultDestinations: [],
    openForShare: "manual",
  });
  await hub.confirmOffer(session.transferId, ["L-192.168.0.110"]);
  assert.equal((sent[0] as { what: string }).what, "files:offer");
});
```

- [ ] **Step 2: FAIL then implement offer builder + prompt hook**

Prompt UX: extend control RPC / prompt-host with a **separate** `FilesPromptState` (`kind: "open-for-share" | "need-destinations" | "progress"`). Do not overload `ClipboardPromptState`.

- [ ] **Step 3: PASS + commit** `feat(neutralino): files-hub offer emit and open-for-share prompt`

---

### Task 4: Neutralino progress + cancel + incoming stub

**Files:**
- Modify: `files-hub.ts` — use W1 progress helper; emit `files:progress` via `buildFilesProgressPacket` at ≤ 4 Hz while sending/receiving
- Test: after `hub.reportBytes(transferId, bytesDone, totalBytes)`, session exposes `speedBps` / `etaMs`; `cancel` deletes `stageDir`

**W3+ incoming stub (desk):**
- On inbound packet `what === "files:offer"`: if `acceptMode === "manual"` set `FilesPromptState` Accept/Decline; on Accept send `buildFilesAcceptPacket` and **HTTP GET** each `batch.asset.url` into `landingDir` temp (default `os.tmpdir()/cwsp-files-in/<transferId>`). If GET fails, send `files:error` and keep prompt dismissed. No SAF (desktop). Full polish can wait; this path must not throw into clipboard-hub.

- [ ] **Step 1:** Failing tests for progress fields + cancel GC + accept GET mock.
- [ ] **Step 2:** Implement.
- [ ] **Step 3:** PASS.
- [ ] **Step 4:** Commit `feat(neutralino): files-hub progress cancel and accept pull`

---

### Task 5: Android manifest Open-with + Temp stage

**Files:**
- Modify: `apps/CWSP-reborn/app/android/AndroidManifest.xml` — add filters on existing `ShareActivity` (same activity as text/image share):

```xml
<!-- Open / share any file into CWSP files-hub (Amendment A2) -->
<intent-filter>
  <action android:name="android.intent.action.VIEW" />
  <category android:name="android.intent.category.DEFAULT" />
  <category android:name="android.intent.category.BROWSABLE" />
  <data android:mimeType="*/*" />
</intent-filter>
<intent-filter>
  <action android:name="android.intent.action.SEND" />
  <category android:name="android.intent.category.DEFAULT" />
  <data android:mimeType="*/*" />
</intent-filter>
<intent-filter>
  <action android:name="android.intent.action.SEND_MULTIPLE" />
  <category android:name="android.intent.category.DEFAULT" />
  <data android:mimeType="*/*" />
</intent-filter>
```

- Modify: `ShareTarget.java` — when MIME is not clipboard-text and not “small image clipboard path”, **stage** streams:

**New helpers (same file or `FilesIngress.java` beside it):**
- `File stageRoot = context.getFilesDir()/files/outgoing/<transferId>/`
- Copy each Uri with `ContentResolver.openInputStream` → file; collect `{name,size,path}`
- Enforce stage caps (same numbers as shared; duplicate constants in Java with comment `COMPAT: keep in sync with FILES_STAGE_MAX_*`)
- On success: `CwsBridgePlugin.emitFilesIngress(json)` with `{ transferId, source: "open-with"|"share-target", files:[{name,size}], stageDir }`
- Do **not** call `clipboard.writeAsset` for this branch

Keep existing text + image→clipboard behavior for `text/plain` and small `image/*` share (current code path).

- [ ] **Step 1:** Document expected `am start` in test comments; add a small JVM unit test if the project already has Java tests for ShareTarget — otherwise a package-visible staging helper tested via `check:java-*` if available.

- [ ] **Step 2:** Implement staging + manifest.

- [ ] **Step 3:** `./gradlew :app:assembleCwspDebug` (or project’s Cap assemble) compiles.

- [ ] **Step 4:** Commit `feat(android): open-with stages files to app Temp for files-hub`

---

### Task 6: Bridge + Cap hybrid offer

**Files:**
- Modify: `apps/CWSP-reborn/src/backend/java/space/u2re/cwsp/CwsBridgePlugin.java` — static `emitFilesIngress(JSONObject)` notify listeners / `notifyListeners("cwspFilesIngress", …)`
- Create: `apps/CWSP-reborn/src/frontend/web/capacitor/android/web/logic/files-hub.ts` — subscribe to bridge event → `decideOfferAfterStage` → pack via bridge → `buildFilesOfferPacket` → existing Cap WS send path
- Modify: Cap android boot/entry that already registers clipboard listeners — call `startFilesHub()` once
- Add Java pack helpers in `FilesIngress.java` (same package as ShareTarget): `materializeBatches(stageDir, plan)` writing zip/raw files; bridge methods `filesListStaged`, `filesReadBatch`, `filesPutBlob` (HTTP PUT to configured endpoint)

**Minimal pack on phone:**
- Single file raw or multi-small zip (W1 `planFilesBatches` mirrored in Java or plan computed in JS from sizes then Java executes).
- Prefer HTTP PUT to phone-local or desk-reachable `/files/blob/...`; if PUT unreachable and batch ≤ 16 MiB, send `files:chunk` over existing OkHttp WS.

- [ ] **Step 1:** Shared policy already covers hybrid; add Cap unit or bridge mock test if Cap test harness exists — otherwise assert in Java that `emitFilesIngress` payload includes `source` + `transferId`.

- [ ] **Step 2:** Implement bridge event + offer send + destination picker UI (minimal: list `defaultDestinations` from settings blob; if empty, single text field for peer id + Confirm).

- [ ] **Step 3:** Manual smoke (record in `.superpowers/sdd/progress-w3.md`):

```text
adb shell am start -a android.intent.action.SEND -t application/octet-stream \
  --eu android.intent.extra.STREAM file:///sdcard/Download/test.bin \
  -n space.u2re.cwsp/.ShareActivity
# Expect: Temp under files/outgoing; logcat FilesIngress; offer or picker
```

- [ ] **Step 4:** Commit `feat(capacitor): files ingress bridge and hybrid offer`

---

### Task 7: Integration wire-up + regression gates

**Files:**
- Ensure Neutralino boot constructs files-hub once (beside clipboard-hub) and does not double-start.
- Ensure Cap app registers files-hub listener at startup.
- Run gates:

```bash
cd /home/u2re-dev/U2RE.space/apps/CWSP-reborn/src/shared && npm test
cd /home/u2re-dev/U2RE.space/apps/CWSP-reborn && node --import ./scripts/resolve-aliases.mjs --experimental-strip-types --test src/backend/node/shared/neutralino/files-hub.test.ts
cd /home/u2re-dev/U2RE.space/apps/CWSP-reborn && npm run check:clipboard-backend
cd /home/u2re-dev/U2RE.space/apps/CWSP-reborn/runtime/endpoint && node --import tsx --test server-v2/files/*.test.ts server-v2/protocol/http/routers/files/*.test.ts server-v2/protocol/socket/handlers/files.test.ts
```

Expected: shared + hub + clipboard-backend + W2 files tests green.

- [ ] **Step 1:** Fix any boot/import issues.
- [ ] **Step 2:** Write `apps/CWSP-reborn/.superpowers/sdd/progress-w3.md` ledger (commands + results).
- [ ] **Step 3:** Commit `chore(cwsp): wire files-hub boot and verify W3+ gates` (if allowed)

---

## Spec coverage (self-review)

| A2 / design requirement | Task |
|---|---|
| Shared hub core + adapters | 1–2, 6 |
| Neutralino Open for Share / pack / offer / progress | 2–4 |
| Android Open-with → Temp | 5 |
| Hybrid offer | 1, 3, 6 |
| No clipboard path for multi-file open-with | 5–6 |
| Stage caps | 1, 5 |
| Desktop shell Open-with deferred | (none — explicit) |
| Full Cap incoming SAF | W4 — stub only in 4 |
| W1/W2 unchanged contracts | 7 regression |

## Out of scope (do not implement in W3+)

- Desktop Explorer “Open with CWSP”
- `MANAGE_EXTERNAL_STORAGE`
- W5 settings UI
- Full Android incoming notification + SAF export polish

---

## Execution handoff

Plan complete and saved to `docs/superpowers/plans/2026-07-21-cwsp-files-transfer-w3.md`.

**Two execution options:**

1. **Subagent-Driven (recommended)** — fresh subagent per task, review between tasks  
2. **Inline Execution** — execute in this session with checkpoints  

Which approach?
