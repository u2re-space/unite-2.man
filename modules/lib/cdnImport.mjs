const cache = new Map();

//
export const importCache = async (name)=>{
    if (cache.has(name)) { return cache.get(name); }
    const mod = import(/* @vite-ignore */ name);
    cache.set(name, mod);
    return mod;
}

//
export const importCdn = async (modules) => {
    if (!Array.isArray(modules) || modules.length === 0) { throw new Error("Modules array must be non-empty."); }

    //
    if (modules.length > 1) {
        for (let i = 0; i < modules.length - 1; i++) {
            try {
                return importCache(/* @vite-ignore */ modules[i]);
            } catch (error) {
                console.warn(`Failed to load module: ${modules[i]}`, error);
            }
        }
    }

    //
    const fallback = modules[modules.length - 1];
    try {
        return importCache(/* @vite-ignore */ fallback);
    } catch (error) {
        throw new Error(modules.length === 1 ? `Failed to load the only module: ${fallback}` : `Failed to load fallback module: ${fallback}`);
    }
}

//
export default importCdn;
