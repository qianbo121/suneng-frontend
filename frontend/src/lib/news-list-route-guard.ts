import type { Locale } from '@/types/site';

// Resolve invalid pages before a streaming page can send its initial 200 shell.
// Page counts come from the same prepared collection used by the list itself.
export async function getNewsListStatus(
  url: URL,
  loadPageCount: (locale: Locale) => Promise<number>,
): Promise<404 | 503 | null> {
  const locale = /^\/(zh|en)\/news$/.exec(url.pathname)?.[1];
  if (!locale || !url.searchParams.has('page')) return null;
  const values = url.searchParams.getAll('page');
  const page = values[0];
  if (values.length !== 1 || !/^[1-9]\d*$/.test(page) || !Number.isSafeInteger(Number(page))) {
    return 404;
  }
  // Filtered/search results already clamp the requested page. Preserve that
  // behavior, and avoid a collection read for the always-valid first list page.
  if (Number(page) === 1 || ['q', 'topic', 'furnace', 'sort'].some(key => {
    const value = url.searchParams.get(key);
    return key === 'q' ? Boolean(value?.trim()) : Boolean(value);
  })) return null;

  try {
    const pageCount = await loadPageCount(locale as Locale);
    if (!Number.isSafeInteger(pageCount) || pageCount < 1) return 503;
    return Number(page) > pageCount ? 404 : null;
  } catch {
    // An unavailable collection cannot establish that a page does not exist.
    return 503;
  }
}

export function newsListStatusHtml(locale: Locale, status: 404 | 503) {
  const en = locale === 'en';
  const title = status === 404
    ? en ? 'Resource page not found' : '资料分页不存在'
    : en ? 'Resources are temporarily unavailable' : '资料暂时无法加载';
  const message = status === 404
    ? en ? 'This page number is not available. Return to the resource list to continue browsing.' : '没有这个页码，请返回资料列表继续浏览。'
    : en ? 'Please try again shortly. Your requested page has not been removed.' : '请稍后重试，这不代表您访问的资料已被删除。';
  return `<!doctype html><html lang="${en ? 'en' : 'zh-CN'}"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>${title} | Suneng</title>${status === 404 ? '<meta name="robots" content="noindex">' : ''}<style>body{margin:0;font:18px/1.7 system-ui,sans-serif;color:#142d4e;background:#f6f8fb}main{max-width:720px;margin:10vh auto;padding:32px}h1{font-size:32px;line-height:1.3;overflow-wrap:anywhere}a{color:#145ca8;display:inline-block;margin:12px 24px 12px 0;padding:8px 0}a:focus-visible{outline:2px solid;outline-offset:4px}</style></head><body><main><h1>${title}</h1><p>${message}</p>${status === 503 ? `<a href="">${en ? 'Try Again' : '重新加载'}</a>` : ''}<a href="/${locale}/news">${en ? 'Return to Resources' : '返回资料中心'}</a><a href="/${locale}/products">${en ? 'Browse Products' : '查看产品'}</a></main></body></html>`;
}
