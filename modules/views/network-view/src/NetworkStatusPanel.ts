/*
 * Filename: NetworkStatusPanel.ts
 * FullPath: modules/views/network-view/src/NetworkStatusPanel.ts
 * Change date and time: 13.20.00_21.07.2026
 * Reason for changes: Capacitor — poll Java coordinator:status for /ws, not WebView WebSocket.
 *   2026-07-18: Neutralino — when :19875 unreachable, dispatch backend.ensure
 *   (throttled) so tray/IPC drops can self-heal without WebView /ws.
 *   2026-07-21: Control SPA (cwsp.u2re.space) — Hub status N/A (no browser fleet /ws);
 *     HTTP/destination probes remain the diagnostic surface.
 *   2026-07-21: Capacitor wake (visibility/pageshow) → runtime:reload-settings if /ws down.
 *   2026-07-21: Stop probing Cursor-owned :19875/:19876 from the Neutralino desk
 *     path too — candidate ports are now [auth.port, DEFAULT_CONTROL_PORT, 29110]
 *     for both desk and cwsp-control surfaces (Cursor.exe steals those ports →
 *     ERR_EMPTY_RESPONSE noise).
 *   2026-07-21d: Neutralino Network — drop-zone posts absolute paths to
 *     POST /service/files-ingress (Open-for-Share without Explorer Copy).
 *   2026-07-21e: Paste (Ctrl+V) of files — same ingress; fallback fromClipboard
 *     reads OS CF_HDROP when WebView File.path is empty.
 */

/**
 * Network status panel — connection state, HTTP probes, dispatch auth errors.
 */

import { H } from "fest/lure";
import { loadAsAdopted } from "fest/dom";
import { loadSettings } from "com/config/Settings";
import type { AppSettings } from "com/config/SettingsTypes";
import {
    connectWS,
    disconnectWS,
    initWebSocket,
    isWSConnected,
    onWSConnectionChange
} from "shared/transport/websocket";
import {
    isMaintainHubSocketConnectionEnabled,
    isNeutralinoNodeClipboardHubOwned,
    isPreferNativeWebsocketEnabled
} from "views/airpad/config/config";
import { CwsBridge, invokeCwsNative } from "com/routing/native/cws-bridge";
import { runDispatchProbeWithFallback, runEndpointProbes, runWebnativeBackendProbe, parseDestinationIds, probeDestinationLinks, type DispatchProbeReport, type DestinationLinkProbe, type NetworkProbeRow } from "./network-probe";
import { resolveEcosystemToken } from "com/config/SettingsTypes";
import {
    buildCombinedPageLog,
    collectFrontendLogText,
    collectNativeLogcatText,
    copyTextToClipboard,
    saveTextAsDownload,
    timestampFilename
} from "./network-log-export";
import { initFrontendDebugCapture } from "boot/frontend-debug-capture";
import { applyNetworkA11y } from "./network-a11y";

// @ts-ignore
import style from "./network.scss?inline";

type ProbeSnapshot = {
    probes: NetworkProbeRow[];
    dispatch?: DispatchProbeReport;
    destinations?: DestinationLinkProbe[];
};

type NodeHubStatus = {
    ok?: boolean;
    running?: boolean;
    connected?: boolean;
    hubUrl?: string;
    localId?: string;
    lastError?: string;
    hasToken?: boolean;
};

const isCapacitorNative = (): boolean => {
    try {
        const cap = (globalThis as { Capacitor?: { isNativePlatform?: () => boolean } }).Capacitor;
        return typeof cap?.isNativePlatform === "function" && Boolean(cap.isNativePlatform());
    } catch {
        return false;
    }
};

/**
 * Public Control SPA on VDS (cwsp.u2re.space) — static UI only.
 * WHY: connectWS() intentionally no-ops here so a browser tab does not steal
 * the same clientId as Capacitor/Neutralino on the gateway hub.
 */
const isPublicControlSpa = (): boolean => {
    try {
        // Native shells own /ws — never classify as browser Control SPA.
        if (isCapacitorNative()) return false;
        if (isNeutralinoNodeClipboardHubOwned()) return false;
        const surface = String(
            document.documentElement?.dataset?.cwspSurface || ""
        ).toLowerCase();
        const host = String(location.hostname || "").toLowerCase();
        if (surface === "cwsp-control") return true;
        if (host === "cwsp.u2re.space" || host === "www.cwsp.u2re.space") {
            return true;
        }
        // Generic public HTTPS SPA (not loopback) — no local clipboard-hub.
        return (
            location.protocol === "https:" &&
            host !== "localhost" &&
            host !== "127.0.0.1"
        );
    } catch {
        return false;
    }
};

const DEFAULT_CONTROL_PORT = 29110;
const DEFAULT_CONTROL_KEY = "cwsp-neutralino-local";

const readControlAuth = (): { port: number; key: string } => {
    try {
        const g = globalThis as unknown as {
            __WEBNATIVE_AUTH__?: { port?: number; key?: string };
            __NEUTRALINO_AUTH__?: { port?: number; key?: string };
        };
        const auth = g.__WEBNATIVE_AUTH__ || g.__NEUTRALINO_AUTH__;
        return {
            port: Number(auth?.port) || DEFAULT_CONTROL_PORT,
            key: String(auth?.key || DEFAULT_CONTROL_KEY)
        };
    } catch {
        return { port: DEFAULT_CONTROL_PORT, key: DEFAULT_CONTROL_KEY };
    }
};

