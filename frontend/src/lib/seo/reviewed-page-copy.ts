import revisions from './reviewed-page-copy.json';

type CopyRevision = { source: string; value: string };
type PageRevision = { title?: CopyRevision; description?: CopyRevision };

/**
 * Reviewed search copy from the November 2026 page audit, separate from visible
 * headings and article summaries. Exact route and source matching let later
 * content edits take precedence. No automatic truncation or blanket shortening.
 */
export function getReviewedPageCopy(path: string, title: string, description: string) {
  const revision = (revisions as Record<string, PageRevision>)[path];
  return {
    title: revision?.title?.source === title ? revision.title.value : title,
    description:
      revision?.description?.source === description ? revision.description.value : description,
  };
}
