import { describe, expect, it } from 'vitest';

import { buildHomeFurnaceProducts } from '@/components/home/HotProducts';

describe('buildHomeFurnaceProducts', () => {
  it('merges CMS hot products into known furnace cards by slug', () => {
    const cards = buildHomeFurnaceProducts([
      {
        id: 66,
        slug: 'box-furnace',
        name: { zh: 'CMS 箱式炉', en: 'CMS Box Furnace' },
        model: 'CMS-BOX',
        image: '/uploads/box-hot.png',
      },
    ]);

    expect(cards[0]).toMatchObject({
      id: 66,
      slug: 'box-furnace',
      name: { zh: 'CMS 箱式炉', en: 'CMS Box Furnace' },
      model: 'CMS-BOX',
      image: '/uploads/box-hot.png',
    });
  });

  it('does not append CMS-only products that have no static detail page', () => {
    const cards = buildHomeFurnaceProducts([
      {
        id: 77,
        slug: 'cms-only-product',
        name: { zh: '后台新增产品', en: 'CMS-only Product' },
        model: 'CMS-ONLY',
        image: '/uploads/only.png',
      },
    ]);

    expect(cards.some((item) => item.slug === 'cms-only-product')).toBe(false);
  });
});
