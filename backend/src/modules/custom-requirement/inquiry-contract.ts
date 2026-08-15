export const INQUIRY_CONTRACT_VERSION = 2;

export function supportsInquiryContract(payload: unknown, minimum = INQUIRY_CONTRACT_VERSION) {
  if (!payload || typeof payload !== 'object') return false;
  const envelope = payload as { data?: unknown; inquiryContractVersion?: unknown };
  const body =
    envelope.data && typeof envelope.data === 'object'
      ? (envelope.data as { inquiryContractVersion?: unknown })
      : envelope;
  return (
    typeof body.inquiryContractVersion === 'number' &&
    Number.isInteger(body.inquiryContractVersion) &&
    body.inquiryContractVersion >= minimum
  );
}

export function supportsShujuInquiryConsumer(payload: unknown, expectedStartAfterId: number) {
  if (!payload || typeof payload !== 'object') return false;
  const ready = payload as Record<string, unknown>;
  return (
    ready.ok === true &&
    typeof ready.inquiry_consumer_contract_version === 'number' &&
    Number.isInteger(ready.inquiry_consumer_contract_version) &&
    ready.inquiry_consumer_contract_version >= INQUIRY_CONTRACT_VERSION &&
    ready.inquiry_mode === 'new_web_only' &&
    Number.isInteger(expectedStartAfterId) &&
    expectedStartAfterId > 0 &&
    ready.inquiry_start_after_id === expectedStartAfterId &&
    ready.inquiry_cutover_initialized === true &&
    ready.inquiry_cutover_ready === true
  );
}
