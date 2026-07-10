/*
 * Filename: network-capability.test.ts
 * FullPath: modules/views/network-view/test/network-capability.test.ts
 * Change date and time: 16.45.00_10.07.2026
 * Reason for changes: Pass-II — Network capability readiness contract (Cap/WebNative/web)
 */

/**
 * Pass-II Network contract tests — capability readiness.
 *
 * Pins transport vs platform separation for both shells:
 *   1. Capacitor prefers native bridge + optional native WS ownership
 *   2. WebNative requires control RPC for probe/dispatch
 *   3. Transport status never implies platform capability
 */

import assert from "node:assert/strict";
import test from "node:test";

import {
    detectNetworkSurface,
    isNetworkProbePathReady,
    resolveNetworkCapabilities,
    summarizeNetworkCapabilities
} from "../src/network-capability.ts";

test("detectNetworkSurface prefers Capacitor native over WebNative globals", () => {
    assert.equal(
        detectNetworkSurface({
            Capacitor: { isNativePlatform: () => true },
            __WEBNATIVE_AUTH__: { port: 9 }
        }),
        "capacitor"
    );
});

test("detectNetworkSurface reports webnative from auth or boot globals", () => {
    assert.equal(detectNetworkSurface({ __WEBNATIVE_AUTH__: { port: 17321 } }), "webnative");
    assert.equal(detectNetworkSurface({ __CWS_WEBNATIVE_BOOT__: true }), "webnative");
    assert.equal(detectNetworkSurface({}), "web");
});

test("Capacitor summary separates transport WS from native bridge platform capability", () => {
    const summary = summarizeNetworkCapabilities("capacitor", {
        wsConnected: true,
        preferNativeWebsocket: true,
        nativeBridgeReady: true,
        httpProbeReady: true,
        dispatchReady: true
    });

    assert.equal(summary.surface, "capacitor");
    assert.equal(summary.ready, true);

    const ws = summary.transport.find((c) => c.id === "transport.ws");
    const bridge = summary.platform.find((c) => c.id === "platform.native-bridge");
    const wn = summary.platform.find((c) => c.id === "platform.webnative-control");

    assert.equal(ws?.implementation, "native-java-ws");
    assert.equal(ws?.state, "available");
    assert.equal(bridge?.state, "available");
    assert.equal(wn?.state, "unsupported");
    assert.equal(summary.diagnostics.find((c) => c.id === "diagnostics.logcat")?.state, "available");
});

test("Capacitor degrades native-owned WS when bridge is down", () => {
    const caps = resolveNetworkCapabilities("capacitor", {
        preferNativeWebsocket: true,
        nativeBridgeReady: false,
        wsConnected: true
    });
    const ws = caps.find((c) => c.id === "transport.ws");
    assert.equal(ws?.state, "degraded");
    assert.equal(caps.find((c) => c.id === "platform.native-bridge")?.state, "unavailable");
});

test("WebNative readiness requires control RPC even when browser WS is up", () => {
    const connectedButNoControl = summarizeNetworkCapabilities("webnative", {
        wsConnected: true,
        webnativeControlReady: false,
        httpProbeReady: true
    });
    assert.equal(connectedButNoControl.ready, false);
    assert.equal(
        connectedButNoControl.platform.find((c) => c.id === "platform.webnative-control")?.state,
        "unavailable"
    );
    assert.ok(connectedButNoControl.blocker);
    assert.equal(connectedButNoControl.blocker?.id, "platform.webnative-control");

    const ready = summarizeNetworkCapabilities("webnative", {
        wsConnected: false,
        webnativeControlReady: true,
        httpProbeReady: true,
        dispatchReady: true
    });
    assert.equal(ready.ready, true);
    assert.equal(ready.transport.find((c) => c.id === "transport.ws")?.state, "unavailable");
    assert.equal(ready.platform.find((c) => c.id === "platform.native-bridge")?.state, "unsupported");
});

test("web surface has no platform bridge/control; probe path stays browser-fetch", () => {
    const summary = summarizeNetworkCapabilities("web", {
        wsConnected: true,
        httpProbeReady: true,
        dispatchReady: true
    });
    assert.equal(summary.ready, true);
    assert.equal(summary.platform.find((c) => c.id === "platform.native-bridge")?.state, "unsupported");
    assert.equal(summary.platform.find((c) => c.id === "platform.webnative-control")?.state, "unsupported");
    assert.equal(summary.diagnostics.find((c) => c.id === "diagnostics.logcat")?.state, "unsupported");
    assert.equal(
        summary.transport.find((c) => c.id === "transport.http-probe")?.implementation,
        "browser-fetch"
    );
});

test("isNetworkProbePathReady blocks when http-probe is unavailable", () => {
    const caps = resolveNetworkCapabilities("web", { httpProbeReady: false });
    assert.equal(isNetworkProbePathReady("web", caps), false);
});

test("transport layer never includes platform capability ids", () => {
    for (const surface of ["capacitor", "webnative", "web"] as const) {
        const summary = summarizeNetworkCapabilities(surface, {
            nativeBridgeReady: true,
            webnativeControlReady: true
        });
        for (const c of summary.transport) {
            assert.equal(c.layer, "transport");
            assert.ok(c.id.startsWith("transport."));
        }
        for (const c of summary.platform) {
            assert.equal(c.layer, "platform");
            assert.ok(c.id.startsWith("platform."));
        }
    }
});
