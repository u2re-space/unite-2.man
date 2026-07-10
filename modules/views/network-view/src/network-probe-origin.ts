/*
 * Filename: network-probe-origin.ts
 * FullPath: modules/views/network-view/src/network-probe-origin.ts
 * Change date and time: 16.43.00_10.07.2026
 * Reason for changes: Pass-II — pure probe-origin helpers for Network contract tests
 *   (no native bridge / fetch side effects).
 */

import {
    collectEndpointProbeCandidates,
    parseConnectHostInput,
    splitConnectHostList
} from "cwsp-shared/cwsp-endpoint-resolve";

export type NetworkProbeOriginRow = {
    label: string;
    origin: string;
    ok: boolean;
    status?: number;
    statusText?: string;
    error?: string;
    latencyMs?: number;
};

const trim = (value: unknown): string => (typeof value === "string" ? value.trim() : "");

/** Strip probe path suffix; canonical CWSP HTTPS origin (`https://host:8434`). */
export const normalizeProbeOrigin = (raw: string): string => {
    const t = trim(raw).replace(/\/lna-probe\/?$/i, "").replace(/\/+$/, "");
    if (!t) return "";
    const parsed = parseConnectHostInput(t);
    if (!parsed?.host) return t;
    const proto = parsed.protocol ?? "https";
    if (parsed.port) return `${proto}://${parsed.host}:${parsed.port}`;
    // WHY: bare IP/host in settings must not fall back to HTTPS :443 (CWSP listens on :8434).
    return `${proto}://${parsed.host}:8434`;
};

export const labelForProbeCandidate = (
    origin: string,
    index: number,
    fields: { relay?: string; direct?: string }
): string => {
    const relaySet = new Set(splitConnectHostList(fields.relay ?? "").map((h) => normalizeProbeOrigin(h)));
    const directSet = new Set(splitConnectHostList(fields.direct ?? "").map((h) => normalizeProbeOrigin(h)));
    const norm = normalizeProbeOrigin(origin);
    if (relaySet.has(norm)) return index === 0 ? "Relay / gateway" : "Relay (alt)";
    if (directSet.has(norm)) return "Direct peer";
    if (norm.includes("192.168.0.200")) return "Gateway LAN fallback";
    if (norm.includes("45.147.121.152")) return "Gateway WAN fallback";
    if (norm.includes("127.0.0.1") || norm.includes("localhost")) return "Loopback";
    return `Candidate ${index + 1}`;
};

export const pickDispatchOrigin = (
    probes: NetworkProbeOriginRow[],
    fields: { relay?: string; direct?: string; extras?: string[] }
): string => {
    const okOrigin = probes.find((p) => p.ok)?.origin;
    if (okOrigin) return normalizeProbeOrigin(okOrigin);
    const configured = collectEndpointProbeCandidates(fields);
    if (configured[0]) return configured[0];
    if (probes[0]?.origin) return normalizeProbeOrigin(probes[0].origin);
    return "";
};
