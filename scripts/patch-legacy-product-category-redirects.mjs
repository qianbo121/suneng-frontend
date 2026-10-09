import { readFileSync, writeFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import path from 'node:path';

const variable = '$legacy_product_category_path';
const marker = '  map "$request_method:$uri" $lead_event {';
const categoryBlock = /  map \$arg_class2 \$legacy_product_category_path \{\n[\s\S]*?\n  \}\n\n/g;
const categoryLocation = /(\n[ \t]*location = \/product\/(?:product|index)\.php \{)\n[ \t]*return 301 ([^;\n]+);\n([ \t]*\})/g;
const mainCategoryLocation = /(\n)([ \t]*)(location = \/product\/product\.php \{)/g;

function addMissingPublicAlias(source, locationPath, target) {
  const count = source.split(`location = ${locationPath} {`).length - 1;
  if (count === 3) return source;
  if (count !== 0) throw new Error(`Unexpected public alias count for ${locationPath}`);
  return source.replace(mainCategoryLocation, (_, newline, indent, opening) =>
    `${newline}${indent}location = ${locationPath} {\n${indent}  return 301 ${target};\n${indent}}\n\n${indent}${opening}`);
}

export function renderCategoryMap(manifest) {
  if (manifest.defaultTarget !== '/zh/products' || !Array.isArray(manifest.routes)) {
    throw new Error('Invalid reviewed category manifest');
  }
  const ids = new Set();
  const lines = manifest.routes.map(({ category, target }) => {
    if (!/^[1-9]\d*$/.test(category) || ids.has(category)) {
      throw new Error(`Invalid or duplicate category: ${category}`);
    }
    if (!/^\/zh\/[a-z0-9/_-]+(?:#[a-z0-9_-]+)?$/.test(target)) {
      throw new Error(`Invalid local destination for category ${category}`);
    }
    ids.add(category);
    return `    ${category} "${target}";`;
  });
  return `  map $arg_class2 ${variable} {\n    default /zh/products;\n${lines.join('\n')}\n  }\n\n`;
}

export function patchCategoryRedirects(source, manifest) {
  const map = renderCategoryMap(manifest);
  const existing = [...source.matchAll(categoryBlock)];
  const definitions = [...source.matchAll(/\bmap\s+[^{};]+?\s+\$legacy_product_category_path\s*\{/g)];
  if (definitions.length !== existing.length) throw new Error('Unexpected category map format or source variable; review before patching');
  if (existing.length > 1) throw new Error('Duplicate category maps');
  for (const locationPath of ['/product/product.php', '/product/index.php', '/product/']) {
    const escaped = locationPath.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
    const all = [...source.matchAll(new RegExp(`\\blocation\\s*=\\s*${escaped}\\s*\\{`, 'g'))];
    const canonical = source.split(`location = ${locationPath} {`).length - 1;
    if (all.length !== canonical) throw new Error(`Unexpected existing alias format for ${locationPath}`);
  }
  let candidate = source;
  if (existing.length) {
    if (existing[0][0] !== map) {
      throw new Error('Category map already differs; review it before replacing');
    }
  } else {
    if (source.split(marker).length !== 2) throw new Error('Expected one HTTP insertion marker');
    candidate = candidate.replace(marker, map + marker);
  }
  candidate = addMissingPublicAlias(candidate, '/product/index.php', 'https://www.jssngyl.cn/zh/products');
  candidate = addMissingPublicAlias(candidate, '/product/', 'https://www.jssngyl.cn/zh/products');
  const totalAliases = [...candidate.matchAll(/location = \/product\/ \{\n[ \t]*return 301 https:\/\/www\.jssngyl\.cn\/zh\/products;\n[ \t]*\}/g)];
  if (totalAliases.length !== 3) throw new Error('Unexpected existing product root alias; review before replacing');
  let count = 0;
  candidate = candidate.replace(categoryLocation, (block, opening, target, closing) => {
    if (!['/zh/products', 'https://www.jssngyl.cn/zh/products', `https://www.jssngyl.cn${variable}`].includes(target)) {
      throw new Error('Category location already differs; review it before replacing');
    }
    count++;
    const indent = closing.match(/^[ \t]*/)[0] + '  ';
    return `${opening}\n${indent}return 301 https://www.jssngyl.cn${variable};\n${closing}`;
  });
  if (count !== 6) throw new Error(`Expected six public category and pagination locations, found ${count}`);
  return candidate;
}

if (process.argv[1] && path.resolve(process.argv[1]) === fileURLToPath(import.meta.url)) {
  const [, , sourceFile, outputFile] = process.argv;
  if (!sourceFile || !outputFile || path.resolve(sourceFile) === path.resolve(outputFile)) {
    throw new Error('Usage: node patch-legacy-product-category-redirects.mjs SOURCE DISTINCT_OUTPUT');
  }
  const manifest = JSON.parse(readFileSync(new URL('./legacy-product-category-targets.json', import.meta.url), 'utf8'));
  const candidate = patchCategoryRedirects(readFileSync(sourceFile, 'utf8'), manifest);
  writeFileSync(outputFile, candidate, { flag: 'wx' });
  console.log(`Prepared ${manifest.routes.length} reviewed categories and their pagination aliases in three public listeners; old product root restored; source unchanged.`);
}
