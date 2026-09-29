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
    it(`renders synchronous ${locale} feedback without an extra page heading`, () => {
      const html = renderToStaticMarkup(
        jsx(NextIntlClientProvider, {
          locale,
          messages: {},
          timeZone: 'Asia/Shanghai',
          children: jsx(NewsDetailLoading, {}),
        }),
      );
      expect(html).toContain(text);
      expect(html).toContain('role="status"');
      expect(html).toContain('href=""');
      expect(html).not.toMatch(/<h1\b/);
      expect(html).not.toContain('data-news-id');
    });
  }
});
