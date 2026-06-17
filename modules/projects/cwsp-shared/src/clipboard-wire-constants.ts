/**
 * Clipboard wire constants shared by Node endpoint, browser clients, and Java parity.
 * Server-only caps live in endpoint `clipboard-wire-parity.ts`.
 */

export const CLIPBOARD_ECHO_SUPPRESS_MS = 1200;
export const CLIPBOARD_WIRE_DEDUPE_MS = 250;

/** Default max relay size when no server env is available (browser / isomorphic). */
export const CLIPBOARD_MAX_TEXT_CHARS_DEFAULT = 512 * 1024;
