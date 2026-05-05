import { apiPost } from '@/lib/api/client';

export type CustomRequirementPayload = {
  name?: string;
  phone: string;
  company?: string;
  industry?: string;
  process?: string;
  temperature?: string;
  requirement?: string;
};

export function submitCustomRequirement(payload: CustomRequirementPayload) {
  return apiPost<unknown, CustomRequirementPayload>('/v1/custom-requirements', {
    body: payload,
    cache: 'no-store',
  });
}
