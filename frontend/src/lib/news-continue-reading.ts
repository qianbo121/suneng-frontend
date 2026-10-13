import { getCanonicalNewsSlug } from '@/lib/news-routing';
import { getNewsFurnaceFilters, type NewsFurnaceFilterId } from '@/lib/news-decision-center';

export type NewsContinueReadingCandidate = {
  id: number;
  slug: string;
  title: string;
  categoryId?: number | null;
  titleZh?: string;
  furnaces?: NewsFurnaceFilterId[];
};

type CurrentNewsArticle = {
  id: number;
  slug: string;
  categoryId?: number | null;
  titleZh?: string;
  furnaces?: NewsFurnaceFilterId[];
};

const WORKPIECES = [
  /紧固件|螺栓|螺母|螺钉/, /铜丝|铜线/, /线材|钢丝|盘条|盘圆/,
  /带材|钢带|不锈钢带/, /管材|钢管|油管/, /铸件|铸钢|铸铁/,
  /锻件|锻造/, /铝合金|铝件/, /轴承/, /履带|链轨/, /弹簧|压簧/, /晶圆|晶片|半导体/,
];
const PROCESSES = [/渗碳|碳氮共渗/, /氮化/, /退火/, /回火/, /淬火|调质/, /固溶/, /去应力/];
const PROCUREMENT = /采购|报价|价格|多少钱|供应商|厂家|集成商|交钥匙|找谁|咨询/;

function subject(item: { title?: string; titleZh?: string; furnaces?: NewsFurnaceFilterId[] }) {
  const title = item.titleZh || item.title || '';
  return {
    title,
    furnaces: item.furnaces ?? getNewsFurnaceFilters({
      id: -1, slug: '', image: '', date: '',
      title: { zh: title, en: '' }, summary: { zh: '', en: '' }, category: { zh: '', en: '' },
    }),
    workpieces: WORKPIECES.flatMap((pattern, index) => pattern.test(title) ? [index] : []),
    processes: PROCESSES.flatMap((pattern, index) => pattern.test(title) ? [index] : []),
  };
}

function shared(left: Array<string | number>, right: Array<string | number>) {
  return left.some((value) => right.includes(value));
}

function relevance(current: ReturnType<typeof subject>, candidate: ReturnType<typeof subject>) {
  const workpiece = shared(current.workpieces, candidate.workpieces);
  const furnace = shared(current.furnaces, candidate.furnaces);
  const process = shared(current.processes, candidate.processes);
  // An incidental shared furnace must not join incompatible workpiece or process topics.
  if (current.workpieces.length && candidate.workpieces.length && !workpiece) return 0;
  if (current.processes.length && candidate.processes.length && !process && !workpiece) return 0;
  if (workpiece || furnace || process) {
    return (workpiece ? 8 : 0) + (furnace ? 6 : 0) + (process ? 4 : 0)
      + (PROCUREMENT.test(candidate.title) ? 3 : 0);
  }
  // General procurement questions lead to other general procurement questions.
  return !current.workpieces.length && !current.processes.length
    && current.furnaces.every(value => value === 'line')
    && !candidate.workpieces.length && !candidate.processes.length
    && candidate.furnaces.every(value => value === 'line')
    && PROCUREMENT.test(current.title) && PROCUREMENT.test(candidate.title) ? 3 : 0;
}

export function selectNewsContinueReadingItems(
  currentArticle: CurrentNewsArticle,
  candidates: NewsContinueReadingCandidate[],
  limit = 4,
) {
  const currentSlug = getCanonicalNewsSlug(currentArticle.slug);
  const seenSlugs = new Set<string>();
  const uniqueCandidates = candidates.filter((candidate) => {
    const canonicalSlug = getCanonicalNewsSlug(candidate.slug);

    if (
      candidate.id === currentArticle.id ||
      canonicalSlug === currentSlug ||
      seenSlugs.has(canonicalSlug) ||
      !candidate.title.trim()
    ) {
      return false;
    }

    seenSlugs.add(canonicalSlug);
    return true;
  });

  const current = subject(currentArticle);
  return uniqueCandidates
    .map((candidate, index) => ({ candidate, index, score: relevance(current, subject(candidate)) }))
    .filter(({ score }) => score > 0)
    .sort((left, right) => right.score - left.score || left.index - right.index)
    .slice(0, Math.max(0, limit))
    .map(({ candidate }) => candidate);
}
