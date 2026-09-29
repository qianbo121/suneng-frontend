export const BAIDU_ANALYTICS_HOSTNAME = 'www.jssngyl.cn';

export function isBaiduAnalyticsHostname(hostname: string | null | undefined): boolean {
  return hostname?.trim().toLowerCase() === BAIDU_ANALYTICS_HOSTNAME;
}

const INQUIRY_QUERY_KEYS = new Set(['contact', 'phone', 'email', 'identity', 'problem']);

function containsInquiryData(value: string): boolean {
  if (!value) return false;
  try {
    const url = new URL(value);
    return [...url.searchParams.keys()].some((key) => INQUIRY_QUERY_KEYS.has(key.toLowerCase()));
  } catch {
    return true;
  }
}

// The vendor's initial request includes the full address and referrer. Do not
// load it for legacy native-form URLs that can contain a visitor's inquiry.
export function canLoadBaiduAnalytics(href: string, referrer: string): boolean {
  try {
    return (
      isBaiduAnalyticsHostname(new URL(href).hostname) &&
      !containsInquiryData(href) &&
      !containsInquiryData(referrer)
    );
  } catch {
    return false;
  }
}
