# CWSP Files Transfer — Wave 1 (cwsp-shared) Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Land the transport-neutral `files:*` contract, packer policy, chunk/progress helpers, and tests in `@fest-lib/cwsp-shared` so Neutralino/Capacitor/endpoint waves can consume one API.

**Architecture:** Pure TypeScript modules beside `v2/clipboard.ts`. No Node `fs`, no Neutralino, no Android. Packer classifies file size entries into zip/raw/compressed batch plans; builders emit offer/chunk/progress payloads; progress tracker computes speed/ETA. Byte I/O stays in later waves.

**Tech Stack:** Node ≥22.6, `node:test` + `--experimental-strip-types`, `@fest-lib/cwsp-shared` ESM.

**Models:** GLM-5.2 implement; Grok audit. **Do not use Composer / Sol.**

**Spec:** `docs/superpowers/specs/2026-07-21-cwsp-files-transfer-design.md` (incl. Amendment A1)

**Follow-up plans (do not implement in this plan):**
- W2 endpoint relay + blob HTTP + route probe → `docs/superpowers/plans/2026-07-21-cwsp-files-transfer-w2.md` (create when W1 merges)
- W3 Neutralino files-hub
- W4 Capacitor notification/SAF/WS chunks
- W5 settings UI (`byteTransport`, destinations)

## Global Constraints

- Do not change auto `clipboard:update` text/image behavior.
- `purpose` for `files:*` is `"storage"`.
- `CHUNK_MAX = 16 * 1024 * 1024` (16 MiB).
- Packer thresholds: `SMALL_FILE_MAX = 500 * 1024`, `ZIP_BATCH_MAX = 8 * 1024 * 1024`, `RAW_FILE_MIN = 8 * 1024 * 1024 + 1`, `COMPRESS_TRY_MIN = 12 * 1024 * 1024 + 1`, `COMPRESS_WORTHWHILE = 0.10`.
- Wire `DataAssetEnvelope` remains clean (`hash`, `name`, `mimeType`, `size`, `source`, optional `data`/`url` only).
- Edit canonical paths under `modules/projects/cwsp-shared/` only in this wave.
- Tests: `cd modules/projects/cwsp-shared && npm test`.
- Commits: Conventional Commits; only when the human asks, or at end of each task if the human enabled commit-per-task.

---

## File map (W1)

| File | Role |
|---|---|
| Create: `modules/projects/cwsp-shared/src/v2/files-constants.ts` | Thresholds + action name constants |
| Create: `modules/projects/cwsp-shared/src/v2/files-types.ts` | Offer/batch/chunk/progress TypeScript types |
| Create: `modules/projects/cwsp-shared/src/v2/files-packer.ts` | Pure packer plan from `{name,size}[]` |
| Create: `modules/projects/cwsp-shared/src/v2/files-progress.ts` | EMA speed + ETA helper |
| Create: `modules/projects/cwsp-shared/src/v2/files.ts` | Parse/build offer, chunk, progress, accept payloads |
| Create: `modules/projects/cwsp-shared/test/v2-files.test.ts` | Unit tests |
| Modify: `modules/projects/cwsp-shared/src/v2/normalize.ts` | `files` domain → `purpose: "storage"` |
| Modify: `modules/projects/cwsp-shared/src/v2/index.ts` | Re-export files surface |
| Modify: `modules/projects/cwsp-shared/package.json` | Optional `./files` export |
| Modify: `modules/projects/cwsp-shared/fixtures/v2/packets.json` | Golden `files:offer` / `files:chunk` / `files:progress` samples (optional if schema-loose) |

---

### Task 1: Constants + types

**Files:**
- Create: `modules/projects/cwsp-shared/src/v2/files-constants.ts`
- Create: `modules/projects/cwsp-shared/src/v2/files-types.ts`
- Test: `modules/projects/cwsp-shared/test/v2-files.test.ts`

