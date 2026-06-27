/**
 * CWSP wire replay markers — stable {@code wireHash} on acts to stop duplicate apply + ping-pong.
 * Parity: Java {@code CwspWireHash}, Node {@code local-dispatch.ts}, browser {@code websocket.ts}.
 */
import {
    CLIPBOARD_WIRE_DEDUPE_MS,
    PACKET_ORIGIN_TTL_MS
} from "./clipboard-wire-constants.ts";
import {
    annotatePacketWireTime64,
    isClipboardCoordinatorWhat,
    isStalePacketOrigin
} from "./wire-time64.ts";

export { CLIPBOARD_WIRE_DEDUPE_MS };
export const WIRE_HASH_FIELD = "wireHash";
export const INPUT_WIRE_DEDUPE_MS = 180;
export const GENERAL_WIRE_DEDUPE_MS = 400;

export type WireReplaySuppressMode = "none" | "local-only" | "full";

export type WireDedupeCategory = "clipboard" | "input" | "general";

const VOLATILE_PAYLOAD_KEYS = new Set([
    "ts",
    "subUs",
    "wireTime64",
    "ts64",
    "wireTs",
    "perfTs",
    "perfTsLo",
    WIRE_HASH_FIELD,
    "source",
    "from",
    "clientId",
    "userId",
    "sender"
]);

const asRecord = (value: unknown): Record<string, unknown> =>
    value && typeof value === "object" && !Array.isArray(value) ? (value as Record<string, unknown>) : {};

/** djb2 → base36 (matches Node {@code local-dispatch} + Java {@code CwspWireHash}). */
export const cheapWireHash = (value: string): string => {
    if (!value) return "";
    let h = 5381;
    for (let i = 0; i < value.length; i += 1) {
        h = ((h << 5) + h + value.charCodeAt(i)) | 0;
    }
    return (h >>> 0).toString(36);
};

export const normalizeClipboardWireText = (text: unknown): string =>
    String(text ?? "")
        .replace(/\r\n/g, "\n")
        .trim();

const stableStringify = (value: unknown): string => {
    if (value === null || value === undefined) return "";
    if (typeof value !== "object") return JSON.stringify(value);
    if (Array.isArray(value)) return `[${value.map(stableStringify).join(",")}]`;
    const record = value as Record<string, unknown>;
    const keys = Object.keys(record)
        .filter((key) => !VOLATILE_PAYLOAD_KEYS.has(key))
        .sort();
    return `{${keys.map((key) => `${JSON.stringify(key)}:${stableStringify(record[key])}`).join(",")}}`;
};

const readAssetHash = (payload: Record<string, unknown>): string => {
    for (const key of ["asset", "dataAsset", "file", "image"]) {
        const asset = asRecord(payload[key]);
        const hash = String(asset.hash ?? "").trim();
        if (hash) return hash;
    }
    return "";
};

const readClipboardText = (payload: Record<string, unknown>, packet: Record<string, unknown>): string => {
    for (const key of ["text", "content", "body"]) {
        const direct = payload[key];
        if (typeof direct === "string" && direct.trim()) return direct;
    }
    for (const root of ["payload", "data", "result"]) {
        const carrier = packet[root];
        if (typeof carrier === "string" && carrier.trim()) return carrier;
    }
    return "";
};

export const inferWireDedupeCategory = (what: unknown): WireDedupeCategory => {
    const normalized = String(what || "").trim().toLowerCase();
    if (!normalized) return "general";
    if (normalized.startsWith("clipboard:") || normalized.startsWith("airpad:clipboard:")) return "clipboard";
    if (
        normalized.startsWith("mouse:") ||
        normalized.startsWith("keyboard:") ||
        normalized.startsWith("airpad:mouse") ||
        normalized.startsWith("airpad:keyboard")
    ) {
        return "input";
    }
    return "general";
};

const dedupeWindowForCategory = (category: WireDedupeCategory): number => {
    if (category === "clipboard") return CLIPBOARD_WIRE_DEDUPE_MS;
    if (category === "input") return INPUT_WIRE_DEDUPE_MS;
    return GENERAL_WIRE_DEDUPE_MS;
};

const isDedupeExemptWhat = (what: string, op: string): boolean => {
    if (op === "ask" || op === "request") return true;
    if (!what) return true;
    if (what.endsWith(":read") || what.endsWith(":get") || what.endsWith(":isready")) return true;
    return false;
};

