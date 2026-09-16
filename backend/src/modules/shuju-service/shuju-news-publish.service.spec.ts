import { ConflictException, NotFoundException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { PublishStatus } from '@prisma/client';
import { plainToInstance } from 'class-transformer';
import { validate } from 'class-validator';

import { ShujuNewsPublishDto } from '@/modules/shuju-service/dto/shuju-news-publish.dto';
import { ShujuNewsPublishService } from '@/modules/shuju-service/shuju-news-publish.service';
import { PrismaService } from '@/prisma/prisma.service';

jest.mock('isomorphic-dompurify', () => ({
  __esModule: true,
  default: { sanitize: (value: string) => value },
}));

function dto(categoryId: number | null = 2): ShujuNewsPublishDto {
  const payload: ShujuNewsPublishDto = {
    sourceDraftId: 7,
    sourceVersion: 3,
    idempotencyKey: 'shuju-news:7:v3:publish',
    titleZh: '台车炉验收要看哪些数据？',
    summaryZh: '验收数据说明',
    contentZh: '<p>先核对工艺曲线，再核对装炉记录。</p>',
    coverImage: 'https://www.jssngyl.cn/uploads/2026/08/cover.webp',
    slug: 'trolley-furnace-acceptance-data',
  };
  if (categoryId !== null) payload.categoryId = categoryId;
  return payload;
}

function harness(binding: { sourceVersion: number; newsId: number } | null = null) {
  const operations = new Map<string, Record<string, unknown>>();
  const news = {
    ...dto(),
    publishDate: new Date('2026-08-01T00:00:00Z'),
    id: binding?.newsId ?? 31,
    slug: dto().slug,
    status: PublishStatus.published,
  };
  const operationModel = {
    findUnique: jest.fn(({ where }) => operations.get(where.idempotencyKey) ?? null),
    create: jest.fn(({ data }) => {
      const record = { ...data, newsId: null };
      operations.set(data.idempotencyKey, record);
      return record;
    }),
    update: jest.fn(({ where, data }) => {
      const current = operations.get(where.idempotencyKey) ?? {};
      const record = { ...current, ...data };
      operations.set(where.idempotencyKey, record);
      return record;
    }),
    updateMany: jest.fn(() => ({ count: 1 })),
  };
  const tx = {
    shujuNewsPublication: {
      findUnique: jest.fn(() => binding),
      create: jest.fn(),
      update: jest.fn(),
    },
    shujuNewsOperation: operationModel,
    newsCategory: {
      findUnique: jest.fn(),
      findFirst: jest.fn(() => ({ id: 2 })),
    },
    news: {
      findUnique: jest.fn(() => news),
      create: jest.fn(() => news),
      update: jest.fn(() => news),
    },
  };
  const prisma = {
    shujuNewsMedia: { findUnique: jest.fn(), create: jest.fn() },
    shujuNewsOperation: operationModel,
    news: { findUnique: jest.fn(() => news), updateMany: jest.fn() },
    $transaction: jest.fn((callback) => callback(tx)),
  } as unknown as PrismaService;
  const upload = { uploadSingle: jest.fn() };
  const baidu = { buildNewsUrl: jest.fn(), submitUrl: jest.fn(() => false) };
  const service = new ShujuNewsPublishService(
    prisma,
    upload as never,
    baidu as never,
    new ConfigService({ publicSiteUrl: 'https://www.jssngyl.cn' }),
  );
  return { service, prisma, tx, operations, upload, baidu };
}

describe('ShujuNewsPublishService', () => {
  const english = {
    titleEn: 'Which records support trolley furnace acceptance?',
    summaryEn: 'Check the process curve and load records.',
    contentEn: '<p>Check the process curve and load records.</p>',
    seoKeywordsEn: 'trolley furnace, acceptance',
  };

  it('saves both languages on one news record with matching English search fields', async () => {
    const { service, tx } = harness();
    const payload = { ...dto(), ...english };
    await service.publish(payload, 'bilingual');
    expect(tx.news.create).toHaveBeenCalledTimes(1);
    expect(tx.news.create).toHaveBeenCalledWith({
      data: expect.objectContaining({
        ...english,
        seoTitleEn: english.titleEn,
        seoDescriptionEn: english.summaryEn,
      }),
    });
    await service.publish(payload, 'bilingual-replay');
    expect(tx.news.create).toHaveBeenCalledTimes(1);
    await expect(
      service.publish({ ...payload, contentEn: '<p>Different English.</p>' }, 'changed-en'),
    ).rejects.toBeInstanceOf(ConflictException);
  });

  it.each([
    { titleEn: english.titleEn },
    { ...english, contentEn: '<p> </p>' },
    { ...english, contentEn: '<img src="/media/news/private.png">' },
    { ...english, contentEn: '<p>We are ISO 14001 certified.</p>' },
  ])(
    'rejects incomplete, private or fact-policy violating English before writing: %j',
    async (copy) => {
      const { service, prisma } = harness();
      await expect(service.publish({ ...dto(), ...copy }, 'bad-english')).rejects.toBeInstanceOf(
        ConflictException,
      );
      expect(prisma.$transaction).not.toHaveBeenCalled();
      expect(prisma.shujuNewsOperation.create).not.toHaveBeenCalled();
    },
  );

  it('updates both languages while preserving the original date and news identity', async () => {
    const { service, tx } = harness({ sourceVersion: 2, newsId: 31 });
    await service.publish({ ...dto(), ...english }, 'new-translation');
    expect(tx.news.create).not.toHaveBeenCalled();
    expect(tx.news.update).toHaveBeenCalledWith({
      where: { id: 31 },
      data: expect.objectContaining({
        ...english,
        publishDate: new Date('2026-08-01T00:00:00Z'),
        slug: dto().slug,
      }),
    });
  });

  it('invalidates stale English on Chinese edits from an older publisher', async () => {
    const { service, tx } = harness({ sourceVersion: 2, newsId: 31 });
    await service.publish({ ...dto(), contentZh: '<p>改为核对现场记录。</p>' }, 'changed-zh');
    expect(tx.news.update).toHaveBeenCalledWith({
      where: { id: 31 },
      data: expect.objectContaining({
        titleEn: null,
        summaryEn: null,
        contentEn: null,
        seoTitleEn: null,
      }),
    });
  });

  it('preserves a current translation when a legacy request does not change Chinese text', async () => {
    const { service, tx } = harness({ sourceVersion: 2, newsId: 31 });
    await service.publish(dto(), 'same-zh');
    expect((tx.news.update as jest.Mock).mock.calls[0][0].data).not.toHaveProperty('contentEn');
  });

  it('accepts an omitted category in the public request contract but still rejects an invalid one', async () => {
    const withoutCategory = plainToInstance(ShujuNewsPublishDto, dto(null));
    const invalidCategory = plainToInstance(ShujuNewsPublishDto, dto(0));

    await expect(validate(withoutCategory)).resolves.toHaveLength(0);
    await expect(validate(invalidCategory)).resolves.not.toHaveLength(0);
  });

  it('creates one published news row and replays the same idempotency key', async () => {
    const { service, tx, baidu } = harness();
    const first = await service.publish(dto(), 'request-1');
    expect(first.publication.slug).toBe(dto().slug);
    expect(first.publication.url).toBe(`https://www.jssngyl.cn/zh/news/${dto().slug}`);
    expect(baidu.buildNewsUrl).toHaveBeenCalledWith(dto().slug);
    expect(first.replayed).toBe(false);
    expect(first.publication.newsId).toBe(31);
    expect(tx.news.create).toHaveBeenCalledWith(
      expect.objectContaining({
        data: expect.objectContaining({
          status: PublishStatus.published,
          isPublished: true,
        }),
      }),
    );
    expect(tx.shujuNewsPublication.create).toHaveBeenCalledTimes(1);

    const second = await service.publish(dto(), 'request-2');
    expect(second.replayed).toBe(true);
    expect(tx.news.create).toHaveBeenCalledTimes(1);
  });

  it('publishes without a user-selected category by choosing the first published category', async () => {
    const { service, tx } = harness();
    (tx.newsCategory.findFirst as jest.Mock).mockResolvedValue({ id: 8 });

    await service.publish(dto(null), 'request-default-category');

    expect(tx.newsCategory.findFirst).toHaveBeenCalledWith({
      where: { status: PublishStatus.published },
      orderBy: [{ sortOrder: 'asc' }, { id: 'asc' }],
    });
    expect(tx.news.create).toHaveBeenCalledWith(
      expect.objectContaining({ data: expect.objectContaining({ categoryId: 8 }) }),
    );
  });

  it('keeps a supplied published category for legacy clients', async () => {
    const { service, tx } = harness();
    await service.publish(dto(4), 'request-explicit-category');

    expect(tx.newsCategory.findFirst).toHaveBeenCalledWith({
      where: { id: 4, status: PublishStatus.published },
      orderBy: undefined,
    });
  });

  it('fails before writing news when no published category exists', async () => {
    const { service, tx } = harness();
    (tx.newsCategory.findFirst as jest.Mock).mockResolvedValue(null);

    await expect(service.publish(dto(null), 'request-no-category')).rejects.toBeInstanceOf(
      NotFoundException,
    );
    expect(tx.news.create).not.toHaveBeenCalled();
  });

  it('rejects stale source versions before updating an existing news item', async () => {
    const { service, tx } = harness({ sourceVersion: 3, newsId: 31 });
    await expect(service.publish(dto(), 'request-stale')).rejects.toBeInstanceOf(ConflictException);
    expect(tx.news.update).not.toHaveBeenCalled();
  });

  it('rejects mismatched keys and private Shuju media before any database write', async () => {
    const { service, prisma } = harness();
    await expect(
      service.publish({ ...dto(), idempotencyKey: 'shuju-news:7:v2:publish' }, 'bad-key'),
    ).rejects.toBeInstanceOf(ConflictException);
    await expect(
      service.publish({ ...dto(), coverImage: '/media/news/private.webp' }, 'private-media'),
    ).rejects.toBeInstanceOf(ConflictException);
    expect(prisma.$transaction).not.toHaveBeenCalled();
  });

  it('rejects unverified certification claims before any database write', async () => {
    const { service, prisma } = harness();
    await expect(
      service.publish(
        {
          ...dto(),
          contentZh: '<p>通过 ISO 9001、ISO 14001、ISO 45001 三体系认证。</p>',
        },
        'redline-certification',
      ),
    ).rejects.toBeInstanceOf(ConflictException);
    expect(prisma.$transaction).not.toHaveBeenCalled();
  });

  it('reuses an already transferred image by content hash', async () => {
    const { service, prisma, upload } = harness();
    const file = {
      buffer: Buffer.from('same-image'),
      originalname: 'cover.png',
      mimetype: 'image/png',
      size: 10,
    } as Express.Multer.File;
    const existing = {
      sha256: 'fcc6824d4f99b1b5b6011e00c9b3db91555e6d2d8aab66693bc3a324c437bc6c',
      url: 'https://www.jssngyl.cn/uploads/existing.webp',
    };
    (prisma.shujuNewsMedia.findUnique as jest.Mock).mockResolvedValue(existing);
    await expect(service.uploadMedia(file)).resolves.toEqual({ ...existing, replayed: true });
    expect(upload.uploadSingle).not.toHaveBeenCalled();
  });
});
