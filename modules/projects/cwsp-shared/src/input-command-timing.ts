/**
 * Send-time markers for coordinator input + clipboard acts.
 *
 * INVARIANT: canonical copy lives in `fest/cwsp-shared`; portable deploy bundles via esbuild.
 */
import { annotateWireTime64, type WireTime64 } from "./wire-time64.ts";

export type InputCommandTiming = WireTime64 & {
    /** Monotonic ms on sender (`performance.now`). Primary sort key within one peer. */
    perfTs: number;
};

const asRecord = (value: unknown): Record<string, unknown> =>
    value && typeof value === "object" && !Array.isArray(value) ? (value as Record<string, unknown>) : {};

const readPerfNow = (): number => {
    try {
        const perf = (globalThis as { performance?: { now?: () => number } }).performance;
        if (typeof perf?.now === "function") return perf.now();
    } catch {
        /* ignore */
    }
    return Date.now();
};

/** Capture send-time markers for one input act. */
export const captureInputCommandTiming = (): InputCommandTiming => {
    const perfTs = readPerfNow();
    return {
        ...annotateWireTime64({}),
        perfTs
    };
};

/** Low 16 bits of deci-ms perf clock — packed into legacy 8-byte AirPad frames (bytes 6–7). */
export const encodeInputPerfTsLo = (perfTs = readPerfNow()): number => Math.round(perfTs * 10) & 0xffff;

/** Expand binary {@link encodeInputPerfTsLo} back to a sortable perfTs fragment. */
export const decodeInputPerfTsLo = (perfTsLo: number): number => (perfTsLo & 0xffff) / 10;

const PERF_TS_LO_WRAP_MS = 6553.6;
const perfTsLoEpochBySender = new Map<string, { epoch: number; lastLo: number }>();

/** Expand wrapped 16-bit perf clock into monotonic perfTs per sender (binary AirPad frames). */
export const expandPerfTsFromLo = (senderKey: string, perfTsLo: number): number => {
    const lo = decodeInputPerfTsLo(perfTsLo);
    if (!Number.isFinite(lo)) return 0;
    const key = String(senderKey || "*").trim().toLowerCase() || "*";
    let state = perfTsLoEpochBySender.get(key);
    if (!state) {
        state = { epoch: 0, lastLo: lo };
        perfTsLoEpochBySender.set(key, state);
        return lo;
    }
    if (lo + 500 < state.lastLo) {
        state.epoch += PERF_TS_LO_WRAP_MS;
    }
    state.lastLo = lo;
    return state.epoch + lo;
};

export const resetPerfTsLoEpochForSender = (senderKey: string): void => {
    perfTsLoEpochBySender.delete(String(senderKey || "*").trim().toLowerCase() || "*");
};

export const isInputCoordinatorWhat = (what: string): boolean => {
    const normalized = String(what || "").trim().toLowerCase();
    return (
        normalized.startsWith("mouse:") ||
        normalized.startsWith("keyboard:") ||
        normalized.startsWith("airpad:mouse") ||
        normalized.startsWith("airpad:keyboard")
    );
};

export const isClipboardCoordinatorWhat = (what: string): boolean => {
    const normalized = String(what || "").trim().toLowerCase();
    return normalized.startsWith("clipboard:") || normalized.startsWith("airpad:clipboard:");
};

/** Input + clipboard coordinator acts carry send-time markers for ordering/dedupe. */
export const shouldAnnotateCoordinatorPayload = (what: string): boolean =>
    isInputCoordinatorWhat(what) || isClipboardCoordinatorWhat(what);

/** Merge timing into payload without overwriting explicit values. */
export const annotateCoordinatorPayload = <T extends Record<string, unknown>>(payload: T): T & InputCommandTiming => {
    const base = asRecord(payload) as T;
    const perfTs = Number(base.perfTs ?? readPerfNow());
    return {
        ...annotateWireTime64(base),
        perfTs,
        perfTsLo: Number(base.perfTsLo ?? encodeInputPerfTsLo(perfTs))
    };
};

/** @deprecated Use {@link annotateCoordinatorPayload}. */
export const annotateInputPayload = annotateCoordinatorPayload;

export const extractInputCommandTiming = (
    payload: unknown,
    packetTimestamp?: number,
    senderKey?: string
): InputCommandTiming => {
    const body = asRecord(payload);
    const tsRaw = body.ts ?? packetTimestamp ?? 0;
    let perfTs = 0;
    if (body.perfTs !== undefined) {
        perfTs = Number(body.perfTs);
    } else if (body.perfTsLo !== undefined) {
        perfTs = expandPerfTsFromLo(senderKey || "*", Number(body.perfTsLo));
    }
    const ts = Number(tsRaw);
    const wireTime64 = String(body.wireTime64 ?? body.ts64 ?? body.wireTs ?? "");
    const subUs = Number(body.subUs ?? 0);
    return {
        ts: Number.isFinite(ts) ? ts : 0,
        perfTs: Number.isFinite(perfTs) ? perfTs : 0,
        subUs: Number.isFinite(subUs) ? subUs : 0,
        wireTime64,
        ts64: wireTime64,
        wireTs: wireTime64
    };
};

/** Sort key: perfTs first, then wall ts, then stable 0. */
export const compareInputCommandTiming = (a: Partial<InputCommandTiming>, b: Partial<InputCommandTiming>): number => {
    const aPerf = Number(a.perfTs);
    const bPerf = Number(b.perfTs);
    if (Number.isFinite(aPerf) && Number.isFinite(bPerf) && aPerf !== bPerf) {
        return aPerf - bPerf;
    }
    const aTs = Number(a.ts);
    const bTs = Number(b.ts);
    if (Number.isFinite(aTs) && Number.isFinite(bTs) && aTs !== bTs) {
        return aTs - bTs;
    }
    return 0;
};

/** Preserve timing fields when normalizing airpad payload shapes. */
export const mergeInputTimingFields = (
    target: Record<string, unknown>,
    source: Record<string, unknown>
): Record<string, unknown> => {
    const out = { ...target };
    if (source.ts !== undefined) out.ts = source.ts;
    if (source.perfTs !== undefined) out.perfTs = source.perfTs;
    if (source.perfTsLo !== undefined) out.perfTsLo = source.perfTsLo;
    if (source.wireTime64 !== undefined) out.wireTime64 = source.wireTime64;
    if (source.ts64 !== undefined) out.ts64 = source.ts64;
    if (source.wireTs !== undefined) out.wireTs = source.wireTs;
    if (source.subUs !== undefined) out.subUs = source.subUs;
    return out;
};