**Interfaces:**
- Produces: `FILES_ACTIONS`, size thresholds, `FilesOfferPayload`, `FilesBatchPlan`, `FilesChunkPayload`, `FilesProgressPayload`, `ByteTransport`

- [ ] **Step 1: Write the failing test**

```ts
// modules/projects/cwsp-shared/test/v2-files.test.ts
import assert from "node:assert/strict";
import test from "node:test";
import {
  CHUNK_MAX,
  SMALL_FILE_MAX,
  ZIP_BATCH_MAX,
  FILES_WHAT_OFFER,
} from "../src/v2/files-constants.ts";

test("files constants match design thresholds", () => {
  assert.equal(SMALL_FILE_MAX, 500 * 1024);
  assert.equal(ZIP_BATCH_MAX, 8 * 1024 * 1024);
  assert.equal(CHUNK_MAX, 16 * 1024 * 1024);
  assert.equal(FILES_WHAT_OFFER, "files:offer");
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `cd /home/u2re-dev/U2RE.space/modules/projects/cwsp-shared && node --experimental-strip-types --test test/v2-files.test.ts`

Expected: FAIL — cannot find module `files-constants.ts`

- [ ] **Step 3: Write minimal implementation**

```ts
// modules/projects/cwsp-shared/src/v2/files-constants.ts
export const SMALL_FILE_MAX = 500 * 1024;
export const ZIP_BATCH_MAX = 8 * 1024 * 1024;
export const RAW_FILE_MIN = 8 * 1024 * 1024 + 1;
export const COMPRESS_TRY_MIN = 12 * 1024 * 1024 + 1;
export const COMPRESS_WORTHWHILE = 0.1;
export const CHUNK_MAX = 16 * 1024 * 1024;
export const PROGRESS_EMIT_MAX_HZ = 4;
export const OFFER_TTL_MS_DEFAULT = 15 * 60 * 1000;

export const FILES_WHAT_OFFER = "files:offer";
export const FILES_WHAT_ACCEPT = "files:accept";
export const FILES_WHAT_DECLINE = "files:decline";
export const FILES_WHAT_CHUNK = "files:chunk";
export const FILES_WHAT_CHUNK_ACK = "files:chunk-ack";
export const FILES_WHAT_PROGRESS = "files:progress";
export const FILES_WHAT_DONE = "files:done";
export const FILES_WHAT_ERROR = "files:error";

export const FILES_ACTIONS = [
  FILES_WHAT_OFFER,
  FILES_WHAT_ACCEPT,
  FILES_WHAT_DECLINE,
  FILES_WHAT_CHUNK,
  FILES_WHAT_CHUNK_ACK,
  FILES_WHAT_PROGRESS,
  FILES_WHAT_DONE,
  FILES_WHAT_ERROR,
] as const;
```

```ts
// modules/projects/cwsp-shared/src/v2/files-types.ts
import type { DataAssetEnvelope } from "./types.ts";

export type ByteTransport = "http" | "ws" | "auto";
export type FilesBatchKind = "zip" | "raw" | "compressed";

export interface FilesLogicalFile {
  name: string;
  size: number;
  hash?: string;
}

export interface FilesBatchDescriptor {
  batchId: string;
  index: number;
  count: number;
  kind: FilesBatchKind;
  asset: DataAssetEnvelope;
  files: FilesLogicalFile[];
}

export interface FilesOfferPayload {
  transferId: string;
  sender: string;
  destinations?: string[];
  createdAt: number;
  expiresAt: number;
  summary: { fileCount: number; totalBytes: number; label?: string };
  batches: FilesBatchDescriptor[];
  flags?: { openForShare?: boolean; autoAcceptHint?: boolean };
  byteTransportHint?: ByteTransport;
}

export interface FilesAcceptPayload {
  transferId: string;
  byteTransport?: ByteTransport;
}

