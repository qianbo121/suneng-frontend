import englishIndex from './english-news-index.json';

export type NewsRouteAvailability = 'available' | 'missing' | 'unknown';

type FetchLike = typeof fetch;

const ZH_NEWS_DETAIL = /^\/zh\/news\/([^/]+)$/;

export function getZhNewsSlug(pathname: string) {
  const match = pathname.match(ZH_NEWS_DETAIL);
  if (!match) return null;
  try {
    return decodeURIComponent(match[1]);
  } catch {
    return null;
  }
}

export async function getNewsRouteAvailability(
  pathname: string,
  apiBaseUrl: string,
  fetchImpl: FetchLike = fetch,
): Promise<NewsRouteAvailability | null> {
  const isEnglish = pathname.startsWith('/en/news/');
  const slug = getZhNewsSlug(isEnglish ? pathname.replace('/en/', '/zh/') : pathname);
  if (!slug) return null;
  if (!apiBaseUrl) return 'unknown';

  const base = apiBaseUrl.replace(/\/$/, '');
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), 2_000);
  try {
    const response = await fetchImpl(`${base}/v1/news/${encodeURIComponent(slug)}`, {
      cache: 'no-store',
      signal: controller.signal,
      headers: { Accept: 'application/json' },
    });
    if (response.status === 404) return 'missing';
    if (response.ok) {
      if (!isEnglish) return 'available';
      const result = await response.json();
      const item = result.data ?? result;
      if (item.status !== 'published' || item.isPublished !== true) return 'missing';
      if (item.titleEn?.trim() && item.contentEn?.replace(/<[^>]+>/g, '').trim())
        return 'available';
      const entry = (
        englishIndex as Record<string, { slug: string; rawSourceFingerprint: string }>
      )[String(item.id)];
      if (!entry || item.slug !== entry.slug) return 'missing';
      const source = JSON.stringify([
        item.titleZh ?? null,
        item.summaryZh ?? null,
        item.contentZh ?? null,
        item.seoTitleZh ?? null,
        item.seoDescriptionZh ?? null,
      ]);
      const digest = await globalThis.crypto.subtle.digest(
        'SHA-256',
        new TextEncoder().encode(source),
      );
      const fingerprint = Array.from(new Uint8Array(digest), (byte) =>
        byte.toString(16).padStart(2, '0'),
      ).join('');
      return fingerprint === entry.rawSourceFingerprint ? 'available' : 'missing';
    }
    return 'unknown';
  } catch {
    // A backend outage must not turn all existing news URLs into false 404s.
    // Let the page-level error boundary handle unavailable upstream reads.
    return 'unknown';
  } finally {
    clearTimeout(timer);
  }
}

export function newsNotFoundHtml(locale: 'zh' | 'en' = 'zh') {
  if (locale === 'en')
    return '<!doctype html><html lang="en"><head><meta charset="utf-8"><meta name="robots" content="noindex"><meta name="viewport" content="width=device-width,initial-scale=1"><title>Article Unavailable | Suneng Industrial Furnace</title></head><body><main><h1>Article unavailable</h1><p>This article is not currently available in English.</p><p><a href="/en/news">Return to Resources</a></p></main></body></html>';
  return '<!doctype html><html lang="zh-CN"><head><meta charset="utf-8"><meta name="robots" content="noindex"><meta name="viewport" content="width=device-width,initial-scale=1"><title>资料不存在｜江苏苏能工业炉有限公司</title></head><body><main><h1>资料不存在或已下线</h1><p><a href="/zh/news">返回资料中心</a></p></main></body></html>';
}
