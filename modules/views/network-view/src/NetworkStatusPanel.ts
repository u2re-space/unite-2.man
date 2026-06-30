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
    isPreferNativeWebsocketEnabled
} from "views/airpad/config/config";
import { CwsBridge } from "com/routing/native/cws-bridge";
import { runDispatchProbeWithFallback, runEndpointProbes, runWebnativeBackendProbe, type DispatchProbeReport, type NetworkProbeRow } from "./network-probe";
import {
    buildCombinedPageLog,
    collectFrontendLogText,
    collectNativeLogcatText,
    copyTextToClipboard,
    saveTextAsDownload,
    timestampFilename
} from "./network-log-export";
import { initFrontendDebugCapture } from "boot/frontend-debug-capture";

// @ts-ignore
import style from "./network.scss?inline";

type ProbeSnapshot = {
    probes: NetworkProbeRow[];
    dispatch?: DispatchProbeReport;
};

const isCapacitorNative = (): boolean => {
    try {
        const cap = (globalThis as { Capacitor?: { isNativePlatform?: () => boolean } }).Capacitor;
        return typeof cap?.isNativePlatform === "function" && Boolean(cap.isNativePlatform());
    } catch {
        return false;
    }
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
        reconnectBtn: null as HTMLButtonElement | null
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
                        <button type="button" data-action="reconnect">Reconnect WS</button>
                        <button type="button" data-action="open-settings">Settings</button>
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
        this.els.reconnectBtn = this.root.querySelector('[data-action="reconnect"]');

        this.els.testBtn?.addEventListener("click", () => void this.runFullTest());
        this.els.reconnectBtn?.addEventListener("click", () => void this.reconnectWs());
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
        const nativeOwns = isCapacitorNative() && isPreferNativeWebsocketEnabled();
        if (nativeOwns) {
            this.els.wsCard.dataset.state = "warn";
            this.els.wsValue.textContent = "Native Java WebSocket";
            if (this.els.wsDetail) {
                this.els.wsDetail.textContent =
                    detail ||
                    "CwspRuntime holds `/ws` in the Android service — WebView hub socket is not used.";
            }
            return;
        }
        this.els.wsCard.dataset.state = connected ? "ok" : "bad";
        this.els.wsValue.textContent = connected ? "Connected" : "Disconnected";
        if (this.els.wsDetail) this.els.wsDetail.textContent = detail || "";
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

    private async bootstrap(): Promise<void> {
        initFrontendDebugCapture();
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
        if (isCapacitorNative() && isPreferNativeWebsocketEnabled()) {
            this.appendLog("Native WebSocket — reconnect via Android CWSP service / Settings save.");
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
            const token = String(core?.userKey ?? "");
            const accessToken = String(core?.socket?.accessToken ?? "");

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

            if (!isCapacitorNative() || !isPreferNativeWebsocketEnabled()) {
                if (!isWSConnected() && isMaintainHubSocketConnectionEnabled()) {
                    connectWS();
                }
            }
        } catch (error) {
            this.appendLog(String(error instanceof Error ? error.message : error));
        } finally {
            this.running = false;
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
