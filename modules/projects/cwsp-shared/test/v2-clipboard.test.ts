/*
 * Clipboard envelope extraction tests.
 * COMPAT: text and DataAsset carriers remain readable without platform APIs.
 */

import assert from "node:assert/strict";
import test from "node:test";

import packetFixture from "../fixtures/v2/packets.json" with { type: "json" };
import {
    extractClipboardAsset,
    extractClipboardContent,
    extractClipboardText,
    getClipboardDedupeKey,
} from "../src/v2/clipboard.ts";
import { createCwspPacket } from "../src/v2/packet.ts";
import type { CwspPacketInput } from "../src/v2/types.ts";

test("extracts canonical clipboard text and its stable dedupe key", () => {
    const fixtureCase = packetFixture.cases.find(({ id }) => id === "clipboard.text");
    assert.ok(fixtureCase);
    const packet = createCwspPacket(fixtureCase.input as CwspPacketInput);

    assert.deepEqual(extractClipboardContent(packet), {
        text: "hello",
        dedupeKey: "text:hello",
    });
    assert.equal(extractClipboardText(packet), "hello");
    assert.equal(getClipboardDedupeKey(packet), "text:hello");
});

test("extracts an opaque DataAsset envelope without duplicating byte normalization", () => {
    const fixtureCase = packetFixture.cases.find(({ id }) => id === "clipboard.data-asset");
    assert.ok(fixtureCase);
    const packet = createCwspPacket(fixtureCase.input as CwspPacketInput);
    const asset = extractClipboardAsset(packet);

    assert.deepEqual(asset, fixtureCase.input.payload.asset);
    assert.equal(
        getClipboardDedupeKey(packet),
        "asset:2cf24dba5fb0a30e26e83b2ac5b9e29e1b161e5c1fa7425e73043362938b9824",
    );
});

test("uses the first usable text alias across compatibility carriers", () => {
    assert.equal(
        extractClipboardText({
            payload: {
                text: 42,
                content: "payload-content",
                body: "payload-body",
            },
            data: {
                text: "data-text",
            },
        }),
        "payload-content",
    );

    assert.equal(
        extractClipboardText({
            result: {
                body: "result-body",
            },
        }),
        "result-body",
    );

    assert.equal(extractClipboardText({ payload: "direct text" }), "direct text");
});

test("accepts type as the DataAsset MIME compatibility name", () => {
    assert.deepEqual(
        extractClipboardAsset({
            payload: {
                dataAsset: {
                    hash: "sha256-fixture",
                    name: "asset-sha256-fixture.bin",
                    type: "application/octet-stream",
                    size: 3,
                    source: "base64",
                    data: "AAEC",
                },
            },
        }),
        {
            hash: "sha256-fixture",
            name: "asset-sha256-fixture.bin",
            mimeType: "application/octet-stream",
            size: 3,
            source: "base64",
            data: "AAEC",
        },
    );
});
