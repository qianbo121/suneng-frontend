import { readFileSync } from 'node:fs';
import { describe, expect, it } from 'vitest';
import { patchDetailRedirects } from '../../../../scripts/patch-legacy-product-detail-redirects.mjs';

type DetailRoute = { id: string; target: string };
const root = new URL('../../../../', import.meta.url);
const manifest = JSON.parse(readFileSync(new URL('scripts/legacy-product-detail-targets.json', root), 'utf8')) as { routes: DetailRoute[] };
const template = readFileSync(new URL('nginx.prod.conf.template', root), 'utf8');
const productMap = /  map \$arg_id \$legacy_product_path \{\n[\s\S]*?\n  \}\n\n/g;
const categoryMap = /  map \$arg_class2 \$legacy_product_category_path \{\n[\s\S]*?\n  \}\n\n/g;
const newsMap = /  map \$arg_id \$legacy_news_path \{\n[\s\S]*?\n  \}\n\n/g;
const marker = '  map "$request_method:$uri" $lead_event {';
const originalMaps = '  map $arg_id $legacy_product_path {\n    default /zh/products;\n    172 /zh/products/detail/mesh-belt-furnace;\n    185 "/zh/articles/special-industrial-furnace-procurement-assessment#spheroidizing-assessment";\n  }\n\n  map $arg_id $legacy_news_path {\n    default /zh/news;\n    37 /zh/news/mesh-belt-furnace-carbon-cleaning-review;\n  }\n\n';
const base = template.replace(productMap, '').replace(newsMap, '').replace(categoryMap, '').replace(marker, originalMaps + marker);
const reviewedIds = ['126', '127', '128', '129', '130', '131', '133', '134', '135', '190', '191', '192', '197', '198', '199', '200', '201', '202', '203', '204', '229', '230', '231', '232', '233', '234', '235', '236', '237', '238', '239', '240'];

describe('reviewed missing legacy product detail handoffs', () => {
  it('adds the 32 reviewed routes while preserving the existing product and news entries', () => {
    expect(manifest.routes.map(({ id }) => id)).toEqual(reviewedIds);
    expect([...base.matchAll(productMap)]).toHaveLength(1);
    expect([...base.matchAll(newsMap)]).toHaveLength(1);
    const candidate = patchDetailRedirects(base, manifest);
    const added = manifest.routes.map(({ id, target }) => `    ${id} "${target}";\n`).join('');
    expect(candidate.replace(added, '')).toBe(base);
    expect(candidate).toContain('229 "/zh/service/industrial-furnace-parts-purchasing#parts-heating";');
    expect(patchDetailRedirects(candidate, manifest)).toBe(candidate);
  });

  it('refuses missing maps, duplicate IDs, foreign URLs, and conflicting existing targets', () => {
    expect(() => patchDetailRedirects(base.replace(productMap, ''), manifest)).toThrow();
    expect(() => patchDetailRedirects(base, { routes: [manifest.routes[0], manifest.routes[0]] })).toThrow();
    expect(() => patchDetailRedirects(base, { routes: [{ id: '126', target: 'https://example.com' }] })).toThrow();
    expect(() => patchDetailRedirects(base, { routes: [{ id: '172', target: '/zh/products/detail/trolley-furnace' }] })).toThrow();
    expect(() => patchDetailRedirects(base.replace('    172 ', '    172 /zh/products;\n    172 '), manifest)).toThrow();
    expect(() => patchDetailRedirects(base.replace('    172 ', '    126  /zh/products/detail/pit-furnace;\n    172 '), manifest)).toThrow();
    expect(() => patchDetailRedirects(base.replace('    172 ', '\t126 /zh/products/detail/pit-furnace; # existing\n    172 '), manifest)).toThrow();
    expect(() => patchDetailRedirects(base.replace('    172 ', '    "126" /zh/products/detail/pit-furnace;\n    172 '), manifest)).toThrow();
    expect(() => patchDetailRedirects(base.replace('    172 ', '    ~126 /zh/products/detail/pit-furnace;\n    172 '), manifest)).toThrow();
    expect(() => patchDetailRedirects(base.replace('    172 ', '    default /zh/products;\n    172 '), manifest)).toThrow();
    expect(() => patchDetailRedirects(base.replace('  map $arg_id $legacy_product_path {\n', '  map $arg_id $legacy_product_path { default /zh/products;\n'), manifest)).toThrow();
  });
});
