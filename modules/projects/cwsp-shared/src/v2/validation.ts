/*
 * Filename: validation.ts
 * FullPath: modules/projects/cwsp-shared/src/v2/validation.ts
 * Reason for changes: Keep runtime validation aligned with packet.schema.json.
 */

import type { DataAssetEnvelope } from "./types.ts";

export const CWSP_STATUS_MIN = 100;
export const CWSP_STATUS_MAX = 599;
export const CWSP_EXTENSION_ID_PATTERN_SOURCE = "^[^/\\s]+\\.[^/\\s]+/.+$";
export const CWSP_EXTENSION_ID_PATTERN = new RegExp(
    CWSP_EXTENSION_ID_PATTERN_SOURCE,
    "u",
);

const DATA_ASSET_FIELDS = new Set([
    "hash",
    "name",
    "mimeType",
    "type",
    "size",
    "source",
    "data",
    "url",
]);

function isRecord(value: unknown): value is Record<string, unknown> {
    return typeof value === "object" && value !== null && !Array.isArray(value);
}

export function isCwspStatus(value: unknown): value is number {
    return (
        typeof value === "number"
        && Number.isSafeInteger(value)
        && value >= CWSP_STATUS_MIN
        && value <= CWSP_STATUS_MAX
    );
}

export function isNamespacedCwspExtensionId(value: unknown): value is string {
    return typeof value === "string" && CWSP_EXTENSION_ID_PATTERN.test(value);
}

/**
 * Canonicalizes only compact DataAsset envelope metadata. File/Blob/base64
 * conversion remains owned by normalizeDataAsset in the platform-neutral data
 * pipeline and is intentionally not duplicated here.
 */
export function normalizeDataAssetEnvelope(
    value: unknown,
): DataAssetEnvelope | undefined {
    if (
        !isRecord(value)
        || Object.keys(value).some((field) => !DATA_ASSET_FIELDS.has(field))
    ) {
        return undefined;
    }

    const mimeType = typeof value.mimeType === "string"
        ? value.mimeType
        : value.type;
    if (
        typeof value.hash !== "string"
        || value.hash.length === 0
        || typeof value.name !== "string"
        || value.name.length === 0
        || typeof mimeType !== "string"
        || mimeType.length === 0
        || typeof value.size !== "number"
        || !Number.isSafeInteger(value.size)
        || value.size < 0
        || typeof value.source !== "string"
        || value.source.length === 0
        || (value.data !== undefined && typeof value.data !== "string")
        || (value.url !== undefined && typeof value.url !== "string")
    ) {
        return undefined;
    }

    const asset: DataAssetEnvelope = {
        hash: value.hash,
        name: value.name,
        mimeType,
        size: value.size,
        source: value.source,
    };
    if (typeof value.data === "string") {
        asset.data = value.data;
    }
    if (typeof value.url === "string") {
        asset.url = value.url;
    }
    return asset;
}
