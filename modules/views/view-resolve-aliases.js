/**
 * Vite `resolve.alias` from package `tsconfig.json` + subsystem `tsconfig.vite-base.json`
 * (view dev stubs, fest, veela). Local paths override base; longer `find` wins over prefix keys.
 *
 * Lives under real `modules/views/` because `modules/views/shared` → `modules/shared` → subsystem.
 */
import { existsSync, readFileSync } from "node:fs";
import { resolve } from "node:path";
import { importFromTSConfig } from "../shared/vite.config.js";

const workspaceRoot = resolve(import.meta.dirname, "../..");
const viewsRoot = resolve(import.meta.dirname);
const subsystemPkgRoot = resolve(workspaceRoot, "modules/projects/subsystem");
/** Same tree as `modules/shared` symlink; runtime stubs + types live here. */
const sharedRoot = subsystemPkgRoot;
const subsystemRoot = resolve(workspaceRoot, "modules/projects/subsystem/src");
const VITE_BASE = resolve(subsystemPkgRoot, "tsconfig.vite-base.json");

/**
 * @param {Array<{ find: string, replacement: string }>} baseList
 * @param {Array<{ find: string, replacement: string }>} localList
 */
function mergeAliasLists(baseList, localList) {
    const byFind = new Map();
    for (const a of baseList) {
        if (!byFind.has(a.find)) byFind.set(a.find, a);
    }
    for (const a of localList) {
        byFind.set(a.find, a);
    }
    return [...byFind.values()].sort((a, b) => {
        const sa = String(a.find);
        const sb = String(b.find);
        if (sb.length !== sa.length) return sb.length - sa.length;
        return sa.localeCompare(sb);
    });
}

/**
 * @param {string} projectRoot — directory containing `tsconfig.json`
 * @param {Array<{ find: string, replacement: string }>} [prepend]
 */
export function getViewResolveAliases(projectRoot, prepend = []) {
    const root = resolve(projectRoot);
    const base = existsSync(VITE_BASE)
        ? JSON.parse(readFileSync(VITE_BASE, "utf8"))
        : { compilerOptions: {} };
    const basePaths = base.compilerOptions?.paths || {};
    const localPath = resolve(root, "tsconfig.json");
    const local = existsSync(localPath)
        ? JSON.parse(readFileSync(localPath, "utf8"))
        : { compilerOptions: {} };
    const localPaths = local.compilerOptions?.paths || {};
    const baseAliases = importFromTSConfig({ compilerOptions: { paths: basePaths } }, subsystemPkgRoot);
    const localAliases = importFromTSConfig({ compilerOptions: { paths: localPaths } }, root);
    return [...prepend, ...mergeAliasLists(baseAliases, localAliases)];
}

export { workspaceRoot, viewsRoot, sharedRoot, subsystemRoot };
