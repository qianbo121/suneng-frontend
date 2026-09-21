import { describe, expect, it } from 'vitest';
import { getLocalizedNavigation } from '@/mock/navigation';
import { isWithdrawnTechnicalPath } from '@/lib/publication-scope';
import { localizeOrHideHref } from '@/lib/i18n/zh-only';
import { serviceEntries, serviceRoutes } from './service-content';

describe('service overview and submenu', () => {
  it('keeps all four service pages visible and matches the overview links', () => {
    const children = getLocalizedNavigation('zh').find((item) => item.key === 'engineering')?.children;
    expect(children?.map((item) => item.labelText)).toEqual([
      '维修与改造', '搬迁与复产', '安装与售后', '选型与改造指南',
    ]);
    expect(children?.map((item) => `/zh${item.href}`)).toEqual(serviceEntries.map((item) => item.href));
    expect(serviceEntries.filter((item) => !isWithdrawnTechnicalPath(item.href))).toHaveLength(4);
  });

  it('opens the service guide without reopening unpublished technical pages', () => {
    expect(isWithdrawnTechnicalPath(serviceRoutes.guides)).toBe(false);
    expect(isWithdrawnTechnicalPath('/zh/solutions/rechuli-lu-wendu-bujun-zhenggai')).toBe(false);
    expect(isWithdrawnTechnicalPath('/zh/solutions/unapproved-guide')).toBe(true);
    expect(isWithdrawnTechnicalPath(serviceRoutes.decision)).toBe(false);
  });

  it('does not link English visitors to a Chinese-only service guide', () => {
    expect(localizeOrHideHref(serviceRoutes.guides, 'en')).toBeNull();
    expect(getLocalizedNavigation('en').flatMap((item) => item.children ?? [])
      .some((item) => item.href === '/service/selection-retrofit-guide')).toBe(false);
  });
});
