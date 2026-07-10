/*
 * Filename: network-probe.ts
 * FullPath: modules/views/network-view/src/network-probe.ts
 * Change date and time: 16.43.00_10.07.2026
 * Reason for changes: Pass-II — re-export pure origin helpers from network-probe-origin
 */

import {
    buildEndpointOriginCandidates,
    collectEndpointProbeCandidates,
    probeEndpointOriginReport,
    type EndpointProbeReport
} from "cwsp-shared/cwsp-endpoint-resolve";
import { invokeCwsPlatformIPC, isCapacitorCwsNativeShell } from "com/routing/native/cws-bridge";
import {
    labelForProbeCandidate,
    normalizeProbeOrigin,
    pickDispatchOrigin
} from "./network-probe-origin";

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

export { normalizeProbeOrigin, pickDispatchOrigin, labelForProbeCandidate };

const trim = (value: unknown): string => (typeof value === "string" ? value.trim() : "");

// --- WebNative backend proxy -----------------------------------------------------
// WHY: on the WebNative desktop shell the webview fetch is blocked from reaching LAN/WAN HTTPS CWSP
// origins (self-signed TLS + mixed-content + Private Network Access). The backend's /service/endpoint-probe
// RPC runs the same probes from loopback (no webview restrictions) and returns the rows + dispatch.

const isWebnativeSurface = (): boolean => {
    try {
        const g = globalThis as { __WEBNATIVE_AUTH__?: unknown; __CWS_WEBNATIVE_BOOT__?: unknown };
        return Boolean(g.__WEBNATIVE_AUTH__ || g.__CWS_WEBNATIVE_BOOT__);
    } catch { return false; }
};

