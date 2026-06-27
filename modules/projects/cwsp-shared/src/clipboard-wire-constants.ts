/**
 * Clipboard wire constants shared by Node endpoint, browser clients, and Java parity.
 * Server-only caps live in endpoint `clipboard-wire-parity.ts`.
 */

export const CLIPBOARD_ECHO_SUPPRESS_MS = 1200;
/** Inbound/outbound wire dedupe for clipboard acts (replay + mesh echo). */
export const CLIPBOARD_WIRE_DEDUPE_MS = 250;

/** Max age from first origin stamp before a non-input act is dropped (apply + relay). */
export const PACKET_ORIGIN_TTL_MS = 4_000;

/** Max age for gateway pending clipboard flush on peer reconnect (drop stale channel clips). */
export const CLIPBOARD_PENDING_FLUSH_MAX_AGE_MS = 12_000;

/** Default max relay size when no server env is available (browser / isomorphic). */
export const CLIPBOARD_MAX_TEXT_CHARS_DEFAULT = 512 * 1024;
