import { createElement, type ComponentProps } from 'react';
import { renderToStaticMarkup } from 'react-dom/server';
import { describe, expect, it, vi } from 'vitest';

vi.mock('@/components/layout/NavigationLink', () => ({
  NavigationLink: (props: ComponentProps<'a'>) => createElement('a', props),
}));

import { NewsRelatedArticles } from './NewsRelatedArticles';
import { PROCUREMENT_RESOURCE_HREF, PROCUREMENT_RESOURCE_SLUG } from '@/lib/news-list-resources';

describe('related article destinations', () => {
  it('links an approved standalone procurement resource to its actual article route', () => {
    const html = renderToStaticMarkup(<NewsRelatedArticles locale="zh" items={[{
      slug: PROCUREMENT_RESOURCE_SLUG,
      href: PROCUREMENT_RESOURCE_HREF,
      title: '专项工业炉采购评估',
    }]} />);
    expect(html).toContain(`href="${PROCUREMENT_RESOURCE_HREF}"`);
    expect(html).not.toContain(`href="/zh/news/${PROCUREMENT_RESOURCE_SLUG}"`);
    expect(html).toContain('专项工业炉采购评估');
  });

  it.each(['zh', 'en'] as const)('keeps ordinary %s news links unchanged', (locale) => {
    const html = renderToStaticMarkup(<NewsRelatedArticles locale={locale} items={[{
      slug: 'ordinary-news', title: 'Ordinary news',
    }]} />);
    expect(html).toContain(`href="/${locale}/news/ordinary-news"`);
  });
});
