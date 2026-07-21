# CWSP Files Transfer — Wave 2 (endpoint) Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Make the CWSP endpoint relay `files:*` signaling correctly, optionally stage/serve blob bytes over HTTP(S), and expose LAN-prefer route probes so receivers can run `chooseByteTransport` / URL rewrite.

**Architecture:** Endpoint never “applies” files to an OS clipboard. It (1) normalizes and forwards `files:offer|accept|decline|chunk|chunk-ack|progress|done|error` like other coordinator packets, (2) optionally hosts a TTL’d blob store at `GET|PUT /files/blob/:transferId/:batchId` with short-lived tokens, (3) may rewrite `asset.url` in offers when acting as gateway so WAN peers pull via `.200` / public entry. Progress/speed/ETA stay client-authored; endpoint only relays `files:progress`.

**Tech Stack:** Node ≥22, Fastify (server-v2 HTTP routers), existing `/ws` coordinator, `@fest-lib/cwsp-shared` / `runtime/endpoint/shared` (symlink to W1 files API), `node --import tsx --test`.

**Models:** GLM-5.2 implement; Grok audit. **Do not use Composer / Sol.**

**Spec:** `docs/superpowers/specs/2026-07-21-cwsp-files-transfer-design.md` (§1, §2 blob HTTP/WS, §5 routing; Amendment A1)  
**Depends on:** W1 merged (`files.ts`, `chooseByteTransport`, `CHUNK_MAX`, `FILES_PURPOSE`, packer/progress types)  
**Follow-ups:** W3 Neutralino files-hub; W4 Capacitor; W5 settings UI

## Global Constraints

- Canonical tree: `apps/CWSP-reborn/runtime/endpoint/` (compat symlinks under `runtime/cwsp/endpoint` — edit SoT once).
- Do **not** write multi-file payloads into OS clipboard on the endpoint.
- Gateway L-200 (and `CWS_CLIPBOARD_RELAY_ONLY`) style hosts are **relay-only** for files too — forward signaling; blob proxy optional.
- Blob path: `/files/blob/:transferId/:batchId` (token query or `X-CWSP-Files-Token` header).
- `CHUNK_MAX = 16 MiB` — WS chunk relay must not buffer an unbounded whole transfer in memory on the gateway when avoidable (stream/forward frame).
- Prefer importing W1 helpers from `shared/v2/files*.ts` (already linked); do not duplicate packer/progress logic.
- Do not edit Neutralino/Capacitor app code in this wave.
- Avoid drive-by edits under `portable/endpoint-portable/` unless that path is the same inode as SoT (prefer `server-v2/` + `server/`).
- Tests: `cd apps/CWSP-reborn/runtime/endpoint && npm run test:gateway` plus new `node --import tsx --test` files listed per task.
- Commits: Conventional Commits; only when human allows / SDD Method 1.

---

## File map (W2)

| File | Role |
|---|---|
| Create: `server-v2/files/blob-store.ts` | TTL staging: put/get/delete by transferId+batchId; token mint/verify |
| Create: `server-v2/files/route-probe.ts` | Pure helpers: probe result cache, URL candidate order (LAN→gateway LAN→WAN) |
| Create: `server-v2/files/rewrite-offer.ts` | Rewrite `FilesOfferPayload` batch `asset.url` for gateway publish |
| Create: `server-v2/protocol/socket/handlers/files.ts` | Local handling hooks (mostly no-op / ack); never OS apply |
| Create: `server-v2/protocol/http/routers/files/index.ts` | Register Fastify `GET|PUT|HEAD|DELETE /files/blob/...` |
| Modify: `server-v2/protocol/http/routers/index.ts` | Register `files` router |
| Modify: `server-v2/protocol/socket/handler.ts` (and/or live `server/network/socket/websocket.ts`) | Dispatch/forward `files:*` without clipboard path |
| Modify: `server/routing/core-app.ts` **or** server-v2 HTTP boot | Ensure `/files/*` mounted on the same host that serves `:8434` |
| Create: `server-v2/files/blob-store.test.ts` | Unit tests for store + token |
| Create: `server-v2/files/rewrite-offer.test.ts` | URL rewrite tests |
| Create: `server-v2/protocol/http/routers/files/files-http.test.ts` | HTTP blob round-trip test (Fastify inject) |
| Optional: `server/routing/core-app.ts` | `HEAD /files/probe` sibling to `/lna-probe` for byte-path reachability |

---

### Task 1: Blob store + token

