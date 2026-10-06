import { buildLeadSourceSnapshot, captureLeadEventProperties, trackLeadEvent } from '@/lib/api/lead-events';

export type ContactKind = 'phone' | 'wechat' | 'email';
export type ContactPurpose = 'sales' | 'after_sales' | 'general';
export type ContactTrackingContext = NonNullable<Parameters<typeof trackLeadEvent>[1]>;

// Freeze the page/source when the action begins, including async clipboard operations.
export function captureContactContext(
  context: ContactTrackingContext = {},
): ContactTrackingContext {
  const { properties, ...source } = context;
  try {
    const snapshot = buildLeadSourceSnapshot(source);
    return { ...snapshot, properties: captureLeadEventProperties(properties, snapshot) };
  } catch {
    return context;
  }
}

function contactContext(kind: ContactKind, context: ContactTrackingContext) {
  const properties = context.properties ?? {};
  return {
    ...context,
    properties: {
      ...properties,
      position: properties.position ?? properties.source_module ?? 'inline_contact',
      contact_purpose: properties.contact_purpose ?? 'general',
      contact_kind: kind,
      contact_tracking_version: 1,
    },
  };
}

export function trackContactEntry(
  kind: ContactKind,
  context: ContactTrackingContext = {},
  action: 'open_dialog' | 'open_external' = 'open_external',
) {
  const extra = contactContext(kind, context);
  // Analytics must never block a contact link or clipboard feedback.
  try {
    trackLeadEvent(`${kind}_click`, {
      ...extra,
      properties: { ...extra.properties, contact_action: action, contact_result: 'requested' },
    });
  } catch { /* Contact remains usable if analytics is unavailable. */ }
}

export function trackContactAction(
  kind: ContactKind,
  action: 'copy' | 'open_external' | 'open_qr_original',
  result: 'success' | 'failure' | 'requested',
  context: ContactTrackingContext = {},
) {
  const extra = contactContext(kind, context);
  try {
    // A follow-up action is not another phone/wechat/email click or an inquiry.
    trackLeadEvent('contact_action', {
      ...extra,
      properties: { ...extra.properties, contact_action: action, contact_result: result },
    });
  } catch { /* Do not turn a successful copy into a user-visible failure. */ }
}

export async function copyContactValue(
  value: string,
  kind?: ContactKind,
  context: ContactTrackingContext = {},
) {
  const source = kind ? captureContactContext(context) : context;
  try {
    await navigator.clipboard.writeText(value);
  } catch {
    if (kind) trackContactAction(kind, 'copy', 'failure', source);
    return false;
  }
  if (kind) trackContactAction(kind, 'copy', 'success', source);
  return true;
}
