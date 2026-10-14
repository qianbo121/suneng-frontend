// @vitest-environment jsdom
import { act, createElement } from 'react';
import { createRoot } from 'react-dom/client';
import { expect, it, vi } from 'vitest';
import { BaiduAnalytics } from './BaiduAnalytics';

const navigation = vi.hoisted(() => ({ pathname: '/zh' }));
vi.mock('next/navigation', () => ({ usePathname: () => navigation.pathname }));
vi.mock('@/lib/analytics/baidu', () => ({ canLoadBaiduAnalytics: () => true }));
(globalThis as { IS_REACT_ACT_ENVIRONMENT?: boolean }).IS_REACT_ACT_ENVIRONMENT = true;

it('uses the real Next loader after document load and keeps queued page views', async () => {
  const readyState = vi.spyOn(document, 'readyState', 'get').mockReturnValue('loading');
  const container = document.createElement('div');
  document.body.appendChild(container);
  const root = createRoot(container);
  delete window._hmt;
  try {
    await act(async () => root.render(createElement(BaiduAnalytics)));
    expect(document.querySelector('#baidu-analytics')).toBeNull();
    navigation.pathname = '/zh/products';
    await act(async () => root.render(createElement(BaiduAnalytics)));
    expect(window._hmt).toEqual([['_trackPageview', '/zh/products']]);
    expect(document.querySelector('#baidu-analytics')).toBeNull();

    readyState.mockReturnValue('complete');
    await act(async () => {
      window.dispatchEvent(new Event('load'));
      await new Promise((resolve) => setTimeout(resolve, 20));
    });
    const loader = document.querySelector('#baidu-analytics');
    expect(loader).not.toBeNull();
    expect(loader?.textContent).toContain('var _hmt = _hmt || []');
    expect(loader?.textContent).toContain('https://hm.baidu.com/hm.js?');
    navigation.pathname = '/zh/inquiry';
    await act(async () => root.render(createElement(BaiduAnalytics)));
    expect(document.querySelectorAll('#baidu-analytics')).toHaveLength(1);
    expect(window._hmt).toEqual([
      ['_trackPageview', '/zh/products'], ['_trackPageview', '/zh/inquiry'],
    ]);
  } finally {
    await act(async () => root.unmount());
    document.querySelector('#baidu-analytics')?.remove();
    container.remove();
    readyState.mockRestore();
    delete window._hmt;
  }
});
