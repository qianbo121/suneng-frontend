import { BadRequestException, Injectable } from '@nestjs/common';
import { Prisma } from '@prisma/client';

import { ShujuGrowthReadQueryDto } from '@/modules/shuju-service/dto/shuju-growth-read-query.dto';
import { PrismaService } from '@/prisma/prisma.service';

type CountRow = {
  eventType: string;
  eventCount: bigint;
  visitorCount: bigint;
  sessionCount: bigint;
};
type DailyRow = { day: string; eventType: string; eventCount: bigint; visitorCount: bigint };
type SourceRow = {
  sourceType: string | null;
  sourceDetail: string | null;
  visitors: bigint;
  pageViews: bigint;
  engagedVisitors: bigint;
  highIntentVisitors: bigint;
  formStarts: bigint;
  stepCompleted: bigint;
  submissions: bigint;
};
type PageRow = {
  pagePath: string | null;
  pageTitle: string | null;
  pageType: string | null;
  productTag: string | null;
  visitors: bigint;
  pageViews: bigint;
  engagedVisitors: bigint;
  highIntentVisitors: bigint;
  formStarts: bigint;
  stepCompleted: bigint;
  submissions: bigint;
};
type LandingRow = {
  landingPage: string | null;
  visitors: bigint;
  sessions: bigint;
  pageViews: bigint;
};
type SegmentRow = {
  day: string;
  eventType: string;
  pagePath: string | null;
  pageTitle: string | null;
  pageType: string | null;
  productTag: string | null;
  sourceType: string | null;
  sourceDetail: string | null;
  deviceType: string | null;
  events: bigint;
  visitors: bigint;
  sessions: bigint;
};
type FunnelRow = {
  pageVisitors: bigint;
  pageViews: bigint;
  visitSessions: bigint;
  engagedSessions: bigint;
  highIntentVisitors: bigint;
  formStartVisitors: bigint;
  stepCompletedVisitors: bigint;
  submissionVisitors: bigint;
};

function count(value: bigint | number | null | undefined) {
  return Number(value ?? 0);
}

function normalizedPageType(value: string | null | undefined) {
  if (value === '服务页') return '解决方案页';
  if (value === '资料文章') return '文章页';
  if (!value || value === '其他') return '其他页';
  return value;
}

function dateRange(query: ShujuGrowthReadQueryDto) {
  const start = new Date(`${query.startDate.slice(0, 10)}T00:00:00+08:00`);
  const end = new Date(`${query.endDate.slice(0, 10)}T00:00:00+08:00`);
  if (Number.isNaN(start.getTime()) || Number.isNaN(end.getTime()) || end < start) {
    throw new BadRequestException('Invalid growth date range');
  }
  const days = Math.floor((end.getTime() - start.getTime()) / 86_400_000) + 1;
  if (days > 366) throw new BadRequestException('Growth date range exceeds 366 days');
  const endExclusive = new Date(end.getTime() + 86_400_000);
  return { start, endExclusive, days };
}

@Injectable()
export class ShujuGrowthReadService {
  constructor(private readonly prisma: PrismaService) {}

