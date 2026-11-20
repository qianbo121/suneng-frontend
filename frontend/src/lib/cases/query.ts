import { caseEquipmentCategory, caseFilterCategory, homeWorkpieceCategories, matchesCaseFacets } from './facets';
import { LOCAL_REVIEW_CASE_SLUGS } from './fastener-case-entry';
import {
  CASE_FILTER_KEYS,
  CASE_PAGE_SIZE,
  type CaseCardData,
  type CaseMeta,
  type CaseQuery,
} from './types';

export type SearchParams = Record<string, string | string[] | undefined>;
export function parseCaseQuery(input: SearchParams | URLSearchParams): CaseQuery {
  const get = (key: string) => {
    const value = input instanceof URLSearchParams ? input.get(key) : input[key];
    return (typeof value === 'string' ? value : '').trim().slice(0, 160);
  };
  const number = (key: string, fallback: number) =>
    /^\d{1,6}$/.test(get(key)) ? Math.max(1, Number(get(key))) : fallback;
  const page = number('page', 1);
  const sort = get('sort');
  return {
    q: get('q'),
    workpiece: get('workpiece'),
    process: get('process'),
    equipment: get('equipment'),
    need: get('need'),
    type:
      get('type') === 'proposal' ? 'proposal' : get('type') === 'experience' ? 'experience' : '',
    sort: sort === 'updated' || sort === 'year' || sort === 'relevance' ? sort : 'published',
    page,
    from: Math.min(page, number('from', page)),
  };
}

export function caseListHref(query: CaseQuery, changes: Partial<CaseQuery> = {}) {
  const state = { ...query, ...changes };
  const params = new URLSearchParams();
  for (const key of ['q', ...CASE_FILTER_KEYS, 'type'] as const)
    if (state[key]) params.set(key, state[key]);
  if (state.sort !== 'published') params.set('sort', state.sort);
  if (state.page > 1) params.set('page', String(state.page));
  if (state.from < state.page) params.set('from', String(state.from));
  return `/zh/case${params.size ? `?${params}` : ''}`;
}

export function safeCaseReturn(value?: string | string[]) {
  if (typeof value !== 'string' || value.length > 1800) return '/zh/case';
  try {
    const url = new URL(value, 'https://case.local');
    if (url.origin !== 'https://case.local' || url.pathname !== '/zh/case') return '/zh/case';
    return caseListHref(parseCaseQuery(url.searchParams));
  } catch {
    return '/zh/case';
  }
}

export function hasCaseSearch(query: CaseQuery) {
  return Boolean(
    query.q ||
    query.type ||
    CASE_FILTER_KEYS.some((key) => query[key]) ||
    query.sort !== 'published' ||
    query.from < query.page,
  );
}

const normalize = (text: string) =>
  text.normalize('NFKC').toLocaleLowerCase('zh-CN').replace(/\s+/g, ' ');

export function newestPublishedFirst(a: Pick<CaseMeta, 'datePublished' | 'id'>, b: Pick<CaseMeta, 'datePublished' | 'id'>) {
  const timeA = a.datePublished ? Date.parse(a.datePublished) : -Infinity;
  const timeB = b.datePublished ? Date.parse(b.datePublished) : -Infinity;
  return timeB - timeA || a.id.localeCompare(b.id);
}

export function filterCases<T extends CaseMeta & { searchText: string }>(
  records: T[],
  query: CaseQuery,
) {
  const terms = normalize(query.q).split(' ').filter(Boolean);
  const score = (item: T) =>
    terms.reduce(
      (sum, term) =>
        sum +
        (normalize(item.title).includes(term) ? 8 : 0) +
        (normalize(item.tags.join(' ')).includes(term) ? 4 : 0) +
        (normalize(item.summary).includes(term) ? 2 : 0),
      0,
    );
  return records
    .filter(
      (item) =>
        (item.publicationStatus === 'published' || (process.env.NODE_ENV === 'development' && LOCAL_REVIEW_CASE_SLUGS.has(item.slug))) &&
        (!query.type || item.contentType === query.type) &&
        matchesCaseFacets(item, query) &&
        terms.every((term) => normalize(item.searchText).includes(term)),
    )
    .sort((a, b) => {
      if (query.sort === 'published') {
        if (process.env.NODE_ENV === 'development') {
          // Show unpublished review records together without assigning a publication date.
          const first = Number(b.publicationStatus === 'draft') - Number(a.publicationStatus === 'draft');
          if (first) return first;
        }
        return newestPublishedFirst(a, b);
      }
      if (query.sort === 'relevance' && terms.length) {
        const difference = score(b) - score(a);
        if (difference) return difference;
      }
      if (query.sort === 'year') {
        const difference = (b.projectYear ?? 0) - (a.projectYear ?? 0);
        if (difference) return difference;
      }
      return (
        (b.dateModified ?? b.datePublished ?? '').localeCompare(
          a.dateModified ?? a.datePublished ?? '',
        ) || a.id.localeCompare(b.id)
      );
    });
}

export function toCaseCard(item: CaseMeta): CaseCardData {
  return {
    id: item.id,
    slug: item.slug,
    title: item.title,
    listTitle: item.listTitle,
    workpiece: [...new Set(item.workpiece.map((value) => caseFilterCategory('workpiece', value)))].sort(
      (a, b) => Number(homeWorkpieceCategories.some((c) => c.label === b)) - Number(homeWorkpieceCategories.some((c) => c.label === a)),
    ),
    equipment: [...new Set(item.equipment.map(caseEquipmentCategory))],
    summary: item.listSummary || item.summary,
    contentType: item.contentType,
    projectYear: item.projectYear,
    facts: item.facts.slice(0, 3),
    participation: item.participation,
    sourceSummary: item.sourceSummary,
    cover: item.cover && { src: item.cover.src, alt: item.cover.alt, fit: item.cover.fit },
    coverTitle: item.coverTitle,
  };
}

export function paginateCases<T>(items: T[], query: CaseQuery, size = CASE_PAGE_SIZE) {
  const totalPages = Math.ceil(items.length / size);
  return {
    items: items.slice((query.page - 1) * size, query.page * size),
    total: items.length,
    totalPages,
    page: query.page,
    from: query.page,
    nextHref:
      query.page < totalPages
        ? caseListHref(query, { page: query.page + 1, from: query.page + 1 })
        : null,
  };
}
