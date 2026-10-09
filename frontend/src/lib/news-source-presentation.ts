import type { Locale } from '@/types/site';

const sourceHeadingSlugs = new Set([
  'atmosphere-furnace-pressure-fluctuation-process-or-equipment',
  'heat-treatment-furnace-loading-rack-fixture-selection',
  'multi-product-heat-treatment-furnace-changeover-boundaries',
]);

const huaxiaSourceSlugs = new Set([
  'jiang-su-gong-ye-lu-chang-jia-tui-jian-an-xiang-mu-lei-xing-shai-xuan-de-5-jia-dai-biao-xing-yang-ben',
  'jiang-su-re-chu-li-lu-chang-jia-na-jia-hao-xian-ba-liu-xiang-neng-li-fang-dao-tong-yi-zhang-biao-li-bi-jiao',
  'jiang-su-re-chu-li-lu-chang-jia-tui-jian-xian-kan-gong-yi-he-gong-jian-zai-kan-chang-jia',
]);

const sourceNotes: Record<Locale, string> = {
  zh: '（2026-10-08访问检查出现证书警告，来源内容待核）',
  en: 'Access check on 8 October 2026: certificate warning; source content not reverified.',
};
const reviewMarker = 'source-access-2026-10-08';

/** The approved display corrections apply only to the explicitly reviewed pages. */
export function applyReviewedNewsSourcePresentation(locale: Locale, slug: string, html: string) {
  let result = locale === 'zh' && sourceHeadingSlugs.has(slug)
    ? html.replace('<p>**来源与边界说明：**', '<p><strong>来源与边界说明：</strong>')
    : html;

  const reviewedSource = huaxiaSourceSlugs.has(slug)
    ? 'https://www.jshxly.com/'
    : locale === 'zh' && slug === 'fastener-mesh-belt-furnace-manufacturers'
      ? 'https://www.fsrds.com/product/69.html'
      : null;
  if (!reviewedSource) return result;

  result = result.replace(/<a\b[^>]*>[\s\S]*?<\/a>/gi, (anchor: string, offset: number, source: string) => {
    const href = anchor.match(/\shref\s*=\s*(["'])(.*?)\1/i)?.[2];
    if (href !== reviewedSource) return anchor;
    // A second render must not append another note to the same source link.
    const following = source.slice(offset + anchor.length);
    if (/^\s*<span\b[^>]*\bdata-source-review=["']source-access-2026-10-08["']/i.test(following)) {
      return anchor;
    }
    return `${anchor}<span data-source-review="${reviewMarker}" style="margin-inline-start:.5em;font-size:13px;color:#667085">${sourceNotes[locale]}</span>`;
  });
  return result;
}