  async overview(query: ShujuGrowthReadQueryDto) {
    const { start, endExclusive, days } = dateRange(query);
    const filters: Prisma.Sql[] = [
      Prisma.sql`"createdAt" >= ${start}`,
      Prisma.sql`"createdAt" < ${endExclusive}`,
    ];
    if (query.site && query.site !== 'all') {
      filters.push(
        Prisma.sql`("pagePath" = ${`/${query.site}`} OR "pagePath" LIKE ${`/${query.site}/%`})`,
      );
    }
    if (query.device && query.device !== 'all') {
      filters.push(Prisma.sql`"deviceType" = ${query.device}`);
    }
    if (query.sourceType && query.sourceType !== 'all') {
      filters.push(Prisma.sql`"sourceType" = ${query.sourceType}`);
    }
    if (query.pageType && query.pageType !== 'all') {
      if (query.pageType === '解决方案页') {
        filters.push(Prisma.sql`"pageType" IN ('解决方案页', '服务页')`);
      } else if (query.pageType === '文章页') {
        filters.push(Prisma.sql`"pageType" IN ('文章页', '资料文章')`);
      } else if (query.pageType === '其他页') {
        filters.push(Prisma.sql`("pageType" IN ('其他页', '其他') OR "pageType" IS NULL)`);
      } else {
        filters.push(Prisma.sql`"pageType" = ${query.pageType}`);
      }
    }
    const where = Prisma.join(filters, ' AND ');
    const [counts, daily, sources, sourceDetails, landings, pages, segments, funnelRows] =
      await Promise.all([
        this.prisma.$queryRaw<CountRow[]>(Prisma.sql`
        SELECT
          "eventType",
          COUNT(*)::bigint AS "eventCount",
          COUNT(DISTINCT COALESCE(NULLIF("visitorId", ''), NULLIF("sessionId", ''), 'event:' || "id"::text))::bigint AS "visitorCount",
          COUNT(DISTINCT COALESCE(NULLIF("sessionId", ''), 'event:' || "id"::text))::bigint AS "sessionCount"
        FROM "WebsiteLeadEvent"
        WHERE ${where}
        GROUP BY "eventType"
      `),
        this.prisma.$queryRaw<DailyRow[]>(Prisma.sql`
        SELECT
          TO_CHAR("createdAt" AT TIME ZONE 'Asia/Shanghai', 'YYYY-MM-DD') AS day,
          "eventType",
          COUNT(*)::bigint AS "eventCount",
          COUNT(DISTINCT COALESCE(NULLIF("visitorId", ''), NULLIF("sessionId", ''), 'event:' || "id"::text))::bigint AS "visitorCount"
        FROM "WebsiteLeadEvent"
        WHERE ${where}
        GROUP BY day, "eventType"
        ORDER BY day ASC
      `),
        this.prisma.$queryRaw<SourceRow[]>(Prisma.sql`
        SELECT
          "sourceType",
          NULL::text AS "sourceDetail",
          COUNT(DISTINCT COALESCE(NULLIF("visitorId", ''), NULLIF("sessionId", ''), 'event:' || "id"::text)) FILTER (WHERE "eventType" = 'page_view')::bigint AS visitors,
          COUNT(*) FILTER (WHERE "eventType" = 'page_view')::bigint AS "pageViews",
          COUNT(DISTINCT COALESCE(NULLIF("visitorId", ''), NULLIF("sessionId", ''), 'event:' || "id"::text)) FILTER (WHERE "eventType" = 'engaged_session')::bigint AS "engagedVisitors",
          COUNT(DISTINCT COALESCE(NULLIF("visitorId", ''), NULLIF("sessionId", ''), 'event:' || "id"::text)) FILTER (WHERE "eventType" IN ('phone_click','wechat_click','wechat_qr_view','wechat_copy','quote_cta_click','email_click','douyin_click'))::bigint AS "highIntentVisitors",
          COUNT(DISTINCT COALESCE(NULLIF("visitorId", ''), NULLIF("sessionId", ''), 'event:' || "id"::text)) FILTER (WHERE "eventType" = 'form_start')::bigint AS "formStarts",
          COUNT(DISTINCT COALESCE(NULLIF("visitorId", ''), NULLIF("sessionId", ''), 'event:' || "id"::text)) FILTER (WHERE "eventType" = 'form_step_complete')::bigint AS "stepCompleted",
          COUNT(DISTINCT COALESCE(NULLIF("visitorId", ''), NULLIF("sessionId", ''), 'event:' || "id"::text)) FILTER (WHERE "eventType" = 'form_submit')::bigint AS submissions
        FROM "WebsiteLeadEvent"
        WHERE ${where}
        GROUP BY "sourceType"
        ORDER BY "pageViews" DESC, visitors DESC
      `),
        this.prisma.$queryRaw<SourceRow[]>(Prisma.sql`
        SELECT
          "sourceType",
          "sourceDetail",
          COUNT(DISTINCT COALESCE(NULLIF("visitorId", ''), NULLIF("sessionId", ''), 'event:' || "id"::text)) FILTER (WHERE "eventType" = 'page_view')::bigint AS visitors,
          COUNT(*) FILTER (WHERE "eventType" = 'page_view')::bigint AS "pageViews",
          COUNT(DISTINCT COALESCE(NULLIF("visitorId", ''), NULLIF("sessionId", ''), 'event:' || "id"::text)) FILTER (WHERE "eventType" = 'engaged_session')::bigint AS "engagedVisitors",
          COUNT(DISTINCT COALESCE(NULLIF("visitorId", ''), NULLIF("sessionId", ''), 'event:' || "id"::text)) FILTER (WHERE "eventType" IN ('phone_click','wechat_click','wechat_qr_view','wechat_copy','quote_cta_click','email_click','douyin_click'))::bigint AS "highIntentVisitors",
          COUNT(DISTINCT COALESCE(NULLIF("visitorId", ''), NULLIF("sessionId", ''), 'event:' || "id"::text)) FILTER (WHERE "eventType" = 'form_start')::bigint AS "formStarts",
          COUNT(DISTINCT COALESCE(NULLIF("visitorId", ''), NULLIF("sessionId", ''), 'event:' || "id"::text)) FILTER (WHERE "eventType" = 'form_step_complete')::bigint AS "stepCompleted",
          COUNT(DISTINCT COALESCE(NULLIF("visitorId", ''), NULLIF("sessionId", ''), 'event:' || "id"::text)) FILTER (WHERE "eventType" = 'form_submit')::bigint AS submissions
        FROM "WebsiteLeadEvent"
        WHERE ${where}
          AND "sourceDetail" IS NOT NULL
        GROUP BY "sourceType", "sourceDetail"
        ORDER BY "pageViews" DESC, visitors DESC
        LIMIT 200
      `),
        this.prisma.$queryRaw<LandingRow[]>(Prisma.sql`
        SELECT
          "landingPage",
          COUNT(DISTINCT COALESCE(NULLIF("visitorId", ''), NULLIF("sessionId", ''), 'event:' || "id"::text)) FILTER (WHERE "eventType" = 'page_view')::bigint AS visitors,
          COUNT(DISTINCT COALESCE(NULLIF("sessionId", ''), 'event:' || "id"::text)) FILTER (WHERE "eventType" = 'page_view')::bigint AS sessions,
          COUNT(*) FILTER (WHERE "eventType" = 'page_view')::bigint AS "pageViews"
        FROM "WebsiteLeadEvent"
        WHERE ${where}
          AND "landingPage" IS NOT NULL
        GROUP BY "landingPage"
        ORDER BY sessions DESC, "pageViews" DESC
        LIMIT 100
      `),
        this.prisma.$queryRaw<PageRow[]>(Prisma.sql`
        SELECT
          "pagePath",
          MAX("pageTitle") AS "pageTitle",
          MAX("pageType") AS "pageType",
          MAX("productTag") AS "productTag",
          COUNT(DISTINCT COALESCE(NULLIF("visitorId", ''), NULLIF("sessionId", ''), 'event:' || "id"::text)) FILTER (WHERE "eventType" = 'page_view')::bigint AS visitors,
          COUNT(*) FILTER (WHERE "eventType" = 'page_view')::bigint AS "pageViews",
          COUNT(DISTINCT COALESCE(NULLIF("visitorId", ''), NULLIF("sessionId", ''), 'event:' || "id"::text)) FILTER (WHERE "eventType" = 'engaged_session')::bigint AS "engagedVisitors",
          COUNT(DISTINCT COALESCE(NULLIF("visitorId", ''), NULLIF("sessionId", ''), 'event:' || "id"::text)) FILTER (WHERE "eventType" IN ('phone_click','wechat_click','wechat_qr_view','wechat_copy','quote_cta_click','email_click','douyin_click'))::bigint AS "highIntentVisitors",
          COUNT(DISTINCT COALESCE(NULLIF("visitorId", ''), NULLIF("sessionId", ''), 'event:' || "id"::text)) FILTER (WHERE "eventType" = 'form_start')::bigint AS "formStarts",
          COUNT(DISTINCT COALESCE(NULLIF("visitorId", ''), NULLIF("sessionId", ''), 'event:' || "id"::text)) FILTER (WHERE "eventType" = 'form_step_complete')::bigint AS "stepCompleted",
          COUNT(DISTINCT COALESCE(NULLIF("visitorId", ''), NULLIF("sessionId", ''), 'event:' || "id"::text)) FILTER (WHERE "eventType" = 'form_submit')::bigint AS submissions
        FROM "WebsiteLeadEvent"
        WHERE ${where}
          AND "pagePath" IS NOT NULL
        GROUP BY "pagePath"
        ORDER BY "pageViews" DESC, visitors DESC
        LIMIT 200
      `),
        this.prisma.$queryRaw<SegmentRow[]>(Prisma.sql`
        SELECT
          TO_CHAR("createdAt" AT TIME ZONE 'Asia/Shanghai', 'YYYY-MM-DD') AS day,
          "eventType",
          "pagePath",
          MAX("pageTitle") AS "pageTitle",
          MAX("pageType") AS "pageType",
          MAX("productTag") AS "productTag",
          "sourceType",
          "sourceDetail",
          "deviceType",
          COUNT(*)::bigint AS events,
          COUNT(DISTINCT COALESCE(NULLIF("visitorId", ''), NULLIF("sessionId", ''), 'event:' || "id"::text))::bigint AS visitors,
          COUNT(DISTINCT COALESCE(NULLIF("sessionId", ''), 'event:' || "id"::text))::bigint AS sessions
        FROM "WebsiteLeadEvent"
        WHERE ${where}
        GROUP BY day, "eventType", "pagePath", "sourceType", "sourceDetail", "deviceType"
        ORDER BY day ASC, events DESC
      `),
        this.prisma.$queryRaw<FunnelRow[]>(Prisma.sql`
        SELECT
          COUNT(DISTINCT COALESCE(NULLIF("visitorId", ''), NULLIF("sessionId", ''), 'event:' || "id"::text)) FILTER (WHERE "eventType" = 'page_view')::bigint AS "pageVisitors",
          COUNT(*) FILTER (WHERE "eventType" = 'page_view')::bigint AS "pageViews",
          COUNT(DISTINCT COALESCE(NULLIF("sessionId", ''), 'event:' || "id"::text)) FILTER (WHERE "eventType" = 'page_view')::bigint AS "visitSessions",
          COUNT(DISTINCT COALESCE(NULLIF("sessionId", ''), 'event:' || "id"::text)) FILTER (WHERE "eventType" = 'engaged_session')::bigint AS "engagedSessions",
          COUNT(DISTINCT COALESCE(NULLIF("visitorId", ''), NULLIF("sessionId", ''), 'event:' || "id"::text)) FILTER (WHERE "eventType" IN ('phone_click','wechat_click','wechat_qr_view','wechat_copy','quote_cta_click','email_click','douyin_click'))::bigint AS "highIntentVisitors",
          COUNT(DISTINCT COALESCE(NULLIF("visitorId", ''), NULLIF("sessionId", ''), 'event:' || "id"::text)) FILTER (WHERE "eventType" = 'form_start')::bigint AS "formStartVisitors",
          COUNT(DISTINCT COALESCE(NULLIF("visitorId", ''), NULLIF("sessionId", ''), 'event:' || "id"::text)) FILTER (WHERE "eventType" = 'form_step_complete')::bigint AS "stepCompletedVisitors",
          COUNT(DISTINCT COALESCE(NULLIF("visitorId", ''), NULLIF("sessionId", ''), 'event:' || "id"::text)) FILTER (WHERE "eventType" = 'form_submit')::bigint AS "submissionVisitors"
        FROM "WebsiteLeadEvent"
        WHERE ${where}
      `),
      ]);

    return {
      range: {
        startDate: query.startDate.slice(0, 10),
        endDate: query.endDate.slice(0, 10),
        days,
        filters: {
          site: query.site || 'all',
          device: query.device || 'all',
          sourceType: query.sourceType || 'all',
          pageType: query.pageType || 'all',
        },
      },
      generatedAt: new Date().toISOString(),
      funnel: {
        pageVisitors: count(funnelRows[0]?.pageVisitors),
        pageViews: count(funnelRows[0]?.pageViews),
        visitSessions: count(funnelRows[0]?.visitSessions),
        engagedSessions: count(funnelRows[0]?.engagedSessions),
        highIntentVisitors: count(funnelRows[0]?.highIntentVisitors),
        formStartVisitors: count(funnelRows[0]?.formStartVisitors),
        stepCompletedVisitors: count(funnelRows[0]?.stepCompletedVisitors),
        submissionVisitors: count(funnelRows[0]?.submissionVisitors),
      },
      eventCounts: Object.fromEntries(
        counts.map((row) => [
          row.eventType,
          {
            events: count(row.eventCount),
            visitors: count(row.visitorCount),
            sessions: count(row.sessionCount),
          },
        ]),
      ),
      daily: daily.map((row) => ({
        date: row.day,
        eventType: row.eventType,
        events: count(row.eventCount),
        visitors: count(row.visitorCount),
      })),
      sources: sources.map((row) => ({
        sourceType: row.sourceType || '无法识别',
        sourceDetail: row.sourceDetail || null,
        visitors: count(row.visitors),
        pageViews: count(row.pageViews),
        engagedVisitors: count(row.engagedVisitors),
        highIntentVisitors: count(row.highIntentVisitors),
        formStarts: count(row.formStarts),
        stepCompleted: count(row.stepCompleted),
        submissions: count(row.submissions),
      })),
      sourceDetails: sourceDetails.map((row) => ({
        sourceType: row.sourceType || '无法识别',
        sourceDetail: row.sourceDetail || null,
        visitors: count(row.visitors),
        pageViews: count(row.pageViews),
        engagedVisitors: count(row.engagedVisitors),
        highIntentVisitors: count(row.highIntentVisitors),
        formStarts: count(row.formStarts),
        stepCompleted: count(row.stepCompleted),
        submissions: count(row.submissions),
      })),
      landings: landings.map((row) => ({
        pagePath: row.landingPage,
        visitors: count(row.visitors),
        sessions: count(row.sessions),
        pageViews: count(row.pageViews),
      })),
      pages: pages.map((row) => ({
        pagePath: row.pagePath,
        pageTitle: row.pageTitle,
        pageType: normalizedPageType(row.pageType),
        productTag: row.productTag || '其他',
        visitors: count(row.visitors),
        pageViews: count(row.pageViews),
        engagedVisitors: count(row.engagedVisitors),
        highIntentVisitors: count(row.highIntentVisitors),
        formStarts: count(row.formStarts),
        stepCompleted: count(row.stepCompleted),
        submissions: count(row.submissions),
      })),
      segments: segments.map((row) => ({
        date: row.day,
        eventType: row.eventType,
        pagePath: row.pagePath,
        pageTitle: row.pageTitle,
        pageType: normalizedPageType(row.pageType),
        productTag: row.productTag || '其他',
        sourceType: row.sourceType || '无法识别',
        sourceDetail: row.sourceDetail || null,
        deviceType: row.deviceType || '无法识别',
        events: count(row.events),
        visitors: count(row.visitors),
        sessions: count(row.sessions),
      })),
    };
  }
}
