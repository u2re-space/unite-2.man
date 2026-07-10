/*
 * Filename: gated-surface.test.mjs
 * FullPath: /home/u2re-dev/U2RE.space/modules/views/developer-view/test/gated-surface.test.mjs
 * Change date and time: 16.34.00_10.07.2026
 * Reason for changes: Prove the developer entrypoint is distinct and gated-by-default.
 */

import assert from "node:assert/strict";
import test from "node:test";
import { JSDOM } from "jsdom";

const dom = new JSDOM("<!doctype html><html><body></body></html>");
globalThis.window = dom.window;
globalThis.document = dom.window.document;
globalThis.HTMLElement = dom.window.HTMLElement;

const { createView } = await import("../src/index.ts");

test("developer createView is gated by default and id is developer", () => {
    const host = document.createElement("div");
    const handle = createView(host);
    assert.equal(handle.id, "developer");
    assert.equal(handle.gated, true);
    assert.equal(handle.element.dataset.cwspView, "developer");
    handle.unmount();
});

test("developer createView opens when enabled", () => {
    const host = document.createElement("div");
    const handle = createView(host, { enabled: true });
    assert.equal(handle.gated, false);
    assert.match(handle.element.textContent ?? "", /Developer surface enabled/);
    handle.unmount();
});
