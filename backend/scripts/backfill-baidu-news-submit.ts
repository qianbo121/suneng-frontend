import { PrismaClient, PublishStatus } from '@prisma/client';

import {
  buildPublicNewsIdentifier,
  NONCANONICAL_NEWS_SLUGS,
} from '../src/modules/news/news-public-identifier';

import {
  submitSingleUrlToBaidu,
  safeBaiduFailureMessage,
} from '../src/modules/news/baidu-submit-response';

type BackfillArgs = {
  execute: boolean;
  limit: number;
};

const DEFAULT_LIMIT = 20;

function parseArgs(argv: string[]): BackfillArgs {
  let limit = DEFAULT_LIMIT;

  for (let index = 0; index < argv.length; index += 1) {
    const arg = argv[index];

    if (arg.startsWith('--limit=')) {
      limit = Number(arg.slice('--limit='.length));
      continue;
    }

    if (arg === '--limit') {
      limit = Number(argv[index + 1]);
      index += 1;
    }
  }

  if (!Number.isInteger(limit) || limit <= 0) {
    throw new Error('--limit must be a positive integer');
  }

  return {
    execute: argv.includes('--execute'),
    limit,
  };
}

function publicSiteUrl() {
  return (process.env.PUBLIC_SITE_URL || 'https://www.jssngyl.cn').replace(/\/+$/, '');
}

function buildNewsUrl(slug: string) {
  return `${publicSiteUrl()}/zh/news/${encodeURIComponent(buildPublicNewsIdentifier(slug))}`;
}

async function submitToBaidu(url: string) {
  const site = process.env.BAIDU_SITE?.trim();
  const token = process.env.BAIDU_TOKEN?.trim();
  if (!site || !token) throw new Error('Missing Baidu configuration');
  await submitSingleUrlToBaidu(site, token, url, process.env.BAIDU_ALLOW_HTTP === 'true');
}

export async function backfillNewsItems(
  prisma: PrismaClient,
  newsItems: { id: number; slug: string }[],
  execute: boolean,
) {
  let successCount = 0;
  let failureCount = 0;
  if (execute && process.env.BAIDU_SUBMISSION_MODE !== 'automatic') {
    console.log('Baidu backfill paused: BAIDU_SUBMISSION_MODE is not automatic');
    return { successCount, failureCount, skippedCount: newsItems.length };
  }
  for (const item of newsItems) {
    console.log(`News ${item.id}`);
    if (!execute) continue;
    try {
      await submitToBaidu(buildNewsUrl(item.slug));
      await prisma.news.updateMany({
        where: { id: item.id, baiduSubmittedAt: null },
        data: { baiduSubmittedAt: new Date() },
      });
      successCount += 1;
      console.log(`Submitted ${item.id}`);
    } catch (error) {
      failureCount += 1;
      console.error(`Failed ${item.id}: ${safeBaiduFailureMessage(error)}`);
    }
  }
  if (failureCount > 0) process.exitCode = 1;
  return { successCount, failureCount, skippedCount: 0 };
}

async function main() {
  const args = parseArgs(process.argv.slice(2));
  const prisma = new PrismaClient();

  console.log(`Mode: ${args.execute ? 'execute' : 'dry-run'}`);
  console.log(`Limit: ${args.limit}`);

  try {
    const newsItems = await prisma.news.findMany({
      where: {
        status: PublishStatus.published,
        isPublished: true,
        slug: { not: '', notIn: NONCANONICAL_NEWS_SLUGS },
        baiduSubmittedAt: null,
      },
      orderBy: [{ publishDate: 'desc' }, { id: 'desc' }],
      take: args.limit,
      select: {
        id: true,
        titleZh: true,
        slug: true,
      },
    });

    console.log(`Pending count: ${newsItems.length}`);

    const { successCount, failureCount, skippedCount } = await backfillNewsItems(
      prisma,
      newsItems,
      args.execute,
    );

    console.log(
      `Summary: mode=${args.execute ? 'execute' : 'dry-run'} success=${successCount} failed=${failureCount} skipped=${skippedCount} pending=${newsItems.length}`,
    );
  } finally {
    await prisma.$disconnect();
  }
}

if (require.main === module) {
  main().catch(() => {
    console.error('Baidu backfill failed');
    process.exitCode = 1;
  });
}
