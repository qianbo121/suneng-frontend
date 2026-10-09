import { readFileSync } from 'node:fs';
import { describe, expect, it } from 'vitest';

import { patchCategoryRedirects, renderCategoryMap } from '../../../../scripts/patch-legacy-product-category-redirects.mjs';

type CategoryRoute = { category: string; target: string };
const root = new URL('../../../../', import.meta.url);
const template = readFileSync(new URL('nginx.prod.conf.template', root), 'utf8');
const manifest = JSON.parse(readFileSync(new URL('scripts/legacy-product-category-targets.json', root), 'utf8')) as { defaultTarget: string; routes: CategoryRoute[] };
const target = '/zh/articles/special-industrial-furnace-procurement-assessment#spheroidizing-assessment';
const productMap = /  map \$arg_id \$legacy_product_path \{\n[\s\S]*?\n  \}\n\n/g;
const newsMap = /  map \$arg_id \$legacy_news_path \{\n[\s\S]*?\n  \}\n\n/g;

describe('reviewed legacy product category redirects', () => {
  it('routes all eight categories separately from product detail IDs in the three public listeners', () => {
    expect(renderCategoryMap(manifest)).toContain(`172 "${target}";`);
    expect(renderCategoryMap(manifest)).toContain('173 "/zh/articles/special-industrial-furnace-procurement-assessment#stainless-annealing-pickling-assessment";');
    expect(template).toContain(renderCategoryMap(manifest));
    // Six path handlers are three public listeners times category and pagination paths.
    expect(template.match(/return 301 https:\/\/www\.jssngyl\.cn\$legacy_product_category_path;/g)).toHaveLength(6);
    expect(template.match(/location = \/product\/ \{/g)).toHaveLength(3);
    expect(manifest.routes.map(({ category }) => category)).toEqual(['136', '137', '139', '170', '171', '172', '173', '174']);
    expect(template).not.toMatch(/map \$arg_id \$legacy_product_category_path/);
    expect(renderCategoryMap(manifest)).toContain('default /zh/products;');
  });

  it('preserves unique existing product and news maps and every unrelated byte', () => {
    const map = renderCategoryMap(manifest);
    const marker = '  map "$request_method:$uri" $lead_event {';
    const originalMaps = '  map $arg_id $legacy_product_path {\n    default /zh/products;\n    172 /zh/products/detail/mesh-belt-furnace;\n    185 "' + target + '";\n  }\n\n  map $arg_id $legacy_news_path {\n    default /zh/news;\n    37 /zh/news/mesh-belt-furnace-carbon-cleaning-review;\n  }\n\n';
    const base = template.replace(productMap, '').replace(newsMap, '').replace(map, '')
      .replace(marker, originalMaps + marker)
      .replaceAll('https://www.jssngyl.cn$legacy_product_category_path', 'https://www.jssngyl.cn/zh/products');
    expect([...base.matchAll(productMap)]).toHaveLength(1);
    expect([...base.matchAll(newsMap)]).toHaveLength(1);
    const patched = patchCategoryRedirects(base, manifest);
    expect(patched).toContain(originalMaps);
    expect(patched.replace(map, '').replaceAll('https://www.jssngyl.cn$legacy_product_category_path', 'https://www.jssngyl.cn/zh/products')).toBe(base);
    expect(patchCategoryRedirects(patched, manifest)).toBe(patched);
  });

  it('refuses unreviewed targets, duplicate categories, and unexpected existing rules', () => {
    const map = renderCategoryMap(manifest);
    expect(() => renderCategoryMap({ ...manifest, routes: [{ category: '172', target: 'https://example.com' }] })).toThrow();
    expect(() => renderCategoryMap({ ...manifest, routes: [manifest.routes[0], manifest.routes[0]] })).toThrow();
    expect(() => patchCategoryRedirects(template.replace(map, map.replace('default /zh/products;', 'default /zh;')), manifest)).toThrow();
    expect(() => patchCategoryRedirects(template.replaceAll('https://www.jssngyl.cn$legacy_product_category_path', '/zh'), manifest)).toThrow();
    expect(() => patchCategoryRedirects(template.replace('location = /product/index.php {', 'location = /product/obsolete.php {'), manifest)).toThrow();
    expect(() => patchCategoryRedirects(template.replace(map, '  map $arg_class2 $legacy_product_category_path { default /zh/products; }\n\n'), manifest)).toThrow();
    expect(() => patchCategoryRedirects(template.replace('location = /product/index.php {', 'location  = /product/index.php {'), manifest)).toThrow();
  });
});
