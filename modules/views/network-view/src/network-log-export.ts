/**
 * Copy / save helpers for Network diagnostics page logs.
 */
import { getFrontendDebugApi, type FrontendDebugEntry } from "boot/frontend-debug-capture";
import { invokeCwsPlatformIPC } from "com/routing/native/cws-bridge";
import { writeClipboardTextToDevice } from "shared/native/clipboard-device";

const formatDebugEntry = (row: FrontendDebugEntry): string => {
    const ts = new Date(row.ts).toISOString();
    return `${ts} [${row.level}] (${row.scope}) ${row.msg}`;
};

/** Text from WebView ring buffer ({@link __CWSP_FRONTEND_DEBUG__}). */
export const collectFrontendLogText = (limit = 400): string => {
    const api = getFrontendDebugApi();
    const rows = api?.tail(limit) ?? [];
    if (!rows.length) return "(no frontend log entries — boot WebView debug capture first)\n";
    return rows.map(formatDebugEntry).join("\n") + "\n";
};

/** Native logcat snapshot via CwsBridge {@code debug:logcat}. */
export const collectNativeLogcatText = async (limit = 400): Promise<string> => {
    try {
        const result = await invokeCwsPlatformIPC({ channel: "debug:logcat", payload: { limit } });
        const bag = result as unknown as Record<string, unknown>;
        const echo = bag.echo as Record<string, unknown> | undefined;
        const direct = typeof bag.text === "string" ? bag.text : "";
        const nested = typeof echo?.text === "string" ? echo.text : "";
        const text = (direct || nested).trim();
        if (text) return text.endsWith("\n") ? text : `${text}\n`;
    } catch (error) {
        return `(logcat failed: ${error instanceof Error ? error.message : String(error)})\n`;
    }
    return "(logcat unavailable — native bridge missing or not on Android)\n";
};

/** Pull WebView batches stored in the native ring ({@code debug:append}). */
export const collectNativeFrontendRingText = async (limit = 400): Promise<string> => {
    try {
        const result = await invokeCwsPlatformIPC({ channel: "debug:frontend", payload: { limit } });
        const bag = result as unknown as Record<string, unknown>;
        const echo = bag.echo as Record<string, unknown> | undefined;
        const text = typeof bag.text === "string" ? bag.text : typeof echo?.text === "string" ? echo.text : "";
        if (text.trim()) return text.endsWith("\n") ? text : `${text}\n`;
    } catch {
        /* ignore */
    }
    return "";
};

export const buildCombinedPageLog = async (pageLog: string, probeSummary = ""): Promise<string> => {
    const header = [
        "CWSP Network diagnostics export",
        `generated: ${new Date().toISOString()}`,
        `userAgent: ${navigator.userAgent}`,
        ""
    ].join("\n");
    const frontend = collectFrontendLogText(500);
    const nativeRing = await collectNativeFrontendRingText(500);
    const logcat = await collectNativeLogcatText(500);
    const parts = [
        header,
        "=== Page log ===",
        pageLog || "(empty)",
        "",
        probeSummary ? "=== Probe summary ===\n" + probeSummary + "\n" : "",
        "=== Frontend log (WebView ring) ===",
        frontend,
        nativeRing.trim() ? "=== Frontend log (native ring) ===\n" + nativeRing + "\n" : "",
        "=== Logcat (native) ===",
        logcat
    ];
    return parts.filter(Boolean).join("\n");
};

export const copyTextToClipboard = async (text: string): Promise<boolean> => {
    const payload = text || "(empty log)";
    try {
        await writeClipboardTextToDevice(payload);
        return true;
    } catch {
        return false;
    }
};

export const saveTextAsDownload = (filename: string, text: string): void => {
    const blob = new Blob([text], { type: "text/plain;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = filename;
    a.rel = "noopener";
    document.body.append(a);
    a.click();
    a.remove();
    URL.revokeObjectURL(url);
};

export const timestampFilename = (prefix: string): string => {
    const stamp = new Date().toISOString().replace(/[:.]/g, "-");
    return `${prefix}-${stamp}.txt`;
};
