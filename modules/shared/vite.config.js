import { resolve } from "node:path";
import { compression } from 'vite-plugin-compression2';

//
import optimizer from 'vite-plugin-optimizer';
import createExternal from "vite-plugin-external";
import deduplicate from "postcss-discard-duplicates";
import postcssPresetEnv from 'postcss-preset-env';
import autoprefixer from "autoprefixer";
import tsconfigPaths from 'vite-tsconfig-paths';
import cssnano from "cssnano";

//
function normalizeAliasPattern(pattern) {
    // Удаляет /*, /**, /**/* с конца строки
    return pattern.replace(/\/\*+$/, '');
}

//
const importFromTSConfig = (tsconfig, __dirname) => {
    const paths = tsconfig?.compilerOptions?.paths || {};
    const alias = [];
    for (const key in paths) {
        const normalizedKey = normalizeAliasPattern(key);
        const target = paths[key][0];
        const normalizedTarget = normalizeAliasPattern(target);
        alias.push({
            find: normalizedKey,
            replacement: resolve(__dirname, normalizedTarget),
        });
    }
    return alias;
};

//
export const initiate = (NAME = "generic", tsconfig = {}, __dirname = resolve("./", import.meta.dirname))=>{
    const $resolve = { alias: importFromTSConfig(tsconfig, __dirname) }
    const terserOptions = {
        ecma: 2020,
        keep_classnames: false,
        keep_fnames: false,
        module: true,
        toplevel: true,
        mangle: {
            eval: true,
            keep_classnames: false,
            keep_fnames: false,
            module: true,
            toplevel: true,
            properties: {
                builtins: true,
                keep_quoted: "strict",
                undeclared: true,
                only_annotated: true,
                reserved: ["register", "resolve", "reject", "undefined"]
            }
        },
        compress: {
            ecma: 2020,
            keep_classnames: false,
            keep_fnames: false,
            keep_infinity: false,
            reduce_vars: true,
            reduce_funcs: true,
            pure_funcs: [],
            arguments: true,
            expression: true,
            inline: 3,
            module: true,
            passes: 3,
            side_effects: true,
            pure_getters: true,
            typeofs: true,
            toplevel: true,
            unsafe: true,
            unsafe_Function: true,
            unsafe_comps: true,
            unsafe_arrows: true,
            unsafe_math: true,
            unsafe_symbols: true,
            unsafe_undefined: true,
            unsafe_methods: true,
            unsafe_regexp: true,
            unsafe_proto: true,
            warnings: true,
            unused: true,
            booleans_as_integers: true,
            hoist_funs: true,
            hoist_vars: true,
            properties: true,
            // don't use in debug mode
            //drop_console: true
        },
        format: {
            braces: false,
            comments: false,
            ecma: 2020,
            //indent_level: 0,
            semicolons: true,
            shebang: true,
            inline_script: true,
            quote_style: 0,
            wrap_iife: true,
            ascii_only: true,
        }
    };

    //
    const plugins = [
        tsconfigPaths({
            projects: [resolve(__dirname, './tsconfig.json')],
        }),
        optimizer({}),
        compression(),
        createExternal({
            interop: 'auto',
            externals: { "externals": "externals", "dist": "dist", "fest": "fest", "fest-src": "fest-src" },
            externalizeDeps: [
                "externals", "/externals", "./externals",
                "dist", "/dist", "./dist",
                "fest", "../"
            ]
        }),
    ];

    //
    const rollupOptions = {
        plugins,
        treeshake: 'smallest',
        input: "./src/index.ts",
        external: (source) => {
            if (source.startsWith("/externals") || source.startsWith("fest")) return true;
            return false;
        },/*
        external: [
            "externals", "/externals", "./externals",
            "dist", "/dist", "./dist",
            "fest", "../"
        ],*/

        output: {
            compact: true,
            globals: {},
            format: 'es',
            name: NAME,
            dir: './dist',
            exports: "auto",
            minifyInternalExports: true,
            experimentalMinChunkSize: 500_500,
            inlineDynamicImports: true,
        }
    };

    //
    const css = {
        postcss: {
            plugins: [
                deduplicate(),
                autoprefixer(),
                cssnano({
                    preset: ['advanced', {
                        calc: false,
                        layer: false,
                        scope: false,
                        discardComments: {
                            removeAll: true
                        }
                }],
            }), postcssPresetEnv({
                features: { 'nesting-rules': false },
                stage: 0
            })],
        },
    }

    //
    const optimizeDeps = {
        include: [
            "./node_modules/**/*.mjs",
            "./node_modules/**/*.js",
            "./node_modules/**/*.ts",
            "./src/**/*.mjs",
            "./src/**/*.js",
            "./src/**/*.ts",
            "./src/*.mjs",
            "./src/*.js",
            "./src/*.ts",
            "./test/*.mjs",
            "./test/*.js",
            "./test/*.ts"
        ],
        entries: [resolve(__dirname, './src/index.ts'),],
        force: true
    }

    //
    const server = {
        port: 5173,
        open: false,
        origin: "http://localhost:5173",
        fs: {
            allow: ['..', resolve(__dirname, '../') ]
        },
    };

    //
    const build = {
        chunkSizeWarningLimit: 1600,
        assetsInlineLimit: 1024 * 1024,
        minify: false,///"terser",
        emptyOutDir: true,
        sourcemap: 'hidden',
        target: "esnext",
        rollupOptions,
        terserOptions,
        name: NAME,
        lib: {
            formats: ["es"],
            entry: resolve(__dirname, './src/index.ts'),
            name: NAME,
            fileName: NAME,
        },
    }

    //
    return {rollupOptions, plugins, resolve: $resolve, build, css, optimizeDeps, server};
}

//
export default initiate;
