import type { CaseCardData, CaseFact } from './types';

// Only these self-contained configuration phrases can lose their field label.
// Quantities, supply boundaries and ambiguous values retain their original context.
const standaloneValues = new Set([
  '端进侧出',
  '行车装料',
  '辊道与行车',
  '电加热与天然气',
  '销轴连接',
  '手动换料框',
  '可旋转出料斗',
  '清洗＋漂洗',
  '氧探头反馈',
  '气动夹持',
  '间接式加热',
  '排废气引风机',
  '油气两用',
  '安全销锁定',
  '直线布置',
  '起重机选配',
  '浸没水洗与喷嘴冲洗',
  '五面加热',
  '手轮压紧',
]);

export function caseFactTag(fact: CaseFact) {
  const restrictedLabel = /选配|自备|买方|卖方|供方|用户|待核|原文|上限|下限/.test(fact.label);
  if (!fact.unit && standaloneValues.has(fact.value) && !restrictedLabel) return fact.value;
  if (/^(方案)?(记录通道|温度记录)$/.test(fact.label) && fact.unit === '通道') {
    return `${fact.value}通道记录${fact.attribute === '方案参数' ? '（方案）' : ''}`;
  }

  const label =
    fact.attribute === '方案参数' &&
    !/方案|设计|拟|约定|目标|要求|待核|原定|原文/.test(fact.label)
      ? `方案${fact.label}`
      : fact.label;
  const unit = fact.unit
    ? `${['℃', '°C', '%'].includes(fact.unit) ? '' : '\u00a0'}${fact.unit}`
    : '';
  return `${label} ${fact.value}${unit}`;
}

export function caseListPresentation(item: CaseCardData) {
  let summary = item.summary;
  let facts = item.facts;

  // This comparison covers two different furnaces. Name the objects in the
  // list summary so the approved short tags cannot imply one shared setup.
  if (item.id === 'alloy-bar-plate-handling-202607-proposal') {
    const bar = facts.find((fact) => fact.label === '棒料进出方式');
    const hood = facts.find((fact) => fact.label === '罩式炉装料');
    if (bar && hood) {
      summary = `该项目的两份讨论稿分别提出：棒料斜底加热炉采用${bar.value}，板卷罩式退火炉采用${hood.value}。现场应分别核对两条搬运路径。`;
      facts = [bar, hood];
    }
  }

  return { summary, tags: facts.slice(0, 3).map(caseFactTag) };
}
