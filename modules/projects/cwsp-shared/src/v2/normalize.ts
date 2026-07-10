/*
 * Filename: normalize.ts
 * FullPath: modules/projects/cwsp-shared/src/v2/normalize.ts
 * Reason for changes: Canonicalize compatibility packets at one ingress boundary.
 */

import type {
    CwspExtension,
    CwspPacket,
    CwspPacketError,
    CwspPurpose,
    CwspVerb,
    JsonValue,
} from "./types.ts";
import {
    isCwspStatus,
    isNamespacedCwspExtensionId,
    normalizeDataAssetEnvelope,
} from "./validation.ts";

const VERB_ALIASES: Readonly<Record<string, CwspVerb>> = {
    ask: "ask",
    request: "ask",
    act: "act",
    signal: "act",
    notify: "act",
    redirect: "act",
    result: "result",
    response: "result",
    ack: "result",
    resolve: "result",
    error: "error",
    failure: "error",
};

const ACTION_ALIASES: Readonly<Record<string, string>> = {
    clipboard: "clipboard:update",
    sms: "sms:send",
    notifications: "notification:speak",
    notify: "notification:speak",
    dispatch: "network:dispatch",
    "network.dispatch": "network:dispatch",
    "http:dispatch": "network:dispatch",
    "request:dispatch": "network:dispatch",
};

const PURPOSES = new Set<CwspPurpose>([
    "airpad",
    "clipboard",
    "input",
    "mouse",
    "sms",
    "contact",
    "notification",
    "storage",
    "debug",
    "general",
]);

export class CwspNormalizationError extends TypeError {
    readonly code: string;

    constructor(code: string, message: string) {
        super(message);
        this.name = "CwspNormalizationError";
        this.code = code;
    }
}

function isRecord(value: unknown): value is Record<string, unknown> {
    return typeof value === "object" && value !== null && !Array.isArray(value);
}

function requireString(value: unknown, field: string): string {
    if (typeof value !== "string" || value.trim().length === 0) {
        throw new CwspNormalizationError(
            `CWSP_PACKET_${field.toUpperCase()}_REQUIRED`,
            `CWSP packet ${field} must be a non-empty string`,
        );
    }

    return value.trim();
}

function requireTimestamp(value: unknown): number {
    if (
        typeof value !== "number"
        || !Number.isSafeInteger(value)
        || value < 0
    ) {
        throw new CwspNormalizationError(
            "CWSP_PACKET_TIMESTAMP_REQUIRED",
            "CWSP packet timestamp must be a non-negative safe integer",
        );
    }

    return value;
}

/** Converts canonical and compatibility verbs into the four v2 logical verbs. */
export function normalizeCwspVerb(value: unknown): CwspVerb {
    if (typeof value !== "string") {
        throw new CwspNormalizationError(
            "CWSP_PACKET_VERB_REQUIRED",
            "CWSP packet op must be a string",
        );
    }

    const verb = VERB_ALIASES[value.trim().toLowerCase()];
    if (!verb) {
        throw new CwspNormalizationError(
            "CWSP_PACKET_VERB_UNSUPPORTED",
            `Unsupported CWSP packet op: ${value}`,
        );
    }

    return verb;
}

/** Maps only documented legacy action spellings; namespaced actions pass through. */
export function canonicalizeCwspAction(value: unknown): string {
    if (typeof value !== "string" || value.trim().length === 0) {
        return "network:dispatch";
    }

    const action = value.trim();
    return ACTION_ALIASES[action.toLowerCase()] ?? action;
}

function selectPayload(input: Record<string, unknown>): unknown {
    for (const field of ["payload", "data", "body", "params", "result"] as const) {
        if (Object.hasOwn(input, field) && input[field] !== undefined) {
            return input[field];
        }
    }

    return undefined;
}

function normalizePayloadDataAssets(payload: unknown): unknown {
    if (!isRecord(payload)) {
        return payload;
    }

    let normalized: Record<string, unknown> = payload;
    for (const field of ["asset", "dataAsset", "file", "image"] as const) {
        if (!Object.hasOwn(payload, field)) {
            continue;
        }
        const asset = normalizeDataAssetEnvelope(payload[field]);
        if (!asset) {
            throw new CwspNormalizationError(
                "CWSP_PACKET_DATA_ASSET_INVALID",
                `CWSP packet payload.${field} must be a compact DataAsset envelope`,
            );
        }
        if (normalized === payload) {
            normalized = { ...payload };
        }
        normalized[field] = asset;
    }
    return normalized;
}

function inferAction(input: Record<string, unknown>, payload: unknown): string {
    for (const value of [input.what, input.type, input.action]) {
        if (typeof value === "string" && value.trim().length > 0) {
            return canonicalizeCwspAction(value);
        }
    }

    if (isRecord(payload)) {
        for (const value of [payload.op, payload.action, payload.type]) {
            if (typeof value === "string" && value.trim().length > 0) {
                return canonicalizeCwspAction(value);
            }
        }
    }

    return "network:dispatch";
}

/** Infers a stable logical purpose without consulting a transport or platform. */
export function inferCwspPurpose(what: string, explicit?: unknown): CwspPurpose {
    if (typeof explicit === "string" && PURPOSES.has(explicit as CwspPurpose)) {
        return explicit as CwspPurpose;
    }

    const domain = what.split(":", 1)[0]?.toLowerCase();
    switch (domain) {
        case "airpad":
        case "keyboard":
        case "mouse":
        case "voice":
            return "airpad";
        case "clipboard":
            return "clipboard";
        case "settings":
        case "storage":
            return "storage";
        case "debug":
            return "debug";
        case "input":
            return "input";
        case "notification":
            return "notification";
        case "sms":
            return "sms";
        case "contact":
            return "contact";
        default:
            return "general";
    }
}