const webnativeControlUrl = (pathname: string): string | null => {
    try {
        const auth = (globalThis as { __WEBNATIVE_AUTH__?: { port?: number; key?: string } }).__WEBNATIVE_AUTH__;
        if (!auth?.port) return null;
        return `http://127.0.0.1:${auth.port}${pathname}`;
    } catch { return null; }
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

    // WHY: on the WebNative desktop shell the webview can't reach LAN/WAN HTTPS CWSP origins
    // (self-signed TLS + mixed-content + PNA). Proxy through the backend control RPC instead.
    const webnativeRows = await runWebnativeBackendProbes(fields);
    if (webnativeRows?.length) return webnativeRows;

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

/**
 * WebNative backend proxy: POST `/service/endpoint-probe` with `dispatch:true` so the backend runs
 * both the `/lna-probe` reachability set AND a `/api/network/dispatch` probe from its loopback
 * context, then return both as a combined snapshot. Returns `null` when not on the WebNative surface
 * or the control RPC is unreachable (so callers fall back to direct fetch).
 */
export async function runWebnativeBackendProbe(
    fields: { relay?: string; direct?: string; extras?: string[] },
    auth: { clientId?: string; token?: string; accessToken?: string }
): Promise<{ probes: NetworkProbeRow[]; dispatch?: DispatchProbeReport } | null> {
    if (!isWebnativeSurface()) return null;
    const url = webnativeControlUrl("/service/endpoint-probe");
    if (!url) return null;
    // WHY: the control RPC requires the X-API-Key header (same as /service/config). Read it from the
    // webnative auth manifest global the desktop shell injected.
    const authKey = (globalThis as { __WEBNATIVE_AUTH__?: { key?: string } }).__WEBNATIVE_AUTH__?.key;
    const origins = collectEndpointProbeCandidates(fields);
    const controller = typeof AbortController !== "undefined" ? new AbortController() : undefined;
    const timer = controller ? globalThis.setTimeout(() => controller.abort(), 12000) : undefined;
    try {
        const res = await fetch(url, {
            method: "POST",
            headers: authKey ? { "Content-Type": "application/json", "X-API-Key": authKey } : { "Content-Type": "application/json" },
            body: JSON.stringify({ origins, dispatch: true, auth }),
            signal: controller?.signal
        } as RequestInit);
        if (!res.ok) return null;
        const bag = (await res.json()) as {
            rows?: { origin: string; ok: boolean; status?: number; error?: string; latencyMs?: number }[];
            dispatch?: { origin: string; ok: boolean; status?: number; error?: string; bodySnippet?: string; latencyMs?: number };
        };
        const probes: NetworkProbeRow[] = (bag.rows ?? []).map((r, i) => ({
            label: labelForProbeCandidate(r.origin, i, fields),
            origin: r.origin,
            ok: r.ok,
            status: r.status,
            error: r.error,
            latencyMs: r.latencyMs
        }));
        const dispatch = bag.dispatch
            ? {
                origin: bag.dispatch.origin,
                ok: bag.dispatch.ok,
                status: bag.dispatch.status,
                error: bag.dispatch.error,
                bodySnippet: bag.dispatch.bodySnippet,
                latencyMs: bag.dispatch.latencyMs
            }
            : undefined;
        return { probes, dispatch };
    } catch {
        return null;
    } finally {
        if (timer) clearTimeout(timer);
    }
}

const runWebnativeBackendProbes = async (fields: { relay?: string; direct?: string; extras?: string[] }): Promise<NetworkProbeRow[] | null> => {
    const r = await runWebnativeBackendProbe(fields, {});
    return r?.probes.length ? r.probes : null;
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

/** Split destination id list (`L-196;L-210` / commas / spaces / newlines). */
export const parseDestinationIds = (raw: string | undefined | null): string[] => {
    const text = String(raw || "").trim();
    if (!text) return [];
    const seen = new Set<string>();
    const out: string[] = [];
    for (const part of text.split(/[,;\s\n\r]+/)) {
        const id = part.trim();
        if (!id || seen.has(id)) continue;
        seen.add(id);
        out.push(id);
    }
    return out;
};

export type DestinationLinkProbe = {
    id: string;
    ok: boolean;
    origin: string;
    status?: number;
    error?: string;
    latencyMs?: number;
    bodySnippet?: string;
};

/**
 * Ask each destination via gateway `/api/network/dispatch` (`clipboard:isReady`).
 * WHY: verifies node-to-node routing through the coordinator, not just host reachability.
 */
export async function probeDestinationLinks(
    destinations: string[],
    fields: { relay?: string; direct?: string },
    auth: { clientId?: string; token?: string; accessToken?: string },
    opts: { timeoutMs?: number; originHint?: string } = {}
): Promise<DestinationLinkProbe[]> {
    const ids = destinations.map((d) => d.trim()).filter(Boolean);
    if (!ids.length) return [];

    const timeoutMs = opts.timeoutMs ?? 8000;
    const seeds = [
        normalizeProbeOrigin(opts.originHint || ""),
        ...collectEndpointProbeCandidates(fields).map(normalizeProbeOrigin)
    ].filter(Boolean);
    const origin = seeds[0] || "";
    if (!origin) {
        return ids.map((id) => ({ id, ok: false, origin: "", error: "no gateway origin" }));
    }

    const clientId = trim(auth.clientId);
    const token = trim(auth.token);
    const accessToken = trim(auth.accessToken);
    const results: DestinationLinkProbe[] = [];

    for (const id of ids) {
        const started = Date.now();
        const headers: Record<string, string> = { "Content-Type": "application/json" };
        if (accessToken) headers["x-auth-token"] = accessToken;
        if (token) headers["x-cws-token"] = token;

        const body = {
            userId: clientId,
            byId: clientId,
            from: clientId,
            token,
            op: "ask",
            what: "clipboard:isReady",
            purpose: "clipboard",
            nodes: [id],
            destinations: [id],
            payload: { probe: true, destination: id }
        };

        if (isCapacitorCwsNativeShell()) {
            try {
                const native = await invokeCwsPlatformIPC({
                    channel: "network:dispatch-probe",
                    payload: {
                        origin,
                        clientId,
                        token,
                        accessToken,
                        what: "clipboard:isReady",
                        nodes: [id],
                        destinations: [id]
                    }
                });
                const bag = native as unknown as Record<string, unknown>;
                const status = typeof bag.statusCode === "number" ? bag.statusCode : undefined;
                const ok = Boolean(bag.ok);
                const errorRaw = typeof bag.error === "string" ? bag.error.trim() : "";
                results.push({
                    id,
                    origin,
                    ok,
                    status,
                    latencyMs: Date.now() - started,
                    bodySnippet: typeof bag.bodySnippet === "string" ? bag.bodySnippet : undefined,
                    error: ok ? undefined : errorRaw || (status != null ? `HTTP ${status}` : "dispatch failed")
                });
                continue;
            } catch {
                /* fall through to fetch */
            }
        }

        const controller = typeof AbortController !== "undefined" ? new AbortController() : undefined;
        const timer =
            controller && timeoutMs > 0
                ? globalThis.setTimeout(() => controller.abort(), timeoutMs)
                : undefined;
        try {
            const res = await fetch(`${origin}/api/network/dispatch`, {
                method: "POST",
                mode: "cors",
                cache: "no-store",
                credentials: "omit",
                headers,
                body: JSON.stringify(body),
                signal: controller?.signal
            } as RequestInit);
            const text = await res.text().catch(() => "");
            const ok = res.ok;
            results.push({
                id,
                origin,
                ok,
                status: res.status,
                latencyMs: Date.now() - started,
                bodySnippet: text.slice(0, 240),
                error: ok ? undefined : `HTTP ${res.status}${res.statusText ? ` ${res.statusText}` : ""}`.trim()
            });
        } catch (error: unknown) {
            results.push({
                id,
                origin,
                ok: false,
                error: describeFetchError(error),
                latencyMs: Date.now() - started
            });
        } finally {
            if (timer) clearTimeout(timer);
        }
    }
    return results;
}
