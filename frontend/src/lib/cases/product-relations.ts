import 'server-only';
import relationsData from './product-relations.json';
import { getPublicCases } from './server';
import { getEnglishCases } from './english';
import { getStaticProductBySlug } from '@/constants/static-products';
import { getAdditionalFurnace } from '@/lib/additional-furnaces';
import { getHeatTreatmentLine } from '@/lib/heat-treatment-lines';
import { localizeOrHideHref } from '@/lib/i18n/zh-only';
import type { Locale } from '@/types/site';

/**
 * Declared rather than inferred from the JSON: `note` and `entry` are only
 * present on some rows, so inference made the record shape depend on which
 * cases happened to be in the file.
 */
export type CaseProductRelation = {
  number: number;
  caseId: string;
  products: string[];
  entry: string | null;
  focus: string;
  scope: string;
  note?: Record<Locale, string>;
};

const relations: readonly CaseProductRelation[] = relationsData as CaseProductRelation[];

export const CASE_EVIDENCE_ID = 'related-case-evidence';
export const caseProductRelations = relations;

const focuses: Record<string, Record<Locale, string>> = {
  load: { zh: '装载与工装', en: 'Loading and tooling' },
  handling: { zh: '装卸与转运接口', en: 'Handling and transfer interfaces' },
  measurement: { zh: '测温与控制边界', en: 'Measurement and control scope' },
  atmosphere: { zh: '气氛、密封与冷却', en: 'Atmosphere, sealing and cooling' },
  capacity: { zh: '节拍与能力核算', en: 'Cycle and capacity checks' },
  supply: { zh: '供货与验收范围', en: 'Supply and acceptance scope' },
  renovation: { zh: '改造与利旧条件', en: 'Retrofit and reuse conditions' },
  process: { zh: '工艺与设备适配', en: 'Process and equipment suitability' },
  configuration: { zh: '结构与热工配置', en: 'Structure and thermal configuration' },
};
const entryNames: Record<string, Record<Locale, string>> = {
  '/contact': { zh: '提交工况，确认设备与配套范围', en: 'Discuss equipment and supporting requirements' },
  '/service/furnace-renovation-overhaul': { zh: '工业炉改造与大修', en: 'Furnace renovation and overhaul' },
  '/solutions/continuous-heat-treatment-line': { zh: '热处理产线与工序接口', en: 'Heat-treatment lines and process interfaces' },
  '/solutions/rechuli-lu-wendu-bujun-zhenggai': { zh: '温度均匀性与测温核对', en: 'Temperature uniformity and measurement checks' },
  '/solutions/rechuli-lu-gaizao-fengxian-zhouqi': { zh: '改造范围、风险与周期', en: 'Renovation scope, risks and schedule' },
  '/solutions/rechuli-lu-dian-gai-ran-yure-huishou': { zh: '燃料改造与余热利用边界', en: 'Fuel conversion and heat-recovery scope' },
  '/solutions/rechuli-lu-kongzhi-xitong-shengji': { zh: '控制系统升级与接口', en: 'Control-system upgrades and interfaces' },
  '/solutions/rechuli-lu-tingchan-chongqi-banqian-fuchan': { zh: '停产、搬迁与复产核对', en: 'Shutdown, relocation and restart checks' },
};

export function productConnectionName(slug: string, locale: Locale) {
  const additional = getAdditionalFurnace(slug);
  if (additional) return locale === 'en' ? additional.nameEn : additional.name;
  return getStaticProductBySlug(slug)?.name[locale] ?? (locale === 'zh' ? getHeatTreatmentLine(slug)?.title : undefined);
}

