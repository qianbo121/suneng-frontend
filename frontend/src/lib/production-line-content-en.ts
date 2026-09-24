import translations from './production-line-translations-en.json';
import { getProductionLineContent } from './production-line-content';
import { getLineProcessSteps, productionLineProcessMaps } from './production-line-process-map';

// Translate text only. Section order, array lengths, image assets, IDs and process
// bindings remain owned by the Chinese source and the shared page components.
export function translateLineValue<T>(value: T): T {
  if (typeof value === 'string') {
    const translated = (translations as Record<string, string>)[value] ?? value;
    return translated.replace(/^\/zh(?=\/|$)/, '/en')
      .replace(/^\/downloads\/heat-treatment-lines\/([^/]+\.txt)$/, '/downloads/heat-treatment-lines/en/$1') as T;
  }
  if (Array.isArray(value)) return value.map(translateLineValue) as T;
  if (value && typeof value === 'object') {
    return Object.fromEntries(Object.entries(value).map(([key, item]) => [key, translateLineValue(item)])) as T;
  }
  return value;
}
export function getEnglishProductionLineContent(slug: string) {
  const content = getProductionLineContent(slug);
  return content ? translateLineValue(content) : undefined;
}
// Compact captions fit the reviewed annotation positions; full descriptions stay in the step panel.
const zoneLabels: Record<string, string> = {
  '上料端': 'Loading', '加热炉': 'Heating', '出炉转移': 'Transfer',
  '压淬工位': 'Press quench', '回火炉': 'Tempering', '出料端': 'Discharge',
  '测温进料': 'Entry temp.', '均温段': 'Equalizing', '转运淬火': 'Transfer / quench',
  '清洗衔接': 'Cleaning', '独立回火': 'Separate tempering',
  '上料输送': 'Loading', '加热炉段': 'Heating', '淬火段': 'Quench',
  '清洗干燥': 'Wash & dry', '回火炉段': 'Tempering',
  '进料端': 'Feed', '前处理': 'Pretreatment', '渗碳炉段': 'Carburizing',
  '封闭淬火': 'Enclosed quench', '后清洗': 'Post-wash',
  '共用淬火槽': 'Shared quench tank', '并列加热炉组': 'Parallel furnaces', '轨道操作机': 'Rail manipulator',
  '装料交接': 'Load handover', '固溶炉': 'Solution furnace', '炉下淬火槽': 'Quench tank below',
  '独立时效炉': 'Separate aging', '对流加热炉': 'Convection furnace', '测温交接': 'Exit temp. / handover',
  '支承上料': 'Supported loading', '热风固化炉': 'Hot-air curing', '出料交接': 'Discharge handover',
};
export function getEnglishLineProcess(slug: string) {
  const source = getProductionLineContent(slug);
  const model = productionLineProcessMaps[slug];
  return {
    model: model ? {
      ...translateLineValue(model),
      zones: model.zones.map((zone) => ({ ...translateLineValue(zone), label: zoneLabels[zone.label] ?? translateLineValue(zone.label) })),
    } : model,
    steps: source ? translateLineValue(getLineProcessSteps(source)) : [],
  };
}