**Files:**
- Create: `apps/CWSP-reborn/runtime/endpoint/server-v2/files/blob-store.ts`
- Create: `apps/CWSP-reborn/runtime/endpoint/server-v2/files/blob-store.test.ts`

**Interfaces:**
- Produces:
  - `createFilesBlobStore(options?: { rootDir?: string; ttlMs?: number })`
  - `store.put({ transferId, batchId, bytes, token?, expiresAt? }): Promise<{ token: string; size: number; path: string }>`
  - `store.get({ transferId, batchId, token }): Promise<Buffer | null>` (null if missing/expired/bad token)
  - `store.delete(transferId, batchId?): Promise<void>`
  - `mintFilesBlobToken(transferId, batchId, secret, expiresAt): string`
  - `verifyFilesBlobToken(token, transferId, batchId, secret): boolean`

- [ ] **Step 1: Write failing tests**

```ts
// server-v2/files/blob-store.test.ts
import assert from "node:assert/strict";
import test from "node:test";
import { mkdtemp, rm } from "node:fs/promises";
import { tmpdir } from "node:os";
import { join } from "node:path";
import {
  createFilesBlobStore,
  mintFilesBlobToken,
  verifyFilesBlobToken,
} from "./blob-store.ts";

test("mint/verify token round-trip", () => {
  const token = mintFilesBlobToken("tr1", "b0", "secret", Date.now() + 60_000);
  assert.equal(verifyFilesBlobToken(token, "tr1", "b0", "secret"), true);
  assert.equal(verifyFilesBlobToken(token, "tr1", "b1", "secret"), false);
});

test("put/get/delete blob with token gate", async () => {
  const root = await mkdtemp(join(tmpdir(), "cwsp-files-"));
  try {
    const store = createFilesBlobStore({ rootDir: root, ttlMs: 60_000 });
    const bytes = Buffer.from("hello-files");
    const { token } = await store.put({ transferId: "tr1", batchId: "b0", bytes });
    const got = await store.get({ transferId: "tr1", batchId: "b0", token });
    assert.ok(got);
    assert.equal(got!.toString("utf8"), "hello-files");
    assert.equal(await store.get({ transferId: "tr1", batchId: "b0", token: "bad" }), null);
    await store.delete("tr1");
    assert.equal(await store.get({ transferId: "tr1", batchId: "b0", token }), null);
  } finally {
    await rm(root, { recursive: true, force: true });
  }
});

test("expired blob returns null", async () => {
  const root = await mkdtemp(join(tmpdir(), "cwsp-files-"));
  try {
    const store = createFilesBlobStore({ rootDir: root, ttlMs: 1 });
    const { token } = await store.put({
      transferId: "tr1",
      batchId: "b0",
      bytes: Buffer.from("x"),
      expiresAt: Date.now() - 1,
    });
    assert.equal(await store.get({ transferId: "tr1", batchId: "b0", token }), null);
  } finally {
    await rm(root, { recursive: true, force: true });
  }
});
```

- [ ] **Step 2: Run — expect FAIL**

Run: `cd /home/u2re-dev/U2RE.space/apps/CWSP-reborn/runtime/endpoint && node --import tsx --test server-v2/files/blob-store.test.ts`

- [ ] **Step 3: Implement `blob-store.ts`**

Requirements:
- Default root: `process.env.CWS_FILES_BLOB_DIR` or `{cwd}/.data/cwsp-files-blobs`
- Default secret: `process.env.CWS_FILES_BLOB_SECRET` or derive from existing control/API key env if present; **never hardcode production secrets in source** — test passes explicit secret
- Token format: HMAC (sha256) over `transferId|batchId|expiresAt` + expiry (base64url) — reject expired
- On get miss/expiry → `null` (HTTP layer maps to 404/410)
- GC: lazy delete on get when expired; optional `store.sweep()`

- [ ] **Step 4: Run — expect PASS**

- [ ] **Step 5: Commit** (when allowed)

```bash
git add runtime/endpoint/server-v2/files/blob-store.ts runtime/endpoint/server-v2/files/blob-store.test.ts
git commit -m "$(cat <<'EOF'
feat(endpoint): add TTL files blob store with HMAC tokens

EOF
)"
```

---

### Task 2: Offer URL rewrite + route probe helpers

**Files:**
- Create: `server-v2/files/rewrite-offer.ts`
- Create: `server-v2/files/route-probe.ts`
- Create: `server-v2/files/rewrite-offer.test.ts`

