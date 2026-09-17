import { formatNewsDisplayDate } from '@/lib/news-display-date';
import {
  filterAndSortNewsDecisionItems,
  getNewsDecisionTopic,
  getNewsFurnaceFilters,
  normalizeNewsDecisionTopic,
  normalizeNewsFurnaceFilter,
  normalizeNewsSort,
  type NewsDecisionTopicId,
  type NewsFurnaceFilterId,
  type NewsSort,
} from '@/lib/news-decision-center';
import { normalizeNewsPage } from '@/lib/news-pagination';
import type { NewsListCardItem } from '@/types/news';
import type { Locale } from '@/types/site';

// Everything the browser needs to switch topic, equipment, sort and page
// without asking the server again. Search stays on the server.
export type NewsListState = {
  topic: NewsDecisionTopicId;
  furnace: NewsFurnaceFilterId;
  sort: NewsSort;
  page: number;
};

export function parseNewsListState(search: string | URLSearchParams): NewsListState {
  const params = typeof search === 'string' ? new URLSearchParams(search) : search;
  return {
    topic: normalizeNewsDecisionTopic(params.get('topic') ?? undefined),
    furnace: normalizeNewsFurnaceFilter(params.get('furnace') ?? undefined),
    sort: normalizeNewsSort(params.get('sort') ?? undefined),
    page: normalizeNewsPage(params.get('page') ?? undefined),
  };
}

export function isSameNewsListState(left: NewsListState, right: NewsListState) {
  return (
    left.topic === right.topic &&
    left.furnace === right.furnace &&
    left.sort === right.sort &&
    left.page === right.page
  );
}

export function hasNewsListFilters(state: NewsListState) {
  return state.topic !== 'all' || state.furnace !== 'all' || state.sort !== 'recommended';
}

// Mirrors the server page: an out-of-range page shows the last page.
export function getNewsListView(cards: NewsListCardItem[], state: NewsListState, pageSize: number) {
  const filtered = filterAndSortNewsDecisionItems(cards, state);
  const total = filtered.length;
  const page = Math.min(state.page, Math.max(1, Math.ceil(total / pageSize)));
  const start = (page - 1) * pageSize;
  return { total, page, items: filtered.slice(start, start + pageSize) };
}

// Server-side only in practice: trims prepared cards to the fields list cards
// and client filters read. Classification and dates are resolved here so the
// browser does not need the other language, search text or article bodies.
export function toNewsListLiteCards(items: NewsListCardItem[], locale: Locale): NewsListCardItem[] {
  return items.map((item) => {
    const views = item.viewCount ?? item.source?.viewCount;
    return {
      id: item.id,
      slug: item.slug,
      image: item.image,
      title: { zh: locale === 'zh' ? item.title.zh : '', en: locale === 'en' ? item.title.en : '' },
      summary: {
        zh: locale === 'zh' ? item.summary.zh : '',
        en: locale === 'en' ? item.summary.en : '',
      },
      category: { zh: '', en: '' },
      date: item.date,
      updatedAt: item.updatedAt ?? null,
      ...(typeof views === 'number' ? { viewCount: views } : {}),
      listTopic: getNewsDecisionTopic(item),
      listFurnaces: getNewsFurnaceFilters(item),
      ...(locale === 'zh' && item.listEquipmentLabel
        ? { listEquipmentLabel: item.listEquipmentLabel }
        : {}),
      listDisplayDate: formatNewsDisplayDate(item.updatedAt || item.date),
    };
  });
}
