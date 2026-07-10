/*
 * Filename: network-capability.ts
 * FullPath: modules/views/network-view/src/network-capability.ts
 * Change date and time: 16.40.00_10.07.2026
 * Reason for changes: Pass-II — separate transport status from platform capability readiness
 *   for Capacitor + WebNative Network view contract tests.
 */

/**
 * Network view capability contract — dependency-free readiness model.
 *
 * WHY: VIEWS.md requires transport status and platform capability status to stay
 * distinct. Shells (Capacitor / WebNative / web) share one Network UI; each surface
 * enables a different probe/dispatch path. This module is the view-local contract
 * both contours must satisfy before claiming Network readiness.
 *
 * INVARIANT: transport.* never implies platform.* — a connected WS hub does not
 * mean native bridge or WebNative control RPC is available.
 */

export type NetworkSurface = "capacitor" | "webnative" | "web";

export type NetworkCapabilityLayer = "transport" | "platform" | "diagnostics";

/** Stable capability ids for Network view readiness probes. */
export type NetworkCapabilityId =
    | "transport.ws"
    | "transport.http-probe"
    | "transport.dispatch"
    | "platform.native-bridge"
    | "platform.webnative-control"
    | "diagnostics.frontend-log"
    | "diagnostics.logcat"
    | "diagnostics.page-export";

export type NetworkCapabilityState = "available" | "unavailable" | "degraded" | "unsupported";

export interface NetworkCapability {
    id: NetworkCapabilityId;
    layer: NetworkCapabilityLayer;
    state: NetworkCapabilityState;
    reason?: string;
    implementation?: string;
}

export interface NetworkCapabilityHints {
    /** Live WS hub connected (WebView transport). */
    wsConnected?: boolean;
    /** Capacitor prefers native Java `/ws` ownership. */
    preferNativeWebsocket?: boolean;
    /** Native CwsBridge answered shell-info / IPC. */
    nativeBridgeReady?: boolean;
    /** WebNative injected `__WEBNATIVE_AUTH__` with a control port. */
    webnativeControlReady?: boolean;
    /** At least one `/lna-probe` (or backend proxy) path is usable. */
    httpProbeReady?: boolean;
    /** Dispatch probe path is usable (HTTP or native/backend proxy). */
    dispatchReady?: boolean;
    /** Frontend debug ring is capturing. */
    frontendLogReady?: boolean;
}

export interface NetworkCapabilitySummary {
    surface: NetworkSurface;
    /** Core Network view can run probes on this surface. */
    ready: boolean;
    transport: NetworkCapability[];
    platform: NetworkCapability[];
    diagnostics: NetworkCapability[];
    /** First blocking capability when not ready. */
    blocker?: NetworkCapability;
}

type GlobalHints = {
    Capacitor?: { isNativePlatform?: () => boolean };
    __WEBNATIVE_AUTH__?: { port?: number; key?: string };
    __CWS_WEBNATIVE_BOOT__?: unknown;
};

/**
 * Detect Network surface from runtime globals (Capacitor → WebNative → web).
 * WHY: mirrors settings-view surface detection without importing that package.
 */
export const detectNetworkSurface = (g: GlobalHints = globalThis as GlobalHints): NetworkSurface => {
    try {
        if (typeof g.Capacitor?.isNativePlatform === "function" && g.Capacitor.isNativePlatform()) {
            return "capacitor";
        }
    } catch {
        /* ignore */
    }
    try {
        if (g.__WEBNATIVE_AUTH__ || g.__CWS_WEBNATIVE_BOOT__) return "webnative";
    } catch {
        /* ignore */
    }
    return "web";
};

const cap = (
    id: NetworkCapabilityId,
    layer: NetworkCapabilityLayer,
    state: NetworkCapabilityState,
    extra: Pick<NetworkCapability, "reason" | "implementation"> = {}
): NetworkCapability => ({ id, layer, state, ...extra });

/**
 * Resolve per-surface Network capabilities.
 *
 * Transport = WS / HTTP probe / dispatch reachability.
 * Platform = native bridge or WebNative control RPC (how probes actually run).
 * Diagnostics = log export paths (frontend always; logcat Capacitor-only).
 */
