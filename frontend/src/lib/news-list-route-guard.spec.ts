import { describe, expect, it, vi } from 'vitest';
import { getNewsListStatus, newsListStatusHtml } from './news-list-route-guard';

const url = (path: string) => new URL(path, 'http://localhost:3000');
const count = (pageCount: number) => vi.fn(async () => pageCount);

describe('resource pagination response status', () => {
  it.each(['0', '-1', '01', '1.5', 'abc', '', '9007199254740992', '2&page=3'])(
    'refuses malformed page %s without a data read', async page => {
      const loader = count(10);
      expect(await getNewsListStatus(url(`/en/news?page=${page}`), loader)).toBe(404);
      expect(loader).not.toHaveBeenCalled();
    },
  );
  it.each(['/en/news', '/zh/news?page=1', '/en/news/article?page=100', '/en/products?page=100', '/en/news?page=100&q=annealing', '/zh/news?page=100&topic=selection'])(
    'keeps existing routing for %s', async path => {
      const loader = count(10);
      expect(await getNewsListStatus(url(path), loader)).toBeNull();
      expect(loader).not.toHaveBeenCalled();
    },
  );
  it.each(['zh', 'en'])('uses the actual %s collection for the last page and its successor', async locale => {
    const loader = count(9);
    expect(await getNewsListStatus(url(`/${locale}/news?page=9`), loader)).toBeNull();
    expect(await getNewsListStatus(url(`/${locale}/news?page=10&q=%20%20&topic=&utm_source=test`), loader)).toBe(404);
    expect(loader).toHaveBeenCalledWith(locale);
  });
  it.each([-1, 0, 1.5, NaN])('does not mistake bad count %s for a missing page', async value => {
    expect(await getNewsListStatus(url('/en/news?page=2'), count(value))).toBe(503);
  });
  it('returns a retryable failure when the collection read fails', async () => {
    const loader = vi.fn().mockRejectedValue(new Error('offline'));
    expect(await getNewsListStatus(url('/en/news?page=2'), loader)).toBe(503);
    expect(newsListStatusHtml('en', 503)).toContain('Try Again');
    expect(newsListStatusHtml('en', 503)).not.toContain('noindex');
    expect(newsListStatusHtml('zh', 404)).toContain('返回资料中心');
    expect(newsListStatusHtml('en', 404)).toContain('noindex');
  });
});
