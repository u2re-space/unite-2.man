// For avoid symbolic link and cross-module imports issues

// Symbol for the shared registry
const SharedLink = Symbol.for("SharedLink@CWSP");
(globalThis as any)[SharedLink] ??= (globalThis as any)[SharedLink] ?? {};
const SharedRegistry: Record<symbol, any> = (globalThis as any)?.[SharedLink] ?? {};

export default SharedRegistry;
export function registerShared<T>(key: symbol, value: T) {
    SharedRegistry[key] ??= value;
    return SharedRegistry[key];
}

export const exportShared = <T>(key: symbol, value: T) => {
    return registerShared(key, value);
}

export const importShared = <T>(key: symbol) => {
    return SharedRegistry?.[key];
}
