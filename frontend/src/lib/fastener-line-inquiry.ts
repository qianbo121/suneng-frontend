import { buildHomepageRequirementPayload } from '@/lib/api/homepage-requirements';
import type { LeadSourceSnapshot } from '@/lib/api/lead-events';

export type FastenerInquiryValues = {
  workpiece_material: string;
  target_performance: string;
  target_output: string;
  contact_method: string;
};

export function buildFastenerInquiryPayload(
  values: FastenerInquiryValues,
  source: LeadSourceSnapshot,
  idempotencyKey: string,
) {
  const lines = [
    '紧固件调质生产线选型咨询',
    `工件与材料：${values.workpiece_material.trim() || '未提供'}`,
    `目标性能：${values.target_performance.trim() || '未提供'}`,
    `目标产量：${values.target_output.trim() || '未提供'}`,
  ];
  return buildHomepageRequirementPayload(
    {
      direction: '紧固件调质生产线',
      problem: lines.join('\n'),
      // This four-field form does not collect a name/company. Preserve that fact.
      identity: '未提供姓名或公司',
      contact: values.contact_method.trim(),
    },
    source,
    idempotencyKey,
  );
}

export function hasConfirmedSubmission(
  result: unknown,
): result is { submissionId: string | number } {
  if (!result || typeof result !== 'object' || !('submissionId' in result)) return false;
  const id = result.submissionId;
  return (
    (typeof id === 'string' && id.trim().length > 0) ||
    (typeof id === 'number' && Number.isFinite(id) && id > 0)
  );
}
