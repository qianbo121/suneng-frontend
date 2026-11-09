import { describe, expect, it } from 'vitest';
import { getAboutSectionHref } from './about-section-navigation';
import { resolveInquiryProduct } from './inquiry-product';
import { prepareNewsArticleHtml } from './sanitize';

describe('legacy contact links into the unified About page', () => {
  it('preserves the selected furnace and campaign information before the section fragment', () => {
    const href = getAboutSectionHref('zh', 'contact', { product: 'shovel-furnace', utm_source: 'product page', tag: ['a', 'b'] });
    const url = new URL(href, 'https://www.jssngyl.cn');
    expect(url.pathname).toBe('/zh/about');
    expect(url.hash).toBe('#contact-inquiry-form-fields');
    expect(resolveInquiryProduct(url.searchParams.get('product') ?? undefined, 'zh')).toBeTruthy();
    expect(url.searchParams.get('utm_source')).toBe('product page');
    expect(url.searchParams.getAll('tag')).toEqual(['a', 'b']);
  });

  it('keeps English inquiries on the English page and safely encodes query characters', () => {
    const url = new URL(getAboutSectionHref('en', 'contact', { product: 'box-furnace', note: 'a&b#c' }), 'https://www.jssngyl.cn');
    expect(url.pathname).toBe('/en/about');
    expect(url.hash).toBe('#contact-inquiry-form-fields');
    expect(url.searchParams.get('note')).toBe('a&b#c');
    expect(getAboutSectionHref('en', 'contact')).toBe('/en/about#contact');
    expect(getAboutSectionHref('en', 'contact', { product: '' })).toBe('/en/about?product=#contact');
    expect(getAboutSectionHref('en', 'qualifications')).toBe('/en/about#qualifications');
  });

  it('renders old article links directly while retaining their text, language and inquiry parameters', () => {
    const html = prepareNewsArticleHtml('<p>正文保持。<a href="https://www.jssngyl.cn/en/contact?product=box-furnace&amp;tag=a&amp;tag=b#contact-inquiry-form-fields">Contact engineering</a><a href="/zh/strength/honors">证书原件</a><a href="https://other.example/zh/contact">External source</a><a href="https://www.jssngyl.cn/zh/contact">https://www.jssngyl.cn/zh/contact</a></p>');
    expect(html).toContain('正文保持。');
    expect(html).toContain('href="/en/about?product=box-furnace&amp;tag=a&amp;tag=b#contact-inquiry-form-fields"');
    expect(html).toContain('>Contact engineering</a>');
    expect(html).toContain('href="/zh/about#qualifications">证书原件</a>');
    expect(html).toContain('href="https://other.example/zh/contact">External source</a>');
    expect(html).toContain('href="/zh/about#contact">https://www.jssngyl.cn/zh/about#contact</a>');
  });
});
