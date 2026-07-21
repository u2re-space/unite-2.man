# CWSP Confirmed Files Transfer Design

**Date:** 2026-07-21  
**Status:** Approved (brainstorm §§1–5) + Amendment A1 (dual byte transport) + Amendment A2 (W3+ shared hub / Open-with)  
**Scope:** CWSP-reborn — Neutralino (Windows/Linux) ↔ Capacitor (Android), bidirectional; phone↔phone on the same contract  
**Related:** universal clipboard `DataAsset` (text/images remain separate); `docs/superpowers/specs/2026-07-14-clipboard-prompt-popup-design.md`

## Amendment A1 (2026-07-21) — Dual byte transport + progress UX

Byte path is **selectable** (`http` | `ws`), not HTTP-only:

- **HTTP(S) pull** — unchanged single-GET (or ranged) blob fetch after accept.
- **WebSocket chunks** — `files:chunk` / `files:chunk-ack` with **16 MiB** max block size for large payloads.
- **Both** expose the same progress model: **progress bar**, **instant/smoothed speed**, **ETA**.
- Default policy: prefer `http` for small batches; prefer `ws` when total remaining ≫ 16 MiB or when settings/route force `ws`. Explicit setting `byteTransport: "http" | "ws" | "auto"` (default `auto`).

Tiny inline `DataAsset.data` fallback (&lt; ~500 KB single non-zip) remains for emergency only.

## Amendment A2 (2026-07-21) — W3+ shared files-hub + Android Open-with

### Locked brainstorm decisions

| Topic | Choice |
|---|---|
| Open-with platforms (this wave) | **Android Capacitor now**; desktop shell “Open with CWSP” **deferred** |
| Post-stage offer | **Hybrid** — auto `files:offer` when `defaultDestinations` non-empty; else destination picker / confirm (no silent `*`) |
| Wave packaging | **Single wave W3+** — Neutralino files-hub **and** Android Open-with → Temp → Share |
| Architecture | **Shared files-hub core** + thin Neutralino / Capacitor adapters (not parallel hubs; not clipboard-mimic) |

### Shared hub contract

Logical pipeline (platform-agnostic):

`ingress → stage (Temp) → pack (W1 policy) → publish bytes (HTTP and/or WS) → files:offer → accept/progress/cancel`

Ingress `source` values: `"clipboard" | "open-with" | "share-target" | "picker"`.

UI hub phases: `staged` → `readyToOffer` | `needDestinations` → `offering` → `progress` → `done` / `cancel`.

Invariants:

- Files-hub stays **separate** from clipboard-hub (text/image clipboard unchanged).
- Open-with / file-manager entry **always** copies into app-private Temp before pack/offer (pack needs local files; SAF/`content://` grants are not durable wire sources).
- Wire never carries raw `content://`, absolute paths, or platform URIs.
- Hybrid offer never fan-outs to `*` without confirm when destinations are empty.
- `openForShare` setting continues to gate **clipboard-style** outgoing prompts; Open-with uses the hybrid path above.

### Neutralino (W3+ must)

- Detect file-list clipboard (≠ text/image) → Open for Share (respect `openForShare` manual/auto).
- Stage/pack/serve blobs + WS chunk send/receive; progress toast (bar/speed/ETA).
- Incoming accept per `acceptMode`; `afterReceive` / `landingDir` as in §3.

### Capacitor Open-with (W3+ must)

- Manifest: `VIEW` + `SEND` / `SEND_MULTIPLE` for broad `*/*` (keep existing text/image share filters). App label remains **CWSP**.
- Branch share path: small image → existing clipboard-asset path may remain; **file Open-with / multi-file / non-clipboard streams** → stage under app `files/outgoing/<transferId>/` → bridge `files:ingress` → files-hub (not clipboard write).
- Extend `ShareTarget` / bridge; do not reopen full Capacitor UI solely for text share overlay patterns when files need staging progress.
- After stage: hybrid offer (destinations known → offer; else picker).
- Incoming notification/SAF polish remains primarily **W4**; W3+ may stub receiver accept enough for desk↔phone smoke if needed.

### Errors / limits

