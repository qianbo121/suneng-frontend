import { Injectable } from '@nestjs/common';
import { Request } from 'express';

import {
  CreateLeadEventDto,
  LEAD_EVENT_TYPES,
} from '@/modules/lead-event/dto/create-lead-event.dto';
import { LeadEventListQueryDto } from '@/modules/lead-event/dto/lead-event-list-query.dto';
import { PrismaService } from '@/prisma/prisma.service';

function clean(value?: string | null, maxLength = 255) {
  const text = value?.trim();
  return text ? text.slice(0, maxLength) : null;
}

function maskedIp(request: Request) {
  const raw = String(request.ip || request.headers['x-forwarded-for'] || '')
    .split(',')[0]
    .trim();
  if (!raw) return null;
  const ipv4 = raw.match(/(\d{1,3})\.(\d{1,3})\.(\d{1,3})\.(\d{1,3})/);
  if (ipv4) return `${ipv4[1]}.${ipv4[2]}.xxx.xxx`;
  return raw.slice(0, 24);
}

function headerText(value: string | string[] | undefined) {
  return Array.isArray(value) ? value.join(',') : value;
}

function normalizeDate(value: string | undefined, fallback: Date) {
  if (!value) return fallback;
  const date = new Date(value);
  return Number.isNaN(date.getTime()) ? fallback : date;
}

@Injectable()
export class LeadEventService {
  constructor(private readonly prisma: PrismaService) {}

  async createPublic(dto: CreateLeadEventDto, request: Request) {
    await this.prisma.$executeRaw`
      INSERT INTO "WebsiteLeadEvent" (
        "eventType", "pageTitle", "pagePath", "pageType", "productTag",
        "sourceType", "sourceDetail", "searchKeyword", "deviceType", "landingPage",
        "previousPage", "utmSource", "utmMedium", "utmCampaign", "discoverySource",
        "sessionId", "visitorId", "ipMasked", "userAgent"
      ) VALUES (
        ${dto.eventType},
        ${clean(dto.pageTitle, 255)},
        ${clean(dto.pagePath, 500)},
        ${clean(dto.pageType, 80)},
        ${clean(dto.productTag, 120)},
        ${clean(dto.sourceType, 120)},
        ${clean(dto.sourceDetail, 120)},
        ${clean(dto.searchKeyword, 255)},
        ${clean(dto.deviceType, 40)},
        ${clean(dto.landingPage, 500)},
        ${clean(dto.previousPage, 500)},
        ${clean(dto.utmSource, 120)},
        ${clean(dto.utmMedium, 120)},
        ${clean(dto.utmCampaign, 255)},
        ${clean(dto.discoverySource, 120)},
        ${clean(dto.sessionId, 120)},
        ${clean(dto.visitorId, 120)},
        ${maskedIp(request)},
        ${clean(headerText(request.headers['user-agent']), 500)}
      )
    `;
    return { ok: true };
  }

  async getAdminEvents(query: LeadEventListQueryDto) {
    const now = new Date();
    const end = normalizeDate(query.endDate, now);
    end.setHours(23, 59, 59, 999);
    const start = normalizeDate(
      query.startDate,
      new Date(end.getTime() - 29 * 24 * 60 * 60 * 1000),
    );
    start.setHours(0, 0, 0, 0);
    const page = Math.max(1, query.page || 1);
    const pageSize = Math.min(Math.max(1, query.pageSize || 500), 1000);
    const skip = (page - 1) * pageSize;

    const events = await this.prisma.$queryRaw<Array<Record<string, unknown>>>`
      SELECT
        "id",
        "eventType",
        "pageTitle",
        "pagePath",
        "pageType",
        "productTag",
        "sourceType",
        "sourceDetail",
        "searchKeyword",
        "province",
        "city",
        "deviceType",
        "landingPage",
        "previousPage",
        "utmSource",
        "utmMedium",
        "utmCampaign",
        "discoverySource",
        "sessionId",
        "visitorId",
        "ipMasked",
        "createdAt"
      FROM "WebsiteLeadEvent"
      WHERE "createdAt" BETWEEN ${start} AND ${end}
      ORDER BY "createdAt" DESC, "id" DESC
      LIMIT ${pageSize} OFFSET ${skip}
    `;
    const totalRows = await this.prisma.$queryRaw<Array<{ count: bigint }>>`
      SELECT COUNT(*)::bigint AS count
      FROM "WebsiteLeadEvent"
      WHERE "createdAt" BETWEEN ${start} AND ${end}
    `;
    const countRows = await this.prisma.$queryRaw<Array<{ eventType: string; count: bigint }>>`
      SELECT "eventType", COUNT(*)::bigint AS count
      FROM "WebsiteLeadEvent"
      WHERE "createdAt" BETWEEN ${start} AND ${end}
      GROUP BY "eventType"
    `;
    const eventCounts = Object.fromEntries(LEAD_EVENT_TYPES.map((type) => [type, 0]));
    countRows.forEach((row) => {
      if (row.eventType in eventCounts) eventCounts[row.eventType] = Number(row.count || 0);
    });

    return {
      items: events,
      total: Number(totalRows[0]?.count || 0),
      page,
      pageSize,
      event_counts: eventCounts,
    };
  }
}
