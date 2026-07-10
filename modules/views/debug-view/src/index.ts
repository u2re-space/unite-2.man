/*
 * Filename: index.ts
 * FullPath: /home/u2re-dev/U2RE.space/modules/views/debug-view/src/index.ts
 * Change date and time: 16.34.00_10.07.2026
 * Reason for changes: Pass-II gated minimum debug surface (unregistered until channel tests pass).
 */

export type DebugViewGate = {
    /** INVARIANT: debug UI stays off unless an explicit host opt-in is provided. */
    enabled?: boolean;
    title?: string;
};

export type DebugViewHandle = {
    id: "debug";
    name: string;
    gated: boolean;
    element: HTMLElement;
    unmount: () => void;
};

export function createView(host: HTMLElement, gate: DebugViewGate = {}): DebugViewHandle {
    const enabled = gate.enabled === true;
    const root = document.createElement("section");
    root.dataset.cwspView = "debug";
    root.dataset.cwspGated = enabled ? "false" : "true";
    root.setAttribute("role", "region");
    root.setAttribute("aria-label", gate.title ?? "CWSP Debug");

    const heading = document.createElement("h1");
    heading.textContent = gate.title ?? "CWSP Debug";
    root.appendChild(heading);

    const status = document.createElement("p");
    status.textContent = enabled
        ? "Debug surface enabled. Wire debug:log / debug:tail before registering in shells."
        : "Debug surface gated. Pass { enabled: true } from a trusted host to open.";
    root.appendChild(status);

    host.appendChild(root);

    return {
        id: "debug",
        name: "Debug",
        gated: !enabled,
        element: root,
        unmount: () => {
            root.remove();
        }
    };
}

export default createView;
