/*
 * Filename: packet.ts
 * FullPath: modules/projects/cwsp-shared/src/v2/packet.ts
 * Reason for changes: Provide the single deterministic CWSP v2 packet builder.
 */

import { normalizeCwspPacket } from "./normalize.ts";
import type {
    CwspPacket,
    CwspPacketInput,
    CwspReplyInput,
    DriverReadiness,
} from "./types.ts";

export class CwspPacketBuildError extends TypeError {
    readonly code: string;

    constructor(code: string, message: string) {
        super(message);
        this.name = "CwspPacketBuildError";
        this.code = code;
    }
}

/**
 * Builds a canonical packet using caller-provided identity and time. Requiring
 * those values keeps fixtures and adapters deterministic.
 */
export function createCwspPacket(input: CwspPacketInput): CwspPacket {
    return normalizeCwspPacket(input);
}

export const buildPacket = createCwspPacket;
export const buildCwspPacket = createCwspPacket;

/** Compatibility convenience for existing clipboard-only call sites. */
export function buildClipboardPacket(input: CwspPacketInput): CwspPacket {
    return createCwspPacket({
        ...input,
        op: "act",
        what: "clipboard:update",
    });
}

/**
 * Correlates a result/error with the original UUID and routes it back to the
 * logical sender, never to an intermediary gateway identity.
 */
export function buildPacketReply(
    request: CwspPacket,
    reply: CwspReplyInput,
): CwspPacket {
    const op = reply.op ?? (reply.error ? "error" : "result");
    if (op === "error" && !reply.error) {
        throw new CwspPacketBuildError(
            "CWSP_PACKET_ERROR_REQUIRED",
            "An error reply requires an error body",
        );
    }

    const input: CwspPacketInput = {
        op,
        what: request.what,
        uuid: request.uuid,
        timestamp: reply.timestamp,
        sender: reply.sender,
        destinations: [request.sender],
    };
    if (request.purpose) {
        input.purpose = request.purpose;
    }
    if (request.protocol) {
        input.protocol = request.protocol;
    }
    if (request.transport) {
        input.transport = request.transport;
    }
    if (reply.payload !== undefined) {
        input.payload = reply.payload;
    }
    if (reply.status !== undefined) {
        input.status = reply.status;
    }
    if (reply.error) {
        input.error = reply.error;
    }
    if (reply.extensions) {
        input.extensions = reply.extensions;
    }

    return createCwspPacket(input);
}

/**
 * Converts a failed readiness probe into a normalized, correlated packet while
 * leaving driver selection and permission checks to platform adapters.
 */
export function buildDriverReadinessError(
    request: CwspPacket,
    readiness: DriverReadiness,
    response: Pick<CwspReplyInput, "sender" | "timestamp">,
): CwspPacket {
    if (readiness.state === "available") {
        throw new CwspPacketBuildError(
            "CWSP_DRIVER_READY",
            "An available driver cannot produce a readiness error",
        );
    }

    const details: Record<string, unknown> = {
        capability: readiness.capability,
        state: readiness.state,
    };
    if (readiness.permission) {
        details.permission = readiness.permission;
    }
    if (readiness.implementation) {
        details.implementation = readiness.implementation;
    }
    if (readiness.version) {
        details.version = readiness.version;
    }

    return buildPacketReply(request, {
        op: "error",
        timestamp: response.timestamp,
        sender: response.sender,
        status: 503,
        error: {
            code: readiness.state === "degraded"
                ? "CWSP_DRIVER_DEGRADED"
                : "CWSP_DRIVER_UNAVAILABLE",
            message: readiness.reason
                ?? `${readiness.capability} driver is ${readiness.state}`,
            details,
        },
    });
}
