import { readFileSync } from 'node:fs';
import { join } from 'node:path';
const publicSlugs = JSON.parse(
  readFileSync(join(__dirname, 'fixtures/public-news-slugs-20260909.json'), 'utf8'),
) as string[];
import { PublishStatus } from '@prisma/client';

import { NewsService } from '@/modules/news/news.service';
import { PrismaService } from '@/prisma/prisma.service';

jest.mock('isomorphic-dompurify', () => ({
  __esModule: true,
  default: { sanitize: (value: string) => value },
}));

const publishedRecord = {
  id: 80,
  slug: 'tai-che-lu-lu-men-lou-re-lou-huo-si-duan-ding-wei-fa',
  titleZh: '台车炉炉门漏热、漏火怎么办？苏能四段定位法',
  status: PublishStatus.published,
  isPublished: true,
  publishDate: new Date('2026-09-09T00:00:00Z'),
  baiduSubmittedAt: null,
};

function harness() {
  const news = {
    findMany: jest.fn().mockResolvedValue([publishedRecord]),
    count: jest.fn().mockResolvedValue(1),
    findFirst: jest.fn().mockResolvedValue(publishedRecord),
    findUnique: jest.fn().mockResolvedValue({ ...publishedRecord, status: PublishStatus.draft }),
    update: jest.fn().mockResolvedValue(publishedRecord),
    updateMany: jest.fn().mockResolvedValue({ count: 1 }),
  };
  const prisma = {
    news,
    $transaction: jest.fn((operations: Promise<unknown>[]) => Promise.all(operations)),
  } as unknown as PrismaService;
  const categoryService = { getDefaultCategoryId: jest.fn() };
  const baidu = {
    buildNewsUrl: jest.fn((slug: string) => `https://www.jssngyl.cn/zh/news/${slug}`),
    submitUrl: jest.fn().mockResolvedValue(true),
  };

  return {
    service: new NewsService(prisma, categoryService as never, baidu as never),
    news,
    baidu,
  };
}

describe('NewsService public identifiers', () => {
  it('preserves published slugs in public lists', async () => {
    const { service } = harness();

    const result = await service.getPublicList({ page: 1, pageSize: 10 });

    expect(result.items[0].slug).toBe(publishedRecord.slug);
  });

  it('accepts numeric lookup aliases but returns the existing canonical slug', async () => {
    const { service, news } = harness();

    await expect(service.getPublicDetail('80')).resolves.toMatchObject({
      slug: publishedRecord.slug,
    });
    expect(news.findFirst).toHaveBeenLastCalledWith(
      expect.objectContaining({ where: expect.objectContaining({ id: 80 }) }),
    );

    await expect(service.getPublicDetail(publishedRecord.slug)).resolves.toMatchObject({
      slug: publishedRecord.slug,
    });
    expect(news.findFirst).toHaveBeenLastCalledWith(
      expect.objectContaining({ where: expect.objectContaining({ slug: publishedRecord.slug }) }),
    );
  });

  it('does not change the public address when the title is edited', async () => {
    const { service, news } = harness();

    await service.update(80, { titleZh: '修改后的标题' });

    expect(news.update).toHaveBeenCalledWith({
      where: { id: 80 },
      data: expect.not.objectContaining({ slug: expect.anything() }),
    });
  });
});

describe('migration public address coverage', () => {
  it('keeps every one of the 72 captured public article paths in lists and details', async () => {
    const { service, news } = harness();
    const records = publicSlugs.map((slug, i) => ({ ...publishedRecord, id: i + 1, slug }));
    news.findMany.mockResolvedValue(records);
    const list = await service.getPublicList({ page: 1, pageSize: 100 });
    expect(list.items.map((item) => item.slug)).toEqual(publicSlugs);
    for (const record of records) {
      news.findFirst.mockResolvedValue(record);
      expect((await service.getPublicDetail(record.slug)).slug).toBe(record.slug);
      expect((await service.getPublicDetail(String(record.id))).slug).toBe(record.slug);
    }
  });

  it('returns canonical slugs for previous and next articles', async () => {
    const { service, news } = harness();
    news.findUnique.mockResolvedValueOnce(publishedRecord);
    news.findFirst
      .mockResolvedValueOnce({ ...publishedRecord, id: 81, slug: 'previous-article' })
      .mockResolvedValueOnce({ ...publishedRecord, id: 79, slug: 'next-article' });
    await expect(service.getPrevNext(publishedRecord.id)).resolves.toMatchObject({
      prev: { slug: 'previous-article' },
      next: { slug: 'next-article' },
    });
  });

  it.each(['80', publishedRecord.slug])(
    'does not serve unavailable articles through %s',
    async (identifier) => {
      const { service, news } = harness();
      news.findFirst.mockResolvedValue(null);
      await expect(service.getPublicDetail(identifier)).rejects.toMatchObject({ status: 404 });
      expect(news.findFirst).toHaveBeenCalledWith(
        expect.objectContaining({
          where: expect.objectContaining({ status: PublishStatus.published, isPublished: true }),
        }),
      );
    },
  );

  it('submits the same canonical address returned by the public article', async () => {
    const { service, news, baidu } = harness();
    news.findUnique
      .mockResolvedValueOnce({ ...publishedRecord, status: PublishStatus.draft })
      .mockResolvedValueOnce(publishedRecord);
    await service.updateStatus(80, PublishStatus.published);
    await new Promise((resolve) => setImmediate(resolve));
    expect(baidu.buildNewsUrl).toHaveBeenCalledWith(publishedRecord.slug);
    expect(baidu.submitUrl).toHaveBeenCalledWith(
      `https://www.jssngyl.cn/zh/news/${publishedRecord.slug}`,
    );
    expect(news.updateMany).toHaveBeenCalled();
  });
});
