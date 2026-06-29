import { HttpException, HttpStatus } from '@nestjs/common';

export type SpamThrottleState = {
  lastSubmittedAt: number;
  count: number;
  windowStartAt: number;
};

type SpamThrottleOptions = {
  now?: () => number;
  minIntervalMs?: number;
  windowMs?: number;
  maxSubmissions?: number;
};

const DEFAULT_MIN_INTERVAL_MS = 30_000;
const DEFAULT_WINDOW_MS = 10 * 60_000;
const DEFAULT_MAX_SUBMISSIONS = 5;

export function ensureNotSpam(
  clientKey: string,
  spamMap: Map<string, SpamThrottleState>,
  options: SpamThrottleOptions = {},
) {
  const now = options.now?.() ?? Date.now();
  const minIntervalMs = options.minIntervalMs ?? DEFAULT_MIN_INTERVAL_MS;
  const windowMs = options.windowMs ?? DEFAULT_WINDOW_MS;
  const maxSubmissions = options.maxSubmissions ?? DEFAULT_MAX_SUBMISSIONS;
  const current = spamMap.get(clientKey);

  if (!current) {
    spamMap.set(clientKey, {
      lastSubmittedAt: now,
      count: 1,
      windowStartAt: now,
    });
    return;
  }

  if (now - current.lastSubmittedAt < minIntervalMs) {
    throw new HttpException(
      'Please do not submit repeatedly in a short time',
      HttpStatus.TOO_MANY_REQUESTS,
    );
  }

  if (now - current.windowStartAt > windowMs) {
    current.count = 0;
    current.windowStartAt = now;
  }

  current.count += 1;
  current.lastSubmittedAt = now;

  if (current.count > maxSubmissions) {
    throw new HttpException('Submission frequency is too high', HttpStatus.TOO_MANY_REQUESTS);
  }

  spamMap.set(clientKey, current);
}
