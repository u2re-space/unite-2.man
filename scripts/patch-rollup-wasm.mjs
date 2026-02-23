/**
 * Patches the @rollup/rollup-linux-x64-gnu (and win32) packages so their
 * `main` entry points to `dist/native.js` instead of `dist/rollup.js`.
 *
 * Background: npm/pnpm overrides redirect @rollup/rollup-<platform> to
 * @rollup/wasm-node, but @rollup/wasm-node's default main entry is the full
 * rollup bundle (exports VERSION, defineConfig, watch…) rather than the
 * native binding (exports parse, parseAsync, xxhash*).
 *
 * rollup/dist/native.js does require('@rollup/rollup-<platform>') and
 * destructures { parse, parseAsync, xxhash* } from it.  When the main entry
 * is the full bundle those are undefined, causing "parse is not a function"
 * and "parseAsync is not a function" at both dev and build time.
 *
 * This script redirects main → dist/native.js so the destructuring works.
 */

import { readFileSync, writeFileSync, existsSync } from 'node:fs';
import { resolve, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const root = resolve(__dirname, '..');

const PLATFORM_PKGS = [
    '@rollup/rollup-linux-x64-gnu',
    '@rollup/rollup-linux-x64-musl',
    '@rollup/rollup-win32-x64-msvc',
    '@rollup/rollup-darwin-x64',
    '@rollup/rollup-darwin-arm64',
    '@rollup/rollup-linux-arm64-gnu',
    '@rollup/rollup-linux-arm64-musl',
];

let patched = 0;
for (const pkg of PLATFORM_PKGS) {
    const pkgJson = resolve(root, 'node_modules', pkg, 'package.json');
    if (!existsSync(pkgJson)) continue;

    const data = JSON.parse(readFileSync(pkgJson, 'utf8'));

    // Only patch packages that were redirected to @rollup/wasm-node
    // (identified by having dist/native.js available alongside dist/rollup.js)
    const nativeJs = resolve(root, 'node_modules', pkg, 'dist/native.js');
    if (!existsSync(nativeJs)) continue;

    if (data.main === 'dist/native.js') continue; // already patched

    data.main = 'dist/native.js';
    if (data.exports?.['.']) {
        data.exports['.'] = { default: './dist/native.js' };
    }
    writeFileSync(pkgJson, JSON.stringify(data, null, 2) + '\n');
    console.log(`[patch-rollup-wasm] Patched ${pkg} → dist/native.js`);
    patched++;
}

if (patched === 0) {
    console.log('[patch-rollup-wasm] Nothing to patch (already correct or not installed).');
}
