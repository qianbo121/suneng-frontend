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
type TrackingCoverageRow = { trackingStartAt: Date | string | null };
type BotRow = { visitors: bigint; events: bigint };
type PageFunnelRow = {
  pagePath: string | null;
  pageVisitors: bigint;
  highIntentVisitors: bigint;
  formStartVisitors: bigint;
  stepCompletedVisitors: bigint;
  submissionVisitors: bigint;
};

// 与数炬服务器日志侧 src/web_traffic.py 的 BOT_RE 逐字对齐。
// 两条口径必须一致，否则同一个官网会算出两个"访客数"。
const BOT_PATTERN =
  'bot|spider|crawler|slurp|headlesschrome|python-requests|go-http-client|' +
  'wget|curl/|scrapy|httpclient|uptimerobot|zgrab|masscan';

// 注意：服务端写入的 form_submit 事件不带 userAgent（见 custom-requirement.service.ts
// 的 sourceSnapshot），所以必须放行 NULL，否则询盘提交会被整批过滤掉，
// 漏斗最后一步永远是 0。
const NOT_BOT = Prisma.sql`("userAgent" IS NULL OR "userAgent" !~* ${BOT_PATTERN})`;

// 人类验证门（2026-08-18 实测定案）：埋点访客数被伪装成正常浏览器的自动化流量
// 灌水 18 倍（对照百度统计 8-13 UV/天）。UA 过滤只能抓 14.6%。
// 唯一可靠的判据是行为：human_signal 只在首次真实交互（isTrusted 的
// pointermove/scroll/touchstart/keydown）时发出，伪装流量不会触发。
// 所以"数人头"类统计一律只数发过 human_signal 的身份——功能保留，数字治病。
const IDENTITY = Prisma.sql`COALESCE(NULLIF("visitorId", ''), NULLIF("sessionId", ''), 'event:' || "id"::text)`;
const IS_BOT = Prisma.sql`"userAgent" ~* ${BOT_PATTERN}`;

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
    const [trackingCoverage, verifiedCoverage] = await Promise.all([
      this.prisma.$queryRaw<TrackingCoverageRow[]>(Prisma.sql`
      SELECT MIN("createdAt") AS "trackingStartAt"
      FROM "WebsiteLeadEvent"
      WHERE "eventType" = 'page_view' AND ${NOT_BOT}
    `),
      this.prisma.$queryRaw<TrackingCoverageRow[]>(Prisma.sql`
      SELECT MIN("createdAt") AS "trackingStartAt"
      FROM "WebsiteLeadEvent"
      WHERE "eventType" = 'human_signal'
    `),
    ]);
    const trackingStartValue = trackingCoverage[0]?.trackingStartAt;
    const trackingStartAt = trackingStartValue ? new Date(trackingStartValue) : null;
    const hasTrackingStart = Boolean(trackingStartAt && !Number.isNaN(trackingStartAt.getTime()));
    const verifiedStartValue = verifiedCoverage[0]?.trackingStartAt;
    const verifiedStartAt = verifiedStartValue ? new Date(verifiedStartValue) : null;
    const hasVerifiedStart = Boolean(verifiedStartAt && !Number.isNaN(verifiedStartAt.getTime()));
    // 已验证口径的窗口从"埋点开始"和"验证信号开始"中较晚者起算——
    // 信号上线前的日子没法追溯验证，画进趋势会显示成一排假零。
    const comparableStart = hasTrackingStart && hasVerifiedStart
      ? new Date(Math.max(start.getTime(), trackingStartAt!.getTime(), verifiedStartAt!.getTime()))
      : endExclusive;
    const filters: Prisma.Sql[] = [
      Prisma.sql`"createdAt" >= ${comparableStart}`,
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
    // 机器人条件挂在共享 where 上，所有口径（漏斗、来源、页面、趋势）一次性对齐。
    // 人类验证门同样全局挂载：一个身份只有发过 human_signal 才被计入任何统计。
    // 动作类事件（阅读/联系/填表）的发出者必然先产生过真实交互，所以不会误伤；
    // 伪装流量一次页面即走、零交互，被这道门整体挡在所有口径之外。
    const HUMAN_GATE = Prisma.sql`${IDENTITY} IN (
      SELECT DISTINCT COALESCE(NULLIF(h."visitorId", ''), NULLIF(h."sessionId", ''), 'event:' || h."id"::text)
      FROM "WebsiteLeadEvent" h
      WHERE h."eventType" = 'human_signal'
        AND h."createdAt" >= ${comparableStart} AND h."createdAt" < ${endExclusive}
    )`;
    const where = Prisma.join([...filters, NOT_BOT, HUMAN_GATE], ' AND ');
    // 同样的筛选条件，但只数被排除掉的那部分 —— 让"过滤了多少"看得见，而不是悄悄少掉。
    const botWhere = Prisma.join([...filters, IS_BOT], ' AND ');
    // 未通过人类验证的访问量（非机器人UA、但没有真实交互）——展示层用来写
    // "另有 N 次未验证访问未计入"，透明但不上主数。
    const unverifiedWhere = Prisma.join(
      [...filters, NOT_BOT, Prisma.sql`NOT (${HUMAN_GATE})`],
      ' AND ',
    );
    const [
      counts,
      daily,
      sources,
      sourceDetails,
      landings,
      pages,
      segments,
      funnelRows,
      botRows,
      pageFunnelRows,
      unverifiedRows,
    ] = await Promise.all([
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
        WITH scoped AS (
          SELECT
            *,
            COALESCE(NULLIF("visitorId", ''), NULLIF("sessionId", ''), 'event:' || "id"::text) AS identity
          FROM "WebsiteLeadEvent"
          WHERE ${where}
        ), page_cohort AS (
          SELECT DISTINCT identity
          FROM scoped
          WHERE "eventType" = 'page_view'
        )
        SELECT
          (SELECT COUNT(*) FROM page_cohort)::bigint AS "pageVisitors",
          COUNT(*) FILTER (WHERE "eventType" = 'page_view')::bigint AS "pageViews",
          COUNT(DISTINCT COALESCE(NULLIF("sessionId", ''), identity)) FILTER (WHERE "eventType" = 'page_view')::bigint AS "visitSessions",
          COUNT(DISTINCT COALESCE(NULLIF("sessionId", ''), identity)) FILTER (WHERE "eventType" = 'engaged_session')::bigint AS "engagedSessions",
          COUNT(DISTINCT identity) FILTER (WHERE "eventType" IN ('phone_click','wechat_click','wechat_qr_view','wechat_copy','quote_cta_click','email_click','douyin_click','form_start','form_step_complete','form_submit'))::bigint AS "highIntentVisitors",
          COUNT(DISTINCT identity) FILTER (WHERE "eventType" IN ('form_start','form_step_complete','form_submit'))::bigint AS "formStartVisitors",
          COUNT(DISTINCT identity) FILTER (WHERE "eventType" IN ('form_step_complete','form_submit'))::bigint AS "stepCompletedVisitors",
          COUNT(DISTINCT identity) FILTER (WHERE "eventType" = 'form_submit')::bigint AS "submissionVisitors"
        FROM scoped
        WHERE identity IN (SELECT identity FROM page_cohort)
      `),
      this.prisma.$queryRaw<BotRow[]>(Prisma.sql`
        SELECT
          COUNT(DISTINCT COALESCE(NULLIF("visitorId", ''), NULLIF("sessionId", ''), 'event:' || "id"::text)) FILTER (WHERE "eventType" = 'page_view')::bigint AS visitors,
          COUNT(*) FILTER (WHERE "eventType" = 'page_view')::bigint AS events
        FROM "WebsiteLeadEvent"
        WHERE ${botWhere}
      `),
      // 单页漏斗必须和全站漏斗同口径，否则页面表里"点击联系"（互斥事件）
      // 会小于"开始填写"，前端只能判成不可比、拒绝算转化率。
      // 两条保证：①每一步都是后续步骤的超集（累计）②全部限定在"看过这一页的人"里。
      this.prisma.$queryRaw<PageFunnelRow[]>(Prisma.sql`
        WITH scoped AS (
          SELECT
            "pagePath",
            "eventType",
            COALESCE(NULLIF("visitorId", ''), NULLIF("sessionId", ''), 'event:' || "id"::text) AS identity
          FROM "WebsiteLeadEvent"
          WHERE ${where} AND "pagePath" IS NOT NULL
        ), cohort AS (
          SELECT DISTINCT "pagePath", identity FROM scoped WHERE "eventType" = 'page_view'
        )
        SELECT
          c."pagePath",
          COUNT(DISTINCT c.identity)::bigint AS "pageVisitors",
          COUNT(DISTINCT s.identity) FILTER (WHERE s."eventType" IN ('phone_click','wechat_click','wechat_qr_view','wechat_copy','quote_cta_click','email_click','douyin_click','form_start','form_step_complete','form_submit'))::bigint AS "highIntentVisitors",
          COUNT(DISTINCT s.identity) FILTER (WHERE s."eventType" IN ('form_start','form_step_complete','form_submit'))::bigint AS "formStartVisitors",
          COUNT(DISTINCT s.identity) FILTER (WHERE s."eventType" IN ('form_step_complete','form_submit'))::bigint AS "stepCompletedVisitors",
          COUNT(DISTINCT s.identity) FILTER (WHERE s."eventType" = 'form_submit')::bigint AS "submissionVisitors"
        FROM cohort c
        LEFT JOIN scoped s ON s."pagePath" = c."pagePath" AND s.identity = c.identity
        GROUP BY c."pagePath"
        ORDER BY "pageVisitors" DESC
        LIMIT 200
      `),
      this.prisma.$queryRaw<BotRow[]>(Prisma.sql`
        SELECT
          COUNT(DISTINCT COALESCE(NULLIF("visitorId", ''), NULLIF("sessionId", ''), 'event:' || "id"::text)) FILTER (WHERE "eventType" = 'page_view')::bigint AS visitors,
          COUNT(*) FILTER (WHERE "eventType" = 'page_view')::bigint AS events
        FROM "WebsiteLeadEvent"
        WHERE ${unverifiedWhere}
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
      coverage: {
        trackingStartAt: hasTrackingStart ? trackingStartAt!.toISOString() : null,
        verifiedStartAt: hasVerifiedStart ? verifiedStartAt!.toISOString() : null,
        verified: hasVerifiedStart,
        comparableStartAt: comparableStart.toISOString(),
        fullRange:
          hasTrackingStart &&
          hasVerifiedStart &&
          trackingStartAt!.getTime() <= start.getTime() &&
          verifiedStartAt!.getTime() <= start.getTime(),
        reason: !hasTrackingStart
          ? 'page_view_not_started'
          : !hasVerifiedStart
            ? 'verification_not_started'
            : Math.max(trackingStartAt!.getTime(), verifiedStartAt!.getTime()) > start.getTime()
              ? 'partial_tracking_window'
              : null,
      },
      // 未通过人类验证的访问（非机器人UA但零真实交互）。展示层写
      // "另有N次未验证访问未计入"——透明，但不进任何主数。
      unverified: {
        visitors: count(unverifiedRows[0]?.visitors),
        events: count(unverifiedRows[0]?.events),
      },
      botFiltered: {
        // 已从上面所有口径里排除的机器人访问量。展示它是为了让"过滤"这件事可见，
        // 而不是让数字悄悄变小。判据只有 userAgent 特征，伪装成普通浏览器的
        // 自动流量抓不到 —— 这一点必须在界面上说清楚，不能让人以为剩下的都是真人。
        visitors: count(botRows[0]?.visitors),
        events: count(botRows[0]?.events),
        pattern: BOT_PATTERN,
      },
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
      // 单页下钻专用（累计口径）。页面表那几列仍用 pages 里的互斥计数，
      // 两者名字不同、含义不同，不要混用。
      pageFunnels: pageFunnelRows.map((row) => ({
        pagePath: row.pagePath,
        pageVisitors: count(row.pageVisitors),
        highIntentVisitors: count(row.highIntentVisitors),
        formStartVisitors: count(row.formStartVisitors),
        stepCompletedVisitors: count(row.stepCompletedVisitors),
        submissionVisitors: count(row.submissionVisitors),
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
