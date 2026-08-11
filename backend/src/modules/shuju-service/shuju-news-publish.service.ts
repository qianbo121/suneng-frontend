import { ConflictException, Injectable, Logger, NotFoundException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Prisma, PublishStatus } from '@prisma/client';
import { createHash } from 'node:crypto';
import DOMPurify from 'isomorphic-dompurify';

import { BaiduSubmitService } from '@/modules/news/baidu-submit.service';
import { assertNewsPublicationPolicy } from '@/modules/news/news-publication-policy';
import {
  ShujuNewsOfflineDto,
  ShujuNewsPublishDto,
} from '@/modules/shuju-service/dto/shuju-news-publish.dto';
import { UploadService } from '@/modules/upload/upload.service';
import { PrismaService } from '@/prisma/prisma.service';

type PublishedResult = {
  newsId: number;
  slug: string;
  status: string;
  sourceDraftId: number;
  sourceVersion: number;
  url: string;
};

@Injectable()
export class ShujuNewsPublishService {
  private readonly logger = new Logger(ShujuNewsPublishService.name);

  constructor(
    private readonly prisma: PrismaService,
    private readonly uploadService: UploadService,
    private readonly baiduSubmitService: BaiduSubmitService,
    private readonly config: ConfigService,
  ) {}

  async uploadMedia(file: Express.Multer.File) {
    const sha256 = createHash('sha256').update(file.buffer).digest('hex');
    const existing = await this.prisma.shujuNewsMedia.findUnique({ where: { sha256 } });
    if (existing) return { ...existing, replayed: true };

    const uploaded = await this.uploadService.uploadSingle(file);
    try {
      const media = await this.prisma.shujuNewsMedia.create({
        data: {
          sha256,
          url: uploaded.urls[0],
          originalName: file.originalname.slice(0, 255),
          contentType: file.mimetype.slice(0, 100),
          sizeBytes: file.size,
        },
      });
      return { ...media, replayed: false };
    } catch (error) {
      if (!this.isUniqueConflict(error)) throw error;
      const replay = await this.prisma.shujuNewsMedia.findUnique({ where: { sha256 } });
      if (!replay) throw error;
      return { ...replay, replayed: true };
    }
  }

