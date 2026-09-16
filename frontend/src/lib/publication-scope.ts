import { PUBLIC_CASE_SLUGS, PUBLIC_ENGLISH_CASE_SLUGS } from '@/lib/cases/public-case-allowlist';

/** Launch scope: standalone guides (/articles) and solution pages (/solutions) remain withdrawn. */
export const TECHNICAL_CONTENT_PUBLISHED = false;

/**
 * Case studies reopen article by article: the case index is public only when
 * the locale has an owner-approved case, and a case page only when its slug is
 * on that locale's approved list. Nested case paths are never public.
 */
export function isWithdrawnTechnicalPath(href: string): boolean {
  let pathname: string;
  try {
    const url = new URL(href, 'https://www.jssngyl.cn');
    if (!['www.jssngyl.cn', 'jssngyl.cn', 'localhost', '127.0.0.1'].includes(url.hostname)) return false;
    pathname = url.pathname;
  } catch { return false; }
  // The router decodes percent-escapes such as /zh/%73olutions, so decode before
  // matching. A malformed escape cannot name a public page.
  try {
    pathname = decodeURIComponent(pathname);
  } catch { return true; }
  const match = pathname.replace(/\/+$/, '').match(/^\/(?:(zh|en)\/)?(case|articles|solutions)(?:\/(.*))?$/i);
  if (!match) return false;
  const [, rawLocale, rawSection, rest] = match;
  const locale = rawLocale?.toLowerCase();
  const section = rawSection.toLowerCase();
  if (section !== 'case') return !TECHNICAL_CONTENT_PUBLISHED;
  const approved = locale === 'en' ? PUBLIC_ENGLISH_CASE_SLUGS : PUBLIC_CASE_SLUGS;
  return rest === undefined ? approved.size === 0 : !approved.has(rest);
}
