/** Launch scope: retain source drafts while case studies and standalone guides are withdrawn. */
export const TECHNICAL_CONTENT_PUBLISHED = false;

export function isWithdrawnTechnicalPath(href: string): boolean {
  let pathname: string;
  try {
    const url = new URL(href, 'https://www.jssngyl.cn');
    if (!['www.jssngyl.cn', 'jssngyl.cn', 'localhost', '127.0.0.1'].includes(url.hostname)) return false;
    pathname = url.pathname;
  } catch { return false; }
  return !TECHNICAL_CONTENT_PUBLISHED && /^\/(?:zh\/|en\/)?(?:case|articles|solutions)(?:\/|$)/.test(pathname);
}
