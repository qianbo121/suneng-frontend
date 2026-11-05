import { ServiceUnavailableException } from '@nestjs/common';
import { GrowthReadProtection } from './growth-read-protection';

function deferred<T>() {
  let resolve!: (value: T) => void;
  let reject!: (error: unknown) => void;
  const promise = new Promise<T>((yes, no) => {
    resolve = yes;
    reject = no;
  });
  return { promise, resolve, reject };
}
const tick = () => new Promise<void>((resolve) => setImmediate(resolve));

describe('growth read admission and shared-pool protection', () => {
  it('keeps a burst of sixteen reporting reads at two concurrent operations', async () => {
    const waiting = Array.from({ length: 16 }, () => deferred<number>());
    let active = 0,
      peak = 0,
      calls = 0;
    const raw = {
      $queryRaw: jest.fn(async () => {
        const index = calls++;
        active++;
        peak = Math.max(peak, active);
        try {
          return await waiting[index].promise;
        } finally {
          active--;
        }
      }),
    };
    const database = new GrowthReadProtection().database(raw);
    const reads = Array.from({ length: 16 }, () => database.$queryRaw());
    await tick();
    expect(calls).toBe(2);
    for (let i = 0; i < 16; i += 2) {
      waiting[i].resolve(i);
      waiting[i + 1].resolve(i + 1);
      await tick();
    }
    expect(await Promise.all(reads)).toEqual(Array.from({ length: 16 }, (_, i) => i));
    expect(peak).toBe(2);
  });

  it('does not queue the original client used by live events and real inquiries', async () => {
    const hold = deferred<string>();
    const raw = {
      $queryRaw: jest.fn((kind: string) =>
        kind === 'report' ? hold.promise : Promise.resolve(kind),
      ),
    };
    const database = new GrowthReadProtection().database(raw);
    const reads = Array.from({ length: 16 }, () => database.$queryRaw('report'));
    await tick();
    expect(raw.$queryRaw).toHaveBeenCalledTimes(2);
    expect(await raw.$queryRaw('event')).toBe('event');
    expect(await raw.$queryRaw('inquiry')).toBe('inquiry');
    hold.resolve('report');
    await Promise.all(reads);
  });

  it('holds one slot for the complete transaction without intercepting inner reads', async () => {
    const hold = deferred<void>();
    const tx = { $queryRaw: jest.fn().mockResolvedValue('tx-value') };
    const raw = {
      $transaction: jest.fn(async (work: (transaction: typeof tx) => Promise<unknown>) => work(tx)),
      $queryRaw: jest.fn(async () => {
        await hold.promise;
        return 'outside';
      }),
    };
    const database = new GrowthReadProtection().database(raw);
    const first = database.$transaction(async (transaction) => {
      expect(transaction).toBe(tx);
      expect(await transaction.$queryRaw()).toBe('tx-value');
      await hold.promise;
      return 'committed';
    });
    const second = database.$queryRaw();
    const third = database.$queryRaw();
    await tick();
    expect(raw.$queryRaw).toHaveBeenCalledTimes(1);
    hold.resolve();
    expect(await Promise.all([first, second, third])).toEqual(['committed', 'outside', 'outside']);
  });

  it('releases capacity on both synchronous errors and rejected reads', async () => {
    const failure = new Error('db unavailable');
    const raw = {
      $queryRaw: jest
        .fn()
        .mockImplementationOnce(() => {
          throw failure;
        })
        .mockRejectedValueOnce(failure)
        .mockResolvedValue('next'),
    };
    const database = new GrowthReadProtection().database(raw);
    const results = await Promise.allSettled([
      database.$queryRaw(),
      database.$queryRaw(),
      database.$queryRaw(),
    ]);
    expect(results.map((r) => r.status)).toEqual(['rejected', 'rejected', 'fulfilled']);
    expect(await database.$queryRaw()).toBe('next');
  });

  it('bounds waiting work and rejects excess instead of retaining an unlimited backlog', async () => {
    const hold = deferred<string>();
    const raw = { $queryRaw: jest.fn(() => hold.promise) };
    const database = new GrowthReadProtection().database(raw);
    const accepted = Array.from({ length: 66 }, () => database.$queryRaw());
    await expect(database.$queryRaw()).rejects.toBeInstanceOf(ServiceUnavailableException);
    hold.resolve('ok');
    await Promise.all(accepted);
  });

  it('coalesces identical in-flight scopes, but never caches completed results', async () => {
    const protection = new GrowthReadProtection(),
      hold = deferred<number>();
    const work = jest.fn(() => hold.promise);
    const first = protection.overview(
      { endDate: '2026-11-01', startDate: '2026-10-29', inquiryReview: { validIds: [4] } },
      work,
    );
    const second = protection.overview(
      { inquiryReview: { validIds: [4] }, startDate: '2026-10-29', endDate: '2026-11-01' },
      work,
    );
    expect(first).toBe(second);
    await tick();
    expect(work).toHaveBeenCalledTimes(1);
    hold.resolve(9);
    expect(await first).toBe(9);
    expect(
      await protection.overview(
        { endDate: '2026-11-01', startDate: '2026-10-29', inquiryReview: { validIds: [4] } },
        () => Promise.resolve(10),
      ),
    ).toBe(10);
  });

  it('starts an overview immediately so independent summaries keep their existing concurrency', async () => {
    const protection = new GrowthReadProtection();
    const work = jest.fn().mockResolvedValue('started');
    const running = protection.overview({ report: 1 }, work);
    expect(work).toHaveBeenCalledTimes(1);
    await expect(running).resolves.toBe('started');
  });

  it('keeps different inquiry decisions, dates and response profiles separate', async () => {
    const protection = new GrowthReadProtection(),
      hold = deferred<string>();
    const scope = {
      startDate: '2026-10-29',
      endDate: '2026-10-31',
      inquiryReview: { validIds: [1] },
    };
    const a = protection.overview(scope, async () => `${await hold.promise}:original`);
    const b = protection.overview(
      { ...scope, inquiryReview: { validIds: [2] } },
      async () => `${await hold.promise}:review`,
    );
    const c = protection.overview(
      { ...scope, responseProfile: 'dashboard' },
      async () => `${await hold.promise}:profile`,
    );
    const d = protection.overview(
      { ...scope, startDate: '2026-10-30' },
      async () => `${await hold.promise}:date`,
    );
    expect(a).not.toBe(b);
    expect(new Set([a, b, c, d]).size).toBe(4);
    hold.resolve('ok');
    expect(await Promise.all([a, b, c, d])).toEqual([
      'ok:original',
      'ok:review',
      'ok:profile',
      'ok:date',
    ]);
    expect(
      await protection.overview({ ...scope, startDate: '2026-10-30' }, () =>
        Promise.resolve('fresh'),
      ),
    ).toBe('fresh');
  });

  it('accepts a third distinct report while all reads still share the bounded queue', async () => {
    const protection = new GrowthReadProtection();
    const hold = deferred<void>();
    let active = 0,
      peak = 0;
    const raw = {
      $queryRaw: jest.fn(async (report: number) => {
        active++;
        peak = Math.max(peak, active);
        try {
          await hold.promise;
          return report;
        } finally {
          active--;
        }
      }),
    };
    const database = protection.database(raw);
    const reports = [1, 2, 3].map((report) =>
      protection.overview({ report }, () =>
        Promise.all(Array.from({ length: 16 }, () => database.$queryRaw(report))),
      ),
    );
    await tick();
    expect(raw.$queryRaw).toHaveBeenCalledTimes(2);
    hold.resolve();
    expect(await Promise.all(reports)).toEqual([1, 2, 3].map((report) => Array(16).fill(report)));
    expect(raw.$queryRaw).toHaveBeenCalledTimes(48);
    expect(peak).toBe(2);
  });

  it('propagates an overview failure and permits a later fresh retry', async () => {
    const protection = new GrowthReadProtection();
    await expect(
      protection.overview({}, async () => {
        throw new Error('read failed');
      }),
    ).rejects.toThrow('read failed');
    expect(await protection.overview({}, async () => ({ total: 7 }))).toEqual({ total: 7 });
  });
});
