/*
 * Filename: extensions.ts
 * FullPath: modules/projects/cwsp-shared/src/v2/extensions.ts
 * Reason for changes: Resolve optional and required CWSP v2 extensions safely.
 */

import { buildPacketReply } from "./packet.ts";
import type {
    CwspExtension,
    CwspExtensionResolution,
    CwspPacket,
    CwspReplyInput,
    SupportedCwspExtension,
} from "./types.ts";
import { isNamespacedCwspExtensionId } from "./validation.ts";

export class CwspExtensionResolutionError extends TypeError {
    readonly code: string;

    constructor(code: string, message: string) {
        super(message);
        this.name = "CwspExtensionResolutionError";
        this.code = code;
    }
}

function cloneExtension(extension: CwspExtension): CwspExtension {
    if (!isNamespacedCwspExtensionId(extension.id)) {
        throw new CwspExtensionResolutionError(
            "CWSP_EXTENSION_ID_INVALID",
            `CWSP extension id must be namespaced: ${extension.id}`,
        );
    }
    if (!Number.isSafeInteger(extension.version) || extension.version < 1) {
        throw new CwspExtensionResolutionError(
            "CWSP_EXTENSION_VERSION_INVALID",
            `CWSP extension ${extension.id} requires a positive integer version`,
        );
    }
    if (
        extension.required !== undefined
        && typeof extension.required !== "boolean"
    ) {
        throw new CwspExtensionResolutionError(
            "CWSP_EXTENSION_REQUIRED_INVALID",
            `CWSP extension ${extension.id} required flag must be boolean`,
        );
    }

    const clone: CwspExtension = {
        id: extension.id,
        version: extension.version,
        required: extension.required === true,
    };
    if (extension.data !== undefined) {
        clone.data = extension.data;
    }
    return clone;
}

function isSupported(
    extension: CwspExtension,
    supported: readonly SupportedCwspExtension[],
): boolean {
    const descriptor = supported.find(({ id }) => id === extension.id);
    return descriptor !== undefined
        && (
            descriptor.versions === undefined
            || descriptor.versions.includes(extension.version)
        );
}

/**
 * Optional unknown extensions are preserved for relay and ignored locally.
 * Required unknown versions produce data for one explicit correlated error.
 */
export function resolveCwspExtensions(
    extensions: readonly CwspExtension[] = [],
    supported: readonly SupportedCwspExtension[] = [],
): CwspExtensionResolution {
    const preserved = extensions.map(cloneExtension);
    const handled: string[] = [];
    const ignored: string[] = [];
    const unsupportedRequired: Array<{ id: string; version: number }> = [];

    for (const extension of preserved) {
        if (isSupported(extension, supported)) {
            handled.push(extension.id);
        } else if (extension.required === true) {
            unsupportedRequired.push({
                id: extension.id,
                version: extension.version,
            });
        } else {
            ignored.push(extension.id);
        }
    }

    if (unsupportedRequired.length === 0) {
        return {
            ok: true,
            handled,
            ignored,
            preserved,
        };
    }

    const names = unsupportedRequired
        .map(({ id, version }) => `${id}@${version}`)
        .join(", ");
    return {
        ok: false,
        handled,
        ignored,
        preserved,
        error: {
            code: "CWSP_UNSUPPORTED_EXTENSION",
            message: unsupportedRequired.length === 1
                ? `Required CWSP extension is unsupported: ${names}`
                : `Required CWSP extensions are unsupported: ${names}`,
            details: {
                extensions: unsupportedRequired,
            },
        },
    };
}

export const evaluateExtensions = resolveCwspExtensions;
export const handleExtensions = resolveCwspExtensions;

/** Builds the protocol error only after extension resolution has failed. */
export function buildUnsupportedExtensionError(
    request: CwspPacket,
    resolution: CwspExtensionResolution,
    response: Pick<CwspReplyInput, "sender" | "timestamp">,
): CwspPacket {
    if (resolution.ok || !resolution.error) {
        throw new CwspExtensionResolutionError(
            "CWSP_EXTENSION_ERROR_NOT_REQUIRED",
            "Cannot build an extension error for a successful resolution",
        );
    }

    return buildPacketReply(request, {
        op: "error",
        timestamp: response.timestamp,
        sender: response.sender,
        status: 422,
        error: resolution.error,
    });
}
