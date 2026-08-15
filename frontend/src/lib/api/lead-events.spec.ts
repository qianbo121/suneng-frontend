import { afterEach, describe, expect, it, vi } from 'vitest';

import {
  buildLeadSourceSnapshot,
  sanitizeLeadPagePath,
  sanitizeLeadReferrer,
} from '@/lib/api/lead-events';

afterEach(() => {
  vi.unstubAllGlobals();
});

function storageMock() {
  const values = new Map<string, string>();
  return {
    getItem: (key: string) => values.get(key) ?? null,
    setItem: (key: string, value: string) => values.set(key, value),
  } as unknown as Storage;
}

describe('lead source privacy', () => {
  it('keeps only the page path and approved campaign parameters', () => {
    expect(
      sanitizeLeadPagePath(
        '/zh/contact?utm_source=baidu&phone=13800138000&utm_medium=cpc&token=secret&utm_campaign=summer#form',
      ),
    ).toBe('/zh/contact?utm_source=baidu&utm_medium=cpc&utm_campaign=summer');
  });

  it('removes query parameters and fragments from the referrer', () => {
    expect(
      sanitizeLeadReferrer('https://example.com/article?token=secret&phone=13800138000#details'),
    ).toBe('https://example.com/article');
    expect(sanitizeLeadReferrer('not a valid URL')).toBeUndefined();
  });

  it('applies both privacy filters to the source snapshot used by submissions', () => {
    vi.stubGlobal('window', {
      location: {
        pathname: '/zh/contact',
        search: '?utm_source=baidu&phone=13800138000&token=secret',
      },
      sessionStorage: storageMock(),
      localStorage: storageMock(),
      matchMedia: () => ({ matches: false }),
    });
    vi.stubGlobal('document', {
      title: '联系苏能',
      referrer: 'https://example.com/article?token=secret&phone=13800138000#details',
    });

    expect(buildLeadSourceSnapshot()).toMatchObject({
      pagePath: '/zh/contact?utm_source=baidu',
      previousPage: 'https://example.com/article',
      utmSource: 'baidu',
    });
  });

  it('bounds polluted stored identifiers and long campaign data without blocking a lead', () => {
    const sessionStorage = storageMock();
    const localStorage = storageMock();
    sessionStorage.setItem(
      'suneng_landing_page',
      `/en/contact?utm_source=${'s'.repeat(300)}&utm_campaign=${'c'.repeat(500)}&token=secret`,
    );
    sessionStorage.setItem('suneng_session_id', 'session-'.repeat(80));
    localStorage.setItem('suneng_visitor_id', 'visitor-'.repeat(80));

    vi.stubGlobal('window', {
      location: { pathname: '/en/contact', search: '' },
      sessionStorage,
      localStorage,
      matchMedia: () => ({ matches: false }),
    });
    vi.stubGlobal('document', {
      title: 'T'.repeat(400),
      referrer: `https://example.com/${'r'.repeat(700)}?token=secret`,
    });

    const snapshot = buildLeadSourceSnapshot();
    expect(snapshot.pageTitle).toHaveLength(255);
    expect(snapshot.pagePath!.length).toBeLessThanOrEqual(500);
    expect(snapshot.landingPage!.length).toBeLessThanOrEqual(500);
    expect(snapshot.previousPage!.length).toBeLessThanOrEqual(500);
    expect(snapshot.utmSource).toHaveLength(120);
    expect(snapshot.utmCampaign).toHaveLength(255);
    expect(snapshot.sessionId).toHaveLength(120);
    expect(snapshot.visitorId).toHaveLength(120);
    expect(snapshot.landingPage).not.toContain('token');
  });
});
