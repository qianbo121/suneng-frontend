import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

import { apiPost } from '@/lib/api/client';
import { captureContactContext, copyContactValue, trackContactAction, trackContactEntry } from './contact-events';
import { TrackedContactLink } from '@/components/lead/TrackedContactLink';

vi.mock('@/lib/api/client', () => ({ apiPost: vi.fn(() => Promise.resolve({})) }));

function storage() {
  const values = new Map<string, string>();
  return {
    getItem: (key: string) => values.get(key) ?? null,
    setItem: (key: string, value: string) => values.set(key, value),
    removeItem: (key: string) => values.delete(key),
  };
}

function events() {
  return vi.mocked(apiPost).mock.calls.map(([, options]) => options?.body as {
    eventType: string;
    pagePath: string;
    sessionId: string;
    sourceType: string;
    properties: Record<string, string>;
  }).filter((event) => event.eventType !== 'engaged_session');
}

describe('contact entry and follow-up accounting', () => {
  beforeEach(() => {
    vi.mocked(apiPost).mockReset().mockResolvedValue({});
    vi.stubGlobal('window', {
      location: { pathname: '/zh/products/detail/trolley-furnace', search: '', hostname: 'www.jssngyl.cn' },
      sessionStorage: storage(), localStorage: storage(), matchMedia: () => ({ matches: false }),
    });
    vi.stubGlobal('document', { title: '台车炉', referrer: 'https://www.baidu.com/s?wd=台车炉' });
    vi.stubGlobal('navigator', { clipboard: { writeText: vi.fn().mockResolvedValue(undefined) } });
  });

  afterEach(() => vi.unstubAllGlobals());

  it('records one entry and one copy result without inflating contact-click totals', async () => {
    const context = captureContactContext({ properties: { position: 'floating_toolbar' } });
    trackContactEntry('phone', context, 'open_dialog');
    await copyContactValue('13052986814', 'phone', context);
    expect(events().map((e) => e.eventType)).toEqual(['phone_click', 'contact_action']);
    expect(events()[0].properties).toMatchObject({ contact_action: 'open_dialog', position: 'floating_toolbar' });
    expect(events()[1].properties).toMatchObject({ contact_kind: 'phone', contact_action: 'copy', contact_result: 'success' });
    expect(events()[0].sessionId).toBe(events()[1].sessionId);
    expect(events().every((e) => e.sourceType === '自然搜索')).toBe(true);
    expect(vi.mocked(apiPost).mock.calls.every(([, options]) => options?.keepalive === true)).toBe(true);
  });

  it.each(['phone', 'email'] as const)('preserves the native %s link and records its position once', (kind) => {
    const href = kind === 'phone' ? 'tel:+8613052986814' : 'mailto:997518512@qq.com';
    const link = TrackedContactLink({ kind, position: 'contact_body', purpose: 'sales', href, className: 'existing', children: '原文案' });
    expect(link.type).toBe('a');
    expect(link.props).toMatchObject({ href, className: 'existing', children: '原文案' });
    link.props.onClick();
    expect(events()).toHaveLength(1);
    expect(events()[0]).toMatchObject({ eventType: `${kind}_click`, properties: { position: 'contact_body', contact_purpose: 'sales', contact_action: 'open_external', contact_result: 'requested' } });
  });

  it('reports clipboard rejection as failure, never as a successful copy', async () => {
    vi.mocked(navigator.clipboard.writeText).mockRejectedValue(new Error('denied'));
    expect(await copyContactValue('suneng2005', 'wechat')).toBe(false);
    expect(events()).toHaveLength(1);
    expect(events()[0]).toMatchObject({ eventType: 'contact_action', properties: { contact_kind: 'wechat', contact_action: 'copy', contact_result: 'failure' } });
  });

  it('handles missing clipboard support and does not add a contact-click event', async () => {
    vi.stubGlobal('navigator', {});
    expect(await copyContactValue('997518512@qq.com', 'email')).toBe(false);
    expect(events().map((e) => e.eventType)).toEqual(['contact_action']);
    expect(events()[0].properties.contact_result).toBe('failure');
  });

  it('retains the originating page when an async copy settles after navigation', async () => {
    let finish!: () => void;
    vi.mocked(navigator.clipboard.writeText).mockImplementation(() => new Promise<void>((resolve) => { finish = resolve; }));
    const pending = copyContactValue('13052986814', 'phone', { properties: { position: 'contact_body' } });
    window.location.pathname = '/zh/contact';
    finish();
    await pending;
    expect(events()[0].pagePath).toBe('/zh/products/detail/trolley-furnace');
  });

  it('keeps after-sales attribution on subsequent dialog actions', () => {
    window.location.pathname = '/en/service/installation-after-sales';
    const context = captureContactContext({ properties: { position: 'after_sales_hotline_wechat', contact_purpose: 'after_sales' } });
    trackContactEntry('wechat', context, 'open_dialog');
    trackContactAction('wechat', 'open_qr_original', 'requested', context);
    expect(events().every((e) => e.properties.contact_purpose === 'after_sales')).toBe(true);
    expect(events()[1]).toMatchObject({ pagePath: '/en/service/installation-after-sales', eventType: 'contact_action', properties: { position: 'after_sales_hotline_wechat', contact_result: 'requested' } });
  });

  it('does not interpret a calling/email-app request as successful contact', () => {
    trackContactAction('phone', 'open_external', 'requested');
    trackContactAction('email', 'open_external', 'requested');
    expect(events().map((e) => e.properties.contact_result)).toEqual(['requested', 'requested']);
    expect(events().map((e) => e.eventType)).toEqual(['contact_action', 'contact_action']);
  });

  it('does not record address copying as a procurement action', async () => {
    expect(await copyContactValue('厂址')).toBe(true);
    expect(apiPost).not.toHaveBeenCalled();
  });

  it('does not fail the copy if analytics fails', async () => {
    vi.mocked(apiPost).mockImplementation(() => { throw new Error('analytics unavailable'); });
    expect(await copyContactValue('13052986814', 'phone')).toBe(true);
  });

  it('keeps local preview activity out of real business records', async () => {
    window.location.hostname = 'localhost';
    trackContactEntry('phone');
    await copyContactValue('13052986814', 'phone');
    expect(apiPost).not.toHaveBeenCalled();
  });
});
