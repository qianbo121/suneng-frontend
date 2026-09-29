import { PublishStatus } from '@prisma/client';

import { ShujuNewsReadService } from '@/modules/shuju-service/shuju-news-read.service';
import { PrismaService } from '@/prisma/prisma.service';

describe('ShujuNewsReadService', () => {
  it('uses a projection-only list query and never exposes news body fields', async () => {
    const findMany = jest.fn().mockResolvedValue([
      {
        id: 1,
        titleZh: '测试新闻',
        status: PublishStatus.draft,
        publishDate: new Date('2026-08-07T00:00:00Z'),
      },
    ]);
    const count = jest.fn().mockResolvedValue(1);
    const prisma = {
      news: { findMany, count },
      newsCategory: { findMany: jest.fn() },
      $transaction: jest.fn((operations: Promise<unknown>[]) => Promise.all(operations)),
    } as unknown as PrismaService;
    const service = new ShujuNewsReadService(prisma);

    const result = await service.list({
      page: 1,
      pageSize: 20,
      keyword: '测试',
      status: PublishStatus.draft,
    });

    expect(result.total).toBe(1);
    expect(result.items).toHaveLength(1);
    const query = findMany.mock.calls[0][0];
    expect(query.select.contentZh).toBeUndefined();
    expect(query.select.contentEn).toBeUndefined();
    expect(query.select.baiduSubmittedAt).toBeUndefined();
    expect(query.select.viewCount).toBeUndefined();
    expect(query.where.status).toBe(PublishStatus.draft);
    expect(query.where.OR).toHaveLength(3);
  });

  it('returns only published category identifiers and labels', async () => {
    const findMany = jest.fn().mockResolvedValue([
      { id: 1, nameZh: '公司新闻', slug: 'company-news' },
      { id: 2, nameZh: '行业新闻', slug: 'industry-news' },
    ]);
    const prisma = {
      newsCategory: { findMany },
    } as unknown as PrismaService;
    const service = new ShujuNewsReadService(prisma);

    await expect(service.listCategories()).resolves.toHaveLength(2);
    expect(findMany).toHaveBeenCalledWith({
      where: { status: PublishStatus.published },
      orderBy: [{ sortOrder: 'asc' }, { id: 'asc' }],
      select: { id: true, nameZh: true, slug: true },
    });
  });

  it('reads only selected public articles without changing counts or filling missing articles', async () => {
    const findMany = jest.fn().mockResolvedValue([
      { id: 1, viewCount: 0 },
      { id: 5, viewCount: 123 },
    ]);
    const write = jest.fn();
    const prisma = {
      news: { findMany, create: write, update: write, updateMany: write, delete: write },
    } as unknown as PrismaService;
    const service = new ShujuNewsReadService(prisma);
    const before = Date.now();

    const result = await service.readership({ ids: [1, 3, 5, 7] });

    expect(findMany).toHaveBeenCalledTimes(1);
    expect(findMany).toHaveBeenCalledWith({
      where: {
        id: { in: [1, 3, 5, 7] },
        status: PublishStatus.published,
        isPublished: true,
      },
      orderBy: { id: 'asc' },
      select: { id: true, viewCount: true },
    });
    expect(result.items).toEqual([
      { id: 1, viewCount: 0 },
      { id: 5, viewCount: 123 },
    ]);
    expect(new Date(result.checkedAt).toISOString()).toBe(result.checkedAt);
    expect(Date.parse(result.checkedAt)).toBeGreaterThanOrEqual(before);
    expect(Date.parse(result.checkedAt)).toBeLessThanOrEqual(Date.now());
    expect(write).not.toHaveBeenCalled();
  });

  it('returns an empty list when no requested article is public', async () => {
    const findMany = jest.fn().mockResolvedValue([]);
    const service = new ShujuNewsReadService({
      news: { findMany },
    } as unknown as PrismaService);

    await expect(service.readership({ ids: [2, 3] })).resolves.toEqual({
      items: [],
      checkedAt: expect.any(String),
    });
  });
});
