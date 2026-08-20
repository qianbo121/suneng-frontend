import { readFileSync } from 'node:fs';
import { afterEach, describe, expect, it, vi } from 'vitest';

import {
  buildCustomRequirementPayload,
  CUSTOM_REQUIREMENT_TIMEOUT_MS,
  getFormIdempotencyKey,
  type ProjectLeadValues,
  renewIdempotencyKeyAfterConflict,
  renewFormIdempotencyKey,
  submitCustomRequirement,
  validateLeadStepOne,
} from '@/lib/api/custom-requirements';
import { ApiRequestError } from '@/lib/api/client';
import {
  handleSuccessDialogKeyDown,
  restoreSuccessDialogFocus,
} from '@/components/products/success-dialog-accessibility';

afterEach(() => {
  vi.unstubAllGlobals();
});

const completeValues = (overrides: Partial<ProjectLeadValues> = {}): ProjectLeadValues => ({
  projectType: 'new',
  projectLocation: 'Vietnam',
  name: 'Taylor',
  company: 'Example Manufacturing',
  phone: '',
  email: 'taylor@example-manufacturing.com',
  preferredContact: '',
  industry: '',
  process: '',
  temperature: '',
  requirement: 'A new heat-treatment line is required.',
  discoverySource: '',
  ...overrides,
});

describe('ProductLeadForm step-one rules', () => {
  it.each(['projectType', 'projectLocation', 'name', 'company', 'requirement'] as const)(
    'requires %s before moving to step two',
    (field) => {
      expect(validateLeadStepOne(completeValues({ [field]: '' }), 'en')).toMatchObject({
        field,
        reason: 'required',
      });
    },
  );

  it('accepts either phone or email for Chinese leads', () => {
    expect(
      validateLeadStepOne(completeValues({ email: '', phone: '13800138000' }), 'zh'),
    ).toBeNull();
    expect(
      validateLeadStepOne(completeValues({ email: 'buyer@factory.cn', phone: '' }), 'zh'),
    ).toBeNull();
    expect(validateLeadStepOne(completeValues({ email: '', phone: '' }), 'zh')).toMatchObject({
      reason: 'contact',
    });
  });

  it('requires a valid email for English leads while leaving phone optional', () => {
    expect(
      validateLeadStepOne(completeValues({ email: '', phone: '+1 555 0100' }), 'en'),
    ).toMatchObject({
      field: 'email',
      reason: 'contact',
    });
    expect(validateLeadStepOne(completeValues({ email: 'buyer@gmail.com' }), 'en')).toBeNull();
    expect(validateLeadStepOne(completeValues({ phone: '' }), 'en')).toBeNull();
  });
});

