import DOMPurify from 'isomorphic-dompurify';
import { describe, expect, it, vi } from 'vitest';
import { normalizeNewsHtml } from './news';
import { prepareNewsArticleHtml } from './sanitize';
import type { NewsApiItem } from '@/types/news';

vi.mock('react', async (original) => ({ ...(await original<typeof import('react')>()), cache: (fn: unknown) => fn }));
const parse = (value: string) => DOMPurify.sanitize(value, { RETURN_DOM: true }) as HTMLElement;

describe('article official homepage links', () => {
  it.each(['zh', 'en'] as const)('links homepage references directly to the %s homepage', (locale) => {
    const body = '<p>正文保持。<a href="https://www.jssngyl.cn" target="_blank" rel="noopener noreferrer">官方网站</a>'
      + '<a href="https://www.jssngyl.cn/">https://www.jssngyl.cn/</a><a href="/">Home</a></p>';
    const article = { slug: 'homepage-link-example', contentZh: body, contentEn: body } as NewsApiItem;
    const output = normalizeNewsHtml(locale, article);
    const links = Array.from(parse(output).querySelectorAll('a'));
    expect(links.map((a) => a.getAttribute('href'))).toEqual(Array(3).fill(`/${locale}`));
    expect(links.map((a) => a.textContent)).toEqual(['官方网站', `https://www.jssngyl.cn/${locale}`, 'Home']);
    const originalLink = parse(prepareNewsArticleHtml(body, { locale })).querySelector('a')!;
    expect(links[0].getAttribute('target')).toBe(originalLink.getAttribute('target'));
    expect(links[0].getAttribute('rel')).toBe(originalLink.getAttribute('rel'));
    expect(parse(output).textContent).toContain('正文保持。');
    expect(normalizeNewsHtml(locale, { ...article, contentZh: output, contentEn: output })).toBe(output);
  });

  it('preserves external sources, deep links, explicit languages, fragments and query targets', () => {
    const urls = ['https://www.jshxly.com/', 'https://www.jssngyl.cn.example/', '/zh', '/en',
      '/zh/products', 'https://www.jssngyl.cn/en/news/example', '#source', '/#contact', '/?ref=article'];
    const body = urls.map((u) => `<a href="${u}">${u}</a>`).join('');
    const output = prepareNewsArticleHtml(body, { locale: 'en', articleSlug: 'example' });
    expect(Array.from(parse(output).querySelectorAll('a'), (a) => a.getAttribute('href'))).toEqual(urls);
  });

  it('does not rewrite unrelated rich text or guess a missing locale', () => {
    const body = '<p><a href="https://www.jssngyl.cn/">Source</a></p>';
    expect(prepareNewsArticleHtml(body, { locale: 'en' })).toBe(body);
    expect(prepareNewsArticleHtml(body, { articleSlug: 'example' })).toBe(body);
  });
});
