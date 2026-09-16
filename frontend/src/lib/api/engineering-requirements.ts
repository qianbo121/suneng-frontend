import { ApiRequestError, apiPost } from './client';
import type { HomepageRequirementPayload } from './homepage-requirements';
import type { CustomRequirementResponse } from './custom-requirements';

export const INQUIRY_FILE_LIMIT = 5 * 1024 * 1024;
export const INQUIRY_FILE_COUNT = 3;
export const INQUIRY_FILE_ACCEPT = '.jpg,.jpeg,.png,.webp,.pdf';
export function validateInquiryFile(file: Pick<File, 'name' | 'size' | 'type'>) {
  if (file.size <= 0 || file.size > INQUIRY_FILE_LIMIT) return '请选择非空且不超过5MB的附件。';
  if (
    !/\.(jpe?g|png|webp|pdf)$/i.test(file.name) ||
    !['image/jpeg', 'image/png', 'image/webp', 'application/pdf'].includes(file.type)
  )
    return '支持JPG、PNG、WebP图片或PDF资料。';
  return null;
}
export async function uploadInquiryFile(file: File, inquiryKey: string): Promise<string> {
  const error = validateInquiryFile(file);
  if (error) throw new Error(error);
  const base = process.env.NEXT_PUBLIC_API_URL || process.env.NEXT_PUBLIC_API_BASE_URL;
  if (!base) throw new Error('附件服务暂不可用，请稍后重试或通过微信发送资料。');
  const body = new FormData();
  body.append('inquiryKey', inquiryKey);
  body.append('file', file);
  const response = await fetch(
    `${base.replace(/\/$/, '')}/v2/engineering-requirements/attachments`,
    { method: 'POST', body, signal: AbortSignal.timeout(30_000) },
  );
  const result = await response.json().catch(() => null);
  const receipt = result?.code === 0 ? result.data?.receipt : result?.receipt;
  if (!response.ok || typeof receipt !== 'string' || !receipt)
    throw new ApiRequestError('附件上传失败，资料已保留，请稍后重试。', response.status);
  return receipt;
}
export async function submitEngineeringRequirement(
  payload: HomepageRequirementPayload,
  attachments: string[],
) {
  const response = await apiPost<
    CustomRequirementResponse,
    HomepageRequirementPayload & { attachments: string[] }
  >('/v2/engineering-requirements', {
    body: { ...payload, attachments },
    cache: 'no-store',
    timeoutMs: 15_000,
  });
  if (!response?.submissionId || !['number', 'string'].includes(typeof response.submissionId))
    throw new Error('未收到服务端确认，请稍后重试。');
  return response;
}
