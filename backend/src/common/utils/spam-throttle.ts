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
  maxTrackedClients?: number;
};

const DEFAULT_MIN_INTERVAL_MS = 30_000;
const DEFAULT_WINDOW_MS = 10 * 60_000;
const DEFAULT_MAX_SUBMISSIONS = 5;
const DEFAULT_MAX_TRACKED_CLIENTS = 10_000;

export function ensureNotSpam(
  clientKey: string,
  spamMap: Map<string, SpamThrottleState>,
  options: SpamThrottleOptions = {},
) {
  const now = options.now?.() ?? Date.now();
  const minIntervalMs = options.minIntervalMs ?? DEFAULT_MIN_INTERVAL_MS;
  const windowMs = options.windowMs ?? DEFAULT_WINDOW_MS;
  const maxSubmissions = options.maxSubmissions ?? DEFAULT_MAX_SUBMISSIONS;
  const maxTrackedClients = options.maxTrackedClients ?? DEFAULT_MAX_TRACKED_CLIENTS;

  for (const [key, state] of spamMap) {
    if (now - Math.max(state.lastSubmittedAt, state.windowStartAt) > windowMs) {
      spamMap.delete(key);
    }
  }

  if (!spamMap.has(clientKey) && spamMap.size >= maxTrackedClients) {
    let oldestKey: string | undefined;
    let oldestSubmission = Number.POSITIVE_INFINITY;
    for (const [key, state] of spamMap) {
      if (state.lastSubmittedAt < oldestSubmission) {
        oldestKey = key;
        oldestSubmission = state.lastSubmittedAt;
      }
    }
    if (oldestKey) spamMap.delete(oldestKey);
  }

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