/** Both directions use stable case IDs. No title/keyword matching or public-state bypass. */
export function getCaseConnections(caseId: string, locale: Locale) {
  const relation = relations.find((item) => item.caseId === caseId);
  if (!relation) return [];
  const paths = relation.products.map((slug) => ({
    path: `/products/detail/${slug}`, name: productConnectionName(slug, locale),
  }));
  if (relation.entry) paths.push({ path: relation.entry, name: entryNames[relation.entry]?.[locale] });
  return paths.flatMap(({ path, name }) => {
    let href = localizeOrHideHref(`/zh${path}`, locale);
    let scope = relation.scope;
    let note = relation.note?.[locale];
    if (!href && locale === 'en' && path.startsWith('/products/detail/') && getHeatTreatmentLine(path.split('/').at(-1)!)) {
      scope = 'interface';
      if (path.endsWith('/cylinder-curing-line')) {
        href = '/en/contact';
        name = 'Discuss resin-curing fixtures, handling and exhaust requirements';
        note = [note, 'The dedicated curing-line page is currently available in Chinese. Confirm the resin-curing process and interfaces separately; metal annealing or quenching examples are not substitutes.'].filter(Boolean).join(' ');
      } else {
        href = '/en/solutions/continuous-heat-treatment-line';
        name = 'Production-line interfaces and supply scope';
        note = [note, path.endsWith('/aluminum-forging-heating-line')
          ? 'Use this English guide for conveying and cycle coordination only. It does not establish a pre-forging heating recipe; material and process suitability require separate confirmation.'
          : 'This English guide supports process-chain, handling and supply-interface planning only. It is not an English specification for the dedicated equipment; material and process suitability require separate confirmation.'].filter(Boolean).join(' ');
      }
    } else if (!href && locale === 'en' && path === '/service/furnace-renovation-overhaul') {
      href = '/en/solutions/rechuli-lu-gaizao-fengxian-zhouqi';
      name = entryNames['/solutions/rechuli-lu-gaizao-fengxian-zhouqi'].en;
    }
    if (!href || !name) return [];
    return [{ href, name, focus: focuses[relation.focus][locale], note, scope }];
  }).filter((item, index, all) => all.findIndex((other) => other.href === item.href) === index);
}

export function getEntryCases(entryPath: string, locale: Locale) {
  const sourceRecords = getPublicCases();
  const sourceById = new Map(sourceRecords.map((item) => [item.id, item]));
  const records = locale === 'en' ? getEnglishCases() : sourceRecords;
  const byId = new Map(records.map((item) => [item.id, item]));
  return relations.flatMap((relation) => {
    const connection = getCaseConnections(relation.caseId, locale).find((item) => item.href === `/${locale}${entryPath}`);
    const item = byId.get(relation.caseId);
    if (!connection || !item) return [];
    const source = sourceById.get(item.id);
    const workpieces = source?.workpiece ?? [];
    // Use the generic category image only for explicitly generic metal parts.
    const genericMetal = workpieces.length > 0 && workpieces.every((name) => [
      '金属机件', '中小型金属机件', '金属零件', '中小型金属零件',
      '金属工件', '金属零部件', '中小型金属零部件', '钢制零部件',
      '钢制部件', '中小型机械零部件', '钢制零件', '钢类机件',
    ].includes(name));
    const cover = item.cover ?? (genericMetal ? {
      src: '/images/workpieces/case-cards-20260912/white/generic-metal-components.png',
      alt: locale === 'en' ? 'Generic metal-component category illustration, not project workpieces.' : '通用金属机件类别示意，非项目实物',
      caption: '', fit: 'contain' as const,
    } : undefined);
    // The card uses a white-background copy; the article's original cover stays unchanged.
    const cardCover = cover?.src === '/images/case-covers/review-correction-20260911/slender-wire-coil-20151104.png'
      ? { ...cover, src: '/images/workpieces/case-cards-20260912/white/slender-wire-coil-20151104.png' }
      : cover;
    const workpieceLabel = locale === 'zh'
      ? workpieces.join('、') || '工件与现场条件'
      : item.cover?.alt.replace(/^Illustration of\s+/i, '').replace(/\.$/, '')
        || (genericMetal ? 'Metal components' : 'Workpiece and site conditions');
    return [{
      id: item.id, number: relation.number, title: item.title,
      summary: locale === 'zh' ? source?.listSummary || item.summary : item.summary,
      cover: cardCover, workpieceLabel,
      href: `/${locale}/case/${item.slug}`, contentType: item.contentType, sourceDate: item.sourceDate,
      focus: focuses[relation.focus][locale], scope: connection.scope, note: connection.note,
    }];
  });
}

/** Representative records first; remaining matching records stay reachable in the same section. */
export function splitEntryCases(items: ReturnType<typeof getEntryCases>) {
  const featured: typeof items = [];
  for (const preferred of [135, 68, 56, 38, 127, 84, 130, 121, 44, 43, 51]) {
    const item = items.find((record) => record.number === preferred);
    if (item && featured.length < 3) featured.push(item);
  }
  for (const item of items) {
    if (featured.length < 3 && !featured.includes(item) && !featured.some((record) => record.focus === item.focus)) featured.push(item);
  }
  for (const item of items) if (featured.length < 3 && !featured.includes(item)) featured.push(item);
  return { featured, remaining: items.filter((item) => !featured.includes(item)) };
}