/** Read explicit marker from flags / payload / root. */
export const extractPacketWireHash = (packet: Record<string, unknown>): string => {
    const flags = asRecord(packet.flags);
    const payload = asRecord(packet.payload ?? packet.data);
    return String(flags[WIRE_HASH_FIELD] ?? packet[WIRE_HASH_FIELD] ?? payload[WIRE_HASH_FIELD] ?? "").trim();
};

/** Stable content hash for one coordinator act (excludes uuid/timing noise). */
export const computePacketWireHash = (packet: Record<string, unknown>): string => {
    const op = String(packet.op || "act").trim().toLowerCase();
    const what = String(packet.what || packet.type || "").trim().toLowerCase();
    if (isDedupeExemptWhat(what, op)) return "";

    const sender = String(packet.byId || packet.from || packet.sender || "")
        .trim()
        .toLowerCase();
    const payload = asRecord(packet.payload ?? packet.data ?? packet.body ?? {});

    if (what.includes("clipboard")) {
        const text = readClipboardText(payload, packet);
        const assetHash = text ? "" : readAssetHash(payload);
        const content = text
            ? cheapWireHash(normalizeClipboardWireText(text))
            : assetHash
              ? `asset:${assetHash}`
              : cheapWireHash(stableStringify(payload));
        if (!content) return "";
        const uuid = String(packet.uuid ?? "").trim();
        const uuidMarker = uuid ? `|u:${uuid}` : "";
        return cheapWireHash(`${op}|${what}|${sender}|${content}${uuidMarker}`);
    }

    if (inferWireDedupeCategory(what) === "input") {
        const perfMarker = payload.perfTs ?? payload.perfTsLo ?? "";
        return cheapWireHash(`${op}|${what}|${sender}|${stableStringify(payload)}|p:${perfMarker}`);
    }

    return cheapWireHash(`${op}|${what}|${sender}|${stableStringify(payload)}`);
};

/** Attach {@code flags.wireHash} + payload mirror when missing. */
export const annotatePacketWireHash = <T extends Record<string, unknown>>(packet: T): T => {
    const timed = annotatePacketWireTime64(packet);
    const existing = extractPacketWireHash(timed);
    if (existing) return timed;
    const hash = computePacketWireHash(timed);
    if (!hash) return timed;

    const flags = { ...asRecord(timed.flags), [WIRE_HASH_FIELD]: hash };
    const payloadRaw = timed.payload ?? timed.data;
    let nextPayload: unknown = payloadRaw;
    if (payloadRaw && typeof payloadRaw === "object" && !Array.isArray(payloadRaw)) {
        nextPayload = { ...(payloadRaw as Record<string, unknown>), [WIRE_HASH_FIELD]: hash };
    }

    if (timed.payload !== undefined) {
        return { ...timed, flags, payload: nextPayload };
    }
    if (timed.data !== undefined) {
        return { ...timed, flags, data: nextPayload };
    }
    return { ...timed, flags, payload: nextPayload };
};

export class PacketWireDedupeGuard {
    private readonly seen = new Map<string, number>();

    constructor(private readonly maxEntries = 512) {}

    /** Returns true when the same wireHash was seen inside the category window. */
    shouldSuppress(packet: Record<string, unknown>, category?: WireDedupeCategory): boolean {
        const what = String(packet.what || packet.type || "").trim().toLowerCase();
        const op = String(packet.op || "act").trim().toLowerCase();
        if (isDedupeExemptWhat(what, op)) return false;

        const hash = extractPacketWireHash(packet) || computePacketWireHash(packet);
        if (!hash) return false;

        const cat = category ?? inferWireDedupeCategory(what);
        const windowMs = dedupeWindowForCategory(cat);
        const now = Date.now();
        const key = `${cat}|${hash}`;
        const prev = this.seen.get(key);
        this.seen.set(key, now);
        this.prune(now, windowMs);
        return prev !== undefined && now - prev < windowMs;
    }

    clear(): void {
        this.seen.clear();
    }

    private prune(now: number, windowMs: number): void {
        const ttl = Math.max(windowMs * 4, 4000);
        for (const [key, ts] of this.seen.entries()) {
            if (now - ts > ttl) this.seen.delete(key);
        }
        if (this.seen.size <= this.maxEntries) return;
        const sorted = [...this.seen.entries()].sort((a, b) => a[1] - b[1]);
        for (let i = 0; i < sorted.length - this.maxEntries; i += 1) {
            this.seen.delete(sorted[i]![0]!);
        }
    }
}

