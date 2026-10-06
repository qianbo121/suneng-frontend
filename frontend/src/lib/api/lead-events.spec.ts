import { afterEach, describe, expect, it, vi } from 'vitest';

import {
  buildLeadSourceSnapshot,
  captureLeadEventProperties,
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


describe('manual QA source privacy', () => {
  it('retains only a boolean, never the QA token or contact query values', () => {
    const sessionStorage = storageMock();
    // Match the real browser storage interface used for visit rotation.
    Object.assign(sessionStorage, { removeItem: () => undefined });
    vi.stubGlobal('window', {
      location: { pathname: '/zh/contact', search: '?acquisition_qa=analytics75_20261006164649566&utm_source=baidu&phone=private-phone&email=private-email&identity=private-identity&problem=private-problem', hostname: 'www.jssngyl.cn' },
      sessionStorage, localStorage: storageMock(), matchMedia: () => ({ matches: false }),
    });
    vi.stubGlobal('document', { title: '联系苏能', referrer: 'https://www.baidu.com/s?wd=炉子&phone=private-referrer' });
    const snapshot = buildLeadSourceSnapshot();
    const payload = { ...snapshot, properties: captureLeadEventProperties(undefined, snapshot) };
    expect(payload).toMatchObject({ pagePath: '/zh/contact?utm_source=baidu', sourceType: '自然搜索', sourceDetail: '百度', utmSource: 'baidu', properties: { manual_qa: true } });
    for (const value of ['acquisition_qa', 'analytics75_', 'private-phone', 'private-email', 'private-identity', 'private-problem', 'private-referrer']) {
      expect(JSON.stringify(payload)).not.toContain(value);
    }
    expect(sessionStorage.getItem('suneng_manual_qa_session_v1')).toBe(snapshot.sessionId);
    expect(sessionStorage.getItem('suneng_landing_page')).not.toContain('acquisition_qa');
  });
});
