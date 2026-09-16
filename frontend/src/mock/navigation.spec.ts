import { describe, expect, it } from 'vitest';

import { getLocalizedNavigation, getRouteLabelMap } from '@/mock/navigation';

describe('localized primary navigation', () => {
  it('starts Chinese navigation with the homepage before the four public hubs', () => {
    expect(getLocalizedNavigation('zh').map((item) => item.key)).toEqual([
      'home',
      'products',
      'engineering',
      'resources',
      'about',
    ]);
    expect(getLocalizedNavigation('zh').every((item) => !item.href.includes('#'))).toBe(true);
  });

  it('keeps existing page breadcrumb names when menus are renamed or removed', () => {
    const labels = getRouteLabelMap('zh');
    expect(labels.get('/products')).toBe('产品中心');
    expect(labels.get('/solutions')).toBe('解决方案');
    expect(labels.get('/service')).toBe('改造与工程服务');
    expect(labels.get('/case/jining-support-roller-heat-treatment-line')).toBe(
      '支重轮热处理生产线',
    );
  });

  it('links the completed English hubs with localized navigation labels', () => {
    const english = getLocalizedNavigation('en');
    for (const [key, href, labelText] of [
      ['resources', '/news', 'Resources'],
    ]) {
      expect(english.filter((item) => item.key === key)).toEqual([
        expect.objectContaining({ href, labelText }),
      ]);
      expect(getRouteLabelMap('en').get(href)).toBe(labelText);
    }
    expect(getLocalizedNavigation('zh').find((item) => item.key === 'resources'))
      .toMatchObject({ href: '/news', labelText: '技术资料' });
  });
});
