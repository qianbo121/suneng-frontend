import reviewed from './heat-treatment-lines-reviewed.json';

export type HeatTreatmentLine = (typeof reviewed.lines)[number];
export const heatTreatmentLines: readonly HeatTreatmentLine[] = reviewed.lines;
export const heatTreatmentLineScope = reviewed.scope;

const lineBySlug = new Map(heatTreatmentLines.map((line) => [line.slug, line]));

export function getHeatTreatmentLine(slug: string) {
  return lineBySlug.get(slug);
}

export function getLineParameterSheet(slug: string) {
  return `/downloads/heat-treatment-lines/${slug}.txt`;
}
