import { beforeEach, describe, expect, it, vi } from 'vitest';

import { apiPost } from '@/lib/api/client';
import { markEngagedSession, tickDwell, trackLeadEvent, trackPageView } from '@/lib/api/lead-events';

vi.mock('@/lib/api/client', () => ({ apiPost: vi.fn(() => Promise.resolve({})) }));

function storageMock() {
  const values = new Map<string, string>();
  return {
    getItem: (key: string) => values.get(key) ?? null,
    setItem: (key: string, value: string) => values.set(key, value),
    removeItem: (key: string) => values.delete(key),
  } as unknown as Storage;
}

function postedEventTypes() {
  return vi
    .mocked(apiPost)
    .mock.calls.map(
      (call) => (call[1] as { body?: { eventType?: string } } | undefined)?.body?.eventType,
    );
}

describe('website reading events', () => {
  beforeEach(() => {
    vi.mocked(apiPost).mockClear();
    vi.stubGlobal('window', {
      location: { pathname: '/zh/products/detail/trolley-furnace', search: '' },
      sessionStorage: storageMock(),
      localStorage: storageMock(),
      matchMedia: () => ({ matches: false }),
    });
    vi.stubGlobal('document', { title: '台车炉', referrer: '' });
  });

  it('records page views and marks a two-page session as actually read once', () => {
    trackPageView();
    expect(postedEventTypes()[0]).toBe('page_view');
    window.location.pathname = '/zh/service/furnace-renovation-overhaul';
    trackPageView();
    expect(postedEventTypes().filter((eventType) => eventType === 'engaged_session')).toHaveLength(
      1,
    );
    markEngagedSession();
    expect(postedEventTypes().filter((eventType) => eventType === 'engaged_session')).toHaveLength(
      1,
    );
  });

  it('marks high-intent contact behavior as an actually read visit', () => {
    trackLeadEvent('phone_click');
    expect(postedEventTypes()).toEqual(['phone_click', 'engaged_session']);
  });

  it('starts a new visit after 30 minutes of inactivity', () => {
    const now = vi.spyOn(Date, 'now').mockReturnValue(1_000);
    trackPageView();
    const firstSession = (vi.mocked(apiPost).mock.calls[0][1] as { body?: { sessionId?: string } })
      .body?.sessionId;
    now.mockReturnValue(30 * 60 * 1000 + 2_000);
    trackPageView();
    const secondSession = (
      vi.mocked(apiPost).mock.calls.at(-1)?.[1] as { body?: { sessionId?: string } }
    ).body?.sessionId;
    expect(firstSession).toBeTruthy();
    expect(secondSession).toBeTruthy();
    expect(secondSession).not.toBe(firstSession);
    now.mockRestore();
  });
});

describe('visitor nature signals', () => {
  beforeEach(() => {
    vi.mocked(apiPost).mockClear();
    vi.stubGlobal('document', { title: '台车炉', referrer: '' });
  });

  function windowWithListeners(overrides: Record<string, unknown> = {}) {
    const listeners = new Map<string, EventListener[]>();
    vi.stubGlobal('window', {
      location: { pathname: '/zh', search: '' },
      sessionStorage: storageMock(),
      localStorage: storageMock(),
      matchMedia: () => ({ matches: false }),
      addEventListener: (name: string, fn: EventListener) => {
        listeners.set(name, [...(listeners.get(name) ?? []), fn]);
      },
      removeEventListener: (name: string, fn: EventListener) => {
        listeners.set(name, (listeners.get(name) ?? []).filter((item) => item !== fn));
      },
      ...overrides,
    });
    return listeners;
  }

  it('marks an automated browser once and never listens for interaction', async () => {
    vi.stubGlobal('navigator', { webdriver: true });
    const listeners = windowWithListeners();
    const { installVisitorNatureTracking } = await import('@/lib/api/lead-events');

    installVisitorNatureTracking();
    installVisitorNatureTracking();

    expect(postedEventTypes().filter((type) => type === 'automation_signal')).toHaveLength(1);
    expect(postedEventTypes()).not.toContain('human_signal');
    expect([...listeners.values()].flat()).toHaveLength(0);
  });

  it('marks a human only on the first trusted interaction, once per session', async () => {
    vi.stubGlobal('navigator', { webdriver: false });
    const listeners = windowWithListeners();
    const { installVisitorNatureTracking } = await import('@/lib/api/lead-events');

    installVisitorNatureTracking();
    expect(postedEventTypes()).toHaveLength(0);

    const fire = (trusted: boolean) => {
      for (const fn of [...(listeners.get('scroll') ?? [])]) {
        fn({ isTrusted: trusted } as Event);
      }
    };
    // 页面脚本合成的事件不算人
    fire(false);
    expect(postedEventTypes()).not.toContain('human_signal');
    // 第一次真实交互记一次
    fire(true);
    expect(postedEventTypes().filter((type) => type === 'human_signal')).toHaveLength(1);
    // 监听器已拆除，之后不再重复
    expect([...listeners.values()].flat()).toHaveLength(0);
    installVisitorNatureTracking();
    fire(true);
    expect(postedEventTypes().filter((type) => type === 'human_signal')).toHaveLength(1);
  });
});

describe('停留时长（进官网就计时，跨页面累计）', () => {
  function focusOn(visible = true, focused = true) {
    vi.stubGlobal('document', {
      title: '台车炉',
      referrer: '',
      visibilityState: visible ? 'visible' : 'hidden',
      hasFocus: () => focused,
    });
  }

  beforeEach(() => {
    vi.mocked(apiPost).mockClear();
    vi.stubGlobal('window', {
      location: { pathname: '/zh', search: '' },
      sessionStorage: storageMock(),
      localStorage: storageMock(),
      matchMedia: () => ({ matches: false }),
    });
    focusOn();
  });

  function tick(seconds: number) {
    for (let i = 0; i < seconds; i += 1) tickDwell();
  }

  it('首页也计时——不再只认产品详情等重点页', () => {
    window.location.pathname = '/zh';
    tick(5);
    expect(postedEventTypes()).toContain('dwell_5s');
  });

  it('满 20 秒记一次「有实际阅读」，里程碑各只发一次', () => {
    tick(25);
    const types = postedEventTypes();
    expect(types.filter((t) => t === 'dwell_5s')).toHaveLength(1);
    expect(types.filter((t) => t === 'dwell_20s')).toHaveLength(1);
    expect(types.filter((t) => t === 'engaged_session')).toHaveLength(1);
    expect(types).not.toContain('dwell_60s');
  });

  it('窗口没有焦点就不累计——无头浏览器默认拿不到焦点', () => {
    focusOn(true, false);
    tick(30);
    expect(postedEventTypes()).toHaveLength(0);
  });

  it('页面切到后台不累计', () => {
    focusOn(false, true);
    tick(30);
    expect(postedEventTypes()).toHaveLength(0);
  });

  it('秒数跨页面接着走：第一页 15 秒 + 第二页 5 秒 = 满 20 秒', () => {
    tick(15);
    expect(postedEventTypes()).not.toContain('dwell_20s');
    window.location.pathname = '/zh/news';
    tick(5);
    expect(postedEventTypes()).toContain('dwell_20s');
  });

  it('中途失焦不清零，重新聚焦接着算', () => {
    tick(18);
    focusOn(true, false);
    tick(50);
    focusOn(true, true);
    tick(2);
    expect(postedEventTypes()).toContain('dwell_20s');
    expect(postedEventTypes()).not.toContain('dwell_60s');
  });
});
