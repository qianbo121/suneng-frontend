import { beforeEach, describe, expect, it, vi } from 'vitest';

import { apiPost } from '@/lib/api/client';
import {
  markEngagedSession,
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
      location: {
        pathname: '/zh/products/detail/trolley-furnace',
        search: '',
        hostname: 'www.jssngyl.cn',
      },
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

  it('keeps the first source for the whole visit across full-page navigation', () => {
    vi.stubGlobal('document', {
      title: '台车炉',
      referrer: 'https://www.baidu.com/s?wd=台车炉',
    });
    trackPageView();
    window.location.pathname = '/zh/contact';
    vi.stubGlobal('document', {
      title: '联系我们',
      referrer: 'https://www.jssngyl.cn/zh/products/detail/trolley-furnace',
    });
    trackLeadEvent('phone_click');

    const bodies = vi.mocked(apiPost).mock.calls.map(
      (call) => (call[1] as { body?: { sourceType?: string; sourceDetail?: string } }).body,
    );
    expect(bodies[0]).toEqual(expect.objectContaining({ sourceType: '自然搜索', sourceDetail: '百度' }));
    expect(bodies.at(-2)).toEqual(
      expect.objectContaining({ sourceType: '自然搜索', sourceDetail: '百度' }),
    );
  });
});

