'use client';

import Link from 'next/link';
import { NEWS_CONTENT_FORMATS, type NewsContentFormat } from '@/lib/news-content-type';
import { useRouter, useSearchParams } from 'next/navigation';
import {
  createContext,
  Suspense,
  useCallback,
  useContext,
  useEffect,
  useLayoutEffect,
  useMemo,
  useRef,
  useState,
  type MouseEvent,
  type ReactNode,
} from 'react';

import { NewsListCards } from '@/components/news/NewsListCards';
import { NewsFilterSelect } from '@/components/news/NewsFilterSelect';
import {
  buildNewsDecisionHref,
  NEWS_DECISION_TOPICS,
  NEWS_FURNACE_FILTERS,
} from '@/lib/news-decision-center';
import {
  getNewsListView,
  hasNewsListFilters,
  isSameNewsListState,
  parseNewsListState,
  type NewsListState,
} from '@/lib/news-list-client';
import { newsUiText } from '@/lib/news-ui';
import type { NewsListCardItem } from '@/types/news';
import type { Locale } from '@/types/site';

import styles from './NewsDecisionCenter.module.css';

type NewsListContextValue = {
  locale: Locale;
  state: NewsListState;
  view: ReturnType<typeof getNewsListView>;
  pageSize: number;
  navigate: (next: NewsListState) => void;
};

const NewsListContext = createContext<NewsListContextValue | null>(null);

// Runs before paint in the browser so a restored page never shows stale results.
const useBrowserLayoutEffect = typeof window === 'undefined' ? useEffect : useLayoutEffect;

// Lets the search form carry the filters currently shown, not the ones the
// page was first rendered with.
export function useNewsListState() {
  return useContext(NewsListContext)?.state ?? null;
}

function useNewsList() {
  const value = useContext(NewsListContext);
  if (!value) throw new Error('News list controls must be rendered inside NewsListScope');
  return value;
}

// A router navigation that keeps this page, such as the site header link to the
// plain list, changes the address without popstate and may reuse the rendered
// page as is. Search params still change, so they trigger a resync. This sits
// in its own Suspense boundary: reading search params on a prerendered page
// renders only this component in the browser, not the list.
function SearchParamsChange({ onChange }: { onChange: () => void }) {
  const search = useSearchParams()?.toString() ?? '';
  useEffect(() => {
    onChange();
  }, [search, onChange]);
  return null;
}

type NewsListScopeProps = {
  locale: Locale;
  cards: NewsListCardItem[];
  initialState: NewsListState;
  pageSize: number;
  // Document titles for unfiltered pages (index 0 is page 1) and for any filtered view.
  pageTitles: string[];
  filteredTitle: string;
  className: string;
  children: ReactNode;
};