export interface FilesChunkPayload {
  transferId: string;
  batchId: string;
  chunkIndex: number;
  chunkCount: number;
  offset: number;
  size: number;
  hash?: string;
  encoding: "base64" | "binary-frame";
  data?: string;
}

export interface FilesProgressPayload {
  transferId: string;
  bytesDone: number;
  totalBytes: number;
  batchIndex: number;
  batchCount: number;
  speedBps: number;
  etaMs: number | null;
}

/** Packer input — sizes only; no filesystem. */
export interface FilesPackerInputFile {
  name: string;
  size: number;
}

export interface FilesPackerBatchPlan {
  kind: FilesBatchKind;
  files: FilesPackerInputFile[];
  /** Uncompressed sum of member sizes (planning aid). */
  totalUncompressed: number;
}
```

- [ ] **Step 4: Run test to verify it passes**

Run: `cd /home/u2re-dev/U2RE.space/modules/projects/cwsp-shared && node --experimental-strip-types --test test/v2-files.test.ts`

Expected: PASS for constants test

- [ ] **Step 5: Commit** (when human allows)

```bash
git add modules/projects/cwsp-shared/src/v2/files-constants.ts \
  modules/projects/cwsp-shared/src/v2/files-types.ts \
  modules/projects/cwsp-shared/test/v2-files.test.ts
git commit -m "$(cat <<'EOF'
feat(cwsp-shared): add files-transfer constants and types

EOF
)"
```

---

### Task 2: Packer policy (pure)

**Files:**
- Create: `modules/projects/cwsp-shared/src/v2/files-packer.ts`
- Modify: `modules/projects/cwsp-shared/test/v2-files.test.ts`

**Interfaces:**
- Consumes: `FilesPackerInputFile`, thresholds from `files-constants.ts`
- Produces: `planFilesBatches(files: FilesPackerInputFile[]): FilesPackerBatchPlan[]`

- [ ] **Step 1: Write the failing tests**

```ts
import { planFilesBatches } from "../src/v2/files-packer.ts";

test("packer groups small files into zip batches under ZIP_BATCH_MAX", () => {
  const files = [
    { name: "a.txt", size: 200 * 1024 },
    { name: "b.txt", size: 200 * 1024 },
    { name: "c.txt", size: 200 * 1024 },
  ];
  const plan = planFilesBatches(files);
  assert.equal(plan.length, 1);
  assert.equal(plan[0].kind, "zip");
  assert.equal(plan[0].files.length, 3);
});

test("packer emits raw for single file between 8MiB and 12MiB", () => {
  const plan = planFilesBatches([{ name: "big.bin", size: 9 * 1024 * 1024 }]);
  assert.equal(plan.length, 1);
  assert.equal(plan[0].kind, "raw");
});

test("packer marks >12MiB as compress-try (compressed kind plan)", () => {
  const plan = planFilesBatches([{ name: "huge.bin", size: 13 * 1024 * 1024 }]);
  assert.equal(plan.length, 1);
  assert.equal(plan[0].kind, "compressed");
});

test("packer splits small files across zip batches when sum exceeds ZIP_BATCH_MAX", () => {
  const files = Array.from({ length: 20 }, (_, i) => ({
    name: `f${i}.bin`,
    size: 500 * 1024,
  }));
  const plan = planFilesBatches(files);
  assert.ok(plan.length >= 2);
  for (const batch of plan) {
    assert.equal(batch.kind, "zip");
    assert.ok(batch.totalUncompressed <= 8 * 1024 * 1024);
  }
});
```

- [ ] **Step 2: Run tests — expect FAIL** (module missing / function undefined)

- [ ] **Step 3: Implement `planFilesBatches`**

```ts
// modules/projects/cwsp-shared/src/v2/files-packer.ts
import {
  COMPRESS_TRY_MIN,
  RAW_FILE_MIN,
  SMALL_FILE_MAX,
  ZIP_BATCH_MAX,
} from "./files-constants.ts";
import type { FilesPackerBatchPlan, FilesPackerInputFile } from "./files-types.ts";

