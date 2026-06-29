import { describe, expect, it, vi } from 'vitest';

vi.mock('react', () => ({
  cache: <T extends (...args: never[]) => unknown>(fn: T) => fn,
}));

import {
  mapBannerItems,
  mapHotProductItems,
  mapPartnerItems,
  mapProductCategoryItems,
} from '@/lib/home';

describe('home CMS adapters', () => {
  it('maps CMS banners into homepage banner items without losing fallback CTA copy', () => {
    const [banner] = mapBannerItems([
      {
        id: 9,
        sectionKey: 'HOME',
        titleZh: '首页主标题',
        titleEn: 'Homepage title',
        subtitleZh: '首页副标题',
        subtitleEn: 'Homepage subtitle',
        imageUrl: '/uploads/banner.png',
        linkUrl: '/products',
      },
    ]);

    expect(banner).toMatchObject({
      id: 9,
      eyebrow: 'HOME',
      title: { zh: '首页主标题', en: 'Homepage title' },
      subtitle: { zh: '首页副标题', en: 'Homepage subtitle' },
      ctaHref: '/products',
    });
    expect(banner.ctaLabel.zh).toBeTruthy();
  });

  it('maps CMS product categories and falls back to a local image when CMS has none', () => {
    const [category] = mapProductCategoryItems([
      {
        id: 3,
        nameZh: '连续热处理线',
        nameEn: 'Continuous Heat Treatment Line',
        slug: 'continuous-line',
      },
    ]);

    expect(category.name).toEqual({
      zh: '连续热处理线',
      en: 'Continuous Heat Treatment Line',
    });
    expect(category.image).toBeTruthy();
  });

  it('extracts hot product image candidates from CMS JSON', () => {
    const [product] = mapHotProductItems([
      {
        id: 6,
        nameZh: '箱式炉',
        nameEn: 'Box Furnace',
        model: 'BX-900',
        slug: 'box-furnace',
        imagesJson: [{ url: '/uploads/box.png' }],
      },
    ]);

    expect(product).toMatchObject({
      id: 6,
      slug: 'box-furnace',
      model: 'BX-900',
      image: '/uploads/box.png',
    });
  });

  it('maps partner logos from CMS payloads', () => {
    const [partner] = mapPartnerItems([{ id: 1, name: '客户 A', logoUrl: '/uploads/a.png' }]);

    expect(partner).toEqual({
      id: 1,
      name: '客户 A',
      logo: '/uploads/a.png',
      shortName: '客户 A',
    });
  });
});