**Interfaces:**
- Consumes: `FilesOfferPayload`, `chooseByteTransport`, `CHUNK_MAX` from `shared/v2/files*.ts`
- Produces:
  - `rewriteOfferBlobUrls(offer, ctx: { publicBaseUrl: string; tokenFor(batchId): string }): FilesOfferPayload`
  - `listBlobUrlCandidates(peerOrigins: string[], gatewayLan: string, gatewayWan: string, path: string): string[]`
  - `createRouteProbeCache(ttlMs = 30_000)` with `get/set` for `(fromId,toId) → "lan-direct"|"lan-gateway"|"wan-gateway"`

- [ ] **Step 1: Failing tests**

```ts
import assert from "node:assert/strict";
import test from "node:test";
import { rewriteOfferBlobUrls } from "./rewrite-offer.ts";
import { listBlobUrlCandidates } from "./route-probe.ts";

test("rewriteOfferBlobUrls rewrites each batch asset.url onto publicBaseUrl", () => {
  const offer = {
    transferId: "tr1",
    sender: "L-192.168.0.110",
    createdAt: 1,
    expiresAt: 2,
    summary: { fileCount: 1, totalBytes: 10 },
    batches: [{
      batchId: "b0",
      index: 0,
      count: 1,
      kind: "zip" as const,
      asset: {
        hash: "abc",
        name: "batch-abc.zip",
        mimeType: "application/zip",
        size: 10,
        source: "file",
        url: "https://192.168.0.110:8434/files/blob/tr1/b0?token=old",
      },
      files: [{ name: "a.txt", size: 10 }],
    }],
  };
  const out = rewriteOfferBlobUrls(offer, {
    publicBaseUrl: "https://192.168.0.200:8434",
    tokenFor: () => "tok",
  });
  assert.match(out.batches[0].asset.url!, /^https:\/\/192\.168\.0\.200:8434\/files\/blob\/tr1\/b0\?token=tok/);
});

test("listBlobUrlCandidates orders LAN peer then gateway LAN then WAN", () => {
  const urls = listBlobUrlCandidates(
    ["https://192.168.0.110:8434"],
    "https://192.168.0.200:8434",
    "https://45.147.121.152:8434",
    "/files/blob/tr1/b0",
  );
  assert.equal(urls[0], "https://192.168.0.110:8434/files/blob/tr1/b0");
  assert.equal(urls[1], "https://192.168.0.200:8434/files/blob/tr1/b0");
  assert.equal(urls[2], "https://45.147.121.152:8434/files/blob/tr1/b0");
});
```

- [ ] **Step 2–4:** Implement → pass → commit

```bash
git commit -m "$(cat <<'EOF'
feat(endpoint): files offer URL rewrite and route candidate helpers

EOF
)"
```

---

### Task 3: HTTP `/files/blob` router

**Files:**
- Create: `server-v2/protocol/http/routers/files/index.ts`
- Create: `server-v2/protocol/http/routers/files/files-http.test.ts`
- Modify: `server-v2/protocol/http/routers/index.ts`

**Interfaces:**
- Consumes: `createFilesBlobStore`
- Produces: `registerFilesHttpRouter(app, runtimeContext?)`
- Routes:
  - `PUT /files/blob/:transferId/:batchId` — body raw bytes; auth token create or require upload token
  - `GET /files/blob/:transferId/:batchId` — stream/buffer body; `404` missing, `410` expired, `401` bad token
  - `HEAD /files/blob/:transferId/:batchId` — same status without body (probe)
  - `DELETE /files/blob/:transferId/:batchId` — sender cancel / GC

- [ ] **Step 1: Failing inject test** (pattern like `gateway.test.ts`)

Build a minimal Fastify app, `registerFilesHttpRouter`, PUT bytes, GET with token, assert body + content-type `application/octet-stream`.

- [ ] **Step 2: Run — expect FAIL**

Run: `cd .../runtime/endpoint && node --import tsx --test server-v2/protocol/http/routers/files/files-http.test.ts`

- [ ] **Step 3: Implement router + register in `SERVER_V2_HTTP_ROUTERS` as `files: registerFilesHttpRouter`**

Also mount on the process that actually listens `:8434` if server-v2 routers are not yet wired there — if live traffic uses `server/routing/core-app.ts`, add a thin duplicate register **or** call `registerFilesHttpRouter` from the live boot path (prefer one registration helper imported by both).

- [ ] **Step 4: PASS + existing `npm run test:gateway` still green**

- [ ] **Step 5: Commit**

```bash
git commit -m "$(cat <<'EOF'
feat(endpoint): HTTP files blob GET/PUT/HEAD/DELETE router

EOF
)"
```

---

### Task 4: Socket `files:*` handler + forward path