  async publish(dto: ShujuNewsPublishDto, requestId: string) {
    const expectedKey = `shuju-news:${dto.sourceDraftId}:v${dto.sourceVersion}:publish`;
    if (dto.idempotencyKey !== expectedKey) {
      throw new ConflictException('Idempotency key does not match the source version');
    }
    if (dto.coverImage?.includes('/media/news/') || dto.contentZh.includes('/media/news/')) {
      throw new ConflictException('Local Shuju media must be transferred before publishing');
    }

    const sanitizedContent = DOMPurify.sanitize(dto.contentZh);
    const visibleText = sanitizedContent
      .replace(/<[^>]+>/g, ' ')
      .replace(/\s+/g, ' ')
      .trim();
    if (!visibleText && !/<img\s/i.test(sanitizedContent)) {
      throw new ConflictException('Sanitized news content is empty');
    }
    assertNewsPublicationPolicy({
      titleZh: dto.titleZh,
      summaryZh: dto.summaryZh,
      contentZh: sanitizedContent,
      seoTitleZh: dto.seoTitleZh,
      seoDescriptionZh: dto.seoDescriptionZh,
      seoKeywordsZh: dto.seoKeywordsZh,
    });
    const canonical = {
      sourceDraftId: dto.sourceDraftId,
      sourceVersion: dto.sourceVersion,
      titleZh: dto.titleZh,
      summaryZh: dto.summaryZh ?? '',
      contentZh: sanitizedContent,
      coverImage: dto.coverImage ?? '',
      slug: dto.slug,
      publishDate: dto.publishDate ?? '',
      categoryId: dto.categoryId ?? null,
      seoTitleZh: dto.seoTitleZh ?? '',
      seoDescriptionZh: dto.seoDescriptionZh ?? '',
      seoKeywordsZh: dto.seoKeywordsZh ?? '',
    };
    const payloadSha256 = this.hash(canonical);
    const replay = await this.replay(dto.idempotencyKey, 'publish', payloadSha256);
    if (replay) return replay;

    await this.startOperation({
      idempotencyKey: dto.idempotencyKey,
      action: 'publish',
      sourceDraftId: dto.sourceDraftId,
      sourceVersion: dto.sourceVersion,
      payloadSha256,
      requestId,
    });

    try {
      const result = await this.prisma.$transaction(async (tx) => {
        const binding = await tx.shujuNewsPublication.findUnique({
          where: { sourceDraftId: dto.sourceDraftId },
        });
        if (binding && dto.sourceVersion <= binding.sourceVersion) {
          throw new ConflictException('Source version is not newer than the published version');
        }

        const categoryId = await this.resolveCategory(tx, dto.categoryId);
        const data = {
          categoryId,
          titleZh: dto.titleZh,
          summaryZh: dto.summaryZh,
          contentZh: sanitizedContent,
          coverImage: dto.coverImage,
          slug: dto.slug,
          publishDate: dto.publishDate ? new Date(dto.publishDate) : new Date(),
          status: PublishStatus.published,
          isPublished: true,
          seoTitleZh: dto.seoTitleZh,
          seoDescriptionZh: dto.seoDescriptionZh,
          seoKeywordsZh: dto.seoKeywordsZh,
          contentUpdatedAt: new Date(),
        };

        const news = binding
          ? await tx.news.update({ where: { id: binding.newsId }, data })
          : await tx.news.create({ data });

        if (binding) {
          await tx.shujuNewsPublication.update({
            where: { sourceDraftId: dto.sourceDraftId },
            data: {
              sourceVersion: dto.sourceVersion,
              payloadSha256,
              status: 'published',
              lastIdempotencyKey: dto.idempotencyKey,
            },
          });
        } else {
          await tx.shujuNewsPublication.create({
            data: {
              sourceDraftId: dto.sourceDraftId,
              newsId: news.id,
              sourceVersion: dto.sourceVersion,
              payloadSha256,
              status: 'published',
              lastIdempotencyKey: dto.idempotencyKey,
            },
          });
        }
        await tx.shujuNewsOperation.update({
          where: { idempotencyKey: dto.idempotencyKey },
          data: { status: 'succeeded', newsId: news.id, errorCode: null, errorMessage: null },
        });
        return this.result(news.id, news.slug, 'published', dto.sourceDraftId, dto.sourceVersion);
      });
      void this.submitToBaidu(result.newsId, result.slug);
      return { publication: result, replayed: false };
    } catch (error) {
      await this.failOperation(dto.idempotencyKey, error);
      if (this.isUniqueConflict(error)) {
        throw new ConflictException('News slug or idempotency key already exists');
      }
      throw error;
    }
  }

  async offline(dto: ShujuNewsOfflineDto, requestId: string) {
    const expectedKey = `shuju-news:${dto.sourceDraftId}:v${dto.sourceVersion}:offline`;
    if (dto.idempotencyKey !== expectedKey) {
      throw new ConflictException('Idempotency key does not match the source version');
    }
    const payloadSha256 = this.hash({
      sourceDraftId: dto.sourceDraftId,
      sourceVersion: dto.sourceVersion,
      reason: dto.reason,
    });
    const replay = await this.replay(dto.idempotencyKey, 'offline', payloadSha256);
    if (replay) return replay;
    await this.startOperation({
      idempotencyKey: dto.idempotencyKey,
      action: 'offline',
      sourceDraftId: dto.sourceDraftId,
      sourceVersion: dto.sourceVersion,
      payloadSha256,
      requestId,
    });

    try {
      return await this.prisma.$transaction(async (tx) => {
        const binding = await tx.shujuNewsPublication.findUnique({
          where: { sourceDraftId: dto.sourceDraftId },
        });
        if (!binding) throw new NotFoundException('Shuju publication not found');
        const news = await tx.news.update({
          where: { id: binding.newsId },
          data: { status: PublishStatus.offline, isPublished: false },
        });
        await tx.shujuNewsPublication.update({
          where: { sourceDraftId: dto.sourceDraftId },
          data: { status: 'offline', lastIdempotencyKey: dto.idempotencyKey },
        });
        await tx.shujuNewsOperation.update({
          where: { idempotencyKey: dto.idempotencyKey },
          data: { status: 'succeeded', newsId: news.id, errorCode: null, errorMessage: null },
        });
        return {
          publication: this.result(
            news.id,
            news.slug,
            'offline',
            dto.sourceDraftId,
            binding.sourceVersion,
          ),
          replayed: false,
        };
      });
    } catch (error) {
      await this.failOperation(dto.idempotencyKey, error);
      throw error;
    }
  }

