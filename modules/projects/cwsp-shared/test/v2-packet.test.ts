/*
 * CWSP v2 packet-builder tests.
 * WHY: platform adapters must consume one deterministic envelope builder.
 */

import assert from "node:assert/strict";
import test from "node:test";

import packetFixture from "../fixtures/v2/packets.json" with { type: "json" };
import {
    buildClipboardPacket,
    buildCwspPacket,
    buildDriverReadinessError,
    buildPacket,
    buildPacketReply,
    createCwspPacket,
} from "../src/v2/packet.ts";
import type {
    CwspPacket,
    CwspPacketInput,
    DriverReadiness,
} from "../src/v2/types.ts";

test("builds every golden packet with fixed identity and time", () => {
    for (const fixtureCase of packetFixture.cases) {
        const actual = createCwspPacket(fixtureCase.input as CwspPacketInput);
        assert.deepEqual(actual, fixtureCase.expected, fixtureCase.id);
    }
});

test("keeps the final destination stable for direct and gateway-routed input", () => {
    const direct = packetFixture.cases.find(({ id }) => id === "input.mouse-move.direct");
    const routed = packetFixture.cases.find(({ id }) => id === "input.mouse-move.routed");

    assert.ok(direct);
    assert.ok(routed);
    assert.equal(direct.connectionPeer, "L-192.168.0.110");
    assert.equal(routed.connectionPeer, "L-192.168.0.200");

    for (const fixtureCase of [direct, routed]) {
        const packet = createCwspPacket(fixtureCase.input as CwspPacketInput);
        assert.deepEqual(packet.destinations, ["L-192.168.0.110"]);
        assert.equal("connectionPeer" in packet, false);
    }
});

test("exposes compatibility builder names without creating another implementation", () => {
    const input = packetFixture.cases[4]?.input as CwspPacketInput;
    const canonical = createCwspPacket(input);

    assert.deepEqual(buildPacket(input), canonical);
    assert.deepEqual(buildCwspPacket(input), canonical);
    assert.deepEqual(buildClipboardPacket(input), canonical);
});

test("builds a correlated result reply", () => {
    const requestFixture = packetFixture.cases.find(({ id }) => id === "settings.get");
    assert.ok(requestFixture);
    const request = createCwspPacket(requestFixture.input as CwspPacketInput);

    const reply = buildPacketReply(request, {
        timestamp: 1783656000110,
        sender: "L-192.168.0.110",
        payload: {
            revision: 7,
            settings: {
                appearance: {
                    theme: "dark",
                },
            },
        },
    });

    assert.equal(reply.op, "result");
    assert.equal(reply.uuid, request.uuid);
    assert.equal(reply.what, "settings:get");
    assert.deepEqual(reply.destinations, [request.sender]);
    assert.deepEqual(reply.payload, {
        revision: 7,
        settings: {
            appearance: {
                theme: "dark",
            },
        },
    });
});

test("builds an explicit correlated driver-readiness error", () => {
    const readinessFixture = packetFixture.driverReadiness;
    const actual = buildDriverReadinessError(
        readinessFixture.request as CwspPacket,
        readinessFixture.readiness as DriverReadiness,
        readinessFixture.response,
    );

    assert.deepEqual(actual, readinessFixture.expected);
});