/** Refresh loopback auth from disk — Cursor.exe often steals :19875; backend may bind :19876+. */
const refreshControlAuthFromDisk = async (): Promise<void> => {
    try {
        const g = globalThis as unknown as {
            NL_PATH?: string;
            Neutralino?: { filesystem?: { readFile?: (p: string) => Promise<string> } };
            __WEBNATIVE_AUTH__?: { port?: number; key?: string };
            __NEUTRALINO_AUTH__?: { port?: number; key?: string };
        };
        const root = typeof g.NL_PATH === "string" ? g.NL_PATH : "";
        const readFile = g.Neutralino?.filesystem?.readFile;
        if (!root || !readFile) return;
        const raw = await readFile(`${root}/.tmp/cwsp-control-auth.json`);
        const parsed = JSON.parse(raw) as { port?: number; key?: string };
        const port = Number(parsed?.port);
        if (!Number.isFinite(port) || port < 1024 || port === 8434) return;
        const next = { port, key: String(parsed?.key || "cwsp-neutralino-local") };
        g.__WEBNATIVE_AUTH__ = next;
        g.__NEUTRALINO_AUTH__ = next;
    } catch {
        /* ignore */
    }
};

const probeControlPort = async (port: number, key: string): Promise<NodeHubStatus | null> => {
    const ctrl =
        typeof AbortSignal !== "undefined" && typeof AbortSignal.timeout === "function"
            ? AbortSignal.timeout(1500)
            : undefined;
    try {
        const res = await fetch(`http://127.0.0.1:${port}/service/clipboard-hub`, {
            method: "GET",
            headers: { "X-API-Key": key },
            cache: "no-store",
            signal: ctrl
        });
        if (!res.ok) return null;
        const json = (await res.json()) as NodeHubStatus;
        // WHY: Cursor empty-proxy can return non-CWSP bodies — require hub shape.
        if (typeof json?.running !== "boolean" && typeof json?.connected !== "boolean") {
            return null;
        }
        return json;
    } catch {
        return null;
    }
};

const fetchNodeClipboardHubStatus = async (): Promise<NodeHubStatus | null> => {
    // WHY: public /cwsp (cwsp-control) must not PNA-scan loopback unless Neutralino bridge is live.
    try {
        const g = globalThis as unknown as { __CWS_NODE_CLIPBOARD_HUB__?: boolean };
        const surface = document.documentElement?.dataset?.cwspSurface;
        if (surface === "cwsp-control" && !g.__CWS_NODE_CLIPBOARD_HUB__) {
            return null;
        }
    } catch {
        /* ignore */
    }

    await refreshControlAuthFromDisk();
    const auth = readControlAuth();
    // WHY: never probe Cursor-owned :19875/:19876 — Cursor.exe steals those ports
    // and POSTs always fail with ERR_EMPTY_RESPONSE, producing noise + false
    // negatives. Control lives on the configured port (+ DEFAULT_CONTROL_PORT /
    // 29110 fallback). Same list for Neutralino desk and the cwsp-control surface.
    const candidates = Array.from(
        new Set(
            [auth.port, DEFAULT_CONTROL_PORT, 29110].filter((p) => p > 1024)
        )
    );
    for (const port of candidates) {
        const status = await probeControlPort(port, auth.key);
        if (status) {
            const g = globalThis as unknown as {
                __WEBNATIVE_AUTH__?: { port: number; key: string };
                __NEUTRALINO_AUTH__?: { port: number; key: string };
            };
            g.__WEBNATIVE_AUTH__ = { port, key: auth.key };
            g.__NEUTRALINO_AUTH__ = { port, key: auth.key };
            return status;
        }
    }
    return null;
};

const reloadNodeClipboardHub = async (): Promise<NodeHubStatus | null> => {
    // Discover live control first — POST to Cursor-owned :19875 always fails empty.
    const discovered = await fetchNodeClipboardHubStatus();
    const { port, key } = readControlAuth();
    const ctrl =
        typeof AbortSignal !== "undefined" && typeof AbortSignal.timeout === "function"
            ? AbortSignal.timeout(3000)
            : undefined;
    try {
        const res = await fetch(`http://127.0.0.1:${port}/service/clipboard-hub`, {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                "X-API-Key": key
            },
            body: JSON.stringify({ reload: true, force: true }),
            cache: "no-store",
            signal: ctrl
        });
        if (!res.ok) return discovered;
        return (await res.json()) as NodeHubStatus;
    } catch {
        return discovered;
    }
};

/** Throttle extNode backend.ensure when control host is down. */
let lastBackendEnsureAt = 0;
let lastHubHealAt = 0;
const ensureNeutralinoBackend = async (): Promise<boolean> => {
    const now = Date.now();
    if (now - lastBackendEnsureAt < 8000) return false;
    lastBackendEnsureAt = now;
    try {
        const NL = (globalThis as {
            Neutralino?: {
                extensions?: {
                    dispatch?: (id: string, event: string, data: unknown) => Promise<unknown>;
                };
            };
        }).Neutralino;
        if (!NL?.extensions?.dispatch) return false;
        await NL.extensions.dispatch("extNode", "runNode", {
            function: "backend.ensure",
            parameter: null
        });
        return true;
    } catch {
        return false;
    }
};

/** When hub is running but /ws dropped, force a reconnect (throttled). */
const healDisconnectedHub = async (): Promise<NodeHubStatus | null> => {
    const now = Date.now();
    if (now - lastHubHealAt < 10000) return null;
    lastHubHealAt = now;
    return reloadNodeClipboardHub();
};

