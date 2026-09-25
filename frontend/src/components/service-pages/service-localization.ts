import translations from './service-translations-en.json';
import type { Locale } from '@/types/site';

// These service references have verified, published English counterparts.
const translatedServiceNews = new Set([
  '/zh/news/gong-ye-lu-gai-zao-yan-shou-kan-na-xie-zhi-biao-cong-wen-du-jun-yun-xing-neng-hao-dao-kong-zhi-xi-tong-wen-ding-xing',
  '/zh/news/re-chu-li-lu-jie-neng-gai-zao-duo-shao-qian-fei-yong-gou-cheng-yu-suan-ying-xiang-yin-su-he-xun-jia-qian-zhun-bei',
]);

export function serviceHref(path: string, locale: Locale) {
  if (locale !== 'en') return path;
  if (path === '/zh/inquiry') return '/en/contact';
  // Unverified news must still retain its actual Chinese destination.
  if (path.startsWith('/zh/news/')) {
    const pathname = path.split(/[?#]/, 1)[0].replace(/\/$/, '');
    return translatedServiceNews.has(pathname) ? path.replace(/^\/zh\//, '/en/') : path;
  }
  return path.replace(/^\/zh(?=\/|$)/, '/en');
}

export function serviceText(text: string, locale: Locale) {
  if (locale !== 'en') return text;
  return serviceHref((translations as Record<string, string>)[text] ?? text, locale);
}

export function localizeServiceContent<T>(value: T, locale: Locale): T {
  if (locale !== 'en') return value;
  if (typeof value === 'string') return serviceText(value, locale) as T;
  if (Array.isArray(value)) return value.map((item) => localizeServiceContent(item, locale)) as T;
  if (value && typeof value === 'object') {
    return Object.fromEntries(Object.entries(value).map(([key, item]) => [key, localizeServiceContent(item, locale)])) as T;
  }
  return value;
}
