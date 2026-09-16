import { describe, expect, it } from 'vitest';

import {
  hasHeroPassedStickyEngineerTrigger,
  isStickyEngineerEligiblePath,
  shouldPersistStickyEngineerSuppression,
  STICKY_ENGINEER_ELIGIBLE_PATHS,
} from './sticky-engineer';

describe('sticky engineer visibility policy', () => {
  it('only allows the Chinese homepage and product center', () => {
    expect(STICKY_ENGINEER_ELIGIBLE_PATHS).toEqual(['/zh', '/zh/products']);
    expect(isStickyEngineerEligiblePath('/zh')).toBe(true);
    expect(isStickyEngineerEligiblePath('/zh/products')).toBe(true);
    expect(isStickyEngineerEligiblePath('/zh/news')).toBe(false);
    expect(isStickyEngineerEligiblePath('/en')).toBe(false);
  });

  it('keeps local previews repeatable after reload', () => {
    expect(shouldPersistStickyEngineerSuppression('localhost')).toBe(false);
    expect(shouldPersistStickyEngineerSuppression('127.0.0.1')).toBe(false);
    expect(shouldPersistStickyEngineerSuppression('::1')).toBe(false);
    expect(shouldPersistStickyEngineerSuppression('www.jssngyl.cn')).toBe(true);
  });

  it('shows after the hero crosses the early trigger line and not while it is still covering it', () => {
    expect(
      hasHeroPassedStickyEngineerTrigger({
        isIntersecting: true,
        targetBottom: 700,
        triggerLine: 630,
      }),
    ).toBe(false);
    expect(
      hasHeroPassedStickyEngineerTrigger({
        isIntersecting: false,
        targetBottom: 620,
        triggerLine: 630,
      }),
    ).toBe(true);
    expect(
      hasHeroPassedStickyEngineerTrigger({
        isIntersecting: false,
        targetBottom: 700,
        triggerLine: 630,
      }),
    ).toBe(false);
  });
});
