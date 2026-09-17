import { describe, expect, it } from 'vitest';

import { getLocalizedNavigation, getRouteLabelMap } from '@/mock/navigation';
import { PUBLIC_CASE_SLUGS } from '@/lib/cases/public-case-allowlist';

describe('localized primary navigation', () => {
  it('starts Chinese navigation with the homepage before the public hubs, including approved cases', () => {
    expect(getLocalizedNavigation('zh').map((item) => item.key)).toEqual([
      'home',
      'products',
      'engineering',
      'cases',
      'resources',
      'about',
    ]);
    expect(getLocalizedNavigation('zh').every((item) => !item.href.includes('#'))).toBe(true);
    expect(getLocalizedNavigation('zh').find((item) => item.key === 'cases')).toMatchObject({ href: '/case', labelText: '项目案例' });
  });

  it('shows the English case hub only because an English case page is approved', () => {
    const cases = getLocalizedNavigation('en').filter((item) => item.key === 'cases');
    expect(cases).toEqual([expect.objectContaining({ href: '/case', labelText: 'Project Cases' })]);
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
