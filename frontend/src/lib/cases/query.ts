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
  return {
    q: get('q'),
    workpiece: get('workpiece'),
    process: get('process'),
    equipment: get('equipment'),
    need: get('need'),
    type:
      get('type') === 'proposal' ? 'proposal' : get('type') === 'experience' ? 'experience' : '',
    sort: get('sort') === 'updated' ? 'updated' : get('sort') === 'year' ? 'year' : 'relevance',
    page,
    from: Math.min(page, number('from', page)),
  };
}

export function caseListHref(query: CaseQuery, changes: Partial<CaseQuery> = {}) {
  const state = { ...query, ...changes };
  const params = new URLSearchParams();
  for (const key of ['q', ...CASE_FILTER_KEYS, 'type'] as const)
    if (state[key]) params.set(key, state[key]);
  if (state.sort !== 'relevance') params.set('sort', state.sort);
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
    query.sort !== 'relevance' ||
    query.from < query.page,
  );
}

const normalize = (text: string) =>
  text.normalize('NFKC').toLocaleLowerCase('zh-CN').replace(/\s+/g, ' ');

// Only explicit equipment aliases are grouped. Mixed arrangements such as
// 台车式罩式炉 and 台车式旋转固化炉 retain their own labels for selection.
const equipmentAliases: Record<string, readonly string[]> = {
  台车炉: [
    '可变容台车式燃气炉', '可变容燃气台车炉', '台车式加热炉', '台车式回火炉',
    '台车式时效炉', '台车式淬火炉', '台车式热处理炉', '台车式热风循环电阻炉',
    '台车式燃气加热炉', '台车式燃气热处理炉', '台车式燃气预热炉', '台车式电阻炉',
    '台车式铝合金退火炉', '热风循环台车式电阻炉', '燃气台车式热处理炉',
    '燃气台车式焙烧炉', '燃气台车炉', '高温台车式电阻炉',
  ],
  井式炉: ['井式回火炉', '井式气氛保护炉', '井式燃气炉', '井式球化退火炉',
    '井式电阻炉', '氮气保护井式回火炉', '预抽真空氮气保护井式炉'],
  箱式炉: ['箱式电阻炉', '箱式空气循环加热炉', '高温箱式电阻炉'],
  辊底炉: ['辊棒式加热炉', '辊棒式燃气加热炉', '辊道式电阻炉'],
};
export function caseEquipmentCategory(value: string): string {
  return Object.entries(equipmentAliases).find(([, aliases]) => aliases.includes(value))?.[0] ?? value;
}

function matchesEquipment(values: string[], selected: string) {
  // Old bookmarked, specific filters retain their original exact meaning.
  return values.includes(selected) || values.some((value) => caseEquipmentCategory(value) === selected);
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
        item.publicationStatus === 'published' &&
        (!query.type || item.contentType === query.type) &&
        CASE_FILTER_KEYS.every((key) => !query[key] || (key === 'equipment'
          ? matchesEquipment(item[key], query[key])
          : item[key].includes(query[key]))) &&
        terms.every((term) => normalize(item.searchText).includes(term)),
    )
    .sort((a, b) => {
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
    summary: item.listSummary || item.summary,
    contentType: item.contentType,
    projectYear: item.projectYear,
    facts: item.facts.slice(0, 3),
    participation: item.participation,
    sourceSummary: item.sourceSummary,
    cover: item.cover,
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
