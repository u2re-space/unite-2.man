/*
 * Filename: bump-patch-version.mjs
 * FullPath: modules/projects/scripts/bump-patch-version.mjs
 * FIND:publish
 * Change date and time: 13.22.00_28.08.2026
 * Reason for changes: `npm run publish` bumps the patch (x.y.Z+1) before release.
 *
 * Usage (cwd = package root):
 *   node ../scripts/bump-patch-version.mjs [--dry-run]
 *
 * WHY: each publish must take a new npm version; only the last numeric segment moves.
 * INVARIANT: major.minor stay put. Base is max(local, npm view) so a stale package.json
 * cannot republish an existing version.
 */

import { execFileSync } from "node:child_process";
import fs from "node:fs";
import path from "node:path";

const dryRun = process.argv.includes("--dry-run");
const pkgPath = path.resolve(process.cwd(), "package.json");

function parseTriple(raw) {
    const m = String(raw || "").trim().match(/^(\d+)\.(\d+)\.(\d+)(.*)$/);
    if (!m) return null;
    return { major: Number(m[1]), minor: Number(m[2]), patch: Number(m[3]), suffix: m[4] };
}

function formatTriple(t) {
    return `${t.major}.${t.minor}.${t.patch}${t.suffix}`;
}

function cmpTriple(a, b) {
    if (a.major !== b.major) return a.major - b.major;
    if (a.minor !== b.minor) return a.minor - b.minor;
    if (a.patch !== b.patch) return a.patch - b.patch;
    return String(a.suffix).localeCompare(String(b.suffix));
}

function bumpPatch(t) {
    return { ...t, patch: t.patch + 1 };
}

function registryVersion(name) {
    try {
        const out = execFileSync("npm", ["view", name, "version"], {
            encoding: "utf8",
            stdio: ["ignore", "pipe", "ignore"],
            timeout: 15000
        }).trim();
        return out || null;
    } catch {
        return null;
    }
}

if (!fs.existsSync(pkgPath)) {
    console.error("[bump-patch] no package.json in cwd");
    process.exit(1);
}

const raw = fs.readFileSync(pkgPath, "utf8");
const pkg = JSON.parse(raw);
const localRaw = String(pkg.version || "");
const local = parseTriple(localRaw);
if (!local) {
    console.error(`[bump-patch] not semver x.y.Z: ${localRaw}`);
    process.exit(1);
}

const publishedRaw = typeof pkg.name === "string" ? registryVersion(pkg.name) : null;
const published = publishedRaw ? parseTriple(publishedRaw) : null;
const base = published && cmpTriple(published, local) > 0 ? published : local;
const next = bumpPatch(base);
const nextRaw = formatTriple(next);

if (dryRun) {
    console.log(
        `[bump-patch] dry-run ${pkg.name} ${localRaw} → ${nextRaw}` +
            (publishedRaw ? ` (npm ${publishedRaw})` : "")
    );
    process.exit(0);
}

pkg.version = nextRaw;
fs.writeFileSync(pkgPath, `${JSON.stringify(pkg, null, 4)}\n`);
console.log(
    `[bump-patch] ${pkg.name} ${localRaw} → ${nextRaw}` +
        (publishedRaw ? ` (npm ${publishedRaw})` : "")
);