describe('有效交互信号', () => {
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
        listeners.set(
          name,
          (listeners.get(name) ?? []).filter((item) => item !== fn),
        );
      },
      ...overrides,
    });
    return listeners;
  }

  async function settleRequests() {
    for (let index = 0; index < 4; index += 1) await Promise.resolve();
  }

  it('marks an automated browser once and never listens for interaction', async () => {
    vi.stubGlobal('navigator', { webdriver: true });
    const listeners = windowWithListeners();
    const { installVisitorNatureTracking } = await import('@/lib/api/lead-events');

    installVisitorNatureTracking();
    installVisitorNatureTracking();
    await settleRequests();

    expect(postedEventTypes().filter((type) => type === 'automation_signal')).toHaveLength(1);
    expect(postedEventTypes()).not.toContain('effective_interaction');
    expect([...listeners.values()].flat()).toHaveLength(0);
  });

  it('每次访问只记录第一次真实滑动或点击', async () => {
    vi.stubGlobal('navigator', { webdriver: false });
    const listeners = windowWithListeners();
    const { installVisitorNatureTracking } = await import('@/lib/api/lead-events');

    installVisitorNatureTracking();
    expect(postedEventTypes()).toHaveLength(0);

    const fire = (name: 'scroll' | 'click', trusted: boolean) => {
      for (const fn of [...(listeners.get(name) ?? [])]) {
        fn({ isTrusted: trusted } as Event);
      }
    };
    // 页面脚本合成的事件不算有效交互。
    fire('scroll', false);
    expect(postedEventTypes()).not.toContain('effective_interaction');
    // 第一次真实滑动记一次。
    fire('scroll', true);
    expect(postedEventTypes().filter((type) => type === 'effective_interaction')).toHaveLength(1);
    await settleRequests();
    // 监听器已拆除，之后不再重复
    expect([...listeners.values()].flat()).toHaveLength(0);
    installVisitorNatureTracking();
    fire('click', true);
    expect(postedEventTypes().filter((type) => type === 'effective_interaction')).toHaveLength(1);
  });

  it('不把鼠标移动和键盘输入当成有效交互', async () => {
    vi.stubGlobal('navigator', { webdriver: false });
    const listeners = windowWithListeners();
    const { installVisitorNatureTracking } = await import('@/lib/api/lead-events');

    installVisitorNatureTracking();

    expect(listeners.has('pointermove')).toBe(false);
    expect(listeners.has('keydown')).toBe(false);
    expect(listeners.has('scroll')).toBe(true);
    expect(listeners.has('click')).toBe(true);
  });

  it('有效交互上报失败时保留监听，下一次操作继续重试', async () => {
    vi.stubGlobal('navigator', { webdriver: false });
    let failedOnce = false;
    vi.mocked(apiPost).mockImplementation((_path, options) => {
      const eventType = (options?.body as { eventType?: string } | undefined)?.eventType;
      if (eventType === 'effective_interaction' && !failedOnce) {
        failedOnce = true;
        return Promise.reject(new Error('临时断网'));
      }
      return Promise.resolve({});
    });
    const listeners = windowWithListeners();
    const { installVisitorNatureTracking } = await import('@/lib/api/lead-events');
    installVisitorNatureTracking();

    const fireScroll = () => {
      for (const fn of [...(listeners.get('scroll') ?? [])]) {
        fn({ isTrusted: true } as Event);
      }
    };
    fireScroll();
    await settleRequests();
    expect(postedEventTypes().filter((type) => type === 'effective_interaction')).toHaveLength(1);
    expect(listeners.get('scroll')).toHaveLength(1);

    fireScroll();
    await settleRequests();
    expect(postedEventTypes().filter((type) => type === 'effective_interaction')).toHaveLength(2);
    expect([...listeners.values()].flat()).toHaveLength(0);
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

  async function tick(seconds: number) {
    for (let i = 0; i < seconds; i += 1) tickDwell();
    // 里程碑只在服务端接收成功后确认，等待微任务队列排空。
    for (let i = 0; i < 6; i += 1) await Promise.resolve();
  }

  it('首页也计时——不再只认产品详情等重点页', async () => {
    window.location.pathname = '/zh';
    await tick(5);
    expect(postedEventTypes()).toContain('dwell_5s');
  });

  it('满 20 秒记一次「有实际阅读」，里程碑各只发一次', async () => {
    await tick(25);
    const types = postedEventTypes();
    expect(types.filter((t) => t === 'dwell_5s')).toHaveLength(1);
    expect(types.filter((t) => t === 'dwell_20s')).toHaveLength(1);
    expect(types.filter((t) => t === 'engaged_session')).toHaveLength(1);
    expect(types).not.toContain('dwell_60s');
  });

  it('窗口没有焦点就不累计——无头浏览器默认拿不到焦点', async () => {
    focusOn(true, false);
    await tick(30);
    expect(postedEventTypes()).toHaveLength(0);
  });

  it('页面切到后台不累计', async () => {
    focusOn(false, true);
    await tick(30);
    expect(postedEventTypes()).toHaveLength(0);
  });

  it('秒数跨页面接着走：第一页 15 秒 + 第二页 5 秒 = 满 20 秒', async () => {
    await tick(15);
    expect(postedEventTypes()).not.toContain('dwell_20s');
    window.location.pathname = '/zh/news';
    await tick(5);
    expect(postedEventTypes()).toContain('dwell_20s');
  });

  it('中途失焦不清零，重新聚焦接着算', async () => {
    await tick(18);
    focusOn(true, false);
    await tick(50);
    focusOn(true, true);
    await tick(2);
    expect(postedEventTypes()).toContain('dwell_20s');
    expect(postedEventTypes()).not.toContain('dwell_60s');
  });

  it('会话过期后停留秒数从零重算，不继承上次阅读', async () => {
    const now = vi.spyOn(Date, 'now').mockReturnValue(1_000);
    trackPageView();
    await tick(20);
    expect(postedEventTypes()).toContain('dwell_20s');

    now.mockReturnValue(30 * 60 * 1000 + 2_000);
    trackPageView();
    vi.mocked(apiPost).mockClear();
    await tick(1);
    expect(postedEventTypes()).not.toContain('dwell_5s');
    await tick(4);
    expect(postedEventTypes()).toContain('dwell_5s');
    expect(postedEventTypes()).not.toContain('dwell_20s');
    now.mockRestore();
  });

  it('里程碑上报失败时不跳过，下一秒重试同一刻度', async () => {
    let failedOnce = false;
    vi.mocked(apiPost).mockImplementation((_path, options) => {
      const eventType = (options?.body as { eventType?: string } | undefined)?.eventType;
      if (eventType === 'dwell_20s' && !failedOnce) {
        failedOnce = true;
        return Promise.reject(new Error('临时断网'));
      }
      return Promise.resolve({});
    });

    await tick(20);
    expect(postedEventTypes().filter((type) => type === 'dwell_20s')).toHaveLength(1);
    await tick(1);
    expect(postedEventTypes().filter((type) => type === 'dwell_20s')).toHaveLength(2);
  });

  it('实际阅读上报失败时不写成功标记，下一秒会重试', async () => {
    let failedOnce = false;
    vi.mocked(apiPost).mockImplementation((_path, options) => {
      const eventType = (options?.body as { eventType?: string } | undefined)?.eventType;
      if (eventType === 'engaged_session' && !failedOnce) {
        failedOnce = true;
        return Promise.reject(new Error('临时断网'));
      }
      return Promise.resolve({});
    });

    await tick(20);
    expect(postedEventTypes().filter((type) => type === 'engaged_session')).toHaveLength(1);
    await tick(1);
    expect(postedEventTypes().filter((type) => type === 'engaged_session')).toHaveLength(2);
  });
});
