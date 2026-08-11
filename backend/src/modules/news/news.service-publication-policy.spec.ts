import { ConflictException } from '@nestjs/common';
import { PublishStatus } from '@prisma/client';

import { NewsService } from '@/modules/news/news.service';
import { PrismaService } from '@/prisma/prisma.service';

jest.mock('isomorphic-dompurify', () => ({
  __esModule: true,
  default: { sanitize: (value: string) => value },
}));

const unverifiedRecord = {
  id: 22,
  categoryId: 2,
  titleZh: '热处理炉大修怎么选？',
  titleEn: null,
  summaryZh: null,
  summaryEn: null,
  contentZh: '<p>通过 ISO 9001、ISO 14001、ISO 45001 三体系认证。</p>',
  contentEn: null,
  coverImage: null,
  publishDate: new Date('2026-08-01T00:00:00.000Z'),
  viewCount: 0,
  slug: 'furnace-overhaul-selection',
  isPublished: false,
  sortOrder: 0,
  status: PublishStatus.draft as PublishStatus,
  baiduSubmittedAt: null,
  seoTitleZh: null,
  seoTitleEn: null,
  seoDescriptionZh: null,
  seoDescriptionEn: null,
  seoKeywordsZh: null,
  seoKeywordsEn: null,
  ogImage: null,
  contentUpdatedAt: null,
  createdAt: new Date('2026-08-01T00:00:00.000Z'),
  updatedAt: new Date('2026-08-01T00:00:00.000Z'),
};

function harness(record = unverifiedRecord) {
  const news = {
    findUnique: jest.fn(() => record),
    update: jest.fn(),
  };
  const prisma = { news } as unknown as PrismaService;
  const categoryService = { getDefaultCategoryId: jest.fn() };
  const baidu = { buildNewsUrl: jest.fn(), submitUrl: jest.fn() };

  return {
    service: new NewsService(prisma, categoryService as never, baidu as never),
    news,
  };
}

describe('NewsService publication fact policy', () => {
  it('blocks an admin status change that would publish an unverified claim', async () => {
    const { service, news } = harness();

    await expect(service.updateStatus(22, PublishStatus.published)).rejects.toBeInstanceOf(
      ConflictException,
    );
    expect(news.update).not.toHaveBeenCalled();
  });

  it('blocks edits to an already-public article when the resulting content violates policy', async () => {
    const { service, news } = harness({
      ...unverifiedRecord,
      status: PublishStatus.published,
      isPublished: true,
    });

    await expect(service.update(22, { titleZh: '新标题' })).rejects.toBeInstanceOf(
      ConflictException,
    );
    expect(news.update).not.toHaveBeenCalled();
  });
});
