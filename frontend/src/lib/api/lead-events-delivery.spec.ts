import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { apiPost } from './client';
vi.mock('@/lib/api/client', () => ({ apiPost: vi.fn() }));
type Body = {
  eventType: string;
  sessionId: string;
  visitorId: string;
  pagePath: string;
  sourceType: string;
  properties: {
    collectionId: string;
    manual_qa: boolean;
    internal_traffic: boolean;
    collectorBuild?: string;
  };
};
function storageMock() {
  const map = new Map<string, string>();
  return {
    get length() {
      return map.size;
    },
    key: (i: number) => [...map.keys()][i] ?? null,
    getItem: (k: string) => map.get(k) ?? null,
    setItem: (k: string, v: string) => {
      map.set(k, v);
    },
    removeItem: (k: string) => {
      map.delete(k);
    },
    clear: () => map.clear(),
  } satisfies Storage;
}
const settle = async () => {
  for (let i = 0; i < 32; i++) await Promise.resolve();
};
describe('recovery across actual module/document lifetimes', () => {
  let local: Storage, session: Storage, fail: boolean, lostDwellAck: boolean;
  let stored: Map<string, Body>, attempts: Body[];
  async function documentAt(path: string, qa = true) {
    vi.clearAllTimers();
    vi.resetModules();
    vi.stubGlobal('window', {
      location: {
        pathname: path,
        search: qa ? '?acquisition_qa=isolated' : '',
        hostname: 'www.jssngyl.cn',
      },
      localStorage: local,
      sessionStorage: session,
      setTimeout,
      clearTimeout,
      setInterval,
      clearInterval,
      addEventListener: vi.fn(),
      removeEventListener: vi.fn(),
      matchMedia: () => ({ matches: false }),
    });
    vi.stubGlobal('document', {
      title: path,
      referrer: path === '/a' ? 'https://www.baidu.com/s?wd=furnace' : '',
      visibilityState: 'visible',
      hasFocus: () => true,
    });
    vi.stubGlobal('navigator', { webdriver: false });
    return import('./lead-events');
  }
  beforeEach(() => {
    vi.useFakeTimers();
    vi.setSystemTime(new Date('2026-10-19T12:00:00Z'));
    local = storageMock();
    session = storageMock();
    stored = new Map();
    attempts = [];
    fail = false;
    lostDwellAck = false;
    vi.mocked(apiPost)
      .mockReset()
      .mockImplementation(async (_url, options) => {
        const p = options!.body as Body;
        attempts.push(p);
        if (fail) throw new Error('offline');
        const key = [p.sessionId, p.eventType, p.properties.collectionId].join('|');
        if (!stored.has(key)) stored.set(key, p);
        if (lostDwellAck && p.eventType === 'dwell_5s')
          throw new Error('committed but response lost');
        return {};
      });
  });
  afterEach(async () => {
    await settle();
    vi.clearAllTimers();
    vi.useRealTimers();
    vi.unstubAllGlobals();
  });
  const rows = (type: string) => [...stored.values()].filter((p) => p.eventType === type);

  it('restores the missing first page alongside dwell after a long initial outage', async () => {
    const c = await documentAt('/a');
    fail = true;
    c.trackPageView();
    c.startDwellTracking();
    await vi.advanceTimersByTimeAsync(5500);
    fail = false;
    await vi.advanceTimersByTimeAsync(22_000);
    expect(rows('page_view')).toHaveLength(1);
    expect(rows('dwell_5s')).toHaveLength(1);
    expect(rows('dwell_20s')).toHaveLength(1);
    expect(new Set([...stored.values()].map((p) => p.sessionId)).size).toBe(1);
    expect(
      attempts
        .filter((p) => p.eventType === 'page_view')
        .every((p) => p.properties.collectionId === rows('page_view')[0].properties.collectionId),
    ).toBe(true);
  });
  it('replays the old page after full navigation, preserving its payload and source', async () => {
    const a = await documentAt('/a');
    fail = true;
    a.trackPageView();
    await settle();
    const original = attempts[0];
    const b = await documentAt('/b');
    fail = false;
    b.trackPageView();
    await vi.advanceTimersByTimeAsync(200);
    expect(rows('page_view')).toHaveLength(2);
    expect(rows('page_view').find((p) => p.pagePath === '/a')).toEqual(original);
  });
  it('replays an older collector packet without relabelling it as the current build', async () => {
    const a = await documentAt('/a');
    fail = true;
    a.trackPageView();
    await settle();
    const original: Body = JSON.parse(JSON.stringify(attempts[0]));
    delete original.properties.collectorBuild;
    const key = 'suneng_collection_pending_v1:' + original.properties.collectionId;
    const queued = JSON.parse(local.getItem(key)!);
    queued.payload = original;
    local.setItem(key, JSON.stringify(queued));
    const b = await documentAt('/b');
    fail = false;
    b.trackPageView();
    await vi.advanceTimersByTimeAsync(200);
    expect(rows('page_view').find((p) => p.pagePath === '/a')).toEqual(original);
    expect(rows('page_view').find((p) => p.pagePath === '/b')?.properties.collectorBuild).toBe(
      'outbox-20261020-receipts',
    );
  });
  it('recovers after tab closure without mixing old QA/internal classification into a new visit', async () => {
    local.setItem('suneng_internal_traffic_browser_v1', '1');
    const a = await documentAt('/a');
    fail = true;
    a.trackPageView();
    await settle();
    const original = attempts[0];
    session = storageMock();
    local.removeItem('suneng_internal_traffic_browser_v1');
    const b = await documentAt('/b', false);
    fail = false;
    b.trackPageView();
    await vi.advanceTimersByTimeAsync(200);
    const old = rows('page_view').find((p) => p.pagePath === '/a')!,
      next = rows('page_view').find((p) => p.pagePath === '/b')!;
    expect(old).toEqual(original);
    expect(old.properties).toMatchObject({ manual_qa: true, internal_traffic: true });
    expect(next.properties).toMatchObject({ manual_qa: false, internal_traffic: false });
    expect(next.sessionId).not.toBe(old.sessionId);
    expect(next.visitorId).toBe(old.visitorId);
  });
  it('keeps one raw dwell record after lost acknowledgement and full navigation', async () => {
    const a = await documentAt('/a');
    lostDwellAck = true;
    a.trackPageView();
    a.startDwellTracking();
    await vi.advanceTimersByTimeAsync(6500);
    const original = rows('dwell_5s')[0];
    expect(original).toBeTruthy();
    const b = await documentAt('/b');
    lostDwellAck = false;
    b.trackPageView();
    b.startDwellTracking();
    await vi.advanceTimersByTimeAsync(3000);
    expect(rows('dwell_5s')).toEqual([original]);
    expect(session.getItem('suneng_dwell_milestone')).toBe('1');
    expect(
      attempts
        .filter((p) => p.eventType === 'dwell_5s')
        .every(
          (p) =>
            p.properties.collectionId === original.properties.collectionId && p.pagePath === '/a',
        ),
    ).toBe(true);
  });
  it('retains stable milestone identity even if navigation loses the local success marker', async () => {
    const a = await documentAt('/a');
    a.trackPageView();
    a.startDwellTracking();
    await vi.advanceTimersByTimeAsync(5100);
    const id = rows('dwell_5s')[0].properties.collectionId;
    session.setItem('suneng_dwell_milestone', '0');
    const b = await documentAt('/b');
    b.trackPageView();
    b.startDwellTracking();
    await vi.advanceTimersByTimeAsync(1100);
    expect(rows('dwell_5s')).toHaveLength(1);
    expect(attempts.filter((p) => p.eventType === 'dwell_5s').at(-1)?.properties.collectionId).toBe(
      id,
    );
  });
  it('recovers collected interaction evidence with the same visit after a later page loads', async () => {
    const a = await documentAt('/a');
    fail = true;
    a.trackPageView();
    a.trackLeadEvent('human_signal', {
      properties: { evidenceVersion: 1, interactionType: 'click', interactionStrength: 'strong' },
    });
    await settle();
    const original = attempts.find((p) => p.eventType === 'human_signal');
    const b = await documentAt('/b');
    fail = false;
    b.trackPageView();
    await vi.advanceTimersByTimeAsync(200);
    expect(rows('human_signal')).toEqual([original]);
    expect(rows('page_view')).toHaveLength(2);
  });
});
