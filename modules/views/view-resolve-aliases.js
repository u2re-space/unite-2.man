/**
 * FIND:view-resolve
 * Vite `resolve.alias` from package `tsconfig.json` + subsystem `tsconfig.vite-base.json`
 * (view dev stubs, fest, veela). Local paths override base; longer `find` wins over prefix keys.
 *
 * Lives under real `modules/views/` because `modules/views/shared` → `modules/shared` → subsystem.
 */
import { existsSync, readdirSync, readFileSync, realpathSync } from "node:fs";
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
 * Absolute alias targets for imports that must resolve from every shell / view root.
 * WHY: `tsconfig` path merges occasionally omit or shadow `cwsp-shared/*` / `@cwsp/shared/*` rows
 * when the dev server root is a shell (not `airpad-view` itself).
 */
const CWSP_AIRPAD_CLIENT_PARITY = resolve(
    workspaceRoot,
    "modules/projects/cwsp-shared/src/airpad-cwsp-client-parity.ts"
);
const NETWORK_VIEW_ENTRY = resolve(workspaceRoot, "modules/views/network-view/src/index.ts");
const SETTINGS_CONTRIBUTIONS = resolve(
    workspaceRoot,
    "modules/projects/subsystem/src/other/config/SettingsContributions.ts"
);
const ECOSYSTEM_SKUS = resolve(
    workspaceRoot,
    "modules/projects/subsystem/src/other/config/ecosystem-skus.ts"
);
const SETTINGS_CONFIG = resolve(workspaceRoot, "modules/projects/subsystem/src/other/config/Settings.ts");
const CAPACITOR_SHARE_INTENT = resolve(
    workspaceRoot,
    "modules/projects/subsystem/src/boot/capacitor-share-intent.ts"
);
const PWA_HANDLING = resolve(
    workspaceRoot,
    "modules/projects/subsystem/src/routing/pwa/pwa-handling.ts"
);

const cwspAirpadParityFinds = new Set([
    "cwsp-shared/airpad-cwsp-client-parity",
    "@cwsp/shared/airpad-cwsp-client-parity"
]);

const cwspAirpadParityAliases = [
    { find: "cwsp-shared/airpad-cwsp-client-parity", replacement: CWSP_AIRPAD_CLIENT_PARITY },
    { find: "@cwsp/shared/airpad-cwsp-client-parity", replacement: CWSP_AIRPAD_CLIENT_PARITY }
];

const flUiSrc = resolve(workspaceRoot, "modules/projects/fl.ui/src/ui");
const veelaScss = resolve(workspaceRoot, "modules/projects/veela.css/src/scss");
const OPEN_POLICY = resolve(workspaceRoot, "modules/projects/subsystem/src/other/config/open-policy.ts");
const SW_CACHE = resolve(workspaceRoot, "modules/projects/subsystem/src/routing/pwa/sw-cache.ts");
const CWS_BRIDGE = resolve(workspaceRoot, "modules/projects/subsystem/src/routing/native/cws-bridge.ts");

/**
 * WHY: view tsconfigs are written for `modules/views/<name>` (`../../projects`, `../shared`).
 * App packages are the realpath (`apps/CWSP-explorer`); resolving those relatives from the
 * app root points at missing `projects/` / `apps/shared`.
 * @param {string} projectRoot
 */
function viewsLayoutRoot(projectRoot) {
    const root = resolve(projectRoot);
    let real;
    try {
        real = realpathSync(root);
    } catch {
        return root;
    }
    try {
        for (const ent of readdirSync(viewsRoot, { withFileTypes: true })) {
            if (ent.name.startsWith(".")) continue;
            const candidate = resolve(viewsRoot, ent.name);
            try {
                if (realpathSync(candidate) === real) return candidate;
            } catch {
                /* dangling view link */
            }
        }
    } catch {
        /* viewsRoot unreadable */
    }
    return root;
}

function aliasReplacementExists(replacement) {
    if (typeof replacement !== "string" || !replacement) return true;
    if (existsSync(replacement)) return true;
    return [".ts", ".js", ".mjs", ".scss", ".css"].some((ext) => existsSync(`${replacement}${ext}`));
}

const lureSrc = resolve(workspaceRoot, "modules/projects/lur.e/src");
const workspaceLibAliases = [
    { find: /^veela-lib\/ui\/explorer$/, replacement: resolve(veelaScss, "ui/_explorer.scss") },
    { find: /^fl-ui\//, replacement: `${flUiSrc}/` },
    { find: /^veela-lib\//, replacement: `${veelaScss}/` }
];
const lureSubpathAliases = [
    { find: "@fest-lib/lure/provide", replacement: resolve(lureSrc, "utils/opfs/provide.ts") },
    { find: "@fest-lib/lure/idb-fs", replacement: resolve(lureSrc, "utils/opfs/IdbFs.ts") },
    { find: "@fest-lib/lure/remote-fs", replacement: resolve(lureSrc, "utils/opfs/remote-fs.ts") },
    { find: "@fest-lib/lure/markdown-assets", replacement: resolve(lureSrc, "utils/opfs/markdown-assets.ts") },
    { find: "@fest-lib/lure/code-overlay", replacement: resolve(lureSrc, "lure/misc/CodeOverlay.ts") },
    { find: /^@fest-lib\/fl-ui\/markdown\/highlight$/, replacement: resolve(workspaceRoot, "modules/projects/fl.ui/src/ui/markdown/highlight.ts") },
    { find: /^@fest-lib\/fl-ui\/markdown\/render$/, replacement: resolve(workspaceRoot, "modules/projects/fl.ui/src/ui/markdown/render.ts") },
    {
        find: "@fest-lib/uniform/mounted-fs",
        replacement: resolve(workspaceRoot, "modules/projects/uniform.ts/src/newer/messaging/MountedFs.ts")
    }
];

const viewSharedAliases = [
    { find: "views/network", replacement: NETWORK_VIEW_ENTRY },
    { find: "com/config/Settings", replacement: SETTINGS_CONFIG },
    { find: "com/config/SettingsContributions", replacement: SETTINGS_CONTRIBUTIONS },
    { find: "com/config/ecosystem-skus", replacement: ECOSYSTEM_SKUS },
    { find: "com/config/open-policy", replacement: OPEN_POLICY },
    { find: "com/routing/pwa/sw-cache", replacement: SW_CACHE },
    { find: "com/routing/native/cws-bridge", replacement: CWS_BRIDGE },
    { find: "boot/capacitor-share-intent", replacement: CAPACITOR_SHARE_INTENT },
    { find: "core/pwa/pwa-handling", replacement: PWA_HANDLING }
];

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
    const layoutRoot = viewsLayoutRoot(root);
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
    const localAliases = importFromTSConfig({ compilerOptions: { paths: localPaths } }, layoutRoot).filter(
        (a) => aliasReplacementExists(a.replacement)
    );
    const merged = mergeAliasLists(baseAliases, localAliases).filter(
        (a) => !cwspAirpadParityFinds.has(String(a.find))
    );
    return [
        ...prepend,
        ...workspaceLibAliases,
        ...lureSubpathAliases,
        ...viewSharedAliases,
        ...cwspAirpadParityAliases,
        ...merged
    ];
}

export { workspaceRoot, viewsRoot, sharedRoot, subsystemRoot };
