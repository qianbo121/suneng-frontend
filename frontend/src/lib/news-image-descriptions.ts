import descriptions from './news-image-descriptions.json';

type ReviewedImageDescription = { previousAlt: string; alt: string };

// Reviewed against the actual images on 2026-09-29. Match an exact asset and
// its old placeholder only, so a later editor-written description wins.
export function getReviewedNewsImageDescription(src: string | null, currentAlt: string | null) {
  if (!src || currentAlt === null) return undefined;

  let url: URL;
  try {
    url = new URL(src, 'https://www.jssngyl.cn');
  } catch {
    return undefined;
  }
  if (!['http:', 'https:'].includes(url.protocol) || !['www.jssngyl.cn', 'jssngyl.cn'].includes(url.hostname)) {
    return undefined;
  }

  const reviewed = (descriptions as Record<string, ReviewedImageDescription>)[url.pathname];
  return reviewed && currentAlt.trim() === reviewed.previousAlt ? reviewed.alt : undefined;
}
