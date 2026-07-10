/*
 * Filename: network-probe-origin.test.ts
 * FullPath: modules/views/network-view/test/network-probe-origin.test.ts
 * Change date and time: 16.45.00_10.07.2026
 * Reason for changes: Pass-II — Network probe origin / dispatch pick contract
 */

/**
 * Pass-II Network contract tests — probe origin helpers.
 *
 * Pins bare-host → :8434 normalization, /lna-probe stripping, labels, and
 * dispatch origin preference (first OK probe, else configured candidates).
 */

import assert from "node:assert/strict";
import test from "node:test";

import {
    labelForProbeCandidate,
    normalizeProbeOrigin,
    pickDispatchOrigin
} from "../src/network-probe-origin.ts";

test("normalizeProbeOrigin defaults bare host to https://host:8434", () => {
    assert.equal(normalizeProbeOrigin("192.168.0.110"), "https://192.168.0.110:8434");
    assert.equal(normalizeProbeOrigin("192.168.0.200"), "https://192.168.0.200:8434");
});

test("normalizeProbeOrigin strips /lna-probe and trailing slashes", () => {
    assert.equal(
        normalizeProbeOrigin("https://192.168.0.200:8434/lna-probe"),
        "https://192.168.0.200:8434"
    );
    assert.equal(
        normalizeProbeOrigin("https://192.168.0.110:8434/"),
        "https://192.168.0.110:8434"
    );
});

test("normalizeProbeOrigin preserves explicit ports and http protocol", () => {
    assert.equal(normalizeProbeOrigin("http://127.0.0.1:8080"), "http://127.0.0.1:8080");
    assert.equal(normalizeProbeOrigin(""), "");
});

test("labelForProbeCandidate distinguishes relay, direct, and fleet fallbacks", () => {
    const fields = {
        relay: "https://192.168.0.200:8434",
        direct: "https://192.168.0.110:8434"
    };
    assert.equal(labelForProbeCandidate("https://192.168.0.200:8434", 0, fields), "Relay / gateway");
    assert.equal(labelForProbeCandidate("https://192.168.0.110:8434", 1, fields), "Direct peer");
    assert.equal(labelForProbeCandidate("https://45.147.121.152:8434", 2, {}), "Gateway WAN fallback");
    assert.equal(labelForProbeCandidate("https://127.0.0.1:8434", 3, {}), "Loopback");
});

test("pickDispatchOrigin prefers first OK probe origin", () => {
    const origin = pickDispatchOrigin(
        [
            { label: "Relay", origin: "https://192.168.0.200:8434", ok: false },
            { label: "Direct", origin: "https://192.168.0.110:8434", ok: true }
        ],
        { relay: "192.168.0.200", direct: "192.168.0.110" }
    );
    assert.equal(origin, "https://192.168.0.110:8434");
});

test("pickDispatchOrigin falls back to configured candidates when all probes fail", () => {
    const origin = pickDispatchOrigin(
        [{ label: "Relay", origin: "https://192.168.0.200:8434", ok: false }],
        { relay: "192.168.0.200", direct: "192.168.0.110" }
    );
    assert.ok(origin.includes("192.168.0.200") || origin.includes("192.168.0.110"));
});

test("pickDispatchOrigin falls back to fleet defaults when probes and config are empty", () => {
    // WHY: collectEndpointProbeCandidates always seeds gateway LAN/WAN fallbacks so
    // Network view can still attempt a probe when settings are blank.
    const origin = pickDispatchOrigin([], {});
    assert.ok(origin.includes("192.168.0.200") || origin.includes("45.147.121.152"));
});
