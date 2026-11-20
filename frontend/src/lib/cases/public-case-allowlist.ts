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
  ...[
    { id: 'fork-review-01', slug: 'fork-long-bar-batch-quench' },
    { id: 'fork-review-02', slug: 'fork-pipe-flange-solution-treatment' },
    { id: 'fork-review-03', slug: 'fork-copper-wire-four-chamber-annealing' },
    { id: 'fork-review-04', slug: 'fork-gas-pipe-fittings-trial-scope' },
    { id: 'fork-review-05', slug: 'fork-gas-furnaces-enclosed-cooling-boxes' },
    { id: 'fork-review-06', slug: 'fork-copper-coil-annealing-proposal' },
    { id: 'fork-review-07', slug: 'fork-alloy-bar-quenching-proposal' },
    { id: 'fork-review-08', slug: 'fork-gas-fired-pipe-solution-furnace' },
  ].map(item => ({ ...item, batch: 4, english: false, approvedBy: 'site-owner', approvedAt: '2026-11-20' })),
  ...[
    'bright-quench-design',
    'crankshaft-annual-output',
    'cylinder-liner-solution-aging',
    'overseas-austemper',
    'overseas-oil-quench',
    'roller-belt-cooling-water-supply',
    'roller-belt-stage-output',
    'standard-parts-capacity',
    'steering-forgings',
  ].map(slug => ({ id: slug, slug, batch: 3, english: true, approvedBy: 'site-owner', approvedAt: '2026-11-14' })),
  {
    id: 'fastener-mesh-belt-quenching-carburizing',
    slug: 'fastener-mesh-belt-quenching-carburizing',
    batch: 2,
    english: true,
    approvedBy: 'site-owner',
    approvedAt: '2026-11-14',
  },
  {
    id: 'stainless-strip-annealing-supply-scope',
    slug: 'stainless-strip-annealing-supply-scope',
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
