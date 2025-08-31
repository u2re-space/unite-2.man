import { resolve  } from "node:path";
import { readFile } from "node:fs/promises";

//
const importConfig = (url, ...args)=>{ return import(url)?.then?.((m)=>m?.default?.(...args)); }
const objectAssign = (target, ...sources) => {
    if (!sources?.length) return target;
    const source = sources.shift();
    if (source && typeof source === 'object') {
        for (const key in source) {
            if (Object.prototype.hasOwnProperty.call(source, key)) {
                if (source[key] && typeof source[key] === 'object') {
                    if (!target[key] || typeof target[key] !== 'object') {
                        target[key] = Array.isArray(source[key]) ? [] : {};
                    }
                    objectAssign(target[key], source[key]);
                } else {
                    target[key] = source[key];
                }
            }
        }
    }
    return objectAssign(target, ...sources);
}

//
export const NAME = "fl-ui"; // TODO! rename to lure
export const __dirname = resolve(import.meta.dirname, "./");
export default objectAssign(
    await importConfig(resolve(__dirname, "../../shared/vite.config.js"),
        NAME,
        JSON.parse(await readFile(resolve(__dirname, "./tsconfig.json"), {encoding: "utf8"})),
        __dirname
    ),
    {}
);