/**
 * Pure packing plan from logical file sizes.
 * WHY: platform adapters only execute zip/compress/IO; policy stays shared.
 * NOTE: kind "compressed" means "attempt compress at execute time"; if savings
 * &lt; COMPRESS_WORTHWHILE, the platform must downgrade that batch to "raw".
 */
export function planFilesBatches(files: readonly FilesPackerInputFile[]): FilesPackerBatchPlan[] {
  const small: FilesPackerInputFile[] = [];
  const large: FilesPackerBatchPlan[] = [];

  for (const file of files) {
    if (!file?.name || !Number.isFinite(file.size) || file.size < 0) {
      throw new Error("CWSP_FILES_PACKER_INVALID_FILE");
    }
    if (file.size >= COMPRESS_TRY_MIN) {
      large.push({ kind: "compressed", files: [file], totalUncompressed: file.size });
    } else if (file.size >= RAW_FILE_MIN) {
      large.push({ kind: "raw", files: [file], totalUncompressed: file.size });
    } else if (file.size <= SMALL_FILE_MAX) {
      small.push(file);
    } else {
      // Between SMALL_FILE_MAX and RAW_FILE_MIN: still zip-candidate alone or with room.
      small.push(file);
    }
  }

  const zipBatches: FilesPackerBatchPlan[] = [];
  let current: FilesPackerInputFile[] = [];
  let currentSum = 0;
  for (const file of small) {
    if (current.length > 0 && currentSum + file.size > ZIP_BATCH_MAX) {
      zipBatches.push({ kind: "zip", files: current, totalUncompressed: currentSum });
      current = [];
      currentSum = 0;
    }
    if (file.size > ZIP_BATCH_MAX) {
      // Single member larger than zip cap but below RAW_FILE_MIN → solo zip/raw-ish zip batch.
      zipBatches.push({ kind: "zip", files: [file], totalUncompressed: file.size });
      continue;
    }
    current.push(file);
    currentSum += file.size;
  }
  if (current.length) {
    zipBatches.push({ kind: "zip", files: current, totalUncompressed: currentSum });
  }

  return [...zipBatches, ...large];
}

/** After real compress: keep compressed only if ratio saved ≥ COMPRESS_WORTHWHILE. */
export function resolveCompressKind(
  originalSize: number,
  compressedSize: number,
): "compressed" | "raw" {
  if (originalSize <= 0) return "raw";
  const saved = (originalSize - compressedSize) / originalSize;
  return saved >= 0.1 ? "compressed" : "raw";
}

export function planChunkCount(batchByteSize: number, chunkMax = 16 * 1024 * 1024): number {
  if (batchByteSize <= 0) return 0;
  return Math.ceil(batchByteSize / chunkMax);
}
```

- [ ] **Step 4: Run tests — expect PASS**

Run: `cd /home/u2re-dev/U2RE.space/modules/projects/cwsp-shared && node --experimental-strip-types --test test/v2-files.test.ts`

- [ ] **Step 5: Commit** (when human allows)

```bash
git add modules/projects/cwsp-shared/src/v2/files-packer.ts modules/projects/cwsp-shared/test/v2-files.test.ts
git commit -m "$(cat <<'EOF'
feat(cwsp-shared): add pure files packer batch planner

EOF
)"
```

---

### Task 3: Progress EMA + ETA

**Files:**
- Create: `modules/projects/cwsp-shared/src/v2/files-progress.ts`
- Modify: `modules/projects/cwsp-shared/test/v2-files.test.ts`

**Interfaces:**
- Produces: `createFilesProgressTracker()`, `FilesProgressTracker.update(bytesDone, nowMs)`, `.snapshot(totalBytes, batchIndex, batchCount, transferId)`

- [ ] **Step 1: Write failing tests**

```ts
import { createFilesProgressTracker } from "../src/v2/files-progress.ts";