export const resolveNetworkCapabilities = (
    surface: NetworkSurface,
    hints: NetworkCapabilityHints = {}
): NetworkCapability[] => {
    const wsNativeOwned = surface === "capacitor" && Boolean(hints.preferNativeWebsocket);
    const wsState: NetworkCapabilityState = wsNativeOwned
        ? hints.nativeBridgeReady
            ? "available"
            : "degraded"
        : hints.wsConnected
          ? "available"
          : "unavailable";

    const transport: NetworkCapability[] = [
        cap("transport.ws", "transport", wsState, {
            implementation: wsNativeOwned ? "native-java-ws" : "webview-ws",
            reason: wsNativeOwned
                ? hints.nativeBridgeReady
                    ? "CwspRuntime owns /ws"
                    : "Native WS preferred but bridge not ready"
                : hints.wsConnected
                  ? "WebView hub connected"
                  : "WebView hub disconnected"
        }),
        cap(
            "transport.http-probe",
            "transport",
            hints.httpProbeReady === false ? "unavailable" : "available",
            {
                implementation:
                    surface === "capacitor"
                        ? "native-bridge-or-fetch"
                        : surface === "webnative"
                          ? "webnative-control-rpc"
                          : "browser-fetch",
                reason:
                    hints.httpProbeReady === false
                        ? "No reachable /lna-probe candidate"
                        : "Probe path enabled for surface"
            }
        ),
        cap(
            "transport.dispatch",
            "transport",
            hints.dispatchReady === false ? "unavailable" : "available",
            {
                implementation:
                    surface === "capacitor"
                        ? "network:dispatch-probe"
                        : surface === "webnative"
                          ? "webnative-endpoint-probe"
                          : "http-dispatch",
                reason:
                    hints.dispatchReady === false
                        ? "Dispatch probe path not ready"
                        : "Dispatch probe path enabled"
            }
        )
    ];

    const platform: NetworkCapability[] =
        surface === "capacitor"
            ? [
                  cap(
                      "platform.native-bridge",
                      "platform",
                      hints.nativeBridgeReady ? "available" : "unavailable",
                      {
                          implementation: "CwsBridge",
                          reason: hints.nativeBridgeReady
                              ? "Native IPC ready"
                              : "Native bridge unavailable"
                      }
                  ),
                  cap("platform.webnative-control", "platform", "unsupported", {
                      reason: "WebNative control RPC is desktop-only"
                  })
              ]
            : surface === "webnative"
              ? [
                    cap("platform.native-bridge", "platform", "unsupported", {
                        reason: "Capacitor native bridge is Android-only"
                    }),
                    cap(
                        "platform.webnative-control",
                        "platform",
                        hints.webnativeControlReady === false ? "unavailable" : "available",
                        {
                            implementation: "/service/endpoint-probe",
                            reason:
                                hints.webnativeControlReady === false
                                    ? "WebNative auth/control port missing"
                                    : "WebNative control RPC available"
                        }
                    )
                ]
              : [
                    cap("platform.native-bridge", "platform", "unsupported", {
                        reason: "Browser surface has no native bridge"
                    }),
                    cap("platform.webnative-control", "platform", "unsupported", {
                        reason: "Browser surface has no WebNative control RPC"
                    })
                ];

    const diagnostics: NetworkCapability[] = [
        cap(
            "diagnostics.frontend-log",
            "diagnostics",
            hints.frontendLogReady === false ? "degraded" : "available",
            {
                implementation: "__CWSP_FRONTEND_DEBUG__",
                reason:
                    hints.frontendLogReady === false
                        ? "Frontend debug capture not started"
                        : "Frontend log ring available"
            }
        ),
        cap(
            "diagnostics.logcat",
            "diagnostics",
            surface === "capacitor"
                ? hints.nativeBridgeReady
                    ? "available"
                    : "unavailable"
                : "unsupported",
            {
                implementation: surface === "capacitor" ? "debug:logcat" : undefined,
                reason:
                    surface === "capacitor"
                        ? hints.nativeBridgeReady
                            ? "Native logcat channel available"
                            : "Logcat requires native bridge"
                        : "Logcat is Capacitor/Android-only"
            }
        ),
        cap("diagnostics.page-export", "diagnostics", "available", {
            implementation: "download-blob",
            reason: "Page log download always available in Network view"
        })
    ];

    return [...transport, ...platform, ...diagnostics];
};

/** True when the surface can run Network probes (platform path + http-probe). */
export const isNetworkProbePathReady = (
    surface: NetworkSurface,
    caps: readonly NetworkCapability[]
): boolean => {
    const byId = new Map(caps.map((c) => [c.id, c]));
    const http = byId.get("transport.http-probe");
    if (!http || http.state === "unavailable") return false;
    if (surface === "capacitor") {
        const bridge = byId.get("platform.native-bridge");
        // WHY: Capacitor may fall back to WebView fetch when bridge is down, but
        // Pass-II readiness treats native bridge as the preferred critical path.
        return bridge?.state === "available" || http.state === "available";
    }
    if (surface === "webnative") {
        return byId.get("platform.webnative-control")?.state === "available";
    }
    return http.state === "available";
};

export const summarizeNetworkCapabilities = (
    surface: NetworkSurface,
    hints: NetworkCapabilityHints = {}
): NetworkCapabilitySummary => {
    const all = resolveNetworkCapabilities(surface, hints);
    const transport = all.filter((c) => c.layer === "transport");
    const platform = all.filter((c) => c.layer === "platform");
    const diagnostics = all.filter((c) => c.layer === "diagnostics");
    const ready = isNetworkProbePathReady(surface, all);
    const blocker = ready
        ? undefined
        : all.find(
              (c) =>
                  c.state === "unavailable" &&
                  (c.id === "transport.http-probe" ||
                      c.id === "platform.native-bridge" ||
                      c.id === "platform.webnative-control")
          );
    return { surface, ready, transport, platform, diagnostics, blocker };
};
