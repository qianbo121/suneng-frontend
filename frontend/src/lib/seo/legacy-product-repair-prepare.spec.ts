import { readFileSync } from 'node:fs';
import { describe, expect, it } from 'vitest';
import { prepareLegacyProductRepair } from '../../../../scripts/prepare-legacy-product-repair.mjs';
import { renderCategoryMap } from '../../../../scripts/patch-legacy-product-category-redirects.mjs';

type CategoryRoute = { category: string; target: string };
type DetailRoute = { id: string; target: string };
const root = new URL('../../../../', import.meta.url);
const categories = JSON.parse(readFileSync(new URL('scripts/legacy-product-category-targets.json', root), 'utf8')) as { defaultTarget: string; routes: CategoryRoute[] };
const details = JSON.parse(readFileSync(new URL('scripts/legacy-product-detail-targets.json', root), 'utf8')) as { routes: DetailRoute[] };
const local = readFileSync(new URL('nginx.prod.conf.template', root), 'utf8');
const productMap = /  map \$arg_id \$legacy_product_path \{\n[\s\S]*?\n  \}\n\n/g;
const newsMap = /  map \$arg_id \$legacy_news_path \{\n[\s\S]*?\n  \}\n\n/g;
const marker = '  map "$request_method:$uri" $lead_event {';
const legacy = '  map $arg_id $legacy_product_path {\n    default /zh/products;\n    172 /zh/products/detail/mesh-belt-furnace;\n  }\n\n  map $arg_id $legacy_news_path {\n    default /zh/news;\n    37 /zh/news/mesh-belt-furnace-carbon-cleaning-review;\n  }\n\n';
const base = local.replace(productMap, '').replace(newsMap, '').replace(renderCategoryMap(categories), '')
  .replace(marker, legacy + marker)
  .replaceAll('https://www.jssngyl.cn$legacy_product_category_path', 'https://www.jssngyl.cn/zh/products');

describe('production-preserving legacy repair preparation', () => {
  it('prepares one combined candidate from unique synthetic maps without changing unrelated bytes', () => {
    expect([...base.matchAll(productMap)]).toHaveLength(1);
    expect([...base.matchAll(newsMap)]).toHaveLength(1);
    const result = prepareLegacyProductRepair(base, categories, details);
    expect(result.receipt.originalProductMappingsPreserved).toBe(1);
    expect(result.receipt.addedDetailIds).toEqual(details.routes.map(({ id }) => id));
    expect(result.receipt.reviewedCategories).toEqual(['136', '137', '139', '170', '171', '172', '173', '174']);
    expect(result.receipt.allUnrelatedBytesPreserved).toBe(true);
    expect(result.receipt.appliedToServer).toBe(false);
    expect(result.candidate).toContain(legacy.split('  map $arg_id $legacy_news_path')[1]);
    const again = prepareLegacyProductRepair(result.candidate, categories, details);
    expect(again.candidate).toBe(result.candidate);
    expect(again.receipt.addedDetailIds).toEqual([]);
  });

  it('retains all 92 original product mappings and nine news mappings when preparing the 124-entry candidate', () => {
    const original = local.replace(renderCategoryMap(categories), '')
      .replaceAll('https://www.jssngyl.cn$legacy_product_category_path', 'https://www.jssngyl.cn/zh/products')
      .replace(productMap, (block) => details.routes.reduce((text, { id, target }) => text.replace(`    ${id} "${target}";\n`, ''), block));
    const result = prepareLegacyProductRepair(original, categories, details);
    expect(result.receipt.originalProductMappingsPreserved).toBe(92);
    expect(result.receipt.addedDetailIds).toHaveLength(32);
    expect(result.candidate).toBe(local);
    const actualProductMap = [...result.candidate.matchAll(productMap)];
    const originalNewsMap = [...original.matchAll(newsMap)];
    expect(actualProductMap).toHaveLength(1);
    expect(actualProductMap[0][0].match(/^\s+\d+\s/gm)).toHaveLength(124);
    expect(originalNewsMap).toHaveLength(1);
    expect(originalNewsMap[0][0].match(/^\s+\d+\s/gm)).toHaveLength(9);
    expect(result.candidate).toContain(originalNewsMap[0][0]);
    expect(result.receipt.allUnrelatedBytesPreserved).toBe(true);
  });

  it('refuses an explicitly map-less configuration and conflicting existing product mappings', () => {
    const withoutProductMap = local.replace(productMap, '');
    expect([...withoutProductMap.matchAll(productMap)]).toHaveLength(0);
    expect(() => prepareLegacyProductRepair(withoutProductMap, categories, details)).toThrow();
    expect(() => prepareLegacyProductRepair(base.replace('    172 ', '    126  /zh/products/detail/pit-furnace;\n    172 '), categories, details)).toThrow();
  });
});
