'use client';

import { useEffect, useState } from 'react';
import type { Locale } from '@/types/site';
import { useRouter } from 'next/navigation';
import { HiMagnifyingGlass } from 'react-icons/hi2';
import {
  buildNewsDecisionHref,
  type NewsDecisionTopicId,
  type NewsFurnaceFilterId,
  type NewsSort,
} from '@/lib/news-decision-center';
import { useNewsListState } from './NewsListInteractive';
import styles from './NewsDecisionCenter.module.css';
import { DEFAULT_NEWS_SORT } from '@/lib/news-decision-center';

export function NewsSearchForm({
  locale = 'zh',
  query,
  topic,
  furnace,
  sort,
  disabled = false,
}: {
  locale?: Locale;
  query: string;
  topic: NewsDecisionTopicId;
  furnace: NewsFurnaceFilterId;
  sort: NewsSort;
  disabled?: boolean;
}) {
  const router = useRouter();
  // Inside the interactive list the filters can change without a new page.
  const live = useNewsListState();
  const current = live ?? { topic, furnace, sort };
  const [value, setValue] = useState(query);
  useEffect(() => setValue(query), [query]);
  useEffect(() => {
    const restore = () => setValue(new URLSearchParams(location.search).get('q') || '');
    window.addEventListener('pageshow', restore);
    window.addEventListener('popstate', restore);
    return () => {
      window.removeEventListener('pageshow', restore);
      window.removeEventListener('popstate', restore);
    };
  }, []);
  return (
    <form
      className={styles.searchForm}
      action={`/${locale}/news`}
      method="get"
      role="search"
      onSubmit={(event) => {
        event.preventDefault();
        router.push(
          buildNewsDecisionHref(`/${locale}/news`, {
            query: value,
            topic: current.topic,
            furnace: current.furnace,
            sort: current.sort,
          }),
        );
      }}
    >
      <div className={styles.searchField}>
        <label className="sr-only" htmlFor="news-center-search">
          {locale === 'en' ? 'Search industrial furnace resources' : '搜索工业炉资料'}
        </label>
        <HiMagnifyingGlass className={styles.searchIcon} aria-hidden="true" />
        <input
          id="news-center-search"
          className={styles.searchInput}
          name="q"
          type="search"
          aria-describedby="news-center-search-hint"
          disabled={disabled}
          value={value}
          onChange={(event) => setValue(event.target.value)}
          placeholder={locale === 'en' ? 'Search resources' : '搜索设备、工艺或问题'}
        />
      </div>
      {current.topic !== 'all' && <input type="hidden" name="topic" value={current.topic} />}
      {current.furnace !== 'all' && (
        <input type="hidden" name="furnace" value={current.furnace} />
      )}
      {current.sort !== DEFAULT_NEWS_SORT && <input type="hidden" name="sort" value={current.sort} />}
      <button className={styles.searchButton} type="submit" disabled={disabled}>
        {locale === 'en' ? 'Search' : '搜索'}
      </button>
      <p id="news-center-search-hint" className={styles.searchHint}>
        {locale === 'en'
          ? 'Try: trolley furnace pricing or annealing'
          : '例如：台车炉报价、退火工艺'}
      </p>
    </form>
  );
}