const formatProbeLine = (row: NetworkProbeRow): string => {
    const parts = [`${row.label}: ${row.origin}`];
    if (row.ok) {
        parts.push(`OK (${row.latencyMs ?? "?"}ms)`);
    } else if (row.status) {
        parts.push(`FAIL HTTP ${row.status}`);
    }
    if (row.error) parts.push(row.error);
    return parts.join(" — ");
};

export class NetworkStatusPanel {
    private root: HTMLElement | null = null;
    private sheet: CSSStyleSheet | null = null;
    private wsUnsub: (() => void) | null = null;
    private nodeHubPoll: ReturnType<typeof setInterval> | null = null;
    private running = false;
    private logLines: string[] = [];
    private probeSummary = "";

    private els = {
        wsCard: null as HTMLElement | null,
        wsValue: null as HTMLElement | null,
        wsDetail: null as HTMLElement | null,
        nativeCard: null as HTMLElement | null,
        nativeValue: null as HTMLElement | null,
        configDetail: null as HTMLElement | null,
        probeList: null as HTMLElement | null,
        log: null as HTMLElement | null,
        testBtn: null as HTMLButtonElement | null,
        destBtn: null as HTMLButtonElement | null,
        destInput: null as HTMLInputElement | null,
        reconnectBtn: null as HTMLButtonElement | null,
        filesDropzone: null as HTMLElement | null,
        filesDropStatus: null as HTMLElement | null
    };

    mount(parent: HTMLElement): HTMLElement {
        this.sheet ??= loadAsAdopted(style) as CSSStyleSheet;

        this.root = H`
            <div class="cw-network-view" data-view="network">
                <header class="cw-network-view__header">
                    <h1>CWSP Network</h1>
                    <p>Connection status, reachability probes, and dispatch errors.</p>
                </header>

                <div class="cw-network-body">
                    <div class="cw-network-status-grid">
                        <section class="cw-network-status-card" data-state="warn" data-ws-card>
                            <div class="cw-network-status-card__title">WebSocket hub</div>
                            <div class="cw-network-status-card__value" data-ws-value>…</div>
                            <div class="cw-network-status-card__detail" data-ws-detail></div>
                        </section>
                        <section class="cw-network-status-card" data-state="warn" data-native-card hidden>
                            <div class="cw-network-status-card__title">Native runtime</div>
                            <div class="cw-network-status-card__value" data-native-value>…</div>
                        </section>
                        <section class="cw-network-status-card">
                            <div class="cw-network-status-card__title">Configuration</div>
                            <div class="cw-network-status-card__detail" data-config-detail>Loading…</div>
                        </section>
                    </div>

                    <div class="cw-network-actions">
                        <button type="button" data-action="test">Run network test</button>
                        <button type="button" data-action="check-destinations">Check destinations</button>
                        <button type="button" data-action="reconnect">Reconnect WS</button>
                        <button type="button" data-action="open-settings">Settings</button>
                    </div>

                    <label class="cw-network-dest-field">
                        <span>Destination node ids</span>
                        <input type="text" data-dest-ids placeholder="L-196;L-210;L-208" autocomplete="off" />
                    </label>
                    <p class="cw-network-dest-hint">Probe clipboard:isReady to each id via gateway (45.147 / .200) — works for Android↔Android on LAN too.</p>

                    <div class="cw-network-dropzone" data-files-dropzone hidden tabindex="0" role="region" aria-label="Open for Share drop or paste zone">
                        <div class="cw-network-dropzone__title">Drop or paste files to share</div>
                        <p class="cw-network-dropzone__hint">Drop or paste (Ctrl+V) files here to Open for Share to configured peers (Neutralino desk).</p>
                        <div class="cw-network-dropzone__status" data-files-drop-status aria-live="polite"></div>
                    </div>

                    <div class="cw-network-actions cw-network-actions--logs">
                        <button type="button" data-action="copy-frontend-log">Copy Frontend Log</button>
                        <button type="button" data-action="copy-logcat">Copy Logcat</button>
                        <button type="button" data-action="save-page-logs">Save page logs</button>
                    </div>

                    <section class="cw-network-probes">
                        <h2>Probe results</h2>
                        <div data-probe-list></div>
                    </section>
                </div>

                <section class="cw-network-log-panel">
                    <h2 class="cw-network-log-panel__title">Activity log</h2>
                    <pre class="cw-network-log" data-log aria-live="polite"></pre>
                </section>
            </div>
        ` as HTMLElement;

        this.els.wsCard = this.root.querySelector("[data-ws-card]");
        this.els.wsValue = this.root.querySelector("[data-ws-value]");
        this.els.wsDetail = this.root.querySelector("[data-ws-detail]");
        this.els.nativeCard = this.root.querySelector("[data-native-card]");
        this.els.nativeValue = this.root.querySelector("[data-native-value]");
        this.els.configDetail = this.root.querySelector("[data-config-detail]");
        this.els.probeList = this.root.querySelector("[data-probe-list]");
        this.els.log = this.root.querySelector("[data-log]");
        this.els.testBtn = this.root.querySelector('[data-action="test"]');
        this.els.destBtn = this.root.querySelector('[data-action="check-destinations"]');
        this.els.destInput = this.root.querySelector("[data-dest-ids]");
        this.els.reconnectBtn = this.root.querySelector('[data-action="reconnect"]');
        this.els.filesDropzone = this.root.querySelector("[data-files-dropzone]");
        this.els.filesDropStatus = this.root.querySelector("[data-files-drop-status]");

        // WHY: a11y contract (landmarks / live regions) is applied after query wiring
        // so tests can audit the same attributes the live panel exposes.
        applyNetworkA11y(this.root);

        this.els.testBtn?.addEventListener("click", () => void this.runFullTest());
        this.els.destBtn?.addEventListener("click", () => void this.runDestinationCheck());
        this.els.reconnectBtn?.addEventListener("click", () => void this.reconnectWs());
        this.wireFilesDropzone();
        this.root.querySelector('[data-action="open-settings"]')?.addEventListener("click", () => {
            globalThis.dispatchEvent(
                new CustomEvent("cw:view-open-request", { detail: { viewId: "settings", target: "minimal" } })
            );
        });
        this.root.querySelector('[data-action="copy-frontend-log"]')?.addEventListener("click", () => {
            void this.copyFrontendLog();
        });
        this.root.querySelector('[data-action="copy-logcat"]')?.addEventListener("click", () => {
            void this.copyLogcat();
        });
        this.root.querySelector('[data-action="save-page-logs"]')?.addEventListener("click", () => {
            void this.savePageLogs();
        });

        parent.replaceChildren(this.root);
        void this.bootstrap();
        return this.root;
    }

