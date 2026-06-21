/**
 * KVM / Synergy-style multi-screen layout helpers (isomorphic).
 * Maps peer screens in a virtual canvas and scales motion across DPI/sensitivity.
 */

export type KvmEdge = "left" | "right" | "top" | "bottom";

export type KvmScreenLayout = {
    peerId: string;
    layoutX: number;
    layoutY: number;
    width: number;
    height: number;
    dpiScale?: number;
    sensitivity?: number;
};

export type KvmLayoutConfig = {
    enabled?: boolean;
    edgeThreshold?: number;
    pollIntervalMs?: number;
    screens: KvmScreenLayout[];
};

export type KvmEdgeCrossing = {
    edge: KvmEdge;
    neighbor: KvmScreenLayout;
};

const normPeer = (value: unknown): string => String(value ?? "").trim();

export const normalizeKvmPeerId = normPeer;

export const findKvmScreen = (layout: KvmLayoutConfig, peerId: string): KvmScreenLayout | undefined => {
    const needle = normPeer(peerId).toLowerCase();
    if (!needle) return undefined;
    return layout.screens.find((screen) => normPeer(screen.peerId).toLowerCase() === needle);
};

export const findKvmNeighbor = (screen: KvmScreenLayout, edge: KvmEdge, screens: KvmScreenLayout[]): KvmScreenLayout | undefined => {
    const sx = screen.layoutX;
    const sy = screen.layoutY;
    const sw = screen.width;
    const sh = screen.height;
    for (const candidate of screens) {
        if (candidate === screen) continue;
        const cx = candidate.layoutX;
        const cy = candidate.layoutY;
        const cw = candidate.width;
        const ch = candidate.height;
        if (edge === "left" && cx + cw === sx) {
            const overlapTop = Math.max(sy, cy);
            const overlapBottom = Math.min(sy + sh, cy + ch);
            if (overlapBottom > overlapTop) return candidate;
        }
        if (edge === "right" && sx + sw === cx) {
            const overlapTop = Math.max(sy, cy);
            const overlapBottom = Math.min(sy + sh, cy + ch);
            if (overlapBottom > overlapTop) return candidate;
        }
        if (edge === "top" && cy + ch === sy) {
            const overlapLeft = Math.max(sx, cx);
            const overlapRight = Math.min(sx + sw, cx + cw);
            if (overlapRight > overlapLeft) return candidate;
        }
        if (edge === "bottom" && sy + sh === cy) {
            const overlapLeft = Math.max(sx, cx);
            const overlapRight = Math.min(sx + sw, cx + cw);
            if (overlapRight > overlapLeft) return candidate;
        }
    }
    return undefined;
};

export const detectKvmEdgeCrossing = (
    screen: KvmScreenLayout,
    localX: number,
    localY: number,
    threshold: number,
    screens: KvmScreenLayout[]
): KvmEdgeCrossing | undefined => {
    const t = Math.max(1, threshold);
    if (localX <= t) {
        const neighbor = findKvmNeighbor(screen, "left", screens);
        if (neighbor) return { edge: "left", neighbor };
    }
    if (localX >= screen.width - t) {
        const neighbor = findKvmNeighbor(screen, "right", screens);
        if (neighbor) return { edge: "right", neighbor };
    }
    if (localY <= t) {
        const neighbor = findKvmNeighbor(screen, "top", screens);
        if (neighbor) return { edge: "top", neighbor };
    }
    if (localY >= screen.height - t) {
        const neighbor = findKvmNeighbor(screen, "bottom", screens);
        if (neighbor) return { edge: "bottom", neighbor };
    }
    return undefined;
};

export const localToCanvas = (screen: KvmScreenLayout, localX: number, localY: number): { x: number; y: number } => ({
    x: screen.layoutX + localX,
    y: screen.layoutY + localY
});

export const canvasToLocal = (screen: KvmScreenLayout, canvasX: number, canvasY: number): { x: number; y: number } => ({
    x: canvasX - screen.layoutX,
    y: canvasY - screen.layoutY
});

export const mapCanvasPointToScreen = (
    screens: KvmScreenLayout[],
    canvasX: number,
    canvasY: number
): { screen: KvmScreenLayout; localX: number; localY: number } | undefined => {
    for (const screen of screens) {
        const lx = canvasX - screen.layoutX;
        const ly = canvasY - screen.layoutY;
        if (lx >= 0 && ly >= 0 && lx < screen.width && ly < screen.height) {
            return { screen, localX: lx, localY: ly };
        }
    }
    return undefined;
};

