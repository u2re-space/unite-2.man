/*
 * Package export-surface tests.
 * COMPAT: historical import-map names can target these stable package subpaths.
 */

import assert from "node:assert/strict";
import test from "node:test";

import {
    createCwspPacket as createFromRoot,
    normalizeCwspPacket as normalizeFromRoot,
} from "@fest-lib/cwsp-shared";
import { buildPacket } from "@fest-lib/cwsp-shared/builder";
import { normalizePacket } from "@fest-lib/cwsp-shared/normalizer";
import { evaluatePacketPolicy } from "@fest-lib/cwsp-shared/policy";
import type { Packet } from "@fest-lib/cwsp-shared/types";
import {
    CWSP_EXTENSION_ID_PATTERN_SOURCE,
    CWSP_STATUS_MAX,
    CWSP_STATUS_MIN,
} from "@fest-lib/cwsp-shared/validation";
import {
    createCwspPacket as createFromV2,
    normalizeCwspPacket as normalizeFromV2,
} from "@fest-lib/cwsp-shared/v2";
import packetFixture from "@fest-lib/cwsp-shared/fixtures/v2/packets.json" with {
    type: "json",
};
import packetSchema from "@fest-lib/cwsp-shared/fixtures/v2/packet.schema.json" with {
    type: "json",
};

test("root, v2, and compatibility subpaths share canonical implementations", () => {
    assert.equal(createFromRoot, createFromV2);
    assert.equal(createFromRoot, buildPacket);
    assert.equal(normalizeFromRoot, normalizeFromV2);
    assert.equal(normalizeFromRoot, normalizePacket);
    assert.equal(typeof evaluatePacketPolicy, "function");
    assert.equal(CWSP_STATUS_MIN, 100);
    assert.equal(CWSP_STATUS_MAX, 599);
    assert.equal(CWSP_EXTENSION_ID_PATTERN_SOURCE, "^[^/\\s]+\\.[^/\\s]+/.+$");
});

test("exports transport-neutral fixtures and the Packet compatibility type", () => {
    const packet: Packet = createFromRoot(packetFixture.cases[0]!.input);

    assert.equal(packetFixture.protocolVersion, "v2");
    assert.equal(packetSchema.$schema, "https://json-schema.org/draft/2020-12/schema");
    assert.equal(packet.flags.canonicalV2, true);
});
