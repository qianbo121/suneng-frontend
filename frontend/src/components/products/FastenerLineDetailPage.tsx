import { getProductionLineContent } from '@/lib/production-line-content';
import { ProductionLineDetailPage } from './ProductionLineDetailPage';

export function FastenerLineDetailPage() {
  return (
    <ProductionLineDetailPage content={getProductionLineContent('fastener-quench-temper-line')!} />
  );
}