    unmount(): void {
        this.wsUnsub?.();
        this.wsUnsub = null;
        if (this.nodeHubPoll) {
            clearInterval(this.nodeHubPoll);
            this.nodeHubPoll = null;
        }
        this.root?.remove();
        this.root = null;
    }

    private appendLog(line: string): void {
        const ts = new Date().toLocaleTimeString();
        this.logLines.unshift(`[${ts}] ${line}`);
        this.logLines = this.logLines.slice(0, 40);
        if (this.els.log) this.els.log.textContent = this.logLines.join("\n");
    }

    private setWsUi(connected: boolean, detail?: string): void {
        if (!this.els.wsCard || !this.els.wsValue) return;
        if (isPublicControlSpa()) {
            // WHY: Control SPA never holds fleet /ws — "Disconnected" was a false alarm.
            this.els.wsCard.dataset.state = "warn";
            this.els.wsValue.textContent = "N/A — Control SPA";
            if (this.els.wsDetail) {
                this.els.wsDetail.textContent =
                    detail ||
                    "Hub lives on Neutralino/Capacitor → gateway :8434. This page only runs HTTP probes.";
            }
            return;
        }
        const javaOwns = isCapacitorNative() && isPreferNativeWebsocketEnabled();
        if (javaOwns) {
            this.els.wsCard.dataset.state = connected ? "ok" : "bad";
            this.els.wsValue.textContent = connected
                ? "Java CwspBridge Connected"
                : "Java CwspBridge Disconnected";
            if (this.els.wsDetail) {
                this.els.wsDetail.textContent =
                    detail ||
                    "CwspBridgeService holds `/ws` — WebView browser WebSocket is not used.";
            }
            return;
        }
        if (isNeutralinoNodeClipboardHubOwned()) {
            this.els.wsCard.dataset.state = connected ? "ok" : "bad";
            this.els.wsValue.textContent = connected
                ? "Node clipboard-hub Connected"
                : "Node clipboard-hub Disconnected";
            if (this.els.wsDetail) {
                this.els.wsDetail.textContent =
                    detail ||
                    "LAN clipboard uses Node `/service/clipboard-hub` — not the WebView WebSocket API.";
            }
            return;
        }
        this.els.wsCard.dataset.state = connected ? "ok" : "bad";
        this.els.wsValue.textContent = connected ? "Connected" : "Disconnected";
        if (this.els.wsDetail) this.els.wsDetail.textContent = detail || "";
    }

    private async refreshJavaHubStatus(): Promise<void> {
        try {
            const result = await invokeCwsNative("coordinator:status", {});
            const echo = (result.echo ?? {}) as {
                connected?: boolean;
                wsOpen?: boolean;
                daemon?: boolean;
            };
            const connected = Boolean(echo.wsOpen ?? echo.connected ?? result.ok);
            const parts = [
                echo.daemon === false ? "daemon-stopped" : "daemon",
                connected ? "ws-open" : "ws-closed"
            ];
            this.setWsUi(connected, parts.join(" · "));
        } catch (error) {
            this.setWsUi(false, "Java coordinator:status unreachable");
            this.appendLog(String(error instanceof Error ? error.message : error));
        }
    }

    private applyNodeHubStatus(status: NodeHubStatus | null): void {
        if (!status) {
            this.setWsUi(false, `Node clipboard-hub unreachable (:${readControlAuth().port})`);
            return;
        }
        const connected = Boolean(status.connected);
        const parts = [
            status.running ? "running" : "stopped",
            status.localId ? `id=${status.localId}` : "",
            status.hasToken === false ? "no-token" : "",
            status.hubUrl ? status.hubUrl : "",
            status.lastError ? `err=${status.lastError}` : ""
        ].filter(Boolean);
        this.setWsUi(connected, parts.join(" · "));
    }

    private renderConfig(settings: AppSettings | null): void {
        if (!this.els.configDetail) return;
        const core = settings?.core;
        const relay = String(core?.endpointUrl ?? "—");
        const direct = String(core?.ops?.directUrl ?? "—");
        const clientId = String(core?.userId ?? "—");
        const route = String(core?.socket?.routeTarget ?? "*");
        this.els.configDetail.textContent = [
            `Relay: ${relay}`,
            `Direct: ${direct}`,
            `Client: ${clientId}`,
            `Route: ${route}`
        ].join("\n");
        if (this.els.destInput && !this.els.destInput.value.trim()) {
            const share = String(settings?.shell?.clipboardShareDestinationIds || "").trim();
            this.els.destInput.value = route && route !== "*" ? route : share || "L-196;L-210;L-208";
        }
    }

