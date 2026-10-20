import { describe, expect, it } from 'vitest';
import { getAboutSectionHref } from './about-section-navigation';
import { resolveInquiryProduct } from './inquiry-product';

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
});
