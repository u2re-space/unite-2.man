/*
 * Filename: clipboard.ts
 * FullPath: modules/projects/cwsp-shared/src/v2/clipboard.ts
 * Reason for changes: Read compatible clipboard carriers without platform APIs.
 */

import type { DataAssetEnvelope } from "./types.ts";
import { normalizeDataAssetEnvelope } from "./validation.ts";

export interface ClipboardContent {
    text?: string;
    asset?: DataAssetEnvelope;
    dedupeKey?: string;
}

function isRecord(value: unknown): value is Record<string, unknown> {
    return typeof value === "object" && value !== null && !Array.isArray(value);
}

function carriers(value: unknown): unknown[] {
    if (!isRecord(value)) {
        return [value];
    }

    const result: unknown[] = [];
    for (const field of ["payload", "data", "result", "body"] as const) {
        if (Object.hasOwn(value, field) && value[field] !== undefined) {
            result.push(value[field]);
        }
    }
    result.push(value);
    return result;
}

function textFromCarrier(value: unknown): string | undefined {
    if (typeof value === "string") {
        return value;
    }
    if (!isRecord(value)) {
        return undefined;
    }

    for (const field of ["text", "content", "body"] as const) {
        if (typeof value[field] === "string") {
            return value[field];
        }
    }
    return undefined;
}

function assetFromCarrier(value: unknown): DataAssetEnvelope | undefined {
    if (!isRecord(value)) {
        return undefined;
    }

    for (const field of ["asset", "dataAsset", "file", "image"] as const) {
        const asset = normalizeDataAssetEnvelope(value[field]);
        if (asset) {
            return asset;
        }
    }
    return undefined;
}

/**
 * Extracts an already-normalized DataAsset envelope. Byte/base64/File/Blob
 * conversion deliberately stays with the shared normalizeDataAsset pipeline.
 */
export function extractClipboardContent(value: unknown): ClipboardContent | undefined {
    const candidates = carriers(value);
    let text: string | undefined;
    let asset: DataAssetEnvelope | undefined;

    for (const candidate of candidates) {
        text ??= textFromCarrier(candidate);
        asset ??= assetFromCarrier(candidate);
        if (text !== undefined && asset !== undefined) {
            break;
        }
    }

    if (text === undefined && asset === undefined) {
        return undefined;
    }

    const content: ClipboardContent = {};
    if (text !== undefined) {
        content.text = text;
        content.dedupeKey = `text:${text}`;
    }
    if (asset !== undefined) {
        content.asset = asset;
        content.dedupeKey ??= `asset:${asset.hash}`;
    }
    return content;
}

export function extractClipboardText(value: unknown): string | undefined {
    return extractClipboardContent(value)?.text;
}

export function extractClipboardAsset(value: unknown): DataAssetEnvelope | undefined {
    return extractClipboardContent(value)?.asset;
}

export function getClipboardDedupeKey(value: unknown): string | undefined {
    return extractClipboardContent(value)?.dedupeKey;
}

export const extractClipboard = extractClipboardContent;
