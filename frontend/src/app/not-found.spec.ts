import { describe, expect, it, vi } from 'vitest';

vi.mock('next-intl/server', () => ({ getLocale: vi.fn() }));

import { getLocale } from 'next-intl/server';
import RootNotFoundPage, { metadata } from './not-found';

describe('server-rendered missing page language', () => {
  it('does not read request headers while Next prepares a cached page', async () => {
    vi.mocked(getLocale).mockImplementation(() => { throw new Error('DYNAMIC_SERVER_USAGE'); });
    expect((await RootNotFoundPage()).props.lang).toBe('zh-CN');
    expect(metadata).toMatchObject({ robots: { index: false } });
    expect(getLocale).not.toHaveBeenCalled();
  });
});
