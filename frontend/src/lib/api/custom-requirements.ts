import { apiPost, isApiRequestErrorStatus } from '@/lib/api/client';
import {
  sanitizeLeadSourceSnapshot,
  type LeadSourceSnapshot,
} from '@/lib/api/lead-events';
import type { Locale } from '@/types/site';

export type ProjectLeadValues = {
  projectType: string;
  projectLocation: string;
  name: string;
  company: string;
  phone: string;
  email: string;
  preferredContact: string;
  industry: string;
  process: string;
  temperature: string;
  requirement: string;
  discoverySource: string;
};

export type CustomRequirementPayload = {
  idempotencyKey: string;
  projectType: string;
  projectLocation: string;
  name: string;
  company: string;
  phone?: string;
  email?: string;
  preferredContact?: 'phone' | 'email';
  locale: Locale;
  industry?: string;
  process?: string;
  temperature?: string;
  requirement: string;
  discoverySource?: string;
  pagePath?: string;
  pageTitle?: string;
  pageType?: string;
  productTag?: string;
  sourceType?: string;
  sourceDetail?: string;
  landingPage?: string;
  previousPage?: string;
  utmSource?: string;
  utmMedium?: string;
  utmCampaign?: string;
  sessionId?: string;
  visitorId?: string;
};

export type CustomRequirementResponse = {
  submissionId: string | number;
};

export type LeadValidationIssue = {
  field: keyof ProjectLeadValues;
  reason: 'required' | 'contact' | 'email';
};

export type IdempotencyKeyRef = {
  current: string | null;
};

export const CUSTOM_REQUIREMENT_TIMEOUT_MS = 10_000;

const clean = (value: string) => value.trim();

export function createIdempotencyKey() {
  const webCrypto = typeof globalThis !== 'undefined' ? globalThis.crypto : undefined;
  if (typeof webCrypto?.randomUUID === 'function') {
    return webCrypto.randomUUID();
  }

  const bytes = new Uint8Array(16);
  if (typeof webCrypto?.getRandomValues !== 'function') {
    throw new Error('Secure random number generation is unavailable');
  }
  webCrypto.getRandomValues(bytes);
  bytes[6] = ((bytes[6] ?? 0) & 0x0f) | 0x40;
  bytes[8] = ((bytes[8] ?? 0) & 0x3f) | 0x80;
  const hex = Array.from(bytes, (byte) => byte.toString(16).padStart(2, '0'));
  return [
    hex.slice(0, 4).join(''),
    hex.slice(4, 6).join(''),
    hex.slice(6, 8).join(''),
    hex.slice(8, 10).join(''),
    hex.slice(10).join(''),
  ].join('-');
}

export function getFormIdempotencyKey(reference: IdempotencyKeyRef) {
  reference.current ??= createIdempotencyKey();
  return reference.current;
}

export function renewFormIdempotencyKey(reference: IdempotencyKeyRef) {
  reference.current = createIdempotencyKey();
  return reference.current;
}

export function renewIdempotencyKeyAfterConflict(
  error: unknown,
  reference: IdempotencyKeyRef,
) {
  if (!isApiRequestErrorStatus(error, 409)) return false;
  renewFormIdempotencyKey(reference);
  return true;
}

export function isValidEmail(value: string) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(clean(value));
}

export function validateLeadStepOne(values: ProjectLeadValues, locale: Locale): LeadValidationIssue | null {
  for (const field of ['projectType', 'company', 'name', 'projectLocation', 'requirement'] as const) {
    if (!clean(values[field])) return { field, reason: 'required' };
  }

  const phone = clean(values.phone);
  const email = clean(values.email);

  if (locale === 'en') {
    if (!email) return { field: 'email', reason: 'contact' };
    if (!isValidEmail(email)) return { field: 'email', reason: 'email' };
  } else {
    if (!phone && !email) return { field: 'phone', reason: 'contact' };
    if (email && !isValidEmail(email)) return { field: 'email', reason: 'email' };
  }

  return null;
}

export function buildCustomRequirementPayload(
  values: ProjectLeadValues,
  locale: Locale,
  source: LeadSourceSnapshot,
  idempotencyKey: string,
): CustomRequirementPayload {
  const optional = (value: string) => clean(value) || undefined;
  const preferredContact = clean(values.preferredContact);
  const {
    pagePath,
    pageTitle,
    pageType,
    productTag,
    sourceType,
    sourceDetail,
    landingPage,
    previousPage,
    utmSource,
    utmMedium,
    utmCampaign,
    sessionId,
    visitorId,
  } = sanitizeLeadSourceSnapshot(source);

  return {
    idempotencyKey,
    projectType: clean(values.projectType),
    projectLocation: clean(values.projectLocation),
    name: clean(values.name),
    company: clean(values.company),
    phone: optional(values.phone),
    email: optional(values.email),
    preferredContact:
      preferredContact === 'phone' || preferredContact === 'email' ? preferredContact : undefined,
    locale,
    industry: optional(values.industry),
    process: optional(values.process),
    temperature: optional(values.temperature),
    requirement: clean(values.requirement),
    discoverySource: optional(values.discoverySource),
    pagePath,
    pageTitle,
    pageType,
    productTag,
    sourceType,
    sourceDetail,
    landingPage,
    previousPage,
    utmSource,
    utmMedium,
    utmCampaign,
    sessionId,
    visitorId,
  };
}

export function submitCustomRequirement(payload: CustomRequirementPayload) {
  return apiPost<CustomRequirementResponse, CustomRequirementPayload>('/v2/custom-requirements', {
    body: payload,
    cache: 'no-store',
    timeoutMs: CUSTOM_REQUIREMENT_TIMEOUT_MS,
  });
}
