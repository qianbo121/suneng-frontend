import { beforeEach, describe, expect, it, vi } from 'vitest';
vi.mock('./lead-events', () => ({ trackLeadEvent: vi.fn() }));
import { trackLeadEvent } from './lead-events';
import { ApiRequestError } from './client';
import { trackInquiryAttempt, trackInquiryError, trackInquiryRequestError } from './inquiry-events';

describe('inquiry failure observability', () => {
  beforeEach(() => vi.clearAllMocks());
  it('records field and safe reason without a field value or raw error', () => {
    trackInquiryError('homepage_form', 'contact', 'required');
    trackInquiryRequestError('homepage_form', new ApiRequestError('customer@example.com rejected', 400));
    expect(trackLeadEvent).toHaveBeenCalledWith('form_error', expect.objectContaining({ properties: { source_module: 'homepage_form', field: 'contact', reason: 'required' } }));
    expect(JSON.stringify(vi.mocked(trackLeadEvent).mock.calls)).not.toContain('customer@example.com');
  });
  it('does not leak unexpected field identifiers or reasons', () => {
    trackInquiryError('product_form', 'customer@example.com', '13800000000');
    expect(trackLeadEvent).toHaveBeenCalledWith('form_error', { properties: { source_module: 'product_form', field: 'form', reason: 'invalid' } });
  });
  it('distinguishes a request attempt from a confirmed success', () => {
    trackInquiryAttempt('product_form', undefined, false);
    expect(trackLeadEvent).toHaveBeenCalledTimes(1);
    expect(trackLeadEvent).toHaveBeenCalledWith('form_attempt', expect.anything());
  });
  it('does not mistake a service outage for rejected customer input', () => {
    trackInquiryRequestError('homepage_form', new ApiRequestError('Unavailable', 503));
    expect(trackLeadEvent).toHaveBeenCalledWith('form_error', expect.objectContaining({ properties: expect.objectContaining({ reason: 'request_failed' }) }));
  });
});
