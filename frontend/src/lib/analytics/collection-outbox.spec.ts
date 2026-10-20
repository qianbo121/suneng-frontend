import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import {
  COLLECTION_OUTBOX_PREFIX as PREFIX,
  COLLECTION_RETENTION_MS as TTL,
  createCollectionOutbox,
} from './collection-outbox';

type Fact = { id: string; page: string; qa: boolean; session: string };
const fact: Fact = { id: 'original-id', page: '/first', qa: true, session: 'old-session' };
function storageMock() {
  const values = new Map<string, string>();
  return {
    get length() {
      return values.size;
    },
    key: (i: number) => [...values.keys()][i] ?? null,
    getItem: (k: string) => values.get(k) ?? null,
    setItem: (k: string, v: string) => {
      values.set(k, v);
    },
    removeItem: (k: string) => {
      values.delete(k);
    },
    clear: () => values.clear(),
  } satisfies Storage;
}
const settle = async () => {
  for (let i = 0; i < 12; i++) await Promise.resolve();
};

describe('durable collection delivery', () => {
  let storage: Storage;
  let events: Map<string, () => void>;
  let send: ReturnType<typeof vi.fn<(p: Fact) => Promise<boolean>>>;
  const make = () =>
    createCollectionOutbox<Fact>({
      owner: {
        setTimeout,
        clearTimeout,
        addEventListener: (n: string, cb: () => void) => events.set(n, cb),
        removeEventListener: (n: string) => events.delete(n),
      } as unknown as Window,
      storage: () => storage,
      send,
      id: (p) => p.id,
      valid: (p: unknown): p is Fact =>
        Boolean(p && typeof p === 'object' && typeof (p as Fact).id === 'string'),
    });
  beforeEach(() => {
    vi.useFakeTimers();
    vi.setSystemTime(new Date('2026-10-19T12:00:00Z'));
    storage = storageMock();
    events = new Map();
    send = vi.fn(async () => true);
  });
  afterEach(() => {
    vi.clearAllTimers();
    vi.useRealTimers();
  });

  it('persists before sending and restores original facts in a new document after tab closure', async () => {
    send.mockImplementation(async (p) => {
      expect(storage.getItem(PREFIX + p.id)).toBeTruthy();
      return false;
    });
    const first = make();
    await first.post(fact);
    first.dispose();
    send.mockResolvedValue(true);
    const next = make();
    next.start();
    await vi.advanceTimersByTimeAsync(100);
    expect(send.mock.calls.map(([p]) => p)).toEqual([fact, fact]);
    expect(storage.length).toBe(0);
  });
  it('keeps the first payload when another page submits the same milestone', async () => {
    send.mockResolvedValue(false);
    const a = make();
    await a.post(fact);
    a.dispose();
    send.mockResolvedValue(true);
    const b = make();
    await b.post({ ...fact, page: '/second', qa: false });
    expect(send.mock.lastCall?.[0]).toEqual(fact);
  });
  it('recovers after prolonged failure even without an online event', async () => {
    send.mockResolvedValue(false);
    const box = make();
    box.start();
    await box.post(fact);
    await vi.advanceTimersByTimeAsync(5500);
    send.mockResolvedValue(true);
    await vi.advanceTimersByTimeAsync(4500);
    expect(send).toHaveBeenCalledTimes(2);
    expect(storage.length).toBe(0);
    expect(vi.getTimerCount()).toBe(0);
  });
  it.each(['online', 'pageshow', 'pagehide'])(
    'attempts pending delivery on %s with the same identity',
    async (event) => {
      send.mockResolvedValue(false);
      const box = make();
      box.start();
      await box.post(fact);
      send.mockResolvedValue(true);
      events.get(event)!();
      await settle();
      expect(send.mock.lastCall?.[0]).toEqual(fact);
      expect(storage.length).toBe(0);
    },
  );
  it('does not overwrite another tab’s pending record', async () => {
    send.mockResolvedValue(false);
    const a = make(),
      b = make();
    await a.post(fact);
    await b.post({ ...fact, id: 'other-tab' });
    expect(storage.length).toBe(2);
    send.mockResolvedValue(true);
    await a.post(fact);
    expect(storage.getItem(PREFIX + 'other-tab')).toBeTruthy();
  });
  it('bounds concurrent recovery and leaves unacknowledged facts durable', async () => {
    for (let i = 0; i < 12; i++)
      storage.setItem(
        PREFIX + i,
        JSON.stringify({
          payload: { ...fact, id: String(i) },
          savedAt: Date.now(),
          expiresAt: Date.now() + TTL,
        }),
      );
    const releases: Array<(ok: boolean) => void> = [];
    send.mockImplementation(() => new Promise((resolve) => releases.push(resolve)));
    const box = make();
    box.start();
    await vi.advanceTimersByTimeAsync(500);
    expect(send).toHaveBeenCalledTimes(4);
    expect(storage.length).toBe(12);
    releases.splice(0).forEach((resolve) => resolve(true));
    await settle();
    await vi.advanceTimersByTimeAsync(100);
    expect(send).toHaveBeenCalledTimes(8);
    expect(storage.length).toBe(8);
  });
  it('deduplicates simultaneous attempts within a document', async () => {
    let release!: (ok: boolean) => void;
    send.mockImplementation(
      () =>
        new Promise((resolve) => {
          release = resolve;
        }),
    );
    const box = make();
    const a = box.post(fact),
      b = box.post(fact);
    expect(send).toHaveBeenCalledTimes(1);
    release(true);
    expect(await a).toBe(true);
    expect(await b).toBe(true);
  });
  it('persists new facts before a network slot is available, surviving immediate navigation', async () => {
    send.mockImplementation(() => new Promise(() => undefined));
    const a = make();
    for (let i = 0; i < 8; i++) void a.post({ ...fact, id: String(i) });
    expect(send).toHaveBeenCalledTimes(4);
    expect(storage.length).toBe(8);
    a.dispose();
    send.mockResolvedValue(true);
    const b = make();
    b.start();
    await vi.advanceTimersByTimeAsync(500);
    expect(storage.length).toBe(0);
    expect(new Set(send.mock.calls.map(([p]) => p.id)).size).toBe(8);
  });
  it('rejects corrupt/expired records without touching unrelated browser data', async () => {
    storage.setItem('unrelated', 'keep');
    storage.setItem(PREFIX + 'broken', '{');
    storage.setItem(
      PREFIX + fact.id,
      JSON.stringify({ payload: fact, savedAt: Date.now() - TTL, expiresAt: Date.now() }),
    );
    const box = make();
    box.start();
    await vi.advanceTimersByTimeAsync(1000);
    expect(send).not.toHaveBeenCalled();
    expect(storage.length).toBe(1);
    expect(storage.getItem('unrelated')).toBe('keep');
  });
  it('stops automatic retries at retention expiry and bounds retry frequency', async () => {
    send.mockResolvedValue(false);
    const box = make();
    box.start();
    await box.post(fact);
    await vi.advanceTimersByTimeAsync(TTL + 1);
    expect(send.mock.calls.length).toBeLessThan(300);
    expect(storage.length).toBe(0);
    expect(vi.getTimerCount()).toBe(0);
  });
  it('caps persisted record count while retaining oldest first-page facts', async () => {
    send.mockResolvedValue(false);
    const box = make();
    for (let i = 0; i < 110; i++) await box.post({ ...fact, id: String(i) });
    expect(storage.length).toBe(100);
    expect(storage.getItem(PREFIX + '0')).toBeTruthy();
  });
  it('continues current-page retry when storage is denied and persists when it recovers', async () => {
    const good = storage;
    storage = {
      get length() {
        throw new Error('denied');
      },
      setItem() {
        throw new Error('denied');
      },
    } as unknown as Storage;
    send.mockResolvedValue(false);
    const box = make();
    box.start();
    await box.post(fact);
    storage = good;
    send.mockImplementation(async (p) => {
      expect(storage.getItem(PREFIX + p.id)).toBeTruthy();
      return true;
    });
    await vi.advanceTimersByTimeAsync(10_000);
    expect(send).toHaveBeenCalledTimes(2);
    expect(storage.length).toBe(0);
  });
});
