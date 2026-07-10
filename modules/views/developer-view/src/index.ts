/*
 * Filename: index.ts
 * FullPath: /home/u2re-dev/U2RE.space/modules/views/developer-view/src/index.ts
 * Change date and time: 16.34.00_10.07.2026
 * Reason for changes: Pass-II gated minimum developer surface (real package; was symlink to debug-view).
 */

export type DeveloperViewGate = {
    /** INVARIANT: developer tools stay off unless an explicit host opt-in is provided. */
    enabled?: boolean;
    title?: string;
};

export type DeveloperViewHandle = {
    id: "developer";
    name: string;
    gated: boolean;
    element: HTMLElement;
    unmount: () => void;
};

export function createView(host: HTMLElement, gate: DeveloperViewGate = {}): DeveloperViewHandle {
    const enabled = gate.enabled === true;
    const root = document.createElement("section");
    root.dataset.cwspView = "developer";
    root.dataset.cwspGated = enabled ? "false" : "true";
    root.setAttribute("role", "region");
    root.setAttribute("aria-label", gate.title ?? "CWSP Developer");

    const heading = document.createElement("h1");
    heading.textContent = gate.title ?? "CWSP Developer";
    root.appendChild(heading);

    const status = document.createElement("p");
    status.textContent = enabled
        ? "Developer surface enabled. Keep protocol/driver experiments out of production shells."
        : "Developer surface gated. Pass { enabled: true } from a trusted host to open.";
    root.appendChild(status);

    host.appendChild(root);

    return {
        id: "developer",
        name: "Developer",
        gated: !enabled,
        element: root,
        unmount: () => {
            root.remove();
        }
    };
}

export default createView;
