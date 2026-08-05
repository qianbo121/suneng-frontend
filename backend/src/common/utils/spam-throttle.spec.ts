import { HttpException, HttpStatus } from '@nestjs/common';

import { ensureNotSpam, SpamThrottleState } from '@/common/utils/spam-throttle';

describe('ensureNotSpam', () => {
  let now: number;
  let spamMap: Map<string, SpamThrottleState>;

  beforeEach(() => {
    now = 1_000;
    spamMap = new Map();
  });

  function submit(clientKey = 'client-a') {
    ensureNotSpam(clientKey, spamMap, { now: () => now });
  }

  it('allows the first submission and records state', () => {
    submit();

    expect(spamMap.get('client-a')).toEqual({
      lastSubmittedAt: 1_000,
      count: 1,
      windowStartAt: 1_000,
    });
  });

  it('blocks repeated submission inside 30 seconds', () => {
    submit();
    now += 29_999;

    expect(() => submit()).toThrow(HttpException);

    try {
      submit();
    } catch (error) {
      expect(error).toBeInstanceOf(HttpException);
      expect((error as HttpException).getStatus()).toBe(HttpStatus.TOO_MANY_REQUESTS);
      expect((error as HttpException).message).toBe(
        'Please do not submit repeatedly in a short time',
      );
    }
  });

  it('blocks the sixth submission inside the ten-minute window', () => {
    submit();

    for (let index = 0; index < 4; index += 1) {
      now += 30_000;
      submit();
    }

    now += 30_000;

    expect(() => submit()).toThrow('Submission frequency is too high');
    expect(spamMap.get('client-a')?.count).toBe(6);
  });

  it('resets the counter after the ten-minute window', () => {
    submit();
    now += 10 * 60_000 + 1;

    submit();

    expect(spamMap.get('client-a')).toEqual({
      lastSubmittedAt: now,
      count: 1,
      windowStartAt: now,
    });
  });

  it('evicts expired clients so the in-memory fallback stays bounded', () => {
    ensureNotSpam('expired-client', spamMap, {
      now: () => now,
      windowMs: 1_000,
    });
    now += 1_001;

    ensureNotSpam('active-client', spamMap, {
      now: () => now,
      windowMs: 1_000,
    });

    expect(spamMap.has('expired-client')).toBe(false);
    expect(spamMap.has('active-client')).toBe(true);
  });

  it('evicts the oldest client when the tracked-client cap is reached', () => {
    ensureNotSpam('oldest', spamMap, { now: () => now, maxTrackedClients: 2 });
    now += 1;
    ensureNotSpam('newer', spamMap, { now: () => now, maxTrackedClients: 2 });
    now += 1;
    ensureNotSpam('newest', spamMap, { now: () => now, maxTrackedClients: 2 });

    expect([...spamMap.keys()]).toEqual(['newer', 'newest']);
  });
});
