import { jsx } from 'react/jsx-runtime';
import { renderToStaticMarkup } from 'react-dom/server';
import { NextIntlClientProvider } from 'next-intl';
import { describe, expect, it } from 'vitest';
import NewsDetailLoading from './[slug]/loading';

describe('article loading feedback', () => {
  for (const [locale, text] of [
    ['zh', '正在加载技术资料…'],
    ['en', 'Loading resources…'],
  ]) {
    it(`keeps ${locale} loading and recovery text out of the server-rendered page`, () => {
      const html = renderToStaticMarkup(
        jsx(NextIntlClientProvider, {
          locale,
          messages: {},
          timeZone: 'Asia/Shanghai',
          children: jsx(NewsDetailLoading, {}),
        }),
      );
      expect(html).not.toContain(text);
      expect(html).not.toContain('加载时间较长');
      expect(html).not.toContain('Loading is taking longer');
      expect(html).not.toContain('重新加载');
      expect(html).not.toContain('Retry loading');
      expect(html).not.toContain('href=""');
      expect(html).toContain('<div');
      expect(html).not.toMatch(/<h1\b/);
      expect(html).not.toContain('data-news-id');
    });
  }
});
