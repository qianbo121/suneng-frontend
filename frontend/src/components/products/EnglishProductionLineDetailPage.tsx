import { ProductionLineDetailPage } from './ProductionLineDetailPage';
import { getEnglishProductionLineContent } from '@/lib/production-line-content-en';
import type { EnglishProductionLine } from '@/lib/english-production-lines';

export function EnglishProductionLineDetailPage({ line }: { line: EnglishProductionLine }) {
  const content = getEnglishProductionLineContent(line.slug);
  if (!content) throw new Error(`Missing production line content: ${line.slug}`);
  return <ProductionLineDetailPage content={content} locale="en" />;
}
