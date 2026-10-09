import DOMPurify from 'isomorphic-dompurify';
import { describe, expect, it } from 'vitest';

import { applyReviewedNewsSourcePresentation } from './news-source-presentation';
import { prepareNewsArticleHtml } from './sanitize';
import type { Locale } from '@/types/site';

const huaxiaSlugs = [
  'jiang-su-gong-ye-lu-chang-jia-tui-jian-an-xiang-mu-lei-xing-shai-xuan-de-5-jia-dai-biao-xing-yang-ben',
  'jiang-su-re-chu-li-lu-chang-jia-na-jia-hao-xian-ba-liu-xiang-neng-li-fang-dao-tong-yi-zhang-biao-li-bi-jiao',
  'jiang-su-re-chu-li-lu-chang-jia-tui-jian-xian-kan-gong-yi-he-gong-jian-zai-kan-chang-jia',
];
const fastenerSlug = 'fastener-mesh-belt-furnace-manufacturers';
const huaxiaLink = '<a href="https://www.jshxly.com/" target="_blank" rel="noopener noreferrer">江苏华夏</a>';
const markerSelector = '[data-source-review="source-access-2026-10-08"]';
const parse = (html: string) => DOMPurify.sanitize(html, { RETURN_DOM: true }) as HTMLElement;
const render = (locale: Locale, slug: string, html: string) =>
  prepareNewsArticleHtml(applyReviewedNewsSourcePresentation(locale, slug, html), { locale });

describe('reviewed news source presentation', () => {
  it.each([
    'atmosphere-furnace-pressure-fluctuation-process-or-equipment',
    'heat-treatment-furnace-loading-rack-fixture-selection',
    'multi-product-heat-treatment-furnace-changeover-boundaries',
  ])('formats only the reviewed Chinese heading on %s', (slug) => {
    const body = '<p>原工况。</p><p>**来源与边界说明：**设计值不能当成验收结果。</p>';
    const formatted = parse(render('zh', slug, body));
    expect(formatted.querySelector('strong')?.textContent).toBe('来源与边界说明：');
    expect(formatted.textContent).toBe('原工况。来源与边界说明：设计值不能当成验收结果。');
    expect(applyReviewedNewsSourcePresentation('en', slug, body)).toBe(body);
    expect(applyReviewedNewsSourcePresentation('zh', 'unreviewed-article', body)).toBe(body);
  });

  it.each(huaxiaSlugs.flatMap((slug) => (['zh', 'en'] as const).map((locale) => ({ slug, locale }))))(
    'adds one dated, localized note on $locale/$slug without changing the source or claim',
    ({ slug, locale }) => {
      const anchor = locale === 'en' ? huaxiaLink.replace('江苏华夏', 'Jiangsu Huaxia') : huaxiaLink;
      const body = `<p>Public product reference: ${anchor}. Actual project scope still needs confirmation.</p>`;
      const formatted = render(locale, slug, body);
      const document = parse(formatted);
      const note = document.querySelector(markerSelector);
      expect(document.querySelectorAll(markerSelector)).toHaveLength(1);
      expect(document.querySelector('a')?.outerHTML).toBe(parse(anchor).querySelector('a')?.outerHTML);
      expect(note?.textContent).toBe(locale === 'zh'
        ? '（2026-10-08访问检查出现证书警告，来源内容待核）'
        : 'Access check on 8 October 2026: certificate warning; source content not reverified.');
      expect((note as HTMLElement).style.fontSize).toBe('13px');
      expect((note as HTMLElement).style.color).toBe('rgb(102, 112, 133)');
      expect((note as HTMLElement).style.marginInlineStart).toBe('0.5em');
      note?.remove();
      expect(document.innerHTML).toBe(prepareNewsArticleHtml(body, { locale }));
      expect(render(locale, slug, formatted)).toBe(formatted);
    },
  );

  it('marks both reviewed fastener anchors only in Chinese and preserves all link labels', () => {
    const body = '<p>荣东盛的<a href="https://www.fsrds.com/product/69.html">网带炉</a>。'
      + '<a href="https://www.fsrds.com/product/69.html">网带炉资料</a>支持初步联系，不等于已确认相同验收项目。</p>';
    const document = parse(render('zh', fastenerSlug, body));
    expect(document.querySelectorAll(markerSelector)).toHaveLength(2);
    expect(Array.from(document.querySelectorAll('a'), (anchor) => anchor.textContent)).toEqual(['网带炉', '网带炉资料']);
    document.querySelectorAll(markerSelector).forEach((note) => note.remove());
    expect(document.innerHTML).toBe(prepareNewsArticleHtml(body, { locale: 'zh' }));
    expect(applyReviewedNewsSourcePresentation('en', fastenerSlug, body)).toBe(body);
  });

  it('leaves other pages, other URLs and secure replacement candidates untouched', () => {
    const body = `<p>${huaxiaLink}<a href="https://www.fsrds.com/product/69.html">网带炉</a></p>`;
    expect(applyReviewedNewsSourcePresentation('zh', 'different-article', body)).toBe(body);
    const others = '<p><a href="http://www.jshxly.com/">HTTP</a><a href="https://www.jshxly.com/products">Product</a>'
      + '<a href="https://m.jshxly.com/">Mobile</a><a href="https://www.jshxly.com.example/">Other host</a></p>';
    expect(applyReviewedNewsSourcePresentation('zh', huaxiaSlugs[0], others)).toBe(others);
    expect(parse(render('zh', huaxiaSlugs[0], body)).querySelectorAll(markerSelector)).toHaveLength(1);
  });

  it('retains safe notes through the sanitizer while still stripping unsafe HTML', () => {
    const body = `<p>${huaxiaLink}</p><script>alert(1)</script><a href="javascript:alert(1)">Unsafe</a>`;
    const document = parse(render('zh', huaxiaSlugs[0], body));
    expect(document.querySelectorAll(markerSelector)).toHaveLength(1);
    expect(document.querySelector('script')).toBeNull();
    expect(document.querySelector('a[href^="javascript:"]')).toBeNull();
  });
});
