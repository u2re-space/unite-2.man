#!/usr/bin/env node
// Auto-generate AsciiDoc API docs from source tree and strip legacy JSDoc comments.
// - Writes docs to docs/api/<package>/<src-relative>.adoc
// - Removes JSDoc block comments from source files (documentation comments only)

import fs from 'node:fs';
import path from 'node:path';

const repoRoot = process.cwd();
const srcGlobs = [path.join(repoRoot, 'modules')];
const docsRoot = path.join(repoRoot, 'docs', 'api');

/** Utility: ensure directory exists */
function ensureDirSync(dir) {
  fs.mkdirSync(dir, { recursive: true });
}

/** Recursively walk a directory and yield files */
function* walk(dir) {
  const entries = fs.readdirSync(dir, { withFileTypes: true });
  for (const entry of entries) {
    if (entry.name === 'node_modules' || entry.name.startsWith('.')) continue;
    const full = path.join(dir, entry.name);
    if (entry.isDirectory()) {
      yield* walk(full);
    } else {
      yield full;
    }
  }
}

/** Strip only JSDoc-style documentation comments (/** ... *\/) */
function stripJsDocComments(code) {
  // Keep //@ts- comments and regular /* ... */ non-doc blocks; remove only starting with /** not followed by ! (/*! preserved)
  return code.replace(/(^|\s)\/\*\*(?!\!)[\s\S]*?\*\/\s*/g, (m, pre) => pre || '');
}

/** Extract export information with light regex parsing */
function parseExports(code) {
  const info = {
    exports: {
      classes: [],
      functions: [],
      consts: [],
      interfaces: [],
      types: [],
      enums: [],
      star: [],
      namedReexports: [],
      default: null,
    },
    classes: {}, // name -> { methods: string[] }
  };

  const addUnique = (arr, val) => { if (val && !arr.includes(val)) arr.push(val); };

  // default export class/function
  const mDefClass = code.match(/export\s+default\s+class\s+(\w+)/);
  if (mDefClass) { info.exports.default = { kind: 'class', name: mDefClass[1] }; addUnique(info.exports.classes, mDefClass[1]); }
  const mDefFn = code.match(/export\s+default\s+(?:async\s+)?function\s+(\w+)/);
  if (mDefFn && !info.exports.default) { info.exports.default = { kind: 'function', name: mDefFn[1] }; addUnique(info.exports.functions, mDefFn[1]); }

  // classes
  for (const m of code.matchAll(/export\s+class\s+(\w+)/g)) addUnique(info.exports.classes, m[1]);

  // functions
  for (const m of code.matchAll(/export\s+(?:async\s+)?function\s+(\w+)\s*\(([^)]*)\)/g)) {
    info.exports.functions.push({ name: m[1], params: m[2].trim() });
  }

  // consts
  for (const m of code.matchAll(/export\s+const\s+(\w+)\s*[:=]/g)) addUnique(info.exports.consts, m[1]);

  // interfaces, types, enums
  for (const m of code.matchAll(/export\s+interface\s+(\w+)/g)) addUnique(info.exports.interfaces, m[1]);
  for (const m of code.matchAll(/export\s+type\s+(\w+)/g)) addUnique(info.exports.types, m[1]);
  for (const m of code.matchAll(/export\s+enum\s+(\w+)/g)) addUnique(info.exports.enums, m[1]);

  // reexports
  for (const m of code.matchAll(/export\s*\*\s*from\s*['"]([^'"]+)['"]/g)) info.exports.star.push(m[1]);
  for (const m of code.matchAll(/export\s*{\s*([^}]+)\s*}\s*from\s*['"][^'"]+['"]/g)) {
    const names = m[1].split(',').map(s => s.trim()).filter(Boolean);
    info.exports.namedReexports.push(...names);
  }

  // class methods (best effort)
  for (const cname of info.exports.classes) {
    const bodyMatch = code.match(new RegExp(`class\\s+${cname}[^\\{]*\\{([\\s\\S]*?)\\n\\}`, 'm'));
    const body = bodyMatch ? bodyMatch[1] : '';
    const methods = new Set();
    for (const mm of body.matchAll(/\n\s*(?:public|protected|private)?\s*(?:static\s+)?([A-Za-z_][A-Za-z0-9_]*)\s*\(([^)]*)\)\s*\{/g)) {
      const mn = mm[1];
      if (mn === 'constructor') continue;
      methods.add(`${mn}(${mm[2].trim()})`);
    }
    info.classes[cname] = { methods: Array.from(methods) };
  }

  return info;
}

