/*
 * CWSP v2 normalization contract tests.
 * INVARIANT: fixtures are deterministic and compatibility aliases stop at ingress.
 */

import assert from "node:assert/strict";
import test from "node:test";

import normalizationFixture from "../fixtures/v2/normalization.json" with { type: "json" };
import {
    canonicalizeCwspAction,
    normalizeCwspPacket,
    normalizeCwspVerb,
} from "../src/v2/normalize.ts";

test("normalizes canonical and legacy fixture cases", () => {
    for (const fixtureCase of normalizationFixture.cases) {
        const actual = normalizeCwspPacket({
            ...normalizationFixture.context,
            ...fixtureCase.input,
        });

        for (const [key, expectedValue] of Object.entries(fixtureCase.expected)) {
            assert.deepEqual(
                actual[key as keyof typeof actual],
                expectedValue,
                fixtureCase.id,
            );
        }

        assert.equal(actual.uuid, normalizationFixture.context.uuid, fixtureCase.id);
        assert.equal(actual.timestamp, normalizationFixture.context.timestamp, fixtureCase.id);
        assert.equal(actual.sender, normalizationFixture.context.sender, fixtureCase.id);
        assert.equal(actual.flags.canonicalV2, true, fixtureCase.id);
    }
});

test("normalizes every supported legacy verb to one canonical verb", () => {
    assert.equal(normalizeCwspVerb("request"), "ask");
    assert.equal(normalizeCwspVerb("response"), "result");
    assert.equal(normalizeCwspVerb("signal"), "act");
    assert.equal(normalizeCwspVerb("notify"), "act");
    assert.equal(normalizeCwspVerb("redirect"), "act");
    assert.equal(normalizeCwspVerb("ack"), "result");
    assert.equal(normalizeCwspVerb("resolve"), "result");
    assert.equal(normalizeCwspVerb("failure"), "error");
});

test("canonicalizes only documented legacy action names", () => {
    assert.equal(canonicalizeCwspAction("clipboard"), "clipboard:update");
    assert.equal(canonicalizeCwspAction("notifications"), "notification:speak");
    assert.equal(canonicalizeCwspAction("notify"), "notification:speak");
    assert.equal(canonicalizeCwspAction("sms"), "sms:send");
    assert.equal(canonicalizeCwspAction("dispatch"), "network:dispatch");
    assert.equal(canonicalizeCwspAction("network.dispatch"), "network:dispatch");
    assert.equal(canonicalizeCwspAction("mouse:move"), "mouse:move");
});

test("normalizes route aliases without replacing the final destination", () => {
    const actual = normalizeCwspPacket({
        op: "act",
        what: "mouse:move",
        uuid: "00000000-0000-4000-8000-000000000002",
        timestamp: 1783656000000,
        sender: "L-source",
        target: "L-final-target",
        payload: { x: 1, y: -1 },
    });

    assert.deepEqual(actual.nodes, ["L-final-target"]);
    assert.deepEqual(actual.destinations, ["L-final-target"]);
});
