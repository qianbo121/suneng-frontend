// Plain resource-list URLs (/zh/news and /zh/news?page=N) are answered by an
// internal ISR route, so readers receive finished HTML instead of a loading
// shell. The rewrite lives in next.config.mjs (newsListPrerenderRewrites);
// search and filter URLs keep the on-demand route. The internal path is never
// linked publicly and middleware refuses it when requested directly.
export const NEWS_LIST_PRERENDER_SEGMENT = 'news-prerendered';

// Bounds the number of cached pages a crawler or attacker can create by
// requesting arbitrary page numbers. Keep in sync with the page pattern in
// next.config.mjs; larger numbers stay on the on-demand route.
export const NEWS_LIST_PRERENDER_MAX_PAGE = 200;

const INTERNAL_PATH = new RegExp(`^/(?:zh|en)/${NEWS_LIST_PRERENDER_SEGMENT}(?:/|$)`);

export function isInternalNewsListPath(pathname: string) {
  return INTERNAL_PATH.test(pathname);
}
