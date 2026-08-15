import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';

import { ShujuInquiryReadQueryDto } from '@/modules/shuju-service/dto/shuju-inquiry-read-query.dto';
import { PrismaService } from '@/prisma/prisma.service';

const inquiryProjection = {
  id: true,
  submissionId: true,
  projectType: true,
  projectLocation: true,
  name: true,
  phone: true,
  email: true,
  company: true,
  industry: true,
  process: true,
  temperature: true,
  requirement: true,
  preferredContact: true,
  locale: true,
  pagePath: true,
  pageTitle: true,
  pageType: true,
  productTag: true,
  sourceType: true,
  sourceDetail: true,
  landingPage: true,
  previousPage: true,
  utmSource: true,
  utmMedium: true,
  utmCampaign: true,
  discoverySource: true,
  sessionId: true,
  visitorId: true,
  notificationStatus: true,
  notificationAttemptCount: true,
  notificationLastError: true,
  notificationSentAt: true,
  notificationNextAttemptAt: true,
  notificationLeaseUntil: true,
  createdAt: true,
} as const;

@Injectable()
export class ShujuInquiryReadService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly config: ConfigService,
  ) {}

  private minimumAfterId() {
    return this.config.get<number>('shujuInquiryReadMinId') ?? 0;
  }

  async head() {
    const aggregate = await this.prisma.customRequirement.aggregate({ _max: { id: true } });
    return {
      maxId: aggregate._max.id ?? 0,
      minimumAfterId: this.minimumAfterId(),
      capturedAt: new Date().toISOString(),
    };
  }

  async list(query: ShujuInquiryReadQueryDto) {
    const minimumAfterId = this.minimumAfterId();
    const effectiveAfterId = Math.max(query.afterId, minimumAfterId);
    const limit = query.limit ?? 50;
    const rows = await this.prisma.customRequirement.findMany({
      where: { id: { gt: effectiveAfterId } },
      orderBy: { id: 'asc' },
      take: limit + 1,
      select: inquiryProjection,
    });
    const hasMore = rows.length > limit;
    const items = rows.slice(0, limit).map((row) => ({
      ...row,
      phone: row.phone.trim() || null,
    }));
    return {
      items,
      // Kept for wire compatibility. The consumer performs bounded full pagination from cutover,
      // so embedding an ever-growing copy of historical inquiries here is no longer necessary.
      replayItems: [],
      nextAfterId: items.at(-1)?.id ?? effectiveAfterId,
      hasMore,
      minimumAfterId,
    };
  }
}