- Unreadable URI / lost grant → user error + abort (no partial offer).
- Stage/pack failure → cancel `transferId`, GC Temp partials.
- Decline/timeout → invalidate blobs + GC.
- Enforce a max file count + total staged bytes (exact caps in W3+ plan); clear user-visible error on overflow.

### Test / acceptance (W3+)

- Unit: hybrid offer decision; stage/pack; intent→Temp (mock/Robolectric).
- Neutralino: file clipboard → Open for Share → `files:offer` shape.
- Android: `am start` VIEW/SEND with a test file → Temp populated → offer or picker.
- Smoke: Open-with offer reaches endpoint `files:*` relay; full SAF incoming UI may wait for W4.

### Explicitly deferred (not W3+)

- Desktop Explorer / Linux file-manager “Open with CWSP” / Send-to shell association.
- Full Capacitor incoming notification + SAF export UX (W4).
- Settings UI for `byteTransport` / destinations (W5).

## Problem

Clipboard already syncs text and images quickly (often auto). Multi-file copies must **not** auto-apply on the peer. Flow:

1. Sender stages/packs files (Open for Share).
2. Receiver confirms (notification / toast), unless auto-accept is enabled.
3. Bytes move via **HTTP(S) pull and/or WS 16 MiB chunks** (settings/route); signaling stays on `files:*`.
4. UI shows progress bar, throughput, and ETA during transfer.
5. Receiver lands in app Temp, then may export (SAF / Downloads) or put file list on OS clipboard (desktop).

## Decisions (locked)

| Topic | Choice |
|---|---|
| Architecture | **Approach 1** — dedicated `files-transfer` layer beside clipboard |
| Wire contract | **C** — `files:*` lifecycle + `DataAsset` metadata for blobs |
| Byte delivery | **Dual:** HTTP(S) pull **and** WS chunk pipe; setting `byteTransport` = `http` \| `ws` \| `auto` |
| WS block size | **16 MiB** max per `files:chunk` (last chunk may be smaller) |
| Progress UX | Progress bar + measured speed + ETA on **both** transports |
| Product scope | **Bidirectional desk↔phone** first-class; phone↔phone same contract |
| Destinations | **Hybrid** — preferred/last targets by default; optional share-to-all |
| Large files | Single file **&gt; ~8 MB** → raw blob; **&gt; ~12 MB** → try compress, keep if ≥ ~10% smaller else raw |
| Android storage | App-specific staging + **SAF**; no `MANAGE_EXTERNAL_STORAGE` in v1 |

## Architecture

```
Sender packer → Temp staging → (HTTP blob serve and/or WS chunk reader)
       ↓
  files:offer (WS signaling)  →  destinations (hybrid)
       ↓
Receiver accept/decline (settings)
       ↓
  byteTransport auto|http|ws  →  pull and/or chunk stream
       ↓
  progress (bar / speed / ETA) on receiver (+ optional files:progress)
       ↓
  unpack Temp → clipboard / SAF export / done UI
```

- **Signaling:** CWSP `/ws` packets (`purpose: "storage"`).
- **Bytes:** HTTP(S) blob endpoints **and/or** WS `files:chunk` pipeline (same `transferId` / `batchId`).
- **Clipboard hub unchanged** for text/images; new **files-hub** per platform.

---

## §1 Protocol

### Purpose and actions

`purpose: "storage"`. Do not overload `clipboard:update` for multi-file confirm flows.

| Action | Typical op | Role |
|---|---|---|
| `files:offer` | `ask` / `act` | Session manifest (no batch bytes inline) |
| `files:accept` | `act` / `result` | One accept per `transferId`; may include chosen `byteTransport` |
| `files:decline` | `act` | Reject / user cancel / timeout on receiver |
| `files:chunk` | `act` | WS byte block (≤ 16 MiB) for a batch |
| `files:chunk-ack` | `result` / `act` | Receiver ack (optional windowing; at least per-chunk or per-N) |
| `files:progress` | `act` | bytesDone/totalBytes, batchIndex, speedBps, etaMs |
| `files:done` | `act` / `result` | All accepted batches retrieved; local apply/export ready |
| `files:error` | `error` | Session or batch failure |