**Files:**
- Create: `server-v2/protocol/socket/handlers/files.ts`
- Modify: `server-v2/protocol/socket/handler.ts` (dispatch)
- Modify: `server/network/socket/websocket.ts` **only if** that path handles inbound packets without server-v2 handler (inspect before editing — do not double-apply)

**Interfaces:**
- Produces:
  - `isFilesWhat(what: string): boolean` — `what.startsWith("files:")`
  - `handleFilesAction(what, payload, packet): Promise<{ handled: boolean; forward?: boolean }>`
- Behavior:
  - `files:offer|accept|decline|progress|done|error|chunk|chunk-ack` → **forward** to destinations (default `forward: true`)
  - Never call clipboard write drivers
  - On gateway, optionally `rewriteOfferBlobUrls` before forward when `what === "files:offer"` and env `CWS_FILES_REWRITE_OFFER_URLS=1` (or gateway id `.200`)
  - For `files:chunk`: forward payload as-is; do not reassemble into blob store unless `CWS_FILES_GATEWAY_CACHE_CHUNKS=1` (default **off** in v1 of W2)

- [ ] **Step 1: Unit test handler pure decisions** (no live socket)

```ts
test("handleFilesAction marks files:offer as forward and not clipboard", async () => {
  const r = await handleFilesAction("files:offer", { transferId: "tr" }, { what: "files:offer" } as any);
  assert.equal(r.forward, true);
});
```

- [ ] **Step 2–4:** Wire into dispatch next to clipboard cases → tests pass → commit

```bash
git commit -m "$(cat <<'EOF'
feat(endpoint): relay files:* socket actions without OS apply

EOF
)"
```

**INVARIANT check in self-review:** clipboard image/text paths unchanged; gateway still relay-only for clipboard.

---

### Task 5: Live mount + `/files/probe` + W2 verification

**Files:**
- Modify live HTTP boot (`server/routing/core-app.ts` and/or server-v2 HTTP index) to ensure `/files/blob/*` is reachable on `:8434`
- Optional: `GET|HEAD /files/probe` → `204` like `/lna-probe` (CORS + private-network headers copy)
- Create: `server-v2/files/w2-smoke.test.ts` importing W1 `chooseByteTransport` + candidate list

- [ ] **Step 1:** Add probe route test (inject 204)
- [ ] **Step 2:** Implement probe
- [ ] **Step 3:** Run matrix:

```bash
cd /home/u2re-dev/U2RE.space/apps/CWSP-reborn/runtime/endpoint
node --import tsx --test server-v2/files/*.test.ts server-v2/protocol/http/routers/files/*.test.ts
npm run test:gateway
# shared still green:
cd /home/u2re-dev/U2RE.space/apps/CWSP-reborn/src/shared && npm test
```

Expected: all PASS

- [ ] **Step 4:** Document env knobs in report (not a new markdown doc unless asked):
  - `CWS_FILES_BLOB_DIR`
  - `CWS_FILES_BLOB_SECRET`
  - `CWS_FILES_REWRITE_OFFER_URLS`
  - `CWS_FILES_GATEWAY_CACHE_CHUNKS` (default off)

- [ ] **Step 5: Commit**

```bash
git commit -m "$(cat <<'EOF'
feat(endpoint): mount files blob routes and LAN probe for transfers

EOF
)"
```

- [ ] **Step 6: Stop** — do not start Neutralino/Capacitor (W3/W4)

---

## Spec coverage (self-review)

| Spec item | Task |
|---|---|
| HTTP blob pull after accept | T1, T3 |
| Dual transport: endpoint supports HTTP path; WS chunk relay | T4 (chunk forward); HTTP T3 |
| Gateway rewrite / WAN via `.200` | T2, T4 |
| LAN-prefer candidates + probe | T2, T5 |
| Confirm-before-pull (client) | N/A endpoint — only relay |
| No OS clipboard apply for files | T4 INVARIANT |
| Progress bar fields | Relay `files:progress` only (T4) |
| Packer / 16 MiB CHUNK_MAX | W1; gateway must not violate when caching (default off) |

## Out of scope (W2)

- Neutralino Open for Share / popup
- Capacitor notification / SAF
- Settings `byteTransport` UI
- Assembling WS chunks into gateway disk by default
- `MANAGE_EXTERNAL_STORAGE`

## Type consistency with W1

- Use `FilesOfferPayload`, `FILES_WHAT_*`, `chooseByteTransport`, `CHUNK_MAX`, `FILES_PURPOSE` from shared.
- Resolved transport remains `"http" | "ws"` (never store `"auto"` on the wire after accept).
