/*
 * Filename: index.ts
 * FullPath: modules/views/network-view/src/index.ts
 * Change date and time: 16.42.00_10.07.2026
 * Reason for changes: Pass-II — export Network capability + a11y contracts for Cap/WebNative
 */

/**
 * Network View — CWSP connection status and probe diagnostics (Capacitor home).
 */

import type { View, ViewLifecycle, ViewOptions } from "shells/types";
import type { BaseViewOptions } from "views/types";
import { NetworkStatusPanel } from "./NetworkStatusPanel";

export type NetworkViewOptions = BaseViewOptions;

export {
    detectNetworkSurface,
    isNetworkProbePathReady,
    resolveNetworkCapabilities,
    summarizeNetworkCapabilities,
    type NetworkCapability,
    type NetworkCapabilityHints,
    type NetworkCapabilityId,
    type NetworkCapabilityState,
    type NetworkCapabilitySummary,
    type NetworkSurface
} from "./network-capability";

export {
    NETWORK_A11Y,
    applyNetworkA11y,
    auditNetworkA11y,
    createNetworkA11yFixture,
    type NetworkA11yIssue
} from "./network-a11y";

export {
    labelForProbeCandidate,
    normalizeProbeOrigin,
    pickDispatchOrigin,
    type NetworkProbeOriginRow
} from "./network-probe-origin";

export class NetworkView implements View {
    id = "network" as const;
    name = "Network";
    icon = "wifi-high";

    private options: NetworkViewOptions;
    private element: HTMLElement | null = null;
    private panel: NetworkStatusPanel | null = null;

    lifecycle: ViewLifecycle = {
        onMount: () => {
            if (!this.element) return;
            this.panel ??= new NetworkStatusPanel();
            this.panel.mount(this.element);
        },
        onUnmount: () => {
            this.panel?.unmount();
            this.panel = null;
            this.element = null;
        },
        onShow: () => {
            if (!this.panel && this.element) {
                this.panel = new NetworkStatusPanel();
                this.panel.mount(this.element);
            }
        }
    };

    constructor(options: NetworkViewOptions = {}) {
        this.options = options;
    }

    render = (options?: ViewOptions): HTMLElement => {
        if (options) {
            this.options = { ...this.options, ...(options as NetworkViewOptions) };
        }
        this.panel?.unmount();
        this.panel = null;
        this.element = document.createElement("div");
        this.element.className = "cw-network-view-host";
        this.element.dataset.view = "network";
        return this.element;
    };

    getToolbar(): HTMLElement | null {
        return null;
    }
}

export function createNetworkView(options?: NetworkViewOptions): NetworkView {
    return new NetworkView(options);
}

export default createNetworkView;
