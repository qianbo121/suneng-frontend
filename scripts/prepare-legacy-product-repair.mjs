import { readFileSync, writeFileSync, mkdirSync, realpathSync } from 'node:fs';
import { createHash } from 'node:crypto';
import { fileURLToPath } from 'node:url';
import path from 'node:path';
import { patchCategoryRedirects, renderCategoryMap } from './patch-legacy-product-category-redirects.mjs';
import { patchDetailRedirects } from './patch-legacy-product-detail-redirects.mjs';

const locations = /(\n[ \t]*location = (\/product\/(?:product\.php|index\.php)?) \{)\n[ \t]*return 301 [^;\n]+;\n[ \t]*\}/g;
const productMap = /  map \$arg_id \$legacy_product_path \{\n[\s\S]*?\n  \}/g;
const sha = (text) => createHash('sha256').update(text).digest('hex');

export function prepareLegacyProductRepair(source, categories, details) {
  const beforeMaps = [...source.matchAll(productMap)];
  if (beforeMaps.length !== 1) throw new Error('Use an existing production configuration with its complete detail map');
  const beforeProductMap = beforeMaps[0][0];
  const knownIds = new Set([...beforeProductMap.matchAll(/^[ \t]*(\d+)[ \t]+/gm)].map((match) => match[1]));
  const candidate = patchCategoryRedirects(patchDetailRedirects(source, details), categories);
  let restored = candidate;
  const categoryMap = renderCategoryMap(categories);
  if (!source.includes(categoryMap)) restored = restored.replace(categoryMap, '');
  for (const alias of ['/product/index.php', '/product/']) {
    if (!source.includes(`location = ${alias} {`)) {
      const escaped = alias.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
      restored = restored.replace(new RegExp(`^[ \\t]*location = ${escaped} \\{\\n[ \\t]*return 301 [^;\\n]+;\\n[ \\t]*\\}\\n\\n`, 'gm'), '');
    }
  }
  const beforeLocations = new Map();
  for (const match of source.matchAll(locations)) {
    const list = beforeLocations.get(match[2]) ?? [];
    list.push(match[0]);
    beforeLocations.set(match[2], list);
  }
  const counters = new Map();
  restored = restored.replace(locations, (block, opening, route) => {
    const index = counters.get(route) ?? 0;
    counters.set(route, index + 1);
    const original = beforeLocations.get(route)?.[index];
    if (!original) throw new Error('Unexpected repaired location');
    return original;
  });
  for (const { id, target } of details.routes) {
    if (!knownIds.has(id)) {
      const line = `    ${id} "${target}";\n`;
      if (restored.split(line).length !== 2) throw new Error('Unexpected detail addition');
      restored = restored.replace(line, '');
    }
  }
  if (restored !== source) throw new Error('Unrelated configuration changed; candidate refused');
  if (patchCategoryRedirects(patchDetailRedirects(candidate, details), categories) !== candidate) throw new Error('Candidate is not idempotent');
  return {
    candidate,
    receipt: {
      sourceSha256: sha(source), candidateSha256: sha(candidate),
      originalProductMappingsPreserved: knownIds.size,
      addedDetailIds: details.routes.filter(({ id }) => !knownIds.has(id)).map(({ id }) => id),
      reviewedCategories: categories.routes.map(({ category }) => category),
      allUnrelatedBytesPreserved: true, idempotent: true,
      environmentSubstitutionRequired: /\$(?:\{(?:DOMAIN|ADMIN_DOMAIN)\}|(?:DOMAIN|ADMIN_DOMAIN)\b)/.test(candidate),
      runtimeValidated: false, appliedToServer: false,
    },
  };
}

if (process.argv[1] && path.resolve(process.argv[1]) === fileURLToPath(import.meta.url)) {
  const [, , sourcePath, newDirectory] = process.argv;
  if (!sourcePath || !newDirectory) throw new Error('Usage: node prepare-legacy-product-repair.mjs SOURCE NEW_DIRECTORY');
  const source = readFileSync(realpathSync(sourcePath), 'utf8');
  const categories = JSON.parse(readFileSync(new URL('./legacy-product-category-targets.json', import.meta.url), 'utf8'));
  const details = JSON.parse(readFileSync(new URL('./legacy-product-detail-targets.json', import.meta.url), 'utf8'));
  const prepared = prepareLegacyProductRepair(source, categories, details);
  mkdirSync(newDirectory);
  const output = realpathSync(newDirectory);
  writeFileSync(path.join(output, 'source.conf'), source, { flag: 'wx' });
  writeFileSync(path.join(output, 'candidate.conf'), prepared.candidate, { flag: 'wx' });
  writeFileSync(path.join(output, 'receipt.json'), JSON.stringify(prepared.receipt, null, 2) + '\n', { flag: 'wx' });
  console.log('Prepared reviewed category, pagination, detail and catalogue repair; source untouched and no server apply performed.');
}
