import { buildHomepageRequirementPayload } from '@/lib/api/homepage-requirements';
import type { LeadSourceSnapshot } from '@/lib/api/lead-events';
import type { LineFormField } from '@/lib/production-line-types';

export { hasConfirmedSubmission } from '@/lib/fastener-line-inquiry';

export type ProductionLineInquiryValues = Record<LineFormField['name'], string>;

export function buildProductionLineInquiryPayload(
  page: { pageId: string; title: string; fields: LineFormField[] },
  values: ProductionLineInquiryValues,
  source: LeadSourceSnapshot,
  idempotencyKey: string,
) {
  const lines = [
    `${page.title}选型咨询`,
    `产品页面：${page.pageId}`,
    ...page.fields
      .filter((field) => field.name !== 'contact_method')
      .map((field) => `${field.label}：${values[field.name].trim() || '未提供'}`),
  ];
  return buildHomepageRequirementPayload(
    {
      direction: page.title,
      problem: lines.join('\n'),
      identity: '未提供姓名或公司',
      contact: values.contact_method.trim(),
    },
    source,
    idempotencyKey,
  );
}
