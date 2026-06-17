import {
    buildEndpointOriginCandidates,
    collectEndpointProbeCandidates,
    parseConnectHostInput,
    probeEndpointOriginReport,
    splitConnectHostList,
    type EndpointProbeReport
} from "cwsp-shared/cwsp-endpoint-resolve";
import { invokeCwsPlatformIPC, isCapacitorCwsNativeShell } from "com/routing/native/cws-bridge";

export type NetworkProbeRow = EndpointProbeReport & {
    label: string;
};

export type DispatchProbeReport = {
    origin: string;
    ok: boolean;
    status?: number;
    statusText?: string;
    error?: string;
    bodySnippet?: string;
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

const describeFetchError = (error: unknown): string => {
    const msg = error instanceof Error ? error.message : String(error ?? "fetch failed");
    if (/abort/i.test(msg)) return "timeout";
    if (/refused|ECONNREFUSED/i.test(msg)) return "connection refused";
    if (/ENOTFOUND|NAME_NOT_RESOLVED/i.test(msg)) return "host not found";
    if (/certificate|cert\.|ssl|tls|ERR_CERT/i.test(msg)) return `TLS: ${msg}`;
    if (/failed to fetch/i.test(msg) && isCapacitorCwsNativeShell()) {
        return "WebView fetch blocked (CORS/TLS) — use native bridge";
    }
    return msg;
};

type NativeProbeRow = {
    url?: string;
    reachable?: boolean;
    statusCode?: number;
    error?: string;
    privateNetworkAllowed?: boolean;
};

const formatNativeProbeError = (row: NativeProbeRow, ok: boolean, status?: number): string | undefined => {
    if (ok) return undefined;
    const bits: string[] = [];
    if (row.error) bits.push(String(row.error));
    if (status != null && status >= 0 && status !== 204) bits.push(`HTTP ${status}`);
    return bits.join(" · ") || "unreachable";
};

const labelForProbeCandidate = (origin: string, index: number, fields: { relay?: string; direct?: string }): string => {
    const relaySet = new Set(splitConnectHostList(fields.relay ?? "").map((h) => normalizeProbeOrigin(h)));
    const directSet = new Set(splitConnectHostList(fields.direct ?? "").map((h) => normalizeProbeOrigin(h)));
    const norm = normalizeProbeOrigin(origin);
    if (relaySet.has(norm)) return index === 0 ? "Relay / gateway" : "Relay (alt)";
    if (directSet.has(norm)) return "Direct peer";
    if (norm.includes("192.168.0.200")) return "Gateway LAN fallback";
    if (norm.includes("45.147.121.152")) return "Gateway WAN fallback";
    return `Candidate ${index + 1}`;
};

/** Java {@code network:probe} via CwsBridge — bypasses WebView fetch restrictions on LAN HTTPS. */
export async function runNativeRouteProbes(fields: {
    relay?: string;
    direct?: string;
    extras?: string[];
}): Promise<NetworkProbeRow[] | null> {
    if (!isCapacitorCwsNativeShell()) return null;
    const candidates = collectEndpointProbeCandidates(fields);
    try {
        const result = await invokeCwsPlatformIPC({
            channel: "network:probe",
            payload: {
                relay: normalizeProbeOrigin(trim(fields.relay)),
                direct: normalizeProbeOrigin(trim(fields.direct)),
                candidates
            }
        });
        const bag = result as unknown as Record<string, unknown>;
        const echo = bag.echo as Record<string, unknown> | undefined;
        const raw = bag.results ?? echo?.results;
        if (!Array.isArray(raw) || !raw.length) return null;

        const seen = new Set<string>();
        const rows: NetworkProbeRow[] = [];
        for (let index = 0; index < raw.length; index++) {
            const row = raw[index] as NativeProbeRow;
            const origin = normalizeProbeOrigin(String(row.url ?? ""));
            if (!origin || seen.has(origin)) continue;
            seen.add(origin);
            const ok = Boolean(row.reachable);
            const status = typeof row.statusCode === "number" ? row.statusCode : undefined;
            rows.push({
                label: labelForProbeCandidate(origin, rows.length, fields),
                origin,
                ok,
                status,
                error: formatNativeProbeError(row, ok, status)
            });
        }
        return rows.length ? rows : null;
    } catch {
        return null;
    }
}

/** Native POST `/api/network/dispatch` (Java TLS stack). */
async function runNativeDispatchProbe(
    origin: string,
    auth: { clientId?: string; token?: string; accessToken?: string }
): Promise<DispatchProbeReport | null> {
    if (!isCapacitorCwsNativeShell()) return null;
    const base = normalizeProbeOrigin(origin);
    if (!base) return null;
    const started = Date.now();
    try {
        const result = await invokeCwsPlatformIPC({
            channel: "network:dispatch-probe",
            payload: {
                origin: base,
                clientId: trim(auth.clientId),
                token: trim(auth.token),
                accessToken: trim(auth.accessToken)
            }
        });
        const bag = result as unknown as Record<string, unknown>;
        const status = typeof bag.statusCode === "number" ? bag.statusCode : undefined;
        const ok = Boolean(bag.ok);
        const errorRaw = typeof bag.error === "string" ? bag.error.trim() : "";
        const bodySnippet = typeof bag.bodySnippet === "string" ? bag.bodySnippet : "";
        return {
            origin: base,
            ok,
            status,
            latencyMs: Date.now() - started,
            bodySnippet,
            error: ok ? undefined : errorRaw || (status != null ? `HTTP ${status}` : "dispatch failed")
        };
    } catch {
        return null;
    }
}

/** Probe relay/direct hosts and fleet fallbacks (port scan when bare IP/domain). */
export async function runEndpointProbes(
    fields: { relay?: string; direct?: string; extras?: string[] },
    opts: { timeoutMs?: number; maxCandidates?: number } = {}
): Promise<NetworkProbeRow[]> {
    const nativeRows = await runNativeRouteProbes(fields);
    if (nativeRows?.length) return nativeRows;

    const timeoutMs = opts.timeoutMs ?? 3500;
    const maxCandidates = opts.maxCandidates ?? 6;
    const rows: NetworkProbeRow[] = [];
    const origins = collectEndpointProbeCandidates(fields);

    for (let index = 0; index < origins.length; index++) {
        const seed = origins[index];
        const label = labelForProbeCandidate(seed, index, fields);
        const hostCandidates = buildEndpointOriginCandidates(seed).slice(0, maxCandidates);
        if (!hostCandidates.length) {
            rows.push({ label, origin: seed, ok: false, error: "invalid host" });
            continue;
        }
        for (const origin of hostCandidates) {
            const report = await probeEndpointOriginReport(origin, { timeoutMs });
            rows.push({ label, ...report });
            if (report.ok) break;
        }
    }
    return rows;
}

export const pickDispatchOrigin = (
    probes: NetworkProbeRow[],
    fields: { relay?: string; direct?: string; extras?: string[] }
): string => {
    const okOrigin = probes.find((p) => p.ok)?.origin;
    if (okOrigin) return normalizeProbeOrigin(okOrigin);
    const configured = collectEndpointProbeCandidates(fields);
    if (configured[0]) return configured[0];
    if (probes[0]?.origin) return normalizeProbeOrigin(probes[0].origin);
    return "";
};

/** Try dispatch on the first reachable probe origin, then fall back through other OK probes. */
export async function runDispatchProbeWithFallback(
    probes: NetworkProbeRow[],
    fields: { relay?: string; direct?: string; extras?: string[] },
    auth: { clientId?: string; token?: string; accessToken?: string },
    timeoutMs = 8000
): Promise<DispatchProbeReport> {
    const okOrigins = probes.filter((p) => p.ok).map((p) => normalizeProbeOrigin(p.origin));
    const seeds = okOrigins.length
        ? okOrigins
        : collectEndpointProbeCandidates(fields);
    let last: DispatchProbeReport = { origin: "", ok: false, error: "no origin" };
    for (const origin of seeds) {
        last = await runDispatchProbe(origin, auth, timeoutMs);
        if (last.ok) return last;
    }
    return last;
}

/** POST `debug:isReady` via `/api/network/dispatch` — surfaces 401/403/405/429 clearly. */
export async function runDispatchProbe(
    origin: string,
    auth: { clientId?: string; token?: string; accessToken?: string },
    timeoutMs = 8000
): Promise<DispatchProbeReport> {
    const base = normalizeProbeOrigin(origin);
    const started = Date.now();
    if (!base) {
        return { origin: "", ok: false, error: "no origin" };
    }

    const native = await runNativeDispatchProbe(base, auth);
    if (native) return native;

    const controller = typeof AbortController !== "undefined" ? new AbortController() : undefined;
    const timer =
        controller && timeoutMs > 0
            ? globalThis.setTimeout(() => controller.abort(), timeoutMs)
            : undefined;

    const clientId = trim(auth.clientId);
    const token = trim(auth.token);
    const accessToken = trim(auth.accessToken);

    const headers: Record<string, string> = { "Content-Type": "application/json" };
    if (accessToken) headers["x-auth-token"] = accessToken;
    if (token) headers["x-cws-token"] = token;

    const body = {
        userId: clientId,
        byId: clientId,
        from: clientId,
        token,
        op: "ask",
        what: "debug:isReady",
        payload: {}
    };

    try {
        const res = await fetch(`${base}/api/network/dispatch`, {
            method: "POST",
            mode: "cors",
            cache: "no-store",
            credentials: "omit",
            headers,
            body: JSON.stringify(body),
            signal: controller?.signal
        } as RequestInit);
        const text = await res.text().catch(() => "");
        const latencyMs = Date.now() - started;
        const ok = res.ok;
        return {
            origin: base,
            ok,
            status: res.status,
            statusText: res.statusText,
            latencyMs,
            bodySnippet: text.slice(0, 240),
            error: ok ? undefined : `HTTP ${res.status}${res.statusText ? ` ${res.statusText}` : ""}`.trim()
        };
    } catch (error: unknown) {
        return {
            origin: base,
            ok: false,
            error: describeFetchError(error),
            latencyMs: Date.now() - started
        };
    } finally {
        if (timer) clearTimeout(timer);
    }
}
