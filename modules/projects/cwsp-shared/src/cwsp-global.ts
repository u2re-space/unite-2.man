/**
 * Process-wide CWSP bindings on `globalThis[Symbol.for("cwsp.…")]`.
 *
 * WHY: symlinked `server/inputs/*`, `src/node/*`, and duplicate import paths can
 * evaluate the same logical module twice; module-level `let` / `export default new
 * Foo()` then diverge. One symbol → one class/object/map per JS realm.
 *
 * Idiom (TS cannot `export { globalThis[sym] as X }` — use helpers):
 *
 * ```ts
 * export class MouseAccess { ... }
 * export default cwspGlobal(CWSP_SLOT.mouseAccess, () => new MouseAccess());
 * ```
 */

export const CWSP_SLOT = {
    modules: "config.modules",
    airpadInputAccess: "handlers.airpadInputAccess",
    airpadInputSession: "handlers.airpadInputSession",
    mouseAccess: "handlers.mouseAccess",
    keyboardAccess: "handlers.keyboardAccess",
    touchAccess: "handlers.touchAccess",
    voiceAccess: "handlers.voiceAccess",
    screenAccess: "handlers.screenAccess",
    contactsAccess: "handlers.contactsAccess",
    smsAccess: "handlers.smsAccess",
    javaHostBridge: "inputs.javaHostBridge",
    clipboardEcho: "inputs.clipboardEcho",
    clipboardWriteGuard: "inputs.clipboardWriteGuard",
    inputCommandScheduler: "inputs.inputCommandScheduler",
    inputMovementStabilizer: "inputs.inputMovementStabilizer",
    inputApplyRateGovernor: "inputs.inputApplyRateGovernor",
    inputV3Diagnostics: "inputs.inputV3Diagnostics",
    socketTrace: "protocol.socketTrace",
    floodGuard: "protocol.floodGuard",
    transportHandlers: "protocol.transportHandlers",
    airpadEventBus: "airpad.eventBus",
    airpadKvmSession: "airpad.kvmSession",
    airpadPacketWsRail: "airpad.packetWsRail",
    airpadCoordinator: "airpad.coordinator",
    airpadTransportFacade: "airpad.transportFacade"
} as const;

export type CwspSlotKey = (typeof CWSP_SLOT)[keyof typeof CWSP_SLOT] | string;

type CwspGlobalBag = Record<symbol, unknown>;

export const cwspSym = (key: CwspSlotKey): symbol => Symbol.for(`cwsp.${String(key)}`);

const bag = (): CwspGlobalBag => globalThis as CwspGlobalBag;

export const cwspEnsure = <T>(sym: symbol, init: () => T): T => {
    const current = bag()[sym];
    if (current !== undefined) return current as T;
    const created = init();
    bag()[sym] = created as unknown;
    return created;
};

export const cwspAssign = <T>(sym: symbol, value: T): T => {
    const current = bag()[sym];
    if (current !== undefined) return current as T;
    bag()[sym] = value as unknown;
    return value;
};

export const cwspExport = <T>(sym: symbol): T => {
    const value = bag()[sym];
    if (value === undefined) {
        throw new Error(`[cwsp-global] missing binding ${String(sym.description || sym.toString())}`);
    }
    return value as T;
};

export const cwspPeek = <T>(sym: symbol): T | undefined => bag()[sym] as T | undefined;

export const cwspGlobal = <T>(key: CwspSlotKey, init: () => T): T => cwspEnsure(cwspSym(key), init);

/** @deprecated alias */
export const cwspSlot = cwspGlobal;

export const peekCwspSlot = <T>(key: CwspSlotKey): T | undefined => cwspPeek<T>(cwspSym(key));

export const cwspDefineClass = <T extends abstract new (...args: never[]) => unknown>(
    key: CwspSlotKey,
    define: () => T
): T => cwspEnsure(cwspSym(key), define);

export const markCwspHost = (host: object, key: CwspSlotKey = CWSP_SLOT.transportHandlers): boolean => {
    const sym = cwspSym(`host.${key}`);
    const record = host as CwspGlobalBag;
    if (record[sym]) return false;
    record[sym] = true as unknown;
    return true;
};

export const isCwspHostMarked = (host: object, key: CwspSlotKey = CWSP_SLOT.transportHandlers): boolean =>
    Boolean((host as CwspGlobalBag)[cwspSym(`host.${key}`)]);

export const getCwspGlobal = (): CwspGlobalBag => bag();
