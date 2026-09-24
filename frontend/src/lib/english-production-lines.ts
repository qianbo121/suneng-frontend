import heroImages from './production-line-hero-images.json';
import { getEnglishProductionLineContent } from './production-line-content-en';

const englishLineSlugs = [
  "roller-mesh-belt-line",
  "copper-wire-annealing-line",
  "annealing-solution-line",
  "track-shoe-press-quench-line",
  "forging-waste-heat-qt-line",
  "fastener-quench-temper-line",
  "mesh-belt-carbonitriding-line",
  "multi-furnace-quench-cell",
  "aluminum-solution-aging-line",
  "aluminum-forging-heating-line",
  "cylinder-curing-line"
] as const;

export type EnglishProductionLine = {
  slug: string;
  title: string;
  seoTitle: string;
  description: string;
};

// Page text and search summaries come from the same current Chinese source.
export const englishProductionLines: EnglishProductionLine[] = englishLineSlugs.map((slug) => {
  const content = getEnglishProductionLineContent(slug);
  if (!content) throw new Error(`Missing English production line: ${slug}`);
  return { slug, title: content.sections.overview.title, seoTitle: content.seo.title, description: content.seo.description };
});

export function getEnglishProductionLine(slug: string) {
  return englishProductionLines.find((line) => line.slug === slug);
}

export function getEnglishLineImage(slug: string) {
  return heroImages[slug as keyof typeof heroImages];
}
