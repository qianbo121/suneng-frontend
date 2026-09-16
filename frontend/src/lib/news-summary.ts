import { richTextToPlainText } from '@/lib/sanitize';
import type { NewsApiItem } from '@/types/news';
import type { Locale } from '@/types/site';

function cleanSummary(value?: string | null) {
  return (value || '')
    .replace(/<h([1-6])\b[^>]*>[\s\S]*?<\/h\1>/gi, '\n')
    .replace(/<\/(?:p|div|h[1-6])>|<br\s*\/?>/gi, '\n')
    .split(/\n+/)
    .map((part) => richTextToPlainText(part).trim())
    .filter((part) => part && !/^#{1,6}\s|^(?:画面|配图|图片|封面|示意图|本图|图示)[：:用为说明展示呈现]/.test(part))
    .join(' ')
    .match(/[^。！？]+[。！？]?/g)
    ?.filter((sentence) => !/^(?:画面|配图|图片|封面|示意图|本图|图示)/.test(sentence.trim()))
    .slice(0, 2)
    .join('')
    .trim() || '';
}

export function getNewsSummary(locale: Locale, item: NewsApiItem, preferSeo = false) {
  const summary = locale === 'en' ? item.summaryEn : item.summaryZh;
  const seo = locale === 'en' ? item.seoDescriptionEn : item.seoDescriptionZh;
  const content = locale === 'en' ? item.contentEn : item.contentZh;
  const candidates = preferSeo ? [seo, summary, content] : [summary, seo, content];
  if (locale === 'en') candidates.push(item.summaryZh, item.seoDescriptionZh, item.contentZh);
  // Stop at the first usable summary; parsing unused article bodies is costly.
  for (const candidate of candidates) {
    const cleaned = cleanSummary(candidate);
    if (cleaned) return cleaned;
  }
  return locale === 'en' ? item.titleEn || item.titleZh : item.titleZh;
}
