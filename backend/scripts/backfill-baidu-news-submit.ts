import { PrismaClient, PublishStatus } from '@prisma/client';

type BaiduSubmitResponse = {
  success?: number;
  remain?: number;
  error?: number;
  message?: string;
};

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
  return `${publicSiteUrl()}/zh/news/${encodeURIComponent(slug)}`;
}

function baiduEndpoint() {
  const site = process.env.BAIDU_SITE?.trim();
  const token = process.env.BAIDU_TOKEN?.trim();

  if (!site || !token) {
    throw new Error('BAIDU_SITE and BAIDU_TOKEN are required when --execute is used');
  }

  const endpoint = new URL('http://data.zz.baidu.com/urls');
  endpoint.searchParams.set('site', site);
  endpoint.searchParams.set('token', token);
  return endpoint;
}

async function submitToBaidu(url: string) {
  const response = await fetch(baiduEndpoint(), {
    method: 'POST',
    headers: { 'Content-Type': 'text/plain' },
    body: url,
  });
  const text = await response.text();
  const parsed = parseBaiduResponse(text);

  if (!response.ok) {
    throw new Error(`Baidu returned HTTP ${response.status}`);
  }

  if (parsed?.error !== undefined) {
    throw new Error(`Baidu returned error ${parsed.error}: ${parsed.message ?? 'unknown error'}`);
  }

  return parsed;
}

function parseBaiduResponse(text: string) {
  if (!text) return undefined;

  try {
    return JSON.parse(text) as BaiduSubmitResponse;
  } catch {
    return undefined;
  }
}

async function main() {
  const args = parseArgs(process.argv.slice(2));
  const prisma = new PrismaClient();

  console.log(`Mode: ${args.execute ? 'execute' : 'dry-run'}`);
  console.log(`Limit: ${args.limit}`);
  console.log(`PUBLIC_SITE_URL=${publicSiteUrl()}`);
  console.log(`BAIDU_SITE=${process.env.BAIDU_SITE?.trim() || 'EMPTY'}`);
  console.log(
    process.env.BAIDU_TOKEN?.trim()
      ? `BAIDU_TOKEN=***MASKED*** length=${process.env.BAIDU_TOKEN.trim().length}`
      : 'BAIDU_TOKEN=EMPTY',
  );

  try {
    const newsItems = await prisma.news.findMany({
      where: {
        status: PublishStatus.published,
        isPublished: true,
        slug: { not: '' },
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

    let successCount = 0;
    let failureCount = 0;

    for (const item of newsItems) {
      const url = buildNewsUrl(item.slug);
      console.log(`News ${item.id} | ${item.slug} | ${url}`);

      if (!args.execute) {
        continue;
      }

      try {
        await submitToBaidu(url);
        await prisma.news.updateMany({
          where: {
            id: item.id,
            baiduSubmittedAt: null,
          },
          data: {
            baiduSubmittedAt: new Date(),
          },
        });
        successCount += 1;
        console.log(`Submitted ${item.id}`);
      } catch (error) {
        failureCount += 1;
        console.error(
          `Failed ${item.id}: ${error instanceof Error ? error.message : String(error)}`,
        );
      }
    }

    console.log(
      `Summary: mode=${args.execute ? 'executed' : 'dry-run'} success=${successCount} failed=${failureCount} pending=${newsItems.length}`,
    );
  } finally {
    await prisma.$disconnect();
  }
}

main().catch((error) => {
  console.error(error instanceof Error ? error.message : String(error));
  process.exitCode = 1;
});
