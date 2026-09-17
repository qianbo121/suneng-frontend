import { PUBLIC_CASE_SLUGS, PUBLIC_ENGLISH_CASE_SLUGS } from '@/lib/cases/public-case-allowlist';

/** Launch scope: standalone guides (/articles) and solution pages (/solutions) remain withdrawn. */
export const TECHNICAL_CONTENT_PUBLISHED = false;

const SITE_HOSTS = ['www.jssngyl.cn', 'jssngyl.cn', 'localhost', '127.0.0.1'];
const SECTION = /^\/(?:(zh|en)\/)?(case|articles|solutions)(?:\/(.*))?$/i;

function decodeSegment(segment: string, rounds = 5): string {
  let current = segment;
  for (let round = 0; round < rounds; round += 1) {
    let decoded: string;
    try {
      decoded = decodeURIComponent(current);
    } catch {
      // An undecodable escape stays as written: no router layer drops it.
      break;
    }
    if (decoded === current) break;
    current = decoded;
  }
  return current;
}

/**
 * Reduce a request path to the form the router could resolve it to, following
 * next-intl and URL parsing and erring towards the withdrawn sections: repeated
 * percent-decoding per segment, dropping tabs and line breaks, treating
 * backslashes as slashes, collapsing slashes, trimming surrounding whitespace
 * and control characters, and resolving dot segments.
 */
export function routablePathname(pathname: string): string {
  const decoded = pathname
    .split('/')
    .map((segment) => decodeSegment(segment))
    .join('/')
    .replace(/[\t\n\r]/g, '')
    .replace(/\\/g, '/')
    // A decoded "?" or "#" belongs to the path, not to a query or fragment.
    .replace(/[?#]/g, (char) => encodeURIComponent(char))
    .replace(/\/{2,}/g, '/');
  const resolved = new URL(decoded, 'https://www.jssngyl.cn').pathname;
  return resolved.split('/').map((segment) => decodeSegment(segment, 1)).join('/');
}

/** The locale a withdrawn-page response should use for this request path. */
export function withdrawnPageLocale(pathname: string): 'zh' | 'en' {
  return /^\/en(?:\/|$)/i.test(routablePathname(pathname)) ? 'en' : 'zh';
}

/**
 * Case studies reopen article by article: the case index is public only when
 * the locale has an owner-approved case, and a case page only when its slug is
 * on that locale's approved list. Nested case paths are never public.
 */
export function isWithdrawnRequestPath(pathname: string): boolean {
  const match = routablePathname(pathname).replace(/\/+$/, '').match(SECTION);
  if (!match) return false;
  const [, rawLocale, rawSection, rest] = match;
  const locale = rawLocale?.toLowerCase();
  const section = rawSection.toLowerCase();
  if (section !== 'case') return !TECHNICAL_CONTENT_PUBLISHED;
  const approved = locale === 'en' ? PUBLIC_ENGLISH_CASE_SLUGS : PUBLIC_CASE_SLUGS;
  return rest === undefined ? approved.size === 0 : !approved.has(rest);
}

/** Whether a link points at withdrawn content on this site; other hosts never do. */
export function isWithdrawnTechnicalPath(href: string): boolean {
  let pathname: string;
  try {
    const url = new URL(href, 'https://www.jssngyl.cn');
    if (!SITE_HOSTS.includes(url.hostname)) return false;
    pathname = url.pathname;
  } catch { return false; }
  return isWithdrawnRequestPath(pathname);
}
