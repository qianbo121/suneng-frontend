import { afterEach, describe, expect, it, vi } from 'vitest';
import { submitEngineeringRequirement, validateInquiryFile } from './engineering-requirements';
import type { HomepageRequirementPayload } from './homepage-requirements';

afterEach(() => {
  vi.unstubAllGlobals();
  vi.unstubAllEnvs();
});
describe('engineering inquiry client', () => {
  it('rejects empty, oversized and unsupported attachments', () => {
    expect(validateInquiryFile({ name: '工件.png', type: 'image/png', size: 400 })).toBeNull();
    expect(validateInquiryFile({ name: 'empty.png', type: 'image/png', size: 0 })).not.toBeNull();
    expect(
      validateInquiryFile({ name: 'large.pdf', type: 'application/pdf', size: 6 * 1024 * 1024 }),
    ).not.toBeNull();
    expect(
      validateInquiryFile({ name: 'script.svg', type: 'image/svg+xml', size: 100 }),
    ).not.toBeNull();
  });
  it('requires a server submission identifier, not merely HTTP 200', async () => {
    vi.stubEnv('NEXT_PUBLIC_API_URL', 'http://127.0.0.1/api');
    vi.stubGlobal(
      'fetch',
      vi
        .fn()
        .mockResolvedValue(
          new Response(JSON.stringify({ code: 0, data: {}, message: 'ok' }), {
            headers: { 'content-type': 'application/json' },
          }),
        ),
    );
    await expect(
      submitEngineeringRequirement({} as HomepageRequirementPayload, []),
    ).rejects.toThrow('未收到服务端确认');
  });
});
