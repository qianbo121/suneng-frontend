import manifest from '../../../../data/workpiece-router/workpiece-card-manifest.json';
import { CASE_FILTER_KEYS, type CaseFilterKey, type CaseMeta, type CaseQuery } from './types';

export const homeWorkpieceCategories = manifest.categories;
const workpieceGroups = new Map<string, string>();
for (const category of homeWorkpieceCategories) {
  workpieceGroups.set(category.label, category.label);
  for (const card of category.cards) workpieceGroups.set(card.name, category.label);
}
// Only explicit workpiece names in project records supplement the homepage vocabulary.
for (const [name, group] of Object.entries({
  不锈钢带材: '板带卷材', 紧固件: '紧固批量件', 螺丝钉: '紧固批量件',
  'U 型螺栓': '紧固批量件', 高压缠绕瓶铝内胆: '气瓶',
})) workpieceGroups.set(name, group);

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

export function caseFilterCategory(key: CaseFilterKey, value: string) {
  if (key === 'equipment') return caseEquipmentCategory(value);
  if (key === 'workpiece') return workpieceGroups.get(value) ?? value;
  return value;
}

type Facets = Pick<CaseMeta, CaseFilterKey>;
export function matchesCaseFacets(item: Facets, query: CaseQuery) {
  return CASE_FILTER_KEYS.every((key) => !query[key] || item[key].some(
    (value) => value === query[key] || caseFilterCategory(key, value) === query[key],
  ));
}

export function countCaseFacet(candidates: Facets[], key: CaseFilterKey, selected: string) {
  const counts = new Map<string, number>();
  for (const item of candidates) {
    const values = new Set(item[key].map((value) => caseFilterCategory(key, value)));
    if (selected && item[key].includes(selected)) values.add(selected);
    for (const value of values) counts.set(value, (counts.get(value) ?? 0) + 1);
  }
  if (selected && !counts.has(selected)) counts.set(selected, 0);
  const names = key === 'workpiece'
    ? homeWorkpieceCategories.map((category) => category.label).filter((name) => counts.has(name))
    : [...counts.keys()].sort((a, b) => a.localeCompare(b, 'zh-CN'));
  return [{ value: '', count: candidates.length }, ...names.map((value) => ({ value, count: counts.get(value)! }))];
}
