import { apiPost } from '@/lib/api/client';
import { sanitizeLeadSourceSnapshot, type LeadSourceSnapshot } from '@/lib/api/lead-events';
import {
  CUSTOM_REQUIREMENT_TIMEOUT_MS,
  type CustomRequirementResponse,
} from '@/lib/api/custom-requirements';
import type { WorkpieceRouterDraftContext } from '@/lib/workpiece-router-draft-context';
import { sanitizeRawConditions, type RawConditions } from '@/lib/api/workpiece-router';

export type HomepageRequirementValues = {
  direction: string;
  problem: string;
  identity: string;
  contact: string;
};

export type HomepageRequirementField = keyof HomepageRequirementValues;

export type HomepageRequirementPayload = {
  formVariant: 'homepage_minimal';
  idempotencyKey: string;
  projectType: string;
  projectLocation?: string;
  requirement: string;
  identity: string;
  contact: string;
  locale: 'zh' | 'en';
  workpieceContext?: HomepageWorkpieceContext;
} & LeadSourceSnapshot;

export type HomepageWorkpieceContext = {
  categoryId: string;
  workpieceId: string | null;
  searchTerm: string | null;
  processPurposeId: string | null;
  rawConditions: RawConditions;
};

export function buildHomepageWorkpieceContext(
  draft?: WorkpieceRouterDraftContext | null,
): HomepageWorkpieceContext | undefined {
  if (!draft) return undefined;
  return {
    categoryId: draft.categoryId,
    workpieceId: draft.workpieceId,
    searchTerm: draft.searchTerm,
    processPurposeId: draft.processPurposeId,
    rawConditions: sanitizeRawConditions(draft.rawConditions),
  };
}

const FIELD_LIMITS: Record<HomepageRequirementField, number> = {
  direction: 120,
  problem: 8_000,
  identity: 180,
  contact: 254,
};

function clean(value: string) {
  return value.trim();
}

export function validateHomepageRequirement(
  values: HomepageRequirementValues,
): HomepageRequirementField | null {
  for (const field of ['direction', 'problem', 'identity', 'contact'] as const) {
    const value = clean(values[field]);
    if (!value || value.length > FIELD_LIMITS[field]) return field;
  }

  if (!/^[\p{L}\p{N}+][\p{L}\p{N}\s@()+\-._/#*]{2,253}$/u.test(clean(values.contact))) {
    return 'contact';
  }

  return null;
}

export function buildHomepageRequirementPayload(
  values: HomepageRequirementValues,
  source: LeadSourceSnapshot,
  idempotencyKey: string,
  workpieceContext?: HomepageWorkpieceContext | null,
  locale: 'zh' | 'en' = 'zh',
): HomepageRequirementPayload {
  return {
    formVariant: 'homepage_minimal',
    idempotencyKey,
    projectType: clean(values.direction),
    requirement: clean(values.problem),
    identity: clean(values.identity),
    contact: clean(values.contact),
    locale,
    ...sanitizeLeadSourceSnapshot(source),
    ...(workpieceContext ? { workpieceContext } : {}),
  };
}

export function submitHomepageRequirement(payload: HomepageRequirementPayload) {
  return apiPost<CustomRequirementResponse, HomepageRequirementPayload>('/v2/custom-requirements', {
    body: payload,
    cache: 'no-store',
    timeoutMs: CUSTOM_REQUIREMENT_TIMEOUT_MS,
    // Only local development uses the frontend bridge; production keeps its existing endpoint.
    ...(process.env.NODE_ENV === 'development' ? { sameOrigin: true } : {}),
  });
}
