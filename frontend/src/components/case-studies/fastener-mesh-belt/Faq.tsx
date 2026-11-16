import { Faq as CaseFaq } from '@/components/agreement-cases/Faq';
import { FASTENER_CASE_QUESTIONS } from '@/lib/cases/fastener-case-content';

export function Faq() {
  return <CaseFaq questions={FASTENER_CASE_QUESTIONS} en={false} intro="关于协议产量、工件条件与验收的常见问题。" />;
}
