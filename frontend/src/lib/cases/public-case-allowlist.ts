/**
 * Owner-approved public case studies.
 *
 * A case is public only when its source JSON is `published` AND its slug is
 * listed here. Add an entry only after the site owner has reviewed that exact
 * article, and record the batch and approval date. `english: true` also opens
 * the English page, which additionally requires a matching translation
 * fingerprint.
 *
 * Keep this module free of Node or server-only imports: middleware and client
 * navigation read it. The release contract in ops/releases mirrors these slugs,
 * and a test keeps the two lists in step.
 */
export type ReviewedPublicCase = {
  id: string;
  slug: string;
  batch: number;
  english: boolean;
  approvedBy: string;
  approvedAt: string;
};

export const REVIEWED_PUBLIC_CASES: readonly ReviewedPublicCase[] = [
  {
    id: 'henan-annealing-solution',
    slug: 'henan-annealing-solution-line',
    batch: 1,
    english: true,
    approvedBy: 'site-owner',
    approvedAt: '2026-09-17',
  },
];

export const PUBLIC_CASE_SLUGS: ReadonlySet<string> = new Set(
  REVIEWED_PUBLIC_CASES.map((item) => item.slug),
);

export const PUBLIC_ENGLISH_CASE_SLUGS: ReadonlySet<string> = new Set(
  REVIEWED_PUBLIC_CASES.filter((item) => item.english).map((item) => item.slug),
);