test("progress tracker reports increasing speed and finite ETA", () => {
  const t = createFilesProgressTracker();
  t.update(0, 1_000);
  t.update(2_000_000, 2_000); // ~2 MB/s over 1s
  const snap = t.snapshot({
    transferId: "t1",
    totalBytes: 10_000_000,
    batchIndex: 0,
    batchCount: 1,
  });
  assert.equal(snap.transferId, "t1");
  assert.equal(snap.bytesDone, 2_000_000);
  assert.ok(snap.speedBps > 0);
  assert.ok(snap.etaMs !== null && snap.etaMs! > 0);
});

test("progress tracker returns null ETA when speed is zero", () => {
  const t = createFilesProgressTracker();
  t.update(0, 1_000);
  const snap = t.snapshot({
    transferId: "t1",
    totalBytes: 100,
    batchIndex: 0,
    batchCount: 1,
  });
  assert.equal(snap.etaMs, null);
});
```

- [ ] **Step 2: Run — expect FAIL**

- [ ] **Step 3: Implement**

```ts
// modules/projects/cwsp-shared/src/v2/files-progress.ts
import type { FilesProgressPayload } from "./files-types.ts";

export interface FilesProgressTracker {
  update(bytesDone: number, nowMs: number): void;
  snapshot(input: {
    transferId: string;
    totalBytes: number;
    batchIndex: number;
    batchCount: number;
  }): FilesProgressPayload;
}

/**
 * PERF: EMA over ~1.5s so UI speed does not jitter on every chunk.
 */
export function createFilesProgressTracker(alpha = 0.35): FilesProgressTracker {
  let bytesDone = 0;
  let lastMs = 0;
  let speedBps = 0;
  let hasSample = false;

  return {
    update(nextDone: number, nowMs: number) {
      if (hasSample && nowMs > lastMs && nextDone >= bytesDone) {
        const dt = (nowMs - lastMs) / 1000;
        const inst = (nextDone - bytesDone) / dt;
        speedBps = hasSample && speedBps > 0
          ? alpha * inst + (1 - alpha) * speedBps
          : inst;
      }
      bytesDone = nextDone;
      lastMs = nowMs;
      hasSample = true;
    },
    snapshot(input) {
      const remaining = Math.max(0, input.totalBytes - bytesDone);
      const etaMs = speedBps > 1 ? Math.round((remaining / speedBps) * 1000) : null;
      return {
        transferId: input.transferId,
        bytesDone,
        totalBytes: input.totalBytes,
        batchIndex: input.batchIndex,
        batchCount: input.batchCount,
        speedBps: Math.round(speedBps),
        etaMs,
      };
    },
  };
}

export function shouldEmitProgress(lastEmitMs: number, nowMs: number, maxHz = 4): boolean {
  const minGap = 1000 / maxHz;
  return nowMs - lastEmitMs >= minGap;
}
```

- [ ] **Step 4: Run — expect PASS**

- [ ] **Step 5: Commit** (when human allows)

```bash
git add modules/projects/cwsp-shared/src/v2/files-progress.ts modules/projects/cwsp-shared/test/v2-files.test.ts
git commit -m "$(cat <<'EOF'
feat(cwsp-shared): add files transfer progress speed/ETA tracker

