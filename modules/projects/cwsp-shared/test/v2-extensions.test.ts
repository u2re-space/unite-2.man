/*
 * CWSP v2 extension negotiation tests.
 * SECURITY: unknown extensions cannot alter core routing semantics.
 */

import assert from "node:assert/strict";
import test from "node:test";

import policiesFixture from "../fixtures/v2/policies.json" with { type: "json" };
import {
    buildUnsupportedExtensionError,
    evaluateExtensions,
    handleExtensions,
    resolveCwspExtensions,
} from "../src/v2/extensions.ts";
import { createCwspPacket } from "../src/v2/packet.ts";
import type {
    CwspExtension,
    SupportedCwspExtension,
} from "../src/v2/types.ts";

test("preserves optional unknown extensions and handles supported versions", () => {
    for (const fixtureCase of policiesFixture.extensionCases) {
        const actual = resolveCwspExtensions(
            fixtureCase.extensions as CwspExtension[],
            fixtureCase.supported as SupportedCwspExtension[],
        );

        assert.deepEqual(actual, fixtureCase.expected, fixtureCase.id);
    }
});

test("compatibility extension function names delegate to the canonical resolver", () => {
    const fixtureCase = policiesFixture.extensionCases[0];
    assert.ok(fixtureCase);
    const extensions = fixtureCase.extensions as CwspExtension[];
    const supported = fixtureCase.supported as SupportedCwspExtension[];
    const canonical = resolveCwspExtensions(extensions, supported);

    assert.deepEqual(evaluateExtensions(extensions, supported), canonical);
    assert.deepEqual(handleExtensions(extensions, supported), canonical);
});

test("turns a required unknown extension into a correlated error packet", () => {
    const fixtureCase = policiesFixture.extensionCases.find(
        ({ id }) => id === "extension.required-unknown",
    );
    assert.ok(fixtureCase);
    const resolution = resolveCwspExtensions(
        fixtureCase.extensions as CwspExtension[],
        fixtureCase.supported as SupportedCwspExtension[],
    );
    const request = createCwspPacket({
        op: "act",
        what: "mouse:move",
        uuid: "00000000-0000-4000-8000-000000000301",
        timestamp: 1783656000000,
        sender: "L-source",
        destinations: ["L-target"],
        payload: { x: 1, y: 1 },
        extensions: fixtureCase.extensions as CwspExtension[],
    });

    const error = buildUnsupportedExtensionError(request, resolution, {
        timestamp: 1783656000010,
        sender: "L-target",
    });

    assert.equal(error.op, "error");
    assert.equal(error.uuid, request.uuid);
    assert.equal(error.status, 422);
    assert.deepEqual(error.destinations, ["L-source"]);
    assert.deepEqual(error.error, fixtureCase.expected.error);
});
