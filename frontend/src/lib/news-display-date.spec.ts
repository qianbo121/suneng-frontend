import { describe, expect, it } from 'vitest';
import { formatNewsDisplayDate } from './news-display-date';

describe('publication dates', () => {
  it('keeps the official publication day across reader and server time zones', () => {
    expect(formatNewsDisplayDate('2026-08-05T16:00:00.000Z')).toBe('2026-08-06');
    expect(formatNewsDisplayDate('2026-08-04')).toBe('2026-08-04');
  });
  it('does not replace missing or invalid dates with today', () => {
    expect(formatNewsDisplayDate(null)).toBe('');
    expect(formatNewsDisplayDate('')).toBe('');
    expect(formatNewsDisplayDate('unknown')).toBe('unknown');
  });
});