EOF
)"
```

---

### Task 4: Build/parse offer, accept, chunk, progress

**Files:**
- Create: `modules/projects/cwsp-shared/src/v2/files.ts`
- Modify: `modules/projects/cwsp-shared/test/v2-files.test.ts`

**Interfaces:**
- Consumes: types + `normalizeDataAssetEnvelope`, `createCwspPacket`
- Produces:
  - `parseFilesOfferPayload(value: unknown): FilesOfferPayload | undefined`
  - `buildFilesOfferPacket(input: {...}): CwspPacket`
  - `parseFilesChunkPayload(value: unknown): FilesChunkPayload | undefined`
  - `buildFilesChunkPacket(input: {...}): CwspPacket`
  - `buildFilesProgressPacket(payload: FilesProgressPayload, meta: {...}): CwspPacket`
  - `chooseByteTransport(hint, batchSize, httpReachable): "http" | "ws"`

- [ ] **Step 1: Write failing tests**

```ts
import { createCwspPacket } from "../src/v2/packet.ts";
import {
  buildFilesOfferPacket,
  parseFilesOfferPayload,
  chooseByteTransport,
  parseFilesChunkPayload,
} from "../src/v2/files.ts";
import { CHUNK_MAX } from "../src/v2/files-constants.ts";

test("build/parse files:offer round-trip", () => {
  const packet = buildFilesOfferPacket({
    transferId: "tr-1",
    sender: "L-192.168.0.110",
    destinations: ["L-192.168.0.196"],
    createdAt: 1_700_000_000_000,
    expiresAt: 1_700_000_900_000,
    summary: { fileCount: 1, totalBytes: 100 },
    batches: [{
      batchId: "b0",
      index: 0,
      count: 1,
      kind: "zip",
      asset: {
        hash: "abc",
        name: "batch-abc.zip",
        mimeType: "application/zip",
        size: 100,
        source: "file",
        url: "https://192.168.0.110:8434/files/blob/tr-1/b0",
      },
      files: [{ name: "a.txt", size: 100 }],
    }],
    byteTransportHint: "auto",
  });
  assert.equal(packet.what, "files:offer");
  assert.equal(packet.purpose, "storage");
  const parsed = parseFilesOfferPayload(packet.payload);
  assert.ok(parsed);
  assert.equal(parsed!.transferId, "tr-1");
  assert.equal(parsed!.batches[0].asset.hash, "abc");
});

test("chooseByteTransport auto prefers http for small reachable batches", () => {
  assert.equal(chooseByteTransport("auto", CHUNK_MAX, true), "http");
  assert.equal(chooseByteTransport("auto", CHUNK_MAX + 1, true), "ws");
  assert.equal(chooseByteTransport("auto", 100, false), "ws");
  assert.equal(chooseByteTransport("ws", 100, true), "ws");
  assert.equal(chooseByteTransport("http", CHUNK_MAX + 1, true), "http");
});

test("parseFilesChunkPayload rejects oversized chunk", () => {
  assert.equal(
    parseFilesChunkPayload({
      transferId: "t",
      batchId: "b",
      chunkIndex: 0,
      chunkCount: 1,
      offset: 0,
      size: CHUNK_MAX + 1,
      encoding: "base64",
    }),
    undefined,
  );
});
```

- [ ] **Step 2: Run — expect FAIL**

- [ ] **Step 3: Implement `files.ts`**

Implement builders that call `createCwspPacket({ op, what, purpose: "storage", sender, nodes, payload, ... })`. Parsers must:
- require `transferId` string
- require `batches` array with `normalizeDataAssetEnvelope` on each `asset`
- reject chunk `size > CHUNK_MAX`
- ignore unknown fields

`chooseByteTransport(hint: ByteTransport, batchSize: number, httpReachable: boolean): "http" | "ws"`:
- `http` / `ws` → forced
- `auto` → `http` if `httpReachable && batchSize <= CHUNK_MAX`, else `ws`

- [ ] **Step 4: Run — expect PASS**

- [ ] **Step 5: Commit** (when human allows)

```bash
git add modules/projects/cwsp-shared/src/v2/files.ts modules/projects/cwsp-shared/test/v2-files.test.ts
git commit -m "$(cat <<'EOF'
feat(cwsp-shared): build/parse files offer chunk and transport choice

