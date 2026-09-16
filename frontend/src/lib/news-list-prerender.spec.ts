import { parse } from 'node:url';

import type { RouteHas } from 'next/dist/lib/load-custom-routes';
import { getPathMatch } from 'next/dist/shared/lib/router/utils/path-match';
import { matchHas, prepareDestination } from 'next/dist/shared/lib/router/utils/prepare-destination';
import { describe, expect, it } from 'vitest';

// @ts-expect-error -- next.config.mjs is plain JavaScript without type declarations.
import { newsListPrerenderRewrites } from '../../next.config.mjs';
import { isInternalNewsListPath, NEWS_LIST_PRERENDER_MAX_PAGE } from './news-list-prerender';

type ConfigRewrite = { source: string; destination: string; has?: RouteHas[]; missing?: RouteHas[] };
const rewrites = newsListPrerenderRewrites as ConfigRewrite[];

// Evaluates the beforeFiles rewrites the way Next's router does
// (server/lib/router-utils/resolve-routes + filesystem).
function rewriteTarget(path: string) {
  const parsed = parse(path, true);
  for (const route of rewrites) {
    const params = getPathMatch(route.source, { strict: true, removeUnnamedParams: true })(
      parsed.pathname ?? '',
    );
    if (!params) continue;
    const hasParams = matchHas(
      { headers: {} } as never,
      parsed.query,
      route.has,
      route.missing,
    );
    if (!hasParams) continue;
    const { parsedDestination } = prepareDestination({
      appendParamsToQuery: true,
      destination: route.destination,
      params: { ...params, ...hasParams },
      query: parsed.query,
    });
    return parsedDestination.pathname;
  }
  return null;
}

describe('prerendered news list rewrites', () => {
  it('serves plain list pages from the internal prerendered route', () => {
    expect(rewriteTarget('/zh/news')).toBe('/zh/news-prerendered/1');
    expect(rewriteTarget('/zh/news?page=1')).toBe('/zh/news-prerendered/1');
    expect(rewriteTarget('/zh/news?page=2')).toBe('/zh/news-prerendered/2');
    expect(rewriteTarget('/en/news?page=3')).toBe('/en/news-prerendered/3');
    expect(rewriteTarget('/zh/news?page=10')).toBe('/zh/news-prerendered/10');
    expect(rewriteTarget('/zh/news?page=150')).toBe('/zh/news-prerendered/150');
    expect(rewriteTarget('/zh/news?page=2&utm_source=baidu')).toBe('/zh/news-prerendered/2');
    expect(rewriteTarget('/zh/news?_rsc=abc123')).toBe('/zh/news-prerendered/1');
    expect(rewriteTarget(`/zh/news?page=${NEWS_LIST_PRERENDER_MAX_PAGE}`)).toBe(
      `/zh/news-prerendered/${NEWS_LIST_PRERENDER_MAX_PAGE}`,
    );
  });

  it('treats empty search or filter values like the on-demand route does: as absent', () => {
    for (const search of ['q=', 'topic=', 'furnace=', 'sort=']) {
      expect(rewriteTarget(`/zh/news?${search}`), search).toBe('/zh/news-prerendered/1');
    }
  });

  it('keeps search, filter and other page values on the on-demand route', () => {
    for (const search of [
      'q=%E5%8F%B0%E8%BD%A6%E7%82%89',
      'topic=selection',
      'furnace=pit&page=2',
      'sort=updated',
      'sort=recommended',
      'page=0',
      'page=01',
      'page=abc',
      'page=1.5',
      'page=-1',
      `page=${NEWS_LIST_PRERENDER_MAX_PAGE + 1}`,
      'page=1000',
      'page=99999999999999999999',
    ]) {
      expect(rewriteTarget(`/zh/news?${search}`), search).toBeNull();
    }
  });

  it('only applies to the list pathname', () => {
    for (const path of ['/zh/news/some-article', '/zh/news/', '/fr/news', '/news', '/zh/newsroom', '/zh']) {
      expect(rewriteTarget(path), path).toBeNull();
    }
  });

  it('recognises direct requests for the internal route', () => {
    expect(isInternalNewsListPath('/zh/news-prerendered')).toBe(true);
    expect(isInternalNewsListPath('/zh/news-prerendered/2')).toBe(true);
    expect(isInternalNewsListPath('/en/news-prerendered/1')).toBe(true);
    expect(isInternalNewsListPath('/zh/news')).toBe(false);
    expect(isInternalNewsListPath('/zh/news/news-prerendered')).toBe(false);
    expect(isInternalNewsListPath('/zh/news-prerendered-x')).toBe(false);
  });
});