    private renderProbes(snapshot: ProbeSnapshot): void {
        if (!this.els.probeList) return;
        this.els.probeList.replaceChildren();

        const rows = [...snapshot.probes];
        if (snapshot.dispatch) {
            const d = snapshot.dispatch;
            rows.push({
                label: "Dispatch /api/network/dispatch",
                origin: d.origin,
                ok: d.ok,
                status: d.status,
                statusText: d.statusText,
                error: d.error || (d.bodySnippet ? d.bodySnippet.slice(0, 120) : undefined),
                latencyMs: d.latencyMs
            });
        }
        for (const dest of snapshot.destinations || []) {
            rows.push({
                label: `Destination ${dest.id}`,
                origin: dest.origin || dest.id,
                ok: dest.ok,
                status: dest.status,
                error: dest.error || (dest.bodySnippet ? dest.bodySnippet.slice(0, 120) : undefined),
                latencyMs: dest.latencyMs
            });
        }

        if (!rows.length) {
            const empty = document.createElement("p");
            empty.textContent = "No probes yet — tap Run network test.";
            empty.style.opacity = "0.75";
            empty.style.fontSize = "0.85rem";
            this.els.probeList.append(empty);
            return;
        }

        for (const row of rows) {
            const el = H`
                <div class="cw-network-probe-row" data-ok="${row.ok ? "true" : "false"}">
                    <div class="cw-network-probe-row__head">
                        <span>${row.label}</span>
                        <span>${row.ok ? "OK" : "FAIL"}${row.latencyMs != null ? ` · ${row.latencyMs}ms` : ""}</span>
                    </div>
                    <div>${row.origin}</div>
                    ${row.error ? `<div class="cw-network-probe-row__error">${row.error}</div>` : ""}
                </div>
            ` as HTMLElement;
            this.els.probeList.append(el);
        }
    }

    /**
     * Neutralino desk: drop or paste files onto the Network view to Open-for-Share.
     * WHY: Explorer Copy is one path; drag-drop / Ctrl+V in the CWSP window are
     * explicit share paths. Absolute paths come from Neutralino/Chromium
     * `File.path`; paste falls back to Node reading OS CF_HDROP.
     */
    private wireFilesDropzone(): void {
        const zone = this.els.filesDropzone;
        if (!zone) return;
        // Only Neutralino Node hub owns /service/files-ingress.
        if (!isNeutralinoNodeClipboardHubOwned() || isPublicControlSpa()) {
            zone.hidden = true;
            return;
        }
        zone.hidden = false;

        const setStatus = (msg: string): void => {
            if (this.els.filesDropStatus) this.els.filesDropStatus.textContent = msg;
            this.appendLog(msg);
        };

        const runIngress = (label: string, paths: string[], fromClipboard: boolean): void => {
            void this.ingressFilesForShare(paths, fromClipboard).then(
                (msg) => setStatus(msg),
                (err) =>
                    setStatus(
                        `${label} failed: ${err instanceof Error ? err.message : String(err)}`
                    )
            );
        };

        const onDrag = (e: DragEvent): void => {
            e.preventDefault();
            e.stopPropagation();
            zone.classList.toggle("is-dragover", e.type === "dragover" || e.type === "dragenter");
            if (e.type === "dragleave" || e.type === "drop") {
                zone.classList.remove("is-dragover");
            }
        };

        zone.addEventListener("dragenter", onDrag);
        zone.addEventListener("dragover", onDrag);
        zone.addEventListener("dragleave", onDrag);
        zone.addEventListener("drop", (e) => {
            onDrag(e);
            runIngress("Drop", this.pathsFromFileList(e.dataTransfer?.files), false);
        });

        // WHY: paste on the zone or anywhere on the Network panel (when not typing in an input).
        const onPaste = (e: ClipboardEvent): void => {
            const t = e.target as HTMLElement | null;
            if (
                t &&
                (t.closest("input, textarea, [contenteditable='true']") ||
                    t.tagName === "INPUT" ||
                    t.tagName === "TEXTAREA")
            ) {
                return;
            }
            const paths = this.pathsFromFileList(e.clipboardData?.files);
            const items = Array.from(e.clipboardData?.items || []);
            const hasFileItems = items.some((it) => it.kind === "file");
            const types = Array.from(e.clipboardData?.types || []);
            const plain = String(e.clipboardData?.getData("text/plain") || "").trim();
            const looksLikeFiles =
                hasFileItems ||
                paths.length > 0 ||
                types.some((ty) => /Files|text\/uri-list|CF_HDROP/i.test(ty)) ||
                zone.contains(t as Node) ||
                t === zone ||
                // WHY: Explorer CF_HDROP often exposes neither FileList nor types in WebView2;
                // empty text + Network paste → ask Node to read the OS drop list.
                (!plain && this.root.contains(t as Node));
            if (!looksLikeFiles) return;
            e.preventDefault();
            e.stopPropagation();
            // Prefer WebView paths; otherwise Node re-reads CF_HDROP.
            runIngress("Paste", paths, paths.length === 0);
        };

        zone.addEventListener("paste", onPaste);
        // WHY: Ctrl+V while Network is focused (not only when dropzone has focus).
        this.root.addEventListener("paste", onPaste);
    }

