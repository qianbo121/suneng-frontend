import { describe, expect, it, vi } from 'vitest';
import { renderToStaticMarkup } from 'react-dom/server';

// The interactive list and the quote modal are browser components; the shell's
// heading does not depend on them.
vi.mock('@/components/news/NewsListInteractive', () => ({
  NewsListFilterControls: () => null,
  NewsListHeading: () => null,
  NewsListResults: () => null,
  NewsListScope: ({ children }: { children?: unknown }) => children ?? null,
}));
vi.mock('@/components/lead/QuoteModalButton', () => ({ QuoteModalButton: () => null }));
vi.mock('@/components/news/NewsSearchForm', () => ({ NewsSearchForm: () => null }));
vi.mock('@/components/news/NewsListCards', () => ({ NewsListCards: () => null }));
import { NewsDecisionCenter } from './NewsDecisionCenter';
import { NEWS_PAGE_SIZE } from '@/constants/news';

// /news/loading.tsx renders this shell, and that Suspense boundary also wraps
// /news/[slug]. When the shell owned an <h1>, every article page shipped three.
const shell = (loading: boolean) =>
  renderToStaticMarkup(
    NewsDecisionCenter({
      locale: 'zh',
      items: [],
      sourceItems: [],
      page: 1,
      total: 0,
      pageSize: NEWS_PAGE_SIZE,
      query: '',
      topic: 'all',
      furnace: 'all',
      sort: 'recommended',
      loading,
    }) as never,
  );

describe('news decision center heading', () => {
  it('renders no heading while loading, so article pages keep a single h1', () => {
    const html = shell(true);
    expect(html.match(/<h1\b/g)).toBeNull();
    expect(html).toContain('工业炉选型与采购资料');
  });

  it('still renders exactly one h1 for the list page itself', () => {
    expect(shell(false).match(/<h1\b/g)).toHaveLength(1);
  });
});
