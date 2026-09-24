// Local UI work must not write page views or engagement into public analytics.
// Keep public-host tracking and inquiry source information unchanged.
export function isLocalPreviewHostname(hostname: string | undefined) {
  const host = hostname?.toLowerCase().replace(/\.$/, '') ?? '';
  return (
    host === 'localhost' ||
    host.endsWith('.localhost') ||
    host === '::1' ||
    host === '[::1]' ||
    /^127(?:\.\d{1,3}){3}$/.test(host)
  );
}
