import approvedGuidePaths from '../../../ops/releases/approved-guides.json';
import { PUBLIC_CASE_SLUGS, PUBLIC_ENGLISH_CASE_SLUGS } from '@/lib/cases/public-case-allowlist';

/** The default remains closed; the owner approved only the eight Chinese guides below. */
export const TECHNICAL_CONTENT_PUBLISHED = false;
export const APPROVED_GUIDE_PATHS: ReadonlySet<string> = new Set(approvedGuidePaths);
export function isPublishedGuide(locale: string, chinesePath: string): boolean {
  return locale === 'zh' && APPROVED_GUIDE_PATHS.has(chinesePath);
}
export function hasPublishedGuides(locale: string, section: 'articles' | 'solutions'): boolean {
  return locale === 'zh' && approvedGuidePaths.some((path) => path.startsWith(`/zh/${section}/`));
}

const SITE_HOSTS = ['www.jssngyl.cn', 'jssngyl.cn', 'localhost', '127.0.0.1'];
const LOCALE = /^(?:zh|en)$/i;
const SECTION = /^(?:case|articles|solutions)$/i;

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
  return resolved
    .split('/')
    .map((segment) => decodeSegment(segment, 1))
    .join('/');
}

/** The locale a withdrawn-page response should use for this request path. */
export function withdrawnPageLocale(pathname: string): 'zh' | 'en' {
  return /^\/en(?:\/|$)/i.test(routablePathname(pathname)) ? 'en' : 'zh';
}

/** Path segments without the leading and trailing slashes. */
function segmentsOf(path: string, decode: (segment: string) => string): string[] {
  const segments = path.replace(/\/+$/, '').split('/').map(decode);
  if (segments[0] === '') segments.shift();
  return segments;
}

function isWithdrawnSegments(segments: string[]): boolean {
  const locale = LOCALE.test(segments[0] ?? '') ? segments[0].toLowerCase() : undefined;
  const [section = '', ...rest] = locale ? segments.slice(1) : segments;
  if (!SECTION.test(section)) return false;
  if (section.toLowerCase() !== 'case') {
    const approved =
      locale === 'zh' && rest.length === 1 && APPROVED_GUIDE_PATHS.has(`/zh/${section}/${rest[0]}`);
    return !TECHNICAL_CONTENT_PUBLISHED && !approved;
  }
  const approved = locale === 'en' ? PUBLIC_ENGLISH_CASE_SLUGS : PUBLIC_CASE_SLUGS;
  if (rest.length === 0) return approved.size === 0;
  return rest.length > 1 || !approved.has(rest[0]);
}

/**
 * Case studies reopen article by article: the case index is public only when
 * the locale has an owner-approved case, and a case page only when its slug is
 * on that locale's approved list. Nested case paths are never public.
 *
 * A request is refused when either the widest reading of its path
 * (routablePathname) or the literal reading Next uses for route parameters
 * (each segment decoded once) names withdrawn content, so a case page must be
 * named exactly.
 */
export function isWithdrawnRequestPath(pathname: string): boolean {
  const canonical = routablePathname(pathname).replace(/\/+$/, '');
  if (
    APPROVED_GUIDE_PATHS.has(canonical) &&
    !APPROVED_GUIDE_PATHS.has(pathname.replace(/\/+$/, ''))
  )
    return true;
  return (
    isWithdrawnSegments(segmentsOf(routablePathname(pathname), (segment) => segment)) ||
    isWithdrawnSegments(segmentsOf(pathname, (segment) => decodeSegment(segment, 1)))
  );
}

/** Whether a link points at withdrawn content on this site; other hosts never do. */
export function isWithdrawnTechnicalPath(href: string): boolean {
  let pathname: string;
  try {
    const url = new URL(href, 'https://www.jssngyl.cn');
    if (!SITE_HOSTS.includes(url.hostname)) return false;
    pathname = url.pathname;
  } catch {
    return false;
  }
  return isWithdrawnRequestPath(pathname);
}
