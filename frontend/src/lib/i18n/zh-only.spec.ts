import { describe, expect, it } from 'vitest';
import { isZhOnlyPath, localizeOrHideHref } from './zh-only';

describe('case language availability', () => {
  it('hides registered English case links during withdrawal', () => {
    expect(isZhOnlyPath('/zh/case')).toBe(false);
    expect(localizeOrHideHref('/zh/case/rt4-75-6-trolley-furnace-proposal', 'en')).toBeNull();
  });
  it.each(['/zh/case/new-project', '/en/case/new-project/', '/case/new-project?from=list#details'])('recognizes content-driven case paths: %s', (path) => {
    expect(isZhOnlyPath(path)).toBe(true);
    expect(localizeOrHideHref(path, 'en')).toBeNull();
  });

  it('hides Chinese case links while preserving genuine English product links', () => {
    expect(localizeOrHideHref('/case/new-project?from=list', 'zh')).toBeNull();
    expect(localizeOrHideHref('/zh/products/detail/shovel-furnace', 'en')).toBe('/en/products/detail/shovel-furnace');
    expect(isZhOnlyPath('/zh/case-study-guide')).toBe(false);
    expect(localizeOrHideHref('https://example.com/case/test', 'en')).toBe('https://example.com/case/test');
  });
});
