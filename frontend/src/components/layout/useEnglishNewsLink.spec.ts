import { describe, expect, it } from 'vitest';
import { resolveEnglishNewsLink } from './useEnglishNewsLink';

describe('English article navigation', () => {
  it('keeps missing or not-yet-loaded translations away from unavailable article URLs', () => {
    expect(resolveEnglishNewsLink('/zh/news/without-translation', [])).toBe('/en/news');
  });
  it('uses the server-declared counterpart for the current article', () => {
    expect(resolveEnglishNewsLink('/zh/news/translated', ['https://www.jssngyl.cn/en/news/translated'])).toBe('/en/news/translated');
  });
  it('does not reuse another article or homepage alternate during navigation', () => {
    expect(resolveEnglishNewsLink('/zh/news/new-article', ['/en', '/en/news/previous-article'])).toBe('/en/news');
  });
  it('returns only a local destination and tolerates invalid alternates', () => {
    expect(resolveEnglishNewsLink('/zh/news/article/', ['http://[', 'https://other.example/en/news/article/'])).toBe('/en/news/article');
  });
  it.each(['/zh/news', '/zh/products/detail/box-furnace', '/en/news/article'])('leaves existing non-Chinese-article navigation alone: %s', path => {
    expect(resolveEnglishNewsLink(path, [])).toBeNull();
  });
});
