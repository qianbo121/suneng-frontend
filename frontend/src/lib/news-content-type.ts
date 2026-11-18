import type { Locale } from '@/types/site';

export type NewsContentType = 'article' | 'infographic';
export type NewsContentFormat = NewsContentType;

export const NEWS_CONTENT_FORMATS = [
  { id: 'article', zh: '技术文章', en: 'Technical Articles' },
  { id: 'infographic', zh: '图文资料', en: 'Infographics' },
] as const;

export function normalizeNewsContentFormat(value?: string | null, locale: Locale = 'zh'): NewsContentFormat {
  return locale === 'zh' && value === 'infographic' ? 'infographic' : 'article';
}