describe('ProductLeadForm submission behavior', () => {
  it('can skip all optional step-two fields and includes the current source snapshot', () => {
    const payload = buildCustomRequirementPayload(
      completeValues(),
      'en',
      {
        pagePath: '/en/products/trolley-furnace?utm_source=google',
        pageTitle: 'Trolley Furnace',
        pageType: '产品页',
        productTag: '台车炉',
        sourceType: '外部链接',
        sourceDetail: 'google.com',
        deviceType: 'PC',
        landingPage: '/en/products/trolley-furnace?utm_source=google',
        previousPage: 'https://www.google.com/',
        utmSource: 'google',
        utmMedium: 'cpc',
        utmCampaign: 'furnace',
        sessionId: 'session-1',
        visitorId: 'visitor-1',
      },
      'form-session-1',
    );

    expect(payload).toMatchObject({
      projectType: 'new',
      idempotencyKey: 'form-session-1',
      locale: 'en',
      pagePath: '/en/products/trolley-furnace?utm_source=google',
      utmSource: 'google',
      deviceType: 'PC',
      sessionId: 'session-1',
      visitorId: 'visitor-1',
    });
    expect(payload.industry).toBeUndefined();
    expect(payload.process).toBeUndefined();
    expect(payload.temperature).toBeUndefined();
    expect(payload.preferredContact).toBeUndefined();
    expect(payload.discoverySource).toBeUndefined();
  });

  it('bounds optional source data before building an inquiry request', () => {
    const payload = buildCustomRequirementPayload(
      completeValues(),
      'en',
      {
        pagePath: `/${'p'.repeat(700)}`,
        utmCampaign: 'c'.repeat(500),
        sessionId: 's'.repeat(500),
        visitorId: 'v'.repeat(500),
      },
      'form-session-bounded-source',
    );

    expect(payload.pagePath).toHaveLength(500);
    expect(payload.utmCampaign).toHaveLength(255);
    expect(payload.sessionId).toHaveLength(120);
    expect(payload.visitorId).toHaveLength(120);
  });

  it('reuses one idempotency key for retries and renews it only after a successful reset', () => {
    const reference = { current: null as string | null };

    const firstAttempt = getFormIdempotencyKey(reference);
    const retryAttempt = getFormIdempotencyKey(reference);
    expect(retryAttempt).toBe(firstAttempt);

    const source = { pagePath: '/en/contact' };
    const firstPayload = buildCustomRequirementPayload(
      completeValues(),
      'en',
      source,
      firstAttempt,
    );
    const retryPayload = buildCustomRequirementPayload(
      completeValues(),
      'en',
      source,
      retryAttempt,
    );
    expect(retryPayload.idempotencyKey).toBe(firstPayload.idempotencyKey);

    const nextFormSession = renewFormIdempotencyKey(reference);
    expect(nextFormSession).not.toBe(firstAttempt);
    expect(getFormIdempotencyKey(reference)).toBe(nextFormSession);
    expect(
      buildCustomRequirementPayload(completeValues(), 'en', source, nextFormSession).idempotencyKey,
    ).not.toBe(firstPayload.idempotencyKey);
  });

  it('generates an RFC 4122 version 4 key when randomUUID is unavailable', () => {
    vi.stubGlobal('crypto', {
      getRandomValues: (bytes: Uint8Array) => {
        bytes.fill(0xab);
        return bytes;
      },
    });

    expect(getFormIdempotencyKey({ current: null })).toMatch(
      /^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/,
    );
  });

  it('allows a longer inquiry timeout while the backend returns before notification delivery', () => {
    expect(CUSTOM_REQUIREMENT_TIMEOUT_MS).toBe(10_000);
  });

  it('renews the key after the backend reports a different payload conflict', () => {
    const reference = { current: getFormIdempotencyKey({ current: null }) };
    const originalKey = reference.current;
    const conflict = new ApiRequestError(
      'Idempotency key was already used for a different inquiry payload',
      409,
    );

    expect(renewIdempotencyKeyAfterConflict(conflict, reference)).toBe(true);
    expect(reference.current).not.toBe(originalKey);
    expect(
      buildCustomRequirementPayload(
        completeValues(),
        'en',
        { pagePath: '/en/contact' },
        getFormIdempotencyKey(reference),
      ).idempotencyKey,
    ).toBe(reference.current);
  });

  it('preserves the backend 409 status and conflict message in the API contract', async () => {
    const previousBaseUrl = process.env.API_BASE_URL_INTERNAL;
    process.env.API_BASE_URL_INTERNAL = 'https://api.example.test';
    const fetchMock = vi.fn().mockResolvedValue(
      new Response(
        JSON.stringify({
          statusCode: 409,
          message: 'Idempotency key was already used for a different inquiry payload',
          error: 'Conflict',
        }),
        {
          status: 409,
          headers: { 'content-type': 'application/json' },
        },
      ),
    );
    vi.stubGlobal('fetch', fetchMock);

    try {
      await expect(
        submitCustomRequirement(
          buildCustomRequirementPayload(
            completeValues(),
            'en',
            { pagePath: '/en/contact' },
            '8dd53c3c-701d-4c3c-baf8-f7224aef8fae',
          ),
        ),
      ).rejects.toMatchObject({
        name: 'ApiRequestError',
        status: 409,
        message: 'Idempotency key was already used for a different inquiry payload',
      });
      expect(fetchMock.mock.calls[0]?.[0]).toContain('/v2/custom-requirements');
    } finally {
      if (previousBaseUrl === undefined) delete process.env.API_BASE_URL_INTERNAL;
      else process.env.API_BASE_URL_INTERNAL = previousBaseUrl;
    }
  });

  it('keeps the same key for timeout and network failures', () => {
    const reference = { current: getFormIdempotencyKey({ current: null }) };
    const originalKey = reference.current;

    expect(renewIdempotencyKeyAfterConflict(new Error('network timeout'), reference)).toBe(false);
    expect(reference.current).toBe(originalKey);
  });

  it('preserves form state and does not report success on a 409 conflict', () => {
    const source = readFileSync(new URL('./ProductLeadForm.tsx', import.meta.url), 'utf8');
    const conflictBranch = source.slice(
      source.indexOf('} catch (error) {'),
      source.indexOf('} finally {'),
    );

    expect(conflictBranch).toContain('renewIdempotencyKeyAfterConflict');
    expect(conflictBranch).toContain('copy.idempotencyConflict');
    expect(conflictBranch).not.toContain('form.reset()');
    expect(conflictBranch).not.toContain('setSubmissionId');
  });

  it('tracks start and step completion, shows the returned number, and leaves final-submit tracking to the backend', () => {
    const source = readFileSync(new URL('./ProductLeadForm.tsx', import.meta.url), 'utf8');

    expect(source).toContain("trackLeadEvent('form_start')");
    expect(source).toContain("trackLeadEvent('form_step_complete')");
    expect(source).toContain('formStartedRef.current = true');
    expect(source).toContain('stepCompletedRef.current = true');
    expect(source).toContain('buildLeadSourceSnapshot()');
    expect(source).toContain('getFormIdempotencyKey(idempotencyKeyRef)');
    expect(source).toContain('renewFormIdempotencyKey(idempotencyKeyRef)');
    expect(source).toContain('setSubmissionId(String(result.submissionId))');
    expect(source).toContain("step === 1 ? 'grid' : 'hidden'");
    expect(source).toContain("step === 2 ? 'grid' : 'hidden'");
    expect(source).not.toMatch(/hidden=\{step !== [12]\} className="grid/);
    expect(source).not.toContain("trackLeadEvent('form_submit'");
  });

  it('shows the source-data privacy notice before the customer starts filling fields', () => {
    const source = readFileSync(new URL('./ProductLeadForm.tsx', import.meta.url), 'utf8');
    const noticeIndex = source.indexOf('{copy.privacy.summary}');
    const firstStepIndex = source.indexOf("step === 1 ? 'grid' : 'hidden'");

    expect(source).toContain('开始填写后，我们会记录本次必要的页面与来源信息');
    expect(source).toContain(
      'When you start this form, we record the necessary page and source information',
    );
    expect(noticeIndex).toBeGreaterThan(-1);
    expect(noticeIndex).toBeLessThan(firstStepIndex);
    expect(source).toContain('aria-controls={privacyNoticeId}');
  });

  it('limits customer text in the browser to the accepted server lengths', () => {
    const source = readFileSync(new URL('./ProductLeadForm.tsx', import.meta.url), 'utf8');

    expect(source).toContain('name="company"');
    expect(source).toContain('maxLength={254}');
    expect(source).toContain('maxLength={8000}');
    expect(source).toContain('maxLength={50}');
  });

  it('closes the success dialog with Escape but ignores other keys', () => {
    const close = vi.fn();
    const preventDefault = vi.fn();

    handleSuccessDialogKeyDown({ key: 'Enter', preventDefault }, close);
    expect(close).not.toHaveBeenCalled();

    handleSuccessDialogKeyDown({ key: 'Escape', preventDefault }, close);
    expect(preventDefault).toHaveBeenCalledOnce();
    expect(close).toHaveBeenCalledOnce();
  });

  it('restores focus to the submit control or the first project field when it is hidden', () => {
    let activeElement: object | null = null;
    const preferred = {
      focus: vi.fn(() => {
        activeElement = preferred;
      }),
    };
    const fallback = {
      focus: vi.fn(() => {
        activeElement = fallback;
      }),
    };

    restoreSuccessDialogFocus(preferred, fallback, () => activeElement);
    expect(preferred.focus).toHaveBeenCalledOnce();
    expect(fallback.focus).not.toHaveBeenCalled();

    activeElement = null;
    const hiddenPreferred = { focus: vi.fn() };
    restoreSuccessDialogFocus(hiddenPreferred, fallback, () => activeElement);
    expect(fallback.focus).toHaveBeenCalledOnce();
  });

  it('gives the dialog a name and focuses its confirmation button', () => {
    const source = readFileSync(new URL('./ProductLeadForm.tsx', import.meta.url), 'utf8');

    expect(source).toContain('aria-labelledby={successDialogTitleId}');
    expect(source).toContain('id={successDialogTitleId}');
    expect(source).toContain('successButtonRef.current?.focus()');
    expect(source).toContain('ref={successButtonRef}');
  });
});
