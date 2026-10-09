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

function postedBodies() {
  return vi.mocked(apiPost).mock.calls.map(
    ([, options]) =>
      options?.body as {
        eventType: string;
        sessionId?: string;
        visitorId?: string;
        pagePath?: string;
        sourceType?: string;
        properties?: Record<string, unknown>;
      },
  );
}

async function settleRequests() {
  for (let index = 0; index < 12; index += 1) await Promise.resolve();
}

describe('reading collection recovery', () => {
  let listeners: Map<string, EventListener[]>;

  beforeEach(() => {
    vi.useFakeTimers();
    vi.setSystemTime(new Date('2026-10-08T02:00:00Z'));
    vi.mocked(apiPost).mockReset().mockResolvedValue({});
    listeners = new Map();
    vi.stubGlobal('window', {
      location: { pathname: '/zh', search: '', hostname: 'www.jssngyl.cn' },
      sessionStorage: storageMock(),
      localStorage: storageMock(),
      matchMedia: () => ({ matches: false }),
      setTimeout: (callback: () => void, delay: number) => setTimeout(callback, delay),
      clearTimeout: (timer: ReturnType<typeof setTimeout>) => clearTimeout(timer),
      setInterval: (callback: () => void, delay: number) => setInterval(callback, delay),
      clearInterval: (timer: ReturnType<typeof setInterval>) => clearInterval(timer),
      addEventListener: (name: string, fn: EventListener) => {
        listeners.set(name, [...(listeners.get(name) ?? []), fn]);
      },
      removeEventListener: (name: string, fn: EventListener) => {
        listeners.set(
          name,
          (listeners.get(name) ?? []).filter((item) => item !== fn),
        );
      },
    });
    vi.stubGlobal('document', {
      title: '江苏苏能工业炉',
      referrer: 'https://www.baidu.com/s?wd=台车炉',
      visibilityState: 'visible',
      hasFocus: () => true,
    });
    vi.stubGlobal('navigator', { webdriver: false });
  });

  afterEach(() => {
    vi.clearAllTimers();
    vi.useRealTimers();
    vi.unstubAllGlobals();
  });

  function fireInteraction() {
    for (const listener of [...(listeners.get('scroll') ?? [])]) {
      listener({ isTrusted: true } as Event);
    }
  }

  async function tick(seconds: number) {
    for (let index = 0; index < seconds; index += 1) tickDwell();
    await settleRequests();
  }

  it.each(['property', 'getItem', 'setItem'] as const)(
    'retains one visitor/session and records 20 seconds once when storage fails at %s',
    async (mode) => {
      for (const name of ['sessionStorage', 'localStorage'] as const) {
        if (mode === 'property') {
          Object.defineProperty(window, name, {
            configurable: true,
            get: () => {
              throw new Error('Storage denied');
            },
          });
        } else {
          window[name][mode] = () => {
            throw new Error('Storage denied');
          };
        }
      }
      const first = buildLeadSourceSnapshot();
      installVisitorNatureTracking();
      trackPageView();
      fireInteraction();
      await tick(15);
      window.location.pathname = '/zh/contact';
      Object.defineProperty(document, 'referrer', {
        configurable: true,
        value: 'https://www.jssngyl.cn/zh',
      });
      trackPageView();
      await tick(10);
      fireInteraction();
      await settleRequests();
      const last = buildLeadSourceSnapshot();
      expect(first.visitorId).toBeTruthy();
      expect(first.sessionId).toBeTruthy();
      expect(last).toMatchObject({
        visitorId: first.visitorId,
        sessionId: first.sessionId,
        landingPage: '/zh',
        sourceType: '自然搜索',
      });
      for (const type of ['dwell_5s', 'dwell_20s', 'engaged_session', 'effective_interaction']) {
        expect(postedBodies().filter((body) => body.eventType === type)).toHaveLength(1);
      }
    },
  );

  it('clears stale success markers in memory when removing stored keys fails', async () => {
    const first = buildLeadSourceSnapshot();
    window.sessionStorage.setItem('suneng_effective_interaction_recorded_v1', '1');
    window.sessionStorage.setItem('suneng_dwell_seconds', '60');
    window.sessionStorage.setItem('suneng_dwell_milestone', '3');
    window.sessionStorage.removeItem = () => {
      throw new Error('Storage denied');
    };
    vi.setSystemTime(Date.now() + 31 * 60 * 1000);
    installVisitorNatureTracking();
    fireInteraction();
    await tick(20);
    expect(buildLeadSourceSnapshot().sessionId).not.toBe(first.sessionId);
    expect(
      postedBodies().filter((body) => body.eventType === 'effective_interaction'),
    ).toHaveLength(1);
    expect(postedBodies().filter((body) => body.eventType === 'dwell_20s')).toHaveLength(1);
  });

  it('retries a failed dwell milestone with the same collection ID and original page', async () => {
    let failed = false;
    vi.mocked(apiPost).mockImplementation((_path, options) => {
      if ((options?.body as { eventType: string }).eventType === 'dwell_20s' && !failed) {
        failed = true;
        return Promise.reject(new Error('Response lost'));
      }
      return Promise.resolve({});
    });
    await tick(20);
    window.location.pathname = '/zh/contact';
    await tick(1);
    const milestones = postedBodies().filter((body) => body.eventType === 'dwell_20s');
    expect(milestones).toHaveLength(2);
    expect(milestones[1]).toEqual(milestones[0]);
    expect(milestones[0].properties?.collectionId).toBeTruthy();
    expect(milestones[1].pagePath).toBe('/zh');
  });

  it('discards a failed dwell payload when the session expires', async () => {
    let failed = false;
    vi.mocked(apiPost).mockImplementation((_path, options) => {
      if ((options?.body as { eventType: string }).eventType === 'dwell_5s' && !failed) {
        failed = true;
        return Promise.reject(new Error('Response lost'));
      }
      return Promise.resolve({});
    });
    await tick(5);
    vi.setSystemTime(Date.now() + 31 * 60 * 1000);
    window.location.pathname = '/zh/contact';
    await tick(5);
    const milestones = postedBodies().filter((body) => body.eventType === 'dwell_5s');
    expect(milestones).toHaveLength(2);
    expect(milestones[1].properties?.collectionId).not.toBe(milestones[0].properties?.collectionId);
    expect(milestones[1].sessionId).not.toBe(milestones[0].sessionId);
    expect(milestones[1].pagePath).toBe('/zh/contact');
  });

  it('retries a failed page view with the original source and page after navigation', async () => {
    vi.mocked(apiPost).mockRejectedValueOnce(new Error('Offline'));
    window.location.search = '?acquisition_qa=recovery_1';
    trackPageView();
    await settleRequests();
    const original = postedBodies()[0];
    window.location.pathname = '/zh/contact';
    window.location.search = '';
    Object.defineProperty(document, 'referrer', {
      configurable: true,
      value: 'https://www.jssngyl.cn/zh',
    });
    trackPageView();
    await vi.advanceTimersByTimeAsync(1000);
    expect(postedBodies().filter((body) => body.pagePath === '/zh')).toEqual([original, original]);
    expect(original.properties?.collectionId).toBeTruthy();
    expect(original.properties?.manual_qa).toBe(true);
    expect(postedBodies().at(-1)).toMatchObject({
      sessionId: original.sessionId,
      visitorId: original.visitorId,
      sourceType: '自然搜索',
      pagePath: '/zh',
    });
  });

  it('stops after two retries and never creates an unlimited retry loop', async () => {
    vi.mocked(apiPost).mockRejectedValue(new Error('Offline'));
    trackPageView();
    await vi.advanceTimersByTimeAsync(30_000);
    expect(postedBodies()).toHaveLength(3);
    expect(vi.getTimerCount()).toBe(0);
  });

  it('drops an old retry after a new session starts', async () => {
    vi.mocked(apiPost).mockRejectedValueOnce(new Error('Offline'));
    trackPageView();
    await settleRequests();
    const original = postedBodies()[0];
    vi.setSystemTime(Date.now() + 31 * 60 * 1000);
    window.location.pathname = '/zh/contact';
    trackPageView();
    await vi.advanceTimersByTimeAsync(10_000);
    expect(postedBodies().filter((body) => body.sessionId === original.sessionId)).toHaveLength(1);
    expect(postedBodies().at(-1)?.sessionId).not.toBe(original.sessionId);
  });

  it('reinstalls one interaction listener after the accepted session expires and cleans up on stop', async () => {
    const stop = installVisitorNatureTracking();
    installVisitorNatureTracking();
    expect(listeners.get('scroll')).toHaveLength(1);
    fireInteraction();
    await settleRequests();
    expect([...listeners.values()].flat()).toHaveLength(0);
    vi.setSystemTime(Date.now() + 31 * 60 * 1000);
    tickDwell();
    expect(listeners.get('scroll')).toHaveLength(1);
    fireInteraction();
    await settleRequests();
    const interactions = postedBodies().filter(
      (body) => body.eventType === 'effective_interaction',
    );
    expect(interactions).toHaveLength(2);
    expect(interactions[1].sessionId).not.toBe(interactions[0].sessionId);
    stop();
    vi.setSystemTime(Date.now() + 31 * 60 * 1000);
    tickDwell();
    expect([...listeners.values()].flat()).toHaveLength(0);
  });

  it('keeps a single dwell timer across repeated starts', async () => {
    const stopFirst = startDwellTracking();
    const stopSecond = startDwellTracking();
    expect(vi.getTimerCount()).toBe(1);
    stopFirst();
    await vi.advanceTimersByTimeAsync(5000);
    expect(window.sessionStorage.getItem('suneng_dwell_seconds')).toBe('5');
    stopSecond();
    expect(vi.getTimerCount()).toBe(0);
  });

  it('retains automation on raw events when the separate marker request fails', async () => {
    vi.stubGlobal('navigator', { webdriver: true });
    window.location.search = '?acquisition_qa=recovery_automation';
    vi.mocked(apiPost).mockImplementation((_path, options) =>
      (options?.body as { eventType?: string })?.eventType === 'automation_signal'
        ? Promise.reject(new Error('Offline'))
        : Promise.resolve({}),
    );
    installVisitorNatureTracking();
    trackPageView();
    trackLeadEvent('phone_click', {
      properties: {
        ...Object.fromEntries(Array.from({ length: 24 }, (_, index) => [`detail${index}`, index])),
        automationDetected: false,
        collectionId: 'caller-supplied',
      },
    });
    await tick(20);
    await vi.advanceTimersByTimeAsync(5000);
    expect(postedBodies().every((body) => body.properties?.automationDetected === true)).toBe(true);
    expect(postedBodies().every((body) => body.properties?.manual_qa === true)).toBe(true);
    expect(postedBodies().every((body) => Object.keys(body.properties ?? {}).length <= 24)).toBe(
      true,
    );
    expect(
      postedBodies().every((body) => body.properties?.collectionId !== 'caller-supplied'),
    ).toBe(true);
    const markerIds = postedBodies()
      .filter((body) => body.eventType === 'automation_signal')
      .map((body) => body.properties?.collectionId);
    expect(new Set(markerIds).size).toBe(1);
    expect(postedBodies().filter((body) => body.eventType === 'automation_signal')).toHaveLength(3);
    expect(postedBodies().some((body) => body.eventType === 'page_view')).toBe(true);
    expect(postedBodies().some((body) => body.eventType === 'dwell_20s')).toBe(true);
    expect([...listeners.values()].flat()).toHaveLength(0);
  });

  it('starts a new automation marker after timeout without recursive session rotation', async () => {
    vi.stubGlobal('navigator', { webdriver: true });
    installVisitorNatureTracking();
    await settleRequests();
    vi.setSystemTime(Date.now() + 31 * 60 * 1000);
    expect(() => trackPageView()).not.toThrow();
    await settleRequests();
    const markers = postedBodies().filter((body) => body.eventType === 'automation_signal');
    expect(markers).toHaveLength(2);
    expect(markers[1].sessionId).not.toBe(markers[0].sessionId);
  });

  it('does not mark regular user events as automation', () => {
    trackLeadEvent('module_view', { properties: { automationDetected: true } });
    expect(postedBodies()[0].properties?.automationDetected).not.toBe(true);
  });
});
