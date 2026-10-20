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

  it('records exactly one new page view when returning after 31 hidden minutes', async () => {
    trackPageView();
    await tick(20);
    const first = postedBodies()[0];
    Object.assign(document, { visibilityState: 'hidden' });
    vi.setSystemTime(Date.now() + 31 * 60 * 1000);
    await tick(5);
    expect(postedBodies().filter((body) => body.eventType === 'page_view')).toHaveLength(1);
    Object.assign(document, { visibilityState: 'visible' });
    await tick(1);
    const views = postedBodies().filter((body) => body.eventType === 'page_view');
    expect(views).toHaveLength(2);
    expect(views[1].sessionId).not.toBe(first.sessionId);
    expect(views[1]).toMatchObject({ visitorId: first.visitorId, pagePath: '/zh' });
    expect(postedBodies().filter((body) => body.sessionId === views[1].sessionId)).toHaveLength(1);
    await tick(4);
    expect(postedBodies().filter((body) => body.eventType === 'page_view')).toHaveLength(2);
    expect(
      postedBodies()
        .filter((body) => body.eventType === 'dwell_5s')
        .at(-1)?.sessionId,
    ).toBe(views[1].sessionId);
  });

  it('does not add a page view for a short focus break or after explicit route tracking', async () => {
    trackPageView();
    const first = postedBodies()[0].sessionId;
    vi.setSystemTime(Date.now() + 29 * 60 * 1000);
    await tick(1);
    expect(postedBodies().filter((body) => body.eventType === 'page_view')).toHaveLength(1);
    expect(buildLeadSourceSnapshot().sessionId).toBe(first);
    vi.setSystemTime(Date.now() + 31 * 60 * 1000);
    window.location.pathname = '/zh/contact';
    trackPageView();
    await tick(5);
    expect(postedBodies().filter((body) => body.eventType === 'page_view')).toHaveLength(2);
  });

  it('records the resumed view before a contact action and avoids a second timer view', async () => {
    trackPageView();
    vi.setSystemTime(Date.now() + 31 * 60 * 1000);
    trackLeadEvent('phone_click');
    await tick(5);
    const bodies = postedBodies();
    expect(bodies.filter((body) => body.eventType === 'page_view')).toHaveLength(2);
    expect(bodies[1].eventType).toBe('page_view');
    expect(bodies[2]).toMatchObject({ eventType: 'phone_click', sessionId: bodies[1].sessionId });
  });

  it('retries the resumed page view with the same receipt and no new visit', async () => {
    trackPageView();
    vi.setSystemTime(Date.now() + 31 * 60 * 1000);
    vi.mocked(apiPost).mockRejectedValueOnce(new Error('Network temporarily unavailable'));
    await tick(1);
    const resumed = postedBodies().filter((body) => body.eventType === 'page_view')[1];
    await vi.advanceTimersByTimeAsync(1000);
    await tick(1);
    const views = postedBodies().filter((body) => body.eventType === 'page_view');
    expect(views).toHaveLength(3);
    expect(views[2]).toEqual(resumed);
  });

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

  it('keeps bounded recovery after the two immediate retries', async () => {
    vi.mocked(apiPost).mockRejectedValue(new Error('Offline'));
    trackPageView();
    await vi.advanceTimersByTimeAsync(30_000);
    expect(postedBodies()).toHaveLength(4);
    expect(vi.getTimerCount()).toBe(1);
    expect(new Set(postedBodies().map((body) => body.properties?.collectionId)).size).toBe(1);
  });

  it('recovers the original visit without assigning its event to a new session', async () => {
    vi.mocked(apiPost).mockRejectedValueOnce(new Error('Offline'));
    trackPageView();
    await settleRequests();
    const original = postedBodies()[0];
    vi.setSystemTime(Date.now() + 31 * 60 * 1000);
    window.location.pathname = '/zh/contact';
    trackPageView();
    await vi.advanceTimersByTimeAsync(10_000);
    expect(postedBodies().filter((body) => body.sessionId === original.sessionId)).toEqual([
      original,
      original,
    ]);
    expect(postedBodies().find((body) => body.pagePath === '/zh/contact')?.sessionId).not.toBe(
      original.sessionId,
    );
  });

  it('reinstalls one interaction listener after the accepted session expires and cleans up on stop', async () => {
    const stop = installVisitorNatureTracking();
    installVisitorNatureTracking();
    expect(listeners.get('scroll')).toHaveLength(1);
    fireInteraction();
    await settleRequests();
    expect(listeners.get('scroll')).toHaveLength(0);
    expect(listeners.get('keydown')).toHaveLength(1);
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

  it('records one new page view before resumed quiet reading after a hidden idle timeout', async () => {
    trackPageView();
    const original = postedBodies()[0];
    const stop = startDwellTracking();
    await vi.advanceTimersByTimeAsync(10_000);
    Object.defineProperty(document, 'visibilityState', { configurable: true, value: 'hidden' });
    await vi.advanceTimersByTimeAsync(31 * 60 * 1000);
    expect(postedBodies().filter((body) => body.eventType === 'page_view')).toHaveLength(1);
    expect(window.sessionStorage.getItem('suneng_dwell_seconds')).toBe('10');
    Object.defineProperty(document, 'visibilityState', { configurable: true, value: 'visible' });
    await vi.advanceTimersByTimeAsync(20_000);
    const pages = postedBodies().filter((body) => body.eventType === 'page_view');
    expect(pages).toHaveLength(2);
    expect(pages[1]).toMatchObject({
      pagePath: original.pagePath,
      visitorId: original.visitorId,
      properties: { pageViewReason: 'session_resume', collectorVersion: '2' },
    });
    expect(pages[1].sessionId).not.toBe(original.sessionId);
    expect(postedBodies().find((body) => body.eventType === 'dwell_20s')).toMatchObject({
      sessionId: pages[1].sessionId,
    });
    expect(postedBodies().filter((body) => body.sessionId === pages[1].sessionId)[0]).toBe(
      pages[1],
    );
    expect(postedBodies().some((body) => body.eventType === 'human_signal')).toBe(false);
    stop();
  });

  it('keeps a resumed page view stable during retry and concurrent input and dwell', async () => {
    trackPageView();
    installVisitorNatureTracking();
    await settleRequests();
    vi.setSystemTime(Date.now() + 31 * 60 * 1000);
    vi.mocked(apiPost).mockImplementation((_path, options) => {
      const body = options?.body as { eventType: string; properties?: Record<string, unknown> };
      if (body.eventType === 'page_view' && body.properties?.pageViewReason === 'session_resume') {
        return Promise.reject(new Error('Response lost'));
      }
      return Promise.resolve({});
    });
    fireInteraction();
    await tick(5);
    await vi.advanceTimersByTimeAsync(5000);
    const resumed = postedBodies().filter(
      (body) => body.properties?.pageViewReason === 'session_resume',
    );
    expect(resumed).toHaveLength(3);
    expect(resumed[1]).toEqual(resumed[0]);
    expect(resumed[2]).toEqual(resumed[0]);
    await tick(20);
    expect(
      postedBodies().filter((body) => body.properties?.pageViewReason === 'session_resume'),
    ).toHaveLength(3);
  });

  it('records a resumed view for a quick contact before the next timer tick', async () => {
    trackPageView();
    await settleRequests();
    vi.setSystemTime(Date.now() + 31 * 60 * 1000);
    trackLeadEvent('phone_click');
    const pages = postedBodies().filter((body) => body.eventType === 'page_view');
    expect(pages).toHaveLength(2);
    expect(pages[1].properties?.pageViewReason).toBe('session_resume');
    expect(postedBodies().find((body) => body.eventType === 'phone_click')?.sessionId).toBe(
      pages[1].sessionId,
    );
    await tick(5);
    expect(postedBodies().filter((body) => body.eventType === 'page_view')).toHaveLength(2);
  });

  it('leaves normal navigation and reload page views distinct after an idle timeout', async () => {
    trackPageView();
    await settleRequests();
    vi.setSystemTime(Date.now() + 31 * 60 * 1000);
    window.location.pathname = '/zh/contact';
    tickDwell(); // Router effect has not run yet: it owns this page view.
    trackPageView();
    await tick(5);
    let pages = postedBodies().filter((body) => body.eventType === 'page_view');
    expect(pages).toHaveLength(2);
    expect(pages[1].pagePath).toBe('/zh/contact');
    expect(pages[1].properties?.pageViewReason).toBeUndefined();
    vi.stubGlobal('window', { ...window }); // Full reload retains browser storage.
    trackPageView();
    pages = postedBodies().filter((body) => body.eventType === 'page_view');
    expect(pages).toHaveLength(3);
    expect(pages[2].sessionId).toBe(pages[1].sessionId);
    expect(pages[2].properties?.collectionId).not.toBe(pages[1].properties?.collectionId);
  });

  it.each(['click', 'pointerdown', 'touchstart', 'keydown'])(
    'records only the first trusted %s kind, never event contents',
    async (type) => {
      installVisitorNatureTracking();
      const fire = (name: string, trusted: boolean) => {
        for (const listener of [...(listeners.get(name) ?? [])]) {
          listener({
            isTrusted: trusted,
            key: 'secret typed text',
            clientX: 123,
            target: 'private-input',
          } as unknown as Event);
        }
      };
      fire(type, false);
      expect(postedBodies()).toHaveLength(0);
      fire('scroll', true);
      await settleRequests();
      expect(
        postedBodies().filter((body) => body.eventType === 'effective_interaction'),
      ).toHaveLength(1);
      expect(postedBodies()[0].properties).toMatchObject({
        evidenceVersion: 1,
        interactionType: 'scroll',
        interactionStrength: 'weak',
      });
      expect(postedBodies().some((body) => body.eventType === 'human_signal')).toBe(false);
      fire(type, true);
      await settleRequests();
      for (const name of ['click', 'pointerdown', 'touchstart', 'keydown']) fire(name, true);
      await settleRequests();
      const strong = postedBodies().filter((body) => body.eventType === 'human_signal');
      expect(strong).toHaveLength(1);
      expect(strong[0].properties).toMatchObject({
        evidenceVersion: 1,
        interactionType: type,
        interactionStrength: 'strong',
      });
      expect(JSON.stringify(postedBodies())).not.toMatch(/secret typed text|private-input|clientX/);
      expect([...listeners.values()].flat()).toHaveLength(0);
    },
  );

  it('retains the first strong input payload and collection ID across response loss', async () => {
    let failed = false;
    vi.mocked(apiPost).mockImplementation((_path, options) => {
      if ((options?.body as { eventType: string }).eventType === 'human_signal' && !failed) {
        failed = true;
        return Promise.reject(new Error('Response lost'));
      }
      return Promise.resolve({});
    });
    installVisitorNatureTracking();
    for (const listener of [...(listeners.get('keydown') ?? [])])
      listener({ isTrusted: true } as Event);
    await settleRequests();
    for (const listener of [...(listeners.get('touchstart') ?? [])])
      listener({ isTrusted: true } as Event);
    await vi.advanceTimersByTimeAsync(1000);
    const strong = postedBodies().filter((body) => body.eventType === 'human_signal');
    expect(strong).toHaveLength(2);
    expect(strong[1]).toEqual(strong[0]);
    expect(strong[1].properties?.interactionType).toBe('keydown');
  });

  it('retains the first strong input after exhausted retries, then resets it for the next visit', async () => {
    let attempts = 0;
    vi.mocked(apiPost).mockImplementation((_path, options) => {
      if (
        (options?.body as { eventType: string }).eventType === 'human_signal' &&
        ++attempts <= 3
      ) {
        return Promise.reject(new Error('Response lost after server accepted'));
      }
      return Promise.resolve({});
    });
    installVisitorNatureTracking();
    const fire = (type: string) => {
      for (const listener of [...(listeners.get(type) ?? [])])
        listener({ isTrusted: true } as Event);
    };
    fire('keydown');
    await vi.advanceTimersByTimeAsync(5000);
    const failed = postedBodies().filter((body) => body.eventType === 'human_signal');
    expect(failed).toHaveLength(3);
    expect(new Set(failed.map((body) => body.properties?.collectionId)).size).toBe(1);
    window.location.pathname = '/zh/contact';
    fire('touchstart');
    await settleRequests();
    const recovered = postedBodies().filter((body) => body.eventType === 'human_signal');
    expect(recovered).toHaveLength(4);
    expect(recovered[3]).toEqual(failed[0]);
    expect(recovered[3]).toMatchObject({
      pagePath: '/zh',
      properties: { interactionType: 'keydown' },
    });
    vi.setSystemTime(Date.now() + 31 * 60 * 1000);
    tickDwell();
    fire('touchstart');
    await settleRequests();
    const next = postedBodies()
      .filter((body) => body.eventType === 'human_signal')
      .at(-1)!;
    expect(next.sessionId).not.toBe(failed[0].sessionId);
    expect(next.properties?.collectionId).not.toBe(failed[0].properties?.collectionId);
    expect(next.properties?.interactionType).toBe('touchstart');
  });

  it('reads only available browser brand major versions and reserves bounded system properties', () => {
    const highEntropy = vi.fn(() => {
      throw new Error('Must not request fingerprint data');
    });
    vi.stubGlobal('navigator', {
      webdriver: false,
      userAgentData: {
        brands: [
          { brand: 'Chromium', version: '144.1.2' },
          { brand: 'Example Browser', version: '145' },
        ],
        getHighEntropyValues: highEntropy,
      },
    });
    trackLeadEvent('module_view', {
      properties: {
        ...Object.fromEntries(Array.from({ length: 30 }, (_, index) => [`detail${index}`, index])),
        collectorVersion: 'spoof',
        browserBrands: 'spoof',
      },
    });
    expect(postedBodies()[0].properties).toMatchObject({
      collectorVersion: '2',
      browserBrands: 'Chromium/144; Example Browser/145',
    });
    expect(Object.keys(postedBodies()[0].properties ?? {}).length).toBeLessThanOrEqual(24);
    expect(highEntropy).not.toHaveBeenCalled();
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
    expect(
      ['scroll', 'click', 'keydown', 'pointerdown', 'touchstart'].flatMap(
        (name) => listeners.get(name) ?? [],
      ),
    ).toHaveLength(0);
    expect(
      ['online', 'pageshow', 'pagehide'].every((name) => listeners.get(name)?.length === 1),
    ).toBe(true);
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
