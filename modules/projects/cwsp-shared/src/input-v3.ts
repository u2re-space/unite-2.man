/**
 * Minimal AirPad input v3 contract shared by client and desk runtime.
 * INVARIANT: realtime movement is relative, live-only, and never replayed after reconnect.
 */
export type InputV3Kind = "move" | "scroll";

export type InputV3Delta = {
    kind: InputV3Kind;
    dx: number;
    dy: number;
    seq: number;
    sentAt: number;
    senderId: string;
    route: string;
};

export type InputV3Payload = {
    input?: typeof INPUT_V3_FLAG;
    dx: number;
    dy: number;
    seq: number;
    sentAt: number;
    route?: string;
};

export type InputV3Envelope = {
    op?: string;
    what?: string;
    type?: string;
    payload?: unknown;
    data?: unknown;
};

export const INPUT_V3_FLAG = "v3";

export const INPUT_V3_DEFAULT_RELAY_IPS = 60;
export const INPUT_V3_DEFAULT_DIRECT_IPS = 90;
export const INPUT_V3_MAX_PENDING_AGE_MS = 80;
