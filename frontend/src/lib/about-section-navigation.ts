import type { Locale } from '@/types/site';

export type AboutSearchParams = Record<string, string | string[] | undefined>;

export function getLegacyAboutSectionHref(pathname: string, searchParams: URLSearchParams) {
  const match = /^\/(zh|en)\/(contact|partner|strength\/honors)\/?$/.exec(pathname);
  if (!match) return null;
  const params: AboutSearchParams = {};
  for (const key of new Set(searchParams.keys())) params[key] = searchParams.getAll(key);
  const section = match[2] === 'contact' ? 'contact' : match[2] === 'partner' ? 'projects' : 'qualifications';
  return getAboutSectionHref(match[1] as Locale, section, params);
}

/** Resolve published rich-text links only when they belong to this website. */
export function resolveMergedAboutLink(href: string) {
  try {
    const url = new URL(href, 'https://www.jssngyl.cn');
    if (!['http:', 'https:'].includes(url.protocol) || !['www.jssngyl.cn', 'jssngyl.cn'].includes(url.hostname) || url.username || url.password || url.port) return href;
    const destination = getLegacyAboutSectionHref(url.pathname, url.searchParams);
    if (!destination) return href;
    const target = new URL(destination, url.origin);
    if (url.hash) target.hash = url.hash;
    return `${target.pathname}${target.search}${target.hash}`;
  } catch {
    return href;
  }
}

export function getAboutSectionHref(locale: Locale, section: 'qualifications' | 'projects' | 'contact' | 'management-systems', params: AboutSearchParams = {}) {
  const query = new URLSearchParams();
  for (const [key, value] of Object.entries(params)) {
    if (Array.isArray(value)) value.forEach((item) => query.append(key, item));
    else if (value !== undefined) query.set(key, value);
  }
  const search = query.toString();
  const product = Array.isArray(params.product) ? params.product[0] : params.product;
  const fragment = section === 'contact' && product ? 'contact-inquiry-form-fields' : section;
  return `/${locale}/about${search ? `?${search}` : ''}#${fragment}`;
}