/** WHY: inset keeps the entry pixel inside the target screen so edge detection does not immediately hand back. */
export const KVM_HANDOFF_INSET = 4;

/** Entry point on neighbor screen when crossing an edge from {@code fromScreen}. */
export const kvmHandoffLocalPoint = (
    fromScreen: KvmScreenLayout,
    toScreen: KvmScreenLayout,
    edge: KvmEdge,
    localX: number,
    localY: number,
    threshold = 8,
    inset = KVM_HANDOFF_INSET
): { x: number; y: number } => {
    const t = Math.max(1, threshold);
    const insets = Math.max(1, inset);
    const fromCanvas = localToCanvas(fromScreen, localX, localY);
    let canvasX = fromCanvas.x;
    let canvasY = fromCanvas.y;
    if (edge === "left") canvasX = toScreen.layoutX + toScreen.width - t - insets;
    else if (edge === "right") canvasX = toScreen.layoutX + t + insets;
    else if (edge === "top") canvasY = toScreen.layoutY + toScreen.height - t - insets;
    else if (edge === "bottom") canvasY = toScreen.layoutY + t + insets;

    const overlapTop = Math.max(fromScreen.layoutY, toScreen.layoutY);
    const overlapBottom = Math.min(fromScreen.layoutY + fromScreen.height, toScreen.layoutY + toScreen.height);
    if (edge === "left" || edge === "right") {
        canvasY = Math.max(overlapTop, Math.min(canvasY, overlapBottom - 1));
    }
    const overlapLeft = Math.max(fromScreen.layoutX, toScreen.layoutX);
    const overlapRight = Math.min(fromScreen.layoutX + fromScreen.width, toScreen.layoutX + toScreen.width);
    if (edge === "top" || edge === "bottom") {
        canvasX = Math.max(overlapLeft, Math.min(canvasX, overlapRight - 1));
    }
    const local = canvasToLocal(toScreen, canvasX, canvasY);
    return {
        x: Math.max(0, Math.min(toScreen.width - 1, local.x)),
        y: Math.max(0, Math.min(toScreen.height - 1, local.y))
    };
};

/** Pin hardware cursor to the physical screen edge (not threshold inset — that reads as a bounce). */
export const kvmStickyLocalPoint = (
    screen: KvmScreenLayout,
    edge: KvmEdge,
    localX: number,
    localY: number,
    _threshold = 8
): { x: number; y: number } => {
    switch (edge) {
        case "left":
            return { x: 0, y: localY };
        case "right":
            return { x: screen.width - 1, y: localY };
        case "top":
            return { x: localX, y: 0 };
        case "bottom":
            return { x: localX, y: screen.height - 1 };
        default:
            return { x: localX, y: localY };
    }
};

export const scaleKvmMotionDelta = (
    dx: number,
    dy: number,
    fromScreen: KvmScreenLayout,
    toScreen: KvmScreenLayout,
    sensitivityOverride?: number
): { dx: number; dy: number } => {
    const sens = sensitivityOverride ?? fromScreen.sensitivity ?? 1;
    const srcDpi = fromScreen.dpiScale ?? 1;
    const dstDpi = toScreen.dpiScale ?? 1;
    const dpiRatio = dstDpi / srcDpi;
    return {
        dx: dx * sens * dpiRatio,
        dy: dy * sens * dpiRatio
    };
};

export const applyKvmPayloadScale = (
    dx: number,
    dy: number,
    kvm: Record<string, unknown> | undefined,
    localScreen?: KvmScreenLayout
): { dx: number; dy: number } => {
    if (!kvm || typeof kvm !== "object") return { dx, dy };
    const sourceDpi = Number(kvm.sourceDpiScale ?? kvm.dpiScale ?? 1);
    const targetDpi = Number(kvm.targetDpiScale ?? localScreen?.dpiScale ?? 1);
    const sensitivity = Number(kvm.sensitivity ?? 1);
    const ratio = Number.isFinite(sourceDpi) && sourceDpi > 0 ? targetDpi / sourceDpi : 1;
    const sens = Number.isFinite(sensitivity) ? sensitivity : 1;
    return {
        dx: dx * sens * ratio,
        dy: dy * sens * ratio
    };
};
