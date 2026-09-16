export { LIST_PAGE_SIZE as CASE_PAGE_SIZE } from '@/constants/pagination';
export const CASE_FILTER_KEYS = ['workpiece', 'process', 'equipment', 'need'] as const;
export type CaseFilterKey = (typeof CASE_FILTER_KEYS)[number];
export type CaseContentType = 'experience' | 'proposal';
export type CaseFact = {
  label: string;
  value: string;
  unit?: string;
  condition?: string;
  attribute?: string;
};
export type CaseLink = { title: string; href: string };
export type CaseMeta = {
  id: string;
  slug: string;
  title: string;
  listTitle?: string;
  listSummary?: string;
  summary: string;
  body: string;
  contentType: CaseContentType;
  publicationStatus: 'published' | 'draft';
  projectStatus: 'proposal' | 'contracted' | 'experience' | 'delivered' | 'accepted';
  workpiece: string[];
  materials: string[];
  process: string[];
  equipment: string[];
  need: string[];
  tags: string[];
  publicCustomerName?: string;
  projectYear?: number;
  sourceDate?: string;
  datePublished?: string;
  dateModified?: string;
  facts: CaseFact[];
  participation?: string;
  sourceSummary: string;
  coverTitle?: string;
  cover?: { src: string; alt: string; caption: string; fit?: 'contain' | 'cover' };
  author?: string;
  reviewer?: string;
  relatedCases?: string[];
  relatedLinks?: CaseLink[];
};
export type CaseCardData = Pick<
  CaseMeta,
  | 'id'
  | 'slug'
  | 'title'
  | 'listTitle'
  | 'summary'
  | 'contentType'
  | 'projectYear'
  | 'facts'
  | 'participation'
  | 'sourceSummary'
  | 'cover'
  | 'coverTitle'
>;
export type CaseQuery = Record<CaseFilterKey, string> & {
  q: string;
  type: '' | CaseContentType;
  sort: 'updated' | 'relevance' | 'year';
  page: number;
  from: number;
};
export type CasePageResult = {
  items: CaseCardData[];
  page: number;
  from: number;
  total: number;
  totalPages: number;
  nextHref: string | null;
};
export type CaseArticle = { meta: CaseMeta; html: string; toc: { id: string; title: string }[] };
export const CASE_TYPE_LABELS: Record<CaseContentType, string> = {
  experience: '项目经验',
  proposal: '方案记录',
};
