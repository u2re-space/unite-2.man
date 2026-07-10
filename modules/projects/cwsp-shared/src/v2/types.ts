/*
 * Filename: types.ts
 * FullPath: modules/projects/cwsp-shared/src/v2/types.ts
 * Reason for changes: Define the transport-neutral CWSP v2 contract.
 */

export type JsonPrimitive = boolean | number | string | null;
export type JsonValue = JsonPrimitive | JsonValue[] | { [key: string]: JsonValue };

export type CwspVerb = "ask" | "act" | "result" | "error";
export type LegacyCwspVerb =
    | "request"
    | "response"
    | "signal"
    | "notify"
    | "redirect"
    | "ack"
    | "resolve"
    | "failure";

export type CwspPurpose =
    | "airpad"
    | "clipboard"
    | "input"
    | "mouse"
    | "sms"
    | "contact"
    | "notification"
    | "storage"
    | "debug"
    | "general";

export type CwspProtocol = "socket" | "ws" | "http" | "worker" | "chrome" | "local";
export type CwspTransport = "ws" | "socketio" | "bridge" | "http";

export interface CwspPacketError {
    code: string;
    message: string;
    details?: unknown;
}

export interface CwspExtension {
    id: string;
    version: number;
    required?: boolean;
    data?: JsonValue;
}

export interface SupportedCwspExtension {
    id: string;
    versions?: readonly number[];
}

export interface DataAssetEnvelope {
    hash: string;
    name: string;
    mimeType: string;
    size: number;
    source: string;
    data?: string;
    url?: string;
}

export interface CwspPacketFlags {
    canonicalV2: true;
    [key: string]: unknown;
}

/**
 * The canonical packet contains logical meaning only. Protocol and transport
 * remain optional diagnostics so the same object can cross WS, HTTP, or IPC.
 */
export interface CwspPacket {
    op: CwspVerb;
    what: string;
    purpose?: CwspPurpose;
    protocol?: CwspProtocol | string;
    transport?: CwspTransport | string;
    uuid: string;
    timestamp: number;
    sender: string;
    nodes?: string[];
    destinations?: string[];
    payload?: unknown;
    status?: number;
    error?: CwspPacketError;
    extensions?: CwspExtension[];
    flags: CwspPacketFlags;
}

export type Packet = CwspPacket;

/**
 * Boundary input accepts compatibility carriers and routing aliases. The
 * normalizer removes those aliases before local handlers consume a packet.
 */
export interface CwspPacketInput {
    op: CwspVerb | LegacyCwspVerb | string;
    what?: string;
    type?: string;
    action?: string;
    purpose?: CwspPurpose | string;
    protocol?: CwspProtocol | string;
    transport?: CwspTransport | string;
    uuid: string;
    timestamp: number;
    sender: string;
    byId?: string;
    from?: string;
    nodes?: readonly string[];
    destinations?: readonly string[];
    ids?: {
        byId?: string;
        destinations?: readonly string[];
    };
    target?: string;
    targetId?: string;
    deviceId?: string;
    payload?: unknown;
    data?: unknown;
    body?: unknown;
    params?: unknown;
    result?: unknown;
    status?: number;
    error?: CwspPacketError;
    extensions?: readonly CwspExtension[];
    flags?: Readonly<Record<string, unknown>>;
    [key: string]: unknown;
}

export interface CwspReplyInput {
    op?: "result" | "error";
    timestamp: number;
    sender: string;
    payload?: unknown;
    status?: number;
    error?: CwspPacketError;
    extensions?: readonly CwspExtension[];
}

export type DriverReadinessState = "available" | "unavailable" | "degraded";

export interface DriverReadiness {
    capability: string;
    state: DriverReadinessState;
    reason?: string;
    permission?: string;
    implementation?: string;
    version?: string;
}

export interface CwspExtensionResolution {
    ok: boolean;
    handled: string[];
    ignored: string[];
    preserved: CwspExtension[];
    error?: CwspPacketError;
}

export type CwspPolicyClass =
    | "relative-input"
    | "discrete-input"
    | "clipboard"
    | "settings"
    | "debug"
    | "reply"
    | "general";

export type CwspPolicyAction = "accept" | "enqueue" | "drop";

export type CwspPolicyReason =
    | "accepted"
    | "duplicate-uuid"
    | "duplicate-content"
    | "clipboard-echo"
    | "stale"
    | "reconnect-no-input-replay"
    | "reconnect-no-automatic-replay"
    | "reconnect-buffered"
    | "queue-full"
    | "inactive-correlation";

export interface CwspPolicyDecision {
    action: CwspPolicyAction;
    reason: CwspPolicyReason;
    class: CwspPolicyClass;
    dedupeKey?: string;
    evict?: "oldest";
}

export interface CwspPolicyContext {
    now: number;
    connection: "connected" | "reconnecting";
    seenUuids?: readonly string[];
    seenClipboardKeys?: readonly string[];
    remoteClipboard?: {
        key: string;
        appliedAt: number;
    };
    queueSize?: number;
    maxQueueSize?: number;
    activeCorrelations?: readonly string[];
}

export interface CwspPolicyConfig {
    relativeInputMaxAgeMs: number;
    discreteInputMaxAgeMs: number;
    generalMaxAgeMs: number;
    clipboardMaxAgeMs: number;
    clipboardEchoWindowMs: number;
    reconnectMaxAgeMs: number;
    settingsMaxAgeMs: number;
    debugMaxAgeMs: number;
    debugMaxPending: number;
    replyMaxAgeMs: number;
}