### Offer payload

```ts
{
  transferId: string;
  sender: string;
  destinations?: string[];       // preferred; omit or "*" = fleet (share-to-all)
  createdAt: number;
  expiresAt: number;
  summary: { fileCount: number; totalBytes: number; label?: string };
  batches: Array<{
    batchId: string;
    index: number;
    count: number;
    kind: "zip" | "raw" | "compressed";
    asset: DataAssetEnvelope;    // hash, name, mimeType, size, source; url set for pull
    files: Array<{ name: string; size: number; hash?: string }>;
  }>;
  flags?: { openForShare?: boolean; autoAcceptHint?: boolean };
  byteTransportHint?: "http" | "ws" | "auto";
}
```

### WS chunk payload

```ts
{
  transferId: string;
  batchId: string;
  chunkIndex: number;       // 0..chunkCount-1
  chunkCount: number;
  offset: number;           // byte offset within batch blob
  size: number;             // this chunk length (≤ 16 MiB)
  hash?: string;            // optional per-chunk hash
  encoding: "base64" | "binary-frame";  // prefer binary WS frame when available
  data?: string;            // if base64 JSON path
}
```

`CHUNK_MAX = 16 MiB`. Batches smaller than `CHUNK_MAX` may still use a single chunk when `byteTransport === "ws"`.

### Progress model (HTTP and WS)

Local transfer engine always computes (receiver-authoritative for UI):

| Field | Meaning |
|---|---|
| `bytesDone` / `totalBytes` | Session progress (all batches) |
| `batchIndex` / `batchCount` | Current batch |
| `speedBps` | Smoothed throughput (EMA over ~1–2 s window) |
| `etaMs` | `(totalBytes - bytesDone) / speedBps` when speed &gt; 0; else unknown |

Emit `files:progress` at a capped rate (e.g. ≤ 4 Hz) for remote mirrors/diagnostics. UI progress bar binds to the same fields on Neutralino toast and Android notification (`setProgress`) + in-app bar.

### Invariants

- Confirm before byte transfer unless receiver `acceptMode === "auto"`.
- Offer must not write files into OS clipboard.
- Endpoint relays signaling; for WS chunks it must forward `files:chunk` without requiring full in-memory reassembly on the gateway when possible (stream/relay).
- Optional gateway blob cache/proxy is not required for LAN direct HTTP.
- Dedup key: `transferId` (and `batchId` / `chunkIndex` within a session).
- Wire `DataAsset` stays a **clean envelope** (no platform `uri`/`path` pollution on the wire).

### Tiny inline fallback

Only for a single non-zip file under `SMALL_FILE_MAX` when neither HTTP nor WS chunk pipe is available. Zip/raw batches always use HTTP and/or WS chunks — never a single giant inline JSON blob.

---

## §2 Packer / staging / TTL

### Shared ownership

Policy + manifest builder live in `modules/projects/cwsp-shared`. Platforms only read/write local files and serve/fetch blobs.

### Thresholds (defaults; settings may override later)

| Constant | Default | Meaning |
|---|---|---|
| `SMALL_FILE_MAX` | 500 KiB | Eligible for shared zip batch |
| `ZIP_BATCH_MAX` | 8 MiB | Max compressed zip batch size |
| `RAW_FILE_MIN` | &gt; 8 MiB | One file → one `raw` batch |
| `COMPRESS_TRY_MIN` | &gt; 12 MiB | Attempt single-file compression first |
| `COMPRESS_WORTHWHILE` | ≥ 10% size reduction | Else keep `raw` |
| Hard transfer cap | **None in v1** | UI may soft-warn above 100 MiB total |

### Packing algorithm

1. Collect paths → names/sizes.
2. Classify: small / raw (8–12 MiB) / compress-try (&gt;12 MiB).
3. Greedily pack small files into zip batches ≤ `ZIP_BATCH_MAX`.
4. Write each batch blob under staging; hash; build `DataAssetEnvelope` **without** inline `data`.
5. Emit `files:offer` with `expiresAt` and blob keys; publish HTTP URLs (possibly rewritten by route calibrator).

