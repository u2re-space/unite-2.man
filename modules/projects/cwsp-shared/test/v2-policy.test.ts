/*
 * CWSP v2 stale, duplicate, and reconnect policy tests.
 * INVARIANT: evaluation is pure; adapters own storage and queue mutation.
 */

import assert from "node:assert/strict";
import test from "node:test";

import packetFixture from "../fixtures/v2/packets.json" with { type: "json" };
import policiesFixture from "../fixtures/v2/policies.json" with { type: "json" };
import { createCwspPacket } from "../src/v2/packet.ts";
import * as policyApi from "../src/v2/policy.ts";
import {
    classifyCwspPacket,
    DEFAULT_CWSP_POLICY,
    evaluateCwspPolicy,
    evaluatePacketPolicy,
} from "../src/v2/policy.ts";
import type {
    CwspPacketInput,
    CwspPolicyContext,
} from "../src/v2/types.ts";

test("evaluates every transport-neutral policy fixture", () => {
    for (const fixtureCase of policiesFixture.policyCases) {
        const packet = createCwspPacket(fixtureCase.packet as CwspPacketInput);
        const context = fixtureCase.context as CwspPolicyContext;
        const actual = evaluateCwspPolicy(packet, context);

        for (const [key, expectedValue] of Object.entries(fixtureCase.expected)) {
            assert.deepEqual(
                actual[key as keyof typeof actual],
                expectedValue,
                fixtureCase.id,
            );
        }
    }
});

test("exposes explicit bounded policy defaults", () => {
    assert.deepEqual(DEFAULT_CWSP_POLICY, {
        relativeInputMaxAgeMs: 250,
        discreteInputMaxAgeMs: 2_000,
        generalMaxAgeMs: 4_000,
        clipboardMaxAgeMs: 30_000,
        clipboardEchoWindowMs: 3_500,
        reconnectMaxAgeMs: 12_000,
        settingsMaxAgeMs: 30_000,
        debugMaxAgeMs: 30_000,
        debugMaxPending: 200,
        replyMaxAgeMs: 8_000,
    });
});

test("compatibility evaluator delegates without mutating inputs", () => {
    const fixtureCase = policiesFixture.policyCases.find(
        ({ id }) => id === "policy.reconnect-clipboard",
    );
    assert.ok(fixtureCase);
    const packet = createCwspPacket(fixtureCase.packet as CwspPacketInput);
    const context = fixtureCase.context as CwspPolicyContext;
    const beforePacket = structuredClone(packet);
    const beforeContext = structuredClone(context);

    assert.deepEqual(
        evaluatePacketPolicy(packet, context),
        evaluateCwspPolicy(packet, context),
    );
    assert.deepEqual(packet, beforePacket);
    assert.deepEqual(context, beforeContext);
});

test("classifies airpad mouse move wrappers as stale realtime input", () => {
    const fixtureCase = packetFixture.cases.find(
        ({ id }) => id === "input.airpad-mouse-wrapper",
    );
    assert.ok(fixtureCase);
    const packet = createCwspPacket(fixtureCase.input as CwspPacketInput);

    assert.equal(classifyCwspPacket(packet), "relative-input");
    assert.deepEqual(
        evaluateCwspPolicy(packet, {
            now: packet.timestamp + DEFAULT_CWSP_POLICY.relativeInputMaxAgeMs + 1,
            connection: "connected",
        }),
        {
            action: "drop",
            reason: "stale",
            class: "relative-input",
        },
    );
});

test("exports a finite safe reconnect queue default", () => {
    const api = policyApi as unknown as {
        DEFAULT_CWSP_RECONNECT_QUEUE_SIZE?: unknown;
    };

    assert.equal(api.DEFAULT_CWSP_RECONNECT_QUEUE_SIZE, 100);
    assert.equal(Number.isFinite(api.DEFAULT_CWSP_RECONNECT_QUEUE_SIZE), true);
});

test("bounds omitted reconnect queue limits and applies overflow policy at the bound", () => {
    const general = createCwspPacket({
        op: "act",
        what: "notification:speak",
        uuid: "00000000-0000-4000-8000-000000000501",
        timestamp: 1783656000000,
        sender: "L-source",
        payload: { text: "queued" },
    });
    const debug = createCwspPacket({
        op: "act",
        what: "debug:log",
        uuid: "00000000-0000-4000-8000-000000000502",
        timestamp: 1783656000000,
        sender: "L-source",
        payload: { entries: [] },
    });
    const context = {
        now: 1783656000100,
        connection: "reconnecting" as const,
        queueSize: 100,
    };

    assert.deepEqual(evaluateCwspPolicy(general, context), {
        action: "drop",
        reason: "queue-full",
        class: "general",
    });
    assert.deepEqual(evaluateCwspPolicy(debug, context), {
        action: "enqueue",
        reason: "reconnect-buffered",
        class: "debug",
        evict: "oldest",
    });
});
