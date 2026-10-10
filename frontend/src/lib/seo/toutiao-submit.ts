const CANONICAL_ORIGIN = 'https://www.jssngyl.cn';
const PUBLIC_ORIGINS = new Set([CANONICAL_ORIGIN, 'https://jssngyl.cn']);
const ARTICLE_PATH = /^\/(zh|en)\/news\/[a-zA-Z0-9][a-zA-Z0-9_-]*$/;

/** Only a rendered article's clean canonical URL may be reported. */
export function getToutiaoArticleUrl(currentHref: string, canonicalHref: string): string | null {
  try {
    const current = new URL(currentHref);
    const canonical = new URL(canonicalHref);
    if (
      !PUBLIC_ORIGINS.has(current.origin) ||
      canonical.origin !== CANONICAL_ORIGIN ||
      current.username || current.password || canonical.username || canonical.password ||
      current.search || canonical.search || canonical.hash ||
      !ARTICLE_PATH.test(canonical.pathname) ||
      current.pathname !== canonical.pathname
    ) return null;
    return canonical.href;
  } catch {
    return null;
  }
}

type PushImage = Pick<HTMLImageElement, 'src' | 'onload' | 'onerror'>;

/**
 * Mirrors the account's official push.js: Image -> s.gif?url=...&token=....
 * The captured canonical URL avoids a late external script reporting a later route.
 * A dispatch is a notification attempt, never a crawl or indexing receipt.
 */
export function createToutiaoArticleSubmitter(siteToken: string, createImage: () => PushImage) {
  const submitted = new Set<string>();
  const pending = new Map<string, PushImage>();
  return (currentHref: string, canonicalHref: string): boolean => {
    const articleUrl = getToutiaoArticleUrl(currentHref, canonicalHref);
    if (!siteToken || !articleUrl || submitted.has(articleUrl)) return false;
    try {
      const image = createImage();
      submitted.add(articleUrl);
      pending.set(articleUrl, image);
      image.onload = () => { pending.delete(articleUrl); };
      image.onerror = () => {
        pending.delete(articleUrl);
        submitted.delete(articleUrl);
      };
      image.src = `https://zhanzhang.toutiao.com/s.gif?url=${encodeURIComponent(articleUrl)}&token=${encodeURIComponent(siteToken)}`;
      return true;
    } catch {
      pending.delete(articleUrl);
      submitted.delete(articleUrl);
      return false;
    }
  };
}