### Staging layout

```
{appTemp}/cwsp-files/{transferId}/
  manifest.json
  batch-{index}-{hash}.zip|bin|gz
  meta.json
```

- Desktop: OS temp or app data dir (Neutralino.filesystem / Node `fs`).
- Android: app-specific cache/files only until SAF export.

### TTL / GC

- Default offer/blob TTL: 10–15 minutes (configurable).
- Expired GET → 404/410 (not empty 200).
- Decline, sender cancel, or successful completion → delete staging.
- After `files:done`, GC when safe (all pulls finished or TTL).

### Blob HTTP and WS serve

- **HTTP:** `GET /files/blob/{transferId}/{batchId}` with short-lived token (query or header). Local loopback control API may mirror auth style used by clipboard-prompt host; peer-facing URL uses the device HTTPS origin or gateway rewrite.
- **WS:** After accept with `byteTransport: "ws"` (or `auto` chose ws), sender reads staging blob and emits `files:chunk` ≤ 16 MiB until EOF; receiver acks and assembles to Temp; then same unpack path as HTTP.
- **`auto` selection (receiver or negotiated in accept):** prefer `http` when batch size ≤ 16 MiB and HTTP URL reachable; prefer `ws` when batch/session larger, HTTP probe fails, or settings force ws. Always keep one progress pipeline.

---

## §3 Neutralino (desktop)

### Outgoing

1. Detect file-list copy (distinct from text/image).
2. Prompt action **Open for Share** (manual default); optional destination picker / share-to-all.
3. On confirm (or `openForShare: auto`): pack → serve blobs → `files:offer`.
4. Cancel invalidates blobs and notifies peers.

Reuse prompt/host patterns from clipboard prompt where practical, but keep a **files** branch/state machine separate from text/image ask/accept.

### Incoming

| Mode | Behavior |
|---|---|
| `acceptMode: manual` | Toast/prompt Accept/Decline |
| `acceptMode: auto` | Accept → pull immediately |

After pull/chunk+unpack:

| `afterReceive` | Behavior |
|---|---|
| `clipboard` (default) | Place file list on OS clipboard when platform allows |
| `clipboardOnConfirm` | Done popup → user taps Copy |
| `saveOnly` | Write under `landingDir` only |

`landingDir`: `temp` (default) | `downloads` | custom path.

During transfer: toast/progress UI shows **bar + speed + ETA** (same fields as §1 progress model).

### Settings keys (desktop)

- `openForShare`: `manual` | `auto`
- `acceptMode`: `manual` | `auto`
- `byteTransport`: `auto` | `http` | `ws` (default `auto`)
- `landingDir`, `afterReceive`
- `defaultDestinations`, `allowShareToAll`

### Invariants

- `acceptMode` and `openForShare` are independent.
- Text/image clipboard paths stay unchanged.

---

## §4 Capacitor (Android)

### Incoming

1. `files:offer` → notification with download icon (works with existing FGS/idle heal patterns).
2. Manual: Accept/Decline actions; Auto: pull immediately.
3. Byte transfer into app Temp (HTTP and/or WS chunks per `byteTransport`); notification + in-app **progress bar**, **speed**, **ETA**; optional `files:progress`.
4. Unpack → export:
   - Persisted SAF tree URI if configured.
   - Else (manual): SAF picker each time when `askDirEveryTime` / URI unset.
5. Done notification: Open / system Share / Dismiss; then GC Temp.

Do not rely on Android multi-file clipboard parity with Windows; prefer SAF save + Share sheet.

### Outgoing

- **SAF pick** → stage in app `outgoing/` → Open for Share → offer.
- **App outgoing staging** → notification **Open for Share** → offer.
- **Open-with / Share-to-CWSP (Amendment A2):** file manager `VIEW` / `SEND` / `SEND_MULTIPLE` → always stage into app Temp → hybrid offer (auto when `defaultDestinations` set; else picker). Desktop shell Open-with deferred.

Serve blobs via HTTP and/or WS chunks from the phone on LAN; WAN uses gateway URL rewrite / WS relay (§5).

### Settings keys (Android)

