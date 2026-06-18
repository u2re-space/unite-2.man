import { splitMultiValueList } from "./multi-value-list.ts";

/**
 * Parse CWSP wire list entries as `NodeId` or `NodeId::AccessToken` (split on the **last** `::`
 * so node ids may contain single colons, e.g. IPv6).
 */

export type WireTargetEntry = {
    nodeId: string;
    /** Per-destination access / control token (may bypass allow lists on relay when verified). */
    accessToken?: string;
};

export function parseWireTargetEntry(raw: string): WireTargetEntry {
    const t = String(raw ?? "").trim();
    if (!t) return { nodeId: "" };
    const idx = t.lastIndexOf("::");
    if (idx <= 0) return { nodeId: t };
    const nodeId = t.slice(0, idx).trim();
    const accessToken = t.slice(idx + 2).trim();
    if (!nodeId) return { nodeId: t };
    return { nodeId, accessToken: accessToken || undefined };
}

/** Split comma / semicolon / whitespace list or legacy array into parsed entries (dedupe by nodeId + token). */
export function parseWireTargetList(value: unknown): WireTargetEntry[] {
    if (Array.isArray(value)) {
        const out: WireTargetEntry[] = [];
        const seen = new Set<string>();
        for (const entry of value) {
            if (typeof entry === "string") {
                for (const parsed of parseWireTargetList(entry)) pushUnique(out, seen, parsed);
                continue;
            }
            if (!entry || typeof entry !== "object") continue;
            const record = entry as Record<string, unknown>;
            const nodeId = String(record.nodeId ?? record.id ?? "").trim();
            if (!nodeId) continue;
            const accessToken = record.accessToken != null ? String(record.accessToken).trim() : undefined;
            pushUnique(out, seen, { nodeId, accessToken: accessToken || undefined });
        }
        return out;
    }
    if (typeof value !== "string") return [];
    const parts = splitMultiValueList(value);
    const out: WireTargetEntry[] = [];
    const seen = new Set<string>();
    for (const p of parts) {
        const e = parseWireTargetEntry(p);
        if (!e.nodeId) continue;
        pushUnique(out, seen, e);
    }
    return out;
}

const pushUnique = (out: WireTargetEntry[], seen: Set<string>, e: WireTargetEntry): void => {
    const key = `${e.nodeId.toLowerCase()}::${e.accessToken ?? ""}`;
    if (seen.has(key)) return;
    seen.add(key);
    out.push(e);
};

export function wireTargetNodeIds(entries: WireTargetEntry[]): string[] {
    return [...new Set(entries.map((e) => e.nodeId))];
}

/**
 * Group destinations that share the same effective token so callers can emit one act per group.
 * `fallbackAccessToken` applies to entries without a per-id token (e.g. global Settings token).
 */
export function groupWireTargetsByAccessToken(
    entries: WireTargetEntry[],
    fallbackAccessToken: string
): Array<{ nodeIds: string[]; accessToken?: string }> {
    const fb = fallbackAccessToken.trim();
    const groups = new Map<string, string[]>();
    for (const e of entries) {
        const tok = (e.accessToken ?? fb).trim();
        const key = tok || "__none__";
        if (!groups.has(key)) groups.set(key, []);
        groups.get(key)!.push(e.nodeId);
    }
    return Array.from(groups.entries()).map(([key, nodeIds]) => ({
        nodeIds,
        accessToken: key === "__none__" ? undefined : key
    }));
}
