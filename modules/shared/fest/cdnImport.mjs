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


/*
export const importTimeout = async (url, timeout = 1000) => {
    return Promise.race([
        import(url),
        new Promise((_, rj) => (setTimeout(rj, timeout)))
    ]);
}

//
export default async (cdnList, local, whoFast = false)=>{
    let module = null;

    //
    const timeout = 1000;
    if (whoFast) {
        try { module = await Promise.any(cdnList.map(m=>importTimeout(m, timeout))); } catch(e) { console.warn(e); }
    } else {
        for (let m of cdnList) {
            try { module = await importTimeout(m, timeout); } catch(e) { console.warn(e); }
            if (module != null) { return module; }
        }

        //
        if (module != null) { return module; }
    }

    //
    switch(typeof local) {
        case "string"  : return importTimeout(local, timeout)
        case "function": return local();
        default: return local;
    }
}
*/