// Switches topic, equipment, sort and page in the browser. Controls stay real
// links to the public URLs, so crawlers, new tabs, refreshes and shared links
// still reach the server-rendered page for the same state.
export function NewsListScope({
  locale,
  cards,
  initialState,
  pageSize,
  pageTitles,
  filteredTitle,
  className,
  children,
}: NewsListScopeProps) {
  const listPath = `/${locale}/news`;
  const [state, setState] = useState(initialState);
  const scrollAfterRender = useRef<'heading' | 'focus-heading' | null>(null);
  const titleReady = useRef(false);
  const view = useMemo(() => getNewsListView(cards, state, pageSize), [cards, state, pageSize]);

  const sync = useCallback(() => {
    if (window.location.pathname !== listPath) return;
    const next = parseNewsListState(window.location.search, locale);
    setState((current) => (isSameNewsListState(current, next) ? current : next));
  }, [listPath, locale]);

  // Follow the address bar on back/forward, and when the router renders this
  // page again, for example after the reader returns from an article.
  useBrowserLayoutEffect(() => {
    sync();
    window.addEventListener('popstate', sync);
    return () => window.removeEventListener('popstate', sync);
  }, [sync, cards, initialState]);

  useEffect(() => {
    // The server already rendered the right title for the first view.
    if (!titleReady.current) {
      titleReady.current = true;
      return;
    }
    document.title = hasNewsListFilters(state)
      ? filteredTitle
      : (pageTitles[view.page - 1] ?? filteredTitle);
  }, [state, view.page, pageTitles, filteredTitle]);

  useEffect(() => {
    const target = scrollAfterRender.current;
    scrollAfterRender.current = null;
    const heading = target ? document.getElementById('news-list-title') : null;
    if (!heading) return;
    const top = heading.getBoundingClientRect().top;
    const clearance = window.innerWidth < 1280 ? 96 : 120;
    if (top < clearance || top > window.innerHeight * 0.6) {
      window.scrollTo({ top: Math.max(0, window.scrollY + top - clearance), behavior: 'instant' });
    }
    if (target === 'focus-heading') heading.focus({ preventScroll: true });
  }, [view]);

  const navigate = (next: NewsListState) => {
    const href = buildNewsDecisionHref(listPath, next);
    if (`${window.location.pathname}${window.location.search}` !== href) {
      window.history.pushState(null, '', href);
    }
    setState((current) => (isSameNewsListState(current, next) ? current : next));
  };

  const handleClickCapture = (event: MouseEvent<HTMLDivElement>) => {
    if (
      event.defaultPrevented ||
      event.button !== 0 ||
      event.metaKey ||
      event.ctrlKey ||
      event.shiftKey ||
      event.altKey
    ) {
      return;
    }
    const anchor = (event.target as Element | null)?.closest?.('a[href]');
    if (
      !(anchor instanceof HTMLAnchorElement) ||
      (anchor.target && anchor.target !== '_self') ||
      anchor.hasAttribute('download')
    ) {
      return;
    }
    const url = new URL(anchor.href, window.location.href);
    if (
      url.origin !== window.location.origin ||
      url.pathname !== listPath ||
      url.searchParams.has('q')
    ) {
      return;
    }

    // Stops next/link as well: it skips navigation for prevented clicks.
    event.preventDefault();
    const next = parseNewsListState(url.searchParams, locale);
    const href = buildNewsDecisionHref(listPath, next);
    if (`${window.location.pathname}${window.location.search}` !== href) {
      window.history.pushState(null, '', href);
    }
    if (next.page !== state.page) {
      // A keyboard activation (detail 0) moves focus with the new results.
      scrollAfterRender.current = event.detail === 0 ? 'focus-heading' : 'heading';
    }
    setState((current) => (isSameNewsListState(current, next) ? current : next));
  };

  return (
    <NewsListContext.Provider value={{ locale, state, view, pageSize, navigate }}>
      <Suspense fallback={null}>
        <SearchParamsChange onChange={sync} />
      </Suspense>
      <div className={className} onClickCapture={handleClickCapture}>
        {children}
      </div>
    </NewsListContext.Provider>
  );
}

export function NewsFilterPanel({
  loading,
  children,
}: {
  locale: Locale;
  topic: NewsListState['topic'];
  furnace: NewsListState['furnace'];
  loading?: boolean;
  children: ReactNode;
}) {
  return (
    <div className={styles.filterPanel} inert={loading || undefined}>
      {children}
    </div>
  );
}

export function NewsResultsSummary({
  locale,
  total,
  page,
  pageSize,
}: {
  locale: Locale;
  total: number;
  page: number;
  pageSize: number;
}) {
  const pageCount = Math.max(1, Math.ceil(total / pageSize));
  const currentPage = Math.min(Math.max(1, page), pageCount);
  return (
    <p className={styles.resultsSummary} role="status" aria-live="polite">
      {locale === 'en'
        ? `${total} resources · Page ${currentPage} of ${pageCount}`
        : `共 ${total} 篇资料 · 第 ${currentPage} / ${pageCount} 页`}
    </p>
  );
}

export function NewsListFilterControls() {
  const { locale, state } = useNewsList();
  const t = (text: string) => newsUiText(locale, text);
  const base = `/${locale}/news`;

  return (
    <>
      <nav className={styles.topicNav} aria-label={t('内容分类')}>
        {NEWS_DECISION_TOPICS.map((item) => (
          <Link
            key={item.id}
            prefetch={false}
            href={buildNewsDecisionHref(base, { ...state, page: 1, topic: item.id })}
            className={`${styles.topicLink} ${item.id === state.topic ? styles.topicLinkActive : ''}`}
            aria-current={item.id === state.topic ? 'page' : undefined}
          >
            {t(item.label)}
          </Link>
        ))}
      </nav>
    </>
  );
}