  private async replay(idempotencyKey: string, action: string, payloadSha256: string) {
    const existing = await this.prisma.shujuNewsOperation.findUnique({
      where: { idempotencyKey },
    });
    if (!existing) return undefined;
    if (existing.action !== action || existing.payloadSha256 !== payloadSha256) {
      throw new ConflictException('Idempotency key was already used for another payload');
    }
    if (existing.status !== 'succeeded' || !existing.newsId) return undefined;
    const news = await this.prisma.news.findUnique({ where: { id: existing.newsId } });
    if (!news) throw new NotFoundException('Published news no longer exists');
    return {
      publication: this.result(
        news.id,
        news.slug,
        news.status,
        existing.sourceDraftId,
        existing.sourceVersion,
      ),
      replayed: true,
    };
  }

  private async startOperation(data: {
    idempotencyKey: string;
    action: string;
    sourceDraftId: number;
    sourceVersion: number;
    payloadSha256: string;
    requestId: string;
  }) {
    const existing = await this.prisma.shujuNewsOperation.findUnique({
      where: { idempotencyKey: data.idempotencyKey },
    });
    if (existing) {
      if (
        existing.action !== data.action ||
        existing.sourceDraftId !== data.sourceDraftId ||
        existing.sourceVersion !== data.sourceVersion ||
        existing.payloadSha256 !== data.payloadSha256
      ) {
        throw new ConflictException('Idempotency key was already used for another payload');
      }
      await this.prisma.shujuNewsOperation.update({
        where: { idempotencyKey: data.idempotencyKey },
        data: {
          status: 'in_progress',
          requestId: data.requestId,
          attemptCount: { increment: 1 },
          errorCode: null,
          errorMessage: null,
        },
      });
      return;
    }
    try {
      await this.prisma.shujuNewsOperation.create({
        data: { ...data, status: 'in_progress' },
      });
    } catch (error) {
      if (!this.isUniqueConflict(error)) throw error;
      const raced = await this.prisma.shujuNewsOperation.findUnique({
        where: { idempotencyKey: data.idempotencyKey },
      });
      if (
        !raced ||
        raced.action !== data.action ||
        raced.sourceDraftId !== data.sourceDraftId ||
        raced.sourceVersion !== data.sourceVersion ||
        raced.payloadSha256 !== data.payloadSha256
      ) {
        throw new ConflictException('Idempotency key was concurrently used for another payload');
      }
    }
  }

  private async failOperation(idempotencyKey: string, error: unknown) {
    const message = error instanceof Error ? error.message : 'Unknown publish failure';
    await this.prisma.shujuNewsOperation.updateMany({
      where: { idempotencyKey, status: 'in_progress' },
      data: {
        status: 'failed',
        errorCode: error instanceof ConflictException ? 'CONFLICT' : 'PUBLISH_FAILED',
        errorMessage: message.slice(0, 500),
      },
    });
  }

  private async resolveCategory(tx: Prisma.TransactionClient, requested: number) {
    const category = await tx.newsCategory.findFirst({
      where: { id: requested, status: PublishStatus.published },
    });
    if (!category) throw new NotFoundException('Published news category not found');
    return category.id;
  }

  private result(
    newsId: number,
    slug: string,
    status: string,
    sourceDraftId: number,
    sourceVersion: number,
  ): PublishedResult {
    const base = (this.config.get<string>('publicSiteUrl') ?? 'https://www.jssngyl.cn').replace(
      /\/+$/,
      '',
    );
    return {
      newsId,
      slug,
      status,
      sourceDraftId,
      sourceVersion,
      url: `${base}/zh/news/${encodeURIComponent(slug)}`,
    };
  }

  private hash(payload: unknown) {
    return createHash('sha256').update(JSON.stringify(payload)).digest('hex');
  }

  private isUniqueConflict(error: unknown) {
    return error instanceof Prisma.PrismaClientKnownRequestError && error.code === 'P2002';
  }

  private async submitToBaidu(newsId: number, slug: string) {
    try {
      const submitted = await this.baiduSubmitService.submitUrl(
        this.baiduSubmitService.buildNewsUrl(slug),
      );
      if (submitted) {
        await this.prisma.news.updateMany({
          where: { id: newsId, baiduSubmittedAt: null },
          data: { baiduSubmittedAt: new Date() },
        });
      }
    } catch (error) {
      this.logger.error(
        `Shuju news Baidu submit failed for ${newsId}: ${error instanceof Error ? error.message : String(error)}`,
      );
    }
  }
}
