/*
 * Filename: network-a11y.ts
 * FullPath: modules/views/network-view/src/network-a11y.ts
 * Change date and time: 16.40.00_10.07.2026
 * Reason for changes: Pass-II — accessible live status / log semantics contract for Network view
 */

/**
 * Network view a11y contract — landmarks, live regions, labeled actions.
 *
 * WHY: VIEWS.md asks for accessible live status and log semantics. The panel
 * markup is the surface; this module is the auditable contract tests pin without
 * mounting fest/lure or transport side effects.
 */

export const NETWORK_A11Y = {
    root: {
        selector: ".cw-network-view",
        role: "main",
        label: "CWSP Network"
    },
    statusGrid: {
        selector: ".cw-network-status-grid",
        role: "status",
        ariaLive: "polite",
        ariaAtomic: "false"
    },
    activityLog: {
        selector: "[data-log]",
        ariaLive: "polite",
        ariaRelevant: "additions text",
        role: "log"
    },
    probeList: {
        selector: "[data-probe-list]",
        role: "list"
    },
    actions: [
        { action: "test", label: "Run network test" },
        { action: "reconnect", label: "Reconnect WebSocket" },
        { action: "open-settings", label: "Open settings" },
        { action: "copy-frontend-log", label: "Copy frontend log" },
        { action: "copy-logcat", label: "Copy logcat" },
        { action: "save-page-logs", label: "Save page logs" }
    ],
    /** Mobile shell touch-target floor (CSS px). */
    minTouchTargetPx: 44
} as const;

export type NetworkA11yIssue = {
    code: string;
    message: string;
};

/**
 * Apply Network a11y attributes onto an already-built panel root.
 * Idempotent — safe to call after mount and after re-render of static chrome.
 */
export const applyNetworkA11y = (root: HTMLElement): void => {
    const { root: rootSpec, statusGrid, activityLog, probeList, actions } = NETWORK_A11Y;

    root.setAttribute("role", rootSpec.role);
    if (!root.getAttribute("aria-label") && !root.getAttribute("aria-labelledby")) {
        root.setAttribute("aria-label", rootSpec.label);
    }

    const heading = root.querySelector("h1");
    if (heading && !heading.id) {
        heading.id = "cw-network-view-title";
        root.setAttribute("aria-labelledby", heading.id);
        root.removeAttribute("aria-label");
    }

    const grid = root.querySelector(statusGrid.selector);
    if (grid instanceof HTMLElement) {
        grid.setAttribute("role", statusGrid.role);
        grid.setAttribute("aria-live", statusGrid.ariaLive);
        grid.setAttribute("aria-atomic", statusGrid.ariaAtomic);
    }

    const log = root.querySelector(activityLog.selector);
    if (log instanceof HTMLElement) {
        log.setAttribute("role", activityLog.role);
        log.setAttribute("aria-live", activityLog.ariaLive);
        log.setAttribute("aria-relevant", activityLog.ariaRelevant);
    }

    const probes = root.querySelector(probeList.selector);
    if (probes instanceof HTMLElement) {
        probes.setAttribute("role", probeList.role);
    }

    for (const action of actions) {
        const btn = root.querySelector(`[data-action="${action.action}"]`);
        if (btn instanceof HTMLElement) {
            if (!btn.getAttribute("aria-label") && !btn.textContent?.trim()) {
                btn.setAttribute("aria-label", action.label);
            }
            if (btn instanceof HTMLButtonElement && !btn.type) {
                btn.type = "button";
            }
        }
    }
};

/**
 * Audit a Network panel root against {@link NETWORK_A11Y}.
 * Returns issues (empty = pass). Does not throw.
 */
export const auditNetworkA11y = (root: HTMLElement): NetworkA11yIssue[] => {
    const issues: NetworkA11yIssue[] = [];
    const { root: rootSpec, statusGrid, activityLog, probeList, actions } = NETWORK_A11Y;

    if (root.getAttribute("role") !== rootSpec.role) {
        issues.push({ code: "root-role", message: `root role must be "${rootSpec.role}"` });
    }
    if (!root.getAttribute("aria-label") && !root.getAttribute("aria-labelledby")) {
        issues.push({ code: "root-label", message: "root needs aria-label or aria-labelledby" });
    }

    const grid = root.querySelector(statusGrid.selector);
    if (!grid) {
        issues.push({ code: "status-grid-missing", message: "status grid missing" });
    } else {
        if (grid.getAttribute("role") !== statusGrid.role) {
            issues.push({ code: "status-role", message: `status grid role must be "${statusGrid.role}"` });
        }
        if (grid.getAttribute("aria-live") !== statusGrid.ariaLive) {
            issues.push({ code: "status-live", message: `status grid aria-live must be "${statusGrid.ariaLive}"` });
        }
    }

    const log = root.querySelector(activityLog.selector);
    if (!log) {
        issues.push({ code: "log-missing", message: "activity log [data-log] missing" });
    } else {
        if (log.getAttribute("aria-live") !== activityLog.ariaLive) {
            issues.push({ code: "log-live", message: `log aria-live must be "${activityLog.ariaLive}"` });
        }
        if (log.getAttribute("role") !== activityLog.role) {
            issues.push({ code: "log-role", message: `log role must be "${activityLog.role}"` });
        }
    }

    const probes = root.querySelector(probeList.selector);
    if (!probes) {
        issues.push({ code: "probe-list-missing", message: "probe list missing" });
    } else if (probes.getAttribute("role") !== probeList.role) {
        issues.push({ code: "probe-list-role", message: `probe list role must be "${probeList.role}"` });
    }

    for (const action of actions) {
        const btn = root.querySelector(`[data-action="${action.action}"]`);
        if (!btn) {
            issues.push({
                code: `action-missing:${action.action}`,
                message: `action button data-action="${action.action}" missing`
            });
            continue;
        }
        const labeled = Boolean(btn.getAttribute("aria-label") || btn.textContent?.trim());
        if (!labeled) {
            issues.push({
                code: `action-label:${action.action}`,
                message: `action "${action.action}" needs accessible name`
            });
        }
    }

    return issues;
};

/**
 * Build a minimal Network chrome fixture for contract tests (no fest/lure).
 * Mirrors the static structure NetworkStatusPanel mounts.
 */
export const createNetworkA11yFixture = (doc: Document = document): HTMLElement => {
    const root = doc.createElement("div");
    root.className = "cw-network-view";
    root.dataset.view = "network";
    root.innerHTML = `
        <header class="cw-network-view__header">
            <h1>CWSP Network</h1>
            <p>Connection status, reachability probes, and dispatch errors.</p>
        </header>
        <div class="cw-network-body">
            <div class="cw-network-status-grid"></div>
            <div class="cw-network-actions">
                <button type="button" data-action="test">Run network test</button>
                <button type="button" data-action="reconnect">Reconnect WS</button>
                <button type="button" data-action="open-settings">Settings</button>
            </div>
            <div class="cw-network-actions cw-network-actions--logs">
                <button type="button" data-action="copy-frontend-log">Copy Frontend Log</button>
                <button type="button" data-action="copy-logcat">Copy Logcat</button>
                <button type="button" data-action="save-page-logs">Save page logs</button>
            </div>
            <section class="cw-network-probes">
                <h2>Probe results</h2>
                <div data-probe-list></div>
            </section>
        </div>
        <section class="cw-network-log-panel">
            <h2 class="cw-network-log-panel__title">Activity log</h2>
            <pre class="cw-network-log" data-log></pre>
        </section>
    `;
    applyNetworkA11y(root);
    return root;
};
