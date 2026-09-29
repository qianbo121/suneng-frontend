/** Resolve fixed route outcomes before streamed rendering sends a 200 shell. */
export function getFixedPublicRouteStatus(pathname: string) {
  const match = pathname.match(/^\/(zh|en)(\/.*)?$/);
  if (!match) return null;
  const locale = match[1];
  let path: string;
  try {
    path = decodeURIComponent(match[2] || '/').replace(/\/$/, '');
  } catch {
    return null;
  }
  if (path === '/strength') return { redirectPath: `/${locale}/strength/honors` };
  if (path === '/strength/certificates')
    return { redirectPath: `/${locale}/strength/honors`, hash: '#management-systems' };
  if (path === '/strength/technical-team') return { redirectPath: `/${locale}/about` };
  return null;
}
