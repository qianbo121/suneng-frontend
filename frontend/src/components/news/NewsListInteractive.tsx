'use client';

import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
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
    const next = parseNewsListState(window.location.search);
    setState((current) => (isSameNewsListState(current, next) ? current : next));
  }, [listPath]);

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
    if (top < 0 || top > window.innerHeight * 0.6) {
      window.scrollTo({ top: Math.max(0, window.scrollY + top - 24) });
    }
    if (target === 'focus-heading') heading.focus({ preventScroll: true });
  }, [view]);

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
    const next = parseNewsListState(url.searchParams);
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
    <NewsListContext.Provider value={{ locale, state, view, pageSize }}>
      <Suspense fallback={null}>
        <SearchParamsChange onChange={sync} />
      </Suspense>
      <div className={className} onClickCapture={handleClickCapture}>
        {children}
      </div>
    </NewsListContext.Provider>
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
      <section className={styles.furnaceInner} aria-label={t('设备类型筛选')}>
        <span className={styles.furnaceLabel}>{t('设备类型')}</span>
        <div className={styles.furnaceLinks}>
          {NEWS_FURNACE_FILTERS.map((item) => (
            <Link
              key={item.id}
              prefetch={false}
              href={buildNewsDecisionHref(base, { ...state, page: 1, furnace: item.id })}
              className={`${styles.furnaceLink} ${item.id === state.furnace ? styles.furnaceLinkActive : ''}`}
              aria-current={item.id === state.furnace ? 'page' : undefined}
            >
              {t(item.label)}
            </Link>
          ))}
        </div>
      </section>
    </>
  );
}

export function NewsListHeading() {
  const { locale, state } = useNewsList();
  const t = (text: string) => newsUiText(locale, text);
  const base = `/${locale}/news`;

  return (
    <>
      <h2 id="news-list-title" className={styles.listTitle} tabIndex={-1}>
        {t(NEWS_DECISION_TOPICS.find((item) => item.id === state.topic)?.label || '')}
      </h2>
      <nav className={styles.sortNav} aria-label={t('文章排序')}>
        {(
          [
            { id: 'recommended', label: t('推荐阅读') },
            { id: 'updated', label: t('最近更新') },
          ] as const
        ).map((item) => (
          <Link
            prefetch={false}
            key={item.id}
            href={buildNewsDecisionHref(base, { ...state, page: 1, sort: item.id })}
            aria-current={state.sort === item.id ? 'page' : undefined}
            className={`${styles.sortLink} ${state.sort === item.id ? styles.sortActive : ''}`}
          >
            {t(item.label)}
          </Link>
        ))}
      </nav>
    </>
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
      prefetchPages={false}
    />
  );
}
