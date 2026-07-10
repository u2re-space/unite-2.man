/**
 * Minimal staged LAN/WAN route contract for CWSP connectivity recovery.
 * INVARIANT: this contract describes route intent; domain handlers still own packet semantics.
 */
export const CONNECTIVITY_V3_FLAG = "v3";

export type ConnectivityV3RelayAction = "none" | "local" | "direct-ws" | "gateway-ws" | "http-fallback";

export type ConnectivityV3RouteIntent = {
    selfId: string;
    senderId: string;
    targets: string[];
};

export type ConnectivityV3RelayDecision = {
    action: ConnectivityV3RelayAction;
    targetId?: string;
    via?: string;
    reason?: string;
};

export type ConnectivityV3Diagnostics = {
    observed: number;
    directWs: number;
    gatewayWs: number;
    httpFallback: number;
    local: number;
    lastSender: string;
    lastTargets: string[];
};

export const CONNECTIVITY_V3_GATEWAY_ID = "L-192.168.0.200";
