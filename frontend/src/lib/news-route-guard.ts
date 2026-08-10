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
  const slug = getZhNewsSlug(pathname);
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
    if (response.ok) return 'available';
    return 'unknown';
  } catch {
    // A backend outage must not turn all existing news URLs into false 404s.
    // Let the page-level error boundary handle unavailable upstream reads.
    return 'unknown';
  } finally {
    clearTimeout(timer);
  }
}

export function newsNotFoundHtml() {
  return '<!doctype html><html lang="zh-CN"><head><meta charset="utf-8"><meta name="robots" content="noindex"><meta name="viewport" content="width=device-width,initial-scale=1"><title>资料不存在｜江苏苏能工业炉有限公司</title></head><body><main><h1>资料不存在或已下线</h1><p><a href="/zh/news">返回资料中心</a></p></main></body></html>';
}
