import type { Locale } from '@/types/site';
import { newsUiText } from '@/lib/news-ui';
import type { NewsListCardItem } from '@/types/news';

export const NEWS_DECISION_TOPICS = [
  { id: 'all', label: '全部资料' },
  { id: 'selection', label: '设备选型' },
  { id: 'procurement', label: '报价采购' },
  { id: 'quality', label: '工艺质量' },
  { id: 'engineering', label: '工程验收' },
  { id: 'operations', label: '维修改造' },
] as const;

export const NEWS_FURNACE_FILTERS = [
  { id: 'all', label: '全部设备' },
  { id: 'line', label: '热处理生产线' },
  { id: 'trolley', label: '台车炉' },
  { id: 'pit', label: '井式炉' },
  { id: 'box', label: '箱式炉' },
  { id: 'mesh-belt', label: '网带炉' },
  { id: 'roller-hearth', label: '辊底炉' },
] as const;

export type NewsDecisionTopicId = (typeof NEWS_DECISION_TOPICS)[number]['id'];
export type NewsFurnaceFilterId = (typeof NEWS_FURNACE_FILTERS)[number]['id'];

export const NEWS_CENTER_FAQS = [
  {
    question: '工业炉报价前需要准备哪些参数？',
    answer: '先统一工件、材质、工艺、产能、装卸、公用工程和供货边界，再比较不同厂家的方案。',
  },
  {
    question: '连续式热处理线和周期炉怎么选？',
    answer: '核心取决于产品稳定性、批量、换型频率、工艺节拍和上下游衔接条件。',
  },
  {
    question: '怎样判断厂家能否对整线负责？',
    answer: '核对其是否承担节拍、接口、安全、联调、验收和售后，而不只是提供单台炉子。',
  },
  {
    question: '老旧工业炉应该大修还是更换？',
    answer: '需要同时比较结构状态、温控能力、能耗、停产窗口、改造成本和剩余寿命。',
  },
] as const;

export type NewsSort = 'recommended' | 'updated';

// The resource centre defaults to newest first. "Recommended" ranks by view
// count, which buried every freshly published article behind everything that
// had ever been read: a new page cannot earn views while it sits on the last
// page, and it sits there because it has no views.
export const DEFAULT_NEWS_SORT: NewsSort = 'updated';

export function normalizeNewsSort(value?: string): NewsSort {
  return value === 'recommended' ? 'recommended' : DEFAULT_NEWS_SORT;
}

export type NewsDecisionFilters = {
  sort?: string;
  query?: string;
  topic?: string;
  furnace?: string;
};

function searchableText(item: NewsListCardItem) {
  return (
    item.searchText || `${item.title.zh} ${item.summary.zh} ${item.category.zh}`
  ).toLowerCase();
}

export function normalizeNewsDecisionTopic(value?: string): NewsDecisionTopicId {
  return NEWS_DECISION_TOPICS.some((item) => item.id === value)
    ? (value as NewsDecisionTopicId)
    : 'all';
}

export function normalizeNewsFurnaceFilter(value?: string): NewsFurnaceFilterId {
  return NEWS_FURNACE_FILTERS.some((item) => item.id === value)
    ? (value as NewsFurnaceFilterId)
    : 'all';
}

export function getNewsDecisionTopic(item: NewsListCardItem): NewsDecisionTopicId {
  if (item.listTopic) return item.listTopic;

  // A summary can mention purchasing or maintenance as context. Prefer the
  // question the title actually answers when no reviewed topic is available.
  const title = item.title.zh;
  if (/报价|采购|价格|多少钱|合同|招标|成本/.test(title)) return 'procurement';
  if (/运维|维护|维修|改造|大修|节能|备件|售后|故障|操作规程|漏热|漏火|产能上不去/.test(title))
    return 'operations';
  if (/选型|怎么选|如何选|适合|什么工件|是什么|有哪些|哪家|厂家推荐|自动化要做到什么程度/.test(title))
    return 'selection';
  if (/工程|验收|安装|调试|交付|责任|项目管理|追溯|SAT/i.test(title)) return 'engineering';
  if (/工艺|质量|温度|均温|自动化|控制|淬火|退火|正火|回火/.test(title)) return 'quality';

  const text = `${item.title.zh} ${item.summary.zh}`.toLowerCase();

  if (/报价|采购|价格|多少钱|合同|供应商|招标|成本/.test(text)) return 'procurement';
  if (/运维|维护|维修|改造|大修|节能|备件|售后|故障/.test(text)) return 'operations';
  if (/工程|验收|安装|调试|交付|责任|项目管理/.test(text)) return 'engineering';
  if (/工艺|质量|温度|均温|自动化|控制|淬火|退火|正火|回火/.test(text)) return 'quality';
  if (/选型|方案|怎么选|炉型|产能|生产线|连续式|周期炉/.test(text)) return 'selection';

  return 'quality';
}

