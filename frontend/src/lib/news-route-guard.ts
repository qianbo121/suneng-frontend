import englishIndex from './english-news-index.json';

export type NewsRouteAvailability = 'available' | 'missing' | 'unknown';
export type NewsRouteResolution = {
  availability: NewsRouteAvailability;
  redirectPath?: string;
};

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

export async function getNewsRouteResolution(
  pathname: string,
  apiBaseUrl: string,
  fetchImpl: FetchLike = fetch,
): Promise<NewsRouteResolution | null> {
  const isEnglish = pathname.startsWith('/en/news/');
  const slug = getZhNewsSlug(isEnglish ? pathname.replace('/en/', '/zh/') : pathname);
  if (!slug) return null;
  if (!apiBaseUrl) return { availability: 'unknown' };

  const base = apiBaseUrl.replace(/\/$/, '');
  const isNumericSlug = /^\d+$/.test(slug);
  const controller = new AbortController();
  // Legacy IDs need the canonical slug before rendering starts. Give that
  // lookup more time without extending the guard on ordinary article URLs.
  const timer = setTimeout(() => controller.abort(), isNumericSlug ? 5_000 : 2_000);
  try {
    const response = await fetchImpl(`${base}/v1/news/${encodeURIComponent(slug)}`, {
      cache: 'no-store',
      signal: controller.signal,
      headers: { Accept: 'application/json' },
    });
    if (response.status === 404) return { availability: 'missing' };
    if (response.ok) {
      // Ordinary Chinese slugs already use the public endpoint's visibility
      // decision. Numeric legacy URLs also need its canonical slug, using this
      // same request rather than issuing another lookup from middleware.
      if (!isEnglish && !isNumericSlug) return { availability: 'available' };
      const result = await response.json();
      const item = result.data ?? result;
      if (!item || typeof item.status !== 'string' || typeof item.isPublished !== 'boolean')
        return { availability: 'unknown' };
      if (item.status !== 'published' || item.isPublished !== true)
        return { availability: 'missing' };
      const available: NewsRouteResolution = { availability: 'available' };
      if (isNumericSlug && typeof item.slug === 'string' && item.slug !== slug) {
        // The destination is always a single same-origin path segment. Do not
        // promote malformed upstream data into a redirect or false 404.
        if (!/^[a-z0-9]+(?:-[a-z0-9]+)*$/i.test(item.slug))
          return { availability: 'unknown' };
        available.redirectPath = `/${isEnglish ? 'en' : 'zh'}/news/${item.slug}`;
      }
      if (!isEnglish) return available;
      if (item.titleEn?.trim() && item.contentEn?.replace(/<[^>]+>/g, '').trim())
        return available;
      const entry = (
        englishIndex as Record<string, { slug: string; rawSourceFingerprint: string }>
      )[String(item.id)];
      if (!entry || item.slug !== entry.slug) return { availability: 'missing' };
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
      return fingerprint === entry.rawSourceFingerprint ? available : { availability: 'missing' };
    }
    return { availability: 'unknown' };
  } catch {
    // A backend outage must not turn all existing news URLs into false 404s.
    // Let the page-level error boundary handle unavailable upstream reads.
    return { availability: 'unknown' };
  } finally {
    clearTimeout(timer);
  }
}

export async function getNewsRouteAvailability(
  pathname: string,
  apiBaseUrl: string,
  fetchImpl: FetchLike = fetch,
): Promise<NewsRouteAvailability | null> {
  return (await getNewsRouteResolution(pathname, apiBaseUrl, fetchImpl))?.availability ?? null;
}

export function newsNotFoundHtml(locale: 'zh' | 'en' = 'zh') {
  if (locale === 'en')
    return '<!doctype html><html lang="en"><head><meta charset="utf-8"><meta name="robots" content="noindex"><meta name="viewport" content="width=device-width,initial-scale=1"><title>Article Unavailable | Suneng Industrial Furnace</title></head><body><main><h1>Article unavailable</h1><p>This article is not currently available in English.</p><p><a href="/en/news">Return to Resources</a></p></main></body></html>';
  return '<!doctype html><html lang="zh-CN"><head><meta charset="utf-8"><meta name="robots" content="noindex"><meta name="viewport" content="width=device-width,initial-scale=1"><title>资料不存在｜江苏苏能工业炉有限公司</title></head><body><main><h1>资料不存在或已下线</h1><p><a href="/zh/news">返回资料中心</a></p></main></body></html>';
}
