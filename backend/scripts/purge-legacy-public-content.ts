import { writeFile } from 'node:fs/promises';
import { resolve } from 'node:path';

import { Prisma, PrismaClient, PublishStatus } from '@prisma/client';

import {
  containsLegacyAboutContent,
  isPlaceholderPartner,
  LEGACY_BANNER_TITLES_EN,
  LEGACY_BANNER_TITLES_ZH,
  LEGACY_PRODUCT_CATEGORY_SLUGS,
  LEGACY_PRODUCT_SLUGS,
} from '../src/common/content-governance/legacy-public-content';

type CleanupArgs = {
  execute: boolean;
  backupPath?: string;
};

const EXPECTED_COUNTS = {
  banners: 3,
  categories: 10,
  products: 10,
  partners: 8,
  aboutSections: 1,
  timeline: 3,
  chairman: 1,
  culture: 3,
} as const;

function parseArgs(argv: string[]): CleanupArgs {
  const backupArg = argv.find((arg) => arg.startsWith('--backup='));

  return {
    execute: argv.includes('--execute'),
    backupPath: backupArg?.slice('--backup='.length),
  };
}

function assertExpectedCount(name: keyof typeof EXPECTED_COUNTS, actual: number) {
  const expected = EXPECTED_COUNTS[name];

  if (actual !== 0 && actual !== expected) {
    throw new Error(`${name}: expected either 0 or ${expected} targeted records, found ${actual}`);
  }
}

function ids(items: Array<{ id: number }>) {
  return items.map((item) => item.id);
}

async function main() {
  const args = parseArgs(process.argv.slice(2));
  const prisma = new PrismaClient();

  if (args.execute && !args.backupPath) {
    throw new Error('--backup=/absolute/path.json is required with --execute');
  }

  try {
    const [banners, categories, products, partnerCandidates, publishedAboutSections] =
      await Promise.all([
        prisma.banner.findMany({
          where: {
            status: PublishStatus.published,
            OR: [
              { titleZh: { in: [...LEGACY_BANNER_TITLES_ZH] } },
              { titleEn: { in: [...LEGACY_BANNER_TITLES_EN] } },
            ],
          },
        }),
        prisma.productCategory.findMany({
          where: { slug: { in: [...LEGACY_PRODUCT_CATEGORY_SLUGS] } },
        }),
        prisma.product.findMany({
          where: { slug: { in: LEGACY_PRODUCT_SLUGS } },
        }),
        prisma.partner.findMany({
          where: {
            OR: [
              { name: { startsWith: '合作伙伴 ' } },
              { website: { startsWith: 'https://example-' } },
            ],
          },
        }),
        prisma.aboutSection.findMany({ where: { status: PublishStatus.published } }),
      ]);

    const partners = partnerCandidates.filter((item) =>
      isPlaceholderPartner(item.name, item.website),
    );
    const aboutIsContaminated = publishedAboutSections.some((item) =>
      containsLegacyAboutContent([
        item.titleZh,
        item.titleEn,
        item.contentZh,
        item.contentEn,
        item.seoTitleZh,
        item.seoTitleEn,
        item.seoDescriptionZh,
        item.seoDescriptionEn,
      ]),
    );

    const [timeline, chairman, culture] = aboutIsContaminated
      ? await Promise.all([
          prisma.timelineEvent.findMany({ where: { status: PublishStatus.published } }),
          prisma.chairmanMessage.findMany({ where: { status: PublishStatus.published } }),
          prisma.cultureValue.findMany({ where: { status: PublishStatus.published } }),
        ])
      : [[], [], []];
    const aboutSections = aboutIsContaminated ? publishedAboutSections : [];

    const targets = {
      banners,
      categories,
      products,
      partners,
      aboutSections,
      timeline,
      chairman,
      culture,
    };

    for (const [name, items] of Object.entries(targets)) {
      assertExpectedCount(name as keyof typeof EXPECTED_COUNTS, items.length);
    }

    console.log(`Mode: ${args.execute ? 'execute' : 'dry-run'}`);
    for (const [name, items] of Object.entries(targets)) {
      console.log(`${name}: ${items.length}`);
    }

    if (!args.execute) return;

    const backupPath = resolve(args.backupPath!);
    await writeFile(
      backupPath,
      `${JSON.stringify({ createdAt: new Date().toISOString(), targets }, null, 2)}\n`,
      { encoding: 'utf8', flag: 'wx' },
    );

    const results = await prisma.$transaction(
      async (tx) => ({
        products: await tx.product.deleteMany({ where: { id: { in: ids(products) } } }),
        categories: await tx.productCategory.deleteMany({
          where: { id: { in: ids(categories) } },
        }),
        banners: await tx.banner.deleteMany({ where: { id: { in: ids(banners) } } }),
        partners: await tx.partner.deleteMany({ where: { id: { in: ids(partners) } } }),
        aboutSections: await tx.aboutSection.deleteMany({
          where: { id: { in: ids(aboutSections) } },
        }),
        timeline: await tx.timelineEvent.deleteMany({ where: { id: { in: ids(timeline) } } }),
        chairman: await tx.chairmanMessage.deleteMany({
          where: { id: { in: ids(chairman) } },
        }),
        culture: await tx.cultureValue.deleteMany({ where: { id: { in: ids(culture) } } }),
      }),
      { isolationLevel: Prisma.TransactionIsolationLevel.Serializable },
    );

    for (const [name, result] of Object.entries(results)) {
      const expected = targets[name as keyof typeof targets].length;
      if (result.count !== expected) {
        throw new Error(`${name}: expected to delete ${expected}, deleted ${result.count}`);
      }
    }

    console.log(`Backup: ${backupPath}`);
    console.log('Legacy public content removed successfully.');
  } finally {
    await prisma.$disconnect();
  }
}

main().catch((error) => {
  console.error(error instanceof Error ? error.message : String(error));
  process.exitCode = 1;
});
