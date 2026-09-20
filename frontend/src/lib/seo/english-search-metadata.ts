import newsCopy from './english-news-search-copy.json';

type SearchCopy = {
  title: string;
  sourceTitle?: string;
  description?: string;
  sourceDescription?: string;
};

// Search-only copy, keyed by the exact reviewed headline. New or rewritten
// articles keep their supplied metadata until a new short version is reviewed.
// 60 characters is an editorial target, never a reason to cut off a condition.
export function englishNewsSearchMetadata(
  title: string,
  description: string,
  suppliedTitle?: string | null,
) {
  const copy = Object.hasOwn(newsCopy, title)
    ? (newsCopy as Record<string, SearchCopy>)[title]
    : undefined;
  const supplied = suppliedTitle?.trim();
  // A later CMS edit is authoritative, even if the visible headline is unchanged.
  const customTitle = supplied && supplied !== title && supplied !== copy?.sourceTitle;
  const searchTitle = (customTitle ? supplied : copy?.title) || supplied || title;
  return {
    title: /suneng/i.test(searchTitle) ? searchTitle : `${searchTitle} | Suneng`,
    description:
      copy?.sourceDescription === description ? copy.description || description : description,
  };
}

export function englishCaseSearchMetadata(title: string, description: string) {
  if (
    title ===
    'An 850 mm stainless-steel annealing and pickling line: supply scope for the annealing and solution-treatment section'
  ) {
    return {
      title: 'Henan Strip Annealing & Solution Section | Suneng',
      description:
        description ===
        "For Henan Jinyubang Industrial Co., Ltd.'s continuous annealing and pickling line, Suneng participated in equipment supply for the annealing furnace and solution-treatment cooling section. Compare similar strip projects by first matching actual width, thickness and temperature progression, then reviewing heating, cooling, drying and whole-line interfaces separately. Drawing on the 2017 technical annex and published project records, this page explains that assessment. Proposal parameters are not actual output or acceptance results."
          ? 'Henan strip-line annealing and solution-treatment supply scope, based on project records. Proposal parameters are not verified output or acceptance results.'
          : description,
    };
  }
  return { title, description };
}
