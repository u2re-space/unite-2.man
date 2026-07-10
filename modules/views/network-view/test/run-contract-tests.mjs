/**
 * Focused Pass-II Network contract-test runner.
 *
 * WHY: network-view probe-origin helpers resolve `cwsp-shared/*` via package
 * aliases that a direct `node --test` invocation cannot resolve. Bundle each
 * test entry with those production aliases, keep Node/jsdom external, then
 * execute the generated ESM files with the built-in Node test runner.
 */
import { spawn } from "node:child_process";
import { mkdtemp, rm } from "node:fs/promises";
import { join, resolve } from "node:path";
import { build } from "vite";

import { getViewResolveAliases } from "../../view-resolve-aliases.js";

const root = resolve(import.meta.dirname, "..");
const outputDirectory = await mkdtemp(
    join(resolve(root, "../../../node_modules"), ".network-view-contracts-")
);

const testEntries = {
    "network-capability.test": resolve(root, "test/network-capability.test.ts"),
    "network-a11y.test": resolve(root, "test/network-a11y.test.ts"),
    "network-probe-origin.test": resolve(root, "test/network-probe-origin.test.ts")
};

try {
    await build({
        root,
        configFile: false,
        logLevel: "warn",
        resolve: {
            alias: getViewResolveAliases(root)
        },
        build: {
            target: "esnext",
            minify: false,
            sourcemap: "inline",
            emptyOutDir: true,
            outDir: outputDirectory,
            lib: {
                entry: testEntries,
                formats: ["es"],
                fileName: (_format, entryName) => `${entryName}.mjs`
            },
            rollupOptions: {
                external: [/^node:/, "jsdom"]
            }
        }
    });

    const outputs = Object.keys(testEntries).map((name) => resolve(outputDirectory, `${name}.mjs`));
    const exitCode = await new Promise((resolveExit, reject) => {
        const child = spawn(
            process.execPath,
            [`--localstorage-file=${resolve(outputDirectory, "local-storage.json")}`, "--test", ...outputs],
            {
                cwd: root,
                env: { ...process.env },
                stdio: "inherit"
            }
        );
        child.once("error", reject);
        child.once("exit", (code, signal) => {
            if (signal) reject(new Error(`contract tests terminated by ${signal}`));
            else resolveExit(code ?? 1);
        });
    });

    if (exitCode !== 0) process.exitCode = exitCode;
} finally {
    await rm(outputDirectory, { recursive: true, force: true });
}
