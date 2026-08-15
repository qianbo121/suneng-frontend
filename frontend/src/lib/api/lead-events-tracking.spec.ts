import { beforeEach, describe, expect, it, vi } from 'vitest';

import { apiPost } from '@/lib/api/client';
import { markEngagedSession, trackLeadEvent, trackPageView } from '@/lib/api/lead-events';

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
