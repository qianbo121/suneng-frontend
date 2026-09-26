import { describe, expect, it, vi } from 'vitest';

vi.mock('next-intl/server', () => ({ getLocale: vi.fn() }));

import { getLocale } from 'next-intl/server';
import GlobalNotFoundPage, { generateMetadata } from './global-not-found';

describe('server-rendered missing page language', () => {
  it.each([
    ['en', 'en', 'Page Not Found | Suneng'],
    ['zh', 'zh-CN', '页面未找到｜苏能工业炉'],
  ])('renders %s content and metadata from the same request locale', async (locale, lang, title) => {
    vi.mocked(getLocale).mockResolvedValue(locale);
    expect(await generateMetadata()).toMatchObject({ title: { absolute: title }, robots: { index: false } });
    expect((await GlobalNotFoundPage()).props.lang).toBe(lang);
  });
});
