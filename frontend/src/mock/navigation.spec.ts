import { describe, expect, it } from 'vitest';

import { getLocalizedNavigation, getRouteLabelMap } from '@/mock/navigation';
import { PUBLIC_CASE_SLUGS } from '@/lib/cases/public-case-allowlist';

describe('localized primary navigation', () => {
  it('starts Chinese navigation with the homepage before the public hubs', () => {
    expect(getLocalizedNavigation('zh').map((item) => item.key)).toEqual([
      'home',
      'products',
      'engineering',
      'resources',
      'about',
    ]);
    expect(getLocalizedNavigation('zh').every((item) => !item.href.includes('#'))).toBe(true);
  });

  // A single approved case cannot carry a top-level menu. The page stays
  // published, so its breadcrumb still needs the hub's name in both languages.
  it('leaves the case hub out of both menus while it keeps its breadcrumb name', () => {
    for (const locale of ['zh', 'en'] as const)
      expect(getLocalizedNavigation(locale).filter((item) => item.key === 'cases')).toEqual([]);
    expect(getRouteLabelMap('zh').get('/case')).toBe('项目案例');
    expect(getRouteLabelMap('en').get('/case')).toBe('Project Cases');
  });

  it('keeps existing page breadcrumb names when menus are renamed or removed', () => {
    const labels = getRouteLabelMap('zh');
    expect(labels.get('/products')).toBe('产品中心');
    expect(labels.get('/solutions')).toBe('解决方案');
    expect(labels.get('/service')).toBe('改造与工程服务');
    expect(labels.get('/case/henan-annealing-solution-line')).toBe('连续退火固溶生产线');
  });

  it('names no unapproved case page in the shared label table', () => {
    for (const locale of ['zh', 'en'] as const)
      for (const href of getRouteLabelMap(locale).keys())
        if (href.startsWith('/case/')) expect(PUBLIC_CASE_SLUGS.has(href.slice('/case/'.length)), href).toBe(true);
  });

  it('uses the current Chinese hierarchy for both languages, including service children', () => {
    const shape = (locale: 'zh' | 'en') => getLocalizedNavigation(locale).map((item) => ({
      key: item.key, href: item.href,
      children: item.children?.map((child) => ({ key: child.key, href: child.href.replace(/^\/zh/, '') })),
    }));
    expect(shape('en')).toEqual(shape('zh'));
    expect(getLocalizedNavigation('en').map((item) => item.labelText)).toEqual([
      'Home', 'Furnaces & Lines', 'Retrofit & Services', 'Technical Resources', 'About Suneng',
    ]);
    expect(getRouteLabelMap('en').get('/case')).toBe('Project Cases');
  });

  it('labels the actual Chinese partner page instead of linking to a nonexistent English page', () => {
    const partner = getLocalizedNavigation('en').find((item) => item.key === 'about')?.children?.find((item) => item.key === 'about-partner');
    expect(partner).toMatchObject({ href: '/zh/partner', labelText: 'Partners (Chinese)' });

  });
});
