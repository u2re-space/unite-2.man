/*
 * Golden packet/schema conformance tests.
 * WHY: the schema is executable contract evidence, not detached documentation.
 */

import assert from "node:assert/strict";
import test from "node:test";

import normalizationFixture from "../fixtures/v2/normalization.json" with { type: "json" };
import packetSchema from "../fixtures/v2/packet.schema.json" with { type: "json" };
import packetFixture from "../fixtures/v2/packets.json" with { type: "json" };
import policiesFixture from "../fixtures/v2/policies.json" with { type: "json" };
import {
    buildDriverReadinessError,
    buildPacketReply,
    createCwspPacket,
} from "../src/v2/packet.ts";
import { resolveCwspExtensions } from "../src/v2/extensions.ts";
import { normalizeCwspPacket } from "../src/v2/normalize.ts";
import type {
    CwspExtension,
    CwspPacket,
    CwspPacketInput,
    DriverReadiness,
} from "../src/v2/types.ts";
import {
    CWSP_EXTENSION_ID_PATTERN_SOURCE,
    CWSP_STATUS_MAX,
    CWSP_STATUS_MIN,
} from "../src/v2/validation.ts";
import { validateJsonSchema } from "./json-schema-validator.ts";

function assertSchemaMatch(packet: CwspPacket, label: string): void {
    assert.deepEqual(validateJsonSchema(packet, packetSchema), [], label);
}

function hasCode(expectedCode: string): (error: unknown) => boolean {
    return (error: unknown): boolean => (
        typeof error === "object"
        && error !== null
        && "code" in error
        && error.code === expectedCode
    );
}

test("references the canonical DataAsset definition from packet payloads", () => {
    const schema = packetSchema as unknown as Record<string, unknown>;
    const properties = schema.properties as Record<string, unknown>;
    const definitions = schema.$defs as Record<string, unknown>;
    const status = properties.status as Record<string, unknown>;
    const extension = definitions.extension as Record<string, unknown>;
    const extensionProperties = extension.properties as Record<string, unknown>;
    const extensionId = extensionProperties.id as Record<string, unknown>;

    assert.deepEqual(properties.payload, { $ref: "#/$defs/payload" });
    assert.match(JSON.stringify(definitions.payload), /#\/\$defs\/dataAsset/);
    assert.equal(status.minimum, CWSP_STATUS_MIN);
    assert.equal(status.maximum, CWSP_STATUS_MAX);
    assert.equal(extensionId.pattern, CWSP_EXTENSION_ID_PATTERN_SOURCE);
});

test("validates every generated golden packet against packet.schema", () => {
    for (const fixtureCase of packetFixture.cases) {
        assertSchemaMatch(
            createCwspPacket(fixtureCase.input as CwspPacketInput),
            fixtureCase.id,
        );
    }

    const readiness = packetFixture.driverReadiness;
    assertSchemaMatch(
        buildDriverReadinessError(
            readiness.request as CwspPacket,
            readiness.readiness as DriverReadiness,
            readiness.response,
        ),
        "driver.readiness-error",
    );

    for (const fixtureCase of normalizationFixture.cases) {
        assertSchemaMatch(
            normalizeCwspPacket({
                ...normalizationFixture.context,
                ...fixtureCase.input,
            }),
            fixtureCase.id,
        );
    }

    for (const fixtureCase of policiesFixture.policyCases) {
        assertSchemaMatch(
            createCwspPacket(fixtureCase.packet as CwspPacketInput),
            fixtureCase.id,
        );
    }
});

test("rejects builder status values outside schema bounds", () => {
    const base: CwspPacketInput = {
        op: "error",
        what: "debug:event",
        uuid: "00000000-0000-4000-8000-000000000401",
        timestamp: 1783656000000,
        sender: "L-source",
        error: {
            code: "CWSP_FIXTURE_ERROR",
            message: "fixture",
        },
    };

    assert.throws(
        () => createCwspPacket({ ...base, status: 99 }),
        hasCode("CWSP_PACKET_STATUS_INVALID"),
    );
    assert.throws(
        () => createCwspPacket({ ...base, status: 600 }),
        hasCode("CWSP_PACKET_STATUS_INVALID"),
    );

    const request = createCwspPacket({
        op: "ask",
        what: "debug:isReady",
        uuid: base.uuid,
        timestamp: base.timestamp,
        sender: base.sender,
    });
    assert.throws(
        () => buildPacketReply(request, {
            timestamp: 1783656000010,
            sender: "L-target",
            status: 99,
            payload: { ready: true },
        }),
        hasCode("CWSP_PACKET_STATUS_INVALID"),
    );
});

test("rejects non-namespaced extension IDs at builder and resolver boundaries", () => {
    const extension: CwspExtension = {
        id: "plain",
        version: 1,
        required: false,
    };

    assert.throws(
        () => createCwspPacket({
            op: "act",
            what: "debug:event",
            uuid: "00000000-0000-4000-8000-000000000402",
            timestamp: 1783656000000,
            sender: "L-source",
            extensions: [extension],
        }),
        hasCode("CWSP_PACKET_EXTENSION_ID_INVALID"),
    );
    assert.throws(
        () => resolveCwspExtensions([extension], []),
        hasCode("CWSP_EXTENSION_ID_INVALID"),
    );
});

test("rejects DataAsset output that cannot satisfy the referenced schema", () => {
    const validFixture = packetFixture.cases.find(
        ({ id }) => id === "clipboard.data-asset",
    );
    assert.ok(validFixture);
    const invalidInput = structuredClone(validFixture.input) as unknown as
        CwspPacketInput & { payload: { asset: Record<string, unknown> } };
    const asset = invalidInput.payload.asset;
    delete asset.mimeType;

    assert.throws(
        () => createCwspPacket(invalidInput as CwspPacketInput),
        hasCode("CWSP_PACKET_DATA_ASSET_INVALID"),
    );

    const invalidPacket = structuredClone(validFixture.expected) as unknown as
        CwspPacket & { payload: { asset: Record<string, unknown> } };
    delete invalidPacket.payload.asset.mimeType;
    assert.notEqual(validateJsonSchema(invalidPacket, packetSchema).length, 0);
});