export function getNewsFurnaceFilters(item: NewsListCardItem): NewsFurnaceFilterId[] {
  if (item.listFurnaces) return item.listFurnaces;
  // A body may compare many furnace types. Do not classify by its first incidental mention.
  const text = item.title.zh;
  const result: NewsFurnaceFilterId[] = [];
  if (/网带炉|网带式/.test(text)) result.push('mesh-belt');
  if (/辊底炉|辊底式|辊棒炉|辊棒式/.test(text)) result.push('roller-hearth');
  if (/台车炉|台车式/.test(text)) result.push('trolley');
  if (/井式炉|井式/.test(text)) result.push('pit');
  if (/箱式炉|箱式/.test(text)) result.push('box');
  if (/热处理生产线|连续式|连续线|整线|生产线/.test(text)) result.push('line');
  return result;
}

export function getNewsFurnaceFilter(item: NewsListCardItem): NewsFurnaceFilterId | null {
  return getNewsFurnaceFilters(item)[0] ?? null;
}

function modifiedTime(item: NewsListCardItem) {
  const updated = Date.parse(item.updatedAt || '');
  const published = Date.parse(item.date || '');
  return Number.isFinite(updated) ? updated : Number.isFinite(published) ? published : 0;
}

function views(item: NewsListCardItem) {
  const value = item.viewCount ?? item.source?.viewCount;
  return typeof value === 'number' && Number.isFinite(value) ? Math.max(0, value) : 0;
}

export function isFeaturedNewsPage(filters: NewsDecisionFilters & { page?: number }) {
  return (
    normalizeNewsSort(filters.sort) === DEFAULT_NEWS_SORT &&
    (filters.page ?? 1) === 1 &&
    !filters.query?.trim() &&
    normalizeNewsDecisionTopic(filters.topic) === 'all' &&
    normalizeNewsFurnaceFilter(filters.furnace) === 'all'
  );
}

export function filterAndSortNewsDecisionItems(
  items: NewsListCardItem[],
  filters: NewsDecisionFilters = {},
) {
  const topic = normalizeNewsDecisionTopic(filters.topic);
  const furnace = normalizeNewsFurnaceFilter(filters.furnace);
  const query = filters.query?.trim().toLowerCase() || '';

  return items
    .filter((item) => !query || searchableText(item).includes(query))
    .filter((item) => topic === 'all' || getNewsDecisionTopic(item) === topic)
    .filter((item) => furnace === 'all' || getNewsFurnaceFilters(item).includes(furnace))
    .sort(
      (left, right) =>
        (normalizeNewsSort(filters.sort) === 'recommended' ? views(right) - views(left) : 0) ||
        modifiedTime(right) - modifiedTime(left) ||
        left.id - right.id ||
        left.slug.localeCompare(right.slug, 'en'),
    );
}

export function getNewsDecisionDisplayMeta(item: NewsListCardItem, locale: Locale = 'zh') {
  const topicId = getNewsDecisionTopic(item);
  const topicLabel =
    NEWS_DECISION_TOPICS.find((topic) => topic.id === topicId)?.label || '工艺质量';
  const furnaceLabel =
    (locale === 'zh' ? item.listEquipmentLabel : '') ||
    getNewsFurnaceFilters(item)
      .map((id) => newsUiText(locale, NEWS_FURNACE_FILTERS.find((f) => f.id === id)?.label || ''))
      .filter(Boolean)
      .join(' / ') ||
    (locale === 'en' ? 'Industrial Furnaces' : '工业炉');
  const contentLength = `${item.title.zh}${item.summary.zh}`.length;

  return {
    topicLabel: newsUiText(locale, topicLabel),
    furnaceLabel,
    readingMinutes: Math.min(9, Math.max(5, 5 + Math.floor(contentLength / 70))),
    hasChecklist: /清单|报价|参数|备件|售后|验收/.test(`${item.title.zh}${item.summary.zh}`),
  };
}

export function buildNewsDecisionHref(
  baseHref: string,
  filters: NewsDecisionFilters & { page?: number },
) {
  const params = new URLSearchParams();
  const query = filters.query?.trim();
  const topic = normalizeNewsDecisionTopic(filters.topic);
  const furnace = normalizeNewsFurnaceFilter(filters.furnace);

  // Only the non-default order is spelled out, so the plain list URL stays canonical.
  const sort = normalizeNewsSort(filters.sort);
  if (sort !== DEFAULT_NEWS_SORT) params.set('sort', sort);
  if (query) params.set('q', query);
  if (topic !== 'all') params.set('topic', topic);
  if (furnace !== 'all') params.set('furnace', furnace);
  if ((filters.page ?? 1) > 1) params.set('page', String(filters.page));

  const suffix = params.toString();
  return suffix ? `${baseHref}?${suffix}` : baseHref;
}
