#!/usr/bin/env node
/**
 * FIND:fest-shared
 * Build isolated @fest-lib/* packages for the browser and copy them to
 * runtime/fastify/apps/_shared/fest.
 *
 * Usage: node modules/projects/scripts/stage-fest-libs.mjs [--force]
 * WHY: skip rebuild when dist already exists; --force rebuilds every package.
 */

import { spawnSync } from "node:child_process";
import { existsSync, mkdirSync, writeFileSync } from "node:fs";
import { dirname, join, resolve } from "node:path";
import { fileURLToPath } from "node:url";

import { FEST_WEB_LIBS, copyFestWebLibsToDir, festLibDist } from "../../shared/fest-web-libs.mjs";

const repoRoot = resolve(dirname(fileURLToPath(import.meta.url)), "../../..");
const sharedFest = join(repoRoot, "runtime/fastify/apps/_shared/fest");
const force = process.argv.includes("--force");

const buildOne = (lib) => {
    const pkg = join(repoRoot, "modules/projects", lib.dir);
    const dist = festLibDist(repoRoot, lib);
    if (!force && existsSync(dist)) {
        console.log(`[stage-fest-libs] skip ${lib.id} (dist exists)`);
        return true;
    }
    console.log(`[stage-fest-libs] build ${lib.id}`);
    const result = spawnSync("npx", ["vite", "build", "--config", "vite.config.js"], {
        cwd: pkg,
        env: { ...process.env, FEST_WEB_IMPORTS: "1" },
        stdio: "inherit",
    });
    if (result.status !== 0) {
        console.error(`[stage-fest-libs] ${lib.id} failed (${result.status})`);
        return false;
    }
    return existsSync(dist);
};

let ok = true;
for (const lib of FEST_WEB_LIBS) {
    if (!buildOne(lib)) ok = false;
}

mkdirSync(sharedFest, { recursive: true });
const copied = copyFestWebLibsToDir(repoRoot, sharedFest);
writeFileSync(
    join(dirname(sharedFest), ".sync-meta.json"),
    `${JSON.stringify(
        {
            syncedAt: new Date().toISOString(),
            mode: "library",
            slices: FEST_WEB_LIBS.map((l) => l.name),
            copied,
        },
        null,
        2,
    )}\n`,
);
console.log(`[stage-fest-libs] ${copied} file(s) → ${sharedFest}`);
if (!ok) process.exit(1);