- `acceptMode`, `openForShare`, `defaultDestinations`
- `byteTransport`: `auto` | `http` | `ws` (default `auto`)
- `incomingDir` (opaque SAF tree URI)
- `askDirEveryTime` (default true when URI unset)

### Invariants

- Staging is app-private first; shared locations only via SAF.
- Outbound wire assets must remain clean envelopes (no `uri`/`path` on the wire).
- Open-with never offers from a live `content://` without Temp copy.

---

## §5 Route calibration and settings sync

### Blob route preference (per sender→receiver)

Applies to **HTTP URLs** and to choosing whether WS should stay on the current `/ws` path (often already via gateway):

1. **LAN direct** (private origins reachable).
2. **LAN via gateway** `192.168.0.200:8434`.
3. **WAN via gateway** public entry + client token.

Probe with short timeout (~1–2 s); cache per peer pair. Signaling may remain on WS via gateway even when HTTP blob is LAN-direct. For `byteTransport: ws`, chunks ride the same routed `/ws` session (or a dedicated files subchannel multiplexed on it).

Never conflate: Endpoint URL, AirPad/target URL, destination client ID.

### Settings contribution

Namespace e.g. `filesTransfer` / `storage.files`, synced like other Cap/Neutralino contribution arms (web settings ↔ native backend):

- `acceptMode`, `openForShare`, `defaultDestinations`, `allowShareToAll`
- `byteTransport`: `auto` | `http` | `ws`
- `landingDir` / `incomingDir`, `afterReceive`, `askDirEveryTime`
- optional threshold overrides

### Implementation waves (disjoint ownership)

| Wave | Focus | Approx. paths |
|---|---|---|
| W1 | Protocol, packer policy, chunk/progress types, schema/tests | `modules/projects/cwsp-shared` (**done**) |
| W2 | Relay (incl. `files:chunk`), optional gateway blob proxy + probes | `apps/CWSP-reborn/runtime/endpoint` (**done**) |
| W3+ | Shared files-hub adapters: Neutralino hub + Android Open-with Temp/hybrid offer | Neutralino backend/prompt + Android Java/`ShareTarget`/bridge + Cap web hub |
| W4 | Capacitor incoming notification progress/speed/ETA, SAF export, full HTTP+WS receive UX | Android Java + Capacitor web |
| W5 | Settings UI (`byteTransport`) + preferred destinations | settings-view / network panel |
| Later | Desktop shell “Open with CWSP” / Send-to | Neutralino/OS integration |

Merge order: W1 → W2 → W3+ → W4 → W5. Grok audits; GLM implements within wave file ownership.

### Out of scope (v1)

- `MANAGE_EXTERNAL_STORAGE` / full device file manager
- Parallel multi-stream striping beyond one chunk window
- P2P without CWSP identity
- Android OS multi-file clipboard as primary apply path
- Desktop Explorer/Linux “Open with CWSP” (deferred past W3+)

### Success criteria

- Win → Android: copy files → Open for Share → notification → accept → progress (bar/speed/ETA) → Temp/SAF.
- Android → Win: SAF/outgoing **or Open-with** → stage Temp → hybrid offer → accept → Temp → clipboard or save.
- Android file manager: open/share any file via CWSP → Temp stage (+ pack if required) → offer or destination picker.
- Both `http` and `ws` byte paths work; `auto` picks sensibly; 16 MiB WS chunks for large payloads.
- Hybrid destinations + optional share-to-all.
- LAN-prefer when probe succeeds; else gateway.
- No regression on text/image clipboard.

## References

- Neutralino filesystem: https://neutralino.js.org/docs/api/filesystem/
- Node fs: https://nodejs.org/api/fs.html
- Android data storage: https://developer.android.com/training/data-storage
- App-specific storage: https://developer.android.com/training/data-storage/app-specific
- All-files access (explicitly not v1): https://developer.android.com/training/data-storage/manage-all-files
- StorageManager: https://developer.android.com/reference/android/os/storage/StorageManager
- CWSP network / DataAsset rules: `.cursor/rules/network.mdc`, `.cursor/rules/features-data-asset.mdc`
