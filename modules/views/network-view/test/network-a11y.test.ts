/*
 * Filename: network-a11y.test.ts
 * FullPath: modules/views/network-view/test/network-a11y.test.ts
 * Change date and time: 16.45.00_10.07.2026
 * Reason for changes: Pass-II — Network a11y live-status / action labeling contract
 */

/**
 * Pass-II Network contract tests — a11y basics.
 *
 * Pins landmarks, live regions, probe list role, and labeled actions that both
 * Capacitor and WebNative Network surfaces must expose.
 */

import assert from "node:assert/strict";
import test from "node:test";

import "./dom-shim.ts";
import {
    NETWORK_A11Y,
    applyNetworkA11y,
    auditNetworkA11y,
    createNetworkA11yFixture
} from "../src/network-a11y.ts";

test("createNetworkA11yFixture passes full a11y audit", () => {
    const root = createNetworkA11yFixture();
    const issues = auditNetworkA11y(root);
    assert.deepEqual(issues, [], issues.map((i) => i.message).join("; "));
});

test("fixture exposes main landmark labelled by heading", () => {
    const root = createNetworkA11yFixture();
    assert.equal(root.getAttribute("role"), "main");
    const labelledBy = root.getAttribute("aria-labelledby");
    assert.ok(labelledBy);
    const heading = root.querySelector(`#${labelledBy}`);
    assert.ok(heading);
    assert.equal(heading.textContent?.trim(), NETWORK_A11Y.root.label);
});

test("status grid and activity log are polite live regions", () => {
    const root = createNetworkA11yFixture();
    const grid = root.querySelector(NETWORK_A11Y.statusGrid.selector);
    const log = root.querySelector(NETWORK_A11Y.activityLog.selector);
    assert.ok(grid);
    assert.ok(log);
    assert.equal(grid.getAttribute("role"), "status");
    assert.equal(grid.getAttribute("aria-live"), "polite");
    assert.equal(log.getAttribute("role"), "log");
    assert.equal(log.getAttribute("aria-live"), "polite");
    assert.equal(log.getAttribute("aria-relevant"), "additions text");
});

test("all contract actions exist with accessible names", () => {
    const root = createNetworkA11yFixture();
    for (const action of NETWORK_A11Y.actions) {
        const btn = root.querySelector(`[data-action="${action.action}"]`);
        assert.ok(btn, `missing ${action.action}`);
        const name = btn.getAttribute("aria-label") || btn.textContent?.trim();
        assert.ok(name, `unlabeled ${action.action}`);
    }
});

test("applyNetworkA11y is idempotent and repairs missing live attrs", () => {
    const root = document.createElement("div");
    root.className = "cw-network-view";
    root.innerHTML = `
        <h1>CWSP Network</h1>
        <div class="cw-network-status-grid"></div>
        <button data-action="test">Run network test</button>
        <button data-action="reconnect">Reconnect WS</button>
        <button data-action="open-settings">Settings</button>
        <button data-action="copy-frontend-log">Copy Frontend Log</button>
        <button data-action="copy-logcat">Copy Logcat</button>
        <button data-action="save-page-logs">Save page logs</button>
        <div data-probe-list></div>
        <pre data-log></pre>
    `;
    applyNetworkA11y(root);
    applyNetworkA11y(root);
    assert.deepEqual(auditNetworkA11y(root), []);
});

test("audit reports missing action buttons", () => {
    const root = document.createElement("div");
    root.className = "cw-network-view";
    root.setAttribute("role", "main");
    root.setAttribute("aria-label", "CWSP Network");
    root.innerHTML = `
        <div class="cw-network-status-grid" role="status" aria-live="polite"></div>
        <div data-probe-list role="list"></div>
        <pre data-log role="log" aria-live="polite" aria-relevant="additions text"></pre>
    `;
    const issues = auditNetworkA11y(root);
    assert.ok(issues.some((i) => i.code.startsWith("action-missing:")));
});

test("min touch target floor is documented for mobile shell", () => {
    assert.equal(NETWORK_A11Y.minTouchTargetPx, 44);
});