EOF
)"
```

---

### Task 5: Normalize `files:` → purpose storage + exports

**Files:**
- Modify: `modules/projects/cwsp-shared/src/v2/normalize.ts` (`inferCwspPurpose` switch)
- Modify: `modules/projects/cwsp-shared/src/v2/index.ts`
- Modify: `modules/projects/cwsp-shared/package.json` (add `"./files": "./src/v2/files.ts"`)
- Modify: `modules/projects/cwsp-shared/test/v2-files.test.ts`

**Interfaces:**
- Consumes: existing `normalizeCwspPacket`
- Produces: packets with `what: "files:offer"` normalize to `purpose: "storage"`

- [ ] **Step 1: Write failing test**

```ts
import { normalizeCwspPacket } from "../src/v2/normalize.ts";

test("normalizeCwspPacket maps files:* to purpose storage", () => {
  const packet = normalizeCwspPacket({
    op: "act",
    what: "files:offer",
    uuid: "00000000-0000-4000-8000-000000000001",
    timestamp: Date.now(),
    sender: "L-192.168.0.110",
    payload: { transferId: "tr" },
    flags: { canonicalV2: true },
  });
  assert.equal(packet.purpose, "storage");
});
```

- [ ] **Step 2: Run — expect FAIL** (`purpose` is `"general"`)

- [ ] **Step 3: Patch `inferCwspPurpose`**

In `normalize.ts` switch on `domain`, add:

```ts
case "files":
    return "storage";
```

Re-export from `index.ts`:

```ts
export * from "./files-constants.ts";
export * from "./files-types.ts";
export * from "./files-packer.ts";
export * from "./files-progress.ts";
export * from "./files.ts";
```

Add package export `"./files": "./src/v2/files.ts"`.

- [ ] **Step 4: Run full package tests**

Run: `cd /home/u2re-dev/U2RE.space/modules/projects/cwsp-shared && npm test`

Expected: all existing tests still PASS; `v2-files` PASS

- [ ] **Step 5: Commit** (when human allows)

```bash
git add modules/projects/cwsp-shared/src/v2/normalize.ts \
  modules/projects/cwsp-shared/src/v2/index.ts \
  modules/projects/cwsp-shared/package.json \
  modules/projects/cwsp-shared/test/v2-files.test.ts
git commit -m "$(cat <<'EOF'
feat(cwsp-shared): map files:* to storage purpose and export files API

EOF
)"
```

---

### Task 6: W1 verification checklist

- [ ] **Step 1:** `cd /home/u2re-dev/U2RE.space/modules/projects/cwsp-shared && npm run check`
- [ ] **Step 2:** Confirm exports resolve: `node --experimental-strip-types -e 'import "@fest-lib/cwsp-shared/files"'` from a cwd that resolves the workspace package (or relative import smoke in test).
- [ ] **Step 3:** Update pantry note: W1 complete; next plan W2.
- [ ] **Step 4:** Stop. Do **not** start Neutralino/Capacitor/endpoint work in this plan.

---

## Spec coverage (self-review)

| Spec item | Task |
|---|---|
| `files:*` actions + `purpose: storage` | T1, T4, T5 |
| Offer/batch/`DataAsset` shape | T1, T4 |
| Packer 500KB / 8MB / 12MB compress-try | T2 |
| Dual transport `auto\|http\|ws` + 16MiB chunks | T1, T4 (`CHUNK_MAX`, `chooseByteTransport`) |
| Progress bar fields speed/ETA | T3 |
| HTTP/WS platform I/O, SAF, Neutralino UI | **Deferred W2–W5** |
| Route LAN-prefer | **Deferred W2** |
| Settings contribution | **Deferred W5** |

## Placeholder scan

None intentional. Platform I/O explicitly deferred to follow-up plan files.

## Type consistency

- `FilesOfferPayload`, `FilesChunkPayload`, `FilesProgressPayload` names are stable for W2–W5.
- `chooseByteTransport` returns only `"http" | "ws"` (resolved), never `"auto"`.
