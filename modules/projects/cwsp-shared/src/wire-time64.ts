/**
 * 64-bit wire timestamps: epoch ms + sub-ms micro fraction (JSON-safe string).
 * Parity: Java {@code WireTime64} — {@code wireTime64 = ms * 1_000_000 + subUs}.
 */

export type WireTime64 = {
    /** Wall-clock epoch milliseconds ({@code Date.now()} / {@code System.currentTimeMillis()}). */
    ts: number;
    /** Sub-millisecond microsecond fraction [0, 999_999]. */
    subUs: number;
    /** 64-bit composite as decimal string (safe on JSON wire). */
    wireTime64: string;
    /** Alias: same as {@link wireTime64} (spec name `ts64`). */
    ts64: string;
    /** Alias: same as {@link wireTime64} (envelope flags). */
    wireTs: string;
};

const SUB_US_SCALE = 1_000_000;

let hrtimeOffsetUs = 0;
let hrtimeAnchorMs = 0;

const refreshHrtimeAnchor = (): void => {
    hrtimeAnchorMs = Date.now();
    if (typeof process !== "undefined" && typeof process.hrtime?.bigint === "function") {
        hrtimeOffsetUs = Number(process.hrtime.bigint() / 1000n) % SUB_US_SCALE;
        return;
    }
    try {
        const perf = (globalThis as { performance?: { now?: () => number } }).performance;
        if (typeof perf?.now === "function") {
            hrtimeOffsetUs = Math.floor((perf.now() % 1) * SUB_US_SCALE) % SUB_US_SCALE;
            return;
        }
    } catch {
        /* ignore */
    }
    hrtimeOffsetUs = 0;
};

refreshHrtimeAnchor();

/** Capture monotonic-aligned 64-bit wire time. */
export const captureWireTime64 = (): WireTime64 => {
    const ts = Date.now();
    let subUs = 0;
    if (typeof process !== "undefined" && typeof process.hrtime?.bigint === "function") {
        const deltaMs = ts - hrtimeAnchorMs;
        if (deltaMs < 0 || deltaMs > 60_000) refreshHrtimeAnchor();
        subUs = (hrtimeOffsetUs + Number(process.hrtime.bigint() / 1000n)) % SUB_US_SCALE;
    } else {
        try {
            const perf = (globalThis as { performance?: { now?: () => number } }).performance;
            if (typeof perf?.now === "function") {
                subUs = Math.floor((perf.now() % 1) * SUB_US_SCALE) % SUB_US_SCALE;
            }
        } catch {
            subUs = 0;
        }
    }
    const wireTime64 = String(BigInt(ts) * BigInt(SUB_US_SCALE) + BigInt(subUs));
    return { ts, subUs, wireTime64, ts64: wireTime64, wireTs: wireTime64 };
};

/** Merge {@code ts}, {@code subUs}, {@code wireTime64} onto payload without overwriting explicit values. */
export const annotateWireTime64 = <T extends Record<string, unknown>>(payload: T): T & WireTime64 => {
    const timing = captureWireTime64();
    const wireTime64 = String(payload.wireTime64 ?? payload.ts64 ?? payload.wireTs ?? timing.wireTime64);
    return {
        ...payload,
        ts: Number(payload.ts ?? timing.ts),
        subUs: Number(payload.subUs ?? timing.subUs),
        wireTime64,
        ts64: wireTime64,
        wireTs: wireTime64
    };
};

/** Packet-level timestamp fields (root {@code timestamp} mirrors {@code ts}). */
export const annotatePacketWireTime64 = <T extends Record<string, unknown>>(packet: T): T => {
    const timing = captureWireTime64();
    const ts = Number(packet.timestamp ?? packet.ts ?? timing.ts);
    const subUs = Number(packet.subUs ?? timing.subUs);
    const wireTime64 = String(packet.wireTime64 ?? packet.ts64 ?? packet.wireTs ?? timing.wireTime64);
    const flags = {
        ...(packet.flags && typeof packet.flags === "object" && !Array.isArray(packet.flags)
            ? (packet.flags as Record<string, unknown>)
            : {}),
        wireTime64,
        ts64: wireTime64,
        wireTs: wireTime64
    };
    return {
        ...packet,
        ts,
        subUs,
        wireTime64,
        ts64: wireTime64,
        wireTs: wireTime64,
        timestamp: ts,
        flags
    };
};

export const parseWireTime64 = (value: unknown): WireTime64 | null => {
    const raw = String(value ?? "").trim();
    if (!/^\d+$/.test(raw)) return null;
    try {
        const composite = BigInt(raw);
        const ts = Number(composite / BigInt(SUB_US_SCALE));
        const subUs = Number(composite % BigInt(SUB_US_SCALE));
        if (!Number.isFinite(ts)) return null;
        return { ts, subUs, wireTime64: raw, ts64: raw, wireTs: raw };
    } catch {
        return null;
    }
};