    /** Absolute paths from Neutralino/WebView2 File.path (empty in normal browsers). */
    private pathsFromFileList(files: FileList | null | undefined): string[] {
        if (!files || files.length === 0) return [];
        const paths: string[] = [];
        for (let i = 0; i < files.length; i++) {
            const f = files.item(i) as File & { path?: string };
            if (!f) continue;
            const p = String(f.path || "").trim();
            if (p) paths.push(p);
        }
        return paths;
    }

    private async ingressFilesForShare(paths: string[], fromClipboard: boolean): Promise<string> {
        if (!fromClipboard && paths.length === 0) {
            return "No files to share.";
        }
        await refreshControlAuthFromDisk();
        const auth = readControlAuth();
        const res = await fetch(`http://127.0.0.1:${auth.port}/service/files-ingress`, {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                "X-API-Key": auth.key
            },
            body: JSON.stringify(
                fromClipboard ? { fromClipboard: true, paths } : { paths }
            )
        });
        const body = (await res.json().catch(() => ({}))) as Record<string, unknown>;
        if (!res.ok || body.ok === false) {
            throw new Error(String(body.error || `HTTP ${res.status}`));
        }
        const count = Number(body.fileCount || paths.length || 0);
        return `Shared ${count} file(s) → transfer ${String(body.transferId || "?")} (${String(body.phase || "ok")})`;
    }

    private async bootstrap(): Promise<void> {
        initFrontendDebugCapture();

        // WHY: public Control SPA must not poll loopback clipboard-hub with desk X-API-Key (401 flood).
        const publicHttpsSpa = isPublicControlSpa();

        // Control SPA: HTTP probes only — connectWS() is a no-op by design (same clientId kick).
        if (publicHttpsSpa) {
            this.els.nativeCard?.removeAttribute("hidden");
            if (this.els.nativeValue) {
                this.els.nativeValue.textContent = "Browser · no local hub";
            }
            if (this.els.nativeCard) this.els.nativeCard.dataset.state = "warn";
            this.setWsUi(false);
            if (this.els.reconnectBtn) {
                this.els.reconnectBtn.disabled = true;
                this.els.reconnectBtn.title =
                    "Fleet /ws is owned by Neutralino/Capacitor — use Run network test here.";
            }
            const settings = await loadSettings().catch(() => null);
            this.renderConfig(settings);
            this.appendLog(
                "Control SPA — WebSocket hub N/A (use Neutralino/Capacitor for live /ws)."
            );
            this.appendLog("Ready — tap Run network test for HTTP/dispatch probes.");
            return;
        }

        // WHY: Neutralino/WebNative clipboard LAN sync is Node-owned — never bind UI to WebView WS.
        if (!publicHttpsSpa && isNeutralinoNodeClipboardHubOwned()) {
            this.els.nativeCard?.removeAttribute("hidden");
            if (this.els.nativeValue) this.els.nativeValue.textContent = "Node clipboard-hub";
            if (this.els.nativeCard) this.els.nativeCard.dataset.state = "ok";
            const refresh = async () => {
                try {
                    await refreshControlAuthFromDisk();
                    let status = await fetchNodeClipboardHubStatus();
                    // WHY: running but disconnected = /ws dropped after boot race or gateway bounce.
                    if (status?.running && !status.connected) {
                        const healed = await healDisconnectedHub();
                        if (healed) status = healed;
                    }
                    this.applyNodeHubStatus(status);
                    // WHY: control host may be down after IPC recycle — ask extNode to respawn.
                    if (!status) {
                        const ensured = await ensureNeutralinoBackend();
                        if (ensured) this.appendLog("Requested backend.ensure (control unreachable).");
                    }
                } catch (error) {
                    this.applyNodeHubStatus(null);
                    void ensureNeutralinoBackend();
                    this.appendLog(String(error instanceof Error ? error.message : error));
                }
            };
            await refresh();
            this.nodeHubPoll = setInterval(() => void refresh(), 2500);
            // WHY: after sleep/idle, WebView wakes before /ws — force ensure+reload once.
            const onVisible = () => {
                if (document.visibilityState !== "visible") return;
                void (async () => {
                    const status = await fetchNodeClipboardHubStatus();
                    if (!status) {
                        const ensured = await ensureNeutralinoBackend();
                        if (ensured) this.appendLog("Wake: backend.ensure (control was down).");
                        return;
                    }
                    if (status.running && !status.connected) {
                        const healed = await healDisconnectedHub();
                        if (healed) {
                            this.applyNodeHubStatus(healed);
                            this.appendLog("Wake: clipboard-hub reload requested.");
                        }
                    }
                })();
            };
            document.addEventListener("visibilitychange", onVisible);
            window.addEventListener("pageshow", onVisible);
            const settings = await loadSettings().catch(() => null);
            this.renderConfig(settings);
            this.appendLog("Ready — WebSocket status from Node clipboard-hub (not WebView).");
            return;
        }

        // WHY: Capacitor Java CwspBridgeService owns /ws — poll coordinator:status, skip WebView WS.
        if (isCapacitorNative() && isPreferNativeWebsocketEnabled()) {
            this.els.nativeCard?.removeAttribute("hidden");
            try {
                const info = await CwsBridge.getShellInfo();
                if (this.els.nativeValue) {
                    this.els.nativeValue.textContent = info.native
                        ? `Capacitor · Java /ws · ${info.platform ?? "android"}`
                        : "Web fallback";
                }
                if (this.els.nativeCard) {
                    this.els.nativeCard.dataset.state = info.native ? "ok" : "warn";
                }
            } catch (error) {
                if (this.els.nativeValue) {
                    this.els.nativeValue.textContent = "Bridge unavailable";
                }
                this.appendLog(String(error instanceof Error ? error.message : error));
            }
            await this.refreshJavaHubStatus();
            this.nodeHubPoll = setInterval(() => void this.refreshJavaHubStatus(), 2500);
            // WHY: after idle/Doze WebView wakes with sticky dead /ws — force Java reconnect once.
            const onCapVisible = () => {
                if (document.visibilityState !== "visible") return;
                void (async () => {
                    await this.refreshJavaHubStatus();
                    const open = this.els.wsCard?.dataset.state === "ok";
                    if (!open) {
                        this.appendLog("Wake: Java /ws reconnect…");
                        try {
                            const result = await invokeCwsNative("runtime:reload-settings", {});
                            await this.refreshJavaHubStatus();
                            this.appendLog(
                                result?.ok
                                    ? "Wake: Java /ws reconnect requested."
                                    : "Wake: Java /ws reconnect failed."
                            );
                        } catch (error) {
                            this.appendLog(String(error instanceof Error ? error.message : error));
                        }
                    }
                })();
            };
            document.addEventListener("visibilitychange", onCapVisible);
            window.addEventListener("pageshow", onCapVisible);
            const settings = await loadSettings().catch(() => null);
            this.renderConfig(settings);
            this.appendLog("Ready — WebSocket status from Java CwspBridgeService (not WebView).");
            return;
        }

        initWebSocket(null);
        this.wsUnsub = onWSConnectionChange((connected) => {
            this.setWsUi(connected);
        });
        this.setWsUi(isWSConnected());

        if (isCapacitorNative()) {
            this.els.nativeCard?.removeAttribute("hidden");
            try {
                const info = await CwsBridge.getShellInfo();
                if (this.els.nativeValue) {
                    this.els.nativeValue.textContent = info.native
                        ? `Capacitor · ${info.platform ?? "android"}`
                        : "Web fallback";
                }
                if (this.els.nativeCard) {
                    this.els.nativeCard.dataset.state = info.native ? "ok" : "warn";
                }
            } catch (error) {
                if (this.els.nativeValue) {
                    this.els.nativeValue.textContent = "Bridge unavailable";
                }
                this.appendLog(String(error instanceof Error ? error.message : error));
            }
        }

        const settings = await loadSettings().catch(() => null);
        this.renderConfig(settings);
        // WHY: auto-probe on every mount blocked the UI for 10–30s (multi-host /lna-probe + dispatch).
        this.appendLog("Ready — tap Run network test for full probe.");
    }

    private async reconnectWs(): Promise<void> {
        if (isPublicControlSpa()) {
            this.appendLog(
                "Reconnect WS skipped — Control SPA does not own fleet /ws (would kick Capacitor/Neutralino)."
            );
            this.appendLog("Use Run network test / Check destinations, or reconnect from the desk/phone app.");
            this.setWsUi(false);
            return;
        }
        if (isCapacitorNative() && isPreferNativeWebsocketEnabled()) {
            this.appendLog("Reconnecting Java CwspBridge /ws…");
            try {
                const result = await invokeCwsNative("runtime:reload-settings", {});
                await this.refreshJavaHubStatus();
                this.appendLog(
                    result?.ok ? "Java /ws reconnect requested" : "Java /ws reconnect failed"
                );
            } catch (error) {
                this.appendLog(String(error instanceof Error ? error.message : error));
            }
            return;
        }
        if (isNeutralinoNodeClipboardHubOwned()) {
            this.appendLog("Reloading Node clipboard-hub…");
            try {
                const status = await reloadNodeClipboardHub();
                this.applyNodeHubStatus(status);
                this.appendLog(
                    status?.connected
                        ? "Node clipboard-hub reconnected"
                        : `Node clipboard-hub not connected${status?.lastError ? `: ${status.lastError}` : ""}`
                );
            } catch (error) {
                this.applyNodeHubStatus(null);
                this.appendLog(String(error instanceof Error ? error.message : error));
            }
            return;
        }
        this.appendLog("Reconnecting WebSocket…");
        disconnectWS();
        connectWS();
    }

    private async runFullTest(): Promise<void> {
        if (this.running) return;
        this.running = true;
        if (this.els.testBtn) this.els.testBtn.disabled = true;
        try {
            const settings = await loadSettings().catch(() => null);
            this.renderConfig(settings);
            const core = settings?.core;
            const relay = String(core?.endpointUrl ?? "");
            const direct = String(core?.ops?.directUrl ?? "");
            const clientId = String(core?.userId ?? "");
            const eco = resolveEcosystemToken(settings);
            const token = eco;
            const accessToken = eco;

            this.appendLog("Running /lna-probe on relay, direct, and fallback hosts…");
            // WHY: on the WebNative desktop shell, probe + dispatch go through the backend control
            // RPC in ONE call (the webview can't reach LAN/WAN HTTPS directly). Falls back to the
            // direct fetch path on other surfaces (Capacitor uses the Java bridge inside).
            const webnative = await runWebnativeBackendProbe(
                { relay, direct },
                { clientId, token, accessToken }
            );
            let probes: NetworkProbeRow[];
            let dispatch: DispatchProbeReport | undefined;
            if (webnative?.probes.length) {
                probes = webnative.probes;
                dispatch = webnative.dispatch;
                this.appendLog("Probes via WebNative backend control RPC (/service/endpoint-probe).");
            } else {
                probes = await runEndpointProbes({ relay, direct });
                if (isCapacitorNative() && probes.length && probes[0]?.label.startsWith("Relay")) {
                    this.appendLog("Probes via native Java bridge (network:probe).");
                }
            }
            for (const row of probes) this.appendLog(formatProbeLine(row));

            const okCount = probes.filter((p) => p.ok).length;
            if (!dispatch && (okCount || relay || direct)) {
                this.appendLog(
                    okCount
                        ? `Testing dispatch on ${okCount} reachable host(s)…`
                        : "Testing dispatch on configured hosts (all probes failed)…"
                );
                dispatch = await runDispatchProbeWithFallback(
                    probes,
                    { relay, direct },
                    { clientId, token, accessToken }
                );
            }
            if (dispatch) {
                if (dispatch.ok) {
                    this.appendLog(`Dispatch OK (${dispatch.latencyMs ?? "?"}ms)`);
                } else {
                    this.appendLog(
                        `Dispatch FAIL: ${dispatch.error ?? dispatch.status}${dispatch.bodySnippet ? ` — ${dispatch.bodySnippet.slice(0, 80)}` : ""}`
                    );
                }
            }

            this.renderProbes({ probes, dispatch });
            this.probeSummary = [
                ...probes.map(formatProbeLine),
                dispatch
                    ? `Dispatch: ${dispatch.ok ? "OK" : "FAIL"} ${dispatch.origin} ${dispatch.error ?? dispatch.status ?? ""}`
                    : ""
            ]
                .filter(Boolean)
                .join("\n");

            if (isPublicControlSpa()) {
                this.setWsUi(false);
            } else if (
                !isNeutralinoNodeClipboardHubOwned() &&
                (!isCapacitorNative() || !isPreferNativeWebsocketEnabled())
            ) {
                if (!isWSConnected() && isMaintainHubSocketConnectionEnabled()) {
                    connectWS();
                }
            } else if (isNeutralinoNodeClipboardHubOwned()) {
                try {
                    this.applyNodeHubStatus(await fetchNodeClipboardHubStatus());
                } catch {
                    /* status poll optional after probe */
                }
            } else if (isCapacitorNative() && isPreferNativeWebsocketEnabled()) {
                await this.refreshJavaHubStatus();
            }
        } catch (error) {
            this.appendLog(String(error instanceof Error ? error.message : error));
        } finally {
            this.running = false;
            if (this.els.testBtn) this.els.testBtn.disabled = false;
        }
    }

    private async runDestinationCheck(): Promise<void> {
        if (this.running) return;
        this.running = true;
        if (this.els.destBtn) this.els.destBtn.disabled = true;
        if (this.els.testBtn) this.els.testBtn.disabled = true;
        try {
            const settings = await loadSettings().catch(() => null);
            this.renderConfig(settings);
            const core = settings?.core;
            const relay = String(core?.endpointUrl ?? "");
            const direct = String(core?.ops?.directUrl ?? "");
            const clientId = String(core?.userId ?? "");
            const eco = resolveEcosystemToken(settings);
            const raw =
                this.els.destInput?.value?.trim() ||
                String(core?.socket?.routeTarget || "") ||
                String(settings?.shell?.clipboardShareDestinationIds || "");
            const ids = parseDestinationIds(raw);
            if (!ids.length) {
                this.appendLog("No destination ids — enter L-196;L-210;… or set routeTarget in Settings.");
                return;
            }
            this.appendLog(`Checking ${ids.length} destination(s) via gateway: ${ids.join(", ")}`);
            const destinations = await probeDestinationLinks(
                ids,
                { relay, direct },
                { clientId, token: eco, accessToken: eco }
            );
            for (const row of destinations) {
                this.appendLog(
                    `Dest ${row.id}: ${row.ok ? "OK" : "FAIL"}${row.latencyMs != null ? ` (${row.latencyMs}ms)` : ""}${row.error ? ` — ${row.error}` : ""}`
                );
            }
            this.renderProbes({ probes: [], destinations });
            this.probeSummary = destinations
                .map(
                    (d) =>
                        `Dest ${d.id}: ${d.ok ? "OK" : "FAIL"} ${d.origin} ${d.error ?? d.status ?? ""}`
                )
                .join("\n");
        } catch (error) {
            this.appendLog(String(error instanceof Error ? error.message : error));
        } finally {
            this.running = false;
            if (this.els.destBtn) this.els.destBtn.disabled = false;
            if (this.els.testBtn) this.els.testBtn.disabled = false;
        }
    }

    private pageLogText(): string {
        return [...this.logLines].reverse().join("\n");
    }

    private async copyFrontendLog(): Promise<void> {
        try {
            await initFrontendDebugCapture().flush?.();
        } catch {
            /* optional */
        }
        const text = collectFrontendLogText(600);
        const ok = await copyTextToClipboard(text);
        this.appendLog(ok ? "Frontend log copied to clipboard." : "Copy failed — check clipboard permission.");
    }

    private async copyLogcat(): Promise<void> {
        this.appendLog("Reading logcat…");
        const text = await collectNativeLogcatText(600);
        const ok = await copyTextToClipboard(text);
        this.appendLog(ok ? "Logcat copied to clipboard." : "Logcat copy failed.");
    }

    private async savePageLogs(): Promise<void> {
        this.appendLog("Building page log export…");
        const combined = await buildCombinedPageLog(this.pageLogText(), this.probeSummary);
        const name = timestampFilename("cwsp-network");
        saveTextAsDownload(name, combined);
        this.appendLog(`Saved ${name}`);
    }
}
