// @vitest-environment jsdom
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import {
  RESOURCE_LIST_POSITION, requestResourceListRestore, resourceDetailHref,
  safeResourceListHref, saveResourceListPosition, takeResourceListRestore,
} from './news-list-navigation';

beforeEach(() => {
  sessionStorage.clear();
  history.replaceState({ __NA: true }, '', '/zh/news');
  vi.stubGlobal('scrollY', 720);
});
afterEach(() => vi.unstubAllGlobals());

describe('resource detail return context', () => {
  it('retains all list conditions and normalizes URL parameter order', () => {
    expect(safeResourceListHref('/zh/news?format=article&page=2&q=%E7%BD%91%E5%B8%A6&topic=quality&furnace=mesh-belt&sort=recommended', 'zh'))
      .toBe('/zh/news?sort=recommended&q=%E7%BD%91%E5%B8%A6&topic=quality&furnace=mesh-belt&page=2');
  });
  it.each(['https://evil.test/zh/news', '//evil.test/zh/news', '/zh/contact', '/en/news', 'javascript:alert(1)', '/zh/news/anything', '/zh/../en/news'])('rejects an unrelated or unsafe return destination: %s', (href) => {
    expect(safeResourceListHref(href, 'zh')).toBeNull();
  });
  it('uses the same return context for both formats without rewriting standalone article routes', () => {
    for (const href of ['/zh/news/example', '/zh/infographics/example']) {
      const target = new URL(resourceDetailHref(href, '/zh/news?q=4700&format=infographic'), 'https://local.test');
      expect(target.pathname).toBe(href);
      expect(target.searchParams.get('returnTo')).toBe('/zh/news?q=4700&format=infographic');
    }
    expect(resourceDetailHref('/zh/articles/standalone', '/zh/news')).toBe('/zh/articles/standalone');
  });
  it('restores the original list history entry without replacing router state', () => {
    const href = '/zh/news?format=article&page=2';
    saveResourceListPosition(href);
    expect(history.state.__NA).toBe(true);
    expect(takeResourceListRestore(href)?.y).toBe(720);
    expect(takeResourceListRestore('/zh/news?format=infographic')).toBeUndefined();
  });
  it('restores an explicit return after refreshing the detail and starting a fresh list entry', () => {
    const href = '/zh/news?q=refresh&format=article';
    sessionStorage.setItem(`suneng:resource-list-position:${href}`, JSON.stringify({ href, y: 960, savedAt: Date.now() }));
    history.replaceState({ __NA: true }, '', '/zh/news/example');
    requestResourceListRestore(href, true);
    expect(takeResourceListRestore(href)?.y).toBe(960);
    expect(history.state[RESOURCE_LIST_POSITION]?.href).toBe(href);
  });
  it('starts a direct-entry fallback at the top instead of reusing an old list position', () => {
    const href = '/zh/news?format=infographic';
    saveResourceListPosition(href);
    history.replaceState(null, '', '/zh/infographics/example');
    requestResourceListRestore(href, false);
    expect(takeResourceListRestore(href)?.y).toBe(0);
  });
  it('keeps navigation usable when session storage is blocked', () => {
    vi.stubGlobal('sessionStorage', { getItem() { throw new Error('blocked'); }, setItem() { throw new Error('blocked'); } });
    const href = '/zh/news?q=storage-disabled';
    saveResourceListPosition(href);
    requestResourceListRestore(href, true);
    expect(takeResourceListRestore(href)?.y).toBe(720);
  });
});
