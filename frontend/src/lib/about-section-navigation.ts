import type { Locale } from '@/types/site';

export type AboutSearchParams = Record<string, string | string[] | undefined>;

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
