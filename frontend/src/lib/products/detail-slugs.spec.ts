import { describe, expect, it } from 'vitest';
import { STATIC_PRODUCTS, getStaticProductBySlug } from '@/constants/static-products';
import { heatTreatmentLines } from '@/lib/heat-treatment-lines';
import { additionalFurnaces } from '@/lib/additional-furnaces';
import { PRODUCT_DETAIL_SLUGS, isUnknownProductDetailPath } from './detail-slugs';

describe('product detail slugs', () => {
  // The guard that keeps the middleware list honest: a product added to the
  // catalogue but missing here would have its own page answered with a 404.
  it('lists exactly the slugs the catalogue builds pages for', () => {
    const built = new Set([
      ...additionalFurnaces.map((furnace) => furnace.id),
      ...STATIC_PRODUCTS.map((product) => product.slug),
      ...heatTreatmentLines.filter((line) => !getStaticProductBySlug(line.slug)).map((line) => line.slug),
    ]);
    expect([...PRODUCT_DETAIL_SLUGS].sort()).toEqual([...built].sort());
  });

  it.each(['/zh/products/detail/no-such-furnace', '/en/products/detail/no-such-furnace', '/zh/products/detail/no-such-furnace/', '/ZH/products/detail/no-such-furnace'])(
    'treats %s as unknown',
    (path) => expect(isUnknownProductDetailPath(path)).toBe(true),
  );

  it.each([
    '/zh/products/detail/trolley-furnace',
    '/en/products/detail/trolley-furnace',
    '/zh/products/detail/cylinder-curing-line',
    // Nested and list routes are not this check's business.
    '/zh/products/detail/copper-wire-annealing-line/inquiry-checklist',
    '/zh/products',
    '/zh/products/detail',
    '/zh/news/anything',
  ])('leaves %s alone', (path) => expect(isUnknownProductDetailPath(path)).toBe(false));
});
