import clsx from 'clsx';

import type { Locale } from '@/types/site';

export function cn(...inputs: Array<string | false | null | undefined>) {
  return clsx(inputs);
}

export function localizeText(locale: Locale, zh?: string | null, en?: string | null, fallback = '') {
  return locale === 'en' ? en || zh || fallback : zh || en || fallback;
}

export function swapLocaleInPath(pathname: string, locale: string) {
  const segments = pathname.split('/').filter(Boolean);

  if (segments.length === 0) {
    return `/${locale}`;
  }

  if (segments[0] === 'zh' || segments[0] === 'en') {
    segments[0] = locale;
    return `/${segments.join('/')}`;
  }

  return `/${locale}/${segments.join('/')}`;
}
