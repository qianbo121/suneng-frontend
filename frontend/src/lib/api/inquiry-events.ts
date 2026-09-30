import { ApiRequestError } from './client';
import { trackLeadEvent } from './lead-events';

type Context = Parameters<typeof trackLeadEvent>[1];
const fields = new Set(['direction', 'problem', 'identity', 'contact', 'name', 'company', 'phone', 'email', 'preferredContact', 'projectType', 'projectLocation', 'requirement', 'attachments', 'form']);

// Never record field values, file names, or exception messages: they can contain
// a customer's contact details or project description.
export function trackInquiryError(form: string, field: string, reason: string, context?: Context) {
  trackLeadEvent('form_error', {
    ...context,
    properties: {
      source_module: form,
      field: fields.has(field) ? field : 'form',
      reason: ['required', 'invalid', 'attachment_invalid', 'request_rejected', 'request_failed', 'confirmation_missing'].includes(reason) ? reason : 'invalid',
    },
  });
}

export function trackInquiryRequestError(form: string, error: unknown, context?: Context) {
  const rejected = error instanceof ApiRequestError && error.status !== undefined && error.status >= 400 && error.status < 500;
  trackInquiryError(form, 'form', rejected ? 'request_rejected' : 'request_failed', context);
}

export function trackInquiryAttempt(form: string, context?: Context, recordCompletion = true) {
  if (recordCompletion) trackLeadEvent('form_step_complete', { ...context, properties: { source_module: form } });
  trackLeadEvent('form_attempt', { ...context, properties: { source_module: form } });
}