function normalizeDestinationList(value: unknown): string[] | undefined {
    if (!Array.isArray(value)) {
        return undefined;
    }

    const result: string[] = [];
    for (const candidate of value) {
        if (typeof candidate !== "string" || candidate.trim().length === 0) {
            continue;
        }
        const destination = candidate.trim();
        if (!result.includes(destination)) {
            result.push(destination);
        }
    }

    return result;
}

function resolveDestinations(input: Record<string, unknown>): string[] | undefined {
    const ids = isRecord(input.ids) ? input.ids : undefined;
    for (const candidate of [
        input.destinations,
        input.nodes,
        ids?.destinations,
    ]) {
        const destinations = normalizeDestinationList(candidate);
        if (destinations) {
            return destinations;
        }
    }

    for (const candidate of [input.target, input.targetId, input.deviceId]) {
        if (typeof candidate === "string" && candidate.trim().length > 0) {
            return [candidate.trim()];
        }
    }

    return undefined;
}

function resolveSender(input: Record<string, unknown>): string {
    const ids = isRecord(input.ids) ? input.ids : undefined;
    for (const candidate of [input.sender, input.byId, input.from, ids?.byId]) {
        if (typeof candidate === "string" && candidate.trim().length > 0) {
            return candidate.trim();
        }
    }

    return requireString(undefined, "sender");
}

function normalizeExtensions(value: unknown): CwspExtension[] | undefined {
    if (value === undefined) {
        return undefined;
    }
    if (!Array.isArray(value)) {
        throw new CwspNormalizationError(
            "CWSP_PACKET_EXTENSIONS_INVALID",
            "CWSP packet extensions must be an array",
        );
    }

    return value.map((candidate, index) => {
        if (!isRecord(candidate)) {
            throw new CwspNormalizationError(
                "CWSP_PACKET_EXTENSION_INVALID",
                `CWSP extension at index ${index} must be an object`,
            );
        }

        const id = requireString(candidate.id, "extension_id");
        if (!isNamespacedCwspExtensionId(id)) {
            throw new CwspNormalizationError(
                "CWSP_PACKET_EXTENSION_ID_INVALID",
                `CWSP extension id must be namespaced: ${id}`,
            );
        }
        if (
            typeof candidate.version !== "number"
            || !Number.isSafeInteger(candidate.version)
            || candidate.version < 1
        ) {
            throw new CwspNormalizationError(
                "CWSP_PACKET_EXTENSION_VERSION_INVALID",
                `CWSP extension ${id} requires a positive integer version`,
            );
        }

        const extension: CwspExtension = {
            id,
            version: candidate.version,
            required: candidate.required === true,
        };
        if (Object.hasOwn(candidate, "data")) {
            extension.data = candidate.data as JsonValue;
        }
        return extension;
    });
}

function normalizeError(value: unknown): CwspPacketError | undefined {
    if (value === undefined) {
        return undefined;
    }
    if (typeof value === "string" && value.length > 0) {
        return {
            code: "CWSP_ERROR",
            message: value,
        };
    }
    if (!isRecord(value)) {
        throw new CwspNormalizationError(
            "CWSP_PACKET_ERROR_INVALID",
            "CWSP packet error must be an object or string",
        );
    }

    const error: CwspPacketError = {
        code: requireString(value.code, "error_code"),
        message: requireString(value.message, "error_message"),
    };
    if (Object.hasOwn(value, "details")) {
        error.details = value.details;
    }
    return error;
}

/**
 * Normalizes one untrusted logical packet. It intentionally performs no I/O,
 * clock reads, UUID generation, routing, or platform driver execution.
 */
export function normalizeCwspPacket(value: unknown): CwspPacket {
    if (!isRecord(value)) {
        throw new CwspNormalizationError(
            "CWSP_PACKET_INVALID",
            "CWSP packet must be an object",
        );
    }

    const op = normalizeCwspVerb(value.op);
    const payload = normalizePayloadDataAssets(selectPayload(value));
    const what = inferAction(value, payload);
    const destinations = resolveDestinations(value);
    const extensions = normalizeExtensions(value.extensions);
    const error = normalizeError(value.error);
    const packet: CwspPacket = {
        op,
        what,
        purpose: inferCwspPurpose(what, value.purpose),
        uuid: requireString(value.uuid, "uuid"),
        timestamp: requireTimestamp(value.timestamp),
        sender: resolveSender(value),
        flags: {
            ...(isRecord(value.flags) ? value.flags : {}),
            canonicalV2: true,
        },
    };

    if (typeof value.protocol === "string" && value.protocol.trim().length > 0) {
        packet.protocol = value.protocol.trim();
    }
    if (typeof value.transport === "string" && value.transport.trim().length > 0) {
        packet.transport = value.transport.trim();
    }
    if (destinations) {
        packet.nodes = [...destinations];
        packet.destinations = [...destinations];
    }
    if (payload !== undefined) {
        packet.payload = payload;
    }
    if (value.status !== undefined && !isCwspStatus(value.status)) {
        throw new CwspNormalizationError(
            "CWSP_PACKET_STATUS_INVALID",
            "CWSP packet status must be an integer from 100 through 599",
        );
    }
    if (isCwspStatus(value.status)) {
        packet.status = value.status;
    }
    if (error) {
        packet.error = error;
    }
    if (extensions) {
        packet.extensions = extensions;
    }

    return packet;
}

export const normalizePacket = normalizeCwspPacket;
export const normalizePacketForWire = normalizeCwspPacket;