export const packetWireDedupeGuard = new PacketWireDedupeGuard();

/**
 * Per-hop mesh relay dedupe — stops already-seen wireHash from floating between peers
 * within {@link PACKET_ORIGIN_TTL_MS} without blocking first forward.
 */
export class PacketWireRelayDedupeGuard {
    private readonly seen = new Map<string, number>();

    constructor(private readonly maxEntries = 512) {}

    shouldSuppress(packet: Record<string, unknown>): boolean {
        if (isHighFrequencyInputPacket(packet)) return false;
        const what = String(packet.what || packet.type || "").trim().toLowerCase();
        const op = String(packet.op || "act").trim().toLowerCase();
        if (isDedupeExemptWhat(what, op)) return false;

        const hash = extractPacketWireHash(packet) || computePacketWireHash(packet);
        if (!hash) return false;

        const now = Date.now();
        const key = `relay|${hash}`;
        const prev = this.seen.get(key);
        this.seen.set(key, now);
        this.prune(now);
        return prev !== undefined && now - prev < PACKET_ORIGIN_TTL_MS;
    }

    clear(): void {
        this.seen.clear();
    }

    private prune(now: number): void {
        const ttl = Math.max(PACKET_ORIGIN_TTL_MS * 4, 4000);
        for (const [key, ts] of this.seen.entries()) {
            if (now - ts > ttl) this.seen.delete(key);
        }
        if (this.seen.size <= this.maxEntries) return;
        const sorted = [...this.seen.entries()].sort((a, b) => a[1] - b[1]);
        for (let i = 0; i < sorted.length - this.maxEntries; i += 1) {
            this.seen.delete(sorted[i]![0]!);
        }
    }
}

export const packetWireRelayDedupeGuard = new PacketWireRelayDedupeGuard();

/** Block mesh relay for stale origin or duplicate wireHash within origin TTL. */
export const shouldSuppressPacketRelay = (packet: Record<string, unknown>): boolean => {
    if (isHighFrequencyInputPacket(packet)) return false;
    const what = String(packet.what || packet.type || "").trim().toLowerCase();
    // WHY: clipboard uses echo/poll guards; relay dedupe here blocked gateway→desk fan-out.
    if (isClipboardCoordinatorWhat(what)) return false;
    if (isStalePacketOrigin(packet, false)) return true;
    return packetWireRelayDedupeGuard.shouldSuppress(packet);
};

/** High-frequency relative deltas must never be replay-suppressed (drops smooth cursor). */
export const isHighFrequencyInputWhat = (what: unknown): boolean => {
    const normalized = String(what || "").trim().toLowerCase();
    return normalized === "mouse:move" || normalized === "mouse:scroll";
};

const readAirpadWrapperOp = (packet: Record<string, unknown>): string => {
    const payload = asRecord(packet.payload ?? packet.data ?? packet.body);
    const direct = String(payload.op ?? payload.action ?? payload.type ?? "").trim().toLowerCase();
    if (direct) return direct;
    const params = payload.params;
    if (Array.isArray(params) && params.length > 0) {
        return String(params[0] ?? "").trim().toLowerCase();
    }
    return "";
};

/** Packet-aware high-frequency check, including `airpad:mouse` wrappers from Java/Android clients. */
export const isHighFrequencyInputPacket = (packet: Record<string, unknown> | string): boolean => {
    if (typeof packet === "string") return isHighFrequencyInputWhat(packet);
    const what = String(packet.what || packet.type || "").trim().toLowerCase();
    if (isHighFrequencyInputWhat(what)) return true;
    if (what !== "airpad:mouse" && !what.startsWith("airpad:mouse")) return false;
    const op = readAirpadWrapperOp(packet) || "move";
    return op === "move" || op === "mouse:move" || op === "scroll" || op === "mouse:scroll";
};

/** Wire-hash replay → skip local apply (relay may continue). */
export const classifyWireReplaySuppress = (packet: Record<string, unknown>): WireReplaySuppressMode => {
    if (isHighFrequencyInputPacket(packet)) return "none";
    if (packetWireDedupeGuard.shouldSuppress(packet)) return "local-only";
    return "none";
};
