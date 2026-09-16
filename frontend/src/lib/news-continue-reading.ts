import { getCanonicalNewsSlug } from '@/lib/news-routing';

export type NewsContinueReadingCandidate = {
  id: number;
  slug: string;
  title: string;
  categoryId?: number | null;
};

type CurrentNewsArticle = {
  id: number;
  slug: string;
  categoryId?: number | null;
};

export function selectNewsContinueReadingItems(
  currentArticle: CurrentNewsArticle,
  candidates: NewsContinueReadingCandidate[],
  limit = 4,
) {
  const currentSlug = getCanonicalNewsSlug(currentArticle.slug);
  const seenSlugs = new Set<string>();
  const uniqueCandidates = candidates.filter((candidate) => {
    const canonicalSlug = getCanonicalNewsSlug(candidate.slug);

    if (
      candidate.id === currentArticle.id ||
      canonicalSlug === currentSlug ||
      seenSlugs.has(canonicalSlug) ||
      !candidate.title.trim()
    ) {
      return false;
    }

    seenSlugs.add(canonicalSlug);
    return true;
  });

  const sameCategory = uniqueCandidates.filter(
    (candidate) =>
      currentArticle.categoryId != null && candidate.categoryId === currentArticle.categoryId,
  );
  const otherCategories = uniqueCandidates.filter(
    (candidate) =>
      currentArticle.categoryId == null || candidate.categoryId !== currentArticle.categoryId,
  );

  return [...sameCategory, ...otherCategories].slice(0, Math.max(0, limit));
}