export function NewsListHeading() {
  const { locale, state, view, pageSize } = useNewsList();
  const t = (text: string) => newsUiText(locale, text);

  return (
    <>
      <div className={styles.headingCopy}>
        <h2 id="news-list-title" className={styles.listTitle} tabIndex={-1}>
          {t(NEWS_DECISION_TOPICS.find((item) => item.id === state.topic)?.label || '')}
        </h2>
        <NewsResultsSummary
          locale={locale}
          total={view.total}
          page={view.page}
          pageSize={pageSize}
        />
      </div>
      <NewsListToolbar locale={locale} query="" {...state} />
    </>
  );
}

export function NewsListToolbar({
  locale,
  query,
  topic,
  furnace,
  sort,
  format = 'article',
  disabled = false,
}: {
  locale: Locale;
  query: string;
  topic: NewsListState['topic'];
  furnace: NewsListState['furnace'];
  sort: NewsListState['sort'];
  format?: NewsContentFormat;
  disabled?: boolean;
}) {
  const live = useContext(NewsListContext);
  const router = useRouter();
  const current = live?.state ?? { topic, furnace, sort, format, page: 1 };
  const t = (text: string) => newsUiText(locale, text);
  const change = (patch: Partial<Pick<NewsListState, 'furnace' | 'sort'>>) => {
    const next = { ...current, ...patch, page: 1 };
    if (live) live.navigate(next);
    else router.push(buildNewsDecisionHref(`/${locale}/news`, { ...next, query }));
  };

  return (
    <div className={styles.listControls}>
      <NewsFilterSelect
        name="furnace"
        label={t('设备类型')}
        value={current.furnace}
        disabled={disabled}
        options={NEWS_FURNACE_FILTERS.map((item) => ({ value: item.id, label: t(item.label) }))}
        onChange={(value) => change({ furnace: value as NewsListState['furnace'] })}
      />
      <NewsFilterSelect
        name="sort"
        label={t('文章排序')}
        value={current.sort}
        disabled={disabled}
        align="end"
        options={[
          { value: 'updated', label: t('最新发布') },
          { value: 'recommended', label: t('推荐阅读') },
        ]}
        onChange={(value) => change({ sort: value as NewsListState['sort'] })}
      />
    </div>
  );
}

export function NewsListResults() {
  const { locale, state, view, pageSize } = useNewsList();

  return (
    <NewsListCards
      locale={locale}
      items={view.items}
      page={view.page}
      total={view.total}
      pageSize={pageSize}
      query=""
      topic={state.topic}
      furnace={state.furnace}
      sort={state.sort}
      format={state.format}
      prefetchPages={false}
    />
  );
}

export function NewsContentTabs({
  locale,
  query,
  topic,
  furnace,
  sort,
  format = 'article',
  disabled = false,
}: {
  locale: Locale;
  query: string;
  topic: NewsListState['topic'];
  furnace: NewsListState['furnace'];
  sort: NewsListState['sort'];
  format?: NewsContentFormat;
  disabled?: boolean;
}) {
  const live = useContext(NewsListContext);
  if (locale !== 'zh') return null;
  const current = live?.state ?? { topic, furnace, sort, format };
  return (
    <nav
      className={styles.formatTabs}
      aria-label="内容类型"
      inert={disabled || undefined}
    >
      {NEWS_CONTENT_FORMATS.map((item) => (
        <Link
          key={item.id}
          prefetch={false}
          href={buildNewsDecisionHref(`/${locale}/news`, {
            ...current,
            query,
            page: 1,
            format: item.id,
          })}
          className={`${styles.formatTab} ${(current.format ?? 'article') === item.id ? styles.formatTabActive : ''}`}
          aria-current={(current.format ?? 'article') === item.id ? 'page' : undefined}
        >
          {item[locale]}
        </Link>
      ))}
    </nav>
  );
}