/** Render AsciiDoc for a file */
function renderAsciiDoc(filePath, relPath, info) {
  const title = path.basename(filePath);
  const lines = [];
  lines.push(`= ${title}`);
  lines.push(`:source_path: ${relPath}`);
  lines.push('');
  lines.push('Auto-generated documentation.');
  lines.push('');

  const ex = info.exports;
  lines.push('== Exports');
  if (ex.default) lines.push(`- default: ${ex.default.kind} ${ex.default.name}`);
  if (ex.classes.length) lines.push(`- classes: ${ex.classes.map(n => (typeof n === 'string' ? n : n.name)).join(', ')}`);
  if (ex.functions.length) {
    const fnList = ex.functions.map(f => typeof f === 'string' ? f : `${f.name}(${f.params})`).join(', ');
    lines.push(`- functions: ${fnList}`);
  }
  if (ex.consts.length) lines.push(`- consts: ${ex.consts.join(', ')}`);
  if (ex.interfaces.length) lines.push(`- interfaces: ${ex.interfaces.join(', ')}`);
  if (ex.types.length) lines.push(`- types: ${ex.types.join(', ')}`);
  if (ex.enums.length) lines.push(`- enums: ${ex.enums.join(', ')}`);
  if (ex.namedReexports.length) lines.push(`- reexports: ${ex.namedReexports.join(', ')}`);
  if (ex.star.length) lines.push(`- star reexports from: ${ex.star.join(', ')}`);
  lines.push('');

  // Mermaid class diagrams
  const classNames = ex.classes.filter(c => typeof c === 'string');
  if (classNames.length) {
    for (const cname of classNames) {
      const methods = (info.classes[cname]?.methods || []);
      lines.push(`=== ${cname}`);
      if (methods.length) {
        lines.push('[mermaid]');
        lines.push('....');
        lines.push('classDiagram');
        lines.push(`class ${cname} {`);
        for (const m of methods) lines.push(`  +${m}`);
        lines.push('}');
        lines.push('....');
        lines.push('');
      }
    }
  }

  return lines.join('\n');
}

/** Map a source file to docs output path */
function getDocPath(abs) {
  // Expect pattern: <root>/modules/<pkg>/src/<...>.ts
  const rel = path.relative(path.join(repoRoot, 'modules'), abs);
  const [pkg, ...rest] = rel.split(path.sep);
  const restPath = rest.join(path.sep);
  const outDir = path.join(docsRoot, pkg, 'src', path.dirname(restPath));
  const outFile = path.join(docsRoot, pkg, 'src', restPath.replace(/\.(ts|tsx)$/, '.adoc'));
  return { outDir, outFile, relFromRoot: path.relative(repoRoot, abs) };
}

/** Process a single .ts/.tsx file */
function processFile(abs) {
  const code = fs.readFileSync(abs, 'utf8');
  const isTs = /\.(ts|tsx)$/.test(abs) && !abs.endsWith('.d.ts');
  if (!isTs) return null;

  // Strip JSDoc comments
  const stripped = stripJsDocComments(code);
  if (stripped !== code) {
    fs.writeFileSync(abs, stripped, 'utf8');
  }

  // Parse and render docs
  const info = parseExports(stripped);
  const { outDir, outFile, relFromRoot } = getDocPath(abs);
  ensureDirSync(outDir);
  const adoc = renderAsciiDoc(abs, relFromRoot, info);
  fs.writeFileSync(outFile, adoc, 'utf8');
  return outFile;
}

function main() {
  ensureDirSync(docsRoot);
  const processed = [];
  for (const base of srcGlobs) {
    if (!fs.existsSync(base)) continue;
    for (const file of walk(base)) {
      if (/\.(ts|tsx)$/.test(file) && !/\.d\.ts$/.test(file)) {
        // Only process files inside /src/
        if (!file.split(path.sep).includes('src')) continue;
        const out = processFile(file);
        if (out) processed.push([file, out]);
      }
    }
  }

  // Generate a simple index
  const indexPath = path.join(docsRoot, 'index.adoc');
  const lines = ['= API Documentation', '', 'This index lists generated docs.', ''];
  for (const [, out] of processed.sort((a, b) => a[1].localeCompare(b[1]))) {
    lines.push(`- link:${path.relative(path.join(docsRoot), out).replace(/\\/g, '/') }[]`);
  }
  fs.writeFileSync(indexPath, lines.join('\n'), 'utf8');
  console.log(`Generated ${processed.length} docs. Index: ${path.relative(repoRoot, indexPath)}`);
}

main();


