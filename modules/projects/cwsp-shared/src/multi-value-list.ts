/**
 * Split multi-id / multi-host settings fields on comma, semicolon, or whitespace
 * (space, tab, newline). Used by Settings, AirPad, and Java CWSP prefs parity.
 */
export const MULTI_VALUE_SPLIT_RE = /[,;\s]+/;

/** Split a scalar list field into trimmed non-empty tokens (dedupe optional). */
export const splitMultiValueList = (value: unknown): string[] => {
    if (value == null) return [];
    if (Array.isArray(value)) {
        return value.flatMap((item) => splitMultiValueList(item));
    }
    const raw = String(value).trim();
    if (!raw) return [];
    return raw.split(MULTI_VALUE_SPLIT_RE).map((s) => s.trim()).filter(Boolean);
};
