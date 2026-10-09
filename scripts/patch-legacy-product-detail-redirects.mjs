import { readFileSync, writeFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import path from 'node:path';

const detailMap = /(  map \$arg_id \$legacy_product_path \{\n)([\s\S]*?)(  \}\n)/g;

export function patchDetailRedirects(source, manifest) {
  if (!Array.isArray(manifest.routes) || !manifest.routes.length) throw new Error('Expected reviewed detail routes');
  const ids = new Set();
  for (const { id, target } of manifest.routes) {
    if (!/^[1-9]\d*$/.test(id) || ids.has(id)) throw new Error('Invalid or duplicate detail ID');
    if (!/^\/zh\/[a-z0-9/_-]+(?:#[a-z0-9_-]+)?$/.test(target)) throw new Error('Invalid local detail target');
    ids.add(id);
  }
  const maps = [...source.matchAll(detailMap)];
  const definitions = [...source.matchAll(/\bmap\s+[^{};]+?\s+\$legacy_product_path\s*\{/g)];
  if (definitions.length !== maps.length) throw new Error('Unexpected product detail map format or source variable; review before patching');
  if (maps.length !== 1) throw new Error('Expected one existing production product detail map; never replace it with a generic fallback');
  const [, opening, body, closing] = maps[0];
  if (!/^    default \/zh\/products;$/m.test(body)) throw new Error('Unexpected detail fallback; review before patching');
  const existing = new Map();
  let defaults = 0;
  for (const line of body.split('\n')) {
    if (!line.trim() || line.trimStart().startsWith('#')) continue;
    if (/^[ \t]*default[ \t]+\/zh\/products;[ \t]*(?:#[^\n]*)?$/.test(line)) {
      defaults++;
      continue;
    }
    const match = line.match(/^[ \t]*(\d+)[ \t]+(?:"([^"\n]+)"|([^;\s]+))[ \t]*;[ \t]*(?:#[^\n]*)?$/);
    if (!match) throw new Error('Unsupported existing detail mapping; review before patching');
    if (existing.has(match[1])) throw new Error('Duplicate existing detail ID');
    existing.set(match[1], match[2] ?? match[3]);
  }
  if (defaults !== 1) throw new Error('Expected one existing detail fallback');
  const additions = [];
  for (const { id, target } of manifest.routes) {
    if (existing.has(id)) {
      if (existing.get(id) !== target) throw new Error(`Existing target differs for detail ${id}; review before replacing`);
    } else {
      additions.push(`    ${id} "${target}";\n`);
    }
  }
  return source.replace(maps[0][0], opening + body + additions.join('') + closing);
}

if (process.argv[1] && path.resolve(process.argv[1]) === fileURLToPath(import.meta.url)) {
  const [, , sourceFile, outputFile] = process.argv;
  if (!sourceFile || !outputFile || path.resolve(sourceFile) === path.resolve(outputFile)) {
    throw new Error('Usage: node patch-legacy-product-detail-redirects.mjs SOURCE DISTINCT_OUTPUT');
  }
  const manifest = JSON.parse(readFileSync(new URL('./legacy-product-detail-targets.json', import.meta.url), 'utf8'));
  writeFileSync(outputFile, patchDetailRedirects(readFileSync(sourceFile, 'utf8'), manifest), { flag: 'wx' });
  console.log(`Prepared ${manifest.routes.length} reviewed missing detail routes; every existing route retained and source unchanged.`);
}
