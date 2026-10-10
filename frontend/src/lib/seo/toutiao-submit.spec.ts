import { describe, expect, it, vi } from 'vitest';
import { createToutiaoArticleSubmitter, getToutiaoArticleUrl } from './toutiao-submit';

const articleA = 'https://www.jssngyl.cn/zh/news/steel-annealing-500-tonnes';
const articleB = 'https://www.jssngyl.cn/en/news/annealing-selection';

function fakeImages() {
  const images: Pick<HTMLImageElement, 'src' | 'onload' | 'onerror'>[] = [];
  const create = vi.fn(() => {
    const image: Pick<HTMLImageElement, 'src' | 'onload' | 'onerror'> = {
      src: '', onload: null, onerror: null,
    };
    images.push(image);
    return image;
  });
  return { create, images };
}

describe('Toutiao public article address protection', () => {
  it('reports a clean canonical address without a fragment or duplicate host variant', () => {
    expect(getToutiaoArticleUrl(`${articleA}#toc`, articleA)).toBe(articleA);
    expect(getToutiaoArticleUrl(articleA.replace('www.', ''), articleA)).toBe(articleA);
    expect(getToutiaoArticleUrl(articleB, articleB)).toBe(articleB);
  });
  it.each([
    'http://www.jssngyl.cn/zh/news/steel-annealing-500-tonnes',
    'http://localhost:3000/zh/news/steel-annealing-500-tonnes',
    'https://preview.jssngyl.cn/zh/news/steel-annealing-500-tonnes',
    'https://www.jssngyl.cn.evil.test/zh/news/steel-annealing-500-tonnes',
    'https://www.jssngyl.cn:8443/zh/news/steel-annealing-500-tonnes',
    'https://user:password@www.jssngyl.cn/zh/news/steel-annealing-500-tonnes',
    'https://www.jssngyl.cn/admin/news/steel-annealing-500-tonnes',
    'https://www.jssngyl.cn/zh/news',
    'https://www.jssngyl.cn/zh/news/not-found',
    `${articleA}?preview=1`,
    `${articleA}?utm_source=private`,
    `${articleA}?anything=1`,
    'not a URL',
  ])('does not send from an unrelated or unsafe runtime address: %s', (currentHref) => {
    const fake = fakeImages();
    const submit = createToutiaoArticleSubmitter('test-site', fake.create);
    expect(submit(currentHref, articleA)).toBe(false);
    expect(fake.create).not.toHaveBeenCalled();
  });
  it.each([
    'https://evil.test/zh/news/steel-annealing-500-tonnes',
    `${articleA}?preview=1`,
    `${articleA}#toc`,
    'https://www.jssngyl.cn/admin/news/steel-annealing-500-tonnes',
    'https://www.jssngyl.cn/zh/news/has/nested/path',
    'https://www.jssngyl.cn/zh/news/%2Fadmin',
  ])('rejects a non-public canonical address: %s', (canonicalHref) => {
    expect(getToutiaoArticleUrl(articleA, canonicalHref)).toBe(null);
  });
});

describe('Toutiao dispatch lifecycle', () => {
  it('deduplicates repeat effects, remounts and fragment changes in a document', () => {
    const fake = fakeImages();
    const submit = createToutiaoArticleSubmitter('test-site', fake.create);
    expect(submit(articleA, articleA)).toBe(true);
    expect(submit(articleA, articleA)).toBe(false);
    expect(submit(`${articleA}#toc`, articleA)).toBe(false);
    expect(fake.create).toHaveBeenCalledTimes(1);
    const sent = new URL(fake.images[0].src);
    expect(sent.origin + sent.pathname).toBe('https://zhanzhang.toutiao.com/s.gif');
    expect(sent.searchParams.get('url')).toBe(articleA);
    expect(sent.searchParams.get('token')).toBe('test-site');
  });
  it('reports each new SPA article using its captured canonical and blocks stale effects', () => {
    const fake = fakeImages();
    const submit = createToutiaoArticleSubmitter('test-site', fake.create);
    expect(submit(articleA, articleA)).toBe(true);
    expect(submit(articleB, articleA)).toBe(false);
    expect(submit('https://www.jssngyl.cn/zh/contact', articleA)).toBe(false);
    expect(submit(articleB, articleB)).toBe(true);
    expect(fake.images.map((item) => new URL(item.src).searchParams.get('url'))).toEqual([articleA, articleB]);
    // A delayed completion cannot change either captured request address.
    fake.images[0].onload?.call(fake.images[0] as unknown as GlobalEventHandlers, {} as Event);
    expect(new URL(fake.images[0].src).searchParams.get('url')).toBe(articleA);
  });
  it('keeps a dispatched article deduplicated when a text response fires an image error', () => {
    const fake = fakeImages();
    const submit = createToutiaoArticleSubmitter('test-site', fake.create);
    expect(submit(articleA, articleA)).toBe(true);
    // An HTTP 200 text response still fires Image.onerror, rather than onload.
    fake.images[0].onerror?.call(fake.images[0] as unknown as GlobalEventHandlers, {} as Event);
    expect(submit(articleA, articleA)).toBe(false);
    expect(submit(`${articleA}#toc`, articleA)).toBe(false);
    expect(submit(articleB, articleB)).toBe(true);
    expect(submit(articleA, articleA)).toBe(false);
    expect(fake.create).toHaveBeenCalledTimes(2);
  });
  it.each(['create', 'src'])('can retry a synchronous %s failure before dispatch without leaking an exception', (stage) => {
    let attempts = 0;
    const fake = fakeImages();
    const submit = createToutiaoArticleSubmitter('test-site', () => {
      attempts += 1;
      if (attempts === 1) {
        if (stage === 'create') throw new Error('blocked image');
        return {
          set src(_value: string) { throw new Error('blocked address'); },
          onload: null,
          onerror: null,
        };
      }
      return fake.create();
    });
    expect(submit(articleA, articleA)).toBe(false);
    expect(submit(articleA, articleA)).toBe(true);
    expect(submit(articleA, articleA)).toBe(false);
    expect(fake.create).toHaveBeenCalledTimes(1);
  });
  it('does not attempt a request without a site identifier', () => {
    const fake = fakeImages();
    expect(createToutiaoArticleSubmitter('', fake.create)(articleA, articleA)).toBe(false);
    expect(fake.create).not.toHaveBeenCalled();
  });
});
