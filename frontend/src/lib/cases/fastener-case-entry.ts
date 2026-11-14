import { PUBLIC_CASE_SLUGS } from './public-case-allowlist';
import record from '../../../content/cases/fastener-mesh-belt-quenching-carburizing.json';

export const FASTENER_CASE_SLUG = record.slug;
export const FASTENER_CASE_PATH = `/zh/case/${FASTENER_CASE_SLUG}`;
export const FASTENER_CASE_TITLE = record.title;
// Local review is not publication approval. Production requires both existing gates.
export const fastenerCasePublished = () =>
  String(record.publicationStatus) === 'published' && PUBLIC_CASE_SLUGS.has(FASTENER_CASE_SLUG);
export const fastenerCaseVisible = () => process.env.NODE_ENV === 'development' || fastenerCasePublished();
export const LOCAL_REVIEW_CASE_SLUGS: ReadonlySet<string> = new Set(
  process.env.NODE_ENV === 'development' ? [FASTENER_CASE_SLUG] : [],
);
