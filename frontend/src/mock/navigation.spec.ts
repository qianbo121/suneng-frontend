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
