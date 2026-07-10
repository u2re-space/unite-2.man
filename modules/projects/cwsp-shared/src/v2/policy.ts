/*
 * Filename: policy.ts
 * FullPath: modules/projects/cwsp-shared/src/v2/policy.ts
 * Reason for changes: Evaluate stale, duplicate, and reconnect behavior purely.
 */

import { getClipboardDedupeKey } from "./clipboard.ts";
import type {
    CwspPacket,
    CwspPolicyClass,
    CwspPolicyConfig,
    CwspPolicyContext,
    CwspPolicyDecision,
} from "./types.ts";

/** Safe adapter-independent bound used when a reconnect queue omits its limit. */
export const DEFAULT_CWSP_RECONNECT_QUEUE_SIZE = 100;

export const DEFAULT_CWSP_POLICY: Readonly<CwspPolicyConfig> = Object.freeze({
    relativeInputMaxAgeMs: 250,
    discreteInputMaxAgeMs: 2_000,
    generalMaxAgeMs: 4_000,
    clipboardMaxAgeMs: 30_000,
    clipboardEchoWindowMs: 3_500,
    reconnectMaxAgeMs: 12_000,
    settingsMaxAgeMs: 30_000,
    debugMaxAgeMs: 30_000,
    debugMaxPending: 200,
    replyMaxAgeMs: 8_000,
});

function isRecord(value: unknown): value is Record<string, unknown> {
    return typeof value === "object" && value !== null && !Array.isArray(value);
}

function wrapperAction(packet: CwspPacket): string | undefined {
    if (!isRecord(packet.payload)) {
        return undefined;
    }
    for (const candidate of [
        packet.payload.op,
        packet.payload.action,
        packet.payload.type,
    ]) {
        if (typeof candidate === "string" && candidate.length > 0) {
            return candidate.includes(":")
                ? candidate
                : `${packet.what.slice("airpad:".length)}:${candidate}`;
        }
    }
    return undefined;
}

export function classifyCwspPacket(packet: CwspPacket): CwspPolicyClass {
    if (packet.op === "result" || packet.op === "error") {
        return "reply";
    }
    if (packet.what.startsWith("clipboard:")) {
        return "clipboard";
    }
    if (packet.what.startsWith("settings:")) {
        return "settings";
    }
    if (packet.what.startsWith("debug:")) {
        return "debug";
    }

    const action = packet.what.startsWith("airpad:")
        ? wrapperAction(packet) ?? packet.what
        : packet.what;
    if (action === "mouse:move" || action === "mouse:scroll") {
        return "relative-input";
    }
    if (
        action.startsWith("mouse:")
        || action.startsWith("keyboard:")
        || packet.what === "airpad:mouse"
        || packet.what === "airpad:keyboard"
    ) {
        return "discrete-input";
    }
    return "general";
}

function maxAgeForClass(
    packetClass: CwspPolicyClass,
    policy: CwspPolicyConfig,
): number {
    switch (packetClass) {
        case "relative-input":
            return policy.relativeInputMaxAgeMs;
        case "discrete-input":
            return policy.discreteInputMaxAgeMs;
        case "clipboard":
            return policy.clipboardMaxAgeMs;
        case "settings":
            return policy.settingsMaxAgeMs;
        case "debug":
            return policy.debugMaxAgeMs;
        case "reply":
            return policy.replyMaxAgeMs;
        default:
            return policy.generalMaxAgeMs;
    }
}

function makeDecision(
    action: CwspPolicyDecision["action"],
    reason: CwspPolicyDecision["reason"],
    packetClass: CwspPolicyClass,
    dedupeKey?: string,
    evict?: "oldest",
): CwspPolicyDecision {
    const decision: CwspPolicyDecision = {
        action,
        reason,
        class: packetClass,
    };
    if (dedupeKey !== undefined) {
        decision.dedupeKey = dedupeKey;
    }
    if (evict !== undefined) {
        decision.evict = evict;
    }
    return decision;
}

/**
 * Returns a decision only. Callers update seen sets, queues, and clocks after
 * applying it, which keeps this policy portable across browser, Java, and Node.
 */
export function evaluateCwspPolicy(
    packet: CwspPacket,
    context: CwspPolicyContext,
    overrides: Partial<CwspPolicyConfig> = {},
): CwspPolicyDecision {
    const policy: CwspPolicyConfig = {
        ...DEFAULT_CWSP_POLICY,
        ...overrides,
    };
    const packetClass = classifyCwspPacket(packet);
    const dedupeKey = packetClass === "clipboard"
        ? getClipboardDedupeKey(packet)
        : undefined;

    if (context.seenUuids?.includes(packet.uuid)) {
        return makeDecision("drop", "duplicate-uuid", packetClass, dedupeKey);
    }
    if (
        dedupeKey !== undefined
        && context.seenClipboardKeys?.includes(dedupeKey)
    ) {
        return makeDecision("drop", "duplicate-content", packetClass, dedupeKey);
    }
    if (
        dedupeKey !== undefined
        && context.remoteClipboard?.key === dedupeKey
        && context.now >= context.remoteClipboard.appliedAt
        && context.now - context.remoteClipboard.appliedAt
            <= policy.clipboardEchoWindowMs
    ) {
        return makeDecision("drop", "clipboard-echo", packetClass, dedupeKey);
    }
    if (
        packetClass === "reply"
        && !context.activeCorrelations?.includes(packet.uuid)
    ) {
        return makeDecision("drop", "inactive-correlation", packetClass);
    }

    const age = Math.max(0, context.now - packet.timestamp);
    if (age > maxAgeForClass(packetClass, policy)) {
        return makeDecision("drop", "stale", packetClass, dedupeKey);
    }

    if (context.connection === "connected") {
        return makeDecision("accept", "accepted", packetClass, dedupeKey);
    }
    if (packetClass === "relative-input" || packetClass === "discrete-input") {
        return makeDecision(
            "drop",
            "reconnect-no-input-replay",
            packetClass,
            dedupeKey,
        );
    }
    if (packetClass === "settings" || packetClass === "reply") {
        return makeDecision(
            "drop",
            "reconnect-no-automatic-replay",
            packetClass,
            dedupeKey,
        );
    }
    if (age > policy.reconnectMaxAgeMs) {
        return makeDecision("drop", "stale", packetClass, dedupeKey);
    }

    const queueSize = context.queueSize ?? 0;
    const configuredMaximum = (
        Number.isSafeInteger(context.maxQueueSize)
        && (context.maxQueueSize ?? -1) >= 0
    )
        ? context.maxQueueSize as number
        : DEFAULT_CWSP_RECONNECT_QUEUE_SIZE;
    const maximum = packetClass === "debug"
        ? Math.min(configuredMaximum, policy.debugMaxPending)
        : configuredMaximum;
    if (queueSize >= maximum) {
        if (packetClass === "debug") {
            return makeDecision(
                "enqueue",
                "reconnect-buffered",
                packetClass,
                dedupeKey,
                "oldest",
            );
        }
        return makeDecision("drop", "queue-full", packetClass, dedupeKey);
    }

    return makeDecision(
        "enqueue",
        "reconnect-buffered",
        packetClass,
        dedupeKey,
    );
}

export const evaluatePacketPolicy = evaluateCwspPolicy;
