import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

import { apiPost } from '@/lib/api/client';
import {
  buildLeadSourceSnapshot,
  installVisitorNatureTracking,
  startDwellTracking,
  tickDwell,
  trackLeadEvent,
  trackPageView,
} from '@/lib/api/lead-events';

vi.mock('@/lib/api/client', () => ({ apiPost: vi.fn(() => Promise.resolve({})) }));

function storageMock() {
  const values = new Map<string, string>();
  return {
    getItem: (key: string) => values.get(key) ?? null,
    setItem: (key: string, value: string) => values.set(key, value),
    removeItem: (key: string) => values.delete(key),
  } as unknown as Storage;
}

describe('reading and contact events when browser storage is restricted', () => {
  beforeEach(() => {
    vi.mocked(apiPost).mockClear();
    vi.stubGlobal('window', {
      location: {
        pathname: '/zh/contact',
        search: '?utm_source=baidu&phone=13800138000',
        hostname: 'www.jssngyl.cn',
      },
      sessionStorage: storageMock(),
      localStorage: storageMock(),
      matchMedia: () => ({ matches: false }),
      setInterval: vi.fn(() => 7),
      clearInterval: vi.fn(),
      addEventListener: vi.fn(),
      removeEventListener: vi.fn(),
    });
    vi.stubGlobal('document', {
      title: '联系苏能',
      referrer: 'https://www.baidu.com/s?wd=台车炉',
      visibilityState: 'visible',
      hasFocus: () => true,
    });
    vi.stubGlobal('navigator', { webdriver: false });
  });

  afterEach(() => {
    vi.unstubAllGlobals();
  });

  it.each([
    ['sessionStorage'],
    ['localStorage'],
    ['sessionStorage', 'localStorage'],
  ])('survives a SecurityError from storage property getters: %s', (...names) => {
    for (const name of names) {
      Object.defineProperty(window, name, {
        configurable: true,
        get() {
          throw new DOMException('Storage access denied', 'SecurityError');
        },
      });
    }

    expect(buildLeadSourceSnapshot()).toMatchObject({
      pageTitle: '联系苏能',
      pagePath: '/zh/contact?utm_source=baidu',
      sourceType: '自然搜索',
      utmSource: 'baidu',
    });
    expect(() => {
      installVisitorNatureTracking();
      trackPageView();
      tickDwell();
      trackLeadEvent('phone_click');
      startDwellTracking()();
    }).not.toThrow();
    const eventTypes = vi.mocked(apiPost).mock.calls.map(([, options]) =>
      (options?.body as { eventType: string }).eventType,
    );
    expect(eventTypes).toContain('page_view');
    expect(eventTypes).toContain('phone_click');
    expect(window.clearInterval).toHaveBeenCalledWith(7);
  });

  it('also survives storage method failures after the getter succeeds', () => {
    for (const storage of [window.sessionStorage, window.localStorage]) {
      storage.getItem = () => {
        throw new DOMException('Storage access denied', 'SecurityError');
      };
    }

    expect(() => {
      buildLeadSourceSnapshot();
      trackPageView();
      tickDwell();
      trackLeadEvent('phone_click');
    }).not.toThrow();
  });
});
